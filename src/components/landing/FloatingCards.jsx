import React from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

function TiltCard({ icon, title, description, color }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7.5deg", "-7.5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7.5deg", "7.5deg"]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="glass p-8 cursor-pointer perspective-1000"
    >
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
      <div className={`mt-4 w-12 h-1 rounded-full bg-gradient-to-r ${color}`} />
    </motion.div>
  );
}

export default function FloatingCards() {
  const features = [
    {
      icon: '🌐',
      title: 'Website Checker',
      description: 'Verify any website instantly with AI analysis and threat intelligence',
      color: 'from-cyan-500 to-blue-500'
    },
    {
      icon: '📧',
      title: 'Email Scanner',
      description: 'Detect phishing emails, spoofed headers, and malicious attachments',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: '💬',
      title: 'Message Analyzer',
      description: 'Check SMS and WhatsApp messages for scam patterns and fake offers',
      color: 'from-green-500 to-teal-500'
    },
    {
      icon: '🏢',
      title: 'Company Verification',
      description: 'Confirm if job offers and businesses are legitimate before engaging',
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: '📱',
      title: 'QR Scanner',
      description: 'Decode and verify QR codes before scanning to avoid malicious sites',
      color: 'from-blue-500 to-indigo-500'
    },
    {
      icon: '🖥️',
      title: 'Browser Extension',
      description: 'Real-time protection while browsing with instant trust badges',
      color: 'from-pink-500 to-rose-500'
    }
  ];

  return (
    <section className="py-32 px-4 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent" />
      
      <div className="max-w-7xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Everything You Need to{' '}
            <span className="gradient-text">Stay Safe</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            One platform to verify everything suspicious. Powered by AI and community intelligence.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <TiltCard {...feature} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}