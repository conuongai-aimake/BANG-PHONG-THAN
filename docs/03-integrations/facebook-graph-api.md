# HƯỚNG DẪN TÍCH HỢP META GRAPH API NÂNG CAO (V2)
## ĐỒNG BỘ BUSINESS MANAGER, HỒ SƠ PAYOUT & GIÁM SÁT SỨC KHỎE TRANG

---

## 1. ĐỒNG BỘ HAI CHIỀU VỚI META BUSINESS MANAGER (BM)

### 1.1 Quét danh sách Trang thuộc BM
Để tự động phát hiện Trang mới được thêm vào Doanh nghiệp hoặc Trang đã bị gỡ bỏ, hệ thống gọi 2 endpoints quản trị tài sản:

```http
# 1. Trang do BM trực tiếp sở hữu (Owned Pages)
GET https://graph.facebook.com/v19.0/{business-id}/owned_pages?
    fields=id,name,category,access_token,tasks&
    access_token={meta-system-user-token}

# 2. Trang được đối tác cấp quyền vào BM (Client Pages)
GET https://graph.facebook.com/v19.0/{business-id}/client_pages?
    fields=id,name,category,access_token,tasks&
    access_token={meta-system-user-token}
```

### 1.2 Thuật toán xử lý vòng đời Page:
1. **Phát hiện Trang mới:** So sánh tập hợp `Page IDs từ API` với `Page IDs trong Supabase`. Các ID chưa có trong DB sẽ được tự động Insert với trạng thái `pending_setup` và thông báo cho Quản trị viên gán nhóm / hồ sơ Payout.
2. **Phát hiện Trang bị gỡ khỏi BM:** Nếu một Page ID có trong DB nhưng không còn nằm trong kết quả trả về từ BM, hoặc nhận mã lỗi:
   - `Error Code 190 (Invalid OAuth access token)`
   - `Error Code 10 (Application does not have permission for this action)`
   => Hệ thống chuyển trạng thái `bm_sync_status = 'removed_from_bm'` và ngừng gọi cron hàng ngày cho Page này, nhưng **giữ nguyên toàn bộ lịch sử doanh thu**.

---

## 2. KỸ THUẬT LẤY THÔNG TIN HỒ SƠ THANH TOÁN (PAYOUT ACCOUNTS)

### 2.1 Giới hạn của Meta Payout API
- Meta cung cấp API Payout (`GET /{business-id}/payout_accounts`), tuy nhiên API này yêu cầu thẩm định tài khoản doanh nghiệp mức độ **Finance Permissions** và App Review nghiêm ngặt.
- **Giải pháp kiến trúc kết hợp (Hybrid Solution):**
  - Hệ thống cung cấp cơ chế gán liên kết mềm giữa `pages` và `payout_profiles`.
  - Nếu BM System User có quyền `finance_management`, hệ thống tự động kéo các đợt giải ngân (Disbursements) và trạng thái thanh toán từ Meta.
  - Nếu không, người dùng chỉ cần khai báo 1 lần Hồ sơ Payout (Tên tài khoản, Ngân hàng, Người thụ hưởng, ID Payout) trên giao diện Web, hệ thống sẽ tự động tính tổng tiền đối soát.

---

## 3. CÔNG NGHỆ GIÁM SÁT KIẾM TIỀN & PHÁT HIỆN "MẤT ĐỀ XUẤT"

### 3.1 Kiểm tra trạng thái kiếm tiền
```http
GET https://graph.facebook.com/v19.0/{page-id}?
    fields=monetization_eligibility,is_published&
    access_token={page-access-token}
```
- Phân loại trạng thái:
  - `eligible`: Trang xanh, đủ điều kiện bật In-stream Ads / Reels Play.
  - `restricted`: Trang vàng, bị hạn chế do vi phạm bản quyền / chính sách tiêu chuẩn cộng đồng.
  - `ineligible`: Trang đỏ, bị tước quyền kiếm tiền.

### 3.2 Thuật toán phát hiện "Mất đề xuất" (Algorithmic Drop Detection)
Meta không có cờ "mất đề xuất" trực tiếp trong API, nhưng thuật toán phân phối được đo lường chính xác qua 2 chỉ số:
1. `page_impressions_viral`: Lượt hiển thị nhận được thông qua bạn bè chia sẻ hoặc bảng tin đề xuất của Facebook (For You).
2. `page_posts_impressions_viral_unique`: Lượt tiếp cận lan truyền độc nhất.

```http
GET https://graph.facebook.com/v19.0/{page-id}/insights?
    metric=page_impressions,page_impressions_viral,page_impressions_unique&
    period=day&
    access_token={page-access-token}
```

**Công thức phát hiện:**
$$\text{Viral Ratio} = \frac{\text{page\_impressions\_viral}}{\text{page\_impressions}} \times 100\%$$
- Nếu $\text{Viral Ratio}$ trong 3 ngày liên tiếp giảm **> 65%** so với trung bình 7 ngày trước đó, hệ thống tự động đổi `recommendation_status = 'dropped'` và phát chuông cảnh báo trên Dashboard.

---

## 4. TÍCH HỢP DOANH THU KIẾM TIỀN CHUẨN META GRAPH API v23.0

