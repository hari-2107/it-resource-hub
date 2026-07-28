import React, { useState } from 'react';
import { X, Sparkles, ShieldAlert, Clock, ExternalLink, Play, Check, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { BroadcastOverlay } from './BroadcastOverlay';

export const SpecialAnnouncementModal = ({ onClose }) => {
  const { broadcasts, addBroadcast, updateBroadcast, deleteBroadcast, addOrUpdateAnnouncement } = useData();
  const { currentUser } = useAuth();

  const [form, setForm] = useState({
    title: '✨ Special Announcement: Department Placement Drive & Fest 2026',
    message: 'Important Notice for all IT Students! Exclusive placement recruitment drive and annual tech fest registration is now live.',
    bannerImageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
    linkUrl: 'https://forms.gle/xyz',
    linkLabel: 'Register Now 🚀',
    themeMode: 'festival', // 'festival' | 'urgent'
    animationType: 'confetti', // 'confetti' | 'petals' | 'sparkles'
    timingMode: 'timer', // 'timer' | 'none'
    autoCloseSeconds: 10,
    isSkippable: true,
    isActive: true
  });

  const [previewOverlay, setPreviewOverlay] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleImageFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setForm(prev => ({
        ...prev,
        bannerImageUrl: reader.result,
        bannerFileName: file.name
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.message.trim()) return;

    const broadcastData = {
      title: form.title,
      message: form.message,
      bannerImageUrl: form.bannerImageUrl,
      linkUrl: form.linkUrl,
      linkLabel: form.linkLabel || 'Register Now 🚀',
      isSkippable: form.isSkippable,
      autoCloseSeconds: form.timingMode === 'timer' ? (parseInt(form.autoCloseSeconds) || 5) : 0,
      isFestivalMode: form.themeMode === 'festival',
      themeMode: form.themeMode,
      animationType: form.animationType,
      isActive: form.isActive,
      createdBy: currentUser?.name || 'IT Dept Admin'
    };

    // Save as broadcast overlay announcement
    addBroadcast(broadcastData);

    // Also post to Announcements feed as Special Announcement
    addOrUpdateAnnouncement({
      title: form.title,
      description: form.message,
      category: 'Special Announcement',
      priority: form.themeMode === 'urgent' ? 'High' : 'Special',
      isPinned: true,
      author: currentUser?.name || 'HOD / IT Dept Admin',
      attachmentUrl: form.bannerImageUrl,
      attachmentType: form.bannerImageUrl ? 'image' : ''
    });

    setIsSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 1800);
  };

  const handleTestPreview = () => {
    setPreviewOverlay({
      id: 'preview-special',
      title: form.title,
      message: form.message,
      bannerImageUrl: form.bannerImageUrl,
      linkUrl: form.linkUrl,
      linkLabel: form.linkLabel || 'Register Now 🚀',
      isSkippable: form.isSkippable,
      autoCloseSeconds: form.timingMode === 'timer' ? (parseInt(form.autoCloseSeconds) || 5) : 0,
      isFestivalMode: form.themeMode === 'festival',
      themeMode: form.themeMode,
      animationType: form.animationType
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 rounded-3xl border border-amber-500/50 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-gradient-to-r from-amber-950/60 via-slate-900 to-purple-950/60">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/40">
              <Sparkles className="w-5 h-5 text-amber-400 animate-spin" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Post Special Announcement (Overlay Alert)</h3>
              <p className="text-xs text-slate-300">Create full-screen emergency alerts & festival celebratory announcements</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        {isSubmitted ? (
          <div className="p-10 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/40 animate-bounce">
              <Check className="w-7 h-7" />
            </div>
            <h4 className="text-lg font-bold text-white">Special Announcement Published Live!</h4>
            <p className="text-xs text-slate-300 max-w-md mx-auto">
              Your special overlay alert has been activated. Students will receive this full-screen announcement upon viewing the hub.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs overflow-y-auto flex-1 scrollbar-thin">
            
            {/* Announcement Theme Mode (Urgent vs Festival) */}
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-200">1. Select Announcement Theme & Alert Mode *</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                <button
                  type="button"
                  onClick={() => setForm({ ...form, themeMode: 'festival' })}
                  className={`p-3.5 rounded-2xl border text-left flex items-start space-x-3 transition-all ${
                    form.themeMode === 'festival'
                      ? 'bg-gradient-to-r from-amber-950/80 to-purple-950/80 border-amber-500 text-amber-200 ring-1 ring-amber-500/50 shadow-lg shadow-amber-500/10'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex-shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-extrabold text-xs text-white">✨ Festival / Celebration</h5>
                    <p className="text-[11px] text-slate-300 leading-tight">
                      Warm celebratory typography with falling confetti, petals, or sparkles background.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setForm({ ...form, themeMode: 'urgent' })}
                  className={`p-3.5 rounded-2xl border text-left flex items-start space-x-3 transition-all ${
                    form.themeMode === 'urgent'
                      ? 'bg-gradient-to-r from-rose-950/80 to-slate-950 border-rose-500 text-rose-200 ring-1 ring-rose-500/50 shadow-lg shadow-rose-500/10'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex-shrink-0">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-extrabold text-xs text-white">🚨 Urgent Emergency Alert</h5>
                    <p className="text-[11px] text-slate-300 leading-tight">
                      High-priority crimson alert theme with warning siren badge for urgent notices.
                    </p>
                  </div>
                </button>

              </div>
            </div>

            {/* Particle Animation Picker (Only if Festival Mode) */}
            {form.themeMode === 'festival' && (
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <label className="block font-bold text-slate-300">Choose Particle Canvas Animation *</label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, animationType: 'confetti' })}
                    className={`p-2.5 rounded-xl border text-center font-bold text-xs flex items-center justify-center space-x-2 transition-all ${
                      form.animationType === 'confetti'
                        ? 'border-amber-400 bg-amber-500/20 text-amber-300 shadow-md'
                        : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>🎉</span>
                    <span>Confetti</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setForm({ ...form, animationType: 'petals' })}
                    className={`p-2.5 rounded-xl border text-center font-bold text-xs flex items-center justify-center space-x-2 transition-all ${
                      form.animationType === 'petals'
                        ? 'border-rose-400 bg-rose-500/20 text-rose-300 shadow-md'
                        : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>🌸</span>
                    <span>Flower Petals</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setForm({ ...form, animationType: 'sparkles' })}
                    className={`p-2.5 rounded-xl border text-center font-bold text-xs flex items-center justify-center space-x-2 transition-all ${
                      form.animationType === 'sparkles'
                        ? 'border-purple-400 bg-purple-500/20 text-purple-300 shadow-md'
                        : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>✨</span>
                    <span>Sparkles</span>
                  </button>
                </div>
              </div>
            )}

            {/* Title */}
            <div>
              <label className="block font-bold text-slate-300 mb-1">Announcement Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. ✨ Special Announcement: Department Fest & Placements Drive"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-950 text-slate-100 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Message Body */}
            <div>
              <label className="block font-bold text-slate-300 mb-1">Full Announcement Message *</label>
              <textarea
                rows={3}
                required
                placeholder="Enter complete notice text..."
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-950 text-slate-100 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Timing & Exit Controls */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <label className="block font-bold text-slate-200">2. Modal Timing & Exit Controls *</label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                {/* Modal Timing Mode */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Timing Mode</label>
                  <select
                    value={form.timingMode}
                    onChange={(e) => setForm({ ...form, timingMode: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 text-slate-100 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-500"
                  >
                    <option value="timer">⏳ Auto-Close Countdown Timer</option>
                    <option value="none">♾️ No Timer (Stays until closed)</option>
                  </select>
                </div>

                {/* Auto Close Seconds */}
                {form.timingMode === 'timer' && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Auto Close Timer (Seconds)</label>
                    <input
                      type="number"
                      min="3"
                      max="60"
                      value={form.autoCloseSeconds}
                      onChange={(e) => setForm({ ...form, autoCloseSeconds: parseInt(e.target.value) || 5 })}
                      className="w-full px-3 py-2 bg-slate-900 text-slate-100 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                )}

              </div>

              {/* Close Button Exit Toggle */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <h6 className="font-bold text-slate-300">Allow Student Exit / Close '✕' Button</h6>
                  <p className="text-[10px] text-slate-400">If enabled, students can click Close anytime before or within the timer.</p>
                </div>
                <select
                  value={form.isSkippable ? 'yes' : 'no'}
                  onChange={(e) => setForm({ ...form, isSkippable: e.target.value === 'yes' })}
                  className="px-3 py-1.5 bg-slate-900 text-xs font-bold text-amber-300 rounded-xl border border-amber-500/40 focus:outline-none"
                >
                  <option value="yes">Yes (Close '✕' enabled)</option>
                  <option value="no">No (Mandatory Timer)</option>
                </select>
              </div>

              {/* Broadcast ON / OFF Live Toggle */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <h6 className="font-bold text-white flex items-center space-x-1.5">
                    <span>Special Announcement Status (ON / OFF)</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                      form.isActive ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    }`}>
                      {form.isActive ? '🟢 ON (ACTIVE)' : '🔴 OFF (PAUSED)'}
                    </span>
                  </h6>
                  <p className="text-[10px] text-slate-400">
                    Turn ON to pop up for students, or OFF to pause/hide overlay.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setForm({ ...form, isActive: !form.isActive })}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all border flex items-center space-x-1.5 ${
                    form.isActive
                      ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500/50 hover:bg-emerald-600/50 shadow-md shadow-emerald-500/20'
                      : 'bg-rose-600/30 text-rose-300 border-rose-500/50 hover:bg-rose-600/50 shadow-md shadow-rose-500/20'
                  }`}
                >
                  <span>{form.isActive ? '🟢 ON (Active)' : '🔴 OFF (Paused)'}</span>
                </button>
              </div>
            </div>

            {/* Banner & Link URLs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-300">Banner Image (Upload JPG / PNG or Paste URL)</label>
                
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center space-x-2">
                    <label className="px-3 py-2 rounded-xl text-xs font-extrabold bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 cursor-pointer flex items-center space-x-1.5 shadow transition-all whitespace-nowrap">
                      <ImageIcon className="w-4 h-4" />
                      <span>Choose Image (JPG / PNG)</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileUpload}
                        className="hidden"
                      />
                    </label>
                    {form.bannerFileName && (
                      <span className="text-[10px] font-semibold text-amber-300 truncate max-w-[120px]">
                        {form.bannerFileName}
                      </span>
                    )}
                  </div>

                  <input
                    type="text"
                    placeholder="https://... or choose file above"
                    value={form.bannerImageUrl}
                    onChange={(e) => setForm({ ...form, bannerImageUrl: e.target.value, bannerFileName: '' })}
                    className="w-full px-3 py-2 bg-slate-900 text-slate-100 text-xs rounded-xl border border-slate-800 focus:outline-none focus:border-amber-500"
                  />

                  {form.bannerImageUrl && (
                    <div className="relative rounded-xl overflow-hidden border border-amber-500/40">
                      <img
                        src={form.bannerImageUrl}
                        alt="Banner Preview"
                        className="w-full h-24 object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, bannerImageUrl: '', bannerFileName: '' })}
                        className="absolute top-1.5 right-1.5 p-1 rounded-lg bg-slate-900/90 text-rose-400 hover:text-white border border-slate-700"
                        title="Remove Image"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Action Link URL & Label (Optional)</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="url"
                    placeholder="https://..."
                    value={form.linkUrl}
                    onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
                    className="w-full px-2.5 py-2.5 bg-slate-950 text-slate-100 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-500 text-[11px]"
                  />
                  <input
                    type="text"
                    placeholder="Button Text (Register)"
                    value={form.linkLabel}
                    onChange={(e) => setForm({ ...form, linkLabel: e.target.value })}
                    className="w-full px-2.5 py-2.5 bg-slate-950 text-slate-100 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-500 text-[11px]"
                  />
                </div>
              </div>
            </div>

            {/* Test Preview & Submit Buttons */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={handleTestPreview}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-amber-300 flex items-center space-x-1.5 border border-slate-700"
              >
                <Play className="w-4 h-4 text-amber-400" />
                <span>Test Live Overlay Preview</span>
              </button>

              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-slate-400 hover:text-white font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl font-bold bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-white shadow-lg shadow-amber-500/25 flex items-center space-x-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Publish Special Announcement</span>
                </button>
              </div>
            </div>

            {/* Manage Existing Special Announcements (ON / OFF List) */}
            {(broadcasts || []).length > 0 && (
              <div className="pt-5 border-t border-slate-800 space-y-3">
                <h5 className="font-bold text-white text-xs flex items-center justify-between">
                  <span>Manage Active / Paused Special Announcements ({broadcasts.length})</span>
                  <span className="text-[10px] text-slate-400 font-normal">Click toggle to turn ON / OFF anytime</span>
                </h5>

                <div className="space-y-2">
                  {broadcasts.map((bcast) => (
                    <div
                      key={bcast.id}
                      className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                        bcast.isActive
                          ? 'bg-slate-950 border-amber-500/50 shadow-md'
                          : 'bg-slate-950/60 border-slate-800 opacity-60'
                      }`}
                    >
                      <div className="space-y-1 overflow-hidden">
                        <div className="flex items-center space-x-2 flex-wrap">
                          <span className="font-bold text-xs text-white truncate">{bcast.title}</span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                            bcast.isActive ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          }`}>
                            {bcast.isActive ? '🟢 ON' : '🔴 OFF'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">{bcast.message}</p>
                      </div>

                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => updateBroadcast(bcast.id, { isActive: !bcast.isActive })}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                            bcast.isActive
                              ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500/40 hover:bg-rose-600/30 hover:text-rose-300'
                              : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-emerald-600/30 hover:text-emerald-300'
                          }`}
                        >
                          {bcast.isActive ? 'Turn OFF' : 'Turn ON'}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Delete broadcast "${bcast.title}"?`)) {
                              deleteBroadcast(bcast.id);
                            }
                          }}
                          className="p-1.5 rounded-xl text-rose-400 hover:text-white bg-slate-900 border border-slate-800 hover:border-rose-500/40"
                          title="Delete Broadcast"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </form>
        )}

      </div>

      {/* Live Admin Preview */}
      {previewOverlay && (
        <BroadcastOverlay
          broadcast={previewOverlay}
          onDismiss={() => setPreviewOverlay(null)}
          isPreview={true}
        />
      )}
    </div>
  );
};
