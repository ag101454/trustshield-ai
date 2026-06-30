import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';
import { FiMail, FiLock, FiArrowRight, FiShield } from 'react-icons/fi';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const user = useAuthStore(state => state.user);
  const authLoading = useAuthStore(state => state.loading);

  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await useAuthStore.getState().loginWithGoogle();
      if (result) {
        useAuthStore.setState({
          user: {
            uid: result.uid,
            email: result.email,
            displayName: result.displayName || result.email?.split('@')[0],
            photoURL: result.photoURL || ''
          }
        });
        toast.success('Welcome!');
      }
    } catch (error) {
      if (error.code === 'auth/popup-closed-by-user') {
        // User closed popup, not an error
      } else {
        toast.error('Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGithubLogin = async () => {
    setLoading(true);
    try {
      const result = await useAuthStore.getState().loginWithGithub();
      if (result) {
        useAuthStore.setState({
          user: {
            uid: result.uid,
            email: result.email,
            displayName: result.displayName || result.email?.split('@')[0],
            photoURL: result.photoURL || ''
          }
        });
        toast.success('Welcome!');
      }
    } catch (error) {
      toast.error('Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setLoading(true);
    try {
      let result;
      if (isSignup) {
        result = await useAuthStore.getState().signupWithEmail(email, password);
        toast.success('Account created!');
      } else {
        result = await useAuthStore.getState().loginWithEmail(email, password);
        toast.success('Welcome back!');
      }
      
      if (result) {
        useAuthStore.setState({
          user: {
            uid: result.uid,
            email: result.email,
            displayName: result.displayName || email.split('@')[0],
            photoURL: result.photoURL || ''
          }
        });
      }
    } catch (error) {
      toast.error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#060606] flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060606] flex items-center justify-center px-4">
      <Link to="/" className="absolute top-8 left-8 text-[#71717a] hover:text-white text-sm">← Back</Link>

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="glass-panel p-8">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mx-auto mb-4">
              <FiShield className="text-2xl text-black" />
            </div>
            <h1 className="text-2xl font-bold">{isSignup ? 'Create Account' : 'Welcome Back'}</h1>
            <p className="text-[#71717a] text-sm mt-1">{isSignup ? 'Start protecting yourself' : 'Sign in to continue'}</p>
          </div>

          <div className="space-y-3 mb-6">
            <button onClick={handleGoogleLogin} disabled={loading} className="w-full p-3.5 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl flex items-center justify-center gap-3 text-white hover:border-emerald-500/30 transition-all disabled:opacity-50 text-sm">
              <FcGoogle size={20} /> Continue with Google
            </button>
            <button onClick={handleGithubLogin} disabled={loading} className="w-full p-3.5 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl flex items-center justify-center gap-3 text-white hover:border-emerald-500/30 transition-all disabled:opacity-50 text-sm">
              <FaGithub size={20} /> Continue with GitHub
            </button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#1a1a1a]" /></div>
            <div className="relative flex justify-center text-xs"><span className="px-4 bg-[#0a0f1e] text-[#71717a]">or continue with email</span></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#71717a]" />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full pl-12 pr-4 py-3.5 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl text-white placeholder-[#71717a] focus:outline-none focus:border-emerald-500/50 text-sm" required />
            </div>
            <div className="relative">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#71717a]" />
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="w-full pl-12 pr-4 py-3.5 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl text-white placeholder-[#71717a] focus:outline-none focus:border-emerald-500/50 text-sm" required />
            </div>
            <button type="submit" disabled={loading} className="btn-premium w-full disabled:opacity-50">
              {loading ? 'Please wait...' : isSignup ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-[#71717a] text-sm mt-6">
            {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button onClick={() => setIsSignup(!isSignup)} className="text-emerald-400 hover:text-emerald-300">{isSignup ? 'Sign In' : 'Create free account'}</button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}