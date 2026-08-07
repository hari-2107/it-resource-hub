import React, { useState, useMemo } from 'react';
import { 
  X, 
  Users, 
  Search, 
  Trash2, 
  ShieldCheck, 
  Download, 
  UserCheck, 
  BarChart3, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  AlertTriangle, 
  ShieldAlert, 
  Award, 
  Flame, 
  BookOpen, 
  Star, 
  CheckSquare, 
  Square,
  Clock,
  ArrowUpDown,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  XCircle,
  FileText,
  MessageSquare,
  Briefcase,
  Loader2,
  Calendar,
  Layers,
  GraduationCap,
  Eye,
  User,
  Activity,
  ExternalLink,
  Phone,
  Mail,
  Shield,
  Key,
  UserX,
  UserPlus,
  RefreshCw,
  Zap,
  TrendingUp,
  Check,
  Building2,
  Globe
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { StorageService } from '../services/storageService';
import { exportToCSV, exportToWordDoc, exportToPDFReport, generateSingleStudentHTML, generateAllStudentsHTML } from '../utils/exportUtils';
import { ExportPreviewModal } from './ExportPreviewModal';

// Format last active time string helper
const formatLastActive = (dateString) => {
  if (!dateString) return { text: 'Joined recently', isInactive: false, formattedTime: 'N/A' };
  const now = new Date();
  const lastDate = new Date(dateString);
  if (isNaN(lastDate.getTime())) return { text: 'Joined recently', isInactive: false, formattedTime: 'N/A' };

  const diffTime = Math.abs(now - lastDate);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffTime / (1000 * 60));

  const timeOptions = { hour: 'numeric', minute: '2-digit', hour12: true };
  const dateOptions = { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true };
  const formattedTime = lastDate.toLocaleDateString(undefined, dateOptions);
  const clockTime = lastDate.toLocaleTimeString(undefined, timeOptions);

  if (diffMinutes < 2) return { text: '🟢 Active Right Now', isInactive: false, formattedTime };
  if (diffMinutes < 60) return { text: `Active ${diffMinutes}m ago (${clockTime})`, isInactive: false, formattedTime };
  if (diffHours < 24) return { text: `Active Today at ${clockTime}`, isInactive: false, formattedTime };
  if (diffDays === 1) return { text: `Active Yesterday at ${clockTime}`, isInactive: false, formattedTime };
  if (diffDays < 30) return { text: `Active ${diffDays}d ago (${formattedTime})`, isInactive: false, formattedTime };
  return { text: `Inactive (${diffDays}d ago • ${formattedTime})`, isInactive: true, formattedTime };
};

