import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  GithubAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { 
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  limit,
  serverTimestamp,
  doc,
  setDoc,
  getDoc
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAP_Rh9Fxy8Qbchqy4AjapSljNq8yGhxow",
  authDomain: "trustshield-ai-5583c.firebaseapp.com",
  projectId: "trustshield-ai-5583c",
  storageBucket: "trustshield-ai-5583c.firebasestorage.app",
  messagingSenderId: "1053795447412",
  appId: "1:1053795447412:web:96d31af73b14422bc71721",
  measurementId: "G-JG7L4MTG0J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

console.log('✅ Firebase initialized');

// Providers
const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

// Add scopes if needed
googleProvider.addScope('profile');
googleProvider.addScope('email');

// Auth functions
export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    await createUserProfile(result.user);
    return result.user;
  } catch (error) {
    console.error('Google login error:', error);
    throw error;
  }
};

export const loginWithGithub = async () => {
  try {
    const result = await signInWithPopup(auth, githubProvider);
    await createUserProfile(result.user);
    return result.user;
  } catch (error) {
    console.error('Github login error:', error);
    throw error;
  }
};

export const signupWithEmail = async (email, password) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await createUserProfile(result.user);
    return result.user;
  } catch (error) {
    console.error('Signup error:', error);
    throw error;
  }
};

export const loginWithEmail = async (email, password) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    console.log('Logged out successfully');
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

// Create user profile in Firestore
export const createUserProfile = async (user) => {
  if (!user) return;
  
  try {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email?.split('@')[0] || 'User',
        photoURL: user.photoURL || '',
        createdAt: serverTimestamp(),
        plan: 'free',
        scanCount: 0
      });
      console.log('✅ New user profile created');
    }
  } catch (error) {
    console.error('Error creating user profile:', error);
  }
};

// Save scan to Firestore
export const saveScan = async (userId, scanData) => {
  try {
    const docRef = await addDoc(collection(db, 'scans'), {
      userId,
      ...scanData,
      timestamp: serverTimestamp()
    });
    console.log('✅ Scan saved:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error saving scan:', error);
    return null;
  }
};

// Get user scans from Firestore
export const getUserScans = async (userId) => {
    try {
      const q = query(
        collection(db, 'scans'),
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(q);
      const scans = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort by timestamp manually (newest first)
      scans.sort((a, b) => {
        const timeA = a.timestamp?.seconds || 0;
        const timeB = b.timestamp?.seconds || 0;
        return timeB - timeA;
      });
      
      return scans;
    } catch (error) {
      console.error('Error getting scans:', error);
      return [];
    }
  };

// Save community report
export const saveReport = async (userId, reportData) => {
  try {
    const docRef = await addDoc(collection(db, 'communityReports'), {
      userId,
      ...reportData,
      votes: { up: 0, down: 0 },
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving report:', error);
    return null;
  }
};

// Get community reports
export const getCommunityReports = async () => {
  try {
    const q = query(
      collection(db, 'communityReports'),
      orderBy('createdAt', 'desc'),
      limit(20)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting reports:', error);
    return [];
  }
};

// Export auth and services
export { auth, db, storage, onAuthStateChanged };
export default app;