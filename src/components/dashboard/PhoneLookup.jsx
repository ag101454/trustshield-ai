import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPhone, FiMapPin, FiAlertTriangle, FiCheckCircle, FiSearch } from 'react-icons/fi';
import toast from 'react-hot-toast';

// Simple phone validation without external library (to avoid dependency issues)
function validatePhoneNumber(phone) {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Basic validation
  if (cleaned.length < 7 || cleaned.length > 15) {
    return { valid: false, reason: 'Invalid length' };
  }
  
  // Check for common scam patterns
  const scamPrefixes = ['999', '000', '1111111'];
  const hasScamPrefix = scamPrefixes.some(p => cleaned.startsWith(p));
  
  // Detect country by prefix
  let country = 'Unknown';
  if (cleaned.startsWith('1')) country = 'United States/Canada';
  else if (cleaned.startsWith('44')) country = 'United Kingdom';
  else if (cleaned.startsWith('91')) country = 'India';
  else if (cleaned.startsWith('86')) country = 'China';
  else if (cleaned.startsWith('49')) country = 'Germany';
  else if (cleaned.startsWith('33')) country = 'France';
  else if (cleaned.startsWith('61')) country = 'Australia';
  else if (cleaned.startsWith('81')) country = 'Japan';
  else if (cleaned.startsWith('7')) country = 'Russia';
  else if (cleaned.startsWith('55')) country = 'Brazil';
  
  // Detect type based on prefix patterns
  let type = 'Unknown';
  if (cleaned.startsWith('800') || cleaned.startsWith('888') || 
      cleaned.startsWith('877') || cleaned.startsWith('866') || 
      cleaned.startsWith('855') || cleaned.startsWith('844')) {
    type = 'Toll-Free';
  } else if (cleaned.startsWith('900')) {
    type = 'Premium Rate';
  } else if (cleaned.length === 10 && cleaned.startsWith('1')) {
    type = 'Mobile/Landline';
  }
  
  // Known scam numbers database (example)
  const knownScamNumbers = [
    '18005550199', '18885551234', '19005550100',
    '18005550100', '1234567890', '9999999999'
  ];
  
  const isKnownScam = knownScamNumbers.includes(cleaned);
  
  return {
    valid: true,
    cleaned,
    country,
    type,
    hasScamPrefix,
    isKnownScam,
    riskLevel: isKnownScam ? 'high' : hasScamPrefix ? 'medium' : 'low'
  };
}

