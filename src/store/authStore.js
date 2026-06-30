import { create } from 'zustand';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import toast from 'react-hot-toast';

export const useAuthStore = create((set, get) => ({
  user: null,
  loading: true,
  error: null,

  // Initialize auth listener
  initAuth: () => {
    set({ loading: true });
    
    // Check for Google redirect result (mobile login)
    import('../lib/firebase').then(({ getGoogleRedirectResult }) => {
      getGoogleRedirectResult().then(user => {
        if (user) {
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
        }
      }).catch(() => {});
    });
    
    // Listen for auth state changes
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

  // Set user manually
  setUser: (userData) => set({ user: userData, loading: false }),

  // Google Login - Works on desktop & mobile
  loginWithGoogle: async () => {
    set({ loading: true, error: null });
    try {
      const { loginWithGoogle } = await import('../lib/firebase');
      const user = await loginWithGoogle();
      
      // If user is null, it's mobile redirect (page will reload)
      if (user) {
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
      }
      // Mobile: page redirects, no need to update state
    } catch (error) {
      console.error('Google login error:', error.message);
      
      // Popup closed by user - not an error
      if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
        set({ loading: false, error: null });
        return;
      }
      
      // Domain not authorized
      if (error.code === 'auth/unauthorized-domain') {
        set({ loading: false, error: null });
        toast.error('Domain not authorized. Please contact support.');
        return;
      }
      
      set({ error: error.message, loading: false });
      toast.error('Login failed. Try email login instead.');
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
      
      if (error.code === 'auth/weak-password') {
        set({ error: 'Password should be at least 6 characters', loading: false });
        return;
      }
      
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
      
      if (error.code === 'auth/wrong-password') {
        set({ error: 'Incorrect password. Please try again.', loading: false });
        return;
      }
      
      if (error.code === 'auth/user-not-found') {
        set({ error: 'No account found. Sign up first.', loading: false });
        return;
      }
      
      if (error.code === 'auth/invalid-email') {
        set({ error: 'Please enter a valid email.', loading: false });
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