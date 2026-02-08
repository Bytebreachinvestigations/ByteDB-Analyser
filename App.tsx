
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import DatabaseSearch from './components/DatabaseSearch';
import ForensicCopilot from './components/ForensicCopilot';
import AnalysisDisplay from './components/AnalysisDisplay';
import EvidenceManager from './components/EvidenceManager';
import { AnalysisType, AnalysisResult, Evidence } from './types';
import { analyzeForensicData } from './services/geminiService';
import { generateReportHTML } from './services/reportService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'analysis' | 'evidence'>('analysis');
  const [selectedDb, setSelectedDb] = useState<string>('');
  const [analysisType, setAnalysisType] = useState<AnalysisType>(AnalysisType.FINANCIAL_FRAUD);
  const [description, setDescription] = useState<string>('');
  const [logSnippet, setLogSnippet] = useState<string>('');
  const [artifactHash, setArtifactHash] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Lifted state from EvidenceManager
  const [evidenceList, setEvidenceList] = useState<Evidence[]>([]);
  // Case metadata
  const [caseId] = useState<string>(`CASE-${crypto.randomUUID().substring(0, 8).toUpperCase()}`);
  const [createdAt] = useState<string>(new Date().toLocaleString());

  useEffect(() => {
    const generateHash = async () => {
      if (!logSnippet) {
        setArtifactHash('');
        return;
      }
      try {
        const msgBuffer = new TextEncoder().encode(logSnippet);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        setArtifactHash(hashHex);
      } catch (e) {
        console.error("Hash generation failed", e);
      }
    };
    generateHash();
  }, [logSnippet]);

  const handleStartAnalysis = async () => {
    if (!selectedDb || !logSnippet) return;
    
    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const analysis = await analyzeForensicData(selectedDb, analysisType, description, logSnippet, artifactHash);
      setResult(analysis);
    } catch (err) {
      setError("Forensic core failed to process data. Please verify inputs and API state.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleExportReport = () => {
    const htmlContent = generateReportHTML(
      caseId,
      {
        dbType: selectedDb || 'Not Specified',
        analysisType,
        description,
        createdAt
      },
      result,
      evidenceList
    );

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Forensic_Report_${caseId}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 lg:px-8 max-w-7xl">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          {/* Main Content Area */}
          <div className="xl:col-span-8 space-y-6">
            
            {/* Tab Navigation & Actions */}
            <div className="flex items-center justify-between border-b border-slate-800 px-2">
               <div className="flex items-center gap-6">
                 <button 
                    onClick={() => setActiveTab('analysis')}
                    className={`pb-4 text-sm font-bold uppercase tracking-wider transition-all border-b-2 ${
                      activeTab === 'analysis' 
                        ? 'border-sky-500 text-sky-400' 
                        : 'border-transparent text-slate-500 hover:text-slate-300'
                    }`}
                 >
                    <i className="fas fa-microscope mr-2"></i> Live Analysis
                 </button>
                 <button 
                    onClick={() => setActiveTab('evidence')}
                    className={`pb-4 text-sm font-bold uppercase tracking-wider transition-all border-b-2 ${
                      activeTab === 'evidence' 
                        ? 'border-sky-500 text-sky-400' 
                        : 'border-transparent text-slate-500 hover:text-slate-300'
                    }`}
                 >
                    <i className="fas fa-boxes-stacked mr-2"></i> Evidence Locker
                 </button>
               </div>
               
               <button 
                  onClick={handleExportReport}
                  className="mb-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded flex items-center gap-2 transition-colors shadow-sm"
                  title="Generate HTML/PDF Report"
               >
                  <i className="fas fa-file-export text-sky-500"></i> Export Case Report
               </button>
            </div>

            {activeTab === 'analysis' ? (
              <div className="space-y-8 animate-in slide-in-from-left-4 duration-300">
                <section className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 cyber-border">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                        <i className="fas fa-folder-plus text-xl"></i>
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">Create New Forensic Case</h2>
                        <p className="text-sm text-slate-500">Configure parameters for automated evidence analysis</p>
                      </div>
                    </div>
                    <div className="text-right hidden sm:block">
                        <div className="text-[10px] text-slate-500 font-mono uppercase">Reference ID</div>
                        <div className="text-xs font-mono text-sky-400">{caseId}</div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <DatabaseSearch onSelect={setSelectedDb} selectedDb={selectedDb} />
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Investigation Goal</label>
                        <select 
                          className="block w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                          value={analysisType}
                          onChange={(e) => setAnalysisType(e.target.value as AnalysisType)}
                        >
                          {Object.values(AnalysisType).map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Case Context / Background</label>
                      <textarea 
                        className="block w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 h-24 resize-none placeholder:text-slate-600"
                        placeholder="Provide details about the incident, suspect user IDs, or specific timeframes..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-slate-400">Database Artifacts / Log Snippets</label>
                        <span className="text-[10px] text-slate-600 font-mono uppercase">Paste SQL Dumps, Error Logs, or Transaction History</span>
                      </div>
                      <div className="relative">
                        <textarea 
                          className="block w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-emerald-400 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 h-64 resize-none shadow-inner"
                          placeholder="INSERT INTO users... | 2023-10-12T14:32:01.233Z - Unauthorized access... | DB_AUDIT: User 'admin' logged in from 192.168.1.1..."
                          value={logSnippet}
                          onChange={(e) => setLogSnippet(e.target.value)}
                        />
                        <div className="absolute top-2 right-2 flex gap-2">
                          <button className="p-1.5 text-slate-500 hover:text-white bg-slate-900/80 rounded border border-slate-800">
                              <i className="fas fa-file-upload"></i>
                          </button>
                        </div>
                      </div>
                      {artifactHash && (
                        <div className="flex items-center gap-2 mt-2 px-2 py-1 bg-slate-950/50 border border-slate-800 rounded w-fit">
                          <i className="fas fa-fingerprint text-sky-500 text-xs"></i>
                          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">SHA-256 Integrity:</span>
                          <code className="text-[10px] font-mono text-sky-400">{artifactHash}</code>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end pt-4">
                      <button 
                        className={`flex items-center gap-3 px-8 py-4 rounded-xl font-bold transition-all shadow-lg ${
                          !selectedDb || !logSnippet || isAnalyzing 
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700' 
                            : 'bg-sky-500 text-white hover:bg-sky-400 border border-sky-300/20 glow-sky'
                        }`}
                        disabled={!selectedDb || !logSnippet || isAnalyzing}
                        onClick={handleStartAnalysis}
                      >
                        {isAnalyzing ? (
                          <>
                            <i className="fas fa-circle-notch animate-spin"></i>
                            Running AI Forensics...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-bolt"></i>
                            Initiate Deep Analysis
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </section>

                {error && (
                  <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 p-4 rounded-xl flex items-center gap-3">
                    <i className="fas fa-triangle-exclamation"></i>
                    <span className="text-sm font-medium">{error}</span>
                  </div>
                )}

                {result && <AnalysisDisplay result={result} />}
              </div>
            ) : (
              <EvidenceManager evidenceList={evidenceList} setEvidenceList={setEvidenceList} />
            )}
          </div>

          {/* Sidebar / Copilot (Always visible) */}
          <div className="xl:col-span-4 space-y-8">
            <ForensicCopilot context={`Current Investigation (${caseId}): ${analysisType} on ${selectedDb || 'Unspecified Database'}. Description: ${description}`} />
            
            <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-slate-100 font-bold mb-4 flex items-center gap-2">
                <i className="fas fa-book-medical text-sky-500 text-sm"></i> Forensic Intel
              </h3>
              <div className="space-y-4">
                <div className="group cursor-help">
                  <h4 className="text-xs font-bold text-sky-400 uppercase tracking-tighter mb-1">Recent DB Breaches</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed group-hover:text-slate-400 transition-colors">
                    Check the Knowledge Base for the latest CVEs related to {selectedDb || 'PostgreSQL'} and common ${analysisType} patterns observed in 2024.
                  </p>
                </div>
                <div className="group cursor-help">
                  <h4 className="text-xs font-bold text-sky-400 uppercase tracking-tighter mb-1">Chain of Custody</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed group-hover:text-slate-400 transition-colors">
                    Ensure all artifacts pasted are hashed and time-stamped locally before proceeding with cloud-assisted processing.
                  </p>
                  {artifactHash && (
                     <div className="mt-2 text-[10px] font-mono text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20 break-all">
                        Active Checksum: {artifactHash.substring(0, 16)}...
                     </div>
                  )}
                </div>
                <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-600">ENCRYPTION: AES-256</span>
                  <i className="fas fa-lock text-slate-700 text-xs"></i>
                </div>
              </div>
            </section>
          </div>

        </div>
      </main>

      <footer className="border-t border-slate-900 py-6 mt-12 bg-slate-950/80">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
           <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center">
                 <i className="fas fa-microchip text-sky-500 text-[10px]"></i>
              </div>
              <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">Powered by Gemini Deep Reasoning</span>
           </div>
           <div className="flex gap-6">
              <a href="#" className="text-xs text-slate-600 hover:text-slate-300 transition-colors">Privacy Policy</a>
              <a href="#" className="text-xs text-slate-600 hover:text-slate-300 transition-colors">Protocol Docs</a>
              <a href="#" className="text-xs text-slate-600 hover:text-slate-300 transition-colors">API Status</a>
           </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
