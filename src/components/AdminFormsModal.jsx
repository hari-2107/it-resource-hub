import React, { useState } from 'react';
import { X, Upload, Plus, Save, Sparkles, FileText, Bell, Calendar, Trash2, GraduationCap } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { YEAR_SEMESTERS, CLASS_SECTIONS_PER_YEAR } from '../data/mockData';

export const AdminFormsModal = ({ type, initialData, onClose }) => {
  const { subjects, addOrUpdateMaterial, addOrUpdateAITool, addOrUpdateAnnouncement, addOrUpdateTimetable } = useData();
  const { currentUser } = useAuth();

  // Timetable Form state
  const [timetableForm, setTimetableForm] = useState(initialData ? {
    ...initialData,
    type: initialData.type || 'class',
    title: initialData.title || '',
    year: initialData.year || '3rd Year',
    semester: initialData.semester || 5,
    classSection: initialData.classSection || 'IT-A',
    college: initialData.college || 'V.S.B. Engineering College, Karur',
    effectiveDate: initialData.effectiveDate || new Date().toISOString().split('T')[0],
    status: initialData.status || 'active',
    internalName: initialData.internalName || 'Internal 1',
    regulation: initialData.regulation || 'R2021',
    examEntries: initialData.examEntries || [
      { id: '1', subject: 'Full Stack Web Development', subjectCode: 'CS8591', examDate: '2026-08-05', day: 'Wednesday', startTime: '09:30 AM', endTime: '11:00 AM', hall: 'MBIII ANX301', session: 'FN', syllabus: 'Units I & II' }
    ]
  } : {
    type: 'class',
    title: '',
    year: '3rd Year',
    semester: 5,
    classSection: 'IT-A',
    college: 'V.S.B. Engineering College, Karur',
    effectiveDate: new Date().toISOString().split('T')[0],
    status: 'active',
    internalName: 'Internal 1',
    regulation: 'R2021',
    examEntries: [
      { id: '1', subject: 'Full Stack Web Development', subjectCode: 'CS8591', examDate: '2026-08-05', day: 'Wednesday', startTime: '09:30 AM', endTime: '11:00 AM', hall: 'MBIII ANX301', session: 'FN', syllabus: 'Units I & II' }
    ],
    schedule: {
      Monday: [{ time: '09:15 - 10:00 AM', period: 'I', span: 1, subject: 'FSWD', fullName: 'Full Stack Web Development', room: 'MBIII ANX301', teacher: 'Mr. N. Vinayakaswamy [NV]', type: 'Theory' }],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: []
    }
  });

  // Material Form state
  const initialSub = subjects.find(s => s.id === initialData?.subjectId) || subjects[0];
  const [materialForm, setMaterialForm] = useState(initialData ? {
    ...initialData,
    year: initialData.year || initialSub?.year || '1st Year',
    semester: initialData.semester || initialSub?.semester || 1
  } : {
    id: '',
    year: initialSub?.year || '1st Year',
    semester: initialSub?.semester || 1,
    subjectId: initialSub?.id || '',
    subjectName: initialSub?.name || '',
    category: 'Notes',
    title: '',
    description: '',
    fileUrl: 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf',
    fileName: 'Material_Doc.pdf',
    fileSize: '2.5 MB'
  });

  // AI Tool Form state
  const [aiToolForm, setAiToolForm] = useState(initialData || {
    id: '',
    name: '',
    category: 'Coding',
    pricing: 'Free',
    description: '',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg',
    websiteUrl: 'https://',
    tags: 'AI, Study, Tech'
  });

  // Announcement Form state
  const [announcementForm, setAnnouncementForm] = useState(initialData || {
    id: '',
    title: '',
    category: 'Academic',
    priority: 'Medium',
    description: '',
    author: currentUser?.name || 'IT Dept Admin'
  });

  // Company Form state
  const [companyForm, setCompanyForm] = useState(initialData || {
    id: '',
    companyName: '',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg',
    eligibilityCriteria: 'B.Tech IT with no active backlogs',
    cgpaCutoff: 7.5,
    driveDate: '2026-09-15',
    description: ''
  });

  // Event Form state
  const [eventForm, setEventForm] = useState(initialData || {
    id: '',
    title: '',
    bannerImageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
    type: 'Hackathon',
    level: 'National',
    organizer: 'IT Dept & Tech Club',
    description: '',
    prizeDetails: '🏆 $2,000 Cash Pool',
    registrationLink: 'https://',
    startDate: '2026-08-01',
    endDate: '2026-08-03',
    registrationDeadline: '2026-07-30'
  });

  const categoriesList = ['Notes', 'PPTs', 'PDFs', 'Lab Manuals', 'Assignments', 'Previous Year Papers', 'Question Banks', 'Syllabus'];
  const aiCategoriesList = ['Coding', 'Writing', 'Research', 'Design', 'Productivity', 'Resume/Career'];

  const { addOrUpdatePlacementCompany, addOrUpdateEvent } = useData();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (type === 'material') {
      const selectedSub = subjects.find(s => s.id === materialForm.subjectId);
      addOrUpdateMaterial({
        ...materialForm,
        year: materialForm.year || selectedSub?.year || '1st Year',
        semester: Number(materialForm.semester || selectedSub?.semester || 1),
        subjectName: selectedSub ? selectedSub.name : materialForm.subjectName
      });
    } else if (type === 'aitool') {
      addOrUpdateAITool({
        ...aiToolForm,
        tags: typeof aiToolForm.tags === 'string' ? aiToolForm.tags.split(',').map(t => t.trim()) : aiToolForm.tags
      });
    } else if (type === 'announcement') {
      addOrUpdateAnnouncement(announcementForm);
    } else if (type === 'timetable') {
      let finalTitle = (timetableForm.title || '').trim();
      if (!finalTitle) {
        if (timetableForm.type === 'internal') {
          finalTitle = `${timetableForm.internalName || 'Internal 1'} Examination Schedule`;
        } else if (timetableForm.type === 'semester') {
          finalTitle = `Semester Examination Schedule`;
        } else {
          finalTitle = `${timetableForm.year} ${timetableForm.classSection || 'IT-A'} Class Timetable`;
        }
      }
      addOrUpdateTimetable({
        ...timetableForm,
        title: finalTitle
      });
    } else if (type === 'company') {
      addOrUpdatePlacementCompany(companyForm);
    } else if (type === 'event') {
      addOrUpdateEvent(eventForm);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 rounded-3xl border border-slate-700/80 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              {type === 'material' && <FileText className="w-5 h-5" />}
              {type === 'aitool' && <Sparkles className="w-5 h-5" />}
              {type === 'announcement' && <Bell className="w-5 h-5" />}
              {type === 'timetable' && <Calendar className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-white capitalize">
                {initialData?.id ? `Edit ${type}` : `Add New ${type}`}
              </h3>
              <p className="text-xs text-slate-400">Admin Control Panel</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          
          {/* MATERIAL FORM */}
          {type === 'material' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Academic Year</label>
                  <select
                    value={materialForm.year || '1st Year'}
                    onChange={(e) => {
                      const newYear = e.target.value;
                      const availableSems = YEAR_SEMESTERS[newYear] || [1, 2];
                      const newSem = availableSems[0];
                      const matchingSub = subjects.find(s => s.year === newYear && s.semester === newSem) || subjects[0];
                      setMaterialForm({
                        ...materialForm,
                        year: newYear,
                        semester: newSem,
                        subjectId: matchingSub ? matchingSub.id : '',
                        subjectName: matchingSub ? matchingSub.name : ''
                      });
                    }}
                    className="w-full px-3 py-2 bg-slate-800 text-sm text-slate-100 rounded-xl border border-slate-700 focus:outline-none focus:border-brand-500"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Semester</label>
                  <select
                    value={materialForm.semester || 1}
                    onChange={(e) => {
                      const newSem = Number(e.target.value);
                      const matchingSub = subjects.find(s => s.year === (materialForm.year || '1st Year') && s.semester === newSem) || subjects[0];
                      setMaterialForm({
                        ...materialForm,
                        semester: newSem,
                        subjectId: matchingSub ? matchingSub.id : '',
                        subjectName: matchingSub ? matchingSub.name : ''
                      });
                    }}
                    className="w-full px-3 py-2 bg-slate-800 text-sm text-slate-100 rounded-xl border border-slate-700 focus:outline-none focus:border-brand-500"
                  >
                    {(YEAR_SEMESTERS[materialForm.year || '1st Year'] || [1, 2]).map(s => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Subject</label>
                  <select
                    value={materialForm.subjectId}
                    onChange={(e) => {
                      const selectedSub = subjects.find(s => s.id === e.target.value);
                      setMaterialForm({
                        ...materialForm,
                        subjectId: e.target.value,
                        subjectName: selectedSub ? selectedSub.name : materialForm.subjectName
                      });
                    }}
                    className="w-full px-3 py-2 bg-slate-800 text-sm text-slate-100 rounded-xl border border-slate-700 focus:outline-none focus:border-brand-500"
                  >
                    {subjects
                      .filter(s => s.year === (materialForm.year || '1st Year') && s.semester === Number(materialForm.semester || 1))
                      .map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    {subjects.filter(s => s.year === (materialForm.year || '1st Year') && s.semester === Number(materialForm.semester || 1)).length === 0 && (
                      <option value={materialForm.subjectId}>{materialForm.subjectName || 'Select Subject'}</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Material Category</label>
                  <select
                    value={materialForm.category}
                    onChange={(e) => setMaterialForm({ ...materialForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 text-sm text-slate-100 rounded-xl border border-slate-700 focus:outline-none focus:border-brand-500"
                  >
                    {categoriesList.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Relational Algebra Notes & Solved Problems"
                  value={materialForm.title}
                  onChange={(e) => setMaterialForm({ ...materialForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 text-sm text-slate-100 rounded-xl border border-slate-700 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description / Key Topics</label>
                <textarea
                  rows="3"
                  placeholder="Brief summary of what this document covers..."
                  value={materialForm.description}
                  onChange={(e) => setMaterialForm({ ...materialForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 text-sm text-slate-100 rounded-xl border border-slate-700 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">File URL (PDF / PPT)</label>
                  <input
                    type="url"
                    required
                    value={materialForm.fileUrl}
                    onChange={(e) => setMaterialForm({ ...materialForm, fileUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 text-sm text-slate-100 rounded-xl border border-slate-700 focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">File Name</label>
                  <input
                    type="text"
                    value={materialForm.fileName}
                    onChange={(e) => setMaterialForm({ ...materialForm, fileName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 text-sm text-slate-100 rounded-xl border border-slate-700 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>
            </>
          )}

          {/* AI TOOL FORM */}
          {type === 'aitool' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Tool Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cursor AI"
                    value={aiToolForm.name}
                    onChange={(e) => setAiToolForm({ ...aiToolForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 text-sm text-slate-100 rounded-xl border border-slate-700 focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={aiToolForm.category}
                    onChange={(e) => setAiToolForm({ ...aiToolForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 text-sm text-slate-100 rounded-xl border border-slate-700 focus:outline-none focus:border-brand-500"
                  >
                    {aiCategoriesList.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Pricing Model</label>
                  <select
                    value={aiToolForm.pricing}
                    onChange={(e) => setAiToolForm({ ...aiToolForm, pricing: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 text-sm text-slate-100 rounded-xl border border-slate-700 focus:outline-none focus:border-brand-500"
                  >
                    <option value="Free">Free</option>
                    <option value="Freemium">Freemium</option>
                    <option value="Paid">Paid</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Logo / Icon URL</label>
                  <input
                    type="url"
                    value={aiToolForm.logoUrl}
                    onChange={(e) => setAiToolForm({ ...aiToolForm, logoUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 text-sm text-slate-100 rounded-xl border border-slate-700 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Official Website Link</label>
                <input
                  type="url"
                  required
                  value={aiToolForm.websiteUrl}
                  onChange={(e) => setAiToolForm({ ...aiToolForm, websiteUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 text-sm text-slate-100 rounded-xl border border-slate-700 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Short Description</label>
                <textarea
                  rows="3"
                  required
                  placeholder="How does this tool help IT students?"
                  value={aiToolForm.description}
                  onChange={(e) => setAiToolForm({ ...aiToolForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 text-sm text-slate-100 rounded-xl border border-slate-700 focus:outline-none focus:border-brand-500"
                />
              </div>
            </>
          )}

          {/* ANNOUNCEMENT FORM */}
          {type === 'announcement' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mid-Sem Examination Seating Arrangement"
                  value={announcementForm.title}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 text-sm text-slate-100 rounded-xl border border-slate-700 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={announcementForm.category}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 text-sm text-slate-100 rounded-xl border border-slate-700 focus:outline-none focus:border-brand-500"
                  >
                    <option value="Exam Alert">Exam Alert</option>
                    <option value="Events">Events</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Academic">Academic</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Priority Badge</label>
                  <select
                    value={announcementForm.priority}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, priority: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 text-sm text-slate-100 rounded-xl border border-slate-700 focus:outline-none focus:border-brand-500"
                  >
                    <option value="High">High (Red Alert)</option>
                    <option value="Medium">Medium (Amber)</option>
                    <option value="Low">Low (Blue)</option>
                  </select>
                </div>
              </div>

              {/* Pin Announcement Checkbox Toggle */}
              <div className="flex items-center space-x-2 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                <input
                  type="checkbox"
                  id="isPinned"
                  checked={Boolean(announcementForm.isPinned)}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, isPinned: e.target.checked })}
                  className="w-4 h-4 rounded border-amber-500/40 bg-slate-900 text-amber-500 focus:ring-amber-400 cursor-pointer"
                />
                <label htmlFor="isPinned" className="text-xs font-bold text-amber-300 flex items-center space-x-1.5 cursor-pointer">
                  <span>📌 Pin Announcement to Top (Highlights notice for all students)</span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Announcement Details</label>
                <textarea
                  rows="4"
                  required
                  placeholder="Enter complete notice body..."
                  value={announcementForm.description}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 text-sm text-slate-100 rounded-xl border border-slate-700 focus:outline-none focus:border-brand-500"
                />
              </div>

              {/* Attach File (Photo or PDF) */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-300">Attach Document or Image (PDF, PNG, JPG)</label>
                  {announcementForm.attachmentUrl && (
                    <button
                      type="button"
                      onClick={() => setAnnouncementForm(prev => ({ ...prev, attachmentUrl: '', attachmentName: '', attachmentType: '' }))}
                      className="text-[10px] text-rose-400 hover:underline font-semibold"
                    >
                      Remove File
                    </button>
                  )}
                </div>

                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const isPdf = file.type.includes('pdf') || file.name.endsWith('.pdf');
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setAnnouncementForm(prev => ({
                          ...prev,
                          attachmentUrl: reader.result,
                          attachmentName: file.name,
                          attachmentType: isPdf ? 'pdf' : 'image'
                        }));
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-600 file:text-white hover:file:bg-brand-500 cursor-pointer"
                />

                {announcementForm.attachmentName && (
                  <div className="flex items-center space-x-2 text-xs text-emerald-400 font-semibold pt-1">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <span>Attached: {announcementForm.attachmentName} ({announcementForm.attachmentType === 'pdf' ? 'PDF Document' : 'Photo Image'})</span>
                  </div>
                )}
              </div>
            </>
          )}

          {/* TIMETABLE FORM */}
          {type === 'timetable' && (
            <div className="space-y-4">
              
              {/* Timetable Type Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Timetable Type</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'class', label: '1. Class Timetable', icon: Calendar, color: 'border-brand-500 text-brand-300 bg-brand-500/10' },
                    { id: 'internal', label: '2. Internal Exam Schedule', icon: FileText, color: 'border-amber-500 text-amber-300 bg-amber-500/10' },
                    { id: 'semester', label: '3. Semester Exam Schedule', icon: GraduationCap, color: 'border-cyan-500 text-cyan-300 bg-cyan-500/10' }
                  ].map(ttType => (
                    <button
                      key={ttType.id}
                      type="button"
                      onClick={() => setTimetableForm({ ...timetableForm, type: ttType.id })}
                      className={`p-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
                        timetableForm.type === ttType.id
                          ? ttType.color
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                      }`}
                    >
                      <ttType.icon className="w-4 h-4" />
                      <span>{ttType.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Schedule Title / Headline <span className="text-slate-400 font-normal">(Optional - Defaults Automatically)</span>
                  </label>
                  <input
                    type="text"
                    placeholder={
                      timetableForm.type === 'internal'
                        ? 'e.g. Internal 1 Examination Schedule (Default)'
                        : timetableForm.type === 'semester'
                        ? 'e.g. Semester Examination Schedule (Default)'
                        : 'e.g. Official Class Timetable (Default)'
                    }
                    value={timetableForm.title}
                    onChange={(e) => setTimetableForm({ ...timetableForm, title: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 text-sm text-slate-100 rounded-xl border border-slate-700 focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
                  <select
                    value={timetableForm.status || 'active'}
                    onChange={(e) => setTimetableForm({ ...timetableForm, status: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 text-sm text-slate-100 rounded-xl border border-slate-700 focus:outline-none focus:border-brand-500"
                  >
                    <option value="active">● Active (Visible to Students)</option>
                    <option value="archived">📦 Archived (Admin Record)</option>
                  </select>
                </div>
              </div>

              {/* Target Batch Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Year</label>
                  <select
                    value={timetableForm.year}
                    onChange={(e) => {
                      const yr = e.target.value;
                      const defSem = YEAR_SEMESTERS[yr] ? YEAR_SEMESTERS[yr][0] : 1;
                      const defClass = CLASS_SECTIONS_PER_YEAR[yr] ? CLASS_SECTIONS_PER_YEAR[yr][0] : 'IT-3A';
                      setTimetableForm({ ...timetableForm, year: yr, semester: defSem, classSection: defClass });
                    }}
                    className="w-full px-3 py-2 bg-slate-800 text-sm text-slate-100 rounded-xl border border-slate-700 focus:outline-none focus:border-brand-500"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Semester</label>
                  <select
                    value={timetableForm.semester}
                    onChange={(e) => setTimetableForm({ ...timetableForm, semester: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-800 text-sm text-slate-100 rounded-xl border border-slate-700 focus:outline-none focus:border-brand-500"
                  >
                    {(YEAR_SEMESTERS[timetableForm.year] || [1, 2]).map(s => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Class / Section</label>
                  <select
                    value={timetableForm.classSection}
                    onChange={(e) => setTimetableForm({ ...timetableForm, classSection: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 text-sm text-slate-100 rounded-xl border border-slate-700 focus:outline-none focus:border-brand-500"
                  >
                    {(CLASS_SECTIONS_PER_YEAR[timetableForm.year] || ['IT-3A', 'IT-3B', 'IT-3C']).map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {timetableForm.type === 'internal' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Internal Test</label>
                    <select
                      value={timetableForm.internalName || 'Internal 1'}
                      onChange={(e) => setTimetableForm({ ...timetableForm, internalName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-800 text-sm text-slate-100 rounded-xl border border-slate-700 focus:outline-none focus:border-brand-500"
                    >
                      <option value="Internal 1">Internal 1 (CIA-1)</option>
                      <option value="Internal 2">Internal 2 (CIA-2)</option>
                    </select>
                  </div>
                )}
              </div>

              {/* DYNAMIC EXAM SUBJECTS EDITOR FOR INTERNAL & SEMESTER TIMETABLES */}
              {(timetableForm.type === 'internal' || timetableForm.type === 'semester') && (
                <div className="space-y-3 pt-3 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center space-x-1.5">
                        <FileText className="w-4 h-4 text-brand-400" />
                        <span>Exam Subject Schedule Entries ({timetableForm.examEntries?.length || 0})</span>
                      </h4>
                      <p className="text-[11px] text-slate-400">Add subject exam dates, times, halls, and sessions below.</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const newEntry = {
                          id: `e-${Date.now()}`,
                          subject: '',
                          subjectCode: '',
                          examDate: new Date().toISOString().split('T')[0],
                          day: 'Wednesday',
                          startTime: timetableForm.type === 'semester' ? '09:30 AM' : '09:30 AM',
                          endTime: timetableForm.type === 'semester' ? '12:30 PM' : '11:00 AM',
                          session: 'FN',
                          hall: 'MBIII ANX301',
                          syllabus: ''
                        };
                        setTimetableForm(prev => ({
                          ...prev,
                          examEntries: [...(prev.examEntries || []), newEntry]
                        }));
                      }}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white flex items-center space-x-1 shadow"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Add Subject Exam</span>
                    </button>
                  </div>

                  <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                    {(timetableForm.examEntries || []).map((entry, idx) => (
                      <div key={entry.id || idx} className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Exam #{idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setTimetableForm(prev => ({
                                ...prev,
                                examEntries: prev.examEntries.filter(e => e.id !== entry.id)
                              }));
                            }}
                            className="p-1 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded"
                            title="Remove exam entry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                          <div className="sm:col-span-2 space-y-1">
                            {/* Quick Select from Admin Semester Subject Catalog */}
                            {(() => {
                              const semSubs = (subjects || []).filter(s => Number(s.semester) === Number(timetableForm.semester));
                              if (semSubs.length > 0) {
                                return (
                                  <select
                                    onChange={(e) => {
                                      const pickedSub = semSubs.find(s => s.id === e.target.value);
                                      if (pickedSub) {
                                        setTimetableForm(prev => ({
                                          ...prev,
                                          examEntries: prev.examEntries.map(item => item.id === entry.id ? { 
                                            ...item, 
                                            subject: pickedSub.name, 
                                            subjectCode: pickedSub.code || item.subjectCode 
                                          } : item)
                                        }));
                                      }
                                    }}
                                    className="w-full px-2 py-1 bg-slate-950 text-[11px] text-brand-300 rounded border border-brand-500/30 focus:outline-none"
                                  >
                                    <option value="">-- Quick Pick Subject (Sem {timetableForm.semester}) --</option>
                                    {semSubs.map(s => (
                                      <option key={s.id} value={s.id}>
                                        {s.code ? `[${s.code}] ` : ''}{s.name}
                                      </option>
                                    ))}
                                  </select>
                                );
                              }
                              return null;
                            })()}

                            <input
                              type="text"
                              required
                              placeholder="Subject Name (e.g. Full Stack Web Development)"
                              value={entry.subject}
                              onChange={(e) => {
                                const val = e.target.value;
                                setTimetableForm(prev => ({
                                  ...prev,
                                  examEntries: prev.examEntries.map(item => item.id === entry.id ? { ...item, subject: val } : item)
                                }));
                              }}
                              className="w-full px-2.5 py-1.5 bg-slate-900 text-xs text-white rounded-lg border border-slate-700 focus:outline-none focus:border-brand-500"
                            />
                          </div>

                          <div>
                            <input
                              type="text"
                              placeholder="Code (e.g. CS8591)"
                              value={entry.subjectCode || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setTimetableForm(prev => ({
                                  ...prev,
                                  examEntries: prev.examEntries.map(item => item.id === entry.id ? { ...item, subjectCode: val } : item)
                                }));
                              }}
                              className="w-full px-2.5 py-1.5 bg-slate-900 text-xs text-white rounded-lg border border-slate-700 focus:outline-none focus:border-brand-500"
                            />
                          </div>

                          <div>
                            <input
                              type="date"
                              required
                              value={entry.examDate || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                const dateObj = new Date(val);
                                const dayName = isNaN(dateObj) ? 'Monday' : dateObj.toLocaleDateString('en-US', { weekday: 'long' });
                                setTimetableForm(prev => ({
                                  ...prev,
                                  examEntries: prev.examEntries.map(item => item.id === entry.id ? { ...item, examDate: val, day: dayName } : item)
                                }));
                              }}
                              className="w-full px-2.5 py-1.5 bg-slate-900 text-xs text-white rounded-lg border border-slate-700 focus:outline-none focus:border-brand-500"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          <div>
                            <label className="block text-[10px] text-slate-400">Start Time</label>
                            <input
                              type="text"
                              placeholder="e.g. 09:30 AM"
                              value={entry.startTime || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setTimetableForm(prev => ({
                                  ...prev,
                                  examEntries: prev.examEntries.map(item => item.id === entry.id ? { ...item, startTime: val } : item)
                                }));
                              }}
                              className="w-full px-2.5 py-1 bg-slate-900 text-xs text-white rounded-lg border border-slate-700"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] text-slate-400">End Time</label>
                            <input
                              type="text"
                              placeholder="e.g. 12:30 PM"
                              value={entry.endTime || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setTimetableForm(prev => ({
                                  ...prev,
                                  examEntries: prev.examEntries.map(item => item.id === entry.id ? { ...item, endTime: val } : item)
                                }));
                              }}
                              className="w-full px-2.5 py-1 bg-slate-900 text-xs text-white rounded-lg border border-slate-700"
                            />
                          </div>

                          {timetableForm.type === 'semester' ? (
                            <div>
                              <label className="block text-[10px] text-slate-400">Session</label>
                              <select
                                value={entry.session || 'FN'}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setTimetableForm(prev => ({
                                    ...prev,
                                    examEntries: prev.examEntries.map(item => item.id === entry.id ? { ...item, session: val } : item)
                                  }));
                                }}
                                className="w-full px-2.5 py-1 bg-slate-900 text-xs text-white rounded-lg border border-slate-700"
                              >
                                <option value="FN">FN (Forenoon)</option>
                                <option value="AN">AN (Afternoon)</option>
                              </select>
                            </div>
                          ) : (
                            <div>
                              <label className="block text-[10px] text-slate-400">Exam Hall</label>
                              <input
                                type="text"
                                placeholder="e.g. MBIII ANX301"
                                value={entry.hall || ''}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setTimetableForm(prev => ({
                                    ...prev,
                                    examEntries: prev.examEntries.map(item => item.id === entry.id ? { ...item, hall: val } : item)
                                  }));
                                }}
                                className="w-full px-2.5 py-1 bg-slate-900 text-xs text-white rounded-lg border border-slate-700"
                              />
                            </div>
                          )}

                          <div>
                            <label className="block text-[10px] text-slate-400">
                              {timetableForm.type === 'semester' ? 'Day' : 'Syllabus Scope'}
                            </label>
                            <input
                              type="text"
                              placeholder={timetableForm.type === 'semester' ? 'e.g. Wednesday' : 'e.g. Units I & II'}
                              value={timetableForm.type === 'semester' ? entry.day : (entry.syllabus || '')}
                              onChange={(e) => {
                                const val = e.target.value;
                                setTimetableForm(prev => ({
                                  ...prev,
                                  examEntries: prev.examEntries.map(item => item.id === entry.id ? { ...item, [timetableForm.type === 'semester' ? 'day' : 'syllabus']: val } : item)
                                }));
                              }}
                              className="w-full px-2.5 py-1 bg-slate-900 text-xs text-white rounded-lg border border-slate-700"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-xs text-emerald-400">
                ✓ Active timetables will automatically be displayed to students in {timetableForm.year}, Semester {timetableForm.semester}, Section {timetableForm.classSection}.
              </p>
            </div>
          )}

          {/* COMPANY FORM */}
          {type === 'company' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Google / Amazon / TCS Digital"
                  value={companyForm.companyName}
                  onChange={(e) => setCompanyForm({ ...companyForm, companyName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 text-sm text-slate-100 rounded-xl border border-slate-700 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">CGPA Cutoff</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    required
                    placeholder="e.g. 7.5"
                    value={companyForm.cgpaCutoff}
                    onChange={(e) => setCompanyForm({ ...companyForm, cgpaCutoff: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-800 text-sm text-slate-100 rounded-xl border border-slate-700 focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Drive Date</label>
                  <input
                    type="date"
                    required
                    value={companyForm.driveDate}
                    onChange={(e) => setCompanyForm({ ...companyForm, driveDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 text-sm text-slate-100 rounded-xl border border-slate-700 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Eligibility Criteria</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. B.Tech IT / CSE with no active backlogs"
                  value={companyForm.eligibilityCriteria}
                  onChange={(e) => setCompanyForm({ ...companyForm, eligibilityCriteria: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 text-sm text-slate-100 rounded-xl border border-slate-700 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Drive Description & Roles</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Job role, package details, and test process..."
                  value={companyForm.description}
                  onChange={(e) => setCompanyForm({ ...companyForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 text-sm text-slate-100 rounded-xl border border-slate-700 focus:outline-none focus:border-brand-500"
                />
              </div>
            </>
          )}

          {/* EVENT FORM */}
          {type === 'event' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Event / Hackathon Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Smart India Hackathon 2026"
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 text-sm text-slate-100 rounded-xl border border-slate-700 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Event Type</label>
                  <select
                    value={eventForm.type}
                    onChange={(e) => setEventForm({ ...eventForm, type: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 text-sm text-slate-100 rounded-xl border border-slate-700 focus:outline-none focus:border-brand-500"
                  >
                    <option value="Hackathon">Hackathon</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Competition">Competition</option>
                    <option value="Seminar">Seminar</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Event Level</label>
                  <select
                    value={eventForm.level}
                    onChange={(e) => setEventForm({ ...eventForm, level: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 text-sm text-slate-100 rounded-xl border border-slate-700 focus:outline-none focus:border-brand-500"
                  >
                    <option value="Internal">Internal Department</option>
                    <option value="National">National Level</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Organizer</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AWS & IT Club"
                    value={eventForm.organizer}
                    onChange={(e) => setEventForm({ ...eventForm, organizer: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 text-sm text-slate-100 rounded-xl border border-slate-700 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={eventForm.startDate}
                    onChange={(e) => setEventForm({ ...eventForm, startDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 text-sm text-slate-100 rounded-xl border border-slate-700 focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={eventForm.endDate}
                    onChange={(e) => setEventForm({ ...eventForm, endDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 text-sm text-slate-100 rounded-xl border border-slate-700 focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Registration Deadline</label>
                  <input
                    type="date"
                    required
                    value={eventForm.registrationDeadline}
                    onChange={(e) => setEventForm({ ...eventForm, registrationDeadline: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 text-sm text-slate-100 rounded-xl border border-slate-700 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Prize / Perk Details</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 🏆 $3,000 Cash Prize"
                    value={eventForm.prizeDetails}
                    onChange={(e) => setEventForm({ ...eventForm, prizeDetails: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 text-sm text-slate-100 rounded-xl border border-slate-700 focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Registration Link URL</label>
                  <input
                    type="text"
                    required
                    placeholder="https://"
                    value={eventForm.registrationLink}
                    onChange={(e) => setEventForm({ ...eventForm, registrationLink: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 text-sm text-slate-100 rounded-xl border border-slate-700 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Event Description & Rules</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detailed schedule, problem statements, and rules..."
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 text-sm text-slate-100 rounded-xl border border-slate-700 focus:outline-none focus:border-brand-500"
                />
              </div>
            </>
          )}

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-800 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center space-x-2 px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save Record</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