export const UserDirectoryManager = ({ onClose, isModal = false }) => {
  const { 
    registeredUsers = [], 
    removeRegisteredUser, 
    updateUserRole, 
    allMaterials = [], 
    logAdminActivity,
    suggestions = [],
    reports = [],
    interviewExperiences = [],
    timetables = [],
    badges = [],
    updateRegisteredUser
  } = useData();
  
  const { currentUser, isAdmin, isCoAdmin } = useAuth();

  // Primary Filters & Controls State
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All'); // 'All' | 'student' | 'admin'
  const [yearFilter, setYearFilter] = useState('All'); // 'All' | '1st Year' | '2nd Year' | '3rd Year' | '4th Year'
  const [semFilter, setSemFilter] = useState('All'); // 'All' | '1'..'8'
  const [secFilter, setSecFilter] = useState('All'); // 'All' | 'IT-A' | 'IT-B' | 'IT-C'
  const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'active' | 'inactive'
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'name' | 'lastActive'
  const [selectedUserIds, setSelectedUserIds] = useState([]);

  // Dropdown States
  const [directoryExportMenuOpen, setDirectoryExportMenuOpen] = useState(false);

  // Full Profile View State
  const [fullProfileUser, setFullProfileUser] = useState(null);
  const [profileTab, setProfileTab] = useState('overview'); // 'overview' | 'academic' | 'brainzone' | 'activity' | 'timeline'
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [profileErrorMessage, setProfileErrorMessage] = useState('');

  // Export Preview Modal State
  const [exportPreviewModalOpen, setExportPreviewModalOpen] = useState(false);
  const [activeExportConfig, setActiveExportConfig] = useState(null);

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: null, // 'toggleRole' | 'delete' | 'resetXP' | 'resetStreak' | 'resetPassword' | 'toggleDeactivate'
    user: null,
    targetRole: null
  });

  // Self Protection Helper
  const checkIsSelf = (u) => {
    if (!currentUser || !u) return false;
    const curId = currentUser.uid || currentUser.id || currentUser.email;
    const targetId = u.uid || u.id || u.email;
    if (curId && targetId && String(curId).toLowerCase() === String(targetId).toLowerCase()) return true;
    if (currentUser.email && u.email && currentUser.email.toLowerCase() === u.email.toLowerCase()) return true;
    return false;
  };

  // Calculate High Level Metrics
  const totalDownloads = (allMaterials || []).reduce((sum, m) => sum + (m.downloadCount || m.downloads || 0), 0);
  const studentCount = registeredUsers.filter(u => u.role !== 'admin').length;
  const adminCount = registeredUsers.filter(u => u.role === 'admin').length;

  // Filter & Sort Logic
  const filteredUsers = useMemo(() => {
    let result = (registeredUsers || []).filter(u => {
      // Role Filter
      if (roleFilter === 'student' && u.role === 'admin') return false;
      if (roleFilter === 'admin' && u.role !== 'admin') return false;

      // Year Filter
      if (yearFilter !== 'All' && u.year !== yearFilter) return false;

      // Semester Filter
      if (semFilter !== 'All' && String(u.semester) !== String(semFilter)) return false;

      // Section Filter
      if (secFilter !== 'All' && (u.classSection || 'IT-A') !== secFilter) return false;

      // Active Status Filter
      const activeInfo = formatLastActive(u.lastActiveAt || u.lastLoginAt || u.createdAt);
      if (statusFilter === 'active' && activeInfo.isInactive) return false;
      if (statusFilter === 'inactive' && !activeInfo.isInactive) return false;

      // Search Filter
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const matchName = (u.name || '').toLowerCase().includes(q);
        const matchEmail = (u.email || '').toLowerCase().includes(q);
        const matchReg = (u.registerNumber || '').toLowerCase().includes(q);
        const matchClass = (u.classSection || '').toLowerCase().includes(q);
        const matchYear = (u.year || '').toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchReg && !matchClass && !matchYear) return false;
      }
      return true;
    });

    // Sorting
    return result.sort((a, b) => {
      if (sortBy === 'name') {
        return (a.name || '').localeCompare(b.name || '');
      }
      if (sortBy === 'oldest') {
        const dateA = new Date(a.createdAt || a.registeredDate || 0);
        const dateB = new Date(b.createdAt || b.registeredDate || 0);
        return dateA - dateB;
      }
      if (sortBy === 'lastActive') {
        const activeA = new Date(a.lastLoginAt || a.lastActiveAt || a.createdAt || 0);
        const activeB = new Date(b.lastLoginAt || b.lastActiveAt || b.createdAt || 0);
        return activeB - activeA;
      }
      const dateA = new Date(a.createdAt || a.registeredDate || Date.now());
      const dateB = new Date(b.createdAt || b.registeredDate || Date.now());
      return dateB - dateA;
    });
  }, [registeredUsers, roleFilter, yearFilter, semFilter, secFilter, statusFilter, searchTerm, sortBy]);

  // Open Full Profile Handler
  const handleOpenFullProfile = (usr) => {
    setIsLoadingProfile(true);
    setProfileErrorMessage('');
    if (!usr) {
      setProfileErrorMessage('User data is missing or inaccessible.');
      setIsLoadingProfile(false);
      return;
    }
    setFullProfileUser(usr);
    setProfileTab('overview');
    setTimeout(() => {
      setIsLoadingProfile(false);
    }, 200);
  };

  // Selection Handlers
  const isAllSelected = filteredUsers.length > 0 && selectedUserIds.length === filteredUsers.length;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(filteredUsers.map(u => u.uid || u.id || u.email));
    }
  };

  const toggleSelectUser = (id) => {
    setSelectedUserIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Bulk Admin Operations
  const handleBulkDelete = () => {
    if (selectedUserIds.length === 0) return;
    if (window.confirm(`Are you sure you want to permanently delete ${selectedUserIds.length} selected user account(s)?`)) {
      selectedUserIds.forEach(id => {
        const u = registeredUsers.find(item => (item.uid || item.id || item.email) === id);
        if (u && !checkIsSelf(u)) {
          removeRegisteredUser(id);
        }
      });
      if (logAdminActivity) logAdminActivity(`Bulk deleted ${selectedUserIds.length} user accounts`, 'BulkDelete');
      setSelectedUserIds([]);
    }
  };

  const handleBulkRoleChange = (targetRole) => {
    if (selectedUserIds.length === 0) return;
    selectedUserIds.forEach(id => {
      const u = registeredUsers.find(item => (item.uid || item.id || item.email) === id);
      if (u && !checkIsSelf(u)) {
        updateUserRole(id, targetRole);
      }
    });
    if (logAdminActivity) logAdminActivity(`Bulk assigned ${targetRole.toUpperCase()} role to ${selectedUserIds.length} users`, 'BulkRole');
    setSelectedUserIds([]);
  };

  // Single Admin Action Triggers
  const promptToggleRole = (u) => {
    if (!isAdmin) {
      alert("Co-Admins do not have permission to modify user roles.");
      return;
    }
    if (checkIsSelf(u)) return;
    const targetRole = u.role === 'admin' ? 'student' : 'admin';
    setConfirmModal({ isOpen: true, type: 'toggleRole', user: u, targetRole });
  };

  const promptDeleteUser = (u) => {
    if (!isAdmin) {
      alert("Co-Admins do not have permission to delete user accounts.");
      return;
    }
    if (checkIsSelf(u)) return;
    setConfirmModal({ isOpen: true, type: 'delete', user: u, targetRole: null });
  };

  const promptResetXP = (u) => {
    setConfirmModal({ isOpen: true, type: 'resetXP', user: u });
  };

  const promptResetStreak = (u) => {
    setConfirmModal({ isOpen: true, type: 'resetStreak', user: u });
  };

  const promptToggleDeactivate = (u) => {
    if (checkIsSelf(u)) return;
    setConfirmModal({ isOpen: true, type: 'toggleDeactivate', user: u });
  };

  const handleConfirmAction = () => {
    const { type, user, targetRole } = confirmModal;
    if (!user) return;
    const uId = user.uid || user.id || user.email;

    if (type === 'toggleRole') {
      updateUserRole(uId, targetRole);
      if (fullProfileUser && (fullProfileUser.uid === uId || fullProfileUser.id === uId || fullProfileUser.email === user.email)) {
        setFullProfileUser(prev => ({ ...prev, role: targetRole }));
      }
      if (logAdminActivity) logAdminActivity(`Changed role of '${user.name}' to ${targetRole.toUpperCase()}`, 'UserRole');
    } else if (type === 'delete') {
      removeRegisteredUser(uId);
      if (fullProfileUser && (fullProfileUser.uid === uId || fullProfileUser.id === uId || fullProfileUser.email === user.email)) {
        setFullProfileUser(null);
      }
      if (logAdminActivity) logAdminActivity(`Permanently deleted user '${user.name}'`, 'UserDelete');
    } else if (type === 'resetXP') {
      if (updateRegisteredUser) updateRegisteredUser(uId, { funPoints: 0, xp: 0 });
      if (fullProfileUser) setFullProfileUser(prev => ({ ...prev, funPoints: 0, xp: 0 }));
      if (logAdminActivity) logAdminActivity(`Reset BrainZone XP for '${user.name}'`, 'ResetXP');
    } else if (type === 'resetStreak') {
      if (updateRegisteredUser) updateRegisteredUser(uId, { streak: 1, loginStreak: 1 });
      if (fullProfileUser) setFullProfileUser(prev => ({ ...prev, streak: 1, loginStreak: 1 }));
      if (logAdminActivity) logAdminActivity(`Reset daily streak for '${user.name}'`, 'ResetStreak');
    } else if (type === 'toggleDeactivate') {
      const isDeactive = !user.deactivated;
      if (updateRegisteredUser) updateRegisteredUser(uId, { deactivated: isDeactive });
      if (fullProfileUser) setFullProfileUser(prev => ({ ...prev, deactivated: isDeactive }));
      if (logAdminActivity) logAdminActivity(`${isDeactive ? 'Deactivated' : 'Re-activated'} account for '${user.name}'`, 'AccountStatus');
    }

    setConfirmModal({ isOpen: false, type: null, user: null, targetRole: null });
  };

  // Initiate Export with Preview Modal
  const startExportProcess = (title, format, user = null, userList = null) => {
    setDirectoryExportMenuOpen(false);
    const targetUsers = userList || (user ? [user] : filteredUsers);
    
    let htmlContent = '';
    if (user) {
      const uKey = user.uid || user.id || user.email;
      const uMarks = StorageService.getStudentMarks(uKey) || [];
      htmlContent = generateSingleStudentHTML(user, { userMarks: uMarks });
    } else {
      htmlContent = generateAllStudentsHTML(targetUsers, title);
    }

    setActiveExportConfig({
      title,
      format,
      pageCount: user ? 2 : Math.ceil(targetUsers.length / 10) + 1,
      user,
      userCount: targetUsers.length,
      htmlContent,
      targetUsers
    });

    setExportPreviewModalOpen(true);
  };

  const executeDownload = () => {
    if (!activeExportConfig) return;
    const { title, format, user, targetUsers, htmlContent } = activeExportConfig;
    const filenameBase = user ? `${user.name?.replace(/\s+/g, '_')}_Full_Report` : `${title?.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}`;
    const getUrlStr = (raw) => (typeof raw === 'string' ? raw : (raw && typeof raw === 'object' && raw.url) ? raw.url : 'Not Added');

    if (format === 'csv') {
      const exportData = targetUsers.map(u => {
        const uKey = u.uid || u.id || u.email;
        const uMarks = StorageService.getStudentMarks(uKey) || [];
        const marksStr = uMarks.map(m => `${m.subject}: Int1(${m.internal1 || 40})/Int2(${m.internal2 || 45})`).join('; ');

        return {
          Name: u.name || '',
          RegisterNumber: u.registerNumber || '',
          ClassSection: `${u.classSection || 'IT-A'} (${u.year || '3rd Year'}, Sem ${u.semester || 5})`,
          Email: u.email || '',
          PhoneNumber: u.phone || u.phoneNumber || '+91 98765 43210',
          Role: (u.role || 'student').toUpperCase(),
          Department: 'Information Technology (IT)',
          SGPA: `${u.sgpa || '8.75'} / 10.0`,
          CGPA: `${u.cgpa || '8.60'} / 10.0`,
          Attendance: `${u.attendance || '92.5'}%`,
          BrainZone_XP: u.funPoints ?? u.xp ?? 0,
          Current_Level: `Lvl ${u.level || Math.floor((u.funPoints ?? u.xp ?? 0) / 200) + 1}`,
          Streak_Days: `🔥 ${u.loginStreak || u.streak || 1} Days`,
          Badge_Title: u.equippedTitle || 'Algorithm Apprentice',
          Internal_Marks_Summary: marksStr || 'FSWD: 46/50; ESIOT: 44/50; STA: 47/50; BDA: 42/50; CN: 41/50; DC: 46/50',
          GitHub_Profile: getUrlStr(u.githubUrl || u.github),
          LinkedIn_Profile: getUrlStr(u.linkedinUrl || u.linkedin),
          LeetCode_Profile: getUrlStr(u.leetcodeUrl || u.leetcode),
          Portfolio_Website: getUrlStr(u.portfolioUrl || u.website),
          Resume_PDF_Document: getUrlStr(u.resumeUrl || u.driveUrl),
          Materials_Downloaded: `${u.downloadsCount || 12} files`,
          Notes_Uploaded: `${u.uploadsCount || 3} notes`,
          Quiz_Attempts: `${u.quizAttempts || 8} quizzes`,
          Bug_Hunts: `${u.bugHunts || 5} challenges`,
          Typing_Speed: `${u.typingAttempts || 14} runs`,
          RegistrationDate: u.registeredDate || u.createdAt || '',
          LastActive: u.lastActiveAt || u.lastLoginAt || ''
        };
      });
      exportToCSV(exportData, `${filenameBase}.csv`);
    } else if (format === 'word') {
      exportToWordDoc(title, htmlContent, `${filenameBase}.doc`);
    } else if (format === 'pdf') {
      exportToPDFReport(title, htmlContent);
    }

    if (logAdminActivity) logAdminActivity(`Exported ${title} as ${format.toUpperCase()}`, 'Export');
    setExportPreviewModalOpen(false);
    setActiveExportConfig(null);
  };

  // Full Profile View Screen Renderer
  if (fullProfileUser) {
    const isSelf = checkIsSelf(fullProfileUser);
    const activeStatus = formatLastActive(fullProfileUser.lastActiveAt || fullProfileUser.lastLoginAt || fullProfileUser.createdAt);
    const userKey = fullProfileUser.uid || fullProfileUser.id || fullProfileUser.email;
    const userMarks = StorageService.getStudentMarks(userKey) || [];

    const userPeerNotes = (allMaterials || []).filter(m => 
      m.isStudentContributed && 
      (m.uploadedBy === fullProfileUser.name || m.uploadedByUserId === userKey || m.email === fullProfileUser.email)
    );

    const userSuggestions = (suggestions || []).filter(s => 
      s.userId === userKey || 
      (s.userEmail && s.userEmail.toLowerCase() === (fullProfileUser.email || '').toLowerCase()) ||
      (s.userName && s.userName.toLowerCase() === (fullProfileUser.name || '').toLowerCase())
    );

    const userReports = (reports || []).filter(r => 
      (r.reportedBy && r.reportedBy.toLowerCase() === (fullProfileUser.name || '').toLowerCase()) ||
      (r.userEmail && r.userEmail.toLowerCase() === (fullProfileUser.email || '').toLowerCase())
    );

    const userXP = fullProfileUser.funPoints ?? fullProfileUser.xp ?? 0;
    const userLevel = fullProfileUser.level || Math.floor(userXP / 200) + 1;
    const currentStreak = fullProfileUser.loginStreak || fullProfileUser.streak || 1;

    return (
      <div className="space-y-6 animate-in fade-in">
        
        {/* Top Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <button
            onClick={() => setFullProfileUser(null)}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold flex items-center space-x-2 border border-slate-800 self-start shadow-sm transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-cyan-400" />
            <span>Back to User Directory</span>
          </button>

          {/* Export Button Options */}
          <div className="flex items-center space-x-2 self-end sm:self-center">
            <button
              onClick={() => startExportProcess(`${fullProfileUser.name} Official Profile Report`, 'csv', fullProfileUser)}
              className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 text-xs font-bold transition-all"
            >
              Export CSV
            </button>
            <button
              onClick={() => startExportProcess(`${fullProfileUser.name} Official Profile Report`, 'word', fullProfileUser)}
              className="px-3 py-1.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600 text-cyan-300 hover:text-white border border-cyan-500/40 text-xs font-bold transition-all"
            >
              Export Word (.doc)
            </button>
            <button
              onClick={() => startExportProcess(`${fullProfileUser.name} Official Profile Report`, 'pdf', fullProfileUser)}
              className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white shadow-md text-xs font-bold transition-all flex items-center space-x-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export PDF</span>
            </button>
          </div>
        </div>

        {/* Profile Main Header Card */}
        <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 relative overflow-hidden space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center space-x-4">
              {fullProfileUser.avatar ? (
                <img 
                  src={fullProfileUser.avatar} 
                  alt={fullProfileUser.name} 
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-cyan-500/40 shadow-xl" 
                />
              ) : (
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center font-black text-2xl text-white shadow-xl ${
                  fullProfileUser.role === 'admin' ? 'bg-emerald-600' : 'bg-brand-600'
                }`}>
                  {fullProfileUser.name ? fullProfileUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}

              <div className="space-y-1.5">
                <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                  <h2 className="text-xl font-extrabold text-white">{fullProfileUser.name || 'Student Account'}</h2>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase ${
                    fullProfileUser.role === 'admin' 
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                      : 'bg-brand-500/20 text-brand-300 border border-brand-500/40'
                  }`}>
                    {fullProfileUser.role || 'Student'}
                  </span>
                  {fullProfileUser.deactivated && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-500/20 text-rose-300 border border-rose-500/40">
                      🔴 Account Deactivated
                    </span>
                  )}
                </div>

                <p className="text-xs font-mono text-cyan-400 font-semibold">{fullProfileUser.email || 'No email registered'}</p>
                <div className="flex items-center space-x-3 text-xs text-slate-400 pt-0.5 flex-wrap gap-y-1">
                  <span>Reg: <strong className="text-white font-mono">{fullProfileUser.registerNumber || 'N/A'}</strong></span>
                  <span>•</span>
                  <span>Dept: <strong className="text-white">Information Technology</strong></span>
                  <span>•</span>
                  <span>Year: <strong className="text-white">{fullProfileUser.year || '3rd Year'}</strong> ({fullProfileUser.classSection || 'IT-A'})</span>
                </div>
              </div>
            </div>

            {/* Quick Stats Badges */}
            <div className="flex items-center space-x-3 self-stretch md:self-auto justify-between">
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-center flex-1 md:flex-none space-y-0.5 min-w-24">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">BrainZone XP</span>
                <p className="text-lg font-black text-amber-400">{userXP} XP</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-center flex-1 md:flex-none space-y-0.5 min-w-24">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Daily Streak</span>
                <p className="text-lg font-black text-rose-400 flex items-center justify-center gap-1">
                  <Flame className="w-4 h-4" />
                  <span>{currentStreak}d</span>
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-center flex-1 md:flex-none space-y-0.5 min-w-24">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Level</span>
                <p className="text-lg font-black text-cyan-400">Lvl {userLevel}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Profile View Tabs */}
        <div className="flex items-center space-x-2 border-b border-slate-800 pb-2 overflow-x-auto scrollbar-none">
          {[
            { id: 'overview', label: '📌 Profile Overview', icon: User },
            { id: 'academic', label: '🎓 Academic Details', icon: GraduationCap },
            { id: 'brainzone', label: '🧠 BrainZone Stats', icon: Award },
            { id: 'activity', label: '📊 Activity & Submissions', icon: Activity },
            { id: 'timeline', label: '⏱️ Milestone Timeline', icon: Clock }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setProfileTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
                  profileTab === tab.id
                    ? 'bg-cyan-600 text-white shadow-md'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW & PERSONAL DETAILS */}
        {profileTab === 'overview' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Account Information Card */}
              <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="text-sm font-extrabold text-white flex items-center space-x-2 border-b border-slate-800 pb-2">
                  <User className="w-4 h-4 text-cyan-400" />
                  <span>Personal & Registration Details</span>
                </h4>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-slate-900">
                    <span className="text-slate-400">Full Name</span>
                    <span className="font-bold text-white">{fullProfileUser.name || 'N/A'}</span>
                  </div>

                  <div className="flex justify-between py-1.5 border-b border-slate-900">
                    <span className="text-slate-400">Register Number</span>
                    <span className="font-mono font-bold text-cyan-300">{fullProfileUser.registerNumber || 'N/A'}</span>
                  </div>

                  <div className="flex justify-between py-1.5 border-b border-slate-900">
                    <span className="text-slate-400">Email Address</span>
                    <span className="font-mono text-slate-200">{fullProfileUser.email || 'N/A'}</span>
                  </div>

                  <div className="flex justify-between py-1.5 border-b border-slate-900">
                    <span className="text-slate-400">Phone Number</span>
                    <span className="font-mono text-slate-200">{fullProfileUser.phone || fullProfileUser.phoneNumber || '+91 98765 43210'}</span>
                  </div>

                  <div className="flex justify-between py-1.5 border-b border-slate-900">
                    <span className="text-slate-400">Department</span>
                    <span className="font-bold text-white">Information Technology (IT)</span>
                  </div>

                  <div className="flex justify-between py-1.5 border-b border-slate-900">
                    <span className="text-slate-400">Year / Semester / Section</span>
                    <span className="font-bold text-amber-300">{fullProfileUser.year || '3rd Year'}, Sem {fullProfileUser.semester || 5} ({fullProfileUser.classSection || 'IT-A'})</span>
                  </div>

                  <div className="flex justify-between py-1.5 border-b border-slate-900">
                    <span className="text-slate-400">Registration Date</span>
                    <span className="text-slate-300">{fullProfileUser.registeredDate || fullProfileUser.createdAt ? new Date(fullProfileUser.registeredDate || fullProfileUser.createdAt).toLocaleDateString() : 'N/A'}</span>
                  </div>

                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-400">Last Active Login</span>
                    <span className="text-cyan-300 font-semibold">{activeStatus.text}</span>
                  </div>
                </div>
              </div>

              {/* Admin Actions Panel */}
              <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
                <h4 className="text-sm font-extrabold text-white flex items-center space-x-2 border-b border-slate-800 pb-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Admin User Management Controls</span>
                </h4>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => promptResetXP(fullProfileUser)}
                    className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-amber-300 border border-slate-800 font-bold transition-all text-left flex items-center space-x-2 cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4 text-amber-400" />
                    <span>Reset XP Points</span>
                  </button>

                  <button
                    onClick={() => promptResetStreak(fullProfileUser)}
                    className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-rose-300 border border-slate-800 font-bold transition-all text-left flex items-center space-x-2 cursor-pointer"
                  >
                    <Flame className="w-4 h-4 text-rose-400" />
                    <span>Reset Streak</span>
                  </button>

                  <button
                    disabled={isSelf}
                    onClick={() => promptToggleDeactivate(fullProfileUser)}
                    className={`p-2.5 rounded-xl border font-bold transition-all text-left flex items-center space-x-2 cursor-pointer ${
                      isSelf 
                        ? 'opacity-40 cursor-not-allowed bg-slate-900 text-slate-500 border-slate-800'
                        : fullProfileUser.deactivated 
                        ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30 hover:bg-emerald-900/40' 
                        : 'bg-rose-950/40 text-rose-300 border-rose-500/30 hover:bg-rose-900/40'
                    }`}
                  >
                    <UserX className="w-4 h-4 text-rose-400" />
                    <span>{fullProfileUser.deactivated ? 'Activate Account' : 'Deactivate Account'}</span>
                  </button>

                  <button
                    disabled={isSelf}
                    onClick={() => promptToggleRole(fullProfileUser)}
                    className={`p-2.5 rounded-xl border font-bold transition-all text-left flex items-center space-x-2 cursor-pointer ${
                      isSelf 
                        ? 'opacity-40 cursor-not-allowed bg-slate-900 text-slate-500 border-slate-800'
                        : 'bg-slate-900 text-cyan-300 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    <Shield className="w-4 h-4 text-cyan-400" />
                    <span>{fullProfileUser.role === 'admin' ? 'Demote to Student' : 'Promote to Admin'}</span>
                  </button>
                </div>

                <div className="pt-2 border-t border-slate-900">
                  <button
                    disabled={isSelf}
                    onClick={() => promptDeleteUser(fullProfileUser)}
                    className={`w-full p-3 rounded-2xl font-extrabold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                      isSelf 
                        ? 'opacity-40 cursor-not-allowed bg-slate-900 text-slate-500 border border-slate-800' 
                        : 'bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 shadow-sm'
                    }`}
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete User Account Permanently</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Social Links Cards */}
            <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-3">
              <h4 className="text-sm font-extrabold text-white flex items-center space-x-2 border-b border-slate-800 pb-2">
                <Globe className="w-4 h-4 text-indigo-400" />
                <span>Connected Social & Professional Links</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
                {/* GitHub */}
                {(() => {
                  const raw = fullProfileUser.githubUrl || fullProfileUser.github;
                  const urlStr = typeof raw === 'string' ? raw : (raw && typeof raw === 'object' && raw.url) ? raw.url : '';
                  if (!urlStr) {
                    return (
                      <div className="p-3 rounded-2xl bg-slate-900/40 border border-slate-800/80 text-slate-500 space-y-1">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">GitHub</span>
                        <p className="text-slate-600 italic">Not Added</p>
                      </div>
                    );
                  }
                  return (
                    <a href={urlStr} target="_blank" rel="noopener noreferrer" className="p-3 rounded-2xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/40 text-slate-200 transition-all space-y-1 block">
                      <span className="text-[10px] uppercase font-bold text-cyan-400 block">GitHub 🐙</span>
                      <p className="font-mono text-white truncate text-[11px]">{urlStr.replace(/^https?:\/\//, '')}</p>
                    </a>
                  );
                })()}

                {/* LinkedIn */}
                {(() => {
                  const raw = fullProfileUser.linkedinUrl || fullProfileUser.linkedin;
                  const urlStr = typeof raw === 'string' ? raw : (raw && typeof raw === 'object' && raw.url) ? raw.url : '';
                  if (!urlStr) {
                    return (
                      <div className="p-3 rounded-2xl bg-slate-900/40 border border-slate-800/80 text-slate-500 space-y-1">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">LinkedIn</span>
                        <p className="text-slate-600 italic">Not Added</p>
                      </div>
                    );
                  }
                  return (
                    <a href={urlStr} target="_blank" rel="noopener noreferrer" className="p-3 rounded-2xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-blue-500/40 text-slate-200 transition-all space-y-1 block">
                      <span className="text-[10px] uppercase font-bold text-blue-400 block">LinkedIn 💼</span>
                      <p className="font-mono text-white truncate text-[11px]">{urlStr.replace(/^https?:\/\//, '')}</p>
                    </a>
                  );
                })()}

                {/* LeetCode */}
                {(() => {
                  const raw = fullProfileUser.leetcodeUrl || fullProfileUser.leetcode;
                  const urlStr = typeof raw === 'string' ? raw : (raw && typeof raw === 'object' && raw.url) ? raw.url : '';
                  if (!urlStr) {
                    return (
                      <div className="p-3 rounded-2xl bg-slate-900/40 border border-slate-800/80 text-slate-500 space-y-1">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">LeetCode</span>
                        <p className="text-slate-600 italic">Not Added</p>
                      </div>
                    );
                  }
                  return (
                    <a href={urlStr} target="_blank" rel="noopener noreferrer" className="p-3 rounded-2xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/40 text-slate-200 transition-all space-y-1 block">
                      <span className="text-[10px] uppercase font-bold text-amber-400 block">LeetCode 🧩</span>
                      <p className="font-mono text-white truncate text-[11px]">{urlStr.replace(/^https?:\/\//, '')}</p>
                    </a>
                  );
                })()}

                {/* Portfolio */}
                {(() => {
                  const raw = fullProfileUser.portfolioUrl || fullProfileUser.website;
                  const urlStr = typeof raw === 'string' ? raw : (raw && typeof raw === 'object' && raw.url) ? raw.url : '';
                  if (!urlStr) {
                    return (
                      <div className="p-3 rounded-2xl bg-slate-900/40 border border-slate-800/80 text-slate-500 space-y-1">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">Portfolio</span>
                        <p className="text-slate-600 italic">Not Added</p>
                      </div>
                    );
                  }
                  return (
                    <a href={urlStr} target="_blank" rel="noopener noreferrer" className="p-3 rounded-2xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-purple-500/40 text-slate-200 transition-all space-y-1 block">
                      <span className="text-[10px] uppercase font-bold text-purple-400 block">Portfolio 🌐</span>
                      <p className="font-mono text-white truncate text-[11px]">{urlStr.replace(/^https?:\/\//, '')}</p>
                    </a>
                  );
                })()}

                {/* Resume */}
                {(() => {
                  const raw = fullProfileUser.resumeUrl || fullProfileUser.driveUrl;
                  const urlStr = typeof raw === 'string' ? raw : (raw && typeof raw === 'object' && raw.url) ? raw.url : '';
                  if (!urlStr) {
                    return (
                      <div className="p-3 rounded-2xl bg-slate-900/40 border border-slate-800/80 text-slate-500 space-y-1">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">Resume</span>
                        <p className="text-slate-600 italic">Not Added</p>
                      </div>
                    );
                  }
                  return (
                    <a href={urlStr} target="_blank" rel="noopener noreferrer" className="p-3 rounded-2xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/40 text-slate-200 transition-all space-y-1 block">
                      <span className="text-[10px] uppercase font-bold text-emerald-400 block">Resume PDF 📄</span>
                      <p className="font-mono text-white truncate text-[11px]">View Document</p>
                    </a>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ACADEMIC DETAILS */}
        {profileTab === 'academic' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Current SGPA</span>
                <p className="text-2xl font-black text-cyan-400">{fullProfileUser.sgpa || '8.75'} / 10.0</p>
                <span className="text-[10px] text-slate-500">Semester {fullProfileUser.semester || 5} Performance</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Overall CGPA</span>
                <p className="text-2xl font-black text-emerald-400">{fullProfileUser.cgpa || '8.60'} / 10.0</p>
                <span className="text-[10px] text-slate-500">Cumulative Academic Score</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Attendance Rate</span>
                <p className="text-2xl font-black text-amber-400">{fullProfileUser.attendance || '92.5'}%</p>
                <span className="text-[10px] text-slate-500">Subject Attendance Tracker</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Completed Semesters</span>
                <p className="text-2xl font-black text-purple-400">{(fullProfileUser.semester || 5) - 1} Semesters</p>
                <span className="text-[10px] text-slate-500">Currently in Sem {fullProfileUser.semester || 5}</span>
              </div>
            </div>

            {/* Marks Table */}
            <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-3">
              <h4 className="text-sm font-extrabold text-white flex items-center space-x-2 border-b border-slate-800 pb-2">
                <BookOpen className="w-4 h-4 text-cyan-400" />
                <span>Internal Assessment Subject Marks</span>
              </h4>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-3">Subject Name</th>
                      <th className="p-3">Internal 1 (50)</th>
                      <th className="p-3">Internal 2 (50)</th>
                      <th className="p-3">Avg Mark</th>
                      <th className="p-3">Grade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900">
                    {userMarks.map(m => {
                      const avg = Math.round(((m.internal1 || 0) + (m.internal2 || 0)) / 2);
                      return (
                        <tr key={m.id} className="hover:bg-slate-900/40">
                          <td className="p-3 font-bold text-white">{m.subject}</td>
                          <td className="p-3 text-cyan-300 font-mono font-bold">{m.internal1 || 42} / 50</td>
                          <td className="p-3 text-emerald-300 font-mono font-bold">{m.internal2 || 46} / 50</td>
                          <td className="p-3 font-extrabold text-amber-300">{avg} / 50</td>
                          <td className="p-3 font-bold text-emerald-400">{avg >= 45 ? 'O' : avg >= 40 ? 'A+' : 'A'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: BRAINZONE ANALYTICS */}
        {profileTab === 'brainzone' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Leaderboard Rank</span>
                <p className="text-2xl font-black text-amber-400">#4 Top Student</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Current Badge Title</span>
                <p className="text-lg font-black text-cyan-300 truncate">{fullProfileUser.equippedTitle || 'Algorithm Master'}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Longest Daily Streak</span>
                <p className="text-2xl font-black text-rose-400">🔥 {currentStreak + 4} Days</p>
              </div>
            </div>

            {/* Badges Grid */}
            <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-3">
              <h4 className="text-sm font-extrabold text-white flex items-center space-x-2 border-b border-slate-800 pb-2">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Unlocked Achievement Badges & Collectibles</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {(badges || []).slice(0, 6).map(bdg => (
                  <div key={bdg.id} className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center space-x-3 text-xs">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-xl flex items-center justify-center flex-shrink-0">
                      {bdg.icon || '🏅'}
                    </div>
                    <div>
                      <p className="font-bold text-white">{bdg.title}</p>
                      <p className="text-[11px] text-slate-400">{bdg.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: ACTIVITY & SUBMISSIONS */}
        {profileTab === 'activity' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Materials Downloaded</span>
                <p className="text-lg font-black text-cyan-300">14 Files</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Notes Uploaded</span>
                <p className="text-lg font-black text-emerald-300">{userPeerNotes.length} Notes</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Quiz Attempts</span>
                <p className="text-lg font-black text-amber-300">8 Completed</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Bug Hunts</span>
                <p className="text-lg font-black text-rose-300">5 Challenges</p>
              </div>
            </div>

            {/* Detailed Peer Submissions List */}
            <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-3">
              <h4 className="text-sm font-extrabold text-white flex items-center space-x-2 border-b border-slate-800 pb-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                <span>Submitted Peer Study Notes ({userPeerNotes.length})</span>
              </h4>

              {userPeerNotes.length === 0 ? (
                <p className="text-xs text-slate-400 p-3 text-center italic">No peer notes submitted by this student yet.</p>
              ) : (
                <div className="space-y-2">
                  {userPeerNotes.map(n => (
                    <div key={n.id} className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-white">{n.title}</p>
                        <p className="text-[11px] text-slate-400">{n.subjectName} • Sem {n.semester}</p>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {n.status || 'Approved'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: MILESTONE TIMELINE */}
        {profileTab === 'timeline' && (
          <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-5 animate-in fade-in">
            <h4 className="text-sm font-extrabold text-white flex items-center space-x-2 border-b border-slate-800 pb-3">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Student Account Milestone Journey Timeline</span>
            </h4>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
              <div className="relative space-y-1">
                <span className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-slate-950" />
                <h5 className="text-xs font-extrabold text-white">1. Account Registered</h5>
                <p className="text-[11px] text-slate-400">Created student portal account on {fullProfileUser.registeredDate || 'Start of Academic Year'}</p>
              </div>

              <div className="relative space-y-1">
                <span className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-cyan-500 ring-4 ring-slate-950" />
                <h5 className="text-xs font-extrabold text-white">2. Profile Details Completed</h5>
                <p className="text-[11px] text-slate-400">Added Register Number, Section ({fullProfileUser.classSection || 'IT-A'}), and email contact</p>
              </div>

              <div className="relative space-y-1">
                <span className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-amber-500 ring-4 ring-slate-950" />
                <h5 className="text-xs font-extrabold text-white">3. Uploaded Resume & Social Links</h5>
                <p className="text-[11px] text-slate-400">Linked professional accounts and uploaded resume document</p>
              </div>

              <div className="relative space-y-1">
                <span className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-purple-500 ring-4 ring-slate-950" />
                <h5 className="text-xs font-extrabold text-white">4. Earned First BrainZone Achievement Badge</h5>
                <p className="text-[11px] text-slate-400">Unlocked 'Algorithm Apprentice' badge & daily login streak</p>
              </div>

              <div className="relative space-y-1">
                <span className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-rose-500 ring-4 ring-slate-950" />
                <h5 className="text-xs font-extrabold text-white">5. Reached Level {userLevel} Milestone</h5>
                <p className="text-[11px] text-slate-400">Accumulated {userXP} XP points across coding labs & quizzes</p>
              </div>

              <div className="relative space-y-1">
                <span className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-emerald-400 ring-4 ring-slate-950" />
                <h5 className="text-xs font-extrabold text-emerald-300">6. Last Active Session</h5>
                <p className="text-[11px] text-slate-400">{activeStatus.text}</p>
              </div>
            </div>
          </div>
        )}

        {/* Reusable Export Preview Modal in Profile View */}
        <ExportPreviewModal
          isOpen={exportPreviewModalOpen}
          onClose={() => setExportPreviewModalOpen(false)}
          onConfirm={executeDownload}
          exportDetails={activeExportConfig}
        />

      </div>
    );
  }

  // STANDARD DIRECTORY VIEW WITH MULTI-FILTERS & BULK ACTIONS
  return (
    <div className="space-y-6">
      
      {/* 1. Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Directory</span>
          <p className="text-2xl font-extrabold text-white">{(registeredUsers || []).length}</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Students</span>
          <p className="text-2xl font-extrabold text-cyan-400">{studentCount}</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Administrators</span>
          <p className="text-2xl font-extrabold text-emerald-400">{adminCount}</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Resource Downloads</span>
          <p className="text-2xl font-extrabold text-amber-400">{totalDownloads}</p>
        </div>
      </div>

      {/* 2. Control Toolbar */}
      <div className="flex flex-col space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Search Input Bar */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search name, email, reg no, year, section..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 text-xs text-white rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Right Action Tools: Sort & Multi Export Dropdown */}
          <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-end">
            
            {/* Sort Dropdown */}
            <div className="flex items-center space-x-1 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
              >
                <option value="newest" className="bg-slate-900 text-white">Sort: Newest</option>
                <option value="oldest" className="bg-slate-900 text-white">Sort: Oldest</option>
                <option value="name" className="bg-slate-900 text-white">Sort: Name (A-Z)</option>
                <option value="lastActive" className="bg-slate-900 text-white">Sort: Last Active</option>
              </select>
            </div>

            {/* Advanced Export Options Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDirectoryExportMenuOpen(prev => !prev)}
                className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Users</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {directoryExportMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50 animate-in fade-in space-y-1 text-left">
                  <div className="px-2 py-1 text-[10px] font-bold uppercase text-slate-400 border-b border-slate-800">
                    Export Format & Scope
                  </div>
                  <button
                    onClick={() => startExportProcess('All Registered Users Roster', 'csv', null, registeredUsers)}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-200 hover:bg-emerald-500/20 hover:text-emerald-300 transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <span>📊 Export All Users (Excel .csv)</span>
                  </button>
                  <button
                    onClick={() => startExportProcess('All Registered Users PDF Report', 'pdf', null, registeredUsers)}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-200 hover:bg-purple-500/20 hover:text-purple-300 transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <span>📄 Export All Users (PDF)</span>
                  </button>
                  <button
                    onClick={() => startExportProcess('All Registered Users Word Report', 'word', null, registeredUsers)}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-200 hover:bg-cyan-500/20 hover:text-cyan-300 transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <span>📝 Export All Users (Word)</span>
                  </button>

                  <div className="border-t border-slate-800 my-1 pt-1">
                    <button
                      onClick={() => startExportProcess('Department Students Roster', 'pdf', null, registeredUsers.filter(u => u.role !== 'admin'))}
                      className="w-full text-left px-3 py-1.5 rounded-xl text-xs font-bold text-slate-300 hover:bg-slate-800 cursor-pointer"
                    >
                      • Export Only Students ({studentCount})
                    </button>
                    <button
                      onClick={() => startExportProcess('Department Admins Roster', 'pdf', null, registeredUsers.filter(u => u.role === 'admin'))}
                      className="w-full text-left px-3 py-1.5 rounded-xl text-xs font-bold text-slate-300 hover:bg-slate-800 cursor-pointer"
                    >
                      • Export Only Admins ({adminCount})
                    </button>
                    <button
                      onClick={() => startExportProcess('Current Filtered Search Export', 'csv', null, filteredUsers)}
                      className="w-full text-left px-3 py-1.5 rounded-xl text-xs font-bold text-slate-300 hover:bg-slate-800 cursor-pointer"
                    >
                      • Export Current Search Result ({filteredUsers.length})
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Multi Parameter Filter Pills Bar */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          
          {/* Role Filter */}
          <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {['All', 'student', 'admin'].map(r => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  roleFilter === r ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                {r === 'All' ? 'All Roles' : r === 'student' ? 'Students' : 'Admins'}
              </button>
            ))}
          </div>

          {/* Year Filter */}
          <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {['All', '1st Year', '2nd Year', '3rd Year', '4th Year'].map(y => (
              <button
                key={y}
                onClick={() => setYearFilter(y)}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  yearFilter === y ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                {y}
              </button>
            ))}
          </div>

          {/* Section Filter */}
          <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {['All', 'IT-A', 'IT-B', 'IT-C'].map(sec => (
              <button
                key={sec}
                onClick={() => setSecFilter(sec)}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  secFilter === sec ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                {sec}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* Selected Users Bulk Operations Bar */}
      {selectedUserIds.length > 0 && (
        <div className="p-3 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center space-x-2 text-xs font-extrabold text-cyan-300">
            <CheckSquare className="w-4 h-4 text-cyan-400" />
            <span>{selectedUserIds.length} User(s) Selected</span>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <button
              onClick={() => {
                const selectedUsers = registeredUsers.filter(u => selectedUserIds.includes(u.uid || u.id || u.email));
                startExportProcess('Selected Users Export', 'csv', null, selectedUsers);
              }}
              className="px-3 py-1 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold"
            >
              Export Selected
            </button>
            <button
              onClick={() => handleBulkRoleChange('admin')}
              className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
            >
              Assign Admin
            </button>
            <button
              onClick={() => handleBulkRoleChange('student')}
              className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold border border-slate-700"
            >
              Remove Admin
            </button>
            <button
              onClick={handleBulkDelete}
              className="px-3 py-1 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold"
            >
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* User Directory Rows List */}
      <div className="space-y-3">
        {filteredUsers.length > 0 && (
          <div className="flex items-center justify-between px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <div className="flex items-center space-x-2">
              <button 
                onClick={toggleSelectAll} 
                className="text-slate-400 hover:text-white flex items-center space-x-1 cursor-pointer"
              >
                {isAllSelected ? <CheckSquare className="w-4 h-4 text-cyan-400" /> : <Square className="w-4 h-4 text-slate-600" />}
                <span>Select All ({filteredUsers.length})</span>
              </button>
            </div>
            <span>Account Actions & Permissions</span>
          </div>
        )}

        {filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2 bg-slate-950/60 rounded-3xl border border-slate-800">
            <Users className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-sm font-semibold">No registered users match your search or filter requirements.</p>
          </div>
        ) : (
          filteredUsers.map(usr => {
            const isUserAdmin = usr.role === 'admin';
            const isSelf = checkIsSelf(usr);
            const usrId = usr.uid || usr.id || usr.email;
            const isSelected = selectedUserIds.includes(usrId);
            const activeStatus = formatLastActive(usr.lastActiveAt || usr.lastLoginAt || usr.createdAt);

            return (
              <div 
                key={usrId}
                className={`p-4 rounded-2xl bg-slate-950 border transition-all shadow-sm group ${
                  isSelf ? 'border-cyan-500/50 bg-slate-950/90' : isSelected ? 'border-cyan-500/40 bg-cyan-950/20' : 'border-slate-800 hover:border-cyan-500/40'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  
                  <div className="flex items-start space-x-3.5 min-w-0 flex-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelectUser(usrId);
                      }}
                      className="mt-2 text-slate-500 hover:text-cyan-400 transition-colors"
                    >
                      {isSelected ? <CheckSquare className="w-4 h-4 text-cyan-400" /> : <Square className="w-4 h-4 text-slate-600" />}
                    </button>

                    {usr.avatar ? (
                      <img 
                        src={usr.avatar} 
                        alt={usr.name} 
                        onClick={() => handleOpenFullProfile(usr)}
                        className="w-11 h-11 rounded-xl object-cover flex-shrink-0 shadow-md cursor-pointer hover:scale-105 transition-all border border-cyan-500/30" 
                      />
                    ) : (
                      <div 
                        onClick={() => handleOpenFullProfile(usr)}
                        className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-white text-base flex-shrink-0 shadow-md cursor-pointer hover:scale-105 transition-all ${
                          isUserAdmin ? 'bg-emerald-600' : 'bg-brand-600'
                        }`}
                      >
                        {usr.name ? usr.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                    )}

                    <div 
                      onClick={() => handleOpenFullProfile(usr)}
                      className="space-y-1 min-w-0 cursor-pointer flex-1"
                    >
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <h5 className="font-bold text-sm text-white truncate flex items-center space-x-1.5 group-hover:text-cyan-300 transition-colors">
                          <span>{usr.name || 'Student Account'}</span>
                          {isSelf && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-black bg-cyan-500/30 text-cyan-300 border border-cyan-500/40">
                              (You)
                            </span>
                          )}
                        </h5>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                          isUserAdmin ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-brand-500/20 text-brand-300 border border-brand-500/40'
                        }`}>
                          {usr.role || 'Student'}
                        </span>
                      </div>

                      <p className="text-xs font-mono text-slate-400 truncate">{usr.email}</p>

                      <div className="flex items-center space-x-3 text-[11px] text-slate-500 pt-0.5 flex-wrap gap-y-1">
                        <span>Reg: <strong className="text-slate-300 font-mono">{usr.registerNumber || 'N/A'}</strong></span>
                        <span>•</span>
                        <span>{usr.year || '3rd Year'} • Sem {usr.semester || 5} ({usr.classSection || 'IT-A'})</span>
                        <span>•</span>
                        <span className="text-cyan-400 font-semibold">{activeStatus.text}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Full Profile Button */}
                  <div className="flex items-center space-x-2 self-end md:self-center flex-shrink-0">
                    <button
                      onClick={() => handleOpenFullProfile(usr)}
                      className="px-3 py-1.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600 text-cyan-300 hover:text-white text-[11px] font-bold flex items-center space-x-1 border border-cyan-500/40 transition-all shadow-sm cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Full Profile</span>
                    </button>

                    <button
                      disabled={isSelf}
                      onClick={() => promptToggleRole(usr)}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                        isSelf 
                          ? 'opacity-40 cursor-not-allowed bg-slate-800 text-slate-500 border border-slate-700' 
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 shadow-sm'
                      }`}
                    >
                      {isUserAdmin ? 'Toggle Student' : 'Toggle Admin'}
                    </button>

                    <button
                      disabled={isSelf}
                      onClick={() => promptDeleteUser(usr)}
                      className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                        isSelf 
                          ? 'opacity-30 cursor-not-allowed text-slate-600' 
                          : 'text-slate-400 hover:text-rose-400 hover:bg-rose-500/10'
                      }`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Reusable Export Preview Modal */}
      <ExportPreviewModal
        isOpen={exportPreviewModalOpen}
        onClose={() => setExportPreviewModalOpen(false)}
        onConfirm={executeDownload}
        exportDetails={activeExportConfig}
      />

      {/* Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[130] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 text-center">
            <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
            <h4 className="text-base font-extrabold text-white">Confirm Admin Action</h4>
            <p className="text-xs text-slate-300">
              {confirmModal.type === 'resetXP' && (
                <>Are you sure you want to reset BrainZone XP points to <strong>0 XP</strong> for user <strong>{confirmModal.user?.name}</strong>?</>
              )}
              {confirmModal.type === 'resetStreak' && (
                <>Are you sure you want to reset daily streak to <strong>1 day</strong> for user <strong>{confirmModal.user?.name}</strong>?</>
              )}
              {confirmModal.type === 'toggleDeactivate' && (
                <>Are you sure you want to <strong>{confirmModal.user?.deactivated ? 'Activate' : 'Deactivate'}</strong> the account for user <strong>{confirmModal.user?.name}</strong>?</>
              )}
              {confirmModal.type === 'toggleRole' && (
                <>Are you sure you want to change the role of user <strong>{confirmModal.user?.name}</strong> to <strong>{confirmModal.targetRole?.toUpperCase()}</strong>?</>
              )}
              {confirmModal.type === 'delete' && (
                <>Are you sure you want to permanently delete the account for user <strong>{confirmModal.user?.name}</strong>?</>
              )}
              {!['resetXP', 'resetStreak', 'toggleDeactivate', 'toggleRole', 'delete'].includes(confirmModal.type) && (
                <>Are you sure you want to perform this operation for user <strong>{confirmModal.user?.name}</strong>?</>
              )}
            </p>
            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                onClick={() => setConfirmModal({ isOpen: false, type: null, user: null, targetRole: null })}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-md cursor-pointer"
              >
                Confirm Action
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export const UserDirectoryModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in">
      <div className="w-full max-w-6xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Modal Header */}
        <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Registered User Directory & Admin Analytics</h3>
              <p className="text-xs text-slate-400">Manage student accounts, review performance, and export department roster data</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 scrollbar-thin">
          <UserDirectoryManager onClose={onClose} isModal={true} />
        </div>

      </div>
    </div>
  );
};

export default UserDirectoryModal;
