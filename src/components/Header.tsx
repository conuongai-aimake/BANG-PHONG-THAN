'use client';

import React from 'react';
import { RefreshCw, Plus, FolderPlus, Activity, Building2, UserCircle, Shield, Briefcase } from 'lucide-react';

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

        {/* User Role Switcher & Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          
          {/* Google Auth / Role Simulator */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '5px 10px',
            borderRadius: '10px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-color)',
            fontSize: '0.8rem'
          }}>
            <UserCircle size={16} color="#A78BFA" />
            <span style={{ color: 'var(--text-muted)' }}>Đăng nhập:</span>
            <select
              value={userRole}
              onChange={(e) => onRoleChange(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#fff',
                fontWeight: 600,
                fontSize: '0.8rem',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value="admin" style={{ background: '#0F1422' }}>Super Admin (Toàn quyền BM & Payout)</option>
              <option value="member" style={{ background: '#0F1422' }}>Member (Editor Minh Tuấn - Nhận hoa hồng)</option>
            </select>
          </div>

          {/* Sync BM Button */}
          <button 
            className="outline-btn"
            onClick={onSyncBm}
            disabled={isBmSyncing}
            style={{ fontSize: '0.82rem', padding: '6px 12px' }}
            title="Quét tự động các Page mới thêm hoặc bị gỡ khỏi Meta Business Manager"
          >
            <Building2 size={14} color="#38BDF8" />
            {isBmSyncing ? 'Đang quét BM...' : 'Quét BM'}
          </button>

          {/* Daily Sync Button */}
          <button 
            className="glow-btn"
            onClick={onSyncNow}
            disabled={isSyncing}
            style={{ opacity: isSyncing ? 0.7 : 1, fontSize: '0.82rem', padding: '6px 14px' }}
          >
            <RefreshCw size={14} style={{
              animation: isSyncing ? 'spin 1s linear infinite' : 'none'
            }} />
            {isSyncing ? 'Đang đồng bộ...' : 'Đồng bộ số liệu'}
          </button>

          {/* Add Page / Group - only for admin */}
          {userRole === 'admin' && (
            <>
              <button className="outline-btn" onClick={onOpenAddPage} style={{ fontSize: '0.82rem', padding: '6px 12px' }}>
                <Plus size={14} />
                Thêm Page
              </button>
              <button className="outline-btn" onClick={onOpenAddGroup} style={{ fontSize: '0.82rem', padding: '6px 12px' }}>
                <FolderPlus size={14} />
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
