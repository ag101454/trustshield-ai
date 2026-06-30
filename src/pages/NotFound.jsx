import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiHome, FiSearch } from 'react-icons/fi';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#060606] flex items-center justify-center px-4">
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
        >
          <div className="text-9xl font-bold text-emerald-500/10 mb-4">404</div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h1 className="text-3xl font-bold mb-2">Page Not Found</h1>
          <p className="text-[#71717a] mb-8 max-w-md">
            The page you're looking for doesn't exist or has been moved.
          </p>
          
          <div className="flex gap-4 justify-center">
            <Link to="/" className="btn-premium flex items-center gap-2">
              <FiHome /> Go Home
            </Link>
            <Link to="/dashboard" className="btn-ghost flex items-center gap-2">
              <FiSearch /> Scanner
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}