'use client';

import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, 
  Plus, 
  FolderPlus, 
  Activity, 
  Building2, 
  UserCircle, 
  LogOut, 
  LogIn, 
  Share2 
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

interface HeaderProps {
  onSyncNow: () => void;
  isSyncing: boolean;
  onSyncBm: () => void;
  isBmSyncing: boolean;
  onOpenAddPage: () => void;
  onOpenAddGroup: () => void;
  isMock: boolean;
  userRole: string;
  onRoleChange: (role: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onSyncNow,
  isSyncing,
  onSyncBm,
  isBmSyncing,
  onOpenAddPage,
  onOpenAddGroup,
  isMock,
  userRole,
  onRoleChange
}) => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Lắng nghe trạng thái đăng nhập từ Supabase Auth
  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        setCurrentUser(data.user);
        // Tự động phân quyền nếu email có chữ admin
        if (data.user.email?.includes('admin')) {
          onRoleChange('admin');
        }
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user || null);
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // Xử lý Đăng nhập Google qua Supabase OAuth
  const handleGoogleLogin = async () => {
    if (!supabase) {
      alert('Vui lòng cấu hình Supabase để sử dụng Đăng nhập Google.');
      return;
    }
    setAuthLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      if (error) throw error;
    } catch (err: any) {
      alert(`Lỗi đăng nhập Google: ${err.message}`);
      setAuthLoading(false);
    }
  };

  // Xử lý Đăng xuất
  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
      setCurrentUser(null);
    }
  };

  // Xử lý Kết nối Facebook Pages
  const handleConnectFacebook = () => {
    window.location.href = '/api/auth/facebook';
  };

  return (
    <header className="glass-panel" style={{ padding: '16px 24px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Brand & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #1877F2 0%, #8B5CF6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(24, 119, 242, 0.4)'
          }}>
            <Activity size={24} color="#fff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.02em', color: '#fff' }}>
                BẢNG PHONG THẦN
              </h1>
              <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>
                MONETIZATION ENTERPRISE
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Quản trị BM, Báo cáo Payout, Giám sát Sức khỏe & Hoa hồng thành viên
            </p>
          </div>
        </div>

        {/* Action Controls & Authentication */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          
          {/* NÚT KẾT NỐI FACEBOOK PAGES */}
          <button
            onClick={handleConnectFacebook}
            style={{
              backgroundColor: '#1877F2',
              color: '#fff',
              border: 'none',
              padding: '6px 14px',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.8rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '0 2px 10px rgba(24, 119, 242, 0.4)'
            }}
            title="Đăng nhập Facebook để tự động kéo tất cả các Page bạn quản lý về hệ thống"
          >
            <Share2 size={14} />
            Kết nối Facebook
          </button>

          {/* ĐĂNG NHẬP GOOGLE HOẶC USER PROFILE */}
          {currentUser ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 10px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-color)',
              fontSize: '0.8rem'
            }}>
              {currentUser.user_metadata?.avatar_url ? (
                <img
                  src={currentUser.user_metadata.avatar_url}
                  alt="Avatar"
                  style={{ width: '22px', height: '22px', borderRadius: '50%' }}
                />
              ) : (
                <UserCircle size={18} color="#34D399" />
              )}
              <span style={{ color: '#fff', fontWeight: 600 }}>
                {currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0]}
              </span>
              <button
                onClick={handleLogout}
                title="Đăng xuất"
                style={{ background: 'none', border: 'none', color: '#F87171', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={handleGoogleLogin}
              disabled={authLoading}
              className="outline-btn"
              style={{ fontSize: '0.8rem', padding: '6px 12px' }}
              title="Đăng nhập tài khoản Google qua Supabase Auth"
            >
              <LogIn size={14} color="#EA4335" />
              {authLoading ? 'Đang chuyển...' : 'Đăng nhập Google'}
            </button>
          )}

          {/* CHUYỂN ĐỔI VAI TRÒ GIẢ LẬP / KIỂM THỬ */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 10px',
            borderRadius: '8px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-color)',
            fontSize: '0.78rem'
          }}>
            <span style={{ color: 'var(--text-subtle)' }}>Quyền:</span>
            <select
              value={userRole}
              onChange={(e) => onRoleChange(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#fff',
                fontWeight: 600,
                fontSize: '0.78rem',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value="admin" style={{ background: '#0F1422' }}>Super Admin</option>
              <option value="member" style={{ background: '#0F1422' }}>Member (Editor)</option>
            </select>
          </div>

          {/* Quét BM Button */}
          <button 
            className="outline-btn"
            onClick={onSyncBm}
            disabled={isBmSyncing}
            style={{ fontSize: '0.8rem', padding: '6px 12px' }}
          >
            <Building2 size={13} color="#38BDF8" />
            {isBmSyncing ? 'Đang quét...' : 'Quét BM'}
          </button>

          {/* Daily Sync Button */}
          <button 
            className="glow-btn"
            onClick={onSyncNow}
            disabled={isSyncing}
            style={{ opacity: isSyncing ? 0.7 : 1, fontSize: '0.8rem', padding: '6px 14px' }}
          >
            <RefreshCw size={13} style={{
              animation: isSyncing ? 'spin 1s linear infinite' : 'none'
            }} />
            {isSyncing ? 'Đang sync...' : 'Đồng bộ'}
          </button>

          {/* Add Page / Group */}
          {userRole === 'admin' && (
            <>
              <button className="outline-btn" onClick={onOpenAddPage} style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
                <Plus size={13} />
                Thêm Page
              </button>
              <button className="outline-btn" onClick={onOpenAddGroup} style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
                <FolderPlus size={13} />
                Tạo Nhóm
              </button>
            </>
          )}

        </div>

      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </header>
  );
};
