'use client';

import React, { useState } from 'react';
import { DailyTrendPoint } from '@/lib/mock-data';
import { BarChart3, TrendingUp, DollarSign } from 'lucide-react';

interface PerformanceChartProps {
  trendData: DailyTrendPoint[];
  period: string;
}

export const PerformanceChart: React.FC<PerformanceChartProps> = ({ trendData, period }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!trendData || trendData.length === 0) {
    return null;
  }

  // Tìm giá trị max để scale SVG
  const maxViews = Math.max(...trendData.map(d => d.video_views_1m), 1);
  const maxEarnings = Math.max(...trendData.map(d => d.earnings), 1);

  const chartHeight = 220;
  const chartWidth = 800;
  const paddingX = 40;
  const paddingY = 30;

  const pointsViews = trendData.map((d, i) => {
    const x = paddingX + (i / (trendData.length - 1)) * (chartWidth - paddingX * 2);
    const y = chartHeight - paddingY - (d.video_views_1m / maxViews) * (chartHeight - paddingY * 2);
    return { x, y, data: d };
  });

  const pathViewsD = pointsViews.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  // Fill gradient path
  const areaViewsD = `${pathViewsD} L ${pointsViews[pointsViews.length - 1].x} ${chartHeight - paddingY} L ${pointsViews[0].x} ${chartHeight - paddingY} Z`;

  return (
    <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={18} color="#8B5CF6" />
            Diễn Biến Tăng Trưởng Hàng Ngày
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Theo dõi lượng xem Video 1 phút (In-stream) và biến động doanh thu
          </p>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.78rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: '#8B5CF6' }}></span>
            <span style={{ color: 'var(--text-muted)' }}>Lượt xem Video 1m</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: '#10B981' }}></span>
            <span style={{ color: 'var(--text-muted)' }}>Doanh thu ($ USD)</span>
          </div>
        </div>
      </div>

      {/* SVG Container */}
      <div style={{ width: '100%', overflowX: 'auto' }}>
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          style={{ width: '100%', minWidth: '600px', height: 'auto', overflow: 'visible' }}
        >
          <defs>
            <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1={paddingX} y1={paddingY} x2={chartWidth - paddingX} y2={paddingY} stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
          <line x1={paddingX} y1={chartHeight / 2} x2={chartWidth - paddingX} y2={chartHeight / 2} stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
          <line x1={paddingX} y1={chartHeight - paddingY} x2={chartWidth - paddingX} y2={chartHeight - paddingY} stroke="rgba(255,255,255,0.12)" />

          {/* Area Fill */}
          <path d={areaViewsD} fill="url(#viewsGradient)" />

          {/* Line Path */}
          <path d={pathViewsD} fill="none" stroke="#8B5CF6" strokeWidth="2.5" strokeLinecap="round" />

          {/* Data Points */}
          {pointsViews.map((p, idx) => (
            <g key={idx} onMouseEnter={() => setHoveredIndex(idx)} onMouseLeave={() => setHoveredIndex(null)} style={{ cursor: 'pointer' }}>
              <circle
                cx={p.x}
                cy={p.y}
                r={hoveredIndex === idx ? 6 : 4}
                fill={hoveredIndex === idx ? '#fff' : '#8B5CF6'}
                stroke="#1E1B4B"
                strokeWidth="2"
                style={{ transition: 'all 0.15s ease' }}
              />
              {/* X Axis Label */}
              <text
                x={p.x}
                y={chartHeight - 8}
                textAnchor="middle"
                fill="var(--text-subtle)"
                fontSize="10"
                fontFamily="sans-serif"
              >
                {p.data.display_date}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Hover Info Tooltip Bar */}
      <div style={{
        marginTop: '12px',
        padding: '10px 16px',
        borderRadius: '10px',
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.85rem'
      }}>
        {hoveredIndex !== null ? (
          <>
            <span style={{ color: 'var(--text-muted)' }}>
              Ngày: <strong style={{ color: '#fff' }}>{trendData[hoveredIndex].date}</strong>
            </span>
            <span style={{ color: '#C084FC' }}>
              Lượt xem 1m: <strong>{trendData[hoveredIndex].video_views_1m.toLocaleString()}</strong>
            </span>
            <span style={{ color: '#34D399' }}>
              Doanh thu: <strong>${trendData[hoveredIndex].earnings.toFixed(2)}</strong>
            </span>
            <span style={{ color: '#60A5FA' }}>
              Reach: <strong>{trendData[hoveredIndex].reach.toLocaleString()}</strong>
            </span>
          </>
        ) : (
          <span style={{ color: 'var(--text-subtle)', fontStyle: 'italic', fontSize: '0.8rem' }}>
            Di chuột vào từng điểm trên biểu đồ để xem chi tiết số liệu ngày
          </span>
        )}
      </div>
    </div>
  );
};
