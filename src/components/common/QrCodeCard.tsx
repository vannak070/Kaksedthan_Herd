import React, { useState } from 'react';
import { useQrCodeUrl, getQrCodeImageUrl } from '@/utils/qrHelper';
import { Wifi, Copy, Check, Download, ShieldCheck } from 'lucide-react';

interface QrCodeCardProps {
  path: string;
  title?: string;
  subtitle?: string;
  size?: number;
  compact?: boolean;
}

export default function QrCodeCard({
  path,
  title = 'Public QR Verification',
  subtitle = 'Public scannable link for mobile & desktop browsers',
  size = 160,
  compact = false
}: QrCodeCardProps) {
  const { targetUrl, lanIp } = useQrCodeUrl(path);
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(targetUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadPng = (e: React.MouseEvent) => {
    e.stopPropagation();
    const qrUrl = getQrCodeImageUrl(targetUrl, 400);
    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = `kaksedthan-qr-${path.replace(/[^a-zA-Z0-9]/g, '-')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isLocalDev = lanIp && (lanIp.startsWith('192.168.') || lanIp.startsWith('10.') || lanIp.startsWith('172.') || lanIp === 'localhost' || lanIp === '127.0.0.1');
  const qrImgSrc = getQrCodeImageUrl(targetUrl, size);

  if (compact) {
    return (
      <div style={{ background: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0', padding: '12px', textAlign: 'center', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <img
          src={qrImgSrc}
          alt="QR Code"
          style={{ width: `${size}px`, height: `${size}px`, borderRadius: '8px', border: '1px solid #CBD5E1', background: 'white' }}
        />
        <div style={{ textAlign: 'left', flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: '12px', fontWeight: 800, color: '#0F172A', margin: 0 }}>{title}</p>
          <p style={{ fontSize: '10px', color: '#64748B', margin: '2px 0 6px', fontFamily: 'monospace' }} className="truncate">
            {targetUrl}
          </p>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <button
              onClick={handleDownloadPng}
              style={{ padding: '4px 10px', fontSize: '10px', fontWeight: 700, background: '#16a34a', border: 'none', borderRadius: '6px', color: 'white', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              <Download className="h-3 w-3" /> Download PNG
            </button>
            <button
              onClick={handleCopy}
              style={{ padding: '4px 10px', fontSize: '10px', fontWeight: 700, background: '#0F172A', border: 'none', borderRadius: '6px', color: 'white', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      
      {/* Brand Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
        <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#DCFCE7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '14px' }}>
          🌾
        </div>
        <span style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>KAKSEDTHAN ERP</span>
      </div>

      <p style={{ fontSize: '12px', fontWeight: 800, color: '#0F172A', margin: '0 0 2px' }}>📱 {title}</p>
      <p style={{ fontSize: '10px', color: '#64748B', margin: '0 0 12px' }}>{subtitle}</p>

      {/* QR Code Image Container */}
      <div style={{ padding: '12px', background: '#F8FAFC', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 2px 6px rgba(0,0,0,0.03)', position: 'relative', margin: '0 auto 12px' }}>
        <img
          src={qrImgSrc}
          alt="Scannable Public QR Code"
          style={{ width: `${size}px`, height: `${size}px`, display: 'block', borderRadius: '8px' }}
        />
      </div>

      {/* QR Status */}
      <div style={{ marginBottom: '10px' }}>
        <span style={{ fontSize: '10px', fontWeight: 700, padding: '3px 10px', borderRadius: '999px', background: '#DCFCE7', color: '#15803D', border: '1px solid #BBF7D0', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          🟢 Active & Verified Public Link
        </span>
      </div>

      {/* Target Public URL display */}
      <div style={{ marginBottom: '14px', width: '100%' }}>
        <div style={{ padding: '6px 10px', borderRadius: '8px', background: '#F1F5F9', border: '1px solid #E2E8F0', width: '100%', wordBreak: 'break-all', fontSize: '10px', fontFamily: 'monospace', color: '#334155' }}>
          {targetUrl}
        </div>
      </div>

      {/* Actions (ONLY 2 BUTTONS: Download QR Code (PNG) & Copy Public Link) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', width: '100%' }}>
        <button
          onClick={handleDownloadPng}
          style={{ padding: '8px 10px', borderRadius: '8px', background: '#16a34a', color: 'white', border: 'none', fontWeight: 700, fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
          className="hover:bg-[#15803d] transition-colors"
        >
          <Download className="h-3.5 w-3.5" /> Download PNG
        </button>
        <button
          onClick={handleCopy}
          style={{ padding: '8px 10px', borderRadius: '8px', background: '#0F172A', color: 'white', border: 'none', fontWeight: 700, fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
          className="hover:bg-slate-800 transition-colors"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? 'Copied!' : 'Copy Link'}
        </button>
      </div>

    </div>
  );
}
