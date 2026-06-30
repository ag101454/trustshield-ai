import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { saveScan, getUserScans } from '../lib/firebase';
import { scanWebsite } from '../lib/aiScanner';
import toast from 'react-hot-toast';
import { 
    FiLogOut, FiSearch, FiClock, FiShield, 
    FiMail, FiPhone, FiUsers, FiMessageSquare,
    FiCamera, FiHome, FiTrendingUp, FiAward,
    FiChevronRight, FiBarChart2, FiGlobe,
    FiAlertCircle, FiCheckCircle
  } from 'react-icons/fi';
import EmailScanner from '../components/dashboard/EmailScanner';
import PhoneLookup from '../components/dashboard/PhoneLookup';
import QRScanner from '../components/dashboard/QRScanner';
import MessageScanner from '../components/dashboard/MessageScanner';
import CompanyVerification from '../components/dashboard/CompanyVerification';
import ThemeToggle from '../components/ThemeToggle';
import { useSound } from '../hooks/useSound';

export default function Dashboard() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scanHistory, setScanHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('scanner');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const user = useAuthStore(state => state.user);
  const authLoading = useAuthStore(state => state.loading);
  const logout = useAuthStore(state => state.logout);
  const initAuth = useAuthStore(state => state.initAuth);
  const navigate = useNavigate();
  const { playClick, playSuccess, playHover, playScan } = useSound();

  // Initialize auth
  useEffect(() => {
    const unsubscribe = initAuth();
    return () => { if (typeof unsubscribe === 'function') unsubscribe(); };
  }, [initAuth]);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) navigate('/login');
  }, [user, authLoading, navigate]);

  // ============================================
  // VOICE COMMAND LISTENER (URL Hash Method)
  // ============================================
  useEffect(() => {
    const processHash = () => {
      const hash = window.location.hash;
      if (!hash) return;
      
      // Parse tab parameter
      if (hash.includes('tab=')) {
        const tabMatch = hash.match(/tab=([^&]+)/);
        if (tabMatch) {
          const tab = tabMatch[1];
          const validTabs = ['scanner', 'email', 'message', 'phone', 'qr', 'company', 'history', 'community'];
          if (validTabs.includes(tab)) {
            setActiveTab(tab);
            setResult(null);
          }
        }
      }
      
      // Parse scan parameter
      if (hash.includes('scan=')) {
        const scanMatch = hash.match(/scan=([^&]+)/);
        if (scanMatch) {
          const scanUrl = decodeURIComponent(scanMatch[1]);
          setUrl(scanUrl);
          setActiveTab('scanner');
          setResult(null);
          // Auto-trigger scan after URL is set
          setTimeout(() => {
            const finalUrl = scanUrl;
            handleAutoScan(finalUrl);
          }, 500);
        }
      }
      
      // Clear hash after processing
      if (hash) {
        window.history.replaceState(null, '', window.location.pathname);
      }
    };

    // Process on mount
    processHash();

    // Listen for hash changes
    window.addEventListener('hashchange', processHash);
    return () => window.removeEventListener('hashchange', processHash);
  }, []);

  // Auto scan function (called from voice command)
  const handleAutoScan = async (scanUrl) => {
    if (!scanUrl) return;
    
    let fullUrl = scanUrl;
    if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
      fullUrl = 'https://' + fullUrl;
    }
    
    try {
      new URL(fullUrl);
    } catch {
      return;
    }

    playScan();
    setLoading(true);
    setResult(null);
    
    try {
      const scanResult = await scanWebsite(fullUrl);
      setResult(scanResult);
      if (user) {
        await saveScan(user.uid, { type: 'website', url: fullUrl, result: scanResult });
        loadScanHistory();
        playSuccess();
        toast.success('Scan complete!');
      }
    } catch (error) {
      toast.error('Scan failed');
    } finally {
      setLoading(false);
    }
  };

  // Load scan history
  const loadScanHistory = useCallback(async () => {
    if (!user) return;
    try {
      const scans = await getUserScans(user.uid);
      setScanHistory(scans);
    } catch (error) {
      console.error('Error loading scans:', error);
    }
  }, [user]);

  useEffect(() => {
    if (user) loadScanHistory();
  }, [user, loadScanHistory]);

  // Handle manual URL scan
  const handleScan = async () => {
    if (!url) { toast.error('Please enter a URL'); return; }
    
    let scanUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      scanUrl = 'https://' + url;
    }
    
    try { new URL(scanUrl); } catch { toast.error('Please enter a valid URL'); return; }

    playScan();
    setLoading(true);
    setResult(null);
    
    try {
      const scanResult = await scanWebsite(scanUrl);
      setResult(scanResult);
      if (user) {
        await saveScan(user.uid, { type: 'website', url: scanUrl, result: scanResult });
        loadScanHistory();
        playSuccess();
        toast.success('Scan complete!');
      }
    } catch (error) {
      toast.error('Scan failed');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Handle tab change
  const handleTabChange = (tabId) => {
    playClick();
    setActiveTab(tabId);
    setResult(null);
    setUrl('');
  };

  // Handle logout
  const handleLogout = async () => {
    playClick();
    await logout();
    navigate('/');
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16"
        >
          <div className="w-full h-full rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
            <div className="w-8 h-8 rounded-lg bg-[var(--bg-primary)]" />
          </div>
        </motion.div>
      </div>
    );
  }

  if (!user) return null;

  // Menu items
  const menuItems = [
    { id: 'scanner', icon: <FiGlobe size={18} />, label: 'Website Scanner' },
    { id: 'email', icon: <FiMail size={18} />, label: 'Email Analyzer' },
    { id: 'message', icon: <FiMessageSquare size={18} />, label: 'Message Scanner' },
    { id: 'phone', icon: <FiPhone size={18} />, label: 'Phone Lookup' },
    { id: 'qr', icon: <FiCamera size={18} />, label: 'QR Scanner' },
    { id: 'company', icon: <FiShield size={18} />, label: 'Company Check' },
  ];

  const bottomItems = [
    { id: 'history', icon: <FiClock size={18} />, label: 'Scan History' },
    { id: 'community', icon: <FiUsers size={18} />, label: 'Community' },
  ];

  const stats = [
    { label: 'Total Scans', value: scanHistory.length, icon: <FiBarChart2 size={18} /> },
    { label: 'Threats', value: scanHistory.filter(s => s.result?.trustScore < 60).length, icon: <FiAlertCircle size={18} /> },
    { label: 'Safe', value: scanHistory.filter(s => s.result?.trustScore >= 80).length, icon: <FiCheckCircle size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex">
      {/* SIDEBAR */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} glass-panel border-r border-[var(--border-subtle)] flex flex-col transition-all duration-300 fixed left-4 top-4 bottom-4 z-40`}>
        <div className="p-5 border-b border-[var(--border-subtle)]">
          <Link to="/" className="flex items-center gap-3" onClick={playClick}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-black font-bold text-xs">T</div>
            {sidebarOpen && <span className="text-sm font-semibold text-[var(--text-primary)]">TrustShield</span>}
          </Link>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          <p className={`text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-2 ${!sidebarOpen && 'text-center'}`}>{sidebarOpen ? 'Scanners' : ''}</p>
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              onMouseEnter={playHover}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                activeTab === item.id 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]'
              } ${!sidebarOpen && 'justify-center'}`}
            >
              {item.icon}
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}

          <p className={`text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-2 mt-6 ${!sidebarOpen && 'text-center'}`}>{sidebarOpen ? 'More' : ''}</p>
          {bottomItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              onMouseEnter={playHover}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                activeTab === item.id 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]'
              } ${!sidebarOpen && 'justify-center'}`}
            >
              {item.icon}
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-[var(--border-subtle)]">
          <div className={`flex items-center gap-3 mb-3 ${!sidebarOpen && 'justify-center'}`}>
            {user.photoURL ? (
              <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full ring-1 ring-emerald-500/30" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs font-medium">
                {user.displayName?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-[var(--text-primary)] truncate">{user.displayName || 'User'}</p>
                <p className="text-[10px] text-[var(--text-muted)] truncate">{user.email}</p>
              </div>
            )}
          </div>
          <button onClick={handleLogout} className={`w-full flex items-center gap-2 px-3 py-2 text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/5 rounded-lg transition-all text-xs ${!sidebarOpen && 'justify-center'}`}>
            <FiLogOut size={14} />{sidebarOpen && 'Sign Out'}
          </button>
        </div>

        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-medium)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
          <FiChevronRight size={12} className={!sidebarOpen ? 'rotate-180' : ''} />
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-72' : 'ml-24'} p-8`}>
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
              {menuItems.find(m => m.id === activeTab)?.label || bottomItems.find(m => m.id === activeTab)?.label || 'Dashboard'}
            </h1>
            <p className="text-[var(--text-muted)] text-sm mt-1">
              {activeTab === 'scanner' && 'Analyze websites for security threats'}
              {activeTab === 'email' && 'Check emails for phishing attempts'}
              {activeTab === 'message' && 'Scan messages for scam patterns'}
              {activeTab === 'phone' && 'Look up phone numbers'}
              {activeTab === 'qr' && 'Decode and analyze QR codes'}
              {activeTab === 'company' && 'Verify companies and job offers'}
              {activeTab === 'history' && 'Your recent scan history'}
              {activeTab === 'community' && 'Community scam reports'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link to="/" onClick={playClick} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-2">
              <FiHome size={18} />
            </Link>
          </div>
        </div>

        {/* Stats */}
        {activeTab === 'scanner' && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            {stats.map((stat, i) => (
              <div key={i} className="glass-panel p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">{stat.icon}</div>
                <div>
                  <div className="text-xl font-bold text-[var(--text-primary)]">{stat.value}</div>
                  <div className="text-xs text-[var(--text-muted)]">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* WEBSITE SCANNER */}
        {activeTab === 'scanner' && (
          <>
            <div className="glass-panel p-6 mb-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Enter website URL (e.g., google.com)"
                    className="w-full pl-12 pr-4 py-4 bg-[var(--bg-secondary)] border border-[var(--border-medium)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-emerald-500/50 text-sm"
                    onKeyDown={(e) => e.key === 'Enter' && handleScan()}
                  />
                </div>
                <button onClick={handleScan} disabled={loading || !url} className="btn-premium px-8 disabled:opacity-50 whitespace-nowrap">
                  {loading ? 'Scanning...' : 'Scan URL'}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="glass-panel p-16 text-center">
                  <div className="w-16 h-16 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-6" />
                  <p className="text-[var(--text-secondary)]">AI is analyzing this website...</p>
                </motion.div>
              )}

              {result && !loading && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  <div className={`glass-panel p-10 text-center border-2 ${
                    result.trustScore >= 80 ? 'border-emerald-500/20' : result.trustScore >= 60 ? 'border-yellow-500/20' : 'border-red-500/20'
                  }`}>
                    <div className={`text-8xl font-bold mb-4 ${
                      result.trustScore >= 80 ? 'text-emerald-400' : result.trustScore >= 60 ? 'text-yellow-400' : 'text-red-400'
                    }`}>{result.trustScore}<span className="text-2xl text-[var(--text-muted)]">/100</span></div>
                    <div className="text-xl font-semibold text-[var(--text-primary)] mb-2">{result.riskLevel}</div>
                    <p className="text-[var(--text-secondary)] max-w-lg mx-auto">{result.explanation}</p>
                  </div>

                  {result.checks && Object.keys(result.checks).length > 0 && (
                    <div className="glass-panel p-6">
                      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Security Analysis</h3>
                      <div className="grid gap-3">
                        {Object.entries(result.checks).map(([key, check]) => (
                          <div key={key} className={`flex items-center justify-between p-4 rounded-xl border ${check.passed ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-red-500/5 border-red-500/10'}`}>
                            <span className="text-sm text-[var(--text-secondary)] capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                            <span className={`text-sm font-medium ${check.passed ? 'text-emerald-400' : 'text-red-400'}`}>{check.passed ? '✓ Passed' : `✗ ${check.message}`}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

        {/* OTHER SCANNERS */}
        {activeTab === 'email' && <EmailScanner />}
        {activeTab === 'message' && <MessageScanner />}
        {activeTab === 'phone' && <PhoneLookup />}
        {activeTab === 'qr' && <QRScanner />}
        {activeTab === 'company' && <CompanyVerification />}

        {/* HISTORY */}
        {activeTab === 'history' && (
          <>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">Scan History</h2>
            {scanHistory.length === 0 ? (
              <div className="glass-panel p-16 text-center"><p className="text-[var(--text-secondary)]">No scans yet</p></div>
            ) : (
              <div className="space-y-3">
                {scanHistory.map((scan, i) => (
                  <div key={scan.id || i} className="glass-panel p-4 flex items-center justify-between">
                    <div>
                      <p className="text-[var(--text-primary)] text-sm font-medium truncate max-w-md">{scan.url}</p>
                      <p className="text-[var(--text-muted)] text-xs">{scan.timestamp?.toDate?.()?.toLocaleString() || 'Just now'}</p>
                    </div>
                    <div className={`text-lg font-bold ${scan.result?.trustScore >= 80 ? 'text-emerald-400' : scan.result?.trustScore >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {scan.result?.trustScore || 0}/100
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* COMMUNITY */}
        {activeTab === 'community' && (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
              <FiUsers className="text-3xl text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Community Reports</h2>
            <p className="text-[var(--text-secondary)] mb-6">Join thousands reporting scams</p>
            <Link to="/community" className="btn-premium inline-flex">Go to Community</Link>
          </div>
        )}
      </main>
    </div>
  );
}