'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Download, Award, ShieldCheck, ArrowLeft } from 'lucide-react';

interface CertificateData {
  certNo: string;
  code: string;
  calfName: string;
  sex: string;
  breed: string;
  color: string;
  dob: string | null;
  birthWeight: string | null;
  height: string | null;
  status: string;
  farmName: string;
  provinceDistrict: string;
  communeVillage: string;
  gpsCoordinates: string;
  sireCode: string;
  sireName: string;
  sireBreed: string;
  damCode: string;
  damName: string;
  damBreed: string;
  breedingRecordId: string;
  recordedBy: string;
  registrationDate: string;
  verifiedBy: string;
  verificationDate: string;
  imageUrl: string;
  verificationCode: string;
  systemVersion: string;
}

export default function StandaloneCertificatePage() {
  const params = useParams();
  const rawId = params?.id as string;

  const [data, setData] = useState<CertificateData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingPng, setDownloadingPng] = useState<boolean>(false);
  const certRef = useRef<HTMLDivElement>(null);

  const fallbackImage = 'https://images.unsplash.com/photo-1546445317-29f4545f9d52?auto=format&fit=crop&w=800&q=80';

  useEffect(() => {
    if (!rawId) return;

    const controller = new AbortController();
    async function fetchCert() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/v1/public/calf/${encodeURIComponent(rawId)}`, {
          signal: controller.signal
        });
        if (!res.ok) {
          setError('RECORD_NOT_FOUND');
          setLoading(false);
          return;
        }
        const json = await res.json();
        if (json.success && json.data) {
          setData(json.data);
          if (typeof window !== 'undefined') {
            const searchParams = new URLSearchParams(window.location.search);
            if (searchParams.get('autodownload') === 'true') {
              setTimeout(() => {
                handleDownloadPng();
              }, 400);
            }
          }
        } else {
          setError('RECORD_NOT_FOUND');
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Fetch cert error:', err);
          setError('FAILED_TO_LOAD');
        }
      } finally {
        setLoading(false);
      }
    }
    fetchCert();
    return () => controller.abort();
  }, [rawId]);

  const handleDownloadPng = async () => {
    if (!certRef.current) return;
    try {
      setDownloadingPng(true);
      if (!(window as any).html2canvas) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
        document.body.appendChild(script);
        await new Promise((res) => {
          script.onload = res;
          script.onerror = res;
        });
      }
      if ((window as any).html2canvas) {
        const canvas = await (window as any).html2canvas(certRef.current, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff'
        });
        const link = document.createElement('a');
        link.download = `Calf_Certificate_${data?.code || 'BC'}_${data?.certNo || '2025'}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      } else {
        window.print();
      }
    } catch (err) {
      console.error('PNG download error:', err);
      window.print();
    } finally {
      setDownloadingPng(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-white">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xl font-bold animate-bounce mb-3">
          🌾
        </div>
        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-2" />
        <p className="text-slate-300 font-bold text-sm">Loading KAKSEDTHAN Official Certificate...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
          <Award className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h1 className="text-lg font-bold text-white mb-2">Certificate Not Found</h1>
          <p className="text-xs text-slate-400 mb-6">
            The certificate ID <span className="font-mono text-emerald-400 font-bold">{rawId}</span> does not exist in the database.
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Return to KAKSEDTHAN
          </a>
        </div>
      </div>
    );
  }

  const publicQrUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/public/calf/${encodeURIComponent(data.certNo)}`
    : `https://kaksedthan.com/public/calf/${encodeURIComponent(data.certNo)}`;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-900 p-4 sm:p-8 font-sans">
      
      {/* Top Standalone Action Header (No Sidebar) */}
      <div className="max-w-[1240px] mx-auto mb-6 bg-slate-950 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-black text-xl">
            K
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-white">KAKSEDTHAN Official Pedigree Certificate</h1>
            <p className="text-xs text-slate-400 font-mono">Cert No: <span className="text-emerald-400 font-bold">{data.certNo}</span> • Calf: {data.calfName}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadPng}
            disabled={downloadingPng}
            className="px-5 py-2.5 bg-[#0B6B3A] hover:bg-[#08522c] text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-50"
          >
            <Download className="h-4 w-4" /> {downloadingPng ? 'Generating PNG Image...' : 'Download PNG'}
          </button>

          <button
            onClick={() => window.close()}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl flex items-center gap-2 transition-all cursor-pointer border border-slate-700"
          >
            ✕ Close
          </button>
        </div>
      </div>

      {/* Official Certificate Frame */}
      <div className="max-w-[1240px] mx-auto">
        <div
          ref={certRef}
          className="bg-white rounded-3xl border-4 border-[#0B6B3A] p-6 md:p-8 relative shadow-2xl overflow-hidden text-slate-900"
          style={{ backgroundColor: '#FFFFFF', borderColor: '#0B6B3A' }}
        >
          <div style={{ position: 'absolute', inset: '6px', border: '1.5px solid #C89B3C', borderRadius: '20px', pointerEvents: 'none' }} />

          {/* Header */}
          <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr 240px', gap: '16px', alignItems: 'center', borderBottom: '2px solid #E2E8F0', paddingBottom: '16px', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#C89B3C', letterSpacing: '0.08em', margin: 0, lineHeight: 1.1 }}>
                PEDIGREE
              </h2>
              <div style={{ width: '80px', height: '3px', background: '#C89B3C', marginTop: '4px', marginBottom: '6px' }} />
              <p style={{ fontSize: '9px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                BUILDING BETTER HERD FOR BETTER FUTURE
              </p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#C89B3C', fontSize: '14px', lineHeight: 1 }}>◆</div>
              <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#0B6B3A', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '2px 0 4px', lineHeight: 1.2 }}>
                BIRTH CERTIFICATE OF CALF
              </h1>
              <p style={{ fontSize: '11px', color: '#64748B', margin: 0, fontWeight: 500 }}>
                Official birth & pedigree registration certificate issued by the Kaksedthan livestock management system.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#0B6B3A', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '18px' }}>
                  K
                </div>
                <div style={{ textAlign: 'left' }}>
                  <p style={{ fontSize: '14px', fontWeight: 900, color: '#0F172A', margin: 0, lineHeight: 1.1 }}>KAKSEDTHAN</p>
                  <p style={{ fontSize: '10px', fontWeight: 800, color: '#0B6B3A', margin: '2px 0 0', textTransform: 'uppercase' }}>Livestock Management</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 280px', gap: '20px', alignItems: 'start' }}>
            
            {/* Column 1 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <h3 style={{ fontSize: '12px', fontWeight: 900, color: '#0B6B3A', textTransform: 'uppercase', margin: '0 0 8px' }}>
                  🐄 CALF INFORMATION
                </h3>
                <div style={{ background: '#0B6B3A', color: 'white', padding: '6px 12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase' }}>CERTIFICATE NO.</span>
                  <span style={{ fontSize: '13px', fontWeight: 900, fontFamily: 'monospace' }}>{data.certNo}</span>
                </div>
                <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', overflow: 'hidden', fontSize: '11px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', padding: '5px 10px', borderBottom: '1px solid #F1F5F9' }}>
                    <span style={{ color: '#64748B' }}>Calf ID (System)</span>
                    <span style={{ fontWeight: 800, color: '#0F172A', fontFamily: 'monospace' }}>: {data.code}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', padding: '5px 10px', borderBottom: '1px solid #F1F5F9' }}>
                    <span style={{ color: '#64748B' }}>Calf Name</span>
                    <span style={{ fontWeight: 900, color: '#0F172A' }}>: {data.calfName}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', padding: '5px 10px', borderBottom: '1px solid #F1F5F9' }}>
                    <span style={{ color: '#64748B' }}>Sex</span>
                    <span style={{ fontWeight: 800, color: data.sex === 'Female' ? '#BE123C' : '#1D4ED8' }}>: {data.sex}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', padding: '5px 10px', borderBottom: '1px solid #F1F5F9' }}>
                    <span style={{ color: '#64748B' }}>Breed</span>
                    <span style={{ fontWeight: 800, color: '#0B6B3A' }}>: {data.breed}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', padding: '5px 10px', borderBottom: '1px solid #F1F5F9' }}>
                    <span style={{ color: '#64748B' }}>Coat Color</span>
                    <span style={{ fontWeight: 700, color: '#0F172A' }}>: {data.color}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', padding: '5px 10px', borderBottom: '1px solid #F1F5F9' }}>
                    <span style={{ color: '#64748B' }}>Date of Birth</span>
                    <span style={{ fontWeight: 800, color: '#0F172A' }}>: {data.dob || '—'}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', padding: '5px 10px', borderBottom: '1px solid #F1F5F9' }}>
                    <span style={{ color: '#64748B' }}>Birth Weight</span>
                    <span style={{ fontWeight: 800, color: '#0F172A' }}>: {data.birthWeight ? `${data.birthWeight} kg` : '—'}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', padding: '5px 10px', borderBottom: '1px solid #F1F5F9' }}>
                    <span style={{ color: '#64748B' }}>Current Status</span>
                    <span style={{ fontWeight: 800, color: '#16a34a' }}>: ✓ {data.status}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '11px', fontWeight: 900, color: '#0B6B3A', textTransform: 'uppercase', margin: '0 0 6px' }}>
                  📍 LOCATION OF BIRTH
                </h3>
                <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '8px 10px', fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr' }}>
                    <span style={{ color: '#64748B' }}>Farm Name</span>
                    <span style={{ fontWeight: 900, color: '#16a34a' }}>: {data.farmName}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr' }}>
                    <span style={{ color: '#64748B' }}>Province / District</span>
                    <span style={{ fontWeight: 700, color: '#0F172A' }}>: {data.provinceDistrict}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <h3 style={{ fontSize: '12px', fontWeight: 900, color: '#0B6B3A', textTransform: 'uppercase', margin: '0 0 8px' }}>
                  🔗 PARENT INFORMATION (PEDIGREE)
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ background: '#F0F9FF', border: '1px solid #BFDBFE', borderRadius: '10px', padding: '10px 12px' }}>
                    <p style={{ fontSize: '10px', fontWeight: 900, color: '#1D4ED8', textTransform: 'uppercase', margin: '0 0 4px' }}>♂ SIRE (FATHER)</p>
                    <p style={{ fontSize: '12px', fontWeight: 900, color: '#16a34a', margin: 0 }}>{data.sireName}</p>
                    <p style={{ fontSize: '10px', color: '#64748B', margin: '2px 0 0', fontFamily: 'monospace' }}>Code: {data.sireCode} • Breed: {data.sireBreed}</p>
                  </div>
                  <div style={{ background: '#FFF1F2', border: '1px solid #FECDD3', borderRadius: '10px', padding: '10px 12px' }}>
                    <p style={{ fontSize: '10px', fontWeight: 900, color: '#BE123C', textTransform: 'uppercase', margin: '0 0 4px' }}>♀ DAM (MOTHER)</p>
                    <p style={{ fontSize: '12px', fontWeight: 900, color: '#16a34a', margin: 0 }}>{data.damName}</p>
                    <p style={{ fontSize: '10px', color: '#64748B', margin: '2px 0 0', fontFamily: 'monospace' }}>Code: {data.damCode} • Breed: {data.damBreed}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '11px', fontWeight: 900, color: '#0B6B3A', textTransform: 'uppercase', margin: '0 0 6px' }}>
                  📋 REGISTRATION INFORMATION
                </h3>
                <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '8px 10px', fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr' }}>
                    <span style={{ color: '#64748B' }}>Date of Registration</span>
                    <span style={{ fontWeight: 800, color: '#0F172A' }}>: {data.registrationDate}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr' }}>
                    <span style={{ color: '#64748B' }}>Breeding Record ID</span>
                    <span style={{ fontWeight: 800, color: '#0F172A', fontFamily: 'monospace' }}>: {data.breedingRecordId}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 3 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'center' }}>
              <div style={{ width: '100%', borderRadius: '16px', overflow: 'hidden', border: '2px solid #0B6B3A', background: '#0F172A' }}>
                <div style={{ position: 'relative', width: '100%', aspectRatio: '4 / 3' }}>
                  <img src={data.imageUrl || fallbackImage} alt={data.calfName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ background: '#0B6B3A', padding: '6px 8px', textAlign: 'center' }}>
                  <p style={{ fontSize: '11px', fontWeight: 900, color: 'white', margin: 0 }}>{data.calfName} - {data.code}</p>
                </div>
              </div>

              <div style={{ width: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#F8FAFC', borderRadius: '14px', border: '1px solid #E2E8F0', padding: '12px' }}>
                <p style={{ fontSize: '11px', fontWeight: 900, color: '#0B6B3A', margin: '0 0 6px', textTransform: 'uppercase' }}>🛡️ SCAN TO VERIFY</p>
                <div style={{ padding: '6px', background: 'white', borderRadius: '10px', border: '2px solid #E2E8F0', display: 'inline-block' }}>
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(publicQrUrl)}`} alt="QR" style={{ width: '100px', height: '100px', display: 'block' }} />
                </div>
              </div>

              <div style={{ width: '100%', background: '#0B6B3A', borderRadius: '12px', padding: '10px', textAlign: 'center', color: 'white' }}>
                <p style={{ fontSize: '10px', fontWeight: 800, margin: 0, lineHeight: 1.3 }}>Building a traceable and productive livestock sector for Cambodia.</p>
              </div>
            </div>

          </div>

          {/* Footer */}
          <div style={{ marginTop: '20px', paddingTop: '12px', borderTop: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ fontSize: '10px', color: '#64748B', margin: 0, fontStyle: 'italic' }}>This certificate is electronically issued by the Kaksedthan Livestock Database and is valid without a physical signature.</p>
            <div style={{ padding: '4px 12px', background: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
              <p style={{ fontSize: '11px', fontWeight: 900, color: '#0B6B3A', margin: 0, fontFamily: 'monospace' }}>Record ID: {data.certNo}</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
