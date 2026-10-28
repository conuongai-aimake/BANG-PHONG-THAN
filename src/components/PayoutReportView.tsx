'use client';

import React from 'react';
import { PayoutReportItem } from '@/lib/mock-data';
import { CreditCard, Landmark, CheckCircle, ArrowUpRight, DollarSign } from 'lucide-react';

interface PayoutReportViewProps {
  payoutReports: PayoutReportItem[];
  period: string;
}

export const PayoutReportView: React.FC<PayoutReportViewProps> = ({ payoutReports, period }) => {
  const totalPayoutAll = payoutReports.reduce((sum, item) => sum + item.total_earnings, 0);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(val || 0);
  };

  return (
    <div style={{ marginBottom: '24px' }}>
      
      {/* Top Banner */}
      <div className="glass-panel" style={{
        padding: '20px 24px',
        marginBottom: '16px',
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(59, 130, 246, 0.12) 100%)',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Landmark size={20} color="#34D399" />
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>
              BÁO CÁO GOM THEO HỒ SƠ PAYOUT ({period.toUpperCase()})
            </h2>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Tổng hợp số tiền chuyển về từng tài khoản ngân hàng thụ hưởng từ các Page chung một hồ sơ thanh toán Meta
          </p>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Tổng Tiền Chờ Quyết Toán</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#34D399', letterSpacing: '-0.02em' }}>
            {formatCurrency(totalPayoutAll)}
          </div>
        </div>
      </div>

      {/* Grid of Payout Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '16px' }}>
        {payoutReports.map((item) => (
          <div key={item.payout_id} className="glass-panel" style={{ padding: '22px' }}>
            
            {/* Header of Payout Card */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
              <div>
                <span className="badge badge-green" style={{ marginBottom: '6px' }}>
                  {item.bank_name}
                </span>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>
                  {item.payout_name}
                </h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Chủ tài khoản: <strong style={{ color: '#E2E8F0' }}>{item.account_holder}</strong>
                </div>
              </div>

              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <CreditCard size={20} color="#34D399" />
              </div>
            </div>

            {/* Total Amount for this Payout Profile */}
            <div style={{
              background: 'rgba(0, 0, 0, 0.25)',
              padding: '14px 16px',
              borderRadius: '10px',
              border: '1px solid var(--border-color)',
              marginBottom: '14px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Doanh thu gom về Payout</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#34D399' }}>
                  {formatCurrency(item.total_earnings)}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className="badge badge-purple">
                  {item.total_pages} Trang liên kết
                </span>
              </div>
            </div>

            {/* List of Pages linked to this payout */}
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginBottom: '8px', fontWeight: 600 }}>
                DANH SÁCH TRANG TRONG HỒ SƠ NÀY:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {item.pages_list.map((pageName, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '0.8rem',
                      color: 'var(--text-main)',
                      padding: '6px 10px',
                      borderRadius: '6px',
                      background: 'rgba(255, 255, 255, 0.03)'
                    }}
                  >
                    <CheckCircle size={13} color="#3B82F6" />
                    <span>{pageName}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
