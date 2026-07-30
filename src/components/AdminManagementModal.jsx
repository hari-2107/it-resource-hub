import React, { useState, useEffect } from 'react';
import { 
  X, 
  Lightbulb, 
  Flag, 
  History, 
  Check, 
  ShieldAlert, 
  Trash2, 
  Edit2, 
  ExternalLink, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Calendar, 
  Plus, 
  Archive, 
  CheckCircle, 
  FileText, 
  GraduationCap, 
  BookOpen, 
  Users, 
  Search, 
  BarChart3, 
  Sparkles, 
  Megaphone, 
  Image as ImageIcon,
  ChevronDown,
  ChevronRight,
  Brain,
  Briefcase,
  Trophy,
  Activity,
  Settings,
  Download,
  Target,
  Gift,
  Award,
  HelpCircle,
  Clock,
  Layers,
  Sliders,
  AlertTriangle,
  RotateCcw,
  Zap,
  Flame,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { BroadcastOverlay } from './BroadcastOverlay';

export const AdminManagementModal = ({ initialTab = 'dashboard', onClose, onOpenAdminForm, onOpenVersionHistory }) => {
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
    removeInterviewExperience,
    placementCompanies,
    events,
    thisOrThatPolls,
    activityLog,
    siteConfig,
    logAdminActivity,
    updateSiteConfig,
    quizQuestions,
    addOrUpdateQuizQuestion,
    removeQuizQuestion,
    itFacts,
    addOrUpdateITFact,
    removeITFact,
    clearActivityLogs,
    updateUserRole
  } = useData();

  const [activeTab, setActiveTab] = useState(initialTab || 'dashboard');

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Sidebar Group Collapsible States
  const [openGroups, setOpenGroups] = useState({
    moderation: true,
    academic: true,
    brainzone: true,
    placement: true,
    users: true,
    system: true
  });

  const toggleGroup = (groupKey) => {
    setOpenGroups(prev => ({ ...prev, [groupKey]: !prev[groupKey] }));
  };

  // Moderation Filters
  const [suggestionFilter, setSuggestionFilter] = useState('all'); // 'all' | 'pending' | 'approved'
  const [suggestionSearch, setSuggestionSearch] = useState('');
  const [notesFilter, setNotesFilter] = useState('pending'); // 'pending' | 'approved' | 'all'
  const [reportsFilter, setReportsFilter] = useState('open'); // 'open' | 'resolved' | 'all'

  // Academic Management Filters & Forms
  const [timetableFilter, setTimetableFilter] = useState('All');
  const [subjectSemFilter, setSubjectSemFilter] = useState(5);
  const [subjectSearch, setSubjectSearch] = useState('');
  const [subjectModalOpen, setSubjectModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [subjectForm, setSubjectForm] = useState({
    id: '',
    name: '',
    code: '',
    year: '3rd Year',
    semester: 5,
    type: 'Theory'
  });

  // User Directory Filters
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('All');

  // BrainZone Management Forms & State
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [quizForm, setQuizForm] = useState({
    id: '',
    q: '',
    option0: '',
    option1: '',
    option2: '',
    option3: '',
    answer: 0,
    category: 'Web Dev'
  });

  const [factModalOpen, setFactModalOpen] = useState(false);
  const [factForm, setFactForm] = useState({
    id: '',
    fact: '',
    category: 'CS History'
  });

  // Broadcast Form State
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

  // Activity Log Filter
  const [logFilter, setLogFilter] = useState('All');

  // Site Config Form State
  const [siteConfigForm, setSiteConfigForm] = useState({
    brainZoneEnabled: siteConfig?.brainZoneEnabled !== false,
    registrationEnabled: siteConfig?.registrationEnabled !== false,
    maintenanceMode: siteConfig?.maintenanceMode || false,
    maintenanceMessage: siteConfig?.maintenanceMessage || 'The IT Resource Hub is currently undergoing scheduled maintenance. Please check back shortly.'
  });

  useEffect(() => {
    if (siteConfig) {
      setSiteConfigForm({
        brainZoneEnabled: siteConfig.brainZoneEnabled !== false,
        registrationEnabled: siteConfig.registrationEnabled !== false,
        maintenanceMode: siteConfig.maintenanceMode || false,
        maintenanceMessage: siteConfig.maintenanceMessage || 'The IT Resource Hub is currently undergoing scheduled maintenance. Please check back shortly.'
      });
    }
  }, [siteConfig]);

  // Counts for Dashboard
  const pendingSuggestions = (suggestions || []).filter(s => s.status === 'pending').length;
  const pendingNotes = (allMaterials || []).filter(m => m.status === 'pending').length;
  const pendingExperiences = (interviewExperiences || []).filter(e => !e.approved).length;
  const openReports = (reports || []).filter(r => r.status === 'open').length;
  const totalPendingCombined = pendingSuggestions + pendingNotes + pendingExperiences + openReports;

  const totalUsers = (registeredUsers || []).length;
  const activeBroadcastsCount = (broadcasts || []).filter(b => b.isActive).length;
  const totalDownloads = (allMaterials || []).reduce((acc, curr) => acc + (curr.downloadCount || 0), 0);

  // Subject Form Handlers
  const handleOpenSubjectModal = (subj = null) => {
    if (subj) {
      setEditingSubject(subj);
      setSubjectForm({
        id: subj.id,
        name: subj.name || '',
        code: subj.code || '',
        year: subj.year || '3rd Year',
        semester: subj.semester || 5,
        type: subj.type || 'Theory'
      });
    } else {
      setEditingSubject(null);
      setSubjectForm({
        id: '',
        name: '',
        code: '',
        year: '3rd Year',
        semester: subjectSemFilter,
        type: 'Theory'
      });
    }
    setSubjectModalOpen(true);
  };

  const handleSaveSubject = (e) => {
    e.preventDefault();
    if (!subjectForm.name || !subjectForm.code) return;

    addOrUpdateSubject({
      ...subjectForm,
      id: subjectForm.id || `sub-${Date.now()}`,
      semester: Number(subjectForm.semester)
    });

    logAdminActivity(
      editingSubject ? `Updated subject '${subjectForm.name}' (${subjectForm.code})` : `Added new subject '${subjectForm.name}' (${subjectForm.code})`,
      'Subject'
    );

    setSubjectModalOpen(false);
  };

  // Quiz Question Form Handler
  const handleSaveQuizQuestion = (e) => {
    e.preventDefault();
    if (!quizForm.q || !quizForm.option0 || !quizForm.option1) return;

    const qPayload = {
      id: quizForm.id || `qq-${Date.now()}`,
      q: quizForm.q,
      options: [quizForm.option0, quizForm.option1, quizForm.option2 || 'Option 3', quizForm.option3 || 'Option 4'],
      answer: Number(quizForm.answer),
      category: quizForm.category || 'General CS',
      difficulty: quizForm.difficulty || 'intermediate'
    };

    addOrUpdateQuizQuestion(qPayload);
    setQuizModalOpen(false);
    setQuizForm({ id: '', q: '', option0: '', option1: '', option2: '', option3: '', answer: 0, category: 'Web Dev', difficulty: 'intermediate' });
  };

  // IT Fact Form Handler
  const handleSaveITFact = (e) => {
    e.preventDefault();
    if (!factForm.fact) return;

    addOrUpdateITFact({
      id: factForm.id || `fact-${Date.now()}`,
      fact: factForm.fact,
      category: factForm.category || 'CS History'
    });

    setFactModalOpen(false);
    setFactForm({ id: '', fact: '', category: 'CS History' });
  };

  // CSV Exporters
  const downloadCSV = (filename, csvContent) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportUsers = () => {
    const headers = ['UID', 'Name', 'Email', 'Role', 'Year', 'Semester', 'Class Section', 'Reg Number', 'XP Points'];
    const rows = (registeredUsers || []).map(u => [
      `"${u.uid || u.id || ''}"`,
      `"${u.name || ''}"`,
      `"${u.email || ''}"`,
      `"${u.role || 'student'}"`,
      `"${u.year || ''}"`,
      `"${u.semester || ''}"`,
      `"${u.classSection || ''}"`,
      `"${u.registerNumber || ''}"`,
      u.funPoints || 0
    ]);
    const csvString = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    downloadCSV(`IT_Hub_Users_Export_${new Date().toISOString().split('T')[0]}.csv`, csvString);
    logAdminActivity('Exported Registered Users CSV', 'Export');
  };

  const handleExportDownloadStats = () => {
    const headers = ['Material ID', 'Title', 'Subject', 'Category', 'Year', 'Semester', 'Download Count', 'Upload Date'];
    const rows = (allMaterials || []).map(m => [
      `"${m.id || ''}"`,
      `"${m.title || ''}"`,
      `"${m.subjectName || ''}"`,
      `"${m.category || ''}"`,
      `"${m.year || ''}"`,
      `"${m.semester || ''}"`,
      m.downloadCount || 0,
      `"${m.uploadDate || ''}"`
    ]);
    const csvString = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    downloadCSV(`IT_Hub_Download_Stats_${new Date().toISOString().split('T')[0]}.csv`, csvString);
    logAdminActivity('Exported Download Stats CSV', 'Export');
  };

  const handleExportPlacementDrives = () => {
    const headers = ['Company ID', 'Company Name', 'Eligibility', 'CGPA Cutoff', 'Drive Date', 'Description'];
    const rows = (placementCompanies || []).map(c => [
      `"${c.id || ''}"`,
      `"${c.companyName || ''}"`,
      `"${c.eligibilityCriteria || ''}"`,
      c.cgpaCutoff || 0,
      `"${c.driveDate || ''}"`,
      `"${(c.description || '').replace(/"/g, '""')}"`
    ]);
    const csvString = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    downloadCSV(`IT_Hub_Placement_Companies_${new Date().toISOString().split('T')[0]}.csv`, csvString);
    logAdminActivity('Exported Placement Drives CSV', 'Export');
  };

  // Broadcast Handler
  const handleSaveBroadcast = (e) => {
    e.preventDefault();
    if (!broadcastForm.title || !broadcastForm.message) return;

    if (editingBroadcast) {
      updateBroadcast(editingBroadcast.id, broadcastForm);
      logAdminActivity(`Updated broadcast '${broadcastForm.title}'`, 'Broadcast');
    } else {
      addBroadcast(broadcastForm);
      logAdminActivity(`Created announcement broadcast '${broadcastForm.title}'`, 'Broadcast');
    }

    setIsCreatingBroadcast(false);
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
  };

  // Filtered lists
  const filteredUsers = (registeredUsers || []).filter(u => {
    const matchesSearch = (u.name || '').toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                          (u.email || '').toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                          (u.registerNumber || '').toLowerCase().includes(userSearchTerm.toLowerCase());
    const matchesRole = userRoleFilter === 'All' ? true : (u.role || 'student') === userRoleFilter.toLowerCase();
    return matchesSearch && matchesRole;
  });

  const filteredSubjects = (subjects || []).filter(s => {
    const matchesSem = s.semester === Number(subjectSemFilter);
    const matchesSearch = (s.name || '').toLowerCase().includes(subjectSearch.toLowerCase()) ||
                          (s.code || '').toLowerCase().includes(subjectSearch.toLowerCase());
    return matchesSem && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-6xl bg-slate-900 rounded-3xl border border-slate-700/80 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <span>Admin Control Center</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Fully Functional v4.0
                </span>
              </h3>
              <p className="text-xs text-slate-400">Department of Information Technology Management Suite</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar + Main Content Layout */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* LEFT SIDEBAR (Accordion Groupings) */}
          <div className="w-64 bg-slate-950 border-r border-slate-800 overflow-y-auto p-3 space-y-4 flex-shrink-0 scrollbar-none">
            
            {/* 1. DASHBOARD (Top Landing Item) */}
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full p-2.5 rounded-2xl text-xs font-black transition-all flex items-center justify-between ${
                activeTab === 'dashboard'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/30'
                  : 'text-slate-300 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-emerald-300" />
                <span>📊 Dashboard</span>
              </div>
              {totalPendingCombined > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950">
                  {totalPendingCombined}
                </span>
              )}
            </button>

            {/* 2. CONTENT MODERATION GROUP */}
            <div className="space-y-1">
              <button
                onClick={() => toggleGroup('moderation')}
                className="w-full px-2 py-1 flex items-center justify-between text-[11px] font-extrabold text-slate-400 uppercase tracking-wider hover:text-slate-200"
              >
                <span>CONTENT MODERATION</span>
                {openGroups.moderation ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>

              {openGroups.moderation && (
                <div className="space-y-1 pl-1">
                  <button
                    onClick={() => setActiveTab('suggestions')}
                    className={`w-full p-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                      activeTab === 'suggestions' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    <span className="flex items-center space-x-2">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                      <span>Suggestions</span>
                    </span>
                    {pendingSuggestions > 0 && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300">
                        {pendingSuggestions}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => setActiveTab('pending_notes')}
                    className={`w-full p-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                      activeTab === 'pending_notes' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    <span className="flex items-center space-x-2">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Pending Notes</span>
                    </span>
                    {pendingNotes > 0 && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300">
                        {pendingNotes}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => setActiveTab('interview_exp')}
                    className={`w-full p-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                      activeTab === 'interview_exp' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    <span className="flex items-center space-x-2">
                      <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Interview Exps</span>
                    </span>
                    {pendingExperiences > 0 && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-indigo-500/20 text-indigo-300">
                        {pendingExperiences}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => setActiveTab('reports')}
                    className={`w-full p-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                      activeTab === 'reports' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    <span className="flex items-center space-x-2">
                      <Flag className="w-3.5 h-3.5 text-rose-400" />
                      <span>Reported Issues</span>
                    </span>
                    {openReports > 0 && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-500/20 text-rose-300">
                        {openReports}
                      </span>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* 3. ACADEMIC MANAGEMENT GROUP */}
            <div className="space-y-1">
              <button
                onClick={() => toggleGroup('academic')}
                className="w-full px-2 py-1 flex items-center justify-between text-[11px] font-extrabold text-slate-400 uppercase tracking-wider hover:text-slate-200"
              >
                <span>ACADEMIC MANAGEMENT</span>
                {openGroups.academic ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>

              {openGroups.academic && (
                <div className="space-y-1 pl-1">
                  <button
                    onClick={() => setActiveTab('timetables')}
                    className={`w-full p-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                      activeTab === 'timetables' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Timetables</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('subjects')}
                    className={`w-full p-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                      activeTab === 'subjects' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Subject Catalog</span>
                  </button>
                </div>
              )}
            </div>

            {/* 4. BRAINZONE MANAGEMENT GROUP */}
            <div className="space-y-1">
              <button
                onClick={() => toggleGroup('brainzone')}
                className="w-full px-2 py-1 flex items-center justify-between text-[11px] font-extrabold text-purple-400 uppercase tracking-wider hover:text-purple-300"
              >
                <span>🧠 BRAINZONE</span>
                {openGroups.brainzone ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>

              {openGroups.brainzone && (
                <div className="space-y-1 pl-1">
                  <button
                    onClick={() => setActiveTab('brainzone_challenges')}
                    className={`w-full p-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                      activeTab === 'brainzone_challenges' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Daily Challenges</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('brainzone_missions')}
                    className={`w-full p-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                      activeTab === 'brainzone_missions' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    <Target className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Weekly Missions</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('brainzone_badges')}
                    className={`w-full p-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                      activeTab === 'brainzone_badges' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    <span>Badges & Level Tiers</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('brainzone_mystery')}
                    className={`w-full p-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                      activeTab === 'brainzone_mystery' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    <Gift className="w-3.5 h-3.5 text-pink-400" />
                    <span>Mystery Box Rewards</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('brainzone_polls')}
                    className={`w-full p-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                      activeTab === 'brainzone_polls' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>This or That Polls</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('brainzone_facts')}
                    className={`w-full p-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                      activeTab === 'brainzone_facts' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                    <span>IT Facts</span>
                  </button>
                </div>
              )}
            </div>

            {/* 5. PLACEMENT & EVENTS GROUP */}
            <div className="space-y-1">
              <button
                onClick={() => toggleGroup('placement')}
                className="w-full px-2 py-1 flex items-center justify-between text-[11px] font-extrabold text-slate-400 uppercase tracking-wider hover:text-slate-200"
              >
                <span>PLACEMENT & EVENTS</span>
                {openGroups.placement ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>

              {openGroups.placement && (
                <div className="space-y-1 pl-1">
                  <button
                    onClick={() => setActiveTab('companies')}
                    className={`w-full p-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                      activeTab === 'companies' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    <Briefcase className="w-3.5 h-3.5 text-blue-400" />
                    <span>Company Drives</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('events')}
                    className={`w-full p-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                      activeTab === 'events' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                    <span>Events & Hackathons</span>
                  </button>
                </div>
              )}
            </div>

            {/* 6. USERS & COMMUNICATION GROUP */}
            <div className="space-y-1">
              <button
                onClick={() => toggleGroup('users')}
                className="w-full px-2 py-1 flex items-center justify-between text-[11px] font-extrabold text-slate-400 uppercase tracking-wider hover:text-slate-200"
              >
                <span>USERS & COMM</span>
                {openGroups.users ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>

              {openGroups.users && (
                <div className="space-y-1 pl-1">
                  <button
                    onClick={() => setActiveTab('user_directory')}
                    className={`w-full p-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                      activeTab === 'user_directory' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5 text-cyan-400" />
                    <span>User Directory</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('broadcasts')}
                    className={`w-full p-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                      activeTab === 'broadcasts' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    <Megaphone className="w-3.5 h-3.5 text-amber-400" />
                    <span>Broadcasts</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('versions')}
                    className={`w-full p-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                      activeTab === 'versions' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    <History className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Doc Versions</span>
                  </button>
                </div>
              )}
            </div>

            {/* 7. SYSTEM GROUP */}
            <div className="space-y-1">
              <button
                onClick={() => toggleGroup('system')}
                className="w-full px-2 py-1 flex items-center justify-between text-[11px] font-extrabold text-slate-400 uppercase tracking-wider hover:text-slate-200"
              >
                <span>SYSTEM & CONFIG</span>
                {openGroups.system ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>

              {openGroups.system && (
                <div className="space-y-1 pl-1">
                  <button
                    onClick={() => setActiveTab('activity_log')}
                    className={`w-full p-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                      activeTab === 'activity_log' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    <Activity className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Activity Log</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('site_settings')}
                    className={`w-full p-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                      activeTab === 'site_settings' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    <Settings className="w-3.5 h-3.5 text-amber-400" />
                    <span>Site Settings</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('export_data')}
                    className={`w-full p-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                      activeTab === 'export_data' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    <Download className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Export Data</span>
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* MAIN CONTENT WORKSPACE AREA */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-900/60 scrollbar-none">
            
            {/* ================================================================= */}
            {/* TAB 1: 📊 DASHBOARD */}
            {/* ================================================================= */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6 animate-in fade-in">
                
                {/* Stats Overview Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  
                  <div className="glass-card rounded-2xl p-4 border border-amber-500/40 bg-gradient-to-b from-amber-950/20 to-slate-950 space-y-1">
                    <div className="flex items-center justify-between text-amber-400">
                      <span className="text-xs font-bold uppercase tracking-wider">Total Pending Review</span>
                      <ShieldAlert className="w-5 h-5" />
                    </div>
                    <p className="text-3xl font-black text-white">{totalPendingCombined}</p>
                    <p className="text-[10px] text-slate-400">Suggestions, Notes, Exps & Reports</p>
                  </div>

                  <div className="glass-card rounded-2xl p-4 border border-cyan-500/40 bg-gradient-to-b from-cyan-950/20 to-slate-950 space-y-1">
                    <div className="flex items-center justify-between text-cyan-400">
                      <span className="text-xs font-bold uppercase tracking-wider">Registered Users</span>
                      <Users className="w-5 h-5" />
                    </div>
                    <p className="text-3xl font-black text-white">{totalUsers}</p>
                    <p className="text-[10px] text-slate-400">Students & Faculty Accounts</p>
                  </div>

                  <div className="glass-card rounded-2xl p-4 border border-purple-500/40 bg-gradient-to-b from-purple-950/20 to-slate-950 space-y-1">
                    <div className="flex items-center justify-between text-purple-400">
                      <span className="text-xs font-bold uppercase tracking-wider">Active Broadcasts</span>
                      <Megaphone className="w-5 h-5" />
                    </div>
                    <p className="text-3xl font-black text-white">{activeBroadcastsCount}</p>
                    <p className="text-[10px] text-slate-400">Live Campus Banner Overlays</p>
                  </div>

                  <div className="glass-card rounded-2xl p-4 border border-emerald-500/40 bg-gradient-to-b from-emerald-950/20 to-slate-950 space-y-1">
                    <div className="flex items-center justify-between text-emerald-400">
                      <span className="text-xs font-bold uppercase tracking-wider">Total Downloads</span>
                      <Download className="w-5 h-5" />
                    </div>
                    <p className="text-3xl font-black text-white">{totalDownloads.toLocaleString()}</p>
                    <p className="text-[10px] text-slate-400">Verified Study Files Downloaded</p>
                  </div>

                </div>

                {/* Quick Action Navigation Grid */}
                <div className="space-y-3">
                  <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <span>⚡ Quick Management Actions</span>
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <button
                      onClick={() => setActiveTab('suggestions')}
                      className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 transition-all text-left space-y-2 group"
                    >
                      <Lightbulb className="w-6 h-6 text-amber-400 group-hover:scale-110 transition-transform" />
                      <div>
                        <p className="text-xs font-bold text-white">Moderate Suggestions</p>
                        <p className="text-[10px] text-slate-400">{pendingSuggestions} Pending</p>
                      </div>
                    </button>

                    <button
                      onClick={() => setActiveTab('pending_notes')}
                      className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 transition-all text-left space-y-2 group"
                    >
                      <CheckCircle className="w-6 h-6 text-emerald-400 group-hover:scale-110 transition-transform" />
                      <div>
                        <p className="text-xs font-bold text-white">Review Pending Notes</p>
                        <p className="text-[10px] text-slate-400">{pendingNotes} Pending</p>
                      </div>
                    </button>

                    <button
                      onClick={() => setActiveTab('user_directory')}
                      className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 transition-all text-left space-y-2 group"
                    >
                      <Users className="w-6 h-6 text-cyan-400 group-hover:scale-110 transition-transform" />
                      <div>
                        <p className="text-xs font-bold text-white">User Directory</p>
                        <p className="text-[10px] text-slate-400">{totalUsers} Users Registered</p>
                      </div>
                    </button>

                    <button
                      onClick={() => setActiveTab('site_settings')}
                      className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-purple-500/50 transition-all text-left space-y-2 group"
                    >
                      <Settings className="w-6 h-6 text-purple-400 group-hover:scale-110 transition-transform" />
                      <div>
                        <p className="text-xs font-bold text-white">Site Settings</p>
                        <p className="text-[10px] text-slate-400">Maintenance & Flags</p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Recent Activity Mini Feed */}
                <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                      <Activity className="w-4 h-4 text-emerald-400" />
                      <span>Recent Admin Activity Log</span>
                    </h3>
                    <button onClick={() => setActiveTab('activity_log')} className="text-xs text-brand-400 hover:underline">
                      View Full Log →
                    </button>
                  </div>

                  <div className="space-y-2">
                    {(activityLog || []).slice(0, 3).map(log => (
                      <div key={log.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-200">{log.action}</p>
                          <p className="text-[10px] text-slate-400">By {log.adminName} • Target: {log.targetType}</p>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* ================================================================= */}
            {/* TAB 2: 💡 SUGGESTIONS MODERATION */}
            {/* ================================================================= */}
            {activeTab === 'suggestions' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-base font-extrabold text-white flex items-center space-x-2">
                      <Lightbulb className="w-5 h-5 text-amber-400" />
                      <span>Student Material Suggestions</span>
                    </h3>
                    <p className="text-xs text-slate-400">Review student resource requests and publish or clear suggestions</p>
                  </div>

                  <div className="flex items-center space-x-2">
                    {['all', 'pending', 'approved'].map(f => (
                      <button
                        key={f}
                        onClick={() => setSuggestionFilter(f)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold capitalize transition-all ${
                          suggestionFilter === f ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                {suggestions.filter(s => suggestionFilter === 'all' ? true : s.status === suggestionFilter).length === 0 ? (
                  <div className="p-8 text-center bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                    <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
                    <p className="text-sm font-bold text-white">No Suggestions Found</p>
                    <p className="text-xs text-slate-400">All student resource requests have been processed.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {suggestions
                      .filter(s => suggestionFilter === 'all' ? true : s.status === suggestionFilter)
                      .map(s => (
                        <div key={s.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-bold text-white">{s.title || s.subject}</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                s.status === 'pending' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              }`}>{s.status}</span>
                            </div>
                            <p className="text-xs text-slate-300">{s.description || s.comment || 'Requesting study notes & lab manual'}</p>
                            <p className="text-[10px] text-slate-500">Submitted by: {s.studentName || 'Student'} ({s.year || '3rd Year'}, Sem {s.semester || 5})</p>
                          </div>

                          <div className="flex items-center space-x-2">
                            {s.status === 'pending' && (
                              <button
                                onClick={() => {
                                  updateSuggestionStatus(s.id, 'approved');
                                  logAdminActivity(`Approved material suggestion '${s.title || s.subject}'`, 'Suggestion');
                                }}
                                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all flex items-center space-x-1"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Approve</span>
                              </button>
                            )}
                            <button
                              onClick={() => {
                                deleteSuggestion(s.id);
                                logAdminActivity(`Deleted suggestion '${s.title || s.subject}'`, 'Suggestion');
                              }}
                              className="p-1.5 rounded-xl text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30"
                              title="Delete Suggestion"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            {/* ================================================================= */}
            {/* TAB 3: ✅ PENDING NOTES REVIEW */}
            {/* ================================================================= */}
            {activeTab === 'pending_notes' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-base font-extrabold text-white flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                      <span>Student Peer Uploaded Notes</span>
                    </h3>
                    <p className="text-xs text-slate-400">Approve student notes to publish them live to the materials library</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    {pendingNotes} Pending
                  </span>
                </div>

                {allMaterials.filter(m => m.status === 'pending').length === 0 ? (
                  <div className="p-8 text-center bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                    <p className="text-sm font-bold text-white">All Notes Reviewed!</p>
                    <p className="text-xs text-slate-400">There are no pending student notes awaiting approval.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {allMaterials.filter(m => m.status === 'pending').map(m => (
                      <div key={m.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-white">{m.title}</p>
                          <p className="text-xs text-slate-400">{m.subjectName} • {m.year} Sem {m.semester} ({m.category})</p>
                          <p className="text-[10px] text-slate-500">Uploaded by: {m.uploaderName || 'Alex Student'}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              updateMaterialStatus(m.id, 'approved');
                              logAdminActivity(`Approved note '${m.title}'`, 'Note');
                            }}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center space-x-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve & Publish</span>
                          </button>
                          <button
                            onClick={() => {
                              removeMaterial(m.id);
                              logAdminActivity(`Rejected/Deleted note '${m.title}'`, 'Note');
                            }}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white flex items-center space-x-1"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ================================================================= */}
            {/* TAB 4: 🛡️ INTERVIEW EXPERIENCES */}
            {/* ================================================================= */}
            {activeTab === 'interview_exp' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-base font-extrabold text-white flex items-center space-x-2">
                      <GraduationCap className="w-5 h-5 text-indigo-400" />
                      <span>Student Interview Experiences Moderation</span>
                    </h3>
                    <p className="text-xs text-slate-400">Review student placement experience stories before publishing</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                    {(interviewExperiences || []).filter(e => !e.approved).length} Pending
                  </span>
                </div>

                {(interviewExperiences || []).length === 0 ? (
                  <div className="p-8 text-center bg-slate-950 rounded-2xl border border-slate-800">
                    <p className="text-sm font-bold text-white">No Interview Experiences Submitted Yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(interviewExperiences || []).map(exp => (
                      <div key={exp.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-bold text-white">{exp.studentName} — {exp.companyName}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              exp.approved ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                            }`}>
                              {exp.approved ? 'Approved ✓' : 'Pending Review'}
                            </span>
                          </div>
                          <div className="flex space-x-2">
                            {!exp.approved && (
                              <button
                                onClick={() => {
                                  updateInterviewExperienceStatus(exp.id, true);
                                  logAdminActivity(`Approved interview experience for ${exp.companyName}`, 'InterviewExp');
                                }}
                                className="px-3 py-1 rounded-xl text-xs font-bold bg-emerald-600 text-white"
                              >
                                Approve
                              </button>
                            )}
                            <button
                              onClick={() => {
                                removeInterviewExperience(exp.id);
                                logAdminActivity(`Deleted interview experience`, 'InterviewExp');
                              }}
                              className="p-1 text-rose-400 hover:bg-rose-500/10 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">"{exp.feedback || exp.tips}"</p>
                        <p className="text-[10px] text-slate-500">Role: {exp.role || 'SDE-1'} • Package: {exp.ctc || '8.5 LPA'}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ================================================================= */}
            {/* TAB 5: 🚩 REPORTED ISSUES */}
            {/* ================================================================= */}
            {activeTab === 'reports' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-base font-extrabold text-white flex items-center space-x-2">
                      <Flag className="w-5 h-5 text-rose-400" />
                      <span>Reported Content Issues</span>
                    </h3>
                    <p className="text-xs text-slate-400">Broken file links, incorrect syllabus, or copyrighted materials</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                    {openReports} Open Reports
                  </span>
                </div>

                {(reports || []).length === 0 ? (
                  <div className="p-8 text-center bg-slate-950 rounded-2xl border border-slate-800">
                    <p className="text-sm font-bold text-white">No Reported Issues!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {reports.map(rep => (
                      <div key={rep.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                        <div>
                          <p className="text-sm font-bold text-white">{rep.materialTitle || 'Study Material'}</p>
                          <p className="text-xs text-rose-400 font-semibold">Reason: {rep.reason || rep.description}</p>
                          <p className="text-[10px] text-slate-500">Reported by: {rep.reporterName || 'Student'}</p>
                        </div>
                        <div className="flex space-x-2">
                          {rep.status !== 'resolved' && (
                            <button
                              onClick={() => {
                                updateReportStatus(rep.id, 'resolved');
                                logAdminActivity(`Resolved report issue`, 'Report');
                              }}
                              className="px-3 py-1 rounded-xl text-xs font-bold bg-emerald-600 text-white"
                            >
                              Resolve
                            </button>
                          )}
                          <button
                            onClick={() => {
                              deleteReport(rep.id);
                              logAdminActivity(`Dismissed report`, 'Report');
                            }}
                            className="p-1 text-slate-400 hover:text-white"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ================================================================= */}
            {/* TAB 6: 📖 SUBJECT CATALOG MANAGEMENT */}
            {/* ================================================================= */}
            {activeTab === 'subjects' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-base font-extrabold text-white flex items-center space-x-2">
                      <BookOpen className="w-5 h-5 text-indigo-400" />
                      <span>IT Department Subject Catalog</span>
                    </h3>
                    <p className="text-xs text-slate-400">Add, edit, or remove subjects for each semester</p>
                  </div>

                  <button
                    onClick={() => handleOpenSubjectModal(null)}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 flex items-center space-x-1.5 self-start sm:self-auto"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Subject</span>
                  </button>
                </div>

                {/* Semester Selector Bar */}
                <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                    <button
                      key={sem}
                      onClick={() => setSubjectSemFilter(sem)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        subjectSemFilter === sem ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      Sem {sem}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredSubjects.map(sub => (
                    <div key={sub.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            {sub.code}
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold">{sub.type}</span>
                        </div>
                        <h4 className="text-sm font-bold text-white mt-1 line-clamp-2">{sub.name}</h4>
                      </div>

                      <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800/80">
                        <button
                          onClick={() => handleOpenSubjectModal(sub)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                          title="Edit Subject"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            removeSubject(sub.id);
                            logAdminActivity(`Deleted subject '${sub.name}'`, 'Subject');
                          }}
                          className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10"
                          title="Delete Subject"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ================================================================= */}
            {/* TAB 7: 🧠 BRAINZONE MANAGEMENT (Quiz, Missions, Facts, Polls) */}
            {/* ================================================================= */}
            {activeTab === 'brainzone_challenges' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-base font-extrabold text-white flex items-center space-x-2">
                      <Zap className="w-5 h-5 text-cyan-400" />
                      <span>60-Second Quiz Questions Pool</span>
                    </h3>
                    <p className="text-xs text-slate-400">Add or edit rapid-fire IT trivia questions</p>
                  </div>
                  <button
                    onClick={() => setQuizModalOpen(true)}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-cyan-600 text-white flex items-center space-x-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Question</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {(quizQuestions || []).map(q => (
                    <div key={q.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-cyan-300">{q.category}</span>
                        <button onClick={() => removeQuizQuestion(q.id)} className="p-1 text-rose-400"><Trash2 className="w-4 h-4" /></button>
                      </div>
                      <p className="text-sm font-bold text-white">{q.q}</p>
                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                        {q.options?.map((opt, i) => (
                          <div key={i} className={`p-2 rounded-xl border ${i === q.answer ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300' : 'border-slate-800 bg-slate-900'}`}>
                            {opt} {i === q.answer ? '✓' : ''}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'brainzone_facts' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-base font-extrabold text-white flex items-center space-x-2">
                      <Lightbulb className="w-5 h-5 text-amber-400" />
                      <span>Daily IT Facts & Tech Trivia</span>
                    </h3>
                    <p className="text-xs text-slate-400">Add daily facts displayed on the BrainZone Arcade</p>
                  </div>
                  <button
                    onClick={() => setFactModalOpen(true)}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-600 text-white flex items-center space-x-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Fact</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {(itFacts || []).map((f, i) => (
                    <div key={f.id || i} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                      <div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300">{f.category || 'Tech Trivia'}</span>
                        <p className="text-xs text-slate-200 mt-1 italic">"{f.fact}"</p>
                      </div>
                      <button onClick={() => removeITFact(f.id || f.fact)} className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ================================================================= */}
            {/* TAB 8: 🏢 COMPANY DRIVES & EVENTS */}
            {/* ================================================================= */}
            {activeTab === 'companies' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-base font-extrabold text-white flex items-center space-x-2">
                      <Briefcase className="w-5 h-5 text-blue-400" />
                      <span>Company Recruitment Drives</span>
                    </h3>
                    <p className="text-xs text-slate-400">Post upcoming campus drives, eligibility criteria & CGPA cutoffs</p>
                  </div>
                  <button
                    onClick={() => onOpenAdminForm && onOpenAdminForm('company')}
                    className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Company Drive</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(placementCompanies || []).map(c => (
                    <div key={c.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-base font-bold text-white">{c.companyName}</h4>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/20 text-blue-300">{c.cgpaCutoff} CGPA</span>
                      </div>
                      <p className="text-xs text-slate-300">{c.eligibilityCriteria}</p>
                      <p className="text-[10px] text-slate-500">Drive Date: {c.driveDate}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'events' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-base font-extrabold text-white flex items-center space-x-2">
                      <Trophy className="w-5 h-5 text-amber-400" />
                      <span>Events & Hackathons</span>
                    </h3>
                    <p className="text-xs text-slate-400">Manage campus hackathons, webinars & prize details</p>
                  </div>
                  <button
                    onClick={() => onOpenAdminForm && onOpenAdminForm('event')}
                    className="px-3 py-1.5 rounded-xl bg-purple-600 text-white text-xs font-bold flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Event</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(events || []).map(e => (
                    <div key={e.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-base font-bold text-white">{e.title}</h4>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300">{e.type}</span>
                      </div>
                      <p className="text-xs text-slate-300 line-clamp-2">{e.description}</p>
                      <p className="text-xs font-bold text-amber-400">Prize: {e.prizeDetails}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ================================================================= */}
            {/* TAB 9: 👥 USER DIRECTORY */}
            {/* ================================================================= */}
            {activeTab === 'user_directory' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-base font-extrabold text-white flex items-center space-x-2">
                      <Users className="w-5 h-5 text-cyan-400" />
                      <span>Registered User Directory ({filteredUsers.length})</span>
                    </h3>
                    <p className="text-xs text-slate-400">Manage student and faculty account roles & permissions</p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="Search name/email..."
                        value={userSearchTerm}
                        onChange={(e) => setUserSearchTerm(e.target.value)}
                        className="pl-8 pr-3 py-1.5 bg-slate-950 text-xs text-slate-100 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <button onClick={handleExportUsers} className="px-3 py-1.5 rounded-xl bg-cyan-600 text-white text-xs font-bold flex items-center space-x-1">
                      <Download className="w-3.5 h-3.5" />
                      <span>Export CSV</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {filteredUsers.map(u => (
                    <div key={u.uid || u.id} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs gap-3">
                      <div>
                        <p className="font-bold text-white flex items-center gap-2">
                          <span>{u.name}</span>
                          <span className={`px-2 py-0.2 rounded text-[10px] font-bold ${
                            u.role === 'admin' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-300'
                          }`}>
                            {u.role || 'student'}
                          </span>
                        </p>
                        <p className="text-slate-400 text-[11px]">{u.email} • {u.year || '3rd Year'} ({u.classSection || 'IT-A'})</p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            const newRole = u.role === 'admin' ? 'student' : 'admin';
                            updateUserRole(u.uid || u.id, newRole);
                          }}
                          className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold"
                        >
                          Toggle {u.role === 'admin' ? 'Student' : 'Admin'} Role
                        </button>
                        <button
                          onClick={() => {
                            removeRegisteredUser(u.uid || u.id);
                            logAdminActivity(`Deleted user account '${u.name}'`, 'User');
                          }}
                          className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-xl"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ================================================================= */}
            {/* TAB 10: 📜 ACTIVITY LOG */}
            {/* ================================================================= */}
            {activeTab === 'activity_log' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-base font-extrabold text-white flex items-center space-x-2">
                      <Activity className="w-5 h-5 text-emerald-400" />
                      <span>Real-time Admin Audit Activity Log</span>
                    </h3>
                    <p className="text-xs text-slate-400">Audit trail of all administrative actions & system updates</p>
                  </div>
                  <button onClick={clearActivityLogs} className="px-3 py-1 rounded-xl bg-rose-600/20 text-rose-300 border border-rose-500/40 text-xs font-bold">
                    Clear Log History
                  </button>
                </div>

                <div className="space-y-2">
                  {(activityLog || []).map(log => (
                    <div key={log.id} className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-white">{log.action}</p>
                        <p className="text-[10px] text-slate-400">By {log.adminName} • Target: {log.targetType}</p>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ================================================================= */}
            {/* TAB 11: ⚙️ SITE SETTINGS & MAINTENANCE */}
            {/* ================================================================= */}
            {activeTab === 'site_settings' && (
              <div className="space-y-6 animate-in fade-in">
                <h3 className="text-base font-extrabold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                  <Settings className="w-5 h-5 text-amber-400" />
                  <span>Site Configuration & Emergency Maintenance Controls</span>
                </h3>

                <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-5">
                  
                  {/* Maintenance Mode Toggle */}
                  <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950 border border-amber-500/40">
                    <div>
                      <p className="text-sm font-bold text-amber-300">🚧 Emergency Maintenance Mode</p>
                      <p className="text-xs text-slate-400">When enabled, locks site for non-admin students with a maintenance message.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={siteConfigForm.maintenanceMode}
                      onChange={(e) => {
                        const updated = { ...siteConfigForm, maintenanceMode: e.target.checked };
                        setSiteConfigForm(updated);
                        updateSiteConfig(updated);
                      }}
                      className="w-5 h-5 accent-amber-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Maintenance Display Message</label>
                    <textarea
                      rows={2}
                      value={siteConfigForm.maintenanceMessage}
                      onChange={(e) => setSiteConfigForm({ ...siteConfigForm, maintenanceMessage: e.target.value })}
                      className="w-full p-3 bg-slate-950 text-xs text-slate-100 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-500"
                    />
                    <button
                      onClick={() => updateSiteConfig(siteConfigForm)}
                      className="mt-2 px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 text-white shadow-md"
                    >
                      Save Maintenance Message
                    </button>
                  </div>

                  {/* BrainZone Enabled Toggle */}
                  <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950 border border-slate-800">
                    <div>
                      <p className="text-sm font-bold text-purple-300">🧠 BrainZone Arcade Feature Access</p>
                      <p className="text-xs text-slate-400">Toggle whether students can access the BrainZone engagement hub.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={siteConfigForm.brainZoneEnabled}
                      onChange={(e) => {
                        const updated = { ...siteConfigForm, brainZoneEnabled: e.target.checked };
                        setSiteConfigForm(updated);
                        updateSiteConfig(updated);
                      }}
                      className="w-5 h-5 accent-purple-500 cursor-pointer"
                    />
                  </div>

                </div>
              </div>
            )}

            {/* ================================================================= */}
            {/* TAB 12: 📤 EXPORT DATA */}
            {/* ================================================================= */}
            {activeTab === 'export_data' && (
              <div className="space-y-6 animate-in fade-in">
                <h3 className="text-base font-extrabold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                  <Download className="w-5 h-5 text-cyan-400" />
                  <span>Data Exporters (CSV Downloads)</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <Users className="w-8 h-8 text-cyan-400" />
                    <div>
                      <p className="text-sm font-bold text-white">Registered Users CSV</p>
                      <p className="text-xs text-slate-400">Export student list, classes, emails & XP scores.</p>
                    </div>
                    <button onClick={handleExportUsers} className="w-full py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md">
                      Export Users CSV
                    </button>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <FileText className="w-8 h-8 text-emerald-400" />
                    <div>
                      <p className="text-sm font-bold text-white">Download Analytics CSV</p>
                      <p className="text-xs text-slate-400">Export study material download counts & categories.</p>
                    </div>
                    <button onClick={handleExportDownloadStats} className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md">
                      Export Download Stats CSV
                    </button>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <Briefcase className="w-8 h-8 text-indigo-400" />
                    <div>
                      <p className="text-sm font-bold text-white">Placement Drives CSV</p>
                      <p className="text-xs text-slate-400">Export active placement companies & eligibility cutoffs.</p>
                    </div>
                    <button onClick={handleExportPlacementDrives} className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md">
                      Export Placement Drives CSV
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* DEFAULT FALLBACK FOR TIMETABLES & OTHER SPECIFIC TABS */}
            {activeTab === 'timetables' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-base font-extrabold text-white">Timetables Management</h3>
                    <p className="text-xs text-slate-400">Manage class timetables, internal test schedules & semester exams</p>
                  </div>
                  <button onClick={() => onOpenAdminForm && onOpenAdminForm('timetable')} className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center space-x-1">
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Timetable</span>
                  </button>
                </div>
                <div className="space-y-2">
                  {(timetables || []).map(t => (
                    <div key={t.id} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold text-white">{t.title}</p>
                        <p className="text-slate-400 text-[11px]">{t.year} • Sem {t.semester}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button onClick={() => toggleTimetableStatus(t.id)} className="px-2 py-1 bg-slate-800 rounded text-[10px] text-slate-200">
                          {t.status === 'archived' ? 'Unarchive' : 'Archive'}
                        </button>
                        <button onClick={() => removeTimetable(t.id)} className="p-1 text-rose-400"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

      </div>

      {/* SUBJECT ADD/EDIT MODAL */}
      {subjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="glass-panel rounded-3xl max-w-md w-full p-6 border border-slate-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">
                {editingSubject ? 'Edit Subject' : 'Add New Subject'}
              </h3>
              <button onClick={() => setSubjectModalOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubject} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Subject Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Systems"
                  value={subjectForm.name}
                  onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-950 text-xs text-white rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Subject Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. IT3501"
                    value={subjectForm.code}
                    onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 text-xs text-white rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Semester</label>
                  <select
                    value={subjectForm.semester}
                    onChange={(e) => setSubjectForm({ ...subjectForm, semester: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-950 text-xs text-white rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Course Type</label>
                <select
                  value={subjectForm.type}
                  onChange={(e) => setSubjectForm({ ...subjectForm, type: e.target.value })}
                  className="w-full p-2.5 bg-slate-950 text-xs text-white rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500"
                >
                  <option value="Theory">Theory</option>
                  <option value="Lab">Practical / Lab</option>
                  <option value="Elective">Professional Elective</option>
                </select>
              </div>

              <div className="pt-3 flex space-x-2">
                <button
                  type="button"
                  onClick={() => setSubjectModalOpen(false)}
                  className="flex-1 py-2 rounded-xl text-xs font-bold bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white shadow-md"
                >
                  {editingSubject ? 'Update Subject' : 'Create Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUIZ QUESTION ADD MODAL */}
      {quizModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="glass-panel rounded-3xl max-w-md w-full p-6 border border-slate-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Add 60-Second Quiz Question</h3>
              <button onClick={() => setQuizModalOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuizQuestion} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Question Text</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. What does HTTP stand for?"
                  value={quizForm.q}
                  onChange={(e) => setQuizForm({ ...quizForm, q: e.target.value })}
                  className="w-full p-2.5 bg-slate-950 text-xs text-white rounded-xl border border-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400">Option 1</label>
                  <input type="text" required value={quizForm.option0} onChange={(e) => setQuizForm({ ...quizForm, option0: e.target.value })} className="w-full p-2 bg-slate-950 text-xs text-white rounded-lg border border-slate-800" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400">Option 2</label>
                  <input type="text" required value={quizForm.option1} onChange={(e) => setQuizForm({ ...quizForm, option1: e.target.value })} className="w-full p-2 bg-slate-950 text-xs text-white rounded-lg border border-slate-800" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400">Option 3</label>
                  <input type="text" value={quizForm.option2} onChange={(e) => setQuizForm({ ...quizForm, option2: e.target.value })} className="w-full p-2 bg-slate-950 text-xs text-white rounded-lg border border-slate-800" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400">Option 4</label>
                  <input type="text" value={quizForm.option3} onChange={(e) => setQuizForm({ ...quizForm, option3: e.target.value })} className="w-full p-2 bg-slate-950 text-xs text-white rounded-lg border border-slate-800" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Correct Option Index</label>
                <select value={quizForm.answer} onChange={(e) => setQuizForm({ ...quizForm, answer: Number(e.target.value) })} className="w-full p-2 bg-slate-950 text-xs text-white rounded-xl border border-slate-800">
                  <option value={0}>Option 1 is Correct</option>
                  <option value={1}>Option 2 is Correct</option>
                  <option value={2}>Option 3 is Correct</option>
                  <option value={3}>Option 4 is Correct</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Target Difficulty Level</label>
                <select
                  value={quizForm.difficulty || 'intermediate'}
                  onChange={(e) => setQuizForm({ ...quizForm, difficulty: e.target.value })}
                  className="w-full p-2 bg-slate-950 text-xs text-white rounded-xl border border-slate-800"
                >
                  <option value="beginner">🟢 Beginner (1.0x XP)</option>
                  <option value="intermediate">🟡 Intermediate (1.5x XP)</option>
                  <option value="advanced">🔴 Advanced (2.0x XP)</option>
                </select>
              </div>

              <button type="submit" className="w-full py-2.5 rounded-xl text-xs font-bold bg-cyan-600 text-white shadow-md">
                Save Question
              </button>
            </form>
          </div>
        </div>
      )}

      {/* IT FACT ADD MODAL */}
      {factModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="glass-panel rounded-3xl max-w-md w-full p-6 border border-slate-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Add IT Fact of the Day</h3>
              <button onClick={() => setFactModalOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveITFact} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Fact Text / Tech Trivia</label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. The first computer mouse was made of wood in 1964 by Doug Engelbart."
                  value={factForm.fact}
                  onChange={(e) => setFactForm({ ...factForm, fact: e.target.value })}
                  className="w-full p-3 bg-slate-950 text-xs text-white rounded-xl border border-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Category Tag</label>
                <input
                  type="text"
                  placeholder="e.g. CS History / Hardware / Programming"
                  value={factForm.category}
                  onChange={(e) => setFactForm({ ...factForm, category: e.target.value })}
                  className="w-full p-2.5 bg-slate-950 text-xs text-white rounded-xl border border-slate-800"
                />
              </div>

              <button type="submit" className="w-full py-2.5 rounded-xl text-xs font-bold bg-amber-600 text-white shadow-md">
                Add IT Fact
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
