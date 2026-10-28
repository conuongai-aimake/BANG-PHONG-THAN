'use client';

import React from 'react';
import { FacebookPage, PageGroup } from '@/lib/mock-data';
import { CheckCircle2, AlertCircle, Copy, ExternalLink } from 'lucide-react';

interface PagesTableProps {
  pages: FacebookPage[];
  groups: PageGroup[];
  period: string;
}

export const PagesTable: React.FC<PagesTableProps> = ({ pages, groups, period }) => {
  const getGroupName = (groupIds?: string[]) => {
    if (!groupIds || groupIds.length === 0) return 'Chưa gán nhóm';
    const group = groups.find(g => groupIds.includes(g.id));
    return group ? group.name : 'Nhóm khác';
  };

  const getGroupColor = (groupIds?: string[]) => {
    if (!groupIds || groupIds.length === 0) return '#6B7280';
    const group = groups.find(g => groupIds.includes(g.id));
    return group ? group.color_code : '#6B7280';
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard?.writeText(text);
    alert(`Đã sao chép Page ID: ${text}`);
  };

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>
            Danh Sách Trang Quản Lý & Tình Trạng Kiếm Tiền
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Theo dõi chi tiết từng Page ID theo chu kỳ {period}
          </p>
        </div>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Hiển thị: <strong>{pages.length}</strong> Trang
        </span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-subtle)' }}>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Tên Trang & Danh mục</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Facebook Page ID</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Nhóm Phụ Trách</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Trạng Thái Kiếm Tiền</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Token Status</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Đồng bộ lần cuối</th>
            </tr>
          </thead>
          <tbody>
            {pages.map((p) => {
              const groupColor = getGroupColor(p.group_ids);
              return (
                <tr 
                  key={p.page_id}
                  style={{
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    transition: 'background-color 0.15s ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  {/* Page Name & Category */}
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '10px',
                        backgroundColor: '#1E293B',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        color: '#38BDF8',
                        overflow: 'hidden',
                        fontSize: '0.9rem'
                      }}>
                        {p.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: '#fff' }}>{p.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>{p.category}</div>
                      </div>
                    </div>
                  </td>

                  {/* Page ID */}
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <code style={{
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: '0.78rem',
                        color: 'var(--text-muted)',
                        background: 'rgba(255,255,255,0.05)',
                        padding: '2px 6px',
                        borderRadius: '4px'
                      }}>
                        {p.page_id}
                      </code>
                      <button 
                        onClick={() => copyToClipboard(p.page_id)}
                        title="Sao chép ID"
                        style={{ background: 'none', border: 'none', color: 'var(--text-subtle)', cursor: 'pointer' }}
                      >
                        <Copy size={13} />
                      </button>
                    </div>
                  </td>

                  {/* Group */}
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      padding: '3px 10px',
                      borderRadius: '8px',
                      backgroundColor: `${groupColor}1A`,
                      color: groupColor,
                      border: `1px solid ${groupColor}4D`
                    }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: groupColor }}></span>
                      {getGroupName(p.group_ids)}
                    </span>
                  </td>

                  {/* Monetization Status */}
                  <td style={{ padding: '14px 16px' }}>
                    {p.is_monetized ? (
                      <span className="badge badge-green">
                        <CheckCircle2 size={12} />
                        Bật Kiếm Tiền (In-Stream)
                      </span>
                    ) : (
                      <span className="badge" style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#F87171' }}>
                        <AlertCircle size={12} />
                        Chưa Bật
                      </span>
                    )}
                  </td>

                  {/* Token Status */}
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      fontSize: '0.75rem',
                      color: p.token_status === 'active' ? '#34D399' : '#F59E0B',
                      fontWeight: 500
                    }}>
                      ● {p.token_status === 'active' ? 'Hoạt động tốt' : 'Cần cấp quyền lại'}
                    </span>
                  </td>

                  {/* Last Synced */}
                  <td style={{ padding: '14px 16px', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                    {p.last_synced_at || 'Chưa đồng bộ'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
