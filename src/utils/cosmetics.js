// src/utils/cosmetics.js
// Centralized profile customization options (Borders, Titles, Avatar Backgrounds)

export const PROFILE_BORDERS = [
  {
    id: 'admin_supreme',
    name: '👑 Admin Supreme Crown',
    color: 'border-amber-400 ring-2 ring-emerald-400 shadow-[0_0_20px_rgba(251,191,36,0.8)]',
    bg: 'bg-slate-950',
    unlockRequirement: { type: 'adminOnly', value: 'admin', label: '👑 Admin Exclusive' }
  },
  {
    id: 'default',
    name: 'Standard Slate',
    color: 'border-slate-700 shadow-none',
    bg: 'bg-slate-800',
    unlockRequirement: { type: 'level', value: 1, label: 'Unlocked by default' }
  },
  {
    id: 'cyber_neon',
    name: 'Cyber Neon',
    color: 'border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.6)]',
    bg: 'bg-cyan-950',
    unlockRequirement: { type: 'level', value: 5, label: 'Unlocks at Level 5' }
  },
  {
    id: 'golden_legend',
    name: 'Golden Legend',
    color: 'border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.6)]',
    bg: 'bg-amber-950',
    unlockRequirement: { type: 'level', value: 10, label: 'Unlocks at Level 10' }
  },
  {
    id: 'emerald_shield',
    name: 'Emerald Shield',
    color: 'border-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.6)]',
    bg: 'bg-emerald-950',
    unlockRequirement: { type: 'badge', value: 'speed_demon', label: "Unlocks via 'Speed Demon' badge" }
  },
  {
    id: 'cosmic_purple',
    name: 'Cosmic Purple',
    color: 'border-purple-400 shadow-[0_0_15px_rgba(192,132,252,0.6)]',
    bg: 'bg-purple-950',
    unlockRequirement: { type: 'mysteryBox', value: 'mystery_loot', label: 'Unlocks from Mystery Box' }
  },
  {
    id: 'quantum_violet',
    name: 'Quantum Violet',
    color: 'border-violet-400 shadow-[0_0_15px_rgba(167,139,250,0.6)]',
    bg: 'bg-violet-950',
    unlockRequirement: { type: 'level', value: 15, label: 'Unlocks at Level 15' }
  },
  {
    id: 'crimson_master',
    name: 'Crimson Master',
    color: 'border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.6)]',
    bg: 'bg-rose-950',
    unlockRequirement: { type: 'level', value: 20, label: 'Unlocks at Level 20' }
  },
  {
    id: 'titanium_aura',
    name: 'Titanium Aura',
    color: 'border-slate-200 shadow-[0_0_15px_rgba(241,245,249,0.7)]',
    bg: 'bg-slate-900',
    unlockRequirement: { type: 'level', value: 25, label: 'Unlocks at Level 25' }
  }
];

export const PROFILE_TITLES = [
  {
    id: 'title_admin_supreme',
    title: '👑 Administrator',
    badgeBg: 'bg-gradient-to-r from-amber-500 via-emerald-500 to-indigo-600 text-slate-950 font-black border-amber-300 shadow-md',
    unlockRequirement: { type: 'adminOnly', value: 'admin', label: '👑 Admin Exclusive' }
  },
  {
    id: 'title_novice',
    title: 'Novice Coder',
    badgeBg: 'bg-slate-800 text-slate-300 border-slate-700',
    unlockRequirement: { type: 'level', value: 1, label: 'Unlocked by default' }
  },
  {
    id: 'title_quiz_master',
    title: 'Quiz Master',
    badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    unlockRequirement: { type: 'level', value: 5, label: 'Unlocks at Level 5' }
  },
  {
    id: 'title_bug_hunter',
    title: 'Bug Hunter',
    badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    unlockRequirement: { type: 'badge', value: 'speed_demon', label: "Unlocks via 'Speed Demon' badge" }
  },
  {
    id: 'title_code_architect',
    title: 'Code Architect',
    badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    unlockRequirement: { type: 'level', value: 10, label: 'Unlocks at Level 10' }
  },
  {
    id: 'title_algorithm_boss',
    title: 'Algorithm Boss',
    badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    unlockRequirement: { type: 'level', value: 15, label: 'Unlocks at Level 15' }
  },
  {
    id: 'title_cyber_hero',
    title: 'Cyber Hero',
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    unlockRequirement: { type: 'badge', value: 'class_hero', label: "Unlocks via 'Class Hero' badge" }
  },
  {
    id: 'title_legendary_dev',
    title: 'Legendary Dev',
    badgeBg: 'bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 font-black border-amber-400',
    unlockRequirement: { type: 'level', value: 25, label: 'Unlocks at Level 25' }
  }
];

