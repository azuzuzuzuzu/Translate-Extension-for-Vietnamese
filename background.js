// Service worker — required by MV3
'use strict';

/* ─── CONFIGURATION ─── */
const DEFAULT_SETTINGS = {
  ts_enabled: true,
  ts_target_lang: 'vi',
  ts_theme: 'dark',
  ts_show_fab: true
};

/* ─── INITIALIZATION ─── */
chrome.runtime.onInstalled.addListener(() => {
  // Set default settings on first install
  chrome.storage.sync.get(Object.keys(DEFAULT_SETTINGS), (data) => {
    const defaults = {};
    Object.keys(DEFAULT_SETTINGS).forEach(key => {
      if (data[key] === undefined) {
        defaults[key] = DEFAULT_SETTINGS[key];
      }
    });
    
    if (Object.keys(defaults).length) {
      chrome.storage.sync.set(defaults, () => {
        if (chrome.runtime.lastError) {
          console.error('[TranslateExt] Failed to set defaults:', chrome.runtime.lastError);
        } else {
          console.log('[TranslateExt] Settings initialized:', defaults);
        }
      });
    } else {
      console.log('[TranslateExt] Settings already configured');
    }
  });
});

/* ─── ERROR HANDLING ─── */
chrome.runtime.onError = (error) => {
  console.error('[TranslateExt] Runtime error:', error);
};

// Listen for storage errors
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'sync') {
    // Log significant changes for debugging
    Object.keys(changes).forEach(key => {
      if (key.startsWith('ts_')) {
        console.log(`[TranslateExt] Setting changed: ${key} = ${changes[key].newValue}`);
      }
    });
  }
});
