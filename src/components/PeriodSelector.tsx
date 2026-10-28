'use client';

import React from 'react';
import { Calendar } from 'lucide-react';

interface PeriodSelectorProps {
  currentPeriod: string;
  onSelectPeriod: (period: string) => void;
}

const PERIODS = [
  { id: '7d', label: '7 Ngày' },
  { id: '28d', label: '28 Ngày (Chuẩn FB)' },
  { id: '90d', label: '90 Ngày (Quý)' },
  { id: '365d', label: '365 Ngày (Năm)' },
  { id: 'this_month', label: 'Tháng Này (MTD)' },
  { id: 'last_month', label: 'Tháng Trước (Payout)' },
];

export const PeriodSelector: React.FC<PeriodSelectorProps> = ({
  currentPeriod,
  onSelectPeriod,
}) => {
  return (
    <div className="glass-panel" style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '4px',
      gap: '4px',
      borderRadius: '12px',
      overflowX: 'auto',
      maxWidth: '100%',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '0 10px',
        color: 'var(--text-subtle)',
        gap: '6px',
        fontSize: '0.8rem',
        fontWeight: 600,
        borderRight: '1px solid var(--border-color)',
        marginRight: '2px'
      }}>
        <Calendar size={14} />
        <span>Chu kỳ:</span>
      </div>

      <div style={{ display: 'flex', gap: '4px', flexWrap: 'nowrap' }}>
        {PERIODS.map((p) => {
          const isActive = currentPeriod === p.id;
          return (
            <button
              key={p.id}
              className={`tab-btn ${isActive ? 'active' : ''}`}
              onClick={() => onSelectPeriod(p.id)}
            >
              {p.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
