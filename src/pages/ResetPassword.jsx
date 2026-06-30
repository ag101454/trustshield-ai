import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiMail, FiArrowLeft, FiSend, FiCheckCircle } from 'react-icons/fi';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import toast from 'react-hot-toast';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    setLoading(true);
    try {
      const auth = getAuth();
      await sendPasswordResetEmail(auth, email);
      setSent(true);
      toast.success('Reset link sent to your email');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060606] flex items-center justify-center px-4">
      <div className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: 'linear-gradient(#10b981 1px, transparent 1px), linear-gradient(90deg, #10b981 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }}
      />

      <Link to="/login" className="absolute top-8 left-8 text-[#71717a] hover:text-white transition-colors text-sm flex items-center gap-2">
        <FiArrowLeft size={16} /> Back to Login
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass-panel p-8"
      >
        {!sent ? (
          <>
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                <FiMail className="text-2xl text-emerald-400" />
              </div>
              <h1 className="text-2xl font-bold">Reset Password</h1>
              <p className="text-[#71717a] text-sm mt-2">Enter your email to receive a reset link</p>
            </div>
            <form onSubmit={handleReset} className="space-y-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-3.5 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl text-white placeholder-[#71717a] focus:outline-none focus:border-emerald-500/50 text-sm"
                required
              />
              <button type="submit" disabled={loading} className="btn-premium w-full">
                {loading ? 'Sending...' : <span className="flex items-center gap-2">Send Reset Link <FiSend /></span>}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-8">
            <FiCheckCircle className="text-5xl text-emerald-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Check Your Email</h2>
            <p className="text-[#71717a] text-sm">We've sent a password reset link to <span className="text-white">{email}</span></p>
            <Link to="/login" className="btn-premium inline-flex mt-6">Back to Login</Link>
          </div>
        )}
      </motion.div>
    </div>
  );
}