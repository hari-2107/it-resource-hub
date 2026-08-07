import React from 'react';
import { Download, X, FileText, CheckCircle2, ShieldCheck, User } from 'lucide-react';

export const ExportPreviewModal = ({ isOpen, onClose, onConfirm, exportDetails }) => {
  if (!isOpen || !exportDetails) return null;

  const { title, format, pageCount, user, userCount } = exportDetails;

  const getFormatBadge = (fmt) => {
    if (fmt === 'pdf') return { label: '📄 PDF Document (.pdf)', color: 'bg-purple-500/20 text-purple-300 border-purple-500/40' };
    if (fmt === 'word') return { label: '📝 Word Document (.doc)', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' };
    return { label: '📊 Excel / CSV Spreadsheet (.csv)', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
  };

  const badge = getFormatBadge(format);

  return (
    <div className="fixed inset-0 z-[120] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden space-y-0">
        
        {/* Header */}
        <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Pre-Download Export Preview</h3>
              <p className="text-xs text-slate-400">Review document structure before saving file to device</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          
          {/* Metadata Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Export Target</span>
              <p className="font-extrabold text-white truncate">{user ? user.name : title}</p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Target ID / Count</span>
              <p className="font-extrabold text-cyan-300 truncate">{user ? (user.registerNumber || user.email || 'User Data') : `${userCount || 1} Accounts`}</p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Selected Format</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border inline-block ${badge.color}`}>
                {format.toUpperCase()}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Estimated Pages</span>
              <p className="font-extrabold text-amber-300">{pageCount || 2} Pages</p>
            </div>
          </div>

          {/* Document Content Live Snapshot Box */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Document Structure Preview</label>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 max-h-56 overflow-y-auto font-sans text-xs text-slate-300 space-y-3 scrollbar-thin">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="font-bold text-cyan-300">IT Student Resource Hub Official Export</span>
                <span className="text-[10px] text-slate-500">{new Date().toLocaleDateString()}</span>
              </div>

              {user ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-white font-extrabold text-sm">
                    <User className="w-4 h-4 text-cyan-400" />
                    <span>{user.name}</span>
                    <span className="text-xs text-slate-400 font-mono">({user.registerNumber || 'Reg: N/A'})</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                    <div>• Role: <strong className="text-white">{(user.role || 'student').toUpperCase()}</strong></div>
                    <div>• Section: <strong className="text-white">{user.classSection || 'IT-A'}</strong></div>
                    <div>• BrainZone XP: <strong className="text-amber-300">{user.funPoints ?? user.xp ?? 0} XP</strong></div>
                    <div>• Streak: <strong className="text-rose-300">🔥 {user.loginStreak || user.streak || 1} Days</strong></div>
                  </div>
                  <p className="text-[11px] text-slate-400 italic pt-1">
                    ✓ Includes full Personal Details, Academic SGPA/CGPA, BrainZone Statistics, Social Links, Activity Summary, and Timeline History.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="font-bold text-emerald-300 text-sm">{title}</div>
                  <p className="text-[11px] text-slate-400">
                    Generating structured report for {userCount || 1} selected user records with complete registration and engagement metadata.
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-5 bg-slate-950 border-t border-slate-800 flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold transition-all border border-slate-800"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-extrabold flex items-center space-x-2 shadow-lg shadow-cyan-600/30 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download {format.toUpperCase()} File</span>
          </button>
        </div>

      </div>
    </div>
  );
};
