import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiCheckCircle, FiAlertCircle, FiShield, FiUsers, FiCpu } from 'react-icons/fi';

export default function Terms() {
  const sections = [
    {
      icon: <FiCheckCircle size={20} />,
      title: 'Acceptance of Terms',
      content: 'By accessing or using TrustShield AI, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services. We reserve the right to update these terms at any time with reasonable notice to users.'
    },
    {
      icon: <FiShield size={20} />,
      title: 'Service Description',
      content: 'TrustShield AI provides website, email, and message scanning services for security analysis. Our service is provided "as is" for informational purposes. We strive for accuracy but cannot guarantee 100% detection of all threats. Always exercise personal judgment.'
    },
    {
      icon: <FiUsers size={20} />,
      title: 'User Responsibilities',
      content: 'You agree to use TrustShield AI only for lawful purposes. You shall not attempt to reverse engineer, overload, or disrupt our services. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.'
    },
    {
      icon: <FiCpu size={20} />,
      title: 'API Usage & Rate Limits',
      content: 'Free accounts are subject to rate limits of 500 scans per day. Automated access requires an API key. Excessive or abusive usage may result in temporary or permanent suspension of access. Commercial use requires a separate agreement.'
    },
    {
      icon: <FiAlertCircle size={20} />,
      title: 'Limitation of Liability',
      content: 'TrustShield AI shall not be liable for any indirect, incidental, or consequential damages arising from the use of our services. Our total liability is limited to the amount paid for services in the 12 months preceding any claim. We are not responsible for third-party API availability.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#060606] text-[#fafafa]">
      {/* Navbar */}
      <nav className="fixed top-4 left-4 right-4 z-50 max-w-6xl mx-auto">
        <div className="glass-panel px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-black font-bold text-sm">T</div>
            <span className="text-lg font-semibold">TrustShield AI</span>
          </Link>
          <Link to="/" className="flex items-center gap-2 text-[#a1a1aa] hover:text-white transition-colors text-sm">
            <FiArrowLeft size={16} /> Back to Home
          </Link>
        </div>
      </nav>

      {/* Content */}
      <div className="pt-32 pb-24 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Terms of <span className="text-premium">Service</span>
            </h1>
            <p className="text-[#a1a1aa] text-lg mb-4">Last updated: January 2024</p>
            <p className="text-[#a1a1aa] leading-relaxed mb-12 max-w-2xl">
              These terms govern your use of TrustShield AI. By using our platform, you agree to these conditions.
              Please read them carefully before using our services.
            </p>
          </motion.div>

          <div className="space-y-4">
            {sections.map((section, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                className="glass-panel p-6 hover:border-emerald-500/20 transition-all duration-500"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                    {section.icon}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold mb-3">{section.title}</h2>
                    <p className="text-[#a1a1aa] leading-relaxed text-sm">{section.content}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-12 glass-panel p-8 text-center"
          >
            <h3 className="text-xl font-semibold mb-3">Have questions about our terms?</h3>
            <p className="text-[#a1a1aa] mb-6">Contact our legal team for clarification.</p>
            <Link to="/contact" className="btn-premium inline-flex">
              Contact Legal Team
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}