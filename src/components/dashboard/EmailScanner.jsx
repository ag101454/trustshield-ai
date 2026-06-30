import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { scanEmailContent } from '../../lib/aiScanner';
import { FiMail, FiAlertTriangle, FiCheckCircle, FiUpload, FiLink, FiShield } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function EmailScanner() {
  const [emailText, setEmailText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('paste');

  const exampleEmails = [
    {
      label: '🟢 Legitimate Email',
      text: `Hi John,

Your monthly report for March 2024 is now ready. You can view it by logging into your account at our secure portal.

Key highlights:
- Revenue increased by 12%
- New customer acquisition up 8%
- Customer satisfaction score: 94%

Please review at your earliest convenience. Let me know if you have any questions.

Best regards,
Sarah Johnson
Analytics Team Lead
sarah.johnson@company.com`
    },
    {
      label: '🔴 Phishing Email - Account Suspension',
      text: `URGENT: Your Account Has Been Suspended!

Dear Valued Customer,

We have detected unusual activity on your account. Your account will be permanently suspended within 24 hours if you do not verify your identity immediately.

Click here to verify: http://suspicious-link.xyz/verify

This is an automated message. Do not reply to this email.

Security Team
Amazon Inc.`
    },
    {
      label: '🔴 Phishing Email - Prize Scam',
      text: `CONGRATULATIONS! You've Won!

Dear Winner,

You have been selected as the lucky winner of our $1,000,000 international lottery! To claim your prize, please provide the following information:

1. Full Name
2. Date of Birth
3. Bank Account Number
4. Social Security Number

Contact our claims agent immediately at claims@prize-winner.tk

Act now! This offer expires in 24 hours!`
    },
    {
      label: '🔴 Phishing Email - Netflix Scam',
      text: `Your Netflix Membership is on Hold

Dear User,

We were unable to process your last payment. Your Netflix membership will be cancelled if you do not update your payment information within 48 hours.

Please visit http://netflix-verify.account-update.ml to update your billing details.

This is an urgent matter. Act immediately to avoid service interruption.

Netflix Billing Department`
    }
  ];

  const handleScan = async () => {
    if (!emailText.trim()) {
      toast.error('Please paste an email to scan');
      return;
    }

    setLoading(true);
    setResult(null);

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const scanResult = scanEmailContent(emailText);
    
    // Add extracted information
    scanResult.extractedInfo = extractEmailInfo(emailText);
    scanResult.recommendations = generateRecommendations(scanResult);
    
    setResult(scanResult);
    setLoading(false);
    
    if (scanResult.threatScore >= 70) {
      toast.error('High threat detected! Be careful!');
    } else if (scanResult.threatScore >= 40) {
      toast('Some concerns found', { icon: '⚠️' });
    } else {
      toast.success('Email appears safe');
    }
  };

  const extractEmailInfo = (text) => {
    const info = {};
    
    // Extract links
    const links = text.match(/https?:\/\/[^\s<>"]+/gi) || [];
    info.links = links.map(link => {
      try {
        const url = new URL(link);
        const suspiciousTLDs = ['.tk', '.ml', '.ga', '.cf', '.xyz', '.top', '.gq'];
        const hasSuspiciousTLD = suspiciousTLDs.some(tld => url.hostname.endsWith(tld));
        return {
          url: link,
          suspicious: hasSuspiciousTLD,
          domain: url.hostname
        };
      } catch {
        return { url: link, suspicious: true, domain: 'invalid' };
      }
    });

    // Extract sender email
    const senderMatch = text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
    info.sender = senderMatch ? senderMatch[1] : null;

    // Check for brand mentions
    const brands = ['paypal', 'amazon', 'netflix', 'apple', 'microsoft', 'google', 'facebook', 'bank'];
    info.brandsMentioned = brands.filter(brand => text.toLowerCase().includes(brand));

    return info;
  };

  const generateRecommendations = (result) => {
    const recs = [];
    
    if (result.threatScore >= 70) {
      recs.push('🚫 Do not click any links in this email');
      recs.push('📵 Do not reply to this email');
      recs.push('🗑️ Delete this email immediately');
      recs.push('🚔 Report as phishing to your email provider');
      recs.push('🔒 Change passwords if you clicked any links');
    } else if (result.threatScore >= 40) {
      recs.push('⚠️ Verify sender through another channel');
      recs.push('🔍 Hover over links to see real destination');
      recs.push('❌ Do not provide personal information');
      recs.push('📞 Contact company directly using official website');
    } else {
      recs.push('✅ Email appears safe');
      recs.push('🔒 Still practice good email security habits');
      recs.push('👀 Always verify unexpected requests');
    }
    
    return recs;
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setEmailText(e.target.result);
        toast.success('Email file loaded');
      };
      reader.readAsText(file);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 70) return 'text-red-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getScoreBg = (score) => {
    if (score >= 70) return 'border-red-500 bg-red-500/5';
    if (score >= 40) return 'border-yellow-500 bg-yellow-500/5';
    return 'border-green-500 bg-green-500/5';
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <FiMail className="text-cyan-400" />
          Email Threat Scanner
        </h1>
        <p className="text-gray-400">
          Advanced phishing detection with real-time threat analysis
        </p>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('paste')}
          className={`px-4 py-2 rounded-lg text-sm transition-all ${
            activeTab === 'paste' 
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          ✏️ Paste Email
        </button>
        <button
          onClick={() => setActiveTab('upload')}
          className={`px-4 py-2 rounded-lg text-sm transition-all ${
            activeTab === 'upload' 
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          📁 Upload .eml
        </button>
        <button
          onClick={() => setActiveTab('examples')}
          className={`px-4 py-2 rounded-lg text-sm transition-all ${
            activeTab === 'examples' 
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          💡 Examples
        </button>
      </div>

      {/* Examples Tab */}
      {activeTab === 'examples' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {exampleEmails.map((example, index) => (
            <button
              key={index}
              onClick={() => {
                setEmailText(example.text);
                setActiveTab('paste');
              }}
              className="glass p-4 text-left hover:border-cyan-500/30 transition-all group"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium text-white group-hover:text-cyan-400 transition-colors">
                  {example.label}
                </span>
              </div>
              <p className="text-xs text-gray-500 line-clamp-3">{example.text}</p>
            </button>
          ))}
        </div>
      )}

      {/* Upload Tab */}
      {activeTab === 'upload' && (
        <div className="glass p-8 mb-6 text-center">
          <FiUpload className="text-4xl text-gray-400 mx-auto mb-4" />
          <p className="text-gray-300 mb-4">Upload an .eml file for analysis</p>
          <label className="btn-primary cursor-pointer inline-block">
            Choose File
            <input
              type="file"
              accept=".eml,.txt"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      )}

      {/* Paste Tab */}
      {activeTab === 'paste' && (
        <div className="glass p-6 mb-6">
          <textarea
            value={emailText}
            onChange={(e) => setEmailText(e.target.value)}
            placeholder="Paste the full email content here including headers..."
            rows={10}
            className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 resize-none font-mono text-sm"
          />
          <div className="flex justify-between items-center mt-4">
            <span className="text-sm text-gray-500">
              {emailText.length} characters
            </span>
            <button
              onClick={handleScan}
              disabled={loading || !emailText.trim()}
              className="btn-primary disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Analyzing...
                </span>
              ) : (
                '🔍 Scan Email'
              )}
            </button>
          </div>
        </div>
      )}

      {/* Results */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="glass p-12 text-center"
          >
            <div className="w-20 h-20 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-6" />
            <p className="text-xl text-gray-400">AI is analyzing email...</p>
            <p className="text-sm text-gray-500 mt-2">Checking patterns, links, sender reputation, and more</p>
          </motion.div>
        )}

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Threat Score */}
            <div className={`glass p-8 text-center border-2 ${getScoreBg(result.threatScore)}`}>
              <div className="flex justify-center mb-4">
                <div className={`w-28 h-28 rounded-full flex items-center justify-center border-4 ${getScoreBg(result.threatScore)}`}>
                  <div className="text-center">
                    <div className={`text-4xl font-bold ${getScoreColor(result.threatScore)}`}>
                      {result.threatScore}%
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Threat Level</div>
                  </div>
                </div>
              </div>
              <div className={`text-2xl font-bold mb-2 ${getScoreColor(result.threatScore)}`}>
                {result.riskLevel}
              </div>
              <p className="text-gray-300 max-w-lg mx-auto">{result.explanation}</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="glass p-4 text-center">
                <div className="text-2xl font-bold text-white">
                  {result.extractedInfo?.links?.length || 0}
                </div>
                <div className="text-xs text-gray-400">Links Found</div>
              </div>
              <div className="glass p-4 text-center">
                <div className="text-2xl font-bold text-white">
                  {result.extractedInfo?.links?.filter(l => l.suspicious).length || 0}
                </div>
                <div className="text-xs text-gray-400">Suspicious Links</div>
              </div>
              <div className="glass p-4 text-center">
                <div className="text-2xl font-bold text-white">
                  {result.extractedInfo?.brandsMentioned?.length || 0}
                </div>
                <div className="text-xs text-gray-400">Brands Mentioned</div>
              </div>
              <div className="glass p-4 text-center">
                <div className="text-2xl font-bold text-white">
                  {Object.values(result.checks || {}).filter(c => c === true).length}
                </div>
                <div className="text-xs text-gray-400">Red Flags</div>
              </div>
            </div>

            {/* Detection Details */}
            <div className="glass p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FiShield className="text-cyan-400" />
                Detailed Analysis
              </h3>
              <div className="grid gap-3">
                {Object.entries(result.checks || {}).map(([key, detected]) => (
                  <div 
                    key={key} 
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      detected 
                        ? 'bg-red-500/5 border-red-500/20' 
                        : 'bg-green-500/5 border-green-500/20'
                    }`}
                  >
                    <span className="text-gray-300 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    {detected ? (
                      <span className="flex items-center gap-2 text-red-400 font-medium">
                        <FiAlertTriangle size={16} /> Detected
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 text-green-400 font-medium">
                        <FiCheckCircle size={16} /> Clean
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Extracted Links */}
            {result.extractedInfo?.links?.length > 0 && (
              <div className="glass p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FiLink className="text-cyan-400" />
                  Links Found ({result.extractedInfo.links.length})
                </h3>
                <div className="space-y-2">
                  {result.extractedInfo.links.map((link, i) => (
                    <div 
                      key={i}
                      className={`p-3 rounded-lg border font-mono text-sm break-all ${
                        link.suspicious 
                          ? 'bg-red-500/5 border-red-500/20 text-red-400' 
                          : 'bg-white/5 border-white/10 text-gray-300'
                      }`}
                    >
                      {link.url}
                      {link.suspicious && (
                        <span className="block text-xs text-red-400 mt-1">
                          ⚠️ Suspicious domain: {link.domain}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            <div className={`glass p-6 ${
              result.threatScore >= 70 ? 'border-red-500/30' :
              result.threatScore >= 40 ? 'border-yellow-500/30' :
              'border-green-500/30'
            }`}>
              <h3 className="text-lg font-semibold mb-4">📋 Recommendations</h3>
              <ul className="space-y-3">
                {result.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-300">
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}