'use client';

import React from 'react';
import { RefreshCw, Plus, FolderPlus, ShieldCheck, Activity } from 'lucide-react';

interface HeaderProps {
  onSyncNow: () => void;
  isSyncing: boolean;
  onOpenAddPage: () => void;
  onOpenAddGroup: () => void;
  isMock: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onSyncNow,
  isSyncing,
  onOpenAddPage,
  onOpenAddGroup,
  isMock,
}) => {
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
                PRO ANALYTICS
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Theo dõi hoạt động & Báo cáo doanh thu Trang Facebook kiếm tiền
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          
          {/* Status Indicator */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '8px',
            background: 'rgba(255, 255, 255, 0.04)',
            fontSize: '0.78rem',
            color: 'var(--text-muted)',
            border: '1px solid var(--border-color)'
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: isMock ? '#F59E0B' : '#10B981',
              boxShadow: isMock ? '0 0 8px #F59E0B' : '0 0 8px #10B981'
            }}></span>
            {isMock ? 'Chế độ Demo Preview' : 'Meta API Live'}
          </div>

          {/* Sync Button */}
          <button 
            className="glow-btn"
            onClick={onSyncNow}
            disabled={isSyncing}
            style={{ opacity: isSyncing ? 0.7 : 1 }}
          >
            <RefreshCw size={15} className={isSyncing ? 'animate-spin' : ''} style={{
              animation: isSyncing ? 'spin 1s linear infinite' : 'none'
            }} />
            {isSyncing ? 'Đang đồng bộ...' : 'Đồng bộ ngay'}
          </button>

          {/* Add Page */}
          <button className="outline-btn" onClick={onOpenAddPage}>
            <Plus size={15} />
            Thêm Page
          </button>

          {/* Add Group */}
          <button className="outline-btn" onClick={onOpenAddGroup}>
            <FolderPlus size={15} />
            Tạo Nhóm
          </button>
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
