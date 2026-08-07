import React from 'react';
import { X, Calendar, Award, ExternalLink, Clock, UserCheck, ShieldCheck, MapPin, Tag, Trophy, FileText, Video, Download, MessageSquare } from 'lucide-react';
import { getEffectiveEventStatus } from '../context/DataContext';

export const EventDetailModal = ({ event, onClose }) => {
  if (!event) return null;

  const currentStatus = getEffectiveEventStatus(event);

  // Calculate days remaining until deadline
  const getDaysRemaining = (deadlineStr) => {
    if (!deadlineStr) return null;
    const diff = new Date(deadlineStr) - new Date();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  const daysLeft = getDaysRemaining(event.registrationDeadline);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="glass-panel w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-950 p-6 space-y-6 relative max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-xl bg-slate-900/80 text-slate-300 hover:text-white border border-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Event Banner */}
        <div className="relative h-48 sm:h-56 rounded-2xl overflow-hidden border border-slate-800">
          <img src={event.bannerImageUrl || 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80'} alt={event.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          
          <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              {/* Event Status Badge */}
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-md flex items-center gap-1 ${
                currentStatus === 'ongoing' ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50' :
                currentStatus === 'upcoming' ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50' :
                'bg-slate-800 text-slate-300 border border-slate-700'
              }`}>
                <span>{currentStatus === 'ongoing' ? '🟢' : currentStatus === 'upcoming' ? '🟡' : '⚪'}</span>
                <span>{currentStatus === 'ongoing' ? 'Ongoing' : currentStatus === 'upcoming' ? 'Upcoming' : 'Past Archive'}</span>
              </span>

              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                event.type === 'Hackathon' ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50' :
                event.type === 'Workshop' ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50' :
                'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50'
              }`}>
                {event.type}
              </span>

              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-900/80 text-brand-300 border border-slate-700">
                {event.level} Level
              </span>
            </div>

            {daysLeft !== null && currentStatus !== 'archive' && (
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold flex items-center ${
                daysLeft > 0 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              }`}>
                <Clock className="w-3 h-3 mr-1" />
                {daysLeft > 0 ? `${daysLeft} Days Remaining to Register` : 'Registration Closed'}
              </span>
            )}
          </div>
        </div>

        {/* Title & Organizer */}
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-black text-white">{event.title}</h2>
          <p className="text-xs text-slate-400 font-medium">Organized by: <strong className="text-slate-200">{event.organizer}</strong></p>
        </div>

        {/* Quick Details Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-2xl bg-amber-950/30 border border-amber-500/30 space-y-1">
            <span className="text-[10px] font-extrabold uppercase text-amber-400">Prize Pool / Perk</span>
            <p className="font-bold text-white text-xs">{event.prizeDetails || 'Certificates & Swags'}</p>
          </div>

          <div className="p-3 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 space-y-1">
            <span className="text-[10px] font-extrabold uppercase text-indigo-300">Event Dates</span>
            <p className="font-bold text-white text-xs">{event.startDate} to {event.endDate}</p>
          </div>

          <div className="p-3 rounded-2xl bg-rose-950/30 border border-rose-500/30 space-y-1">
            <span className="text-[10px] font-extrabold uppercase text-rose-400">Registration Deadline</span>
            <p className="font-bold text-white text-xs">{event.registrationDeadline}</p>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2 text-xs text-slate-300 leading-relaxed pt-2 border-t border-slate-800">
          <h3 className="font-bold text-white text-sm">About Event</h3>
          <p className="whitespace-pre-line">{event.description}</p>
        </div>

        {/* Optional Outcome & Winner Announcement Details */}
        {(event.winnerAnnouncement || event.winningTeam || event.certificateLink || event.resultPdfUrl || event.recordingUrl || event.feedbackFormUrl) && (
          <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-3 pt-3">
            <h4 className="text-xs font-extrabold text-amber-300 flex items-center space-x-1.5 uppercase tracking-wider">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Event Results & Deliverables</span>
            </h4>

            {event.winningTeam && (
              <div className="text-xs text-slate-200">
                <span className="text-slate-400">🏆 Winner / Winning Team: </span>
                <strong className="text-white">{event.winningTeam}</strong>
              </div>
            )}

            {event.winnerAnnouncement && (
              <p className="text-xs text-slate-300 leading-relaxed italic bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                "{event.winnerAnnouncement}"
              </p>
            )}

            {/* Deliverable Action Buttons */}
            <div className="flex flex-wrap gap-2 pt-1">
              {event.certificateLink && (
                <a
                  href={event.certificateLink}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/40 text-xs font-bold transition-all flex items-center space-x-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Certificates</span>
                </a>
              )}

              {event.resultPdfUrl && (
                <a
                  href={event.resultPdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600 text-cyan-300 hover:text-white border border-cyan-500/40 text-xs font-bold transition-all flex items-center space-x-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>View Result PDF</span>
                </a>
              )}

              {event.recordingUrl && (
                <a
                  href={event.recordingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 text-xs font-bold transition-all flex items-center space-x-1.5"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Watch Event Recording</span>
                </a>
              )}

              {event.feedbackFormUrl && (
                <a
                  href={event.feedbackFormUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 text-xs font-bold transition-all flex items-center space-x-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Feedback Form</span>
                </a>
              )}
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-slate-400 hover:text-white font-bold text-xs cursor-pointer"
          >
            Close
          </button>

          <a
            href={event.registrationLink}
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-2 cursor-pointer"
          >
            <span>{currentStatus === 'archive' ? 'View Event Link' : 'Register Now'}</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

      </div>
    </div>
  );
};
