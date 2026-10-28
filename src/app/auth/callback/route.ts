import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase/server';

/**
 * GOOGLE OAUTH CALLBACK CHO SUPABASE AUTH
 * Endpoint: /auth/callback
 */
export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') || '/';

  if (code) {
    const supabase = getServiceSupabase();
    if (supabase) {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error && data.user) {
        // Tự động tạo / cập nhật hồ sơ người dùng trong bảng user_profiles
        const user = data.user;
        const role = user.email?.includes('admin') ? 'super_admin' : 'member';

        await supabase.from('user_profiles').upsert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
          avatar_url: user.user_metadata?.avatar_url || null,
          role: role,
          status: 'active'
        }, { onConflict: 'id' });
      }
    }
  }

  // Chuyển hướng người dùng về trang chủ
  return NextResponse.redirect(`${origin}${next}`);
}
