'use client';

import React, { useState, useEffect } from 'react';
import { FieldConfig, ModuleConfig } from '../../config/modules/types';
import { DynamicUpload } from './DynamicUpload';

interface DynamicFormProps {
  config: ModuleConfig;
  initialValues?: Record<string, any>;
  onSubmit: (formData: Record<string, any>) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const DynamicForm: React.FC<DynamicFormProps> = ({
  config,
  initialValues = {},
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [dynamicOptions, setDynamicOptions] = useState<Record<string, { label: string; value: any }[]>>({});

  useEffect(() => {
    // Populate defaults and initial values
    const initial: Record<string, any> = {};
    config.fields.forEach((field) => {
      if (initialValues[field.name] !== undefined) {
        initial[field.name] = initialValues[field.name];
      } else if (field.defaultValue !== undefined) {
        initial[field.name] = field.defaultValue;
      } else {
        initial[field.name] = field.type === 'number' ? 0 : field.type === 'switch' ? false : '';
      }
    });
    setFormData(initial);

    // Fetch dynamic options if apiSource is specified
    config.fields.forEach((field) => {
      if (field.apiSource) {
        fetch(field.apiSource)
          .then((res) => res.json())
          .then((json) => {
            if (json.success && Array.isArray(json.data)) {
              const opts = json.data.map((item: any) => ({
                label: item.name || item.no || item.id || String(item),
                value: item.id || item.code || item.no,
              }));
              setDynamicOptions((prev) => ({ ...prev, [field.name]: opts }));
            }
          })
          .catch((err) => console.warn(`Failed to fetch dynamic options for ${field.name}:`, err));
      }
    });
  }, [config, initialValues]);

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmitForm} style={{ padding: '4px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '14px' }}>
        {config.fields.map((field: FieldConfig) => {
          if (field.hidden) return null;
          const colSpan = field.gridSpan || 6;
          const value = formData[field.name] !== undefined ? formData[field.name] : '';

          return (
            <div key={field.name} style={{ gridColumn: `span ${colSpan}` }}>
              {field.type !== 'image' && field.type !== 'file' && (
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                  {field.label} {field.required && <span style={{ color: '#EF4444' }}>*</span>}
                </label>
              )}

              {/* Render by Type */}
              {field.type === 'text' && (
                <input
                  type="text"
                  required={field.required}
                  readOnly={field.readOnly}
                  placeholder={field.placeholder}
                  value={value}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', fontSize: '13px', border: '1px solid #CBD5E1', borderRadius: '8px', outline: 'none', color: '#0F172A', boxSizing: 'border-box' }}
                />
              )}

              {field.type === 'number' && (
                <input
                  type="number"
                  required={field.required}
                  readOnly={field.readOnly}
                  placeholder={field.placeholder}
                  value={value}
                  onChange={(e) => handleChange(field.name, parseFloat(e.target.value) || 0)}
                  style={{ width: '100%', padding: '8px 12px', fontSize: '13px', border: '1px solid #CBD5E1', borderRadius: '8px', outline: 'none', color: '#0F172A', boxSizing: 'border-box' }}
                />
              )}

              {field.type === 'date' && (
                <input
                  type="date"
                  required={field.required}
                  readOnly={field.readOnly}
                  value={value ? String(value).split('T')[0] : ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', fontSize: '13px', border: '1px solid #CBD5E1', borderRadius: '8px', outline: 'none', color: '#0F172A', boxSizing: 'border-box' }}
                />
              )}

              {field.type === 'select' && (
                <select
                  required={field.required}
                  disabled={field.readOnly}
                  value={value}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', fontSize: '13px', border: '1px solid #CBD5E1', borderRadius: '8px', outline: 'none', color: '#0F172A', background: 'white', boxSizing: 'border-box', cursor: 'pointer' }}
                >
                  <option value="">-- Select {field.label} --</option>
                  {(dynamicOptions[field.name] || field.options || []).map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              )}

              {field.type === 'textarea' && (
                <textarea
                  rows={3}
                  required={field.required}
                  placeholder={field.placeholder}
                  value={value}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', fontSize: '13px', border: '1px solid #CBD5E1', borderRadius: '8px', outline: 'none', color: '#0F172A', resize: 'vertical', boxSizing: 'border-box' }}
                />
              )}

              {field.type === 'image' && (
                <DynamicUpload
                  label={field.label}
                  value={value}
                  mode="image"
                  onChange={(url) => handleChange(field.name, url)}
                />
              )}

              {field.type === 'file' && (
                <DynamicUpload
                  label={field.label}
                  value={value}
                  mode="file"
                  onChange={(url) => handleChange(field.name, url)}
                />
              )}
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #E2E8F0' }}>
        <button
          type="button"
          onClick={onCancel}
          style={{ padding: '9px 18px', fontSize: '13px', fontWeight: 500, border: '1px solid #CBD5E1', borderRadius: '8px', background: 'white', color: '#475569', cursor: 'pointer' }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          style={{ padding: '9px 24px', fontSize: '13px', fontWeight: 600, border: 'none', borderRadius: '8px', background: isSubmitting ? '#86EFAC' : '#16A34A', color: 'white', cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
        >
          {isSubmitting ? '⏳ Saving...' : '💾 Save Record'}
        </button>
      </div>
    </form>
  );
};
