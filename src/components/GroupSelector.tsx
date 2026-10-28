'use client';

import React from 'react';
import { Layers, Check } from 'lucide-react';
import { PageGroup } from '@/lib/mock-data';

interface GroupSelectorProps {
  groups: PageGroup[];
  selectedGroupId: string;
  onSelectGroup: (groupId: string) => void;
  totalPagesCount: number;
}

export const GroupSelector: React.FC<GroupSelectorProps> = ({
  groups,
  selectedGroupId,
  onSelectGroup,
  totalPagesCount,
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
        <Layers size={14} />
        <span>Nhóm Page:</span>
      </div>

      <div style={{ display: 'flex', gap: '4px', flexWrap: 'nowrap' }}>
        {/* Tất cả Page */}
        <button
          className={`tab-btn ${selectedGroupId === '' ? 'active' : ''}`}
          onClick={() => onSelectGroup('')}
        >
          Tất cả ({totalPagesCount})
        </button>

        {/* Các nhóm */}
        {groups.map((group) => {
          const isActive = selectedGroupId === group.id;
          return (
            <button
              key={group.id}
              className={`tab-btn ${isActive ? 'active' : ''}`}
              onClick={() => onSelectGroup(group.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: group.color_code || '#3B82F6'
              }}></span>
              {group.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};
