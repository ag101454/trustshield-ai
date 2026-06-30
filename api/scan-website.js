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

  const { url } = req.body;
  
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  // Normalize URL
  let scanUrl = url;
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    scanUrl = 'https://' + url;
  }

  console.log(`\n🔍 SCANNING: ${scanUrl}\n`);

  try {
    let finalScore = 0;
    let maxPossibleScore = 0;
    const checks = {};
    const details = {};
    const apiResults = [];

    // ==========================================
    // 1️⃣ VIRUSTOTAL CHECK (70+ engines)
    // ==========================================
    if (process.env.VITE_VIRUSTOTAL_API_KEY) {
      try {
        console.log('[1/4] Checking VirusTotal...');
        
        const formData = new URLSearchParams();
        formData.append('url', scanUrl);
        
        const submitResponse = await axios.post(
          'https://www.virustotal.com/api/v3/urls',
          formData,
          {
            headers: {
              'x-apikey': process.env.VITE_VIRUSTOTAL_API_KEY,
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          }
        );

        const analysisId = submitResponse.data.data.id;
        console.log(`  Analysis ID: ${analysisId}`);

        // Wait for analysis
        await new Promise(resolve => setTimeout(resolve, 15000));

        // Get results
        const analysisResponse = await axios.get(
          `https://www.virustotal.com/api/v3/analyses/${analysisId}`,
          {
            headers: {
              'x-apikey': process.env.VITE_VIRUSTOTAL_API_KEY
            }
          }
        );

        const stats = analysisResponse.data.data.attributes.stats;
        const malicious = stats.malicious || 0;
        const suspicious = stats.suspicious || 0;
        const harmless = stats.harmless || 0;
        const undetected = stats.undetected || 0;
        const total = malicious + suspicious + harmless + undetected;

        const isClean = malicious === 0 && suspicious === 0;

        checks.virusTotal = {
          passed: isClean,
          totalEngines: total,
          malicious,
          suspicious,
          harmless,
          undetected,
          message: isClean 
            ? `✅ Clean - All ${total} engines passed`
            : `⚠️ ${malicious} engines detected threats, ${suspicious} flagged suspicious`
        };

        maxPossibleScore += 30;
        if (isClean) finalScore += 30;
        else if (malicious <= 2) finalScore += 15;
        else finalScore += 0;

        details.virusTotalLink = `https://www.virustotal.com/gui/url/${analysisId}`;
        apiResults.push('VirusTotal ✅');
        
        console.log(`  Result: ${malicious} malicious, ${suspicious} suspicious`);
      } catch (error) {
        console.error('  VirusTotal Error:', error.response?.status, error.message);
        checks.virusTotal = {
          passed: null,
          error: true,
          message: 'VirusTotal check unavailable'
        };
        apiResults.push('VirusTotal ❌');
      }
    }

    // ==========================================
    // 2️⃣ GOOGLE SAFE BROWSING CHECK
    // ==========================================
    if (process.env.VITE_GOOGLE_SAFE_BROWSING_KEY) {
      try {
        console.log('[2/4] Checking Google Safe Browsing...');
        
        const gsbResponse = await axios.post(
          `https://webrisk.googleapis.com/v1/urls:search?key=${process.env.VITE_GOOGLE_SAFE_BROWSING_KEY}`,
          {
            uri: scanUrl,
            threatTypes: [
              "MALWARE",
              "SOCIAL_ENGINEERING",
              "UNWANTED_SOFTWARE"
            ]
          },
          {
            headers: { 'Content-Type': 'application/json' }
          }
        );

        const threats = gsbResponse.data.threat || [];
        const isClean = threats.length === 0;

        checks.googleSafeBrowsing = {
          passed: isClean,
          threatsFound: threats.length,
          threatTypes: threats.map(t => t.threatType),
          message: isClean 
            ? '✅ Not in Google threat database'
            : `⚠️ Google detected: ${threats.map(t => t.threatType).join(', ')}`
        };

        maxPossibleScore += 25;
        if (isClean) {
          finalScore += 25;
        } else {
          if (threats.some(t => t.threatType === 'MALWARE')) finalScore -= 10;
          if (threats.some(t => t.threatType === 'SOCIAL_ENGINEERING')) finalScore -= 10;
        }

        if (!isClean) {
          details.googleThreats = threats;
        }

        apiResults.push('Google Safe Browsing ✅');
        console.log(`  Result: ${isClean ? 'Clean' : threats.length + ' threats found'}`);
      } catch (error) {
        console.error('  Google Safe Browsing Error:', error.response?.status, error.message);
        checks.googleSafeBrowsing = {
          passed: null,
          error: true,
          message: 'Google check unavailable'
        };
        apiResults.push('Google Safe Browsing ❌');
      }
    }

    // ==========================================
    // 3️⃣ URLSCAN.IO CHECK
    // ==========================================
    if (process.env.VITE_URLSCAN_API_KEY) {
      try {
        console.log('[3/4] Submitting to URLScan.io...');
        
        const urlscanSubmit = await axios.post(
          'https://urlscan.io/api/v1/scan/',
          {
            url: scanUrl,
            visibility: 'public',
            tags: ['trustshield-scan']
          },
          {
            headers: {
              'API-Key': process.env.VITE_URLSCAN_API_KEY,
              'Content-Type': 'application/json'
            }
          }
        );

        const scanId = urlscanSubmit.data.uuid;
        console.log(`  Scan ID: ${scanId}`);

        // Poll for results
        let urlscanResult = null;
        for (let i = 0; i < 12; i++) {
          await new Promise(resolve => setTimeout(resolve, 5000));
          
          try {
            const resultResponse = await axios.get(
              `https://urlscan.io/api/v1/result/${scanId}/`,
              {
                headers: { 'API-Key': process.env.VITE_URLSCAN_API_KEY }
              }
            );

            if (resultResponse.data && resultResponse.data.verdicts) {
              urlscanResult = resultResponse.data;
              break;
            }
          } catch (pollError) {
            continue;
          }
        }

        if (urlscanResult) {
          const verdicts = urlscanResult.verdicts || {};
          const overallVerdict = verdicts.overall || {};
          const page = urlscanResult.page || {};
          
          const isMalicious = overallVerdict.malicious || false;
          const score = overallVerdict.score || 0;

          checks.urlScan = {
            passed: !isMalicious && score >= 0,
            score: score,
            malicious: isMalicious,
            ipAddress: page.ip,
            server: page.server,
            country: page.country,
            screenshot: urlscanResult.screenshot || null,
            reportUrl: `https://urlscan.io/result/${scanId}/`,
            message: isMalicious 
              ? '⚠️ URLScan flagged as malicious'
              : score < 0 
                ? '⚠️ Low reputation score'
                : '✅ URLScan analysis passed'
          };

          maxPossibleScore += 15;
          if (!isMalicious && score >= 0) finalScore += 15;
          else if (score >= -10) finalScore += 5;

          if (urlscanResult.screenshot) {
            details.screenshot = urlscanResult.screenshot;
          }
          details.urlScanReport = `https://urlscan.io/result/${scanId}/`;

          apiResults.push('URLScan ✅');
          console.log(`  Result: ${isMalicious ? 'Malicious' : 'Clean'}, Score: ${score}`);
        }
      } catch (error) {
        console.error('  URLScan Error:', error.response?.status, error.message);
        checks.urlScan = {
          passed: null,
          error: true,
          message: 'URLScan check unavailable'
        };
        apiResults.push('URLScan ❌');
      }
    }

    // ==========================================
    // 4️⃣ WHOIS DOMAIN CHECK
    // ==========================================
    if (process.env.VITE_WHOISXML_API_KEY) {
      try {
        console.log('[4/4] Checking WHOIS domain info...');
        
        const hostname = new URL(scanUrl).hostname;
        
        const whoisResponse = await axios.get(
          `https://www.whoisxmlapi.com/whoisserver/WhoisService`,
          {
            params: {
              apiKey: process.env.VITE_WHOISXML_API_KEY,
              domainName: hostname,
              outputFormat: 'JSON'
            }
          }
        );

        const whoisData = whoisResponse.data.WhoisRecord || {};
        const createdDate = whoisData.createdDate;
        const expiresDate = whoisData.expiresDate;
        const registrar = whoisData.registrarName || 'Unknown';
        
        let domainAgeDays = 0;
        if (createdDate) {
          domainAgeDays = Math.floor(
            (Date.now() - new Date(createdDate).getTime()) / (1000 * 60 * 60 * 24)
          );
        }

        const isNewDomain = domainAgeDays < 30;
        const isExpiringSoon = expiresDate && 
          (new Date(expiresDate).getTime() - Date.now()) < 30 * 24 * 60 * 60 * 1000;

        checks.whois = {
          passed: !isNewDomain && !isExpiringSoon,
          registrar: registrar,
          createdDate: createdDate,
          expiresDate: expiresDate,
          domainAgeDays: domainAgeDays,
          domainAgeYears: Math.floor(domainAgeDays / 365),
          isNewDomain: isNewDomain,
          isExpiringSoon: isExpiringSoon,
          message: isNewDomain 
            ? `⚠️ Domain only ${domainAgeDays} days old - very suspicious`
            : isExpiringSoon
              ? '⚠️ Domain expiring soon'
              : `✅ Domain is ${Math.floor(domainAgeDays / 365)} years old`
        };

        maxPossibleScore += 15;
        if (!isNewDomain && domainAgeDays > 365) {
          finalScore += 15;
        } else if (domainAgeDays > 90) {
          finalScore += 10;
        } else if (domainAgeDays > 30) {
          finalScore += 5;
        }

        details.whois = {
          registrar,
          createdDate,
          expiresDate,
          domainAge: `${Math.floor(domainAgeDays / 365)} years, ${domainAgeDays % 365} days`
        };

        apiResults.push('WHOIS ✅');
        console.log(`  Domain age: ${domainAgeDays} days (${Math.floor(domainAgeDays / 365)} years)`);
      } catch (error) {
        console.error('  WHOIS Error:', error.response?.status, error.message);
        checks.whois = {
          passed: null,
          error: true,
          message: 'WHOIS lookup unavailable'
        };
        apiResults.push('WHOIS ❌');
      }
    }

    // ==========================================
    // 5️⃣ LOCAL CHECKS (Always run)
    // ==========================================
    try {
      // SSL Check
      const hasSSL = scanUrl.startsWith('https://');
      checks.ssl = {
        passed: hasSSL,
        message: hasSSL ? '✅ SSL Certificate valid' : '❌ No HTTPS encryption'
      };
      maxPossibleScore += 15;
      if (hasSSL) finalScore += 15;

      // Domain Analysis
      const hostname = new URL(scanUrl).hostname;
      const suspiciousTLDs = ['.tk', '.ml', '.ga', '.cf', '.xyz', '.top', '.gq', '.info', '.loan', '.work'];
      const hasSuspiciousTLD = suspiciousTLDs.some(tld => hostname.endsWith(tld));
      const isIPAddress = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname);
      const hasManyHyphens = (hostname.match(/-/g) || []).length > 3;

      checks.domain = {
        passed: !hasSuspiciousTLD && !isIPAddress && !hasManyHyphens,
        hostname: hostname,
        issues: {
          suspiciousTLD: hasSuspiciousTLD,
          ipAddress: isIPAddress,
          tooManyHyphens: hasManyHyphens
        },
        message: hasSuspiciousTLD 
          ? `⚠️ Suspicious TLD: ${hostname.match(/\.[a-z]+$/)[0]}`
          : isIPAddress
            ? '⚠️ Uses IP address instead of domain'
            : hasManyHyphens
              ? '⚠️ Excessive hyphens in domain'
              : '✅ Domain looks legitimate'
      };

      maxPossibleScore += 15;
      if (!hasSuspiciousTLD && !isIPAddress) finalScore += 15;
      else if (!isIPAddress) finalScore += 5;

    } catch (e) {
      checks.local = { passed: false, error: 'Could not parse URL' };
    }

    // ==========================================
    // CALCULATE FINAL SCORE
    // ==========================================
    const trustScore = Math.max(0, Math.min(100, Math.round((finalScore / maxPossibleScore) * 100)));

    const riskLevel = 
      trustScore >= 80 ? 'Safe ✅' :
      trustScore >= 60 ? 'Low Risk' :
      trustScore >= 40 ? 'Suspicious ⚠️' :
      trustScore >= 20 ? 'High Risk 🔴' :
      'Dangerous 🚨';

    // Generate AI-style explanation
    const explanation = generateSmartExplanation(trustScore, checks);

    const result = {
      trustScore,
      riskLevel,
      explanation,
      checks,
      details,
      apisChecked: apiResults,
      scannedUrl: scanUrl,
      scannedAt: new Date().toISOString()
    };

    console.log(`\n✅ SCAN COMPLETE: ${scanUrl}`);
    console.log(`   Score: ${trustScore}/100 - ${riskLevel}`);
    console.log(`   APIs: ${apiResults.join(', ')}\n`);

    return res.status(200).json(result);

  } catch (error) {
    console.error('❌ Scan failed:', error.message);
    return res.status(500).json({
      trustScore: 0,
      riskLevel: 'Error',
      explanation: 'Could not complete scan. Please try again.',
      checks: {},
      error: error.message
    });
  }
}

