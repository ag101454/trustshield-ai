import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Grid Lines */}
      <div className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: 'linear-gradient(var(--grid-color, #10b981) 1px, transparent 1px), linear-gradient(90deg, var(--grid-color, #10b981) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }}
      />

      {/* Floating Orbs */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-[300px] h-[300px] rounded-full"
          style={{
            background: `radial-gradient(circle, var(--orb-color, rgba(16,185,129,0.05)) 0%, transparent 70%)`,
            left: `${20 + Math.random() * 60}%`,
            top: `${20 + Math.random() * 60}%`,
          }}
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -30, 20, 0],
            scale: [1, 1.1, 0.9, 1],
          }}
          transition={{
            duration: 10 + Math.random() * 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Floating Particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={`p-${i}`}
          className="absolute w-1 h-1 rounded-full"
          style={{
            background: 'var(--particle-color, rgba(16,185,129,0.3))',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -50, 0],
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 5,
            repeat: Infinity,
            delay: Math.random() * 5,
          }}
        />
      ))}
    </div>
  );
}