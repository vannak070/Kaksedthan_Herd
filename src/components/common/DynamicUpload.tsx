'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, Check, Image as ImageIcon, FileText, Download } from 'lucide-react';

interface DynamicUploadProps {
  value?: string;
  onChange: (url: string) => void;
  mode?: 'image' | 'file';
  accept?: string;
  label?: string;
  targetSizeText?: string;
  aspectRatio?: number; // Default 1:1
}

export const DynamicUpload: React.FC<DynamicUploadProps> = ({
  value,
  onChange,
  mode = 'image',
  accept = 'image/*',
  label = 'Upload File',
  targetSizeText = 'Target Upload Size: 1:1 Square (1280 × 1280 px HD)',
  aspectRatio = 1,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(value || null);
  const [isCropping, setIsCropping] = useState(false);
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // File size validation (Max 10 MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Image is too large. Please upload an image smaller than 10 MB.');
      return;
    }

    if (mode === 'image' && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setRawImageSrc(reader.result as string);
        setIsCropping(true);
      };
      reader.readAsDataURL(file);
    } else {
      // Direct file upload
      const fakeUrl = URL.createObjectURL(file);
      setPreviewUrl(fakeUrl);
      onChange(fakeUrl);
    }
  };

  const handleApplyCrop = () => {
    if (!rawImageSrc) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const targetWidth = 1280;
      const targetHeight = 1280;
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Center crop square 1:1
        const minDim = Math.min(img.width, img.height);
        const startX = (img.width - minDim) / 2;
        const startY = (img.height - minDim) / 2;
        ctx.drawImage(img, startX, startY, minDim, minDim, 0, 0, targetWidth, targetHeight);
        const croppedBase64 = canvas.toDataURL('image/jpeg', 0.92);
        setPreviewUrl(croppedBase64);
        onChange(croppedBase64);
      }
      setIsCropping(false);
      setRawImageSrc(null);
    };
    img.src = rawImageSrc;
  };

  return (
    <div style={{ marginBottom: '16px' }}>
      {label && <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>{label}</label>}

      {previewUrl ? (
        <div style={{ position: 'relative', width: '100%', maxWidth: '280px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #E2E8F0', background: '#F8FAFC' }}>
          {mode === 'image' ? (
            <div style={{ width: '100%', aspectRatio: '1/1', overflow: 'hidden', position: 'relative' }}>
              <img src={previewUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <span style={{ position: 'absolute', bottom: '8px', right: '8px', background: 'rgba(0,0,0,0.65)', color: 'white', fontSize: '10px', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                1280 × 1280 HD
              </span>
            </div>
          ) : (
            <div style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FileText className="h-6 w-6 text-blue-600" />
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#1E293B', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Attachment Loaded</span>
            </div>
          )}
          <button
            type="button"
            onClick={() => {
              setPreviewUrl(null);
              onChange('');
            }}
            style={{ position: 'absolute', top: '8px', right: '8px', width: '28px', height: '28px', borderRadius: '999px', background: 'rgba(239, 68, 68, 0.9)', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: '2px dashed #CBD5E1',
            borderRadius: '12px',
            padding: '24px',
            textAlign: 'center',
            background: '#F8FAFC',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
          <p style={{ fontSize: '13px', fontWeight: 600, color: '#334155', margin: 0 }}>Click or Drag & Drop to Upload</p>
          <p style={{ fontSize: '11px', color: '#64748B', margin: '4px 0 0' }}>{targetSizeText}</p>
          <input ref={fileInputRef} type="file" accept={accept} onChange={handleFileSelect} style={{ display: 'none' }} />
        </div>
      )}

      {/* Interactive Cropper Modal */}
      {isCropping && rawImageSrc && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(15,23,42,0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: 'white', borderRadius: '16px', maxWidth: '500px', width: '100%', padding: '24px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: '0 0 12px' }}>Crop Image (1:1 HD Preset)</h3>
            <div style={{ width: '100%', height: '280px', borderRadius: '10px', overflow: 'hidden', background: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <img src={rawImageSrc} alt="Cropping Raw" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
              <div style={{ position: 'absolute', width: '200px', height: '200px', border: '2px solid #16A34A', boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)', pointerEvents: 'none' }} />
            </div>
            <p style={{ fontSize: '11px', color: '#64748B', marginTop: '8px', textAlign: 'center' }}>Center 1:1 HD Crop Preset will be applied automatically</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
              <button type="button" onClick={() => setIsCropping(false)} style={{ padding: '8px 16px', fontSize: '13px', background: '#F1F5F9', border: 'none', borderRadius: '8px', cursor: 'pointer', color: '#475569' }}>
                Cancel
              </button>
              <button type="button" onClick={handleApplyCrop} style={{ padding: '8px 20px', fontSize: '13px', fontWeight: 600, background: '#16A34A', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Check className="h-4 w-4" /> Confirm 1280 × 1280 Crop
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