function generateSmartExplanation(score, checks) {
  const issues = [];
  
  if (checks.virusTotal?.passed === false) {
    issues.push(`${checks.virusTotal.malicious} security engines flagged this site`);
  }
  if (checks.googleSafeBrowsing?.passed === false) {
    issues.push(`Google detected: ${checks.googleSafeBrowsing.threatTypes?.join(', ')}`);
  }
  if (checks.urlScan?.malicious) {
    issues.push('URLScan.io flagged as malicious');
  }
  if (checks.whois?.isNewDomain) {
    issues.push(`domain registered only ${checks.whois.domainAgeDays} days ago`);
  }
  if (checks.ssl?.passed === false) {
    issues.push('no HTTPS encryption');
  }
  if (checks.domain?.passed === false) {
    issues.push('suspicious domain characteristics');
  }

  if (score >= 80) {
    return '✅ This website appears safe. All major security services found no threats.';
  } else if (score >= 60) {
    return `⚠️ Mostly safe, but some concerns: ${issues.slice(0, 2).join('; ')}. Exercise normal caution.`;
  } else if (score >= 40) {
    return `🔶 Suspicious website detected. ${issues.slice(0, 3).join('. ')}. Be careful.`;
  } else if (score >= 20) {
    return `🔴 High risk website. ${issues.join('. ')}. We strongly recommend avoiding this site.`;
  } else {
    return `🚨 DANGEROUS website! ${issues.join('. ')}. Do not visit or share any information.`;
  }
}