import { AnalysisResult, HeaderFlag, Classification, SensitivityLevel, SuspiciousLink } from '../types';

// Stopwords set for text preprocessing (lemmatization/cleaning simulation)
const STOPWORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and',
  'any', 'are', 'aren\'t', 'as', 'at', 'be', 'because', 'been', 'before', 'being',
  'below', 'between', 'both', 'but', 'by', 'can', 'can\'t', 'cannot', 'could',
  'did', 'do', 'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from',
  'further', 'had', 'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'him',
  'himself', 'his', 'how', 'i', 'if', 'in', 'into', 'is', 'it', 'its', 'itself',
  'just', 'me', 'more', 'most', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off',
  'on', 'once', 'only', 'or', 'other', 'our', 'ours', 'out', 'over', 'own', 'same',
  'she', 'should', 'so', 'some', 'such', 'than', 'that', 'the', 'their', 'theirs',
  'them', 'themselves', 'then', 'there', 'these', 'they', 'this', 'those', 'through',
  'to', 'too', 'under', 'until', 'up', 'very', 'was', 'we', 'were', 'what', 'when',
  'where', 'which', 'while', 'who', 'whom', 'why', 'with', 'would', 'you', 'your'
]);

// Phishing Keyword Database with weights
interface WeightedKeyword {
  keyword: string;
  weight: number;
  category: 'urgency' | 'financial' | 'credential' | 'action' | 'reward';
}

export const PHISHING_KEYWORDS_DB: WeightedKeyword[] = [
  { keyword: 'urgent', weight: 15, category: 'urgency' },
  { keyword: 'click here', weight: 15, category: 'action' },
  { keyword: 'verify now', weight: 20, category: 'credential' },
  { keyword: 'verify immediately', weight: 22, category: 'credential' },
  { keyword: 'suspended', weight: 18, category: 'urgency' },
  { keyword: 'account suspended', weight: 25, category: 'urgency' },
  { keyword: 'password', weight: 12, category: 'credential' },
  { keyword: 'expires', weight: 12, category: 'urgency' },
  { keyword: 'immediately', weight: 10, category: 'urgency' },
  { keyword: 'act now', weight: 15, category: 'urgency' },
  { keyword: 'limited time', weight: 12, category: 'urgency' },
  { keyword: 'free money', weight: 25, category: 'reward' },
  { keyword: 'congratulations', weight: 12, category: 'reward' },
  { keyword: 'winner', weight: 18, category: 'reward' },
  { keyword: 'claim now', weight: 20, category: 'reward' },
  { keyword: 'claim prize', weight: 22, category: 'reward' },
  { keyword: 'security alert', weight: 18, category: 'credential' },
  { keyword: 'unusual activity', weight: 16, category: 'credential' },
  { keyword: 'ssn', weight: 25, category: 'credential' },
  { keyword: 'social security', weight: 25, category: 'credential' },
  { keyword: 'credit card', weight: 20, category: 'financial' },
  { keyword: 'bank details', weight: 22, category: 'financial' },
  { keyword: 'wire transfer', weight: 20, category: 'financial' },
  { keyword: 'tax refund', weight: 18, category: 'financial' },
  { keyword: 'update payment', weight: 20, category: 'financial' },
  { keyword: 'login attempt', weight: 14, category: 'credential' },
];

const SUSPICIOUS_PATTERNS = [
  { name: 'Urgent Action Request', regex: /urgent.*click/i },
  { name: 'Password Expiration Threat', regex: /password.*expir/i },
  { name: 'Immediate Verification Request', regex: /verify.*immediately/i },
  { name: 'Account Suspension Threat', regex: /account.*suspend/i },
  { name: 'Call To Action Pressure', regex: /click.*here.*now/i },
  { name: 'Financial Enticement', regex: /free.*money/i },
  { name: 'Lottery/Winner Claim', regex: /winner.*congratulations/i },
  { name: 'Time-Limited Pressure', regex: /(within 24 hours|expire[s]? today|act fast|last chance)/i },
  { name: 'Sensitive Data Harvest', regex: /(enter|update|confirm).*(password|credit card|ssn|pin|cvv)/i },
];

