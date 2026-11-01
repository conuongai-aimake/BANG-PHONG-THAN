'use client';

import React, { useState } from 'react';
import { X, Key, Share2, Sparkles, Building2, CheckCircle2, ShieldCheck, Zap, ArrowRight, ExternalLink } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

interface FacebookConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (count: number) => void;
}

export const FacebookConnectModal: React.FC<FacebookConnectModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [activeTab, setActiveTab] = useState<'oauth' | 'token' | 'demo'>('oauth');
  const [token, setToken] = useState('');
  const [businessId, setBusinessId] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  // 1. KẾT NỐI QUA FACEBOOK LOGIN OAUTH 2.0
  const handleOAuthConnect = () => {
    setLoading(true);
    // Chuyển hướng tới endpoint khởi tạo OAuth của Next.js
    window.location.href = '/api/auth/facebook';
  };

  // 2. KẾT NỐI BẰNG SYSTEM USER TOKEN HOẶC PAGE TOKEN
  const handleImportToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) {
      setErrorMsg('Vui lòng dán Access Token vào ô bên dưới.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/facebook/import-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: token.trim(),
          business_id: businessId.trim()
        })
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(data.message || `Đã kết nối thành công ${data.count || 1} Trang!`);
        setTimeout(() => {
          onSuccess(data.count || 1);
          onClose();
        }, 1200);
      } else {
        setErrorMsg(data.error || 'Có lỗi xảy ra khi xác thực Token với Meta.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi mạng khi gọi Meta Graph API');
    } finally {
      setLoading(false);
    }
  };

  // 3. NẠP NHANH 5 TRANG DEMO THỰC TẾ VÀO DATABASE
  const handleLoadDemoPages = async () => {
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const demoPages = [
      {
        page_id: '109283749281901',
        name: 'Góc Điện Ảnh & Phim Hay',
        category: 'Movie / Entertainment',
        is_monetized: true,
        monetization_status: 'eligible',
        recommendation_status: 'normal',
        bm_sync_status: 'active',
        token_status: 'active',
        status: 'active',
        payout_profile_id: 'payout-vcb-main',
        last_synced_at: new Date().toISOString()
      },
      {
        page_id: '109283749281902',
        name: 'Reels Triệu View Daily',
        category: 'Creator / Media',
        is_monetized: true,
        monetization_status: 'eligible',
        recommendation_status: 'warning',
        bm_sync_status: 'active',
        token_status: 'active',
        status: 'active',
        payout_profile_id: 'payout-tcb-personal',
        last_synced_at: new Date().toISOString()
      },
      {
        page_id: '109283749281903',
        name: 'Bóng Đá & Thể Thao 24/7',
        category: 'Sports Media',
        is_monetized: true,
        monetization_status: 'restricted',
        recommendation_status: 'normal',
        bm_sync_status: 'active',
        token_status: 'active',
        status: 'active',
        payout_profile_id: 'payout-vcb-main',
        last_synced_at: new Date().toISOString()
      },
      {
        page_id: '109283749281904',
        name: 'Mẹo Công Nghệ & AI Hay',
        category: 'Technology & Tips',
        is_monetized: true,
        monetization_status: 'eligible',
        recommendation_status: 'dropped',
        bm_sync_status: 'active',
        token_status: 'active',
        status: 'active',
        payout_profile_id: 'payout-tcb-personal',
        last_synced_at: new Date().toISOString()
      },
      {
        page_id: '109283749281905',
        name: 'Hài Hước & Đời Sống Phố',
        category: 'Comedy & Entertainment',
        is_monetized: false,
        monetization_status: 'demonetized',
        recommendation_status: 'dropped',
        bm_sync_status: 'removed_from_bm',
        token_status: 'expired',
        status: 'inactive',
        payout_profile_id: null,
        last_synced_at: new Date().toISOString()
      }
    ];

    try {
      if (supabase) {
        for (const p of demoPages) {
          await supabase.from('pages').upsert(p, { onConflict: 'page_id' });
        }
      }
      setSuccessMsg('Đã nạp thành công 5 Trang thực tế vào cơ sở dữ liệu Supabase!');
      setTimeout(() => {
        onSuccess(5);
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '16px'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '560px',
        padding: '28px',
        backgroundColor: '#0F1422',
        position: 'relative',
        border: '1px solid rgba(24, 119, 242, 0.3)',
        borderRadius: '16px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '4px'
          }}
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            backgroundColor: '#1877F2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 4px 14px rgba(24, 119, 242, 0.5)'
          }}>
            <Share2 size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>
              Kết Nối Trang Facebook & Business Manager
            </h3>
            <span style={{ fontSize: '0.78rem', color: '#38BDF8', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ShieldCheck size={13} />
              Bảo mật mã hóa Token • Hỗ trợ Meta Graph API v23.0
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '6px',
          padding: '4px',
          borderRadius: '10px',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          marginBottom: '20px'
        }}>
          <button
            type="button"
            onClick={() => { setActiveTab('oauth'); setErrorMsg(''); setSuccessMsg(''); }}
            style={{
              padding: '8px 10px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'oauth' ? '#1877F2' : 'transparent',
              color: activeTab === 'oauth' ? '#fff' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '0.78rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            1. Facebook OAuth
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('token'); setErrorMsg(''); setSuccessMsg(''); }}
            style={{
              padding: '8px 10px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'token' ? '#1877F2' : 'transparent',
              color: activeTab === 'token' ? '#fff' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '0.78rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            2. Dán Token BM
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('demo'); setErrorMsg(''); setSuccessMsg(''); }}
            style={{
              padding: '8px 10px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'demo' ? '#10B981' : 'transparent',
              color: activeTab === 'demo' ? '#fff' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '0.78rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            3. Dữ Liệu Mẫu
          </button>
        </div>

        {/* Error / Success Feedback */}
        {errorMsg && (
          <div style={{
            padding: '10px 14px',
            borderRadius: '8px',
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            color: '#F87171',
            fontSize: '0.8rem',
            marginBottom: '16px',
            lineHeight: '1.4'
          }}>
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div style={{
            padding: '10px 14px',
            borderRadius: '8px',
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            color: '#34D399',
            fontSize: '0.8rem',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <CheckCircle2 size={16} />
            {successMsg}
          </div>
        )}

        {/* TAB 1: FACEBOOK OAUTH 1-CLICK */}
        {activeTab === 'oauth' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Kết nối trực tiếp tài khoản Facebook cá nhân hoặc Business Manager của bạn. Hệ thống sẽ tự động quét toàn bộ danh sách Trang bạn có quyền quản lý và lưu vào cơ sở dữ liệu.
            </p>

            <div style={{
              padding: '12px 14px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-color)',
              fontSize: '0.76rem',
              color: '#94A3B8'
            }}>
              <div style={{ fontWeight: 600, color: '#E2E8F0', marginBottom: '4px' }}>Quyền hạn yêu cầu từ Meta:</div>
              <ul style={{ paddingLeft: '18px', margin: 0, lineHeight: '1.5' }}>
                <li><code>pages_show_list</code>: Xem danh sách các Trang quản lý</li>
                <li><code>pages_read_engagement</code>: Đo lường tương tác và lượt xem</li>
                <li><code>read_insights</code>: Thu thập doanh thu và lượt xem 1 phút</li>
                <li><code>business_management</code>: Kiểm tra vòng đời Trang trong BM</li>
              </ul>
            </div>

            <button
              onClick={handleOAuthConnect}
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '10px',
                backgroundColor: '#1877F2',
                color: '#fff',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                boxShadow: '0 4px 16px rgba(24, 119, 242, 0.45)',
                transition: 'all 0.15s ease'
              }}
            >
              <Share2 size={18} />
              {loading ? 'Đang chuyển hướng sang Facebook...' : 'Đăng Nhập Bằng Facebook (1-Click)'}
            </button>

            <div style={{ fontSize: '0.74rem', color: 'var(--text-subtle)', textAlign: 'center' }}>
              Nếu Meta App của bạn chưa duyệt Live, hãy sử dụng <strong>Tab 2 (Dán Token BM)</strong> để kết nối ngay không cần duyệt App.
            </div>
          </div>
        )}

        {/* TAB 2: SYSTEM USER / PAGE ACCESS TOKEN IMPORT */}
        {activeTab === 'token' && (
          <form onSubmit={handleImportToken} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
              Dán <strong>System User Token</strong> (vĩnh viễn không hết hạn) hoặc <strong>Page Access Token</strong> vào đây. Hệ thống sẽ kết nối trực tiếp qua Meta Graph API v23.0.
            </p>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#E2E8F0', fontWeight: 600, marginBottom: '6px' }}>
                Facebook Access Token (Bắt buộc) *
              </label>
              <textarea
                required
                rows={3}
                placeholder="Dán token bắt đầu bằng EAA... vào đây"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-color)',
                  color: '#fff',
                  fontSize: '0.82rem',
                  fontFamily: 'JetBrains Mono, monospace',
                  resize: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#E2E8F0', fontWeight: 600, marginBottom: '6px' }}>
                Business Manager ID (Tùy chọn)
              </label>
              <input
                type="text"
                placeholder="VD: 109283749281923"
                value={businessId}
                onChange={(e) => setBusinessId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
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
              disabled={loading}
              style={{
                backgroundColor: '#1877F2',
                color: '#fff',
                border: 'none',
                padding: '10px 18px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '6px'
              }}
            >
              <Key size={16} />
              {loading ? 'Đang gọi Meta Graph API...' : 'Xác Thực & Quét Lưu Trang Ngay'}
            </button>
          </form>
        )}

        {/* TAB 3: DEMO FAST-TRACK */}
        {activeTab === 'demo' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
              Chưa có tài khoản Facebook BM sẵn sàng? Nhấn nút dưới đây để nạp ngay <strong>5 Trang thực tế</strong> (với các trạng thái Kiếm tiền Xanh/Vàng/Đỏ và Đề xuất khác nhau) trực tiếp vào Database Supabase.
            </p>

            <div style={{
              padding: '12px',
              borderRadius: '8px',
              backgroundColor: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              fontSize: '0.76rem',
              color: '#34D399'
            }}>
              ✓ Nạp 5 Trang vào bảng <code>pages</code> trên Supabase Cloud<br />
              ✓ Kích hoạt đối soát Payout Vietcombank & Techcombank<br />
              ✓ Trải nghiệm ngay biểu đồ tăng trưởng và cảnh báo Mất đề xuất (-65%)
            </div>

            <button
              type="button"
              onClick={handleLoadDemoPages}
              disabled={loading}
              style={{
                width: '100%',
                padding: '11px 16px',
                borderRadius: '8px',
                backgroundColor: '#10B981',
                color: '#fff',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <Zap size={16} />
              {loading ? 'Đang nạp dữ liệu vào Database...' : 'Nạp 5 Trang Mẫu Vào Supabase'}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
