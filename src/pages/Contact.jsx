import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  FiArrowLeft, FiMail, FiMessageSquare, FiSend, 
  FiHelpCircle, FiShield, FiClock, FiMapPin, FiGithub, FiTwitter 
} from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Contact() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.name || !form.email || !form.subject || !form.message) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    
    // Simulate sending
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast.success('Message sent successfully! We\'ll respond within 24 hours.');
    setForm({ name: '', email: '', subject: '', message: '' });
    setLoading(false);
  };

  const contactInfo = [
    { icon: <FiMail size={20} />, title: 'Email', value: 'hello@trustshield.ai', link: 'mailto:hello@trustshield.ai' },
    { icon: <FiHelpCircle size={20} />, title: 'Support', value: 'support@trustshield.ai', link: 'mailto:support@trustshield.ai' },
    { icon: <FiClock size={20} />, title: 'Response Time', value: 'Within 24 hours', link: null },
    { icon: <FiMapPin size={20} />, title: 'Location', value: 'Global (Remote)', link: null },
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
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Get in <span className="text-premium">Touch</span>
            </h1>
            <p className="text-[#a1a1aa] text-lg max-w-md mx-auto">
              Have questions, feedback, or need help? We'd love to hear from you.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Info Cards */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-4"
            >
              {contactInfo.map((info, i) => (
                <div key={i} className="glass-panel p-5 hover:border-emerald-500/20 transition-all duration-500">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                      {info.icon}
                    </div>
                    <div>
                      <p className="text-sm text-[#71717a]">{info.title}</p>
                      {info.link ? (
                        <a href={info.link} className="text-white font-medium hover:text-emerald-400 transition-colors text-sm">
                          {info.value}
                        </a>
                      ) : (
                        <p className="text-white font-medium text-sm">{info.value}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Social Links */}
              <div className="glass-panel p-5">
                <p className="text-sm text-[#71717a] mb-4">Follow us</p>
                <div className="flex gap-3">
                  <a href="https://github.com" target="_blank" rel="noopener noreferrer" 
                    className="w-10 h-10 rounded-xl bg-[#1a1a1a] flex items-center justify-center text-[#a1a1aa] hover:text-white hover:bg-emerald-500/10 transition-all">
                    <FiGithub size={18} />
                  </a>
                  <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
                    className="w-10 h-10 rounded-xl bg-[#1a1a1a] flex items-center justify-center text-[#a1a1aa] hover:text-white hover:bg-emerald-500/10 transition-all">
                    <FiTwitter size={18} />
                  </a>
                  <a href="mailto:hello@trustshield.ai"
                    className="w-10 h-10 rounded-xl bg-[#1a1a1a] flex items-center justify-center text-[#a1a1aa] hover:text-white hover:bg-emerald-500/10 transition-all">
                    <FiMail size={18} />
                  </a>
                </div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="lg:col-span-2"
            >
              <div className="glass-panel p-8">
                <div className="flex items-center gap-3 mb-8">
                  <FiMessageSquare className="text-emerald-400" size={24} />
                  <h2 className="text-2xl font-semibold">Send us a message</h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm text-[#a1a1aa] mb-2">Name *</label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="John Doe"
                        className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl text-white placeholder-[#71717a] focus:outline-none focus:border-emerald-500/50 transition-colors"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-[#a1a1aa] mb-2">Email *</label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="john@example.com"
                        className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl text-white placeholder-[#71717a] focus:outline-none focus:border-emerald-500/50 transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-[#a1a1aa] mb-2">Subject *</label>
                    <input
                      type="text"
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      placeholder="How can we help?"
                      className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl text-white placeholder-[#71717a] focus:outline-none focus:border-emerald-500/50 transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-[#a1a1aa] mb-2">Message *</label>
                    <textarea
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Tell us what's on your mind..."
                      rows={5}
                      className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl text-white placeholder-[#71717a] focus:outline-none focus:border-emerald-500/50 transition-colors resize-none"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-premium w-full disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        Sending...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Send Message <FiSend />
                      </span>
                    )}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}