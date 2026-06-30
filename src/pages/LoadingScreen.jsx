import React from 'react';
import { motion } from 'framer-motion';

export default function LoadingScreen({ message = 'Loading...' }) {
  return (
    <div className="min-h-screen bg-[#060606] flex items-center justify-center">
      <div className="text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 mx-auto mb-6"
        >
          <div className="w-full h-full rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
            <div className="w-8 h-8 rounded-lg bg-[#060606]" />
          </div>
        </motion.div>
        
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-[#71717a] text-sm"
        >
          {message}
        </motion.p>
      </div>
    </div>
  );
}