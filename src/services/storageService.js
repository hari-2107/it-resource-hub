import {
  INITIAL_MATERIALS,
  INITIAL_AI_TOOLS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_TIMETABLES,
  INITIAL_SUBJECTS,
  INITIAL_SUGGESTIONS,
  INITIAL_REPORTS,
  INITIAL_PLACEMENT_COMPANIES,
  INITIAL_INTERVIEW_EXPERIENCES,
  INITIAL_PLACEMENT_RESOURCES,
  INITIAL_EVENTS,
  INITIAL_BROADCASTS,
  INITIAL_THIS_OR_THAT,
  INITIAL_IT_FACTS,
  INITIAL_JAVA_LEVELS,
  INITIAL_JAVA_ACADEMY,
  INITIAL_PAGE_CONTROLS,
  DEMO_USERS,
  getYearFromSemester
} from '../data/mockData';

const LOCAL_STORAGE_KEYS = {
  SUBJECTS: 'it_hub_subjects_v1',
  MATERIALS: 'it_hub_materials_v1',
  AI_TOOLS: 'it_hub_ai_tools_v2',
  ANNOUNCEMENTS: 'it_hub_announcements_v1',
  TIMETABLES: 'it_hub_timetables_v40',
  CUSTOM_TIMETABLES: 'it_hub_custom_timetables_v40',
  FAVORITES: 'it_hub_favorites_v1',
  STUDENT_MARKS: 'it_hub_student_marks_v1',
  CURRENT_USER: 'it_hub_current_user_v1',
  CUSTOM_USERS: 'it_hub_custom_users_v1',
  SUGGESTIONS: 'it_hub_suggestions_v1',
  REPORTS: 'it_hub_reports_v1',
  PLACEMENT_COMPANIES: 'it_hub_placement_companies_v2',
  INTERVIEW_EXPERIENCES: 'it_hub_interview_experiences_v1',
  PLACEMENT_RESOURCES: 'it_hub_placement_resources_v2',
  EVENTS: 'it_hub_events_v1',
  RATINGS: 'it_hub_ratings_v1',
  USER_RESUMES: 'it_hub_user_resumes_v1',
  BROADCASTS: 'it_hub_broadcasts_v1',
  DISMISSED_BROADCASTS: 'it_hub_dismissed_broadcasts_v1',
  THIS_OR_THAT: 'it_hub_this_or_that_v1',
  ACTIVITY_LOG: 'it_hub_admin_activity_log_v1',
  SITE_CONFIG: 'it_hub_site_config_v1',
  QUIZ_QUESTIONS: 'it_hub_quiz_questions_v1',
  IT_FACTS: 'it_hub_it_facts_v1',
  GUESS_OUTPUT: 'it_hub_guess_output_v1',
  FIND_BUG: 'it_hub_find_bug_v1',
  WEEKLY_MISSIONS: 'it_hub_weekly_missions_v1',
  BADGES: 'it_hub_badges_v1',
  MYSTERY_REWARDS: 'it_hub_mystery_rewards_v1',
  ECG_CHALLENGES: 'it_hub_ecg_challenges_v1',
  TANGO_PUZZLES: 'it_hub_tango_puzzles_v1',
  SPEED_TYPE_PROMPTS: 'it_hub_speed_type_prompts_v1',
  JAVA_LEVELS: 'it_hub_java_levels_v1',
  JAVA_ACTIVITY: 'it_hub_java_activity_v1',
  JAVA_ACADEMY: 'it_hub_java_academy_v1',
  PAGE_CONTROLS: 'it_hub_page_controls_v1'
};

// Helper: safe JSON parse
const getItemParsed = (key, fallback) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (err) {
    console.error(`Error reading ${key} from localStorage:`, err);
    return fallback;
  }
};

