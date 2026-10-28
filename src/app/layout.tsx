import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Bảng Phong Thần - Quản Lý & Báo Cáo Facebook Monetized Pages',
  description: 'Hệ thống theo dõi nội dung đăng tải, lượt xem video 1 phút, tiếp cận và doanh thu Facebook Pages kiếm tiền theo chu kỳ 7d, 28d, 90d, 365d và nhóm Page.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
