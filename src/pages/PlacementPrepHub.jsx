import React, { useState, useEffect } from 'react';
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
  Trash2,
  Coffee
} from 'lucide-react';
import { JavaLearningPage } from './JavaLearningPage';
import { PageControlGuard } from '../components/PageControlGuard';

export const PlacementPrepHub = ({ onOpenAdminForm, onOpenShareExperience, defaultSubTab = 'companies' }) => {
  const { 
    placementCompanies, 
    interviewExperiences, 
    placementResources, 
    javaAcademyResources,
    removePlacementCompany, 
    removeInterviewExperience, 
    removePlacementResource,
    removeJavaAcademyResource,
    pageControls 
  } = useData();
  const { isAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState(defaultSubTab);
  const [addNewDropdownOpen, setAddNewDropdownOpen] = useState(false);

  useEffect(() => {
    if (defaultSubTab) {
      setActiveTab(defaultSubTab);
    }
  }, [defaultSubTab]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState('All');

  // Subcategories list
  const subcategories = ['All', 'Aptitude & Reasoning', 'DSA & Coding', 'Java', 'DBMS', 'OS', 'CN', 'HR', 'Resume', 'Company Specific'];

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

          {/* Admin Add New Dropdown Button */}
          {isAdmin && (
            <div className="relative">
              <button
                onClick={() => setAddNewDropdownOpen(!addNewDropdownOpen)}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add New</span>
                <span className="text-[10px] ml-1">▼</span>
              </button>

              {addNewDropdownOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 space-y-1">
                  <button
                    onClick={() => {
                      setAddNewDropdownOpen(false);
                      onOpenAdminForm('company');
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-slate-800 hover:text-white flex items-center space-x-2 transition-all"
                  >
                    <Building2 className="w-4 h-4 text-emerald-400" />
                    <span>Add Company Drive</span>
                  </button>

                  <button
                    onClick={() => {
                      setAddNewDropdownOpen(false);
                      onOpenAdminForm('interviewExp');
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-slate-800 hover:text-white flex items-center space-x-2 transition-all"
                  >
                    <UserCheck className="w-4 h-4 text-indigo-400" />
                    <span>Add Interview Experience</span>
                  </button>

                  <button
                    onClick={() => {
                      setAddNewDropdownOpen(false);
                      onOpenAdminForm('prepResource');
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-slate-800 hover:text-white flex items-center space-x-2 transition-all"
                  >
                    <BookOpen className="w-4 h-4 text-amber-400" />
                    <span>Add Prep Resource</span>
                  </button>

                  <button
                    onClick={() => {
                      setAddNewDropdownOpen(false);
                      onOpenAdminForm('javaAcademy');
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-slate-800 hover:text-white flex items-center space-x-2 transition-all"
                  >
                    <Coffee className="w-4 h-4 text-rose-400" />
                    <span>Add Java Academy Resource</span>
                  </button>
                </div>
              )}
            </div>
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

        <button
          onClick={() => setActiveTab('learnjava')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
            activeTab === 'learnjava'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Coffee className="w-4 h-4 text-amber-300" />
          <span>Learn Java Academy</span>
          {pageControls?.learnjava?.status === 'maintenance' && (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-amber-500/30 text-amber-200 border border-amber-500/40 animate-pulse">
              Maintenance
            </span>
          )}
        </button>
      </div>

      {/* SEARCH BAR */}
      {activeTab !== 'resources' && activeTab !== 'learnjava' && (
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

          {filteredCompanies.length === 0 ? (
            <div className="glass-panel rounded-3xl p-12 text-center space-y-3 border border-slate-800">
              <Briefcase className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-white">No placement drives available.</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {(placementCompanies || []).length === 0 
                  ? "No active campus recruitment drives listed yet. New drives will appear here." 
                  : "No drives match your search query."}
              </p>
            </div>
          ) : (
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
          )}
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
                      <div className="flex items-center space-x-1 ml-2">
                        <button
                          onClick={() => onOpenAdminForm('interviewExp', exp)}
                          className="text-slate-300 hover:text-indigo-400 p-1"
                          title="Edit Experience"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => removeInterviewExperience(exp.id)}
                          className="text-slate-300 hover:text-rose-400 p-1"
                          title="Delete Experience"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Rounds */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {(exp.rounds || [
                    { roundName: 'Round 1: Online Assessment & DSA', description: exp.description || 'Coding and Aptitude evaluation' },
                    { roundName: 'Round 2: Technical Interview', description: exp.questionsAsked || 'Core Subjects & Live Coding' }
                  ]).map((rnd, rIdx) => (
                    <div key={rIdx} className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                      <span className="font-bold text-indigo-300 text-xs block">{rnd.roundName}</span>
                      <p className="text-slate-300 leading-relaxed text-[11px]">{rnd.description}</p>
                    </div>
                  ))}
                </div>

                {/* Advice */}
                {(exp.overallTips || exp.preparationTips) && (
                  <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-300 space-y-1">
                    <span className="font-bold block text-emerald-400">💡 Overall Preparation Strategy:</span>
                    <p className="leading-relaxed">{exp.overallTips || exp.preparationTips}</p>
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
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 uppercase tracking-wider">
                      {res.subcategory || res.category}
                    </span>

                    {isAdmin && (
                      <div className="flex items-center space-x-1 p-1 bg-slate-950/80 rounded-xl border border-slate-800 backdrop-blur-md">
                        <button
                          onClick={() => onOpenAdminForm('prepResource', res)}
                          className="p-1 rounded-lg text-slate-300 hover:text-amber-400"
                          title="Edit Resource"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => removePlacementResource(res.id)}
                          className="p-1 rounded-lg text-slate-300 hover:text-rose-400"
                          title="Delete Resource"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-brand-300 transition-colors">{res.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{res.description}</p>
                </div>

                <a
                  href={res.url || res.websiteUrl || res.pdfUrl}
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

      {/* TAB 4: ☕ LEARN JAVA ACADEMY */}
      {activeTab === 'learnjava' && (
        <div className="space-y-6 animate-in fade-in">
          {(javaAcademyResources || []).length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-300 flex items-center space-x-2">
                <Coffee className="w-4 h-4 text-rose-400" />
                <span>Featured Java Academy Courses & Masterclasses ({javaAcademyResources.length})</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {javaAcademyResources.map((javaRes) => (
                  <div key={javaRes.id} className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4 relative overflow-hidden group hover:border-rose-500/50 transition-all">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/40 uppercase tracking-wider">
                            {javaRes.level || 'Beginner'}
                          </span>
                          {javaRes.hasCertificate && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              📜 Certificate Included
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-extrabold text-white group-hover:text-rose-300 transition-colors pt-1">{javaRes.title}</h3>
                        <p className="text-xs text-slate-400">{javaRes.instructor || 'IT Dept Faculty'} • {javaRes.duration || '10 Hours'}</p>
                      </div>

                      {isAdmin && (
                        <div className="flex items-center space-x-1 p-1 bg-slate-950/80 rounded-xl border border-slate-800 backdrop-blur-md">
                          <button
                            onClick={() => onOpenAdminForm('javaAcademy', javaRes)}
                            className="p-1 rounded-lg text-slate-300 hover:text-rose-400"
                            title="Edit Course"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => removeJavaAcademyResource(javaRes.id)}
                            className="p-1 rounded-lg text-slate-300 hover:text-rose-400"
                            title="Delete Course"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">{javaRes.description}</p>

                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80">
                      {javaRes.youtubePlaylistUrl && (
                        <a
                          href={javaRes.youtubePlaylistUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all flex items-center space-x-1.5 shadow-md shadow-rose-600/30"
                        >
                          <span>Watch Playlist</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      {javaRes.practiceUrl && (
                        <a
                          href={javaRes.practiceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-slate-900 text-emerald-400 border border-slate-800 hover:border-emerald-500/50 text-xs font-bold transition-all flex items-center space-x-1.5"
                        >
                          <span>Practice Problems</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <PageControlGuard pageId="learnjava" onGoHome={() => setActiveTab('companies')}>
            <JavaLearningPage />
          </PageControlGuard>
        </div>
      )}

    </div>
  );
};
