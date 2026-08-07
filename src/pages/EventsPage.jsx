import React, { useState, useEffect } from 'react';
import { useData, getEffectiveEventStatus } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { 
  Trophy, 
  Calendar, 
  Clock, 
  Plus, 
  ExternalLink, 
  Sparkles, 
  Award, 
  Edit2, 
  Trash2,
  Flame,
  MoreVertical,
  Copy,
  Users,
  CheckSquare,
  Square,
  AlertTriangle,
  Layers,
  ArrowRight,
  ShieldCheck,
  Archive,
  BarChart3,
  CheckCircle2
} from 'lucide-react';

export const EventsPage = ({ onOpenAdminForm, onOpenEventDetail, targetEventId }) => {
  const { 
    events = [], 
    removeEvent, 
    updateEventStatus, 
    bulkUpdateEventStatus, 
    bulkDeleteEvents 
  } = useData();
  const { isAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState('upcoming'); // 'ongoing' | 'upcoming' | 'archive'
  const [selectedEventIds, setSelectedEventIds] = useState([]);
  const [openMenuId, setOpenMenuId] = useState(null);

  // Confirmation Modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null
  });

  const currentDateStr = new Date().toISOString().split('T')[0];

  // Helper to categorize events dynamically
  const categorizedEvents = (events || []).reduce(
    (acc, evt) => {
      const status = getEffectiveEventStatus(evt);
      if (status === 'ongoing') acc.ongoing.push(evt);
      else if (status === 'upcoming') acc.upcoming.push(evt);
      else acc.archive.push(evt);
      return acc;
    },
    { ongoing: [], upcoming: [], archive: [] }
  );

  const totalRegistrations = (events || []).reduce((sum, e) => sum + (e.registrationCount || 0), 0);

  useEffect(() => {
    if (targetEventId && events && events.length > 0) {
      const targetEvt = events.find(e => e.id === targetEventId);
      if (targetEvt) {
        const st = getEffectiveEventStatus(targetEvt);
        setActiveTab(st);

        setTimeout(() => {
          const el = document.getElementById(`event-${targetEventId}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 150);
      }
    }
  }, [targetEventId, events]);

  const displayedEvents = categorizedEvents[activeTab] || [];

  // Close 3-dot dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = () => setOpenMenuId(null);
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  // Multi-select handlers
  const isAllSelected = displayedEvents.length > 0 && displayedEvents.every(e => selectedEventIds.includes(e.id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedEventIds([]);
    } else {
      setSelectedEventIds(displayedEvents.map(e => e.id));
    }
  };

  const toggleSelectEvent = (id) => {
    setSelectedEventIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Duplicate Event Handler
  const handleDuplicateEvent = (evt) => {
    const duplicatePayload = {
      ...evt,
      id: '',
      title: `Copy of ${evt.title}`,
      registrationCount: 0,
      registrationDeadline: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      autoStatusEnabled: true,
      eventStatus: 'upcoming'
    };
    onOpenAdminForm('event', duplicatePayload);
  };

  // Status Change Confirmation Prompts
  const promptMoveStatus = (evt, targetStatus) => {
    const label = targetStatus === 'ongoing' ? 'Ongoing' : targetStatus === 'upcoming' ? 'Upcoming' : 'Past Archive';
    setConfirmModal({
      isOpen: true,
      title: `Move to ${label}?`,
      message: `Are you sure you want to move event "${evt.title}" to ${label}? (This will disable automatic date calculation for this event).`,
      onConfirm: () => {
        updateEventStatus(evt.id, targetStatus);
        setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null });
      }
    });
  };

  const promptDeleteEvent = (evt) => {
    setConfirmModal({
      isOpen: true,
      title: `Delete Event?`,
      message: `Are you sure you want to permanently delete event "${evt.title}"? This action cannot be undone.`,
      onConfirm: () => {
        removeEvent(evt.id);
        setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null });
      }
    });
  };

  const promptBulkMoveStatus = (targetStatus) => {
    if (selectedEventIds.length === 0) return;
    const label = targetStatus === 'ongoing' ? 'Ongoing' : targetStatus === 'upcoming' ? 'Upcoming' : 'Past Archive';
    setConfirmModal({
      isOpen: true,
      title: `Bulk Move ${selectedEventIds.length} Event(s)?`,
      message: `Are you sure you want to move ${selectedEventIds.length} selected event(s) to ${label}?`,
      onConfirm: () => {
        bulkUpdateEventStatus(selectedEventIds, targetStatus);
        setSelectedEventIds([]);
        setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null });
      }
    });
  };

  const promptBulkDelete = () => {
    if (selectedEventIds.length === 0) return;
    setConfirmModal({
      isOpen: true,
      title: `Bulk Delete ${selectedEventIds.length} Event(s)?`,
      message: `Are you sure you want to permanently delete ${selectedEventIds.length} selected event(s)?`,
      onConfirm: () => {
        bulkDeleteEvents(selectedEventIds);
        setSelectedEventIds([]);
        setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null });
      }
    });
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/30 mb-2">
            <Trophy className="w-3.5 h-3.5" />
            <span>Tech Competitions & Bootcamps</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Events & Hackathons Hub</h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Participate in national hackathons, technical workshops, coding contests, and guest seminars.
          </p>
        </div>

        {/* Admin Add Event Button */}
        {isAdmin && (
          <button
            onClick={() => onOpenAdminForm('event')}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition-all self-start md:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Event</span>
          </button>
        )}
      </div>

      {/* ADMIN ANALYTICS DASHBOARD CARDS */}
      {isAdmin && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in">
          <div className="p-4 rounded-3xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">Upcoming</span>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl font-black text-white">{categorizedEvents.upcoming.length}</p>
            <p className="text-[10px] text-slate-400">Scheduled events</p>
          </div>

          <div className="p-4 rounded-3xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Ongoing</span>
              <Flame className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-black text-white">{categorizedEvents.ongoing.length}</p>
            <p className="text-[10px] text-slate-400">Active right now</p>
          </div>

          <div className="p-4 rounded-3xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">Past Archive</span>
              <Archive className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-2xl font-black text-white">{categorizedEvents.archive.length}</p>
            <p className="text-[10px] text-slate-400">Completed events</p>
          </div>

          <div className="p-4 rounded-3xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">Total Registrations</span>
              <Users className="w-4 h-4 text-cyan-400" />
            </div>
            <p className="text-2xl font-black text-white">{totalRegistrations}</p>
            <p className="text-[10px] text-slate-400">Student participants</p>
          </div>
        </div>
      )}

      {/* Tabs Bar (Upcoming / Ongoing / Past Archive) */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 flex-wrap gap-3">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => { setActiveTab('upcoming'); setSelectedEventIds([]); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
              activeTab === 'upcoming'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Upcoming ({categorizedEvents.upcoming.length})</span>
          </button>

          <button
            onClick={() => { setActiveTab('ongoing'); setSelectedEventIds([]); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
              activeTab === 'ongoing'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Flame className="w-4 h-4 text-emerald-300" />
            <span>Ongoing ({categorizedEvents.ongoing.length})</span>
          </button>

          <button
            onClick={() => { setActiveTab('archive'); setSelectedEventIds([]); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
              activeTab === 'archive'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>Past Archive ({categorizedEvents.archive.length})</span>
          </button>
        </div>

        {/* Admin Bulk Selection Toggle */}
        {isAdmin && displayedEvents.length > 0 && (
          <div className="flex items-center space-x-2 text-xs">
            <button
              onClick={toggleSelectAll}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 font-bold transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              {isAllSelected ? <CheckSquare className="w-4 h-4 text-purple-400" /> : <Square className="w-4 h-4 text-slate-500" />}
              <span>{isAllSelected ? 'Deselect All' : 'Select All'}</span>
            </button>
          </div>
        )}
      </div>

      {/* ADMIN BULK ACTIONS BAR */}
      {isAdmin && selectedEventIds.length > 0 && (
        <div className="p-3 rounded-2xl bg-purple-950/40 border border-purple-500/50 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center space-x-2 text-xs text-purple-300 font-bold">
            <Layers className="w-4 h-4 text-purple-400" />
            <span>{selectedEventIds.length} event(s) selected</span>
          </div>

          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
            <button
              onClick={() => promptBulkMoveStatus('upcoming')}
              className="px-3 py-1.5 rounded-xl bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-white border border-amber-500/40 text-xs font-bold transition-all cursor-pointer"
            >
              Move Selected to Upcoming
            </button>

            <button
              onClick={() => promptBulkMoveStatus('ongoing')}
              className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 text-xs font-bold transition-all cursor-pointer"
            >
              Move Selected to Ongoing
            </button>

            <button
              onClick={() => promptBulkMoveStatus('archive')}
              className="px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/40 text-xs font-bold transition-all cursor-pointer"
            >
              Move Selected to Archive
            </button>

            <button
              onClick={promptBulkDelete}
              className="px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 text-xs font-bold transition-all cursor-pointer"
            >
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedEvents.length === 0 ? (
          <div className="col-span-full glass-panel p-12 rounded-3xl text-center text-slate-400 space-y-2">
            <Trophy className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-sm font-semibold">No events listed under "{activeTab === 'upcoming' ? 'Upcoming' : activeTab === 'ongoing' ? 'Ongoing' : 'Past Archive'}" at the moment.</p>
          </div>
        ) : (
          displayedEvents.map((evt) => {
            const currentStatus = getEffectiveEventStatus(evt);
            const isSelected = selectedEventIds.includes(evt.id);

            return (
              <div
                id={`event-${evt.id}`}
                key={evt.id}
                className={`glass-card rounded-3xl overflow-hidden border flex flex-col justify-between space-y-4 group transition-all relative ${
                  isSelected ? 'border-purple-500 ring-2 ring-purple-500/60 bg-purple-950/20 shadow-2xl shadow-purple-500/20' : 
                  evt.id === targetEventId ? 'border-purple-500 ring-2 ring-purple-500/60 bg-purple-950/20 shadow-2xl shadow-purple-500/20' : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Banner Image */}
                <div
                  onClick={() => onOpenEventDetail(evt)}
                  className="relative h-44 cursor-pointer overflow-hidden"
                >
                  <img
                    src={evt.bannerImageUrl || 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80'}
                    alt={evt.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                  
                  {/* Top Left Status & Type Badges */}
                  <div className="absolute top-3 left-3 flex items-center space-x-2 flex-wrap gap-y-1">
                    {/* Colored Status Badge */}
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-md flex items-center gap-1 ${
                      currentStatus === 'ongoing' ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50' :
                      currentStatus === 'upcoming' ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50' :
                      'bg-slate-900/90 text-slate-300 border border-slate-700'
                    }`}>
                      <span>{currentStatus === 'ongoing' ? '🟢' : currentStatus === 'upcoming' ? '🟡' : '⚪'}</span>
                      <span>{currentStatus === 'ongoing' ? 'Ongoing' : currentStatus === 'upcoming' ? 'Upcoming' : 'Past Archive'}</span>
                    </span>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                      evt.type === 'Hackathon' ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50' :
                      evt.type === 'Workshop' ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50' :
                      'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50'
                    }`}>
                      {evt.type}
                    </span>
                  </div>

                  {/* Top Right Admin 3-Dot Quick Actions Menu */}
                  {isAdmin && (
                    <div 
                      className="absolute top-3 right-3 z-20 flex items-center space-x-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Checkbox for bulk select */}
                      <button
                        onClick={() => toggleSelectEvent(evt.id)}
                        className="p-1.5 rounded-xl bg-slate-950/80 hover:bg-slate-900 text-slate-300 border border-slate-800 cursor-pointer"
                        title="Select for bulk actions"
                      >
                        {isSelected ? <CheckSquare className="w-3.5 h-3.5 text-purple-400" /> : <Square className="w-3.5 h-3.5 text-slate-500" />}
                      </button>

                      {/* 3-Dot Dropdown Trigger */}
                      <div className="relative">
                        <button
                          onClick={() => setOpenMenuId(openMenuId === evt.id ? null : evt.id)}
                          className="p-1.5 rounded-xl bg-slate-950/80 hover:bg-slate-900 text-slate-300 hover:text-white border border-slate-800 transition-colors cursor-pointer"
                          title="Admin Quick Actions"
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>

                        {/* Dropdown Popover */}
                        {openMenuId === evt.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-1.5 z-30 space-y-1 text-xs animate-in fade-in">
                            <button
                              onClick={() => { setOpenMenuId(null); onOpenAdminForm('event', evt); }}
                              className="w-full px-3 py-1.5 rounded-xl text-left hover:bg-slate-800 text-slate-200 font-semibold flex items-center space-x-2 cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Edit Event</span>
                            </button>

                            <button
                              onClick={() => { setOpenMenuId(null); handleDuplicateEvent(evt); }}
                              className="w-full px-3 py-1.5 rounded-xl text-left hover:bg-slate-800 text-slate-200 font-semibold flex items-center space-x-2 cursor-pointer"
                            >
                              <Copy className="w-3.5 h-3.5 text-cyan-400" />
                              <span>Duplicate Event</span>
                            </button>

                            <div className="border-t border-slate-800 my-1" />

                            <button
                              onClick={() => { setOpenMenuId(null); promptMoveStatus(evt, 'upcoming'); }}
                              className="w-full px-3 py-1.5 rounded-xl text-left hover:bg-slate-800 text-amber-300 font-semibold flex items-center space-x-2 cursor-pointer"
                            >
                              <span>🟡</span>
                              <span>Move to Upcoming</span>
                            </button>

                            <button
                              onClick={() => { setOpenMenuId(null); promptMoveStatus(evt, 'ongoing'); }}
                              className="w-full px-3 py-1.5 rounded-xl text-left hover:bg-slate-800 text-emerald-300 font-semibold flex items-center space-x-2 cursor-pointer"
                            >
                              <span>🟢</span>
                              <span>Move to Ongoing</span>
                            </button>

                            <button
                              onClick={() => { setOpenMenuId(null); promptMoveStatus(evt, 'archive'); }}
                              className="w-full px-3 py-1.5 rounded-xl text-left hover:bg-slate-800 text-purple-300 font-semibold flex items-center space-x-2 cursor-pointer"
                            >
                              <span>⚪</span>
                              <span>Move to Archive</span>
                            </button>

                            <div className="border-t border-slate-800 my-1" />

                            <button
                              onClick={() => { setOpenMenuId(null); promptDeleteEvent(evt); }}
                              className="w-full px-3 py-1.5 rounded-xl text-left hover:bg-rose-500/20 text-rose-300 font-semibold flex items-center space-x-2 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                              <span>Delete Event</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Body */}
                <div className="p-5 space-y-3 pt-0">
                  <div onClick={() => onOpenEventDetail(evt)} className="cursor-pointer space-y-1">
                    <h3 className="text-base font-extrabold text-white group-hover:text-purple-300 transition-colors line-clamp-1">
                      {evt.title}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-medium">By {evt.organizer}</p>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed font-normal">
                    {evt.description}
                  </p>

                  <div className="p-3 rounded-2xl bg-amber-950/20 border border-amber-500/30 text-xs text-amber-300 font-semibold flex items-center justify-between">
                    <span className="flex items-center">
                      <Award className="w-3.5 h-3.5 mr-1 text-amber-400" /> Prize / Perk:
                    </span>
                    <span className="text-white font-bold">{evt.prizeDetails}</span>
                  </div>

                  {/* Outcome Highlight if Present */}
                  {evt.winningTeam && (
                    <div className="p-2.5 rounded-xl bg-purple-950/30 border border-purple-500/30 text-[11px] text-purple-300 font-semibold truncate">
                      🏆 Winners: <strong className="text-white">{evt.winningTeam}</strong>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="p-5 pt-0 flex items-center justify-between gap-2 border-t border-slate-800/80">
                  <button
                    onClick={() => onOpenEventDetail(evt)}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 cursor-pointer"
                  >
                    View Details
                  </button>

                  <a
                    href={evt.registrationLink}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 flex items-center space-x-1 cursor-pointer"
                  >
                    <span>{currentStatus === 'archive' ? 'View Link' : 'Register'}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* CONFIRMATION DIALOG MODAL */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 text-center">
            <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
            <h4 className="text-base font-extrabold text-white">{confirmModal.title}</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {confirmModal.message}
            </p>
            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                onClick={() => setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null })}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmModal.onConfirm}
                className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-md cursor-pointer"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default EventsPage;