Từ Graph API v23.0 (theo [Graph API v23.0 update của Meta](https://developers.facebook.com/blog/post/2025/05/29/introducing-graph-api-v23-and-marketing-api-v23/)), Meta đã giới thiệu hai metric doanh thu chuyên biệt cần được gọi qua phương thức **POST** và tách biệt độc lập:

### 4.1 Danh sách Endpoints v23.0:

| Mức độ | Metric | Endpoint (POST) |
| :--- | :--- | :--- |
| **Cấp Trang (Page level)** | `content_monetization_earnings` | `POST https://graph.facebook.com/v23.0/{page_id}/content_monetization_earnings` |
| **Cấp Trang (Page level)** | `monetization_approximate_earnings` | `POST https://graph.facebook.com/v23.0/{page_id}/monetization_approximate_earnings` |
| **Cấp Bài đăng / Video** | `content_monetization_earnings` | `POST https://graph.facebook.com/v23.0/{page_id}_{asset_id}/content_monetization_earnings` |
| **Cấp Bài đăng / Video** | `monetization_approximate_earnings` | `POST https://graph.facebook.com/v23.0/{page_id}_{asset_id}/monetization_approximate_earnings` |

---

### 4.2 Đặc tả chi tiết từng Metric & Quy tắc xử lý dữ liệu:

#### 1. `content_monetization_earnings`
- **Đặc điểm:** Doanh thu thực tế gắn với nội dung đã được ghi nhận trong hệ thống kiếm tiền.
- **Quy tắc định dạng số tiền:**
  - Có thể trả về số tiền dạng `micro_amount` (ví dụ `1,000,000` micro_amount = `1.00` đơn vị tiền tệ) kèm mã tiền tệ `currency` (ví dụ `"USD"`, `"VND"`).
  - Thuật toán chuyển đổi: $\text{amount} = \frac{\text{micro\_amount}}{1,000,000}$ nếu trường `micro_amount` tồn tại.
  - Luôn lưu giữ trường `currency` đi kèm để hiển thị chính xác theo đơn vị thực tế.

#### 2. `monetization_approximate_earnings`
- **Đặc điểm:** Doanh thu **ước tính (approximate)**, không phải số tiền thanh toán cuối cùng (Final Payout).
- **Rủi ro điều chỉnh:** Có thể thay đổi sau đó do quá trình kiểm duyệt nội dung, khiếu nại bản quyền hoặc điều chỉnh đối soát từ Meta.
- **QUY TẮC CỐT LÕI VỀ TIỀN TỆ:**
  - Có thể trả về số thuần **không kèm đơn vị / tiền tệ (`currency`/`unit`)**.
  - **TUYỆT ĐỐI KHÔNG** được tự động gán mặc định là `USD` rồi định dạng hai chữ số thập phân (`$0.00`) nếu API không trả trường `currency`/`unit`.
  - Hệ thống lưu trữ cả giá trị thô (`raw_value`) và cờ `has_currency` để giao diện hiển thị linh hoạt (nếu có currency hiển thị mã tiền tệ, nếu không có hiển thị dạng số chỉ số lượng thuần).

---

### 4.3 Độ trễ dữ liệu & Xử lý ngoại lệ (Graceful Degradation)
- **Độ trễ:** Dữ liệu doanh thu kiếm tiền của Meta thường có độ trễ từ **24 đến 48 giờ** so với thời gian thực.
- **Trường hợp không có dữ liệu:** API có thể không trả về hoặc báo lỗi trong các trường hợp:
  1. Trang chưa tham gia hoặc chưa đủ điều kiện bật kiếm tiền (In-stream Ads / Reels Play).
  2. Trang đang bị hạn chế (Restricted) hoặc vi phạm chính sách.
  3. Token của người dùng / System User thiếu quyền hạn (`read_insights`, `pages_read_engagement`, `pages_read_user_content`).
- **Xử lý:** Khi một trong hai endpoint không trả dữ liệu, hệ thống tự động ghi nhận `is_available: false`, ghi log cảnh báo và **không làm gián đoạn** tiến trình đồng bộ các chỉ số khác của Trang.

---

### 4.4 Phân biệt cấp Page vs cấp Bài đăng (Post / Asset level)
- Các tham số về thời gian (`period`, `since`, `until`) và phân tích (`breakdown`) có sự khác biệt giữa cấp Page và cấp Bài đăng:
  - Cấp Page hỗ trợ tổng hợp theo chu kỳ ngày (`period=day`).
  - Cấp Bài đăng / Asset (`{page_id}_{asset_id}`) gắn liền với vòng đời của video/bài đăng cụ thể và có thể chỉ hỗ trợ `lifetime` hoặc breakdown theo vị trí đặt quảng cáo.
  - **Không dùng chung một tham số truy vấn cho cả hai cấp độ.**

---

### 4.5 Tài liệu kỹ thuật tham khảo chính thức:
- [Meta Developer Blog - Graph API v23.0 & Marketing API v23.0 Update](https://developers.facebook.com/blog/post/2025/05/29/introducing-graph-api-v23-and-marketing-api-v23/)
- [Page Insights API Reference](https://developers.facebook.com/docs/graph-api/reference/page/insights/)
- [Insights API Overview](https://developers.facebook.com/docs/graph-api/reference/insights/)
- [Pages API Reference](https://developers.facebook.com/docs/pages-api/)
- [Meta Facebook Login - Access Tokens Guide](https://developers.facebook.com/docs/facebook-login/guides/access-tokens/)
- [Permissions Reference](https://developers.facebook.com/docs/permissions/reference/)
