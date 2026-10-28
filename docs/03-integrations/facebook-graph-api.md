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
