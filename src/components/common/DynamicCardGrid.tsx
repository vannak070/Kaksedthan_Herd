'use client';

import React from 'react';
import { CardFieldConfig, ModuleConfig } from '../../config/modules/types';

interface DynamicCardGridProps {
  config: ModuleConfig;
  data: Record<string, any>[];
  onCardClick: (item: Record<string, any>) => void;
}

export const DynamicCardGrid: React.FC<DynamicCardGridProps> = ({
  config,
  data,
  onCardClick,
}) => {
  if (!data || data.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
        <p style={{ fontSize: '14px', color: '#64748B', margin: 0 }}>No {config.title} records found.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
      {data.map((item, idx) => {
        const titleVal = item[config.titleField] || `Record #${item[config.primaryKey] || idx + 1}`;
        const subtitleVal = config.subtitleField ? item[config.subtitleField] : null;
        const imgVal = config.imageField
          ? item[config.imageField] || 'https://images.unsplash.com/photo-1546445317-29f4545f9d52?auto=format&fit=crop&w=400&q=80'
          : 'https://images.unsplash.com/photo-1546445317-29f4545f9d52?auto=format&fit=crop&w=400&q=80';

        return (
          <div
            key={item[config.primaryKey] || idx}
            onClick={() => onCardClick(item)}
            style={{
              background: '#FFFFFF',
              borderRadius: '14px',
              border: '1px solid #E2E8F0',
              padding: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#16A34A';
              e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(22, 163, 74, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#E2E8F0';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
            }}
          >
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              {/* 80x80 px 1:1 HD Square Thumbnail */}
              <div style={{ width: '80px', height: '80px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0, border: '1px solid #CBD5E1', background: '#F1F5F9' }}>
                <img src={imgVal} alt={titleVal} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {titleVal}
                </h4>
                {subtitleVal && (
                  <p style={{ fontSize: '12px', fontWeight: 600, color: '#16A34A', margin: '2px 0 0' }}>
                    {subtitleVal}
                  </p>
                )}

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                  {config.cardFields.map((field: CardFieldConfig) => {
                    const val = item[field.key];
                    if (val === undefined || val === null) return null;

                    if (field.badge) {
                      const color = field.colorMap?.[val] || '#16A34A';
                      return (
                        <span
                          key={field.key}
                          style={{
                            fontSize: '10px',
                            fontWeight: 700,
                            padding: '2px 7px',
                            borderRadius: '5px',
                            background: `${color}15`,
                            color: color,
                            border: `1px solid ${color}30`,
                          }}
                        >
                          {val}
                        </span>
                      );
                    }

                    return (
                      <span key={field.key} style={{ fontSize: '11px', color: '#64748B' }}>
                        {field.label}: <strong style={{ color: '#334155' }}>{String(val)}</strong>
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
