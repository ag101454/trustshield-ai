import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowRight, FiX } from 'react-icons/fi';

const steps = [
  {
    title: 'Welcome to TrustShield AI',
    description: 'Your intelligent scam detection platform. Let me show you around quickly!',
  },
  {
    title: 'Website Scanner',
    description: 'Enter any URL here to check if it is safe. We analyze it against 70+ security engines in real-time.',
  },
  {
    title: 'All Tools',
    description: 'Access all 6 scanning tools from the sidebar: Email, Messages, Phone, QR Code, and Company verification.',
  },
  {
    title: 'Your History',
    description: 'All your scans are saved here. You can re-scan or review past results anytime.',
  },
  {
    title: 'Theme Toggle',
    description: 'Switch between dark and light mode. Your preference is saved automatically.',
  },
  {
    title: 'You Are All Set',
    description: 'Start scanning websites and stay protected from online scams!',
  },
];

export default function OnboardingTour({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('hasSeenTour');
    if (!hasSeenTour && window.location.pathname.includes('dashboard')) {
      setTimeout(() => {
        setShow(true);
      }, 1500);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    setShow(false);
    localStorage.setItem('hasSeenTour', 'true');
    if (onComplete) onComplete();
  };

  if (!show) return null;

  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[10000]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/70"
          onClick={handleClose}
        />

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="glass-panel p-6 max-w-sm"
          >
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 text-gray-400 hover:text-white p-1"
            >
              <FiX size={16} />
            </button>

            <p className="text-xs text-emerald-400 mb-3 font-medium">
              Step {currentStep + 1} of {steps.length}
            </p>

            <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>

            <p className="text-gray-400 text-sm mb-6 leading-relaxed">{step.description}</p>

            <div className="flex items-center justify-between">
              <div className="flex gap-1.5">
                {steps.map((_, i) => (
                  <div
                    key={i}
                    className={`rounded-full transition-all duration-300 ${
                      i === currentStep
                        ? 'bg-emerald-400 w-6 h-2'
                        : i < currentStep
                        ? 'bg-emerald-500/50 w-2 h-2'
                        : 'bg-gray-700 w-2 h-2'
                    }`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleClose}
                  className="text-xs text-gray-500 hover:text-white"
                >
                  Skip
                </button>
                <button
                  onClick={handleNext}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-semibold text-xs py-2 px-5 rounded-xl flex items-center gap-2 hover:shadow-lg transition-all"
                >
                  {isLast ? 'Get Started' : 'Next'}
                  <FiArrowRight size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}