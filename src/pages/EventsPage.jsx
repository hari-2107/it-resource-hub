import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { 
  Trophy, 
  Calendar, 
  Clock, 
  Plus, 
  ExternalLink, 
  Tag, 
  Sparkles, 
  Award, 
  Edit2, 
  Trash2,
  ChevronRight,
  Flame
} from 'lucide-react';

export const EventsPage = ({ onOpenAdminForm, onOpenEventDetail }) => {
  const { events, removeEvent } = useData();
  const { isAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState('upcoming'); // 'ongoing' | 'upcoming' | 'past'

  const currentDateStr = new Date().toISOString().split('T')[0];

  // Helper to categorize events
  const categorizedEvents = (events || []).reduce(
    (acc, evt) => {
      if (evt.startDate <= currentDateStr && evt.endDate >= currentDateStr) {
        acc.ongoing.push(evt);
      } else if (evt.startDate > currentDateStr) {
        acc.upcoming.push(evt);
      } else {
        acc.past.push(evt);
      }
      return acc;
    },
    { ongoing: [], upcoming: [], past: [] }
  );

  const displayedEvents = categorizedEvents[activeTab] || [];

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
            className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition-all self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Event</span>
          </button>
        )}
      </div>

      {/* Tabs Bar (Ongoing / Upcoming / Past) */}
      <div className="flex items-center space-x-3 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('ongoing')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
            activeTab === 'ongoing'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Flame className="w-4 h-4 text-rose-400" />
          <span>Ongoing ({categorizedEvents.ongoing.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
            activeTab === 'upcoming'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Upcoming ({categorizedEvents.upcoming.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('past')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
            activeTab === 'past'
              ? 'bg-slate-800 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4 text-slate-400" />
          <span>Past Archive ({categorizedEvents.past.length})</span>
        </button>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedEvents.length === 0 ? (
          <div className="col-span-full glass-panel p-12 rounded-3xl text-center text-slate-400">
            <Trophy className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold">No events listed under "{activeTab}" at the moment.</p>
          </div>
        ) : (
          displayedEvents.map((evt) => (
            <div
              key={evt.id}
              className="glass-card rounded-3xl overflow-hidden border border-slate-800 flex flex-col justify-between space-y-4 group hover:border-slate-700 transition-all relative"
            >
              {/* Banner Image */}
              <div
                onClick={() => onOpenEventDetail(evt)}
                className="relative h-44 cursor-pointer overflow-hidden"
              >
                <img
                  src={evt.bannerImageUrl}
                  alt={evt.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                
                <div className="absolute top-3 left-3 flex items-center space-x-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                    evt.type === 'Hackathon' ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50' :
                    evt.type === 'Workshop' ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50' :
                    'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50'
                  }`}>
                    {evt.type}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-900/90 text-slate-300 border border-slate-700">
                    {evt.level}
                  </span>
                </div>

                {isAdmin && (
                  <div className="absolute top-3 right-3 flex items-center space-x-1 p-1 bg-slate-950/80 rounded-xl border border-slate-800">
                    <button
                      onClick={(e) => { e.stopPropagation(); onOpenAdminForm('event', evt); }}
                      className="p-1 text-slate-400 hover:text-emerald-400"
                      title="Edit Event"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); removeEvent(evt.id); }}
                      className="p-1 text-slate-400 hover:text-rose-400"
                      title="Delete Event"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
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
              </div>

              {/* Action Buttons */}
              <div className="p-5 pt-0 flex items-center justify-between gap-2 border-t border-slate-800/80">
                <button
                  onClick={() => onOpenEventDetail(evt)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800"
                >
                  View Details
                </button>

                <a
                  href={evt.registrationLink}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 flex items-center space-x-1"
                >
                  <span>Register</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
};
