import React from 'react';
import { X, History, RotateCcw, Calendar, User, FileText, CheckCircle2 } from 'lucide-react';
import { useData } from '../context/DataContext';

export const VersionHistoryModal = ({ type, item, onClose }) => {
  const { restoreDocumentVersion } = useData();

  if (!item) return null;

  const versionHistory = item.versionHistory || [];
  const currentTitle = item.title || item.name || `${item.year} - ${item.classSection} Timetable`;

  const handleRestore = (verId) => {
    if (window.confirm('Are you sure you want to restore this document to this past version?')) {
      restoreDocumentVersion(type, item.id, verId);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 rounded-3xl border border-slate-700/80 shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <span>Version History</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700 capitalize">
                  {type}
                </span>
              </h3>
              <p className="text-xs text-slate-400 truncate max-w-md">{currentTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of Versions */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          
          {/* Current Version Banner */}
          <div className="p-4 rounded-2xl bg-brand-500/10 border border-brand-500/30 flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-500/30 text-brand-300 border border-brand-500/40 uppercase">
                  Current Version (Active)
                </span>
                <span className="text-xs text-slate-400">Updated: {item.updatedDate || item.uploadDate || 'Recent'}</span>
              </div>
              <p className="text-xs font-semibold text-white">{currentTitle}</p>
              {item.fileUrl && (
                <p className="text-[11px] text-slate-400 truncate max-w-md font-mono">File: {item.fileName || item.fileUrl}</p>
              )}
            </div>
            <CheckCircle2 className="w-5 h-5 text-brand-400 flex-shrink-0" />
          </div>

          {/* Past History List */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Previous Saved Revisions ({versionHistory.length})</h4>

            {versionHistory.length === 0 ? (
              <div className="p-8 text-center glass-panel rounded-2xl space-y-2">
                <History className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400">No previous version history recorded for this item yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {versionHistory.map((ver, idx) => {
                  const snap = ver.snapshot || {};
                  return (
                    <div
                      key={ver.id}
                      className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3 transition-all hover:border-slate-700"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-300 font-bold text-xs flex items-center justify-center">
                            v{ver.versionNumber || (versionHistory.length - idx)}
                          </span>
                          <span className="text-xs font-semibold text-white flex items-center">
                            <Calendar className="w-3.5 h-3.5 mr-1 text-slate-500" />
                            {new Date(ver.updatedAt).toLocaleString()}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] text-slate-400 flex items-center bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                            <User className="w-3 h-3 mr-1 text-slate-500" />
                            {ver.updatedBy}
                          </span>
                          <button
                            onClick={() => handleRestore(ver.id)}
                            className="px-3 py-1 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center space-x-1 shadow-md transition-all"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Restore</span>
                          </button>
                        </div>
                      </div>

                      {/* Note & Snapshot Summary */}
                      <div className="text-xs text-slate-300 space-y-1 bg-slate-900/60 p-3 rounded-xl border border-slate-800/60">
                        <p className="font-semibold text-indigo-300">Change note: <span className="text-slate-200 font-normal">{ver.changeNote || 'Document edited'}</span></p>
                        {snap.title && <p className="text-slate-400">Title: <span className="text-white">{snap.title}</span></p>}
                        {snap.fileUrl && <p className="text-slate-400 truncate">File: <span className="text-white font-mono text-[11px]">{snap.fileName || snap.fileUrl}</span></p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
