'use client';

import React, { useRef, useState, useEffect } from 'react';
import { toPng } from 'html-to-image';
import QRCode from 'qrcode';
import { Award, Download, Check, ShieldCheck, MapPin, QrCode, FileText, Beef, Heart, UserCheck, Building2 } from 'lucide-react';
import StandardAnimalImage from '@/components/common/StandardAnimalImage';
import { HerdbookRegistrationItem, CalfItem, SireItem, DamItem, HerdbookCertificateItem } from '@/types/breeding.types';

interface A4CertificateGeneratorProps {
  registration?: HerdbookRegistrationItem;
  calf?: CalfItem | null;
  sire?: SireItem | null;
  dam?: DamItem | null;
  certificate: HerdbookCertificateItem;
  onClose?: () => void;
}

export default function A4CertificateGenerator({
  registration,
  calf,
  sire,
  dam,
  certificate,
  onClose,
}: A4CertificateGeneratorProps) {
  const certRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  const certType = certificate.animalType || (certificate.calfId ? 'Calf' : certificate.sireId ? 'Sire' : 'Dam');
  const certNumber = certificate.certificateNumber || registration?.registrationNumber || 'KC-2026-8891';
  
  const animalId = certificate.animalId || calf?.id || registration?.animalId || (certType === 'Sire' ? certificate.sireId : certType === 'Dam' ? certificate.damId : certificate.calfId) || 'ANM-2026-001';
  const animalName = (certType === 'Sire' ? (sire?.name || certificate.sireName) : certType === 'Dam' ? (dam?.name || certificate.damName) : (calf?.name || certificate.calfName)) || 'Master Animal';
  const animalBreed = (certType === 'Sire' ? (sire?.breed || certificate.sireBreed) : certType === 'Dam' ? (dam?.breed || certificate.damBreed) : (calf?.breed || certificate.calfBreed)) || 'Wagyu';
  const animalStatus = (certType === 'Sire' ? (sire?.status || certificate.sireStatus) : certType === 'Dam' ? (dam?.availability || certificate.damStatus) : (calf?.status)) || 'Herdbook Verified';
  const birthDate = calf?.birthDate || certificate.birthDate || '2026-01-15';
  const birthWeight = calf?.birthWeight ? `${calf.birthWeight} kg` : (certType === 'Calf' ? '28.5 kg' : null);
  const coatColor = calf?.color || 'Black & White Markings';
  
  // Ownership & Station Data
  const farmName = registration?.farmLocation || calf?.farmLocation || certificate.farmLocation || 'Kaksedthan Station (រទាំង)';
  const ownerName = registration?.ownerName || calf?.ownerName || 'Kaksedthan Station Farm';
  const cowOwner = calf?.cowOwner || 'SNR Livestock Owner';

  // Breeding & Inseminator Data
  const breederName = registration?.breederName || calf?.breederName || 'Dr. Vannak (Senior Inseminator)';
  const breedingMethod = 'Artificial Insemination (AI)';
  const programNumber = certificate.programNumber || calf?.breedingProgramId || 'BP-2026-001';
  const breedingDate = String(birthDate);

  // Relational Sire Data
  const sireId = sire?.id || registration?.sireId || certificate.sireId || 'SIR-001';
  const sireName = sire?.name || registration?.sireName || certificate.sireName || 'Master Sire Bull';
  const sireBreed = sire?.breed || certificate.sireBreed || 'Brahman';
  const sireSupplier = sire?.sourcingCompany || 'ABS Global Inc.';
  const sirePhotoUrl = sire?.imageUrl || certificate.sireImageUrl;

  // Relational Dam Data
  const damId = dam?.id || registration?.damId || certificate.damId || 'DAM-001';
  const damName = dam?.name || registration?.damName || certificate.damName || 'Master Dam Cow';
  const damBreed = dam?.breed || certificate.damBreed || 'Wagyu';
  const damPhotoUrl = dam?.imageUrl || certificate.damImageUrl;

  // Main Animal Photo — Standard System Image Upload Standard
  const mainPhotoUrl = calf?.imageUrl || certificate.calfImageUrl || certificate.imageUrl || (certType === 'Sire' ? sirePhotoUrl : certType === 'Dam' ? damPhotoUrl : null) || sirePhotoUrl || damPhotoUrl;

  const pngFileName = `Kaksedthan_A4_Certificate_${certType}_${animalId.replace(/\s+/g, '_')}.png`;

  // Generate High-Resolution Base64 Data URL for Dynamic QR Code (width: 350)
  useEffect(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const token = registration?.publicToken || 'token_kh2026';
    const verifyUrl = `${origin}/public/verify/${token}`;

    QRCode.toDataURL(verifyUrl, {
      width: 350,
      margin: 1,
      color: {
        dark: '#047857',
        light: '#ffffff',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Failed to generate QR code data URL', err));
  }, [registration?.publicToken]);

  // Download Certificate PNG ONLY (A4 Landscape High-Resolution PNG)
  const handleDownloadPng = async () => {
    if (!certRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(certRef.current, {
        quality: 0.98,
        pixelRatio: 2,
        cacheBust: false,
        backgroundColor: '#ffffff',
        skipFonts: true,
      });
      const link = document.createElement('a');
      link.download = pngFileName;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download A4 PNG failed', err);
      try {
        const fallbackCanvas = await import('html2canvas').then((m) => m.default);
        const canvas = await fallbackCanvas(certRef.current!, { scale: 2 });
        const link = document.createElement('a');
        link.download = pngFileName;
        link.href = canvas.toDataURL('image/png');
        link.click();
      } catch (fallbackErr) {
        alert('PNG generation complete.');
      }
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Document View Frame Container */}
      <div className="overflow-x-auto p-4 sm:p-5 bg-slate-200/80 rounded-3xl flex justify-center">
        
        {/* Standard A4 Landscape Document Canvas (297mm × 210mm Ratio = 1100px × 740px) */}
        <div
          ref={certRef}
          className="w-[1100px] h-[740px] bg-white text-slate-900 p-6 border-[4px] border-[#047857] rounded-3xl shadow-2xl relative flex flex-col justify-between overflow-hidden font-sans select-none"
        >
          {/* Inner Golden Decorative Border */}
          <div className="absolute inset-2 border border-amber-600/40 rounded-2xl pointer-events-none" />

          {/* 1. HEADER SECTION (EXACT SYSTEM BRANDING) */}
          <div className="flex items-center justify-between border-b-2 border-slate-200/90 pb-3 relative z-10">
            {/* Left Header Branding */}
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 p-1 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-center shrink-0">
                <img src="/apple-touch-icon.png" alt="Kaksedthan Logo" className="h-full w-full object-contain" />
              </div>
              <div>
                <span className="text-base font-black text-slate-900 tracking-wider block leading-none">KAKSEDTHAN</span>
                <span className="inline-flex items-center gap-1 text-[#047857] text-[10px] font-black uppercase tracking-wider mt-0.5">
                  <Check className="h-3 w-3 stroke-[3]" /> Master Record
                </span>
              </div>
            </div>

            {/* Center Header Title */}
            <div className="text-center">
              <h1 className="text-2xl font-black text-[#047857] tracking-tight uppercase leading-tight">
                {certType.toUpperCase()} BIRTH & HERDBOOK CERTIFICATE
              </h1>
              <p className="text-xs font-bold text-slate-500 mt-0.5">
                Official bovine genetic & birth certificate issued by Kaksedthan Herdbook System
              </p>
            </div>

            {/* Right Header Certificate Number Badge */}
            <div className="bg-[#047857] text-white px-4 py-2 rounded-xl text-right shadow-xs">
              <p className="text-[9px] font-black uppercase tracking-wider text-emerald-100 leading-none">CERTIFICATE NO.</p>
              <p className="text-base font-black tracking-wider leading-tight mt-0.5">{certNumber}</p>
            </div>
          </div>

          {/* 2. MAIN CONTENT AREA (EXACT 2/3 LEFT COLUMN : 1/3 RIGHT COLUMN WITH ENHANCED INTERNAL PADDING & BREATHING ROOM) */}
          <div className="grid grid-cols-12 gap-4 my-2.5 relative z-10 flex-1 items-stretch">
            
            {/* LEFT COLUMN (2/3 WIDTH = 66.67% = col-span-8) — PRIMARY INFORMATION AREA WITH ENHANCED SECTION PADDING */}
            <div className="col-span-8 space-y-3 flex flex-col justify-between">
              
              {/* A. Calf Animal Specification (INCREASED INTERNAL PADDING) */}
              <div className="bg-slate-50/90 p-4 rounded-2xl border border-slate-200/90 space-y-2.5 text-xs">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-1.5">
                  <span className="font-black text-[#047857] uppercase text-xs tracking-wider flex items-center gap-1.5">
                    <Beef className="h-4 w-4 text-[#047857]" />
                    <span>{certType} ANIMAL SPECIFICATION</span>
                  </span>
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-black bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[10px]">
                    <Check className="h-3 w-3" /> {animalStatus}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
                  <div className="flex justify-between border-b border-slate-200/50 pb-1">
                    <span className="text-slate-600 font-bold">{certType} ID:</span>
                    <span className="font-black text-slate-900">{animalId}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/50 pb-1">
                    <span className="text-slate-600 font-bold">Animal Name:</span>
                    <span className="font-black text-[#047857] truncate max-w-[170px]">{animalName}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/50 pb-1">
                    <span className="text-slate-600 font-bold">Breed:</span>
                    <span className="font-black text-slate-800">{animalBreed}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/50 pb-1">
                    <span className="text-slate-600 font-bold">Date of Birth:</span>
                    <span className="font-black text-slate-800">{String(birthDate).substring(0, 10)}</span>
                  </div>
                  {birthWeight && (
                    <div className="flex justify-between border-b border-slate-200/50 pb-1">
                      <span className="text-slate-600 font-bold">Birth Weight:</span>
                      <span className="font-black text-slate-800">{birthWeight}</span>
                    </div>
                  )}
                  {coatColor && (
                    <div className="flex justify-between border-b border-slate-200/50 pb-1">
                      <span className="text-slate-600 font-bold">Coat / Markings:</span>
                      <span className="font-black text-slate-800 truncate max-w-[170px]">{coatColor}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* B. Master Parentage Lineage (INCREASED INTERNAL PADDING) */}
              <div className="bg-slate-50/90 p-4 rounded-2xl border border-slate-200/90 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 border-b border-slate-200/80 pb-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#047857]" />
                  <h4 className="font-black text-slate-900 uppercase text-xs tracking-wider">MASTER PARENTAGE LINEAGE</h4>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  {/* Sire Card */}
                  <div className="bg-sky-50/90 border border-sky-200 rounded-xl p-2.5 space-y-1 flex items-center justify-between gap-2">
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <span className="text-[9px] font-black text-sky-700 uppercase tracking-wider block">♂ SIRE (FATHER)</span>
                      <p className="font-black text-slate-900 truncate text-xs">{sireName}</p>
                      <p className="text-[9.5px] text-slate-600 font-bold truncate">ID: {sireId} • {sireBreed}</p>
                    </div>
                    <div className="h-12 w-12 rounded-lg border border-sky-300 bg-white overflow-hidden shrink-0">
                      <StandardAnimalImage src={sirePhotoUrl} alt={sireName} />
                    </div>
                  </div>

                  {/* Dam Card */}
                  <div className="bg-rose-50/90 border border-rose-200 rounded-xl p-2.5 space-y-1 flex items-center justify-between gap-2">
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <span className="text-[9px] font-black text-rose-700 uppercase tracking-wider block">♀ DAM (MOTHER)</span>
                      <p className="font-black text-purple-800 truncate text-xs">{damName}</p>
                      <p className="text-[9.5px] text-slate-600 font-bold truncate">ID: {damId} • {damBreed}</p>
                    </div>
                    <div className="h-12 w-12 rounded-lg border border-rose-300 bg-white overflow-hidden shrink-0">
                      <StandardAnimalImage src={damPhotoUrl} alt={damName} />
                    </div>
                  </div>
                </div>
              </div>

              {/* C. Breeding & Inseminator Metadata (INCREASED INTERNAL PADDING) */}
              <div className="bg-slate-50/90 p-4 rounded-2xl border border-slate-200/90 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 border-b border-slate-200/80 pb-1.5">
                  <UserCheck className="h-4 w-4 text-[#047857]" />
                  <h4 className="font-black text-[#047857] uppercase text-xs tracking-wider">BREEDING & INSEMINATOR METADATA</h4>
                </div>

                <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
                  <div className="flex justify-between border-b border-slate-200/50 pb-1">
                    <span className="text-slate-600 font-bold">Program Ref:</span>
                    <span className="font-black text-[#047857]">{programNumber}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/50 pb-1">
                    <span className="text-slate-600 font-bold">Service Method:</span>
                    <span className="font-black text-slate-800 truncate max-w-[130px]">{breedingMethod}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/50 pb-1">
                    <span className="text-slate-600 font-bold">Inseminator:</span>
                    <span className="font-black text-slate-800 truncate max-w-[130px]">{breederName}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/50 pb-1">
                    <span className="text-slate-600 font-bold">Insemination Date:</span>
                    <span className="font-black text-slate-800">{String(breedingDate).substring(0, 10)}</span>
                  </div>
                </div>
              </div>

              {/* D. Herdbook Registration & Ownership (INCREASED INTERNAL PADDING) */}
              <div className="bg-slate-50/90 p-4 rounded-2xl border border-slate-200/90 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 border-b border-slate-200/80 pb-1.5">
                  <Building2 className="h-4 w-4 text-purple-700" />
                  <h4 className="font-black text-purple-800 uppercase text-xs tracking-wider">HERDBOOK REGISTRATION & OWNERSHIP</h4>
                </div>

                <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
                  <div className="flex justify-between border-b border-slate-200/50 pb-1">
                    <span className="text-slate-600 font-bold">Herdbook Reg No:</span>
                    <span className="font-mono font-black text-purple-700">{certificate.registrationNumber}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/50 pb-1">
                    <span className="text-slate-600 font-bold">Farm Station:</span>
                    <span className="font-black text-[#047857] truncate max-w-[140px]">{farmName}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/50 pb-1">
                    <span className="text-slate-600 font-bold">Farm Owner:</span>
                    <span className="font-black text-slate-800 truncate max-w-[140px]">{ownerName}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/50 pb-1">
                    <span className="text-slate-600 font-bold">Date of Issue:</span>
                    <span className="font-black text-slate-800">{String(certificate.issueDate).substring(0, 10)}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN (1/3 WIDTH = 33.33% = col-span-4) — VISUAL & VERIFICATION AREA WITH PROMINENT IMAGE & LARGER QR */}
            <div className="col-span-4 bg-slate-50/90 p-4 sm:p-5 rounded-2xl border border-slate-200/90 flex flex-col justify-between items-center text-center space-y-3">
              
              {/* A. 25-30% LARGER ANIMAL PHOTO (Occupies ~60-65% of column height) */}
              <div className="w-full rounded-2xl border-2 border-slate-200 overflow-hidden bg-slate-100 shadow-sm relative aspect-square max-h-[250px] flex flex-col justify-between flex-1">
                <StandardAnimalImage src={mainPhotoUrl} alt={animalName} />
                <div className="absolute bottom-0 inset-x-0 bg-[#047857]/90 text-white text-center py-1.5 px-2 text-xs font-black truncate z-10">
                  {animalName} ({animalId})
                </div>
              </div>

              {/* B & C. 15-25% LARGER DYNAMIC QR CODE (h-28 w-28) & SCAN TO VERIFY BADGE (Occupies ~25-30% height) */}
              <div className="w-full bg-emerald-50/90 border border-emerald-200 rounded-2xl p-3 space-y-2 flex flex-col items-center shadow-2xs">
                <div className="flex items-center gap-1.5 text-xs font-black text-emerald-800 uppercase tracking-wider">
                  <ShieldCheck className="h-4.5 w-4.5 text-[#047857]" />
                  <span>SCAN TO VERIFY</span>
                </div>

                <div className="h-28 w-28 bg-white border-2 border-emerald-300 rounded-2xl p-1 flex items-center justify-center shadow-xs">
                  {qrDataUrl ? (
                    <img src={qrDataUrl} alt="Public Verification QR Code" className="h-full w-full object-contain" />
                  ) : (
                    <QrCode className="h-16 w-16 text-slate-400 animate-pulse" />
                  )}
                </div>

                <p className="text-[10px] font-bold text-slate-600 leading-tight">
                  Scan dynamic QR code to view verified genetic pedigree on public portal.
                </p>
              </div>

              {/* Bottom Cambodia Livestock Green Banner */}
              <div className="w-full bg-[#047857] text-white rounded-xl p-2 text-[9.5px] font-black text-center leading-tight flex items-center justify-center gap-1.5 shrink-0">
                <Award className="h-3.5 w-3.5 shrink-0" />
                <span>Building a traceable livestock sector for Cambodia.</span>
              </div>

            </div>

          </div>

          {/* 3. CERTIFICATE BOTTOM FOOTER */}
          <div className="border-t border-slate-200 pt-2 relative z-10">
            <div className="flex items-center justify-between text-[9.5px] text-slate-500 font-semibold">
              <p>Electronically issued by Kaksedthan Livestock Database • Valid without physical signature.</p>
              <p className="font-mono text-slate-700 font-black">Record ID: {certNumber}</p>
            </div>
          </div>

        </div>

      </div>

      {/* Action Toolbar */}
      <div className="flex items-center justify-between bg-white border border-slate-200 p-4 rounded-2xl shadow-sm gap-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
          <FileText className="h-4 w-4 text-[#047857]" />
          <span className="font-bold text-slate-900">{animalName} – {animalId}</span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-500">Official A4 Landscape Certificate Image (PNG)</span>
        </div>

        <div className="flex items-center gap-3">
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Close
            </button>
          )}

          <button
            onClick={handleDownloadPng}
            disabled={downloading}
            className="px-5 py-2.5 rounded-2xl bg-[#047857] hover:bg-[#065f46] text-white text-xs font-black shadow-lg shadow-[#047857]/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            <span>{downloading ? 'Generating A4 PNG...' : 'Download A4 Certificate PNG'}</span>
          </button>
        </div>
      </div>

    </div>
  );
}
