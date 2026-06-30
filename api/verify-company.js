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

  const { companyName, website, jobOffer } = req.body;
  
  if (!companyName) {
    return res.status(400).json({ error: 'Company name is required' });
  }

  console.log(`\n🏢 VERIFYING COMPANY: ${companyName}\n`);

  try {
    let trustScore = 50; // Start neutral
    const checks = {};
    const details = {};
    const warnings = [];
    const recommendations = [];

    // ==========================================
    // 1. KNOWN LEGITIMATE COMPANIES DATABASE
    // ==========================================
    const knownCompanies = {
      'google': { domain: 'google.com', type: 'Technology', founded: 1998, employees: '100,000+' },
      'amazon': { domain: 'amazon.com', type: 'E-commerce', founded: 1994, employees: '1,500,000+' },
      'microsoft': { domain: 'microsoft.com', type: 'Technology', founded: 1975, employees: '220,000+' },
      'apple': { domain: 'apple.com', type: 'Technology', founded: 1976, employees: '160,000+' },
      'facebook': { domain: 'facebook.com', type: 'Social Media', founded: 2004, employees: '86,000+' },
      'meta': { domain: 'meta.com', type: 'Technology', founded: 2004, employees: '86,000+' },
      'tesla': { domain: 'tesla.com', type: 'Automotive', founded: 2003, employees: '127,000+' },
      'netflix': { domain: 'netflix.com', type: 'Entertainment', founded: 1997, employees: '12,000+' },
      'paypal': { domain: 'paypal.com', type: 'Finance', founded: 1998, employees: '29,000+' },
      'linkedin': { domain: 'linkedin.com', type: 'Professional', founded: 2002, employees: '20,000+' },
      'twitter': { domain: 'twitter.com', type: 'Social Media', founded: 2006, employees: '7,500+' },
      'x': { domain: 'x.com', type: 'Social Media', founded: 2006, employees: '7,500+' },
      'uber': { domain: 'uber.com', type: 'Transportation', founded: 2009, employees: '32,000+' },
      'airbnb': { domain: 'airbnb.com', type: 'Hospitality', founded: 2008, employees: '6,000+' },
      'spotify': { domain: 'spotify.com', type: 'Music', founded: 2006, employees: '9,000+' },
      'stripe': { domain: 'stripe.com', type: 'Finance', founded: 2010, employees: '7,000+' },
      'shopify': { domain: 'shopify.com', type: 'E-commerce', founded: 2006, employees: '10,000+' },
      'zoom': { domain: 'zoom.us', type: 'Technology', founded: 2011, employees: '8,000+' },
      'slack': { domain: 'slack.com', type: 'Technology', founded: 2013, employees: '2,500+' },
      'github': { domain: 'github.com', type: 'Technology', founded: 2008, employees: '3,000+' }
    };

    const companyLower = companyName.toLowerCase();
    const knownCompany = Object.entries(knownCompanies).find(([key]) => 
      companyLower.includes(key)
    );

    if (knownCompany) {
      const [name, info] = knownCompany;
      checks.knownCompany = {
        verified: true,
        name: name,
        officialDomain: info.domain,
        type: info.type,
        founded: info.founded,
        employees: info.employees,
        message: `✅ Verified company: ${name.charAt(0).toUpperCase() + name.slice(1)} (since ${info.founded})`
      };
      trustScore += 40;
      details.officialInfo = info;
      recommendations.push(`Visit official website: https://${info.domain}`);
      recommendations.push(`Check official career page for job listings`);
    } else {
      checks.knownCompany = {
        verified: false,
        message: 'Not in verified companies database'
      };
    }

    // ==========================================
    // 2. WEBSITE VERIFICATION (if provided)
    // ==========================================
    if (website) {
      try {
        const url = website.startsWith('http') ? website : `https://${website}`;
        const hostname = new URL(url).hostname;
        
        // Check if website exists (basic check)
        try {
          const siteResponse = await axios.get(url, { 
            timeout: 5000,
            validateStatus: status => status < 500
          });
          
          checks.website = {
            accessible: true,
            statusCode: siteResponse.status,
            url: url,
            message: '✅ Website is accessible'
          };
          trustScore += 10;
        } catch (e) {
          checks.website = {
            accessible: false,
            message: '⚠️ Website is not accessible'
          };
          warnings.push('Provided website is not reachable');
          trustScore -= 15;
        }

        // Check for suspicious patterns
        const suspiciousPatterns = [
          { pattern: /free|win|prize|bonus|reward/i, label: 'Promotional keywords' },
          { pattern: /login|signin|verify|confirm/i, label: 'Login/verify focus' },
          { pattern: /urgent|limited|exclusive|act now/i, label: 'Urgency tactics' }
        ];

        const foundPatterns = suspiciousPatterns.filter(p => p.pattern.test(website));
        if (foundPatterns.length > 0) {
          checks.websitePatterns = {
            issues: foundPatterns.map(p => p.label),
            message: `⚠️ Suspicious website patterns: ${foundPatterns.map(p => p.label).join(', ')}`
          };
          trustScore -= foundPatterns.length * 5;
          warnings.push('Website URL contains suspicious patterns');
        }

        // WHOIS lookup if API key available
        if (process.env.VITE_WHOISXML_API_KEY) {
          try {
            const whoisResponse = await axios.get(
              'https://www.whoisxmlapi.com/whoisserver/WhoisService',
              {
                params: {
                  apiKey: process.env.VITE_WHOISXML_API_KEY,
                  domainName: hostname,
                  outputFormat: 'JSON'
                }
              }
            );

            const whoisData = whoisResponse.data.WhoisRecord || {};
            if (whoisData.createdDate) {
              const domainAge = Math.floor(
                (Date.now() - new Date(whoisData.createdDate).getTime()) / (1000 * 60 * 60 * 24)
              );
              
              checks.domainAge = {
                days: domainAge,
                years: Math.floor(domainAge / 365),
                createdDate: whoisData.createdDate,
                registrar: whoisData.registrarName,
                message: domainAge < 90 
                  ? `⚠️ Domain only ${domainAge} days old` 
                  : `✅ Domain is ${Math.floor(domainAge / 365)} years old`
              };

              if (domainAge < 90) {
                trustScore -= 15;
                warnings.push(`Domain registered only ${domainAge} days ago`);
              } else if (domainAge > 365) {
                trustScore += 10;
              }
            }
          } catch (whoisError) {
            console.error('WHOIS error:', whoisError.message);
          }
        }

      } catch (e) {
        checks.website = {
          valid: false,
          message: '⚠️ Invalid website URL'
        };
        trustScore -= 10;
      }
    }

    // ==========================================
    // 3. JOB OFFER ANALYSIS
    // ==========================================
    if (jobOffer) {
      const jobChecks = {};
      
      // Check for unrealistic salary
      const salaryPatterns = [
        { pattern: /\$\d{3,5}\s*\/\s*day/i, label: 'Daily pay (unusual)' },
        { pattern: /earn.*\d{4,}.*(?:weekly|monthly)/i, label: 'High earnings promise' },
        { pattern: /\$\d{2,3}\s*\/\s*hour/i, label: 'Hourly rate' },
        { pattern: /no experience (?:required|needed|necessary)/i, label: 'No experience needed' },
        { pattern: /work from home/i, label: 'Work from home' },
        { pattern: /flexible hours/i, label: 'Flexible hours' },
        { pattern: /immediate start/i, label: 'Immediate hiring' },
        { pattern: /training provided/i, label: 'Training provided' },
        { pattern: /daily payout/i, label: 'Daily payment' },
        { pattern: /earn up to/i, label: 'Uncapped earnings' }
      ];

      const foundSalaryPatterns = salaryPatterns.filter(p => p.pattern.test(jobOffer));
      
      jobChecks.redFlags = {
        count: foundSalaryPatterns.length,
        patterns: foundSalaryPatterns.map(p => p.label),
        message: foundSalaryPatterns.length > 3 
          ? `⚠️ ${foundSalaryPatterns.length} job scam indicators` 
          : foundSalaryPatterns.length > 0 
            ? '⚠️ Some job offer concerns' 
            : '✅ Job offer looks normal'
      };

      if (foundSalaryPatterns.length > 3) {
        trustScore -= 20;
        warnings.push('Multiple job scam red flags detected');
        recommendations.push('Research the company independently before applying');
        recommendations.push('Never pay money for a job opportunity');
        recommendations.push('Legitimate companies don\'t ask for bank details upfront');
      } else if (foundSalaryPatterns.length > 1) {
        trustScore -= 10;
        warnings.push('Some job offer concerns');
      }

      // Check for scam job keywords
      const scamJobKeywords = [
        'data entry', 'package handler', 'reshipping', 'money transfer agent',
        'payment processor', 'mystery shopper', 'envelope stuffer',
        'bitcoin trader', 'crypto trader', 'investment advisor'
      ];

      const foundScamKeywords = scamJobKeywords.filter(kw => 
        jobOffer.toLowerCase().includes(kw)
      );

      if (foundScamKeywords.length > 0) {
        jobChecks.scamKeywords = {
          found: foundScamKeywords,
          message: `⚠️ Known scam job keywords: ${foundScamKeywords.join(', ')}`
        };
        trustScore -= foundScamKeywords.length * 10;
        warnings.push('Job title matches known scam patterns');
      }

      checks.jobOffer = jobChecks;
    }

    // ==========================================
    // 4. SOCIAL MEDIA PRESENCE CHECK
    // ==========================================
    if (knownCompany && knownCompany[0]) {
      const company = knownCompany[0];
      checks.socialMedia = {
        linkedin: `https://linkedin.com/company/${company}`,
        message: '✅ Check official social media profiles'
      };
      recommendations.push(`Verify on LinkedIn: linkedin.com/company/${company}`);
    } else {
      checks.socialMedia = {
        message: '⚠️ Could not verify social media presence'
      };
      warnings.push('Limited online presence - verify carefully');
      recommendations.push('Search for the company on LinkedIn');
      recommendations.push('Check for employee reviews on Glassdoor');
      recommendations.push('Look for Better Business Bureau (BBB) rating');
    }

    // ==========================================
    // 5. SCAM DATABASE CHECK
    // ==========================================
    const scamIndicators = [
      'get rich quick', 'make money fast', 'passive income',
      'investment opportunity', 'guaranteed returns', 'risk free',
      'secret method', 'exclusive access', 'limited spots',
      'act now', 'don\'t miss', 'once in a lifetime'
    ];

    const foundScamIndicators = scamIndicators.filter(indicator =>
      companyName.toLowerCase().includes(indicator) ||
      (jobOffer && jobOffer.toLowerCase().includes(indicator))
    );

    checks.scamDatabase = {
      indicators: foundScamIndicators,
      message: foundScamIndicators.length > 0 
        ? `⚠️ ${foundScamIndicators.length} scam indicators found` 
        : '✅ No known scam indicators'
    };

    if (foundScamIndicators.length > 0) {
      trustScore -= foundScamIndicators.length * 10;
      warnings.push('Company/job matches known scam patterns');
    }

    // ==========================================
    // FINAL SCORE
    // ==========================================
    trustScore = Math.max(0, Math.min(100, Math.round(trustScore)));

    const riskLevel = 
      trustScore >= 80 ? 'Verified ✅' :
      trustScore >= 60 ? 'Likely Legitimate' :
      trustScore >= 40 ? 'Uncertain ⚠️' :
      trustScore >= 20 ? 'Suspicious 🔴' :
      'Likely Scam 🚨';

    let verdict;
    if (trustScore >= 80) {
      verdict = 'This company appears to be legitimate and verified.';
    } else if (trustScore >= 60) {
      verdict = 'This company seems legitimate but we couldn\'t fully verify all details. Proceed with normal caution.';
    } else if (trustScore >= 40) {
      verdict = 'We couldn\'t verify this company. Exercise caution and do additional research before engaging.';
    } else if (trustScore >= 20) {
      verdict = 'Multiple warning signs detected. This may be a scam. Verify through official channels before proceeding.';
    } else {
      verdict = 'Strong indicators of a scam. Do not provide personal information or money. Report this if you\'ve been contacted.';
    }

    const result = {
      companyName,
      trustScore,
      riskLevel,
      verdict,
      checks,
      details,
      warnings,
      recommendations,
      verifiedAt: new Date().toISOString()
    };

    console.log(`✅ Company Verification Complete`);
    console.log(`   ${companyName}: ${trustScore}/100 - ${riskLevel}\n`);

    return res.status(200).json(result);

  } catch (error) {
    console.error('❌ Company Verification Failed:', error);
    return res.status(500).json({
      trustScore: 0,
      riskLevel: 'Error',
      verdict: 'Could not verify company. Please try again.',
      error: error.message
    });
  }
}