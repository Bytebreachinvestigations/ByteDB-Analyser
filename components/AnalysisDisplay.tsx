
import React from 'react';
import { AnalysisResult } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
  result: AnalysisResult;
}

const AnalysisDisplay: React.FC<Props> = ({ result }) => {
  // Mock timeline data for visual appeal based on findings
  const chartData = [
    { time: '0h', risk: 10 },
    { time: '2h', risk: 15 },
    { time: '4h', risk: result.riskScore * 0.4 },
    { time: '6h', risk: result.riskScore * 0.8 },
    { time: '8h', risk: result.riskScore },
    { time: '10h', risk: result.riskScore * 0.9 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Risk Score Widget */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 to-transparent"></div>
          <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">Risk Probability</h3>
          <div className="relative">
             <svg className="w-32 h-32 transform -rotate-90">
                <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-800" />
                <circle 
                  cx="64" 
                  cy="64" 
                  r="58" 
                  stroke="currentColor" 
                  strokeWidth="8" 
                  fill="transparent" 
                  strokeDasharray={364.4}
                  strokeDashoffset={364.4 - (364.4 * result.riskScore / 100)}
                  className={result.riskScore > 75 ? "text-rose-500" : result.riskScore > 40 ? "text-amber-500" : "text-emerald-500"}
                  strokeLinecap="round"
                />
             </svg>
             <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-3xl font-bold text-white">{result.riskScore}%</span>
                <span className="text-[10px] text-slate-500 font-mono">CRITICALITY</span>
             </div>
          </div>
        </div>

        {/* Risk Trend Chart */}
        <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">Threat Intensity Timeline</h3>
          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="time" stroke="#475569" fontSize={10} />
                <YAxis stroke="#475569" fontSize={10} hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                  itemStyle={{ color: '#0ea5e9', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="risk" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorRisk)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Executive Summary */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <h3 className="text-slate-100 font-bold mb-4 flex items-center gap-2">
            <i className="fas fa-file-invoice text-sky-500"></i> Analysis Summary
          </h3>
          <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-line">
            {result.summary}
          </p>

          <div className="mt-6 space-y-4">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Suggested Triage Actions</h4>
            <div className="space-y-2">
              {result.suggestedQueries.map((q, idx) => (
                <div key={idx} className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-start gap-3 group">
                   <div className="mt-1 w-5 h-5 rounded bg-sky-500/10 flex items-center justify-center text-sky-500 text-[10px] font-bold">
                     {idx + 1}
                   </div>
                   <code className="text-xs text-sky-400 font-mono break-all">{q}</code>
                   <button className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-white">
                    <i className="fas fa-copy"></i>
                   </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Detailed Findings */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <h3 className="text-slate-100 font-bold mb-4 flex items-center gap-2">
            <i className="fas fa-magnifying-glass-chart text-sky-500"></i> Evidence Findings
          </h3>
          <div className="space-y-3">
            {result.findings.map((f, i) => (
              <div key={i} className="bg-slate-950 p-4 rounded-xl border-l-4 border-slate-800 flex flex-col gap-1 transition-all hover:translate-x-1"
                style={{ borderLeftColor: f.severity === 'Critical' ? '#f43f5e' : f.severity === 'High' ? '#f59e0b' : '#38bdf8' }}>
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                    f.severity === 'Critical' ? 'bg-rose-500/10 text-rose-500' : 
                    f.severity === 'High' ? 'bg-amber-500/10 text-amber-500' : 'bg-sky-500/10 text-sky-500'
                  }`}>
                    {f.severity}
                  </span>
                  {f.timestamp && <span className="text-[10px] font-mono text-slate-600">{f.timestamp}</span>}
                </div>
                <h4 className="text-sm font-semibold text-slate-200">{f.description}</h4>
                <p className="text-xs text-slate-500 mt-1"><span className="text-slate-400 font-medium">Impact:</span> {f.impact}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisDisplay;
