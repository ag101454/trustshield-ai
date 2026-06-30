import axios from 'axios';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { emailContent, emailHeaders } = req.body;
  
  if (!emailContent) {
    return res.status(400).json({ error: 'Email content is required' });
  }

  console.log(`\n📧 ANALYZING EMAIL\n`);

  try {
    let threatScore = 0;
    const checks = {};
    const details = {};
    const warnings = [];

    // ==========================================
    // 1. URGENCY LANGUAGE DETECTION
    // ==========================================
    const urgencyPatterns = [
      { pattern: /urgent/i, weight: 15, label: 'Urgency keyword' },
      { pattern: /immediately/i, weight: 15, label: 'Immediate action required' },
      { pattern: /limited time/i, weight: 10, label: 'Time pressure' },
      { pattern: /act now/i, weight: 15, label: 'Act now demand' },
      { pattern: /expires? (today|soon|within)/i, weight: 10, label: 'Expiration threat' },
      { pattern: /deadline/i, weight: 8, label: 'Deadline pressure' },
      { pattern: /last chance/i, weight: 12, label: 'Last chance tactic' },
      { pattern: /don't miss out/i, weight: 8, label: 'Fear of missing out' },
      { pattern: /hurry/i, weight: 10, label: 'Rush tactic' }
    ];

    const foundUrgency = urgencyPatterns.filter(p => p.pattern.test(emailContent));
    
    checks.urgency = {
      detected: foundUrgency.length > 0,
      patterns: foundUrgency.map(p => p.label),
      score: foundUrgency.reduce((sum, p) => sum + p.weight, 0),
      message: foundUrgency.length > 0 
        ? `⚠️ ${foundUrgency.length} urgency patterns detected` 
        : '✅ No urgency language'
    };
    
    if (foundUrgency.length > 0) {
      threatScore += foundUrgency.reduce((sum, p) => sum + p.weight, 0);
      warnings.push('Uses urgency/pressure tactics common in scams');
    }

    // ==========================================
    // 2. REWARD/SCAM PATTERNS
    // ==========================================
    const rewardPatterns = [
      { pattern: /congratulations.*(?:won|winner|selected)/i, weight: 25, label: 'Fake win notification' },
      { pattern: /you.*(?:won|have won)/i, weight: 20, label: 'Prize claim' },
      { pattern: /lottery/i, weight: 25, label: 'Lottery scam' },
      { pattern: /inheritance/i, weight: 25, label: 'Inheritance scam' },
      { pattern: /million.*(?:dollars?|usd|pounds?)/i, weight: 20, label: 'Large sum promise' },
      { pattern: /free.*(?:gift|prize|money|iphone|iphone)/i, weight: 15, label: 'Free offer' },
      { pattern: /claim.*(?:prize|reward|gift)/i, weight: 20, label: 'Claim reward' },
      { pattern: /you have been selected/i, weight: 20, label: 'Selected winner' },
      { pattern: /exclusive offer/i, weight: 10, label: 'Exclusive offer' }
    ];

    const foundRewards = rewardPatterns.filter(p => p.pattern.test(emailContent));
    
    checks.rewardScam = {
      detected: foundRewards.length > 0,
      patterns: foundRewards.map(p => p.label),
      score: foundRewards.reduce((sum, p) => sum + p.weight, 0),
      message: foundRewards.length > 0 
        ? `⚠️ ${foundRewards.length} reward scam indicators` 
        : '✅ No reward scam patterns'
    };
    
    if (foundRewards.length > 0) {
      threatScore += foundRewards.reduce((sum, p) => sum + p.weight, 0);
      warnings.push('Contains reward/prize scam patterns');
    }

    // ==========================================
    // 3. THREAT & INTIMIDATION
    // ==========================================
    const threatPatterns = [
      { pattern: /account.*suspended/i, weight: 20, label: 'Account suspension threat' },
      { pattern: /account.*terminated/i, weight: 20, label: 'Account termination' },
      { pattern: /unauthorized.*(?:access|login|activity)/i, weight: 15, label: 'Unauthorized access' },
      { pattern: /security.*(?:alert|breach|warning|threat)/i, weight: 15, label: 'Security alert' },
      { pattern: /verify.*(?:account|identity|information)/i, weight: 18, label: 'Verify account' },
      { pattern: /unusual.*(?:activity|login|sign.*in)/i, weight: 15, label: 'Unusual activity' },
      { pattern: /blocked|locked|disabled/i, weight: 12, label: 'Account blocked' },
      { pattern: /legal.*action/i, weight: 20, label: 'Legal threat' }
    ];

    const foundThreats = threatPatterns.filter(p => p.pattern.test(emailContent));
    
    checks.threats = {
      detected: foundThreats.length > 0,
      patterns: foundThreats.map(p => p.label),
      score: foundThreats.reduce((sum, p) => sum + p.weight, 0),
      message: foundThreats.length > 0 
        ? `⚠️ ${foundThreats.length} threat/intimidation patterns` 
        : '✅ No threats detected'
    };
    
    if (foundThreats.length > 0) {
      threatScore += foundThreats.reduce((sum, p) => sum + p.weight, 0);
      warnings.push('Uses threats or intimidation tactics');
    }

    // ==========================================
    // 4. SUSPICIOUS LINKS
    // ==========================================
    const linkPattern = /https?:\/\/[^\s<>"]+/gi;
    const links = emailContent.match(linkPattern) || [];
    
    let suspiciousLinks = [];
    links.forEach(link => {
      try {
        const url = new URL(link);
        const issues = [];
        
        // Check for IP address
        if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(url.hostname)) {
          issues.push('IP address used');
        }
        
        // Check for suspicious TLDs
        const suspiciousTLDs = ['.tk', '.ml', '.ga', '.cf', '.xyz', '.top', '.gq'];
        if (suspiciousTLDs.some(tld => url.hostname.endsWith(tld))) {
          issues.push('Suspicious domain');
        }
        
        // Check for URL shorteners
        const shorteners = ['bit.ly', 'tinyurl.com', 't.co', 'ow.ly', 'goo.gl', 'is.gd', 'buff.ly'];
        if (shorteners.some(s => url.hostname.includes(s))) {
          issues.push('URL shortener (hidden destination)');
        }
        
        // Check for misleading domains
        const trustedBrands = ['paypal', 'amazon', 'google', 'facebook', 'apple', 'microsoft', 'netflix'];
        trustedBrands.forEach(brand => {
          if (url.hostname.includes(brand) && !url.hostname.endsWith(`${brand}.com`)) {
            issues.push(`Fake ${brand} domain`);
          }
        });
        
        if (issues.length > 0) {
          suspiciousLinks.push({ url: link, issues });
        }
      } catch (e) {
        suspiciousLinks.push({ url: link, issues: ['Invalid URL'] });
      }
    });
    
    checks.links = {
      total: links.length,
      suspicious: suspiciousLinks.length,
      suspiciousUrls: suspiciousLinks,
      message: suspiciousLinks.length > 0 
        ? `⚠️ ${suspiciousLinks.length} suspicious links found` 
        : links.length > 0 
          ? '✅ Links appear safe' 
          : 'ℹ️ No links in email'
    };
    
    if (suspiciousLinks.length > 0) {
      threatScore += suspiciousLinks.length * 15;
      warnings.push(`Contains ${suspiciousLinks.length} suspicious link(s)`);
    }

    // ==========================================
    // 5. SPOOFED SENDER CHECK
    // ==========================================
    const spoofPatterns = [
      { pattern: /from:.*(?:support|admin|security|help|noreply|no-reply)/i, weight: 10, label: 'Official-sounding sender' },
      { pattern: /paypal.*support/i, weight: 15, label: 'Fake PayPal support' },
      { pattern: /amazon.*(?:support|security|prime)/i, weight: 15, label: 'Fake Amazon' },
      { pattern: /netflix.*(?:support|billing)/i, weight: 15, label: 'Fake Netflix' },
      { pattern: /apple.*(?:id|support|verify)/i, weight: 15, label: 'Fake Apple' },
      { pattern: /bank.*(?:alert|security|verify)/i, weight: 20, label: 'Fake bank alert' }
    ];
    
    const foundSpoof = spoofPatterns.filter(p => p.pattern.test(emailContent));
    
    checks.spoofing = {
      detected: foundSpoof.length > 0,
      patterns: foundSpoof.map(p => p.label),
      message: foundSpoof.length > 0 
        ? '⚠️ Possible sender spoofing detected' 
        : '✅ No spoofing indicators'
    };
    
    if (foundSpoof.length > 0) {
      threatScore += foundSpoof.reduce((sum, p) => sum + p.weight, 0);
      warnings.push('Possible sender identity spoofing');
    }

    // ==========================================
    // 6. ATTACHMENT ANALYSIS
    // ==========================================
    const dangerousExtensions = ['.exe', '.scr', '.bat', '.cmd', '.ps1', '.vbs', '.js', '.jar', '.docm', '.xlsm'];
    const attachmentPattern = /attachment.*\.(exe|scr|bat|cmd|ps1|vbs|js|jar|docm|xlsm|pdf|zip)/gi;
    const attachments = emailContent.match(attachmentPattern) || [];
    
    const dangerousAttachments = attachments.filter(att => 
      dangerousExtensions.some(ext => att.toLowerCase().includes(ext))
    );
    
    checks.attachments = {
      total: attachments.length,
      dangerous: dangerousAttachments.length,
      list: attachments,
      message: dangerousAttachments.length > 0 
        ? `⚠️ ${dangerousAttachments.length} dangerous attachment(s)` 
        : attachments.length > 0 
          ? '✅ Attachments appear safe' 
          : 'ℹ️ No attachments'
    };
    
    if (dangerousAttachments.length > 0) {
      threatScore += dangerousAttachments.length * 20;
      warnings.push('Contains potentially dangerous attachments');
    }

    // ==========================================
    // 7. GRAMMAR & LANGUAGE QUALITY
    // ==========================================
    const grammarIssues = [];
    
    if (/dear (sir|madam|customer|user|friend)/i.test(emailContent)) {
      grammarIssues.push('Generic greeting (not personalized)');
      threatScore += 5;
    }
    
    if (/\b(?:kindly|do the needful|greetings of the day)\b/i.test(emailContent)) {
      grammarIssues.push('Common scam phrases');
      threatScore += 10;
    }
    
    // Count spelling/grammar errors (simple check)
    const commonErrors = [
      'informations', 'your\'s', 'their\'s', 'recieve', 'accomodate',
      'occassion', 'untill', 'tomorow', 'goverment', 'offical'
    ];
    const foundErrors = commonErrors.filter(err => emailContent.toLowerCase().includes(err));
    
    if (foundErrors.length > 0) {
      grammarIssues.push(`${foundErrors.length} spelling/grammar errors`);
      threatScore += foundErrors.length * 3;
    }
    
    checks.grammar = {
      issues: grammarIssues,
      message: grammarIssues.length > 0 
        ? `⚠️ ${grammarIssues.length} language quality issues` 
        : '✅ Good language quality'
    };

    // ==========================================
    // 8. REQUEST FOR SENSITIVE INFO
    // ==========================================
    const sensitivePatterns = [
      { pattern: /password/i, weight: 20, label: 'Password request' },
      { pattern: /credit card/i, weight: 25, label: 'Credit card request' },
      { pattern: /social security/i, weight: 30, label: 'SSN request' },
      { pattern: /bank account/i, weight: 25, label: 'Bank account request' },
      { pattern: /date of birth/i, weight: 15, label: 'DOB request' },
      { pattern: /mother.*maiden/i, weight: 20, label: 'Security question' },
      { pattern: /pin.*number/i, weight: 25, label: 'PIN request' }
    ];
    
    const foundSensitive = sensitivePatterns.filter(p => p.pattern.test(emailContent));
    
    checks.sensitiveInfo = {
      detected: foundSensitive.length > 0,
      patterns: foundSensitive.map(p => p.label),
      message: foundSensitive.length > 0 
        ? `⚠️ Requests ${foundSensitive.length} types of sensitive information` 
        : '✅ No sensitive info requested'
    };
    
    if (foundSensitive.length > 0) {
      threatScore += foundSensitive.reduce((sum, p) => sum + p.weight, 0);
      warnings.push('Requests sensitive personal/financial information');
    }

    // ==========================================
    // FINAL SCORE CALCULATION
    // ==========================================
    threatScore = Math.min(100, threatScore);
    
    const riskLevel = 
      threatScore >= 70 ? 'Critical - Likely Phishing' :
      threatScore >= 50 ? 'Suspicious' :
      threatScore >= 30 ? 'Caution' :
      'Safe';

    let explanation;
    if (threatScore >= 70) {
      explanation = '🚨 CRITICAL: This email shows strong phishing indicators. Do NOT click any links, download attachments, or respond. Report and delete immediately.';
    } else if (threatScore >= 50) {
      explanation = '⚠️ SUSPICIOUS: Several red flags detected. If this claims to be from a company you use, contact them directly through their official website. Do not use links or phone numbers in this email.';
    } else if (threatScore >= 30) {
      explanation = '🔶 CAUTION: Some suspicious elements found. Exercise caution and verify the sender\'s identity through other means before taking any action.';
    } else {
      explanation = '✅ This email appears to be legitimate. No significant threats detected. Still, always be cautious with unexpected emails.';
    }

    const result = {
      threatScore,
      riskLevel,
      explanation,
      checks,
      warnings,
      details: {
        totalPatternsChecked: Object.keys(checks).length,
        warningsCount: warnings.length,
        analyzedAt: new Date().toISOString()
      }
    };

    console.log(`✅ Email Analysis Complete - Threat Score: ${threatScore}/100`);
    console.log(`   Risk Level: ${riskLevel}`);
    console.log(`   Warnings: ${warnings.length}\n`);

    return res.status(200).json(result);

  } catch (error) {
    console.error('❌ Email Analysis Failed:', error);
    return res.status(500).json({
      threatScore: 0,
      riskLevel: 'Error',
      explanation: 'Could not analyze email. Please try again.',
      error: error.message
    });
  }
}