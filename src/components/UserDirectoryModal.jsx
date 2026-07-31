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
  Activity
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { StorageService } from '../services/storageService';

// Format last active time string
const formatLastActive = (dateString) => {
  if (!dateString) return { text: 'Joined recently', isInactive: false };
  const now = new Date();
  const lastDate = new Date(dateString);
  const diffTime = Math.abs(now - lastDate);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffTime / (1000 * 60));

  if (diffMinutes < 5) return { text: 'Active Just now', isInactive: false };
  if (diffHours < 24) return { text: `Active Today (${diffHours}h ago)`, isInactive: false };
  if (diffDays === 1) return { text: 'Active 1 day ago', isInactive: false };
  if (diffDays < 30) return { text: `Active ${diffDays} days ago`, isInactive: false };
  return { text: `Inactive (${diffDays}d ago)`, isInactive: true };
};

export const UserDirectoryManager = ({ onClose, isModal = false }) => {
  const { 
    registeredUsers, 
    removeRegisteredUser, 
    updateUserRole, 
    allMaterials, 
    logAdminActivity,
    suggestions = [],
    reports = [],
    interviewExperiences = [],
    timetables = [],
    badges = []
  } = useData();
  
  const { currentUser } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All'); // 'All' | 'student' | 'admin'
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'name' | 'lastActive'
  const [expandedUserId, setExpandedUserId] = useState(null);
  const [selectedUserIds, setSelectedUserIds] = useState([]);

  // Full Profile View State
  const [fullProfileUser, setFullProfileUser] = useState(null);
  const [profileTab, setProfileTab] = useState('overview'); // 'overview' | 'academic' | 'brainzone' | 'activity'
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: null, // 'toggleRole' | 'delete'
    user: null,
    targetRole: null
  });

  // Calculate Metrics
  const totalDownloads = (allMaterials || []).reduce((sum, m) => sum + (m.downloadCount || m.downloads || 0), 0);
  const studentCount = (registeredUsers || []).filter(u => u.role !== 'admin').length;
  const adminCount = (registeredUsers || []).filter(u => u.role === 'admin').length;

  // Filter & Sort Logic
  const filteredUsers = useMemo(() => {
    let result = (registeredUsers || []).filter(u => {
      // Role Filter
      if (roleFilter === 'student' && u.role === 'admin') return false;
      if (roleFilter === 'admin' && u.role !== 'admin') return false;

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
        const activeA = new Date(a.lastLoginAt || a.createdAt || 0);
        const activeB = new Date(b.lastLoginAt || b.createdAt || 0);
        return activeB - activeA;
      }
      // Default: newest first
      const dateA = new Date(a.createdAt || a.registeredDate || Date.now());
      const dateB = new Date(b.createdAt || b.registeredDate || Date.now());
      return dateB - dateA;
    });
  }, [registeredUsers, roleFilter, searchTerm, sortBy]);

  // Open Full Profile Handler with Loading Animation
  const handleOpenFullProfile = (usr) => {
    setIsLoadingProfile(true);
    setFullProfileUser(usr);
    setProfileTab('overview');
    setTimeout(() => {
      setIsLoadingProfile(false);
    }, 250);
  };

  // Bulk Selection Handlers
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

  // CSV Exporters
  const downloadCSV = (filename, usersList) => {
    const headers = ['UID', 'Name', 'Email', 'Role', 'Register Number', 'Year', 'Semester', 'Class Section', 'XP Points', 'Last Active', 'Joined Date'];
    const rows = usersList.map(u => [
      `"${u.uid || u.id || ''}"`,
      `"${u.name || ''}"`,
      `"${u.email || ''}"`,
      `"${u.role || 'student'}"`,
      `"${u.registerNumber || ''}"`,
      `"${u.year || ''}"`,
      `"${u.semester || ''}"`,
      `"${u.classSection || ''}"`,
      u.funPoints || u.xp || 0,
      `"${u.lastLoginAt || ''}"`,
      `"${u.registeredDate || u.createdAt || ''}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportAll = () => {
    downloadCSV(`IT_Hub_Users_Export_${new Date().toISOString().split('T')[0]}.csv`, filteredUsers);
    if (logAdminActivity) logAdminActivity('Exported Registered Users CSV', 'Export');
  };

  const handleExportSelected = () => {
    const selectedUsers = (registeredUsers || []).filter(u => 
      selectedUserIds.includes(u.uid || u.id || u.email)
    );
    downloadCSV(`IT_Hub_Selected_Users_${selectedUsers.length}_${new Date().toISOString().split('T')[0]}.csv`, selectedUsers);
    if (logAdminActivity) logAdminActivity(`Exported ${selectedUsers.length} Selected Users CSV`, 'Export');
  };

  // Helper to check self-protection
  const checkIsSelf = (u) => {
    if (!currentUser || !u) return false;
    const curId = currentUser.uid || currentUser.id || currentUser.email;
    const targetId = u.uid || u.id || u.email;
    if (curId && targetId && String(curId).toLowerCase() === String(targetId).toLowerCase()) return true;
    if (currentUser.email && u.email && currentUser.email.toLowerCase() === u.email.toLowerCase()) return true;
    return false;
  };

  // Trigger Confirmation Modals
  const promptToggleRole = (u) => {
    if (checkIsSelf(u)) return;
    const targetRole = u.role === 'admin' ? 'student' : 'admin';
    setConfirmModal({
      isOpen: true,
      type: 'toggleRole',
      user: u,
      targetRole
    });
  };

  const promptDeleteUser = (u) => {
    if (checkIsSelf(u)) return;
    setConfirmModal({
      isOpen: true,
      type: 'delete',
      user: u,
      targetRole: null
    });
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
      if (logAdminActivity) {
        logAdminActivity(`Changed user role for '${user.name}' to ${targetRole.toUpperCase()}`, 'UserRole');
      }
    } else if (type === 'delete') {
      removeRegisteredUser(uId);
      if (fullProfileUser && (fullProfileUser.uid === uId || fullProfileUser.id === uId || fullProfileUser.email === user.email)) {
        setFullProfileUser(null);
      }
      if (logAdminActivity) {
        logAdminActivity(`Permanently removed user account '${user.name}' (${user.email})`, 'UserDelete');
      }
    }

    setConfirmModal({ isOpen: false, type: null, user: null, targetRole: null });
  };

  // Render Full Profile View Component if a user is selected for Full View
  if (fullProfileUser) {
    const isSelf = checkIsSelf(fullProfileUser);
    const activeStatus = formatLastActive(fullProfileUser.lastLoginAt || fullProfileUser.createdAt);
    const userKey = fullProfileUser.uid || fullProfileUser.id || fullProfileUser.email;
    const userMarks = StorageService.getStudentMarks(userKey);

    // Derived User Contributions
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

    const userExperiences = (interviewExperiences || []).filter(e => 
      e.studentName && e.studentName.toLowerCase() === (fullProfileUser.name || '').toLowerCase()
    );

    const userTimetable = (timetables || []).find(t => 
      t.year === fullProfileUser.year || t.classSection === fullProfileUser.classSection
    ) || timetables[0] || null;

    const userXP = fullProfileUser.funPoints || fullProfileUser.xp || 150;
    const userLevel = fullProfileUser.level || Math.floor(userXP / 200) + 1;
    const currentStreak = fullProfileUser.loginStreak || fullProfileUser.streak || 1;
    const bestStreak = fullProfileUser.bestStreak || Math.max(currentStreak, 7);

    return (
      <div className="space-y-6 animate-in fade-in">
        
        {/* Top Navigation & Action Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <button
            onClick={() => setFullProfileUser(null)}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold flex items-center space-x-2 border border-slate-800 self-start shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 text-cyan-400" />
            <span>Back to User Directory</span>
          </button>

          {/* Admin Safeguarded Actions */}
          <div className="flex items-center space-x-2 self-end sm:self-center">
            <button
              disabled={isSelf}
              onClick={() => promptToggleRole(fullProfileUser)}
              title={isSelf ? "You cannot modify your own account" : `Toggle ${fullProfileUser.role === 'admin' ? 'Student' : 'Admin'} Role`}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                isSelf 
                  ? 'opacity-40 cursor-not-allowed bg-slate-800 text-slate-500 border border-slate-700' 
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md'
              }`}
            >
              Toggle {fullProfileUser.role === 'admin' ? 'Student' : 'Admin'} Role
            </button>

            <button
              disabled={isSelf}
              onClick={() => promptDeleteUser(fullProfileUser)}
              title={isSelf ? "You cannot delete your own account" : "Delete user account"}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shadow-sm ${
                isSelf 
                  ? 'opacity-30 cursor-not-allowed text-slate-600 bg-slate-900 border border-slate-800' 
                  : 'text-rose-300 hover:text-white bg-rose-600/20 hover:bg-rose-600 border border-rose-500/40'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Account</span>
            </button>
          </div>
        </div>

        {/* Loading Spinner Transition */}
        {isLoadingProfile ? (
          <div className="p-16 text-center text-slate-400 space-y-3 bg-slate-950/60 rounded-3xl border border-slate-800">
            <Loader2 className="w-10 h-10 text-cyan-400 animate-spin mx-auto" />
            <p className="text-sm font-semibold text-white">Fetching complete student profile & academic records...</p>
          </div>
        ) : (
          <>
            {/* User Profile Header Hero Card */}
            <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4 relative overflow-hidden shadow-xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  {/* Large Styled Avatar */}
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg border-2 ${
                    fullProfileUser.role === 'admin' ? 'bg-emerald-600 border-emerald-400/50' : 'bg-brand-600 border-cyan-400/50'
                  }`}>
                    {fullProfileUser.name ? fullProfileUser.name.charAt(0).toUpperCase() : 'U'}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <h2 className="text-xl font-extrabold text-white flex items-center space-x-2">
                        <span>{fullProfileUser.name || 'Student Account'}</span>
                        {isSelf && (
                          <span className="px-2 py-0.5 rounded text-xs font-black bg-cyan-500/30 text-cyan-300 border border-cyan-500/40">
                            (You)
                          </span>
                        )}
                      </h2>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        fullProfileUser.role === 'admin' 
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                          : 'bg-brand-500/20 text-brand-300 border border-brand-500/40'
                      }`}>
                        {fullProfileUser.role === 'admin' ? 'Administrator' : 'Student Member'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300">{fullProfileUser.email}</p>

                    <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                      {fullProfileUser.registerNumber && (
                        <span className="font-mono text-indigo-300 bg-indigo-950/80 px-2.5 py-0.5 rounded border border-indigo-500/40">
                          Register No: {fullProfileUser.registerNumber}
                        </span>
                      )}
                      {fullProfileUser.role !== 'admin' && (
                        <span className="text-slate-200 bg-slate-900 px-2.5 py-0.5 rounded border border-slate-800">
                          {fullProfileUser.year || '3rd Year'} • Semester {fullProfileUser.semester || 5} ({fullProfileUser.classSection || 'IT-A'})
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status Badges on Right */}
                <div className="space-y-2 text-right self-stretch sm:self-auto flex sm:flex-col justify-between items-end">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1.5 ${
                    activeStatus.isInactive 
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }`}>
                    <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                    <span>{activeStatus.text}</span>
                  </span>

                  <div className="text-[11px] text-slate-400">
                    Joined: {fullProfileUser.registeredDate || fullProfileUser.createdAt || 'Recent'}
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Tab Navigation Bar */}
            <div className="flex items-center space-x-2 border-b border-slate-800 pb-2 overflow-x-auto">
              {[
                { id: 'overview', label: '📊 Overview', desc: 'Account Summary' },
                { id: 'academic', label: '📚 Academic & Marks', desc: 'Subject Scores & Timetable' },
                { id: 'brainzone', label: '🧠 BrainZone & Badges', desc: 'Gamification Stats' },
                { id: 'activity', label: '📝 Submissions & Activity', desc: 'Notes, Suggestions & Reports' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setProfileTab(tab.id)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap flex items-center space-x-1.5 ${
                    profileTab === tab.id
                      ? 'bg-cyan-600 text-white shadow-md'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* TAB 1: OVERVIEW */}
            {profileTab === 'overview' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Account Information Card */}
                  <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-3">
                    <h4 className="text-sm font-extrabold text-white flex items-center space-x-2 border-b border-slate-800 pb-2">
                      <User className="w-4 h-4 text-cyan-400" />
                      <span>Account Information</span>
                    </h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1 border-b border-slate-900"><span className="text-slate-400">Full Name:</span><span className="font-bold text-white">{fullProfileUser.name}</span></div>
                      <div className="flex justify-between py-1 border-b border-slate-900"><span className="text-slate-400">Email Address:</span><span className="font-bold text-white">{fullProfileUser.email}</span></div>
                      <div className="flex justify-between py-1 border-b border-slate-900"><span className="text-slate-400">User Role:</span><span className="font-bold text-emerald-400 capitalize">{fullProfileUser.role || 'student'}</span></div>
                      <div className="flex justify-between py-1 border-b border-slate-900"><span className="text-slate-400">Register Number:</span><span className="font-mono text-indigo-300">{fullProfileUser.registerNumber || 'N/A'}</span></div>
                      <div className="flex justify-between py-1 border-b border-slate-900"><span className="text-slate-400">Class & Section:</span><span className="font-bold text-white">{fullProfileUser.year || '3rd Year'} ({fullProfileUser.classSection || 'IT-A'})</span></div>
                      <div className="flex justify-between py-1"><span className="text-slate-400">Last Active:</span><span className="font-bold text-amber-300">{activeStatus.text}</span></div>
                    </div>
                  </div>

                  {/* BrainZone Quick Stats Card */}
                  <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-3">
                    <h4 className="text-sm font-extrabold text-white flex items-center space-x-2 border-b border-slate-800 pb-2">
                      <Award className="w-4 h-4 text-amber-400" />
                      <span>Gamification Summary</span>
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Current Level</span>
                        <p className="text-lg font-black text-amber-300">Level {userLevel}</p>
                      </div>
                      <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Total XP</span>
                        <p className="text-lg font-black text-cyan-300">⚡ {userXP} XP</p>
                      </div>
                      <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Active Streak</span>
                        <p className="text-lg font-black text-emerald-400">🔥 {currentStreak} Days</p>
                      </div>
                      <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Best Streak</span>
                        <p className="text-lg font-black text-indigo-300">⭐ {bestStreak} Days</p>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Submissions Count Banner */}
                <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-center">
                  <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                    <span className="text-slate-400 font-bold">Notes Submitted</span>
                    <p className="text-xl font-extrabold text-indigo-400">{userPeerNotes.length}</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                    <span className="text-slate-400 font-bold">Suggestions</span>
                    <p className="text-xl font-extrabold text-cyan-400">{userSuggestions.length}</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                    <span className="text-slate-400 font-bold">Reports Filed</span>
                    <p className="text-xl font-extrabold text-rose-400">{userReports.length}</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                    <span className="text-slate-400 font-bold">Experiences Shared</span>
                    <p className="text-xl font-extrabold text-amber-400">{userExperiences.length}</p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: ACADEMIC & MARKS */}
            {profileTab === 'academic' && (
              <div className="space-y-4 animate-in fade-in">
                
                {/* Subject Marks Table */}
                <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-3">
                  <h4 className="text-sm font-extrabold text-white flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="flex items-center space-x-2">
                      <BarChart3 className="w-4 h-4 text-indigo-400" />
                      <span>Subject-wise Academic Marks Tracker ({userMarks.length} subjects)</span>
                    </span>
                    <span className="text-xs text-slate-400">Semester {fullProfileUser.semester || 5}</span>
                  </h4>

                  {userMarks.length === 0 ? (
                    <p className="text-xs text-slate-400 p-4 text-center">No subject marks entered yet by this student.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-400 font-bold">
                            <th className="py-2.5 px-3">Subject Name</th>
                            <th className="py-2.5 px-3">Semester</th>
                            <th className="py-2.5 px-3 text-center">Internal Test 1</th>
                            <th className="py-2.5 px-3 text-center">Internal Test 2</th>
                            <th className="py-2.5 px-3 text-center">Status / Performance</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-900 text-slate-200">
                          {userMarks.map(m => {
                            const i1 = m.internal1 !== undefined ? m.internal1 : '-';
                            const i2 = m.internal2 !== undefined ? m.internal2 : '-';
                            const max = m.maxMarks || 50;
                            const avgPct = typeof i1 === 'number' && typeof i2 === 'number' ? Math.round(((i1 + i2) / (max * 2)) * 100) : 80;

                            return (
                              <tr key={m.id} className="hover:bg-slate-900/60">
                                <td className="py-2.5 px-3 font-bold text-white">{m.subject}</td>
                                <td className="py-2.5 px-3 text-slate-400 font-mono">Sem {m.semester || 5}</td>
                                <td className="py-2.5 px-3 text-center font-mono text-indigo-300 font-bold">{i1} / {max}</td>
                                <td className="py-2.5 px-3 text-center font-mono text-cyan-300 font-bold">{i2} / {max}</td>
                                <td className="py-2.5 px-3 text-center">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    avgPct >= 75 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300'
                                  }`}>
                                    {avgPct}% Score ({avgPct >= 75 ? 'Passed' : 'Needs Review'})
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Assigned Timetable Reference */}
                {userTimetable && (
                  <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-2">
                    <h4 className="text-sm font-extrabold text-white flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-cyan-400" />
                      <span>Class Timetable: {userTimetable.title}</span>
                    </h4>
                    <p className="text-xs text-slate-400">Year: {userTimetable.year} • Class: {userTimetable.classSection || 'IT-A'}</p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: BRAINZONE & BADGES */}
            {profileTab === 'brainzone' && (
              <div className="space-y-4 animate-in fade-in">
                
                {/* Level & Cosmetics Overview */}
                <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
                  <h4 className="text-sm font-extrabold text-white flex items-center space-x-2 border-b border-slate-800 pb-2">
                    <Award className="w-4 h-4 text-amber-400" />
                    <span>Equipped Cosmetics & Gamification Level</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Equipped Border</span>
                      <p className="text-sm font-bold text-amber-300">{fullProfileUser.equippedBorder || 'admin_supreme'}</p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Equipped Title</span>
                      <p className="text-sm font-bold text-cyan-300">{fullProfileUser.equippedTitle || 'title_admin_supreme'}</p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Avatar Background</span>
                      <p className="text-sm font-bold text-emerald-300">{fullProfileUser.equippedAvatarBgId || 'bg_admin_royal'}</p>
                    </div>
                  </div>
                </div>

                {/* Badges List */}
                <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-3">
                  <h4 className="text-sm font-extrabold text-white flex items-center space-x-2 border-b border-slate-800 pb-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Unlocked Badges & Achievements</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(badges || []).map(bdg => (
                      <div key={bdg.id} className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center space-x-3 text-xs">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-xl flex items-center justify-center flex-shrink-0">
                          {bdg.icon || '🏅'}
                        </div>
                        <div>
                          <p className="font-bold text-white">{bdg.title}</p>
                          <p className="text-[11px] text-slate-400">{bdg.desc}</p>
                          <span className="text-[10px] text-amber-300 font-semibold">{bdg.reward}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: SUBMISSIONS & ACTIVITY */}
            {profileTab === 'activity' && (
              <div className="space-y-4 animate-in fade-in">
                
                {/* Submitted Peer Notes */}
                <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-3">
                  <h4 className="text-sm font-extrabold text-white flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-indigo-400" />
                      <span>Submitted Peer Notes ({userPeerNotes.length})</span>
                    </span>
                  </h4>

                  {userPeerNotes.length === 0 ? (
                    <p className="text-xs text-slate-400 p-3 text-center">No peer notes submitted by this student yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {userPeerNotes.map(n => (
                        <div key={n.id} className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                          <div>
                            <p className="font-bold text-white">{n.title}</p>
                            <p className="text-[11px] text-slate-400">{n.subjectName} • Sem {n.semester}</p>
                          </div>
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                            n.status === 'approved' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}>
                            {n.status || 'Pending Approval'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Suggestions & Reports */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Suggestions */}
                  <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-3">
                    <h4 className="text-sm font-extrabold text-white flex items-center space-x-2 border-b border-slate-800 pb-2">
                      <MessageSquare className="w-4 h-4 text-cyan-400" />
                      <span>Suggestions ({userSuggestions.length})</span>
                    </h4>
                    {userSuggestions.length === 0 ? (
                      <p className="text-xs text-slate-400 p-3 text-center">No feature suggestions submitted.</p>
                    ) : (
                      <div className="space-y-2">
                        {userSuggestions.map(s => (
                          <div key={s.id} className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs space-y-1">
                            <p className="font-bold text-white">{s.title}</p>
                            <p className="text-[11px] text-slate-400">{s.description}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Reports */}
                  <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-3">
                    <h4 className="text-sm font-extrabold text-white flex items-center space-x-2 border-b border-slate-800 pb-2">
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      <span>Resource Reports ({userReports.length})</span>
                    </h4>
                    {userReports.length === 0 ? (
                      <p className="text-xs text-slate-400 p-3 text-center">No broken link reports filed.</p>
                    ) : (
                      <div className="space-y-2">
                        {userReports.map(r => (
                          <div key={r.id} className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs space-y-1">
                            <p className="font-bold text-rose-300">{r.materialTitle || 'Material Report'}</p>
                            <p className="text-[11px] text-slate-400">{r.issueDescription || r.reason}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  // STANDARD DIRECTORY VIEW
  return (
    <div className="space-y-6">
      {/* 1. Metrics Overview Grid */}
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

      {/* 2. Control Toolbar (Search, Filter, Sort & Export) */}
      <div className="flex flex-col space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Role Filter Tabs */}
          <div className="flex items-center space-x-1.5 w-full sm:w-auto">
            {[
              { id: 'All', label: 'All Roles', count: (registeredUsers || []).length },
              { id: 'student', label: 'Students', count: studentCount },
              { id: 'admin', label: 'Admins', count: adminCount }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setRoleFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  roleFilter === tab.id
                    ? 'bg-cyan-600 text-white shadow-md'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.2 rounded text-[10px] ${
                  roleFilter === tab.id ? 'bg-cyan-500/40 text-white' : 'bg-slate-900 text-slate-500'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Right Action Tools: Sort & Export */}
          <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-end">
            {/* Sort Dropdown */}
            <div className="flex items-center space-x-1 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
              >
                <option value="newest" className="bg-slate-900 text-white">Sort: Newest First</option>
                <option value="oldest" className="bg-slate-900 text-white">Sort: Oldest First</option>
                <option value="name" className="bg-slate-900 text-white">Sort: Name (A-Z)</option>
                <option value="lastActive" className="bg-slate-900 text-white">Sort: Last Active</option>
              </select>
            </div>

            <button
              onClick={handleExportAll}
              className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Search Input Bar */}
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search student name, email, register number, year or section..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-8 py-2.5 bg-slate-950 text-xs text-white placeholder-slate-500 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500 shadow-inner"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* 3. Bulk Action Floating Bar */}
      {selectedUserIds.length > 0 && (
        <div className="p-3 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 backdrop-blur-md flex items-center justify-between animate-in fade-in shadow-xl">
          <div className="flex items-center space-x-2 text-xs text-cyan-200 font-bold">
            <CheckSquare className="w-4 h-4 text-cyan-400" />
            <span>{selectedUserIds.length} user(s) selected</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportSelected}
              className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center space-x-1 shadow"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Selected ({selectedUserIds.length})</span>
            </button>
            <button
              onClick={() => setSelectedUserIds([])}
              className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* 4. Registered Users List */}
      <div className="space-y-3">
        {/* Table Header with Select All */}
        {filteredUsers.length > 0 && (
          <div className="flex items-center justify-between px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <div className="flex items-center space-x-2">
              <button 
                onClick={toggleSelectAll} 
                className="text-slate-400 hover:text-white flex items-center space-x-1"
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
            <p className="text-sm font-semibold">No registered users match your search filter.</p>
          </div>
        ) : (
          filteredUsers.map(usr => {
            const isUserAdmin = usr.role === 'admin';
            const isSelf = checkIsSelf(usr);
            const usrId = usr.uid || usr.id || usr.email;
            const isSelected = selectedUserIds.includes(usrId);
            const activeStatus = formatLastActive(usr.lastLoginAt || usr.createdAt);

            return (
              <div 
                key={usrId}
                className={`p-4 rounded-2xl bg-slate-950 border transition-all shadow-sm group ${
                  isSelf ? 'border-cyan-500/50 bg-slate-950/90' : isSelected ? 'border-cyan-500/40 bg-cyan-950/20' : 'border-slate-800 hover:border-cyan-500/40'
                }`}
              >
                {/* Row Summary */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  
                  {/* Checkbox + Avatar + Info (Clicking opens Full Profile) */}
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

                    <div 
                      onClick={() => handleOpenFullProfile(usr)}
                      className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-white text-base flex-shrink-0 shadow-md cursor-pointer hover:scale-105 transition-all ${
                        isUserAdmin ? 'bg-emerald-600' : 'bg-brand-600'
                      }`}
                    >
                      {usr.name ? usr.name.charAt(0).toUpperCase() : 'U'}
                    </div>

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
                          isUserAdmin 
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}>
                          {isUserAdmin ? 'Administrator' : 'Student'}
                        </span>

                        {activeStatus.isInactive && (
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Inactive (30d+)
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-400 truncate">{usr.email}</p>

                      <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                        {usr.registerNumber && (
                          <span className="font-mono text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-500/30">
                            Reg: {usr.registerNumber}
                          </span>
                        )}
                        {!isUserAdmin && (
                          <span className="text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                            {usr.year || '3rd Year'} • Sem {usr.semester || 5} ({usr.classSection || 'IT-A'})
                          </span>
                        )}
                        <span className="text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>{activeStatus.text}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Full Profile Button */}
                  <div className="flex items-center space-x-2 self-end md:self-center flex-shrink-0">
                    <button
                      onClick={() => handleOpenFullProfile(usr)}
                      className="px-3 py-1.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600 text-cyan-300 hover:text-white text-[11px] font-bold flex items-center space-x-1 border border-cyan-500/40 transition-all shadow-sm"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Full Profile</span>
                    </button>

                    {/* Role Toggle Button */}
                    <button
                      disabled={isSelf}
                      onClick={() => promptToggleRole(usr)}
                      title={isSelf ? "You cannot modify your own account" : `Toggle ${isUserAdmin ? 'Student' : 'Admin'} Role`}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
                        isSelf 
                          ? 'opacity-40 cursor-not-allowed bg-slate-800 text-slate-500 border border-slate-700' 
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 shadow-sm'
                      }`}
                    >
                      Toggle {isUserAdmin ? 'Student' : 'Admin'}
                    </button>

                    {/* Delete Button */}
                    <button
                      disabled={isSelf}
                      onClick={() => promptDeleteUser(usr)}
                      title={isSelf ? "You cannot delete your own account" : "Delete user account"}
                      className={`p-2 rounded-xl transition-all ${
                        isSelf 
                          ? 'opacity-30 cursor-not-allowed text-slate-600 bg-slate-900 border border-slate-800' 
                          : 'text-rose-400 hover:text-white bg-slate-900 hover:bg-rose-500/20 border border-slate-800 hover:border-rose-500/40 shadow-sm'
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

      {/* 6. Confirmation Modal Overlay (Role Change & Delete Safeguards) */}
      {confirmModal.isOpen && confirmModal.user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="glass-panel rounded-3xl max-w-md w-full p-6 border border-slate-700 shadow-2xl space-y-5">
            
            {/* Modal Icon & Header */}
            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 border ${
                confirmModal.type === 'delete' 
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/40' 
                  : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
              }`}>
                {confirmModal.type === 'delete' ? <Trash2 className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
              </div>
              <div>
                <h4 className="text-base font-bold text-white">
                  {confirmModal.type === 'delete' ? 'Remove Account Permanently?' : 'Confirm Role Change'}
                </h4>
                <p className="text-xs text-slate-400">{confirmModal.user.name} ({confirmModal.user.email})</p>
              </div>
            </div>

            {/* Warning Message Body */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-300 leading-relaxed">
              {confirmModal.type === 'delete' ? (
                <span className="text-rose-300 font-semibold">
                  Remove <strong className="text-white">{confirmModal.user.name}</strong>'s account permanently? This cannot be undone and will delete their profile, marks, BrainZone progress, and saved data.
                </span>
              ) : confirmModal.targetRole === 'admin' ? (
                <span>
                  Give <strong className="text-white">{confirmModal.user.name}</strong> admin access? They will be able to manage all site content, users, and settings.
                </span>
              ) : (
                <span>
                  Demote <strong className="text-white">{confirmModal.user.name}</strong> to student role? They will lose access to administrative features.
                </span>
              )}
            </div>

            {/* Modal Action Buttons */}
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => setConfirmModal({ isOpen: false, type: null, user: null, targetRole: null })}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                className={`px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md flex items-center space-x-1.5 ${
                  confirmModal.type === 'delete'
                    ? 'bg-rose-600 hover:bg-rose-500'
                    : 'bg-cyan-600 hover:bg-cyan-500'
                }`}
              >
                {confirmModal.type === 'delete' && <Trash2 className="w-3.5 h-3.5" />}
                <span>
                  {confirmModal.type === 'delete' ? 'Confirm Delete' : `Confirm ${confirmModal.targetRole === 'admin' ? 'Admin Access' : 'Demotion'}`}
                </span>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-4xl bg-slate-900 rounded-3xl border border-slate-700/80 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Registered User Directory & Analytics</h3>
              <p className="text-xs text-slate-400">Monitor student logins, registration details, & manage user accounts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body with UserDirectoryManager */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          <UserDirectoryManager onClose={onClose} isModal={true} />
        </div>

      </div>
    </div>
  );
};
