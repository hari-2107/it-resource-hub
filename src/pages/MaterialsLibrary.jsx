import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { YEAR_SEMESTERS } from '../data/mockData';
import { RatingReviewComponent } from '../components/RatingReviewComponent';

import { 
  BookOpen, 
  FileText, 
  Download, 
  Eye, 
  Plus, 
  Edit2, 
  Trash2, 
  Bookmark, 
  Calendar, 
  Check, 
  ChevronRight, 
  Layers,
  Filter,
  Search,
  Flag,
  History,
  Clock,
  Lightbulb,
  Upload,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

export const MaterialsLibrary = ({ onPreviewMaterial, onOpenAdminForm, onOpenReportModal, onOpenVersionHistory, onOpenSuggestionModal, onOpenUploadNoteModal }) => {
  const { subjects, materials, removeMaterial, favorites, toggleFavoriteItem, trackDownload, trackMaterialView } = useData();
  const { currentUser, isAdmin } = useAuth();

  // Hierarchy filter states
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedSem, setSelectedSem] = useState('All');
  const [selectedSubjectId, setSelectedSubjectId] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    'All',
    'Student Notes',
    'Notes',
    'PPTs',
    'PDFs',
    'Lab Manuals',
    'Assignments',
    'Previous Year Papers',
    'Question Banks',
    'Syllabus'
  ];

  const semToYearMap = {
    1: '1st Year', 2: '1st Year',
    3: '2nd Year', 4: '2nd Year',
    5: '3rd Year', 6: '3rd Year',
    7: '4th Year', 8: '4th Year'
  };

  // Filter subjects based on Year + Semester selections
  const filteredSubjectsList = subjects.filter(s => {
    if (selectedYear !== 'All' && s.year !== selectedYear) return false;
    if (selectedSem !== 'All' && s.semester !== Number(selectedSem)) return false;
    return true;
  });

  const handleSelectSemester = (sem) => {
    const semStr = sem.toString();
    setSelectedSem(semStr);
    setSelectedSubjectId('All');
    if (semStr !== 'All' && semToYearMap[sem]) {
      setSelectedYear(semToYearMap[sem]);
    }
  };

  // Filter materials based on all active parameters
  const displayMaterials = materials.filter(item => {
    // Hide pending student uploads from public view unless admin
    if (!isAdmin && item.status === 'pending') return false;

    const sub = subjects.find(s => s.id === item.subjectId || s.name === item.subjectName);
    const itemYear = item.year || sub?.year || '';
    const itemSem = item.semester || sub?.semester || '';

    // Search query filter (searches title, subject, code, year, semester, description, category, author)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = (item.title || '').toLowerCase().includes(q);
      const matchSubject = (item.subjectName || '').toLowerCase().includes(q) || (sub?.name || '').toLowerCase().includes(q);
      const matchCode = (sub?.code || item.subjectCode || '').toLowerCase().includes(q);
      const matchCategory = (item.category || '').toLowerCase().includes(q);
      const matchDesc = (item.description || '').toLowerCase().includes(q);
      const matchYear = itemYear.toLowerCase().includes(q);
      const matchSem = `sem ${itemSem}`.toLowerCase().includes(q) || `semester ${itemSem}`.toLowerCase().includes(q) || `s${itemSem}`.toLowerCase().includes(q);
      const matchAuthor = (item.author || item.uploadedBy || '').toLowerCase().includes(q);

      if (!matchTitle && !matchSubject && !matchCode && !matchCategory && !matchDesc && !matchYear && !matchSem && !matchAuthor) {
        return false;
      }
    }

    if (selectedYear !== 'All' && itemYear !== selectedYear) return false;
    if (selectedSem !== 'All' && Number(itemSem) !== Number(selectedSem)) return false;
    if (selectedSubjectId !== 'All' && item.subjectId !== selectedSubjectId) return false;
    if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
    return true;
  });

  const handleDownload = (material) => {
    trackDownload(material.id);
    if (trackMaterialView) trackMaterialView(material.id);
    const link = document.createElement('a');
    link.href = material.fileUrl;
    link.download = material.fileName || `${material.title}.pdf`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePreview = (material) => {
    if (trackMaterialView) trackMaterialView(material.id);
    if (onPreviewMaterial) onPreviewMaterial(material);
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header & Admin Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-400 mb-1">
            <span>Library</span>
            <ChevronRight className="w-3 h-3 text-slate-600" />
            <span className="text-brand-300 font-medium">{selectedYear}</span>
            {selectedSem !== 'All' && (
              <>
                <ChevronRight className="w-3 h-3 text-slate-600" />
                <span className="text-brand-300 font-medium">Sem {selectedSem}</span>
              </>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Study Materials Library</h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Browse verified lecture notes, question banks, PYQs, and student-contributed study materials.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 flex-wrap gap-y-2 self-start md:self-auto">
          {currentUser && (
            <>
              <button
                onClick={onOpenUploadNoteModal}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl font-bold text-xs bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/30 transition-all"
              >
                <Upload className="w-4 h-4" />
                <span>Share Peer Notes</span>
              </button>

              <button
                onClick={onOpenSuggestionModal}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl font-bold text-xs bg-amber-600/90 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/20 transition-all"
              >
                <Lightbulb className="w-4 h-4" />
                <span>Suggest Resource</span>
              </button>
            </>
          )}

          {isAdmin && (
            <button
              onClick={() => onOpenAdminForm('material')}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Upload New Material</span>
            </button>
          )}
        </div>
      </div>

      {/* GLOBAL COMMON SEARCH BAR ACROSS ALL YEARS & SEMESTERS */}
      <div className="glass-panel p-4 sm:p-5 rounded-3xl border border-slate-700/80 shadow-2xl bg-slate-900/90 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-400" />
            <input
              type="text"
              placeholder="Search across all years & semesters (e.g., 'Full Stack', 'CS8591', 'Sem 5', 'Question Bank', 'Python')..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-10 py-3.5 bg-slate-950/90 text-sm text-white placeholder-slate-400 rounded-2xl border border-slate-700/80 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 shadow-inner transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white bg-slate-800 rounded-full"
                title="Clear search query"
              >
                ✕
              </button>
            )}
          </div>

          {searchQuery && (
            <div className="flex items-center space-x-2 text-xs text-brand-300 font-bold bg-brand-500/20 px-4 py-3 rounded-2xl border border-brand-500/30 whitespace-nowrap self-stretch md:self-auto justify-between">
              <span>Showing {displayMaterials.length} matching materials</span>
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setSelectedYear('All');
                  setSelectedSem('All');
                  setSelectedSubjectId('All');
                  setSelectedCategory('All');
                }}
                className="ml-2 text-slate-400 hover:text-white underline"
              >
                Clear All
              </button>
            </div>
          )}
        </div>
      </div>

      {/* FILTER CONTROLS BAR */}
      <div className="glass-panel p-6 rounded-3xl space-y-5 border border-slate-800">
        
        {/* Tier 1: Year Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
            1. Select Academic Year
          </label>
          <div className="flex flex-wrap gap-2">
            {['All', '1st Year', '2nd Year', '3rd Year', '4th Year'].map((year) => (
              <button
                key={year}
                onClick={() => {
                  setSelectedYear(year);
                  setSelectedSem('All');
                  setSelectedSubjectId('All');
                }}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  selectedYear === year
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                    : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {year}
              </button>
            ))}
          </div>
        </div>

        {/* Tier 2: Semester Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
            2. Select Semester {selectedYear !== 'All' && `(${selectedYear})`}
          </label>
          <div className="flex flex-wrap gap-2">
            {['All', ...(selectedYear === 'All' ? [1, 2, 3, 4, 5, 6, 7, 8] : (YEAR_SEMESTERS[selectedYear] || []))].map((sem) => (
              <button
                key={sem}
                onClick={() => handleSelectSemester(sem)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedSem === sem.toString()
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-900/80 text-slate-400 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {sem === 'All' ? 'All Semesters' : `Semester ${sem}`}
              </button>
            ))}
          </div>
        </div>

        {/* Tier 3: Subject Dropdown Filter */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              3. Filter by Specific Subject ({filteredSubjectsList.length} subjects in {selectedSem !== 'All' ? `Sem ${selectedSem}` : 'All Semesters'})
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-900 text-xs text-slate-100 rounded-xl border border-slate-800 focus:outline-none focus:border-brand-500 font-medium"
            >
              <option value="All">All Subjects ({selectedSem !== 'All' ? `Semester ${selectedSem}` : selectedYear !== 'All' ? selectedYear : 'All Years'})</option>
              {filteredSubjectsList.map(s => (
                <option key={s.id} value={s.id}>{s.name} (Sem {s.semester})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              4. Category Type
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-900 text-xs text-slate-100 rounded-xl border border-slate-800 focus:outline-none focus:border-brand-500"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat} Materials</option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 pt-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

      </div>

      {/* MATERIALS GRID */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-slate-400 font-medium">
            Showing <span className="text-white font-bold">{displayMaterials.length}</span> study materials
          </p>
        </div>

        {displayMaterials.length === 0 ? (
          <div className="glass-panel rounded-3xl p-12 text-center space-y-3">
            <FileText className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-white">No materials found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Try adjusting your year, semester, subject, or category filter to view resources.
            </p>
            <button
              onClick={() => {
                setSelectedYear('All');
                setSelectedSem('All');
                setSelectedSubjectId('All');
                setSelectedCategory('All');
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-brand-600 text-white"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayMaterials.map((mat) => {
              const isFav = favorites?.materialIds?.includes(mat.id);
              const sub = subjects.find(s => s.id === mat.subjectId || s.name === mat.subjectName);
              const matYear = mat.year || sub?.year || '1st Year';
              const matSem = mat.semester || sub?.semester || 1;

              return (
                <div
                  key={mat.id}
                  className="glass-card rounded-3xl p-6 flex flex-col justify-between space-y-4 border border-slate-800/80 relative group"
                >
                  <div className="space-y-3">
                    {/* Category & Year/Sem & Favorite badge */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-brand-500/20 text-brand-300 border border-brand-500/30 uppercase tracking-wide">
                          {mat.category}
                        </span>
                        {mat.isStudentContributed ? (
                          <span className="px-2 py-0.5 rounded-lg text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center">
                            <UserCheck className="w-3 h-3 mr-1" /> Student-Contributed
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-lg text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center">
                            <ShieldCheck className="w-3 h-3 mr-1" /> Verified Official
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          {matYear}
                        </span>
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          Sem {matSem}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        {currentUser && (
                          <>
                            <button
                              onClick={() => toggleFavoriteItem('material', mat.id)}
                              className={`p-1.5 rounded-lg border transition-all ${
                                isFav
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                              }`}
                              title={isFav ? "Remove Bookmark" : "Save to Favorites"}
                            >
                              <Bookmark className={`w-3.5 h-3.5 ${isFav ? 'fill-amber-400' : ''}`} />
                            </button>

                            <button
                              onClick={() => onOpenReportModal && onOpenReportModal(mat)}
                              className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-rose-400 border border-slate-800"
                              title="Report an issue with this file"
                            >
                              <Flag className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}

                        {isAdmin && (
                          <div className="flex items-center space-x-1 pl-1 border-l border-slate-800">
                            <button
                              onClick={() => onOpenVersionHistory && onOpenVersionHistory('material', mat)}
                              className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-indigo-400 border border-slate-800"
                              title="View Version History & Rollback"
                            >
                              <History className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onOpenAdminForm('material', mat)}
                              className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-emerald-400 border border-slate-800"
                              title="Edit Material"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => removeMaterial(mat.id)}
                              className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-rose-400 border border-slate-800"
                              title="Delete Material"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-bold text-white group-hover:text-brand-300 transition-colors leading-snug">
                      {mat.title}
                    </h3>

                    {/* Subject badge & Last updated with time */}
                    <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                      <span>{mat.subjectName}</span>
                      <span className="text-[10px] text-slate-400 flex items-center bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
                        <Clock className="w-3 h-3 mr-1 text-slate-500" />
                        {mat.updatedDate 
                          ? `Updated: ${mat.updatedDate}${mat.updatedTime ? ` • ${mat.updatedTime}` : ''}` 
                          : `Uploaded: ${mat.uploadDate || 'Recent'}${mat.uploadTime ? ` • ${mat.uploadTime}` : ''}`}
                      </span>
                    </div>

                    {/* Description */}
                    {mat.description && (
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {mat.description}
                      </p>
                    )}
                  </div>

                  {/* Footer metadata & actions */}
                  <div className="pt-4 border-t border-slate-800/80 space-y-3">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center text-emerald-400 font-semibold" title="Total Members Viewed">
                        <Eye className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                        <span>{mat.viewCount || (mat.viewedBy ? mat.viewedBy.length : 1)} Seen</span>
                      </span>
                      <span className="flex items-center text-slate-400">
                        <Download className="w-3.5 h-3.5 mr-1 text-brand-400" />
                        <span className="text-white font-semibold mr-1">{mat.downloadCount || 0}</span> downloads
                      </span>
                    </div>

                    {mat.viewedBy && mat.viewedBy.length > 0 && (
                      <div className="text-[10px] text-slate-400 truncate bg-slate-900/60 px-2 py-1 rounded-lg border border-slate-800/50">
                        <span className="text-slate-500 font-medium mr-1">Seen by:</span>
                        <span className="text-slate-300 font-medium">
                          {mat.viewedBy.slice(0, 3).join(', ')}
                          {mat.viewedBy.length > 3 ? ` +${mat.viewedBy.length - 3} others` : ''}
                        </span>
                      </div>
                    )}

                    {/* 1-5 Star Rating & Review Widget */}
                    <div className="pt-2 border-t border-slate-800/60">
                      <RatingReviewComponent targetId={mat.id} targetType="material" />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handlePreview(mat)}
                        className="py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center space-x-1"
                      >
                        <Eye className="w-3.5 h-3.5 text-brand-400" />
                        <span>{mat.category === 'PPTs' ? 'Preview PPT' : 'Preview PDF'}</span>
                      </button>

                      <button
                        onClick={() => handleDownload(mat)}
                        className="py-2 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white flex items-center justify-center space-x-1 shadow-md shadow-brand-600/20"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
