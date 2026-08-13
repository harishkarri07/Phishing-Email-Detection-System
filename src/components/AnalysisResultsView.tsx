import React from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
  KeyRound,
  FileCode,
  CheckCircle2,
  ListChecks,
  Clock,
  Zap,
  BrainCircuit,
  Cpu,
  Info
} from 'lucide-react';
import { AnalysisResult } from '../types';

interface AnalysisResultsViewProps {
  result: AnalysisResult;
}

export const AnalysisResultsView: React.FC<AnalysisResultsViewProps> = ({ result }) => {
  const isPhishing = result.classification === 'PHISHING';
  const isSuspicious = result.classification === 'SUSPICIOUS';
  const isLegitimate = result.classification === 'LEGITIMATE';

  const mlData = result.mlResult;
  const isMLPhishing = mlData?.classification === 'phishing';

  return (
    <div className="space-y-6">
      {/* Side-by-Side Engine Verdict Comparison Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* ENGINE 1: Rule-Based Heuristic Engine */}
        <div
          className={`rounded-2xl p-6 border shadow-xl relative overflow-hidden flex flex-col justify-between ${
            isPhishing
              ? 'bg-gradient-to-br from-rose-950/70 via-slate-900 to-slate-900 border-rose-600/50 text-rose-100'
              : isSuspicious
              ? 'bg-gradient-to-br from-amber-950/70 via-slate-900 to-slate-900 border-amber-600/50 text-amber-100'
              : 'bg-gradient-to-br from-emerald-950/70 via-slate-900 to-slate-900 border-emerald-600/50 text-emerald-100'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-blue-400" />
                <span className="text-xs uppercase font-extrabold tracking-wider text-slate-300">
                  Engine 1: Rule-Based Heuristic
                </span>
              </div>
              <span className="text-[10px] px-2 py-0.5 bg-slate-950/80 text-slate-400 rounded-full border border-slate-800">
                Client-Side
              </span>
            </div>

            <div className="flex items-center gap-3 mt-2">
              <div
                className={`p-2.5 rounded-xl border ${
                  isPhishing
                    ? 'bg-rose-600 text-white border-rose-400/30'
                    : isSuspicious
                    ? 'bg-amber-600 text-white border-amber-400/30'
                    : 'bg-emerald-600 text-white border-emerald-400/30'
                }`}
              >
                {isPhishing && <ShieldAlert className="w-6 h-6 animate-pulse" />}
                {isSuspicious && <AlertTriangle className="w-6 h-6" />}
                {isLegitimate && <ShieldCheck className="w-6 h-6" />}
              </div>

              <div>
                <h3 className="text-xl font-extrabold tracking-tight">
                  {isPhishing && 'PHISHING DETECTED'}
                  {isSuspicious && 'SUSPICIOUS EMAIL'}
                  {isLegitimate && 'LEGITIMATE EMAIL'}
                </h3>
                <p className="text-xs opacity-80 mt-0.5">
                  Weighted keyword rules, regex pattern matching & URL inspection.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-4 mt-4 border-t border-slate-800/80">
            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Risk Score</div>
              <div className={`text-base font-extrabold ${result.riskScore > 50 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {result.riskScore}/100
              </div>
            </div>

            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Confidence</div>
              <div className="text-base font-extrabold text-white">{result.confidence}%</div>
            </div>
          </div>
        </div>

        {/* ENGINE 2: Machine Learning (TF-IDF + Naive Bayes) */}
        <div className="rounded-2xl p-6 border shadow-xl relative overflow-hidden bg-gradient-to-br from-indigo-950/70 via-slate-900 to-slate-900 border-indigo-600/50 text-indigo-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-indigo-400" />
                <span className="text-xs uppercase font-extrabold tracking-wider text-slate-300">
                  Engine 2: ML Naive Bayes Classifier
                </span>
              </div>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full border ${
                  mlData?.error
                    ? 'bg-rose-950/80 text-rose-300 border-rose-800'
                    : 'bg-indigo-950/80 text-indigo-300 border-indigo-800'
                }`}
              >
                {mlData?.error ? 'Offline Warning' : 'FastAPI / Express API'}
              </span>
            </div>

            {mlData?.error ? (
              <div className="p-3 bg-rose-950/30 border border-rose-800/50 rounded-xl space-y-1">
                <div className="flex items-center gap-2 text-rose-400 text-xs font-bold">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>ML Backend Service Offline</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-tight">
                  {mlData.error}
                </p>
                <div className="text-[10px] text-slate-400 font-mono pt-1">
                  Run: <code className="text-indigo-300">cd backend && uvicorn app:app --reload</code>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 mt-2">
                <div
                  className={`p-2.5 rounded-xl border ${
                    isMLPhishing
                      ? 'bg-rose-600 text-white border-rose-400/30'
                      : 'bg-emerald-600 text-white border-emerald-400/30'
                  }`}
                >
                  {isMLPhishing ? <ShieldAlert className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
                </div>

                <div>
                  <h3 className="text-xl font-extrabold tracking-tight uppercase">
                    {isMLPhishing ? 'PHISHING PREDICTED' : 'LEGITIMATE PREDICTED'}
                  </h3>
                  <p className="text-xs opacity-80 mt-0.5">
                    TF-IDF feature vectorization & MultinomialNB probability.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-4 mt-4 border-t border-slate-800/80">
            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
              <div className="text-[10px] text-slate-400 font-bold uppercase">ML Confidence</div>
              <div className="text-base font-extrabold text-white">
                {mlData?.error ? 'N/A' : `${mlData?.confidence.toFixed(1)}%`}
              </div>
            </div>

            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Top Influential Tokens</div>
              <div className="text-xs text-indigo-300 font-mono truncate">
                {mlData?.top_features && mlData.top_features.length > 0
                  ? mlData.top_features.slice(0, 3).join(', ')
                  : 'None'}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Metrics Gauges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Threat Level */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-blue-400" /> Overall Risk Index
            </span>
            <span className="font-bold text-white">{result.riskScore}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                result.riskScore > 50 ? 'bg-rose-500' : result.riskScore > 20 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${result.riskScore}%` }}
            />
          </div>
        </div>

        {/* Urgency Factor */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" /> Urgency & Pressure
            </span>
            <span className="font-bold text-white">{result.urgencyScore}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
            <div
              className="h-full rounded-full bg-amber-500 transition-all duration-700"
              style={{ width: `${result.urgencyScore}%` }}
            />
          </div>
        </div>

        {/* Detected Triggers */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-rose-400" /> Trigger Count
            </span>
            <span className="font-bold text-white">
              {result.phishingKeywordsFound.length + result.suspiciousPatternsFound.length}
            </span>
          </div>
          <div className="text-xs text-slate-300 font-medium">
            {result.phishingKeywordsFound.length} keywords &bull; {result.suspiciousPatternsFound.length} patterns
          </div>
        </div>
      </div>

      {/* Main Analysis Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Phishing Keywords & Patterns Found */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-rose-400" />
              <span>Detected Phishing Keywords</span>
            </h3>
            <span className="text-xs bg-slate-900 text-slate-400 px-2 py-0.5 rounded-full border border-slate-700">
              {result.phishingKeywordsFound.length} Found
            </span>
          </div>

          {result.phishingKeywordsFound.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {result.phishingKeywordsFound.map((kw, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  {kw}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">No suspicious phishing keywords detected.</p>
          )}

          {/* Suspicious Behavioral Patterns */}
          <div className="pt-3 border-t border-slate-700/60 space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Matched Threat Patterns</h4>
            {result.suspiciousPatternsFound.length > 0 ? (
              <ul className="space-y-1.5">
                {result.suspiciousPatternsFound.map((pat, i) => (
                  <li
                    key={i}
                    className="text-xs text-amber-200 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg flex items-center gap-2"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{pat}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-400 italic">No high-risk structural regex patterns triggered.</p>
            )}
          </div>
        </div>

        {/* Sender Header & Link Inspections */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-blue-400" />
              <span>Link & Header Inspector</span>
            </h3>
            <span className="text-xs bg-slate-900 text-slate-400 px-2 py-0.5 rounded-full border border-slate-700">
              {result.detectedLinks.length} Links
            </span>
          </div>

          {/* Header Flags */}
          {result.headerFlags.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Header Spoofing Flags</h4>
              {result.headerFlags.map((flag, idx) => (
                <div
                  key={idx}
                  className="bg-rose-950/30 border border-rose-500/30 p-2.5 rounded-lg text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-rose-300">{flag.flag}</span>
                    <span className="text-[10px] uppercase px-1.5 py-0.2 bg-rose-500/20 text-rose-400 rounded font-semibold">
                      {flag.severity}
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-tight">{flag.description}</p>
                </div>
              ))}
            </div>
          )}

          {/* Detected Links List */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Extracted URLs</h4>
            {result.detectedLinks.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {result.detectedLinks.map((link, i) => (
                  <div
                    key={i}
                    className={`p-2.5 rounded-lg text-xs border font-mono break-all ${
                      link.isSuspicious
                        ? 'bg-rose-950/20 border-rose-500/40 text-rose-200'
                        : 'bg-slate-900/80 border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between font-sans mb-1">
                      <span className="text-[10px] font-bold text-slate-400">{link.domain}</span>
                      {link.isSuspicious && (
                        <span className="text-[10px] bg-rose-500/20 text-rose-300 px-1.5 py-0.2 rounded font-sans font-semibold">
                          Suspicious Link
                        </span>
                      )}
                    </div>
                    <div>{link.url}</div>
                    {link.reason && (
                      <div className="text-[10px] text-rose-400 font-sans mt-1 italic">{link.reason}</div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No external hyperlinks found in email body.</p>
            )}
          </div>
        </div>
      </div>

      {/* NLP Processed Text & Token Breakdown */}
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <FileCode className="w-4 h-4 text-emerald-400" />
            <span>NLP Cleaned / Processed Tokens</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">{result.tokenCount} Clean Words</span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          The email text undergoes stopword removal, lowercase normalization, and tokenization for TF-IDF feature extraction:
        </p>
        <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs font-mono text-emerald-300/90 leading-relaxed max-h-32 overflow-y-auto">
          {result.processedText || '<No significant non-stopword tokens remaining>'}
        </div>
      </div>

      {/* Recommended Security Actions */}
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <ListChecks className="w-4 h-4 text-blue-400" />
          <span>Recommended Security Actions</span>
        </h3>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {result.recommendations.map((rec, i) => (
            <li
              key={i}
              className="text-xs text-slate-200 bg-slate-900/80 border border-slate-700/80 p-3 rounded-xl flex items-start gap-2.5"
            >
              <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{rec}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
