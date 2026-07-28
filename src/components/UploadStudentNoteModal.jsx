import React, { useState } from 'react';
import { X, Upload, BookOpen, CheckCircle2, FileText, AlertCircle } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';

export const UploadStudentNoteModal = ({ onClose }) => {
  const { subjects, addStudentNote } = useData();
  const { currentUser } = useAuth();

  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [year, setYear] = useState('3rd Year');
  const [semester, setSemester] = useState(5);
  const [category] = useState('Student Notes');
  const [description, setDescription] = useState('');
  const [fileUrl, setFileUrl] = useState('https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf');
  const [fileName, setFileName] = useState('Peer_Notes_Handwritten.pdf');
  const [fileSize, setFileSize] = useState('2.8 MB');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubjectChange = (id) => {
    setSubjectId(id);
    const sel = subjects.find(s => s.id === id);
    if (sel) {
      setYear(sel.year);
      setSemester(sel.semester);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      setFileSize(`${sizeMb} MB`);
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
    addStudentNote({
      title,
      subjectId,
      subjectName: selSub ? selSub.name : 'General IT',
      year,
      semester,
      category,
      description,
      fileUrl,
      fileName,
      fileSize,
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
              Your notes have been sent to department admins for verification. Once approved, your contribution will display in the Materials Library with a <strong>Student-Contributed</strong> badge.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            
            {/* Title */}
            <div>
              <label className="block font-bold text-slate-300 mb-1">Notes Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Unit 3 DBMS Normalization Handwritten Notes"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 text-slate-100 rounded-xl border border-slate-800 focus:outline-none focus:border-brand-500"
              />
            </div>

            {/* Subject Selection */}
            <div>
              <label className="block font-bold text-slate-300 mb-1">Target Subject</label>
              <select
                value={subjectId}
                onChange={(e) => handleSubjectChange(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 text-slate-100 rounded-xl border border-slate-800 focus:outline-none focus:border-brand-500"
              >
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.name} (Sem {s.semester})</option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block font-bold text-slate-300 mb-1">Brief Description</label>
              <textarea
                rows={2}
                required
                placeholder="Describe what key topics, formulas, or solved questions are included..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 text-slate-100 rounded-xl border border-slate-800 focus:outline-none focus:border-brand-500"
              />
            </div>

            {/* File Upload Box */}
            <div>
              <label className="block font-bold text-slate-300 mb-1">Upload PDF File</label>
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-dashed border-slate-700 text-center space-y-2 relative">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <FileText className="w-8 h-8 text-brand-400 mx-auto" />
                <div>
                  <p className="font-bold text-white text-xs">{fileName}</p>
                  <p className="text-[10px] text-slate-400">{fileSize} • Click or drag to replace PDF</p>
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
