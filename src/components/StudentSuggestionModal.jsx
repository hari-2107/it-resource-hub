import React, { useState } from 'react';
import { X, Lightbulb, Send, Check } from 'lucide-react';
import { useData } from '../context/DataContext';
import { YEAR_SEMESTERS } from '../data/mockData';

export const StudentSuggestionModal = ({ onClose }) => {
  const { addSuggestion } = useData();
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    type: 'material',
    title: '',
    year: '3rd Year',
    semester: 5,
    description: '',
    link: ''
  });

  const handleYearChange = (yr) => {
    if (yr === 'All Years') {
      setForm(prev => ({ ...prev, year: yr, semester: 'All Semesters' }));
    } else {
      const sems = YEAR_SEMESTERS[yr] || [1, 2];
      setForm(prev => ({ ...prev, year: yr, semester: sems[0] }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) return;

    addSuggestion(form);
    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 rounded-3xl border border-slate-700/80 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Suggest a Resource</h3>
              <p className="text-xs text-slate-400">Recommend notes, tools, or subjects for the IT Hub</p>
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
            <h4 className="text-base font-bold text-white">Suggestion Submitted!</h4>
            <p className="text-xs text-slate-400">
              Thank you for contributing! The IT Department admin will review your recommendation for <strong>{form.year}{form.semester !== 'All Semesters' ? `, Semester ${form.semester}` : ''}</strong> soon.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            
            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Resource Category *</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-800 text-sm text-slate-100 rounded-xl border border-slate-700 focus:outline-none focus:border-brand-500"
              >
                <option value="material">Study Material / Notes / PYQ</option>
                <option value="subject">New Elective / Core Subject</option>
                <option value="aiTool">Useful AI Tool</option>
                <option value="website">External Learning Website / Portal</option>
              </select>
            </div>

            {/* Target Academic Year & Semester Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Academic Year *</label>
                <select
                  value={form.year}
                  onChange={(e) => handleYearChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-800 text-sm text-slate-100 rounded-xl border border-slate-700 focus:outline-none focus:border-brand-500"
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                  <option value="All Years">All Years (General)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Semester *</label>
                <select
                  value={form.semester}
                  onChange={(e) => setForm({ ...form, semester: e.target.value === 'All Semesters' ? 'All Semesters' : Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 bg-slate-800 text-sm text-slate-100 rounded-xl border border-slate-700 focus:outline-none focus:border-brand-500"
                >
                  {form.year === 'All Years' ? (
                    <option value="All Semesters">All Semesters</option>
                  ) : (
                    (YEAR_SEMESTERS[form.year] || [1, 2]).map(s => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))
                  )}
                </select>
              </div>
            </div>

            {/* Title / Resource Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Title / Resource Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Cloud Computing Unit 4 AWS Architecture Notes"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-800 text-sm text-slate-100 rounded-xl border border-slate-700 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Description / Details *</label>
              <textarea
                rows="3"
                required
                placeholder="Briefly explain what this resource contains and how it helps students..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-800 text-sm text-slate-100 rounded-xl border border-slate-700 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Drive or Web Link (Optional)</label>
              <input
                type="url"
                placeholder="https://..."
                value={form.link}
                onChange={(e) => setForm({ ...form, link: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-800 text-sm text-slate-100 rounded-xl border border-slate-700 focus:outline-none focus:border-brand-500"
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
                className="flex items-center space-x-2 px-5 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/30 transition-all"
              >
                <Send className="w-4 h-4" />
                <span>Submit Suggestion</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
