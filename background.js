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

/* ─── TRANSLATION RPC ───
   Service worker performs translate requests so content scripts/popups
   can avoid CORS/CORB/DOMException issues on certain pages. */
const TRANSLATE_API = 'https://translate.googleapis.com/translate_a/single';
const TRANSLATE_TIMEOUT_MS = 8000;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || message.action !== 'translate') return;

  (async () => {
    const text = (message.q || '').toString().slice(0, 5000);
    if (!text) return sendResponse({ ok: false, error: 'EMPTY' });

    const params = new URLSearchParams({
      client: 'gtx',
      sl: message.sl || 'auto',
      tl: message.tl || 'vi',
      dt: 't',
      q: text
    });

    const url = `${TRANSLATE_API}?${params}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TRANSLATE_TIMEOUT_MS);

    try {
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (!res || !res.ok) return sendResponse({ ok: false, error: `HTTP_${res ? res.status : '0'}` });
      const json = await res.json();
      if (!json || !json[0]) return sendResponse({ ok: false, error: 'INVALID_RESPONSE' });
      const translated = json[0].map(p => p[0]).filter(Boolean).join('');
      const detected = json[2] || 'auto';
      sendResponse({ ok: true, translated, detectedLang: detected });
    } catch (err) {
      clearTimeout(timeoutId);
      const msg = err && (err.message || err.name) ? (err.message || err.name) : String(err);
      sendResponse({ ok: false, error: msg });
    }
  })();

  // Keep the message channel open for async response
  return true;
});
