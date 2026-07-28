import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { 
  FileText, 
  Download, 
  Save, 
  Trash2, 
  Plus, 
  Sparkles, 
  Layout, 
  User, 
  Mail, 
  Phone, 
  Globe, 
  GraduationCap, 
  Code, 
  FolderGit2, 
  Award, 
  CheckCircle2,
  FolderOpen
} from 'lucide-react';

export const ResumeBuilderPage = () => {
  const { currentUser } = useAuth();
  const { userResumes, saveResume, deleteResume } = useData();

  const previewRef = useRef(null);

  // Template State ('classic' | 'modern')
  const [template, setTemplate] = useState('modern');

  // Resume Form State
  const [resumeData, setResumeData] = useState({
    id: `res-${Date.now()}`,
    title: 'My Engineering Resume',
    fullName: currentUser?.name || 'Alex Morgan',
    email: currentUser?.email || 'alex.morgan@it.edu',
    phone: '+1 (555) 019-2834',
    location: 'San Francisco, CA',
    githubUrl: 'github.com/alexmorgan',
    linkedinUrl: 'linkedin.com/in/alexmorgan',
    summary: 'Proactive Information Technology student specializing in Full Stack Development, Cloud Systems, and Database Management. Experienced in building responsive web applications and REST APIs.',
    education: [
      {
        institution: 'Institute of Technology & Science',
        degree: 'B.Tech in Information Technology',
        yearSem: `${currentUser?.year || '3rd Year'} • Semester ${currentUser?.semester || 5}`,
        cgpa: '8.8 / 10.0',
        duration: '2023 - 2027'
      }
    ],
    skills: ['JavaScript', 'React.js', 'Node.js', 'Python', 'SQL', 'DBMS', 'Git', 'Tailwind CSS', 'Docker'],
    skillInput: '',
    projects: [
      {
        title: 'IT Resource & Study Hub',
        description: 'Full-stack departmental web app built with React & Tailwind for downloading materials, tracking internal marks, and analyzing AI study tools.',
        link: 'github.com/alexmorgan/resource-hub'
      },
      {
        title: 'Real-time IoT Sensor Dashboard',
        description: 'Designed MQTT broker pipeline visualizing ambient room temperature & telemetry graphs with Recharts.',
        link: 'github.com/alexmorgan/iot-dashboard'
      }
    ],
    certifications: [
      'AWS Certified Cloud Practitioner (2025)',
      'Meta Front-End Developer Professional Certificate (Coursera)'
    ],
    achievements: [
      'Finalist in Smart India Hackathon 2026',
      'Class Representative for 3rd Year IT-A Section'
    ]
  });

  const [selectedResumeId, setSelectedResumeId] = useState('');

  // Auto-fill from selected saved version
  const handleLoadResume = (resId) => {
    setSelectedResumeId(resId);
    const found = userResumes.find(r => r.id === resId);
    if (found) {
      setResumeData(found);
    }
  };

  const handleSaveCurrentResume = () => {
    saveResume(resumeData);
    alert(`Resume "${resumeData.title}" saved successfully!`);
  };

  const handleDeleteCurrentResume = (resId) => {
    if (window.confirm('Are you sure you want to delete this saved resume version?')) {
      deleteResume(resId);
      setSelectedResumeId('');
    }
  };

  // Add Skill Tag
  const handleAddSkill = (e) => {
    if (e.key === 'Enter' && resumeData.skillInput.trim()) {
      e.preventDefault();
      if (!resumeData.skills.includes(resumeData.skillInput.trim())) {
        setResumeData({
          ...resumeData,
          skills: [...resumeData.skills, resumeData.skillInput.trim()],
          skillInput: ''
        });
      }
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setResumeData({
      ...resumeData,
      skills: resumeData.skills.filter(s => s !== skillToRemove)
    });
  };

  // Add Project
  const handleAddProject = () => {
    setResumeData({
      ...resumeData,
      projects: [
        ...resumeData.projects,
        { title: 'New Technical Project', description: 'Brief summary of technologies used and impact.', link: '' }
      ]
    });
  };

  const handleRemoveProject = (idx) => {
    setResumeData({
      ...resumeData,
      projects: resumeData.projects.filter((_, i) => i !== idx)
    });
  };

  // PDF Export via Print Window styling
  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Printable CSS Rules */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #resume-preview-panel, #resume-preview-panel * {
            visibility: visible;
          }
          #resume-preview-panel {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            color: black !important;
            border: none !important;
            box-shadow: none !important;
          }
        }
      `}</style>

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-400 border border-brand-500/30 mb-2">
            <FileText className="w-3.5 h-3.5" />
            <span>Interactive Resume Builder</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Student Resume Builder</h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Craft a professional engineering resume with live side-by-side preview and one-click PDF export.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
          
          {/* Template Selector */}
          <div className="flex items-center space-x-1 p-1 bg-slate-900 rounded-2xl border border-slate-800">
            <button
              onClick={() => setTemplate('modern')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                template === 'modern' ? 'bg-brand-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Modern Indigo
            </button>
            <button
              onClick={() => setTemplate('classic')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                template === 'classic' ? 'bg-brand-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Classic Corporate
            </button>
          </div>

          <button
            onClick={handleSaveCurrentResume}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl font-bold text-xs bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 shadow-md"
          >
            <Save className="w-4 h-4 text-emerald-400" />
            <span>Save Version</span>
          </button>

          <button
            onClick={handleExportPDF}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export as PDF</span>
          </button>
        </div>
      </div>

      {/* Saved Versions Selector Bar */}
      {userResumes.length > 0 && (
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <FolderOpen className="w-4 h-4 text-brand-400" />
            <span className="font-bold text-white">Your Saved Resumes:</span>
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={selectedResumeId}
              onChange={(e) => handleLoadResume(e.target.value)}
              className="px-3 py-1.5 bg-slate-950 text-slate-100 font-semibold rounded-xl border border-slate-800 focus:outline-none"
            >
              <option value="" disabled>-- Load Saved Version --</option>
              {userResumes.map(r => (
                <option key={r.id} value={r.id}>{r.title} ({new Date(r.updatedAt).toLocaleDateString()})</option>
              ))}
            </select>

            {selectedResumeId && (
              <button
                onClick={() => handleDeleteCurrentResume(selectedResumeId)}
                className="p-1.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30"
                title="Delete Version"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* MAIN TWO-COLUMN SPLIT: FORM VS LIVE PREVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: RESUME FORM (7 cols) */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Version Title */}
          <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-3">
            <label className="block text-xs font-bold text-slate-300">Resume Name / Document Title</label>
            <input
              type="text"
              value={resumeData.title}
              onChange={(e) => setResumeData({ ...resumeData, title: e.target.value })}
              className="w-full px-3.5 py-2 bg-slate-900 text-xs font-bold text-white rounded-xl border border-slate-800 focus:outline-none focus:border-brand-500"
            />
          </div>

          {/* Personal Info */}
          <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <User className="w-4 h-4 text-brand-400" />
              <span>Personal Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  value={resumeData.fullName}
                  onChange={(e) => setResumeData({ ...resumeData, fullName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 text-slate-100 rounded-xl border border-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 mb-1">Email Address</label>
                <input
                  type="email"
                  value={resumeData.email}
                  onChange={(e) => setResumeData({ ...resumeData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 text-slate-100 rounded-xl border border-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={resumeData.phone}
                  onChange={(e) => setResumeData({ ...resumeData, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 text-slate-100 rounded-xl border border-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 mb-1">Location</label>
                <input
                  type="text"
                  value={resumeData.location}
                  onChange={(e) => setResumeData({ ...resumeData, location: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 text-slate-100 rounded-xl border border-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 mb-1">GitHub Profile Link</label>
                <input
                  type="text"
                  value={resumeData.githubUrl}
                  onChange={(e) => setResumeData({ ...resumeData, githubUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 text-slate-100 rounded-xl border border-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 mb-1">LinkedIn Profile Link</label>
                <input
                  type="text"
                  value={resumeData.linkedinUrl}
                  onChange={(e) => setResumeData({ ...resumeData, linkedinUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 text-slate-100 rounded-xl border border-slate-800 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Professional Summary */}
          <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Professional Summary</span>
            </h3>
            <textarea
              rows={3}
              value={resumeData.summary}
              onChange={(e) => setResumeData({ ...resumeData, summary: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-900 text-xs text-slate-200 rounded-xl border border-slate-800 focus:outline-none focus:border-brand-500 leading-relaxed"
            />
          </div>

          {/* Skills Tag Input */}
          <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Code className="w-4 h-4 text-indigo-400" />
              <span>Technical Skills (Press Enter to Add Tag)</span>
            </h3>

            <input
              type="text"
              placeholder="Type a skill (e.g. React, SQL, Python) & press Enter..."
              value={resumeData.skillInput}
              onChange={(e) => setResumeData({ ...resumeData, skillInput: e.target.value })}
              onKeyDown={handleAddSkill}
              className="w-full px-3.5 py-2 bg-slate-900 text-xs text-white rounded-xl border border-slate-800 focus:outline-none focus:border-brand-500"
            />

            <div className="flex flex-wrap gap-1.5 pt-2">
              {resumeData.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/40 flex items-center space-x-1"
                >
                  <span>{skill}</span>
                  <button
                    onClick={() => handleRemoveSkill(skill)}
                    className="hover:text-rose-400 ml-1 font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Projects */}
          <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <FolderGit2 className="w-4 h-4 text-emerald-400" />
                <span>Technical Projects</span>
              </h3>
              <button
                onClick={handleAddProject}
                className="px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-900 text-brand-300 border border-slate-800 flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Project</span>
              </button>
            </div>

            {resumeData.projects.map((proj, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2 text-xs relative">
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    placeholder="Project Title"
                    value={proj.title}
                    onChange={(e) => {
                      const updated = [...resumeData.projects];
                      updated[idx].title = e.target.value;
                      setResumeData({ ...resumeData, projects: updated });
                    }}
                    className="px-3 py-1 bg-slate-950 text-xs font-bold text-white rounded-lg border border-slate-800 w-3/4"
                  />
                  <button
                    onClick={() => handleRemoveProject(idx)}
                    className="text-rose-400 hover:text-rose-300 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <textarea
                  rows={2}
                  placeholder="Project description & achievements..."
                  value={proj.description}
                  onChange={(e) => {
                    const updated = [...resumeData.projects];
                    updated[idx].description = e.target.value;
                    setResumeData({ ...resumeData, projects: updated });
                  }}
                  className="w-full px-3 py-1.5 bg-slate-950 text-xs text-slate-200 rounded-lg border border-slate-800"
                />

                <input
                  type="text"
                  placeholder="GitHub / Live Demo Link"
                  value={proj.link}
                  onChange={(e) => {
                    const updated = [...resumeData.projects];
                    updated[idx].link = e.target.value;
                    setResumeData({ ...resumeData, projects: updated });
                  }}
                  className="w-full px-3 py-1 bg-slate-950 text-[11px] text-brand-300 rounded-lg border border-slate-800"
                />
              </div>
            ))}
          </div>

        </div>

        {/* RIGHT COLUMN: LIVE PREVIEW PANEL (6 cols) */}
        <div className="lg:col-span-6 sticky top-24 self-start">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center">
                <Layout className="w-4 h-4 mr-1.5 text-brand-400" /> Live Resume Preview ({template.toUpperCase()})
              </span>
              <span className="text-[10px] text-slate-500 font-semibold">Updates in real time</span>
            </div>

            {/* PREVIEW CONTAINER (Styled to look like A4 paper) */}
            <div
              id="resume-preview-panel"
              ref={previewRef}
              className={`w-full rounded-2xl shadow-2xl overflow-hidden text-slate-900 transition-all ${
                template === 'modern' ? 'bg-slate-50 border border-slate-300' : 'bg-white border border-slate-300 font-serif'
              }`}
              style={{ minHeight: '650px', padding: '32px' }}
            >
              {template === 'modern' ? (
                /* MODERN INDIGO TEMPLATE */
                <div className="space-y-5 text-xs text-slate-800">
                  {/* Modern Header */}
                  <div className="border-b-2 border-indigo-600 pb-4">
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{resumeData.fullName}</h1>
                    <p className="text-indigo-600 font-bold text-xs uppercase tracking-wider mt-0.5">
                      {resumeData.education[0]?.degree || 'Information Technology Engineer'}
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-600 mt-2 font-medium">
                      <span>✉ {resumeData.email}</span>
                      <span>📞 {resumeData.phone}</span>
                      <span>📍 {resumeData.location}</span>
                      {resumeData.githubUrl && <span>🔗 {resumeData.githubUrl}</span>}
                    </div>
                  </div>

                  {/* Summary */}
                  {resumeData.summary && (
                    <div className="space-y-1">
                      <h2 className="text-[11px] font-black uppercase tracking-wider text-indigo-700 border-b border-indigo-100 pb-0.5">
                        Professional Profile
                      </h2>
                      <p className="text-slate-700 leading-relaxed text-[11px]">{resumeData.summary}</p>
                    </div>
                  )}

                  {/* Education */}
                  <div className="space-y-1.5">
                    <h2 className="text-[11px] font-black uppercase tracking-wider text-indigo-700 border-b border-indigo-100 pb-0.5">
                      Education
                    </h2>
                    {resumeData.education.map((edu, i) => (
                      <div key={i} className="flex justify-between items-start">
                        <div>
                          <strong className="text-slate-900 block text-xs">{edu.institution}</strong>
                          <span className="text-[11px] text-slate-700">{edu.degree} ({edu.yearSem})</span>
                        </div>
                        <div className="text-right text-[11px]">
                          <span className="font-bold text-indigo-600">{edu.cgpa}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Skills */}
                  <div className="space-y-1.5">
                    <h2 className="text-[11px] font-black uppercase tracking-wider text-indigo-700 border-b border-indigo-100 pb-0.5">
                      Technical Skills
                    </h2>
                    <div className="flex flex-wrap gap-1">
                      {resumeData.skills.map((s, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-900 font-semibold text-[10px] border border-indigo-200">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Projects */}
                  <div className="space-y-2">
                    <h2 className="text-[11px] font-black uppercase tracking-wider text-indigo-700 border-b border-indigo-100 pb-0.5">
                      Key Technical Projects
                    </h2>
                    {resumeData.projects.map((p, i) => (
                      <div key={i} className="space-y-0.5">
                        <div className="flex justify-between items-baseline">
                          <strong className="text-slate-900 text-xs">{p.title}</strong>
                          {p.link && <span className="text-[10px] text-indigo-600 font-semibold">{p.link}</span>}
                        </div>
                        <p className="text-slate-700 text-[11px] leading-relaxed">{p.description}</p>
                      </div>
                    ))}
                  </div>

                  {/* Certifications & Achievements */}
                  <div className="grid grid-cols-2 gap-4 pt-1">
                    <div className="space-y-1">
                      <h2 className="text-[10px] font-black uppercase tracking-wider text-indigo-700 border-b border-indigo-100 pb-0.5">
                        Certifications
                      </h2>
                      <ul className="list-disc list-inside text-[10px] text-slate-700 space-y-0.5">
                        {resumeData.certifications.map((c, i) => <li key={i}>{c}</li>)}
                      </ul>
                    </div>

                    <div className="space-y-1">
                      <h2 className="text-[10px] font-black uppercase tracking-wider text-indigo-700 border-b border-indigo-100 pb-0.5">
                        Achievements
                      </h2>
                      <ul className="list-disc list-inside text-[10px] text-slate-700 space-y-0.5">
                        {resumeData.achievements.map((a, i) => <li key={i}>{a}</li>)}
                      </ul>
                    </div>
                  </div>

                </div>
              ) : (
                /* CLASSIC CORPORATE TEMPLATE */
                <div className="space-y-4 text-xs text-slate-900 font-serif">
                  <div className="text-center border-b border-slate-400 pb-3 space-y-1">
                    <h1 className="text-2xl font-bold uppercase tracking-wide">{resumeData.fullName}</h1>
                    <p className="text-[11px] text-slate-700 italic">
                      {resumeData.email} | {resumeData.phone} | {resumeData.location} | {resumeData.githubUrl}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <h2 className="text-xs font-bold uppercase border-b border-slate-400 pb-0.5">SUMMARY</h2>
                    <p className="text-[11px] leading-relaxed text-slate-800">{resumeData.summary}</p>
                  </div>

                  <div className="space-y-1">
                    <h2 className="text-xs font-bold uppercase border-b border-slate-400 pb-0.5">EDUCATION</h2>
                    {resumeData.education.map((e, i) => (
                      <div key={i} className="flex justify-between text-[11px]">
                        <div>
                          <strong>{e.institution}</strong> - {e.degree}
                        </div>
                        <span>CGPA: {e.cgpa}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-1">
                    <h2 className="text-xs font-bold uppercase border-b border-slate-400 pb-0.5">TECHNICAL SKILLS</h2>
                    <p className="text-[11px] leading-relaxed">{resumeData.skills.join(', ')}</p>
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-xs font-bold uppercase border-b border-slate-400 pb-0.5">PROJECTS</h2>
                    {resumeData.projects.map((p, i) => (
                      <div key={i} className="space-y-0.5 text-[11px]">
                        <strong>{p.title}</strong> - {p.description} ({p.link})
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
