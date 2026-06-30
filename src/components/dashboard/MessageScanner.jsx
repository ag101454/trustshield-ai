import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { scanMessage } from '../../lib/aiScanner';
import { FiMessageSquare, FiAlertTriangle, FiCheckCircle, FiCopy } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function MessageScanner() {
  const [message, setMessage] = useState('');
  const [sender, setSender] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const sampleMessages = [
    {
      label: 'Fake Job Offer',
      sender: '+1-555-SCAM',
      text: 'URGENT! Work from home and earn $500/day! No experience needed. Click here: http://bit.ly/fake-job-offer'
    },
    {
      label: 'Bank Scam',
      sender: 'Bank-Alert',
      text: 'Your account has been suspended. Verify your identity immediately: http://suspicious-bank.com/verify'
    },
    {
      label: 'Prize Scam',
      sender: 'WINNER',
      text: 'CONGRATULATIONS! You won $1000! Claim your prize now: http://claim-prize.xyz'
    },
    {
      label: 'Legitimate Message',
      sender: 'Mom',
      text: 'Hey, are you coming for dinner tonight? Let me know what time.'
    }
  ];

  const handleScan = async () => {
    if (!message.trim()) {
      toast.error('Please enter a message to scan');
      return;
    }

    setLoading(true);
    setResult(null);

    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const scanResult = scanMessage(message);
    scanResult.sender = sender;
    setResult(scanResult);
    setLoading(false);
  };

  const handleCopyMessage = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Message copied!');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <FiMessageSquare className="text-cyan-400" />
          Message Scanner
        </h1>
        <p className="text-gray-400">
          Check SMS, WhatsApp, or social media messages for scam patterns
        </p>
      </div>

      {/* Sample Messages */}
      <div className="mb-6">
        <p className="text-sm text-gray-500 mb-3">Try these examples:</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {sampleMessages.map((sample, index) => (
            <button
              key={index}
              onClick={() => {
                setMessage(sample.text);
                setSender(sample.sender);
              }}
              className="glass p-3 text-left hover:border-cyan-500/30 transition-all group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-white group-hover:text-cyan-400 transition-colors">
                  {sample.label}
                </span>
                <FiCopy 
                  className="text-gray-500 group-hover:text-cyan-400 transition-colors"
                  size={14}
                />
              </div>
              <p className="text-xs text-gray-500 truncate">{sample.text}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Scanner Input */}
      <div className="glass p-6 mb-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Sender (optional)</label>
            <input
              type="text"
              value={sender}
              onChange={(e) => setSender(e.target.value)}
              placeholder="e.g., +1-555-0123 or Unknown"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Message Content</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Paste the message you received..."
              rows={5}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 resize-none"
            />
          </div>
          <button
            onClick={handleScan}
            disabled={loading || !message.trim()}
            className="btn-primary w-full sm:w-auto disabled:opacity-50"
          >
            {loading ? 'Analyzing...' : 'Scan Message'}
          </button>
        </div>
      </div>

      {/* Results */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="glass p-12 text-center"
          >
            <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">AI is analyzing message patterns...</p>
          </motion.div>
        )}

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Scam Score */}
            <div className="glass p-8 text-center">
              <div className="flex justify-center mb-4">
                <div className={`w-32 h-32 rounded-full flex items-center justify-center border-4 ${
                  result.scamScore >= 70 ? 'border-red-500' :
                  result.scamScore >= 40 ? 'border-yellow-500' :
                  'border-green-500'
                }`}>
                  <div className="text-center">
                    <div className={`text-4xl font-bold ${
                      result.scamScore >= 70 ? 'text-red-400' :
                      result.scamScore >= 40 ? 'text-yellow-400' :
                      'text-green-400'
                    }`}>
                      {result.scamScore}%
                    </div>
                    <div className="text-xs text-gray-500">Scam Probability</div>
                  </div>
                </div>
              </div>
              <div className={`text-xl font-semibold mb-2 ${
                result.scamScore >= 70 ? 'text-red-400' :
                result.scamScore >= 40 ? 'text-yellow-400' :
                'text-green-400'
              }`}>
                {result.riskLevel}
              </div>
              <p className="text-gray-400 max-w-lg mx-auto">{result.explanation}</p>
            </div>

            {/* Detection Details */}
            <div className="glass p-6">
              <h3 className="text-lg font-semibold mb-4">Detection Results</h3>
              <div className="grid gap-3">
                {Object.entries(result.checks).map(([key, detected]) => (
                  <div key={key} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <span className="text-gray-300">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </span>
                    {detected ? (
                      <span className="flex items-center gap-2 text-red-400">
                        <FiAlertTriangle size={16} /> Detected
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 text-green-400">
                        <FiCheckCircle size={16} /> Not Detected
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className={`glass p-6 ${
              result.scamScore >= 70 ? 'border-red-500/30' :
              result.scamScore >= 40 ? 'border-yellow-500/30' :
              'border-green-500/30'
            }`}>
              <h3 className="text-lg font-semibold mb-4">What to Do</h3>
              <ul className="space-y-3">
                {result.scamScore >= 70 && (
                  <>
                    <li className="flex items-start gap-2 text-red-300">
                      <span>🚫</span> Block this sender immediately
                    </li>
                    <li className="flex items-start gap-2 text-red-300">
                      <span>📵</span> Do not click any links
                    </li>
                    <li className="flex items-start gap-2 text-red-300">
                      <span>🚔</span> Report to local authorities
                    </li>
                  </>
                )}
                {result.scamScore >= 40 && result.scamScore < 70 && (
                  <>
                    <li className="flex items-start gap-2 text-yellow-300">
                      <span>⚠️</span> Be cautious with this message
                    </li>
                    <li className="flex items-start gap-2 text-yellow-300">
                      <span>🔍</span> Verify the sender through other channels
                    </li>
                    <li className="flex items-start gap-2 text-yellow-300">
                      <span>❌</span> Don't share personal information
                    </li>
                  </>
                )}
                {result.scamScore < 40 && (
                  <li className="flex items-start gap-2 text-green-300">
                    <span>✅</span> This message appears safe, but always stay vigilant
                  </li>
                )}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}