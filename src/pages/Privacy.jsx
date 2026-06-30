import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiShield, FiLock, FiEye, FiServer, FiUserCheck } from 'react-icons/fi';

export default function Privacy() {
  const sections = [
    {
      icon: <FiShield size={20} />,
      title: 'Information We Collect',
      content: 'We collect only the minimum information necessary to provide our security scanning services. This includes URLs you submit for scanning, email addresses for account creation, and basic usage analytics to improve our detection algorithms.'
    },
    {
      icon: <FiLock size={20} />,
      title: 'How We Protect Your Data',
      content: 'All data is encrypted in transit using TLS 1.3 and at rest using AES-256 encryption. We use Firebase\'s secure infrastructure with regular security audits. Your scan data is isolated and protected with industry-standard security measures.'
    },
    {
      icon: <FiEye size={20} />,
      title: 'Data Visibility',
      content: 'URLs submitted for scanning may be shared with third-party security APIs (VirusTotal, Google Safe Browsing, URLScan.io) solely for threat analysis. We do not sell, rent, or share your personal information with advertisers or data brokers.'
    },
    {
      icon: <FiServer size={20} />,
      title: 'Data Retention',
      content: 'Scan results are retained for 90 days to improve our detection models. Account information is kept as long as your account is active. You can request deletion of your data at any time by contacting our support team.'
    },
    {
      icon: <FiUserCheck size={20} />,
      title: 'Your Rights',
      content: 'You have the right to access, correct, or delete your personal data. You can export your scan history, close your account, or request a complete data deletion. We comply with GDPR, CCPA, and other applicable privacy regulations.'
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
              Privacy <span className="text-premium">Policy</span>
            </h1>
            <p className="text-[#a1a1aa] text-lg mb-4">Last updated: January 2024</p>
            <p className="text-[#a1a1aa] leading-relaxed mb-12 max-w-2xl">
              Your privacy is fundamental to our mission. We believe security and privacy go hand in hand.
              This policy explains how we collect, use, and protect your information.
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
            <h3 className="text-xl font-semibold mb-3">Questions about your privacy?</h3>
            <p className="text-[#a1a1aa] mb-6">We're here to help. Contact our privacy team anytime.</p>
            <Link to="/contact" className="btn-premium inline-flex">
              Contact Privacy Team
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}