import os
import json
import re
import math
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

# Create FastAPI app instance
app = FastAPI(
    title="Phishing Email Detection ML Backend",
    description="Multinomial Naive Bayes & TF-IDF Classifier Service for Email Security Analysis",
    version="1.0.0"
)

# Configure CORS origins dynamically for production security
frontend_env = os.environ.get("FRONTEND_URL", "").strip()
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

if frontend_env and frontend_env != "*":
    for u in frontend_env.split(","):
        clean_u = u.strip().rstrip("/")
        if clean_u:
            if not clean_u.startswith("http://") and not clean_u.startswith("https://"):
                clean_u = f"https://{clean_u}"
            if clean_u not in origins:
                origins.append(clean_u)
else:
    origins.append("*")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model artifacts at startup
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "model")
METADATA_PATH = os.path.join(MODEL_DIR, "model_metadata.json")

model_loaded = False
artifact_mode = "none"
vectorizer = None
classifier = None
model_data = None

# 1. Attempt joblib load first (if sklearn is installed & .pkl files exist)
try:
    import joblib
    vec_path = os.path.join(MODEL_DIR, "tfidf_vectorizer.pkl")
    clf_path = os.path.join(MODEL_DIR, "nb_classifier.pkl")
    if os.path.exists(vec_path) and os.path.exists(clf_path):
        vectorizer = joblib.load(vec_path)
        classifier = joblib.load(clf_path)
        model_loaded = True
        artifact_mode = "sklearn_joblib"
        print("[ML Backend] Successfully loaded joblib sklearn model and vectorizer.")
except Exception as e:
    print(f"[ML Backend] Joblib load skipped: {e}")

# 2. Fallback to model_metadata.json (pure math Naive Bayes)
if not model_loaded and os.path.exists(METADATA_PATH):
    try:
        with open(METADATA_PATH, "r") as f:
            model_data = json.load(f)
        model_loaded = True
        artifact_mode = "json_metadata"
        print("[ML Backend] Successfully loaded trained TF-IDF & Naive Bayes model metadata.")
    except Exception as e:
        print(f"[ML Backend] Failed to load model metadata: {e}")

ENGLISH_STOPWORDS = set([
    'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t', 'as', 'at',
    'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can', 'can\'t', 'cannot',
    'could', 'did', 'do', 'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'has',
    'have', 'having', 'he', 'her', 'here', 'hers', 'him', 'himself', 'his', 'how', 'i', 'if', 'in', 'into', 'is', 'it',
    'its', 'itself', 'just', 'me', 'more', 'most', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only',
    'or', 'other', 'our', 'ours', 'out', 'over', 'own', 'same', 'she', 'should', 'so', 'some', 'such', 'than', 'that',
    'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they', 'this', 'those', 'through', 'to',
    'too', 'under', 'until', 'up', 'very', 'was', 'we', 'were', 'what', 'when', 'where', 'which', 'while', 'who',
    'whom', 'why', 'with', 'would', 'you', 'your'
])

def preprocess_text(text: str) -> str:
    clean = re.sub(r'[^a-zA-Z\s]', ' ', text.lower())
    tokens = clean.split()
    filtered = [t for t in tokens if t not in ENGLISH_STOPWORDS and len(t) > 2]
    return ' '.join(filtered)

class PredictRequest(BaseModel):
    email_text: str = Field(..., description="Raw text body of email to analyze", max_length=100000)

class PredictResponse(BaseModel):
    classification: str
    confidence: float
    top_features: List[str]
    engine: Optional[str] = "Multinomial Naive Bayes (TF-IDF)"

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred during prediction analysis."}
    )

@app.get("/health")
def health_check():
    return {
        "status": "ok" if model_loaded else "degraded",
        "model_loaded": model_loaded,
        "artifact_mode": artifact_mode,
        "engine": "Multinomial Naive Bayes (TF-IDF)"
    }

@app.post("/predict", response_model=PredictResponse)
def predict_email(request: PredictRequest):
    if not request.email_text or not request.email_text.strip():
        raise HTTPException(status_code=400, detail="Email text cannot be empty.")

    if not model_loaded:
        raise HTTPException(status_code=503, detail="ML model is not loaded on backend service.")

    try:
        clean_text = preprocess_text(request.email_text)
        words = clean_text.split()

        # 1. Sklearn Joblib Inference
        if vectorizer and classifier and artifact_mode == "sklearn_joblib":
            vec = vectorizer.transform([clean_text])
            proba = classifier.predict_proba(vec)[0]
            pred_class = int(classifier.predict(vec)[0])
            
            classification = "phishing" if pred_class == 1 else "legitimate"
            confidence = float(proba[pred_class]) * 100.0

            feature_names = vectorizer.get_feature_names_out()
            nonzero_indices = vec.nonzero()[1]
            top_features = [feature_names[i] for i in nonzero_indices][:6]

            return {
                "classification": classification,
                "confidence": round(confidence, 2),
                "top_features": top_features if top_features else words[:5],
                "engine": "Multinomial Naive Bayes (Sklearn Joblib)"
            }

        # 2. JSON Metadata Mathematical Naive Bayes Inference
        vocab = model_data.get("vocabulary", {})
        idf = model_data.get("idf", [])
        priors = model_data.get("class_log_prior", [-0.693, -0.693])
        feature_log_prob = model_data.get("feature_log_prob", [[], []])

        score_legit = priors[0]
        score_phish = priors[1]
        top_features = []

        for w in words:
            if w in vocab:
                idx = vocab[w]
                idf_val = idf[idx] if idx < len(idf) else 1.0
                score_legit += (feature_log_prob[0][idx] if idx < len(feature_log_prob[0]) else -5.0) * idf_val
                score_phish += (feature_log_prob[1][idx] if idx < len(feature_log_prob[1]) else -5.0) * idf_val
                if idx < len(feature_log_prob[1]) and idx < len(feature_log_prob[0]):
                    if feature_log_prob[1][idx] > feature_log_prob[0][idx]:
                        top_features.append(w)

        diff = score_phish - score_legit
        p_phish = 1.0 / (1.0 + math.exp(-max(-10.0, min(10.0, diff))))

        if p_phish >= 0.5:
            classification = "phishing"
            confidence = p_phish * 100.0
        else:
            classification = "legitimate"
            confidence = (1.0 - p_phish) * 100.0

        unique_features = list(dict.fromkeys(top_features))[:6]

        return {
            "classification": classification,
            "confidence": round(confidence, 2),
            "top_features": unique_features if unique_features else words[:5],
            "engine": "Multinomial Naive Bayes (JSON Metadata Engine)"
        }
    except Exception as err:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(err)}")

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
