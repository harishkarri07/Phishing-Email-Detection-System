import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { EmailAnalyzer } from './components/EmailAnalyzer';
import { AnalysisResultsView } from './components/AnalysisResultsView';
import { HistoryView } from './components/HistoryDrawer';
import { RulesInspector } from './components/RulesInspector';
import { analyzeEmail } from './utils/phishingEngine';
import { predictWithML } from './utils/mlClient';
import { AnalysisResult, HistoryItem, SensitivityLevel, MLResultData } from './types';
import { ShieldCheck, Sparkles } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'analyzer' | 'history' | 'rules'>('analyzer');
  const [sensitivity, setSensitivity] = useState<SensitivityLevel>('balanced');
  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const handleAnalyze = async (body: string, sender = '', subject = '') => {
    setIsLoading(true);

    // 1. Run rule-based analysis (synchronous client-side)
    const ruleResult = analyzeEmail(body, sender, subject, sensitivity);

    // 2. Run ML prediction (API call)
    let mlData: MLResultData | undefined = undefined;
    const fullText = `${subject} ${body}`;

    try {
      const mlRes = await predictWithML(fullText);
      mlData = {
        classification: mlRes.classification,
        confidence: mlRes.confidence,
        top_features: mlRes.top_features,
        engine: mlRes.engine || 'Multinomial Naive Bayes (TF-IDF)',
      };
    } catch (err: any) {
      mlData = {
        classification: 'phishing',
        confidence: 0,
        top_features: [],
        error: err.message || 'ML prediction service is currently unreachable.',
      };
    }

    const finalResult: AnalysisResult = {
      ...ruleResult,
      mlResult: mlData,
    };

    setCurrentResult(finalResult);
    setIsLoading(false);

    // Add to session history
    const newItem: HistoryItem = {
      id: `analysis-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sender,
      subject: subject || (body.slice(0, 40) + '...'),
      snippet: body.slice(0, 100) + '...',
      result: finalResult,
    };

    setHistory((prev) => [newItem, ...prev]);
  };

  const handleSelectHistory = (item: HistoryItem) => {
    setCurrentResult(item.result);
    setActiveTab('analyzer');
  };

  const handleClearHistory = () => {
    setHistory([]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-500/30 selection:text-blue-200">
      {/* Top Navbar */}
      <Navbar
        sensitivity={sensitivity}
        onSensitivityChange={(lvl) => setSensitivity(lvl)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        historyCount={history.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {activeTab === 'analyzer' && (
          <div className="space-y-8">
            {/* Analyzer Input Form */}
            <EmailAnalyzer onAnalyze={handleAnalyze} isLoading={isLoading} />

            {/* Analysis Output Section */}
            {currentResult ? (
              <AnalysisResultsView result={currentResult} />
            ) : (
              <div className="text-center py-12 px-4 rounded-2xl bg-slate-900/40 border border-slate-800/80">
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-2xl w-fit mx-auto mb-3">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-slate-200">Ready to Analyze Email Content</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  Paste raw email body text or select one of the quick test examples above to run dual Rule-Based & ML Naive Bayes threat detection.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <HistoryView
            history={history}
            onSelectHistory={handleSelectHistory}
            onClearHistory={handleClearHistory}
          />
        )}

        {activeTab === 'rules' && <RulesInspector />}
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>Phishing Email Detection System &bull; Dual Engine (Rule-Based & ML Multinomial Naive Bayes)</p>
          <div className="flex items-center gap-1.5 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>AI Studio Cloud Container Runtime</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
