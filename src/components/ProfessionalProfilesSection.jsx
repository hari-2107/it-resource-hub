import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Globe, 
  Plus, 
  Edit3, 
  Trash2, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  Code, 
  Briefcase, 
  FileText, 
  BookOpen, 
  User, 
  X, 
  Sparkles,
  Link as LinkIcon
} from 'lucide-react';

// Preset suggestions for quick selection in modal
const PRESET_PLATFORMS = [
  { name: 'GitHub', placeholder: 'https://github.com/username' },
  { name: 'LinkedIn', placeholder: 'https://linkedin.com/in/username' },
  { name: 'LeetCode', placeholder: 'https://leetcode.com/u/username' },
  { name: 'CodeChef', placeholder: 'https://www.codechef.com/users/username' },
  { name: 'HackerRank', placeholder: 'https://www.hackerrank.com/profile/username' },
  { name: 'Codeforces', placeholder: 'https://codeforces.com/profile/username' },
  { name: 'GeeksforGeeks', placeholder: 'https://www.geeksforgeeks.org/user/username' },
  { name: 'Kaggle', placeholder: 'https://www.kaggle.com/username' },
  { name: 'Portfolio', placeholder: 'https://yourportfolio.com' },
  { name: 'Resume', placeholder: 'https://yourresumewebsite.com' },
  { name: 'Medium', placeholder: 'https://medium.com/@username' },
  { name: 'Dev.to', placeholder: 'https://dev.to/username' },
  { name: 'Behance', placeholder: 'https://www.behance.net/username' },
  { name: 'Dribbble', placeholder: 'https://dribbble.com/username' },
  { name: 'Stack Overflow', placeholder: 'https://stackoverflow.com/users/userid' },
  { name: 'YouTube', placeholder: 'https://youtube.com/@channel' }
];

// Custom Platform Icon Resolver Component
const PlatformIcon = ({ name, customIcon, className = "w-6 h-6" }) => {
  const normName = (name || '').toLowerCase().trim();

  if (customIcon) {
    return (
      <img 
        src={customIcon} 
        alt={name} 
        className={`${className} object-contain rounded`}
        onError={(e) => { e.target.style.display = 'none'; }}
      />
    );
  }

  // GitHub
  if (normName.includes('github')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
      </svg>
    );
  }

  // LinkedIn
  if (normName.includes('linkedin')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
      </svg>
    );
  }

  // LeetCode
  if (normName.includes('leetcode')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226a1.374 1.374 0 0 0-.016 1.928l5.291 5.485c.264.274.622.428.995.428h5.922a1.374 1.374 0 0 0 1.374-1.374V6.771A1.374 1.374 0 0 0 19.308 5.4L14.444.438A1.374 1.374 0 0 0 13.483 0zm-1.896 15.424a1.374 1.374 0 0 0-1.928.016l-5.485 5.291a1.374 1.374 0 0 0-.428.995v.922c0 .759.615 1.374 1.374 1.374h5.922c.373 0 .731-.154.995-.428l4.864-4.864a1.374 1.374 0 0 0-1.928-1.928l-3.386 3.386h-3.47v-.922l4.48-4.32a1.374 1.374 0 0 0-.016-1.928zM4.15 6.226A1.374 1.374 0 0 0 2.776 7.6v8.8a1.374 1.374 0 0 0 1.374 1.374h.922a1.374 1.374 0 0 0 1.374-1.374V7.6A1.374 1.374 0 0 0 5.072 6.226H4.15z" />
      </svg>
    );
  }

  // CodeChef
  if (normName.includes('codechef')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.5h-2v-2h2v2zm0-4h-2V7h2v5.5z" />
      </svg>
    );
  }

  // Codeforces
  if (normName.includes('codeforces')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M4.5 7.5A1.5 1.5 0 0 0 3 9v9a1.5 1.5 0 0 0 3 0V9a1.5 1.5 0 0 0-1.5-1.5zM12 3a1.5 1.5 0 0 0-1.5 1.5v13.5a1.5 1.5 0 0 0 3 0V4.5A1.5 1.5 0 0 0 12 3zm7.5 7.5A1.5 1.5 0 0 0 18 12v6a1.5 1.5 0 0 0 3 0v-6a1.5 1.5 0 0 0-1.5-1.5z" />
      </svg>
    );
  }

  // HackerRank
  if (normName.includes('hackerrank')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm-1.2 16.5H8.7V7.5h2.1v9zm4.5 0h-2.1V7.5h2.1v9z" />
      </svg>
    );
  }

  // GeeksforGeeks
  if (normName.includes('geeks') || normName.includes('gfg')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.5 12c0 5.8-4.7 10.5-10.5 10.5S1.5 17.8 1.5 12 6.2 1.5 12 1.5 22.5 6.2 22.5 12zm-12 5.25l6-5.25-6-5.25v10.5z" />
      </svg>
    );
  }

  // Kaggle
  if (normName.includes('kaggle')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.825 23.859h-3.801l-5.63-7.798-2.617 2.45v5.348H3.693V.141h3.084v14.184l7.636-8.683h3.896l-6.892 7.712 7.408 10.505z" />
      </svg>
    );
  }

  // Portfolio
  if (normName.includes('portfolio') || normName.includes('website') || normName.includes('site')) {
    return <Briefcase className={className} />;
  }

  // Resume
  if (normName.includes('resume') || normName.includes('cv')) {
    return <FileText className={className} />;
  }

  // Medium
  if (normName.includes('medium')) {
    return <BookOpen className={className} />;
  }

  // Dev.to
  if (normName.includes('dev.to') || normName === 'dev') {
    return <Code className={className} />;
  }

  // Stack Overflow
  if (normName.includes('stack')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.986 21.865v-6.404h2.134V24H1.841v-8.539h2.134v6.404h15.011zm-11.758-5.321l11.16 2.327.466-2.083-11.16-2.327-.466 2.083zm1.696-5.238l10.046 4.707.892-1.947-10.046-4.707-.892 1.947zm3.149-5.012l8.287 7.427 1.411-1.615-8.287-7.427-1.411 1.615zm5.733-4.148l-1.847 1.087 6.079 10.334 1.847-1.087-6.079-10.334zM6.924 20h11.516v-2.134H6.924V20z" />
      </svg>
    );
  }

  // YouTube
  if (normName.includes('youtube')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    );
  }

  // Generic fallback icon
  return <Globe className={className} />;
};

