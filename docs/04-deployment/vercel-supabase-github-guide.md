# HƯỚNG DẪN TRIỂN KHAI HỆ THỐNG VỚI GITHUB, SUPABASE VÀ VERCEL

---

## 1. QUY TRÌNH KẾT NỐI 3 NỀN TẢNG

```
[Mã nguồn cục bộ] ─── git push ───► [GitHub Repository]
                                             │ (Tự động kích hoạt)
                                             ▼
                                     [Vercel Deployment]
                                             │
                       ┌─────────────────────┴─────────────────────┐
                       ▼                                           ▼
             [Supabase Database]                         [Meta Graph API]
       (PostgreSQL Tables & Views)                     (Kéo số liệu hàng ngày)
```

---

## 2. BƯỚC 1: KHỞI TẠO CƠ SỞ DỮ LIỆU TRÊN SUPABASE

1. Truy cập [Supabase Dashboard](https://supabase.com/dashboard) và tạo một Project mới (Ví dụ: `bang-phong-than-db`).
2. Chọn khu vực (Region) gần nhất: **Singapore (Southeast Asia - ap-southeast-1)** để giảm độ trễ truy vấn.
3. Điều hướng tới **SQL Editor** trong thanh menu bên trái.
4. Mở file [database-schema.sql](../02-architecture/database-schema.sql) trong thư mục dự án, copy toàn bộ nội dung và dán vào SQL Editor, sau đó nhấn **Run**.
5. Vào mục **Project Settings** > **API**:
   - Sao chép **Project URL** (`https://xyz.supabase.co`).
   - Sao chép **anon public key**.
   - Sao chép **service_role secret key** (Dùng cho Vercel Cron và Server Actions bảo mật).

---

## 3. BƯỚC 2: TẠO REPOSITORY TRÊN GITHUB VÀ ĐẨY MÃ NGUỒN

1. Đăng nhập [GitHub](https://github.com/) và tạo một Repository mới (Ví dụ: `bang-phong-than`).
2. Tại thư mục máy tính cục bộ, khởi tạo Git và push lên GitHub:
   ```bash
   git init
   git add .
   git commit -m "feat: init project architecture and supabase schema"
   git branch -M main
   git remote add origin https://github.com/<your-username>/bang-phong-than.git
   git push -u origin main
   ```

---

## 4. BƯỚC 3: KẾT NỐI VÀ TRIỂN KHAI TRÊN VERCEL

1. Truy cập [Vercel Dashboard](https://vercel.com/dashboard) > Chọn **Add New...** > **Project**.
2. Chọn Repository `bang-phong-than` từ GitHub đã liên kết.
3. Trong phần **Environment Variables**, cấu hình các biến sau:
   - `NEXT_PUBLIC_SUPABASE_URL`: URL của Supabase.
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Anon Key của Supabase.
   - `SUPABASE_SERVICE_ROLE_KEY`: Service Role Secret của Supabase.
   - `META_APP_ID`: ID của ứng dụng Meta Developer.
   - `META_APP_SECRET`: App Secret của ứng dụng Meta Developer.
   - `CRON_SECRET`: Một chuỗi ký tự bí mật ngẫu nhiên (dùng để bảo vệ endpoint cron job không bị bên ngoài kích hoạt trái phép).
4. Nhấn **Deploy**. Sau 1 - 2 phút, website của bạn sẽ hoạt động tại địa chỉ: `https://bang-phong-than.vercel.app`.

---

## 5. BƯỚC 4: THIẾT LẬP VERCEL CRON JOB CHẠY BÁO CÁO HÀNG NGÀY

Trong thư mục gốc của dự án, file `vercel.json` định nghĩa lịch chạy tự động:

```json
{
  "crons": [
    {
      "path": "/api/cron/sync-facebook",
      "schedule": "0 1 * * *"
    }
  ]
}
```
- `0 1 * * *`: Chạy vào lúc 01:00 UTC (tức **08:00 sáng giờ Việt Nam**) mỗi ngày.
- Cơ chế bảo vệ trong Serverless API Route:
  ```typescript
  // Trong /api/cron/sync-facebook/route.ts
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }
  ```
- Khi Vercel Cron chạy, nó tự động gửi Header `Authorization: Bearer <CRON_SECRET>`. Endpoint này sẽ:
  1. Đọc danh sách Pages cần đồng bộ từ Supabase.
  2. Kéo dữ liệu Insights ngày hôm qua từ Meta Graph API.
  3. Ghi vào bảng `daily_page_metrics`.
  4. Ghi nhận log vào bảng `cron_sync_logs`.
