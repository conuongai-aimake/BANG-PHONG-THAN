# HƯỚNG DẪN TÍCH HỢP META GRAPH API CHO FACEBOOK MONETIZED PAGES

---

## 1. THIẾT LẬP META DEVELOPER APP

### 1.1 Khởi tạo App trên Meta for Developers
1. Truy cập [Meta for Developers](https://developers.facebook.com/) > **My Apps** > **Create App**.
2. Chọn loại ứng dụng: **Business** (để có đầy đủ quyền quản lý Page và đọc dữ liệu Insights).
3. Đặt tên App: `Bang-Phong-Than-Analytics`.
4. Kết nối App với tài khoản **Meta Business Manager (BM)** đang nắm quyền các Trang.

### 1.2 Yêu cầu cấp quyền (App Permissions)
Trong bảng điều khiển App, thêm sản phẩm **Facebook Login for Business** và cấu hình các quyền:
- `pages_show_list`: Cho phép xem danh sách các Trang thuộc quyền quản lý.
- `pages_read_engagement`: Đọc các chỉ số tương tác (Likes, comments, shares).
- `pages_read_user_content`: Đọc các bài viết, video, Reels đã đăng tải.
- `read_insights`: Đọc toàn bộ chỉ số phân tích chuyên sâu (Insights API).
- `business_management`: Cần thiết để tương tác với tài sản doanh nghiệp qua System User.

---

## 2. CHIẾN LƯỢC QUẢN LÝ ACCESS TOKEN BỀN VỮNG

Do báo cáo cần chạy tự động hàng ngày qua Vercel Cron mà không cần người dùng đăng nhập liên tục, bạn có 2 giải pháp quản lý token:

### Giải pháp A (Khuyến nghị cho Doanh nghiệp / Team sở hữu nhiều Page): System User Token
1. Trong **Meta Business Suite** > **Business Settings** > **Users** > **System Users**.
2. Tạo 1 System User với vai trò **Admin System User**.
3. Phân quyền (Assign Assets) System User này vào toàn bộ các Page cần theo dõi (quyển "Full Control" hoặc "Insights").
4. Nhấn **Generate New Token**, chọn App của bạn, tích chọn các quyền: `pages_show_list`, `pages_read_engagement`, `read_insights`.
5. Chọn thời hạn: **Never Expire (Vĩnh viễn)**.
6. Lưu token này vào biến môi trường `META_SYSTEM_USER_TOKEN` trên Vercel.

### Giải pháp B: Trao đổi Long-lived Page Access Token qua OAuth
Nếu kết nối bằng tài khoản cá nhân:
1. Người dùng cấp quyền qua Facebook Login -> nhận được **Short-lived User Token** (hạn 1 - 2 giờ).
2. Gọi API để nâng cấp lên **Long-lived User Token** (hạn 60 ngày):
   ```http
   GET https://graph.facebook.com/v19.0/oauth/access_token?
       grant_type=fb_exchange_token&
       client_id={app-id}&
       client_secret={app-secret}&
       fb_exchange_token={short-lived-user-token}
   ```
3. Lấy **Page Access Token vĩnh viễn** bằng Long-lived User Token:
   ```http
   GET https://graph.facebook.com/v19.0/{page-id}?fields=access_token&access_token={long-lived-user-token}
   ```
   *(Page Token được cấp từ Long-lived User Token của Admin sẽ không bao giờ hết hạn trừ khi Admin đổi mật khẩu hoặc xóa quyền).*

---

## 3. CÁC GRAPH API ENDPOINTS SỬ DỤNG CHO BÁO CÁO HÀNG NGÀY

Phiên bản khuyến nghị: **Graph API v19.0 hoặc v20.0**

### 3.1 Đếm số lượng nội dung xuất bản trong ngày
Để đếm số bài viết, Reels, Video đã đăng trong ngày hôm qua:
```http
GET https://graph.facebook.com/v19.0/{page-id}/published_posts?
    since={timestamp_start_of_yesterday}&
    until={timestamp_end_of_yesterday}&
    fields=id,created_time,message,attachments{media_type}&
    access_token={page-access-token}
```

### 3.2 Lấy các chỉ số tiếp cận & tương tác theo ngày (Daily Page Insights)
```http
GET https://graph.facebook.com/v19.0/{page-id}/insights?
    metric=page_impressions,page_impressions_unique,page_engaged_users,page_post_engagements,page_fans&
    period=day&
    since={timestamp_yesterday}&
    until={timestamp_today}&
    access_token={page-access-token}
```
- `page_impressions`: Tổng số lượt hiển thị.
- `page_impressions_unique`: Lượt tiếp cận (Reach).
- `page_engaged_users`: Số người tương tác với Trang.
- `page_post_engagements`: Tổng tương tác trên các bài viết.

### 3.3 Lấy chỉ số Video 3 giây & Video 1 phút (Đủ điều kiện In-stream)
```http
GET https://graph.facebook.com/v19.0/{page-id}/insights?
    metric=page_video_views,page_video_views_click_to_play,page_video_view_time&
    period=day&
    since={timestamp_yesterday}&
    until={timestamp_today}&
    access_token={page-access-token}
```
- `page_video_views`: Tổng lượt xem video từ 3 giây trở lên.
- `page_video_views_click_to_play` / `page_video_views_10s`: Lượt xem video dài (quyết định khả năng chèn quảng cáo In-Stream Ads).
- `page_video_view_time`: Tổng thời gian xem video tính bằng milliseconds.

### 3.4 Số liệu doanh thu kiếm tiền (Monetization Insights)
Đối với Page đã bật kiếm tiền, Meta cung cấp endpoint lấy doanh thu ước tính:
```http
GET https://graph.facebook.com/v19.0/{page-id}/insights?
    metric=page_daily_video_ad_break_earnings,page_daily_video_ad_break_ad_impressions,page_daily_video_ad_break_cpm&
    period=day&
    since={timestamp_yesterday}&
    until={timestamp_today}&
    access_token={page-access-token}
```

---

## 4. QUẢN LÝ RATE LIMIT CỦA META

- Graph API áp dụng giới hạn: **200 cuộc gọi / giờ / người dùng ứng dụng**.
- Trong mỗi phản hồi API, kiểm tra Header `X-App-Usage` và `X-Business-Use-Case-Usage`:
  ```json
  {"call_count": 28, "total_cputime": 15, "total_time": 20}
  ```
- Nếu `call_count > 80%`, hệ thống tự động delay tạm thời trước khi xử lý Page tiếp theo.
- Khuyến nghị: Gom các lời gọi API của 1 Page vào một yêu cầu duy nhất bằng tính năng **Batch Requests** của Meta:
  ```http
  POST https://graph.facebook.com/v19.0/
  batch=[
    {"method":"GET", "relative_url":"{page-id}/insights?metric=..."},
    {"method":"GET", "relative_url":"{page-id}/published_posts?..."}
  ]
  ```