// High risk TLDs or suspicious URL signs
const SUSPICIOUS_DOMAINS_PATTERNS = [
  /bit\.ly/i, /tinyurl\.com/i, /is\.gd/i, /goo\.gl/i,
  /-verify-/i, /-security-/i, /-update-/i, /-portal-/i,
  /paypaI/i, // Homoglyph (capital i instead of l)
  /amaz0n/i, /micros0ft/i, /g00gle/i, /\.xyz$/i, /\.info$/i, /\.top$/i, /\.tk$/i
];

/**
 * Clean & Preprocess text like TF-IDF lemmatizer in Python
 */
export function preprocessText(text: string): string {
  if (!text) return '';
  const clean = text.toLowerCase().replace(/[^a-z\s]/g, '');
  const words = clean.split(/\s+/);
  const processed = words.filter(w => !STOPWORDS.has(w) && w.length > 2);
  return processed.join(' ');
}

/**
 * Extract URLs from email body
 */
export function extractUrls(text: string): SuspiciousLink[] {
  const urlRegex = /(https?:\/\/[^\s<>"']+)|(www\.[^\s<>"']+)/gi;
  const matches = text.match(urlRegex) || [];
  
  return matches.map(url => {
    let domain = '';
    try {
      const parsed = new URL(url.startsWith('http') ? url : `http://${url}`);
      domain = parsed.hostname;
    } catch {
      domain = url;
    }

    let isSuspicious = false;
    let reason = '';

    for (const pattern of SUSPICIOUS_DOMAINS_PATTERNS) {
      if (pattern.test(url) || pattern.test(domain)) {
        isSuspicious = true;
        reason = 'URL uses shortened link or suspicious domain keywords/homoglyphs';
        break;
      }
    }

    if (!isSuspicious && (url.includes('download') || url.includes('login') || url.includes('verify'))) {
      isSuspicious = true;
      reason = 'URL path contains sensitive action prompts';
    }

    return {
      url,
      domain,
      isSuspicious,
      reason
    };
  });
}

/**
 * Header analysis for spoofed senders
 */
export function analyzeHeader(sender?: string, subject?: string): HeaderFlag[] {
  const flags: HeaderFlag[] = [];

  if (sender) {
    const senderLower = sender.toLowerCase();
    
    // Homoglyph / typosquatting check
    if (/paypaI|amaz0n|micros0ft|appIe|g00gle/i.test(senderLower)) {
      flags.push({
        flag: 'Typosquatting/Homoglyph Sender',
        severity: 'high',
        description: `Sender address "${sender}" uses lookalike characters to spoof a major brand.`
      });
    }

    // Free webmail claiming official brand
    if (/@(gmail|yahoo|hotmail|outlook)\.com/i.test(senderLower) && 
        /(bank|paypal|security|support|admin|irs|chase|wellsfargo)/i.test(senderLower)) {
      flags.push({
        flag: 'Free Webmail Brand Impersonation',
        severity: 'high',
        description: `Sender uses a free webmail domain while posing as an official institution.`
      });
    }

    // Hyphenated verification domain
    if (/(-verify|-security|-update|-claim|-portal|-login)/i.test(senderLower)) {
      flags.push({
        flag: 'Suspicious Domain Naming',
        severity: 'medium',
        description: `Sender domain contains suspicious security/update sub-keywords.`
      });
    }
  }

  if (subject) {
    if (/URGENT|CRITICAL|SUSPENDED|WARNING|IMMEDIATE/i.test(subject)) {
      flags.push({
        flag: 'High-Urgency Subject Line',
        severity: 'medium',
        description: 'Subject line relies on fear, panic, or artificial deadline.'
      });
    }
  }

  return flags;
}

/**
 * Main Analysis Engine
 */
export function analyzeEmail(
  body: string,
  sender = '',
  subject = '',
  sensitivity: SensitivityLevel = 'balanced'
): AnalysisResult {
  const fullText = `${subject} ${body}`;
  const lowerText = fullText.toLowerCase();

  // 1. Preprocess text
  const processedText = preprocessText(fullText);
  const words = processedText.split(' ');
  const tokenCount = words.length;

  // 2. Keyword detection
  const foundKeywords: string[] = [];
  let keywordScore = 0;
  let urgencyScoreRaw = 0;

  PHISHING_KEYWORDS_DB.forEach(({ keyword, weight, category }) => {
    if (lowerText.includes(keyword)) {
      if (!foundKeywords.includes(keyword)) {
        foundKeywords.push(keyword);
        keywordScore += weight;
        if (category === 'urgency') urgencyScoreRaw += weight * 1.5;
      }
    }
  });

  // 3. Pattern detection
  const foundPatterns: string[] = [];
  let patternScore = 0;

  SUSPICIOUS_PATTERNS.forEach(({ name, regex }) => {
    if (regex.test(lowerText)) {
      foundPatterns.push(name);
      patternScore += 20;
    }
  });

  // 4. Link extraction & analysis
  const detectedLinks = extractUrls(body);
  const suspiciousLinkCount = detectedLinks.filter(l => l.isSuspicious).length;
  const linkScore = (detectedLinks.length * 5) + (suspiciousLinkCount * 25);

  // 5. Header flags
  const headerFlags = analyzeHeader(sender, subject);
  const headerScore = headerFlags.reduce((acc, flag) => {
    if (flag.severity === 'high') return acc + 30;
    if (flag.severity === 'medium') return acc + 15;
    return acc + 5;
  }, 0);

  // 6. Sensitivity multiplier
  let sensitivityMultiplier = 1.0;
  if (sensitivity === 'strict') sensitivityMultiplier = 1.25;
  if (sensitivity === 'relaxed') sensitivityMultiplier = 0.8;

  // Calculate total risk score (0 - 100)
  const totalScoreRaw = (keywordScore + patternScore + linkScore + headerScore) * sensitivityMultiplier;
  const riskScore = Math.min(100, Math.max(0, Math.round(totalScoreRaw)));

  // Urgency metric
  const urgencyScore = Math.min(100, Math.round(Math.min(100, urgencyScoreRaw + (foundPatterns.length * 15))));

  // Determine classification & confidence
  let classification: Classification = 'LEGITIMATE';
  let confidence = 0;

  if (riskScore >= 45) {
    classification = 'PHISHING';
    confidence = Math.min(99, Math.round(70 + (riskScore - 45) * 0.55));
  } else if (riskScore >= 20) {
    classification = 'SUSPICIOUS';
    confidence = Math.min(85, Math.round(55 + (riskScore - 20) * 1.2));
  } else {
    classification = 'LEGITIMATE';
    confidence = Math.min(99, Math.round(80 + (20 - riskScore) * 1.0));
  }

  // Generate recommendations
  const recommendations: string[] = [];
  if (classification === 'PHISHING') {
    recommendations.push('DO NOT click any links or download attachments in this email.');
    recommendations.push('Do NOT reply to the sender or provide sensitive credentials/banking details.');
    recommendations.push('Report this message as Phishing/Spam to your IT administrator or mail provider.');
    if (headerFlags.length > 0) {
      recommendations.push('Verify the actual sender email address domain in header details.');
    }
  } else if (classification === 'SUSPICIOUS') {
    recommendations.push('Exercise caution before acting on any request in this email.');
    recommendations.push('Verify the request via an alternative known channel (e.g. calling official support).');
    recommendations.push('Check hover links before clicking to confirm destination domains match.');
  } else {
    recommendations.push('This email shows no obvious automated phishing indicators.');
    recommendations.push('Always maintain standard security hygiene when handling external messages.');
  }

  return {
    classification,
    confidence,
    riskScore,
    urgencyScore,
    phishingKeywordsFound: foundKeywords,
    suspiciousPatternsFound: foundPatterns,
    detectedLinks,
    headerFlags,
    processedText,
    tokenCount,
    recommendations,
    analyzedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    emailDetails: {
      sender,
      subject,
      bodyLength: body.length
    }
  };
}
