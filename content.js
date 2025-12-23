// content.js - Runs on every web page

let isTranslating = false;

// Detect page language and update icon
function detectPageLanguage() {
  const htmlLang = document.documentElement.lang;
  const detectedLang = htmlLang ? htmlLang.split('-')[0].toLowerCase() : null;
  
  chrome.storage.sync.get(['fromLang'], (settings) => {
    const targetLang = settings.fromLang || 'ko';
    
    let status = 'gray';
    if (detectedLang && detectedLang !== 'en' && detectedLang !== targetLang) {
      status = 'red';
    } else if (detectedLang === targetLang) {
      status = 'red';
    }
    
    chrome.runtime.sendMessage({ type: 'updateIcon', status: status }, (response) => {
      if (chrome.runtime.lastError) {
        console.log('Icon update message:', chrome.runtime.lastError.message);
      }
    });
  });
}

// Main translation function - SIMPLE VERSION
async function translatePageContent(fromLang, toLang) {
  console.log('[Translator] translatePageContent called:', { fromLang, toLang, isTranslating });
  
  // Allow re-translation (removed isTranslated check)
  if (isTranslating) {
    console.log('[Translator] Translation already in progress, please wait...');
    return;
  }

  isTranslating = true;
  console.log('[Translator] Starting translation...');
  
  try {
    showTranslationStatus('Translating...');
    
    const sourceLang = fromLang || 'auto';
    const targetLang = toLang || 'en';
    
    // Get all text nodes in the page
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: function(node) {
          if (node.parentElement.tagName === 'SCRIPT' || 
              node.parentElement.tagName === 'STYLE' ||
              node.parentElement.tagName === 'NOSCRIPT') {
            return NodeFilter.FILTER_REJECT;
          }
          if (node.nodeValue.trim().length > 0) {
            return NodeFilter.FILTER_ACCEPT;
          }
          return NodeFilter.FILTER_REJECT;
        }
      }
    );

    const textNodes = [];
    let node;
    while (node = walker.nextNode()) {
      textNodes.push(node);
    }

    console.log(`[Translator] Found ${textNodes.length} text nodes to translate`);

    const batchSize = 10;
    let translatedCount = 0;
    
    for (let i = 0; i < textNodes.length; i += batchSize) {
      const batch = textNodes.slice(i, i + batchSize);
      
      for (const textNode of batch) {
        const originalText = textNode.nodeValue.trim();
        if (originalText.length > 0) {
          const translatedText = await translateText(originalText, sourceLang, targetLang);
          if (translatedText && translatedText !== originalText) {
            textNode.nodeValue = textNode.nodeValue.replace(originalText, translatedText);
            translatedCount++;
          }
        }
      }
      
      const progress = Math.min(100, Math.round(((i + batchSize) / textNodes.length) * 100));
      showTranslationStatus(`Translating... ${progress}% (${translatedCount} translated)`);
      
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    isTranslating = false;
    showTranslationStatus(`Translation complete! (${translatedCount} items translated)`, true);
    chrome.runtime.sendMessage({ type: 'updateIcon', status: 'green' }, (response) => {
      if (chrome.runtime.lastError) {
        console.log('Icon update:', chrome.runtime.lastError.message);
      }
    });
    
  } catch (error) {
    console.error('[Translator] Translation error:', error);
    isTranslating = false;
    showTranslationStatus('Translation failed. Please try again.', false);
  }
}

// Translate text using Google Translate API
async function translateText(text, fromLang, toLang) {
  if (!text || text.trim().length === 0) return text;
  
  try {
    const googleResult = await translateWithGoogle(text, fromLang, toLang);
    if (googleResult) return googleResult;
  } catch (error) {
    console.log('Google Translate failed, trying MyMemory:', error);
  }
  
  try {
    const myMemoryResult = await translateWithMyMemory(text, fromLang, toLang);
    if (myMemoryResult) return myMemoryResult;
  } catch (error) {
    console.log('MyMemory failed:', error);
  }
  
  return text;
}

// Google Translate unofficial API
async function translateWithGoogle(text, fromLang, toLang) {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${fromLang}&tl=${toLang}&dt=t&q=${encodeURIComponent(text)}`;
  
  const response = await fetch(url);
  const data = await response.json();
  
  if (data && data[0] && data[0][0] && data[0][0][0]) {
    return data[0][0][0];
  }
  
  return null;
}

// MyMemory Translation API
async function translateWithMyMemory(text, fromLang, toLang) {
  const langPair = `${fromLang}|${toLang}`;
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langPair}`;
  
  const response = await fetch(url);
  const data = await response.json();
  
  if (data && data.responseData && data.responseData.translatedText) {
    return data.responseData.translatedText;
  }
  
  return null;
}

// Show translation status
function showTranslationStatus(message, isSuccess) {
  let statusDiv = document.getElementById('translation-status');
  
  if (!statusDiv) {
    statusDiv = document.createElement('div');
    statusDiv.id = 'translation-status';
    statusDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 20px;
      background-color: #333;
      color: white;
      border-radius: 5px;
      z-index: 999999;
      font-family: Arial, sans-serif;
      font-size: 14px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.3);
    `;
    document.body.appendChild(statusDiv);
  }
  
  statusDiv.textContent = message;
  
  if (isSuccess !== undefined) {
    statusDiv.style.backgroundColor = isSuccess ? '#34a853' : '#d93025';
    setTimeout(() => {
      statusDiv.remove();
    }, 3000);
  }
}

// Listen for messages from popup or background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[Translator] Message received:', message.type);
  
  if (message.type === 'translate' || message.type === 'autoTranslate') {
    console.log('[Translator] Translate triggered (manual or auto) for:', window.location.href);
    // SIMPLE: Both manual and auto use the same function
    translatePageContent(message.fromLang, message.toLang);
    sendResponse({ success: true });
  } else if (message.type === 'resetTranslation') {
    location.reload();
    sendResponse({ success: true });
  }
  return true;
});

// Check if page should be auto-translated on load
window.addEventListener('load', () => {
  console.log('[Translator] Page loaded, checking auto-translate');
  detectPageLanguage();
  
  // Notify background script to check auto-translate
  chrome.runtime.sendMessage({ 
    type: 'checkAutoTranslate', 
    url: window.location.href 
  }, (response) => {
    if (chrome.runtime.lastError) {
      console.log('Auto-translate check:', chrome.runtime.lastError.message);
    }
  });
});

// Initial detection
detectPageLanguage();