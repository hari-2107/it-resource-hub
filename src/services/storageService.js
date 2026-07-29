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
  DEMO_USERS 
} from '../data/mockData';

const LOCAL_STORAGE_KEYS = {
  SUBJECTS: 'it_hub_subjects_v1',
  MATERIALS: 'it_hub_materials_v1',
  AI_TOOLS: 'it_hub_aitools_v1',
  ANNOUNCEMENTS: 'it_hub_announcements_v1',
  TIMETABLES: 'it_hub_timetables_v40',
  CUSTOM_TIMETABLES: 'it_hub_custom_timetables_v40',
  FAVORITES: 'it_hub_favorites_v1',
  STUDENT_MARKS: 'it_hub_student_marks_v10',
  CURRENT_USER: 'it_hub_current_user_v1',
  CUSTOM_USERS: 'it_hub_custom_users_v1',
  SUGGESTIONS: 'it_hub_suggestions_v1',
  REPORTS: 'it_hub_reports_v1',
  PLACEMENT_COMPANIES: 'it_hub_placement_companies_v1',
  INTERVIEW_EXPERIENCES: 'it_hub_interview_experiences_v1',
  PLACEMENT_RESOURCES: 'it_hub_placement_resources_v1',
  EVENTS: 'it_hub_events_v1',
  RATINGS: 'it_hub_ratings_v1',
  USER_RESUMES: 'it_hub_user_resumes_v1',
  BROADCASTS: 'it_hub_broadcasts_v1',
  DISMISSED_BROADCASTS: 'it_hub_dismissed_broadcasts_v1',
  THIS_OR_THAT: 'it_hub_this_or_that_v1',
  ACTIVITY_LOG: 'it_hub_activity_log_v1',
  SITE_CONFIG: 'it_hub_site_config_v1',
  QUIZ_QUESTIONS: 'it_hub_quiz_questions_v1',
  IT_FACTS: 'it_hub_it_facts_v1'
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
  },

  // Subjects
  getSubjects: () => getItemParsed(LOCAL_STORAGE_KEYS.SUBJECTS, INITIAL_SUBJECTS),
  saveSubject: (subjectData) => {
    const list = StorageService.getSubjects();
    const existingIdx = list.findIndex(s => s.id === subjectData.id);
    let updated;
    if (existingIdx >= 0) {
      updated = list.map((s, idx) => idx === existingIdx ? { ...s, ...subjectData } : s);
    } else {
      const newSubject = {
        id: subjectData.id || `sub-${Date.now()}`,
        name: subjectData.name || '',
        code: subjectData.code || '',
        year: subjectData.year || '3rd Year',
        semester: Number(subjectData.semester) || 5,
        type: subjectData.type || 'Theory'
      };
      updated = [newSubject, ...list];
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
  getAITools: () => getItemParsed(LOCAL_STORAGE_KEYS.AI_TOOLS, INITIAL_AI_TOOLS),
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
        updatedBy: announcement.updatedBy || updatedBy,
        changeNote: announcement.changeNote || changeNote,
        snapshot: historySnapshot
      };

      updated = [...list];
      updated[existingIndex] = {
        ...prevDoc,
        ...announcement,
        date: dateStr,
        time: timeStr,
        versionHistory: [newVersionEntry, ...prevHistory]
      };
    } else {
      const newAnn = {
        ...announcement,
        id: `ann-${Date.now()}`,
        date: dateStr,
        time: timeStr,
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
    const newExp = {
      ...exp,
      id: `exp-${Date.now()}`,
      submittedAt: new Date().toISOString().split('T')[0],
      approved: exp.approved !== undefined ? exp.approved : false
    };
    const updated = [newExp, ...list];
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

  // Events & Hackathons
  getEvents: () => getItemParsed(LOCAL_STORAGE_KEYS.EVENTS, INITIAL_EVENTS),
  saveEvent: (event) => {
    const list = StorageService.getEvents();
    const index = list.findIndex(e => e.id === event.id);
    let updated;
    if (index >= 0) {
      updated = [...list];
      updated[index] = { ...updated[index], ...event };
    } else {
      const newEvt = {
        ...event,
        id: `evt-${Date.now()}`,
        createdAt: new Date().toISOString().split('T')[0]
      };
      updated = [newEvt, ...list];
    }
    setItemJson(LOCAL_STORAGE_KEYS.EVENTS, updated);
    return updated;
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

  // Site Configuration & Maintenance Mode
  getSiteConfig: () => getItemParsed(LOCAL_STORAGE_KEYS.SITE_CONFIG, {
    brainZoneEnabled: true,
    registrationEnabled: true,
    maintenanceMode: false,
    maintenanceMessage: 'The IT Resource Hub is currently undergoing scheduled maintenance. Please check back shortly.'
  }),
  saveSiteConfig: (config) => {
    const current = StorageService.getSiteConfig();
    const updated = { ...current, ...config };
    setItemJson(LOCAL_STORAGE_KEYS.SITE_CONFIG, updated);
    return updated;
  },

  clearActivityLog: () => {
    setItemJson(LOCAL_STORAGE_KEYS.ACTIVITY_LOG, []);
    return [];
  },

  // 60-Second Challenge Quiz Questions
  getQuizQuestions: () => getItemParsed(LOCAL_STORAGE_KEYS.QUIZ_QUESTIONS, [
    { id: 'qq-1', q: "What does API stand for in software engineering?", options: ["Automated Program Interface", "Application Programming Interface", "Advanced Process Integration", "Application Protocol Instruction"], answer: 1, category: "Web Dev" },
    { id: 'qq-2', q: "Which data structure follows the Last-In, First-Out (LIFO) principle?", options: ["Queue", "Binary Tree", "Stack", "Linked List"], answer: 2, category: "Data Structures" },
    { id: 'qq-3', q: "What default port does HTTPS protocol use?", options: ["80", "21", "8080", "443"], answer: 3, category: "Networking" },
    { id: 'qq-4', q: "Which Big-O time complexity represents binary search algorithm?", options: ["O(N)", "O(log N)", "O(N^2)", "O(1)"], answer: 1, category: "Algorithms" },
    { id: 'qq-5', q: "Which HTTP status code signifies 'Resource Not Found'?", options: ["200", "403", "404", "500"], answer: 2, category: "Web Dev" }
  ]),
  saveQuizQuestion: (question) => {
    const list = StorageService.getQuizQuestions();
    const newQ = {
      ...question,
      id: question.id || `qq-${Date.now()}`
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
  }
};

