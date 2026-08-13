# 🛡️ Phishing Email Detection System

A production-ready full-stack application featuring a dual-engine architecture for detecting phishing emails using **Heuristic Rule-Based NLP Analysis** alongside a **Multinomial Naive Bayes Machine Learning Classifier (TF-IDF Vectorized)**.

---

## 🏛️ System Architecture

```
                 INTERNET / BROWSER
                         │
                         ▼
          ┌─────────────────────────────┐
          │     React 18 + Vite SPA     │
          └──────────────┬──────────────┘
                         │ /api requests
                         ▼
          ┌─────────────────────────────┐
          │     Express Node Server     │
          │   (Static Host & Proxy)     │
          └──────────────┬──────────────┘
                         │ ML_API_URL
                         ▼
          ┌─────────────────────────────┐
          │   Python FastAPI ML Backend │
          │  (Multinomial Naive Bayes)  │
          └─────────────────────────────┘
```

---

## ✨ Features

- **Dual Detection Engines**:
  - **Rule-Based Engine**: Analyzes regex patterns, urgency keywords, suspicious links, spoofed headers, and sender domain risk.
  - **Machine Learning Engine**: TF-IDF feature extraction combined with a Multinomial Naive Bayes classifier.
- **High Availability Fallback**: Express proxy forwards predictions to Python FastAPI when online, and falls back seamlessly to an embedded mathematical Naive Bayes engine if the Python service is sleeping or unreachable.
- **Render Production Ready**: Includes a pre-configured `render.yaml` infrastructure-as-code Blueprint for automated one-click deployment.

---

## 🚀 Local Setup & Running

### 1. Install Node Dependencies
```bash
npm install
```

### 2. Start Python ML Backend (Terminal 1)
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python train_model.py
uvicorn app:app --reload --port 8000
```

### 3. Start Full-Stack Web App (Terminal 2)
```bash
npm run dev
```
Navigate to `http://localhost:3000` in your browser.

---

## 🌐 Public Production Deployment on Render

### Step 1: Deploy with Render Blueprint
1. Push this repository to GitHub or GitLab.
2. Log into [Render Dashboard](https://dashboard.render.com).
3. Click **New +** -> **Blueprint**.
4. Connect your repository. Render will automatically read `render.yaml` and provision two services:
   - `phishing-ml-backend` (Python FastAPI Web Service)
   - `phishing-detector-web` (Node.js Express + React Web Service)

### Step 2: Environment Variable Linking
Render automatically links the services via `render.yaml`:
- `ML_API_URL` on `phishing-detector-web` automatically receives the host of `phishing-ml-backend`.
- `FRONTEND_URL` on `phishing-ml-backend` automatically receives the host of `phishing-detector-web`.

---

## 🧪 Verification & Testing Endpoints

### Health Endpoint
```bash
curl http://localhost:3000/api/health
```

### Predict Endpoint
```bash
curl -X POST http://localhost:3000/api/predict \
  -H "Content-Type: application/json" \
  -d '{"email_text": "URGENT: Your account has been suspended! Click http://secure-verify.com immediately."}'
```
