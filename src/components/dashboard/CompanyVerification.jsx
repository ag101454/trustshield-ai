import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiSearch, FiGlobe, FiMapPin, FiCalendar, 
  FiShield, FiAlertTriangle, FiCheckCircle,
  FiExternalLink, FiUsers, FiStar, FiDatabase
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import axios from 'axios';

const WHOISXML_KEY = import.meta.env.VITE_WHOISXML_API_KEY || '';

export default function CompanyVerification() {
  const [companyName, setCompanyName] = useState('');
  const [website, setWebsite] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Known legitimate companies database
  const knownCompanies = {
    'google': { domain: 'google.com', founded: 1998, employees: '180,000+', type: 'Technology', verified: true },
    'amazon': { domain: 'amazon.com', founded: 1994, employees: '1,500,000+', type: 'E-commerce', verified: true },
    'microsoft': { domain: 'microsoft.com', founded: 1975, employees: '220,000+', type: 'Technology', verified: true },
    'apple': { domain: 'apple.com', founded: 1976, employees: '160,000+', type: 'Technology', verified: true },
    'meta': { domain: 'meta.com', founded: 2004, employees: '86,000+', type: 'Technology', verified: true },
    'tesla': { domain: 'tesla.com', founded: 2003, employees: '127,000+', type: 'Automotive', verified: true },
    'netflix': { domain: 'netflix.com', founded: 1997, employees: '12,000+', type: 'Entertainment', verified: true },
    'paypal': { domain: 'paypal.com', founded: 1998, employees: '29,000+', type: 'Finance', verified: true },
    'spotify': { domain: 'spotify.com', founded: 2006, employees: '9,000+', type: 'Music', verified: true },
    'uber': { domain: 'uber.com', founded: 2009, employees: '32,000+', type: 'Transport', verified: true },
    'airbnb': { domain: 'airbnb.com', founded: 2008, employees: '6,000+', type: 'Hospitality', verified: true },
    'stripe': { domain: 'stripe.com', founded: 2010, employees: '7,000+', type: 'Finance', verified: true },
    'shopify': { domain: 'shopify.com', founded: 2006, employees: '10,000+', type: 'E-commerce', verified: true },
    'zoom': { domain: 'zoom.us', founded: 2011, employees: '8,000+', type: 'Technology', verified: true },
    'slack': { domain: 'slack.com', founded: 2013, employees: '2,500+', type: 'Technology', verified: true },
    'github': { domain: 'github.com', founded: 2008, employees: '3,000+', type: 'Technology', verified: true }
  };

  const handleVerify = async () => {
    if (!companyName.trim()) {
      toast.error('Please enter a company name');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      let trustScore = 40; // Start neutral
      const checks = {};
      const details = {};
      const warnings = [];
      const recommendations = [];

      // 1. Check known companies database
      const companyLower = companyName.toLowerCase();
      const knownCompany = Object.entries(knownCompanies).find(([key]) => 
        companyLower.includes(key)
      );

      if (knownCompany) {
        const [name, info] = knownCompany;
        checks.knownCompany = {
          verified: true,
          name: name,
          ...info,
          message: `✅ Verified: ${name.toUpperCase()} (since ${info.founded})`
        };
        trustScore += 50;
        details.officialWebsite = `https://${info.domain}`;
        details.founded = info.founded;
        details.employees = info.employees;
        details.type = info.type;
      } else {
        checks.knownCompany = {
          verified: false,
          message: 'Company not in verified database'
        };
        warnings.push('Not found in verified companies database');
      }

      // 2. Check if website provided
      if (website) {
        try {
          const url = website.startsWith('http') ? website : `https://${website}`;
          const hostname = new URL(url).hostname;

          // Basic website check
          try {
            const siteCheck = await axios.get(url, { timeout: 5000 });
            checks.website = {
              accessible: true,
              statusCode: siteCheck.status,
              message: '✅ Website is accessible'
            };
            trustScore += 10;
          } catch (e) {
            checks.website = {
              accessible: false,
              message: '⚠️ Website not accessible'
            };
            warnings.push('Provided website is not reachable');
            trustScore -= 10;
          }

          // Check for suspicious patterns
          const suspiciousWords = ['free', 'win', 'prize', 'bonus', 'get-rich', 'guaranteed'];
          const foundWords = suspiciousWords.filter(w => website.toLowerCase().includes(w));
          
          if (foundWords.length > 0) {
            checks.suspiciousPatterns = {
              found: foundWords,
              message: `⚠️ Suspicious keywords: ${foundWords.join(', ')}`
            };
            trustScore -= foundWords.length * 10;
            warnings.push('Website contains suspicious keywords');
          }

          // WHOIS lookup
          if (WHOISXML_KEY) {
            try {
              const whoisRes = await axios.get('https://www.whoisxmlapi.com/whoisserver/WhoisService', {
                params: {
                  apiKey: WHOISXML_KEY,
                  domainName: hostname,
                  outputFormat: 'JSON'
                }
              });

              const whoisData = whoisRes.data.WhoisRecord || {};
              if (whoisData.createdDate) {
                const domainAge = Math.floor(
                  (Date.now() - new Date(whoisData.createdDate).getTime()) / (1000 * 60 * 60 * 24)
                );
                
                checks.domainAge = {
                  days: domainAge,
                  years: Math.floor(domainAge / 365),
                  createdDate: whoisData.createdDate,
                  message: domainAge < 90 
                    ? `⚠️ Domain only ${domainAge} days old` 
                    : `✅ Domain: ${Math.floor(domainAge/365)} years old`
                };

                if (domainAge < 90) {
                  trustScore -= 20;
                  warnings.push(`Domain registered only ${domainAge} days ago`);
                } else if (domainAge > 365) {
                  trustScore += 10;
                }
              }
            } catch (e) {
              console.log('WHOIS error:', e.message);
            }
          }

        } catch (e) {
          checks.website = { valid: false, message: 'Invalid website URL' };
          trustScore -= 10;
        }
      } else {
        checks.website = { message: 'No website provided' };
        warnings.push('No website provided for verification');
      }

      // 3. Scam keyword check
      const scamKeywords = [
        'get rich quick', 'make money fast', 'guaranteed returns',
        'risk free', 'secret method', 'limited spots', 'act now',
        'exclusive access', 'once in lifetime'
      ];

      const foundScamKeywords = scamKeywords.filter(kw =>
        companyName.toLowerCase().includes(kw) ||
        (website && website.toLowerCase().includes(kw))
      );

      checks.scamKeywords = {
        found: foundScamKeywords,
        message: foundScamKeywords.length > 0 
          ? `⚠️ ${foundScamKeywords.length} scam keywords detected` 
          : '✅ No scam keywords'
      };

      if (foundScamKeywords.length > 0) {
        trustScore -= foundScamKeywords.length * 15;
        warnings.push('Company name/website matches scam patterns');
      }

      // Calculate final score
      trustScore = Math.max(0, Math.min(100, Math.round(trustScore)));

      const riskLevel = 
        trustScore >= 80 ? 'Verified ✅' :
        trustScore >= 60 ? 'Likely Legitimate' :
        trustScore >= 40 ? 'Uncertain ⚠️' :
        trustScore >= 20 ? 'Suspicious 🔴' :
        'Likely Scam 🚨';

      let verdict;
      if (trustScore >= 80) {
        verdict = 'This company appears legitimate and verified.';
        recommendations.push('✅ Safe to proceed with this company');
        if (details.officialWebsite) {
          recommendations.push(`Visit official site: ${details.officialWebsite}`);
        }
      } else if (trustScore >= 60) {
        verdict = 'Company seems legitimate but verify independently.';
        recommendations.push('🔍 Research company on LinkedIn');
        recommendations.push('📞 Contact through official channels');
      } else if (trustScore >= 40) {
        verdict = 'Unable to fully verify. Exercise caution.';
        recommendations.push('⚠️ Do not share personal information');
        recommendations.push('🔍 Check employee reviews on Glassdoor');
        recommendations.push('📋 Verify business registration');
      } else {
        verdict = 'Multiple warning signs - likely fraudulent.';
        recommendations.push('🚫 Do not engage with this company');
        recommendations.push('🚔 Report to relevant authorities');
        recommendations.push('⚠️ Warning others about this company');
      }

      setResult({
        companyName,
        website,
        trustScore,
        riskLevel,
        verdict,
        checks,
        details,
        warnings,
        recommendations,
        verifiedAt: new Date().toISOString()
      });

    } catch (error) {
      console.error('Verification error:', error);
      toast.error('Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <FiShield className="text-cyan-400" />
          Company Verification
        </h1>
        <p className="text-gray-400">
          Verify companies and job offers using our database and real-time checks
        </p>
      </div>

      {/* Input Form */}
      <div className="glass p-6 mb-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Company Name *</label>
            <div className="relative">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g., Tesla Recruitment, Amazon Careers..."
                className="w-full pl-12 pr-4 py-4 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Website (optional)</label>
            <div className="relative">
              <FiGlobe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="e.g., company.com"
                className="w-full pl-12 pr-4 py-4 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
              />
            </div>
          </div>
          <button
            onClick={handleVerify}
            disabled={loading || !companyName.trim()}
            className="btn-primary w-full sm:w-auto disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                Verifying...
              </span>
            ) : (
              '🔍 Verify Company'
            )}
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
            <div className="w-20 h-20 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-6" />
            <p className="text-xl text-gray-400">Verifying company details...</p>
            <p className="text-sm text-gray-500 mt-2">Checking databases, website, domain age, and scam reports</p>
          </motion.div>
        )}

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Score */}
            <div className="glass p-8 text-center">
              <div className={`text-7xl font-bold mb-4 ${
                result.trustScore >= 80 ? 'text-green-400' :
                result.trustScore >= 60 ? 'text-yellow-400' :
                result.trustScore >= 40 ? 'text-orange-400' :
                'text-red-400'
              }`}>
                {result.trustScore}<span className="text-2xl text-gray-500">/100</span>
              </div>
              <div className="text-2xl font-bold text-white mb-2">{result.riskLevel}</div>
              <p className="text-gray-300 max-w-lg mx-auto">{result.verdict}</p>
            </div>

            {/* Details Grid */}
            {result.details && Object.keys(result.details).length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {result.details.officialWebsite && (
                  <div className="glass p-4 text-center">
                    <FiGlobe className="text-cyan-400 mx-auto mb-2" size={20} />
                    <div className="text-xs text-gray-400">Website</div>
                    <div className="text-sm text-white truncate">{result.details.officialWebsite}</div>
                  </div>
                )}
                {result.details.founded && (
                  <div className="glass p-4 text-center">
                    <FiCalendar className="text-cyan-400 mx-auto mb-2" size={20} />
                    <div className="text-xs text-gray-400">Founded</div>
                    <div className="text-sm text-white">{result.details.founded}</div>
                  </div>
                )}
                {result.details.employees && (
                  <div className="glass p-4 text-center">
                    <FiUsers className="text-cyan-400 mx-auto mb-2" size={20} />
                    <div className="text-xs text-gray-400">Employees</div>
                    <div className="text-sm text-white">{result.details.employees}</div>
                  </div>
                )}
                {result.details.type && (
                  <div className="glass p-4 text-center">
                    <FiDatabase className="text-cyan-400 mx-auto mb-2" size={20} />
                    <div className="text-xs text-gray-400">Industry</div>
                    <div className="text-sm text-white">{result.details.type}</div>
                  </div>
                )}
              </div>
            )}

            {/* Checks */}
            <div className="glass p-6">
              <h3 className="text-lg font-semibold mb-4">Verification Checks</h3>
              <div className="grid gap-3">
                {Object.entries(result.checks).map(([key, check]) => (
                  <div key={key} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <span className="text-gray-300 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <span className={check.verified || check.accessible ? 'text-green-400' : 'text-yellow-400'}>
                      {check.message}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Warnings */}
            {result.warnings.length > 0 && (
              <div className="glass p-6 border-red-500/30">
                <h3 className="text-lg font-semibold text-red-400 mb-4">⚠️ Warnings</h3>
                <ul className="space-y-2">
                  {result.warnings.map((warning, i) => (
                    <li key={i} className="flex items-center gap-2 text-gray-300">
                      <span className="w-2 h-2 bg-red-400 rounded-full" />
                      {warning}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            <div className="glass p-6">
              <h3 className="text-lg font-semibold mb-4">📋 Recommendations</h3>
              <ul className="space-y-2">
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