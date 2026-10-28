'use client';

import React from 'react';
import { DollarSign, Eye, TrendingUp, Users, Play, FileText } from 'lucide-react';
import { MetricSummary } from '@/lib/mock-data';

interface KpiCardsProps {
  summary: MetricSummary;
}

export const KpiCards: React.FC<KpiCardsProps> = ({ summary }) => {
  const formatNumber = (num: number) => {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const cards = [
    {
      title: 'Doanh Thu Ước Tính',
      value: formatCurrency(summary.total_estimated_earnings),
      subtext: `+${summary.earnings_growth_pct}% so với chu kỳ trước`,
      icon: DollarSign,
      iconColor: '#10B981',
      bgGlow: 'rgba(16, 185, 129, 0.12)',
      trendPositive: true
    },
    {
      title: 'Lượt Xem Video 1 Phút (In-stream)',
      value: formatNumber(summary.total_video_views_1m),
      subtext: `+${summary.views_1m_growth_pct}% tăng trưởng xem sâu`,
      icon: Play,
      iconColor: '#8B5CF6',
      bgGlow: 'rgba(139, 92, 246, 0.12)',
      trendPositive: true
    },
    {
      title: 'RPM Trung Bình',
      value: `$${summary.avg_rpm.toFixed(2)}`,
      subtext: 'Doanh thu / 1.000 lượt xem',
      icon: TrendingUp,
      iconColor: '#F59E0B',
      bgGlow: 'rgba(245, 158, 11, 0.12)',
      trendPositive: true
    },
    {
      title: 'Lượt Tiếp Cận (Reach)',
      value: formatNumber(summary.total_reach),
      subtext: `+${summary.reach_growth_pct}% người xem độc nhất`,
      icon: Users,
      iconColor: '#3B82F6',
      bgGlow: 'rgba(59, 130, 246, 0.12)',
      trendPositive: true
    },
    {
      title: 'Lượt Xem Video 3 Giây',
      value: formatNumber(summary.total_video_views_3s),
      subtext: `${formatNumber(summary.total_impressions)} lượt hiển thị`,
      icon: Eye,
      iconColor: '#06B6D4',
      bgGlow: 'rgba(6, 182, 212, 0.12)',
      trendPositive: true
    },
    {
      title: 'Nội Dung Xuất Bản',
      value: `${summary.total_posts} bài`,
      subtext: `Trong đó có ${summary.total_videos} Video & Reels`,
      icon: FileText,
      iconColor: '#EC4899',
      bgGlow: 'rgba(236, 72, 153, 0.12)',
      trendPositive: true
    }
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
      gap: '16px',
      marginBottom: '24px'
    }}>
      {cards.map((c, idx) => {
        const IconComponent = c.icon;
        return (
          <div 
            key={idx}
            className="glass-panel"
            style={{
              padding: '20px',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Top row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                {c.title}
              </span>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: c.bgGlow,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <IconComponent size={18} color={c.iconColor} />
              </div>
            </div>

            {/* Main Value */}
            <div style={{
              fontSize: '1.65rem',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: '#fff',
              marginBottom: '6px'
            }}>
              {c.value}
            </div>

            {/* Subtext */}
            <div style={{
              fontSize: '0.75rem',
              color: c.trendPositive ? '#34D399' : 'var(--text-subtle)',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              {c.subtext}
            </div>
          </div>
        );
      })}
    </div>
  );
};
