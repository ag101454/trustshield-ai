import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiCheck, FiShield, FiLock, FiZap, FiUsers, FiGlobe, FiStar, FiTrendingUp, FiAward } from 'react-icons/fi';

// ============================================
// SCROLL REVEAL COMPONENT
// ============================================
function ScrollReveal({ children, className, delay = 0 }) {
  const ref = useRef();
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.4, 0, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// ANIMATED COUNTER COMPONENT
// ============================================
function AnimatedCounter({ value, suffix = '', label }) {
  const ref = useRef();
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const end = parseInt(value);
    const duration = 2;
    const increment = end / (duration * 60);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, value]);

  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl md:text-5xl font-bold text-premium mb-2">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-[#71717a] text-sm">{label}</div>
    </div>
  );
}

// ============================================
// MAIN LANDING PAGE
// ============================================
export default function Landing() {
  const containerRef = useRef();
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.08], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.08], [1, 0.96]);

  const features = [
    { icon: '🔍', title: 'Website Scanner', desc: 'Real-time URL analysis powered by VirusTotal, Google Safe Browsing, and WHOIS databases with 70+ security engines.' },
    { icon: '📧', title: 'Email Analyzer', desc: 'Advanced phishing detection that scans email content, headers, links, and attachments for scam patterns.' },
    { icon: '💬', title: 'Message Scanner', desc: 'Check SMS, WhatsApp, and social media messages for scam indicators before you respond.' },
    { icon: '🏢', title: 'Company Verification', desc: 'Verify businesses and job offers against our database. Detect fake recruiters and fraudulent companies.' },
    { icon: '📱', title: 'Phone Lookup', desc: 'Check phone numbers against scam databases. Identify spam callers and fraudulent numbers instantly.' },
    { icon: '📷', title: 'QR Code Scanner', desc: 'Upload or paste QR codes to decode and analyze them for malicious links before scanning.' },
  ];

  const steps = [
    { step: '01', icon: '🔗', title: 'Paste or Upload', desc: 'Enter any URL, paste an email, or upload a QR code image for analysis.' },
    { step: '02', icon: '🤖', title: 'AI Multi-Scan', desc: 'Our system checks against 70+ security engines and threat databases simultaneously.' },
    { step: '03', icon: '📊', title: 'Get Trust Score', desc: 'Receive a detailed trust score with breakdown of all security checks performed.' },
    { step: '04', icon: '🛡️', title: 'Stay Protected', desc: 'Make informed decisions with real-time data and community-verified reports.' },
  ];

  const stats = [
    { value: 10000, suffix: '+', label: 'Users Protected' },
    { value: 98, suffix: '%', label: 'Detection Rate' },
    { value: 500000, suffix: '+', label: 'Threats Blocked' },
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Cybersecurity Analyst',
      text: 'TrustShield AI caught a sophisticated phishing email that bypassed our corporate filters. The detailed analysis helped us train our team on what to look for.',
      rating: 5
    },
    {
      name: 'Marcus Johnson',
      role: 'Small Business Owner',
      text: 'I almost fell for a fake invoice scam. TrustShield flagged it immediately. This tool has saved my business thousands of dollars.',
      rating: 5
    },
    {
      name: 'Priya Patel',
      role: 'Freelance Developer',
      text: 'As a freelancer, I get lots of job offers. TrustShield helps me verify companies before I share any personal information. Absolutely essential.',
      rating: 5
    },
  ];

  return (
    <div ref={containerRef} className="bg-[#060606] text-[#fafafa]">
      {/* ============================================ */}
      {/* NAVBAR - FLOATING GLASS */}
      {/* ============================================ */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
        className="fixed top-4 left-4 right-4 z-50 max-w-6xl mx-auto"
      >
        <div className="glass-panel px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <motion.div 
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-black font-bold text-sm shadow-lg shadow-emerald-500/20"
            >
              T
            </motion.div>
            <div>
              <span className="text-lg font-semibold tracking-tight">TrustShield</span>
              <span className="text-[10px] text-emerald-400 block -mt-0.5 tracking-wider">AI</span>
            </div>
          </Link>
          
          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            {[
              { label: 'Features', href: '#features' },
              { label: 'How It Works', href: '#how-it-works' },
              { label: 'Testimonials', href: '#testimonials' },
              { label: 'Community', href: '/community' },
            ].map(item => (
              <a 
                key={item.label}
                href={item.href} 
                className="text-sm text-[#a1a1aa] hover:text-white transition-colors duration-200 relative group"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-emerald-500 group-hover:w-full transition-all duration-300" />
              </a>
            ))}
          </div>
          
          {/* CTA Buttons */}
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm text-[#a1a1aa] hover:text-white transition-colors hidden sm:block">
              Sign In
            </Link>
            <Link to="/login" className="btn-premium text-sm py-2.5 px-5">
              Get Started
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* ============================================ */}
      {/* HERO SECTION */}
      {/* ============================================ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Grid Background */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(#10b981 1px, transparent 1px), linear-gradient(90deg, #10b981 1px, transparent 1px)',
            backgroundSize: '80px 80px'
          }}
        />

        {/* Ambient Glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-500/[0.03] rounded-full blur-[200px]" />
        
        {/* Floating Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/[0.02] rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/[0.02] rounded-full blur-[150px] animate-pulse" />

        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-0.5 h-0.5 bg-emerald-400/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -40, 0],
                opacity: [0, 0.6, 0],
              }}
              transition={{
                duration: 4 + Math.random() * 5,
                repeat: Infinity,
                delay: Math.random() * 4,
              }}
            />
          ))}
        </div>

        {/* Hero Content */}
        <motion.div 
          style={{ opacity: heroOpacity, scale: heroScale }} 
          className="relative z-10 text-center px-4 max-w-5xl mx-auto pt-20"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border-emerald-500/20 mb-8"
          >
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-sm text-[#a1a1aa]">AI-Powered Scam Detection Platform</span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.05] mb-8"
          >
            <span className="text-white">Protect yourself</span>
            <br />
            <span className="text-premium text-glow-green">from online scams</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="text-lg md:text-xl text-[#a1a1aa] max-w-xl mx-auto mb-12 leading-relaxed"
          >
            Advanced AI analyzes websites, emails, and messages in real-time.
            <span className="text-emerald-400"> Stop scams before they stop you.</span>
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-20"
          >
            <Link to="/login" className="btn-premium text-lg px-10 py-4">
              Start Scanning Free <FiArrowRight />
            </Link>
            <a href="#features" className="btn-ghost text-lg px-10 py-4">
              Learn More
            </a>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="grid grid-cols-3 gap-8 max-w-2xl mx-auto"
          >
            {stats.map((stat, i) => (
              <AnimatedCounter key={i} {...stat} />
            ))}
          </motion.div>

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
            className="flex flex-wrap items-center justify-center gap-8 mt-12 text-sm text-[#71717a]"
          >
            <span className="flex items-center gap-2"><FiCheck className="text-emerald-500" /> Free Forever</span>
            <span className="flex items-center gap-2"><FiCheck className="text-emerald-500" /> No Credit Card</span>
            <span className="flex items-center gap-2"><FiCheck className="text-emerald-500" /> Enterprise Security</span>
          </motion.div>
        </motion.div>

        {/* Bottom Gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-[#060606] to-transparent" />
      </section>

      {/* ============================================ */}
      {/* FEATURES SECTION */}
      {/* ============================================ */}
      <section id="features" className="py-32 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/[0.01] to-transparent" />
        
        <div className="max-w-6xl mx-auto relative">
          <ScrollReveal className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Everything you need to{' '}
              <span className="text-premium">stay safe</span>
            </h2>
            <p className="text-[#a1a1aa] text-lg max-w-md mx-auto">
              Six powerful tools. One platform. Complete protection against online threats.
            </p>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <div className="glass-panel p-8 group cursor-pointer hover:border-emerald-500/20 transition-all duration-500 h-full">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-2xl mb-5 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold mb-3 text-white">{feature.title}</h3>
                  <p className="text-[#a1a1aa] text-sm leading-relaxed">{feature.desc}</p>
                  <div className="mt-4 w-8 h-0.5 rounded-full bg-emerald-500/30 group-hover:w-16 transition-all duration-300" />
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* HOW IT WORKS SECTION */}
      {/* ============================================ */}
      <section id="how-it-works" className="py-32 px-4 border-t border-[#111]">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              How it <span className="text-premium">works</span>
            </h2>
            <p className="text-[#a1a1aa] text-lg max-w-md mx-auto">
              Get protected in four simple steps
            </p>
          </ScrollReveal>

          <div className="space-y-4">
            {steps.map((item, i) => (
              <ScrollReveal key={i} delay={i * 0.15}>
                <div className="glass-panel p-6 flex items-center gap-6 group hover:border-emerald-500/20 transition-all duration-500">
                  <div className="text-4xl font-bold text-[#111] group-hover:text-emerald-500/10 transition-colors duration-500 shrink-0 w-16 text-center">
                    {item.step}
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-xl shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">{item.title}</h3>
                    <p className="text-[#a1a1aa] text-sm">{item.desc}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* TESTIMONIALS SECTION */}
      {/* ============================================ */}
      <section id="testimonials" className="py-32 px-4 border-t border-[#111]">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Trusted by <span className="text-premium">thousands</span>
            </h2>
            <p className="text-[#a1a1aa] text-lg max-w-md mx-auto">
              See what our users say about TrustShield AI
            </p>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, i) => (
              <ScrollReveal key={i} delay={i * 0.15}>
                <div className="glass-panel p-8 h-full flex flex-col">
                  {/* Stars */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, j) => (
                      <FiStar key={j} className="text-yellow-500 fill-yellow-500" size={16} />
                    ))}
                  </div>
                  {/* Quote */}
                  <p className="text-[#a1a1aa] text-sm leading-relaxed mb-6 flex-1">
                    "{testimonial.text}"
                  </p>
                  {/* Author */}
                  <div>
                    <p className="text-white font-medium text-sm">{testimonial.name}</p>
                    <p className="text-[#71717a] text-xs">{testimonial.role}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* CTA SECTION */}
      {/* ============================================ */}
      <section className="py-32 px-4 border-t border-[#111]">
        <div className="max-w-3xl mx-auto text-center">
          <ScrollReveal>
            <div className="glass-panel-highlight p-16 relative overflow-hidden">
              {/* Background glow */}
              <div className="absolute inset-0 bg-emerald-500/[0.02]" />
              
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mx-auto mb-8 text-2xl shadow-lg shadow-emerald-500/20">
                  🛡️
                </div>
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                  Ready to{' '}
                  <span className="text-premium">protect yourself?</span>
                </h2>
                <p className="text-[#a1a1aa] text-lg mb-10 max-w-md mx-auto">
                  Join thousands of users who trust TrustShield AI to keep them safe from online scams.
                </p>
                <Link to="/login" className="btn-premium text-lg px-12 py-5 inline-flex">
                  Get Started Free <FiArrowRight />
                </Link>
                <p className="text-[#71717a] text-sm mt-4">No credit card required • Free forever</p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ============================================ */}
      {/* FOOTER */}
      {/* ============================================ */}
      <footer className="border-t border-[#111] py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-black font-bold text-xs">T</div>
                <span className="text-white font-semibold">TrustShield AI</span>
              </div>
              <p className="text-[#71717a] text-sm leading-relaxed">
                Protecting millions from online scams with advanced AI detection.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-white font-medium mb-4 text-sm">Product</h4>
              <ul className="space-y-2">
                <li><Link to="/dashboard" className="text-[#71717a] hover:text-white text-sm transition-colors">Website Scanner</Link></li>
                <li><Link to="/dashboard" className="text-[#71717a] hover:text-white text-sm transition-colors">Email Analyzer</Link></li>
                <li><Link to="/dashboard" className="text-[#71717a] hover:text-white text-sm transition-colors">Phone Lookup</Link></li>
                <li><Link to="/community" className="text-[#71717a] hover:text-white text-sm transition-colors">Community</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-white font-medium mb-4 text-sm">Company</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="text-[#71717a] hover:text-white text-sm transition-colors">About</a></li>
                <li><a href="#testimonials" className="text-[#71717a] hover:text-white text-sm transition-colors">Testimonials</a></li>
                <li><Link to="/contact" className="text-[#71717a] hover:text-white text-sm transition-colors">Contact</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-white font-medium mb-4 text-sm">Legal</h4>
              <ul className="space-y-2">
                <li><Link to="/privacy" className="text-[#71717a] hover:text-white text-sm transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-[#71717a] hover:text-white text-sm transition-colors">Terms of Service</Link></li>
                <li><Link to="/contact" className="text-[#71717a] hover:text-white text-sm transition-colors">Support</Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-[#111] pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[#71717a] text-sm">© 2024 TrustShield AI. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link to="/privacy" className="text-[#71717a] hover:text-white text-sm transition-colors">Privacy</Link>
              <Link to="/terms" className="text-[#71717a] hover:text-white text-sm transition-colors">Terms</Link>
              <Link to="/contact" className="text-[#71717a] hover:text-white text-sm transition-colors">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}