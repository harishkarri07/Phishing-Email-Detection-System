import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const app = express();
// Normalize ML_API_URL to ensure valid protocol scheme
function normalizeMlUrl(rawUrl?: string): string {
  let url = (rawUrl || "http://localhost:8000").trim().replace(/\/+$/, "");
  if (!url) return "http://localhost:8000";
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    if (url.includes("localhost") || url.includes("127.0.0.1") || url.includes(":10000")) {
      url = `http://${url}`;
    } else {
      url = `https://${url}`;
    }
  }
  return url;
}

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const ML_API_URL = normalizeMlUrl(process.env.ML_API_URL);

app.use(express.json({ limit: "2mb" }));

// Security Headers Middleware
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  next();
});

// Load model metadata for server-side ML inference fallback
const metadataPath = path.join(process.cwd(), "backend", "model", "model_metadata.json");
let modelData: any = null;

if (fs.existsSync(metadataPath)) {
  try {
    const content = fs.readFileSync(metadataPath, "utf-8");
    modelData = JSON.parse(content);
    console.log("[Express ML Proxy] Loaded pre-trained model metadata successfully.");
  } catch (err) {
    console.error("[Express ML Proxy] Error reading model_metadata.json:", err);
  }
}

// Stopwords for local Express NLP pre-processing
const STOPWORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t', 'as', 'at',
  'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can', 'can\'t', 'cannot',
  'could', 'did', 'do', 'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'has',
  'have', 'having', 'he', 'her', 'here', 'hers', 'him', 'himself', 'his', 'how', 'i', 'if', 'in', 'into', 'is', 'it',
  'its', 'itself', 'just', 'me', 'more', 'most', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only',
  'or', 'other', 'our', 'ours', 'out', 'over', 'own', 'same', 'she', 'should', 'so', 'some', 'such', 'than', 'that',
  'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they', 'this', 'those', 'through', 'to',
  'too', 'under', 'until', 'up', 'very', 'was', 'we', 'were', 'what', 'when', 'where', 'which', 'while', 'who',
  'whom', 'why', 'with', 'would', 'you', 'your'
]);

function preprocessText(text: string): string {
  const clean = text.toLowerCase().replace(/[^a-z\s]/g, ' ');
  const tokens = clean.split(/\s+/);
  return tokens.filter(t => !STOPWORDS.has(t) && t.length > 2).join(' ');
}

// API Routes
app.get("/api/health", async (req, res) => {
  // Check if external FastAPI ML service is responding
  try {
    const pyRes = await fetch(`${ML_API_URL}/health`, { signal: AbortSignal.timeout(1200) });
    if (pyRes.ok) {
      const data = await pyRes.json();
      return res.json({ ...data, source: `FastAPI Service (${ML_API_URL})` });
    }
  } catch {
    // FastAPI service unreachable, fallback to Express embedded ML Engine
  }

  return res.json({
    status: "ok",
    model_loaded: !!modelData,
    engine: "Multinomial Naive Bayes (TF-IDF)",
    source: "Express Embedded Server Engine"
  });
});

app.post("/api/predict", async (req, res) => {
  const { email_text } = req.body;

  if (!email_text || typeof email_text !== 'string' || !email_text.trim()) {
    return res.status(400).json({ detail: "Email text is required and cannot be empty." });
  }

  // First, try forwarding to Python FastAPI backend if configured/available
  try {
    const pyRes = await fetch(`${ML_API_URL}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email_text }),
      signal: AbortSignal.timeout(2000)
    });
    if (pyRes.ok) {
      const data = await pyRes.json();
      return res.json(data);
    }
  } catch {
    // FastAPI backend not answering, fall back to Express ML model calculation
  }

  if (!modelData) {
    return res.status(503).json({ detail: "ML model metadata is not available." });
  }

  try {
    const cleanText = preprocessText(email_text);
    const words = cleanText.split(' ');

    const vocab = modelData.vocabulary || {};
    const idf = modelData.idf || [];
    const priors = modelData.class_log_prior || [-0.693, -0.693];
    const featureLogProb = modelData.feature_log_prob || [[], []];

    let scoreLegit = priors[0];
    let scorePhish = priors[1];
    const topFeatures: string[] = [];

    for (const w of words) {
      if (vocab[w] !== undefined) {
        const idx = vocab[w];
        const idfVal = idf[idx] || 1.0;
        scoreLegit += (featureLogProb[0][idx] || -5.0) * idfVal;
        scorePhish += (featureLogProb[1][idx] || -5.0) * idfVal;

        if ((featureLogProb[1][idx] || -5.0) > (featureLogProb[0][idx] || -5.0)) {
          topFeatures.push(w);
        }
      }
    }

    const diff = scorePhish - scoreLegit;
    const pPhish = 1.0 / (1.0 + Math.exp(-Math.max(-10.0, Math.min(10.0, diff))));

    const classification = pPhish >= 0.5 ? "phishing" : "legitimate";
    const confidence = pPhish >= 0.5 ? pPhish * 100 : (1.0 - pPhish) * 100;

    const uniqueTopFeatures = Array.from(new Set(topFeatures)).slice(0, 6);

    return res.json({
      classification,
      confidence: Number(confidence.toFixed(2)),
      top_features: uniqueTopFeatures.length > 0 ? uniqueTopFeatures : words.slice(0, 5),
      engine: "Multinomial Naive Bayes (Express Embedded Engine)"
    });
  } catch (err: any) {
    return res.status(500).json({ detail: "Internal prediction processing error.", error: err.message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
  app.use((req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT} (ML_API_URL: ${ML_API_URL})`);
  });
}

startServer();