// Platform Gradient Accent Helper
const getPlatformColor = (name) => {
  const normName = (name || '').toLowerCase().trim();
  if (normName.includes('github')) return { bg: 'bg-slate-800', border: 'border-slate-700', text: 'text-slate-100', badge: 'bg-slate-800/80 text-slate-200 border-slate-700' };
  if (normName.includes('linkedin')) return { bg: 'bg-sky-950/60', border: 'border-sky-500/40', text: 'text-sky-400', badge: 'bg-sky-500/20 text-sky-300 border-sky-500/30' };
  if (normName.includes('leetcode')) return { bg: 'bg-amber-950/60', border: 'border-amber-500/40', text: 'text-amber-400', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
  if (normName.includes('codechef')) return { bg: 'bg-orange-950/60', border: 'border-orange-500/40', text: 'text-orange-400', badge: 'bg-orange-500/20 text-orange-300 border-orange-500/30' };
  if (normName.includes('codeforces')) return { bg: 'bg-rose-950/60', border: 'border-rose-500/40', text: 'text-rose-400', badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30' };
  if (normName.includes('hackerrank')) return { bg: 'bg-emerald-950/60', border: 'border-emerald-500/40', text: 'text-emerald-400', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
  if (normName.includes('geeks') || normName.includes('gfg')) return { bg: 'bg-green-950/60', border: 'border-green-500/40', text: 'text-green-400', badge: 'bg-green-500/20 text-green-300 border-green-500/30' };
  if (normName.includes('kaggle')) return { bg: 'bg-cyan-950/60', border: 'border-cyan-500/40', text: 'text-cyan-400', badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' };
  if (normName.includes('portfolio')) return { bg: 'bg-purple-950/60', border: 'border-purple-500/40', text: 'text-purple-400', badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30' };
  if (normName.includes('resume')) return { bg: 'bg-indigo-950/60', border: 'border-indigo-500/40', text: 'text-indigo-400', badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' };
  if (normName.includes('youtube')) return { bg: 'bg-red-950/60', border: 'border-red-500/40', text: 'text-red-400', badge: 'bg-red-500/20 text-red-300 border-red-500/30' };
  return { bg: 'bg-slate-900', border: 'border-slate-800', text: 'text-brand-400', badge: 'bg-brand-500/20 text-brand-300 border-brand-500/30' };
};

export const ProfessionalProfilesSection = () => {
  const { currentUser, updateUserProfile } = useAuth();

  // Toast Notification state
  const [toastMessage, setToastMessage] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [editingTarget, setEditingTarget] = useState({ key: '', customId: null });
  const [formName, setFormName] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formIcon, setFormIcon] = useState('');
  const [formError, setFormError] = useState('');

  // Delete Confirmation State
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Get current user's professional profiles (or defaults)
  const profiles = currentUser?.professionalProfiles || {
    github: '',
    linkedin: '',
    leetcode: '',
    customProfiles: []
  };

  // Helper: Open profile link in new browser tab
  const handleOpenProfile = (url) => {
    if (!url) return;
    let targetUrl = url.trim();
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = `https://${targetUrl}`;
    }
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  // Helper: Sanitize & Validate URL
  const validateUrl = (urlStr) => {
    if (!urlStr || !urlStr.trim()) return 'Profile URL is required.';
    let sanitized = urlStr.trim();
    if (!/^https?:\/\//i.test(sanitized)) {
      sanitized = `https://${sanitized}`;
    }
    try {
      const parsed = new URL(sanitized);
      if (!parsed.hostname || !parsed.hostname.includes('.')) {
        return 'Please enter a valid website domain URL (e.g., https://github.com/username).';
      }
    } catch {
      return 'Invalid URL format. Please enter a valid URL (e.g., https://github.com/username).';
    }
    return null;
  };

  // Open Modal for default or custom card
  const openAddEditModal = (targetKey, existingName = '', existingUrl = '', customId = null) => {
    setFormError('');
    if (targetKey === 'github') {
      setModalMode(existingUrl ? 'edit' : 'add');
      setEditingTarget({ key: 'github', customId: null });
      setFormName('GitHub');
      setFormUrl(existingUrl || '');
      setFormIcon('');
    } else if (targetKey === 'linkedin') {
      setModalMode(existingUrl ? 'edit' : 'add');
      setEditingTarget({ key: 'linkedin', customId: null });
      setFormName('LinkedIn');
      setFormUrl(existingUrl || '');
      setFormIcon('');
    } else if (targetKey === 'leetcode') {
      setModalMode(existingUrl ? 'edit' : 'add');
      setEditingTarget({ key: 'leetcode', customId: null });
      setFormName('LeetCode');
      setFormUrl(existingUrl || '');
      setFormIcon('');
    } else if (targetKey === 'custom_edit') {
      setModalMode('edit');
      setEditingTarget({ key: 'custom', customId });
      setFormName(existingName);
      setFormUrl(existingUrl);
      setFormIcon('');
    } else {
      // Add new custom profile
      setModalMode('add');
      setEditingTarget({ key: 'custom_new', customId: null });
      setFormName('');
      setFormUrl('');
      setFormIcon('');
    }
    setIsModalOpen(true);
  };

  // Handle Save in Modal
  const handleSaveModal = (e) => {
    e.preventDefault();
    setFormError('');

    const trimmedName = formName.trim();
    if (!trimmedName) {
      setFormError('Platform Name is required.');
      return;
    }

    const urlError = validateUrl(formUrl);
    if (urlError) {
      setFormError(urlError);
      return;
    }

    let sanitizedUrl = formUrl.trim();
    if (!/^https?:\/\//i.test(sanitizedUrl)) {
      sanitizedUrl = `https://${sanitizedUrl}`;
    }

    // Check duplicate platform names
    const normName = trimmedName.toLowerCase();
    const existingNames = [
      profiles.github ? 'github' : null,
      profiles.linkedin ? 'linkedin' : null,
      profiles.leetcode ? 'leetcode' : null,
      ...(profiles.customProfiles || []).map(p => p.id === editingTarget.customId ? null : (p.name || '').toLowerCase())
    ].filter(Boolean);

    // If adding a new card or changing name, check duplicate
    if (
      (editingTarget.key === 'custom_new' && existingNames.includes(normName)) ||
      (editingTarget.key === 'custom' && existingNames.includes(normName))
    ) {
      setFormError(`A profile card for "${trimmedName}" already exists.`);
      return;
    }

    // Prepare updated structure
    const updatedProfiles = {
      github: profiles.github || '',
      linkedin: profiles.linkedin || '',
      leetcode: profiles.leetcode || '',
      customProfiles: [...(profiles.customProfiles || [])]
    };

    if (editingTarget.key === 'github' || normName === 'github') {
      updatedProfiles.github = sanitizedUrl;
    } else if (editingTarget.key === 'linkedin' || normName === 'linkedin') {
      updatedProfiles.linkedin = sanitizedUrl;
    } else if (editingTarget.key === 'leetcode' || normName === 'leetcode') {
      updatedProfiles.leetcode = sanitizedUrl;
    } else if (editingTarget.key === 'custom') {
      // Update existing custom profile
      updatedProfiles.customProfiles = updatedProfiles.customProfiles.map(p => {
        if (p.id === editingTarget.customId) {
          return { ...p, name: trimmedName, url: sanitizedUrl, icon: formIcon.trim() };
        }
        return p;
      });
    } else {
      // Add new custom profile
      const newCustom = {
        id: `cp-${Date.now()}`,
        name: trimmedName,
        url: sanitizedUrl,
        icon: formIcon.trim()
      };
      updatedProfiles.customProfiles.push(newCustom);
    }

    // Update user profile
    updateUserProfile({ professionalProfiles: updatedProfiles });
    showToast(`${trimmedName} profile linked successfully.`);
    setIsModalOpen(false);
  };

  // Handle Remove Profile Confirmation
  const handleConfirmDelete = () => {
    if (!deleteConfirmTarget) return;

    const { key, customId, name } = deleteConfirmTarget;

    const updatedProfiles = {
      github: profiles.github || '',
      linkedin: profiles.linkedin || '',
      leetcode: profiles.leetcode || '',
      customProfiles: [...(profiles.customProfiles || [])]
    };

    if (key === 'github') updatedProfiles.github = '';
    else if (key === 'linkedin') updatedProfiles.linkedin = '';
    else if (key === 'leetcode') updatedProfiles.leetcode = '';
    else if (key === 'custom') {
      updatedProfiles.customProfiles = updatedProfiles.customProfiles.filter(p => p.id !== customId);
    }

    updateUserProfile({ professionalProfiles: updatedProfiles });
    showToast(`${name} profile removed.`);
    setDeleteConfirmTarget(null);
  };

  // 3 Default Card Configuration
  const defaultCards = [
    {
      key: 'github',
      name: 'GitHub',
      description: 'Code repository & open source projects',
      url: profiles.github,
      connected: Boolean(profiles.github)
    },
    {
      key: 'linkedin',
      name: 'LinkedIn',
      description: 'Professional network & career updates',
      url: profiles.linkedin,
      connected: Boolean(profiles.linkedin)
    },
    {
      key: 'leetcode',
      name: 'LeetCode',
      description: 'Data structures & algorithm practice',
      url: profiles.leetcode,
      connected: Boolean(profiles.leetcode)
    }
  ];

  const customCards = profiles.customProfiles || [];

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-2 bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-2xl border border-emerald-400/40 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* SECTION HEADER CARD */}
      <div className="glass-panel rounded-3xl p-6 sm:p-7 border border-slate-800 relative overflow-hidden bg-slate-900/80 backdrop-blur-md">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center space-x-2.5">
              <span className="text-2xl">💼</span>
              <h2 className="text-xl font-extrabold text-white tracking-tight">Professional Profiles</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-500/20 text-brand-300 border border-brand-500/30">
                Portfolio Hub
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Keep all your professional coding and networking profiles in one place.
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs font-medium text-slate-400 bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-800/80 self-start sm:self-auto">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>
              Linked: {defaultCards.filter(c => c.connected).length + customCards.length} platform(s)
            </span>
          </div>
        </div>

        {/* RESPONSIVE CARDS GRID */}
        {/* Desktop: 4 cards/row | Tablet: 2 cards | Mobile: 1 card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          
          {/* DEFAULT 3 CARDS: GitHub, LinkedIn, LeetCode */}
          {defaultCards.map((card) => {
            const colors = getPlatformColor(card.name);
            return (
              <div 
                key={card.key}
                className="glass-panel rounded-2xl p-5 border border-slate-800/90 bg-slate-900/60 backdrop-blur-md flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-500/5 group"
              >
                <div>
                  {/* Top Header: Platform Icon + Status */}
                  <div className="flex items-center justify-between">
                    <div className={`p-2.5 rounded-xl ${colors.bg} ${colors.text} border ${colors.border} shadow-sm group-hover:scale-105 transition-transform`}>
                      <PlatformIcon name={card.name} className="w-6 h-6" />
                    </div>

                    {card.connected ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>✔ Profile Connected</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-slate-800/80 text-slate-400 border border-slate-700/60">
                        No profile linked
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <div className="mt-3.5 space-y-1">
                    <h3 className="text-base font-bold text-white group-hover:text-brand-300 transition-colors">
                      {card.name}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {card.description}
                    </p>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-2 border-t border-slate-800/60">
                  {card.connected ? (
                    <div className="space-y-2">
                      <button
                        onClick={() => handleOpenProfile(card.url)}
                        className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white shadow-md shadow-brand-600/20 flex items-center justify-center space-x-1.5 transition-all hover:scale-[1.01]"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        <span>🌐 Open Profile</span>
                        <ExternalLink className="w-3 h-3 ml-auto opacity-75" />
                      </button>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openAddEditModal(card.key, card.name, card.url)}
                          className="flex-1 py-1.5 px-2.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 flex items-center justify-center space-x-1 transition-colors"
                        >
                          <Edit3 className="w-3 h-3 text-brand-400" />
                          <span>✏ Edit</span>
                        </button>
                        <button
                          onClick={() => setDeleteConfirmTarget({ key: card.key, name: card.name })}
                          className="py-1.5 px-2.5 rounded-lg text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center justify-center space-x-1 transition-colors"
                          title={`Remove ${card.name} link`}
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>🗑 Remove</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => openAddEditModal(card.key, card.name, '')}
                      className="w-full py-2.5 px-3 rounded-xl text-xs font-bold bg-slate-800/90 hover:bg-brand-600 text-slate-300 hover:text-white border border-slate-700 hover:border-brand-500 shadow-sm flex items-center justify-center space-x-1.5 transition-all"
                    >
                      <Plus className="w-4 h-4 text-brand-400 group-hover:text-white" />
                      <span>➕ Add Profile</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* DYNAMIC SAVED CUSTOM PROFILES */}
          {customCards.map((custom) => {
            const colors = getPlatformColor(custom.name);
            return (
              <div 
                key={custom.id}
                className="glass-panel rounded-2xl p-5 border border-slate-800/90 bg-slate-900/60 backdrop-blur-md flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-500/5 group"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className={`p-2.5 rounded-xl ${colors.bg} ${colors.text} border ${colors.border} shadow-sm group-hover:scale-105 transition-transform`}>
                      <PlatformIcon name={custom.name} customIcon={custom.icon} className="w-6 h-6" />
                    </div>

                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>✔ Profile Connected</span>
                    </span>
                  </div>

                  <div className="mt-3.5 space-y-1">
                    <h3 className="text-base font-bold text-white group-hover:text-brand-300 transition-colors truncate">
                      {custom.name}
                    </h3>
                    <p className="text-xs text-slate-400 truncate leading-relaxed">
                      {custom.url.replace(/^https?:\/\//i, '')}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/60 space-y-2">
                  <button
                    onClick={() => handleOpenProfile(custom.url)}
                    className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white shadow-md shadow-brand-600/20 flex items-center justify-center space-x-1.5 transition-all hover:scale-[1.01]"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>🌐 Open Profile</span>
                    <ExternalLink className="w-3 h-3 ml-auto opacity-75" />
                  </button>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => openAddEditModal('custom_edit', custom.name, custom.url, custom.id)}
                      className="flex-1 py-1.5 px-2.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 flex items-center justify-center space-x-1 transition-colors"
                    >
                      <Edit3 className="w-3 h-3 text-brand-400" />
                      <span>✏ Edit</span>
                    </button>
                    <button
                      onClick={() => setDeleteConfirmTarget({ key: 'custom', customId: custom.id, name: custom.name })}
                      className="py-1.5 px-2.5 rounded-lg text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center justify-center space-x-1 transition-colors"
                      title={`Remove ${custom.name} profile`}
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>🗑 Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* LARGE "+" ADD CUSTOM PROFILE CARD */}
          <div 
            onClick={() => openAddEditModal('custom_new')}
            className="rounded-2xl p-6 border-2 border-dashed border-slate-800 hover:border-brand-500/60 bg-slate-950/40 hover:bg-slate-900/80 transition-all duration-300 flex flex-col items-center justify-center text-center space-y-3 cursor-pointer group hover:scale-[1.02] min-h-[190px]"
          >
            <div className="w-12 h-12 rounded-2xl bg-brand-600/20 border border-brand-500/40 group-hover:bg-brand-600 group-hover:text-white text-brand-400 flex items-center justify-center shadow-lg transition-all">
              <Plus className="w-6 h-6 stroke-[2.5]" />
            </div>

            <div>
              <h3 className="text-sm font-bold text-white group-hover:text-brand-300 transition-colors">
                Add Custom Profile
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 max-w-[200px]">
                Link CodeChef, HackerRank, Portfolio, Kaggle, Dev.to, and more.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* ADD / EDIT PROFILE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-lg bg-slate-900 rounded-3xl border border-slate-700/80 shadow-2xl overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
              <div className="flex items-center space-x-2">
                <span className="text-lg">💼</span>
                <h3 className="text-base font-bold text-white">
                  {modalMode === 'edit' ? `Edit ${formName || 'Profile'}` : 'Add Professional Profile'}
                </h3>
              </div>
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveModal} className="p-6 space-y-4 text-xs">
              
              {/* Validation Error Banner */}
              {formError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Platform Name Field */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Platform Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GitHub, LeetCode, CodeChef, Portfolio..."
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 text-slate-100 rounded-xl border border-slate-800 focus:outline-none focus:border-brand-500 text-xs font-medium"
                />
              </div>

              {/* Quick Preset Suggestion Chips */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
                  Quick Platform Suggestions:
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1 scrollbar-thin">
                  {PRESET_PLATFORMS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => {
                        setFormName(preset.name);
                        if (!formUrl) setFormUrl(preset.placeholder);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                        formName.toLowerCase() === preset.name.toLowerCase()
                          ? 'bg-brand-600 text-white font-bold'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Profile URL Field */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Profile URL <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <LinkIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="https://github.com/username"
                    value={formUrl}
                    onChange={(e) => setFormUrl(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950 text-slate-100 rounded-xl border border-slate-800 focus:outline-none focus:border-brand-500 text-xs font-mono"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Example: https://github.com/username or https://leetcode.com/u/username
                </p>
              </div>

              {/* Optional Custom Icon Field */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Optional Custom Icon (Image URL)
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/logo.png (optional)"
                  value={formIcon}
                  onChange={(e) => setFormIcon(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 text-slate-100 rounded-xl border border-slate-800 focus:outline-none focus:border-brand-500 text-xs font-mono"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Leave blank to automatically use standard platform icon.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white shadow-md shadow-brand-600/30 transition-transform active:scale-95"
                >
                  Save Profile
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center space-x-3 text-rose-400">
              <AlertCircle className="w-6 h-6 flex-shrink-0" />
              <h3 className="text-base font-bold text-white">Remove Profile Link?</h3>
            </div>
            
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to remove your <strong className="text-white">{deleteConfirmTarget.name}</strong> profile link from your student profile?
            </p>

            <div className="pt-2 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmTarget(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/30 transition-transform active:scale-95"
              >
                Remove Profile
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
