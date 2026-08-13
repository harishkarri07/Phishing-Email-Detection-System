export type Classification = 'PHISHING' | 'LEGITIMATE' | 'SUSPICIOUS';

export interface SuspiciousLink {
  url: string;
  domain: string;
  isSuspicious: boolean;
  reason?: string;
}

export interface HeaderFlag {
  flag: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
}

export interface MLResultData {
  classification: 'phishing' | 'legitimate';
  confidence: number;
  top_features: string[];
  engine?: string;
  error?: string;
}

export interface AnalysisResult {
  classification: Classification;
  confidence: number; // Percentage 0 - 100
  riskScore: number; // 0 - 100
  urgencyScore: number; // 0 - 100
  phishingKeywordsFound: string[];
  suspiciousPatternsFound: string[];
  detectedLinks: SuspiciousLink[];
  headerFlags: HeaderFlag[];
  processedText: string;
  tokenCount: number;
  recommendations: string[];
  analyzedAt: string;
  emailDetails?: {
    sender?: string;
    subject?: string;
    bodyLength: number;
  };
  mlResult?: MLResultData;
}

export interface EmailPreset {
  id: string;
  title: string;
  category: 'phishing' | 'legitimate' | 'suspicious';
  sender: string;
  subject: string;
  body: string;
  description: string;
}

export interface HistoryItem {
  id: string;
  timestamp: string;
  sender: string;
  subject: string;
  snippet: string;
  result: AnalysisResult;
}

export type SensitivityLevel = 'strict' | 'balanced' | 'relaxed';
