import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function IntroAnimation({ onComplete }) {
  const [clicked, setClicked] = useState(false);
  const [exiting, setExiting] = useState(false);

  const handleClick = () => {
    if (clicked) return;
    setClicked(true);
    
    // Wait for unlock animation, then exit
    setTimeout(() => {
      setExiting(true);
    }, 2000);
    
    // Complete after exit animation
    setTimeout(() => {
      onComplete();
    }, 2800);
  };

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#060606]"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          {/* Background particles */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(40)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-emerald-400/20 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -30, 0],
                  opacity: [0, 0.5, 0],
                }}
                transition={{
                  duration: 3 + Math.random() * 4,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>

          <div className="relative z-10 text-center">
            {/* Website Name at Top */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mb-16"
            >
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
                <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                  TrustShield AI
                </span>
              </h1>
              <p className="text-[#71717a] text-sm mt-3 tracking-wide">
                AI-POWERED SCAM DETECTION
              </p>
            </motion.div>

            {/* Big Lock Icon - Clickable */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="relative cursor-pointer"
              onClick={handleClick}
              whileHover={!clicked ? { scale: 1.05 } : {}}
              whileTap={!clicked ? { scale: 0.95 } : {}}
            >
              {/* Glow behind lock */}
              <motion.div
                className="absolute inset-0 bg-emerald-500/20 rounded-full blur-[60px]"
                animate={{
                  scale: clicked ? [1, 1.5, 2] : [1, 1.2, 1],
                  opacity: clicked ? [0.3, 0.6, 0] : [0.2, 0.4, 0.2],
                }}
                transition={{
                  duration: clicked ? 1.5 : 2,
                  repeat: clicked ? 0 : Infinity,
                }}
              />

              {/* Lock Container */}
              <div className="relative w-44 h-44 mx-auto">
                {/* Lock Body */}
                <motion.div
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-28 rounded-3xl border-[3px] border-emerald-400/60 bg-[#0a0a0a] flex items-center justify-center"
                  animate={{
                    borderColor: clicked ? 'rgba(52, 211, 153, 1)' : 'rgba(52, 211, 153, 0.6)',
                    boxShadow: clicked 
                      ? '0 0 40px rgba(52, 211, 153, 0.4), 0 0 80px rgba(52, 211, 153, 0.2)' 
                      : '0 0 20px rgba(52, 211, 153, 0.1)',
                  }}
                  transition={{ duration: 0.6 }}
                >
                  {/* Keyhole */}
                  <motion.div
                    animate={!clicked ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <div className="w-5 h-5 rounded-full border-2 border-emerald-400/60 mx-auto" />
                    <div className="w-2.5 h-7 bg-emerald-400/60 rounded-b-full mx-auto -mt-1" />
                  </motion.div>
                </motion.div>

                {/* Shackle (Lock Arch) */}
                <motion.div
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-24 rounded-t-full border-[3px] border-b-0 border-emerald-400/60"
                  animate={
                    clicked
                      ? {
                          y: -40,
                          rotate: -35,
                          opacity: 0,
                          borderColor: 'rgba(52, 211, 153, 0)',
                        }
                      : {
                          y: 0,
                          rotate: 0,
                          opacity: 1,
                        }
                  }
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  style={{ transformOrigin: 'bottom right' }}
                />

                {/* Click ripple on click */}
                {clicked && (
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-emerald-400"
                    initial={{ scale: 0.8, opacity: 1 }}
                    animate={{ scale: 2.5, opacity: 0 }}
                    transition={{ duration: 1 }}
                  />
                )}
              </div>
            </motion.div>

            {/* Instruction Text Below Lock */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1 }}
              className="mt-12"
            >
              {!clicked ? (
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <p className="text-xl text-white font-medium mb-1">
                    Click on the lock to continue
                  </p>
                  <p className="text-[#71717a] text-sm">
                    Verify you are human
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <p className="text-xl text-emerald-400 font-medium mb-1">
                    ✓ Unlocked
                  </p>
                  <p className="text-[#71717a] text-sm">
                    Welcome to TrustShield AI
                  </p>
                </motion.div>
              )}
            </motion.div>

            {/* Progress dots at bottom */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="mt-16 flex items-center justify-center gap-2"
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    clicked ? 'bg-emerald-400' : 'bg-[#2a2a2a]'
                  }`}
                  animate={
                    clicked
                      ? { scale: [1, 1.5, 1] }
                      : {}
                  }
                  transition={{
                    duration: 0.5,
                    delay: clicked ? i * 0.2 : 0,
                  }}
                />
              ))}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}