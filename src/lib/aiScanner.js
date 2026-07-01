import axios from 'axios';

// Get API keys from environment
const VIRUSTOTAL_KEY = import.meta.env.VITE_VIRUSTOTAL_API_KEY || '';
const SAFE_BROWSING_KEY = import.meta.env.VITE_GOOGLE_SAFE_BROWSING_KEY || '';
const WHOISXML_KEY = import.meta.env.VITE_WHOISXML_API_KEY || '';

export async function scanWebsite(url) {
  try {
    // Clean URL
    url = url.trim();
    url = url.replace(/,/g, '.');
    url = url.replace(/\s+/g, '');
    
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    // Validate URL
    try {
      new URL(url);
    } catch (e) {
      return {
        trustScore: 0,
        riskLevel: 'Error',
        explanation: 'Invalid URL format. Please enter a valid website address (e.g., google.com).',
        checks: {},
        error: 'Invalid URL'
      };
    }

    console.log('🔍 Scanning:', url);

    let finalScore = 0;
    let maxScore = 0;
    const checks = {};
    const details = {};
    const apiResults = [];

    // ==========================================
    // 1. SSL CHECK
    // ==========================================
    const hasSSL = url.startsWith('https://');
    checks.ssl = {
      passed: hasSSL,
      message: hasSSL ? '✅ Valid SSL Certificate' : '❌ No HTTPS - Connection not secure'
    };
    maxScore += 20;
    if (hasSSL) finalScore += 20;

    // ==========================================
    // 2. DOMAIN CHECK
    // ==========================================
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname;
      
      const badTLDs = ['.tk', '.ml', '.ga', '.cf', '.xyz', '.top', '.gq', '.info', '.loan', '.work', '.click'];
      const hasBadTLD = badTLDs.some(tld => hostname.endsWith(tld));
      const isIP = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname);
      const hasManyHyphens = (hostname.match(/-/g) || []).length > 3;
      const isLongDomain = hostname.length > 40;
      
      checks.domain = {
        passed: !hasBadTLD && !isIP && !hasManyHyphens && !isLongDomain,
        hostname: hostname,
        issues: [],
        message: ''
      };

      if (hasBadTLD) checks.domain.issues.push('Suspicious domain extension');
      if (isIP) checks.domain.issues.push('IP address used instead of domain');
      if (hasManyHyphens) checks.domain.issues.push('Excessive hyphens in domain');
      if (isLongDomain) checks.domain.issues.push('Unusually long domain');

      checks.domain.message = checks.domain.issues.length > 0 
        ? '⚠️ ' + checks.domain.issues.join(', ')
        : '✅ Domain looks legitimate';

      maxScore += 15;
      if (checks.domain.passed) finalScore += 15;
      else if (!isIP && !hasBadTLD) finalScore += 5;

    } catch (e) {
      checks.domain = { passed: false, message: 'Invalid URL format' };
    }

    // ==========================================
    // 3. KEYWORD CHECK
    // ==========================================
    const suspiciousKeywords = ['login', 'signin', 'verify', 'secure', 'account', 'update', 'confirm', 'banking', 'free', 'win', 'prize', 'gift', 'bonus', 'reward', 'claim'];
    const foundKeywords = suspiciousKeywords.filter(kw => url.toLowerCase().includes(kw));
    
    checks.keywords = {
      passed: foundKeywords.length <= 2,
      found: foundKeywords,
      message: foundKeywords.length > 2 
        ? `⚠️ Suspicious keywords: ${foundKeywords.slice(0, 3).join(', ')}` 
        : foundKeywords.length > 0
          ? `ℹ️ ${foundKeywords.length} keyword(s) found`
          : '✅ No suspicious keywords'
    };
    
    maxScore += 10;
    if (foundKeywords.length <= 1) finalScore += 10;
    else if (foundKeywords.length <= 2) finalScore += 5;

    // ==========================================
    // 4. VIRUSTOTAL CHECK (Real API)
    // ==========================================
    if (VIRUSTOTAL_KEY) {
      try {
        console.log('  Checking VirusTotal...');
        
        const formData = new URLSearchParams();
        formData.append('url', url);
        
        const vtRes = await axios.post(
          'https://www.virustotal.com/api/v3/urls',
          formData,
          {
            headers: {
              'x-apikey': VIRUSTOTAL_KEY,
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            timeout: 30000
          }
        );

        const analysisId = vtRes.data.data.id;
        console.log('  Analysis ID:', analysisId);

        // Wait for analysis to complete
        await new Promise(r => setTimeout(r, 15000));
        
        const result = await axios.get(
          `https://www.virustotal.com/api/v3/analyses/${analysisId}`,
          { 
            headers: { 'x-apikey': VIRUSTOTAL_KEY },
            timeout: 15000
          }
        );

        const stats = result.data.data.attributes.stats;
        const malicious = stats.malicious || 0;
        const suspicious = stats.suspicious || 0;
        const harmless = stats.harmless || 0;
        const undetected = stats.undetected || 0;
        const total = malicious + suspicious + harmless + undetected;

        checks.virusTotal = {
          passed: malicious === 0 && suspicious === 0,
          totalEngines: total,
          malicious: malicious,
          suspicious: suspicious,
          harmless: harmless,
          undetected: undetected,
          message: malicious > 0 
            ? `🚨 ${malicious}/${total} engines flagged as MALICIOUS`
            : suspicious > 0
              ? `⚠️ ${suspicious}/${total} engines flagged as SUSPICIOUS`
              : `✅ Clean - ${total} engines checked`
        };
        
        maxScore += 35;
        if (malicious === 0 && suspicious === 0) finalScore += 35;
        else if (malicious === 0 && suspicious <= 2) finalScore += 20;
        else if (malicious <= 2) finalScore += 10;
        else finalScore += 0;

        details.virusTotalReport = `https://www.virustotal.com/gui/url/${analysisId}`;
        apiResults.push('VirusTotal ✅');
        console.log(`  VT Result: ${malicious} malicious, ${suspicious} suspicious, ${harmless} clean`);

      } catch (e) {
        console.log('  VirusTotal error:', e.response?.status || e.message);
        checks.virusTotal = { 
          passed: null, 
          message: e.response?.status === 401 ? 'API key invalid' : 
                   e.response?.status === 429 ? 'Rate limit exceeded' : 
                   'Service unavailable' 
        };
        apiResults.push('VirusTotal ❌');
      }
    } else {
      console.log('  VirusTotal: No API key configured');
    }

    // ==========================================
    // 5. GOOGLE SAFE BROWSING (Real API)
    // ==========================================
    if (SAFE_BROWSING_KEY) {
      try {
        console.log('  Checking Google Safe Browsing...');
        
        const gsbRes = await axios.post(
          `https://webrisk.googleapis.com/v1/urls:search?key=${SAFE_BROWSING_KEY}`,
          {
            uri: url,
            threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE"]
          },
          { timeout: 10000 }
        );

        const threats = gsbRes.data.threat || [];
        const isClean = threats.length === 0;

        checks.googleSafeBrowsing = {
          passed: isClean,
          threatsFound: threats.length,
          threatTypes: threats.map(t => t.threatType),
          message: isClean 
            ? '✅ Not in Google threat database'
            : `🚨 Google detected: ${threats.map(t => t.threatType).join(', ')}`
        };

        maxScore += 25;
        if (isClean) finalScore += 25;
        else if (threats.some(t => t.threatType === 'MALWARE')) finalScore += 0;
        else finalScore += 5;

        apiResults.push('Safe Browsing ✅');
        console.log(`  GSB: ${isClean ? 'Clean' : threats.length + ' threats'}`);

      } catch (e) {
        console.log('  Safe Browsing error:', e.response?.status || e.message);
        checks.googleSafeBrowsing = { passed: null, message: 'Service unavailable' };
        apiResults.push('Safe Browsing ❌');
      }
    }

    // ==========================================
    // CALCULATE FINAL SCORE
    // ==========================================
    const trustScore = maxScore > 0 ? Math.round((finalScore / maxScore) * 100) : 50;
    const finalTrustScore = Math.max(0, Math.min(100, trustScore));

    let riskLevel = '';
    let explanation = '';
    
    if (finalTrustScore >= 80) {
      riskLevel = 'Safe ✅';
      explanation = 'This website passed all security checks and appears to be safe.';
    } else if (finalTrustScore >= 60) {
      riskLevel = 'Low Risk';
      explanation = 'Minor security concerns detected. Proceed with normal caution.';
    } else if (finalTrustScore >= 40) {
      riskLevel = 'Suspicious ⚠️';
      explanation = 'Several security issues found. Be careful and verify before proceeding.';
    } else if (finalTrustScore >= 20) {
      riskLevel = 'High Risk 🔴';
      explanation = 'Multiple threats detected. We strongly recommend avoiding this website.';
    } else {
      riskLevel = 'Dangerous 🚨';
      explanation = 'CRITICAL: This website shows strong indicators of being malicious or a scam. Do NOT visit.';
    }

    // Add API info to explanation
    const apiInfo = apiResults.length > 0 ? ` (Checked: ${apiResults.join(', ')})` : '';
    
    console.log(`✅ Scan Complete: ${finalTrustScore}/100 - ${riskLevel}${apiInfo}`);

    return {
      trustScore: finalTrustScore,
      riskLevel,
      explanation,
      checks,
      details,
      apisChecked: apiResults,
      scannedUrl: url,
      scannedAt: new Date().toISOString()
    };

  } catch (error) {
    console.error('❌ Scan failed:', error.message);
    return {
      trustScore: 0,
      riskLevel: 'Error',
      explanation: 'Could not complete scan. Please try again.',
      checks: {},
      error: error.message
    };
  }
}

