'use client';

import React from 'react';
import { ColumnConfig, ModuleConfig } from '../../config/modules/types';
import { Eye, Edit, Trash2 } from 'lucide-react';

interface DynamicTableProps {
  config: ModuleConfig;
  data: Record<string, any>[];
  onView: (item: Record<string, any>) => void;
  onEdit: (item: Record<string, any>) => void;
  onDelete: (id: string | number) => void;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
  onSortChange?: (field: string) => void;
}

export const DynamicTable: React.FC<DynamicTableProps> = ({
  config,
  data,
  onView,
  onEdit,
  onDelete,
  sortField,
  sortOrder,
  onSortChange,
}) => {
  if (!data || data.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
        <p style={{ fontSize: '14px', color: '#64748B', margin: 0 }}>No {config.title} records found.</p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', overflowX: 'auto', background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
        <thead>
          <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', fontWeight: 600 }}>
            {config.columns.map((col: ColumnConfig) => (
              <th
                key={col.key}
                onClick={() => col.sortable && onSortChange && onSortChange(col.key)}
                style={{ padding: '12px 16px', cursor: col.sortable ? 'pointer' : 'default', userSelect: 'none' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {col.label}
                  {col.sortable && sortField === col.key && (
                    <span style={{ fontSize: '10px' }}>{sortOrder === 'asc' ? '▲' : '▼'}</span>
                  )}
                </div>
              </th>
            ))}
            <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, idx) => (
            <tr
              key={item[config.primaryKey] || idx}
              style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.15s ease' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#F8FAFC')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              {config.columns.map((col: ColumnConfig) => {
                const rawVal = item[col.key];

                return (
                  <td key={col.key} style={{ padding: '12px 16px', verticalAlign: 'middle', color: '#0F172A' }}>
                    {col.type === 'image' ? (
                      <img
                        src={rawVal || 'https://images.unsplash.com/photo-1546445317-29f4545f9d52?auto=format&fit=crop&w=120&q=80'}
                        alt="Thumbnail"
                        style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #E2E8F0' }}
                      />
                    ) : col.type === 'badge' ? (
                      <span
                        style={{
                          padding: '3px 9px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 700,
                          background: col.colorMap?.[rawVal] ? `${col.colorMap[rawVal]}15` : '#F1F5F9',
                          color: col.colorMap?.[rawVal] || '#475569',
                          border: col.colorMap?.[rawVal] ? `1px solid ${col.colorMap[rawVal]}40` : '1px solid #CBD5E1',
                        }}
                      >
                        {rawVal || '—'}
                      </span>
                    ) : col.type === 'date' ? (
                      rawVal ? new Date(rawVal).toLocaleDateString() : '—'
                    ) : (
                      String(rawVal !== undefined && rawVal !== null ? rawVal : '—')
                    )}
                  </td>
                );
              })}
              <td style={{ padding: '12px 16px', textAlign: 'right', verticalAlign: 'middle' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                  <button
                    onClick={() => onView(item)}
                    title="View Profile / Details"
                    style={{ padding: '6px', borderRadius: '6px', border: '1px solid #CBD5E1', background: 'white', color: '#0284C7', cursor: 'pointer' }}
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onEdit(item)}
                    title="Edit Record"
                    style={{ padding: '6px', borderRadius: '6px', border: '1px solid #CBD5E1', background: 'white', color: '#D97706', cursor: 'pointer' }}
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDelete(item[config.primaryKey])}
                    title="Delete Record"
                    style={{ padding: '6px', borderRadius: '6px', border: '1px solid #FCA5A5', background: '#FEF2F2', color: '#DC2626', cursor: 'pointer' }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
