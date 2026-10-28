# ĐẶC TẢ YÊU CẦU PHẦN MỀM (SRS TOÀN DIỆN V1 + V2)
## HỆ THỐNG QUẢN LÝ VÀ BÁO CÁO FACEBOOK MONETIZED PAGES

---

## 1. GIỚI THIỆU & MỤC TIÊU TỔNG QUAN
Hệ thống là nền tảng quản trị và phân tích tập trung cho các Trang Facebook kiếm tiền (In-Stream Ads, Reels Bonus, Stars) với đầy đủ chức năng cốt lõi (V1) kết hợp các phân hệ nâng cấp vận hành doanh nghiệp (V2):

- **Nền tảng cốt lõi V1:**
  - Theo dõi hoạt động xuất bản nội dung (bài viết, video, Reels) hàng ngày.
  - Tự động thu thập chỉ số tiếp cận (Reach), lượt xem video 1 phút (In-Stream), lượt xem 3 giây, doanh thu ước tính (Estimated Earnings), RPM, CPM.
  - Báo cáo chu kỳ: **7 ngày, 28 ngày (chuẩn Facebook Studio), 90 ngày (quý), 365 ngày (năm), Tháng này (MTD), Tháng trước (Last Month)**.
  - Phân loại và tổng hợp theo **Nhóm Page ID** (Group Aggregation).
  - Biểu đồ tăng trưởng trực quan và xuất dữ liệu báo cáo.
- **Phân hệ nâng cấp mở rộng V2:**
  - **Quản lý Hồ sơ Payout:** Gom nhóm các Page nhận chung tài khoản ngân hàng để đối soát dòng tiền chuyển về hàng tháng.
  - **Giám sát Sức khỏe & Thuật toán Đề xuất:** Phát hiện trang bị hạn chế kiếm tiền (Vàng), tắt kiếm tiền (Đỏ) và cảnh báo sớm dấu hiệu tụt giảm phân phối / mất đề xuất.
  - **Vòng đời Page trong Business Manager (BM):** Tự động phát hiện khi BM có thêm Page mới và đánh dấu khi Page bị gỡ khỏi BM.
  - **Phân quyền Google Auth & RBAC:** Phân cấp quản trị viên (Admin) và thành viên (Editor/Member) chỉ được xem Page được chỉ định.
  - **Báo cáo Hoa hồng Nhân sự (Commission Engine):** Thiết lập tỷ lệ % hoa hồng theo doanh thu và báo cáo số tiền thực nhận của từng nhân sự.

---

## 2. YÊU CẦU CHỨC NĂNG CỐT LÕI (CORE FUNCTIONAL REQUIREMENTS - V1)

### 2.1 Quản lý Trang (Page Management)
- **FR-01 (Thêm/Kết nối Page):**
  - Kết nối qua Facebook Login (OAuth 2.0) tự động lấy danh sách Page có quyền quản trị.
  - Nhập thủ công `Page ID` và `Page Access Token` (từ System User Business Manager).
- **FR-02 (Trạng thái Kiếm tiền):** Đánh dấu trạng thái kiếm tiền của Page (In-Stream Ads, Reels Bonus, Stars, Subscriptions).
- **FR-03 (Quản lý Nhóm Page - Grouping):**
  - Tạo, sửa, xóa nhóm Page (Ví dụ: Team Content A, Niche Giải trí, Kênh Vệ tinh...).
  - Gán/hủy 1 hoặc nhiều Page vào 1 hoặc nhiều nhóm thông qua Page ID.

### 2.2 Thu thập Dữ liệu Tự động (Data Ingestion & Sync)
- **FR-04 (Lịch đồng bộ hàng ngày qua Vercel Cron):** Tự động kích hoạt Route `/api/cron/sync-facebook` mỗi ngày vào 01:00 UTC (08:00 sáng VN).
- **FR-05 (Các chỉ số thu thập theo ngày - Daily Metrics):**
  - Số lượng bài đăng trong ngày (Status, Photo, Video, Reels).
  - Lượt tiếp cận (Page Reach / Post Reach).
  - Lượt hiển thị (Impressions).
  - Lượt xem Video 3 giây (3-second Video Views).
  - Lượt xem Video 1 phút trở lên (1-minute Video Views - tiêu chuẩn In-Stream).
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
- **FR-09 (Báo cáo chi tiết từng Page & Biểu đồ Tăng trưởng):**
  - Biểu đồ đường (Line chart) diễn biến doanh thu và lượt xem qua từng ngày.
  - Danh sách top bài đăng/video hiệu quả nhất trong chu kỳ đã chọn.