export function scanEmailContent(emailText) {
  if (!emailText) {
    return {
      threatScore: 0,
      riskLevel: 'No content',
      explanation: 'Please provide email content',
      checks: {}
    };
  }

  const checks = {
    urgency: /urgent|immediately|act now|limited time|expires|deadline/i.test(emailText),
    reward: /won|prize|lottery|inheritance|million|congratulations/i.test(emailText),
    threat: /suspended|terminated|blocked|verify.*account|security.*alert/i.test(emailText),
    links: /https?:\/\/[^\s]+/.test(emailText),
    spoofed: /support@|noreply@|admin@|security@/i.test(emailText),
    personal: /password|credit card|social security|bank account/i.test(emailText),
    attachment: /\.pdf|\.zip|\.exe|\.scr|\.docm/i.test(emailText),
    fakeBrand: /paypal|amazon|netflix|apple|microsoft.*(?:verify|confirm|update)/i.test(emailText)
  };

  let score = 0;
  if (checks.urgency) score += 25;
  if (checks.reward) score += 30;
  if (checks.threat) score += 20;
  if (checks.links) score += 15;
  if (checks.spoofed) score += 10;
  if (checks.personal) score += 20;
  if (checks.attachment) score += 10;
  if (checks.fakeBrand) score += 25;

  score = Math.min(100, score);

  return {
    threatScore: score,
    riskLevel: score >= 70 ? 'Critical - Likely Phishing' : score >= 40 ? 'Suspicious' : 'Safe',
    explanation: score >= 70 
      ? '🚨 This email shows strong phishing indicators. Do NOT click links or respond.'
      : score >= 40 
        ? '⚠️ Some suspicious elements detected. Verify through other channels.'
        : '✅ Email appears legitimate.',
    checks,
    timestamp: new Date().toISOString()
  };
}

