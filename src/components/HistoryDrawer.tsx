import React, { useState } from 'react';
import { History, Download, Trash2, ShieldAlert, ShieldCheck, AlertTriangle, Search, ExternalLink } from 'lucide-react';
import { HistoryItem } from '../types';

interface HistoryViewProps {
  history: HistoryItem[];
  onSelectHistory: (item: HistoryItem) => void;
  onClearHistory: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  onSelectHistory,
  onClearHistory
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | 'PHISHING' | 'SUSPICIOUS' | 'LEGITIMATE'>('all');

  const filtered = history.filter((item) => {
    const matchesSearch =
      item.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.snippet.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sender.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      filterCategory === 'all' || item.result.classification === filterCategory;

    return matchesSearch && matchesCategory;
  });

  const exportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(history, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `phishing_analysis_history_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const exportCSV = () => {
    const headers = ['ID', 'Timestamp', 'Sender', 'Subject', 'Classification', 'Confidence', 'RiskScore', 'Snippet'];
    const rows = history.map((item) => [
      item.id,
      item.timestamp,
      `"${item.sender.replace(/"/g, '""')}"`,
      `"${item.subject.replace(/"/g, '""')}"`,
      item.result.classification,
      `${item.result.confidence}%`,
      `${item.result.riskScore}/100`,
      `"${item.snippet.replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `phishing_analysis_history_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 sm:p-6 space-y-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-700/60 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-blue-400" />
            <span>Analysis Session History</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            View, filter, and export previously analyzed emails and threat classifications.
          </p>
        </div>

        {history.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={exportCSV}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={exportJSON}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>
            <button
              onClick={onClearHistory}
              className="px-3 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-xs font-semibold text-rose-300 flex items-center gap-1.5 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>
        )}
      </div>

      {/* Filter and Search controls */}
      {history.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search history by subject, sender, or snippet..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as any)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="all">All Classifications</option>
            <option value="PHISHING">Phishing Only</option>
            <option value="SUSPICIOUS">Suspicious Only</option>
            <option value="LEGITIMATE">Legitimate Only</option>
          </select>
        </div>
      )}

      {/* History List */}
      {filtered.length > 0 ? (
        <div className="space-y-2.5">
          {filtered.map((item) => {
            const isPhish = item.result.classification === 'PHISHING';
            const isSusp = item.result.classification === 'SUSPICIOUS';
            return (
              <div
                key={item.id}
                onClick={() => onSelectHistory(item)}
                className={`p-4 rounded-xl border transition cursor-pointer hover:scale-[1.005] group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  isPhish
                    ? 'bg-rose-950/20 border-rose-900/40 hover:border-rose-500/50'
                    : isSusp
                    ? 'bg-amber-950/20 border-amber-900/40 hover:border-amber-500/50'
                    : 'bg-slate-900/80 border-slate-700/80 hover:border-slate-500/50'
                }`}
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                        isPhish
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          : isSusp
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      }`}
                    >
                      {item.result.classification}
                    </span>
                    <span className="text-[11px] text-slate-400">{item.timestamp}</span>
                    {item.sender && (
                      <span className="text-[11px] text-slate-400 truncate max-w-xs">&bull; {item.sender}</span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-white truncate group-hover:text-blue-300 transition">
                    {item.subject || 'No Subject'}
                  </h4>
                  <p className="text-xs text-slate-400 line-clamp-1">{item.snippet}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 font-semibold">Risk Score</div>
                    <div
                      className={`text-sm font-extrabold ${
                        item.result.riskScore > 50
                          ? 'text-rose-400'
                          : item.result.riskScore > 20
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {item.result.riskScore}/100
                    </div>
                  </div>
                  <div className="p-2 bg-slate-800 group-hover:bg-blue-600 rounded-lg border border-slate-700 text-slate-300 group-hover:text-white transition">
                    <ExternalLink className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-slate-900/60 rounded-xl border border-slate-800">
          <History className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-300">No Analysis History Found</p>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Analyze emails using the main tab or pick example templates to start building your threat detection history.
          </p>
        </div>
      )}
    </div>
  );
};
