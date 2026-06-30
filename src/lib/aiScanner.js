import axios from 'axios';

// Get API keys from environment
const VIRUSTOTAL_KEY = import.meta.env.VITE_VIRUSTOTAL_API_KEY || '';
const SAFE_BROWSING_KEY = import.meta.env.VITE_GOOGLE_SAFE_BROWSING_KEY || '';
const WHOISXML_KEY = import.meta.env.VITE_WHOISXML_API_KEY || '';

export async function scanWebsite(url) {
  try {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    console.log('Scanning:', url);

    let finalScore = 0;
    let maxScore = 0;
    const checks = {};

    // SSL Check
    const hasSSL = url.startsWith('https://');
    checks.ssl = {
      passed: hasSSL,
      message: hasSSL ? 'Valid SSL' : 'No SSL'
    };
    maxScore += 20;
    if (hasSSL) finalScore += 20;

    // Domain Check
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname;
      const badTLDs = ['.tk', '.ml', '.ga', '.cf', '.xyz', '.top', '.gq'];
      const hasBadTLD = badTLDs.some(tld => hostname.endsWith(tld));
      const isIP = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname);
      
      checks.domain = {
        passed: !hasBadTLD && !isIP,
        hostname: hostname,
        message: hasBadTLD ? 'Suspicious domain' : isIP ? 'IP address used' : 'Domain OK'
      };
      maxScore += 15;
      if (checks.domain.passed) finalScore += 15;
    } catch (e) {
      checks.domain = { passed: false, message: 'Invalid URL' };
    }

    // VirusTotal Check
    if (VIRUSTOTAL_KEY) {
      try {
        const formData = new URLSearchParams();
        formData.append('url', url);
        
        const vtRes = await axios.post(
          'https://www.virustotal.com/api/v3/urls',
          formData,
          {
            headers: {
              'x-apikey': VIRUSTOTAL_KEY,
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          }
        );

        const analysisId = vtRes.data.data.id;
        
        // Wait 15 seconds
        await new Promise(r => setTimeout(r, 15000));
        
        const result = await axios.get(
          `https://www.virustotal.com/api/v3/analyses/${analysisId}`,
          { headers: { 'x-apikey': VIRUSTOTAL_KEY } }
        );

        const stats = result.data.data.attributes.stats;
        const malicious = stats.malicious || 0;
        
        checks.virusTotal = {
          passed: malicious === 0,
          malicious: malicious,
          total: Object.values(stats).reduce((a, b) => a + b, 0),
          message: malicious > 0 ? `${malicious} engines flagged` : 'Clean'
        };
        
        maxScore += 30;
        if (malicious === 0) finalScore += 30;
      } catch (e) {
        console.log('VirusTotal error:', e.message);
        checks.virusTotal = { passed: null, message: 'Unavailable' };
      }
    }

    // Calculate final score
    const trustScore = maxScore > 0 ? Math.round((finalScore / maxScore) * 100) : 50;
    const finalTrustScore = Math.max(0, Math.min(100, trustScore));

    let riskLevel = 'Safe';
    let explanation = '';
    
    if (finalTrustScore >= 80) {
      riskLevel = 'Safe ✅';
      explanation = 'This website appears safe based on our analysis.';
    } else if (finalTrustScore >= 60) {
      riskLevel = 'Low Risk';
      explanation = 'Minor concerns detected. Proceed with caution.';
    } else if (finalTrustScore >= 40) {
      riskLevel = 'Suspicious ⚠️';
      explanation = 'Several security issues found. Be careful.';
    } else {
      riskLevel = 'High Risk 🚨';
      explanation = 'Multiple threats detected. Avoid this website.';
    }

    return {
      trustScore: finalTrustScore,
      riskLevel,
      explanation,
      checks,
      scannedUrl: url,
      scannedAt: new Date().toISOString()
    };

  } catch (error) {
    console.error('Scan failed:', error);
    return {
      trustScore: 0,
      riskLevel: 'Error',
      explanation: 'Could not complete scan: ' + error.message,
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
    urgency: /urgent|immediately|act now|limited time/i.test(emailText),
    reward: /won|prize|lottery|inheritance|million/i.test(emailText),
    threat: /suspended|terminated|blocked|verify.*account/i.test(emailText),
    links: /https?:\/\/[^\s]+/.test(emailText),
    spoofed: /support@|noreply@|admin@|security@/i.test(emailText),
    personal: /password|credit card|social security/i.test(emailText)
  };

  let score = 0;
  if (checks.urgency) score += 25;
  if (checks.reward) score += 30;
  if (checks.threat) score += 20;
  if (checks.links) score += 15;
  if (checks.spoofed) score += 10;
  if (checks.personal) score += 20;

  score = Math.min(100, score);

  return {
    threatScore: score,
    riskLevel: score >= 70 ? 'Critical' : score >= 40 ? 'Suspicious' : 'Safe',
    explanation: score >= 70 
      ? 'This email shows strong phishing indicators.' 
      : score >= 40 
        ? 'Some suspicious elements detected.' 
        : 'Email appears legitimate.',
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
    urgency: /urgent|asap|immediately|hurry/i.test(messageText),
    offers: /free|won|prize|cash|money|gift/i.test(messageText),
    links: /https?:\/\/[^\s]+|www\.\S+/i.test(messageText),
    otp: /otp|verification code|pin.*code/i.test(messageText),
    fakeJob: /work from home|earn.*money|daily.*income/i.test(messageText),
    payment: /send.*money|transfer.*funds/i.test(messageText)
  };

  let score = 0;
  if (checks.urgency) score += 20;
  if (checks.offers) score += 25;
  if (checks.links) score += 15;
  if (checks.otp) score += 20;
  if (checks.fakeJob) score += 20;
  if (checks.payment) score += 25;

  score = Math.min(100, score);

  return {
    scamScore: score,
    riskLevel: score >= 70 ? 'High Risk' : score >= 40 ? 'Suspicious' : 'Safe',
    explanation: score >= 70 
      ? 'Multiple scam indicators. Block this sender.' 
      : score >= 40 
        ? 'Be cautious with this message.' 
        : 'Message appears safe.',
    checks,
    timestamp: new Date().toISOString()
  };
}