'use client';

import React from 'react';
import { UserCommissionItem } from '@/lib/mock-data';
import { Wallet, Percent, UserCheck, ArrowDownRight, Award } from 'lucide-react';

interface CommissionReportViewProps {
  commissions: UserCommissionItem[];
  userRole: string;
  period: string;
}

export const CommissionReportView: React.FC<CommissionReportViewProps> = ({
  commissions,
  userRole,
  period
}) => {
  const totalCommissionAll = commissions.reduce((sum, item) => sum + item.user_payout_amount, 0);

  const formatCurrency = (val: number, currency?: string) => {
    if (!currency) {
      return (val || 0).toLocaleString(undefined, { maximumFractionDigits: 2 });
    }
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2
      }).format(val || 0);
    } catch {
      return `${(val || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })} ${currency}`;
    }
  };

  return (
    <div style={{ marginBottom: '24px' }}>
      
      {/* Top Banner */}
      <div className="glass-panel" style={{
        padding: '20px 24px',
        marginBottom: '16px',
        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(236, 72, 153, 0.15) 100%)',
        border: '1px solid rgba(139, 92, 246, 0.35)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Award size={20} color="#C084FC" />
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>
              BÁO CÁO HOA HỒNG DOANH THU NHÂN SỰ ({period.toUpperCase()})
            </h2>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {userRole === 'member'
              ? 'Số tiền hoa hồng thực nhận của bạn dựa trên tỷ lệ % phân bổ từ các Page đang phụ trách'
              : 'Bảng quyết toán hoa hồng chia thưởng theo hiệu suất doanh thu kiếm về của các thành viên'}
          </p>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            {userRole === 'member' ? 'Hoa Hồng Thực Nhận Của Bạn' : 'Tổng Quỹ Hoa Hồng Đã Chia'}
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#F472B6', letterSpacing: '-0.02em' }}>
            {formatCurrency(totalCommissionAll)}
          </div>
        </div>
      </div>

      {/* Commission Table */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-subtle)' }}>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Thành Viên Phụ Trách</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Trang Đảm Nhiệm</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Tỷ Lệ Hoa Hồng (%)</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Doanh Thu Page Kiếm Về</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Tiền Hoa Hồng Nhận Về</th>
            </tr>
          </thead>
          <tbody>
            {commissions.map((item, idx) => (
              <tr
                key={idx}
                style={{
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  transition: 'background-color 0.15s ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(139, 92, 246, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#C084FC',
                      fontWeight: 700,
                      fontSize: '0.8rem'
                    }}>
                      {item.user_name.substring(0, 1)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: '#fff' }}>{item.user_name}</div>
                      <span className="badge badge-purple" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                        {item.user_role}
                      </span>
                    </div>
                  </div>
                </td>

                <td style={{ padding: '14px 16px' }}>
                  <div style={{ fontWeight: 600, color: '#E2E8F0' }}>{item.page_name}</div>
                  <code style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>ID: {item.page_id}</code>
                </td>

                <td style={{ padding: '14px 16px' }}>
                  <span style={{
                    fontWeight: 700,
                    color: '#38BDF8',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    background: 'rgba(56, 189, 248, 0.1)'
                  }}>
                    {item.commission_rate_pct}%
                  </span>
                </td>

                <td style={{ padding: '14px 16px', color: 'var(--text-main)', fontWeight: 600 }}>
                  {formatCurrency(item.page_total_earnings)}
                </td>

                <td style={{ padding: '14px 16px' }}>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#34D399' }}>
                    {formatCurrency(item.user_payout_amount)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};
