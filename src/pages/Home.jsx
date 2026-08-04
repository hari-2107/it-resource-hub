import React from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { 
  BookOpen, 
  FileText, 
  Sparkles, 
  Bell, 
  Download, 
  ArrowRight, 
  CheckCircle2, 
  ExternalLink, 
  ShieldCheck, 
  Flame,
  Layers,
  GraduationCap,
  Trophy,
  Award,
  Brain
} from 'lucide-react';

export const Home = ({ onNavigate, onPreviewMaterial }) => {
  const { materials, aiTools, announcements, events, loading } = useData();
  const { currentUser, isAdmin } = useAuth();

  // Dynamic stat badges calculated from live data
  const studyGuidesCount = (materials || []).length;
  const aiToolsCount = (aiTools || []).length;
  const totalDownloadsCount = (materials || []).reduce((sum, m) => sum + (Number(m.downloadCount || m.downloads || 0)), 0);

  // Recent materials sorted by date descending (top 4)
  const recentMaterials = [...(materials || [])]
    .sort((a, b) => new Date(b.uploadDate || b.createdAt || 0) - new Date(a.uploadDate || a.createdAt || 0))
    .slice(0, 4);

  // Active & Upcoming Events highlight (top 3)
  const activeEvents = (events || []).slice(0, 3);

  // Priority sorted announcements (Pinned > High > Medium > Low)
  const priorityWeight = { 'High': 3, 'Medium': 2, 'Low': 1 };
  const sortedAnnouncements = [...(announcements || [])].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    const pA = priorityWeight[a.priority] || 1;
    const pB = priorityWeight[b.priority] || 1;
    if (pB !== pA) return pB - pA;
    return new Date(b.date || 0) - new Date(a.date || 0);
  });
  const latestAnnouncements = sortedAnnouncements.slice(0, 3);

  // Featured AI tools
  const featuredTools = (aiTools || []).filter(t => t.featured || true).slice(0, 4);

  return (
    <div className="space-y-12 pb-12">
      
      {/* HERO BANNER */}
      <section className="relative overflow-hidden rounded-3xl glass-panel p-6 sm:p-12 border border-slate-800/80 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-brand-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-96 h-96 bg-accent-cyan/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-brand-500/15 text-brand-300 border border-brand-500/30">
            <GraduationCap className="w-4 h-4 text-brand-400" />
            <span>IT Student Platform</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight sm:leading-tight">
            All Your IT Study Resources & <span className="gradient-text">AI Tools in One Place</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Access verified lecture notes, question banks, lab workbooks, previous year exam papers, real-time class timetables, and curated AI tools tailored for Information Technology students.
          </p>

          {/* Action CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <button 
              onClick={() => onNavigate('materials')}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold bg-brand-600 hover:bg-brand-500 text-white shadow-xl shadow-brand-600/25 transition-all flex items-center justify-center space-x-2"
            >
              <span>Explore Materials</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button 
              onClick={() => onNavigate('aitools')}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold bg-gradient-to-r from-violet-600/35 via-indigo-600/35 to-purple-600/35 hover:from-violet-600/55 hover:to-indigo-600/55 text-violet-200 hover:text-white border border-violet-500/50 shadow-xl transition-all flex items-center justify-center space-x-2"
            >
              <Sparkles className="w-4 h-4 text-violet-300" />
              <span>Discover AI Tools</span>
            </button>
            <button 
              onClick={() => onNavigate('brainzone')}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold bg-gradient-to-r from-purple-600/40 via-pink-600/40 to-amber-600/40 hover:from-purple-600/60 hover:to-amber-600/60 text-purple-100 hover:text-white border border-purple-500/50 shadow-xl transition-all flex items-center justify-center space-x-2"
            >
              <Brain className="w-4 h-4 text-purple-300 animate-pulse" />
              <span>🧠 BrainZone Arcade</span>
            </button>
          </div>
          
          {/* Dynamic Quick Stats Badges */}
          <div className="pt-4 flex flex-wrap items-center gap-2.5 sm:gap-4 text-xs text-slate-400 font-medium">
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800 shadow-sm">
              <FileText className="w-4 h-4 text-brand-400" />
              <span>{studyGuidesCount > 0 ? `${studyGuidesCount}+` : '0'} Verified Study Guides</span>
            </div>
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800 shadow-sm">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{aiToolsCount > 0 ? `${aiToolsCount}+` : '0'} Tech AI Assistants</span>
            </div>
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800 shadow-sm">
              <Flame className="w-4 h-4 text-rose-400" />
              <span>{totalDownloadsCount > 0 ? `${totalDownloadsCount.toLocaleString()}+` : '0'} Total Downloads</span>
            </div>
          </div>
        </div>
      </section>

      {/* RECENTLY ADDED MATERIALS SECTION */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <FileText className="w-5 h-5 text-brand-400" />
              <span>Recently Uploaded Study Materials</span>
            </h2>
            <p className="text-xs text-slate-400">Latest lecture notes, lab manuals, and question banks</p>
          </div>
          <button
            onClick={() => onNavigate('materials')}
            className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center space-x-1 hover:underline"
          >
            <span>View Library</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="glass-card rounded-2xl p-5 space-y-4 border border-slate-800/80 animate-pulse">
                <div className="flex justify-between items-center">
                  <div className="h-4 w-16 bg-slate-800/80 rounded" />
                  <div className="h-3 w-10 bg-slate-800/80 rounded" />
                </div>
                <div className="h-4 w-3/4 bg-slate-800/80 rounded" />
                <div className="h-3 w-1/2 bg-slate-800/80 rounded" />
                <div className="pt-3 border-t border-slate-800/60 flex justify-between items-center">
                  <div className="h-3 w-20 bg-slate-800/80 rounded" />
                  <div className="h-6 w-16 bg-slate-800/80 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : recentMaterials.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center space-y-3 border border-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-brand-400">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">No materials uploaded yet — check back soon!</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Verified study notes, lab workbooks, and previous year exam papers will appear here as soon as they are published.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentMaterials.map((mat) => (
              <div 
                key={mat.id} 
                className="glass-card rounded-2xl p-5 flex flex-col justify-between space-y-4 border border-slate-800/80 group hover:border-brand-500/40"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1 flex-wrap gap-y-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-500/20 text-brand-300 border border-brand-500/30 uppercase">
                        {mat.category}
                      </span>
                      {mat.year && mat.semester && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          {mat.year} • S{mat.semester}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 flex items-center">
                      <Download className="w-3 h-3 mr-1 text-slate-500" /> {mat.downloadCount || 0}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white group-hover:text-brand-300 transition-colors line-clamp-2">
                    {mat.title}
                  </h3>
                  <p className="text-xs text-slate-400 truncate">{mat.subjectName}</p>
                </div>

                <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">
                    {mat.updatedDate ? `Updated: ${mat.updatedDate}${mat.updatedTime ? ` • ${mat.updatedTime}` : ''}` : `${mat.uploadDate || 'Recent'}${mat.uploadTime ? ` • ${mat.uploadTime}` : ''}`}
                  </span>
                  <button
                    onClick={() => onPreviewMaterial(mat)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-brand-600 text-slate-200 hover:text-white transition-all flex items-center space-x-1"
                  >
                    <span>Preview</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* LATEST ANNOUNCEMENTS SECTION */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <Bell className="w-5 h-5 text-rose-400" />
              <span>Department Announcements</span>
            </h2>
            <p className="text-xs text-slate-400">Important notices, exam dates, and upcoming events</p>
          </div>
          <button
            onClick={() => onNavigate('announcements')}
            className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center space-x-1 hover:underline"
          >
            <span>All Announcements</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {latestAnnouncements.map((ann) => (
            <div 
              key={ann.id} 
              onClick={() => onNavigate('announcements', ann.id)}
              className="glass-card rounded-2xl p-5 space-y-3 border border-slate-800 relative overflow-hidden cursor-pointer hover:border-brand-500/50 hover:bg-slate-900/90 hover:scale-[1.01] transition-all group shadow-md"
              title="Click to view full notice on Notifications page"
            >
              {ann.priority === 'High' && (
                <div className="absolute top-0 right-0 w-2 h-full bg-rose-500" />
              )}
              <div className="flex items-center justify-between">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  ann.priority === 'High' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                  ann.priority === 'Medium' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                  'bg-brand-500/20 text-brand-300 border border-brand-500/40'
                }`}>
                  {ann.category}
                </span>
                <span className="text-[10px] text-slate-400">{ann.date}{ann.time ? ` • ${ann.time}` : ''}</span>
              </div>

              <h3 className="text-sm font-bold text-white group-hover:text-brand-300 transition-colors leading-snug line-clamp-2">{ann.title}</h3>
              <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">{ann.description}</p>
              
              <div className="pt-2 text-[10px] text-slate-500 font-medium flex items-center justify-between">
                <span>By: {ann.author}</span>
                <span className="text-[10px] font-bold text-brand-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-0.5">
                  <span>View notice</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED AI TOOLS SECTION */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>Top AI Tools for IT Students</span>
            </h2>
            <p className="text-xs text-slate-400">Curated tools for coding, writing, research, and career</p>
          </div>
          <button
            onClick={() => onNavigate('aitools')}
            className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center space-x-1 hover:underline"
          >
            <span>Explore All Tools</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featuredTools.map((tool) => (
            <div key={tool.id} className="glass-card rounded-2xl p-5 space-y-4 border border-slate-800 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 p-2 flex items-center justify-center border border-slate-800">
                    <img src={tool.logoUrl} alt={tool.name} className="w-6 h-6 object-contain" />
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    tool.pricing === 'Free' ? 'bg-emerald-500/20 text-emerald-300' :
                    tool.pricing === 'Freemium' ? 'bg-amber-500/20 text-amber-300' :
                    'bg-purple-500/20 text-purple-300'
                  }`}>
                    {tool.pricing}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white">{tool.name}</h3>
                  <p className="text-[11px] text-brand-300 font-medium">{tool.category}</p>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{tool.description}</p>
              </div>

              <a
                href={tool.websiteUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-brand-600 text-slate-200 hover:text-white transition-all flex items-center justify-center space-x-1.5"
              >
                <span>Visit Official Site</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* ACTIVE HACKATHONS & EVENTS HIGHLIGHT */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-purple-400" />
              <span>Active Hackathons & Competitions</span>
            </h2>
            <p className="text-xs text-slate-400">Featured national campus drives, coding contests, and bootcamps</p>
          </div>
          <button
            onClick={() => onNavigate('events')}
            className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center space-x-1 hover:underline"
          >
            <span>Explore All Events</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {activeEvents.map((evt) => (
            <div 
              key={evt.id} 
              onClick={() => onNavigate('events', evt.id)}
              className="glass-card rounded-3xl overflow-hidden border border-slate-800 flex flex-col justify-between space-y-3 group hover:border-purple-500/50 hover:bg-slate-900/90 transition-all cursor-pointer shadow-md"
              title="Click to view event details on Events page"
            >
              <div className="relative h-36 overflow-hidden">
                <img src={evt.bannerImageUrl} alt={evt.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                
                <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-500/40 text-purple-200 border border-purple-500/60 uppercase">
                  {evt.type}
                </span>
              </div>

              <div className="p-4 space-y-2 pt-0">
                <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-1">{evt.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{evt.description}</p>
                <div className="p-2.5 rounded-xl bg-amber-950/20 border border-amber-500/30 text-[11px] text-amber-300 font-semibold flex items-center space-x-1">
                  <Award className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span className="truncate">{evt.prizeDetails}</span>
                </div>
              </div>

              <div className="p-4 pt-0 flex items-center space-x-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigate('events', evt.id);
                  }}
                  className="flex-1 py-2 rounded-xl text-xs font-bold bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white border border-purple-500/40 transition-colors"
                >
                  View Details
                </button>
                <a
                  href={evt.registrationLink}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center space-x-1 shadow-md"
                >
                  <span>Register</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
