'use client';

import React from 'react';
import { FacebookPage } from '@/lib/mock-data';
import { AlertTriangle, AlertOctagon, TrendingDown, UserX, ShieldAlert } from 'lucide-react';

interface PageHealthBannerProps {
  pages: FacebookPage[];
}

export const PageHealthBanner: React.FC<PageHealthBannerProps> = ({ pages }) => {
  const restrictedPages = pages.filter(p => p.monetization_status === 'restricted');
  const demonetizedPages = pages.filter(p => p.monetization_status === 'demonetized');
  const droppedPages = pages.filter(p => p.recommendation_status === 'dropped');
  const removedFromBmPages = pages.filter(p => p.bm_sync_status === 'removed_from_bm');

  const totalIssues = restrictedPages.length + demonetizedPages.length + droppedPages.length + removedFromBmPages.length;

  if (totalIssues === 0) return null;

  return (
    <div className="glass-panel" style={{
      padding: '16px 20px',
      marginBottom: '24px',
      border: '1px solid rgba(239, 68, 68, 0.35)',
      background: 'rgba(239, 68, 68, 0.08)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <ShieldAlert size={18} color="#F87171" />
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#FCA5A5' }}>
          CẢNH BÁO BẤT THƯỜNG TRẠNG THÁI TRANG & CHÍNH SÁCH ({totalIssues} vấn đề cần lưu ý)
        </h3>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
        
        {/* Mất đề xuất */}
        {droppedPages.length > 0 && (
          <div style={{
            padding: '10px 14px',
            borderRadius: '8px',
            backgroundColor: 'rgba(245, 158, 11, 0.15)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            fontSize: '0.8rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#FBBF24', fontWeight: 600, marginBottom: '2px' }}>
              <TrendingDown size={14} />
              <span>Dấu hiệu mất đề xuất ({droppedPages.length} Page):</span>
            </div>
            <div style={{ color: 'var(--text-main)' }}>
              {droppedPages.map(p => p.name).join(', ')}
            </div>
          </div>
        )}

        {/* Hạn chế kiếm tiền (Vàng) */}
        {restrictedPages.length > 0 && (
          <div style={{
            padding: '10px 14px',
            borderRadius: '8px',
            backgroundColor: 'rgba(234, 179, 8, 0.15)',
            border: '1px solid rgba(234, 179, 8, 0.3)',
            fontSize: '0.8rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#FDE047', fontWeight: 600, marginBottom: '2px' }}>
              <AlertTriangle size={14} />
              <span>Hạn chế kiếm tiền (Vàng - {restrictedPages.length} Page):</span>
            </div>
            <div style={{ color: 'var(--text-main)' }}>
              {restrictedPages.map(p => p.name).join(', ')}
            </div>
          </div>
        )}

        {/* Bị tắt kiếm tiền (Đỏ) */}
        {demonetizedPages.length > 0 && (
          <div style={{
            padding: '10px 14px',
            borderRadius: '8px',
            backgroundColor: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            fontSize: '0.8rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#F87171', fontWeight: 600, marginBottom: '2px' }}>
              <AlertOctagon size={14} />
              <span>Bị tắt kiếm tiền (Đỏ - {demonetizedPages.length} Page):</span>
            </div>
            <div style={{ color: 'var(--text-main)' }}>
              {demonetizedPages.map(p => p.name).join(', ')}
            </div>
          </div>
        )}

        {/* Bị gỡ khỏi BM */}
        {removedFromBmPages.length > 0 && (
          <div style={{
            padding: '10px 14px',
            borderRadius: '8px',
            backgroundColor: 'rgba(100, 116, 139, 0.2)',
            border: '1px solid rgba(100, 116, 139, 0.4)',
            fontSize: '0.8rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#CBD5E1', fontWeight: 600, marginBottom: '2px' }}>
              <UserX size={14} />
              <span>Đã bị gỡ khỏi BM ({removedFromBmPages.length} Page):</span>
            </div>
            <div style={{ color: 'var(--text-main)' }}>
              {removedFromBmPages.map(p => p.name).join(', ')}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
