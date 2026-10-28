'use client';

import React, { useState } from 'react';
import { X, Key, Share2, Sparkles, Building2 } from 'lucide-react';

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
  const [token, setToken] = useState('');
  const [businessId, setBusinessId] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleImportToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

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
        onSuccess(data.count || 1);
        onClose();
      } else {
        setErrorMsg(data.error || 'Có lỗi xảy ra khi kiểm tra token');
      }
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
        maxWidth: '540px',
        padding: '28px',
        backgroundColor: '#0F1422',
        position: 'relative'
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
            cursor: 'pointer'
          }}
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            backgroundColor: '#1877F2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff'
          }}>
            <Share2 size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>
              Kết Nối Nhanh Facebook & Business Manager
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#38BDF8' }}>
              ✓ Không cần chờ Meta xét duyệt App phức tạp
            </span>
          </div>
        </div>

        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '18px', lineHeight: '1.4' }}>
          Dán <strong>System User Token</strong> (từ Business Manager) hoặc <strong>Page Access Token</strong> vào đây. Hệ thống sẽ tự động gọi Meta Graph API, quét toàn bộ các Trang thuộc quyền quản lý và lưu thẳng vào Database.
        </p>

        {errorMsg && (
          <div style={{
            padding: '10px 14px',
            borderRadius: '8px',
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#F87171',
            fontSize: '0.8rem',
            marginBottom: '14px'
          }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleImportToken} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
              Facebook Access Token (Bắt buộc) *
            </label>
            <textarea
              required
              rows={3}
              placeholder="Dán token dạng EAA... vào đây"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-color)',
                color: '#fff',
                fontSize: '0.85rem',
                fontFamily: 'JetBrains Mono, monospace',
                resize: 'none'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
              Mã Doanh Nghiệp / BM ID (Tùy chọn)
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

          <div style={{
            padding: '10px 14px',
            borderRadius: '8px',
            background: 'rgba(59, 130, 246, 0.08)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            fontSize: '0.75rem',
            color: 'var(--text-subtle)'
          }}>
            💡 <strong>Mẹo lấy token nhanh:</strong> Bạn có thể lấy System User Token trong <em>Cài đặt doanh nghiệp (Business Settings) &gt; Người dùng hệ thống (System Users)</em> với quyền vĩnh viễn không bao giờ hết hạn.
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" className="outline-btn" onClick={onClose}>
              Đóng
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                backgroundColor: '#1877F2',
                color: '#fff',
                border: 'none',
                padding: '8px 18px',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Key size={15} />
              {loading ? 'Đang quét Facebook...' : 'Quét & Lưu Trang Ngay'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
