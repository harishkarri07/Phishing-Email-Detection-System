# Phishing Email Detector - Python ML Backend Service

This directory contains the machine learning backend service for the Phishing Email Detection System, built with **FastAPI**, **scikit-learn**, **TF-IDF Vectorization**, and a **Multinomial Naive Bayes Classifier**.

---

## 📁 Directory Structure

```
backend/
├── app.py                   # FastAPI REST API (/health, /predict)
├── train_model.py           # Reproducible training pipeline
├── requirements.txt         # Production dependencies
├── README-backend.md        # Backend instructions & API documentation
├── model/                   # Serialized ML model artifacts
│   ├── tfidf_vectorizer.pkl # (Generated on sklearn load)
│   ├── nb_classifier.pkl    # (Generated on sklearn load)
│   └── model_metadata.json  # Pre-trained vocabulary & log probability weights
└── reports/                 # Evaluation metrics & confusion matrix
    ├── evaluation_metrics.json
    └── confusion_matrix.txt
```

---

## ⚙️ Local Setup & Model Training

### 1. Create Virtual Environment & Install Dependencies
```bash
cd backend
python3 -m venv venv
source venv/bin/activate     # Linux / macOS
# or: venv\Scripts\activate  # Windows

pip install -r requirements.txt
```

### 2. Train or Regenerate ML Model
```bash
python train_model.py
```
This runs the training script over the 50 curated email samples, vectorizes the text with TF-IDF, trains the Multinomial Naive Bayes classifier, evaluates metrics, and exports `model/model_metadata.json` (as well as `.pkl` artifacts if sklearn is present).

---

## 🚀 Running FastAPI Backend Server

### Development
```bash
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

### Production
```bash
uvicorn app:app --host 0.0.0.0 --port $PORT
```

Interactive Swagger API docs will be available at `http://localhost:8000/docs`.

---

## 📡 API Reference

### GET `/health`
- **Response**:
```json
{
  "status": "ok",
  "model_loaded": true,
  "artifact_mode": "json_metadata",
  "engine": "Multinomial Naive Bayes (TF-IDF)"
}
```

### POST `/predict`
- **Request Body**:
```json
{
  "email_text": "URGENT: Your account has been suspended! Click http://secure-verify.com to log in immediately."
}
```
- **Response**:
```json
{
  "classification": "phishing",
  "confidence": 98.45,
  "top_features": ["urgent", "account", "suspended", "click", "verify"],
  "engine": "Multinomial Naive Bayes (JSON Metadata Engine)"
}
```
