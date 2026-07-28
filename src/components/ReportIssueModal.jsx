import React, { useState } from 'react';
import { X, Flag, AlertTriangle, Check } from 'lucide-react';
import { useData } from '../context/DataContext';

export const ReportIssueModal = ({ material, onClose }) => {
  const { addReport } = useData();
  const [submitted, setSubmitted] = useState(false);

  const [issueType, setIssueType] = useState('broken link');
  const [note, setNote] = useState('');

  if (!material) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    addReport({
      materialId: material.id,
      materialTitle: material.title,
      issueType,
      note
    });

    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-md bg-slate-900 rounded-3xl border border-slate-700/80 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
              <Flag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Report Resource Issue</h3>
              <p className="text-xs text-slate-400 truncate max-w-[220px]">{material.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        {submitted ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/30">
              <Check className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white">Issue Reported</h4>
            <p className="text-xs text-slate-400">
              Thank you! The admin team will review and resolve this issue.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Issue Category *</label>
              <select
                value={issueType}
                onChange={(e) => setIssueType(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800 text-sm text-slate-100 rounded-xl border border-slate-700 focus:outline-none focus:border-rose-500"
              >
                <option value="broken link">Broken Link / Download Fails</option>
                <option value="wrong file">Wrong File / Incorrect Content</option>
                <option value="outdated">Outdated / Old Syllabus</option>
                <option value="wrong subject">Wrong Subject / Semester Tag</option>
                <option value="duplicate">Duplicate Material Entry</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Additional Notes / Description (Optional)</label>
              <textarea
                rows="3"
                placeholder="Describe what is wrong with this document..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800 text-sm text-slate-100 rounded-xl border border-slate-700 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center space-x-2 px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 transition-all"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Submit Report</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
