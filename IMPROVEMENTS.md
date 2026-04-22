 # Các cải tiến - phiên bản 2.1.0
 
 ## Tổng quan
 Bản cập nhật này nâng cao độ tin cậy, hiệu năng và trải nghiệm người dùng của tiện ích.
 
 ## Nội dung chính
 
 ### 1. Xử lý lỗi chi tiết
 - Thay vì thông báo lỗi chung chung, giờ có các thông báo cụ thể cho:
   - Timeout (>8s)
   - Phản hồi API không hợp lệ
   - Lỗi kết nối
   - Yêu cầu bị hủy
 - Log console giúp dev debug nhanh hơn
 
 ### 2. Timeout cho request
 - Tất cả request có timeout 8 giây
 - Sử dụng `AbortController` để hủy yêu cầu
 
 ### 3. Debounce đầu vào
 - Giảm số lần gọi API khi gõ nhanh (300ms)
 
 ### 4. Cảnh báo giới hạn ký tự
 - Hiển thị cảnh báo khi ≥ 4500 ký tự
 - Giới hạn tối đa 5000 ký tự
 
 ### 5. Validation tốt hơn
 - Yêu cầu tối thiểu 2 ký tự để tự động dịch
 - Kiểm tra đầu vào trống khi dùng phím tắt
 
 ### 6. Hủy request cũ
 - Yêu cầu mới hủy các request đang chờ
 - Ngăn kết quả cũ ghi đè lên kết quả mới
 
 ### 7. Thông tin phiên bản và tài liệu
 - Bump phiên bản lên 2.1.0
 - Thêm tài liệu hướng dẫn và changelog
 
 ---
 
 ## Gợi ý tinh chỉnh cấu hình
 - `DEBOUNCE_MS`: điều chỉnh cho thiết bị yếu (tăng lên 500)
 - `REQUEST_TIMEOUT_MS`: tăng nếu mạng chậm
 - `CHAR_LIMIT`: giảm nếu cần giới hạn ngắn hơn
 
 ---
 
 ## Ý tưởng tương lai
 - Cache dịch, lịch sử, rate limiting, hỗ trợ nhiều API
 
 
 Lưu ý: Bản dịch tiếng Việt được tạo với sự hỗ trợ của A.I.
