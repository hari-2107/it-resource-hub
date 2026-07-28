import React, { useState, useEffect } from 'react';
import { X, Lightbulb, Flag, History, Check, ShieldAlert, Trash2, Edit2, ExternalLink, CheckCircle2, XCircle, ArrowRight, Calendar, Plus, Archive, CheckCircle, FileText, GraduationCap, BookOpen, Users, Search, BarChart3, Sparkles, Megaphone, Image as ImageIcon } from 'lucide-react';
import { useData } from '../context/DataContext';
import { BroadcastOverlay } from './BroadcastOverlay';

export const AdminManagementModal = ({ initialTab = 'suggestions', onClose, onOpenAdminForm, onOpenVersionHistory }) => {
  const { 
    suggestions, 
    reports, 
    allMaterials, 
    interviewExperiences,
    timetables,
    subjects,
    registeredUsers,
    broadcasts,
    addBroadcast,
    updateBroadcast,
    deleteBroadcast,
    removeRegisteredUser,
    addOrUpdateSubject,
    removeSubject,
    removeTimetable,
    toggleTimetableStatus,
    updateSuggestionStatus, 
    deleteSuggestion, 
    updateReportStatus, 
    deleteReport, 
    removeMaterial,
    updateMaterialStatus,
    updateInterviewExperienceStatus,
    removeInterviewExperience
  } = useData();
  const [activeTab, setActiveTab] = useState(initialTab || 'suggestions');

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);
  const [timetableFilter, setTimetableFilter] = useState('All'); // 'All' | 'class' | 'internal' | 'semester'
  const [subjectSemFilter, setSubjectSemFilter] = useState(5);
  const [isEditingSubject, setIsEditingSubject] = useState(false);
  const [editingSubjectForm, setEditingSubjectForm] = useState({ id: '', name: '', code: '', year: '3rd Year', semester: 5, type: 'Theory' });
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('All');

  // Broadcast state
  const [isCreatingBroadcast, setIsCreatingBroadcast] = useState(false);
  const [editingBroadcast, setEditingBroadcast] = useState(null);
  const [previewBroadcast, setPreviewBroadcast] = useState(null);
  const [broadcastForm, setBroadcastForm] = useState({
    id: '',
    title: '',
    message: '',
    bannerImageUrl: '',
    linkUrl: '',
    linkLabel: 'Register Now 🚀',
    isSkippable: true,
    autoCloseSeconds: 5,
    isFestivalMode: true,
    animationType: 'confetti',
    isActive: true
  });

  const handleBroadcastImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setBroadcastForm(prev => ({
        ...prev,
        bannerImageUrl: reader.result
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSaveBroadcast = (e) => {
    e.preventDefault();
    if (!broadcastForm.title.trim() || !broadcastForm.message.trim()) return;

    if (editingBroadcast) {
      updateBroadcast(editingBroadcast.id, broadcastForm);
    } else {
      addBroadcast(broadcastForm);
    }
    setIsCreatingBroadcast(false);
    setEditingBroadcast(null);
  };

  const pendingSuggestionsCount = (suggestions || []).filter(s => s.status === 'pending').length;
  const openReportsCount = (reports || []).filter(r => r.status === 'open').length;
  const pendingNotes = (allMaterials || []).filter(m => m.status === 'pending');
  const pendingExps = (interviewExperiences || []).filter(e => !e.approved);

  const handleApproveAndCreate = (sug) => {
    updateSuggestionStatus(sug.id, 'approved');
    if (onOpenAdminForm) {
      if (sug.type === 'material') {
        onOpenAdminForm('material', {
          title: sug.title,
          description: sug.description,
          fileUrl: sug.link || 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf',
          category: 'Notes'
        });
      } else if (sug.type === 'aiTool') {
        onOpenAdminForm('aitool', {
          name: sug.title,
          description: sug.description,
          websiteUrl: sug.link || 'https://',
          category: 'Coding'
        });
      } else {
        onOpenAdminForm('material', {
          title: sug.title,
          description: sug.description,
          fileUrl: sug.link || '',
          category: 'Notes'
        });
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-4xl bg-slate-900 rounded-3xl border border-slate-700/80 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Admin Management Center</h3>
              <p className="text-xs text-slate-400">Manage suggestions, reported issues, peer notes, & interview experiences</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection Navigation */}
        <div className="flex items-center px-6 pt-3 border-b border-slate-800 bg-slate-950/40 space-x-2 overflow-x-auto scrollbar-none">
          
          <button
            onClick={() => setActiveTab('suggestions')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-2xl font-bold text-xs border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'suggestions'
                ? 'border-amber-400 text-amber-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <span>Suggestions</span>
            {pendingSuggestionsCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-slate-950 shadow">
                {pendingSuggestionsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('pendingNotes')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-2xl font-bold text-xs border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'pendingNotes'
                ? 'border-purple-400 text-purple-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-purple-400" />
            <span>Pending Notes</span>
            {pendingNotes.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-500 text-white shadow">
                {pendingNotes.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('pendingExps')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-2xl font-bold text-xs border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'pendingExps'
                ? 'border-brand-400 text-brand-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-brand-400" />
            <span>Interview Experiences</span>
            {pendingExps.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-brand-500 text-white shadow">
                {pendingExps.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-2xl font-bold text-xs border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'reports'
                ? 'border-rose-500 text-rose-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Flag className="w-4 h-4 text-rose-400" />
            <span>Reported Issues</span>
            {openReportsCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500 text-white shadow">
                {openReportsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-2xl font-bold text-xs border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'audit'
                ? 'border-indigo-400 text-indigo-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <History className="w-4 h-4 text-indigo-400" />
            <span>Document Versions</span>
          </button>

          <button
            onClick={() => setActiveTab('timetables')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-2xl font-bold text-xs border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'timetables'
                ? 'border-emerald-400 text-emerald-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span>Timetables Management</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              {(timetables || []).length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('subjects')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-2xl font-bold text-xs border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'subjects'
                ? 'border-brand-400 text-brand-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4 text-brand-400" />
            <span>Subject Catalog</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-brand-500/20 text-brand-300 border border-brand-500/40">
              {(subjects || []).length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-2xl font-bold text-xs border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'users'
                ? 'border-cyan-400 text-cyan-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4 text-cyan-400" />
            <span>User Directory & Analytics</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              {(registeredUsers || []).length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('broadcasts')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-2xl font-bold text-xs border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'broadcasts'
                ? 'border-rose-400 text-rose-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4 text-rose-400" />
            <span>Broadcasts</span>
            {(broadcasts || []).length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500 text-white shadow">
                {broadcasts.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          
          {/* TAB 1: SUGGESTIONS */}
          {activeTab === 'suggestions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400">
                  Students can recommend notes, AI tools, or subjects. Approve suggestions to quickly publish them!
                </p>
                <span className="text-xs font-bold text-slate-300">Total: {suggestions.length}</span>
              </div>

              {suggestions.length === 0 ? (
                <div className="p-12 text-center glass-panel rounded-3xl space-y-2">
                  <Lightbulb className="w-10 h-10 text-slate-600 mx-auto" />
                  <p className="text-sm font-semibold text-white">No suggestions submitted yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {suggestions.map((sug) => {
                    const isPending = sug.status === 'pending';
                    const isApproved = sug.status === 'approved';

                    return (
                      <div
                        key={sug.id}
                        className={`p-5 rounded-2xl border space-y-3 transition-all ${
                          isPending
                            ? 'bg-slate-900 border-amber-500/40 shadow-lg shadow-amber-500/5'
                            : isApproved
                            ? 'bg-slate-950/60 border-emerald-500/30 opacity-80'
                            : 'bg-slate-950/40 border-slate-800 opacity-60'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                {sug.type}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                                isPending
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                  : isApproved
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                  : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                              }`}>
                                {sug.status}
                              </span>
                              <span className="text-[11px] text-slate-400">By {sug.userName || sug.userEmail} on {sug.submittedAt}</span>
                            </div>
                            <h4 className="text-sm font-bold text-white">{sug.title}</h4>
                            <p className="text-xs text-slate-300">{sug.description}</p>
                            {sug.link && (
                              <a
                                href={sug.link}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[11px] text-brand-400 hover:underline flex items-center pt-1"
                              >
                                <ExternalLink className="w-3 h-3 mr-1" />
                                <span>{sug.link}</span>
                              </a>
                            )}
                          </div>

                          <div className="flex flex-col sm:flex-row items-end sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 flex-shrink-0">
                            {isPending && (
                              <>
                                <button
                                  onClick={() => handleApproveAndCreate(sug)}
                                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center space-x-1 shadow-md shadow-emerald-600/20"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Approve & Create</span>
                                </button>
                                <button
                                  onClick={() => updateSuggestionStatus(sug.id, 'rejected')}
                                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-rose-500/20 text-rose-300 border border-slate-700 hover:border-rose-500/40"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => deleteSuggestion(sug.id)}
                              className="p-1.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-slate-800"
                              title="Delete Suggestion"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB: PENDING PEER NOTES */}
          {activeTab === 'pendingNotes' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400">
                  Student-submitted peer notes waiting for admin verification before publishing publicly.
                </p>
                <span className="text-xs font-bold text-slate-300">Pending: {pendingNotes.length}</span>
              </div>

              {pendingNotes.length === 0 ? (
                <div className="p-12 text-center glass-panel rounded-3xl space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                  <p className="text-sm font-semibold text-white">No pending peer notes to review!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {pendingNotes.map((note) => (
                    <div key={note.id} className="p-5 rounded-2xl bg-slate-900 border border-purple-500/40 space-y-3 shadow-lg">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
                              Peer Notes
                            </span>
                            <span className="text-[11px] text-slate-400">Submitted by {note.uploadedBy || 'Student'}</span>
                          </div>
                          <h4 className="text-sm font-bold text-white">{note.title}</h4>
                          <p className="text-xs text-slate-400">{note.subjectName} ({note.year} • Sem {note.semester})</p>
                          {note.description && <p className="text-xs text-slate-300 leading-relaxed pt-1">{note.description}</p>}
                        </div>

                        <div className="flex items-center space-x-2 flex-shrink-0">
                          <button
                            onClick={() => updateMaterialStatus(note.id, 'approved')}
                            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center space-x-1 shadow-md"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve & Publish</span>
                          </button>
                          <button
                            onClick={() => removeMaterial(note.id)}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: PENDING INTERVIEW EXPERIENCES */}
          {activeTab === 'pendingExps' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400">
                  Student interview drive experiences waiting for approval before showing on Placement Hub.
                </p>
                <span className="text-xs font-bold text-slate-300">Pending: {pendingExps.length}</span>
              </div>

              {pendingExps.length === 0 ? (
                <div className="p-12 text-center glass-panel rounded-3xl space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                  <p className="text-sm font-semibold text-white">No pending interview experiences to review!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {pendingExps.map((exp) => (
                    <div key={exp.id} className="p-5 rounded-2xl bg-slate-900 border border-brand-500/40 space-y-3 shadow-lg">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-500/20 text-brand-300 border border-brand-500/30">
                              {exp.companyName}
                            </span>
                            <span className="text-[11px] text-slate-400">By {exp.studentName} ({exp.submittedAt})</span>
                          </div>
                          <h4 className="text-sm font-bold text-white">{exp.role}</h4>
                        </div>

                        <div className="flex items-center space-x-2 flex-shrink-0">
                          <button
                            onClick={() => updateInterviewExperienceStatus(exp.id, true)}
                            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center space-x-1 shadow-md"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => removeInterviewExperience(exp.id)}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30"
                          >
                            Reject
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1 text-xs">
                        {exp.rounds.map((r, i) => (
                          <div key={i} className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                            <span className="font-bold text-indigo-300 block">{r.roundName}</span>
                            <p className="text-slate-300 leading-normal">{r.description}</p>
                          </div>
                        ))}
                      </div>

                      {exp.overallTips && (
                        <p className="text-xs text-emerald-400 italic">💡 Tips: {exp.overallTips}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: REPORTED ISSUES */}
          {activeTab === 'reports' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400">
                  Issues reported by students regarding broken links, outdated files, or duplicate items.
                </p>
                <span className="text-xs font-bold text-slate-300">Total: {reports.length}</span>
              </div>

              {reports.length === 0 ? (
                <div className="p-12 text-center glass-panel rounded-3xl space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                  <p className="text-sm font-semibold text-white">No reported issues currently!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {reports.map((rep) => {
                    const isOpen = rep.status === 'open';
                    const targetMat = allMaterials.find(m => m.id === rep.materialId);

                    return (
                      <div
                        key={rep.id}
                        className={`p-5 rounded-2xl border space-y-3 transition-all ${
                          isOpen
                            ? 'bg-slate-900 border-rose-500/40 shadow-lg shadow-rose-500/5'
                            : 'bg-slate-950/60 border-slate-800 opacity-70'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                {rep.issueType}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                                isOpen
                                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              }`}>
                                {rep.status}
                              </span>
                              <span className="text-[11px] text-slate-400">Reported by {rep.userName || rep.userEmail} on {rep.reportedAt}</span>
                            </div>
                            <h4 className="text-sm font-bold text-white">Target Material: {rep.materialTitle}</h4>
                            {rep.note && <p className="text-xs text-slate-300 bg-slate-950 p-2.5 rounded-xl border border-slate-800">Note: {rep.note}</p>}
                          </div>

                          <div className="flex flex-col sm:flex-row items-end sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 flex-shrink-0">
                            {isOpen && (
                              <button
                                onClick={() => updateReportStatus(rep.id, 'resolved')}
                                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center space-x-1 shadow-md"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Mark Resolved</span>
                              </button>
                            )}

                            {targetMat && onOpenAdminForm && (
                              <button
                                onClick={() => onOpenAdminForm('material', targetMat)}
                                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 flex items-center space-x-1"
                              >
                                <Edit2 className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Edit Material</span>
                              </button>
                            )}

                            <button
                              onClick={() => deleteReport(rep.id)}
                              className="p-1.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-slate-800"
                              title="Delete Report"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: AUDIT LOG & VERSION HISTORY LIST */}
          {activeTab === 'audit' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Select any material below to inspect its full version history log and restore past revisions.
              </p>

              <div className="grid grid-cols-1 gap-3">
                {allMaterials.map((mat) => {
                  const historyCount = (mat.versionHistory || []).length;
                  return (
                    <div
                      key={mat.id}
                      className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-all"
                    >
                      <div>
                        <span className="text-[10px] font-bold text-brand-300 uppercase px-2 py-0.5 bg-brand-500/20 rounded border border-brand-500/30 mr-2">
                          {mat.category}
                        </span>
                        <span className="text-xs font-bold text-white">{mat.title}</span>
                        <p className="text-[11px] text-slate-400 mt-1">Last updated: {mat.updatedDate || mat.uploadDate} • Revisions logged: {historyCount}</p>
                      </div>

                      <button
                        onClick={() => {
                          onClose();
                          if (onOpenVersionHistory) onOpenVersionHistory('material', mat);
                        }}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center space-x-1 shadow-md"
                      >
                        <History className="w-3.5 h-3.5" />
                        <span>View History ({historyCount})</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 6: TIMETABLES MANAGEMENT */}
          {activeTab === 'timetables' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-emerald-400" />
                    <span>Manage Class & Examination Timetables</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Create, edit, activate, or archive Class, Internal Exam, and Semester Exam timetables for all academic batches.
                  </p>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    if (onOpenAdminForm) onOpenAdminForm('timetable');
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center space-x-2 shadow-lg shadow-emerald-600/20 self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Create New Timetable</span>
                </button>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
                {[
                  { id: 'All', label: 'All Timetables' },
                  { id: 'class', label: 'Class Schedules' },
                  { id: 'internal', label: 'Internal Exam Schedules' },
                  { id: 'semester', label: 'Semester Exam Schedules' }
                ].map(typeTab => (
                  <button
                    key={typeTab.id}
                    onClick={() => setTimetableFilter(typeTab.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      timetableFilter === typeTab.id
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {typeTab.label}
                  </button>
                ))}
              </div>

              {/* Timetables Grid */}
              {(() => {
                const filteredTimetables = (timetables || []).filter(tt => {
                  if (timetableFilter === 'All') return true;
                  return (tt.type || 'class') === timetableFilter;
                });

                if (filteredTimetables.length === 0) {
                  return (
                    <div className="text-center py-12 bg-slate-950/50 rounded-2xl border border-slate-800 space-y-3">
                      <Calendar className="w-8 h-8 text-slate-600 mx-auto" />
                      <p className="text-sm font-semibold text-slate-300">No timetables found</p>
                      <p className="text-xs text-slate-500">Click "+ Create New Timetable" to add a new schedule.</p>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 gap-3">
                    {filteredTimetables.map((tt) => {
                      const typeLabel = tt.type === 'internal' ? 'Internal Exam' : tt.type === 'semester' ? 'Semester Exam' : 'Class Schedule';
                      const isActive = (tt.status || 'active') === 'active';

                      return (
                        <div
                          key={tt.id}
                          className={`p-4.5 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                            isActive
                              ? 'bg-slate-950/90 border-slate-800 hover:border-slate-700 shadow-md'
                              : 'bg-slate-950/40 border-slate-800/60 opacity-80'
                          }`}
                        >
                          <div className="space-y-1.5 flex-1 min-w-0">
                            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                              {/* Type Badge */}
                              <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold border flex items-center space-x-1 ${
                                tt.type === 'internal'
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                  : tt.type === 'semester'
                                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                                  : 'bg-brand-500/20 text-brand-300 border-brand-500/40'
                              }`}>
                                {tt.type === 'internal' ? <FileText className="w-3 h-3 text-amber-400" /> : tt.type === 'semester' ? <GraduationCap className="w-3 h-3 text-cyan-400" /> : <Calendar className="w-3 h-3 text-brand-400" />}
                                <span>{typeLabel}</span>
                              </span>

                              {/* Status Badge */}
                              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide border ${
                                isActive
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                  : 'bg-slate-800 text-slate-400 border-slate-700'
                              }`}>
                                {isActive ? '● Active' : 'Archived'}
                              </span>

                              {/* Target Group */}
                              <span className="text-[11px] font-bold text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                                {tt.year} • Sem {tt.semester} • {tt.classSection}
                              </span>
                            </div>

                            <h5 className="font-bold text-sm text-white">
                              {tt.title || `${tt.year} - Sem ${tt.semester} (${tt.classSection}) Schedule`}
                            </h5>

                            <p className="text-xs text-slate-400">
                              College: {tt.college || 'V.S.B. Engineering College'} • Effective: {tt.effectiveDate || 'Immediate'}
                              {tt.internalName && ` • Test: ${tt.internalName}`}
                              {tt.regulation && ` • Regulation: ${tt.regulation}`}
                              {tt.examEntries && ` • ${tt.examEntries.length} Exam Subjects`}
                            </p>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center space-x-2 flex-shrink-0 self-end md:self-auto">
                            {/* Toggle Active / Archive */}
                            <button
                              onClick={() => toggleTimetableStatus(tt.id, isActive ? 'archived' : 'active')}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center space-x-1.5 ${
                                isActive
                                  ? 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800'
                                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                              }`}
                              title={isActive ? 'Archive this timetable' : 'Set as active timetable'}
                            >
                              {isActive ? (
                                <>
                                  <Archive className="w-3.5 h-3.5" />
                                  <span>Archive</span>
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                                  <span>Make Active</span>
                                </>
                              )}
                            </button>

                            {/* Edit */}
                            <button
                              onClick={() => {
                                onClose();
                                if (onOpenAdminForm) onOpenAdminForm('timetable', tt);
                              }}
                              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-brand-600/80 hover:bg-brand-500 text-white border border-brand-500/40 flex items-center space-x-1 shadow"
                              title="Edit timetable entries and details"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to delete this ${typeLabel}?`)) {
                                  removeTimetable(tt.id);
                                }
                              }}
                              className="p-2 rounded-xl text-rose-400 hover:text-white bg-slate-900 hover:bg-rose-500/20 border border-slate-800 hover:border-rose-500/40 transition-colors"
                              title="Delete timetable"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          )}

          {/* TAB 7: SUBJECT CATALOG MANAGEMENT */}
          {activeTab === 'subjects' && (
            <div className="space-y-6">
              
              {/* Top Controls & Semester Filter Pills */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                    <BookOpen className="w-4 h-4 text-brand-400" />
                    <span>Semester Subject Catalog</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Add, edit, or remove subjects per semester. Uploaded subjects automatically populate in Materials, Timetables, and Internal Marks.
                  </p>
                </div>

                <button
                  onClick={() => {
                    let targetYear = '1st Year';
                    if (subjectSemFilter === 3 || subjectSemFilter === 4) targetYear = '2nd Year';
                    if (subjectSemFilter === 5 || subjectSemFilter === 6) targetYear = '3rd Year';
                    if (subjectSemFilter === 7 || subjectSemFilter === 8) targetYear = '4th Year';

                    setEditingSubjectForm({
                      id: '',
                      name: '',
                      code: '',
                      semester: subjectSemFilter,
                      year: targetYear,
                      type: 'Theory'
                    });
                    setIsEditingSubject(true);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white flex items-center space-x-1.5 shadow-lg shadow-brand-600/20 self-start sm:self-auto transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add Subject (Sem {subjectSemFilter})</span>
                </button>
              </div>

              {/* Semester Selector Tabs (1 to 8) */}
              <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Semester:</span>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                  <button
                    key={sem}
                    onClick={() => setSubjectSemFilter(sem)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      subjectSemFilter === sem
                        ? 'bg-brand-600 text-white shadow-md'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    Sem {sem}
                  </button>
                ))}
              </div>

              {/* Subject Cards / Grid */}
              {(() => {
                const semSubjects = (subjects || []).filter(s => Number(s.semester) === Number(subjectSemFilter));

                if (semSubjects.length === 0) {
                  return (
                    <div className="p-12 text-center text-slate-400 space-y-3 bg-slate-950/60 rounded-3xl border border-slate-800">
                      <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
                      <p className="text-sm font-semibold">No subjects configured for Semester {subjectSemFilter} yet.</p>
                      <button
                        onClick={() => {
                          setEditingSubjectForm({ id: '', name: '', code: '', semester: subjectSemFilter, year: '3rd Year', type: 'Theory' });
                          setIsEditingSubject(true);
                        }}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-brand-600 text-white inline-flex items-center space-x-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add First Subject</span>
                      </button>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {semSubjects.map(sub => (
                      <div key={sub.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between space-x-3 hover:border-slate-700 transition-all shadow-sm">
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                            {sub.code && (
                              <span className="font-mono text-[10px] font-extrabold px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30">
                                {sub.code}
                              </span>
                            )}
                            <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-slate-900 text-slate-300 border border-slate-800">
                              {sub.year || '3rd Year'} • Sem {sub.semester}
                            </span>
                            {sub.type && (
                              <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                {sub.type}
                              </span>
                            )}
                          </div>
                          <h5 className="font-bold text-sm text-white truncate">{sub.name}</h5>
                        </div>

                        <div className="flex items-center space-x-2 flex-shrink-0">
                          <button
                            onClick={() => {
                              setEditingSubjectForm({ ...sub });
                              setIsEditingSubject(true);
                            }}
                            className="p-2 rounded-xl text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors"
                            title="Edit Subject"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-brand-400" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete subject "${sub.name}"?`)) {
                                removeSubject(sub.id);
                              }
                            }}
                            className="p-2 rounded-xl text-rose-400 hover:text-white bg-slate-900 hover:bg-rose-500/20 border border-slate-800 hover:border-rose-500/40 transition-colors"
                            title="Delete Subject"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}

              {/* EDIT / ADD SUBJECT MODAL */}
              {isEditingSubject && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
                  <div className="relative w-full max-w-md bg-slate-900 rounded-3xl border border-slate-700/80 shadow-2xl overflow-hidden p-6 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <h4 className="text-base font-bold text-white flex items-center space-x-2">
                        <BookOpen className="w-5 h-5 text-brand-400" />
                        <span>{editingSubjectForm.id ? 'Edit Subject' : `Add New Subject (Semester ${editingSubjectForm.semester})`}</span>
                      </h4>
                      <button onClick={() => setIsEditingSubject(false)} className="p-1 text-slate-400 hover:text-white">
                        ✕
                      </button>
                    </div>

                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        addOrUpdateSubject({
                          ...editingSubjectForm,
                          semester: Number(editingSubjectForm.semester)
                        });
                        setIsEditingSubject(false);
                      }}
                      className="space-y-4 text-xs"
                    >
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">Subject Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Full Stack Web Development"
                          value={editingSubjectForm.name}
                          onChange={(e) => setEditingSubjectForm({ ...editingSubjectForm, name: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-950 text-slate-100 rounded-xl border border-slate-800 focus:outline-none focus:border-brand-500 text-xs"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-300 mb-1">Subject Code</label>
                          <input
                            type="text"
                            placeholder="e.g. CS8591"
                            value={editingSubjectForm.code || ''}
                            onChange={(e) => setEditingSubjectForm({ ...editingSubjectForm, code: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-950 text-slate-100 rounded-xl border border-slate-800 focus:outline-none focus:border-brand-500 text-xs font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-300 mb-1">Subject Type</label>
                          <select
                            value={editingSubjectForm.type || 'Theory'}
                            onChange={(e) => setEditingSubjectForm({ ...editingSubjectForm, type: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-950 text-slate-100 rounded-xl border border-slate-800 focus:outline-none focus:border-brand-500 text-xs"
                          >
                            <option value="Theory">Theory</option>
                            <option value="Lab">Practical Lab</option>
                            <option value="Placement">Placement / Skill</option>
                            <option value="Project">Project Work</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-300 mb-1">Semester</label>
                          <select
                            value={editingSubjectForm.semester}
                            onChange={(e) => {
                              const semVal = Number(e.target.value);
                              let yrVal = '1st Year';
                              if (semVal === 3 || semVal === 4) yrVal = '2nd Year';
                              if (semVal === 5 || semVal === 6) yrVal = '3rd Year';
                              if (semVal === 7 || semVal === 8) yrVal = '4th Year';
                              setEditingSubjectForm({ ...editingSubjectForm, semester: semVal, year: yrVal });
                            }}
                            className="w-full px-3 py-2 bg-slate-950 text-slate-100 rounded-xl border border-slate-800 focus:outline-none focus:border-brand-500 text-xs"
                          >
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                              <option key={s} value={s}>Semester {s}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-300 mb-1">Year of Study</label>
                          <select
                            value={editingSubjectForm.year}
                            onChange={(e) => setEditingSubjectForm({ ...editingSubjectForm, year: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-950 text-slate-100 rounded-xl border border-slate-800 focus:outline-none focus:border-brand-500 text-xs"
                          >
                            <option value="1st Year">1st Year</option>
                            <option value="2nd Year">2nd Year</option>
                            <option value="3rd Year">3rd Year</option>
                            <option value="4th Year">4th Year</option>
                          </select>
                        </div>
                      </div>

                      <div className="pt-3 flex justify-end space-x-2 border-t border-slate-800">
                        <button
                          type="button"
                          onClick={() => setIsEditingSubject(false)}
                          className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white shadow-md shadow-brand-600/30"
                        >
                          Save Subject
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 8: USER DIRECTORY & ACCESS ANALYTICS */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              
              {/* Header Info & Metrics Grid */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                    <Users className="w-4 h-4 text-cyan-400" />
                    <span>Registered User Directory & Activity Analytics</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Monitor student logins, registration details, accessed features, and manage user accounts with direct deletion controls.
                  </p>
                </div>

                {/* Top Metrics Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Accounts</span>
                    <p className="text-xl font-extrabold text-white">{(registeredUsers || []).length}</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Students</span>
                    <p className="text-xl font-extrabold text-brand-400">
                      {(registeredUsers || []).filter(u => u.role !== 'admin').length}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Admins</span>
                    <p className="text-xl font-extrabold text-emerald-400">
                      {(registeredUsers || []).filter(u => u.role === 'admin').length}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Downloads</span>
                    <p className="text-xl font-extrabold text-amber-400">
                      {(allMaterials || []).reduce((sum, m) => sum + (m.downloads || 0), 0)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by student name, email, register number, or class..."
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-950 text-xs text-white placeholder-slate-400 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500"
                  />
                  {userSearchTerm && (
                    <button
                      onClick={() => setUserSearchTerm('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="flex items-center space-x-1 self-stretch sm:self-auto">
                  {['All', 'student', 'admin'].map(r => (
                    <button
                      key={r}
                      onClick={() => setUserRoleFilter(r)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                        userRoleFilter === r
                          ? 'bg-cyan-600 text-white shadow-md'
                          : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {r === 'All' ? 'All Roles' : `${r}s`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Registered Users List */}
              {(() => {
                const filteredUsers = (registeredUsers || []).filter(u => {
                  if (userRoleFilter !== 'All' && u.role !== userRoleFilter) return false;

                  if (userSearchTerm.trim()) {
                    const q = userSearchTerm.toLowerCase().trim();
                    const matchName = (u.name || '').toLowerCase().includes(q);
                    const matchEmail = (u.email || '').toLowerCase().includes(q);
                    const matchReg = (u.registerNumber || '').toLowerCase().includes(q);
                    const matchClass = (u.classSection || '').toLowerCase().includes(q);
                    const matchYear = (u.year || '').toLowerCase().includes(q);
                    if (!matchName && !matchEmail && !matchReg && !matchClass && !matchYear) return false;
                  }
                  return true;
                });

                if (filteredUsers.length === 0) {
                  return (
                    <div className="p-12 text-center text-slate-400 space-y-2 bg-slate-950/60 rounded-3xl border border-slate-800">
                      <Users className="w-10 h-10 text-slate-600 mx-auto" />
                      <p className="text-sm font-semibold">No registered users matched your criteria.</p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-3">
                    {filteredUsers.map(usr => {
                      const isUserAdmin = usr.role === 'admin';

                      return (
                        <div 
                          key={usr.uid || usr.email} 
                          className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-700 transition-all shadow-sm"
                        >
                          {/* User Details */}
                          <div className="flex items-start space-x-3.5 min-w-0">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm flex-shrink-0 shadow ${
                              isUserAdmin ? 'bg-emerald-600' : 'bg-brand-600'
                            }`}>
                              {usr.name ? usr.name.charAt(0).toUpperCase() : 'U'}
                            </div>

                            <div className="space-y-1 min-w-0">
                              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                                <h5 className="font-bold text-sm text-white truncate">{usr.name || 'Student Account'}</h5>
                                <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                                  isUserAdmin 
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                                    : 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
                                }`}>
                                  {isUserAdmin ? 'Administrator' : 'Student'}
                                </span>
                              </div>

                              <p className="text-xs text-slate-400">{usr.email}</p>

                              <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                                {usr.registerNumber && (
                                  <span className="font-mono text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-500/30">
                                    Reg No: {usr.registerNumber}
                                  </span>
                                )}
                                {!isUserAdmin && (
                                  <span className="text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                                    {usr.year || '3rd Year'} • Sem {usr.semester || 5} ({usr.classSection || 'IT-A'})
                                  </span>
                                )}
                                {usr.registeredDate && (
                                  <span className="text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                                    Joined: {usr.registeredDate}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Controls & Action Buttons */}
                          <div className="flex items-center space-x-3 self-end sm:self-center flex-shrink-0">
                            <div className="text-right hidden md:block">
                              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 block">
                                ● Account Active
                              </span>
                            </div>

                            <button
                              onClick={() => {
                                const confirmMsg = `Are you sure you want to remove user "${usr.name}" (${usr.email})?\n\nThis will revoke their account login access.`;
                                if (window.confirm(confirmMsg)) {
                                  removeRegisteredUser(usr.uid || usr.email);
                                }
                              }}
                              className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-400 hover:text-white bg-slate-900 hover:bg-rose-500/20 border border-slate-800 hover:border-rose-500/40 transition-colors flex items-center space-x-1.5 shadow"
                              title="Delete user account from system"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Remove User</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}

            </div>
          )}

          {/* TAB: BROADCAST ANNOUNCEMENTS */}
          {activeTab === 'broadcasts' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-purple-950/60 via-slate-900 to-amber-950/60 border border-purple-500/30">
                <div>
                  <h4 className="text-base font-extrabold text-white flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-amber-400 animate-spin" />
                    <span>Broadcast Announcements & Festival Overlays</span>
                  </h4>
                  <p className="text-xs text-slate-300">
                    Create full-screen overlay notices with rich celebratory typography & particle animations for department events.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setEditingBroadcast(null);
                    setBroadcastForm({
                      id: '',
                      title: '',
                      message: '',
                      bannerImageUrl: '',
                      linkUrl: '',
                      linkLabel: 'Register Now 🚀',
                      isSkippable: true,
                      autoCloseSeconds: 5,
                      isFestivalMode: true,
                      animationType: 'confetti',
                      isActive: true
                    });
                    setIsCreatingBroadcast(true);
                  }}
                  className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-white shadow-lg shadow-amber-500/20 whitespace-nowrap self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create New Broadcast</span>
                </button>
              </div>

              {/* Broadcast Creation / Editing Form */}
              {isCreatingBroadcast && (
                <form onSubmit={handleSaveBroadcast} className="p-5 rounded-2xl bg-slate-950 border border-purple-500/40 space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h5 className="font-bold text-white text-sm flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>{editingBroadcast ? 'Edit Broadcast Announcement' : 'Create New Broadcast Announcement'}</span>
                    </h5>
                    <button
                      type="button"
                      onClick={() => setIsCreatingBroadcast(false)}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Broadcast Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. ✨ Diwali Special Grand Hackathon 2026"
                      value={broadcastForm.title}
                      onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-900 text-slate-100 text-xs rounded-xl border border-slate-800 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  {/* Message Text with Live Typography Preview */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Message Content (Bright Festive Typography) *</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Enter announcement message text..."
                      value={broadcastForm.message}
                      onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-900 text-slate-100 text-xs rounded-xl border border-slate-800 focus:outline-none focus:border-purple-500"
                    />
                    {broadcastForm.message && (
                      <div className="mt-2 p-3 rounded-xl bg-slate-900/90 border border-amber-500/30">
                        <span className="text-[10px] font-bold uppercase text-amber-400 block mb-1">Live Typography Preview:</span>
                        <p className="text-xs font-bold text-amber-100 leading-relaxed">
                          {broadcastForm.message}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Banner Image URL & Action Link */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-300">Banner Image (JPG / PNG Upload or URL)</label>
                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                        <label className="px-3 py-1.5 rounded-lg text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white cursor-pointer inline-flex items-center space-x-1.5 shadow">
                          <ImageIcon className="w-3.5 h-3.5" />
                          <span>Choose Image (JPG / PNG)</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleBroadcastImageUpload}
                            className="hidden"
                          />
                        </label>
                        <input
                          type="text"
                          placeholder="https://... or choose local file above"
                          value={broadcastForm.bannerImageUrl}
                          onChange={(e) => setBroadcastForm({ ...broadcastForm, bannerImageUrl: e.target.value })}
                          className="w-full px-3 py-1.5 bg-slate-950 text-slate-100 text-xs rounded-lg border border-slate-800 focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Action Link URL (Optional)</label>
                      <input
                        type="url"
                        placeholder="https://forms.gle/..."
                        value={broadcastForm.linkUrl}
                        onChange={(e) => setBroadcastForm({ ...broadcastForm, linkUrl: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-900 text-slate-100 text-xs rounded-xl border border-slate-800 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>

                  {broadcastForm.linkUrl && (
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Button Label Text</label>
                      <input
                        type="text"
                        placeholder="e.g. Register Now 🚀"
                        value={broadcastForm.linkLabel}
                        onChange={(e) => setBroadcastForm({ ...broadcastForm, linkLabel: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-900 text-slate-100 text-xs rounded-xl border border-slate-800 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  )}

                  {/* Controls Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                    
                    {/* Skippable Toggle */}
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                      <label className="block text-[11px] font-bold text-slate-300">Allow Student Skip? *</label>
                      <select
                        value={broadcastForm.isSkippable ? 'yes' : 'no'}
                        onChange={(e) => setBroadcastForm({ ...broadcastForm, isSkippable: e.target.value === 'yes' })}
                        className="w-full px-2.5 py-1.5 bg-slate-800 text-xs text-white rounded-lg border border-slate-700 focus:outline-none"
                      >
                        <option value="yes">Yes (Close '✕' button visible)</option>
                        <option value="no">No (Mandatory Countdown Timer)</option>
                      </select>
                    </div>

                    {/* Auto Close Seconds */}
                    {!broadcastForm.isSkippable && (
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                        <label className="block text-[11px] font-bold text-slate-300">Auto Close Seconds *</label>
                        <input
                          type="number"
                          min="3"
                          max="60"
                          value={broadcastForm.autoCloseSeconds}
                          onChange={(e) => setBroadcastForm({ ...broadcastForm, autoCloseSeconds: parseInt(e.target.value) || 5 })}
                          className="w-full px-2.5 py-1.5 bg-slate-800 text-xs text-white rounded-lg border border-slate-700 focus:outline-none"
                        />
                      </div>
                    )}

                    {/* Festival Mode Toggle */}
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                      <label className="block text-[11px] font-bold text-slate-300">Festival Mode *</label>
                      <select
                        value={broadcastForm.isFestivalMode ? 'yes' : 'no'}
                        onChange={(e) => setBroadcastForm({ ...broadcastForm, isFestivalMode: e.target.value === 'yes' })}
                        className="w-full px-2.5 py-1.5 bg-slate-800 text-xs text-white rounded-lg border border-slate-700 focus:outline-none"
                      >
                        <option value="yes">Yes (Full-screen Particle Overlay)</option>
                        <option value="no">No (Standard Bright Banner)</option>
                      </select>
                    </div>

                    {/* Active Toggle */}
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                      <label className="block text-[11px] font-bold text-slate-300">Broadcast Status *</label>
                      <select
                        value={broadcastForm.isActive ? 'active' : 'inactive'}
                        onChange={(e) => setBroadcastForm({ ...broadcastForm, isActive: e.target.value === 'active' })}
                        className="w-full px-2.5 py-1.5 bg-slate-800 text-xs text-white rounded-lg border border-slate-700 focus:outline-none"
                      >
                        <option value="active">Active (Pop up for students)</option>
                        <option value="inactive">Inactive (Paused)</option>
                      </select>
                    </div>

                  </div>

                  {/* Animation Picker */}
                  {broadcastForm.isFestivalMode && (
                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                      <label className="block text-xs font-bold text-slate-300">Choose Festival Particle Animation style *</label>
                      <div className="grid grid-cols-3 gap-3">
                        
                        <button
                          type="button"
                          onClick={() => setBroadcastForm({ ...broadcastForm, animationType: 'confetti' })}
                          className={`p-3 rounded-xl border text-center font-bold text-xs space-y-1 transition-all ${
                            broadcastForm.animationType === 'confetti'
                              ? 'border-amber-400 bg-amber-500/20 text-amber-300 shadow-md'
                              : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                          }`}
                        >
                          <span className="text-lg block">🎉</span>
                          <span>Confetti</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setBroadcastForm({ ...broadcastForm, animationType: 'petals' })}
                          className={`p-3 rounded-xl border text-center font-bold text-xs space-y-1 transition-all ${
                            broadcastForm.animationType === 'petals'
                              ? 'border-rose-400 bg-rose-500/20 text-rose-300 shadow-md'
                              : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                          }`}
                        >
                          <span className="text-lg block">🌸</span>
                          <span>Flower Petals</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setBroadcastForm({ ...broadcastForm, animationType: 'sparkles' })}
                          className={`p-3 rounded-xl border text-center font-bold text-xs space-y-1 transition-all ${
                            broadcastForm.animationType === 'sparkles'
                              ? 'border-purple-400 bg-purple-500/20 text-purple-300 shadow-md'
                              : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                          }`}
                        >
                          <span className="text-lg block">✨</span>
                          <span>Sparkles</span>
                        </button>

                      </div>
                    </div>
                  )}

                  {/* Submit & Test Live Preview Buttons */}
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setPreviewBroadcast(broadcastForm)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-amber-300 flex items-center space-x-1.5 border border-slate-700"
                    >
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Test Live Overlay Preview</span>
                    </button>

                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => setIsCreatingBroadcast(false)}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/30"
                      >
                        {editingBroadcast ? 'Save Changes' : 'Publish Broadcast'}
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* Broadcasts List */}
              <div className="space-y-3">
                {(broadcasts || []).length === 0 ? (
                  <div className="p-8 text-center glass-panel rounded-2xl text-slate-400 space-y-2">
                    <Sparkles className="w-8 h-8 text-slate-600 mx-auto" />
                    <p className="text-sm font-semibold">No broadcast announcements published yet.</p>
                  </div>
                ) : (
                  broadcasts.map((bcast) => (
                    <div
                      key={bcast.id}
                      className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                        bcast.isActive
                          ? 'bg-slate-950 border-purple-500/40 shadow-md'
                          : 'bg-slate-950/60 border-slate-800 opacity-60'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                          <span className="font-extrabold text-sm text-white">{bcast.title}</span>
                          {bcast.isFestivalMode && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              ✨ {bcast.animationType || 'Festival'}
                            </span>
                          )}
                          {bcast.isSkippable ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300">
                              Skippable
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                              Timer: {bcast.autoCloseSeconds}s
                            </span>
                          )}
                          {bcast.isActive ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                              ● Active
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400">
                              ○ Inactive
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-300 line-clamp-2">{bcast.message}</p>

                        {bcast.linkUrl && (
                          <div className="flex items-center space-x-1 text-[11px] text-purple-400 font-semibold">
                            <ExternalLink className="w-3 h-3" />
                            <span>Link: {bcast.linkLabel || 'CTA Button'} ({bcast.linkUrl})</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 self-end sm:self-center flex-shrink-0">
                        <button
                          onClick={() => setPreviewBroadcast(bcast)}
                          className="p-2 rounded-xl text-xs font-bold text-amber-400 hover:text-amber-300 bg-slate-900 border border-slate-800 hover:border-amber-500/40 flex items-center space-x-1"
                          title="Preview full-screen overlay"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Preview</span>
                        </button>

                        <button
                          onClick={() => updateBroadcast(bcast.id, { isActive: !bcast.isActive })}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                            bcast.isActive
                              ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/50'
                              : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'
                          }`}
                        >
                          {bcast.isActive ? 'Active' : 'Enable'}
                        </button>

                        <button
                          onClick={() => {
                            setEditingBroadcast(bcast);
                            setBroadcastForm({ ...bcast });
                            setIsCreatingBroadcast(true);
                          }}
                          className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800"
                          title="Edit broadcast"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            if (window.confirm(`Delete broadcast "${bcast.title}"?`)) {
                              deleteBroadcast(bcast.id);
                            }
                          }}
                          className="p-2 rounded-xl text-rose-400 hover:text-white bg-slate-900 hover:bg-rose-500/20 border border-slate-800 hover:border-rose-500/40"
                          title="Delete broadcast"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>

        {/* Live Admin Preview Overlay */}
        {previewBroadcast && (
          <BroadcastOverlay
            broadcast={previewBroadcast}
            onDismiss={() => setPreviewBroadcast(null)}
            isPreview={true}
          />
        )}

      </div>
    </div>
  );
};
