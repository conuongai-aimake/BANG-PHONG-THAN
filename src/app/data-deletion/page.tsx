import React from 'react';

export default function DataDeletionPage() {
  return (
    <main style={{ maxWidth: '800px', margin: '40px auto', padding: '0 24px 60px', color: '#E2E8F0', fontFamily: 'sans-serif', lineHeight: '1.7' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>
        Hướng Dẫn Yêu Cầu Xóa Dữ Liệu Người Dùng
      </h1>
      <p style={{ color: '#94A3B8', fontSize: '0.9rem', marginBottom: '32px' }}>
        Theo chính sách bảo vệ dữ liệu của Meta Platform và ứng dụng: BẢNG PHONG THẦN
      </p>

      <section style={{ marginBottom: '24px' }}>
        <p>
          Ứng dụng <strong>BẢNG PHONG THẦN</strong> tôn trọng quyền kiểm soát dữ liệu cá nhân của bạn. Nếu bạn muốn xóa dữ liệu hoặc thu hồi quyền truy cập của ứng dụng đối với tài khoản Facebook và Trang của mình, bạn có thể thực hiện theo 2 cách dưới đây:
        </p>
      </section>

      <section style={{ marginBottom: '24px', background: 'rgba(255, 255, 255, 0.04)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <h2 style={{ fontSize: '1.2rem', color: '#38BDF8', marginBottom: '10px' }}>
          Cách 1: Gỡ bỏ ứng dụng trực tiếp trên Facebook (Tự động xóa quyền)
        </h2>
        <ol style={{ paddingLeft: '20px', lineHeight: '1.8' }}>
          <li>Đăng nhập vào tài khoản Facebook của bạn.</li>
          <li>Truy cập vào <strong>Cài đặt & Quyền riêng tư</strong> &gt; <strong>Cài đặt</strong>.</li>
          <li>Chọn mục <strong>Ứng dụng và trang web</strong> ở thanh menu bên trái.</li>
          <li>Tìm ứng dụng <strong>BẢNG PHONG THẦN</strong> và nhấn nút <strong>Gỡ (Remove)</strong>.</li>
          <li>Xác nhận để thu hồi toàn bộ quyền truy cập dữ liệu của ứng dụng.</li>
        </ol>
      </section>

      <section style={{ marginBottom: '24px', background: 'rgba(255, 255, 255, 0.04)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <h2 style={{ fontSize: '1.2rem', color: '#34D399', marginBottom: '10px' }}>
          Cách 2: Gửi yêu cầu xóa toàn bộ dữ liệu lưu trữ trên hệ thống của chúng tôi
        </h2>
        <p style={{ marginBottom: '10px' }}>
          Nếu bạn muốn chúng tôi xóa vĩnh viễn toàn bộ các bản ghi về Trang, chỉ số lịch sử và tài khoản của bạn khỏi cơ sở dữ liệu:
        </p>
        <p>
          Vui lòng gửi email đến hòm thư: <strong style={{ color: '#38BDF8' }}>master.nuongquantri@gmail.com</strong> với tiêu đề:
          <br />
          <code>[Yêu cầu xóa dữ liệu] - Facebook Page ID / Email của bạn</code>
        </p>
        <p style={{ marginTop: '10px' }}>
          Đội ngũ kỹ thuật của chúng tôi sẽ xử lý và xóa vĩnh viễn toàn bộ dữ liệu của bạn trong vòng <strong>24 - 48 giờ làm việc</strong> và gửi email xác nhận hoàn tất cho bạn.
        </p>
      </section>
    </main>
  );
}
