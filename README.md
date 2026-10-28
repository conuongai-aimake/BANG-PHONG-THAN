# HỆ THỐNG QUẢN LÝ VÀ BÁO CÁO FACEBOOK MONETIZED PAGES
> **Tech Stack:** Next.js (App Router) + Supabase (PostgreSQL) + Vercel (Hosting & Cron) + GitHub + Meta Graph API

---

## 📌 TỔNG QUAN DỰ ÁN
Nền tảng Web chuyên dụng phục vụ việc quản lý danh mục các Trang Facebook kiếm tiền (In-stream Ads, Reels Bonus, Stars) với các khả năng cốt lõi:
- 📊 **Theo dõi hoạt động nội dung:** Số lượng bài viết, Reels, Video xuất bản hàng ngày.
- 💰 **Đo lường hiệu suất & Doanh thu:** Tự động lấy chỉ số Tiếp cận (Reach), Lượt xem video 1 phút (In-stream Views), Lượt xem 3 giây, Doanh thu ước tính (Estimated Earnings), RPM, CPM.
- ⏱️ **Báo cáo chu kỳ tự động:** 7 ngày gần nhất, 28 ngày (chuẩn Creator Studio), 90 ngày (quý), 365 ngày (năm), Tháng này (MTD), Tháng trước (Last Month đối soát Payout).
- 🏷️ **Phân nhóm Page linh hoạt:** Gom cụm Page theo Page ID (theo team, theo chủ đề nội dung, theo kênh vệ tinh) để so sánh và đánh giá hiệu quả tổng hợp.
- ⚡ **Hoạt động tự động 100%:** Sử dụng Vercel Cron kết hợp Meta System User Token và Supabase PostgreSQL Views.

---

## 🏗️ CẤU TRÚC TÀI LIỆU VÀ MÃ NGUỒN

Tài liệu được phân loại rõ ràng trong thư mục `docs/`:

| Tài liệu | Nội dung chi tiết |
| :--- | :--- |
| 📄 [SRS Requirements](docs/01-srs/software-requirements-specification.md) | Đặc tả toàn bộ yêu cầu chức năng (FR) và phi chức năng (NFR). |
| 🗄️ [Database Schema](docs/02-architecture/database-schema.sql) | Toàn bộ script SQL khởi tạo bảng, quan hệ, indexes và Views báo cáo chu kỳ trên Supabase. |
| 🔌 [Meta Graph API](docs/03-integrations/facebook-graph-api.md) | Chi tiết thiết lập Meta Developer App, cấu hình Token vĩnh viễn và các Endpoints. |
| 🚀 [Deployment Guide](docs/04-deployment/vercel-supabase-github-guide.md) | Hướng dẫn kết nối GitHub -> Vercel -> Supabase và cấu hình Cron Job. |

---

## ⚙️ BIẾN MÔI TRƯỜNG CẦN THIẾT (.env.example)

Tạo file `.env.local` ở máy cục bộ và khai báo trên Vercel:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Meta Developer App
META_APP_ID=your-meta-app-id
META_APP_SECRET=your-meta-app-secret
META_SYSTEM_USER_TOKEN=your-long-lived-or-system-user-token

# Vercel Cron Security
CRON_SECRET=your-random-secure-string-key
```

---

## 🛠️ LỘ TRÌNH TRIỂN KHAI THEO QUY TRÌNH PHẦN MỀM

- [x] **Bước 1:** Lập kế hoạch tài liệu và thiết kế kiến trúc kỹ thuật (SRS, ERD, Schema, API Spec).
- [ ] **Bước 2:** Khởi tạo Source Code (Next.js 14/15 App Router, Supabase Client SDK, Tailwind/CSS System).
- [ ] **Bước 3:** Cài đặt Cơ sở dữ liệu trên Supabase qua file SQL Migration.
- [ ] **Bước 4:** Xây dựng Module Meta Sync Service & Route `/api/cron/sync-facebook`.
- [ ] **Bước 5:** Xây dựng Giao diện Web Dashboard (Lọc chu kỳ 7d/28d/90d/365d/tháng, gom nhóm Page ID, biểu đồ trực quan).
- [ ] **Bước 6:** Đẩy mã nguồn lên GitHub và kết nối Deploy tự động trên Vercel.