export const AVATAR_BACKGROUNDS = [
  {
    id: 'bg_admin_royal',
    name: '👑 Royal Admin Matrix',
    gradient: 'bg-gradient-to-tr from-amber-950 via-purple-950 to-emerald-950',
    preview: 'from-amber-600 via-purple-600 to-emerald-600',
    unlockRequirement: { type: 'adminOnly', value: 'admin', label: '👑 Admin Exclusive' }
  },
  {
    id: 'bg_slate',
    name: 'Slate Dark',
    gradient: 'bg-slate-800',
    preview: 'from-slate-800 to-slate-900',
    unlockRequirement: { type: 'level', value: 1, label: 'Unlocked by default' }
  },
  {
    id: 'bg_indigo',
    name: 'Deep Indigo',
    gradient: 'bg-gradient-to-tr from-indigo-900 via-indigo-950 to-slate-950',
    preview: 'from-indigo-600 to-indigo-900',
    unlockRequirement: { type: 'level', value: 3, label: 'Unlocks at Level 3' }
  },
  {
    id: 'bg_emerald',
    name: 'Emerald Glow',
    gradient: 'bg-gradient-to-tr from-emerald-950 via-teal-900 to-slate-950',
    preview: 'from-emerald-600 to-teal-800',
    unlockRequirement: { type: 'level', value: 7, label: 'Unlocks at Level 7' }
  },
  {
    id: 'bg_amber',
    name: 'Amber Flame',
    gradient: 'bg-gradient-to-tr from-amber-950 via-orange-900 to-slate-950',
    preview: 'from-amber-600 to-orange-800',
    unlockRequirement: { type: 'level', value: 12, label: 'Unlocks at Level 12' }
  },
  {
    id: 'bg_sunset',
    name: 'Neon Sunset',
    gradient: 'bg-gradient-to-tr from-rose-900 via-purple-900 to-indigo-950',
    preview: 'from-rose-600 via-purple-600 to-indigo-800',
    unlockRequirement: { type: 'level', value: 18, label: 'Unlocks at Level 18' }
  },
  {
    id: 'bg_galaxy',
    name: 'Cosmic Galaxy',
    gradient: 'bg-gradient-to-tr from-purple-950 via-indigo-900 to-cyan-950',
    preview: 'from-purple-600 via-indigo-600 to-cyan-600',
    unlockRequirement: { type: 'mysteryBox', value: 'mystery_loot', label: 'Unlocks from Mystery Box' }
  }
];

// Helper: Get border object by ID
export const getBorderObj = (borderId) => {
  return PROFILE_BORDERS.find(b => b.id === borderId) || PROFILE_BORDERS[0];
};

// Helper: Get title object by ID
export const getTitleObj = (titleId) => {
  return PROFILE_TITLES.find(t => t.id === titleId) || PROFILE_TITLES[0];
};

// Helper: Get avatar background object by ID
export const getAvatarBgObj = (bgId) => {
  return AVATAR_BACKGROUNDS.find(b => b.id === bgId) || AVATAR_BACKGROUNDS[0];
};

