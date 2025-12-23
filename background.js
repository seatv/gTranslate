// background.js - Service worker for the extension

// Initialize default settings
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({
    fromLang: 'ko',
    toLang: 'en',
    autoTranslate: false,
    autoTranslateDomains: ['.kr']
  });
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'updateIcon') {
    updateIcon(sender.tab.id, message.status);
    sendResponse({ success: true }); // Send response
  } else if (message.type === 'checkAutoTranslate') {
    checkAutoTranslate(message.url, sender.tab.id);
    sendResponse({ success: true }); // Send response
  }
  return true; // Keep channel open for async responses
});

// Update extension icon based on status
function updateIcon(tabId, status) {
  const iconPaths = {
    gray: {
      "16": "icons/icon-gray-16.png",
      "48": "icons/icon-gray-48.png",
      "128": "icons/icon-gray-128.png"
    },
    red: {
      "16": "icons/icon-red-16.png",
      "48": "icons/icon-red-48.png",
      "128": "icons/icon-red-128.png"
    },
    green: {
      "16": "icons/icon-green-16.png",
      "48": "icons/icon-green-48.png",
      "128": "icons/icon-green-128.png"
    }
  };

  chrome.action.setIcon({
    tabId: tabId,
    path: iconPaths[status] || iconPaths.gray
  });
}

// Check if page should be auto-translated
async function checkAutoTranslate(url, tabId) {
  console.log('[Translator BG] checkAutoTranslate called for:', url);
  
  const settings = await chrome.storage.sync.get(['autoTranslate', 'autoTranslateDomains', 'fromLang', 'toLang']);
  
  console.log('[Translator BG] Settings:', settings);
  
  if (!settings.autoTranslate || !settings.autoTranslateDomains) {
    console.log('[Translator BG] Auto-translate disabled or no domains configured');
    return;
  }

  // Check if URL matches any of the auto-translate domains
  const shouldTranslate = settings.autoTranslateDomains.some(domain => {
    const matches = url.includes(domain);
    console.log('[Translator BG] Checking domain:', domain, 'matches:', matches);
    return matches;
  });

  console.log('[Translator BG] Should translate:', shouldTranslate);

  if (shouldTranslate) {
    console.log('[Translator BG] Sending auto-translate message to tab:', tabId);
    // Send message to content script to translate
    chrome.tabs.sendMessage(tabId, {
      type: 'autoTranslate',
      fromLang: settings.fromLang,
      toLang: settings.toLang
    }, (response) => {
      if (chrome.runtime.lastError) {
        // Content script might not be ready yet, ignore error
        console.log('[Translator BG] Auto-translate message error:', chrome.runtime.lastError.message);
      } else {
        console.log('[Translator BG] Auto-translate message sent successfully');
      }
    });
  }
}

// Listen for tab updates to check auto-translate
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    checkAutoTranslate(tab.url, tabId);
  }
});