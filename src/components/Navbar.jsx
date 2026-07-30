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
  Users,
  Trash2,
  CheckCircle2,
  RotateCcw,
  Brain
} from 'lucide-react';

export const Navbar = ({ activeTab, setActiveTab, onOpenAdminForm, onOpenAdminManagement, onOpenUserDirectory, onOpenSuggestionModal }) => {
  const { currentUser, isAdmin, logout, updateUserProfile } = useAuth();
  const { announcements, suggestions, reports, allMaterials, interviewExperiences, siteConfig } = useData();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [announcementsOpen, setAnnouncementsOpen] = useState(false);
  const [tickerIndex, setTickerIndex] = useState(0);
  const [tickerPaused, setTickerPaused] = useState(false);

  const mutedCategories = currentUser?.mutedCategories || [];
  const dismissedNotifications = currentUser?.dismissedNotifications || [];
  
  // Department announcements for the top rotating ticker (unmuted by user)
  const allUnmutedAnnouncements = (announcements || []).filter(a => !mutedCategories.includes(a.category));
  const pinnedNotice = allUnmutedAnnouncements.find(a => a.isPinned);
  const activeTickerNotices = allUnmutedAnnouncements.length > 0 ? allUnmutedAnnouncements : (announcements || []);

  // Notifications for Bell popover dropdown & red counter badge (filtered by dismissals)
  const unreadNotifications = allUnmutedAnnouncements.filter(a => !dismissedNotifications.includes(a.id));
  const top3Announcements = unreadNotifications.slice(0, 3);

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

  const brainZoneEnabled = siteConfig?.brainZoneEnabled !== false;

  const rawNavLinks = [
    { id: 'home', label: 'Home', icon: BookOpen },
    { id: 'materials', label: 'Materials', icon: Layers },
    { id: 'aitools', label: 'AI Tools', icon: Sparkles },
    { id: 'brainzone', label: 'BrainZone', icon: Brain },
    { id: 'placement', label: 'Placement', icon: Briefcase },
    { id: 'events', label: 'Events', icon: Trophy },
    { id: 'announcements', label: 'Notices', icon: Bell },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const navLinks = rawNavLinks.filter(link => {
    if (link.id === 'brainzone' && !brainZoneEnabled && !isAdmin) {
      return false;
    }
    return true;
  });

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
          {pinnedNotice ? (
            <div 
              onClick={() => setActiveTab('announcements', pinnedNotice.id)}
              className="flex items-center space-x-1.5 bg-amber-500/20 border border-amber-500/40 text-amber-300 px-2 py-0.5 rounded-lg font-bold text-[11px] cursor-pointer hover:bg-amber-500/30 flex-shrink-0 animate-pulse"
              title="Click to view pinned announcement details"
            >
              <Pin className="w-3 h-3 fill-amber-300 flex-shrink-0" />
              <span className="uppercase text-[10px] tracking-wider hidden sm:inline">PINNED:</span>
              <span className="truncate max-w-[140px] sm:max-w-[220px] md:max-w-[300px]">{pinnedNotice.title}</span>
            </div>
          ) : (
            <div className="flex items-center space-x-1.5 text-rose-400 text-[11px] font-bold flex-shrink-0">
              <Bell className="w-3 h-3 text-rose-400 animate-bounce flex-shrink-0" />
              <span>NOTICES</span>
            </div>
          )}

          {/* ROTATING NOTICE TICKER (Middle - Auto Cycle) */}
          {currentNotice && (
            <div 
              onClick={() => setActiveTab('announcements', currentNotice.id)}
              className="flex-1 min-w-0 flex items-center justify-center space-x-2 cursor-pointer group text-slate-300 hover:text-white transition-colors px-2"
              title="Click to view full notice details"
            >
              <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30 flex-shrink-0">
                {currentNotice.category}
              </span>
              <span className="text-[11px] font-medium truncate max-w-full group-hover:underline">
                {currentNotice.title}
              </span>
              <span className="text-[10px] text-slate-500 flex-shrink-0 hidden md:inline">
                ({currentNotice.date})
              </span>
            </div>
          )}

          {/* ACTION BUTTONS (Right - Stationary) */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            {activeTickerNotices.length > 1 && (
              <div className="flex items-center space-x-1 bg-slate-900/80 px-1.5 py-0.5 rounded-md border border-slate-800 text-[10px] text-slate-400">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setTickerIndex((prev) => (prev - 1 + activeTickerNotices.length) % activeTickerNotices.length);
                  }}
                  className="hover:text-white p-0.5"
                  title="Previous notice"
                >
                  <ChevronLeft className="w-3 h-3" />
                </button>
                <span className="font-mono text-[9px] px-0.5">
                  {(tickerIndex % activeTickerNotices.length) + 1}/{activeTickerNotices.length}
                </span>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setTickerIndex((prev) => (prev + 1) % activeTickerNotices.length);
                  }}
                  className="hover:text-white p-0.5"
                  title="Next notice"
                >
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            )}

            <button
              onClick={() => setActiveTab('announcements')}
              className="px-2 py-0.5 rounded bg-rose-600/30 hover:bg-rose-600/50 text-rose-200 border border-rose-500/40 text-[10px] font-bold transition-all flex items-center space-x-1"
            >
              <span>All Notices</span>
            </button>
          </div>

        </div>
      )}

      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3">
          
          {/* Brand Logo & Department Title */}
          <div 
            onClick={() => setActiveTab('home')}
            className="flex items-center space-x-3 cursor-pointer group flex-shrink-0"
          >
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-accent-cyan flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform duration-300">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-accent-cyan flex items-center justify-center border-2 border-slate-900">
                <Cpu className="w-2.5 h-2.5 text-slate-950 font-bold" />
              </div>
            </div>
            <div className="flex-shrink-0">
              <div className="flex items-center space-x-2 whitespace-nowrap">
                <span className="text-base sm:text-lg font-black tracking-tight text-white group-hover:text-brand-300 transition-colors whitespace-nowrap">
                  IT Resource Hub
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-500/20 text-brand-300 border border-brand-500/30 whitespace-nowrap">
                  v4.0
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium whitespace-nowrap">Department of Information Technology</p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800 flex-shrink-0">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => setActiveTab(link.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 whitespace-nowrap ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{link.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Header Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
            
            {/* Quick Suggestion Button (Only for Non-Admin Students) */}
            {!isAdmin && (
              <button
                onClick={() => onOpenSuggestionModal ? onOpenSuggestionModal() : setActiveTab('home')}
                className="p-2 sm:px-3 rounded-xl text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all flex items-center space-x-1.5 shadow whitespace-nowrap"
                title="Suggest a new Study Material or AI Tool"
              >
                <Lightbulb className="w-4 h-4" />
                <span className="text-xs font-bold hidden xl:inline">Suggest Material</span>
              </button>
            )}

            {/* Quick Announcement Bell Popover Button */}
            <div className="relative">
              <button
                onClick={() => setAnnouncementsOpen(!announcementsOpen)}
                className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                title="Department Announcements & Notifications"
              >
                <Bell className="w-4 h-4 text-rose-400" />
                {unreadNotifications && unreadNotifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white font-black text-[9px] flex items-center justify-center border border-slate-900 shadow">
                    {unreadNotifications.length}
                  </span>
                )}
              </button>

              {/* Announcement Mini Popover Dropdown */}
              {announcementsOpen && (
                <div 
                  className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl glass-panel shadow-2xl p-4 border border-slate-700/80 z-50 animate-in fade-in slide-in-from-top-2 space-y-3"
                  onMouseLeave={() => setAnnouncementsOpen(false)}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800 gap-2">
                    <span className="font-bold text-white text-xs flex items-center space-x-1.5 truncate">
                      <Bell className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                      <span>Department Notices</span>
                    </span>
                    
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      {unreadNotifications.length > 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const currentDismissed = currentUser?.dismissedNotifications || [];
                            const allCurrentIds = unreadNotifications.map(a => a.id);
                            const updated = Array.from(new Set([...currentDismissed, ...allCurrentIds]));
                            updateUserProfile({ dismissedNotifications: updated });
                          }}
                          className="text-[10px] font-semibold text-rose-400 hover:text-rose-300 flex items-center space-x-1 px-1.5 py-0.5 rounded bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-colors"
                          title="Clear all notifications"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Clear All</span>
                        </button>
                      )}
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
                  </div>

                  <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                    {unreadNotifications.length === 0 ? (
                      <div className="p-6 text-center text-slate-400 space-y-2">
                        <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                        <p className="text-xs font-bold text-slate-200">Notifications Cleared!</p>
                        <p className="text-[10px] text-slate-400 leading-relaxed">
                          You have no unread notifications.
                        </p>
                        {currentUser?.dismissedNotifications?.length > 0 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateUserProfile({ dismissedNotifications: [] });
                            }}
                            className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold inline-flex items-center space-x-1 pt-1 underline"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Restore cleared notifications</span>
                          </button>
                        )}
                      </div>
                    ) : (
                      top3Announcements.map((ann) => (
                        <div 
                          key={ann.id} 
                          onClick={() => {
                            setActiveTab('announcements', ann.id);
                            setAnnouncementsOpen(false);
                          }}
                          className={`p-2.5 rounded-xl border space-y-1 cursor-pointer transition-all hover:border-slate-700 relative group ${
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
                            
                            <div className="flex items-center space-x-1.5">
                              <span className="text-[9px] text-slate-400">{ann.date}{ann.time ? ` • ${ann.time}` : ''}</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const currentDismissed = currentUser?.dismissedNotifications || [];
                                  if (!currentDismissed.includes(ann.id)) {
                                    updateUserProfile({ dismissedNotifications: [...currentDismissed, ann.id] });
                                  }
                                }}
                                className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                                title="Clear this notification"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          
                          <p className="font-bold text-white text-xs line-clamp-1 pr-3">{ann.title}</p>
                          <p className="text-[10px] text-slate-400 line-clamp-2 leading-snug">{ann.description}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Admin Controls: Admin Center ONLY (User Directory merged into Admin Center sidebar) */}
            {isAdmin && (
              <div className="hidden sm:flex items-center space-x-2">
                <button
                  onClick={() => onOpenAdminManagement && onOpenAdminManagement('dashboard')}
                  className="relative p-2 sm:px-3 rounded-xl text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all flex items-center space-x-1.5 shadow"
                  title="Admin Control Center"
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
                        {currentUser.role === 'admin' ? 'Administrator' : `${currentUser.year} • Sem ${currentUser.semester} (${currentUser.classSection})`}
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
