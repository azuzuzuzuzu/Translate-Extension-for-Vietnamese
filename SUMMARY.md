 # Tóm tắt cải tiến
 
 Phiên bản 2.1.0 của tiện ích đã cải thiện trải nghiệm người dùng và độ ổn định với các điểm chính:
 
 ## Những cải tiến chính
 
 1. **Xử lý lỗi tốt hơn**
    - Thông báo lỗi cụ thể (timeout, offline, phản hồi không hợp lệ, hủy yêu cầu)
    - Log console chi tiết giúp debug
 
 2. **Timeout cho yêu cầu**
    - Timeout 8s và hủy yêu cầu bằng `AbortController`
    - Tránh tình trạng yêu cầu treo
 
 3. **Debounce đầu vào (popup)**
    - Giảm gọi API khi gõ nhanh (300ms)
 
 4. **Cảnh báo giới hạn ký tự**
    - Cảnh báo khi gần giới hạn 5000 ký tự (mốc 4500)
 
 5. **Hủy yêu cầu cũ khi có yêu cầu mới**
    - Ngăn race condition, đảm bảo kết quả luôn cập nhật
 
 6. **Validation tốt hơn**
    - Yêu cầu tối thiểu 2 ký tự cho selection
 
 ---
 
 ## Tệp đã cập nhật
 - `popup.js` — debounce, timeout, xử lý lỗi
 - `content.js` — timeout, hủy yêu cầu, validation
 - `background.js` — logging
 - `manifest.json` — tăng phiên bản
 
 ---
 
 ## Kế tiếp
 - Kiểm thử kỹ hơn
 - Thêm cache dịch
 - Lịch sử dịch
 
 
 Lưu ý: Bản dịch tiếng Việt được tạo với sự hỗ trợ của A.I.
