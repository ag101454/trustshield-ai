import React from 'react';
import { motion } from 'framer-motion';
import { FiSun, FiMoon } from 'react-icons/fi';
import { useThemeStore } from '../store/themeStore';
import { useSound } from '../hooks/useSound';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore();
  const { playClick } = useSound();
  const isDark = theme === 'dark';

  const handleToggle = () => {
    playClick();
    toggleTheme();
  };

  return (
    <motion.button
      onClick={handleToggle}
      className="relative w-14 h-7 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] cursor-pointer overflow-hidden"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Toggle theme"
    >
      <motion.div
        className="absolute top-0.5 w-6 h-6 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg"
        animate={{ left: isDark ? '2px' : '28px' }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      >
        <motion.div
          initial={false}
          animate={{ rotate: isDark ? 0 : 360 }}
          transition={{ duration: 0.5 }}
        >
          {isDark ? (
            <FiMoon size={12} className="text-white" />
          ) : (
            <FiSun size={12} className="text-[#060606]" />
          )}
        </motion.div>
      </motion.div>
      
      {/* Stars (visible in dark mode) */}
      <motion.div
        className="absolute inset-0 flex items-center justify-end pr-2"
        animate={{ opacity: isDark ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      >
        <span className="text-[6px] text-white/20">✦</span>
      </motion.div>
      
      {/* Rays (visible in light mode) */}
      <motion.div
        className="absolute inset-0 flex items-center justify-start pl-2"
        animate={{ opacity: isDark ? 0 : 1 }}
        transition={{ duration: 0.3 }}
      >
        <span className="text-[6px] text-white/20">☀</span>
      </motion.div>
    </motion.button>
  );
}