 # Translate Selection - Tiện ích mở rộng Chrome
 
 Một tiện ích mở rộng nhẹ, nhanh giúp dịch đoạn văn bản được bôi đen trên trang web. Hỗ trợ 10+ ngôn ngữ thông qua Google Translate API (không chính thức).
 
 ![Version](https://img.shields.io/badge/version-2.4.1-blue)
 ![License](https://img.shields.io/badge/license-MIT-green)
 ![Chrome](https://img.shields.io/badge/chrome-MV3-green)
 
 ---
 
 ## ✨ Tính năng
 
 - 🌐 Nhiều chế độ dịch:
   - Tự động dịch khi bôi đen văn bản
   - Dịch thủ công qua popup
   - Không có phím tắt dịch nhanh mặc định (đã bỏ `Ctrl+Shift+T`)
   - Nút FAB nổi trên trang
 
 - 🎨 Giao diện thân thiện:
   - Chế độ tối / sáng
   - Popup có thể kéo, thay đổi kích thước
   - Giao diện gọn, hiện đại
   - Responsive cho nhiều kích thước màn hình
 
 - ⚡ Nhanh & Thông minh:
   - Debounce đầu vào để giảm số lần gọi API
   - Timeout yêu cầu (8s)
   - Tự động phát hiện ngôn ngữ nguồn
   - Nút sao chép nhanh kết quả
 
 - 🛡️ Xử lý lỗi rõ ràng:
   - Thông báo lỗi cụ thể
   - Kiểm tra trạng thái offline
   - Hủy yêu cầu khi cần
   - Tự thoát an toàn khi lỗi
 
 - ⚙️ Dễ tùy chỉnh cho dev:
   - Cấu hình tập trung
   - Mã nguồn rõ ràng, có chú thích
   - Logging console tiện debug
 
 ---
 
 ## 🚀 Bắt đầu nhanh
 
 ### Cài đặt
 1. Tải hoặc clone repository này
 2. Mở `chrome://extensions/`
 3. Bật **Developer mode**
 4. Click **Load unpacked**
 5. Chọn thư mục extension
 6. Hoàn tất!
 
 ### Sử dụng lần đầu
 1. Click biểu tượng extension trên thanh công cụ
 2. Gõ/chèn văn bản cần dịch
 3. Chọn ngôn ngữ đích
 4. Nhấn Enter hoặc bấm nút "Dịch"
 5. Sao chép kết quả hoặc đóng popup
 
 ---
 
 ## 📖 Tài liệu
 - **README (Tiếng Việt):** [README.md](README.md) - Bản tiếng Việt (tệp hiện tại)
 - **User Guide (Tiếng Việt):** [USER_GUIDE.md](USER_GUIDE.md)
 - **Hướng dẫn dev (Tiếng Việt):** [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md)
 - **Ghi chú thay đổi (Tiếng Việt):** [CHANGELOG.md](CHANGELOG.md) — tóm tắt phiên bản
 - [IMPROVEMENTS.md](IMPROVEMENTS.md)
 
 ---
 
 ## 🎯 Ngôn ngữ được hỗ trợ (một số)
 
 | Ngôn ngữ | Mã |
 |----------|-----|
 | Tiếng Việt | `vi` |
 | English | `en` |
 | 中文 (Chinese) | `zh-CN` |
 | 日本語 (Japanese) | `ja` |
 | 한국어 (Korean) | `ko` |
 | Français (French) | `fr` |
 | Deutsch (German) | `de` |
 | Español (Spanish) | `es` |
 | Русский (Russian) | `ru` |
 | ภาษาไทย (Thai) | `th` |
 
 ---
 
 ## 🎮 Các chế độ sử dụng
 
 1) Tự động dịch: bôi đen → popup xuất hiện (nếu bật)
 2) Popup: mở popup, nhập văn bản, chọn ngôn ngữ, nhấn Dịch
 3) Phím tắt: Không có phím tắt dịch nhanh mặc định (Ctrl+Shift+D để bật/tắt)
 4) FAB button: nút nổi trên trang để dịch nhanh
 
 ---
 
 ## ⚙️ Cấu hình (mặc định)
 
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
 
 ---
 
 ## 🛠 Kiến trúc
 
 Tệp chính:
 - `manifest.json` - cấu hình extension (MV3)
 - `background.js` - service worker (khởi tạo, logging)
 - `content.js` - script chèn lên trang
 - `popup.html` - giao diện popup
 - `popup.js` - logic popup
 - `icons/` - icon extension
 
 ---
 
 ## 🚦 Cách hoạt động (tóm tắt)
 
 1. Người dùng chọn văn bản
 2. Auto-trigger hoặc bấm nút
 3. Văn bản được kiểm tra & gửi API
 4. Nhận đáp trả và hiển thị kết quả
 5. Người dùng copy hoặc đóng
 
 ---
 
 ## 📊 Hiệu năng (ước tính)
 
 - Văn bản ngắn (<50 ký tự): <1s
 - Trung bình (500 ký tự): 1-2s
 - Dài (5000 ký tự): 2-3s
 - Timeout mạng: 8s
 
 ---
 
 ## 🔒 Quyền riêng tư
 
 - Không lưu lịch sử dịch
 - Không thu thập analytics
 - Chỉ gửi văn bản để dịch tới Google
 - Cấu hình lưu local trong trình duyệt
 
 ---
 
 ## 🐛 Vấn đề thường gặp & Khắc phục nhanh
 
 - Auto-translate không hoạt động → kiểm tra toggle trong popup
 - Timeout → thử lại hoặc kiểm tra mạng
 - Quá giới hạn ký tự → chia nhỏ văn bản
 - FAB không hiện → bật lại trong cài đặt
 
 ---
 
 ## 🚀 Lịch sử phiên bản
 
 ### 2.4.1 (2026-04-24)
 - Xóa phím tắt `Ctrl+Shift+T` để tránh xung đột với Chrome.
 
 ### 2.4.0 (2026-04-24)
 - Thêm nút dịch nổi cạnh con trỏ: hiện khi bôi đen, bấm mới dịch (giống icon Google trong ví dụ người dùng).
 - Sửa lỗi: tránh hiển thị nhiều nút chồng chéo; giữ vùng chọn khi bấm nút.
 - Cập nhật vị trí nút (phía phải, phía trên con trỏ) và timeout hiển thị nút (6s).
 - Bump `manifest.json` version → `2.4.0`.
 - Tinh chỉnh UX cho drag/resize và theme.

### 2.1.0 (2026-04-22)
 - Cải thiện xử lý lỗi
 - Hỗ trợ timeout (8s)
 - Debounce input trong popup
 - Cảnh báo giới hạn ký tự
 
 ---
 
 ## 🔮 Ý tưởng tương lai
 
 - Lưu cache dịch
 - Lịch sử dịch
 - Tuỳ chỉnh phím tắt
 - Hỗ trợ nhiều API dịch
 
 ---
 
 ## 📝 Phát triển
 
 - Clone repo
 - Vào `chrome://extensions` → Load unpacked
 - Mở DevTools để debug
 
 ---
 
 ## 📄 License
 
 MIT
 
 ---
 
 Cảm ơn bạn đã sử dụng Translate Selection! 🌐
 
 ---
 
 Lưu ý: Bản dịch tiếng Việt được tạo với sự hỗ trợ của A.I.

 imdumb.