// Helper: Evaluate whether a specific cosmetic item is unlocked for a user
export const isCosmeticUnlocked = (item, unlockedIds = [], userLevel = 1, userBadges = [], userRole = 'student') => {
  if (!item || !item.unlockRequirement) return true;
  
  // ALL items are unlocked for Admin users!
  if (userRole === 'admin') {
    return true;
  }

  // Default items are always unlocked
  if (item.id === 'default' || item.id === 'title_novice' || item.id === 'bg_slate') {
    return true;
  }

  // Admin-only items are ONLY unlocked for admins
  if (item.unlockRequirement?.type === 'adminOnly') {
    return userRole === 'admin';
  }

  // Explicitly unlocked array check
  if (Array.isArray(unlockedIds) && unlockedIds.includes(item.id)) {
    return true;
  }

  const { type, value } = item.unlockRequirement;

  if (type === 'level') {
    return userLevel >= (typeof value === 'number' ? value : 1);
  }

  if (type === 'badge') {
    return Array.isArray(userBadges) && userBadges.includes(value);
  }

  if (type === 'mysteryBox') {
    return Array.isArray(unlockedIds) && unlockedIds.includes(item.id);
  }

  return false;
};

// Helper: Auto-unlock eligible cosmetics for user based on current level, badges, and role
export const autoCheckEligibleCosmetics = (user) => {
  if (!user) return { updatedUserDoc: {}, newlyUnlockedNames: [] };

  const userRole = user.role || 'student';
  const funPoints = user.funPoints || 450;
  const userLevel = Math.floor(funPoints / 200) + 1;
  const userBadges = user.unlockedBadges || ['first_spin', 'poll_voter'];

  let currentUnlockedBorders = user.unlockedBorderIds || ['default'];
  let currentUnlockedTitles = user.unlockedTitleIds || ['title_novice'];
  let currentUnlockedAvatarBgs = user.unlockedAvatarBgIds || ['bg_slate'];

  // Guarantee defaults are present
  if (!currentUnlockedBorders.includes('default')) currentUnlockedBorders = ['default', ...currentUnlockedBorders];
  if (!currentUnlockedTitles.includes('title_novice')) currentUnlockedTitles = ['title_novice', ...currentUnlockedTitles];
  if (!currentUnlockedAvatarBgs.includes('bg_slate')) currentUnlockedAvatarBgs = ['bg_slate', ...currentUnlockedAvatarBgs];

  const newlyUnlockedNames = [];
  const nextUnlockedBorders = [...currentUnlockedBorders];
  const nextUnlockedTitles = [...currentUnlockedTitles];
  const nextUnlockedAvatarBgs = [...currentUnlockedAvatarBgs];

  PROFILE_BORDERS.forEach(b => {
    if (!nextUnlockedBorders.includes(b.id) && isCosmeticUnlocked(b, currentUnlockedBorders, userLevel, userBadges, userRole)) {
      nextUnlockedBorders.push(b.id);
      newlyUnlockedNames.push(`Border: ${b.name}`);
    }
  });

  PROFILE_TITLES.forEach(t => {
    if (!nextUnlockedTitles.includes(t.id) && isCosmeticUnlocked(t, currentUnlockedTitles, userLevel, userBadges, userRole)) {
      nextUnlockedTitles.push(t.id);
      newlyUnlockedNames.push(`Title: ${t.title}`);
    }
  });

  AVATAR_BACKGROUNDS.forEach(bg => {
    if (!nextUnlockedAvatarBgs.includes(bg.id) && isCosmeticUnlocked(bg, currentUnlockedAvatarBgs, userLevel, userBadges, userRole)) {
      nextUnlockedAvatarBgs.push(bg.id);
      newlyUnlockedNames.push(`Avatar Background: ${bg.name}`);
    }
  });

  const changed = 
    nextUnlockedBorders.length !== (user.unlockedBorderIds || []).length ||
    nextUnlockedTitles.length !== (user.unlockedTitleIds || []).length ||
    nextUnlockedAvatarBgs.length !== (user.unlockedAvatarBgIds || []).length;

  return {
    changed,
    newlyUnlockedNames,
    updatedUserDoc: {
      unlockedBorderIds: nextUnlockedBorders,
      unlockedTitleIds: nextUnlockedTitles,
      unlockedAvatarBgIds: nextUnlockedAvatarBgs
    }
  };
};

