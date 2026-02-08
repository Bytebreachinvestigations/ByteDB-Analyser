import React, { useState, useEffect } from 'react';
import { CaseRecord } from '../services/caseService';

interface Props {
  cases: CaseRecord[];
  onSelectCase: (caseId: string) => void;
  onCreateCase: (title: string, description: string) => Promise<void>;
  onDeleteCase: (caseId: string) => Promise<void>;
}

const CaseManager: React.FC<Props> = ({ cases, onSelectCase, onCreateCase, onDeleteCase }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCase, setNewCase] = useState({
    title: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);

  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCase.title) return;

    setLoading(true);
    try {
      await onCreateCase(newCase.title, newCase.description);
      setNewCase({ title: '', description: '' });
      setShowCreateForm(false);
    } catch (error) {
      console.error('Failed to create case:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (riskScore: number) => {
    if (riskScore >= 80) return 'bg-red-900 text-red-100';
    if (riskScore >= 60) return 'bg-orange-900 text-orange-100';
    if (riskScore >= 40) return 'bg-yellow-900 text-yellow-100';
    return 'bg-green-900 text-green-100';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-900 text-blue-100';
      case 'closed':
        return 'bg-gray-700 text-gray-100';
      case 'archived':
        return 'bg-slate-700 text-slate-100';
      default:
        return 'bg-slate-700 text-slate-300';
    }
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl shadow-xl">
      <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <i className="fas fa-folder-open text-blue-500 text-lg"></i>
          <h3 className="text-lg font-bold text-slate-200 uppercase tracking-wider">Case Management</h3>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded text-sm font-semibold transition"
        >
          <i className="fas fa-plus mr-1"></i>New Case
        </button>
      </div>

      {/* Create Case Form */}
      {showCreateForm && (
        <div className="p-6 bg-slate-900 border-b border-slate-800">
          <form onSubmit={handleCreateCase} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Case Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={newCase.title}
                onChange={(e) => setNewCase(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Financial Fraud Investigation 2024"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Description</label>
              <textarea
                value={newCase.description}
                onChange={(e) => setNewCase(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Case background and investigation objectives..."
                rows={3}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="bg-slate-700 hover:bg-slate-600 text-slate-100 px-4 py-2 rounded font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !newCase.title}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white px-4 py-2 rounded font-semibold transition"
              >
                {loading ? 'Creating...' : 'Create Case'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Cases List */}
      <div className="overflow-x-auto">
        {cases.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-slate-400 mb-4">No cases yet. Create one to get started.</p>
            <button
              onClick={() => setShowCreateCase(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded font-semibold transition"
            >
              <i className="fas fa-plus mr-2"></i>Create First Case
            </button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900">
                <th className="px-6 py-3 text-left font-semibold text-slate-300">Case ID</th>
                <th className="px-6 py-3 text-left font-semibold text-slate-300">Title</th>
                <th className="px-6 py-3 text-left font-semibold text-slate-300">Status</th>
                <th className="px-6 py-3 text-left font-semibold text-slate-300">Risk Score</th>
                <th className="px-6 py-3 text-left font-semibold text-slate-300">Evidence</th>
                <th className="px-6 py-3 text-left font-semibold text-slate-300">Created</th>
                <th className="px-6 py-3 text-right font-semibold text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {cases.map((caseRecord) => (
                <tr
                  key={caseRecord.id}
                  className="border-b border-slate-800 hover:bg-slate-900 transition cursor-pointer"
                  onClick={() => onSelectCase(caseRecord.id)}
                >
                  <td className="px-6 py-4 text-slate-100 font-mono text-xs">{caseRecord.id}</td>
                  <td className="px-6 py-4 text-slate-100 font-medium">{caseRecord.title}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded text-xs font-semibold ${getStatusBadge(caseRecord.status)}`}>
                      {caseRecord.status.charAt(0).toUpperCase() + caseRecord.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded text-xs font-bold ${getRiskColor(caseRecord.riskScore)}`}>
                      {caseRecord.riskScore}/100
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-300">{caseRecord.evidenceCount} items</td>
                  <td className="px-6 py-4 text-slate-400 text-xs">
                    {new Date(caseRecord.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onDeleteCase(caseRecord.id)}
                      className="text-red-400 hover:text-red-300 p-2 transition"
                      title="Delete case"
                    >
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default CaseManager;
