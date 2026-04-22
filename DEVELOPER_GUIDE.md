 # Hướng dẫn cho nhà phát triển
 
 ## Cấu trúc dự án
 
 ```
 translate-ext/
 ├── manifest.json
 ├── background.js
 ├── content.js
 ├── popup.html
 ├── popup.js
 ├── icons/
 ├── README.md
 └── các tài liệu khác
 ```
 
 ## Cấu hình nhanh
 
 Trong `popup.js`:
 ```javascript
 const CONFIG = {
   SOURCE_LANG: 'auto',
   DEBOUNCE_MS: 300,
   CHAR_LIMIT: 5000,
   CHAR_WARN_LIMIT: 4500,
   REQUEST_TIMEOUT_MS: 8000,
   API_BASE: 'https://translate.googleapis.com/translate_a/single'
 };
 ```
 
 Trong `content.js`:
 ```javascript
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
 ```
 
 ## Tính năng chính
 - Popup: dịch thủ công, copy kết quả, chọn ngôn ngữ
 - Content script: auto-translate, FAB, phím tắt, popup kéo được
 - Request management: debounce, timeout, abort controller
 
 ## Lưu trữ
 Sử dụng `chrome.storage.sync` để lưu cài đặt:
 - `ts_enabled` (boolean)
 - `ts_target_lang` (string)
 - `ts_theme` (string)
 - `ts_show_fab` (boolean)
 - `ts_fab_pos` (object)
 
 ## API dịch
 Sử dụng endpoint không chính thức của Google Translate:
 ```
 https://translate.googleapis.com/translate_a/single
 ```
 Tham số chính: `client=gtx`, `sl=auto`, `tl=<target>`, `dt=t`, `q=<text>`
 
 ## Debug & Test
 - Log tiền tố: `[TranslateExt]`
 - Xem storage: `chrome.storage.sync.get(null, console.log)`
 - Kiểm tra network request tới `translate.googleapis.com`
 
 ## Các vấn đề thường gặp
 - Auto-translate không hoạt động → kiểm tra `ts_enabled`
 - Timeout → tăng `REQUEST_TIMEOUT_MS`
 - FAB không hiện → kiểm tra `ts_show_fab`
 
 ---
 
 ## Lời khuyên tối ưu
 - Thiết bị yếu: tăng `DEBOUNCE_MS`
 - Trang traffic cao: tăng `AUTO_TRIGGER_DELAY_MS` hoặc tắt auto
 
 ---
 
 ## Tương lai
 - Caching, lịch sử, phím tắt tuỳ chỉnh, nhiều API dịch
 
 
 Lưu ý: Bản dịch tiếng Việt được tạo với sự hỗ trợ của A.I.
