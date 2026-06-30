import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMic, FiMicOff, FiX, FiSend, FiVolume2, FiVolumeX } from 'react-icons/fi';
import { useThemeStore } from '../store/themeStore';

export default function VoiceAssistant() {
  const [isListening, setIsListening] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [pendingScan, setPendingScan] = useState(null);
  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);
  const { theme, toggleTheme } = useThemeStore();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
    }
  }, []);

  const speak = (text) => {
    if (isMuted || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1.0;
    u.volume = 0.8;
    window.speechSynthesis.speak(u);
  };

  // THE SIMPLE WAY - Use URL hash to communicate with Dashboard
  const navigateToTab = (tab, scanUrl = null) => {
    const currentPath = window.location.pathname;
    
    if (currentPath === '/dashboard') {
      // Already on dashboard, just update hash
      if (scanUrl) {
        window.location.hash = `tab=${tab}&scan=${encodeURIComponent(scanUrl)}`;
      } else {
        window.location.hash = `tab=${tab}`;
      }
    } else {
      // Navigate to dashboard with hash
      if (scanUrl) {
        window.location.href = `/dashboard#tab=${tab}&scan=${encodeURIComponent(scanUrl)}`;
      } else {
        window.location.href = `/dashboard#tab=${tab}`;
      }
    }
  };

  const processCommand = (input) => {
    const cmd = input.toLowerCase().trim();
    let reply = '';

    const domainMatch = cmd.match(/([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}(\/[^\s]*)?/i);
    const domain = domainMatch ? domainMatch[0].replace(/^www\./, '') : null;

    // SCAN
    if (['scan', 'check', 'analyze', 'verify', 'test'].some(w => cmd.includes(w)) && domain) {
      reply = `Scanning ${domain}.`;
      navigateToTab('scanner', domain);
    }
    // DASHBOARD TOOLS
    else if (cmd.includes('website scanner') || cmd.includes('url scanner')) { reply = 'Website scanner.'; navigateToTab('scanner'); }
    else if (cmd.includes('email scanner') || cmd.includes('email analyzer')) { reply = 'Email scanner.'; navigateToTab('email'); }
    else if (cmd.includes('message scanner') || cmd.includes('sms scanner')) { reply = 'Message scanner.'; navigateToTab('message'); }
    else if (cmd.includes('phone lookup') || cmd.includes('number lookup')) { reply = 'Phone lookup.'; navigateToTab('phone'); }
    else if (cmd.includes('qr scanner') || cmd.includes('qr code')) { reply = 'QR scanner.'; navigateToTab('qr'); }
    else if (cmd.includes('company check') || cmd.includes('company verification')) { reply = 'Company check.'; navigateToTab('company'); }
    else if (cmd.includes('history') || cmd.includes('past scans')) { reply = 'History.'; navigateToTab('history'); }
    else if (cmd.includes('dashboard') || cmd.includes('open scanner')) { reply = 'Dashboard.'; navigateToTab('scanner'); }
    // PAGES
    else if (cmd.includes('home') || cmd.includes('main page')) { reply = 'Home.'; window.location.href = '/'; }
    else if (cmd.includes('login') || cmd.includes('sign in')) { reply = 'Login.'; window.location.href = '/login'; }
    else if (cmd.includes('community') || cmd.includes('reports')) { reply = 'Community.'; window.location.href = '/community'; }
    else if (cmd.includes('contact') || cmd.includes('support')) { reply = 'Contact.'; window.location.href = '/contact'; }
    else if (cmd.includes('privacy')) { reply = 'Privacy.'; window.location.href = '/privacy'; }
    else if (cmd.includes('terms')) { reply = 'Terms.'; window.location.href = '/terms'; }
    // THEME
    else if (cmd.includes('dark mode')) { toggleTheme(); reply = 'Dark.'; }
    else if (cmd.includes('light mode')) { toggleTheme(); reply = 'Light.'; }
    // SCROLL
    else if (cmd.includes('scroll down')) { window.scrollBy({ top: 500, behavior: 'smooth' }); reply = 'Down.'; }
    else if (cmd.includes('scroll up')) { window.scrollBy({ top: -500, behavior: 'smooth' }); reply = 'Up.'; }
    else if (cmd.includes('top')) { window.scrollTo({ top: 0, behavior: 'smooth' }); reply = 'Top.'; }
    else if (cmd.includes('bottom')) { window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); reply = 'Bottom.'; }
    // BACK
    else if (cmd === 'back' || cmd.includes('go back')) { window.history.back(); reply = 'Back.'; }
    else if (cmd.includes('refresh')) { window.location.reload(); reply = 'Refreshed.'; }
    // MUTE
    else if (cmd.includes('mute')) { setIsMuted(true); reply = 'Muted.'; }
    else if (cmd.includes('unmute')) { setIsMuted(false); reply = 'On.'; speak('Hello.'); }
    // CHAT
    else if (cmd.includes('clear')) { setMessages([]); reply = 'Cleared.'; }
    else if (cmd.includes('stop') || cmd.includes('shut up')) { stopListening(); reply = 'Off.'; }
    else if (cmd.includes('close')) { setShowPanel(false); reply = 'Closed.'; }
    // SOCIAL
    else if (['hello', 'hi', 'hey'].includes(cmd)) { reply = 'Hello.'; }
    else if (cmd.includes('thank')) { reply = 'Welcome.'; }
    else if (cmd.includes('bye')) { reply = 'Bye.'; setTimeout(() => setShowPanel(false), 1500); }
    else if (cmd.includes('help')) { reply = 'Try: scan google.com, email scanner, phone lookup, QR scanner, dark mode, go home.'; }
    else if (cmd.length > 2) { reply = 'Say help.'; }

    if (reply) {
      setMessages(prev => [...prev, { type: 'user', text: input }, { type: 'assistant', text: reply }]);
      speak(reply);
    }
  };

  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (inputText.trim()) { processCommand(inputText); setInputText(''); }
  };

  const startListening = () => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.start();
      setIsListening(true);
      recognitionRef.current.onresult = (e) => {
        const text = Array.from(e.results).map(r => r[0].transcript).join('');
        if (e.results[0].isFinal) { recognitionRef.current.stop(); setIsListening(false); processCommand(text); }
      };
      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    } catch { setIsListening(false); }
  };

  const stopListening = () => { recognitionRef.current?.stop(); setIsListening(false); };

  const togglePanel = () => {
    if (!showPanel) { setShowPanel(true); setTimeout(() => { setMessages([{ type: 'assistant', text: 'Say a command.' }]); }, 500); }
    else { setShowPanel(false); stopListening(); }
  };

  return (
    <>
      <button onClick={togglePanel} className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-black shadow-lg flex items-center justify-center hover:scale-110 transition-transform">
        {showPanel ? <FiX size={22} /> : <FiMic size={22} />}
      </button>

      <AnimatePresence>
        {showPanel && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] glass-panel flex flex-col max-h-[500px]">
            <div className="flex items-center justify-between p-4 border-b border-[#1a1a1a]">
              <span className="text-sm font-semibold text-white">Voice Control</span>
              <div className="flex gap-1">
                <button onClick={() => setIsMuted(!isMuted)} className={`p-1.5 rounded ${isMuted ? 'text-red-400' : 'text-gray-500'}`}>{isMuted ? <FiVolumeX size={16} /> : <FiVolume2 size={16} />}</button>
                <button onClick={togglePanel} className="p-1.5 rounded text-gray-500"><FiX size={16} /></button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2 min-h-[120px] max-h-[250px]">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-4 py-2 rounded-2xl text-sm ${msg.type === 'user' ? 'bg-emerald-500/20 text-emerald-200' : 'bg-[#0a0a0a] text-gray-300'}`}>{msg.text}</div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="px-4 py-2 flex flex-wrap gap-1.5 border-t border-[#1a1a1a]">
              {['Scan google.com', 'Email scanner', 'Phone lookup', 'Help'].map(cmd => (
                <button key={cmd} onClick={() => processCommand(cmd)} className="text-[10px] text-gray-400 bg-[#0a0a0a] hover:bg-emerald-500/10 hover:text-emerald-400 px-2.5 py-1.5 rounded-full">{cmd}</button>
              ))}
            </div>
            <form onSubmit={handleTextSubmit} className="p-4 border-t border-[#1a1a1a] flex gap-2">
              <button type="button" onClick={isListening ? stopListening : startListening} className={`p-3 rounded-xl ${isListening ? 'bg-red-500/20 text-red-400' : 'bg-[#0a0a0a] text-gray-400'}`}>{isListening ? <FiMicOff size={18} /> : <FiMic size={18} />}</button>
              <input type="text" value={inputText} onChange={e => setInputText(e.target.value)} placeholder="Type command..." className="flex-1 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500/50" />
              <button type="submit" disabled={!inputText.trim()} className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 disabled:opacity-30"><FiSend size={18} /></button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}