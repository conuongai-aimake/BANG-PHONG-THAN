import React from 'react';

export default function PrivacyPolicyPage() {
  return (
    <main style={{ maxWidth: '800px', margin: '40px auto', padding: '0 24px 60px', color: '#E2E8F0', fontFamily: 'sans-serif', lineHeight: '1.7' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>
        Chính Sách Quyền Riêng Tư (Privacy Policy)
      </h1>
      <p style={{ color: '#94A3B8', fontSize: '0.9rem', marginBottom: '32px' }}>
        Cập nhật lần cuối: 29/10/2026 | Ứng dụng: BẢNG PHONG THẦN
      </p>

      <section style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '10px' }}>1. Giới thiệu</h2>
        <p>
          Ứng dụng <strong>BẢNG PHONG THẦN</strong> (vận hành bởi Cô Nương AI) cam kết bảo vệ quyền riêng tư và dữ liệu cá nhân của người dùng. Chính sách này giải thích cách chúng tôi thu thập, sử dụng và bảo vệ dữ liệu khi bạn kết nối Trang Facebook của mình với hệ thống phân tích của chúng tôi.
        </p>
      </section>

      <section style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '10px' }}>2. Dữ liệu chúng tôi thu thập</h2>
        <p>Hệ thống chỉ thu thập các dữ liệu cần thiết theo sự cho phép của bạn thông qua Meta Graph API:</p>
        <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
          <li>Thông tin định danh Trang: ID Trang, Tên Trang, Danh mục Trang.</li>
          <li>Chỉ số hiệu suất công khai: Lượt tiếp cận (Reach), lượt hiển thị (Impressions), lượt xem video 1 phút, lượt xem 3 giây, số bài viết xuất bản.</li>
          <li>Chỉ số doanh thu ước tính và RPM/CPM đối với các Trang đã bật kiếm tiền do chính bạn quản lý.</li>
          <li>Địa chỉ Email và tên người dùng khi đăng nhập vào hệ thống.</li>
        </ul>
      </section>

      <section style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '10px' }}>3. Mục đích sử dụng dữ liệu</h2>
        <p>Dữ liệu thu thập chỉ phục vụ các mục đích sau:</p>
        <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
          <li>Hiển thị bảng báo cáo phân tích theo chu kỳ 7 ngày, 28 ngày, 90 ngày, 365 ngày cho người dùng.</li>
          <li>Hỗ trợ người quản trị đối soát doanh thu kiếm tiền từ Facebook.</li>
          <li>Chúng tôi <strong>tuyệt đối không chia sẻ, bán hoặc chuyển giao</strong> dữ liệu của bạn cho bất kỳ bên thứ ba nào.</li>
        </ul>
      </section>

      <section style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '10px' }}>4. Bảo mật dữ liệu</h2>
        <p>
          Mọi mã thông báo truy cập (Access Token) đều được mã hóa bằng tiêu chuẩn mã hóa AES-256 trước khi lưu trữ trong cơ sở dữ liệu bảo mật với tường lửa bảo vệ.
        </p>
      </section>

      <section style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '10px' }}>5. Quyền xóa dữ liệu</h2>
        <p>
          Người dùng có toàn quyền yêu cầu xóa toàn bộ dữ liệu của mình bất kỳ lúc nào. Vui lòng xem hướng dẫn chi tiết tại trang <a href="/data-deletion" style={{ color: '#38BDF8' }}>Hướng dẫn xóa dữ liệu</a>.
        </p>
      </section>

      <section>
        <h2 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '10px' }}>6. Thông tin liên hệ</h2>
        <p>
          Nếu bạn có bất kỳ câu hỏi nào về chính sách quyền riêng tư, vui lòng liên hệ với chúng tôi qua Email: <strong style={{ color: '#38BDF8' }}>master.nuongquantri@gmail.com</strong>.
        </p>
      </section>
    </main>
  );
}
