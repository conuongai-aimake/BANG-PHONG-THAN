'use client';

import React from 'react';
import { FacebookPage, PageGroup, PayoutProfile } from '@/lib/mock-data';
import { CheckCircle2, AlertTriangle, AlertOctagon, TrendingDown, Copy, Landmark, UserX } from 'lucide-react';

interface PagesTableProps {
  pages: FacebookPage[];
  groups: PageGroup[];
  payoutProfiles: PayoutProfile[];
  period: string;
}

export const PagesTable: React.FC<PagesTableProps> = ({
  pages,
  groups,
  payoutProfiles,
  period
}) => {
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

  const getPayoutInfo = (payoutId?: string) => {
    if (!payoutId) return { name: 'Chưa gắn Payout', bank: '' };
    const p = payoutProfiles.find(po => po.id === payoutId);
    return p ? { name: p.name, bank: p.bank_name } : { name: 'Payout khác', bank: '' };
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard?.writeText(text);
    alert(`Đã sao chép Page ID: ${text}`);
  };

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>
            Bảng Quản Trị Chi Tiết: Payout, Sức Khỏe Kiếm Tiền & Đề Xuất
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Theo dõi phân bổ Payout, gậy chính sách và tình trạng liên kết Business Manager
          </p>
        </div>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Tổng số: <strong>{pages.length}</strong> Trang
        </span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-subtle)' }}>
              <th style={{ padding: '12px 14px', fontWeight: 600 }}>Tên Trang & Page ID</th>
              <th style={{ padding: '12px 14px', fontWeight: 600 }}>Nhóm Phụ Trách</th>
              <th style={{ padding: '12px 14px', fontWeight: 600 }}>Hồ Sơ Payout Nhận Tiền</th>
              <th style={{ padding: '12px 14px', fontWeight: 600 }}>Sức Khỏe Kiếm Tiền</th>
              <th style={{ padding: '12px 14px', fontWeight: 600 }}>Trạng Thái Đề Xuất</th>
              <th style={{ padding: '12px 14px', fontWeight: 600 }}>Kết Nối BM</th>
            </tr>
          </thead>
          <tbody>
            {pages.map((p) => {
              const groupColor = getGroupColor(p.group_ids);
              const payout = getPayoutInfo(p.payout_profile_id);

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
                  {/* Page Name & ID */}
                  <td style={{ padding: '14px' }}>
                    <div style={{ fontWeight: 600, color: '#fff' }}>{p.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                      <code style={{
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: '0.74rem',
                        color: 'var(--text-muted)',
                        background: 'rgba(255,255,255,0.05)',
                        padding: '1px 5px',
                        borderRadius: '4px'
                      }}>
                        {p.page_id}
                      </code>
                      <button 
                        onClick={() => copyToClipboard(p.page_id)}
                        title="Sao chép ID"
                        style={{ background: 'none', border: 'none', color: 'var(--text-subtle)', cursor: 'pointer' }}
                      >
                        <Copy size={12} />
                      </button>
                    </div>
                  </td>

                  {/* Group */}
                  <td style={{ padding: '14px' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      padding: '3px 8px',
                      borderRadius: '8px',
                      backgroundColor: `${groupColor}1A`,
                      color: groupColor,
                      border: `1px solid ${groupColor}4D`
                    }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: groupColor }}></span>
                      {getGroupName(p.group_ids)}
                    </span>
                  </td>

                  {/* Payout Profile */}
                  <td style={{ padding: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Landmark size={14} color="#34D399" />
                      <div>
                        <div style={{ fontWeight: 500, color: '#E2E8F0', fontSize: '0.8rem' }}>
                          {payout.name}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>
                          {payout.bank}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Monetization Health Status */}
                  <td style={{ padding: '14px' }}>
                    {p.monetization_status === 'eligible' && (
                      <span className="badge badge-green">
                        <CheckCircle2 size={12} />
                        Trang Xanh (Bình thường)
                      </span>
                    )}
                    {p.monetization_status === 'restricted' && (
                      <span className="badge" style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#FBBF24', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                        <AlertTriangle size={12} />
                        Trang Vàng (Hạn chế)
                      </span>
                    )}
                    {p.monetization_status === 'demonetized' && (
                      <span className="badge" style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#F87171', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                        <AlertOctagon size={12} />
                        Trang Đỏ (Tắt kiếm tiền)
                      </span>
                    )}
                  </td>

                  {/* Recommendation Status */}
                  <td style={{ padding: '14px' }}>
                    {p.recommendation_status === 'normal' && (
                      <span style={{ color: '#34D399', fontSize: '0.78rem', fontWeight: 500 }}>
                        ● Phân phối bình thường
                      </span>
                    )}
                    {p.recommendation_status === 'warning' && (
                      <span style={{ color: '#FBBF24', fontSize: '0.78rem', fontWeight: 500 }}>
                        ▲ Xu hướng giảm Reach
                      </span>
                    )}
                    {p.recommendation_status === 'dropped' && (
                      <span className="badge" style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#F87171', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                        <TrendingDown size={12} />
                        MẤT ĐỀ XUẤT (-65%)
                      </span>
                    )}
                  </td>

                  {/* BM Status */}
                  <td style={{ padding: '14px' }}>
                    {p.bm_sync_status === 'active' ? (
                      <span style={{ color: '#38BDF8', fontSize: '0.78rem', fontWeight: 500 }}>
                        ● Đang thuộc BM
                      </span>
                    ) : (
                      <span className="badge" style={{ backgroundColor: 'rgba(100, 116, 139, 0.2)', color: '#94A3B8' }}>
                        <UserX size={12} />
                        Đã bị gỡ khỏi BM
                      </span>
                    )}
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