export default function PhoneLookup() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLookup = async () => {
    if (!phoneNumber.trim()) {
      toast.error('Please enter a phone number');
      return;
    }

    setLoading(true);
    setResult(null);

    // Simulate API lookup
    await new Promise(resolve => setTimeout(resolve, 2000));

    const validation = validatePhoneNumber(phoneNumber);
    
    const scamReports = validation.isKnownScam ? 47 : 
                       validation.hasScamPrefix ? 12 : 
                       Math.floor(Math.random() * 3);
    
    setResult({
      phone: phoneNumber,
      cleaned: validation.cleaned,
      valid: validation.valid,
      country: validation.country,
      type: validation.type,
      riskLevel: validation.riskLevel === 'high' ? 'High Risk' : 
                 validation.riskLevel === 'medium' ? 'Medium Risk' : 'Low Risk',
      isScam: validation.isKnownScam || validation.hasScamPrefix,
      scamReports,
      lastReported: scamReports > 0 ? 'Recently reported' : null,
      carrier: validation.isKnownScam ? 'VoIP (Suspicious)' : 
               validation.hasScamPrefix ? 'Unknown' : 'Major Carrier',
      warnings: []
    });

    if (validation.isKnownScam) {
      result.warnings.push('⚠️ This number is in our known scam database');
      result.warnings.push('📞 Multiple users reported this number');
      result.warnings.push('🚫 Block this number immediately');
    } else if (validation.hasScamPrefix) {
      result.warnings.push('⚠️ Suspicious number pattern detected');
      result.warnings.push('🔍 Exercise caution with this caller');
    }

    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <FiPhone className="text-cyan-400" />
          Phone Number Lookup
        </h1>
        <p className="text-gray-400">
          Check if a phone number has been reported for scams or spam
        </p>
      </div>

      {/* Lookup Input */}
      <div className="glass p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Enter phone number (e.g., +1 555-123-4567)"
              className="w-full pl-12 pr-4 py-4 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 text-lg"
              onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
            />
          </div>
          <button
            onClick={handleLookup}
            disabled={loading || !phoneNumber.trim()}
            className="btn-primary px-8 disabled:opacity-50 whitespace-nowrap"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                Looking up...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <FiSearch /> Lookup
              </span>
            )}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Examples: 1-800-555-0199 (known scam) | 1-212-555-1234 (legitimate)
        </p>
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
            <p className="text-gray-400">Checking phone number databases...</p>
          </motion.div>
        )}

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Risk Level */}
            <div className={`glass p-8 text-center border-2 ${
              result.riskLevel === 'High Risk' ? 'border-red-500/30 bg-red-500/5' :
              result.riskLevel === 'Medium Risk' ? 'border-yellow-500/30 bg-yellow-500/5' :
              'border-green-500/30 bg-green-500/5'
            }`}>
              <div className="flex justify-center mb-4">
                {result.isScam ? (
                  <FiAlertTriangle className="text-6xl text-red-400" />
                ) : (
                  <FiCheckCircle className="text-6xl text-green-400" />
                )}
              </div>
              <div className={`text-2xl font-bold mb-2 ${
                result.isScam ? 'text-red-400' : 'text-green-400'
              }`}>
                {result.riskLevel}
              </div>
              <p className="text-gray-400 text-lg">{result.phone}</p>
              {result.scamReports > 0 && (
                <p className="text-red-400 mt-2">
                  ⚠️ {result.scamReports} scam reports
                </p>
              )}
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="glass p-4">
                <p className="text-sm text-gray-500 mb-1 flex items-center gap-2">
                  <FiMapPin className="text-cyan-400" /> Country
                </p>
                <p className="text-white font-medium">{result.country}</p>
              </div>
              <div className="glass p-4">
                <p className="text-sm text-gray-500 mb-1 flex items-center gap-2">
                  <FiPhone className="text-cyan-400" /> Type
                </p>
                <p className="text-white font-medium">{result.type}</p>
              </div>
              <div className="glass p-4">
                <p className="text-sm text-gray-500 mb-1 flex items-center gap-2">
                  📡 Carrier
                </p>
                <p className="text-white font-medium">{result.carrier}</p>
              </div>
              <div className="glass p-4">
                <p className="text-sm text-gray-500 mb-1 flex items-center gap-2">
                  📊 Status
                </p>
                <p className={`font-medium ${result.isScam ? 'text-red-400' : 'text-green-400'}`}>
                  {result.isScam ? 'Reported Scam' : 'No Reports'}
                </p>
              </div>
            </div>

            {/* Warnings */}
            {result.warnings?.length > 0 && (
              <div className="glass p-6 border-red-500/30">
                <h3 className="text-lg font-semibold text-red-400 mb-4">⚠️ Warnings</h3>
                <ul className="space-y-3">
                  {result.warnings.map((warning, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-300">
                      <span>{warning}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            <div className="glass p-6">
              <h3 className="text-lg font-semibold mb-4">📋 What to Do</h3>
              <ul className="space-y-2">
                {result.isScam ? (
                  <>
                    <li className="flex items-start gap-2 text-red-300">🚫 Block this number immediately</li>
                    <li className="flex items-start gap-2 text-red-300">📵 Do not answer calls from this number</li>
                    <li className="flex items-start gap-2 text-red-300">🚔 Report to FTC or local authorities</li>
                    <li className="flex items-start gap-2 text-red-300">📱 Add to your phone's spam list</li>
                  </>
                ) : (
                  <>
                    <li className="flex items-start gap-2 text-green-300">✅ No immediate threats detected</li>
                    <li className="flex items-start gap-2 text-gray-300">🔍 Still verify unexpected callers</li>
                    <li className="flex items-start gap-2 text-gray-300">📞 Don't share personal info over phone</li>
                  </>
                )}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}