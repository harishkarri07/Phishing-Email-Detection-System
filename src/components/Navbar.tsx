import React from 'react';
import { ShieldAlert, ShieldCheck, Settings, History, BookOpen, Sparkles } from 'lucide-react';
import { SensitivityLevel } from '../types';

interface NavbarProps {
  sensitivity: SensitivityLevel;
  onSensitivityChange: (level: SensitivityLevel) => void;
  activeTab: 'analyzer' | 'history' | 'rules';
  setActiveTab: (tab: 'analyzer' | 'history' | 'rules') => void;
  historyCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  sensitivity,
  onSensitivityChange,
  activeTab,
  setActiveTab,
  historyCount
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-600/20 border border-blue-500/30 rounded-xl text-blue-400 shadow-lg shadow-blue-500/10">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-tight">Phishing Email Detector</h1>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                ML & Rule Engine
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">Real-time email security & threat intelligence classifier</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
          <button
            onClick={() => setActiveTab('analyzer')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'analyzer'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Analyzer</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'history'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>History</span>
            {historyCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 bg-blue-900 text-blue-200 text-[10px] rounded-full border border-blue-700">
                {historyCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('rules')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'rules'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Rule Engine</span>
          </button>
        </div>

        {/* Sensitivity Selector */}
        <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-800">
          <Settings className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-medium text-slate-300">Sensitivity:</span>
          <select
            value={sensitivity}
            onChange={(e) => onSensitivityChange(e.target.value as SensitivityLevel)}
            className="bg-transparent text-blue-400 font-semibold focus:outline-none cursor-pointer"
          >
            <option value="balanced" className="bg-slate-900 text-slate-100">Balanced (Default)</option>
            <option value="strict" className="bg-slate-900 text-slate-100">Strict High-Guard</option>
            <option value="relaxed" className="bg-slate-900 text-slate-100">Relaxed Standard</option>
          </select>
        </div>
      </div>
    </header>
  );
};
