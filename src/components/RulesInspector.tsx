import React, { useState } from 'react';
import { BookOpen, KeyRound, ShieldAlert, FileText, Search, Code2 } from 'lucide-react';
import { PHISHING_KEYWORDS_DB } from '../utils/phishingEngine';

export const RulesInspector: React.FC = () => {
  const [keywordSearch, setKeywordSearch] = useState('');

  const filteredKeywords = PHISHING_KEYWORDS_DB.filter(
    (item) =>
      item.keyword.toLowerCase().includes(keywordSearch.toLowerCase()) ||
      item.category.toLowerCase().includes(keywordSearch.toLowerCase())
  );

  return (
    <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 sm:p-6 space-y-6">
      <div className="border-b border-slate-700/60 pb-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-400" />
          <span>Rule Engine & Detection Architecture</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Transparent view of keywords, regex patterns, NLP vectorization, and weight heuristics used to evaluate email safety.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/80 border border-slate-700/80 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider">
            <FileText className="w-4 h-4" />
            <span>1. Text Preprocessing</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Lowercases all string data, strips non-alphabetical noise, removes standard NLTK stopwords, and normalizes word tokens for feature extraction.
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-700/80 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-rose-400 uppercase tracking-wider">
            <KeyRound className="w-4 h-4" />
            <span>2. TF-IDF & Keyword Scoring</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Evaluates term frequency and weighted threat categories (urgency, credential harvest, financial triggers, artificial deadlines).
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-700/80 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4" />
            <span>3. Header & Link Analysis</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Scans URL path components, shortened links, homoglyph domain spellings, and free webmail sender impersonation.
          </p>
        </div>
      </div>

      {/* Keywords Weight Database Table */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Code2 className="w-4 h-4 text-emerald-400" />
            <span>Weighted Phishing Keywords Database ({PHISHING_KEYWORDS_DB.length})</span>
          </h3>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search keyword database..."
              value={keywordSearch}
              onChange={(e) => setKeywordSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="border border-slate-700/80 rounded-xl overflow-hidden bg-slate-900/90 max-h-72 overflow-y-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-800/80 text-slate-300 border-b border-slate-700/80">
                <th className="p-2.5 font-bold">Keyword / Phrase</th>
                <th className="p-2.5 font-bold">Category</th>
                <th className="p-2.5 font-bold text-right">Risk Weight Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredKeywords.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 text-slate-200">
                  <td className="p-2.5 font-semibold text-rose-300">{item.keyword}</td>
                  <td className="p-2.5 font-sans">
                    <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-[10px] uppercase font-semibold border border-slate-700">
                      {item.category}
                    </span>
                  </td>
                  <td className="p-2.5 text-right font-bold text-white">+{item.weight} pts</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
