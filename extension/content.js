// Show floating badge on websites
function showTrustBadge(score, url) {
    // Remove existing badge
    const existingBadge = document.getElementById('trustshield-badge');
    if (existingBadge) existingBadge.remove();
    
    // Create badge
    const badge = document.createElement('div');
    badge.id = 'trustshield-badge';
    badge.innerHTML = `
      <div class="ts-badge ${score >= 80 ? 'ts-safe' : score >= 60 ? 'ts-warning' : 'ts-danger'}">
        <span class="ts-icon">${score >= 80 ? '🛡️' : score >= 60 ? '⚠️' : '🚨'}</span>
        <span class="ts-score">${score}/100</span>
      </div>
    `;
    
    badge.addEventListener('click', () => {
      chrome.runtime.sendMessage({ action: 'openPopup' });
    });
    
    document.body.appendChild(badge);
  }
  
  // Check current site
  async function checkCurrentSite() {
    const url = window.location.href;
    
    chrome.storage.local.get([url], (result) => {
      if (result[url]) {
        showTrustBadge(result[url].score, url);
      }
    });
  }
  
  // Run on page load
  checkCurrentSite();
  
  // Listen for messages from extension
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getUrl') {
      sendResponse({ url: window.location.href });
    }
    return true;
  });