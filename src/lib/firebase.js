import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  GithubAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
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

googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// ============================================
// AUTH FUNCTIONS
// ============================================

// Google Login - Mobile friendly
export const loginWithGoogle = async () => {
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  if (isMobile) {
    // Use redirect for mobile (no popup blocking)
    await signInWithRedirect(auth, googleProvider);
    return null; // Will redirect, result handled on return
  } else {
    // Use popup for desktop
    const result = await signInWithPopup(auth, googleProvider);
    await createUserProfile(result.user);
    return result.user;
  }
};

// Handle Google redirect result (for mobile)
export const getGoogleRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      await createUserProfile(result.user);
      return result.user;
    }
    return null;
  } catch (error) {
    console.error('Redirect result error:', error);
    return null;
  }
};

// Github Login
export const loginWithGithub = async () => {
  const result = await signInWithPopup(auth, githubProvider);
  await createUserProfile(result.user);
  return result.user;
};

// Email Signup
export const signupWithEmail = async (email, password) => {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  await createUserProfile(result.user);
  return result.user;
};

// Email Login
export const loginWithEmail = async (email, password) => {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
};

// Logout
export const logoutUser = async () => {
  await signOut(auth);
  console.log('Logged out');
};

// ============================================
// FIRESTORE FUNCTIONS
// ============================================

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
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );
    const snapshot = await getDocs(q);
    const scans = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
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

// Export services
export { auth, db, storage, onAuthStateChanged, googleProvider, githubProvider };
export default app;