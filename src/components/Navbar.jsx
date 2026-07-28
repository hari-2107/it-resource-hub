import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { 
  GraduationCap, 
  BookOpen, 
  Sparkles, 
  Bell, 
  User, 
  LogOut, 
  ShieldCheck, 
  ShieldAlert,
  Lightbulb,
  Flag,
  Menu, 
  X, 
  Cpu, 
  Layers,
  ChevronDown,
  Lock,
  UserCheck,
  Pin,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  Trophy,
  FileText,
  Calendar,
  Users
} from 'lucide-react';

export const Navbar = ({ activeTab, setActiveTab, onOpenAdminForm, onOpenAdminManagement, onOpenUserDirectory, onOpenSuggestionModal }) => {
  const { currentUser, isAdmin, logout } = useAuth();
  const { announcements, suggestions, reports, allMaterials, interviewExperiences } = useData();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [announcementsOpen, setAnnouncementsOpen] = useState(false);
  const [tickerIndex, setTickerIndex] = useState(0);
  const [tickerPaused, setTickerPaused] = useState(false);

  const mutedCategories = currentUser?.mutedCategories || [];
  const unmutedAnnouncements = (announcements || []).filter(a => !mutedCategories.includes(a.category));

  const pinnedNotice = unmutedAnnouncements.find(a => a.isPinned);
  const unpinnedNotices = unmutedAnnouncements.filter(a => !a.isPinned);
  const activeTickerNotices = unpinnedNotices.length > 0 ? unpinnedNotices : unmutedAnnouncements;

  useEffect(() => {
    if (!activeTickerNotices || activeTickerNotices.length <= 1 || tickerPaused) return;

    const interval = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % activeTickerNotices.length);
    }, 4500);

    return () => clearInterval(interval);
  }, [activeTickerNotices, tickerPaused]);

  const currentNotice = activeTickerNotices[tickerIndex % (activeTickerNotices.length || 1)];

  const pendingCount = (suggestions || []).filter(s => s.status === 'pending').length;
  const openReportsCount = (reports || []).filter(r => r.status === 'open').length;
  const pendingNotesCount = (allMaterials || []).filter(m => m.status === 'pending').length;
  const pendingExpsCount = (interviewExperiences || []).filter(e => !e.approved).length;

  const totalAdminBadges = pendingCount + openReportsCount + pendingNotesCount + pendingExpsCount;
  const top3Announcements = unmutedAnnouncements.slice(0, 3);

  const navLinks = [
    { id: 'home', label: 'Home', icon: BookOpen },
    { id: 'materials', label: 'Materials', icon: Layers },
    { id: 'aitools', label: 'AI Tools', icon: Sparkles },
    { id: 'placement', label: 'Placement', icon: Briefcase },
    { id: 'events', label: 'Events', icon: Trophy },
    { id: 'announcements', label: 'Notices', icon: Bell },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80">
      {/* Top Mini Linear Announcement Ticker Bar */}
      {announcements && announcements.length > 0 && (
        <div 
          className="bg-gradient-to-r from-rose-950/95 via-slate-950 to-rose-950/95 border-b border-rose-900/40 px-3 py-1 text-xs flex items-center justify-between gap-2 overflow-hidden"
          onMouseEnter={() => setTickerPaused(true)}
          onMouseLeave={() => setTickerPaused(false)}
          onTouchStart={() => setTickerPaused(true)}
          onTouchEnd={() => setTickerPaused(false)}
        >
          
          {/* STATIONARY PINNED NOTICE (Left - Stationary) */}
          {pinnedNotice && (
            <div className="flex items-center space-x-2 flex-shrink-0 bg-slate-900/90 px-2.5 py-0.5 rounded-xl border border-amber-500/50 shadow-md z-10">
              <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-amber-500/25 text-amber-300 border border-amber-500/50 uppercase flex items-center space-x-1">
                <Pin className="w-2.5 h-2.5 fill-amber-300" />
                <span>PINNED</span>
              </span>
              <span 
                onClick={() => setActiveTab('announcements')}
                className="text-amber-200 font-bold text-[11px] hover:underline cursor-pointer truncate max-w-[110px] sm:max-w-[200px] md:max-w-[280px]"
              >
                {pinnedNotice.title}
              </span>
            </div>
          )}

          {/* ROTATING TICKER WITH DWELL TIME & PAUSE ON HOVER */}
          {currentNotice && (
            <div 
              onClick={() => setActiveTab('announcements')}
              className="flex-1 min-w-0 overflow-hidden relative flex items-center cursor-pointer group px-2"
              title="Click to view all notices"
            >
              <div 
                key={currentNotice.id || tickerIndex} 
                className="flex items-center space-x-2 transition-all duration-500 ease-in-out animate-in fade-in slide-in-from-bottom-1 min-w-0"
              >
                <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/40 uppercase flex-shrink-0">
                  {currentNotice.category || 'Notice'}
                </span>
                <span className="text-slate-200 font-medium text-[11px] group-hover:text-white group-hover:underline truncate max-w-[150px] sm:max-w-[340px] md:max-w-[500px]">
                  {currentNotice.title}
                </span>
                {activeTickerNotices.length > 1 && (
                  <span className="text-[9px] text-slate-500 font-semibold flex-shrink-0 hidden md:inline">
                    ({(tickerIndex % activeTickerNotices.length) + 1}/{activeTickerNotices.length})
                  </span>
                )}
              </div>
            </div>
          )}

          {/* FIXED ACTION BUTTON (Far Right) */}
          <button
            onClick={() => setActiveTab('announcements')}
            className="text-brand-400 hover:text-brand-300 font-bold text-[11px] hover:underline flex items-center space-x-1 flex-shrink-0 z-10 bg-slate-950/90 px-2.5 py-0.5 rounded-lg border border-slate-800"
          >
            <span>View All</span>
            <span>→</span>
          </button>

        </div>
      )}

      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-16 gap-2 xl:gap-4">
          
          {/* Brand Logo */}
          <div 
            onClick={() => setActiveTab('home')}
            className="flex items-center space-x-2.5 cursor-pointer group flex-shrink-0"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-accent-cyan flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform duration-200">
              <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-white group-hover:text-brand-300 transition-colors whitespace-nowrap">
                  IT Resource Hub
                </span>
                {isAdmin && (
                  <span className="hidden xl:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    <ShieldCheck className="w-3 h-3 mr-1" /> Admin
                  </span>
                )}
              </div>
              <p className="text-[9px] text-slate-400 tracking-wider uppercase font-medium hidden sm:block whitespace-nowrap">
                Dept of Information Technology
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-0.5 xl:space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => setActiveTab(link.id)}
                  className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 whitespace-nowrap ${
                    isActive
                      ? 'bg-brand-600/30 text-brand-300 border border-brand-500/30 shadow-inner'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-brand-400' : 'text-slate-400'}`} />
                  <span>{link.label}</span>
                </button>
              );
            })}
          </nav>



            {/* Quick Announcement Bell Popover Button */}
            <div className="relative">
              <button
                onClick={() => setAnnouncementsOpen(!announcementsOpen)}
                className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                title="Department Announcements & Notices"
              >
                <Bell className="w-4 h-4 text-rose-400" />
                {unmutedAnnouncements && unmutedAnnouncements.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white font-black text-[9px] flex items-center justify-center border border-slate-900 shadow">
                    {unmutedAnnouncements.length}
                  </span>
                )}
              </button>

              {/* Announcement Mini Popover Dropdown */}
              {announcementsOpen && (
                <div 
                  className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl glass-panel shadow-2xl p-4 border border-slate-700/80 z-50 animate-in fade-in slide-in-from-top-2 space-y-3"
                  onMouseLeave={() => setAnnouncementsOpen(false)}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="font-bold text-white text-xs flex items-center space-x-1.5">
                      <Bell className="w-3.5 h-3.5 text-rose-400" />
                      <span>Recent Department Notices</span>
                    </span>
                    <button
                      onClick={() => {
                        setActiveTab('announcements');
                        setAnnouncementsOpen(false);
                      }}
                      className="text-[10px] font-semibold text-brand-400 hover:underline"
                    >
                      View All →
                    </button>
                  </div>

                  <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                    {top3Announcements.map((ann) => (
                      <div 
                        key={ann.id} 
                        onClick={() => {
                          setActiveTab('announcements', ann.id);
                          setAnnouncementsOpen(false);
                        }}
                        className={`p-2.5 rounded-xl border space-y-1 cursor-pointer transition-all hover:border-slate-700 ${
                          ann.isPinned 
                            ? 'bg-amber-950/20 border-amber-500/50' 
                            : 'bg-slate-900/90 border-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1.5">
                            {ann.isPinned && (
                              <span className="flex items-center space-x-0.5 px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                <Pin className="w-2.5 h-2.5 fill-amber-300" />
                                <span>PINNED</span>
                              </span>
                            )}
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                              {ann.category}
                            </span>
                          </div>
                          <span className="text-[9px] text-slate-400">{ann.date}{ann.time ? ` • ${ann.time}` : ''}</span>
                        </div>
                        <p className="font-bold text-white text-xs line-clamp-1">{ann.title}</p>
                        <p className="text-[10px] text-slate-400 line-clamp-2 leading-snug">{ann.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Admin Controls: User Directory & Admin Center */}
            {isAdmin && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onOpenUserDirectory && onOpenUserDirectory()}
                  className="relative p-2 sm:px-3 rounded-xl text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 transition-all flex items-center space-x-1.5 shadow"
                  title="User Directory & Activity Analytics"
                >
                  <Users className="w-4 h-4" />
                  <span className="text-xs font-bold hidden sm:inline">User Directory</span>
                </button>

                <button
                  onClick={() => onOpenAdminManagement && onOpenAdminManagement()}
                  className="relative p-2 sm:px-3 rounded-xl text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all flex items-center space-x-1.5 shadow"
                  title="Admin Control Center (Suggestions & Reports)"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span className="text-xs font-bold hidden sm:inline">Admin Center</span>
                  {totalAdminBadges > 0 && (
                    <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 font-black text-[9px] flex items-center justify-center shadow">
                      {totalAdminBadges}
                    </span>
                  )}
                </button>
              </div>
            )}

          {/* User Profile & Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-slate-800/80 transition-colors border border-transparent hover:border-slate-700"
                >
                  {currentUser.avatar ? (
                    <img 
                      src={currentUser.avatar} 
                      alt={currentUser.name} 
                      className="w-8 h-8 rounded-lg object-cover shadow border border-slate-700" 
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-xs shadow">
                      {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                  <div className="hidden sm:block text-left max-w-[80px] xl:max-w-[110px]">
                    <p className="text-xs font-semibold text-white leading-tight truncate">{currentUser.name}</p>
                    <p className="text-[10px] text-slate-400 capitalize truncate">
                      {currentUser.role === 'admin' ? 'Admin • IT Dept' : `${currentUser.role} • ${currentUser.classSection || 'IT'}`}
                    </p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                </button>

                {/* Profile Dropdown */}
                {userDropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-56 rounded-2xl glass-panel shadow-2xl py-2 border border-slate-700/80 z-50 animate-in fade-in slide-in-from-top-2"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-800">
                      <p className="text-sm font-semibold text-white">{currentUser.name}</p>
                      <p className="text-xs text-slate-400 truncate">{currentUser.email}</p>
                      <div className="mt-1 text-[11px] text-brand-300 font-medium">
                        {currentUser.role === 'admin' ? 'IT Department Admin' : `${currentUser.year} • Sem ${currentUser.semester} (${currentUser.classSection})`}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setActiveTab('profile');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 flex items-center space-x-2"
                    >
                      <User className="w-4 h-4 text-brand-400" />
                      <span>My Profile & Timetable</span>
                    </button>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        if (onOpenSuggestionModal) onOpenSuggestionModal();
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-amber-300 hover:text-amber-200 hover:bg-amber-500/10 flex items-center space-x-2"
                    >
                      <Lightbulb className="w-4 h-4 text-amber-400" />
                      <span>Suggest a Resource</span>
                    </button>

                    {isAdmin && (
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          if (onOpenAdminManagement) onOpenAdminManagement();
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-medium text-emerald-400 hover:bg-emerald-500/10 flex items-center justify-between"
                      >
                        <span className="flex items-center space-x-2">
                          <ShieldAlert className="w-4 h-4 text-emerald-400" />
                          <span>Admin Center</span>
                        </span>
                        {totalAdminBadges > 0 && (
                          <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-amber-500 text-slate-950">
                            {totalAdminBadges}
                          </span>
                        )}
                      </button>
                    )}

                    <div className="border-t border-slate-800 mt-1 pt-1">
                      <button
                        onClick={() => {
                          logout();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10 flex items-center space-x-2"
                      >
                        <LogOut className="w-4 h-4 text-rose-400" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setActiveTab('auth')}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white shadow-md shadow-brand-600/30 transition-all"
              >
                Sign In
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Responsive Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-slate-950/95 backdrop-blur-xl px-4 pt-3 pb-6 space-y-3">
          


          <div className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => {
                    setActiveTab(link.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-medium ${
                    isActive
                      ? 'bg-brand-600/30 text-brand-300 border border-brand-500/30'
                      : 'text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <Icon className="w-5 h-5 text-brand-400" />
                  <span>{link.label}</span>
                </button>
              );
            })}
          </div>

        </div>
      )}
    </header>
  );
};
