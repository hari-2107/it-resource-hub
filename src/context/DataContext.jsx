import React, { createContext, useContext, useState, useEffect } from 'react';
import { StorageService } from '../services/storageService';
import { useAuth } from './AuthContext';
import { isFirebaseConfigured, db } from '../config/firebase';
import { collection, onSnapshot, doc, setDoc, updateDoc } from 'firebase/firestore';
import { INITIAL_PAGE_CONTROLS } from '../data/mockData';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const { currentUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [aiTools, setAiTools] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [timetables, setTimetables] = useState([]);
  const [favorites, setFavorites] = useState({ materialIds: [], aiToolIds: [] });
  const [studentMarks, setStudentMarks] = useState([]);
  const [customTimetable, setCustomTimetable] = useState(null);
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [reports, setReports] = useState([]);
  const [placementCompanies, setPlacementCompanies] = useState([]);
  const [interviewExperiences, setInterviewExperiences] = useState([]);
  const [placementResources, setPlacementResources] = useState([]);
  const [events, setEvents] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [userResumes, setUserResumes] = useState([]);
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [broadcasts, setBroadcasts] = useState([]);
  const [dismissedBroadcastIds, setDismissedBroadcastIds] = useState([]);
  const [thisOrThatPolls, setThisOrThatPolls] = useState([]);
  const [activityLog, setActivityLog] = useState([]);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [itFacts, setItFacts] = useState([]);
  const [guessOutputChallenges, setGuessOutputChallenges] = useState([]);
  const [findBugChallenges, setFindBugChallenges] = useState([]);
  const [ecgChallenges, setEcgChallenges] = useState([]);
  const [tangoPuzzles, setTangoPuzzles] = useState([]);
  const [speedTypePrompts, setSpeedTypePrompts] = useState([]);
  const [weeklyMissions, setWeeklyMissions] = useState([]);
  const [badges, setBadges] = useState([]);
  const [mysteryRewards, setMysteryRewards] = useState([]);
  const [javaLevels, setJavaLevels] = useState([]);
  const [pageControls, setPageControls] = useState(INITIAL_PAGE_CONTROLS);
  const [siteConfig, setSiteConfig] = useState({
    brainZoneEnabled: true,
    registrationEnabled: true,
    maintenanceMode: false,
    maintenanceMessage: 'System undergoing scheduled maintenance. Please check back shortly.'
  });

  // Load initial data
  useEffect(() => {
    try {
      if (StorageService.initDefaults) StorageService.initDefaults();
      if (StorageService.getSubjects) setSubjects(StorageService.getSubjects() || []);
      if (StorageService.getMaterials) setMaterials(StorageService.getMaterials() || []);
      if (StorageService.getAITools) setAiTools(StorageService.getAITools() || []);
      if (StorageService.getAnnouncements) setAnnouncements(StorageService.getAnnouncements() || []);
      if (StorageService.getTimetables) setTimetables(StorageService.getTimetables() || []);
      if (StorageService.getSuggestions) setSuggestions(StorageService.getSuggestions() || []);
      if (StorageService.getReports) setReports(StorageService.getReports() || []);
      if (StorageService.getPlacementCompanies) setPlacementCompanies(StorageService.getPlacementCompanies() || []);
      if (StorageService.getInterviewExperiences) setInterviewExperiences(StorageService.getInterviewExperiences() || []);
      if (StorageService.getPlacementResources) setPlacementResources(StorageService.getPlacementResources() || []);
      if (StorageService.getEvents) setEvents(StorageService.getEvents() || []);
      if (StorageService.getRatings) setRatings(StorageService.getRatings() || []);
      if (StorageService.getCustomUsers) setRegisteredUsers(StorageService.getCustomUsers() || []);
      if (StorageService.getBroadcasts) setBroadcasts(StorageService.getBroadcasts() || []);
      if (StorageService.getThisOrThatPolls) setThisOrThatPolls(StorageService.getThisOrThatPolls() || []);
      if (StorageService.getActivityLog) setActivityLog(StorageService.getActivityLog() || []);
      if (StorageService.getSiteConfig) setSiteConfig(StorageService.getSiteConfig() || {});
      if (StorageService.getQuizQuestions) setQuizQuestions(StorageService.getQuizQuestions() || []);
      if (StorageService.getITFactsList) setItFacts(StorageService.getITFactsList() || []);
      if (StorageService.getGuessOutputChallenges) setGuessOutputChallenges(StorageService.getGuessOutputChallenges() || []);
      if (StorageService.getFindBugChallenges) setFindBugChallenges(StorageService.getFindBugChallenges() || []);
      if (StorageService.getEcgChallenges) setEcgChallenges(StorageService.getEcgChallenges() || []);
      if (StorageService.getTangoPuzzles) setTangoPuzzles(StorageService.getTangoPuzzles() || []);
      if (StorageService.getSpeedTypePrompts) setSpeedTypePrompts(StorageService.getSpeedTypePrompts() || []);
      if (StorageService.getWeeklyMissions) setWeeklyMissions(StorageService.getWeeklyMissions() || []);
      if (StorageService.getBadges) setBadges(StorageService.getBadges() || []);
      if (StorageService.getMysteryRewards) setMysteryRewards(StorageService.getMysteryRewards() || []);
      if (StorageService.getJavaLevels) setJavaLevels(StorageService.getJavaLevels() || []);
      if (StorageService.getPageControls) setPageControls(StorageService.getPageControls() || INITIAL_PAGE_CONTROLS);
      
      const uid = currentUser?.id || 'guest';
      if (StorageService.getDismissedBroadcastIds) setDismissedBroadcastIds(StorageService.getDismissedBroadcastIds(uid) || []);
    } catch (err) {
      console.error("Error loading initial data from StorageService:", err);
    } finally {
      setLoading(false);
    }

    // Setup Firestore real-time listeners if configured
    if (isFirebaseConfigured && db) {
      try {
        const unsubMat = onSnapshot(collection(db, 'materials'), (snap) => {
          if (!snap.empty) {
            const items = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMaterials(items);
          }
        }, err => console.log('Firestore materials listener fallback:', err));

        const unsubAi = onSnapshot(collection(db, 'aiTools'), (snap) => {
          if (!snap.empty) {
            const items = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setAiTools(items);
          }
        }, err => console.log('Firestore aiTools listener fallback:', err));

        const unsubAnn = onSnapshot(collection(db, 'announcements'), (snap) => {
          if (!snap.empty) {
            const items = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setAnnouncements(items);
          }
        }, err => console.log('Firestore announcements listener fallback:', err));

        const unsubJava = onSnapshot(collection(db, 'javaLevels'), (snap) => {
          if (!snap.empty) {
            const items = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setJavaLevels(items.sort((a, b) => (a.levelNumber || 0) - (b.levelNumber || 0)));
          }
        }, err => console.log('Firestore javaLevels listener fallback:', err));

        const unsubControls = onSnapshot(doc(db, 'siteSettings', 'pageControls'), (snap) => {
          if (snap.exists()) {
            setPageControls(snap.data());
          }
        }, err => console.log('Firestore pageControls listener fallback:', err));

        return () => {
          unsubMat();
          unsubAi();
          unsubAnn();
          unsubJava();
          unsubControls();
        };
      } catch (err) {
        console.warn('Firestore subscription error, using local storage:', err);
      }
    }
  }, []);

  // Sync user favorites, marks, custom timetable, and resumes when currentUser changes
  useEffect(() => {
    if (currentUser?.uid) {
      setFavorites(StorageService.getFavorites(currentUser.uid));
      setStudentMarks(StorageService.getStudentMarks(currentUser.uid));
      setCustomTimetable(StorageService.getCustomStudentTimetable(currentUser.uid));
      setUserResumes(StorageService.getUserResumes(currentUser.uid));
    } else {
      setCustomTimetable(null);
      setUserResumes([]);
    }
  }, [currentUser]);

  // Material Actions
  const addOrUpdateMaterial = (materialData, changeNote) => {
    const updated = StorageService.saveMaterial(materialData, changeNote, currentUser?.name || 'Admin');
    setMaterials(updated);
  };

  const removeMaterial = (id) => {
    const updated = StorageService.deleteMaterial(id);
    setMaterials(updated);
  };

  const trackDownload = (id) => {
    const updated = StorageService.incrementDownloadCount(id);
    setMaterials(updated);
  };

  const trackMaterialView = (id) => {
    const userName = currentUser?.name || currentUser?.email || 'Student Member';
    const updated = StorageService.incrementMaterialView(id, userName);
    setMaterials(updated);
  };

  // AI Tools Actions
  const addOrUpdateAITool = (toolData) => {
    const updated = StorageService.saveAITool(toolData);
    setAiTools(updated);
  };

  const removeAITool = (id) => {
    const updated = StorageService.deleteAITool(id);
    setAiTools(updated);
  };

  // Announcements Actions
  const addOrUpdateAnnouncement = (announcementData, changeNote) => {
    const updated = StorageService.saveAnnouncement(announcementData, changeNote, currentUser?.name || 'Admin');
    setAnnouncements(updated);
  };

  const removeAnnouncement = (id) => {
    const updated = StorageService.deleteAnnouncement(id);
    setAnnouncements(updated);
  };

  const togglePinAnnouncement = (id) => {
    const updated = StorageService.togglePinAnnouncement(id);
    setAnnouncements(updated);
  };

  const trackAnnouncementView = (id) => {
    const userName = currentUser?.name || currentUser?.email || 'Student Member';
    const updated = StorageService.incrementAnnouncementView(id, userName);
    setAnnouncements(updated);
  };

  // Timetables Actions
  const addOrUpdateTimetable = (timetableData, changeNote) => {
    const updated = StorageService.saveTimetable(timetableData, changeNote, currentUser?.name || 'Admin');
    setTimetables(updated);
  };

  const removeTimetable = (id) => {
    const updated = StorageService.deleteTimetable(id);
    setTimetables(updated);
  };

  const toggleTimetableStatus = (id, newStatus) => {
    const updated = StorageService.setTimetableStatus(id, newStatus);
    setTimetables(updated);
  };

  // Version Restoration Action
  const restoreDocumentVersion = (type, docId, versionId) => {
    const updated = StorageService.restoreVersion(type, docId, versionId, currentUser?.name || 'Admin');
    if (type === 'material') setMaterials(updated);
    else if (type === 'announcement') setAnnouncements(updated);
    else if (type === 'timetable') setTimetables(updated);
  };

  // Student Suggestions Actions
  const addSuggestion = (suggestionData) => {
    const sug = {
      ...suggestionData,
      userId: currentUser?.uid || 'guest-user',
      userName: currentUser?.name || 'Anonymous Student',
      userEmail: currentUser?.email || 'student@it.edu'
    };
    const updated = StorageService.saveSuggestion(sug);
    setSuggestions(updated);
  };

  const updateSuggestionStatus = (id, status) => {
    const updated = StorageService.updateSuggestionStatus(id, status);
    setSuggestions(updated);
  };

  const deleteSuggestion = (id) => {
    const updated = StorageService.deleteSuggestion(id);
    setSuggestions(updated);
  };

  // Reported Issues Actions
  const addReport = (reportData) => {
    const rep = {
      ...reportData,
      userId: currentUser?.uid || 'guest-user',
      userName: currentUser?.name || 'Anonymous Student',
      userEmail: currentUser?.email || 'student@it.edu'
    };
    const updated = StorageService.saveReport(rep);
    setReports(updated);
  };

  const updateReportStatus = (id, status) => {
    const updated = StorageService.updateReportStatus(id, status);
    setReports(updated);
  };

  const deleteReport = (id) => {
    const updated = StorageService.deleteReport(id);
    setReports(updated);
  };

  // Favorites Actions
  const toggleFavoriteItem = (type, itemId) => {
    if (!currentUser?.uid) return;
    const updatedFavs = StorageService.toggleFavorite(currentUser.uid, type, itemId);
    setFavorites(updatedFavs);
  };

  // Student Marks Actions
  const addOrUpdateMark = (markEntry) => {
    if (!currentUser?.uid) return;
    const updated = StorageService.saveStudentMark(currentUser.uid, markEntry);
    setStudentMarks(updated);
  };

  const removeMark = (markId) => {
    if (!currentUser?.uid) return;
    const updated = StorageService.deleteStudentMark(currentUser.uid, markId);
    setStudentMarks(updated);
  };

  // Global Search Filter function
  const filteredMaterials = materials.filter(item => {
    if (!globalSearchTerm.trim()) return true;
    const term = globalSearchTerm.toLowerCase();
    return (
      item.title.toLowerCase().includes(term) ||
      item.subjectName.toLowerCase().includes(term) ||
      item.category.toLowerCase().includes(term) ||
      (item.description && item.description.toLowerCase().includes(term))
    );
  });

  const filteredAITools = aiTools.filter(tool => {
    if (!globalSearchTerm.trim()) return true;
    const term = globalSearchTerm.toLowerCase();
    return (
      tool.name.toLowerCase().includes(term) ||
      tool.category.toLowerCase().includes(term) ||
      tool.description.toLowerCase().includes(term) ||
      (tool.tags && tool.tags.some(tag => tag.toLowerCase().includes(term)))
    );
  });

  // Subject Catalog Actions
  const addOrUpdateSubject = (subjectData) => {
    const updated = StorageService.saveSubject(subjectData);
    setSubjects(updated);
  };

  const removeSubject = (subjectId) => {
    const updated = StorageService.deleteSubject(subjectId);
    setSubjects(updated);
  };

  const removeRegisteredUser = (identifier) => {
    const updated = StorageService.deleteCustomUser(identifier);
    setRegisteredUsers(updated);
  };

  // Student Custom Timetable Actions
  const updateStudentCustomTimetable = (timetableData) => {
    if (!currentUser?.uid) return;
    const updated = StorageService.saveCustomStudentTimetable(currentUser.uid, timetableData);
    setCustomTimetable(updated);
  };

  const resetStudentCustomTimetable = () => {
    if (!currentUser?.uid) return;
    StorageService.deleteCustomStudentTimetable(currentUser.uid);
    setCustomTimetable(null);
  };

  // Placement Companies Actions
  const addOrUpdatePlacementCompany = (companyData) => {
    const updated = StorageService.savePlacementCompany(companyData);
    setPlacementCompanies(updated);
  };

  const removePlacementCompany = (id) => {
    const updated = StorageService.deletePlacementCompany(id);
    setPlacementCompanies(updated);
  };

  // Interview Experiences Actions
  const addInterviewExperience = (expData) => {
    const updated = StorageService.saveInterviewExperience({
      ...expData,
      studentName: expData.isAnonymous ? 'Anonymous Student' : (currentUser?.name || expData.studentName || 'Student'),
      approved: false // requires admin approval
    });
    setInterviewExperiences(updated);
  };

  const updateInterviewExperienceStatus = (id, approved) => {
    const updated = StorageService.updateInterviewExperienceStatus(id, approved);
    setInterviewExperiences(updated);
  };

  const removeInterviewExperience = (id) => {
    const updated = StorageService.deleteInterviewExperience(id);
    setInterviewExperiences(updated);
  };

  // Events & Hackathons Actions
  const addOrUpdateEvent = (eventData) => {
    const updated = StorageService.saveEvent(eventData);
    setEvents(updated);
  };

  const removeEvent = (id) => {
    const updated = StorageService.deleteEvent(id);
    setEvents(updated);
  };

  // Rating & Review Actions
  const submitRating = (targetId, targetType, ratingData) => {
    const updated = StorageService.addOrUpdateRating(targetId, targetType, {
      userId: currentUser?.uid || 'guest-user',
      userName: currentUser?.name || 'Student Member',
      ...ratingData
    });
    setRatings(updated);
  };

  // Peer Notes Upload & Admin Approval
  const addStudentNote = (noteData) => {
    const updated = StorageService.saveMaterial({
      ...noteData,
      isStudentContributed: true,
      status: 'pending',
      uploadedBy: currentUser?.name || 'Student'
    }, 'Uploaded peer notes for approval', currentUser?.name || 'Student');
    setMaterials(updated);
  };

  const updateMaterialStatus = (id, status) => {
    const list = StorageService.getMaterials();
    const updated = list.map(m => m.id === id ? { ...m, status } : m);
    StorageService.saveMaterial ? setItemJson('it_hub_materials_v1', updated) : null;
    localStorage.setItem('it_hub_materials_v1', JSON.stringify(updated));
    setMaterials(updated);
  };

  // Resumes Manager Actions
  const saveResume = (resumeData) => {
    if (!currentUser?.uid) return;
    const updated = StorageService.saveUserResume(currentUser.uid, resumeData);
    setUserResumes(updated);
  };

  const deleteResume = (resumeId) => {
    if (!currentUser?.uid) return;
    const updated = StorageService.deleteUserResume(currentUser.uid, resumeId);
    setUserResumes(updated);
  };

  // Broadcast Actions
  const activeBroadcast = (broadcasts || []).find(
    b => b.isActive && !dismissedBroadcastIds.includes(b.id)
  ) || null;

  const addBroadcast = (bcastData) => {
    const updated = StorageService.saveBroadcast({
      ...bcastData,
      createdBy: currentUser?.name || 'Department Admin'
    });
    setBroadcasts(updated);
    logAdminActivity(`Saved System Broadcast '${bcastData.title}'`, 'Broadcast');
  };

  const addOrUpdateBroadcast = (bcastData) => addBroadcast(bcastData);

  const updateBroadcast = (id, updatedFields) => {
    const updated = StorageService.updateBroadcast(id, updatedFields);
    setBroadcasts(updated);
  };

  const deleteBroadcast = (id) => {
    const updated = StorageService.deleteBroadcast(id);
    setBroadcasts(updated);
    logAdminActivity('Deleted System Broadcast', 'Broadcast');
  };

  const removeBroadcast = (id) => deleteBroadcast(id);

  const toggleBroadcastStatus = (id, currentStatus) => {
    const updated = StorageService.updateBroadcast(id, { isActive: !currentStatus });
    setBroadcasts(updated);
    logAdminActivity(`Toggled broadcast active status`, 'Broadcast');
  };

  const dismissBroadcast = (broadcastId) => {
    const uid = currentUser?.id || currentUser?.uid || 'guest';
    const updated = StorageService.dismissBroadcast(uid, broadcastId);
    setDismissedBroadcastIds(updated);
  };

  const addThisOrThatPoll = async (pollData) => {
    const updated = StorageService.saveThisOrThatPoll(pollData);
    setThisOrThatPolls(updated);

    if (isFirebaseConfigured && db) {
      try {
        const id = pollData.id || `tot-${Date.now()}`;
        await setDoc(doc(db, 'thisOrThat', id), {
          ...pollData,
          id,
          date: pollData.date || new Date().toISOString().split('T')[0],
          votesA: pollData.votesA || 0,
          votesB: pollData.votesB || 0,
          createdAt: new Date().toISOString()
        }, { merge: true });
      } catch (err) {
        console.error('Firestore saveThisOrThat error:', err);
      }
    }
  };

  const voteThisOrThatPoll = async (pollId, option) => {
    const updated = StorageService.voteThisOrThatPoll(pollId, option);
    setThisOrThatPolls(updated);

    if (isFirebaseConfigured && db) {
      try {
        const target = (thisOrThatPolls || []).find(p => p.id === pollId);
        const currentA = target?.votesA || 0;
        const currentB = target?.votesB || 0;
        await updateDoc(doc(db, 'thisOrThat', pollId), {
          votesA: option === 'A' ? currentA + 1 : currentA,
          votesB: option === 'B' ? currentB + 1 : currentB
        });
      } catch (err) {
        console.error('Firestore voteThisOrThat error:', err);
      }
    }
  };

  const deleteThisOrThatPoll = (id) => {
    const updated = StorageService.deleteThisOrThatPoll(id);
    setThisOrThatPolls(updated);
    logAdminActivity('Deleted This or That poll', 'BrainZone');
  };

  const addOrUpdateWeeklyMission = (mObj) => {
    const updated = StorageService.saveWeeklyMission(mObj);
    setWeeklyMissions(updated);
    logAdminActivity(`Saved Weekly Mission '${mObj.title}'`, 'BrainZone');
  };

  const removeWeeklyMission = (id) => {
    const updated = StorageService.deleteWeeklyMission(id);
    setWeeklyMissions(updated);
    logAdminActivity('Deleted Weekly Mission', 'BrainZone');
  };

  const addOrUpdateBadge = (bObj) => {
    const updated = StorageService.saveBadge(bObj);
    setBadges(updated);
    logAdminActivity(`Saved Achievement Badge '${bObj.title}'`, 'BrainZone');
  };

  const removeBadge = (id) => {
    const updated = StorageService.deleteBadge(id);
    setBadges(updated);
    logAdminActivity('Deleted Achievement Badge', 'BrainZone');
  };

  const addOrUpdateMysteryReward = (rewardObj) => {
    const updated = StorageService.saveMysteryReward(rewardObj);
    setMysteryRewards(updated);
    logAdminActivity(`Saved Mystery Box Reward '${rewardObj.title}'`, 'BrainZone');
  };

  const removeMysteryReward = (id) => {
    const updated = StorageService.deleteMysteryReward(id);
    setMysteryRewards(updated);
    logAdminActivity('Deleted Mystery Box Reward', 'BrainZone');
  };



  const logAdminActivity = async (action, targetType = 'General', targetId = null) => {
    const entry = {
      id: `act-${Date.now()}`,
      adminId: currentUser?.uid || currentUser?.id || 'adm-1',
      adminName: currentUser?.name || 'Admin',
      action,
      targetType,
      targetId,
      timestamp: new Date().toISOString()
    };
    const updated = StorageService.logActivity(entry);
    setActivityLog(updated);

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'adminActivityLog', entry.id), entry);
      } catch (err) {
        console.error('Firestore logAdminActivity error:', err);
      }
    }
  };

  const updateSiteConfig = async (newConfig) => {
    const updated = StorageService.saveSiteConfig(newConfig);
    setSiteConfig(updated);
    logAdminActivity(`Updated site configuration`, 'SiteSettings');

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'siteConfig', 'settings'), updated, { merge: true });
      } catch (err) {
        console.error('Firestore updateSiteConfig error:', err);
      }
    }
  };

  const addOrUpdateQuizQuestion = (qData) => {
    const updated = StorageService.saveQuizQuestion(qData);
    setQuizQuestions(updated);
    logAdminActivity(`Saved quiz question '${qData.q}'`, 'BrainZone');
  };

  const removeQuizQuestion = (id) => {
    const updated = StorageService.deleteQuizQuestion(id);
    setQuizQuestions(updated);
    logAdminActivity(`Deleted quiz question`, 'BrainZone');
  };

  const addOrUpdateITFact = (factData) => {
    const updated = StorageService.saveITFact(factData);
    setItFacts(updated);
    logAdminActivity(`Added IT Fact '${factData.fact}'`, 'BrainZone');
  };

  const removeITFact = (id) => {
    const updated = StorageService.deleteITFact(id);
    setItFacts(updated);
    logAdminActivity(`Deleted IT Fact`, 'BrainZone');
  };

  const clearActivityLogs = () => {
    const updated = StorageService.clearActivityLog();
    setActivityLog(updated);
  };

  const updateUserRole = (userId, newRole) => {
    const users = StorageService.getCustomUsers();
    const updated = users.map(u => (u.uid === userId || u.id === userId) ? { ...u, role: newRole } : u);
    StorageService.saveCustomUsers(updated);
    setRegisteredUsers(updated);
    logAdminActivity(`Changed user role to ${newRole}`, 'User', userId);
  };

  const addOrUpdateGuessOutputChallenge = (obj) => {
    const updated = StorageService.saveGuessOutputChallenge(obj);
    setGuessOutputChallenges(updated);
    logAdminActivity(`Saved Guess Output challenge '${obj.title}'`, 'BrainZone');
  };

  const removeGuessOutputChallenge = (id) => {
    const updated = StorageService.deleteGuessOutputChallenge(id);
    setGuessOutputChallenges(updated);
    logAdminActivity(`Deleted Guess Output challenge`, 'BrainZone');
  };

  const addOrUpdateFindBugChallenge = (obj) => {
    const updated = StorageService.saveFindBugChallenge(obj);
    setFindBugChallenges(updated);
    logAdminActivity(`Saved Find Bug challenge '${obj.title}'`, 'BrainZone');
  };

  const removeFindBugChallenge = (id) => {
    const updated = StorageService.deleteFindBugChallenge(id);
    setFindBugChallenges(updated);
    logAdminActivity(`Deleted Find Bug challenge`, 'BrainZone');
  };

  const addOrUpdateEcgChallenge = (obj) => {
    const updated = StorageService.saveEcgChallenge(obj);
    setEcgChallenges(updated);
    logAdminActivity(`Saved ECG challenge '${obj.name || obj.code}'`, 'BrainZone');
  };

  const removeEcgChallenge = (id) => {
    const updated = StorageService.deleteEcgChallenge(id);
    setEcgChallenges(updated);
    logAdminActivity(`Deleted ECG challenge`, 'BrainZone');
  };

  const addOrUpdateTangoPuzzle = (obj) => {
    const updated = StorageService.saveTangoPuzzle(obj);
    setTangoPuzzles(updated);
    logAdminActivity(`Saved Tango puzzle '${obj.grid}'`, 'BrainZone');
  };

  const removeTangoPuzzle = (id) => {
    const updated = StorageService.deleteTangoPuzzle(id);
    setTangoPuzzles(updated);
    logAdminActivity(`Deleted Tango puzzle`, 'BrainZone');
  };

  const addOrUpdateSpeedTypePrompt = (obj) => {
    const updated = StorageService.saveSpeedTypePrompt(obj);
    setSpeedTypePrompts(updated);
    logAdminActivity(`Saved Speed Type prompt '${obj.lang}'`, 'BrainZone');
  };

  const removeSpeedTypePrompt = (id) => {
    const updated = StorageService.deleteSpeedTypePrompt(id);
    setSpeedTypePrompts(updated);
    logAdminActivity(`Deleted Speed Type prompt`, 'BrainZone');
  };

  const updateJavaProgress = async (user, levelNumber, scorePercent, xpReward, badgeId) => {
    if (!user) return null;
    const currentProgress = user.javaProgress || { unlockedLevel: 1, completedLevels: [], levelScores: {} };
    const completedLevels = currentProgress.completedLevels || [];
    const isFirstTimePass = !completedLevels.includes(levelNumber);

    const updatedCompletedLevels = isFirstTimePass 
      ? [...completedLevels, levelNumber] 
      : completedLevels;
    
    const nextUnlocked = Math.max(currentProgress.unlockedLevel || 1, levelNumber + 1);
    const updatedLevelScores = {
      ...(currentProgress.levelScores || {}),
      [levelNumber]: Math.max(currentProgress.levelScores?.[levelNumber] || 0, scorePercent)
    };

    const newJavaProgress = {
      unlockedLevel: nextUnlocked,
      completedLevels: updatedCompletedLevels,
      levelScores: updatedLevelScores
    };

    // Calculate XP bonus if first-time pass
    const xpBonus = isFirstTimePass ? (xpReward || 150) : 0;
    const updatedFunPoints = (user.funPoints ?? 0) + xpBonus;

    // Badges update
    const currentBadges = user.unlockedBadges || [];
    const updatedBadges = badgeId && isFirstTimePass && !currentBadges.includes(badgeId)
      ? [...currentBadges, badgeId]
      : currentBadges;

    const userDocUpdates = {
      javaProgress: newJavaProgress,
      funPoints: updatedFunPoints,
      unlockedBadges: updatedBadges
    };

    // 1. Update Firestore if configured
    if (isFirebaseConfigured && db && (user.uid || user.id)) {
      try {
        const userId = user.uid || user.id;
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, userDocUpdates);
      } catch (e) {
        console.warn("Firestore user javaProgress update fallback:", e);
      }
    }

    // 2. Local storage update via StorageService
    StorageService.updateUserJavaProgress(user.uid || user.id, newJavaProgress);

    return userDocUpdates;
  };

  const trackJavaTopicTime = (uid, topicId, seconds) => {
    if (!seconds || seconds <= 0) return;
    const targetUid = uid || currentUser?.uid || currentUser?.id || 'guest';
    return StorageService.updateJavaTopicTimeSpent(targetUid, topicId, seconds);
  };

  const logJavaRunAttempt = (uid, topicId, attemptData) => {
    const targetUid = uid || currentUser?.uid || currentUser?.id || 'guest';
    return StorageService.recordJavaRunAttempt(targetUid, topicId, attemptData);
  };

  const getUserJavaActivity = (uid) => {
    const targetUid = uid || currentUser?.uid || currentUser?.id || 'guest';
    return StorageService.getUserJavaActivity(targetUid);
  };

  const getAllJavaActivityForAdmin = () => {
    return StorageService.getAllJavaActivityForAdmin();
  };

  // Page Control Center Actions
  const updatePageControl = (pageId, controlData) => {
    const updated = StorageService.savePageControl(pageId, controlData);
    setPageControls(updated);
    if (isFirebaseConfigured && db) {
      setDoc(doc(db, 'siteSettings', 'pageControls'), updated, { merge: true }).catch(err => console.error("Firestore sync error:", err));
    }
    if (typeof logAdminActivity === 'function') {
      logAdminActivity(`Updated page control settings for module '${pageId}'`, 'PageControl');
    }
  };

  const emergencyLockPage = (pageId) => {
    const updated = StorageService.emergencyLockPage(pageId);
    setPageControls(updated);
    if (isFirebaseConfigured && db) {
      setDoc(doc(db, 'siteSettings', 'pageControls'), updated, { merge: true }).catch(err => console.error("Firestore sync error:", err));
    }
    if (typeof logAdminActivity === 'function') {
      logAdminActivity(`🚨 Emergency lock activated for module '${pageId}'`, 'EmergencyLock');
    }
  };

  const isPageFeatureDisabled = (pageId, featureName) => {
    const ctrl = pageControls[pageId];
    if (!ctrl) return false;
    if (ctrl.displayMode === 'read_only') return true;
    return Array.isArray(ctrl.disabledFeatures) && ctrl.disabledFeatures.includes(featureName);
  };

  return (
    <DataContext.Provider value={{
      pageControls,
      updatePageControl,
      emergencyLockPage,
      isPageFeatureDisabled,
      trackJavaTopicTime,
      logJavaRunAttempt,
      getUserJavaActivity,
      getAllJavaActivityForAdmin,
      loading,
      subjects,
      materials,
      aiTools,
      announcements,
      timetables,
      favorites,
      studentMarks,
      customTimetable,
      globalSearchTerm,
      setGlobalSearchTerm,
      suggestions,
      reports,
      placementCompanies,
      interviewExperiences,
      placementResources,
      events,
      ratings,
      userResumes,
      trackAnnouncementView,
      addOrUpdateTimetable,
      removeTimetable,
      toggleTimetableStatus,
      restoreDocumentVersion,
      addSuggestion,
      updateSuggestionStatus,
      deleteSuggestion,
      addReport,
      updateReportStatus,
      deleteReport,
      toggleFavoriteItem,
      addOrUpdateMark,
      removeMark,
      updateStudentCustomTimetable,
      resetStudentCustomTimetable,
      addOrUpdatePlacementCompany,
      removePlacementCompany,
      addInterviewExperience,
      updateInterviewExperienceStatus,
      removeInterviewExperience,
      addOrUpdateEvent,
      removeEvent,
      submitRating,
      addStudentNote,
      updateMaterialStatus,
      saveResume,
      deleteResume,
      addOrUpdateSubject,
      removeSubject,
      registeredUsers,
      removeRegisteredUser,
      thisOrThatPolls,
      addThisOrThatPoll,
      voteThisOrThatPoll,
      activityLog,
      siteConfig,
      logAdminActivity,
      updateSiteConfig,
      quizQuestions,
      addOrUpdateQuizQuestion,
      removeQuizQuestion,
      itFacts,
      addOrUpdateITFact,
      removeITFact,
      clearActivityLogs,
      updateUserRole,
      guessOutputChallenges,
      addOrUpdateGuessOutputChallenge,
      removeGuessOutputChallenge,
      findBugChallenges,
      addOrUpdateFindBugChallenge,
      removeFindBugChallenge,
      ecgChallenges,
      addOrUpdateEcgChallenge,
      removeEcgChallenge,
      tangoPuzzles,
      addOrUpdateTangoPuzzle,
      removeTangoPuzzle,
      speedTypePrompts,
      addOrUpdateSpeedTypePrompt,
      removeSpeedTypePrompt,
      deleteThisOrThatPoll,
      weeklyMissions,
      addOrUpdateWeeklyMission,
      removeWeeklyMission,
      badges,
      addOrUpdateBadge,
      removeBadge,
      mysteryRewards,
      addOrUpdateMysteryReward,
      removeMysteryReward,
      broadcasts,
      activeBroadcast,
      addOrUpdateBroadcast,
      removeBroadcast,
      toggleBroadcastStatus,
      dismissBroadcast,
      javaLevels,
      updateJavaProgress
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);

