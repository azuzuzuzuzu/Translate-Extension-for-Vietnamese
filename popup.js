'use strict';

/* ─── CONFIGURATION ─── */
const CONFIG = {
  SOURCE_LANG: 'auto',
  DEBOUNCE_MS: 300,
  CHAR_LIMIT: 5000,
  CHAR_WARN_LIMIT: 4500,
  REQUEST_TIMEOUT_MS: 8000,
  API_BASE: 'https://translate.googleapis.com/translate_a/single'
};

let targetLang = 'vi';
let lastResult = '';
let translateTimeout = null;
let abortController = null;

/* ─── LANGUAGES ─── */
const LANGUAGES = [
  { code: 'af', name: 'Afrikaans' },
  { code: 'sq', name: 'Albanian' },
  { code: 'am', name: 'Amharic' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hy', name: 'Armenian' },
  { code: 'az', name: 'Azerbaijani' },
  { code: 'eu', name: 'Basque' },
  { code: 'be', name: 'Belarusian' },
  { code: 'bn', name: 'Bengali' },
  { code: 'bs', name: 'Bosnian' },
  { code: 'bg', name: 'Bulgarian' },
  { code: 'ca', name: 'Catalan' },
  { code: 'ceb', name: 'Cebuano' },
  { code: 'zh-CN', name: 'Chinese (Simplified)' },
  { code: 'zh-TW', name: 'Chinese (Traditional)' },
  { code: 'co', name: 'Corsican' },
  { code: 'hr', name: 'Croatian' },
  { code: 'cs', name: 'Czech' },
  { code: 'da', name: 'Danish' },
  { code: 'nl', name: 'Dutch' },
  { code: 'en', name: 'English' },
  { code: 'eo', name: 'Esperanto' },
  { code: 'et', name: 'Estonian' },
  { code: 'fi', name: 'Finnish' },
  { code: 'fr', name: 'French' },
  { code: 'fy', name: 'Frisian' },
  { code: 'gl', name: 'Galician' },
  { code: 'ka', name: 'Georgian' },
  { code: 'de', name: 'German' },
  { code: 'el', name: 'Greek' },
  { code: 'gu', name: 'Gujarati' },
  { code: 'ht', name: 'Haitian Creole' },
  { code: 'ha', name: 'Hausa' },
  { code: 'haw', name: 'Hawaiian' },
  { code: 'he', name: 'Hebrew' },
  { code: 'hi', name: 'Hindi' },
  { code: 'hmn', name: 'Hmong' },
  { code: 'hu', name: 'Hungarian' },
  { code: 'is', name: 'Icelandic' },
  { code: 'ig', name: 'Igbo' },
  { code: 'id', name: 'Indonesian' },
  { code: 'ga', name: 'Irish' },
  { code: 'it', name: 'Italian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'jw', name: 'Javanese' },
  { code: 'kn', name: 'Kannada' },
  { code: 'kk', name: 'Kazakh' },
  { code: 'km', name: 'Khmer' },
  { code: 'ko', name: 'Korean' },
  { code: 'ku', name: 'Kurdish' },
  { code: 'ky', name: 'Kyrgyz' },
  { code: 'lo', name: 'Lao' },
  { code: 'la', name: 'Latin' },
  { code: 'lv', name: 'Latvian' },
  { code: 'lt', name: 'Lithuanian' },
  { code: 'lb', name: 'Luxembourgish' },
  { code: 'mk', name: 'Macedonian' },
  { code: 'mg', name: 'Malagasy' },
  { code: 'ms', name: 'Malay' },
  { code: 'ml', name: 'Malayalam' },
  { code: 'mt', name: 'Maltese' },
  { code: 'mi', name: 'Maori' },
  { code: 'mr', name: 'Marathi' },
  { code: 'mn', name: 'Mongolian' },
  { code: 'my', name: 'Myanmar (Burmese)' },
  { code: 'ne', name: 'Nepali' },
  { code: 'no', name: 'Norwegian' },
  { code: 'ny', name: 'Nyanja' },
  { code: 'ps', name: 'Pashto' },
  { code: 'fa', name: 'Persian' },
  { code: 'pl', name: 'Polish' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'pa', name: 'Punjabi' },
  { code: 'ro', name: 'Romanian' },
  { code: 'ru', name: 'Russian' },
  { code: 'sm', name: 'Samoan' },
  { code: 'sr', name: 'Serbian' },
  { code: 'st', name: 'Sesotho' },
  { code: 'sn', name: 'Shona' },
  { code: 'sd', name: 'Sindhi' },
  { code: 'si', name: 'Sinhala' },
  { code: 'sk', name: 'Slovak' },
  { code: 'sl', name: 'Slovenian' },
  { code: 'so', name: 'Somali' },
  { code: 'es', name: 'Spanish' },
  { code: 'su', name: 'Sundanese' },
  { code: 'sw', name: 'Swahili' },
  { code: 'sv', name: 'Swedish' },
  { code: 'tl', name: 'Filipino' },
  { code: 'tg', name: 'Tajik' },
  { code: 'ta', name: 'Tamil' },
  { code: 'te', name: 'Telugu' },
  { code: 'th', name: 'Thai' },
  { code: 'tr', name: 'Turkish' },
  { code: 'uk', name: 'Ukrainian' },
  { code: 'ur', name: 'Urdu' },
  { code: 'uz', name: 'Uzbek' },
  { code: 'vi', name: 'Tiếng Việt' },
  { code: 'cy', name: 'Welsh' },
  { code: 'xh', name: 'Xhosa' },
  { code: 'yi', name: 'Yiddish' },
  { code: 'yo', name: 'Yoruba' },
  { code: 'zu', name: 'Zulu' }
];

function populateLangSelect() {
  const sel = document.getElementById('lang-select');
  if (!sel) return;
  sel.innerHTML = LANGUAGES.map(l => `<option value="${l.code}">${l.name}</option>`).join('');
}

populateLangSelect();

/* ── Load settings ── */
chrome.storage.sync.get(['ts_enabled', 'ts_target_lang', 'ts_theme', 'ts_show_fab'], (data) => {
  const enabled  = data.ts_enabled    !== undefined ? data.ts_enabled    : true;
  const showFab  = data.ts_show_fab   !== undefined ? data.ts_show_fab   : true;
  const theme    = data.ts_theme      || 'dark';
  targetLang     = data.ts_target_lang || 'vi';

  document.getElementById('toggle-auto').checked = enabled;
  document.getElementById('toggle-fab').checked  = showFab;
  document.getElementById('lang-select').value   = targetLang;
  applyTheme(theme);
});

/* ── Theme ── */
function applyTheme(theme) {
  document.body.classList.toggle('light', theme === 'light');
  document.getElementById('theme-btn').textContent = theme === 'light' ? '🌙' : '☀️';
  document.getElementById('theme-btn').title = theme === 'light' ? 'Chuyển sang tối' : 'Chuyển sang sáng';
}

document.getElementById('theme-btn').addEventListener('click', () => {
  const isLight = document.body.classList.contains('light');
  const newTheme = isLight ? 'dark' : 'light';
  chrome.storage.sync.set({ ts_theme: newTheme });
  applyTheme(newTheme);
});

/* ── Settings toggles ── */
document.getElementById('toggle-auto').addEventListener('change', (e) => {
  chrome.storage.sync.set({ ts_enabled: e.target.checked });
});

document.getElementById('toggle-fab').addEventListener('change', (e) => {
  chrome.storage.sync.set({ ts_show_fab: e.target.checked });
});

document.getElementById('lang-select').addEventListener('change', (e) => {
  targetLang = e.target.value;
  chrome.storage.sync.set({ ts_target_lang: targetLang });
  // Clear result when language changes
  hideResult();
});

/* ── Translate ── */
const inputEl    = document.getElementById('translate-input');
const resultWrap = document.getElementById('result-wrap');
const resultText = document.getElementById('result-text');
const spinner    = document.getElementById('popup-spinner');

function showSpinner()  { spinner.classList.add('show');    resultWrap.classList.remove('show'); }
function hideSpinner()  { spinner.classList.remove('show'); }
function showResult(t)  { lastResult = t; resultText.textContent = t; resultWrap.classList.add('show'); }
function hideResult()   { resultWrap.classList.remove('show'); lastResult = ''; }

function showError(message) { 
  hideSpinner();
  resultText.innerHTML = `<span style="color: #f87171">⚠ ${message}</span>`; 
  resultWrap.classList.add('show'); 
}

async function doTranslate() {
  const text = inputEl.value.trim();
  if (!text) return;

  // Cancel previous request if any
  if (abortController) {
    try { abortController.abort(); } catch (e) {}
  }
  abortController = new AbortController();
  let timedOut = false;
  const timeoutId = setTimeout(() => { timedOut = true; try { abortController.abort(); } catch (e) {} }, CONFIG.REQUEST_TIMEOUT_MS);

  showSpinner();
  hideResult();

  try {
    const clipped = text.slice(0, CONFIG.CHAR_LIMIT);
    const params = new URLSearchParams({
      client: 'gtx',
      sl: CONFIG.SOURCE_LANG,
      tl: targetLang,
      dt: 't',
      q: clipped
    });
    const url = `${CONFIG.API_BASE}?${params}`;

    const res = await fetch(url, { signal: abortController.signal });
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();

    if (!json[0]) throw new Error('INVALID_RESPONSE');

    const translated = json[0].map(p => p[0]).filter(Boolean).join('');
    hideSpinner();
    showResult(translated);
  } catch (error) {
    clearTimeout(timeoutId);
    hideSpinner();

    // Provide specific error messages
    if (error.name === 'AbortError') {
      if (timedOut) showError('Kết nối quá lâu. Vui lòng thử lại.');
      else showError('Yêu cầu đã bị hủy');
    } else if (error.message === 'INVALID_RESPONSE') {
      showError('Phản hồi không hợp lệ. Vui lòng thử lại.');
    } else if (!navigator.onLine) {
      showError('Không có kết nối Internet.');
    } else {
      showError('Lỗi dịch. Vui lòng thử lại.');
    }
    console.error('[Translate]', error);
  } finally {
    abortController = null;
  }
}

// Debounced translate for input changes
function debouncedTranslate() {
  clearTimeout(translateTimeout);
  translateTimeout = setTimeout(doTranslate, CONFIG.DEBOUNCE_MS);
}

// Character limit warning + debounced translate on user input
inputEl.addEventListener('input', () => {
  const len = inputEl.value.length;
  if (len > CONFIG.CHAR_WARN_LIMIT) {
    inputEl.style.borderColor = '#f87171';
    inputEl.title = `⚠ Giới hạn ${CONFIG.CHAR_LIMIT} ký tự (${len}/${CONFIG.CHAR_LIMIT})`;
  } else {
    inputEl.style.borderColor = '';
    inputEl.title = '';
  }
  debouncedTranslate();
});

document.getElementById('translate-btn').addEventListener('click', doTranslate);

inputEl.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    doTranslate();
  }
});

document.getElementById('clear-btn').addEventListener('click', () => {
  inputEl.value = '';
  hideResult();
  inputEl.focus();
});

/* ── Copy ── */
document.getElementById('copy-btn').addEventListener('click', () => {
  if (!lastResult) return;
  navigator.clipboard.writeText(lastResult).then(() => {
    const btn = document.getElementById('copy-btn');
    btn.textContent = '✅ Đã sao chép!';
    setTimeout(() => { btn.textContent = '📋 Sao chép'; }, 1500);
  });
});

// Auto-focus input when popup opens so user can start typing immediately
try {
  // Use a small timeout to ensure layout and focusable state
  setTimeout(() => {
    if (inputEl && typeof inputEl.focus === 'function') inputEl.focus();
  }, 10);
} catch (e) { /* ignore focus errors */ }
