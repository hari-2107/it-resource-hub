import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { 
  Bell, 
  BellOff,
  Plus, 
  Edit2, 
  Trash2, 
  Calendar, 
  UserCheck, 
  AlertCircle, 
  CheckCircle,
  Megaphone,
  Search,
  FileText,
  Download,
  Eye,
  Users,
  Pin,
  Image as ImageIcon,
  Sparkles,
  Crown
} from 'lucide-react';

const downloadFileFromUrl = (fileUrl, fileName) => {
  if (!fileUrl) return;
  try {
    if (fileUrl.startsWith('data:')) {
      const parts = fileUrl.split(';base64,');
      const contentType = parts[0].split(':')[1];
      const raw = window.atob(parts[1]);
      const uInt8Array = new Uint8Array(raw.length);
      for (let i = 0; i < raw.length; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
      }
      const blob = new Blob([uInt8Array], { type: contentType });
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
    } else {
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  } catch (err) {
    console.error('Download error:', err);
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const AnnouncementsPage = ({ onOpenAdminForm, onOpenSpecialAnnouncementModal, onPreviewMaterial, targetAnnouncementId }) => {
  const { announcements, removeAnnouncement, togglePinAnnouncement, trackAnnouncementView } = useData();
  const { currentUser, isAdmin, updateUserProfile, toggleMuteCategory } = useAuth();
  const [filterCategory, setFilterCategory] = useState('All');
  const [highlightedId, setHighlightedId] = useState(targetAnnouncementId);

  useEffect(() => {
    if (targetAnnouncementId) {
      setHighlightedId(targetAnnouncementId);
      const targetAnn = (announcements || []).find(a => a.id === targetAnnouncementId);
      if (targetAnn && filterCategory !== 'All' && targetAnn.category !== filterCategory) {
        setFilterCategory('All');
      }
      setTimeout(() => {
        const el = document.getElementById(`announcement-${targetAnnouncementId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 150);
    }
  }, [targetAnnouncementId, announcements]);

  const mutedCategories = currentUser?.mutedCategories || [];
  const categories = ['All', 'Special Announcement', 'Exam Alert', 'Events', 'Workshop', 'Academic', 'General'];

  // Automatically track views for announcements when viewed
  useEffect(() => {
    if (announcements && announcements.length > 0) {
      announcements.forEach(ann => {
        if (trackAnnouncementView) {
          trackAnnouncementView(ann.id);
        }
      });
    }
  }, []);

  // Sorting: Pinned / Special first -> High -> Medium -> Low, then by newest Date
  const priorityWeight = { 'Special': 4, 'High': 3, 'Medium': 2, 'Low': 1 };

  const sortedAnnouncements = [...announcements].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;

    const pA = priorityWeight[a.priority] || 1;
    const pB = priorityWeight[b.priority] || 1;
    if (pB !== pA) {
      return pB - pA;
    }
    return new Date(b.date || 0) - new Date(a.date || 0);
  });

  const filteredAnnouncements = sortedAnnouncements.filter(ann => {
    if (filterCategory === 'All') return true;
    return ann.category === filterCategory;
  });

  const handleDownloadAttachment = (ann) => {
    if (!ann.attachmentUrl) return;
    const ext = ann.attachmentType === 'image' ? 'png' : 'pdf';
    const cleanTitle = (ann.title || 'Notice').replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = ann.attachmentName || `${cleanTitle}_Attachment.${ext}`;
    downloadFileFromUrl(ann.attachmentUrl, fileName);
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30 mb-2">
            <Megaphone className="w-3.5 h-3.5" />
            <span>Official Notices</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Department Announcements</h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Real-time updates regarding exams, hackathons, guest lectures, and academic schedules.
          </p>
        </div>

        {/* Admin Post Buttons */}
        {isAdmin && (
          <div className="flex items-center space-x-3 self-start md:self-auto flex-wrap gap-y-2">
            <button
              onClick={() => onOpenSpecialAnnouncementModal ? onOpenSpecialAnnouncementModal() : onOpenAdminForm('announcement', { category: 'Special Announcement', priority: 'Special', isPinned: true })}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl font-extrabold text-xs bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-white shadow-lg shadow-amber-500/25 transition-all transform hover:scale-[1.02]"
            >
              <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
              <span>✨ Post Special Announcement</span>
            </button>

            <button
              onClick={() => onOpenAdminForm('announcement')}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Post Announcement</span>
            </button>
          </div>
        )}
      </div>

      {/* Filter Tabs & Quick Mute Toggles */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => {
          const isMuted = cat !== 'All' && mutedCategories.includes(cat);
          const isActive = filterCategory === cat;

          return (
            <div key={cat} className="flex items-center space-x-1 flex-shrink-0">
              <button
                onClick={() => setFilterCategory(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center space-x-1.5 ${
                  isActive
                    ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <span>{cat}</span>
                {isMuted && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-800 text-rose-300 border border-slate-700 flex items-center space-x-1">
                    <BellOff className="w-2.5 h-2.5 text-rose-400" />
                    <span>Muted</span>
                  </span>
                )}
              </button>

              {cat !== 'All' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMuteCategory(cat);
                  }}
                  className={`p-2 rounded-xl border text-xs transition-all ${
                    isMuted
                      ? 'bg-slate-900/90 text-rose-400 border-rose-500/40 hover:bg-rose-500/10'
                      : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-white hover:border-slate-700'
                  }`}
                  title={isMuted ? `Unmute ${cat} notifications` : `Mute ${cat} notifications`}
                >
                  {isMuted ? <BellOff className="w-3.5 h-3.5 text-rose-400" /> : <Bell className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Announcements Timeline Feed */}
      <div className="space-y-4">
        {filteredAnnouncements.length === 0 ? (
          <div className="glass-panel rounded-3xl p-12 text-center text-slate-400">
            <Bell className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold">No announcements found under this category.</p>
          </div>
        ) : (
          filteredAnnouncements.map((ann) => {
            const viewedList = ann.viewedBy || ['Alex Morgan', 'Rahul Sharma', 'Priya Patel', 'Prof. Sarah'];
            const viewCount = ann.viewCount || viewedList.length;
            const isTarget = ann.id === highlightedId;

            return (
              <div
                id={`announcement-${ann.id}`}
                key={ann.id}
                className={`glass-card rounded-3xl p-6 border space-y-3 relative overflow-hidden transition-all hover:border-slate-700 ${
                  isTarget
                    ? 'border-brand-500 ring-2 ring-brand-500/60 bg-brand-950/20 shadow-xl shadow-brand-500/15'
                    : (ann.category === 'Special Announcement' || ann.priority === 'Special')
                    ? 'border-amber-500/70 ring-1 ring-amber-500/40 bg-gradient-to-r from-amber-950/20 via-slate-950 to-purple-950/20 shadow-xl shadow-amber-500/10'
                    : ann.isPinned ? 'border-amber-500/60 bg-amber-950/10' : 'border-slate-800'
                }`}
              >
                {/* Left Accent Bar */}
                <div className={`absolute top-0 left-0 w-1.5 h-full ${
                  isTarget ? 'bg-brand-400' :
                  (ann.category === 'Special Announcement' || ann.priority === 'Special') ? 'bg-gradient-to-b from-amber-400 via-rose-400 to-purple-500' :
                  ann.isPinned ? 'bg-amber-400' :
                  ann.priority === 'High' ? 'bg-rose-500' :
                  ann.priority === 'Medium' ? 'bg-amber-500' : 'bg-brand-500'
                }`} />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pl-2">
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                    {isTarget && (
                      <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-brand-500/20 text-brand-300 border border-brand-500/50 shadow-sm">
                        <span>🎯 SELECTED NOTICE</span>
                      </span>
                    )}

                    {(ann.category === 'Special Announcement' || ann.priority === 'Special') && (
                      <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-gradient-to-r from-amber-500/30 via-rose-500/20 to-purple-500/30 text-amber-300 border border-amber-500/60 shadow-md shadow-amber-500/10">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                        <span>SPECIAL ANNOUNCEMENT</span>
                      </span>
                    )}

                    {ann.isPinned && (
                      <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm">
                        <Pin className="w-3 h-3 fill-amber-300" />
                        <span>PINNED NOTICE</span>
                      </span>
                    )}

                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                      (ann.category === 'Special Announcement' || ann.priority === 'Special') ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                      ann.priority === 'High' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                      ann.priority === 'Medium' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                      'bg-brand-500/20 text-brand-300 border border-brand-500/40'
                    }`}>
                      {ann.category}
                    </span>
                    
                    {ann.priority === 'High' && !ann.isPinned && (
                      <span className="flex items-center text-[10px] text-rose-400 font-semibold">
                        <AlertCircle className="w-3 h-3 mr-1" /> URGENT NOTICE
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-4 text-xs text-slate-400">
                    <span className="flex items-center bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800 text-[11px]">
                      <Calendar className="w-3.5 h-3.5 mr-1 text-slate-500" /> Posted: {ann.date}{ann.time ? ` • ${ann.time}` : ''}
                    </span>
                    <span className="flex items-center text-slate-400">
                      <UserCheck className="w-3.5 h-3.5 mr-1 text-brand-400" /> {ann.author}
                    </span>

                    <div className="flex items-center space-x-1.5 pl-2 border-l border-slate-800">
                      <button
                        onClick={() => {
                          const currentDismissed = currentUser?.dismissedNotifications || [];
                          const isDismissed = currentDismissed.includes(ann.id);
                          const updated = isDismissed 
                            ? currentDismissed.filter(id => id !== ann.id)
                            : [...currentDismissed, ann.id];
                          updateUserProfile({ dismissedNotifications: updated });
                        }}
                        className={`p-1 px-2 rounded font-semibold text-xs flex items-center space-x-1 transition-colors ${
                          currentUser?.dismissedNotifications?.includes(ann.id)
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : 'bg-slate-900 text-slate-400 hover:text-rose-400 border border-slate-800'
                        }`}
                        title={currentUser?.dismissedNotifications?.includes(ann.id) ? "Restore notification in Bell popover" : "Clear notification from Bell popover"}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="text-[10px] hidden sm:inline">
                          {currentUser?.dismissedNotifications?.includes(ann.id) ? 'Cleared' : 'Clear'}
                        </span>
                      </button>

                      {isAdmin && (
                        <>
                          {/* Pin Toggle Button */}
                          <button
                            onClick={() => togglePinAnnouncement(ann.id)}
                            className={`p-1 px-2 rounded font-semibold text-xs flex items-center space-x-1 transition-colors ${
                              ann.isPinned
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : 'bg-slate-900 text-slate-400 hover:text-amber-300'
                            }`}
                            title={ann.isPinned ? "Unpin Notice" : "Pin Notice to Top"}
                          >
                            <Pin className={`w-3.5 h-3.5 ${ann.isPinned ? 'fill-amber-300' : ''}`} />
                            <span className="text-[10px] hidden sm:inline">{ann.isPinned ? 'Pinned' : 'Pin'}</span>
                          </button>

                          <button
                            onClick={() => onOpenAdminForm('announcement', ann)}
                            className="p-1 rounded bg-slate-900 text-slate-400 hover:text-emerald-400"
                            title="Edit Notice"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => removeAnnouncement(ann.id)}
                            className="p-1 rounded bg-slate-900 text-slate-400 hover:text-rose-400"
                            title="Delete Notice"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <h2 className="text-base sm:text-lg font-bold text-white pl-2">
                  {ann.title}
                </h2>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pl-2 font-normal">
                  {ann.description}
                </p>

                {/* Attached Photo or PDF File Card */}
                {ann.attachmentUrl && (
                  <div className="ml-2 mt-3 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center space-x-3 truncate">
                      {ann.attachmentType === 'image' ? (
                        <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center flex-shrink-0 border border-purple-500/30">
                          <ImageIcon className="w-5 h-5" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center flex-shrink-0 border border-brand-500/30">
                          <FileText className="w-5 h-5" />
                        </div>
                      )}
                      <div className="truncate">
                        <p className="text-xs font-bold text-white truncate">
                          {ann.attachmentName || (ann.attachmentType === 'image' ? 'Attached Photo Image' : 'Attached PDF Circular')}
                        </p>
                        <p className="text-[10px] text-slate-400 uppercase font-semibold">
                          {ann.attachmentType === 'image' ? 'Image Attachment' : 'PDF Document'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 flex-shrink-0">
                      {/* View / Preview Button */}
                      {onPreviewMaterial && (
                        <button
                          onClick={() => onPreviewMaterial({
                            title: ann.title,
                            fileUrl: ann.attachmentUrl,
                            attachmentName: ann.attachmentName,
                            attachmentType: ann.attachmentType,
                            uploadDate: ann.date
                          })}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center space-x-1.5 border border-slate-700"
                        >
                          <Eye className="w-3.5 h-3.5 text-brand-400" />
                          <span>Preview File</span>
                        </button>
                      )}

                      {/* Download Direct Button */}
                      <button
                        type="button"
                        onClick={() => handleDownloadAttachment(ann)}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white flex items-center space-x-1.5 shadow-md shadow-brand-600/20 active:scale-95 transition-all"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Member View Counter Bar */}
                <div className="ml-2 pt-3 mt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-[11px]">
                      <Eye className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{viewCount} Members Seen</span>
                    </div>

                    <div className="flex items-center space-x-1 text-[11px] text-slate-400">
                      <Users className="w-3.5 h-3.5 text-slate-500" />
                      <span className="hidden sm:inline">Seen by:</span>
                      <span className="text-slate-300 font-medium truncate max-w-xs sm:max-w-md">
                        {viewedList.slice(0, 4).join(', ')}
                        {viewedList.length > 4 ? ` +${viewedList.length - 4} others` : ''}
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
