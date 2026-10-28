'use client';

import React, { useState } from 'react';
import { X, Plus, Shield } from 'lucide-react';
import { PageGroup } from '@/lib/mock-data';

interface AddPageModalProps {
  isOpen: boolean;
  onClose: () => void;
  groups: PageGroup[];
  onPageAdded: (page: any) => void;
}

export const AddPageModal: React.FC<AddPageModalProps> = ({
  isOpen,
  onClose,
  groups,
  onPageAdded
}) => {
  const [pageId, setPageId] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [groupId, setGroupId] = useState(groups[0]?.id || '');
  const [token, setToken] = useState('');
  const [isMonetized, setIsMonetized] = useState(true);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page_id: pageId,
          name,
          category,
          group_id: groupId,
          access_token: token,
          is_monetized: isMonetized
        })
      });

      const data = await res.json();
      if (res.ok) {
        onPageAdded(data.page);
        onClose();
      } else {
        alert(data.error || 'Có lỗi xảy ra');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 999,
      padding: '16px'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '500px',
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

        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
          Thêm Trang Facebook Mới
        </h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
          Nhập Page ID và phân quyền vào nhóm để hệ thống tự động kéo chỉ số
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
              Facebook Page ID *
            </label>
            <input
              type="text"
              required
              placeholder="VD: 109283748291029"
              value={pageId}
              onChange={(e) => setPageId(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-color)',
                color: '#fff',
                fontSize: '0.875rem'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
              Tên Trang *
            </label>
            <input
              type="text"
              required
              placeholder="VD: Góc Giải Trí 24h"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-color)',
                color: '#fff',
                fontSize: '0.875rem'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Danh mục / Lĩnh vực
              </label>
              <input
                type="text"
                placeholder="VD: Media / News"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-color)',
                  color: '#fff',
                  fontSize: '0.875rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Gán vào Nhóm
              </label>
              <select
                value={groupId}
                onChange={(e) => setGroupId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: '#1A2438',
                  border: '1px solid var(--border-color)',
                  color: '#fff',
                  fontSize: '0.875rem'
                }}
              >
                <option value="">Không gán nhóm</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
              Page Access Token (Tùy chọn)
            </label>
            <input
              type="password"
              placeholder="EAA..."
              value={token}
              onChange={(e) => setToken(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-color)',
                color: '#fff',
                fontSize: '0.875rem'
              }}
            />
            <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>
              Nếu để trống, hệ thống sẽ sử dụng System User Token cấu hình chung trong .env
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '4px 0' }}>
            <input
              type="checkbox"
              id="monetizedCheck"
              checked={isMonetized}
              onChange={(e) => setIsMonetized(e.target.checked)}
              style={{ cursor: 'pointer', width: '16px', height: '16px' }}
            />
            <label htmlFor="monetizedCheck" style={{ fontSize: '0.85rem', color: '#fff', cursor: 'pointer' }}>
              Trang này đã BẬT KIẾM TIỀN (Theo dõi doanh thu & In-Stream)
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px' }}>
            <button type="button" className="outline-btn" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="glow-btn" disabled={loading}>
              {loading ? 'Đang lưu...' : 'Thêm Trang Ngay'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
