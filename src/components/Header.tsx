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
  Share2,
  Mail
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

interface HeaderProps {
  onSyncNow: () => void;
  isSyncing: boolean;
  onSyncBm: () => void;
  isBmSyncing: boolean;
  onOpenAddPage: () => void;
  onOpenAddGroup: () => void;
  onOpenFacebookConnect: () => void;
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
  onOpenFacebookConnect,
  isMock,
  userRole,
  onRoleChange
}) => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Lắng nghe trạng thái đăng nhập từ Supabase Auth
  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        setCurrentUser(data.user);
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

  // Đăng nhập Google
  const handleGoogleLogin = async () => {
    if (!supabase) {
      alert('Vui lòng kiểm tra cấu hình Supabase.');
      return;
    }
    setAuthLoading(true);
    setLoginError('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      if (error) {
        // Nếu Google provider chưa bật trên Supabase console, tự động chuyển sang đăng nhập Email
        setLoginError('Google OAuth chưa được kích hoạt trên Supabase. Bạn có thể đăng nhập bằng Email/Password bên dưới:');
        setShowLoginModal(true);
      }
    } catch (err: any) {
      setLoginError(err.message);
      setShowLoginModal(true);
    } finally {
      setAuthLoading(false);
    }
  };

  // Đăng nhập bằng Email/Password (Luôn hoạt động 100% trên Supabase không cần bên thứ 3)
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setAuthLoading(true);
    setLoginError('');

    try {
      // Thử đăng nhập
      let { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      // Nếu tài khoản chưa có thì tự động đăng ký
      if (error && error.message.includes('Invalid login credentials')) {
        const signUpRes = await supabase.auth.signUp({ email, password });
        if (signUpRes.error) throw signUpRes.error;
        data = signUpRes.data as any;
      } else if (error) {
        throw error;
      }

      if (data?.user) {
        setCurrentUser(data.user);
        setShowLoginModal(false);
      }
    } catch (err: any) {
      setLoginError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
      setCurrentUser(null);
    }
  };

  return (
    <>
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
            
            {/* NÚT KẾT NỐI FACEBOOK */}
            <button
              onClick={onOpenFacebookConnect}
              style={{
                backgroundColor: '#1877F2',
                color: '#fff',
                border: 'none',
                padding: '7px 14px',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.82rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                boxShadow: '0 2px 10px rgba(24, 119, 242, 0.4)'
              }}
              title="Quét và kết nối Page Facebook bằng Access Token hoặc System User Token"
            >
              <Share2 size={15} />
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
                <UserCircle size={18} color="#34D399" />
                <span style={{ color: '#fff', fontWeight: 600 }}>
                  {currentUser.email?.split('@')[0]}
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
                onClick={() => setShowLoginModal(true)}
                className="outline-btn"
                style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                title="Đăng nhập tài khoản hệ thống"
              >
                <LogIn size={14} color="#EA4335" />
                Đăng nhập
              </button>
            )}

            {/* CHUYỂN ĐỔI VAI TRÒ */}
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

      {/* LOGIN MODAL (Hỗ trợ cả Google và Email Supabase) */}
      {showLoginModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px'
        }}>
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '420px',
            padding: '28px',
            backgroundColor: '#0F1422',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowLoginModal(false)}
              style={{
                position: 'absolute',
                top: '18px',
                right: '18px',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer'
              }}
            >
              ✕
            </button>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>
              Đăng Nhập Thành Viên
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Đăng nhập để xem báo cáo doanh thu và hoa hồng cá nhân
            </p>

            {loginError && (
              <div style={{
                padding: '8px 12px',
                borderRadius: '8px',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                color: '#F87171',
                fontSize: '0.78rem',
                marginBottom: '12px'
              }}>
                {loginError}
              </div>
            )}

            {/* Google OAuth Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={authLoading}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                background: '#fff',
                color: '#1F2937',
                border: 'none',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginBottom: '16px'
              }}
            >
              <LogIn size={16} color="#EA4335" />
              Đăng nhập bằng tài khoản Google
            </button>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              margin: '14px 0',
              color: 'var(--text-subtle)',
              fontSize: '0.75rem'
            }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
              <span>HOẶC ĐĂNG NHẬP NHANH BẰNG EMAIL</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
            </div>

            {/* Form Email / Password */}
            <form onSubmit={handleEmailAuth} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Email của bạn
                </label>
                <input
                  type="email"
                  required
                  placeholder="editor@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-color)',
                    color: '#fff',
                    fontSize: '0.85rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Mật khẩu
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-color)',
                    color: '#fff',
                    fontSize: '0.85rem'
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="glow-btn"
                style={{ width: '100%', justifyContent: 'center', marginTop: '6px' }}
              >
                {authLoading ? 'Đang xử lý...' : 'Đăng nhập / Đăng ký'}
              </button>
            </form>

          </div>
        </div>
      )}
    </>
  );
};