export function scanMessage(messageText) {
  if (!messageText) {
    return {
      scamScore: 0,
      riskLevel: 'No content',
      explanation: 'Please provide message content',
      checks: {}
    };
  }

  const checks = {
    urgency: /urgent|asap|immediately|hurry|quick/i.test(messageText),
    offers: /free|won|prize|cash|money|gift|reward/i.test(messageText),
    links: /https?:\/\/[^\s]+|www\.\S+|\.com|\.net/i.test(messageText),
    otp: /otp|verification code|pin.*code|one.time.password/i.test(messageText),
    fakeJob: /work from home|earn.*money|daily.*income|no experience/i.test(messageText),
    payment: /send.*money|transfer.*funds|payment.*required|pay.*now/i.test(messageText),
    threat: /legal.*action|arrest|police|lawsuit/i.test(messageText)
  };

  let score = 0;
  if (checks.urgency) score += 20;
  if (checks.offers) score += 25;
  if (checks.links) score += 15;
  if (checks.otp) score += 20;
  if (checks.fakeJob) score += 20;
  if (checks.payment) score += 25;
  if (checks.threat) score += 30;

  score = Math.min(100, score);

  return {
    scamScore: score,
    riskLevel: score >= 70 ? 'High Risk - Likely Scam' : score >= 40 ? 'Suspicious' : 'Safe',
    explanation: score >= 70 
      ? '🚨 Multiple scam indicators. Block and report this sender.'
      : score >= 40 
        ? '⚠️ Be cautious. Verify independently before responding.'
        : '✅ Message appears safe.',
    checks,
    timestamp: new Date().toISOString()
  };
}