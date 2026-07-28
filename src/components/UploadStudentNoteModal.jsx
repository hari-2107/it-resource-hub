import React, { useState } from 'react';
import { X, Upload, BookOpen, CheckCircle2, FileText, AlertCircle, File, Image as ImageIcon } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { YEAR_SEMESTERS } from '../data/mockData';

export const UploadStudentNoteModal = ({ onClose }) => {
  const { subjects, addStudentNote } = useData();
  const { currentUser } = useAuth();

  const [year, setYear] = useState(currentUser?.year || '3rd Year');
  const availableSems = YEAR_SEMESTERS[year] || [5, 6];
  const [semester, setSemester] = useState(currentUser?.semester || availableSems[0]);

  // Filter subjects based on selected Year & Semester
  const filteredSubjects = (subjects || []).filter(
    s => s.year === year && Number(s.semester) === Number(semester)
  );

  const [subjectId, setSubjectId] = useState(filteredSubjects[0]?.id || 'custom');
  const [customSubjectName, setCustomSubjectName] = useState('');
  const [title, setTitle] = useState('');
  const [category] = useState('Student Notes');
  const [description, setDescription] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [fileType, setFileType] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleYearChange = (newYear) => {
    setYear(newYear);
    const newSems = YEAR_SEMESTERS[newYear] || [1, 2];
    const newSem = newSems[0];
    setSemester(newSem);
    
    const matching = (subjects || []).filter(s => s.year === newYear && Number(s.semester) === Number(newSem));
    setSubjectId(matching[0]?.id || 'custom');
  };

  const handleSemesterChange = (newSem) => {
    const semNum = Number(newSem);
    setSemester(semNum);
    const matching = (subjects || []).filter(s => s.year === year && Number(s.semester) === semNum);
    setSubjectId(matching[0]?.id || 'custom');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      const ext = file.name.split('.').pop().toLowerCase();
      setFileType(ext);

      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      setFileSize(file.size > 1024 * 1024 ? `${sizeMb} MB` : `${Math.round(file.size / 1024)} KB`);

      const reader = new FileReader();
      reader.onload = (event) => {
        setFileUrl(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const selSub = subjects.find(s => s.id === subjectId);
    const finalSubName = selSub ? selSub.name : (customSubjectName.trim() || 'General IT Notes');

    addStudentNote({
      title,
      subjectId: selSub ? selSub.id : `custom-${Date.now()}`,
      subjectName: finalSubName,
      year,
      semester: Number(semester),
      category,
      description,
      fileUrl: fileUrl || 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf',
      fileName: fileName || 'Student_Note_Attachment',
      fileSize: fileSize || '1.5 MB',
      fileType: fileType || 'doc',
      downloadCount: 0,
      viewCount: 1,
      viewedBy: [currentUser?.name || 'Student']
    });

    setIsSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="glass-panel w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-950 p-6 space-y-6 relative max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white">Share Peer Notes</h2>
              <p className="text-xs text-slate-400">Contribute study materials & notes for your batchmates</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSubmitted ? (
          <div className="p-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
            <h3 className="text-base font-bold text-white">Notes Submitted for Review!</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Your notes have been sent to department admins for verification. Once approved, your contribution will display in the Materials Library under <strong>{year}, Semester {semester}</strong> with a <strong>Student-Contributed</strong> badge.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            
            {/* Title */}
            <div>
              <label className="block font-bold text-slate-300 mb-1">Notes Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Unit 3 DBMS Normalization Handwritten Notes"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 text-slate-100 rounded-xl border border-slate-800 focus:outline-none focus:border-brand-500"
              />
            </div>

            {/* Academic Year & Semester Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Academic Year *</label>
                <select
                  value={year}
                  onChange={(e) => handleYearChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 text-slate-100 rounded-xl border border-slate-800 focus:outline-none focus:border-brand-500"
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Semester *</label>
                <select
                  value={semester}
                  onChange={(e) => handleSemesterChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 text-slate-100 rounded-xl border border-slate-800 focus:outline-none focus:border-brand-500"
                >
                  {(YEAR_SEMESTERS[year] || [1, 2]).map(s => (
                    <option key={s} value={s}>Semester {s}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Target Subject Selection */}
            <div>
              <label className="block font-bold text-slate-300 mb-1">Target Subject *</label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 text-slate-100 rounded-xl border border-slate-800 focus:outline-none focus:border-brand-500"
              >
                {filteredSubjects.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.code || 'IT'})</option>
                ))}
                <option value="custom">✍ Custom / Other Subject Name</option>
              </select>
            </div>

            {subjectId === 'custom' && (
              <div>
                <label className="block font-bold text-slate-300 mb-1">Enter Custom Subject Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Artificial Intelligence & Expert Systems"
                  value={customSubjectName}
                  onChange={(e) => setCustomSubjectName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 text-slate-100 rounded-xl border border-slate-800 focus:outline-none focus:border-brand-500"
                />
              </div>
            )}

            {/* Description */}
            <div>
              <label className="block font-bold text-slate-300 mb-1">Brief Description *</label>
              <textarea
                rows={2}
                required
                placeholder="Describe what key topics, formulas, or solved questions are included..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 text-slate-100 rounded-xl border border-slate-800 focus:outline-none focus:border-brand-500"
              />
            </div>

            {/* Universal File Upload Box (Any File Type) */}
            <div>
              <label className="block font-bold text-slate-300 mb-1">Upload Study File (PDF, DOCX, PPT, TXT, ZIP, Images, etc.)</label>
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-dashed border-slate-700 text-center space-y-2 relative hover:border-purple-500/50 transition-colors">
                <input
                  type="file"
                  accept="*/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip,.rar,image/*"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                
                {['png', 'jpg', 'jpeg', 'svg', 'webp'].includes(fileType) ? (
                  <ImageIcon className="w-8 h-8 text-emerald-400 mx-auto" />
                ) : (
                  <FileText className="w-8 h-8 text-purple-400 mx-auto" />
                )}

                <div>
                  {fileName ? (
                    <>
                      <p className="font-bold text-white text-xs flex items-center justify-center space-x-1.5">
                        <span>{fileName}</span>
                        {fileType && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] uppercase font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            .{fileType}
                          </span>
                        )}
                      </p>
                      <p className="text-[10px] text-emerald-400 font-semibold">{fileSize} • File attached ready for upload (Click to replace)</p>
                    </>
                  ) : (
                    <>
                      <p className="font-bold text-slate-200 text-xs">Click or drag any file to upload</p>
                      <p className="text-[10px] text-slate-400">Supports PDF, Word Documents, PowerPoint, Spreadsheets, ZIP archives, Text files & Images</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Notice Banner */}
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start space-x-2 text-[11px] text-amber-300">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>All student uploads undergo admin verification to ensure syllabus accuracy and content quality before publishing.</span>
            </div>

            {/* Submit Button */}
            <div className="pt-3 border-t border-slate-800 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/30 flex items-center space-x-2"
              >
                <Upload className="w-4 h-4" />
                <span>Upload & Submit Notes</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
