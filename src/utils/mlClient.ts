export interface MLPredictResponse {
  classification: 'phishing' | 'legitimate';
  confidence: number;
  top_features: string[];
  engine?: string;
  isBackendActive?: boolean;
}

const RAW_API_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Normalizes base API URL to prevent double slashes or missing protocols
 */
function getTargetEndpoint(endpoint: string): string {
  let base = RAW_API_URL.trim().replace(/\/$/, '');
  if (!base.startsWith('http') && !base.startsWith('/')) {
    base = `http://${base}`;
  }
  return `${base}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
}

/**
 * Calls the ML Classifier Backend (/predict)
 */
export async function predictWithML(emailText: string): Promise<MLPredictResponse> {
  const targetUrl = getTargetEndpoint('/predict');

  try {
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email_text: emailText }),
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      throw new Error(errJson.detail || `ML Server returned status ${response.status}`);
    }

    const data = await response.json();
    return {
      classification: (data.classification || 'phishing').toLowerCase() as 'phishing' | 'legitimate',
      confidence: typeof data.confidence === 'number' ? data.confidence : 0,
      top_features: Array.isArray(data.top_features) ? data.top_features : [],
      engine: data.engine || 'Multinomial Naive Bayes (TF-IDF)',
      isBackendActive: true,
    };
  } catch (err: any) {
    console.warn('[ML Client] Direct API prediction call failed:', err.message);

    // Fallback to relative /api/predict route if VITE_API_URL was set to a different host
    if (RAW_API_URL !== '/api') {
      try {
        const fallbackRes = await fetch('/api/predict', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email_text: emailText }),
        });
        if (fallbackRes.ok) {
          const fallbackData = await fallbackRes.json();
          return {
            classification: (fallbackData.classification || 'phishing').toLowerCase() as 'phishing' | 'legitimate',
            confidence: fallbackData.confidence || 0,
            top_features: fallbackData.top_features || [],
            engine: fallbackData.engine || 'Multinomial Naive Bayes (Express Embedded Engine)',
            isBackendActive: true,
          };
        }
      } catch {
        console.warn('[ML Client] Fallback /api/predict request also failed.');
      }
    }

    throw new Error(err.message || 'Unable to connect to ML Backend server.');
  }
}

/**
 * Checks health of ML Backend server
 */
export async function checkMLHealth(): Promise<boolean> {
  const targetUrl = getTargetEndpoint('/health');
  try {
    const res = await fetch(targetUrl);
    if (!res.ok) return false;
    const data = await res.json();
    return data.status === 'ok' || data.status === 'degraded';
  } catch {
    return false;
  }
}
