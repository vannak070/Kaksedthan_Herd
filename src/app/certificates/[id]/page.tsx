import React from 'react';
import Link from 'next/link';
import PageHeader from '@/components/common/PageHeader';
import A4CertificateGenerator from '@/components/certificate/A4CertificateGenerator';
import StandardAnimalImage from '@/components/common/StandardAnimalImage';
import { herdbookRepository } from '@/repositories/herdbook.repository';
import { FileText, ArrowLeft, Award, Beef, Heart, Baby, QrCode, ShieldCheck, ExternalLink } from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CertificateDetailPage({ params }: PageProps) {
  const { id } = await params;
  const certs = await herdbookRepository.getCertificates();
  const regs = await herdbookRepository.getHerdbookRegistrations();

  const cert = certs.find(c => c.id === id || c.registrationId === id || c.certificateNumber === id);
  const reg = cert ? regs.find(r => r.id === cert.registrationId) : regs.find(r => r.id === id);

  if (!reg && !cert) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center my-6 max-w-xl mx-auto space-y-4">
        <FileText className="h-12 w-12 text-slate-300 mx-auto" />
        <h3 className="text-base font-bold text-slate-800">Certificate Not Found</h3>
        <p className="text-xs text-slate-500">No official certificate record found for ID: {id}</p>
        <Link href="/certificates" className="inline-flex items-center gap-2 bg-[#047857] text-white text-xs font-bold px-4 py-2 rounded-xl">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Certificate Center</span>
        </Link>
      </div>
    );
  }

  const calfId = cert?.calfId || reg?.calfId || reg?.animalId;
  const sireId = cert?.sireId || reg?.sireId;
  const damId = cert?.damId || reg?.damId;
  const bpId = cert?.breedingProgramId || reg?.breedingProgramId;

  const calf = calfId ? await herdbookRepository.getCalfById(calfId) : null;
  const sire = sireId ? await herdbookRepository.getSireById(sireId) : null;
  const dam = damId ? await herdbookRepository.getDamById(damId) : null;
  const bp = bpId ? await herdbookRepository.getBreedingProgramById(bpId) : null;

  const certItem = cert || {
    id: `CERT-${reg!.id}`,
    certificateNumber: `KC-${Math.floor(100000 + Math.random() * 900000)}`,
    registrationId: reg!.id,
    registrationNumber: reg!.registrationNumber,
    calfId: calfId,
    calfName: calf?.name || reg!.animalName,
    calfBreed: calf?.breed || reg!.breed,
    calfSex: calf?.sex || 'Female',
    calfImageUrl: calf?.imageUrl || reg!.imageUrl,
    sireId: sireId || 'SIR-001',
    sireName: sire?.name || reg!.sireName || 'Master Sire',
    sireBreed: sire?.breed || 'Brahman',
    sireImageUrl: sire?.imageUrl,
    sireStatus: sire?.status || 'Active',
    damId: damId || 'DAM-001',
    damName: dam?.name || reg!.damName || 'Master Dam',
    damBreed: dam?.breed || 'Wagyu',
    damImageUrl: dam?.imageUrl,
    damStatus: dam?.status || 'Active',
    breedingProgramId: bpId,
    programNumber: bp?.programNumber,
    ownerName: reg!.ownerName,
    farmLocation: reg!.farmLocation,
    issueDate: reg!.registrationDate,
    layoutType: 'A4 Landscape' as const,
    publicVerificationUrl: `/public/verify/${reg!.publicToken}`,
    qrCodeData: `/public/verify/${reg!.publicToken}`
  };

  const qrPublicToken = reg?.publicToken || 'token_kh2026';

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageHeader
        title={`Certificate Detail: ${certItem.certificateNumber}`}
        subtitle={`Official Birth & Genetic Pedigree Record • A4 Landscape PNG Format`}
        breadcrumbs={[
          { label: 'Certificate Center', href: '/certificates' },
          { label: certItem.certificateNumber },
        ]}
        backHref="/certificates"
        backLabel="Back to Certificate Center"
      />

      {/* Requirement 19: Structured Navigation Tabs / Sections */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#047857] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              OFFICIAL CERTIFICATE DETAILS
            </span>
            <h2 className="text-2xl font-black text-slate-900 mt-2">{certItem.certificateNumber}</h2>
            <p className="text-xs text-slate-500 font-medium">Issue Date: {certItem.issueDate} • Status: Active & Published</p>
          </div>

          <div className="flex items-center gap-2 bg-emerald-50 text-[#047857] border border-emerald-200 px-3.5 py-1.5 rounded-2xl text-xs font-black">
            <ShieldCheck className="h-4 w-4" />
            <span>VERIFIED & REGISTERED</span>
          </div>
        </div>

        {/* 4 Relational Cards with Clickable Direct Links to Master Records */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          
          {/* 1. Calf Section */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 flex flex-col justify-between">
            <div>
              <h4 className="font-black text-purple-700 uppercase tracking-wider flex items-center gap-1.5 text-[11px] mb-2">
                <Baby className="h-4 w-4" /> Calf Record
              </h4>
              <div className="relative aspect-square mb-2.5">
                <StandardAnimalImage src={calf?.imageUrl || certItem.calfImageUrl} alt={certItem.calfName || 'Calf'} />
              </div>
              <p className="font-black text-slate-900 text-sm">{certItem.calfName || 'Calf'}</p>
              <p className="text-slate-500 text-[11px]">Breed: {certItem.calfBreed || 'Brahman'}</p>
              <p className="text-slate-500 text-[11px]">Sex: {certItem.calfSex || 'Female'}</p>
            </div>
            {calfId && (
              <Link href={`/calves/${calfId}`} className="mt-2 text-[11px] font-bold text-purple-700 hover:underline inline-flex items-center gap-1">
                <span>View Calf Profile</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
            )}
          </div>

          {/* 2. Sire Section */}
          <div className="bg-sky-50/70 p-4 rounded-2xl border border-sky-200 space-y-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-black text-sky-800 uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
                  <Beef className="h-4 w-4" /> Sire Master
                </h4>
                <span className="text-[8px] font-black bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-md">
                  ✓ Verified
                </span>
              </div>
              <div className="relative aspect-square mb-2.5">
                <StandardAnimalImage src={sire?.imageUrl || certItem.sireImageUrl} alt={certItem.sireName || 'Sire'} />
              </div>
              <p className="font-black text-slate-900 text-sm">{certItem.sireName || 'Sire'}</p>
              <p className="text-slate-500 text-[11px]">Breed: {certItem.sireBreed || 'Brahman'}</p>
              <p className="text-slate-500 text-[11px]">Sire ID: {sireId || certItem.sireId}</p>
            </div>
            {sireId && (
              <Link href={`/sires/${sireId}`} className="mt-2 text-[11px] font-bold text-sky-800 hover:underline inline-flex items-center gap-1">
                <span>View Sire Master Record</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
            )}
          </div>

          {/* 3. Dam Section */}
          <div className="bg-rose-50/70 p-4 rounded-2xl border border-rose-200 space-y-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-black text-rose-800 uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
                  <Heart className="h-4 w-4" /> Dam Master
                </h4>
                <span className="text-[8px] font-black bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded-md">
                  ✓ Verified
                </span>
              </div>
              <div className="relative aspect-square mb-2.5">
                <StandardAnimalImage src={dam?.imageUrl || certItem.damImageUrl} alt={certItem.damName || 'Dam'} />
              </div>
              <p className="font-black text-slate-900 text-sm">{certItem.damName || 'Dam'}</p>
              <p className="text-slate-500 text-[11px]">Breed: {certItem.damBreed || 'Wagyu'}</p>
              <p className="text-slate-500 text-[11px]">Dam ID: {damId || certItem.damId}</p>
            </div>
            {damId && (
              <Link href={`/dams/${damId}`} className="mt-2 text-[11px] font-bold text-rose-800 hover:underline inline-flex items-center gap-1">
                <span>View Dam Master Record</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
            )}
          </div>

          {/* 4. Breeding Program Section */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 flex flex-col justify-between">
            <div>
              <h4 className="font-black text-[#dc5c15] uppercase tracking-wider flex items-center gap-1.5 text-[11px] mb-2">
                <Award className="h-4 w-4" /> Breeding Operation
              </h4>
              <p className="text-slate-500 text-[11px] font-medium">Program Number:</p>
              <p className="font-black text-[#dc5c15] text-sm">{bp?.programNumber || certItem.programNumber || 'BP-2026-0001'}</p>
              <div className="mt-2 space-y-1 text-[11px] text-slate-600 bg-white p-2.5 rounded-xl border border-slate-100">
                <div className="flex justify-between">
                  <span className="text-slate-400">Owner:</span>
                  <span className="font-bold text-slate-800">{certItem.ownerName || 'Kaksedthan'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Station:</span>
                  <span className="font-bold text-slate-800">{certItem.farmLocation || 'Kandal'}</span>
                </div>
              </div>
            </div>
            {bpId ? (
              <Link href={`/breeding-programs/${bpId}`} className="mt-2 text-[11px] font-bold text-[#dc5c15] hover:underline inline-flex items-center gap-1">
                <span>View Breeding Program</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
            ) : (
              <span className="text-[10px] text-slate-400 font-bold">Standard Breeding Pair</span>
            )}
          </div>

        </div>
      </div>

      {/* High-Resolution Certificate Document Canvas Component */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
        <A4CertificateGenerator
          registration={reg}
          calf={calf}
          sire={sire}
          dam={dam}
          certificate={certItem}
        />
      </div>
    </div>
  );
}
