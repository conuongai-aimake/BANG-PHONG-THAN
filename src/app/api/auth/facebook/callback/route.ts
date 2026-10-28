import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase/server';

/**
 * XỬ LÝ CALLBACK ĐĂNG NHẬP FACEBOOK
 * Endpoint: /api/auth/facebook/callback
 */
export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  if (error) {
    return NextResponse.redirect(`${origin}/?fb_error=${encodeURIComponent(errorDescription || error)}`);
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/?fb_error=missing_code`);
  }

  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;
  const redirectUri = `${origin}/api/auth/facebook/callback`;

  try {
    // 1. Đổi code lấy Short-lived User Token
    const tokenUrl = `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${appId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&client_secret=${appSecret}&code=${code}`;
    
    const tokenRes = await fetch(tokenUrl);
    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || !tokenData.access_token) {
      throw new Error(tokenData.error?.message || 'Không thể lấy Access Token từ Facebook');
    }

    const shortLivedToken = tokenData.access_token;

    // 2. Nâng cấp lên Long-lived User Token (Thời hạn 60 ngày)
    const longLivedUrl = `https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${shortLivedToken}`;
    const longLivedRes = await fetch(longLivedUrl);
    const longLivedData = await longLivedRes.json();
    const userToken = longLivedData.access_token || shortLivedToken;

    // 3. Gọi /me/accounts để lấy danh sách tất cả các Page kèm Page Access Token vĩnh viễn
    const accountsUrl = `https://graph.facebook.com/v19.0/me/accounts?fields=id,name,category,access_token,tasks&limit=100&access_token=${userToken}`;
    const accountsRes = await fetch(accountsUrl);
    const accountsData = await accountsRes.json();
    const pages = accountsData.data || [];

    // 4. Lưu hoặc cập nhật danh sách Pages vào Supabase Database
    const supabase = getServiceSupabase();
    let savedCount = 0;

    if (supabase && pages.length > 0) {
      for (const p of pages) {
        await supabase.from('pages').upsert({
          page_id: p.id,
          name: p.name,
          category: p.category || 'General',
          access_token_encrypted: p.access_token, // Page Access Token từ Long-lived User Token là vĩnh viễn
          token_status: 'active',
          is_monetized: true,
          monetization_status: 'eligible',
          recommendation_status: 'normal',
          bm_sync_status: 'active',
          status: 'active',
          last_synced_at: new Date().toISOString()
        }, { onConflict: 'page_id' });
        savedCount++;
      }
    }

    return NextResponse.redirect(`${origin}/?fb_connected=success&count=${savedCount}`);
  } catch (err: any) {
    console.error('Lỗi kết nối Facebook:', err);
    return NextResponse.redirect(`${origin}/?fb_error=${encodeURIComponent(err.message)}`);
  }
}
