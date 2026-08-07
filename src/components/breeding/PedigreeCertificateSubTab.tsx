import React, { useState, useRef } from 'react';
import { Award, Download, Eye, ExternalLink, Search, Filter, ShieldCheck, CheckCircle } from 'lucide-react';
import { FullCalfRecord } from './types';
import { downloadCalfCertificatePng } from '@/lib/utils/certificate-downloader';

interface PedigreeCertificateSubTabProps {
  selectedCalf?: FullCalfRecord;
  calfRecords?: FullCalfRecord[];
  onSelectCalf?: (calfId: string) => void;
}

export default function PedigreeCertificateSubTab({
  selectedCalf,
  calfRecords = [],
  onSelectCalf
}: PedigreeCertificateSubTabProps) {
  const [viewMode, setViewMode] = useState<'center' | 'viewer'>('center');
  const [searchTerm, setSearchTerm] = useState('');
  const [farmFilter, setFarmFilter] = useState('ALL');
  const [breedFilter, setBreedFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'latest' | 'certNo' | 'name'>('latest');
  const [downloadingPng, setDownloadingPng] = useState(false);
  const certRef = useRef<HTMLDivElement>(null);

  const calfData: any = selectedCalf || {};

  // Fallback calf data defaults for complete rendering
  const calfName = calfData.calfName || calfData.name || 'តូច (Maro)';
  const code = String(calfData.code || calfData.tagId || 'CALF-2025-0004');
  const certNo = calfData.certNo || `BC-2025-${code.replace(/\D/g, '') || '00000084'}`;
  const sex = calfData.sex || calfData.gender || 'Female';
  const breed = calfData.breed || 'Wagyu';
  const color = calfData.color || calfData.coatColor || 'Red & White';
  const dob = calfData.dob || calfData.birthDate || '2025-10-15';
  const birthWeight = calfData.birthWeight || calfData.weight || '18.8';
  const height = calfData.height || '—';
  const status = calfData.status || calfData.healthStatus || 'Healthy (Nursing)';
  
  // Location defaults
  const farmName = calfData.farmName || 'SNR Farm';
  const provinceDistrict = calfData.provinceDistrict || 'Kandal / Ang Snoul';
  const communeVillage = calfData.communeVillage || calfData.location || 'Prek Anchanh';
  const gpsCoordinates = calfData.gpsCoordinates || '11.4707 N, 104.9390 E';

  // Sire defaults
  const sireCode = calfData.sireId || calfData.sireCode || 'SIRE-2022-0156';
  const sireName = calfData.sireName || calfData.bullName || 'ARGUS Blonde';
  const sireBreed = calfData.sireBreed || 'Wagyu';

  // Dam defaults
  const damCode = calfData.damId || calfData.damCode || 'CALF-2023-0004';
  const damName = calfData.damName || 'best5';
  const damBreed = calfData.damBreed || '—';

  // Registration & System defaults
  const registrationDate = calfData.registrationDate || calfData.createdDate || '04/08/2025';
  const recordedBy = calfData.recordedBy || 'CCEC Kaksedthan';
  const systemVersion = 'Kaksedthan v2.0';
  const breedingRecordId = calfData.breedingRecordId || calfData.breedingProgramCode || 'BR-2025-0098';
  const verifiedBy = calfData.verifiedBy || 'Super Admin (CCEC)';
  const verificationDate = calfData.verificationDate || '04/08/2025';

  const imageUrl = selectedCalf?.imageUrl || calfData?.imageUrl || 'https://images.unsplash.com/photo-1546445317-29f4545f9d52?auto=format&fit=crop&w=800&q=80';
  const publicQrUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/public/calf/${encodeURIComponent(certNo)}`
    : `https://kaksedthan.com/public/calf/${encodeURIComponent(certNo)}`;

  const handleDownloadPng = async (targetElement?: HTMLDivElement | null, customCode?: string) => {
    const el = targetElement || certRef.current;
    if (!el) return;
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
        const canvas = await (window as any).html2canvas(el, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff'
        });
        const link = document.createElement('a');
        link.download = `Calf_Certificate_${customCode || code}_${certNo}.png`;
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

  // Extract unique filter lists
  const farms = Array.from(new Set(calfRecords.map(c => (c as any).farmName || 'SNR Farm').filter(Boolean)));
  const breeds = Array.from(new Set(calfRecords.map(c => c.breed || 'Wagyu').filter(Boolean)));
  const statuses = Array.from(new Set(calfRecords.map(c => (c as any).status || (c as any).healthStatus || 'Healthy').filter(Boolean)));

  // Filtered & Sorted Calf Certificates list
  const filteredCalves = calfRecords
    .filter(c => {
      const cData: any = c;
      const cName = cData.calfName || cData.name || '';
      const cTag = cData.code || cData.tagId || '';
      const cCert = cData.certNo || `BC-2025-${cTag.replace(/\D/g, '') || '00000084'}`;
      const cFarm = cData.farmName || 'SNR Farm';
      const cBreed = cData.breed || 'Wagyu';
      const cStatus = cData.status || cData.healthStatus || 'Healthy';

      const matchesSearch =
        !searchTerm ||
        cName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cTag.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cCert.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFarm = farmFilter === 'ALL' || cFarm === farmFilter;
      const matchesBreed = breedFilter === 'ALL' || cBreed === breedFilter;
      const matchesStatus = statusFilter === 'ALL' || cStatus === statusFilter;

      return matchesSearch && matchesFarm && matchesBreed && matchesStatus;
    })
    .sort((a, b) => {
      const aData: any = a;
      const bData: any = b;
      if (sortBy === 'certNo') {
        const aCert = aData.certNo || aData.code || '';
        const bCert = bData.certNo || bData.code || '';
        return aCert.localeCompare(bCert);
      }
      if (sortBy === 'name') {
        const aName = aData.calfName || aData.name || '';
        const bName = bData.calfName || bData.name || '';
        return aName.localeCompare(bName);
      }
      // default: latest created
      return (bData.registrationDate || b.id).localeCompare(aData.registrationDate || a.id);
    });

  return (
    <div className="space-y-6 max-w-[1240px] mx-auto pb-12 font-sans text-slate-900">

      {/* ── PRINT MEDIA CSS STYLES ── */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          @page {
            size: A4 landscape;
            margin: 8mm;
          }
          .no-print {
            display: none !important;
          }
          .certificate-container {
            border: 3px solid #0B6B3A !important;
            box-shadow: none !important;
            width: 100% !important;
            max-width: 100% !important;
            page-break-inside: avoid;
          }
        }
      `}</style>

      {/* ── TOP MODE SELECTOR BAR ── */}
      <div className="no-print bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#0B6B3A] flex items-center justify-center font-bold">
            📜
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Official Calf Certificate Center</h2>
            <p className="text-xs text-slate-500 font-medium">Read-only system-generated birth & pedigree certificates</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('center')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              viewMode === 'center'
                ? 'bg-[#0B6B3A] text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            🏛️ Certificate Center ({filteredCalves.length})
          </button>
          <button
            onClick={() => setViewMode('viewer')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              viewMode === 'viewer'
                ? 'bg-[#0B6B3A] text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            📄 Full A4 Certificate Viewer
          </button>
        </div>
      </div>

      {/* ── MODE 1: CERTIFICATE CENTER GRID ── */}
      {viewMode === 'center' ? (
        <div className="space-y-6">

          {/* SEARCH & FILTERS BAR */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              
              {/* Search Box */}
              <div className="md:col-span-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search Cert No, Name, Tag ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0B6B3A]"
                />
              </div>

              {/* Farm Filter */}
              <div>
                <select
                  value={farmFilter}
                  onChange={(e) => setFarmFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0B6B3A]"
                >
                  <option value="ALL">🏢 All Farms</option>
                  {farms.map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>

              {/* Breed Filter */}
              <div>
                <select
                  value={breedFilter}
                  onChange={(e) => setBreedFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0B6B3A]"
                >
                  <option value="ALL">🧬 All Breeds</option>
                  {breeds.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0B6B3A]"
                >
                  <option value="ALL">🟢 All Statuses</option>
                  {statuses.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Sort By Dropdown */}
              <div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-[#0B6B3A] focus:outline-none focus:ring-2 focus:ring-[#0B6B3A]"
                >
                  <option value="latest">🕒 Sort: Latest Created</option>
                  <option value="certNo">🔢 Sort: Cert Number</option>
                  <option value="name">🔤 Sort: Calf Name</option>
                </select>
              </div>

            </div>
          </div>

          {/* CERTIFICATES CARDS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCalves.map((c) => {
              const cData: any = c;
              const cName = cData.calfName || cData.name || 'តូច (Maro)';
              const cTag = cData.code || cData.tagId || 'CALF-2025-0004';
              const cCert = cData.certNo || `BC-2025-${cTag.replace(/\D/g, '') || '00000084'}`;
              const cBreed = cData.breed || 'Wagyu';
              const cFarm = cData.farmName || 'SNR Farm';
              const cDate = cData.registrationDate || cData.createdDate || '04/08/2025';
              const cStatus = cData.status || cData.healthStatus || 'Healthy';
              const cImg = c.imageUrl || 'https://images.unsplash.com/photo-1546445317-29f4545f9d52?auto=format&fit=crop&w=800&q=80';

              return (
                <div
                  key={c.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col justify-between group"
                >
                  {/* Card Header & Cert Banner */}
                  <div>
                    <div className="relative aspect-[4/3] bg-slate-900 overflow-hidden">
                      <img src={cImg} alt="" className="absolute inset-0 w-full h-full object-cover filter blur-md opacity-50 scale-110" />
                      <img src={cImg} alt={cName} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      
                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 right-3 flex justify-between items-center z-10">
                        <span className="px-2.5 py-1 bg-[#0B6B3A] text-white text-[10px] font-black rounded-lg shadow-md font-mono">
                          {cCert}
                        </span>
                        <span className="px-2.5 py-1 bg-emerald-500/90 backdrop-blur-md text-white text-[10px] font-bold rounded-lg shadow-md">
                          ✓ Official
                        </span>
                      </div>
                    </div>

                    <div className="p-5 space-y-3">
                      <div>
                        <div className="flex items-center justify-between">
                          <h3 className="text-base font-extrabold text-slate-900 group-hover:text-[#0B6B3A] transition-colors">{cName}</h3>
                          <span className="text-xs font-mono font-bold text-slate-500">#{cTag}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-bold text-emerald-600">{cBreed}</span>
                          <span className="text-slate-300">•</span>
                          <span className="text-xs text-slate-600 font-medium">🏢 {cFarm}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Issue Date</p>
                          <p className="font-bold text-slate-800">{cDate}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Status</p>
                          <p className="font-bold text-emerald-600">🟢 {cStatus}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Actions (Read-Only) */}
                  <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => {
                        onSelectCalf?.(c.id);
                        setViewMode('viewer');
                      }}
                      className="flex-1 py-2 px-3 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" /> Preview
                    </button>

                    <button
                      onClick={() => window.open(`/certificate/${encodeURIComponent(cCert)}`, '_blank')}
                      className="py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                      title="Open in standalone tab"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> New Tab
                    </button>

                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        await downloadCalfCertificatePng({
                          certNo: cCert,
                          code: cTag,
                          tagId: cTag,
                          calfName: cName,
                          sex: (cData as any).sex,
                          breed: cBreed,
                          color: (cData as any).color,
                          dob: (cData as any).dob,
                          birthWeight: (cData as any).birthWeight,
                          status: cStatus,
                          farmName: cFarm,
                          provinceDistrict: (cData as any).provinceDistrict,
                          sireName: (cData as any).sireName,
                          sireCode: (cData as any).sireCode,
                          sireBreed: (cData as any).sireBreed,
                          damName: (cData as any).damName,
                          damCode: (cData as any).damCode,
                          damBreed: (cData as any).damBreed,
                          breedingRecordId: (cData as any).breedingRecordId,
                          registrationDate: (cData as any).dateOfRegistration,
                          imageUrl: (cData as any).imageUrl
                        });
                      }}
                      className="py-2 px-3 bg-[#0B6B3A] hover:bg-[#08522c] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                      title="1-Click Instant PNG Download"
                    >
                      <Download className="w-3.5 h-3.5" /> PNG
                    </button>
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      ) : (

        /* ── MODE 2: FULL A4 CERTIFICATE VIEWER ── */
        <div className="space-y-6">

          {/* TOP VIEWER BAR */}
          <div className="no-print bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <Award className="h-6 w-6 text-[#0B6B3A]" />
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Select Calf Certificate</label>
                <select
                  value={selectedCalf?.id || ''}
                  onChange={(e) => onSelectCalf?.(e.target.value)}
                  className="mt-1 px-3 py-1.5 text-sm font-bold border border-slate-300 rounded-lg bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B6B3A]"
                >
                  {calfRecords.map(calf => (
                    <option key={calf.id} value={calf.id}>
                      {calf.calfName || (calf as any).name} ({calf.code} - {calf.breed})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap w-full md:w-auto justify-end">
              <button
                onClick={() => window.open(`/certificate/${encodeURIComponent(certNo)}`, '_blank')}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-300 rounded-xl flex items-center gap-2 transition-all cursor-pointer"
              >
                <ExternalLink className="h-4 w-4" /> Open in New Tab
              </button>

              <button
                onClick={() => handleDownloadPng()}
                disabled={downloadingPng}
                className="px-5 py-2.5 bg-[#0B6B3A] hover:bg-[#08522c] text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                <Download className="h-4 w-4" /> {downloadingPng ? 'Generating PNG Image...' : 'Download PNG'}
              </button>
            </div>
          </div>

          {/* ── OFFICIAL CERTIFICATE DOCUMENT FRAME (A4 LANDSCAPE READY) ── */}
          <div
            ref={certRef}
            id="official-certificate-document"
            className="certificate-container bg-white rounded-3xl border-4 border-[#0B6B3A] p-6 md:p-8 relative shadow-2xl overflow-hidden font-sans text-slate-900"
            style={{
              boxSizing: 'border-box',
              backgroundColor: '#FFFFFF',
              borderColor: '#0B6B3A'
            }}
          >
            {/* Inner Gold Border Accent */}
            <div style={{ position: 'absolute', inset: '6px', border: '1.5px solid #C89B3C', borderRadius: '20px', pointerEvents: 'none' }} />

            {/* ── 1. HEADER SECTION ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr 240px', gap: '16px', alignItems: 'center', borderBottom: '2px solid #E2E8F0', paddingBottom: '16px', marginBottom: '20px' }}>
              
              {/* Header Left */}
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#C89B3C', letterSpacing: '0.08em', margin: 0, lineHeight: 1.1 }}>
                  PEDIGREE
                </h2>
                <div style={{ width: '80px', height: '3px', background: '#C89B3C', marginTop: '4px', marginBottom: '6px' }} />
                <p style={{ fontSize: '9px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                  BUILDING BETTER HERD FOR BETTER FUTURE
                </p>
              </div>

              {/* Header Center */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#C89B3C', fontSize: '14px', lineHeight: 1 }}>◆</div>
                <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#0B6B3A', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '2px 0 4px', lineHeight: 1.2 }}>
                  BIRTH CERTIFICATE OF CALF
                </h1>
                <p style={{ fontSize: '11px', color: '#64748B', margin: 0, fontWeight: 500 }}>
                  Official birth & pedigree registration certificate issued by the Kaksedthan livestock management system.
                </p>
              </div>

              {/* Header Right: Official Kaksedthan Logo & Branding ONLY */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#0B6B3A', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '18px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    K
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <p style={{ fontSize: '14px', fontWeight: 900, color: '#0F172A', margin: 0, lineHeight: 1.1 }}>KAKSEDTHAN</p>
                    <p style={{ fontSize: '10px', fontWeight: 800, color: '#0B6B3A', margin: '2px 0 0', textTransform: 'uppercase' }}>Livestock Management</p>
                  </div>
                </div>
              </div>

            </div>

            {/* ── 2. THREE-COLUMN MAIN GRID LAYOUT ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 280px', gap: '20px', alignItems: 'start' }}>

              {/* ── COLUMN 1: CALF INFO & LOCATION ── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '12px', fontWeight: 900, color: '#0B6B3A', textTransform: 'uppercase', margin: '0 0 8px' }}>
                    🐄 CALF INFORMATION
                  </h3>

                  <div style={{ background: '#0B6B3A', color: 'white', padding: '6px 12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase' }}>CERTIFICATE NO.</span>
                    <span style={{ fontSize: '13px', fontWeight: 900, fontFamily: 'monospace' }}>{certNo}</span>
                  </div>

                  <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', overflow: 'hidden', fontSize: '11px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', padding: '5px 10px', borderBottom: '1px solid #F1F5F9' }}>
                      <span style={{ color: '#64748B' }}>Calf ID (System)</span>
                      <span style={{ fontWeight: 800, color: '#0F172A', fontFamily: 'monospace' }}>: {code}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', padding: '5px 10px', borderBottom: '1px solid #F1F5F9' }}>
                      <span style={{ color: '#64748B' }}>Calf Name</span>
                      <span style={{ fontWeight: 900, color: '#0F172A' }}>: {calfName}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', padding: '5px 10px', borderBottom: '1px solid #F1F5F9' }}>
                      <span style={{ color: '#64748B' }}>Sex</span>
                      <span style={{ fontWeight: 800, color: sex === 'Female' || sex.includes('Female') ? '#BE123C' : '#1D4ED8' }}>
                        : {sex === 'Female' || sex.includes('Female') ? 'Female (Heifer) ♀' : 'Male (Bull Calf) ♂'}
                      </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', padding: '5px 10px', borderBottom: '1px solid #F1F5F9' }}>
                      <span style={{ color: '#64748B' }}>Breed</span>
                      <span style={{ fontWeight: 800, color: '#0B6B3A' }}>: {breed}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', padding: '5px 10px', borderBottom: '1px solid #F1F5F9' }}>
                      <span style={{ color: '#64748B' }}>Coat Color</span>
                      <span style={{ fontWeight: 700, color: '#0F172A' }}>: {color}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', padding: '5px 10px', borderBottom: '1px solid #F1F5F9' }}>
                      <span style={{ color: '#64748B' }}>Date of Birth</span>
                      <span style={{ fontWeight: 800, color: '#0F172A' }}>: {dob}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', padding: '5px 10px', borderBottom: '1px solid #F1F5F9' }}>
                      <span style={{ color: '#64748B' }}>Birth Weight</span>
                      <span style={{ fontWeight: 800, color: '#0F172A' }}>: {birthWeight} kg</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', padding: '5px 10px', borderBottom: '1px solid #F1F5F9' }}>
                      <span style={{ color: '#64748B' }}>Current Status</span>
                      <span style={{ fontWeight: 800, color: '#16a34a' }}>: ✓ {status}</span>
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
                      <span style={{ fontWeight: 900, color: '#16a34a' }}>: {farmName}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr' }}>
                      <span style={{ color: '#64748B' }}>Province / District</span>
                      <span style={{ fontWeight: 700, color: '#0F172A' }}>: {provinceDistrict}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── COLUMN 2: PEDIGREE & REGISTRATION ── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '12px', fontWeight: 900, color: '#0B6B3A', textTransform: 'uppercase', margin: '0 0 8px' }}>
                    🔗 PARENT INFORMATION (PEDIGREE)
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ background: '#F0F9FF', border: '1px solid #BFDBFE', borderRadius: '10px', padding: '10px 12px' }}>
                      <p style={{ fontSize: '10px', fontWeight: 900, color: '#1D4ED8', textTransform: 'uppercase', margin: '0 0 4px' }}>♂ SIRE (FATHER)</p>
                      <p style={{ fontSize: '12px', fontWeight: 900, color: '#16a34a', margin: 0 }}>{sireName}</p>
                      <p style={{ fontSize: '10px', color: '#64748B', margin: '2px 0 0', fontFamily: 'monospace' }}>Code: {sireCode} • Breed: {sireBreed}</p>
                    </div>
                    <div style={{ background: '#FFF1F2', border: '1px solid #FECDD3', borderRadius: '10px', padding: '10px 12px' }}>
                      <p style={{ fontSize: '10px', fontWeight: 900, color: '#BE123C', textTransform: 'uppercase', margin: '0 0 4px' }}>♀ DAM (MOTHER)</p>
                      <p style={{ fontSize: '12px', fontWeight: 900, color: '#16a34a', margin: 0 }}>{damName}</p>
                      <p style={{ fontSize: '10px', color: '#64748B', margin: '2px 0 0', fontFamily: 'monospace' }}>Code: {damCode} • Breed: {damBreed}</p>
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
                      <span style={{ fontWeight: 800, color: '#0F172A' }}>: {registrationDate}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr' }}>
                      <span style={{ color: '#64748B' }}>Breeding Record ID</span>
                      <span style={{ fontWeight: 800, color: '#0F172A', fontFamily: 'monospace' }}>: {breedingRecordId}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── COLUMN 3: RIGHT PANEL ── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'center' }}>
                <div style={{ width: '100%', borderRadius: '16px', overflow: 'hidden', border: '2px solid #0B6B3A', background: '#0F172A' }}>
                  <div style={{ position: 'relative', width: '100%', aspectRatio: '4 / 3' }}>
                    <img src={imageUrl} alt={calfName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ background: '#0B6B3A', padding: '6px 8px', textAlign: 'center' }}>
                    <p style={{ fontSize: '11px', fontWeight: 900, color: 'white', margin: 0 }}>{calfName} - {code}</p>
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

            {/* ── 3. FOOTER SECTION ── */}
            <div style={{ marginTop: '20px', paddingTop: '12px', borderTop: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{ fontSize: '10px', color: '#64748B', margin: 0, fontStyle: 'italic', fontWeight: 500 }}>
                This certificate is electronically issued by the Kaksedthan Livestock Database and is valid without a physical signature.
              </p>

              <div style={{ padding: '4px 12px', background: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                <p style={{ fontSize: '11px', fontWeight: 900, color: '#0B6B3A', margin: 0, fontFamily: 'monospace' }}>
                  Record ID: {certNo}
                </p>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
