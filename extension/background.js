// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
      // Only check http/https pages
      if (tab.url.startsWith('http://') || tab.url.startsWith('https://')) {
        checkWebsiteSafety(tabId, tab.url);
      }
    }
  });
  
  // Check website safety
  async function checkWebsiteSafety(tabId, url) {
    try {
      // Quick local check
      const result = quickCheck(url);
      
      // Store result
      chrome.storage.local.set({ [url]: result });
      
      // Update badge
      const score = result.score;
      let badgeText = '✓';
      let badgeColor = '#10b981';
      
      if (score < 60) {
        badgeText = '!';
        badgeColor = '#ef4444';
      } else if (score < 80) {
        badgeText = '⚠';
        badgeColor = '#f59e0b';
      }
      
      chrome.action.setBadgeText({ text: badgeText, tabId });
      chrome.action.setBadgeBackgroundColor({ color: badgeColor, tabId });
      
      // Notify if dangerous
      if (score < 40) {
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icons/icon128.png',
          title: '⚠️ Dangerous Website Detected',
          message: 'TrustShield AI found security risks on this website.',
          priority: 2
        });
      }
      
    } catch (error) {
      console.error('Safety check error:', error);
    }
  }
  
  // Quick local check
  function quickCheck(url) {
    let score = 70;
    
    if (url.startsWith('https://')) score += 15;
    
    try {
      const hostname = new URL(url).hostname;
      const suspiciousTLDs = ['.tk', '.ml', '.ga', '.cf', '.xyz', '.top', '.gq'];
      if (suspiciousTLDs.some(tld => hostname.endsWith(tld))) score -= 25;
      if (hostname.length > 30) score -= 10;
    } catch {
      score -= 20;
    }
    
    return { score: Math.max(0, Math.min(100, score)), checkedAt: Date.now() };
  }
  
  // Handle messages from popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'scanUrl') {
      const result = quickCheck(request.url);
      sendResponse(result);
    }
    return true;
  });