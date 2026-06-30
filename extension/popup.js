// Get current tab URL
async function getCurrentTab() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return tab;
  }
  
  // Scan URL using TrustShield API
  async function scanUrl(url) {
    try {
      const response = await fetch('https://trustshield-ai.vercel.app/api/scan-website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      
      if (!response.ok) {
        // Fallback to local check
        return quickLocalScan(url);
      }
      
      return await response.json();
    } catch (error) {
      // If API not available, do local scan
      return quickLocalScan(url);
    }
  }
  
  // Quick local scan when API is not available
  function quickLocalScan(url) {
    let score = 70;
    const checks = {};
    
    // SSL Check
    const hasSSL = url.startsWith('https://');
    checks.ssl = { passed: hasSSL, message: hasSSL ? 'SSL valid' : 'No SSL' };
    score += hasSSL ? 15 : -15;
    
    // Domain check
    try {
      const hostname = new URL(url).hostname;
      const suspiciousTLDs = ['.tk', '.ml', '.ga', '.cf', '.xyz', '.top'];
      const hasSuspiciousTLD = suspiciousTLDs.some(tld => hostname.endsWith(tld));
      checks.domain = { passed: !hasSuspiciousTLD, message: hasSuspiciousTLD ? 'Suspicious TLD' : 'Domain OK' };
      score += hasSuspiciousTLD ? -20 : 10;
    } catch {
      checks.domain = { passed: false, message: 'Invalid URL' };
      score -= 20;
    }
    
    score = Math.max(0, Math.min(100, score));
    
    return {
      trustScore: score,
      riskLevel: score >= 80 ? 'Safe ✅' : score >= 60 ? 'Caution ⚠️' : 'Dangerous 🚨',
      checks,
      explanation: score >= 80 ? 'This site appears safe' : 'Exercise caution'
    };
  }
  
  // Update popup UI with results
  function updateUI(result, url) {
    document.getElementById('loading').classList.add('hidden');
    document.getElementById('result').classList.remove('hidden');
    
    const score = result.trustScore || 0;
    const scoreCircle = document.getElementById('scoreCircle');
    const scoreNumber = document.getElementById('scoreNumber');
    const status = document.getElementById('status');
    const urlDisplay = document.getElementById('urlDisplay');
    const checks = document.getElementById('checks');
    
    // Score
    scoreNumber.textContent = score;
    scoreCircle.className = 'score-circle ' + (
      score >= 80 ? 'safe' : score >= 60 ? 'warning' : 'danger'
    );
    
    // Status
    status.textContent = result.riskLevel || 'Unknown';
    status.className = 'status ' + (
      score >= 80 ? 'safe' : score >= 60 ? 'warning' : 'danger'
    );
    
    // URL
    try {
      urlDisplay.textContent = new URL(url).hostname;
    } catch {
      urlDisplay.textContent = url;
    }
    
    // Checks
    checks.innerHTML = '';
    if (result.checks) {
      Object.entries(result.checks).forEach(([key, check]) => {
        if (check && typeof check === 'object') {
          const div = document.createElement('div');
          div.className = 'check-item';
          div.innerHTML = `
            <span class="check-label">${key.replace(/([A-Z])/g, ' $1').trim()}</span>
            <span class="${check.passed ? 'check-passed' : 'check-failed'}">
              ${check.passed ? '✅' : '❌'}
            </span>
          `;
          checks.appendChild(div);
        }
      });
    }
  }
  
  // Show error
  function showError() {
    document.getElementById('loading').classList.add('hidden');
    document.getElementById('error').classList.remove('hidden');
  }
  
  // Initialize popup
  async function init() {
    const tab = await getCurrentTab();
    const url = tab.url;
    
    // Don't scan chrome:// or extension pages
    if (url.startsWith('chrome://') || url.startsWith('chrome-extension://')) {
      document.getElementById('loading').classList.add('hidden');
      document.getElementById('error').classList.remove('hidden');
      return;
    }
    
    try {
      const result = await scanUrl(url);
      updateUI(result, url);
    } catch (error) {
      showError();
    }
  }
  
  // Event Listeners
  document.getElementById('btnRetry')?.addEventListener('click', () => {
    document.getElementById('error').classList.add('hidden');
    document.getElementById('loading').classList.remove('hidden');
    init();
  });
  
  document.getElementById('btnDetails')?.addEventListener('click', async () => {
    const tab = await getCurrentTab();
    const encodedUrl = encodeURIComponent(tab.url);
    chrome.tabs.create({ url: `https://trustshield-ai.vercel.app/dashboard` });
  });
  
  document.getElementById('btnReport')?.addEventListener('click', async () => {
    const tab = await getCurrentTab();
    chrome.tabs.create({ 
      url: `https://trustshield-ai.vercel.app/community` 
    });
  });
  
  document.getElementById('btnScan')?.addEventListener('click', async () => {
    const input = document.getElementById('scanUrl');
    const url = input.value.trim();
    
    if (!url) return;
    
    let scanUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      scanUrl = 'https://' + url;
    }
    
    chrome.tabs.create({ url: `https://trustshield-ai.vercel.app/dashboard` });
  });
  
  // Start
  init();