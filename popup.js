// popup.js - Handles popup UI interactions

document.addEventListener('DOMContentLoaded', () => {
  const fromLangSelect = document.getElementById('fromLang');
  const toLangSelect = document.getElementById('toLang');
  const translateBtn = document.getElementById('translateBtn');
  const autoTranslateCheckbox = document.getElementById('autoTranslate');
  const domainsInput = document.getElementById('domains');
  const saveSettingsBtn = document.getElementById('saveSettings');
  const statusMessage = document.getElementById('statusMessage');
  const domainError = document.getElementById('domainError');

  // Load saved settings
  loadSettings();

  // Translate button click
  translateBtn.addEventListener('click', () => {
    const fromLang = fromLangSelect.value;
    const toLang = toLangSelect.value;

    if (fromLang === toLang) {
      showStatus('Source and target languages cannot be the same', 'error');
      return;
    }

    // Send message to content script to translate
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {
        type: 'translate',
        fromLang: fromLang === 'auto' ? '' : fromLang,
        toLang: toLang
      }, (response) => {
        if (chrome.runtime.lastError) {
          showStatus('Error: Could not translate page', 'error');
        } else {
          showStatus('Translation started...', 'success');
          setTimeout(() => window.close(), 1500);
        }
      });
    });
  });

  // Save settings button click
  saveSettingsBtn.addEventListener('click', () => {
    if (!validateDomains()) {
      return;
    }

    const settings = {
      fromLang: fromLangSelect.value,
      toLang: toLangSelect.value,
      autoTranslate: autoTranslateCheckbox.checked,
      autoTranslateDomains: parseDomains(domainsInput.value)
    };

    chrome.storage.sync.set(settings, () => {
      showStatus('Settings saved successfully!', 'success');
      setTimeout(() => {
        statusMessage.style.display = 'none';
      }, 2000);
    });
  });

  // Real-time domain validation
  domainsInput.addEventListener('input', () => {
    validateDomains();
  });

  // Load settings from storage
  function loadSettings() {
    chrome.storage.sync.get(['fromLang', 'toLang', 'autoTranslate', 'autoTranslateDomains'], (result) => {
      if (result.fromLang) {
        fromLangSelect.value = result.fromLang;
      }
      if (result.toLang) {
        toLangSelect.value = result.toLang;
      }
      if (result.autoTranslate !== undefined) {
        autoTranslateCheckbox.checked = result.autoTranslate;
      }
      if (result.autoTranslateDomains) {
        domainsInput.value = result.autoTranslateDomains.join(', ');
      }
    });
  }

  // Validate domains input
  function validateDomains() {
    const value = domainsInput.value.trim();
    
    if (!value) {
      domainError.textContent = '';
      return true;
    }

    const domains = value.split(',').map(d => d.trim()).filter(d => d);
    const domainRegex = /^(\.[a-z]{2,}|[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*)$/i;
    
    const invalidDomains = domains.filter(domain => !domainRegex.test(domain));
    
    if (invalidDomains.length > 0) {
      domainError.textContent = `Invalid: ${invalidDomains.join(', ')}`;
      return false;
    }
    
    domainError.textContent = '';
    return true;
  }

  // Parse domains from input
  function parseDomains(value) {
    if (!value.trim()) {
      return [];
    }
    return value.split(',')
      .map(d => d.trim())
      .filter(d => d)
      .filter((domain, index, self) => self.indexOf(domain) === index); // Remove duplicates
  }

  // Show status message
  function showStatus(message, type) {
    statusMessage.textContent = message;
    statusMessage.className = `status-message ${type}`;
    statusMessage.style.display = 'block';
  }
});
