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

const firebaseConfig = {
  apiKey: "AIzaSyAP_Rh9Fxy8Qbchqy4AjapSljNq8yGhxow",
  authDomain: "trustshield-ai-5583c.firebaseapp.com",
  projectId: "trustshield-ai-5583c",
  storageBucket: "trustshield-ai-5583c.firebasestorage.app",
  messagingSenderId: "1053795447412",
  appId: "1:1053795447412:web:96d31af73b14422bc71721",
  measurementId: "G-JG7L4MTG0J"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

console.log('✅ Firebase initialized');

const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Check if device is mobile
const isMobileDevice = () => {
  return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Google Login - Mobile uses redirect, Desktop uses popup
export const loginWithGoogle = async () => {
  if (isMobileDevice()) {
    await signInWithRedirect(auth, googleProvider);
    return null;
  } else {
    const result = await signInWithPopup(auth, googleProvider);
    await createUserProfile(result.user);
    return result.user;
  }
};

// Handle redirect result when user returns from Google login
export const handleGoogleRedirect = async () => {
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      await createUserProfile(result.user);
      return result.user;
    }
    return null;
  } catch (error) {
    console.error('Redirect error:', error);
    return null;
  }
};

export const loginWithGithub = async () => {
  const result = await signInWithPopup(auth, githubProvider);
  await createUserProfile(result.user);
  return result.user;
};

export const signupWithEmail = async (email, password) => {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  await createUserProfile(result.user);
  return result.user;
};

export const loginWithEmail = async (email, password) => {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
};

export const logoutUser = async () => {
  await signOut(auth);
};

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
    }
  } catch (error) {
    console.error('Error creating profile:', error);
  }
};

export const saveScan = async (userId, scanData) => {
  try {
    const docRef = await addDoc(collection(db, 'scans'), {
      userId,
      ...scanData,
      timestamp: serverTimestamp()
    });
    return docRef.id;
  } catch { return null; }
};

export const getUserScans = async (userId) => {
  try {
    const q = query(collection(db, 'scans'), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    const scans = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    scans.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
    return scans;
  } catch { return []; }
};

export const saveReport = async (userId, reportData) => {
  try {
    const docRef = await addDoc(collection(db, 'communityReports'), {
      userId,
      ...reportData,
      votes: { up: 0, down: 0 },
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch { return null; }
};

export const getCommunityReports = async () => {
  try {
    const q = query(collection(db, 'communityReports'), orderBy('createdAt', 'desc'), limit(20));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch { return []; }
};

export { auth, db, storage, onAuthStateChanged, googleProvider, githubProvider };
export default app;