- **FR-10 (Xuất dữ liệu - Export):** Hỗ trợ xuất bảng báo cáo ra file Excel (.xlsx) và file CSV.

---

## 3. YÊU CẦU CHỨC NĂNG MỞ RỘNG (ENTERPRISE EXTENSIONS - V2)

### 3.1 Quản lý Hồ sơ Payout (Payout Profiles Management)
- **FR-11 (Gom nhóm & Báo cáo theo Hồ sơ Payout):**
  - Cho phép khai báo danh mục Hồ sơ Payout (Tên tài khoản, Ngân hàng, Người thụ hưởng, Mã số thuế, Meta Payout ID).
  - Gán các Page ID vào Hồ sơ Payout tương ứng.
  - Báo cáo chu kỳ (7d, 28d, tháng trước, tháng này) tổng hợp số tiền mà từng tài khoản Payout sẽ nhận về để đối soát trực tiếp với tiền về tài khoản ngân hàng.

### 3.2 Giám sát Sức khỏe & Cảnh báo Mất đề xuất (Page Health & Algorithm Drop)
- **FR-12 (Giám sát Sức khỏe & Trạng thái phân phối):**
  - Phân loại trạng thái kiếm tiền: 🟢 Eligible (Xanh), 🟡 Restricted (Vàng - Hạn chế), 🔴 Demonetized (Đỏ - Tắt kiếm tiền).
  - Thuật toán phát hiện "Mất đề xuất": Tự động phân tích tỷ lệ `Viral Reach %`. Nếu giảm đột ngột > 65% trong 3 ngày liên tiếp, hệ thống gắn cờ cảnh báo `Mất đề xuất` để team nội dung xử lý.

### 3.3 Cơ chế Kết nối & Vòng đời Trang trong Business Manager (BM)
- **FR-13 (Vòng đời Page trong BM):**
  - Sử dụng System User Access Token cấp từ Business Manager (BM) với quyền quản trị tài sản (`business_management`).
  - **Tự động quét Page mới thêm vào BM:** Khi có Page mới trong BM, hệ thống tự động lưu vào DB ở trạng thái `pending_setup`.
  - **Xử lý Page bị gỡ khỏi BM:** Khi Page bị gỡ khỏi BM hoặc mất quyền truy cập, hệ thống đánh dấu trạng thái `removed_from_bm` và tạm dừng cron, nhưng **giữ nguyên toàn bộ lịch sử doanh thu quá khứ**.

### 3.4 Quản lý Thành viên qua Google Auth (RBAC)
- **FR-14 (Xác thực Google & Phân chia thẩm quyền):**
  - Đăng nhập 1-click qua Google OAuth (Supabase Auth).
  - Phân tầng vai trò:
    1. *Super Admin:* Toàn quyền quản trị BM, Payout, xem tất cả Page và hoa hồng nhân sự.
    2. *Manager:* Quản lý các Page thuộc Nhóm được phân công.
    3. *Member / Editor:* Chỉ xem các Page được chỉ định, xem lượt xem và phần hoa hồng cá nhân thực nhận.

### 3.5 Báo cáo Hoa hồng Doanh thu Thành viên (Commission Engine)
- **FR-15 (Tính toán & Đối soát Hoa hồng):**
  - Thiết lập tỷ lệ % hoa hồng (`commission_rate_pct`, ví dụ: 25%) cho từng nhân sự trên từng Page cụ thể.
  - Khi thành viên đăng nhập, hệ thống tự động tính:
    $$\text{Hoa hồng nhận về} = \text{Doanh thu Page kiếm về} \times \% \text{Hoa hồng}$$
  - Cung cấp bảng báo cáo đối soát thu nhập minh bạch theo chu kỳ tháng này, tháng trước.

---

## 4. YÊU CẦU PHI CHỨC NĂNG (NON-FUNCTIONAL REQUIREMENTS)

- **NFR-01 (Hiệu năng):** Thời gian phản hồi bảng điều khiển dưới 1.5 giây thông qua Database Views và Next.js Caching.
- **NFR-02 (Bảo mật):** Toàn bộ Page Access Token được mã hóa AES-256; dữ liệu người dùng bảo vệ qua Supabase RLS.
- **NFR-03 (Khả năng chịu lỗi):** Xử lý Rate Limit của Meta Graph API bằng cơ chế Exponential Backoff; lưu vết đầy đủ trong `cron_sync_logs` và `bm_sync_logs`.
- **NFR-04 (Tính toàn vẹn dữ liệu):** Dữ liệu lịch sử doanh thu và chỉ số các Page bị gỡ khỏi BM được bảo toàn vĩnh viễn cho mục đích kế toán và kiểm toán.
