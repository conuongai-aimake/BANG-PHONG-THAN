'use client';

import React, { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleAuth = async () => {
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      if (error) {
        router.replace(`/?auth_error=${encodeURIComponent(errorDescription || error)}`);
        return;
      }

      if (!supabase) {
        router.replace('/?auth_error=Supabase+chưa+được+cấu+hình');
        return;
      }

      try {
        // Lấy session từ Supabase client (client-side tự xử lý code hoặc hash trong URL)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        if (session && session.user) {
          const user = session.user;
          const userEmail = user.email || '';
          const role = userEmail.includes('admin') ? 'super_admin' : 'member';

          // Đồng bộ thông tin người dùng vào bảng user_profiles
          await supabase.from('user_profiles').upsert({
            id: user.id,
            email: userEmail,
            full_name: user.user_metadata?.full_name || user.user_metadata?.name || userEmail.split('@')[0],
            avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
            role: role,
            status: 'active',
            updated_at: new Date().toISOString()
          }, { onConflict: 'id' });

          router.replace('/?auth=success');
        } else {
          // Lắng nghe onAuthStateChange nếu session chưa kịp nạp
          const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
            if (event === 'SIGNED_IN' && newSession?.user) {
              const u = newSession.user;
              await supabase.from('user_profiles').upsert({
                id: u.id,
                email: u.email || '',
                full_name: u.user_metadata?.full_name || u.email?.split('@')[0],
                avatar_url: u.user_metadata?.avatar_url || null,
                role: u.email?.includes('admin') ? 'super_admin' : 'member',
                status: 'active',
                updated_at: new Date().toISOString()
              }, { onConflict: 'id' });

              subscription.unsubscribe();
              router.replace('/?auth=success');
            }
          });

          // Timeout sau 4 giây nếu không có session
          setTimeout(() => {
            router.replace('/');
          }, 4000);
        }
      } catch (err: any) {
        console.error('Lỗi trong Auth Callback:', err);
        router.replace(`/?auth_error=${encodeURIComponent(err.message || 'Xác thực thất bại')}`);
      }
    };

    handleAuth();
  }, [router, searchParams]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#0A0E1A',
      color: '#fff',
      gap: '20px',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        border: '3px solid rgba(56, 189, 248, 0.2)',
        borderTopColor: '#38BDF8',
        animation: 'spin 1s linear infinite'
      }} />
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '6px' }}>
          Đang xác thực tài khoản Google...
        </h2>
        <p style={{ fontSize: '0.85rem', color: '#94A3B8' }}>
          Vui lòng đợi giây lát, hệ thống đang đồng bộ phiên làm việc của bạn.
        </p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#0A0E1A',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#94A3B8'
      }}>
        Đang khởi tạo...
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
