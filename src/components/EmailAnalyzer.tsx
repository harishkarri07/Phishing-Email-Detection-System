import React, { useState } from 'react';
import { Send, Eraser, FileText, Mail, User, Tag, Sparkles, ChevronDown } from 'lucide-react';
import { EMAIL_PRESETS } from '../data/presets';
import { EmailPreset } from '../types';

interface EmailAnalyzerProps {
  onAnalyze: (body: string, sender: string, subject: string) => void;
  isLoading: boolean;
}

export const EmailAnalyzer: React.FC<EmailAnalyzerProps> = ({ onAnalyze, isLoading }) => {
  const [body, setBody] = useState('');
  const [sender, setSender] = useState('');
  const [subject, setSubject] = useState('');
  const [showAdvance, setShowAdvance] = useState(false);

  const handleSelectPreset = (preset: EmailPreset) => {
    setSender(preset.sender);
    setSubject(preset.subject);
    setBody(preset.body);
    onAnalyze(preset.body, preset.sender, preset.subject);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim() && !subject.trim()) return;
    onAnalyze(body, sender, subject);
  };

  const handleClear = () => {
    setBody('');
    setSender('');
    setSubject('');
  };

  return (
    <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 sm:p-6 shadow-xl backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-400" />
          <h2 className="text-base sm:text-lg font-bold text-white">Email Content Analyzer</h2>
        </div>
        <button
          type="button"
          onClick={() => setShowAdvance(!showAdvance)}
          className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium bg-blue-500/10 hover:bg-blue-500/20 px-3 py-1 rounded-lg border border-blue-500/20 transition"
        >
          <span>{showAdvance ? 'Hide Header Details' : '+ Add Sender & Subject'}</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAdvance ? 'rotate-180' : ''}`} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Optional Header Fields */}
        {showAdvance && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-900/80 rounded-xl border border-slate-700/80 animate-fadeIn">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Sender Email (From)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. security-alert@bank-verify.com"
                value={sender}
                onChange={(e) => setSender(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>Email Subject</span>
              </label>
              <input
                type="text"
                placeholder="e.g. URGENT: Account Suspension Notice"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        {/* Main Body Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
            <span>Email Body / Text Content</span>
            <span className="text-[11px] text-slate-400">{body.length} characters</span>
          </label>
          <textarea
            required
            rows={7}
            placeholder="Paste the email content you want to analyze here..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full px-4 py-3 bg-slate-900/90 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-sans resize-y leading-relaxed"
          />
        </div>

        {/* Form Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={handleClear}
            disabled={!body && !sender && !subject}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Eraser className="w-3.5 h-3.5" />
            <span>Clear Input</span>
          </button>

          <button
            type="submit"
            disabled={isLoading || (!body.trim() && !subject.trim())}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Analyzing Email...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Analyze Email</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Preset Example Quick Selector */}
      <div className="mt-6 pt-5 border-t border-slate-700/60">
        <div className="flex items-center gap-2 mb-3">
          <Tag className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Quick Test Examples</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {EMAIL_PRESETS.map((preset) => {
            const isPhish = preset.category === 'phishing';
            const isLegit = preset.category === 'legitimate';
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`text-left p-2.5 rounded-xl border transition flex items-start gap-2.5 group ${
                  isPhish
                    ? 'bg-rose-950/20 border-rose-900/40 hover:border-rose-500/50 hover:bg-rose-900/30'
                    : isLegit
                    ? 'bg-emerald-950/20 border-emerald-900/40 hover:border-emerald-500/50 hover:bg-emerald-900/30'
                    : 'bg-amber-950/20 border-amber-900/40 hover:border-amber-500/50 hover:bg-amber-900/30'
                }`}
              >
                <div className="mt-0.5">
                  <span
                    className={`inline-block w-2 h-2 rounded-full ${
                      isPhish ? 'bg-rose-500' : isLegit ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-200 group-hover:text-white truncate">
                    {preset.title}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">{preset.subject}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
