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
            if (userSnap.exists()) {
              setCurrentUser({ uid: firebaseUser.uid, ...userSnap.data() });
            } else {
              // Fallback user metadata
              setCurrentUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                name: firebaseUser.displayName || 'IT Student',
                role: 'student',
                year: '3rd Year',
                semester: 5,
                classSection: 'IT-A'
              });
            }
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
        setCurrentUser(savedUser);
      } else {
        // Require explicit login by starting with no authenticated user
        setCurrentUser(null);
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
      const adminUser = {
        uid: 'admin-sangaiah-2007',
        name: 'Admin',
        registerNumber: '922524205000',
        email: 'admin@it.edu',
        role: 'admin',
        year: '4th Year',
        semester: 7,
        classSection: 'IT Department Admin',
        registeredDate: new Date().toISOString().split('T')[0]
      };
      setCurrentUser(adminUser);
      StorageService.setCurrentUser(adminUser);
      StorageService.saveCustomUser(adminUser);
      return adminUser;
    }

    if (isFirebaseConfigured && auth && !isDemoMode) {
      const res = await signInWithEmailAndPassword(auth, cleanId, password);
      const userDoc = await getDoc(doc(db, 'users', res.user.uid));
      if (userDoc.exists()) {
        const userData = { uid: res.user.uid, ...userDoc.data() };
        setCurrentUser(userData);
        return userData;
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
        setCurrentUser(matched);
        StorageService.setCurrentUser(matched);
        return matched;
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
    const updated = { ...currentUser, ...safeFields };
    setCurrentUser(updated);
    StorageService.setCurrentUser(updated);
    StorageService.saveCustomUser(updated);

    if (isFirebaseConfigured && db && currentUser?.uid && !isDemoMode) {
      try {
        await setDoc(doc(db, 'users', currentUser.uid), safeFields, { merge: true });
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
      toggleMuteCategory
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
