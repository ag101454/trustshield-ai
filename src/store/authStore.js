import { create } from 'zustand';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import toast from 'react-hot-toast';

export const useAuthStore = create((set, get) => ({
  user: null,
  loading: false,  // Start as false
  error: null,

  // Initialize auth listener
  initAuth: () => {
    set({ loading: true });
    
    const unsubscribe = onAuthStateChanged(auth, 
      (user) => {
        if (user) {
          set({ 
            user: {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName || user.email?.split('@')[0],
              photoURL: user.photoURL
            }, 
            loading: false,
            error: null
          });
        } else {
          set({ user: null, loading: false });
        }
      },
      (error) => {
        console.error('Auth state error:', error);
        set({ error: error.message, loading: false });
      }
    );
    
    return unsubscribe;
  },

  // Google Login
  loginWithGoogle: async () => {
    set({ loading: true, error: null });
    
    try {
      const { loginWithGoogle } = await import('../lib/firebase');
      const user = await loginWithGoogle();
      
      set({ 
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || user.email?.split('@')[0],
          photoURL: user.photoURL
        }, 
        loading: false 
      });
      toast.success('Welcome to TrustShield AI! 🛡️');
    } catch (error) {
      console.error('Google login error:', error.message);
      
      // Handle popup closed by user
      if (error.code === 'auth/popup-closed-by-user') {
        set({ loading: false, error: null });
        toast.error('Login cancelled. Please try again.');
        return;
      }
      
      // Handle popup blocked
      if (error.code === 'auth/popup-blocked') {
        set({ loading: false, error: null });
        toast.error('Popup blocked. Please allow popups for this site.');
        return;
      }
      
      set({ error: error.message, loading: false });
      toast.error('Login failed. Please try again.');
    }
  },

  // Github Login
  loginWithGithub: async () => {
    set({ loading: true, error: null });
    
    try {
      const { loginWithGithub } = await import('../lib/firebase');
      const user = await loginWithGithub();
      
      set({ 
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || user.email?.split('@')[0],
          photoURL: user.photoURL
        }, 
        loading: false 
      });
      toast.success('Welcome to TrustShield AI! 🛡️');
    } catch (error) {
      console.error('Github login error:', error.message);
      
      if (error.code === 'auth/popup-closed-by-user') {
        set({ loading: false, error: null });
        toast.error('Login cancelled. Please try again.');
        return;
      }
      
      if (error.code === 'auth/popup-blocked') {
        set({ loading: false, error: null });
        toast.error('Popup blocked. Please allow popups for this site.');
        return;
      }
      
      set({ error: error.message, loading: false });
      toast.error('Login failed. Please try again.');
    }
  },

  // Email Signup
  signupWithEmail: async (email, password) => {
    set({ loading: true, error: null });
    
    try {
      const { signupWithEmail } = await import('../lib/firebase');
      const user = await signupWithEmail(email, password);
      
      set({ 
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || email.split('@')[0],
          photoURL: user.photoURL
        }, 
        loading: false 
      });
      toast.success('Account created successfully! 🎉');
    } catch (error) {
      console.error('Signup error:', error.message);
      
      // Handle weak password
      if (error.code === 'auth/weak-password') {
        set({ error: 'Password should be at least 6 characters', loading: false });
        return;
      }
      
      // Handle email already in use
      if (error.code === 'auth/email-already-in-use') {
        set({ error: 'Email already registered. Try signing in.', loading: false });
        return;
      }
      
      set({ error: error.message, loading: false });
    }
  },

  // Email Login
  loginWithEmail: async (email, password) => {
    set({ loading: true, error: null });
    
    try {
      const { loginWithEmail } = await import('../lib/firebase');
      const user = await loginWithEmail(email, password);
      
      set({ 
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || email.split('@')[0],
          photoURL: user.photoURL
        }, 
        loading: false 
      });
      toast.success('Welcome back! 👋');
    } catch (error) {
      console.error('Login error:', error.message);
      
      // Handle wrong password
      if (error.code === 'auth/wrong-password') {
        set({ error: 'Incorrect password. Please try again.', loading: false });
        return;
      }
      
      // Handle user not found
      if (error.code === 'auth/user-not-found') {
        set({ error: 'No account found with this email. Sign up first.', loading: false });
        return;
      }
      
      // Handle invalid email
      if (error.code === 'auth/invalid-email') {
        set({ error: 'Please enter a valid email address.', loading: false });
        return;
      }
      
      set({ error: error.message, loading: false });
    }
  },

  // Logout
  logout: async () => {
    try {
      const { logoutUser } = await import('../lib/firebase');
      await logoutUser();
      set({ user: null, error: null });
      toast.success('Logged out');
    } catch (error) {
      console.error('Logout error:', error);
      set({ user: null, error: null });
    }
  },

  // Clear error
  clearError: () => set({ error: null })
}));