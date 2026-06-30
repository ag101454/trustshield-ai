import { create } from 'zustand';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import toast from 'react-hot-toast';

export const useAuthStore = create((set, get) => ({
  user: null,
  loading: false,
  error: null,

  initAuth: () => {
    set({ loading: true });
    
    const unsubscribe = onAuthStateChanged(auth, 
      (user) => {
        if (user) {
          set({ 
            user: {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName || 'User',
              photoURL: user.photoURL || ''
            }, 
            loading: false,
            error: null
          });
        } else {
          set({ user: null, loading: false });
        }
      },
      (error) => {
        set({ loading: false });
      }
    );
    
    // Fallback: if Firebase doesn't respond in 3 seconds, stop loading
    setTimeout(() => {
      if (get().loading) {
        set({ loading: false });
      }
    }, 3000);
    
    return unsubscribe;
  },

  loginWithGoogle: async () => {
    const { loginWithGoogle } = await import('../lib/firebase');
    const result = await loginWithGoogle();
    return result;
  },

  loginWithGithub: async () => {
    const { loginWithGithub } = await import('../lib/firebase');
    const result = await loginWithGithub();
    return result;
  },

  signupWithEmail: async (email, password) => {
    const { signupWithEmail } = await import('../lib/firebase');
    const result = await signupWithEmail(email, password);
    return result;
  },

  loginWithEmail: async (email, password) => {
    const { loginWithEmail } = await import('../lib/firebase');
    const result = await loginWithEmail(email, password);
    return result;
  },

  logout: async () => {
    const { logoutUser } = await import('../lib/firebase');
    await logoutUser();
    set({ user: null });
  },

  clearError: () => set({ error: null })
}));