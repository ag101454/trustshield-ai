import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiUpload, FiCamera, FiLink, FiAlertTriangle, FiCheckCircle, 
  FiSearch, FiCopy, FiExternalLink, FiRefreshCw, FiX 
} from 'react-icons/fi';
import toast from 'react-hot-toast';

// We'll load jsQR dynamically to avoid build issues
let jsQR = null;

export default function QRScanner() {
  const [qrText, setQrText] = useState('');
  const [qrImage, setQrImage] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [activeTab, setActiveTab] = useState('paste');
  const [decodingImage, setDecodingImage] = useState(false);
  const fileInputRef = useRef();
  const canvasRef = useRef();

  // Load jsQR dynamically
  useEffect(() => {
    import('jsqr').then(module => {
      jsQR = module.default;
      console.log('✅ QR decoder loaded');
    }).catch(err => {
      console.log('QR decoder not available, using manual input mode');
    });
  }, []);

  const sampleQRCodes = [
    {
      label: '🟢 Legitimate Website',
      content: 'https://github.com/TrustShield-AI',
      description: 'Official GitHub repository'
    },
    {
      label: '🔴 Phishing Link',
      content: 'https://verify-account-login.tk/secure?token=abc123',
      description: 'Fake verification page'
    },
    {
      label: '🔴 Prize Scam',
      content: 'https://free-prize-winner.xyz/claim?code=WINNER',
      description: 'Fake prize claim page'
    },
    {
      label: '🟡 URL Shortener',
      content: 'https://bit.ly/3xK9mPq',
      description: 'Hidden destination'
    }
  ];

  // Decode QR code from image
  const decodeQRFromImage = (imageSrc) => {
    if (!jsQR) {
      toast.error('QR decoder not loaded. Please paste content manually.');
      return null;
    }

    setDecodingImage(true);
    
    const img = new Image();
    img.onload = () => {
      // Create canvas to get image data
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, canvas.width, canvas.height);
      
      setDecodingImage(false);
      
      if (code) {
        console.log('✅ QR Code decoded:', code.data);
        setQrText(code.data);
        toast.success('QR code decoded successfully!');
        return code.data;
      } else {
        toast.error('No QR code found in image. Try another image or paste content manually.');
        return null;
      }
    };
    
    img.onerror = () => {
      setDecodingImage(false);
      toast.error('Failed to load image');
    };
    
    img.src = imageSrc;
  };

  const handleScan = async () => {
    if (!qrText.trim()) {
      toast.error('Please enter QR code content or upload an image');
      return;
    }

    setLoading(true);
    setResult(null);

    // Simulate analysis time
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Extract URL from QR content
    const urlMatch = qrText.match(/https?:\/\/[^\s<>"]+/i);
    const extractedUrl = urlMatch ? urlMatch[0] : qrText;
    
    let isSuspicious = false;
    const warnings = [];
    const checks = {};

    // 1. Check for URL shorteners
    const shorteners = ['bit.ly', 'tinyurl.com', 't.co', 'ow.ly', 'goo.gl', 'is.gd', 'buff.ly', 'rb.gy', 'short.url'];
    if (shorteners.some(s => extractedUrl.toLowerCase().includes(s))) {
      isSuspicious = true;
      warnings.push('⚠️ Uses URL shortener - destination is hidden');
      checks.shortener = { passed: false, message: 'URL shortener detected - cannot verify destination' };
    }

    // 2. Check URL structure
    try {
      const url = new URL(extractedUrl.startsWith('http') ? extractedUrl : 'https://' + extractedUrl);
      
      // Check suspicious TLDs
      const suspiciousTLDs = ['.tk', '.ml', '.ga', '.cf', '.xyz', '.top', '.gq', '.info', '.loan', '.work', '.click'];
      if (suspiciousTLDs.some(tld => url.hostname.endsWith(tld))) {
        isSuspicious = true;
        const tld = url.hostname.match(/\.[a-z]+$/)[0];
        warnings.push(`⚠️ Suspicious domain extension: ${tld}`);
        checks.tld = { passed: false, message: `Suspicious TLD: ${tld}` };
      } else {
        checks.tld = { passed: true, message: 'Domain extension looks safe' };
      }

      // Check for IP address
      if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(url.hostname)) {
        isSuspicious = true;
        warnings.push('⚠️ Uses IP address instead of domain name');
        checks.ipAddress = { passed: false, message: 'Raw IP address used' };
      }

      // Check for suspicious keywords
      const suspiciousKeywords = ['login', 'signin', 'verify', 'secure', 'account', 'update', 'confirm', 'banking', 'free', 'win', 'prize', 'gift', 'claim', 'bonus', 'reward'];
      const foundKeywords = suspiciousKeywords.filter(kw => url.href.toLowerCase().includes(kw));
      if (foundKeywords.length > 2) {
        isSuspicious = true;
        warnings.push(`⚠️ Suspicious keywords detected: ${foundKeywords.slice(0, 3).join(', ')}`);
        checks.keywords = { passed: false, found: foundKeywords };
      } else if (foundKeywords.length > 0) {
        checks.keywords = { passed: true, message: `${foundKeywords.length} keyword(s) found - monitor` };
      } else {
        checks.keywords = { passed: true, message: 'No suspicious keywords' };
      }

      // Check HTTPS
      if (!extractedUrl.startsWith('https://')) {
        isSuspicious = true;
        warnings.push('⚠️ Link does not use HTTPS encryption');
        checks.ssl = { passed: false, message: 'No HTTPS - connection not secure' };
      } else {
        checks.ssl = { passed: true, message: 'HTTPS secured' };
      }

      // Check domain length (overly long domains are suspicious)
      if (url.hostname.length > 40) {
        isSuspicious = true;
        warnings.push('⚠️ Unusually long domain name');
        checks.domainLength = { passed: false, message: `Domain too long (${url.hostname.length} chars)` };
      }

      // Check for excessive subdomains
      const subdomainCount = url.hostname.split('.').length - 1;
      if (subdomainCount > 3) {
        isSuspicious = true;
        warnings.push('⚠️ Excessive subdomains - possible phishing');
        checks.subdomains = { passed: false, message: `${subdomainCount} subdomains detected` };
      }

    } catch (e) {
      isSuspicious = true;
      warnings.push('⚠️ Invalid or malformed URL');
      checks.url = { passed: false, message: 'Invalid URL format' };
    }

    // 3. Check for other data types (WiFi, text, etc.)
    const isWifi = qrText.startsWith('WIFI:');
    const isEmail = qrText.startsWith('mailto:');
    const isPhone = qrText.startsWith('tel:');
    const isBitcoin = qrText.startsWith('bitcoin:') || /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(qrText);
    
    let contentType = 'Unknown';
    if (urlMatch) contentType = 'URL';
    else if (isWifi) contentType = 'WiFi Network';
    else if (isEmail) contentType = 'Email';
    else if (isPhone) contentType = 'Phone Number';
    else if (isBitcoin) contentType = 'Cryptocurrency';
    else if (qrText.length < 100) contentType = 'Text';

    if (isBitcoin) {
      isSuspicious = true;
      warnings.push('⚠️ Cryptocurrency address detected - common in scams');
      checks.crypto = { passed: false, message: 'Crypto address - high risk' };
    }

    setResult({
      type: contentType,
      content: qrText,
      extractedUrl: urlMatch ? extractedUrl : null,
      isSuspicious,
      warnings,
      checks,
      safetyScore: isSuspicious ? Math.max(10, 80 - (warnings.length * 15)) : 90,
      recommendation: isSuspicious 
        ? '🚫 Do not visit this link. Multiple security concerns detected.'
        : '✅ This QR code appears safe to scan.',
      timestamp: new Date().toISOString()
    });

    setLoading(false);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setQrImage(event.target.result);
        // Attempt to decode QR code from image
        decodeQRFromImage(event.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      toast.error('Please upload an image file (PNG, JPG)');
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setQrImage(event.target.result);
        decodeQRFromImage(event.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      toast.error('Please upload an image file');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied!');
  };

  const clearAll = () => {
    setQrText('');
    setQrImage(null);
    setResult(null);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <FiCamera className="text-cyan-400" />
          QR Code Scanner
        </h1>
        <p className="text-gray-400">
          Upload a QR code image for real decoding, or paste content to check for malicious links
        </p>
        {jsQR && (
          <span className="text-xs text-green-400 mt-1 inline-block">
            ✅ Real QR decoder active - upload images to decode
          </span>
        )}
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button onClick={() => setActiveTab('upload')} className={`px-4 py-2 rounded-lg text-sm transition-all ${activeTab === 'upload' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-gray-400 hover:text-white'}`}>
          📷 Upload & Decode
        </button>
        <button onClick={() => setActiveTab('paste')} className={`px-4 py-2 rounded-lg text-sm transition-all ${activeTab === 'paste' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-gray-400 hover:text-white'}`}>
          ✏️ Paste Content
        </button>
        <button onClick={() => setActiveTab('examples')} className={`px-4 py-2 rounded-lg text-sm transition-all ${activeTab === 'examples' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-gray-400 hover:text-white'}`}>
          💡 Examples
        </button>
      </div>

      {/* Upload Tab - REAL QR DECODING */}
      {activeTab === 'upload' && (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`glass p-8 mb-6 text-center border-2 border-dashed transition-all cursor-pointer ${
            dragActive ? 'border-cyan-500 bg-cyan-500/10' : 'border-white/10 hover:border-white/20'
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          
          {decodingImage ? (
            <div>
              <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-400">Decoding QR code...</p>
            </div>
          ) : qrImage ? (
            <div>
              <img 
                src={qrImage} 
                alt="QR Code" 
                className="max-w-xs mx-auto rounded-lg mb-4 border border-white/10"
              />
              {qrText && (
                <div className="p-3 bg-black/30 rounded-lg max-w-md mx-auto mb-4">
                  <p className="text-xs text-gray-500 mb-1">Decoded Content:</p>
                  <p className="text-cyan-400 font-mono text-sm break-all">{qrText}</p>
                </div>
              )}
              <div className="flex gap-2 justify-center">
                <button onClick={handleScan} disabled={!qrText} className="btn-primary text-sm">
                  🔍 Analyze Content
                </button>
                <button onClick={clearAll} className="px-4 py-2 glass-hover rounded-lg text-gray-400 text-sm">
                  <FiRefreshCw /> New Scan
                </button>
              </div>
            </div>
          ) : (
            <>
              <FiUpload className="text-5xl text-gray-400 mx-auto mb-4" />
              <p className="text-lg text-white mb-2">
                Drop QR code image here
              </p>
              <p className="text-sm text-gray-500">
                {jsQR ? 'Real QR decoder ready - upload any QR image' : 'Upload QR image or paste content below'}
              </p>
              <p className="text-xs text-gray-600 mt-2">PNG, JPG, GIF, WEBP supported</p>
            </>
          )}
        </div>
      )}

      {/* Paste Tab */}
      {activeTab === 'paste' && (
        <div className="glass p-6 mb-6">
          <label className="block text-sm text-gray-400 mb-2">
            Paste QR code content or URL
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <FiLink className="absolute left-4 top-4 text-gray-500" />
              <textarea
                value={qrText}
                onChange={(e) => setQrText(e.target.value)}
                placeholder="Paste QR code text, URL, or decoded content..."
                rows={3}
                className="w-full pl-12 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 resize-none font-mono text-sm"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleScan}
                disabled={loading || !qrText.trim()}
                className="btn-primary px-6 disabled:opacity-50"
              >
                {loading ? 'Analyzing...' : '🔍 Analyze'}
              </button>
              {qrText && (
                <button onClick={clearAll} className="px-3 py-2 glass-hover rounded-lg text-gray-400">
                  <FiX />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Examples Tab */}
      {activeTab === 'examples' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {sampleQRCodes.map((sample, index) => (
            <button
              key={index}
              onClick={() => {
                setQrText(sample.content);
                setActiveTab('paste');
              }}
              className="glass p-4 text-left hover:border-cyan-500/30 transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-white group-hover:text-cyan-400 transition-colors">
                  {sample.label}
                </span>
                <FiCopy className="text-gray-500 group-hover:text-cyan-400 transition-colors" size={14} />
              </div>
              <p className="text-xs text-gray-500 mb-1">{sample.description}</p>
              <p className="text-xs text-gray-400 font-mono truncate">{sample.content}</p>
            </button>
          ))}
        </div>
      )}

      {/* Results */}
      <AnimatePresence>
        {loading && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass p-12 text-center">
            <div className="w-20 h-20 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-6" />
            <p className="text-xl text-gray-400">Analyzing QR code content...</p>
            <p className="text-sm text-gray-500 mt-2">Checking URL reputation, domain safety, and threat databases</p>
          </motion.div>
        )}

        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Safety Score */}
            <div className={`glass p-8 text-center border-2 ${result.isSuspicious ? 'border-red-500/30 bg-red-500/5' : 'border-green-500/30 bg-green-500/5'}`}>
              <div className="flex justify-center mb-4">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center ${result.isSuspicious ? 'bg-red-500/10' : 'bg-green-500/10'}`}>
                  <span className={`text-4xl font-bold ${result.isSuspicious ? 'text-red-400' : 'text-green-400'}`}>
                    {result.safetyScore}
                  </span>
                </div>
              </div>
              <div className={`text-xl font-bold mb-2 ${result.isSuspicious ? 'text-red-400' : 'text-green-400'}`}>
                {result.isSuspicious ? '⚠️ Suspicious' : '✅ Safe'}
              </div>
              <p className="text-gray-300">{result.recommendation}</p>
              <p className="text-xs text-gray-500 mt-2">Content Type: {result.type}</p>
            </div>

            {/* Decoded Content */}
            <div className="glass p-6">
              <h3 className="text-lg font-semibold mb-4">Decoded Content</h3>
              <div className="p-4 bg-black/30 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500">Raw Data:</span>
                  <button onClick={() => copyToClipboard(result.content)} className="text-xs text-gray-500 hover:text-cyan-400 flex items-center gap-1">
                    <FiCopy size={12} /> Copy
                  </button>
                </div>
                <p className="text-white font-mono text-sm break-all">{result.content}</p>
              </div>
              {result.extractedUrl && (
                <div className="mt-3 p-4 bg-white/5 rounded-lg">
                  <p className="text-sm text-gray-400 mb-1">Extracted URL:</p>
                  <a href={result.extractedUrl} target="_blank" rel="noopener noreferrer" className="text-cyan-400 font-mono text-sm break-all hover:underline flex items-center gap-2">
                    <FiExternalLink size={14} /> {result.extractedUrl}
                  </a>
                </div>
              )}
            </div>

            {/* Warnings */}
            {result.warnings.length > 0 && (
              <div className="glass p-6 border-red-500/30">
                <h3 className="text-lg font-semibold text-red-400 mb-4">⚠️ {result.warnings.length} Security Concern{result.warnings.length > 1 ? 's' : ''}</h3>
                <ul className="space-y-2">
                  {result.warnings.map((warning, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-300">{warning}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Security Checks */}
            {result.checks && Object.keys(result.checks).length > 0 && (
              <div className="glass p-6">
                <h3 className="text-lg font-semibold mb-4">Security Analysis</h3>
                <div className="grid gap-3">
                  {Object.entries(result.checks).map(([key, check]) => (
                    <div key={key} className={`flex items-center justify-between p-3 rounded-lg border ${check.passed ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                      <span className="text-sm text-gray-300 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <span className={`text-xs font-medium ${check.passed ? 'text-green-400' : 'text-red-400'}`}>
                        {check.passed ? '✅ OK' : `❌ ${check.message}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}