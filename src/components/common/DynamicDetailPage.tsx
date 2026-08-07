'use client';

import React, { useState } from 'react';
import { ModuleConfig } from '../../config/modules/types';
import { ArrowLeft, Edit, Trash2, QrCode, Calendar, ShieldCheck, FileText, Activity } from 'lucide-react';
import QrCodeCard from './QrCodeCard';

interface DynamicDetailPageProps {
  config: ModuleConfig;
  data: Record<string, any>;
  onBack: () => void;
  onEdit?: (item: Record<string, any>) => void;
  onDelete?: (id: string | number) => void;
}

export const DynamicDetailPage: React.FC<DynamicDetailPageProps> = ({
  config,
  data: initialData,
  onBack,
  onEdit,
  onDelete,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'timeline' | 'attachments' | 'audit'>('profile');
  const [data, setData] = useState<Record<string, any>>(initialData || {});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const primaryId = initialData[config.primaryKey] || initialData.id || initialData.code || initialData.tagId;

  // Clear previous state and fetch live record with AbortController cancellation signal
  React.useEffect(() => {
    // 1. Immediately reset state for the newly selected record ID
    setData(initialData || {});
    setError(null);

    if (!primaryId) return;

    const controller = new AbortController();
    let isMounted = true;
    setLoading(true);

    async function fetchLiveRecord() {
      try {
        const endpoint = `${config.apiEndpoint}/${encodeURIComponent(primaryId)}`;
        const res = await fetch(endpoint, { signal: controller.signal });
        if (res.ok) {
          const json = await res.json();
          if (isMounted && json.data) {
            setData(prev => ({ ...prev, ...json.data }));
          }
        }
      } catch (err: any) {
        if (err.name !== 'AbortError' && isMounted) {
          console.warn(`Dynamic detail fetch fallback for ${config.module}:`, err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchLiveRecord();

    return () => {
      isMounted = false;
      controller.abort(); // Cancel pending API request to prevent race conditions or stale data!
    };
  }, [config.apiEndpoint, config.module, config.primaryKey, primaryId, initialData]);

  const titleVal = data[config.titleField] || `Record #${data[config.primaryKey] || primaryId || 'N/A'}`;
  const subtitleVal = config.subtitleField ? data[config.subtitleField] : null;
  const imgVal = config.imageField
    ? data[config.imageField] || 'https://images.unsplash.com/photo-1546445317-29f4545f9d52?auto=format&fit=crop&w=800&q=80'
    : 'https://images.unsplash.com/photo-1546445317-29f4545f9d52?auto=format&fit=crop&w=800&q=80';

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', background: '#F8FAFC', minHeight: '100vh' }}>
      {/* Top Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <button
          onClick={onBack}
          style={{
            padding: '10px 18px',
            fontSize: '13px',
            fontWeight: 700,
            color: '#1E293B',
            background: '#FFFFFF',
            border: '1px solid #CBD5E1',
            borderRadius: '10px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <ArrowLeft className="h-4 w-4 text-emerald-600" />
          <span>← ត្រឡប់ក្រោយ (Back to Listing)</span>
        </button>

        <div style={{ display: 'flex', gap: '8px' }}>
          {onEdit && (
            <button
              onClick={() => onEdit(data)}
              style={{ padding: '8px 16px', fontSize: '13px', fontWeight: 600, color: '#D97706', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Edit className="h-4 w-4" /> Edit Record
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(data[config.primaryKey])}
              style={{ padding: '8px 16px', fontSize: '13px', fontWeight: 600, color: '#DC2626', background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Trash2 className="h-4 w-4" /> Delete
            </button>
          )}
        </div>
      </div>

      {/* Main 2-Column Grid matching Design Mockup */}
      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '24px', alignItems: 'start' }}>
        {/* LEFT COLUMN: 1:1 Photo Frame, Specs, Quick Stats, QR Code */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Main 1:1 Square Photo Card */}
          <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1', borderRadius: '12px', overflow: 'hidden', border: '1px solid #CBD5E1' }}>
              <img src={imgVal} alt={titleVal} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <span style={{ position: 'absolute', bottom: '10px', right: '10px', background: 'rgba(15,23,42,0.85)', color: 'white', fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '6px' }}>
                1280 × 1280 px HD
              </span>
            </div>

            {/* Target Upload Size Specification Box */}
            <div style={{ marginTop: '12px', padding: '10px 12px', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '8px', textAlign: 'center' }}>
              <p style={{ fontSize: '11px', fontWeight: 700, color: '#166534', margin: 0 }}>
                Target Upload Size: 1:1 Square (1280 × 1280 px HD)
              </p>
            </div>

            {/* 3 Quick Stat Badges */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginTop: '16px' }}>
              <div style={{ background: '#F8FAFC', padding: '8px', borderRadius: '8px', textAlign: 'center', border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '10px', color: '#64748B', display: 'block' }}>ទម្ងន់</span>
                <strong style={{ fontSize: '13px', color: '#0F172A' }}>{data.weight ? `${data.weight} kg` : '—'}</strong>
              </div>
              <div style={{ background: '#F8FAFC', padding: '8px', borderRadius: '8px', textAlign: 'center', border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '10px', color: '#64748B', display: 'block' }}>កម្ពស់</span>
                <strong style={{ fontSize: '13px', color: '#0F172A' }}>{data.height ? `${data.height} cm` : '—'}</strong>
              </div>
              <div style={{ background: '#F8FAFC', padding: '8px', borderRadius: '8px', textAlign: 'center', border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '10px', color: '#64748B', display: 'block' }}>អាយុ</span>
                <strong style={{ fontSize: '13px', color: '#0F172A' }}>{data.age || '—'}</strong>
              </div>
            </div>
          </div>

          {/* Public QR Verification Stamp Card with Wi-Fi LAN IP support */}
          <QrCodeCard path={`/public/stock/${primaryId}`} title="📱 Public Stock QR Code" />
        </div>

        {/* RIGHT COLUMN: Tab Navigation & Structured Section Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Sub-Tab Navigation */}
          <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #E2E8F0', paddingBottom: '8px' }}>
            <button
              onClick={() => setActiveTab('profile')}
              style={{
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: 700,
                border: 'none',
                borderRadius: '8px',
                background: activeTab === 'profile' ? '#16A34A' : 'transparent',
                color: activeTab === 'profile' ? 'white' : '#64748B',
                cursor: 'pointer',
              }}
            >
              📋 Animal Profile
            </button>
            <button
              onClick={() => setActiveTab('timeline')}
              style={{
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: 700,
                border: 'none',
                borderRadius: '8px',
                background: activeTab === 'timeline' ? '#16A34A' : 'transparent',
                color: activeTab === 'timeline' ? 'white' : '#64748B',
                cursor: 'pointer',
              }}
            >
              📅 Timeline & Events
            </button>
            <button
              onClick={() => setActiveTab('attachments')}
              style={{
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: 700,
                border: 'none',
                borderRadius: '8px',
                background: activeTab === 'attachments' ? '#16A34A' : 'transparent',
                color: activeTab === 'attachments' ? 'white' : '#64748B',
                cursor: 'pointer',
              }}
            >
              📎 Attachments
            </button>
          </div>

          {/* TAB 1: PROFILE SECTIONS */}
          {activeTab === 'profile' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {config.detailSections.map((section) => (
                <div key={section.id} style={{ background: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0', padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>{section.icon || '📌'}</span> {section.title}
                  </h3>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                    {section.fields.map((fieldName) => {
                      const val = data[fieldName];

                      return (
                        <div key={fieldName} style={{ background: '#F8FAFC', padding: '10px 14px', borderRadius: '10px', border: '1px solid #F1F5F9' }}>
                          <p style={{ fontSize: '11px', color: '#64748B', margin: 0, textTransform: 'capitalize' }}>
                            {fieldName.replace(/([A-Z])/g, ' $1')}
                          </p>
                          <p style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', margin: '2px 0 0' }}>
                            {val !== undefined && val !== null && val !== '' ? String(val) : '—'}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Pedigree Lineage Card */}
              {(data.damId || data.sireId || data.sireName || data.damName) && (
                <div style={{ background: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0', padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: '0 0 14px' }}>🧬 Pedigree & Lineage</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: '12px', padding: '12px 14px' }}>
                      <p style={{ fontSize: '10px', fontWeight: 700, color: '#0284C7', margin: 0 }}>🐂 ឪពុក (Sire Bull):</p>
                      <p style={{ fontSize: '14px', fontWeight: 800, color: '#0369A1', margin: '4px 0 2px' }}>{data.sireName || data.sireId || 'Standard Sire'}</p>
                    </div>
                    <div style={{ background: '#FFF1F2', border: '1px solid #FECDD3', borderRadius: '12px', padding: '12px 14px' }}>
                      <p style={{ fontSize: '10px', fontWeight: 700, color: '#E11D48', margin: 0 }}>🐄 មេ (Dam Cow):</p>
                      <p style={{ fontSize: '14px', fontWeight: 800, color: '#BE123C', margin: '4px 0 2px' }}>{data.damName || data.damId || 'Standard Dam'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: TIMELINE */}
          {activeTab === 'timeline' && (
            <div style={{ background: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0', padding: '20px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: '0 0 14px' }}>📅 Reproduction & Health History</h3>
              <p style={{ fontSize: '13px', color: '#64748B' }}>
                Timeline event logging is dynamically recorded for this entity.
              </p>
            </div>
          )}

          {/* TAB 3: ATTACHMENTS */}
          {activeTab === 'attachments' && (
            <div style={{ background: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0', padding: '20px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: '0 0 14px' }}>📎 Attached Documents & Certificates</h3>
              <p style={{ fontSize: '13px', color: '#64748B' }}>
                Pedigree Birth Certificates, Health Records, and Invoices.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
