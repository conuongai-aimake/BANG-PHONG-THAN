import { NextRequest, NextResponse } from 'next/server';

/**
 * KHỞI TẠO ĐĂNG NHẬP FACEBOOK ĐỂ KẾT NỐI TRANG
 * Endpoint: /api/auth/facebook
 */
export async function GET(req: NextRequest) {
  const appId = process.env.META_APP_ID;
  const { origin } = new URL(req.url);
  const redirectUri = `${origin}/api/auth/facebook/callback`;

  // Kiểm tra nếu chưa điền META_APP_ID
  if (!appId || appId === 'your-meta-app-id') {
    return NextResponse.json({
      error: 'Chưa cấu hình META_APP_ID trong biến môi trường.',
      instruction: 'Vui lòng thêm META_APP_ID và META_APP_SECRET vào Vercel Settings để kích hoạt Facebook Login.'
    }, { status: 400 });
  }

  // Danh sách các quyền cần xin khi đăng nhập Facebook
  const scopes = [
    'pages_show_list',
    'pages_read_engagement',
    'pages_read_user_content',
    'read_insights',
    'business_management'
  ].join(',');

  const facebookAuthUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&scope=${encodeURIComponent(scopes)}&response_type=code`;

  return NextResponse.redirect(facebookAuthUrl);
}
