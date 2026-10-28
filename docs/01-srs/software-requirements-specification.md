# ĐẶC TẢ YÊU CẦU PHẦN MỀM (SRS)
## HỆ THỐNG QUẢN LÝ VÀ BÁO CÁO FACEBOOK MONETIZED PAGES

---

## 1. GIỚI THIỆU (INTRODUCTION)
### 1.1 Mục đích
Tài liệu này đặc tả chi tiết toàn bộ yêu cầu chức năng (Functional Requirements) và yêu cầu phi chức năng (Non-functional Requirements) cho ứng dụng Web giám sát, quản lý và báo cáo định kỳ các Trang Facebook kiếm tiền (Monetized Pages).

### 1.2 Phạm vi hệ thống
Hệ thống kết nối trực tiếp với Meta Graph API và Meta Business Manager, tự động đồng bộ hóa chỉ số tương tác, số liệu video, và doanh thu ước tính theo chu kỳ thời gian (7 ngày, 28 ngày, 90 ngày, 365 ngày, tháng này, tháng trước) và theo các nhóm Page tùy biến.

---

## 2. YÊU CẦU CHỨC NĂNG (FUNCTIONAL REQUIREMENTS)

### 2.1 Quản lý Trang (Page Management)
- **FR-01 (Thêm/Kết nối Page):** 
  - Kết nối qua Facebook Login (OAuth 2.0) tự động lấy danh sách Page có quyền quản trị.
  - Hoặc nhập thủ công `Page ID` và `Page Access Token` (dành cho Page từ System User Business Manager).
- **FR-02 (Trạng thái Kiếm tiền):** Đánh dấu trạng thái kiếm tiền của Page (In-Stream Ads, Reels Bonus, Stars, Subscriptions) và tình trạng chất lượng Page (Page Policy Health).
- **FR-03 (Quản lý Nhóm Page - Grouping):**
  - Tạo, sửa, xóa nhóm Page (ví dụ: Team Content A, Niche Giải trí, Kênh Vệ tinh...).
  - Gán/hủy 1 hoặc nhiều Page vào 1 hoặc nhiều nhóm thông qua Page ID.

### 2.2 Thu thập Dữ liệu Tự động (Data Ingestion & Sync)
- **FR-04 (Lịch đồng bộ hàng ngày):** Vercel Cron Job tự động kích hoạt Route `/api/cron/sync-facebook` mỗi ngày vào 01:00 UTC.
- **FR-05 (Các chỉ số thu thập theo ngày - Daily Metrics):**
  - Số lượng bài đăng trong ngày (Status, Photo, Video, Reels).
  - Lượt tiếp cận (Page Reach / Post Reach).
  - Lượt hiển thị (Impressions).
  - Lượt xem Video 3 giây (3-second Video Views).
  - Lượt xem Video 1 phút trở lên (1-minute Video Views - chỉ số quan trọng quyết định doanh thu In-stream).
  - Tương tác (Likes, Comments, Shares, Clicks).
  - Doanh thu ước tính (Estimated Earnings), RPM (Doanh thu trên 1000 lượt xem đủ điều kiện) và CPM.
  - Số người theo dõi mới ròng (Net Followers).
- **FR-06 (Đồng bộ thủ công - Manual Trigger):** Cung cấp nút bấm "Đồng bộ ngay" (Sync Now) cho phép người quản trị ép hệ thống cập nhật chỉ số cho 1 Page hoặc toàn bộ nhóm Page khi cần.

### 2.3 Phân tích & Báo cáo Đa Chu kỳ (Reporting Engine)
- **FR-07 (Báo cáo theo chu kỳ chuẩn):**
  - **7 ngày gần nhất (Rolling 7D):** Tổng chỉ số 7 ngày qua kèm so sánh với 7 ngày trước đó ($\Delta\%$).
  - **28 ngày gần nhất (Rolling 28D):** Khớp chu kỳ tính toán chuẩn của Meta Creator Studio.
  - **90 ngày gần nhất (Rolling 90D):** Đánh giá hiệu suất quý.
  - **365 ngày (Rolling 365D):** Đánh giá tăng trưởng năm.
  - **Tháng này (Month-to-Date):** Tính từ 00:00 ngày đầu tháng đến thời điểm hiện tại.
  - **Tháng trước (Last Month):** Toàn bộ số liệu tháng trước để đối soát bảng kê thanh toán (Payout).
- **FR-08 (Báo cáo theo Nhóm Page):**
  - Bộ lọc chọn nhóm (Single Group hoặc Multi-group).
  - Tính tổng hợp (Sum) toàn nhóm: Tổng doanh thu, tổng lượt xem 1 phút, tổng reach.
  - Bảng xếp hạng nội bộ nhóm: Top Page tăng trưởng tốt nhất, Page bị giảm sút tương tác.
- **FR-09 (Báo cáo chi tiết từng Page):**
  - Biểu đồ đường (Line chart) diễn biến doanh thu và lượt xem qua từng ngày.
  - Danh sách top bài đăng/video hiệu quả nhất trong chu kỳ đã chọn.
- **FR-10 (Xuất dữ liệu - Export):**
  - Hỗ trợ xuất bảng báo cáo ra file Excel (.xlsx) và file CSV.

---

## 3. YÊU CẦU PHI CHỨC NĂNG (NON-FUNCTIONAL REQUIREMENTS)

- **NFR-01 (Hiệu năng):** Thời gian tải bảng tổng quan báo cáo dưới 1.5 giây thông qua việc tiền tính toán bằng Database Views và Caching trên Next.js.
- **NFR-02 (Bảo mật):**
  - Toàn bộ Access Token của Facebook phải được mã hóa trước khi lưu vào Supabase.
  - Sử dụng Supabase Row Level Security (RLS) để ngăn chặn truy cập trái phép.
  - Vercel Cron Route được bảo vệ bằng `CRON_SECRET` header token.
- **NFR-03 (Khả năng chịu lỗi - Fault Tolerance):**
  - Xử lý Meta Graph API Rate Limit (Status Code 429) bằng cơ chế Retry with Exponential Backoff.
  - Lưu log lịch sử đồng bộ vào bảng `cron_sync_logs` để dễ dàng kiểm toán lỗi.
- **NFR-04 (Khả năng mở rộng - Scalability):** Hệ thống có khả năng quản lý từ hàng chục đến hàng trăm Pages đồng thời mà không bị giới hạn thời gian chạy Serverless (chia batch xử lý).
