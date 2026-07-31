import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { 
  User, 
  Calendar, 
  Bookmark, 
  LineChart as ChartIcon, 
  ShieldCheck, 
  Clock, 
  FileText, 
  Sparkles, 
  Plus, 
  Trash2, 
  Printer, 
  AlertTriangle, 
  GraduationCap, 
  CheckCircle2, 
  Award, 
  Edit3,
  ExternalLink,
  Camera,
  Upload,
  Calculator,
  Bell,
  BellOff,
  Trophy,
  BookOpen,
  Users,
  Target,
  Save,
  RefreshCw,
  RotateCcw,
  Check,
  Brain
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar, Legend } from 'recharts';
import { SemesterTargetCalculator } from '../components/SemesterTargetCalculator';
import { ProfessionalProfilesSection } from '../components/ProfessionalProfilesSection';
import { getBorderObj, getTitleObj, getAvatarBgObj } from '../utils/cosmetics';


export const StudentProfile = ({ onPreviewMaterial, onOpenAdminForm, onOpenAdminManagement, onOpenUserDirectory }) => {
  const { currentUser, isAdmin, updateUserProfile, toggleMuteCategory } = useAuth();
  const { 
    subjects,
    timetables, 
    materials,
    allMaterials, 
    aiTools,
    allAiTools, 
    favorites, 
    toggleFavoriteItem,
    studentMarks,
    addOrUpdateMark,
    removeMark,
    customTimetable,
    updateStudentCustomTimetable,
    resetStudentCustomTimetable
  } = useData();

  const [profileTab, setProfileTab] = useState('timetable'); // 'timetable' | 'favorites' | 'marks' | 'preferences'
  const [showSaveToast, setShowSaveToast] = useState(false);
  const [timetableSubFilter, setTimetableSubFilter] = useState('all'); // 'all' | 'class' | 'internal' | 'semester'
  const [selectedInternalTest, setSelectedInternalTest] = useState('Internal 1');
  const [marksSubTab, setMarksSubTab] = useState('internal_marks'); // 'internal_marks' | 'calculator' | 'sgpa'

  // Calculate SGPA and CGPA metrics
  const currentSgpaData = currentUser?.sgpaData || {};

  const calculateSgpaMetrics = (sgpaData) => {
    const completed = [];
    for (let sem = 1; sem <= 8; sem++) {
      const val = sgpaData[sem] ?? sgpaData[String(sem)];
      if (val !== undefined && val !== null && val !== '') {
        const num = Number(val);
        if (!isNaN(num) && num >= 0 && num <= 10) {
          completed.push({ sem, sgpa: num });
        }
      }
    }
    if (completed.length === 0) {
      return { completedSemesters: [], currentSgpa: null, overallCgpa: null, latestSem: null };
    }
    const sum = completed.reduce((acc, curr) => acc + curr.sgpa, 0);
    const overallCgpa = sum / completed.length;
    const highestSemObj = completed.reduce((prev, curr) => (prev.sem > curr.sem ? prev : curr), completed[0]);
    return {
      completedSemesters: completed,
      currentSgpa: highestSemObj ? highestSemObj.sgpa : null,
      overallCgpa,
      latestSem: highestSemObj ? highestSemObj.sem : null
    };
  };

  const { completedSemesters, currentSgpa, overallCgpa, latestSem } = calculateSgpaMetrics(currentSgpaData);

  const currentSgpaDisplay = currentSgpa !== null ? `${currentSgpa.toFixed(2)} / 10` : 'N/A';
  const overallCgpaDisplay = overallCgpa !== null ? `${overallCgpa.toFixed(2)} / 10` : 'N/A';

  const [sgpaInputs, setSgpaInputs] = useState(() => {
    const initial = {};
    for (let s = 1; s <= 8; s++) {
      const val = currentUser?.sgpaData?.[s] ?? currentUser?.sgpaData?.[String(s)];
      initial[s] = val !== undefined && val !== null ? String(val) : '';
    }
    return initial;
  });

  React.useEffect(() => {
    if (currentUser?.sgpaData) {
      setSgpaInputs(prev => {
        const updated = { ...prev };
        for (let s = 1; s <= 8; s++) {
          const val = currentUser.sgpaData[s] ?? currentUser.sgpaData[String(s)];
          if (val !== undefined && val !== null) {
            updated[s] = String(val);
          }
        }
        return updated;
      });
    }
  }, [currentUser?.sgpaData]);

  const handleSgpaChange = (sem, value) => {
    setSgpaInputs(prev => ({ ...prev, [sem]: value }));
  };

  const handleSaveAllSgpas = (e) => {
    if (e) e.preventDefault();
    const newSgpaData = {};
    for (let s = 1; s <= 8; s++) {
      const rawVal = sgpaInputs[s];
      if (rawVal !== undefined && rawVal !== null && String(rawVal).trim() !== '') {
        const num = Number(rawVal);
        if (!isNaN(num) && num >= 0 && num <= 10) {
          newSgpaData[s] = Number(num.toFixed(2));
        }
      }
    }
    updateUserProfile({ sgpaData: newSgpaData });
    triggerSaveToast();
  };

  const handleClearSemesterSgpa = (sem) => {
    setSgpaInputs(prev => ({ ...prev, [sem]: '' }));
    const newSgpaData = { ...(currentUser?.sgpaData || {}) };
    delete newSgpaData[sem];
    delete newSgpaData[String(sem)];
    updateUserProfile({ sgpaData: newSgpaData });
    triggerSaveToast();
  };

  const triggerSaveToast = () => {
    setShowSaveToast(true);
    setTimeout(() => setShowSaveToast(false), 2000);
  };

  const allTTTypes = [
    { id: 'class', label: 'Class Timetable' },
    { id: 'internal', label: 'Internal Examination Timetable' },
    { id: 'semester', label: 'Semester Examination Timetable' }
  ];

  const currentPrefs = currentUser?.timetablePreferences || ['class', 'internal', 'semester'];

  const handleUpdatePrefOrder = (index, newValue) => {
    const updated = [...currentPrefs];
    const prevValueAtIdx = updated[index];
    const existingIdxOfNew = updated.indexOf(newValue);
    
    if (existingIdxOfNew !== -1 && existingIdxOfNew !== index) {
      // Swap items to guarantee no duplicate selections
      updated[existingIdxOfNew] = prevValueAtIdx;
    }
    updated[index] = newValue;

    updateUserProfile({ timetablePreferences: updated });
    triggerSaveToast();
  };

  const prefCategories = [
    {
      name: 'Exam Alert',
      description: 'Critical exam schedules, hall tickets, test timetables, and urgent assessment notices.',
      icon: AlertTriangle,
      iconColor: 'text-rose-400',
      badgeBg: 'bg-rose-500/20',
      badgeBorder: 'border-rose-500/40'
    },
    {
      name: 'Events',
      description: 'Campus hackathons, technical competitions, cultural drives, and sports events.',
      icon: Trophy,
      iconColor: 'text-purple-400',
      badgeBg: 'bg-purple-500/20',
      badgeBorder: 'border-purple-500/40'
    },
    {
      name: 'Workshop',
      description: 'Guest lectures, expert technical workshops, cloud/AI bootcamps, and webinars.',
      icon: Sparkles,
      iconColor: 'text-amber-400',
      badgeBg: 'bg-amber-500/20',
      badgeBorder: 'border-amber-500/40'
    },
    {
      name: 'Academic',
      description: 'Syllabus updates, lab workbook releases, PYQ answers, and class announcements.',
      icon: GraduationCap,
      iconColor: 'text-indigo-400',
      badgeBg: 'bg-indigo-500/20',
      badgeBorder: 'border-indigo-500/40'
    },
    {
      name: 'General',
      description: 'General department notices, holiday announcements, and student portal updates.',
      icon: Bell,
      iconColor: 'text-slate-400',
      badgeBg: 'bg-slate-500/20',
      badgeBorder: 'border-slate-500/40'
    }
  ];
  
  // Profile editing state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: currentUser?.name || '',
    registerNumber: currentUser?.registerNumber || '',
    year: currentUser?.year || '3rd Year',
    semester: currentUser?.semester || 5,
    classSection: currentUser?.classSection || 'IT-A',
    avatar: currentUser?.avatar || '',
    bio: currentUser?.bio || ''
  });

  // Custom Timetable Editing state
  const [isEditingTimetable, setIsEditingTimetable] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileForm(prev => ({ ...prev, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Helper: Determine period slot type (Theory / Lab / Placement)
  const getSlotType = (slot) => {
    if (slot.type) return slot.type;
    const subj = (slot.subject || '').toLowerCase();
    const rm = (slot.room || '').toLowerCase();
    if (subj.includes('lab') || subj.includes('practical') || rm.includes('lab')) return 'Lab';
    if (subj.includes('placement') || subj.includes('aptitude') || subj.includes('interview') || subj.includes('seminar')) return 'Placement';
    return 'Theory';
  };

  // Mark entry form state for Internal 1 and Internal 2 (Max 50 marks each)
  const [newMark, setNewMark] = useState({
    subject: '',
    semester: currentUser?.semester || 5,
    internal1: '',
    internal2: ''
  });

  // Dedicated Internal Marks Calculator state
  const [calcState, setCalcState] = useState({
    semester: currentUser?.semester || 5,
    subject: '',
    internal1: '',
    internal2: ''
  });

  const handleAddMarkSubmit = (e) => {
    e.preventDefault();
    if (!newMark.subject.trim()) return;

    const i1 = newMark.internal1 !== '' && newMark.internal1 !== null ? Math.min(50, Math.max(0, Number(newMark.internal1))) : null;
    const i2 = newMark.internal2 !== '' && newMark.internal2 !== null ? Math.min(50, Math.max(0, Number(newMark.internal2))) : null;

    addOrUpdateMark({
      id: `m-${Date.now()}`,
      subject: newMark.subject.trim(),
      semester: Number(newMark.semester),
      internal1: i1,
      internal2: i2,
      maxMarks: 50
    });

    setNewMark({
      subject: '',
      semester: currentUser?.semester || 5,
      internal1: '',
      internal2: ''
    });
  };

  if (!currentUser) {
    return (
      <div className="glass-panel rounded-3xl p-12 text-center text-slate-400 space-y-4">
        <User className="w-12 h-12 text-slate-600 mx-auto" />
        <h3 className="text-lg font-bold text-white">Please Sign In to Access Your Profile</h3>
        <p className="text-xs text-slate-400">View your class timetable, bookmarked materials, and personal marks tracker.</p>
      </div>
    );
  }

  // Find class default timetable matching student's Year + Semester + Class Section
  const userSection = (currentUser?.classSection || 'IT-A').toLowerCase();
  const classDefaultTimetable = (timetables || []).find(t => 
    t && (t.type || 'class') === 'class' &&
    t.year === currentUser?.year && 
    Number(t.semester) === Number(currentUser?.semester) && 
    (((t.classSection || '').toLowerCase() === userSection) || 
     (userSection.includes('a') && (t.classSection || '').toLowerCase().includes('a')))
  ) || (timetables || []).find(t => 
    t && (t.type || 'class') === 'class' &&
    t.year === currentUser?.year && 
    Number(t.semester) === Number(currentUser?.semester)
  ) || (timetables || []).find(t => (t.type || 'class') === 'class') || timetables?.[0];

  // Effective active timetable (customized or default)
  const studentTimetable = customTimetable || classDefaultTimetable;

  // Resolve favorite items
  const rawMaterials = allMaterials || materials || [];
  const rawAiTools = allAiTools || aiTools || [];
  const savedMaterials = rawMaterials.filter(m => favorites?.materialIds?.includes(m.id));
  const savedAiTools = rawAiTools.filter(t => favorites?.aiToolIds?.includes(t.id));

  const handlePrintTimetable = () => {
    window.print();
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* STUDENT PROFILE CARD HEADER */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          
          {/* User Avatar & Info */}
          <div className="flex items-start sm:items-center space-x-4 sm:space-x-5">
            {(() => {
              const borderObj = getBorderObj(currentUser.equippedBorder || currentUser.equippedBorderId || 'default');
              const avatarBgObj = getAvatarBgObj(currentUser.equippedAvatarBgId || currentUser.equippedAvatarBackgroundId || 'bg_slate');
              const titleObj = getTitleObj(currentUser.equippedTitleId || currentUser.equippedTitle || 'title_novice');

              return (
                <>
                  <div className="relative group flex-shrink-0">
                    <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl p-0.5 border-2 transition-all ${borderObj.color}`}>
                      {currentUser.avatar ? (
                        <img 
                          src={currentUser.avatar} 
                          alt={currentUser.name} 
                          className="w-full h-full rounded-[14px] object-cover"
                        />
                      ) : (
                        <div className={`w-full h-full rounded-[14px] ${avatarBgObj.gradient} flex items-center justify-center text-white text-2xl font-black shadow-xl`}>
                          {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'S'}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setProfileForm({
                          name: currentUser.name || '',
                          registerNumber: currentUser.registerNumber || '',
                          year: currentUser.year || '3rd Year',
                          semester: currentUser.semester || 5,
                          classSection: currentUser.classSection || 'IT-A',
                          avatar: currentUser.avatar || '',
                          bio: currentUser.bio || ''
                        });
                        setIsEditingProfile(true);
                      }}
                      className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-brand-600 hover:bg-brand-500 text-white border border-slate-900 shadow transition-transform hover:scale-110"
                      title="Change Photo & Profile Info"
                    >
                      <Camera className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <h1 className="text-xl sm:text-2xl font-extrabold text-white truncate">{currentUser.name}</h1>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        isAdmin 
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                          : 'bg-brand-500/20 text-brand-300 border border-brand-500/40'
                      }`}>
                        {isAdmin ? 'Admin' : 'Student'}
                      </span>
                      {titleObj && (
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border shadow-sm ${titleObj.badgeBg}`}>
                          🏷️ {titleObj.title}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">{currentUser.email}</p>
                    {currentUser.bio && (
                      <p className="text-xs text-slate-300 italic max-w-md">"{currentUser.bio}"</p>
                    )}
                    
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-medium">
                      {currentUser.registerNumber && (
                        <span className="px-2.5 py-1 rounded-lg bg-indigo-950/60 text-indigo-300 border border-indigo-500/30 font-mono">
                          Reg No: {currentUser.registerNumber}
                        </span>
                      )}
                      {!isAdmin ? (
                        <>
                          <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-slate-300 border border-slate-800">
                            {currentUser.year}
                          </span>
                          <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-slate-300 border border-slate-800">
                            Semester {currentUser.semester}
                          </span>
                          <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-brand-300 border border-brand-500/30">
                            Class: {currentUser.classSection === 'IT-A' ? 'Class A' : currentUser.classSection === 'IT-B' ? 'Class B' : currentUser.classSection === 'IT-C' ? 'Class C' : (currentUser.classSection || 'Class A')}
                          </span>
                          <span className="px-2.5 py-1 rounded-lg bg-indigo-950/80 text-indigo-300 border border-indigo-500/40 font-bold flex items-center space-x-1.5 shadow-sm">
                            <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                            <span>Current SGPA: {currentSgpaDisplay}</span>
                          </span>
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 font-bold flex items-center space-x-1.5 shadow-sm">
                            <Trophy className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Overall CGPA: {overallCgpaDisplay}</span>
                          </span>
                          <span className="px-2.5 py-1 rounded-lg bg-purple-950/80 text-purple-300 border border-purple-500/40 font-bold flex items-center space-x-1.5 shadow-sm">
                            <Brain className="w-3.5 h-3.5 text-purple-400" />
                            <span>BrainZone: {currentUser.funPoints || 450} XP • 🔥 {currentUser.streak || 5}d</span>
                          </span>
                        </>
                      ) : (
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 font-bold flex items-center space-x-1.5 shadow-sm">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Role: Administrator</span>
                        </span>
                      )}
                    </div>
                  </div>
                </>
              );
            })()}
          </div>

          {/* Action Buttons: Edit Profile & Manage Timetables */}
          <div className="flex items-center gap-3 self-start md:self-center flex-shrink-0 pt-2 md:pt-0">
            <button
              onClick={() => {
                setProfileForm({
                  name: currentUser.name || '',
                  registerNumber: currentUser.registerNumber || '',
                  year: currentUser.year || '3rd Year',
                  semester: currentUser.semester || 5,
                  classSection: currentUser.classSection || 'IT-A',
                  avatar: currentUser.avatar || '',
                  bio: currentUser.bio || ''
                });
                setIsEditingProfile(true);
              }}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 shadow-md transition-all hover:border-slate-600"
            >
              <Edit3 className="w-4 h-4 text-brand-400" />
              <span>Edit Profile</span>
            </button>

            {isAdmin && (
              <>
                <button
                  onClick={() => onOpenUserDirectory && onOpenUserDirectory()}
                  className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-600/20 transition-all hover:scale-[1.02]"
                  title="User Directory & Activity Analytics"
                >
                  <Users className="w-4 h-4 text-cyan-100" />
                  <span>User Directory & Analytics</span>
                </button>

                <button
                  onClick={() => onOpenAdminManagement ? onOpenAdminManagement('subjects') : onOpenAdminForm('timetable')}
                  className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition-all hover:scale-[1.02]"
                  title="Manage subjects for each semester"
                >
                  <BookOpen className="w-4 h-4 text-indigo-200" />
                  <span>Manage Semesters & Subjects</span>
                </button>

                <button
                  onClick={() => onOpenAdminForm('timetable')}
                  className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.02]"
                >
                  <Plus className="w-4 h-4" />
                  <span>Manage Timetables</span>
                </button>
              </>
            )}
          </div>

        </div>
      </div>

      {/* PROFILE NAVIGATION TABS */}
      <div className="flex bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 max-w-3xl overflow-x-auto scrollbar-none gap-1">
        <button
          onClick={() => setProfileTab('timetable')}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-1.5 whitespace-nowrap ${
            profileTab === 'timetable'
              ? 'bg-brand-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Timetables</span>
        </button>

        <button
          onClick={() => setProfileTab('favorites')}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-1.5 whitespace-nowrap ${
            profileTab === 'favorites'
              ? 'bg-brand-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Bookmark className="w-4 h-4 text-amber-400" />
          <span>Saved Favorites ({savedMaterials.length + savedAiTools.length})</span>
        </button>

        <button
          onClick={() => setProfileTab('marks')}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-1.5 whitespace-nowrap ${
            profileTab === 'marks'
              ? 'bg-brand-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ChartIcon className="w-4 h-4 text-accent-cyan" />
          <span>Self-Marks Tracker</span>
        </button>

        <button
          onClick={() => setProfileTab('preferences')}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-1.5 whitespace-nowrap ${
            profileTab === 'preferences'
              ? 'bg-brand-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Bell className="w-4 h-4 text-rose-400" />
          <span>Notification Preferences</span>
        </button>
      </div>

      {/* TAB 1: UNIFIED TIMETABLES VIEW (Class, Internal Exam, Semester Exam in Student Preferred Order) */}
      {profileTab === 'timetable' && (
        <div className="space-y-8">
          
          {/* PROFESSIONAL PROFILES SECTION */}
          <ProfessionalProfilesSection />

          {/* Quick Sub-Navigation / Preference Filter Bar */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Display Order:</span>
            {[
              { id: 'all', label: '📋 View All (Preferred Order)' },
              { id: 'class', label: '📅 Class Timetable' },
              { id: 'internal', label: '📝 Internal Exam Timetable' },
              { id: 'semester', label: '🎓 Semester Exam Timetable' }
            ].map(subTab => (
              <button
                key={subTab.id}
                onClick={() => setTimetableSubFilter(subTab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  timetableSubFilter === subTab.id
                    ? 'bg-brand-600 text-white shadow-md'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {subTab.label}
              </button>
            ))}
          </div>

          {/* Render Timetable Cards in Student Preferred Order */}
          {(() => {
            const userPrefs = currentUser?.timetablePreferences || ['class', 'internal', 'semester'];
            const orderedTypes = timetableSubFilter === 'all' ? userPrefs : [timetableSubFilter];

            return (
              <div className="space-y-8">
                {orderedTypes.map(type => {
                  
                  // TYPE 1: CLASS TIMETABLE
                  if (type === 'class') {
                    return (
                      <div key="class-tt" id="printable-timetable" className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6">
                        
                        {/* Header & Controls */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-5 h-5 text-brand-400" />
                              <h2 className="text-lg font-bold text-white">
                                Class Timetable — {studentTimetable?.classSection || currentUser.classSection}
                              </h2>
                              {customTimetable ? (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                                  Customized View
                                </span>
                              ) : (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-500/20 text-brand-300 border border-brand-500/40">
                                  Official Class Schedule
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-400 mt-1">
                              Auto-assigned schedule for {currentUser.year}, Semester {currentUser.semester} ({currentUser.classSection || 'IT-3A'})
                            </p>
                          </div>

                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                setEditingSchedule(JSON.parse(JSON.stringify(studentTimetable.schedule)));
                                setIsEditingTimetable(true);
                              }}
                              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white shadow-md shadow-brand-600/20"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Customize Timetable</span>
                            </button>

                            {customTimetable && (
                              <button
                                onClick={() => resetStudentCustomTimetable()}
                                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 border border-rose-500/30"
                                title="Reset schedule to default class timetable"
                              >
                                Reset Default
                              </button>
                            )}

                            <button
                              onClick={handlePrintTimetable}
                              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Print</span>
                            </button>
                          </div>
                        </div>

                        {/* Color-Coding Legend Bar */}
                        <div className="flex flex-wrap items-center gap-2.5 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs">
                          <span className="font-bold text-slate-300 text-[11px] uppercase tracking-wider">Color Legend:</span>
                          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-yellow-950/80 text-yellow-300 border border-yellow-500/60 font-bold">
                            <span>🎯 Placement: CE, ADS, FSWD Lab, Aptitude</span>
                          </div>
                          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-blue-950/80 text-blue-300 border border-blue-500/60 font-bold">
                            <span>🔵 Blue: Mini Project</span>
                          </div>
                          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-cyan-950/80 text-cyan-300 border border-cyan-500/60 font-bold">
                            <span>🥼 Cyan: Practical Lab Sessions</span>
                          </div>
                          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 font-bold">
                            <span>📚 Dark: Theory Lectures (FSWD, ESIOT, STA, BDA, CN, DC)</span>
                          </div>
                        </div>

                        {/* Timetable Schedule Grid (8 Periods) */}
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs border-collapse min-w-[1100px]">
                            <thead>
                              <tr className="border-b border-slate-800 bg-slate-900/90 text-slate-300">
                                <th className="py-3 px-3 font-bold uppercase tracking-wider text-xs w-28">Day</th>
                                <th className="py-2.5 px-2 font-bold uppercase tracking-wider text-center text-[11px] min-w-[115px]">
                                  Period I<br /><span className="text-[9px] text-slate-400 font-normal">09:15 - 10:00 AM</span>
                                </th>
                                <th className="py-2.5 px-2 font-bold uppercase tracking-wider text-center text-[11px] min-w-[115px]">
                                  Period II<br /><span className="text-[9px] text-slate-400 font-normal">10:00 - 10:45 AM</span>
                                </th>
                                <th className="py-2.5 px-2 font-bold uppercase tracking-wider text-center text-[11px] min-w-[115px]">
                                  Period III<br /><span className="text-[9px] text-slate-400 font-normal">11:00 - 11:45 AM</span>
                                </th>
                                <th className="py-2.5 px-2 font-bold uppercase tracking-wider text-center text-[11px] min-w-[115px]">
                                  Period IV<br /><span className="text-[9px] text-slate-400 font-normal">11:45 - 12:30 PM</span>
                                </th>
                                <th className="py-2.5 px-2 font-bold uppercase tracking-wider text-center text-[11px] min-w-[115px]">
                                  Period V<br /><span className="text-[9px] text-slate-400 font-normal">01:20 - 02:05 PM</span>
                                </th>
                                <th className="py-2.5 px-2 font-bold uppercase tracking-wider text-center text-[11px] min-w-[115px]">
                                  Period VI<br /><span className="text-[9px] text-slate-400 font-normal">02:05 - 02:50 PM</span>
                                </th>
                                <th className="py-2.5 px-2 font-bold uppercase tracking-wider text-center text-[11px] min-w-[115px]">
                                  Period VII<br /><span className="text-[9px] text-slate-400 font-normal">03:05 - 03:50 PM</span>
                                </th>
                                <th className="py-2.5 px-2 font-bold uppercase tracking-wider text-center text-[11px] min-w-[115px]">
                                  Period VIII<br /><span className="text-[9px] text-slate-400 font-normal">03:50 - 04:30 PM</span>
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => {
                                const dayPeriods = studentTimetable?.schedule?.[day] || [];
                                
                                return (
                                  <tr key={day} className="hover:bg-slate-800/30 transition-colors">
                                    <td className="py-4 px-3 font-bold text-white bg-slate-900/60 text-xs flex flex-col justify-center h-full">
                                      <span>{day}</span>
                                      <span className="text-[10px] text-slate-500 font-normal">Schedule</span>
                                    </td>
                                    
                                    {/* Render day schedule cells with 8 period column alignment */}
                                    {(() => {
                                      const cells = [];
                                      let col = 1;
                                      const periods = studentTimetable?.schedule?.[day] || [];

                                      const getPeriodIndex = (item) => {
                                        if (!item) return null;
                                        const str = (item.period || '').toUpperCase();
                                        if (str.includes('I & II') || str === 'I' || str.includes('PERIOD 1') || str.includes('PERIOD I')) return 1;
                                        if (str === 'II' || str.includes('PERIOD 2') || str.includes('PERIOD II')) return 2;
                                        if (str.includes('III & IV') || str === 'III' || str.includes('PERIOD 3') || str.includes('PERIOD III')) return 3;
                                        if (str === 'IV' || str.includes('PERIOD 4') || str.includes('PERIOD IV')) return 4;
                                        if (str.includes('V & VI') || str === 'V' || str.includes('PERIOD 5') || str.includes('PERIOD V')) return 5;
                                        if (str === 'VI' || str.includes('PERIOD 6') || str.includes('PERIOD VI')) return 6;
                                        if (str.includes('VII & VIII') || str === 'VII' || str.includes('PERIOD 7') || str.includes('PERIOD VII')) return 7;
                                        if (str === 'VIII' || str.includes('PERIOD 8') || str.includes('PERIOD VIII')) return 8;
                                        return null;
                                      };

                                      while (col <= 8) {
                                        const p = periods.find(item => getPeriodIndex(item) === col);

                                        if (p) {
                                          const span = p.span || (p.period?.includes('&') ? 2 : 1);
                                          
                                          // Color mapping: Blue for Project/Mini Project, Yellow/Brown for Placement/Aptitude, Cyan for Labs
                                          let bgStyle = 'bg-slate-900/80 border-slate-800 text-slate-300';
                                          if (p.type === 'Project' || (p.subject && (p.subject.toUpperCase().includes('PROJECT') || p.subject.toUpperCase().includes('MINI')))) {
                                            bgStyle = 'bg-blue-950/80 border-blue-500/60 text-blue-200 shadow-md shadow-blue-500/10';
                                          } else if (p.type === 'Placement' || (p.subject && (p.subject.includes('CE') || p.subject.includes('ADS') || p.subject.includes('APTI')))) {
                                            bgStyle = 'bg-yellow-950/70 border-yellow-500/50 text-yellow-200';
                                          } else if (p.type === 'Lab' || (p.subject && p.subject.includes('LAB'))) {
                                            bgStyle = 'bg-cyan-950/70 border-cyan-500/50 text-cyan-200';
                                          }

                                          cells.push(
                                            <td 
                                              key={`${day}-col-${col}`} 
                                              colSpan={span}
                                              className="p-1.5 text-center align-top"
                                            >
                                              <div className={`h-full min-h-[72px] p-2 rounded-xl border flex flex-col justify-between transition-all hover:scale-[1.02] shadow-sm ${bgStyle}`}>
                                                <div>
                                                  <div className="flex items-center justify-between gap-1 mb-1">
                                                    <span className="font-extrabold text-xs truncate" title={p.fullName || p.subject}>
                                                      {p.subject}
                                                    </span>
                                                    <span className="text-[9px] opacity-75 font-semibold px-1 rounded bg-black/40">
                                                      {p.period}
                                                    </span>
                                                  </div>
                                                  <p className="text-[10px] opacity-85 leading-tight line-clamp-1" title={p.teacher}>
                                                    {p.teacher}
                                                  </p>
                                                </div>

                                                <div className="flex items-center justify-between text-[9px] opacity-75 pt-1 border-t border-white/10 mt-1">
                                                  <span>📍 {p.room}</span>
                                                  <span>⏱️ {p.time}</span>
                                                </div>
                                              </div>
                                            </td>
                                          );
                                          col += span;
                                        } else {
                                          const coveredByPrev = periods.some(item => {
                                            const start = getPeriodIndex(item);
                                            const span = item.span || (item.period?.includes('&') ? 2 : 1);
                                            return start !== null && start < col && (start + span) > col;
                                          });

                                          if (coveredByPrev) {
                                            col += 1;
                                          } else {
                                            cells.push(
                                              <td key={`${day}-col-${col}`} className="p-1.5 text-center align-top">
                                                <div className="h-full min-h-[72px] p-2 rounded-xl border border-slate-800/40 bg-slate-950/20 text-slate-600 flex items-center justify-center text-[10px] italic">
                                                  —
                                                </div>
                                              </td>
                                            );
                                            col += 1;
                                          }
                                        }
                                      }
                                      
                                      return cells;
                                    })()}
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>

                        {/* STUDENT TIMETABLE CUSTOMIZATION MODAL */}
                        {isEditingTimetable && editingSchedule && (
                          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
                            <div className="relative w-full max-w-4xl bg-slate-900 rounded-3xl border border-slate-700/80 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                              
                              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900">
                                <div className="flex items-center space-x-2">
                                  <Edit3 className="w-5 h-5 text-brand-400" />
                                  <h3 className="text-base font-bold text-white">Personal Timetable Customizer</h3>
                                </div>
                                <button onClick={() => setIsEditingTimetable(false)} className="p-1 text-slate-400 hover:text-white">
                                  ✕
                                </button>
                              </div>

                              <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
                                {Object.entries(editingSchedule).map(([day, slots]) => (
                                  <div key={day} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                                    <div className="flex items-center justify-between">
                                      <h4 className="font-bold text-brand-300 text-sm">{day}</h4>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const newSlot = { time: '04:00 - 05:00 PM', subject: 'Custom Study', room: 'Room 302', teacher: 'Self', type: 'Theory' };
                                          setEditingSchedule({ ...editingSchedule, [day]: [...slots, newSlot] });
                                        }}
                                        className="px-2.5 py-1 rounded-lg bg-brand-600/30 text-brand-300 border border-brand-500/30 text-[11px] font-bold"
                                      >
                                        + Add Period
                                      </button>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                      {slots.map((slot, sIdx) => (
                                        <div key={sIdx} className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2 relative">
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const updatedDay = slots.filter((_, idx) => idx !== sIdx);
                                              setEditingSchedule({ ...editingSchedule, [day]: updatedDay });
                                            }}
                                            className="absolute top-2 right-2 text-rose-400 hover:text-rose-300 text-xs font-bold"
                                          >
                                            ✕
                                          </button>

                                          <div className="grid grid-cols-2 gap-2">
                                            <div>
                                              <label className="text-[10px] text-slate-400 block">Subject</label>
                                              <input
                                                type="text"
                                                value={slot.subject}
                                                onChange={(e) => {
                                                  const updatedDay = [...slots];
                                                  updatedDay[sIdx] = { ...slot, subject: e.target.value };
                                                  setEditingSchedule({ ...editingSchedule, [day]: updatedDay });
                                                }}
                                                className="w-full px-2 py-1 bg-slate-800 text-slate-100 rounded border border-slate-700 text-xs"
                                              />
                                            </div>

                                            <div>
                                              <label className="text-[10px] text-slate-400 block">Slot Type</label>
                                              <select
                                                value={slot.type || 'Theory'}
                                                onChange={(e) => {
                                                  const updatedDay = [...slots];
                                                  updatedDay[sIdx] = { ...slot, type: e.target.value };
                                                  setEditingSchedule({ ...editingSchedule, [day]: updatedDay });
                                                }}
                                                className="w-full px-2 py-1 bg-slate-800 text-slate-100 rounded border border-slate-700 text-xs"
                                              >
                                                <option value="Theory">Theory</option>
                                                <option value="Lab">Lab (Uniform)</option>
                                                <option value="Placement">Placement</option>
                                              </select>
                                            </div>
                                          </div>

                                          <div className="grid grid-cols-3 gap-2">
                                            <div>
                                              <label className="text-[10px] text-slate-400 block">Time</label>
                                              <input
                                                type="text"
                                                value={slot.time}
                                                onChange={(e) => {
                                                  const updatedDay = [...slots];
                                                  updatedDay[sIdx] = { ...slot, time: e.target.value };
                                                  setEditingSchedule({ ...editingSchedule, [day]: updatedDay });
                                                }}
                                                className="w-full px-2 py-1 bg-slate-800 text-slate-100 rounded border border-slate-700 text-xs"
                                              />
                                            </div>
                                            <div>
                                              <label className="text-[10px] text-slate-400 block">Room</label>
                                              <input
                                                type="text"
                                                value={slot.room}
                                                onChange={(e) => {
                                                  const updatedDay = [...slots];
                                                  updatedDay[sIdx] = { ...slot, room: e.target.value };
                                                  setEditingSchedule({ ...editingSchedule, [day]: updatedDay });
                                                }}
                                                className="w-full px-2 py-1 bg-slate-800 text-slate-100 rounded border border-slate-700 text-xs"
                                              />
                                            </div>
                                            <div>
                                              <label className="text-[10px] text-slate-400 block">Teacher</label>
                                              <input
                                                type="text"
                                                value={slot.teacher}
                                                onChange={(e) => {
                                                  const updatedDay = [...slots];
                                                  updatedDay[sIdx] = { ...slot, teacher: e.target.value };
                                                  setEditingSchedule({ ...editingSchedule, [day]: updatedDay });
                                                }}
                                                className="w-full px-2 py-1 bg-slate-800 text-slate-100 rounded border border-slate-700 text-xs"
                                              />
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>

                              <div className="p-4 border-t border-slate-800 flex justify-end space-x-2 bg-slate-900">
                                <button
                                  onClick={() => setIsEditingTimetable(false)}
                                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => {
                                    updateStudentCustomTimetable({
                                      ...studentTimetable,
                                      schedule: editingSchedule
                                    });
                                    setIsEditingTimetable(false);
                                  }}
                                  className="px-5 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white shadow-md shadow-brand-600/30"
                                >
                                  Save Custom Timetable
                                </button>
                              </div>

                            </div>
                          </div>
                        )}
                      </div>
                    );
                  }

                  // TYPE 2: INTERNAL EXAMINATION TIMETABLE
                  if (type === 'internal') {
                    const activeInternals = (timetables || []).filter(t => 
                      t.type === 'internal' && 
                      (t.status || 'active') === 'active' &&
                      t.year === currentUser?.year && 
                      Number(t.semester) === Number(currentUser?.semester)
                    );

                    const selectedInternal = activeInternals.find(t => {
                      const tName = (t.internalName || t.title || '').toLowerCase();
                      const selName = selectedInternalTest.toLowerCase();
                      if (selName.includes('1') && (tName.includes('1') || tName.includes('cia-1') || tName.includes('cat-1'))) return true;
                      if (selName.includes('2') && (tName.includes('2') || tName.includes('cia-2') || tName.includes('cat-2'))) return true;
                      return tName === selName;
                    });

                    return (
                      <div key="internal-tt" className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                          <div>
                            <div className="flex items-center space-x-2">
                              <FileText className="w-5 h-5 text-amber-400" />
                              <h2 className="text-lg font-bold text-white">
                                Internal Examination Timetable — {selectedInternal?.internalName || 'Internal Assessment'}
                              </h2>
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                ● Active Exam Schedule
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1">
                              {selectedInternal?.title || 'Continuous Internal Assessment Test'} • {currentUser.year}, Semester {currentUser.semester} ({currentUser.classSection || 'IT-A'})
                            </p>
                          </div>

                          {/* Internal 1 / Internal 2 Selector Pills */}
                          <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
                            {['Internal 1', 'Internal 2'].map(testName => (
                              <button
                                key={testName}
                                onClick={() => setSelectedInternalTest(testName)}
                                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                  selectedInternalTest === testName
                                    ? 'bg-amber-500 text-slate-950 shadow'
                                    : 'text-slate-400 hover:text-white'
                                }`}
                              >
                                {testName}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Internal Exam Entries Table */}
                        {!selectedInternal || !selectedInternal.examEntries || selectedInternal.examEntries.length === 0 ? (
                          <div className="text-center py-8 text-slate-400 text-xs">
                            No active Internal Examination Timetable uploaded for {currentUser.year}, Semester {currentUser.semester}.
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                              <thead>
                                <tr className="border-b border-slate-800 bg-slate-900/90 text-slate-300">
                                  <th className="py-3 px-3 font-bold uppercase text-[11px] w-12 text-center">#</th>
                                  <th className="py-3 px-3 font-bold uppercase text-[11px]">Subject Code & Name</th>
                                  <th className="py-3 px-3 font-bold uppercase text-[11px]">Date & Day</th>
                                  <th className="py-3 px-3 font-bold uppercase text-[11px]">Exam Time</th>
                                  <th className="py-3 px-3 font-bold uppercase text-[11px]">Syllabus Scope</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-800/60">
                                {selectedInternal.examEntries.map((exam, idx) => (
                                  <tr key={exam.id || idx} className="hover:bg-slate-800/40 transition-colors">
                                    <td className="py-3 px-3 text-center text-slate-400 font-bold">{idx + 1}</td>
                                    <td className="py-3 px-3">
                                      <div className="flex items-center space-x-2">
                                        <span className="font-mono text-[10px] font-extrabold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                          {exam.subjectCode || 'IT-SUB'}
                                        </span>
                                        <span className="font-bold text-white text-xs">{exam.subject}</span>
                                      </div>
                                    </td>
                                    <td className="py-3 px-3 font-medium text-slate-200">
                                      <div className="flex items-center space-x-1.5">
                                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                        <span>{exam.examDate}</span>
                                        <span className="text-slate-400">({exam.day})</span>
                                      </div>
                                    </td>
                                    <td className="py-3 px-3 font-bold text-amber-300">
                                      <span className="px-2.5 py-1 rounded-lg bg-amber-950/60 border border-amber-500/30">
                                        {exam.startTime} – {exam.endTime}
                                      </span>
                                    </td>
                                    <td className="py-3 px-3 text-slate-400 text-[11px]">{exam.syllabus || 'Full Syllabus'}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    );
                  }

                  // TYPE 3: SEMESTER EXAMINATION TIMETABLE
                  if (type === 'semester') {
                    const activeSemesters = (timetables || []).filter(t => 
                      t.type === 'semester' && 
                      (t.status || 'active') === 'active' &&
                      t.year === currentUser?.year && 
                      Number(t.semester) === Number(currentUser?.semester)
                    );

                    const selectedSemester = activeSemesters[0] || (timetables || []).find(t => t.type === 'semester' && (t.status || 'active') === 'active') || (timetables || []).find(t => t.type === 'semester');

                    return (
                      <div key="semester-tt" className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                          <div>
                            <div className="flex items-center space-x-2">
                              <GraduationCap className="w-5 h-5 text-cyan-400" />
                              <h2 className="text-lg font-bold text-white">
                                Semester Examination Timetable
                              </h2>
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                                ● Official University Exams
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1">
                              {selectedSemester?.title || 'Anna University End-Semester Schedule'} • {currentUser.year}, Semester {currentUser.semester} ({currentUser.classSection || 'IT-A'})
                            </p>
                          </div>

                          <div className="px-3 py-1.5 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-xs font-bold text-cyan-300 flex items-center space-x-1.5 self-start sm:self-auto">
                            <span>Forenoon (FN): 09:30 AM – 12:30 PM</span>
                          </div>
                        </div>

                        {!selectedSemester || !selectedSemester.examEntries || selectedSemester.examEntries.length === 0 ? (
                          <div className="text-center py-8 text-slate-400 text-xs">
                            No active Semester Examination Timetable uploaded for {currentUser.year}, Semester {currentUser.semester}.
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                              <thead>
                                <tr className="border-b border-slate-800 bg-slate-900/90 text-slate-300">
                                  <th className="py-3 px-3 font-bold uppercase text-[11px] w-12 text-center">#</th>
                                  <th className="py-3 px-3 font-bold uppercase text-[11px]">Subject Code & Name</th>
                                  <th className="py-3 px-3 font-bold uppercase text-[11px]">Exam Date & Day</th>
                                  <th className="py-3 px-3 font-bold uppercase text-[11px]">Session</th>
                                  <th className="py-3 px-3 font-bold uppercase text-[11px]">Exam Time (FN / AN)</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-800/60">
                                {selectedSemester.examEntries.map((exam, idx) => (
                                  <tr key={exam.id || idx} className="hover:bg-slate-800/40 transition-colors">
                                    <td className="py-3 px-3 text-center text-slate-400 font-bold">{idx + 1}</td>
                                    <td className="py-3 px-3">
                                      <div className="flex items-center space-x-2">
                                        <span className="font-mono text-[10px] font-extrabold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                                          {exam.subjectCode || 'IT-SUB'}
                                        </span>
                                        <span className="font-bold text-white text-xs">{exam.subject}</span>
                                      </div>
                                    </td>
                                    <td className="py-3 px-3 font-medium text-slate-200">
                                      <div className="flex items-center space-x-1.5">
                                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                        <span>{exam.examDate}</span>
                                        <span className="text-slate-400">({exam.day})</span>
                                      </div>
                                    </td>
                                    <td className="py-3 px-3">
                                      <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${
                                        (exam.session || 'FN') === 'FN'
                                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                          : 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                                      }`}>
                                        {exam.session || 'FN'} ({(exam.session || 'FN') === 'FN' ? 'Forenoon' : 'Afternoon'})
                                      </span>
                                    </td>
                                    <td className="py-3 px-3">
                                      <span className="font-extrabold text-cyan-300 text-xs px-2.5 py-1 rounded-lg bg-cyan-950/80 border border-cyan-500/40 shadow-sm">
                                        {exam.startTime || '09:30 AM'} – {exam.endTime || '12:30 PM'}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    );
                  }

                  return null;
                })}
              </div>
            );
          })()}
        </div>
      )}

      {/* TAB 2: FAVORITES / BOOKMARKS */}
      {profileTab === 'favorites' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Bookmark className="w-5 h-5 text-amber-400" />
              <span>Your Saved Resources</span>
            </h2>
          </div>

          {savedMaterials.length === 0 && savedAiTools.length === 0 ? (
            <div className="glass-panel rounded-3xl p-12 text-center text-slate-400 space-y-2">
              <Bookmark className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-sm font-semibold">No bookmarked materials or AI tools yet.</p>
              <p className="text-xs text-slate-500">Click the bookmark icon on any material or tool card to save it here for quick access.</p>
            </div>
          ) : (
            <div className="space-y-8">
              
              {/* Saved Study Materials */}
              {savedMaterials.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-brand-300">
                    Saved Study Materials ({savedMaterials.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {savedMaterials.map(mat => (
                      <div key={mat.id} className="glass-card rounded-2xl p-4 border border-slate-800 flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-500/20 text-brand-300 uppercase">
                              {mat.category}
                            </span>
                            {mat.year && mat.semester && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                {mat.year} • S{mat.semester}
                              </span>
                            )}
                          </div>
                          <h4 className="text-sm font-bold text-white">{mat.title}</h4>
                          <p className="text-xs text-slate-400">{mat.subjectName}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => onPreviewMaterial(mat)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-600 text-white"
                          >
                            Open
                          </button>
                          <button
                            onClick={() => toggleFavoriteItem('material', mat.id)}
                            className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10"
                            title="Remove bookmark"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Saved AI Tools */}
              {savedAiTools.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                    Saved AI Assistants ({savedAiTools.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {savedAiTools.map(tool => (
                      <div key={tool.id} className="glass-card rounded-2xl p-4 border border-slate-800 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <img src={tool.logoUrl} alt={tool.name} className="w-8 h-8 object-contain" />
                          <div>
                            <h4 className="text-sm font-bold text-white">{tool.name}</h4>
                            <p className="text-xs text-slate-400">{tool.category}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <a
                            href={tool.websiteUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-white flex items-center space-x-1"
                          >
                            <span>Visit</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                          <button
                            onClick={() => toggleFavoriteItem('aitool', tool.id)}
                            className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10"
                            title="Remove bookmark"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      )}

      {/* TAB 3: SELF-MARKS TRACKER & THREE-GRAPH COMPARISON SYSTEM */}
      {profileTab === 'marks' && (() => {
        const semesterMarks = studentMarks.filter(
          m => Number(m.semester) === Number(currentUser?.semester || 5)
        ).length > 0 ? studentMarks.filter(
          m => Number(m.semester) === Number(currentUser?.semester || 5)
        ) : studentMarks;

        // Group & consolidate student marks by normalized subject name
        const consolidatedMap = {};
        semesterMarks.forEach(m => {
          const rawSub = (m.subject || '').trim();
          if (!rawSub) return;
          const normKey = rawSub.toLowerCase();

          if (!consolidatedMap[normKey]) {
            consolidatedMap[normKey] = {
              id: m.id,
              subject: rawSub,
              semester: m.semester,
              internal1: m.internal1 !== null && m.internal1 !== undefined && m.internal1 !== '' ? Number(m.internal1) : null,
              internal2: m.internal2 !== null && m.internal2 !== undefined && m.internal2 !== '' ? Number(m.internal2) : null
            };
          } else {
            if (m.internal1 !== null && m.internal1 !== undefined && m.internal1 !== '') {
              consolidatedMap[normKey].internal1 = Number(m.internal1);
            }
            if (m.internal2 !== null && m.internal2 !== undefined && m.internal2 !== '') {
              consolidatedMap[normKey].internal2 = Number(m.internal2);
            }
          }
        });

        const consolidatedMarks = Object.values(consolidatedMap);

        const internal1Data = consolidatedMarks
          .filter(m => m.internal1 !== null)
          .map(m => ({
            name: m.subject.length > 14 ? `${m.subject.substring(0, 12)}..` : m.subject,
            fullSubject: m.subject,
            'Internal 1 Marks': Number(m.internal1)
          }));

        const internal2Data = consolidatedMarks
          .filter(m => m.internal2 !== null)
          .map(m => ({
            name: m.subject.length > 14 ? `${m.subject.substring(0, 12)}..` : m.subject,
            fullSubject: m.subject,
            'Internal 2 Marks': Number(m.internal2)
          }));

        const comparisonData = consolidatedMarks
          .filter(m => m.internal1 !== null || m.internal2 !== null)
          .map(m => ({
            name: m.subject.length > 14 ? `${m.subject.substring(0, 12)}..` : m.subject,
            fullSubject: m.subject,
            'Internal 1 (50)': m.internal1 !== null ? Number(m.internal1) : 0,
            'Internal 2 (50)': m.internal2 !== null ? Number(m.internal2) : 0
          }));

        const hasBothInternals = consolidatedMarks.some(
          m => m.internal1 !== null && m.internal2 !== null
        );

        const validI1 = consolidatedMarks.filter(m => m.internal1 !== null);
        const validI2 = consolidatedMarks.filter(m => m.internal2 !== null);

        const avgI1 = validI1.length > 0 ? (validI1.reduce((sum, m) => sum + Number(m.internal1), 0) / validI1.length).toFixed(1) : 0;
        const avgI2 = validI2.length > 0 ? (validI2.reduce((sum, m) => sum + Number(m.internal2), 0) / validI2.length).toFixed(1) : 0;
        const diffAvg = (avgI2 - avgI1).toFixed(1);
        const diffPercent = avgI1 > 0 ? (((avgI2 - avgI1) / avgI1) * 100).toFixed(1) : 0;

        // Semester Subject Dropdown List
        const semesterSubjectOptions = (() => {
          const matchedSubs = (subjects || []).filter(s => Number(s.semester) === Number(newMark.semester));
          if (matchedSubs.length > 0) {
            return matchedSubs.map(s => s.name);
          }
          if (Number(newMark.semester) === 5) {
            return [
              'FSWD (Full Stack Web Development)',
              'ESIOT (Embedded Systems & IoT)',
              'STA (Software Testing & Automation)',
              'BDA (Big Data Analytics)',
              'CN (Computer Networks)',
              'DC (Distributed Computing)',
              'CE (Communication English)',
              'ADS (Advanced Data Structures)'
            ];
          }
          return [
            'Programming in C',
            'Data Structures & Algorithms',
            'Database Management Systems',
            'Operating Systems',
            'Web Technologies',
            'Machine Learning',
            'Cloud Computing'
          ];
        })();

        return (
          <div className="space-y-6">
            
            {/* SELF-MARKS TRACKER HEADER & HORIZONTAL SUB-TAB NAVIGATION */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-xl font-extrabold text-white flex items-center space-x-2">
                  <ChartIcon className="w-6 h-6 text-accent-cyan" />
                  <span>Self-Marks Tracker</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Organized academic tracking: internal marks, semester target calculator, and SGPA/CGPA record.
                </p>
              </div>

              {/* CLEAN HORIZONTAL TAB NAVIGATION (MATCHES TIMETABLES SECTION VISUAL STYLE) */}
              <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800 overflow-x-auto scrollbar-none gap-1.5 w-full sm:w-auto">
                {[
                  { id: 'internal_marks', label: '📊 Internal Marks' },
                  { id: 'calculator', label: '🎯 Internal Marks Calculator' },
                  { id: 'sgpa', label: '🎓 Semester' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setMarksSubTab(tab.id)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 flex items-center space-x-2 ${
                      marksSubTab === tab.id
                        ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30 ring-1 ring-brand-400/40'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
                    }`}
                  >
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* TAB 1 — INTERNAL MARKS */}
            {marksSubTab === 'internal_marks' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* DISCLAIMER & INFO BANNER */}
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start space-x-3 text-amber-300 text-xs">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-400 mt-0.5" />
                  <div>
                    <p className="font-bold text-amber-200">50-Mark Internal Assessment Tracker</p>
                    <p className="mt-0.5 leading-relaxed text-amber-300/90">
                      Each Internal Exam is out of <strong>50 marks</strong>. Select a subject for Semester {newMark.semester} below to log <strong>Internal 1</strong> and <strong>Internal 2</strong> marks — the <strong>Comparison Graph</strong> will group side-by-side bars per subject!
                    </p>
                  </div>
                </div>

                {/* Add/Log Internal Marks Form */}
                <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <Plus className="w-4 h-4 text-brand-400" />
                    <span>Log Subject Internal Marks (Max 50 Each)</span>
                  </h3>

                  <form onSubmit={handleAddMarkSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    
                    {/* Semester Picker */}
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-semibold text-slate-400 mb-1">Semester</label>
                      <select
                        value={newMark.semester}
                        onChange={(e) => setNewMark({ ...newMark, semester: Number(e.target.value), subject: '' })}
                        className="w-full px-3 py-2 bg-slate-900 text-xs text-slate-100 rounded-xl border border-slate-800 focus:outline-none focus:border-brand-500"
                      >
                        {[1,2,3,4,5,6,7,8].map(s => (
                          <option key={s} value={s}>Sem {s}</option>
                        ))}
                      </select>
                    </div>

                    {/* Subject Name Dropdown Selection */}
                    <div className="sm:col-span-4">
                      <label className="block text-[10px] font-semibold text-slate-400 mb-1">Subject (Sem {newMark.semester})</label>
                      <select
                        required
                        value={newMark.subject}
                        onChange={(e) => setNewMark({ ...newMark, subject: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-900 text-xs text-slate-100 rounded-xl border border-slate-800 focus:outline-none focus:border-brand-500"
                      >
                        <option value="" disabled>-- Select Semester {newMark.semester} Subject --</option>
                        {semesterSubjectOptions.map((subName, i) => (
                          <option key={i} value={subName}>
                            {subName}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Internal 1 */}
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-semibold text-slate-400 mb-1">Internal 1 (/50)</label>
                      <input
                        type="number"
                        min="0"
                        max="50"
                        placeholder="Marks / 50"
                        value={newMark.internal1}
                        onChange={(e) => setNewMark({ ...newMark, internal1: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-900 text-xs text-slate-100 rounded-xl border border-slate-800 focus:outline-none focus:border-brand-500"
                      />
                    </div>

                    {/* Internal 2 */}
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-semibold text-slate-400 mb-1">Internal 2 (/50)</label>
                      <input
                        type="number"
                        min="0"
                        max="50"
                        placeholder="Marks / 50"
                        value={newMark.internal2}
                        onChange={(e) => setNewMark({ ...newMark, internal2: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-900 text-xs text-slate-100 rounded-xl border border-slate-800 focus:outline-none focus:border-brand-500"
                      />
                    </div>

                    {/* Save Button */}
                    <div className="sm:col-span-2 flex items-end">
                      <button
                        type="submit"
                        className="w-full py-2.5 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white shadow-md shadow-brand-600/20 flex items-center justify-center space-x-1"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Save Marks</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* PERFORMANCE OVERVIEW CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-1">
                    <p className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider">Internal 1 Average</p>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-2xl font-black text-white">{avgI1}</span>
                      <span className="text-xs text-slate-400 font-bold">/ 50 marks</span>
                    </div>
                    <p className="text-[10px] text-indigo-200/80">
                      {avgI1 > 0 ? `${((avgI1 / 50) * 100).toFixed(1)}% class average` : 'No marks logged yet'}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 space-y-1">
                    <p className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider">Internal 2 Average</p>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-2xl font-black text-white">{avgI2}</span>
                      <span className="text-xs text-slate-400 font-bold">/ 50 marks</span>
                    </div>
                    <p className="text-[10px] text-cyan-200/80">
                      {avgI2 > 0 ? `${((avgI2 / 50) * 100).toFixed(1)}% class average` : 'No marks logged yet'}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 space-y-1">
                    <p className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">Overall Growth Trend</p>
                    <div className="flex items-baseline space-x-2">
                      <span className={`text-2xl font-black ${Number(diffAvg) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {Number(diffAvg) >= 0 ? `+${diffAvg}` : diffAvg}
                      </span>
                      <span className="text-xs text-slate-400 font-bold">marks</span>
                    </div>
                    <p className="text-[10px] text-emerald-200/80">
                      {Number(diffPercent) >= 0 ? `📈 +${diffPercent}% improvement` : `📉 ${diffPercent}% change`} in Int 2
                    </p>
                  </div>
                </div>

                {/* THREE-GRAPH SYSTEM DISPLAY */}
                <div className="space-y-6">
                  
                  {/* GRAPH 1 & GRAPH 2 SIDE-BY-SIDE */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* GRAPH 1: INTERNAL 1 MARKS */}
                    <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                          <ChartIcon className="w-4 h-4 text-indigo-400" />
                          <span>1️⃣ Internal 1 Assessment (Max 50)</span>
                        </h3>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          Int 1 Results
                        </span>
                      </div>

                      {internal1Data.length > 0 ? (
                        <div className="h-60 w-full pt-2">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={internal1Data}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                              <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                              <YAxis domain={[0, 50]} stroke="#64748b" fontSize={10} />
                              <Tooltip 
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                                formatter={(val) => [`${val} / 50 marks (${((val / 50) * 100).toFixed(0)}%)`, 'Internal 1']}
                              />
                              <Bar dataKey="Internal 1 Marks" fill="#6366f1" radius={[8, 8, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <div className="h-60 flex items-center justify-center text-xs text-slate-500 italic">
                          No Internal 1 marks logged yet.
                        </div>
                      )}
                    </div>

                    {/* GRAPH 2: INTERNAL 2 MARKS */}
                    <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                          <ChartIcon className="w-4 h-4 text-cyan-400" />
                          <span>2️⃣ Internal 2 Assessment (Max 50)</span>
                        </h3>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                          Int 2 Results
                        </span>
                      </div>

                      {internal2Data.length > 0 ? (
                        <div className="h-60 w-full pt-2">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={internal2Data}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                              <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                              <YAxis domain={[0, 50]} stroke="#64748b" fontSize={10} />
                              <Tooltip 
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                                formatter={(val) => [`${val} / 50 marks (${((val / 50) * 100).toFixed(0)}%)`, 'Internal 2']}
                              />
                              <Bar dataKey="Internal 2 Marks" fill="#06b6d4" radius={[8, 8, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <div className="h-60 flex items-center justify-center text-xs text-slate-500 italic">
                          No Internal 2 marks logged yet.
                        </div>
                      )}
                    </div>

                  </div>

                  {/* GRAPH 3: COMPARATIVE ANALYSIS (INTERNAL 1 vs INTERNAL 2 SIDE-BY-SIDE BARS) */}
                  <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h3 className="text-base font-extrabold text-white flex items-center space-x-2">
                          <Sparkles className="w-5 h-5 text-emerald-400" />
                          <span>3️⃣ Internal 1 vs Internal 2 Comparison Graph</span>
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Subject-wise comparative evaluation displaying Internal 1 (left) and Internal 2 (right) side-by-side out of 50.
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        hasBothInternals 
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}>
                        {hasBothInternals ? '⚡ Side-by-Side Comparison Active' : '🔒 Log Both Internals to Compare'}
                      </span>
                    </div>

                    {comparisonData.length > 0 ? (
                      <div className="h-72 w-full pt-4">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={comparisonData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                            <YAxis domain={[0, 50]} stroke="#94a3b8" fontSize={11} />
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '14px', fontSize: '12px' }}
                              formatter={(value, name) => [`${value} / 50 marks (${((value / 50) * 100).toFixed(0)}%)`, name]}
                            />
                            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                            <Bar dataKey="Internal 1 (50)" fill="#6366f1" radius={[6, 6, 0, 0]} name="Internal 1" />
                            <Bar dataKey="Internal 2 (50)" fill="#10b981" radius={[6, 6, 0, 0]} name="Internal 2" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="h-64 flex flex-col items-center justify-center text-center p-8 bg-slate-900/50 rounded-2xl border border-slate-800 space-y-2">
                        <ChartIcon className="w-8 h-8 text-slate-600" />
                        <p className="text-xs font-semibold text-slate-300">No Comparison Data Available</p>
                        <p className="text-[11px] text-slate-500">Log both Internal 1 and Internal 2 marks above to visualize subject-wise growth!</p>
                      </div>
                    )}
                  </div>

                </div>

                {/* MARKS SUMMARY TABLE */}
                <div className="glass-panel rounded-3xl p-6 border border-slate-800 overflow-x-auto space-y-3">
                  <h3 className="text-sm font-bold text-white">Detailed Internal Marks Statement</h3>

                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 bg-slate-900/60">
                        <th className="py-3 px-4 font-semibold">Subject</th>
                        <th className="py-3 px-4 font-semibold">Semester</th>
                        <th className="py-3 px-4 font-semibold text-center">Internal 1 (/50)</th>
                        <th className="py-3 px-4 font-semibold text-center">Internal 2 (/50)</th>
                        <th className="py-3 px-4 font-semibold text-center">Total (/100)</th>
                        <th className="py-3 px-4 font-semibold text-center">Percentage</th>
                        <th className="py-3 px-4 font-semibold text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {consolidatedMarks.map(m => {
                        const i1 = m.internal1 !== null && m.internal1 !== undefined ? Number(m.internal1) : '-';
                        const i2 = m.internal2 !== null && m.internal2 !== undefined ? Number(m.internal2) : '-';
                        const total = (typeof i1 === 'number' ? i1 : 0) + (typeof i2 === 'number' ? i2 : 0);
                        const hasBoth = typeof i1 === 'number' && typeof i2 === 'number';
                        const pct = hasBoth ? total : (typeof i1 === 'number' ? (i1 / 50) * 100 : (typeof i2 === 'number' ? (i2 / 50) * 100 : 0));

                        return (
                          <tr key={m.id} className="hover:bg-slate-900/40">
                            <td className="py-3 px-4 font-bold text-white">{m.subject}</td>
                            <td className="py-3 px-4 text-slate-400">Sem {m.semester}</td>
                            <td className="py-3 px-4 text-center font-bold text-indigo-300">
                              {i1 !== '-' ? `${i1} / 50` : <span className="text-slate-600 italic">Not set</span>}
                            </td>
                            <td className="py-3 px-4 text-center font-bold text-cyan-300">
                              {i2 !== '-' ? `${i2} / 50` : <span className="text-slate-600 italic">Not set</span>}
                            </td>
                            <td className="py-3 px-4 text-center font-bold text-emerald-300">
                              {hasBoth ? `${total} / 100` : <span className="text-slate-500 font-normal">Pending</span>}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                                pct >= 90 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                                pct >= 75 ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' :
                                pct >= 50 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                                'bg-slate-800 text-slate-400'
                              }`}>
                                {pct > 0 ? `${pct.toFixed(0)}%` : 'N/A'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => removeMark(m.id)}
                                className="text-rose-400 hover:text-rose-300 p-1 rounded-lg hover:bg-rose-500/10"
                                title="Delete entry"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 2 — INTERNAL MARKS CALCULATOR */}
            {marksSubTab === 'calculator' && (() => {
              const calcSubjectOptions = (() => {
                const matchedSubs = (subjects || []).filter(s => Number(s.semester) === Number(calcState.semester));
                if (matchedSubs.length > 0) return matchedSubs.map(s => s.name);
                if (Number(calcState.semester) === 5) {
                  return [
                    'FSWD (Full Stack Web Development)',
                    'ESIOT (Embedded Systems & IoT)',
                    'STA (Software Testing & Automation)',
                    'BDA (Big Data Analytics)',
                    'CN (Computer Networks)',
                    'DC (Distributed Computing)',
                    'CE (Communication English)',
                    'ADS (Advanced Data Structures)'
                  ];
                }
                return [
                  'Programming in C',
                  'Data Structures & Algorithms',
                  'Database Management Systems',
                  'Operating Systems',
                  'Web Technologies',
                  'Machine Learning',
                  'Cloud Computing'
                ];
              })();

              const cI1 = calcState.internal1 !== '' && calcState.internal1 !== null ? Math.min(50, Math.max(0, Number(calcState.internal1))) : null;
              const cI2 = calcState.internal2 !== '' && calcState.internal2 !== null ? Math.min(50, Math.max(0, Number(calcState.internal2))) : null;

              let calcAvg = 0;
              let calcEst = 0;
              let calcHasVal = false;

              if (cI1 !== null && cI2 !== null) {
                calcAvg = (cI1 + cI2) / 2;
                calcEst = (calcAvg / 50) * 40;
                calcHasVal = true;
              } else if (cI1 !== null) {
                calcAvg = cI1;
                calcEst = (calcAvg / 50) * 40;
                calcHasVal = true;
              } else if (cI2 !== null) {
                calcAvg = cI2;
                calcEst = (calcAvg / 50) * 40;
                calcHasVal = true;
              }

              return (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="glass-panel p-6 rounded-3xl border border-brand-500/30 bg-slate-900/90 space-y-6">
                    
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
                      <div className="space-y-1">
                        <h3 className="text-lg font-extrabold text-white flex items-center space-x-2">
                          <Calculator className="w-5 h-5 text-brand-400" />
                          <span>🧮 Internal Marks Calculator</span>
                        </h3>
                        <p className="text-xs text-slate-400">
                          Calculate your estimated Continuous Assessment internal mark out of 40 based on your 50-mark Internal exams.
                        </p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-500/20 text-brand-300 border border-brand-500/40">
                        Formula: (Average / 50) × 40
                      </span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      
                      {/* Left Column: Form Controls */}
                      <div className="lg:col-span-7 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          
                          {/* Semester Selection */}
                          <div className="space-y-1">
                            <label className="block text-xs font-bold text-slate-300">Select Semester</label>
                            <select
                              value={calcState.semester}
                              onChange={(e) => {
                                const newSem = Number(e.target.value);
                                setCalcState({ semester: newSem, subject: '', internal1: '', internal2: '' });
                              }}
                              className="w-full px-3.5 py-2.5 bg-slate-950 text-xs text-slate-100 rounded-xl border border-slate-800 focus:outline-none focus:border-brand-500"
                            >
                              {[1,2,3,4,5,6,7,8].map(s => (
                                <option key={s} value={s}>Semester {s}</option>
                              ))}
                            </select>
                          </div>

                          {/* Subject Selection */}
                          <div className="space-y-1">
                            <label className="block text-xs font-bold text-slate-300">Select Subject</label>
                            <select
                              value={calcState.subject}
                              onChange={(e) => {
                                const selSub = e.target.value;
                                const existing = consolidatedMarks.find(m => (m.subject || '').toLowerCase().trim() === selSub.toLowerCase().trim());
                                setCalcState({
                                  semester: calcState.semester,
                                  subject: selSub,
                                  internal1: existing && existing.internal1 !== null ? existing.internal1 : '',
                                  internal2: existing && existing.internal2 !== null ? existing.internal2 : ''
                                });
                              }}
                              className="w-full px-3.5 py-2.5 bg-slate-950 text-xs text-slate-100 rounded-xl border border-slate-800 focus:outline-none focus:border-brand-500"
                            >
                              <option value="" disabled>-- Choose Subject for Sem {calcState.semester} --</option>
                              {calcSubjectOptions.map((subName, i) => (
                                <option key={i} value={subName}>{subName}</option>
                              ))}
                            </select>
                          </div>

                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                          
                          {/* Internal 1 Input */}
                          <div className="space-y-1.5 p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-500/20">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-bold text-indigo-300">Internal 1 Marks</label>
                              <span className="text-[10px] text-slate-400 font-medium">Out of 50</span>
                            </div>
                            <div className="relative">
                              <input
                                type="number"
                                min="0"
                                max="50"
                                placeholder="Marks / 50"
                                value={calcState.internal1}
                                onChange={(e) => setCalcState(prev => ({ ...prev, internal1: e.target.value }))}
                                className="w-full px-3.5 py-2 bg-slate-900 text-sm font-bold text-white rounded-xl border border-indigo-500/30 focus:outline-none focus:border-indigo-400"
                              />
                              <span className="absolute right-3 top-2 text-xs text-slate-500 font-bold">/ 50</span>
                            </div>
                          </div>

                          {/* Internal 2 Input */}
                          <div className="space-y-1.5 p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-500/20">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-bold text-cyan-300">Internal 2 Marks</label>
                              <span className="text-[10px] text-slate-400 font-medium">Out of 50</span>
                            </div>
                            <div className="relative">
                              <input
                                type="number"
                                min="0"
                                max="50"
                                placeholder="Marks / 50"
                                value={calcState.internal2}
                                onChange={(e) => setCalcState(prev => ({ ...prev, internal2: e.target.value }))}
                                className="w-full px-3.5 py-2 bg-slate-900 text-sm font-bold text-white rounded-xl border border-cyan-500/30 focus:outline-none focus:border-cyan-400"
                              />
                              <span className="absolute right-3 top-2 text-xs text-slate-500 font-bold">/ 50</span>
                            </div>
                          </div>

                        </div>
                      </div>

                      {/* Right Column: Calculated Results Display */}
                      <div className="lg:col-span-5 flex flex-col justify-between p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
                        <div className="space-y-3">
                          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Calculation Summary</span>
                          
                          <div className="flex items-center justify-between py-2 border-b border-slate-800 text-xs">
                            <span className="text-slate-400 font-medium">Average Mark:</span>
                            <span className="text-white font-bold text-sm">
                              {calcHasVal ? `${calcAvg.toFixed(1)} / 50` : '-'}
                            </span>
                          </div>

                          <div className="p-4 rounded-2xl bg-gradient-to-br from-brand-900/50 to-indigo-950/50 border border-brand-500/40 space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-300">Estimated Internal Mark</span>
                            <div className="flex items-baseline space-x-2">
                              <span className="text-3xl font-black text-white">
                                {calcHasVal ? calcEst.toFixed(1) : '0.0'}
                              </span>
                              <span className="text-sm font-bold text-brand-300">/ 40 marks</span>
                            </div>
                            {calcHasVal && (
                              <p className="text-[11px] text-brand-200/90 font-medium pt-1">
                                ({calcAvg.toFixed(1)} ÷ 50) × 40 = <strong>{calcEst.toFixed(1)} / 40</strong>
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* MANDATORY DISCLAIMER BANNER */}
                    <div className="p-4 rounded-2xl bg-slate-950/90 border border-amber-500/30 flex items-start space-x-3 text-xs">
                      <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="font-bold text-amber-300 uppercase tracking-wide text-[11px]">⚠️ Disclaimer</p>
                        <p className="text-slate-300 leading-relaxed text-[11px]">
                          "This is only an estimated calculation for personal reference and is NOT your official internal/Continuous Assessment mark. The actual mark may be higher or lower depending on the official college calculation method and other assessment components. Please refer to your college/department for your official marks."
                        </p>
                      </div>
                    </div>

                  </div>

                  {/* SEMESTER EXAM TARGET CALCULATOR */}
                  <SemesterTargetCalculator internalMark={calcHasVal ? calcEst : null} />
                </div>
              );
            })()}

            {/* TAB 3 — SEMESTER SGPA */}
            {marksSubTab === 'sgpa' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                
                {/* Summary Metrics Banner */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  
                  {/* Current SGPA Card */}
                  <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-950/60 to-slate-900 border border-indigo-500/30 space-y-2 relative overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-300 flex items-center space-x-1.5">
                        <GraduationCap className="w-4 h-4 text-indigo-400" />
                        <span>Current SGPA</span>
                      </span>
                      {latestSem && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          Semester {latestSem}
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-3xl font-black text-white">
                        {currentSgpa !== null ? currentSgpa.toFixed(2) : '--.--'}
                      </span>
                      <span className="text-sm font-bold text-slate-400">/ 10</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {currentSgpa !== null ? `Most recent semester SGPA (Sem ${latestSem})` : 'No semester SGPA entered yet'}
                    </p>
                  </div>

                  {/* Overall CGPA Card */}
                  <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-950/60 to-slate-900 border border-emerald-500/30 space-y-2 relative overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-300 flex items-center space-x-1.5">
                        <Trophy className="w-4 h-4 text-emerald-400" />
                        <span>Overall CGPA</span>
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Auto-Calculated
                      </span>
                    </div>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-3xl font-black text-emerald-400">
                        {overallCgpa !== null ? overallCgpa.toFixed(2) : '--.--'}
                      </span>
                      <span className="text-sm font-bold text-slate-400">/ 10</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {completedSemesters.length > 0 
                        ? `Average of ${completedSemesters.length} completed ${completedSemesters.length === 1 ? 'semester' : 'semesters'}` 
                        : 'Enter SGPAs below to calculate overall CGPA'}
                    </p>
                  </div>

                  {/* Academic Performance Status Card */}
                  <div className="p-5 rounded-3xl bg-gradient-to-br from-purple-950/60 to-slate-900 border border-purple-500/30 space-y-2 relative overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-purple-300 flex items-center space-x-1.5">
                        <Award className="w-4 h-4 text-purple-400" />
                        <span>Academic Standing</span>
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {completedSemesters.length}/8 Sems
                      </span>
                    </div>
                    <div className="text-lg font-extrabold text-white truncate pt-1">
                      {overallCgpa !== null ? (
                        overallCgpa >= 8.5 ? '⭐ First Class with Distinction' :
                        overallCgpa >= 7.5 ? '🟢 First Class' :
                        overallCgpa >= 6.0 ? '🟡 Second Class' : '✅ Pass Grade'
                      ) : 'Pending Entry'}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {completedSemesters.length > 0
                        ? `${completedSemesters.length} of 8 semester SGPAs recorded`
                        : 'Log SGPAs to calculate status'}
                    </p>
                  </div>

                </div>

                {/* SGPA Input Grid (Semesters 1 to 8) */}
                <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                    <div>
                      <h3 className="text-base font-extrabold text-white flex items-center space-x-2">
                        <GraduationCap className="w-5 h-5 text-indigo-400" />
                        <span>Semester SGPA Entry (Semesters 1 - 8)</span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Enter your SGPA for each semester out of 10.00. Overall CGPA will automatically calculate as the average of completed semester SGPAs.
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={handleSaveAllSgpas}
                        className="px-4 py-2.5 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white shadow-md shadow-brand-600/20 flex items-center space-x-1.5 transition-all hover:scale-[1.02]"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Save SGPA Records</span>
                      </button>
                    </div>
                  </div>

                  {/* 8 SEMESTER CARDS GRID */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => {
                      const valStr = sgpaInputs[sem] || '';
                      const numVal = valStr !== '' ? Number(valStr) : null;
                      const isSaved = currentUser?.sgpaData?.[sem] !== undefined && currentUser?.sgpaData?.[sem] !== null;

                      return (
                        <div 
                          key={sem} 
                          className={`p-4 rounded-2xl border transition-all space-y-3 relative ${
                            isSaved
                              ? 'bg-slate-900/90 border-indigo-500/40 shadow-sm'
                              : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold text-white">Semester {sem}</span>
                            {isSaved && numVal !== null && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                Saved
                              </span>
                            )}
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[10px] font-semibold text-slate-400">
                              SGPA (0.00 - 10.00)
                            </label>
                            <div className="relative flex items-center">
                              <input
                                type="number"
                                min="0"
                                max="10"
                                step="0.01"
                                placeholder="e.g. 8.50"
                                value={valStr}
                                onChange={(e) => handleSgpaChange(sem, e.target.value)}
                                className="w-full px-3 py-2 bg-slate-950 text-sm font-bold text-white rounded-xl border border-slate-800 focus:outline-none focus:border-brand-500 pr-12"
                              />
                              <span className="absolute right-3 text-xs text-slate-500 font-bold pointer-events-none">
                                / 10
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            {valStr ? (
                              <button
                                type="button"
                                onClick={() => handleClearSemesterSgpa(sem)}
                                className="text-[11px] text-rose-400 hover:text-rose-300 font-medium flex items-center space-x-1"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Clear</span>
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-600 italic">Not entered</span>
                            )}

                            {numVal !== null && !isNaN(numVal) && numVal > 0 && (
                              <span className="text-[11px] font-bold text-indigo-300">
                                {numVal.toFixed(2)} / 10
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* CGPA COMPUTATION FOOTER SUMMARY */}
                  {completedSemesters.length > 0 && (
                    <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                      <div className="space-y-1">
                        <span className="font-bold text-indigo-300 flex items-center space-x-1.5 text-xs">
                          <Sparkles className="w-4 h-4 text-indigo-400" />
                          <span>Calculation Breakdown</span>
                        </span>
                        <p className="text-slate-300 text-[11px] leading-relaxed">
                          SGPAs recorded: {completedSemesters.map(c => `Sem ${c.sem}: ${c.sgpa.toFixed(2)}`).join(' • ')}
                        </p>
                      </div>
                      <div className="px-4 py-2 rounded-xl bg-indigo-900/40 border border-indigo-500/40 text-right flex-shrink-0">
                        <span className="text-[10px] text-indigo-300 block font-semibold uppercase">Overall CGPA</span>
                        <span className="text-base font-black text-white">{overallCgpa.toFixed(2)} / 10</span>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            )}

          </div>
        );
      })()}

      {/* TAB 4: NOTIFICATION PREFERENCES */}
      {profileTab === 'preferences' && (
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                  <Bell className="w-5 h-5 text-rose-400" />
                  <span>Notification Preferences</span>
                </h2>
                {showSaveToast && (
                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-in fade-in">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>Auto-Saved</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Customize which notice categories trigger notification bell counts and top ticker alerts. Muted categories remain fully browsable on the Notices page.
              </p>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 font-medium self-start sm:self-auto flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Saves automatically to Firestore</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {prefCategories.map((cat) => {
              const isMuted = (currentUser?.mutedCategories || []).includes(cat.name);
              const isNotified = !isMuted;

              return (
                <div 
                  key={cat.name} 
                  className={`p-5 rounded-2xl border transition-all flex items-start justify-between space-x-4 ${
                    isNotified 
                      ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700 shadow-sm' 
                      : 'bg-slate-950/60 border-slate-800/80 opacity-75'
                  }`}
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <span className={`p-1.5 rounded-lg ${cat.badgeBg} border ${cat.badgeBorder} flex-shrink-0`}>
                        <cat.icon className={`w-4 h-4 ${cat.iconColor}`} />
                      </span>
                      <span className="font-bold text-sm text-white">{cat.name}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        isNotified
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      }`}>
                        {isNotified ? 'Notified' : 'Muted'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {cat.description}
                    </p>
                  </div>

                  {/* Toggle Switch */}
                  <button
                    type="button"
                    onClick={() => {
                      toggleMuteCategory(cat.name);
                      triggerSaveToast();
                    }}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isNotified ? 'bg-brand-600' : 'bg-slate-800'
                    }`}
                    role="switch"
                    aria-checked={isNotified}
                    title={isNotified ? `Mute ${cat.name} notifications` : `Unmute ${cat.name} notifications`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        isNotified ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              );
            })}
          </div>

          {/* TIMETABLE DISPLAY PREFERENCES SECTION */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-emerald-400" />
                    <span>Timetable Display Preferences</span>
                  </h2>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Choose your preferred display order for Class, Internal Exam, and Semester Exam timetables. Duplicate choices are automatically prevented.
                </p>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 font-medium self-start sm:self-auto flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Auto-saves to profile</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* 1st Preference */}
              <div className="space-y-1.5 p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
                <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider">1st Preference (Top Display)</label>
                <select
                  value={currentPrefs[0] || 'class'}
                  onChange={(e) => handleUpdatePrefOrder(0, e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 text-xs font-semibold text-white rounded-xl border border-slate-700 focus:outline-none focus:border-brand-500"
                >
                  {allTTTypes.map(typeOpt => (
                    <option key={typeOpt.id} value={typeOpt.id}>
                      {typeOpt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 2nd Preference */}
              <div className="space-y-1.5 p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
                <label className="block text-xs font-bold text-cyan-300 uppercase tracking-wider">2nd Preference (Middle Display)</label>
                <select
                  value={currentPrefs[1] || 'internal'}
                  onChange={(e) => handleUpdatePrefOrder(1, e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 text-xs font-semibold text-white rounded-xl border border-slate-700 focus:outline-none focus:border-brand-500"
                >
                  {allTTTypes.map(typeOpt => (
                    <option key={typeOpt.id} value={typeOpt.id}>
                      {typeOpt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 3rd Preference */}
              <div className="space-y-1.5 p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
                <label className="block text-xs font-bold text-indigo-300 uppercase tracking-wider">3rd Preference (Bottom Display)</label>
                <select
                  value={currentPrefs[2] || 'semester'}
                  onChange={(e) => handleUpdatePrefOrder(2, e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 text-xs font-semibold text-white rounded-xl border border-slate-700 focus:outline-none focus:border-brand-500"
                >
                  {allTTTypes.map(typeOpt => (
                    <option key={typeOpt.id} value={typeOpt.id}>
                      {typeOpt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* EDIT STUDENT PROFILE MODAL */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md bg-slate-900 rounded-3xl border border-slate-700/80 shadow-2xl overflow-hidden p-6 space-y-5">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-brand-400" />
                <h3 className="text-base font-bold text-white">Update Profile Details</h3>
              </div>
              <button onClick={() => setIsEditingProfile(false)} className="p-1 text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                updateUserProfile({
                  ...profileForm,
                  semester: Number(profileForm.semester)
                });
                setIsEditingProfile(false);
              }}
              className="space-y-4 text-xs"
            >
              {/* Photo upload */}
              <div className="flex items-center space-x-4">
                {profileForm.avatar ? (
                  <img src={profileForm.avatar} alt="Preview" className="w-16 h-16 rounded-2xl object-cover border-2 border-brand-500 shadow-md" />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 border border-slate-700">
                    <Camera className="w-6 h-6" />
                  </div>
                )}

                <div className="space-y-1.5 flex-1">
                  <label className="block text-[11px] font-semibold text-slate-300">Profile Photo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="w-full text-[11px] text-slate-400 file:mr-2 file:py-1 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-600 file:text-white hover:file:bg-brand-500"
                  />
                  <p className="text-[10px] text-slate-500">Choose photo to upload as profile avatar</p>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 text-slate-100 rounded-xl border border-slate-800 focus:outline-none focus:border-brand-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Register Number / Roll No</label>
                <input
                  type="text"
                  placeholder="e.g. 922524205000"
                  value={profileForm.registerNumber}
                  onChange={(e) => setProfileForm({ ...profileForm, registerNumber: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 text-slate-100 rounded-xl border border-slate-800 focus:outline-none focus:border-brand-500 text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Year</label>
                  <select
                    value={profileForm.year}
                    onChange={(e) => {
                      const selectedYear = e.target.value;
                      let defaultSem = 5;
                      if (selectedYear === '1st Year') defaultSem = 1;
                      if (selectedYear === '2nd Year') defaultSem = 3;
                      if (selectedYear === '3rd Year') defaultSem = 5;
                      if (selectedYear === '4th Year') defaultSem = 7;
                      setProfileForm({ ...profileForm, year: selectedYear, semester: defaultSem });
                    }}
                    className="w-full px-2.5 py-2 bg-slate-950 text-slate-100 rounded-xl border border-slate-800 focus:outline-none focus:border-brand-500 text-xs"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Semester</label>
                  <select
                    value={profileForm.semester}
                    onChange={(e) => setProfileForm({ ...profileForm, semester: Number(e.target.value) })}
                    className="w-full px-2.5 py-2 bg-slate-950 text-slate-100 rounded-xl border border-slate-800 focus:outline-none focus:border-brand-500 text-xs"
                  >
                    <option value={1}>Sem 1</option>
                    <option value={2}>Sem 2</option>
                    <option value={3}>Sem 3</option>
                    <option value={4}>Sem 4</option>
                    <option value={5}>Sem 5</option>
                    <option value={6}>Sem 6</option>
                    <option value={7}>Sem 7</option>
                    <option value={8}>Sem 8</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Class</label>
                  <select
                    value={profileForm.classSection}
                    onChange={(e) => setProfileForm({ ...profileForm, classSection: e.target.value })}
                    className="w-full px-2.5 py-2 bg-slate-950 text-slate-100 rounded-xl border border-slate-800 focus:outline-none focus:border-brand-500 text-xs"
                  >
                    <option value="IT-A">Class A</option>
                    <option value="IT-B">Class B</option>
                    <option value="IT-C">Class C</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Short Bio</label>
                <textarea
                  rows={2}
                  placeholder="e.g. IT student passionate about software development..."
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 text-slate-100 rounded-xl border border-slate-800 focus:outline-none focus:border-brand-500 text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white shadow-md shadow-brand-600/30"
                >
                  Save Changes
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
