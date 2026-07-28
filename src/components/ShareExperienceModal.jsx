import React, { useState } from 'react';
import { X, Briefcase, Plus, Trash2, Send, CheckCircle2, UserCheck, ShieldCheck } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';

export const ShareExperienceModal = ({ onClose }) => {
  const { placementCompanies, addInterviewExperience } = useData();
  const { currentUser } = useAuth();

  const [companyId, setCompanyId] = useState(placementCompanies[0]?.id || '');
  const [companyNameCustom, setCompanyNameCustom] = useState('');
  const [role, setRole] = useState('Software Engineering Intern');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [rounds, setRounds] = useState([
    { roundName: 'Round 1: Online Assessment', description: '' }
  ]);
  const [overallTips, setOverallTips] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleAddRound = () => {
    setRounds([...rounds, { roundName: `Round ${rounds.length + 1}`, description: '' }]);
  };

  const handleRemoveRound = (idx) => {
    setRounds(rounds.filter((_, i) => i !== idx));
  };

  const handleRoundChange = (idx, field, value) => {
    const updated = [...rounds];
    updated[idx][field] = value;
    setRounds(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const selComp = placementCompanies.find(c => c.id === companyId);
    const cName = selComp ? selComp.companyName : (companyNameCustom || 'Campus Placement Drive');

    addInterviewExperience({
      companyId: companyId || 'custom',
      companyName: cName,
      role,
      isAnonymous,
      studentName: isAnonymous ? 'Anonymous Student' : (currentUser?.name || 'Student'),
      rounds,
      overallTips
    });

    setIsSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="glass-panel w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-950 p-6 space-y-6 relative max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-brand-500/20 text-brand-300 border border-brand-500/40">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white">Share Interview Experience</h2>
              <p className="text-xs text-slate-400">Help junior students prepare for campus placement drives</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSubmitted ? (
          <div className="p-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
            <h3 className="text-base font-bold text-white">Submitted for Admin Approval!</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Thank you for sharing your drive experience. Your feedback will be visible publicly on the Placement Hub after an admin reviews it.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 text-xs">
            
            {/* Target Company & Role */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Company Drive</label>
                <select
                  value={companyId}
                  onChange={(e) => setCompanyId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 text-slate-100 rounded-xl border border-slate-800 focus:outline-none focus:border-brand-500"
                >
                  {placementCompanies.map(c => (
                    <option key={c.id} value={c.id}>{c.companyName}</option>
                  ))}
                  <option value="">Other / Off-Campus Drive</option>
                </select>
              </div>

              {!companyId && (
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Company Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Microsoft / Accenture"
                    value={companyNameCustom}
                    onChange={(e) => setCompanyNameCustom(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 text-slate-100 rounded-xl border border-slate-800 focus:outline-none focus:border-brand-500"
                  />
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-300 mb-1">Role Offered</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. System Engineer / Cloud Developer"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 text-slate-100 rounded-xl border border-slate-800 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            {/* Anonymous Toggle */}
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-brand-400" />
                <div>
                  <span className="font-bold text-slate-200 block text-xs">Post Anonymously</span>
                  <span className="text-[10px] text-slate-400">Hide your real name from public view</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-4 h-4 accent-brand-500 rounded cursor-pointer"
              />
            </div>

            {/* Selection Rounds Dynamic Form */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-200">Selection Rounds</label>
                <button
                  type="button"
                  onClick={handleAddRound}
                  className="px-3 py-1 rounded-xl bg-slate-900 text-brand-400 hover:text-brand-300 font-bold border border-slate-800 flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Round</span>
                </button>
              </div>

              {rounds.map((rnd, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2 relative">
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      required
                      placeholder="Round Title (e.g. Round 1: Coding & Aptitude)"
                      value={rnd.roundName}
                      onChange={(e) => handleRoundChange(idx, 'roundName', e.target.value)}
                      className="px-3 py-1.5 bg-slate-950 text-xs font-bold text-white rounded-xl border border-slate-800 w-3/4 focus:outline-none"
                    />
                    {rounds.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveRound(idx)}
                        className="text-rose-400 hover:text-rose-300 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <textarea
                    rows={2}
                    required
                    placeholder="Describe question types, topics asked, and difficulty..."
                    value={rnd.description}
                    onChange={(e) => handleRoundChange(idx, 'description', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 text-xs text-slate-300 rounded-xl border border-slate-800 focus:outline-none"
                  />
                </div>
              ))}
            </div>

            {/* Overall Tips */}
            <div>
              <label className="block font-bold text-slate-300 mb-1">Key Advice & Preparation Tips</label>
              <textarea
                rows={3}
                required
                placeholder="What topics should students focus on? Any HR or technical advice?"
                value={overallTips}
                onChange={(e) => setOverallTips(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 text-slate-100 rounded-xl border border-slate-800 focus:outline-none focus:border-brand-500"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-3 border-t border-slate-800 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl font-bold bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-600/30 flex items-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>Submit Experience</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