const setItemJson = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error writing ${key} to localStorage:`, err);
  }
};

export const StorageService = {
  // Initialize default data if empty
  initDefaults: () => {
    if (!localStorage.getItem(LOCAL_STORAGE_KEYS.MATERIALS)) {
      setItemJson(LOCAL_STORAGE_KEYS.MATERIALS, INITIAL_MATERIALS);
    }
    if (!localStorage.getItem(LOCAL_STORAGE_KEYS.AI_TOOLS)) {
      setItemJson(LOCAL_STORAGE_KEYS.AI_TOOLS, INITIAL_AI_TOOLS);
    }
    if (!localStorage.getItem(LOCAL_STORAGE_KEYS.ANNOUNCEMENTS)) {
      setItemJson(LOCAL_STORAGE_KEYS.ANNOUNCEMENTS, INITIAL_ANNOUNCEMENTS);
    }
    if (!localStorage.getItem(LOCAL_STORAGE_KEYS.TIMETABLES)) {
      setItemJson(LOCAL_STORAGE_KEYS.TIMETABLES, INITIAL_TIMETABLES);
    }
    if (!localStorage.getItem(LOCAL_STORAGE_KEYS.CUSTOM_USERS)) {
      setItemJson(LOCAL_STORAGE_KEYS.CUSTOM_USERS, [DEMO_USERS.student, DEMO_USERS.admin]);
    }
    if (!localStorage.getItem(LOCAL_STORAGE_KEYS.SUGGESTIONS)) {
      setItemJson(LOCAL_STORAGE_KEYS.SUGGESTIONS, INITIAL_SUGGESTIONS);
    }
    if (!localStorage.getItem(LOCAL_STORAGE_KEYS.SUBJECTS)) {
      setItemJson(LOCAL_STORAGE_KEYS.SUBJECTS, INITIAL_SUBJECTS);
    }
    if (!localStorage.getItem(LOCAL_STORAGE_KEYS.REPORTS)) {
      setItemJson(LOCAL_STORAGE_KEYS.REPORTS, INITIAL_REPORTS);
    }
    if (!localStorage.getItem(LOCAL_STORAGE_KEYS.BROADCASTS)) {
      setItemJson(LOCAL_STORAGE_KEYS.BROADCASTS, INITIAL_BROADCASTS);
    }
    if (!localStorage.getItem(LOCAL_STORAGE_KEYS.EVENTS)) {
      setItemJson(LOCAL_STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
    }
  },

  // Auth User Management
  getCurrentUser: () => getItemParsed(LOCAL_STORAGE_KEYS.CURRENT_USER, null),
  setCurrentUser: (user) => {
    if (user) {
      setItemJson(LOCAL_STORAGE_KEYS.CURRENT_USER, user);
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEYS.CURRENT_USER);
    }
  },
  getCustomUsers: () => getItemParsed(LOCAL_STORAGE_KEYS.CUSTOM_USERS, [DEMO_USERS.student, DEMO_USERS.admin]),
  saveCustomUser: (userObj) => {
    const list = StorageService.getCustomUsers();
    const updated = [userObj, ...list.filter(u => (u.uid && u.uid === userObj.uid) || (u.email && u.email === userObj.email) ? false : true)];
    setItemJson(LOCAL_STORAGE_KEYS.CUSTOM_USERS, updated);
    return updated;
  },

  // Subjects
  getSubjects: () => {
    const list = getItemParsed(LOCAL_STORAGE_KEYS.SUBJECTS, INITIAL_SUBJECTS);
    // Sanitize subjects to ensure year strictly matches semester
    return (list || []).map(s => {
      const sem = Number(s.semester) || 5;
      const correctYear = getYearFromSemester(sem);
      return { ...s, semester: sem, year: correctYear };
    });
  },
  saveSubject: (subjectData) => {
    const list = StorageService.getSubjects();
    const sem = Number(subjectData.semester) || 5;
    const year = getYearFromSemester(sem);

    const subjectToSave = {
      id: subjectData.id || `sub-${Date.now()}`,
      name: subjectData.name || '',
      code: subjectData.code || '',
      year: year,
      semester: sem,
      type: subjectData.type || 'Theory'
    };

    const existingIdx = list.findIndex(s => s.id === subjectToSave.id);
    let updated;
    if (existingIdx >= 0) {
      updated = list.map((s, idx) => idx === existingIdx ? { ...s, ...subjectToSave } : s);
    } else {
      updated = [subjectToSave, ...list];
    }
    setItemJson(LOCAL_STORAGE_KEYS.SUBJECTS, updated);
    return updated;
  },
  deleteSubject: (subjectId) => {
    const list = StorageService.getSubjects();
    const updated = list.filter(s => s.id !== subjectId);
    setItemJson(LOCAL_STORAGE_KEYS.SUBJECTS, updated);
    return updated;
  },

  // Helper for current date & time
  getFormattedNow: () => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return { dateStr, timeStr, display: `${dateStr} • ${timeStr}` };
  },

  // Materials
  getMaterials: () => getItemParsed(LOCAL_STORAGE_KEYS.MATERIALS, INITIAL_MATERIALS),
  saveMaterial: (material, changeNote = 'Updated document details', updatedBy = 'Admin') => {
    const list = StorageService.getMaterials();
    const existingIndex = list.findIndex(m => m.id === material.id);
    const { dateStr, timeStr } = StorageService.getFormattedNow();
    let updated;
    if (existingIndex >= 0) {
      const prevDoc = list[existingIndex];
      const prevHistory = prevDoc.versionHistory || [];
      const historySnapshot = { ...prevDoc };
      delete historySnapshot.versionHistory;

      const newVersionEntry = {
        id: `ver-${Date.now()}`,
        versionNumber: prevHistory.length + 1,
        updatedAt: new Date().toISOString(),
        updatedBy: material.updatedBy || updatedBy,
        changeNote: material.changeNote || changeNote,
        snapshot: historySnapshot
      };

      updated = [...list];
      updated[existingIndex] = {
        ...prevDoc,
        ...material,
        updatedDate: dateStr,
        updatedTime: timeStr,
        versionHistory: [newVersionEntry, ...prevHistory]
      };
    } else {
      const newMaterial = {
        ...material,
        id: `mat-${Date.now()}`,
        downloadCount: 0,
        uploadDate: dateStr,
        uploadTime: timeStr,
        updatedDate: dateStr,
        updatedTime: timeStr,
        versionHistory: []
      };
      updated = [newMaterial, ...list];
    }
    setItemJson(LOCAL_STORAGE_KEYS.MATERIALS, updated);
    return updated;
  },
  deleteMaterial: (id) => {
    const list = StorageService.getMaterials().filter(m => m.id !== id);
    setItemJson(LOCAL_STORAGE_KEYS.MATERIALS, list);
    return list;
  },
  incrementDownloadCount: (id) => {
    const list = StorageService.getMaterials();
    const item = list.find(m => m.id === id);
    if (item) {
      item.downloadCount = (item.downloadCount || 0) + 1;
      setItemJson(LOCAL_STORAGE_KEYS.MATERIALS, list);
    }
    return list;
  },
  incrementMaterialView: (id, userName) => {
    const list = StorageService.getMaterials();
    const item = list.find(m => m.id === id);
    if (item) {
      const viewer = userName || 'Student Member';
      if (!Array.isArray(item.viewedBy)) {
        item.viewedBy = ['Alex Morgan', 'Rahul Sharma', 'Priya Patel', 'Siddharth V'];
      }
      if (!item.viewedBy.includes(viewer)) {
        item.viewedBy.push(viewer);
      }
      item.viewCount = (item.viewCount || item.viewedBy.length) + 1;
      setItemJson(LOCAL_STORAGE_KEYS.MATERIALS, list);
    }
    return list;
  },

  // AI Tools
  getAITools: () => {
    const list = getItemParsed(LOCAL_STORAGE_KEYS.AI_TOOLS, INITIAL_AI_TOOLS);
    if (!Array.isArray(list) || list.length === 0) return INITIAL_AI_TOOLS;

    const listMap = new Map(list.map(t => [t.name?.toLowerCase(), t]));
    let hasNew = false;

    INITIAL_AI_TOOLS.forEach(seeded => {
      if (!listMap.has(seeded.name?.toLowerCase())) {
        listMap.set(seeded.name?.toLowerCase(), seeded);
        hasNew = true;
      }
    });

    const combined = Array.from(listMap.values());
    if (hasNew) {
      setItemJson(LOCAL_STORAGE_KEYS.AI_TOOLS, combined);
    }
    return combined;
  },
  saveAITool: (tool) => {
    const list = StorageService.getAITools();
    const existingIndex = list.findIndex(t => t.id === tool.id);
    const { dateStr, timeStr } = StorageService.getFormattedNow();
    let updated;
    if (existingIndex >= 0) {
      updated = [...list];
      updated[existingIndex] = { ...updated[existingIndex], ...tool, addedDate: dateStr, addedTime: timeStr };
    } else {
      const newTool = {
        ...tool,
        id: `tool-${Date.now()}`,
        addedDate: dateStr,
        addedTime: timeStr,
        featured: tool.featured || false
      };
      updated = [newTool, ...list];
    }
    setItemJson(LOCAL_STORAGE_KEYS.AI_TOOLS, updated);
    return updated;
  },
  deleteAITool: (id) => {
    const list = StorageService.getAITools().filter(t => t.id !== id);
    setItemJson(LOCAL_STORAGE_KEYS.AI_TOOLS, list);
    return list;
  },

  // Announcements
  getAnnouncements: () => getItemParsed(LOCAL_STORAGE_KEYS.ANNOUNCEMENTS, INITIAL_ANNOUNCEMENTS),
  saveAnnouncement: (announcement, changeNote = 'Updated notice content', updatedBy = 'Admin') => {
    const list = StorageService.getAnnouncements();
    const existingIndex = list.findIndex(a => a.id === announcement.id);
    const { dateStr, timeStr } = StorageService.getFormattedNow();
    const nowIso = new Date().toISOString();
    let updated;

    const isSpecial = announcement.category === 'Special Announcement' || announcement.type === 'special' || announcement.priority === 'Special';

    if (existingIndex >= 0) {
      const prevDoc = list[existingIndex];
      const prevHistory = prevDoc.versionHistory || [];
      const historySnapshot = { ...prevDoc };
      delete historySnapshot.versionHistory;

      const newVersionEntry = {
        id: `ver-${Date.now()}`,
        versionNumber: prevHistory.length + 1,
        updatedAt: nowIso,
        updatedBy: announcement.updatedBy || updatedBy,
        changeNote: announcement.changeNote || changeNote,
        snapshot: historySnapshot
      };

      updated = [...list];
      updated[existingIndex] = {
        ...prevDoc,
        ...announcement,
        type: isSpecial ? 'special' : (announcement.type || prevDoc.type || 'normal'),
        priority: announcement.priority || (isSpecial ? 'Special' : 'Medium'),
        isPinned: announcement.isPinned !== undefined ? announcement.isPinned : (isSpecial ? true : prevDoc.isPinned),
        createdBy: announcement.createdBy || prevDoc.createdBy || announcement.author || updatedBy,
        author: announcement.author || prevDoc.author || announcement.createdBy || updatedBy,
        date: dateStr,
        time: timeStr,
        updatedAt: nowIso,
        versionHistory: [newVersionEntry, ...prevHistory]
      };
    } else {
      const newAnn = {
        ...announcement,
        id: announcement.id || `ann-${Date.now()}`,
        type: isSpecial ? 'special' : (announcement.type || 'normal'),
        priority: announcement.priority || (isSpecial ? 'Special' : 'Medium'),
        isPinned: announcement.isPinned !== undefined ? announcement.isPinned : (isSpecial ? true : false),
        createdBy: announcement.createdBy || announcement.author || updatedBy,
        author: announcement.author || announcement.createdBy || updatedBy,
        date: dateStr,
        time: timeStr,
        createdAt: nowIso,
        updatedAt: nowIso,
        viewCount: 1,
        viewedBy: [],
        versionHistory: []
      };
      updated = [newAnn, ...list];
    }
    setItemJson(LOCAL_STORAGE_KEYS.ANNOUNCEMENTS, updated);
    return updated;
  },
  deleteAnnouncement: (id) => {
    const list = StorageService.getAnnouncements().filter(a => a.id !== id);
    setItemJson(LOCAL_STORAGE_KEYS.ANNOUNCEMENTS, list);
    return list;
  },
  togglePinAnnouncement: (id) => {
    const list = StorageService.getAnnouncements();
    const item = list.find(a => a.id === id);
    if (item) {
      item.isPinned = !item.isPinned;
      setItemJson(LOCAL_STORAGE_KEYS.ANNOUNCEMENTS, list);
    }
    return list;
  },
  incrementAnnouncementView: (id, userName) => {
    const list = StorageService.getAnnouncements();
    const item = list.find(a => a.id === id);
    if (item) {
      const viewer = userName || 'Student Member';
      if (!Array.isArray(item.viewedBy)) {
        item.viewedBy = ['Alex Morgan', 'Rahul Sharma', 'Priya Patel', 'Prof. Sarah'];
      }
      if (!item.viewedBy.includes(viewer)) {
        item.viewedBy.push(viewer);
      }
      item.viewCount = (item.viewCount || item.viewedBy.length) + 1;
      setItemJson(LOCAL_STORAGE_KEYS.ANNOUNCEMENTS, list);
    }
    return list;
  },

  // Timetables
  getTimetables: () => {
    let list = getItemParsed(LOCAL_STORAGE_KEYS.TIMETABLES, INITIAL_TIMETABLES);
    if (!Array.isArray(list) || list.length === 0) {
      list = INITIAL_TIMETABLES;
    }

    // Ensure initial internal and semester timetables exist in list
    const hasInt = list.some(t => t.type === 'internal');
    const hasSem = list.some(t => t.type === 'semester');

    if (!hasInt || !hasSem) {
      INITIAL_TIMETABLES.forEach(initTt => {
        if (!list.some(t => t.id === initTt.id)) {
          list.push(initTt);
        }
      });
      setItemJson(LOCAL_STORAGE_KEYS.TIMETABLES, list);
    }

    const vsbDefault = INITIAL_TIMETABLES.find(t => t.id === 'tt-1');
    if (vsbDefault) {
      const idx = list.findIndex(t => (t.type || 'class') === 'class' && t.year === '3rd Year' && Number(t.semester) === 5 && (t.classSection?.toLowerCase() === 'it-a' || t.classSection?.toLowerCase() === 'it-3a'));
      if (idx >= 0 && (!list[idx].schedule?.Monday?.[0]?.subject?.includes('FSWD') || !list[idx].college)) {
        list[idx] = { ...list[idx], ...vsbDefault };
      }
    }
    return list;
  },
  saveTimetable: (timetable, changeNote = 'Updated schedule', updatedBy = 'Admin') => {
    const list = StorageService.getTimetables();
    const type = timetable.type || 'class';
    const status = timetable.status || 'active';

    const ttData = {
      ...timetable,
      type,
      status,
      updatedDate: new Date().toISOString().split('T')[0]
    };

    let existingIndex = -1;
    if (timetable.id) {
      existingIndex = list.findIndex(t => t.id === timetable.id);
    } else if (type === 'class') {
      existingIndex = list.findIndex(t =>
        (t.type || 'class') === 'class' &&
        t.year === timetable.year &&
        Number(t.semester) === Number(timetable.semester) &&
        (t.classSection || '').toLowerCase() === (timetable.classSection || '').toLowerCase()
      );
    } else if (type === 'internal') {
      existingIndex = list.findIndex(t =>
        t.type === 'internal' &&
        t.year === timetable.year &&
        Number(t.semester) === Number(timetable.semester) &&
        (t.classSection || 'IT-A').toLowerCase() === (timetable.classSection || 'IT-A').toLowerCase() &&
        (t.internalName || t.title || '').toLowerCase().includes((timetable.internalName || 'Internal 1').toLowerCase())
      );
    } else if (type === 'semester') {
      existingIndex = list.findIndex(t =>
        t.type === 'semester' &&
        t.year === timetable.year &&
        Number(t.semester) === Number(timetable.semester) &&
        (t.classSection || 'IT-A').toLowerCase() === (timetable.classSection || 'IT-A').toLowerCase()
      );
    }

    let updated;

    if (existingIndex >= 0) {
      const prevDoc = list[existingIndex];
      const prevHistory = prevDoc.versionHistory || [];
      const historySnapshot = { ...prevDoc };
      delete historySnapshot.versionHistory;

      const newVersionEntry = {
        id: `ver-${Date.now()}`,
        versionNumber: prevHistory.length + 1,
        updatedAt: new Date().toISOString(),
        updatedBy: timetable.updatedBy || updatedBy,
        changeNote: timetable.changeNote || changeNote,
        snapshot: historySnapshot
      };

      updated = [...list];
      updated[existingIndex] = {
        ...prevDoc,
        ...ttData,
        versionHistory: [newVersionEntry, ...prevHistory]
      };
    } else {
      const newId = `tt-${type}-${Date.now()}`;
      updated = [{ ...ttData, id: newId, versionHistory: [] }, ...list];
    }

    // Auto-archiving logic: If this timetable is active, set other timetables of same type & group to archived
    if (status === 'active') {
      const activeId = existingIndex >= 0 ? list[existingIndex].id : updated[0].id;
      updated = updated.map(t => {
        if (t.id === activeId) return t;

        const sameType = (t.type || 'class') === type;
        const sameYear = t.year === timetable.year;
        const sameSem = Number(t.semester) === Number(timetable.semester);
        const sameSection = (t.classSection || 'IT-A').toLowerCase() === (timetable.classSection || 'IT-A').toLowerCase();

        if (sameType && sameYear && sameSem && sameSection) {
          // For internal timetables, only archive if it's the SAME internal test name (e.g. Internal 1 vs Internal 1)
          if (type === 'internal') {
            const tInternalName = (t.internalName || t.title || '').toLowerCase();
            const newInternalName = (timetable.internalName || 'Internal 1').toLowerCase();
            const isSameTest = (tInternalName.includes('1') && newInternalName.includes('1')) ||
              (tInternalName.includes('2') && newInternalName.includes('2')) ||
              tInternalName === newInternalName;
            if (isSameTest) {
              return { ...t, status: 'archived' };
            }
            return t;
          }
          return { ...t, status: 'archived' };
        }
        return t;
      });
    }

    setItemJson(LOCAL_STORAGE_KEYS.TIMETABLES, updated);
    return updated;
  },
  deleteTimetable: (id) => {
    const list = StorageService.getTimetables();
    const updated = list.filter(t => t.id !== id);
    setItemJson(LOCAL_STORAGE_KEYS.TIMETABLES, updated);
    return updated;
  },
  setTimetableStatus: (id, newStatus) => {
    const list = StorageService.getTimetables();
    const target = list.find(t => t.id === id);
    if (!target) return list;

    let updated = list.map(t => {
      if (t.id === id) {
        return { ...t, status: newStatus, updatedDate: new Date().toISOString().split('T')[0] };
      }
      return t;
    });

    if (newStatus === 'active') {
      const type = target.type || 'class';
      updated = updated.map(t => {
        if (
          t.id !== id &&
          (t.type || 'class') === type &&
          t.year === target.year &&
          Number(t.semester) === Number(target.semester) &&
          (t.classSection || 'IT-A').toLowerCase() === (target.classSection || 'IT-A').toLowerCase()
        ) {
          return { ...t, status: 'archived' };
        }
        return t;
      });
    }

    setItemJson(LOCAL_STORAGE_KEYS.TIMETABLES, updated);
    return updated;
  },
  getCustomStudentTimetable: (userId) => {
    const map = getItemParsed(LOCAL_STORAGE_KEYS.CUSTOM_TIMETABLES, {});
    return map[userId] || null;
  },
  saveCustomStudentTimetable: (userId, timetable) => {
    const map = getItemParsed(LOCAL_STORAGE_KEYS.CUSTOM_TIMETABLES, {});
    map[userId] = timetable;
    setItemJson(LOCAL_STORAGE_KEYS.CUSTOM_TIMETABLES, map);
    return timetable;
  },
  deleteCustomStudentTimetable: (userId) => {
    const map = getItemParsed(LOCAL_STORAGE_KEYS.CUSTOM_TIMETABLES, {});
    delete map[userId];
    setItemJson(LOCAL_STORAGE_KEYS.CUSTOM_TIMETABLES, map);
    return null;
  },

  // Favorites
  getFavorites: (userId) => {
    const favMap = getItemParsed(LOCAL_STORAGE_KEYS.FAVORITES, {});
    return favMap[userId] || { materialIds: [], aiToolIds: [] };
  },
  toggleFavorite: (userId, type, itemId) => {
    const favMap = getItemParsed(LOCAL_STORAGE_KEYS.FAVORITES, {});
    const userFavs = favMap[userId] || { materialIds: [], aiToolIds: [] };
    const arrayKey = type === 'material' ? 'materialIds' : 'aiToolIds';

    const exists = userFavs[arrayKey].includes(itemId);
    if (exists) {
      userFavs[arrayKey] = userFavs[arrayKey].filter(id => id !== itemId);
    } else {
      userFavs[arrayKey] = [...userFavs[arrayKey], itemId];
    }

    favMap[userId] = userFavs;
    setItemJson(LOCAL_STORAGE_KEYS.FAVORITES, favMap);
    return userFavs;
  },

  // Self Marks Tracker
  getStudentMarks: (userId) => {
    const marksMap = getItemParsed(LOCAL_STORAGE_KEYS.STUDENT_MARKS, {});
    return marksMap[userId] || [
      { id: 'm-1', subject: 'FSWD (Full Stack)', semester: 5, internal1: 44, internal2: 48, maxMarks: 50 },
      { id: 'm-2', subject: 'ESIOT (Embedded & IoT)', semester: 5, internal1: 42, internal2: 45, maxMarks: 50 },
      { id: 'm-3', subject: 'STA (Software Testing)', semester: 5, internal1: 46, internal2: 47, maxMarks: 50 },
      { id: 'm-4', subject: 'BDA (Big Data Analytics)', semester: 5, internal1: 40, internal2: 44, maxMarks: 50 },
      { id: 'm-5', subject: 'CN (Computer Networks)', semester: 5, internal1: 38, internal2: 43, maxMarks: 50 },
      { id: 'm-6', subject: 'DC (Distributed Computing)', semester: 5, internal1: 45, internal2: 46, maxMarks: 50 }
    ];
  },
  saveStudentMark: (userId, markEntry) => {
    const marksMap = getItemParsed(LOCAL_STORAGE_KEYS.STUDENT_MARKS, {});
    const userMarks = marksMap[userId] || [];
    const normSub = (markEntry.subject || '').toLowerCase().trim();
    const index = userMarks.findIndex(m =>
      m.id === markEntry.id ||
      ((m.subject || '').toLowerCase().trim() === normSub && Number(m.semester) === Number(markEntry.semester))
    );

    let updated = [...userMarks];
    if (index >= 0) {
      const existing = userMarks[index];
      updated[index] = {
        ...existing,
        ...markEntry,
        id: existing.id,
        subject: markEntry.subject || existing.subject,
        internal1: markEntry.internal1 !== null && markEntry.internal1 !== undefined && markEntry.internal1 !== ''
          ? Number(markEntry.internal1)
          : existing.internal1,
        internal2: markEntry.internal2 !== null && markEntry.internal2 !== undefined && markEntry.internal2 !== ''
          ? Number(markEntry.internal2)
          : existing.internal2
      };
    } else {
      updated.push({ ...markEntry, id: `m-${Date.now()}` });
    }

    marksMap[userId] = updated;
    setItemJson(LOCAL_STORAGE_KEYS.STUDENT_MARKS, marksMap);
    return updated;
  },
  deleteStudentMark: (userId, markId) => {
    const marksMap = getItemParsed(LOCAL_STORAGE_KEYS.STUDENT_MARKS, {});
    const userMarks = (marksMap[userId] || []).filter(m => m.id !== markId);
    marksMap[userId] = userMarks;
    setItemJson(LOCAL_STORAGE_KEYS.STUDENT_MARKS, marksMap);
    return userMarks;
  },

  // Users & Auth Mock
  getCurrentUser: () => getItemParsed(LOCAL_STORAGE_KEYS.CURRENT_USER, null),
  setCurrentUser: (user) => setItemJson(LOCAL_STORAGE_KEYS.CURRENT_USER, user),
  getCustomUsers: () => getItemParsed(LOCAL_STORAGE_KEYS.CUSTOM_USERS, [DEMO_USERS.student, DEMO_USERS.admin]),
  saveCustomUser: (user) => {
    const users = StorageService.getCustomUsers();
    const filtered = users.filter(u => u.email.toLowerCase() !== user.email.toLowerCase());
    const updated = [...filtered, user];
    setItemJson(LOCAL_STORAGE_KEYS.CUSTOM_USERS, updated);
    return updated;
  },
  saveCustomUsers: (usersList) => {
    setItemJson(LOCAL_STORAGE_KEYS.CUSTOM_USERS, usersList);
    return usersList;
  },
  deleteCustomUser: (identifier) => {
    const users = StorageService.getCustomUsers();
    const updated = users.filter(u => u.uid !== identifier && u.email?.toLowerCase() !== identifier.toLowerCase());
    setItemJson(LOCAL_STORAGE_KEYS.CUSTOM_USERS, updated);
    return updated;
  },

  // Version History Restore
  restoreVersion: (type, docId, versionId, restoredBy = 'Admin') => {
    let list;
    let key;
    if (type === 'material') {
      list = StorageService.getMaterials();
      key = LOCAL_STORAGE_KEYS.MATERIALS;
    } else if (type === 'announcement') {
      list = StorageService.getAnnouncements();
      key = LOCAL_STORAGE_KEYS.ANNOUNCEMENTS;
    } else if (type === 'timetable') {
      list = StorageService.getTimetables();
      key = LOCAL_STORAGE_KEYS.TIMETABLES;
    } else {
      return null;
    }

    const docIndex = list.findIndex(d => d.id === docId);
    if (docIndex < 0) return list;

    const currentDoc = list[docIndex];
    const history = currentDoc.versionHistory || [];
    const targetVersion = history.find(v => v.id === versionId);
    if (!targetVersion || !targetVersion.snapshot) return list;

    // Create history snapshot of current state before rollback
    const currentSnapshot = { ...currentDoc };
    delete currentSnapshot.versionHistory;

    const newHistoryEntry = {
      id: `ver-${Date.now()}`,
      versionNumber: history.length + 1,
      updatedAt: new Date().toISOString(),
      updatedBy: restoredBy,
      changeNote: `Restored to version from ${new Date(targetVersion.updatedAt).toLocaleDateString()}`,
      snapshot: currentSnapshot
    };

    const restoredDoc = {
      ...targetVersion.snapshot,
      id: currentDoc.id,
      updatedDate: new Date().toISOString().split('T')[0],
      versionHistory: [newHistoryEntry, ...history]
    };

    const updatedList = [...list];
    updatedList[docIndex] = restoredDoc;
    setItemJson(key, updatedList);
    return updatedList;
  },

  // Student Suggestions
  getSuggestions: () => getItemParsed(LOCAL_STORAGE_KEYS.SUGGESTIONS, INITIAL_SUGGESTIONS),
  saveSuggestion: (suggestion) => {
    const list = StorageService.getSuggestions();
    const newSug = {
      ...suggestion,
      id: `sug-${Date.now()}`,
      status: 'pending',
      submittedAt: new Date().toISOString().split('T')[0]
    };
    const updated = [newSug, ...list];
    setItemJson(LOCAL_STORAGE_KEYS.SUGGESTIONS, updated);
    return updated;
  },
  updateSuggestionStatus: (id, status) => {
    const list = StorageService.getSuggestions();
    const updated = list.map(s => s.id === id ? { ...s, status } : s);
    setItemJson(LOCAL_STORAGE_KEYS.SUGGESTIONS, updated);
    return updated;
  },
  deleteSuggestion: (id) => {
    const list = StorageService.getSuggestions().filter(s => s.id !== id);
    setItemJson(LOCAL_STORAGE_KEYS.SUGGESTIONS, list);
    return list;
  },

  // Reported Issues
  getReports: () => getItemParsed(LOCAL_STORAGE_KEYS.REPORTS, INITIAL_REPORTS),
  saveReport: (report) => {
    const list = StorageService.getReports();
    const newRep = {
      ...report,
      id: `rep-${Date.now()}`,
      status: 'open',
      reportedAt: new Date().toISOString().split('T')[0]
    };
    const updated = [newRep, ...list];
    setItemJson(LOCAL_STORAGE_KEYS.REPORTS, updated);
    return updated;
  },
  updateReportStatus: (id, status) => {
    const list = StorageService.getReports();
    const updated = list.map(r => r.id === id ? { ...r, status } : r);
    setItemJson(LOCAL_STORAGE_KEYS.REPORTS, updated);
    return updated;
  },
  deleteReport: (id) => {
    const list = StorageService.getReports().filter(r => r.id !== id);
    setItemJson(LOCAL_STORAGE_KEYS.REPORTS, list);
    return list;
  },

  // Placement Companies
  getPlacementCompanies: () => getItemParsed(LOCAL_STORAGE_KEYS.PLACEMENT_COMPANIES, INITIAL_PLACEMENT_COMPANIES),
  savePlacementCompany: (company) => {
    const list = StorageService.getPlacementCompanies();
    const index = list.findIndex(c => c.id === company.id);
    let updated;
    if (index >= 0) {
      updated = [...list];
      updated[index] = { ...updated[index], ...company };
    } else {
      const newComp = { ...company, id: `comp-${Date.now()}` };
      updated = [newComp, ...list];
    }
    setItemJson(LOCAL_STORAGE_KEYS.PLACEMENT_COMPANIES, updated);
    return updated;
  },
  deletePlacementCompany: (id) => {
    const list = StorageService.getPlacementCompanies().filter(c => c.id !== id);
    setItemJson(LOCAL_STORAGE_KEYS.PLACEMENT_COMPANIES, list);
    return list;
  },

  // Interview Experiences
  getInterviewExperiences: () => getItemParsed(LOCAL_STORAGE_KEYS.INTERVIEW_EXPERIENCES, INITIAL_INTERVIEW_EXPERIENCES),
  saveInterviewExperience: (exp) => {
    const list = StorageService.getInterviewExperiences();
    const index = exp.id ? list.findIndex(e => e.id === exp.id) : -1;
    let updated;
    if (index >= 0) {
      updated = [...list];
      updated[index] = { ...updated[index], ...exp };
    } else {
      const newExp = {
        ...exp,
        id: `exp-${Date.now()}`,
        submittedAt: new Date().toISOString().split('T')[0],
        approved: exp.approved !== undefined ? exp.approved : true
      };
      updated = [newExp, ...list];
    }
    setItemJson(LOCAL_STORAGE_KEYS.INTERVIEW_EXPERIENCES, updated);
    return updated;
  },
  updateInterviewExperienceStatus: (id, approved) => {
    const list = StorageService.getInterviewExperiences();
    const updated = list.map(e => e.id === id ? { ...e, approved } : e);
    setItemJson(LOCAL_STORAGE_KEYS.INTERVIEW_EXPERIENCES, updated);
    return updated;
  },
  deleteInterviewExperience: (id) => {
    const list = StorageService.getInterviewExperiences().filter(e => e.id !== id);
    setItemJson(LOCAL_STORAGE_KEYS.INTERVIEW_EXPERIENCES, list);
    return list;
  },

  // Placement Resources
  getPlacementResources: () => getItemParsed(LOCAL_STORAGE_KEYS.PLACEMENT_RESOURCES, INITIAL_PLACEMENT_RESOURCES),
  savePlacementResource: (resource) => {
    const list = StorageService.getPlacementResources();
    const index = resource.id ? list.findIndex(r => r.id === resource.id) : -1;
    let updated;
    if (index >= 0) {
      updated = [...list];
      updated[index] = { ...updated[index], ...resource };
    } else {
      const newRes = { ...resource, id: `res-${Date.now()}` };
      updated = [newRes, ...list];
    }
    setItemJson(LOCAL_STORAGE_KEYS.PLACEMENT_RESOURCES, updated);
    return updated;
  },
  deletePlacementResource: (id) => {
    const list = StorageService.getPlacementResources().filter(r => r.id !== id);
    setItemJson(LOCAL_STORAGE_KEYS.PLACEMENT_RESOURCES, list);
    return list;
  },

  // Java Academy
  getJavaAcademyResources: () => getItemParsed(LOCAL_STORAGE_KEYS.JAVA_ACADEMY, INITIAL_JAVA_ACADEMY),
  saveJavaAcademyResource: (javaRes) => {
    const list = StorageService.getJavaAcademyResources();
    const index = javaRes.id ? list.findIndex(j => j.id === javaRes.id) : -1;
    let updated;
    if (index >= 0) {
      updated = [...list];
      updated[index] = { ...updated[index], ...javaRes };
    } else {
      const newJava = { ...javaRes, id: `java-${Date.now()}` };
      updated = [newJava, ...list];
    }
    setItemJson(LOCAL_STORAGE_KEYS.JAVA_ACADEMY, updated);
    return updated;
  },
  deleteJavaAcademyResource: (id) => {
    const list = StorageService.getJavaAcademyResources().filter(j => j.id !== id);
    setItemJson(LOCAL_STORAGE_KEYS.JAVA_ACADEMY, list);
    return list;
  },

  // Events & Hackathons
  getEvents: () => getItemParsed(LOCAL_STORAGE_KEYS.EVENTS, INITIAL_EVENTS),
  saveEvent: (event) => {
    const list = StorageService.getEvents();
    const index = event.id ? list.findIndex(e => e.id === event.id) : -1;
    const nowIso = new Date().toISOString().split('T')[0];
    let updated;
    if (index >= 0) {
      updated = [...list];
      updated[index] = { ...updated[index], ...event, updatedAt: nowIso };
    } else {
      const newEvt = {
        eventStatus: 'upcoming',
        autoStatusEnabled: true,
        registrationCount: 0,
        ...event,
        id: `evt-${Date.now()}`,
        createdAt: nowIso,
        updatedAt: nowIso
      };
      updated = [newEvt, ...list];
    }
    setItemJson(LOCAL_STORAGE_KEYS.EVENTS, updated);
    return updated;
  },
  saveEvents: (eventsList) => {
    setItemJson(LOCAL_STORAGE_KEYS.EVENTS, eventsList);
    return eventsList;
  },
  deleteEvent: (id) => {
    const list = StorageService.getEvents().filter(e => e.id !== id);
    setItemJson(LOCAL_STORAGE_KEYS.EVENTS, list);
    return list;
  },

  // Ratings & Reviews System
  getRatings: () => getItemParsed(LOCAL_STORAGE_KEYS.RATINGS, []),
  addOrUpdateRating: (targetId, targetType, ratingData) => {
    const list = StorageService.getRatings();
    // ratingData: { userId, userName, stars, comment }
    const existingIndex = list.findIndex(
      r => r.targetId === targetId && r.userId === ratingData.userId
    );
    const { dateStr, timeStr } = StorageService.getFormattedNow();
    let updated;
    if (existingIndex >= 0) {
      updated = [...list];
      updated[existingIndex] = {
        ...updated[existingIndex],
        stars: ratingData.stars,
        comment: ratingData.comment,
        ratedAt: `${dateStr} • ${timeStr}`
      };
    } else {
      const newRating = {
        id: `rat-${Date.now()}`,
        targetId,
        targetType, // 'material' or 'aitool'
        userId: ratingData.userId,
        userName: ratingData.userName || 'Student User',
        stars: ratingData.stars,
        comment: ratingData.comment || '',
        ratedAt: `${dateStr} • ${timeStr}`
      };
      updated = [newRating, ...list];
    }
    setItemJson(LOCAL_STORAGE_KEYS.RATINGS, updated);
    return updated;
  },

  // Resumes Manager
  getUserResumes: (userId) => {
    const allResumes = getItemParsed(LOCAL_STORAGE_KEYS.USER_RESUMES, {});
    return allResumes[userId] || [];
  },
  saveUserResume: (userId, resume) => {
    const allResumes = getItemParsed(LOCAL_STORAGE_KEYS.USER_RESUMES, {});
    const userList = allResumes[userId] || [];
    const index = userList.findIndex(r => r.id === resume.id);
    let updatedList;
    if (index >= 0) {
      updatedList = [...userList];
      updatedList[index] = { ...updatedList[index], ...resume, updatedAt: new Date().toISOString() };
    } else {
      const newResume = {
        ...resume,
        id: `res-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      updatedList = [newResume, ...userList];
    }
    allResumes[userId] = updatedList;
    setItemJson(LOCAL_STORAGE_KEYS.USER_RESUMES, allResumes);
    return updatedList;
  },
  deleteUserResume: (userId, resumeId) => {
    const allResumes = getItemParsed(LOCAL_STORAGE_KEYS.USER_RESUMES, {});
    const userList = allResumes[userId] || [];
    const updatedList = userList.filter(r => r.id !== resumeId);
    allResumes[userId] = updatedList;
    setItemJson(LOCAL_STORAGE_KEYS.USER_RESUMES, allResumes);
    return updatedList;
  },

  // Broadcast Announcements
  getBroadcasts: () => getItemParsed(LOCAL_STORAGE_KEYS.BROADCASTS, INITIAL_BROADCASTS),
  saveBroadcast: (broadcast) => {
    const list = StorageService.getBroadcasts();
    const newBcast = {
      ...broadcast,
      id: broadcast.id || `bcast-${Date.now()}`,
      createdAt: new Date().toISOString(),
      isActive: broadcast.isActive !== undefined ? broadcast.isActive : true
    };
    const updated = [newBcast, ...list];
    setItemJson(LOCAL_STORAGE_KEYS.BROADCASTS, updated);
    return updated;
  },
  updateBroadcast: (id, updatedFields) => {
    const list = StorageService.getBroadcasts();
    const updated = list.map(b => b.id === id ? { ...b, ...updatedFields } : b);
    setItemJson(LOCAL_STORAGE_KEYS.BROADCASTS, updated);
    return updated;
  },
  deleteBroadcast: (id) => {
    const list = StorageService.getBroadcasts().filter(b => b.id !== id);
    setItemJson(LOCAL_STORAGE_KEYS.BROADCASTS, list);
    return list;
  },
  getDismissedBroadcastIds: (userId = 'guest') => {
    const key = `${LOCAL_STORAGE_KEYS.DISMISSED_BROADCASTS}_${userId}`;
    return getItemParsed(key, []);
  },
  dismissBroadcast: (userId = 'guest', broadcastId) => {
    const key = `${LOCAL_STORAGE_KEYS.DISMISSED_BROADCASTS}_${userId}`;
    const dismissed = StorageService.getDismissedBroadcastIds(userId);
    if (!dismissed.includes(broadcastId)) {
      const updated = [...dismissed, broadcastId];
      setItemJson(key, updated);
      return updated;
    }
    return dismissed;
  },

  // This or That Daily Polls
  getThisOrThatPolls: () => getItemParsed(LOCAL_STORAGE_KEYS.THIS_OR_THAT, INITIAL_THIS_OR_THAT),
  saveThisOrThatPoll: (poll) => {
    const list = StorageService.getThisOrThatPolls();
    const newPoll = {
      ...poll,
      id: poll.id || `tot-${Date.now()}`,
      date: poll.date || new Date().toISOString().split('T')[0],
      votesA: poll.votesA || 0,
      votesB: poll.votesB || 0,
      createdAt: new Date().toISOString()
    };
    const updated = [newPoll, ...list.filter(p => p.id !== newPoll.id)];
    setItemJson(LOCAL_STORAGE_KEYS.THIS_OR_THAT, updated);
    return updated;
  },
  voteThisOrThatPoll: (pollId, option) => {
    const list = StorageService.getThisOrThatPolls();
    const updated = list.map(p => {
      if (p.id === pollId) {
        return {
          ...p,
          votesA: option === 'A' ? (p.votesA || 0) + 1 : (p.votesA || 0),
          votesB: option === 'B' ? (p.votesB || 0) + 1 : (p.votesB || 0)
        };
      }
      return p;
    });
    setItemJson(LOCAL_STORAGE_KEYS.THIS_OR_THAT, updated);
    return updated;
  },
  deleteThisOrThatPoll: (pollId) => {
    const list = StorageService.getThisOrThatPolls().filter(p => p.id !== pollId);
    setItemJson(LOCAL_STORAGE_KEYS.THIS_OR_THAT, list);
    return list;
  },

  // Admin Activity Log
  getActivityLog: () => getItemParsed(LOCAL_STORAGE_KEYS.ACTIVITY_LOG, [
    { id: 'act-1', adminId: 'adm-1', adminName: 'Alex Morgan (Admin)', action: "Initialized system security & settings", targetType: 'System', timestamp: new Date().toISOString() },
    { id: 'act-2', adminId: 'adm-1', adminName: 'Alex Morgan (Admin)', action: "Published semester examination timetable", targetType: 'Timetable', timestamp: new Date(Date.now() - 3600000).toISOString() }
  ]),
  logActivity: (entry) => {
    const list = StorageService.getActivityLog();
    const newEntry = {
      ...entry,
      id: entry.id || `act-${Date.now()}`,
      timestamp: entry.timestamp || new Date().toISOString()
    };
    const updated = [newEntry, ...list].slice(0, 100); // keep top 100 log items
    setItemJson(LOCAL_STORAGE_KEYS.ACTIVITY_LOG, updated);
    return updated;
  },

  // Site Configuration & Maintenance Mode & Custom XP Settings
  getSiteConfig: () => {
    const cfg = getItemParsed(LOCAL_STORAGE_KEYS.SITE_CONFIG, {
      brainZoneEnabled: true,
      registrationEnabled: true,
      maintenanceMode: false,
      maintenanceMessage: 'The IT Resource Hub is currently undergoing scheduled maintenance. Please check back shortly.',
      xpSettings: {
        beginnerMultiplier: 1.0,
        intermediateMultiplier: 1.5,
        advancedMultiplier: 2.0,
        beginnerXP: 50,
        intermediateXP: 100,
        advancedXP: 150
      }
    });
    if (!cfg.xpSettings) {
      cfg.xpSettings = {
        beginnerMultiplier: 1.0,
        intermediateMultiplier: 1.5,
        advancedMultiplier: 2.0,
        beginnerXP: 50,
        intermediateXP: 100,
        advancedXP: 150
      };
    }
    return cfg;
  },
  saveSiteConfig: (config) => {
    const current = StorageService.getSiteConfig();
    const updated = { ...current, ...config };
    setItemJson(LOCAL_STORAGE_KEYS.SITE_CONFIG, updated);
    return updated;
  },

  // Weekly Missions Management
  getWeeklyMissions: () => getItemParsed(LOCAL_STORAGE_KEYS.WEEKLY_MISSIONS, [
    { id: 'm-1', title: 'Complete 3 Quick Quizzes', target: 3, progress: 0, reward: 75, category: 'quiz' },
    { id: 'm-2', title: 'Play Spin & Learn 3 times', target: 3, progress: 0, reward: 50, category: 'spin' },
    { id: 'm-3', title: 'Complete 2 Arcade Challenges', target: 2, progress: 0, reward: 100, category: 'game' }
  ]),
  saveWeeklyMission: (mission) => {
    const list = StorageService.getWeeklyMissions();
    const newM = { ...mission, id: mission.id || `m-${Date.now()}` };
    const updated = [newM, ...list.filter(m => m.id !== newM.id)];
    setItemJson(LOCAL_STORAGE_KEYS.WEEKLY_MISSIONS, updated);
    return updated;
  },
  deleteWeeklyMission: (id) => {
    const list = StorageService.getWeeklyMissions().filter(m => m.id !== id);
    setItemJson(LOCAL_STORAGE_KEYS.WEEKLY_MISSIONS, list);
    return list;
  },

  // Badges & Achievements Management
  getBadges: () => getItemParsed(LOCAL_STORAGE_KEYS.BADGES, [
    { id: 'first_spin', title: 'First Spin', icon: '🎡', desc: 'Spin the BrainZone wheel for the first time', target: 1, reward: '+50 XP' },
    { id: 'poll_voter', title: 'Poll Master', icon: '🤔', desc: 'Vote in 5 Daily This or That polls', target: 5, reward: '+100 XP' },
    { id: 'speed_demon', title: 'Speed Demon', icon: '⚡', desc: 'Complete 60-Second Challenge with >80% score', target: 1, reward: '+150 XP' },
    { id: 'streak_fire', title: 'On Fire', icon: '🔥', desc: 'Maintain a 7-day learning streak', target: 7, reward: '+200 XP & Neon Border' },
    { id: 'mystery_hunter', title: 'Mystery Hunter', icon: '🎁', desc: 'Open 3 Daily Mystery Boxes', target: 3, reward: '+75 XP' },
    { id: 'class_hero', title: 'Class Hero', icon: '🏫', desc: 'Contribute to your Class vs Class Leaderboard', target: 1, reward: '+120 XP' }
  ]),
  saveBadge: (badge) => {
    const list = StorageService.getBadges();
    const newB = { ...badge, id: badge.id || `bdg-${Date.now()}` };
    const updated = [newB, ...list.filter(b => b.id !== newB.id)];
    setItemJson(LOCAL_STORAGE_KEYS.BADGES, updated);
    return updated;
  },
  deleteBadge: (id) => {
    const list = StorageService.getBadges().filter(b => b.id !== id);
    setItemJson(LOCAL_STORAGE_KEYS.BADGES, list);
    return list;
  },

  // Mystery Box Rewards Management
  getMysteryRewards: () => getItemParsed(LOCAL_STORAGE_KEYS.MYSTERY_REWARDS, [
    { id: 'mr-1', title: '+150 Super XP Bonus', icon: '💎', rewardType: 'xp', value: 150, rarity: 'Rare', desc: 'Instant +150 XP added to student profile' },
    { id: 'mr-2', title: 'Golden Legend Border', icon: '🎁', rewardType: 'cosmetic', value: 'golden_legend', rarity: 'Legendary', desc: 'Unlocks Golden Legend profile border' },
    { id: 'mr-3', title: '1x Streak Shield', icon: '🛡️', rewardType: 'shield', value: 1, rarity: 'Common', desc: 'Protects learning streak for 1 missed day' },
    { id: 'mr-4', title: '+250 Master XP Loot', icon: '⚡', rewardType: 'xp', value: 250, rarity: 'Legendary', desc: 'Instant +250 XP bonus payout' },
    { id: 'mr-5', title: '+50 Daily Bonus XP', icon: '🌟', rewardType: 'xp', value: 50, rarity: 'Common', desc: 'Instant +50 XP bonus payout' }
  ]),
  saveMysteryReward: (reward) => {
    const list = StorageService.getMysteryRewards();
    const newR = { ...reward, id: reward.id || `mr-${Date.now()}` };
    const updated = [newR, ...list.filter(r => r.id !== newR.id)];
    setItemJson(LOCAL_STORAGE_KEYS.MYSTERY_REWARDS, updated);
    return updated;
  },
  deleteMysteryReward: (id) => {
    const list = StorageService.getMysteryRewards().filter(r => r.id !== id);
    setItemJson(LOCAL_STORAGE_KEYS.MYSTERY_REWARDS, list);
    return list;
  },

  clearActivityLog: () => {
    setItemJson(LOCAL_STORAGE_KEYS.ACTIVITY_LOG, []);
    return [];
  },

  // ISO Week Helper & Content Rotation Helper
  getISOWeekId: (date = new Date()) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
  },

  getFilteredContentForCurrentWeek: (contentList = [], currentWeekBatch = StorageService.getISOWeekId()) => {
    if (!Array.isArray(contentList) || contentList.length === 0) return [];

    // 1. Exact matches for current week batch
    const exactMatches = contentList.filter(item => item.weekBatch === currentWeekBatch);
    if (exactMatches.length > 0) return exactMatches;

    // 2. Fallback to most recent week's content (weekBatch <= currentWeekBatch)
    const pastMatches = contentList
      .filter(item => item.weekBatch && item.weekBatch <= currentWeekBatch)
      .sort((a, b) => b.weekBatch.localeCompare(a.weekBatch));

    if (pastMatches.length > 0) {
      const mostRecentWeek = pastMatches[0].weekBatch;
      return pastMatches.filter(item => item.weekBatch === mostRecentWeek);
    }

    // 3. Ultimate fallback: return full content list if untagged
    return contentList;
  },

  // 60-Second Challenge Quiz Questions
  getQuizQuestions: () => getItemParsed(LOCAL_STORAGE_KEYS.QUIZ_QUESTIONS, [
    { id: 'qq-1', q: "What does API stand for in software engineering?", options: ["Automated Program Interface", "Application Programming Interface", "Advanced Process Integration", "Application Protocol Instruction"], answer: 1, category: "Web Dev", difficulty: "beginner" },
    { id: 'qq-2', q: "Which data structure follows the Last-In, First-Out (LIFO) principle?", options: ["Queue", "Binary Tree", "Stack", "Linked List"], answer: 2, category: "Data Structures", difficulty: "beginner" },
    { id: 'qq-3', q: "What default port does HTTPS protocol use?", options: ["80", "21", "8080", "443"], answer: 3, category: "Networking", difficulty: "beginner" },
    { id: 'qq-4', q: "Which Big-O time complexity represents binary search algorithm?", options: ["O(N)", "O(log N)", "O(N^2)", "O(1)"], answer: 1, category: "Algorithms", difficulty: "intermediate" },
    { id: 'qq-5', q: "Which HTTP status code signifies 'Resource Not Found'?", options: ["200", "403", "404", "500"], answer: 2, category: "Web Dev", difficulty: "beginner" },
    { id: 'qq-6', q: "What is a closure in JavaScript?", options: ["A function retaining access to its outer scope", "Closing a database connection", "Private class constructor", "Asynchronous promise completion"], answer: 0, category: "Web Dev", difficulty: "advanced" },
    { id: 'qq-7', q: "Which sorting algorithm guarantees O(N log N) worst-case time complexity?", options: ["Quick Sort", "Bubble Sort", "Merge Sort", "Insertion Sort"], answer: 2, category: "Algorithms", difficulty: "advanced" },
    { id: 'qq-8', q: "Which SQL clause filters aggregated query results after GROUP BY?", options: ["WHERE", "HAVING", "FILTER", "ORDER BY"], answer: 1, category: "Databases", difficulty: "intermediate" },
    { id: 'qq-9', q: "What protocol handles domain name to IP address resolution?", options: ["DHCP", "DNS", "ARP", "BGP"], answer: 1, category: "Networking", difficulty: "beginner" },
    { id: 'qq-10', q: "What is the primary function of a mutex in concurrent programming?", options: ["Memory allocation", "Prevent race conditions via mutual exclusion", "Task scheduling", "Cache invalidation"], answer: 1, category: "OS & Systems", difficulty: "advanced" },
    { id: 'qq-11', q: "What does HTML stand for?", options: ["Hyper Text Markup Language", "High Tech Multi Language", "Hyperlink Text Management Language", "Home Tool Markup Language"], answer: 0, category: "Web Dev", difficulty: "beginner" },
    { id: 'qq-12', q: "Which Git command creates a new branch and switches to it in one step?", options: ["git branch -new", "git checkout -b", "git switch -create", "git merge -b"], answer: 1, category: "DevOps", difficulty: "beginner" },
    { id: 'qq-13', q: "Which keyword is used to declare a block-scoped reassignable variable in JS?", options: ["var", "let", "const", "static"], answer: 1, category: "Web Dev", difficulty: "beginner" },
    { id: 'qq-14', q: "What is the worst-case time complexity of inserting into a Hashtable?", options: ["O(1)", "O(N)", "O(log N)", "O(N^2)"], answer: 1, category: "Data Structures", difficulty: "intermediate" },
    { id: 'qq-15', q: "Which SQL join returns all records from the left table and matched records from the right?", options: ["INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "FULL OUTER JOIN"], answer: 1, category: "Databases", difficulty: "beginner" },
    { id: 'qq-16', q: "What does CSS property 'display: flex' establish?", options: ["A Flexbox formatting context for children", "Grid layout system", "Absolute positioning container", "Inline inline-block flow"], answer: 0, category: "Web Dev", difficulty: "beginner" },
    { id: 'qq-17', q: "In OOP, what principle allows a subclass to provide a specific implementation of a superclass method?", options: ["Encapsulation", "Polymorphism / Method Overriding", "Abstraction", "Multiple Inheritance"], answer: 1, category: "OOP", difficulty: "intermediate" },
    { id: 'qq-18', q: "Which OSI model layer is responsible for routing IP packets across networks?", options: ["Data Link Layer", "Network Layer", "Transport Layer", "Session Layer"], answer: 1, category: "Networking", difficulty: "intermediate" },
    { id: 'qq-19', q: "What is the main benefit of Virtual DOM in React?", options: ["Replaces Real DOM completely", "Minimizes expensive direct Real DOM updates via diffing", "Enables multithreaded JavaScript", "Stores application data in localStorage"], answer: 1, category: "Web Dev", difficulty: "intermediate" },
    { id: 'qq-20', q: "Which component of an OS manages memory space allocations for processes?", options: ["CPU Scheduler", "Memory Management Unit (MMU)", "File System", "I/O Controller"], answer: 1, category: "OS & Systems", difficulty: "advanced" },
    { id: 'qq-21', q: "What is the default port for HTTP traffic?", options: ["443", "80", "22", "3000"], answer: 1, category: "Networking", difficulty: "beginner" },
    { id: 'qq-22', q: "Which data structure is typically used for Breadth-First Search (BFS) in a graph?", options: ["Stack", "Queue", "Heap", "Hash Set"], answer: 1, category: "Algorithms", difficulty: "intermediate" },
    { id: 'qq-23', q: "What does REST stand for in web architecture?", options: ["Representational State Transfer", "Remote Execution System Task", "Relational Entity Service Protocol", "Responsive Enterprise Software Transfer"], answer: 0, category: "Web Dev", difficulty: "intermediate" },
    { id: 'qq-24', q: "Which hash algorithm is considered cryptographically broken and insecure for passwords?", options: ["SHA-256", "MD5", "Bcrypt", "Argon2"], answer: 1, category: "Cybersecurity", difficulty: "intermediate" },
    { id: 'qq-25', q: "In Docker, what file defines instructions for building a container image?", options: ["docker-compose.yml", "Dockerfile", "package.json", "Container.config"], answer: 1, category: "DevOps", difficulty: "beginner" },
    { id: 'qq-26', q: "What algorithm is used by React to compare two Virtual DOM trees?", options: ["Dijkstra's Algorithm", "Heuristic O(N) Reconciliation Diffing", "Binary Search", "A* Pathfinding"], answer: 1, category: "Web Dev", difficulty: "advanced" },
    { id: 'qq-27', q: "What is a Deadlock in operating systems?", options: ["Infinite loop in process code", "Processes permanently blocked waiting for resources held by each other", "CPU overheating shutdown", "Memory leak overflow"], answer: 1, category: "OS & Systems", difficulty: "advanced" },
    { id: 'qq-28', q: "Which Git command downloads changes from remote and immediately merges into current branch?", options: ["git fetch", "git pull", "git push", "git clone"], answer: 1, category: "DevOps", difficulty: "beginner" },
    { id: 'qq-29', q: "What is ACID in database transactions?", options: ["Atomicity, Consistency, Isolation, Durability", "Asynchronous, Concurrent, Indexed, Distributed", "Automated, Certified, Integrated, Data", "Array, Column, Index, Document"], answer: 0, category: "Databases", difficulty: "advanced" },
    { id: 'qq-30', q: "Which HTTP method is idempotent and intended to update/replace an existing resource?", options: ["POST", "PUT", "DELETE", "GET"], answer: 1, category: "Web Dev", difficulty: "intermediate" }
  ]),
  saveQuizQuestion: (question) => {
    const list = StorageService.getQuizQuestions();
    const newQ = {
      ...question,
      id: question.id || `qq-${Date.now()}`,
      difficulty: question.difficulty || 'intermediate',
      weekBatch: question.weekBatch || StorageService.getISOWeekId()
    };
    const updated = [newQ, ...list.filter(q => q.id !== newQ.id)];
    setItemJson(LOCAL_STORAGE_KEYS.QUIZ_QUESTIONS, updated);
    return updated;
  },
  deleteQuizQuestion: (id) => {
    const list = StorageService.getQuizQuestions().filter(q => q.id !== id);
    setItemJson(LOCAL_STORAGE_KEYS.QUIZ_QUESTIONS, list);
    return list;
  },

  // IT Facts Management
  getITFactsList: () => getItemParsed(LOCAL_STORAGE_KEYS.IT_FACTS, INITIAL_IT_FACTS),
  saveITFact: (factObj) => {
    const list = StorageService.getITFactsList();
    const newFact = {
      ...factObj,
      id: factObj.id || `fact-${Date.now()}`,
      category: factObj.category || 'CS History'
    };
    const updated = [newFact, ...list.filter(f => f.id !== newFact.id)];
    setItemJson(LOCAL_STORAGE_KEYS.IT_FACTS, updated);
    return updated;
  },
  deleteITFact: (id) => {
    const list = StorageService.getITFactsList().filter(f => f.id !== id && f.fact !== id);
    setItemJson(LOCAL_STORAGE_KEYS.IT_FACTS, list);
    return list;
  },

  // Guess The Output Challenges
  getGuessOutputChallenges: () => getItemParsed(LOCAL_STORAGE_KEYS.GUESS_OUTPUT, [
    { id: 'go-b1', difficulty: 'beginner', title: 'JavaScript String Coercion', language: 'javascript', code: 'console.log(1 + "2" + 3);', options: ['"123"', '"6"', '"15"', 'NaN'], answer: 0, explanation: 'Numbers added to strings are converted to strings: 1 + "2" = "12", then "12" + 3 = "123".' },
    { id: 'go-b2', difficulty: 'beginner', title: 'Typeof NaN Operator', language: 'javascript', code: 'console.log(typeof NaN);', options: ['"number"', '"nan"', '"undefined"', '"object"'], answer: 0, explanation: 'In JavaScript, NaN stands for "Not a Number" but its typeof evaluation is surprisingly "number".' },
    { id: 'go-b6', difficulty: 'beginner', title: 'Array Destructuring Default Value', language: 'javascript', code: 'const [a = 1, b = 2] = [10];\nconsole.log(a, b);', options: ['10 2', '1 2', '10 undefined', '1 10'], answer: 0, explanation: 'a takes 10 from array. b has no matching item in [10], so it uses its default value 2.' },
    { id: 'go-i1', difficulty: 'intermediate', title: 'Array Map & parseInt Trick', language: 'javascript', code: 'console.log(["10", "10", "10"].map(parseInt));', options: ['[10, NaN, 2]', '[10, 10, 10]', '[NaN, NaN, NaN]', '[10, 0, 1]'], answer: 0, explanation: 'map passes (element, index). parseInt("10", 0)=10, parseInt("10", 1)=NaN, parseInt("10", 2)=2 (binary).' },
    { id: 'go-i4', difficulty: 'intermediate', title: 'Closure State Retention', language: 'javascript', code: 'function outer() {\n  let count = 0;\n  return () => ++count;\n}\nconst fn = outer();\nfn();\nconsole.log(fn());', options: ['2', '1', '0', 'undefined'], answer: 0, explanation: 'The returned inner arrow function forms a closure over count. First call makes count=1, second call returns 2.' },
    { id: 'go-i9', difficulty: 'intermediate', title: 'Array Fill Shared Reference Trap', language: 'javascript', code: 'const arr = new Array(2).fill({});\narr[0].x = 99;\nconsole.log(arr[1].x);', options: ['99', 'undefined', '0', 'TypeError'], answer: 0, explanation: 'Array.prototype.fill({}) populates every slot with the exact same object reference. Mutating arr[0] mutates arr[1].' },
    { id: 'go-a1', difficulty: 'advanced', title: 'Event Loop Microtask vs Macrotask', language: 'javascript', code: 'setTimeout(() => console.log("Timeout"), 0);\nPromise.resolve().then(() => console.log("Promise"));\nconsole.log("Sync");', options: ['Sync Promise Timeout', 'Sync Timeout Promise', 'Promise Sync Timeout', 'Timeout Sync Promise'], answer: 0, explanation: 'Synchronous code runs first ("Sync"), then microtasks run ("Promise"), then macrotasks run ("Timeout").' },
    { id: 'go-a2', difficulty: 'advanced', title: 'Arrow Function this Context', language: 'javascript', code: 'const obj = {\n  val: 42,\n  getVal: () => this.val\n};\nconsole.log(obj.getVal());', options: ['undefined', '42', 'TypeError', '42 in strict mode'], answer: 0, explanation: 'Arrow functions do not bind their own "this". They inherit "this" from enclosing global scope where val is undefined.' },
    { id: 'go-a11', difficulty: 'advanced', title: 'JS Proxy Get Trap Handler', language: 'javascript', code: 'const p = new Proxy({}, {\n  get: () => 42\n});\nconsole.log(p.foo);', options: ['42', 'undefined', 'TypeError', 'null'], answer: 0, explanation: 'Proxy get handler traps all property reads and returns 42 regardless of the key name accessed.' }
  ]),
  saveGuessOutputChallenge: (obj) => {
    const list = StorageService.getGuessOutputChallenges();
    const newObj = {
      ...obj,
      id: obj.id || `go-${Date.now()}`,
      difficulty: obj.difficulty || 'intermediate',
      weekBatch: obj.weekBatch || StorageService.getISOWeekId()
    };
    const updated = [newObj, ...list.filter(item => item.id !== newObj.id)];
    setItemJson(LOCAL_STORAGE_KEYS.GUESS_OUTPUT, updated);
    return updated;
  },
  deleteGuessOutputChallenge: (id) => {
    const list = StorageService.getGuessOutputChallenges().filter(item => item.id !== id);
    setItemJson(LOCAL_STORAGE_KEYS.GUESS_OUTPUT, list);
    return list;
  },

  // Find The Bug Challenges
  getFindBugChallenges: () => getItemParsed(LOCAL_STORAGE_KEYS.FIND_BUG, [
    { id: 'fb-b1', difficulty: 'beginner', title: 'Infinite Decrement Loop', language: 'javascript', code: 'function countToTen() {\n  for (let i = 0; i < 10; i--) {\n    console.log(i);\n  }\n}', options: ['Line 2: i-- causes infinite loop', 'Line 1: Missing const keyword', 'Line 3: Syntax error in console.log', 'Line 2: Missing semicolon'], answer: 0, explanation: 'i-- decrements i away from 10, causing an infinite loop. It should be i++.' },
    { id: 'fb-b2', difficulty: 'beginner', title: 'Assignment inside Condition', language: 'javascript', code: 'let isLoggedIn = false;\nif (isLoggedIn = true) {\n  console.log("Welcome back!");\n}', options: ['Line 2: Single = assigns value instead of comparing (== or ===)', 'Line 1: Must use const for booleans', 'Line 3: Missing quotes', 'Line 2: Syntax error'], answer: 0, explanation: 'Using single = in condition assigns true to isLoggedIn and evaluates to true. Should use === for comparison.' },
    { id: 'fb-b6', difficulty: 'beginner', title: 'Array Length Truncation Bug', language: 'javascript', code: 'const arr = [10, 20, 30];\narr.length = 0;\nconsole.log(arr[0]);', options: ['Line 2: Setting length to 0 empties the array; arr[0] evaluates to undefined', 'Line 1: Const arrays cannot change length', 'Line 3: arr[0] throws a ReferenceError', 'Line 2: Length property is read-only'], answer: 0, explanation: 'Setting array length property to 0 deletes all elements, making arr[0] return undefined.' },
    { id: 'fb-i1', difficulty: 'intermediate', title: 'Off-By-One Array Indexing', language: 'javascript', code: 'const items = ["Apple", "Banana", "Cherry"];\nfor (let i = 0; i <= items.length; i++) {\n  console.log(items[i].toUpperCase());\n}', options: ['Line 2: i <= items.length accesses out-of-bounds undefined at items[3]', 'Line 3: toUpperCase does not exist on strings', 'Line 1: Const arrays cannot be iterated', 'Line 2: i should start at 1'], answer: 0, explanation: 'items.length is 3. i <= 3 causes i=3 access items[3] (undefined), throwing TypeError on .toUpperCase(). Use i < items.length.' },
    { id: 'fb-i4', difficulty: 'intermediate', title: 'Async Function Missing await', language: 'javascript', code: 'async function fetchUser() {\n  return { name: "Bob" };\n}\nconst user = fetchUser();\nconsole.log(user.name);', options: ['Line 4: fetchUser() returns a Promise, missing await keyword', 'Line 1: Async functions cannot return objects', 'Line 5: user.name is illegal', 'Line 2: Missing JSON parse'], answer: 0, explanation: 'Async functions always return a Promise. Calling fetchUser() without await leaves user as Promise { <pending> }, so user.name is undefined.' },
    { id: 'fb-i9', difficulty: 'intermediate', title: 'Missing Return in Array Map Body', language: 'javascript', code: 'const nums = [1, 2, 3];\nconst doubled = nums.map(n => {\n  n * 2;\n});\nconsole.log(doubled);', options: ['Line 3: Missing return statement inside curly block returns [undefined, undefined, undefined]', 'Line 2: Map cannot double numbers', 'Line 1: nums must be let', 'Line 4: Doubled array cannot be logged'], answer: 0, explanation: 'Arrow functions with curly braces require an explicit return statement. Otherwise, it returns undefined for each element.' },
    { id: 'fb-a1', difficulty: 'advanced', title: 'Promise Race Condition in Loop', language: 'javascript', code: 'async function processItems(items) {\n  items.forEach(async (item) => {\n    await saveToDb(item);\n  });\n  console.log("All Saved!");\n}', options: ['Line 2: forEach does not await async callbacks; console.log runs before saves finish', 'Line 3: saveToDb cannot be awaited inside loop', 'Line 1: processItems must be sync', 'Line 5: console.log is missing await'], answer: 0, explanation: 'Array.prototype.forEach ignores returned Promises. Use for...of or Promise.all(items.map(...)) to await completions.' },
    { id: 'fb-a2', difficulty: 'advanced', title: 'Stale Closure in React Hook', language: 'javascript', code: 'const [count, setCount] = useState(0);\nuseEffect(() => {\n  const id = setInterval(() => {\n    setCount(count + 1);\n  }, 1000);\n  return () => clearInterval(id);\n}, []);', options: ['Line 4: count in closure is stale (0); count stays stuck at 1. Use setCount(c => c + 1)', 'Line 6: Cleanup function is illegal', 'Line 7: Empty dependency array causes memory leak', 'Line 1: useState requires initial string'], answer: 0, explanation: 'Empty dependency array [] captures initial count = 0. Every second setCount(0 + 1) sets count to 1. Use functional updater setCount(c => c + 1).' },
    { id: 'fb-a11', difficulty: 'advanced', title: 'React Asynchronous State Batching Bug', language: 'javascript', code: 'function incrementTwice() {\n  setCount(count + 1);\n  setCount(count + 1);\n}', options: ['Line 3: Sequential state setters use same stale count reference, resulting in single increment. Use setCount(prev => prev + 1)', 'Line 2: setCount cannot be called twice', 'Line 1: Function must be async', 'Line 3: count + 1 is illegal'], answer: 0, explanation: 'State updates in React are batched asynchronously. Calling setCount(count + 1) twice in the same tick uses the same captured count value.' }
  ]),
  saveFindBugChallenge: (obj) => {
    const list = StorageService.getFindBugChallenges();
    const newObj = {
      ...obj,
      id: obj.id || `fb-${Date.now()}`,
      difficulty: obj.difficulty || 'intermediate',
      weekBatch: obj.weekBatch || StorageService.getISOWeekId()
    };
    const updated = [newObj, ...list.filter(item => item.id !== newObj.id)];
    setItemJson(LOCAL_STORAGE_KEYS.FIND_BUG, updated);
    return updated;
  },
  deleteFindBugChallenge: (id) => {
    const list = StorageService.getFindBugChallenges().filter(item => item.id !== id);
    setItemJson(LOCAL_STORAGE_KEYS.FIND_BUG, list);
    return list;
  },

  // Error Code Guessing (ECG) Challenges
  getEcgChallenges: () => getItemParsed(LOCAL_STORAGE_KEYS.ECG_CHALLENGES, [
    { id: 'ecg-b1', code: '404', difficulty: 'beginner', name: 'HTTP 404 Not Found', desc: 'Requested URL or resource does not exist on server', options: ['Not Found', 'Unauthorized', 'Forbidden', 'Server Error'], answer: 0 },
    { id: 'ecg-b2', code: '401', difficulty: 'beginner', name: 'HTTP 401 Unauthorized', desc: 'Request requires valid authentication credentials', options: ['Bad Request', 'Unauthorized', 'Forbidden', 'Internal Server Error'], answer: 1 },
    { id: 'ecg-b3', code: '400', difficulty: 'beginner', name: 'HTTP 400 Bad Request', desc: 'Server cannot process request due to client syntax error', options: ['Forbidden', 'Not Found', 'Bad Request', 'Service Unavailable'], answer: 2 },
    { id: 'ecg-b4', code: '500', difficulty: 'beginner', name: 'HTTP 500 Internal Server Error', desc: 'Unexpected condition encountered on server', options: ['Gateway Timeout', 'Bad Gateway', 'Unauthorized', 'Internal Server Error'], answer: 3 },
    { id: 'ecg-b5', code: '200', difficulty: 'beginner', name: 'HTTP 200 OK', desc: 'Standard response for successful HTTP requests', options: ['OK', 'Created', 'Accepted', 'No Content'], answer: 0 },
    { id: 'ecg-i1', code: '403', difficulty: 'intermediate', name: 'HTTP 403 Forbidden', desc: 'Server understands request but refuses to authorize access', options: ['Forbidden', 'Unauthorized', 'Not Found', 'Bad Request'], answer: 0 },
    { id: 'ecg-i2', code: '503', difficulty: 'intermediate', name: 'HTTP 503 Service Unavailable', desc: 'Server is currently unable to handle request (maintenance/overload)', options: ['Gateway Timeout', 'Service Unavailable', 'Bad Gateway', 'Method Not Allowed'], answer: 1 },
    { id: 'ecg-a1', code: '409', difficulty: 'advanced', name: 'HTTP 409 Conflict', desc: 'Request conflicts with current state of target resource', options: ['Conflict', 'Locked', 'Payload Too Large', 'Unprocessable Entity'], answer: 0 }
  ]),
  saveEcgChallenge: (obj) => {
    const list = StorageService.getEcgChallenges();
    const newObj = {
      ...obj,
      id: obj.id || `ecg-${Date.now()}`,
      difficulty: obj.difficulty || 'intermediate',
      weekBatch: obj.weekBatch || StorageService.getISOWeekId()
    };
    const updated = [newObj, ...list.filter(item => item.id !== newObj.id)];
    setItemJson(LOCAL_STORAGE_KEYS.ECG_CHALLENGES, updated);
    return updated;
  },
  deleteEcgChallenge: (id) => {
    const list = StorageService.getEcgChallenges().filter(item => item.id !== id);
    setItemJson(LOCAL_STORAGE_KEYS.ECG_CHALLENGES, list);
    return list;
  },

  // Tango Logic Grid Puzzles
  getTangoPuzzles: () => getItemParsed(LOCAL_STORAGE_KEYS.TANGO_PUZZLES, [
    { id: 'tango-1', grid: '4x4', difficulty: 'beginner', desc: 'Equal count of ☀️ and 🌙 symbols per row and column (2 of each)!', size: 4, fixed: { '0-0': 'sun', '1-3': 'moon' } },
    { id: 'tango-2', grid: '6x6', difficulty: 'intermediate', desc: 'Equal count of ☀️ and 🌙 symbols per row and column (3 of each)!', size: 6, fixed: { '0-1': 'sun', '2-4': 'moon', '4-2': 'sun', '5-5': 'moon' } },
    { id: 'tango-3', grid: '8x8', difficulty: 'advanced', desc: 'Equal count of ☀️ and 🌙 symbols per row and column (4 of each)!', size: 8, fixed: { '0-2': 'sun', '1-5': 'moon', '3-3': 'sun', '6-1': 'moon', '7-7': 'sun' } }
  ]),
  saveTangoPuzzle: (obj) => {
    const list = StorageService.getTangoPuzzles();
    const newObj = {
      ...obj,
      id: obj.id || `tango-${Date.now()}`,
      difficulty: obj.difficulty || 'intermediate',
      weekBatch: obj.weekBatch || StorageService.getISOWeekId()
    };
    const updated = [newObj, ...list.filter(item => item.id !== newObj.id)];
    setItemJson(LOCAL_STORAGE_KEYS.TANGO_PUZZLES, updated);
    return updated;
  },
  deleteTangoPuzzle: (id) => {
    const list = StorageService.getTangoPuzzles().filter(item => item.id !== id);
    setItemJson(LOCAL_STORAGE_KEYS.TANGO_PUZZLES, list);
    return list;
  },

  // Speed Type Challenge Prompts
  getSpeedTypePrompts: () => getItemParsed(LOCAL_STORAGE_KEYS.SPEED_TYPE_PROMPTS, [
    { id: 'type-1', difficulty: 'beginner', snippet: `const calculateTotal = (price, tax) => {\n  return price + (price * tax);\n};`, lang: 'JavaScript', targetWpm: 30 },
    { id: 'type-2', difficulty: 'intermediate', snippet: `function binarySearch(arr, target) {\n  let left = 0, right = arr.length - 1;\n  while (left <= right) {\n    const mid = Math.floor((left + right) / 2);\n    if (arr[mid] === target) return mid;\n    if (arr[mid] < target) left = mid + 1;\n    else right = mid - 1;\n  }\n  return -1;\n}`, lang: 'JavaScript', targetWpm: 45 },
    { id: 'type-3', difficulty: 'advanced', snippet: `export const useDebounce = (value, delay) => {\n  const [debounced, setDebounced] = useState(value);\n  useEffect(() => {\n    const handler = setTimeout(() => {\n      setDebounced(value);\n    }, delay);\n    return () => clearTimeout(handler);\n  }, [value, delay]);\n  return debounced;\n};`, lang: 'React', targetWpm: 60 }
  ]),
  saveSpeedTypePrompt: (obj) => {
    const list = StorageService.getSpeedTypePrompts();
    const newObj = {
      ...obj,
      id: obj.id || `type-${Date.now()}`,
      difficulty: obj.difficulty || 'intermediate',
      weekBatch: obj.weekBatch || StorageService.getISOWeekId()
    };
    const updated = [newObj, ...list.filter(item => item.id !== newObj.id)];
    setItemJson(LOCAL_STORAGE_KEYS.SPEED_TYPE_PROMPTS, updated);
    return updated;
  },
  deleteSpeedTypePrompt: (id) => {
    const list = StorageService.getSpeedTypePrompts().filter(item => item.id !== id);
    setItemJson(LOCAL_STORAGE_KEYS.SPEED_TYPE_PROMPTS, list);
    return list;
  },

  // Java Learning Path Levels
  getJavaLevels: () => getItemParsed(LOCAL_STORAGE_KEYS.JAVA_LEVELS, INITIAL_JAVA_LEVELS),
  saveJavaLevel: (levelObj) => {
    const list = StorageService.getJavaLevels();
    const updated = [levelObj, ...list.filter(item => item.id !== levelObj.id)];
    setItemJson(LOCAL_STORAGE_KEYS.JAVA_LEVELS, updated);
    return updated;
  },
  saveAllJavaLevels: (levelsList) => {
    setItemJson(LOCAL_STORAGE_KEYS.JAVA_LEVELS, levelsList);
    return levelsList;
  },

  // Update Java Progress for Current User
  updateUserJavaProgress: (uid, progressUpdate) => {
    const currentUser = getItemParsed(LOCAL_STORAGE_KEYS.CURRENT_USER, null);
    if (currentUser && (currentUser.uid === uid || currentUser.id === uid)) {
      const updatedUser = {
        ...currentUser,
        javaProgress: {
          ...(currentUser.javaProgress || { unlockedLevel: 1, completedLevels: [], levelScores: {} }),
          ...progressUpdate
        }
      };
      setItemJson(LOCAL_STORAGE_KEYS.CURRENT_USER, updatedUser);
      return updatedUser;
    }
    return null;
  },

  // Java Activity Tracking & Performance Analytics
  getJavaActivityStore: () => getItemParsed(LOCAL_STORAGE_KEYS.JAVA_ACTIVITY, {}),

  getUserJavaActivity: (uid) => {
    const store = getItemParsed(LOCAL_STORAGE_KEYS.JAVA_ACTIVITY, {});
    return store[uid || 'guest'] || {};
  },

  updateJavaTopicTimeSpent: (uid, topicId, addedSeconds) => {
    if (!addedSeconds || addedSeconds <= 0) return;
    const key = uid || 'guest';
    const store = getItemParsed(LOCAL_STORAGE_KEYS.JAVA_ACTIVITY, {});
    const userMap = store[key] || {};
    const topicData = userMap[topicId] || {
      topicId,
      timeSpentSeconds: 0,
      totalRuns: 0,
      successfulRuns: 0,
      firstViewedAt: new Date().toISOString(),
      lastViewedAt: new Date().toISOString(),
      runAttempts: []
    };

    topicData.timeSpentSeconds = (topicData.timeSpentSeconds || 0) + addedSeconds;
    topicData.lastViewedAt = new Date().toISOString();
    if (!topicData.firstViewedAt) topicData.firstViewedAt = new Date().toISOString();

    userMap[topicId] = topicData;
    store[key] = userMap;
    setItemJson(LOCAL_STORAGE_KEYS.JAVA_ACTIVITY, store);
    return userMap;
  },

  recordJavaRunAttempt: (uid, topicId, attemptData) => {
    const key = uid || 'guest';
    const store = getItemParsed(LOCAL_STORAGE_KEYS.JAVA_ACTIVITY, {});
    const userMap = store[key] || {};
    const topicData = userMap[topicId] || {
      topicId,
      timeSpentSeconds: 0,
      totalRuns: 0,
      successfulRuns: 0,
      firstViewedAt: new Date().toISOString(),
      lastViewedAt: new Date().toISOString(),
      runAttempts: []
    };

    const newAttempt = {
      timestamp: new Date().toISOString(),
      codeSnapshot: attemptData.codeSnapshot || '',
      consoleInput: attemptData.consoleInput || '',
      result: attemptData.result || 'compileError', // 'success' | 'compileError' | 'runtimeError'
      errorMessage: attemptData.errorMessage || '',
      executionTimeMs: attemptData.executionTimeMs || 0
    };

    const existingAttempts = Array.isArray(topicData.runAttempts) ? topicData.runAttempts : [];
    // Keep maximum 20 run attempts (rolling window for privacy and memory limits)
    const updatedAttempts = [...existingAttempts, newAttempt].slice(-20);

    topicData.runAttempts = updatedAttempts;
    topicData.totalRuns = (topicData.totalRuns || 0) + 1;
    if (attemptData.result === 'success') {
      topicData.successfulRuns = (topicData.successfulRuns || 0) + 1;
    }
    topicData.lastViewedAt = new Date().toISOString();
    if (!topicData.firstViewedAt) topicData.firstViewedAt = new Date().toISOString();

    userMap[topicId] = topicData;
    store[key] = userMap;
    setItemJson(LOCAL_STORAGE_KEYS.JAVA_ACTIVITY, store);
    return userMap;
  },

  getAllJavaActivityForAdmin: () => {
    return getItemParsed(LOCAL_STORAGE_KEYS.JAVA_ACTIVITY, {});
  },

  // Broadcasts
  getBroadcasts: () => getItemParsed(LOCAL_STORAGE_KEYS.BROADCASTS, INITIAL_BROADCASTS),
  getDismissedBroadcastIds: (uid) => getItemParsed(`${LOCAL_STORAGE_KEYS.DISMISSED_BROADCASTS}_${uid || 'guest'}`, []),
  dismissBroadcast: (uid, broadcastId) => {
    const key = `${LOCAL_STORAGE_KEYS.DISMISSED_BROADCASTS}_${uid || 'guest'}`;
    const list = getItemParsed(key, []);
    const updated = [...list, broadcastId];
    setItemJson(key, updated);
    return updated;
  },

  // Polls, Activity & Site Config
  getThisOrThatPolls: () => getItemParsed(LOCAL_STORAGE_KEYS.THIS_OR_THAT, INITIAL_THIS_OR_THAT),
  getActivityLog: () => getItemParsed(LOCAL_STORAGE_KEYS.ACTIVITY_LOG, []),
  getSiteConfig: () => getItemParsed(LOCAL_STORAGE_KEYS.SITE_CONFIG, {
    brainZoneEnabled: true,
    registrationEnabled: true,
    maintenanceMode: false,
    maintenanceMessage: 'System undergoing scheduled maintenance. Please check back shortly.'
  }),

  // Quiz & IT Facts
  getQuizQuestions: () => getItemParsed(LOCAL_STORAGE_KEYS.QUIZ_QUESTIONS, []),
  getITFactsList: () => getItemParsed(LOCAL_STORAGE_KEYS.IT_FACTS, INITIAL_IT_FACTS),

  // Missions, Badges, Mystery Rewards
  getWeeklyMissions: () => getItemParsed(LOCAL_STORAGE_KEYS.WEEKLY_MISSIONS, []),
  getBadges: () => getItemParsed(LOCAL_STORAGE_KEYS.BADGES, []),
  getMysteryRewards: () => getItemParsed(LOCAL_STORAGE_KEYS.MYSTERY_REWARDS, []),

  // Page Control Center Storage
  getPageControls: () => {
    const stored = getItemParsed(LOCAL_STORAGE_KEYS.PAGE_CONTROLS, {});
    return { ...INITIAL_PAGE_CONTROLS, ...stored };
  },

  savePageControl: (pageId, controlObj) => {
    const current = StorageService.getPageControls();
    const updated = {
      ...current,
      [pageId]: {
        ...(current[pageId] || { id: pageId, name: pageId, visible: true, disabledFeatures: [] }),
        ...controlObj,
        id: pageId,
        updatedAt: new Date().toISOString()
      }
    };
    setItemJson(LOCAL_STORAGE_KEYS.PAGE_CONTROLS, updated);
    return updated;
  },

  emergencyLockPage: (pageId) => {
    const current = StorageService.getPageControls();
    const pageObj = current[pageId] || { id: pageId, name: pageId };
    const updated = {
      ...current,
      [pageId]: {
        ...pageObj,
        status: 'closed',
        displayMode: 'full_lock',
        title: pageObj.title || `🚨 Emergency Closure: ${pageObj.name || pageId}`,
        message: pageObj.message || 'This page has been temporarily closed by Admin Please check back later.',
        updatedAt: new Date().toISOString()
      }
    };
    setItemJson(LOCAL_STORAGE_KEYS.PAGE_CONTROLS, updated);
    return updated;
  }
};

