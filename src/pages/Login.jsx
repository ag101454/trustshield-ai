import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';
import { FiMail, FiLock, FiArrowRight, FiShield, FiUser } from 'react-icons/fi';
import { useAuthStore } from '../store/authStore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const navigate = useNavigate();
  
  const user = useAuthStore(state => state.user);
  const loading = useAuthStore(state => state.loading);
  const error = useAuthStore(state => state.error);
  const loginWithGoogle = useAuthStore(state => state.loginWithGoogle);
  const loginWithGithub = useAuthStore(state => state.loginWithGithub);
  const signupWithEmail = useAuthStore(state => state.signupWithEmail);
  const loginWithEmail = useAuthStore(state => state.loginWithEmail);
  const clearError = useAuthStore(state => state.clearError);

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSignup) {
      await signupWithEmail(email, password);
    } else {
      await loginWithEmail(email, password);
    }
  };

  return (
    <div className="min-h-screen bg-[#060606] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Grid Background */}
      <div className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: 'linear-gradient(#10b981 1px, transparent 1px), linear-gradient(90deg, #10b981 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }}
      />

      {/* Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/[0.02] rounded-full blur-[180px]" />

      {/* Floating Elements */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-emerald-400/20 rounded-full"
          style={{
            left: `${20 + Math.random() * 60}%`,
            top: `${20 + Math.random() * 60}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0, 0.5, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 3,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}

      {/* Back to Home */}
      <Link to="/" className="absolute top-8 left-8 text-[#71717a] hover:text-white transition-colors text-sm flex items-center gap-2">
        ← Back to Home
      </Link>

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        className="relative w-full max-w-md"
      >
        <div className="glass-panel-highlight p-8 md:p-10">
          {/* Logo */}
          <div className="text-center mb-8">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.8 }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/20"
            >
              <FiShield className="text-2xl text-black" />
            </motion.div>
            <h1 className="text-2xl font-bold tracking-tight mb-1">
              {isSignup ? 'Create Account' : 'Welcome Back'}
            </h1>
            <p className="text-[#71717a] text-sm">
              {isSignup ? 'Start protecting yourself today' : 'Sign in to continue protecting yourself'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm"
            >
              {error}
            </motion.div>
          )}

          {/* Social Login */}
          <div className="space-y-3 mb-6">
            <button 
              onClick={loginWithGoogle}
              disabled={loading}
              className="w-full p-3.5 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl flex items-center justify-center gap-3 text-white hover:border-emerald-500/30 transition-all disabled:opacity-50 text-sm font-medium"
            >
              <FcGoogle size={20} />
              Continue with Google
            </button>
            <button 
              onClick={loginWithGithub}
              disabled={loading}
              className="w-full p-3.5 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl flex items-center justify-center gap-3 text-white hover:border-emerald-500/30 transition-all disabled:opacity-50 text-sm font-medium"
            >
              <FaGithub size={20} />
              Continue with GitHub
            </button>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#1a1a1a]" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-4 bg-[#0a0a0a] text-[#71717a]">or continue with email</span>
            </div>
          </div>

          {/* Email Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#71717a]" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="w-full pl-12 pr-4 py-3.5 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl text-white placeholder-[#71717a] focus:outline-none focus:border-emerald-500/50 transition-all text-sm"
                required
                disabled={loading}
              />
            </div>
            <div className="relative">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#71717a]" size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full pl-12 pr-4 py-3.5 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl text-white placeholder-[#71717a] focus:outline-none focus:border-emerald-500/50 transition-all text-sm"
                required
                disabled={loading}
                minLength={6}
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="btn-premium w-full disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Please wait...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  {isSignup ? 'Create Account' : 'Sign In'} <FiArrowRight />
                </span>
              )}
            </button>
          </form>

          {/* Toggle Sign In/Up */}
          <p className="text-center text-[#71717a] text-sm mt-6">
            {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => {
                setIsSignup(!isSignup);
                clearError();
              }}
              className="text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
              disabled={loading}
            >
              {isSignup ? 'Sign In' : 'Create free account'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}