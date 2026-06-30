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
  FiChevronRight, FiMenu, FiX, FiBarChart2,
  FiActivity, FiGlobe, FiAlertCircle, FiCheckCircle
} from 'react-icons/fi';
import EmailScanner from '../components/dashboard/EmailScanner';
import PhoneLookup from '../components/dashboard/PhoneLookup';
import QRScanner from '../components/dashboard/QRScanner';
import MessageScanner from '../components/dashboard/MessageScanner';
import CompanyVerification from '../components/dashboard/CompanyVerification';

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

  useEffect(() => {
    const unsubscribe = initAuth();
    return () => { if (typeof unsubscribe === 'function') unsubscribe(); };
  }, [initAuth]);

  useEffect(() => {
    if (!authLoading && !user) navigate('/login');
  }, [user, authLoading, navigate]);

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

  const handleScan = async () => {
    if (!url) { toast.error('Please enter a URL'); return; }
    let scanUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) scanUrl = 'https://' + url;
    try { new URL(scanUrl); } catch { toast.error('Please enter a valid URL'); return; }

    setLoading(true);
    setResult(null);
    try {
      const scanResult = await scanWebsite(scanUrl);
      setResult(scanResult);
      if (user) {
        await saveScan(user.uid, { type: 'website', url: scanUrl, result: scanResult });
        loadScanHistory();
        toast.success('Scan complete!');
      }
    } catch (error) {
      toast.error('Scan failed');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#060606] flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const menuItems = [
    { id: 'scanner', icon: <FiGlobe size={18} />, label: 'Website Scanner', color: 'emerald' },
    { id: 'email', icon: <FiMail size={18} />, label: 'Email Analyzer', color: 'blue' },
    { id: 'message', icon: <FiMessageSquare size={18} />, label: 'Message Scanner', color: 'purple' },
    { id: 'phone', icon: <FiPhone size={18} />, label: 'Phone Lookup', color: 'orange' },
    { id: 'qr', icon: <FiCamera size={18} />, label: 'QR Scanner', color: 'pink' },
    { id: 'company', icon: <FiShield size={18} />, label: 'Company Check', color: 'teal' },
  ];

  const bottomItems = [
    { id: 'history', icon: <FiClock size={18} />, label: 'Scan History' },
    { id: 'community', icon: <FiUsers size={18} />, label: 'Community' },
  ];

  const stats = [
    { label: 'Total Scans', value: scanHistory.length, icon: <FiBarChart2 size={18} />, color: 'emerald' },
    { label: 'Threats Found', value: scanHistory.filter(s => s.result?.trustScore < 60).length, icon: <FiAlertCircle size={18} />, color: 'red' },
    { label: 'Safe Sites', value: scanHistory.filter(s => s.result?.trustScore >= 80).length, icon: <FiCheckCircle size={18} />, color: 'green' },
  ];

  return (
    <div className="min-h-screen bg-[#060606] flex">
      {/* ============================================ */}
      {/* SIDEBAR */}
      {/* ============================================ */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} glass-panel border-r border-[#111] flex flex-col transition-all duration-300 fixed left-4 top-4 bottom-4 z-40`}>
        {/* Logo */}
        <div className="p-5 border-b border-[#111]">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-black font-bold text-xs shrink-0">T</div>
            {sidebarOpen && <span className="text-sm font-semibold">TrustShield</span>}
          </Link>
        </div>

        {/* Menu */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          <p className={`text-[10px] text-[#71717a] uppercase tracking-wider mb-2 ${!sidebarOpen && 'text-center'}`}>
            {sidebarOpen ? 'Scanners' : ''}
          </p>
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                activeTab === item.id 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                  : 'text-[#a1a1aa] hover:bg-[#0a0a0a] hover:text-white'
              } ${!sidebarOpen && 'justify-center'}`}
              title={!sidebarOpen ? item.label : ''}
            >
              {item.icon}
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}

          <p className={`text-[10px] text-[#71717a] uppercase tracking-wider mb-2 mt-6 ${!sidebarOpen && 'text-center'}`}>
            {sidebarOpen ? 'More' : ''}
          </p>
          {bottomItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                activeTab === item.id 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                  : 'text-[#a1a1aa] hover:bg-[#0a0a0a] hover:text-white'
              } ${!sidebarOpen && 'justify-center'}`}
              title={!sidebarOpen ? item.label : ''}
            >
              {item.icon}
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-[#111]">
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
                <p className="text-xs font-medium text-white truncate">{user.displayName || 'User'}</p>
                <p className="text-[10px] text-[#71717a] truncate">{user.email}</p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-2 px-3 py-2 text-[#71717a] hover:text-red-400 hover:bg-red-500/5 rounded-lg transition-all text-xs ${!sidebarOpen && 'justify-center'}`}
          >
            <FiLogOut size={14} />
            {sidebarOpen && 'Sign Out'}
          </button>
        </div>

        {/* Toggle Sidebar */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#1a1a1a] border border-[#111] flex items-center justify-center text-[#71717a] hover:text-white transition-colors"
        >
          {sidebarOpen ? <FiChevronRight size={12} /> : <FiChevronRight size={12} className="rotate-180" />}
        </button>
      </aside>

      {/* ============================================ */}
      {/* MAIN CONTENT */}
      {/* ============================================ */}
      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-72' : 'ml-24'} p-8`}>
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {menuItems.find(m => m.id === activeTab)?.label || 'Dashboard'}
            </h1>
            <p className="text-[#71717a] text-sm mt-1">
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
          <Link to="/" className="text-[#71717a] hover:text-white transition-colors p-2">
            <FiHome size={18} />
          </Link>
        </div>

        {/* Stats Bar */}
        {activeTab === 'scanner' && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            {stats.map((stat, i) => (
              <div key={i} className="glass-panel p-4 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl bg-${stat.color}-500/10 flex items-center justify-center text-${stat.color}-400`}>
                  {stat.icon}
                </div>
                <div>
                  <div className="text-xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-[#71717a]">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ============================================ */}
        {/* WEBSITE SCANNER */}
        {/* ============================================ */}
        {activeTab === 'scanner' && (
          <>
            <div className="glass-panel p-6 mb-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#71717a]" />
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Enter website URL (e.g., google.com)"
                    className="w-full pl-12 pr-4 py-4 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl text-white placeholder-[#71717a] focus:outline-none focus:border-emerald-500/50 transition-all text-sm"
                    onKeyDown={(e) => e.key === 'Enter' && handleScan()}
                  />
                </div>
                <button 
                  onClick={handleScan}
                  disabled={loading || !url}
                  className="btn-premium px-8 disabled:opacity-50 whitespace-nowrap"
                >
                  {loading ? 'Scanning...' : 'Scan URL'}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {loading && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass-panel p-16 text-center">
                  <div className="w-16 h-16 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-6" />
                  <p className="text-[#a1a1aa]">AI is analyzing this website...</p>
                  <p className="text-[#71717a] text-sm mt-1">Checking 70+ security engines</p>
                </motion.div>
              )}

              {result && !loading && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  {/* Trust Score */}
                  <div className={`glass-panel p-10 text-center border-2 ${
                    result.trustScore >= 80 ? 'border-emerald-500/20' :
                    result.trustScore >= 60 ? 'border-yellow-500/20' :
                    'border-red-500/20'
                  }`}>
                    <div className={`text-8xl font-bold mb-4 ${
                      result.trustScore >= 80 ? 'text-emerald-400' :
                      result.trustScore >= 60 ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {result.trustScore}<span className="text-2xl text-[#71717a]">/100</span>
                    </div>
                    <div className="text-xl font-semibold text-white mb-2">{result.riskLevel}</div>
                    <p className="text-[#a1a1aa] max-w-lg mx-auto">{result.explanation}</p>
                  </div>

                  {/* Security Checks */}
                  {result.checks && Object.keys(result.checks).length > 0 && (
                    <div className="glass-panel p-6">
                      <h3 className="text-lg font-semibold mb-4">Security Analysis</h3>
                      <div className="grid gap-3">
                        {Object.entries(result.checks).map(([key, check]) => (
                          <div key={key} className={`flex items-center justify-between p-4 rounded-xl border ${
                            check.passed ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-red-500/5 border-red-500/10'
                          }`}>
                            <span className="text-sm text-[#a1a1aa] capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                            <span className={`text-sm font-medium ${check.passed ? 'text-emerald-400' : 'text-red-400'}`}>
                              {check.passed ? '✓ Passed' : `✗ ${check.message}`}
                            </span>
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

        {/* Other Scanners */}
        {activeTab === 'email' && <EmailScanner />}
        {activeTab === 'message' && <MessageScanner />}
        {activeTab === 'phone' && <PhoneLookup />}
        {activeTab === 'qr' && <QRScanner />}
        {activeTab === 'company' && <CompanyVerification />}

        {/* History */}
        {activeTab === 'history' && (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-bold">Scan History</h2>
            </div>
            {scanHistory.length === 0 ? (
              <div className="glass-panel p-16 text-center">
                <div className="text-4xl mb-4">📋</div>
                <p className="text-[#a1a1aa]">No scans yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {scanHistory.map((scan, i) => (
                  <div key={scan.id || i} className="glass-panel p-4 flex items-center justify-between">
                    <div>
                      <p className="text-white text-sm font-medium truncate max-w-md">{scan.url}</p>
                      <p className="text-[#71717a] text-xs">{scan.timestamp?.toDate?.()?.toLocaleString() || 'Just now'}</p>
                    </div>
                    <div className={`text-lg font-bold ${
                      scan.result?.trustScore >= 80 ? 'text-emerald-400' : scan.result?.trustScore >= 60 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {scan.result?.trustScore || 0}/100
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Community */}
        {activeTab === 'community' && (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
              <FiUsers className="text-3xl text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Community Reports</h2>
            <p className="text-[#a1a1aa] mb-6">Join thousands reporting scams</p>
            <Link to="/community" className="btn-premium inline-flex">Go to Community</Link>
          </div>
        )}
      </main>
    </div>
  );
}