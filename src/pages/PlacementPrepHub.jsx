import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { 
  Briefcase, 
  Building2, 
  BookOpen, 
  Plus, 
  ExternalLink, 
  Search, 
  CheckCircle2, 
  Calendar, 
  GraduationCap, 
  Award, 
  Share2, 
  UserCheck, 
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Edit2,
  Trash2
} from 'lucide-react';

export const PlacementPrepHub = ({ onOpenAdminForm, onOpenShareExperience }) => {
  const { placementCompanies, interviewExperiences, placementResources, removePlacementCompany, removeInterviewExperience } = useData();
  const { isAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState('companies');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState('All');

  // Subcategories list
  const subcategories = ['All', 'DSA & Coding', 'Aptitude & Reasoning', 'Core CS Subjects', 'Language-Specific'];

  // Filter companies
  const filteredCompanies = (placementCompanies || []).filter(c =>
    c.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.roles && c.roles.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Filter resources by subcategory
  const filteredResources = (placementResources || []).filter(res => {
    if (selectedSubcategory === 'All') return true;
    return (res.subcategory || res.category) === selectedSubcategory;
  });

  // Approved experiences only for public view (admins see all)
  const approvedExperiences = (interviewExperiences || []).filter(e => e.approved || isAdmin);

  return (
    <div className="space-y-8 pb-12">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 mb-2">
            <Briefcase className="w-3.5 h-3.5" />
            <span>Campus Career Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Placement Preparation Hub</h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Company recruitment drives, eligibility cutoffs, peer interview experiences, and aptitude prep toolkits.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          {/* Share Experience Button */}
          <button
            onClick={onOpenShareExperience}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl font-bold text-xs bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-600/30 transition-all"
          >
            <Share2 className="w-4 h-4" />
            <span>Share Experience</span>
          </button>

          {/* Admin Add Company Button */}
          {isAdmin && (
            <button
              onClick={() => onOpenAdminForm('company')}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Company Drive</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('companies')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
            activeTab === 'companies'
              ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Company Recruitment Drives ({filteredCompanies.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('experiences')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
            activeTab === 'experiences'
              ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Interview Experiences ({approvedExperiences.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('resources')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
            activeTab === 'resources'
              ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Prep Resource Kit ({(placementResources || []).length})</span>
        </button>
      </div>

      {/* SEARCH BAR */}
      {activeTab !== 'resources' && (
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Search company name, role, or eligibility cutoff..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 text-xs text-white rounded-2xl border border-slate-800 focus:outline-none focus:border-brand-500"
          />
        </div>
      )}

      {/* TAB 1: COMPANY RECRUITMENT DRIVES */}
      {activeTab === 'companies' && (
        <div className="space-y-6">
          
          {/* Official 2026 Hiring Disclaimer Banner */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start space-x-3 text-xs text-amber-200">
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-amber-300 font-bold mb-0.5">ℹ️ 2026 Hiring Data Guidance & Disclaimer:</strong>
              <p className="leading-relaxed text-slate-300">
                Eligibility and package details are based on publicly available 2026 hiring patterns and may vary by drive — always confirm exact details from the official company communication for your specific drive.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredCompanies.map((comp) => {
              const compExps = approvedExperiences.filter(e => e.companyId === comp.id);
              const isExpanded = selectedCompanyId === comp.id;

              return (
                <div
                  key={comp.id}
                  className="glass-card rounded-3xl overflow-hidden border border-slate-800 space-y-4 relative group flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    
                    {/* High-Res Corporate Campus Photo Banner */}
                    <div className="h-32 w-full relative overflow-hidden bg-slate-900">
                      <img
                        src={comp.photoUrl || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80'}
                        alt={comp.companyName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
                      
                      {/* Logo Badge Overlay */}
                      <div className="absolute bottom-3 left-4 flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-2xl bg-slate-950 p-2 flex items-center justify-center border border-slate-800 shadow-xl backdrop-blur-md">
                          <img
                            src={comp.logoUrl}
                            alt={comp.companyName}
                            className="w-8 h-8 object-contain"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.style.display = 'none';
                            }}
                          />
                          <Building2 className="w-6 h-6 text-brand-400 hidden" />
                        </div>
                        <div>
                          <h3 className="text-lg font-extrabold text-white drop-shadow-md group-hover:text-brand-300 transition-colors">
                            {comp.companyName}
                          </h3>
                          <span className="text-xs text-emerald-400 font-bold flex items-center drop-shadow-sm">
                            <Calendar className="w-3 h-3 mr-1" /> Drive Date: {comp.driveDate}
                          </span>
                        </div>
                      </div>

                      {/* CGPA Badge Overlay */}
                      <div className="absolute top-3 right-3 flex items-center space-x-2">
                        <span className="px-3 py-1 rounded-full text-xs font-black bg-indigo-950/80 text-indigo-300 border border-indigo-500/40 backdrop-blur-md shadow-lg">
                          CGPA: {comp.cgpaCutoff}+
                        </span>

                        {isAdmin && (
                          <div className="flex items-center space-x-1 p-1 bg-slate-950/80 rounded-xl border border-slate-800 backdrop-blur-md">
                            <button
                              onClick={() => onOpenAdminForm('company', comp)}
                              className="p-1 rounded-lg text-slate-300 hover:text-emerald-400"
                              title="Edit Drive"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => removePlacementCompany(comp.id)}
                              className="p-1 rounded-lg text-slate-300 hover:text-rose-400"
                              title="Delete Drive"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-6 pt-0 space-y-4">

                    {/* Roles & Package Badges */}
                    {(comp.roles || comp.packageRange) && (
                      <div className="flex flex-wrap gap-2 text-[11px]">
                        {comp.roles && (
                          <span className="px-2.5 py-1 rounded-xl bg-purple-500/10 text-purple-300 border border-purple-500/30 font-semibold">
                            💼 <strong>Roles:</strong> {comp.roles}
                          </span>
                        )}
                        {comp.packageRange && (
                          <span className="px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/30 font-semibold">
                            💰 <strong>Package:</strong> {comp.packageRange}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Description */}
                    <p className="text-xs text-slate-300 leading-relaxed font-normal">
                      {comp.description}
                    </p>

                    {/* Eligibility Badge */}
                    <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Eligibility Criteria</span>
                      <p className="text-xs text-slate-200 font-semibold">{comp.eligibilityCriteria}</p>
                    </div>
                    </div>
                  </div>

                  {/* Footer & Interview Experiences Expandable */}
                  <div className="pt-4 border-t border-slate-800/80 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-medium">
                        {compExps.length} Interview {compExps.length === 1 ? 'Experience' : 'Experiences'} Available
                      </span>

                      <button
                        onClick={() => setSelectedCompanyId(isExpanded ? null : comp.id)}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 text-brand-300 hover:text-white font-bold border border-slate-800 flex items-center space-x-1"
                      >
                        <span>{isExpanded ? 'Close Reviews' : 'View Experiences'}</span>
                        <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                      </button>
                    </div>

                    {/* Expandable Interview Experiences */}
                    {isExpanded && (
                      <div className="space-y-3 pt-3 border-t border-slate-800 animate-fadeIn">
                        {compExps.length === 0 ? (
                          <p className="text-xs text-slate-500 italic">No approved interview experiences yet for this company. Be the first to share!</p>
                        ) : (
                          compExps.map((exp) => (
                            <div key={exp.id} className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-white text-xs">{exp.role}</span>
                                <span className="text-[10px] text-slate-400">
                                  {exp.isAnonymous ? 'Anonymous' : exp.studentName} • {exp.submittedAt}
                                </span>
                              </div>

                              <div className="space-y-2 text-[11px]">
                                {exp.rounds.map((rnd, rIdx) => (
                                  <div key={rIdx} className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                                    <span className="font-bold text-indigo-300 block">{rnd.roundName}</span>
                                    <p className="text-slate-300 leading-normal">{rnd.description}</p>
                                  </div>
                                ))}
                              </div>

                              {exp.overallTips && (
                                <p className="text-[11px] text-emerald-400 italic pt-1">
                                  💡 <strong>Tips:</strong> {exp.overallTips}
                                </p>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    )}

                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: INTERVIEW EXPERIENCES FEED */}
      {activeTab === 'experiences' && (
        <div className="space-y-4">
          {approvedExperiences.length === 0 ? (
            <div className="glass-panel p-12 rounded-3xl text-center text-slate-400">
              <UserCheck className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold">No approved interview experiences yet.</p>
            </div>
          ) : (
            approvedExperiences.map((exp) => (
              <div key={exp.id} className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-brand-500/20 text-brand-300 border border-brand-500/40">
                      {exp.companyName}
                    </span>
                    <h3 className="text-base font-extrabold text-white mt-1">{exp.role}</h3>
                  </div>

                  <div className="flex items-center space-x-3 text-xs text-slate-400">
                    <span className="flex items-center">
                      <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                      {exp.isAnonymous ? 'Anonymous Student' : exp.studentName}
                    </span>
                    <span>• {exp.submittedAt}</span>

                    {isAdmin && (
                      <button
                        onClick={() => removeInterviewExperience(exp.id)}
                        className="text-rose-400 hover:text-rose-300 p-1"
                        title="Delete Experience"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Rounds */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {exp.rounds.map((rnd, rIdx) => (
                    <div key={rIdx} className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                      <span className="font-bold text-indigo-300 text-xs block">{rnd.roundName}</span>
                      <p className="text-slate-300 leading-relaxed text-[11px]">{rnd.description}</p>
                    </div>
                  ))}
                </div>

                {/* Advice */}
                {exp.overallTips && (
                  <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-300 space-y-1">
                    <span className="font-bold block text-emerald-400">💡 Overall Preparation Strategy:</span>
                    <p className="leading-relaxed">{exp.overallTips}</p>
                  </div>
                )}

              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: PREP RESOURCE KIT */}
      {activeTab === 'resources' && (
        <div className="space-y-6">
          
          {/* Subcategory Filter Chips Bar */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1">
            {subcategories.map((sub) => {
              const count = sub === 'All'
                ? (placementResources || []).length
                : (placementResources || []).filter(r => (r.subcategory || r.category) === sub).length;

              return (
                <button
                  key={sub}
                  onClick={() => setSelectedSubcategory(sub)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center space-x-1.5 ${
                    selectedSubcategory === sub
                      ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <span>{sub}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${selectedSubcategory === sub ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Resource Grid Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredResources.map((res) => (
              <div key={res.id} className="glass-card rounded-3xl p-6 border border-slate-800 flex flex-col justify-between space-y-4 group hover:border-brand-500/50 transition-all">
                <div className="space-y-3">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 uppercase tracking-wider">
                    {res.subcategory || res.category}
                  </span>
                  <h3 className="text-base font-bold text-white group-hover:text-brand-300 transition-colors">{res.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{res.description}</p>
                </div>

                <a
                  href={res.url}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white transition-all flex items-center justify-center space-x-2 shadow-lg shadow-brand-600/20"
                >
                  <span>Access Resource</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  );
};
