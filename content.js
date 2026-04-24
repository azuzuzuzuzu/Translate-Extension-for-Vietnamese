(function () {
  'use strict';

  if (document.getElementById('ts-popup')) return; // prevent double injection

  /* ─── CONFIGURATION ─── */
  const CONFIG = {
    SOURCE_LANG: 'auto',
    CHAR_LIMIT: 5000,
    REQUEST_TIMEOUT_MS: 8000,
    API_BASE: 'https://translate.googleapis.com/translate_a/single',
    AUTO_TRIGGER_DELAY_MS: 80,
    MIN_SELECTION_LENGTH: 2,
    FAB_LONG_PRESS_MS: 600,
    TOAST_DURATION_MS: 2200,
    Z_INDEX_POPUP: 2147483647,
    Z_INDEX_FAB: 2147483646
  };

  let SOURCE_LANG  = CONFIG.SOURCE_LANG;
  let TARGET_LANG  = 'vi';
  let enabled      = true;
  let theme        = 'dark';
  let showFab      = true;

  /* ─── STYLES ─── */
  const style = document.createElement('style');
  style.textContent = `
    /* ── Theme variables ── */
    #ts-popup, #ts-fab-wrap, #ts-toast {
      --ts-bg:        #0f0f1a;
      --ts-hdr:       #1a1a2e;
      --ts-border:    #2e2e4a;
      --ts-text:      #e8e8f0;
      --ts-muted:     #6b7280;
      --ts-muted2:    #9ca3af;
      --ts-accent:    #6366f1;
      --ts-surface2:  #252540;
      --ts-input-bg:  #1e1e3a;
      --ts-sw-off:    #2e2e4a;
      --ts-sw-thumb:  #6b7280;
      --ts-close-hbg: #2e2e4a;
    }
    #ts-popup.ts-light, #ts-fab-wrap.ts-light, #ts-toast.ts-light {
      --ts-bg:        #ffffff;
      --ts-hdr:       #f3f4f6;
      --ts-border:    #e5e7eb;
      --ts-text:      #111827;
      --ts-muted:     #6b7280;
      --ts-muted2:    #9ca3af;
      --ts-accent:    #4f46e5;
      --ts-surface2:  #f0f0ff;
      --ts-input-bg:  #f8f8ff;
      --ts-sw-off:    #d1d5db;
      --ts-sw-thumb:  #9ca3af;
      --ts-close-hbg: #f3f4f6;
    }

    /* ── Popup ── */
    #ts-popup {
      position: fixed;
      z-index: ${CONFIG.Z_INDEX_POPUP};
      width: 360px;
      min-width: 220px;
      max-width: 90vw;
      background: var(--ts-bg);
      border: 1px solid var(--ts-border);
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.04);
      font-family: 'Segoe UI', 'SF Pro Display', system-ui, sans-serif;
      font-size: 14px;
      color: var(--ts-text);
      overflow: hidden;
      opacity: 0;
      transform: translateY(6px) scale(0.97);
      transition: opacity 0.18s ease, transform 0.18s ease, box-shadow 0.15s;
      pointer-events: none;
      user-select: none;
    }
    #ts-popup.ts-visible {
      opacity: 1;
      transform: translateY(0) scale(1);
      pointer-events: all;
    }
    #ts-popup.ts-dragging {
      transition: box-shadow 0.15s;
      box-shadow: 0 20px 56px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.4);
      cursor: grabbing !important;
    }
    #ts-header {
      display: flex;
      align-items: center;
      padding: 8px 10px 7px 12px;
      background: var(--ts-hdr);
      border-bottom: 1px solid var(--ts-border);
      cursor: grab;
      gap: 6px;
    }
    #ts-header:active { cursor: grabbing; }
    #ts-drag-hint { display: flex; align-items: center; gap: 5px; flex: 1; min-width: 0; }
    #ts-label {
      font-size: 10px; font-weight: 700;
      letter-spacing: 0.12em; text-transform: uppercase;
      color: var(--ts-accent); white-space: nowrap;
    }
    #ts-grip { display: flex; flex-direction: column; gap: 2.5px; opacity: 0.35; }
    #ts-grip span { display: block; width: 14px; height: 1.5px; background: var(--ts-muted); border-radius: 1px; }
    #ts-header-right { display: flex; align-items: center; gap: 4px; flex-shrink: 0; }
    #ts-lang-badge {
      font-size: 10px; color: var(--ts-muted); background: var(--ts-surface2);
      padding: 2px 6px; border-radius: 4px; white-space: nowrap;
    }
    #ts-close {
      cursor: pointer; color: var(--ts-muted); font-size: 16px; line-height: 1;
      padding: 2px 5px; border-radius: 4px;
      transition: color 0.15s, background 0.15s; flex-shrink: 0;
    }
    #ts-close:hover { color: var(--ts-text); background: var(--ts-close-hbg); }
    #ts-body { padding: 10px 14px 12px; user-select: text; }
    #ts-original {
      font-size: 12px; color: var(--ts-muted); margin-bottom: 8px; line-height: 1.5;
      border-left: 2px solid var(--ts-border); padding-left: 8px;
      max-height: 60px; overflow: hidden;
      display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical;
    }
    #ts-result {
      line-height: 1.6; color: var(--ts-text); min-height: 20px;
      max-height: 260px; overflow-y: auto;
      white-space: pre-wrap; word-break: break-word;
      scrollbar-width: thin; scrollbar-color: var(--ts-border) transparent;
    }
    #ts-result::-webkit-scrollbar { width: 4px; }
    #ts-result::-webkit-scrollbar-track { background: transparent; }
    #ts-result::-webkit-scrollbar-thumb { background: var(--ts-border); border-radius: 4px; }
    #ts-spinner {
      display: inline-block; width: 14px; height: 14px;
      border: 2px solid var(--ts-border); border-top-color: var(--ts-accent);
      border-radius: 50%; animation: ts-spin 0.7s linear infinite;
      vertical-align: middle; margin-right: 6px;
    }
    @keyframes ts-spin { to { transform: rotate(360deg); } }
    #ts-copy-btn {
      display: block; width: 100%; margin-top: 10px; padding: 6px 0;
      background: var(--ts-input-bg); border: 1px solid var(--ts-border);
      border-radius: 6px; color: var(--ts-muted2); font-size: 11px;
      cursor: pointer; text-align: center; transition: background 0.15s, color 0.15s;
    }
    #ts-copy-btn:hover { background: var(--ts-surface2); color: var(--ts-text); }
    #ts-resize {
      position: absolute; bottom: 0; right: 0;
      width: 14px; height: 14px; cursor: se-resize;
      opacity: 0; transition: opacity 0.2s;
    }
    #ts-popup:hover #ts-resize { opacity: 1; }
    #ts-resize::before {
      content: ''; position: absolute; bottom: 3px; right: 3px;
      width: 8px; height: 8px;
      border-right: 2px solid var(--ts-muted); border-bottom: 2px solid var(--ts-muted);
      border-radius: 0 0 2px 0;
    }

    /* ── FAB ── */
    #ts-fab-wrap {
      position: fixed; bottom: 24px; right: 24px;
      z-index: ${CONFIG.Z_INDEX_FAB};
      display: flex; flex-direction: column; align-items: flex-end; gap: 8px;
      touch-action: none;
    }
    #ts-fab-wrap.ts-fab-hidden { display: none; }
    #ts-fab-wrap.ts-fab-dragging { cursor: grabbing !important; }
    #ts-fab-wrap.ts-fab-dragging * { cursor: grabbing !important; pointer-events: none; }
    #ts-toggle-pill {
      display: flex; align-items: center; gap: 8px;
      background: var(--ts-bg); border: 1px solid var(--ts-border);
      border-radius: 20px; padding: 5px 12px 5px 8px;
      cursor: pointer; opacity: 0; transform: translateY(4px);
      transition: opacity 0.2s, transform 0.2s; pointer-events: none;
      white-space: nowrap; font-family: 'Segoe UI', system-ui, sans-serif;
      font-size: 12px; color: var(--ts-muted2);
      box-shadow: 0 2px 12px rgba(0,0,0,0.3); user-select: none;
    }
    #ts-fab-wrap:hover #ts-toggle-pill { opacity: 1; transform: translateY(0); pointer-events: all; }
    #ts-switch {
      width: 30px; height: 16px; background: var(--ts-sw-off);
      border-radius: 8px; position: relative; flex-shrink: 0;
      transition: background 0.25s;
    }
    #ts-switch::after {
      content: ''; position: absolute; top: 2px; left: 2px;
      width: 12px; height: 12px; border-radius: 50%;
      background: var(--ts-sw-thumb); transition: transform 0.25s, background 0.25s;
    }
    #ts-switch.on { background: rgba(99,102,241,0.35); }
    #ts-switch.on::after { transform: translateX(14px); background: var(--ts-accent); }
    #ts-pill-label { font-size: 11px; }
    #ts-fab {
      width: 44px; height: 44px; border-radius: 50%; border: none;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      font-size: 20px; color: white;
      transition: transform 0.2s, box-shadow 0.2s, background 0.3s;
      position: relative; flex-shrink: 0;
      -webkit-user-select: none; user-select: none;
    }
    #ts-fab.ts-on  { background: linear-gradient(135deg,#6366f1,#8b5cf6); box-shadow: 0 4px 16px rgba(99,102,241,0.45); }
    #ts-fab.ts-off { background: #2a2a3e; box-shadow: 0 4px 16px rgba(0,0,0,0.3); }
    #ts-fab:hover  { transform: scale(1.1); }
    #ts-fab:active { transform: scale(0.95); }
    #ts-fab.ts-off::after {
      content: ''; position: absolute; width: 2px; height: 26px;
      background: #f87171; border-radius: 2px; transform: rotate(45deg); opacity: 0.8;
    }

    /* ── Toast ── */
    #ts-toast {
      position: fixed; bottom: 80px; right: 24px;
      z-index: ${CONFIG.Z_INDEX_FAB};
      background: var(--ts-bg); border: 1px solid var(--ts-border); border-radius: 8px;
      padding: 7px 14px; font-family: 'Segoe UI', system-ui, sans-serif;
      font-size: 12px; color: var(--ts-text);
      opacity: 0; transform: translateY(6px);
      transition: opacity 0.2s, transform 0.2s;
      pointer-events: none; white-space: nowrap;
      box-shadow: 0 4px 16px rgba(0,0,0,0.3);
    }
    #ts-toast.show { opacity: 1; transform: translateY(0); }
    
      /* ── SELECT BUTTON ── */
      #ts-select-btn {
        position: fixed;
        z-index: ${CONFIG.Z_INDEX_FAB};
        width: 40px; height: 40px; border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        background: var(--ts-accent); color: white; border: none;
        box-shadow: 0 6px 18px rgba(0,0,0,0.35);
        cursor: pointer; transition: transform 0.12s ease, opacity 0.12s ease;
        opacity: 0; transform: scale(0.9);
        pointer-events: none;
        font-size: 18px;
      }
      #ts-select-btn.show {
        opacity: 1; transform: scale(1); pointer-events: auto;
      }
      #ts-select-btn:active { transform: scale(0.95); }
      #ts-select-btn.ts-light { background: var(--ts-accent); color: white; }
  `;
  document.head.appendChild(style);

  /* ─── POPUP DOM ─── */
  const popup = document.createElement('div');
  popup.id = 'ts-popup';
  popup.innerHTML = `
    <div id="ts-header">
      <div id="ts-drag-hint">
        <div id="ts-grip"><span></span><span></span><span></span></div>
        <span id="ts-label">🌐 Dịch</span>
      </div>
      <div id="ts-header-right">
        <span id="ts-lang-badge">auto → vi</span>
        <span id="ts-close" title="Đóng">×</span>
      </div>
    </div>
    <div id="ts-body">
      <div id="ts-original"></div>
      <div id="ts-result"></div>
      <button id="ts-copy-btn">📋 Sao chép bản dịch</button>
    </div>
    <div id="ts-resize" title="Kéo để thay đổi kích thước"></div>
  `;
  document.body.appendChild(popup);

  /* ─── FAB DOM ─── */
  const fabWrap = document.createElement('div');
  fabWrap.id = 'ts-fab-wrap';
  fabWrap.innerHTML = `
    <div id="ts-toggle-pill">
      <div id="ts-switch"></div>
      <span id="ts-pill-label"></span>
    </div>
    <button id="ts-fab" title="Click: dịch | Giữ 0.6s: bật/tắt"></button>
  `;
  document.body.appendChild(fabWrap);

  /* ─── SELECT BUTTON DOM ─── */
  const selectBtn = document.createElement('button');
  selectBtn.id = 'ts-select-btn';
  selectBtn.title = 'Dịch đoạn đã chọn';
  selectBtn.innerHTML = '🌐';
  document.body.appendChild(selectBtn);

  const toast = document.createElement('div');
  toast.id = 'ts-toast';
  document.body.appendChild(toast);

  /* ─── REFS ─── */
  const fab        = document.getElementById('ts-fab');
  const swTrack    = document.getElementById('ts-switch');
  const pillLabel  = document.getElementById('ts-pill-label');
  const elOriginal = document.getElementById('ts-original');
  const elResult   = document.getElementById('ts-result');
  const elClose    = document.getElementById('ts-close');
  const elCopy     = document.getElementById('ts-copy-btn');
  const elBadge    = document.getElementById('ts-lang-badge');
  const elHeader   = document.getElementById('ts-header');
  const elResize   = document.getElementById('ts-resize');

  let lastTranslated = '';
  let abortController = null;
  // Selection-button state
  let currentSelectedText = '';
  let currentSelectionXY = { x: 0, y: 0 };
  let selectBtnTimeout = null;

  // Selection button interactions
  selectBtn.addEventListener('mousedown', (ev) => { ev.stopPropagation(); ev.preventDefault(); });
  selectBtn.addEventListener('click', (ev) => {
    ev.stopPropagation();
    // Re-check live selection first (safer if browser cleared selection on click)
    let selText = '';
    try { const sel = window.getSelection(); selText = sel ? sel.toString().trim() : ''; } catch(e) { selText = ''; }
    const text = selText && selText.length >= CONFIG.MIN_SELECTION_LENGTH ? selText : currentSelectedText;
    const pos = { x: currentSelectionXY.x, y: currentSelectionXY.y };
    if (!enabled) { showToast('⚠ Tự động dịch đang tắt — giữ nút để bật'); return; }
    if (!text || text.length < CONFIG.MIN_SELECTION_LENGTH) { showToast('Hãy chọn chữ trước'); hideSelectButton(); return; }
    hideSelectButton();
    translate(text, pos.x, pos.y);
  });

  document.addEventListener('mousedown', (ev) => {
    if (!selectBtn) return;
    if (selectBtn.contains(ev.target) || popup.contains(ev.target) || fabWrap.contains(ev.target)) return;
    hideSelectButton();
  });

  function showSelectButton(text, x, y) {
    currentSelectedText = text;
    currentSelectionXY = { x: x, y: y };
    // clamp inside viewport and offset to the right/above cursor
    const vw = window.innerWidth, vh = window.innerHeight;
    const bx = Math.min(Math.max(8, x + 12), vw - 48);
    const by = Math.min(Math.max(8, y - 44), vh - 48);
    selectBtn.style.left = bx + 'px';
    selectBtn.style.top  = by + 'px';
    selectBtn.classList.add('show');
    selectBtn.classList.toggle('ts-light', theme === 'light');
    if (selectBtnTimeout) clearTimeout(selectBtnTimeout);
    selectBtnTimeout = setTimeout(hideSelectButton, 6000);
  }

  function hideSelectButton() {
    try { selectBtn.classList.remove('show'); } catch(e){}
    currentSelectedText = '';
    currentSelectionXY = { x: 0, y: 0 };
    if (selectBtnTimeout) { clearTimeout(selectBtnTimeout); selectBtnTimeout = null; }
  }

  /* ─── LOAD SETTINGS from chrome.storage ─── */
  chrome.storage.sync.get(['ts_enabled', 'ts_target_lang', 'ts_theme', 'ts_show_fab', 'ts_fab_pos'], (data) => {
    if (data.ts_enabled    !== undefined) enabled  = data.ts_enabled;
    if (data.ts_target_lang) TARGET_LANG = data.ts_target_lang;
    if (data.ts_theme)       theme       = data.ts_theme;
    if (data.ts_show_fab   !== undefined) showFab  = data.ts_show_fab;

    elBadge.textContent = `auto → ${TARGET_LANG}`;
    applyTheme();
    applyState();
    applyFabVisibility();

    // Restore FAB position
    if (data.ts_fab_pos) {
      const { left, top } = data.ts_fab_pos;
      fabWrap.style.right  = 'auto';
      fabWrap.style.bottom = 'auto';
      fabWrap.style.left   = left + 'px';
      fabWrap.style.top    = top  + 'px';
    }
  });

  /* ─── Listen for changes from popup ─── */
  chrome.storage.onChanged.addListener((changes) => {
    if (changes.ts_enabled)     { enabled     = changes.ts_enabled.newValue;     applyState(); }
    if (changes.ts_target_lang) { TARGET_LANG = changes.ts_target_lang.newValue; elBadge.textContent = `auto → ${TARGET_LANG}`; }
    if (changes.ts_theme)       { theme       = changes.ts_theme.newValue;       applyTheme(); }
    if (changes.ts_show_fab)    { showFab     = changes.ts_show_fab.newValue;    applyFabVisibility(); }
  });

  /* ─── THEME ─── */
  function applyTheme() {
    const light = theme === 'light';
    [popup, fabWrap, toast, selectBtn].forEach(el => el.classList.toggle('ts-light', light));
  }

  /* ─── STATE ─── */
  function applyState() {
    if (enabled) {
      fab.classList.remove('ts-off'); fab.classList.add('ts-on');
      fab.textContent = '🌐';
      swTrack.classList.add('on');
      pillLabel.textContent = 'Tự động dịch: BẬT';
    } else {
      fab.classList.remove('ts-on'); fab.classList.add('ts-off');
      fab.textContent = '🌐';
      swTrack.classList.remove('on');
      pillLabel.textContent = 'Tự động dịch: TẮT';
      hidePopup();
    }
  }

  function applyFabVisibility() {
    fabWrap.classList.toggle('ts-fab-hidden', !showFab);
  }

  function toggleEnabled() {
    enabled = !enabled;
    chrome.storage.sync.set({ ts_enabled: enabled });
    applyState();
    showToast(enabled ? '✅ Đã bật tự động dịch' : '🔕 Đã tắt tự động dịch');
  }

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => toast.classList.remove('show'), CONFIG.TOAST_DURATION_MS);
  }

  /* ─── POPUP DRAG ─── */
  let dragState = null;

  elHeader.addEventListener('mousedown', (e) => {
    if (e.target === elClose) return;
    if (e.button !== 0) return;
    e.preventDefault();
    const rect = popup.getBoundingClientRect();
    dragState = { startX: e.clientX, startY: e.clientY, origLeft: rect.left, origTop: rect.top };
    popup.classList.add('ts-dragging');
  });

  document.addEventListener('mousemove', (e) => {
    if (dragState) {
      const dx = e.clientX - dragState.startX, dy = e.clientY - dragState.startY;
      const pw = popup.offsetWidth, ph = popup.offsetHeight;
      const vw = window.innerWidth, vh = window.innerHeight;
      popup.style.left = Math.max(4, Math.min(dragState.origLeft + dx, vw - pw - 4)) + 'px';
      popup.style.top  = Math.max(4, Math.min(dragState.origTop  + dy, vh - ph - 4)) + 'px';
      popup.dataset.pinned = '1';
    }
    if (fabDragState) {
      const dx = e.clientX - fabDragState.startX, dy = e.clientY - fabDragState.startY;
      if (!fabMoved && Math.hypot(dx, dy) < 5) return;
      fabMoved = true;
      fabWrap.classList.add('ts-fab-dragging');
      clearTimeout(pressTimer);
      const fw = fabWrap.offsetWidth, fh = fabWrap.offsetHeight;
      const vw = window.innerWidth, vh = window.innerHeight;
      const newLeft = Math.max(4, Math.min(fabDragState.origLeft + dx, vw - fw - 4));
      const newTop  = Math.max(4, Math.min(fabDragState.origTop  + dy, vh - fh - 4));
      fabWrap.style.right = 'auto'; fabWrap.style.bottom = 'auto';
      fabWrap.style.left = newLeft + 'px'; fabWrap.style.top = newTop + 'px';
    }
  });

  document.addEventListener('mouseup', () => {
    if (dragState) { dragState = null; popup.classList.remove('ts-dragging'); }
    if (fabDragState) {
      const wasDragging = fabMoved;
      fabDragState = null; fabMoved = false;
      fabWrap.classList.remove('ts-fab-dragging');
      if (wasDragging) {
        const rect = fabWrap.getBoundingClientRect();
        chrome.storage.sync.set({ ts_fab_pos: { left: rect.left, top: rect.top } });
      }
    }
  });

  /* ─── RESIZE ─── */
  let resizeState = null;
  elResize.addEventListener('mousedown', (e) => {
    e.preventDefault(); e.stopPropagation();
    const rect = popup.getBoundingClientRect();
    resizeState = { startX: e.clientX, startY: e.clientY, origW: rect.width, origH: rect.height };
  });
  document.addEventListener('mousemove', (e) => {
    if (!resizeState) return;
    const dx = e.clientX - resizeState.startX, dy = e.clientY - resizeState.startY;
    const newW = Math.max(220, Math.min(resizeState.origW + dx, window.innerWidth - 16));
    popup.style.width = newW + 'px'; popup.style.maxWidth = newW + 'px';
    elResult.style.maxHeight = Math.max(60, resizeState.origH + dy - 140) + 'px';
    elResult.style.overflow = 'auto';
  });
  document.addEventListener('mouseup', () => { resizeState = null; });

  /* ─── SHOW/HIDE ─── */
  function showPopup(x, y) {
    if (!popup.dataset.pinned) {
      const pw = popup.offsetWidth || 360, ph = popup.offsetHeight || 180;
      const vw = window.innerWidth, vh = window.innerHeight;
      let left = x + 12, top = y + 12;
      if (left + pw > vw - 8) left = x - pw - 12;
      if (top  + ph > vh - 8) top  = y - ph - 12;
      popup.style.left = Math.max(4, left) + 'px';
      popup.style.top  = Math.max(4, top)  + 'px';
    }
    popup.classList.add('ts-visible');
  }
  function hidePopup() {
    popup.classList.remove('ts-visible');
    delete popup.dataset.pinned;
  }

  /* ─── TRANSLATE ─── */
  function setLoading() { elResult.innerHTML = '<span id="ts-spinner"></span> Đang dịch…'; elCopy.style.display = 'none'; }
  function setResult(t) { lastTranslated = t; elResult.textContent = t; elCopy.style.display = 'block'; }
  
  function setError(message) { 
    elResult.innerHTML = `<span style="color:#f87171">⚠ ${message}</span>`; 
    elCopy.style.display = 'none'; 
  }

  async function translate(text, x, y) {
    const clipped = text.trim().slice(0, CONFIG.CHAR_LIMIT);
    if (!clipped) return;

    // Cancel previous request
    if (abortController) abortController.abort();
    abortController = new AbortController();

    elOriginal.textContent = clipped;
    setLoading();
    showPopup(x, y);

    // First try using the background service worker (bypasses page CORS/CORB)
    try {
      const bgResp = await new Promise((resolve, reject) => {
        let settled = false;
        try {
          chrome.runtime.sendMessage({ action: 'translate', q: clipped, sl: SOURCE_LANG, tl: TARGET_LANG }, (resp) => {
            if (settled) return;
            settled = true;
            if (chrome.runtime.lastError) return reject(new Error(chrome.runtime.lastError.message));
            resolve(resp);
          });
        } catch (e) {
          if (settled) return;
          settled = true;
          reject(e);
        }
        // safety fallback timeout to avoid waiting forever for the service worker
        setTimeout(() => { if (!settled) { settled = true; reject(new Error('BG_RPC_TIMEOUT')); } }, Math.max(1200, Math.min(3000, CONFIG.REQUEST_TIMEOUT_MS - 200)));
      });

      if (bgResp && bgResp.ok) {
        elBadge.textContent = `${bgResp.detectedLang || 'auto'} → ${TARGET_LANG}`;
        setResult(bgResp.translated);
        return;
      } else {
        console.warn('[Translate] background RPC failed', bgResp && bgResp.error);
      }
    } catch (rpcError) {
      console.warn('[Translate] background RPC error', rpcError);
      // fallthrough to local fetch fallback
    }

    // Local fetch fallback with proper timeout/abort handling
    try {
      if (abortController) abortController.abort();
      abortController = new AbortController();
      const localController = abortController;
      let timedOut = false;
      const timeoutId = setTimeout(() => { timedOut = true; try { localController.abort(); } catch (e) {} }, CONFIG.REQUEST_TIMEOUT_MS);

      const params = new URLSearchParams({
        client: 'gtx',
        sl: SOURCE_LANG,
        tl: TARGET_LANG,
        dt: 't',
        q: clipped
      });
      const url = `${CONFIG.API_BASE}?${params}`;

      const res = await fetch(url, { signal: localController.signal });
      clearTimeout(timeoutId);

      if (!res.ok) throw new Error(`HTTP_${res.status}`);
      const json = await res.json();
      if (!json[0]) throw new Error('INVALID_RESPONSE');

      const translated = json[0].map(p => p[0]).filter(Boolean).join('');
      elBadge.textContent = `${json[2] || 'auto'} → ${TARGET_LANG}`;
      setResult(translated);
    } catch (error) {
      console.error('[Translate]', error);
      if (error && error.name === 'AbortError') {
        setError('Yêu cầu đã bị hủy');
      } else if (error && (error.message === 'REQUEST_TIMEOUT' || error.message === 'BG_RPC_TIMEOUT')) {
        setError('Kết nối quá lâu. Thử lại?');
      } else if (error && error.message === 'INVALID_RESPONSE') {
        setError('Phản hồi không hợp lệ');
      } else if (!navigator.onLine) {
        setError('Không có kết nối Internet');
      } else if (typeof DOMException !== 'undefined' && error instanceof DOMException) {
        setError('Truy cập dịch vụ bị chặn bởi trang (DOMException).');
      } else {
        setError('Lỗi dịch. Thử lại?');
      }
    }
  }

  /* ─── FAB DRAG ─── */
  let fabDragState = null, fabMoved = false;

  fab.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    const rect = fabWrap.getBoundingClientRect();
    fabDragState = { startX: e.clientX, startY: e.clientY, origLeft: rect.left, origTop: rect.top };
    fabMoved = false;
  });

  /* ─── FAB CLICK / LONG-PRESS ─── */
  let pressTimer = null, didToggle = false;

  fab.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    didToggle = false;
    pressTimer = setTimeout(() => { didToggle = true; toggleEnabled(); }, CONFIG.FAB_LONG_PRESS_MS);
  });
  fab.addEventListener('mouseup', (e) => {
    if (e.button !== 0) return;
    clearTimeout(pressTimer);
    if (didToggle || fabMoved) return;
    if (!enabled) { showToast('⚠ Tự động dịch đang tắt — giữ nút để bật'); return; }
    const sel = window.getSelection();
    const text = sel ? sel.toString().trim() : '';
    if (!text) { showToast('Hãy chọn chữ trước'); return; }
    if (text.length < CONFIG.MIN_SELECTION_LENGTH) {
      showToast(`Cần ít nhất ${CONFIG.MIN_SELECTION_LENGTH} ký tự`);
      return;
    }
    const rect = sel.getRangeAt(0).getBoundingClientRect();
    translate(text, rect.right, rect.bottom);
  });
  fab.addEventListener('mouseleave', () => { if (!fabMoved) clearTimeout(pressTimer); });
  fab.addEventListener('contextmenu', (e) => e.preventDefault());

  document.getElementById('ts-toggle-pill').addEventListener('click', toggleEnabled);

  /* ─── AUTO TRIGGER ─── */
  document.addEventListener('mouseup', (e) => {
    if (!enabled) return;
    if (popup.contains(e.target) || fabWrap.contains(e.target) || (selectBtn && selectBtn.contains(e.target))) return;
    if (fabMoved) return;
    setTimeout(() => {
      const sel  = window.getSelection();
      const text = sel ? sel.toString().trim() : '';
      if (text.length > CONFIG.MIN_SELECTION_LENGTH) {
        // Position the button at the mouse release point (to the right and above the cursor)
        showSelectButton(text, e.clientX, e.clientY);
      } else if (!text) {
        hidePopup();
        hideSelectButton();
      }
    }, CONFIG.AUTO_TRIGGER_DELAY_MS);
  });

  /* ─── KEYBOARD ─── */
  document.addEventListener('keydown', (e) => {
    // Removed Ctrl+Shift+T shortcut due to Chrome shortcut conflicts.
    // Keep Ctrl+Shift+D to toggle auto-translate and Esc to close popup.
    if (e.ctrlKey && e.shiftKey && e.key === 'D') { e.preventDefault(); toggleEnabled(); }
    if (e.key === 'Escape') hidePopup();
  });

  /* ─── CLOSE & COPY ─── */
  elClose.addEventListener('click', hidePopup);
  elCopy.addEventListener('click', () => {
    if (!lastTranslated) return;
    navigator.clipboard.writeText(lastTranslated).then(() => {
      elCopy.textContent = '✅ Đã sao chép!';
      setTimeout(() => { elCopy.textContent = '📋 Sao chép bản dịch'; }, 1500);
    });
  });

})();

// imdumb.