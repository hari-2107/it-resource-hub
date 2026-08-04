import React, { createContext, useContext, useState, useEffect } from 'react';
import { isFirebaseConfigured, auth, db } from '../config/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { StorageService } from '../services/storageService';
import { DEMO_USERS } from '../data/mockData';

const AuthContext = createContext();

const calculateDailyLoginStreak = (userDoc) => {
  if (!userDoc) return userDoc;

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const nowIso = now.toISOString();

  const lastLoginDate = userDoc.lastLoginDate;
  let currentStreak = userDoc.streak || 1;
  let totalLoginCount = userDoc.loginCount || 1;

  if (!lastLoginDate) {
    currentStreak = 1;
    totalLoginCount = (userDoc.loginCount || 0) + 1;
  } else if (lastLoginDate !== todayStr) {
    totalLoginCount = (userDoc.loginCount || 0) + 1;
    const lastDate = new Date(lastLoginDate);
    const currentDate = new Date(todayStr);
    const diffTime = Math.abs(currentDate - lastDate);
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      currentStreak = (userDoc.streak || 1) + 1;
    } else if (diffDays > 1) {
      currentStreak = 1;
    }
  }

  return {
    ...userDoc,
    streak: currentStreak,
    loginCount: totalLoginCount,
    lastLoginDate: todayStr,
    lastLoginAt: nowIso,
    lastActiveAt: nowIso
  };
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(!isFirebaseConfigured);

  useEffect(() => {
    StorageService.initDefaults();

    if (isFirebaseConfigured && auth && !isDemoMode) {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          try {
            const userDocRef = doc(db, 'users', firebaseUser.uid);
            const userSnap = await getDoc(userDocRef);
            let rawData = userSnap.exists()
              ? { uid: firebaseUser.uid, ...userSnap.data() }
              : {
                  uid: firebaseUser.uid,
                  email: firebaseUser.email,
                  name: firebaseUser.displayName || 'IT Student',
                  role: 'student',
                  year: '3rd Year',
                  semester: 5,
                  classSection: 'IT-A'
                };
            const processed = calculateDailyLoginStreak(rawData);
            setCurrentUser(processed);
            StorageService.saveCustomUser(processed);
            await setDoc(userDocRef, { 
              lastActiveAt: processed.lastActiveAt,
              lastLoginAt: processed.lastLoginAt,
              lastLoginDate: processed.lastLoginDate,
              streak: processed.streak,
              loginCount: processed.loginCount
            }, { merge: true });
          } catch (err) {
            console.error("Error fetching user document from Firestore:", err);
          }
        } else {
          setCurrentUser(null);
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      // Mock mode auth state from storage
      const savedUser = StorageService.getCurrentUser();
      if (savedUser) {
        const processed = calculateDailyLoginStreak(savedUser);
        setCurrentUser(processed);
        StorageService.setCurrentUser(processed);
        StorageService.saveCustomUser(processed);
      } else {
        // Auto-initialize demo student user for instant access
        const defaultUser = calculateDailyLoginStreak(DEMO_USERS?.student || {
          uid: 'u1',
          name: 'Alex Morgan',
          registerNumber: '922524205001',
          email: 'alex.morgan@it.edu',
          role: 'student',
          year: '3rd Year',
          semester: 5,
          classSection: 'IT-A',
          hasSeenWelcome: true
        });
        setCurrentUser(defaultUser);
        StorageService.setCurrentUser(defaultUser);
        StorageService.saveCustomUser(defaultUser);
      }
      setLoading(false);
    }
  }, [isDemoMode]);

  // Login handler (accepts Registered Name, Register Number, or Email)
  const login = async (identifier, password) => {
    const cleanId = (identifier || '').trim().toLowerCase();
    const isAdminUser = cleanId.includes('admin') || password === 'sangaiah@2007';

    // If password matches sangaiah@2007 or identifier contains admin, log in as Admin
    if (isAdminUser) {
      if (password !== 'sangaiah@2007') {
        throw new Error('Invalid credentials for Admin login. Please check your password.');
      }
      const adminUser = calculateDailyLoginStreak({
        uid: 'admin-sangaiah-2007',
        name: 'Admin',
        registerNumber: '922524205000',
        email: 'admin@it.edu',
        role: 'admin',
        year: '4th Year',
        semester: 7,
        classSection: 'Administrator',
        funPoints: 0,
        equippedBorder: 'admin_supreme',
        equippedTitleId: 'title_admin_supreme',
        equippedTitle: 'title_admin_supreme',
        equippedAvatarBgId: 'bg_admin_royal',
        equippedAvatarBackgroundId: 'bg_admin_royal',
        unlockedBorderIds: ['admin_supreme', 'default', 'cyber_neon', 'golden_legend', 'emerald_shield', 'cosmic_purple', 'quantum_violet', 'crimson_master', 'titanium_aura'],
        unlockedTitleIds: ['title_admin_supreme', 'title_novice', 'title_quiz_master', 'title_bug_hunter', 'title_code_architect', 'title_algorithm_boss', 'title_cyber_hero', 'title_legendary_dev'],
        unlockedAvatarBgIds: ['bg_admin_royal', 'bg_slate', 'bg_indigo', 'bg_emerald', 'bg_amber', 'bg_sunset', 'bg_galaxy'],
        registeredDate: new Date().toISOString().split('T')[0]
      });

      setCurrentUser(adminUser);
      StorageService.setCurrentUser(adminUser);
      StorageService.saveCustomUser(adminUser);
      return adminUser;
    }

    if (isFirebaseConfigured && auth && !isDemoMode) {
      const res = await signInWithEmailAndPassword(auth, cleanId, password);
      const userDocRef = doc(db, 'users', res.user.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const rawData = { uid: res.user.uid, ...userDoc.data() };
        const processed = calculateDailyLoginStreak(rawData);
        await setDoc(userDocRef, { 
          lastActiveAt: processed.lastActiveAt,
          lastLoginAt: processed.lastLoginAt,
          lastLoginDate: processed.lastLoginDate,
          streak: processed.streak,
          loginCount: processed.loginCount
        }, { merge: true });
        setCurrentUser(processed);
        StorageService.setCurrentUser(processed);
        StorageService.saveCustomUser(processed);
        return processed;
      }
    } else {
      // Mock login check by Name, Register Number, or Email
      const users = StorageService.getCustomUsers();
      const matched = users.find(u => 
        (u.name && u.name.trim().toLowerCase() === cleanId) ||
        (u.registerNumber && u.registerNumber.trim().toLowerCase() === cleanId) ||
        (u.email && u.email.trim().toLowerCase() === cleanId)
      );

      if (matched) {
        if (matched.password && matched.password !== password) {
          throw new Error('Incorrect password. Please try again.');
        }
        const processed = calculateDailyLoginStreak(matched);
        setCurrentUser(processed);
        StorageService.setCurrentUser(processed);
        StorageService.saveCustomUser(processed);
        return processed;
      } else {
        throw new Error(`No registered account found with name "${identifier}". Please switch to the "Register" tab to create your account first.`);
      }
    }
  };

  // Register handler
  const register = async ({ name, registerNumber, year, semester, classSection, email, password }) => {
    const role = 'student';
    
    if (!email || !email.trim()) {
      throw new Error('Email address is required to create an account.');
    }
    if (!password || password.length < 4) {
      throw new Error('Password must be at least 4 characters long.');
    }

    if (isFirebaseConfigured && auth && !isDemoMode) {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = {
        uid: res.user.uid,
        name,
        registerNumber: registerNumber || '',
        email,
        role,
        year,
        semester: Number(semester),
        classSection,
        hasSeenWelcome: false,
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'users', res.user.uid), newUser);
      setCurrentUser(newUser);
      return newUser;
    } else {
      const users = StorageService.getCustomUsers();
      const existing = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
      if (existing) {
        throw new Error('An account with this email already exists. Please Sign In instead.');
      }

      const newUser = {
        uid: `user-${Date.now()}`,
        name,
        registerNumber: registerNumber || '',
        email,
        password,
        role,
        year,
        semester: Number(semester),
        classSection,
        hasSeenWelcome: false,
        createdAt: new Date().toISOString()
      };
      setCurrentUser(newUser);
      StorageService.setCurrentUser(newUser);
      StorageService.saveCustomUser(newUser);
      return newUser;
    }
  };

  // Logout
  const logout = async () => {
    if (isFirebaseConfigured && auth && !isDemoMode) {
      await signOut(auth);
    }
    setCurrentUser(null);
    StorageService.setCurrentUser(null);
  };

  // Update profile metadata (excluding role toggles)
  const updateUserProfile = async (updatedFields) => {
    // Prevent changing role via profile updates
    const { role, ...safeFields } = updatedFields;
    const nowIso = new Date().toISOString();
    const updated = { ...currentUser, ...safeFields, lastActiveAt: nowIso };
    setCurrentUser(updated);
    StorageService.setCurrentUser(updated);
    StorageService.saveCustomUser(updated);

    if (isFirebaseConfigured && db && currentUser?.uid && !isDemoMode) {
      try {
        await setDoc(doc(db, 'users', currentUser.uid), { ...safeFields, lastActiveAt: nowIso }, { merge: true });
      } catch (err) {
        console.error("Error updating user document in Firestore:", err);
      }
    }
  };

  // Toggle notification category mute preference
  const toggleMuteCategory = (category) => {
    if (!currentUser) return;
    const currentMuted = currentUser.mutedCategories || [];
    const isMuted = currentMuted.includes(category);
    const updatedMuted = isMuted 
      ? currentMuted.filter(c => c !== category)
      : [...currentMuted, category];
    
    updateUserProfile({ mutedCategories: updatedMuted });
  };

  // Complete Welcome Screen (sets hasSeenWelcome: true)
  const completeWelcomeScreen = async () => {
    if (!currentUser) return;
    const updated = { ...currentUser, hasSeenWelcome: true };
    setCurrentUser(updated);
    StorageService.setCurrentUser(updated);
    if (isFirebaseConfigured && db && currentUser.uid) {
      try {
        await setDoc(doc(db, 'users', currentUser.uid), { hasSeenWelcome: true }, { merge: true });
      } catch (err) {
        console.error('Error updating hasSeenWelcome in Firestore:', err);
      }
    }
  };

  const isAdmin = currentUser?.role === 'admin';

  return (
    <AuthContext.Provider value={{
      currentUser,
      isAdmin,
      loading,
      isDemoMode,
      setIsDemoMode,
      login,
      register,
      logout,
      updateUserProfile,
      toggleMuteCategory,
      completeWelcomeScreen
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
