import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useThemeStore } from './store/themeStore';
import IntroAnimation from './components/IntroAnimation';
import AnimatedBackground from './components/AnimatedBackground';
import PageTransition from './components/PageTransition';
import OnboardingTour from './components/OnboardingTour';
import VoiceAssistant from './components/VoiceAssistant';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Community from './pages/Community';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Contact from './pages/Contact';
import ResetPassword from './pages/ResetPassword';
import NotFound from './pages/NotFound';

function App() {
  const location = useLocation();
  const [showIntro, setShowIntro] = useState(true);
  const { initTheme } = useThemeStore();

  useEffect(() => {
    initTheme();
  }, []);

  const handleIntroComplete = () => setShowIntro(false);
  if (location.pathname !== '/' && showIntro) setShowIntro(false);

  return (
    <>
      <AnimatedBackground />
      
      {showIntro && location.pathname === '/' && (
        <IntroAnimation onComplete={handleIntroComplete} />
      )}
      
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageTransition><Landing /></PageTransition>} />
          <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
          <Route path="/dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
          <Route path="/community" element={<PageTransition><Community /></PageTransition>} />
          <Route path="/privacy" element={<PageTransition><Privacy /></PageTransition>} />
          <Route path="/terms" element={<PageTransition><Terms /></PageTransition>} />
          <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
          <Route path="/reset-password" element={<PageTransition><ResetPassword /></PageTransition>} />
          <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
        </Routes>
      </AnimatePresence>
      
      <OnboardingTour />
      
      {/* Voice Assistant - Floating Microphone */}
      <VoiceAssistant />
    </>
  );
}

export default App;