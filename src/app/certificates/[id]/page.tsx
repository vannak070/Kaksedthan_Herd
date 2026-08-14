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

import CertificateReviewActions from '@/components/certificate/CertificateReviewActions';

export default async function CertificateDetailPage({ params }: PageProps) {
  const { id } = await params;
  const certs = await herdbookRepository.getCertificates();
  const regs = await herdbookRepository.getHerdbookRegistrations();

  const cert = certs.find(c => c.id === id || c.registrationId === id || c.certificateNumber === id);
  let reg = cert ? regs.find(r => r.id === cert.registrationId) : regs.find(r => r.id === id);

  if (!reg && cert) {
    reg = {
      id: cert.registrationId || `HR-${cert.id}`,
      registrationNumber: cert.registrationNumber || cert.registrationId,
      animalType: cert.animalType as any,
      animalId: cert.animalId,
      ownerName: cert.ownerName || 'Registered Owner',
      farmLocation: cert.farmLocation || 'Farm Station',
      breederName: cert.appliedBy || 'Registered Breeder',
      registrationDate: cert.issueDate || new Date().toISOString().split('T')[0],
      status: cert.status,
      publicToken: `token_${cert.id.toLowerCase().replace(/[^a-z0-9]/g, '')}`
    };
  }

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
    sireId: sireId || sire?.id,
    sireName: sire?.name || reg!.sireName || (sireId ? sireId : 'N/A'),
    sireBreed: sire?.breed || 'Purebred',
    sireImageUrl: sire?.imageUrl,
    sireStatus: sire?.status || 'Active',
    damId: damId || dam?.id,
    damName: dam?.name || reg!.damName || (damId ? damId : 'N/A'),
    damBreed: dam?.breed || 'Purebred',
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

      {/* Internal System User Review & Approval Banner */}
      <CertificateReviewActions cert={certItem as any} />

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
          
          {/* 1. Target Animal Record Card */}
          <div className="bg-purple-50/70 p-4 rounded-2xl border border-purple-200 space-y-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-black text-purple-800 uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
                  {certItem.animalType === 'Sire' ? <Beef className="h-4 w-4" /> : certItem.animalType === 'Dam' ? <Heart className="h-4 w-4" /> : <Baby className="h-4 w-4" />}
                  {certItem.animalType || 'Animal'} Record
                </h4>
                <span className="text-[8px] font-black bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded-md">
                  ✓ Registered
                </span>
              </div>
              <div className="relative aspect-square mb-2.5">
                <StandardAnimalImage src={certItem.imageUrl || calf?.imageUrl} alt={certItem.damName || certItem.sireName || certItem.calfName || certItem.animalId || 'Animal'} />
              </div>
              <p className="font-black text-slate-900 text-sm">
                {certItem.animalType === 'Dam' ? certItem.damName : certItem.animalType === 'Sire' ? certItem.sireName : (certItem.calfName || certItem.animalId)}
              </p>
              <p className="text-slate-500 text-[11px]">Breed: {certItem.damBreed || certItem.sireBreed || certItem.calfBreed || 'Brahman'}</p>
              <p className="text-slate-500 text-[11px]">ID: {certItem.animalId}</p>
            </div>
            {certItem.animalId && (
              <Link href={certItem.animalType === 'Sire' ? `/sires/${certItem.animalId}` : certItem.animalType === 'Dam' ? `/dams/${certItem.animalId}` : `/calves/${certItem.animalId}`} className="mt-2 text-[11px] font-bold text-purple-800 hover:underline inline-flex items-center gap-1">
                <span>View {certItem.animalType || 'Animal'} Profile</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
            )}
          </div>

          {/* 2. Sire Lineage Section */}
          <div className="bg-sky-50/70 p-4 rounded-2xl border border-sky-200 space-y-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-black text-sky-800 uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
                  <Beef className="h-4 w-4" /> Sire Lineage
                </h4>
                {sire ? (
                  <span className="text-[8px] font-black bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-md">✓ Verified</span>
                ) : (
                  <span className="text-[8px] font-black bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md">Lineage Info</span>
                )}
              </div>
              {sire ? (
                <div className="relative aspect-square mb-2.5">
                  <StandardAnimalImage src={sire.imageUrl || certItem.sireImageUrl} alt={sire.name} />
                </div>
              ) : (
                <div className="p-3 bg-white rounded-xl border border-sky-100 mb-2 space-y-1">
                  <p className="text-[10px] text-slate-400 font-medium uppercase">Sire (Father Name):</p>
                  <p className="font-black text-slate-800 text-xs">{certItem.parentSireName || certItem.sireName || 'Information not available'}</p>
                </div>
              )}
              {sire && <p className="font-black text-slate-900 text-sm">{sire.name}</p>}
              {sire && <p className="text-slate-500 text-[11px]">Breed: {sire.breed}</p>}
              <p className="text-slate-500 text-[11px]">
                Sire: {sire?.name || certItem.parentSireName || certItem.sireName || 'Information not available'}
              </p>
            </div>
            {sire ? (
              <Link href={`/sires/${sire.id}`} className="mt-2 text-[11px] font-bold text-sky-800 hover:underline inline-flex items-center gap-1">
                <span>View Sire Master Record</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
            ) : (
              <span className="text-[10px] text-slate-400 font-bold">Master record not registered</span>
            )}
          </div>

          {/* 3. Dam Lineage Section */}
          <div className="bg-rose-50/70 p-4 rounded-2xl border border-rose-200 space-y-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-black text-rose-800 uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
                  <Heart className="h-4 w-4" /> Dam Lineage
                </h4>
                {dam ? (
                  <span className="text-[8px] font-black bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-md">✓ Verified</span>
                ) : (
                  <span className="text-[8px] font-black bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md">Lineage Info</span>
                )}
              </div>
              {dam ? (
                <div className="relative aspect-square mb-2.5">
                  <StandardAnimalImage src={dam.imageUrl || certItem.damImageUrl} alt={dam.name} />
                </div>
              ) : (
                <div className="p-3 bg-white rounded-xl border border-rose-100 mb-2 space-y-1">
                  <p className="text-[10px] text-slate-400 font-medium uppercase">Dam (Mother Name):</p>
                  <p className="font-black text-slate-800 text-xs">{certItem.parentDamName || certItem.damName || 'Information not available'}</p>
                </div>
              )}
              {dam && <p className="font-black text-slate-900 text-sm">{dam.name}</p>}
              {dam && <p className="text-slate-500 text-[11px]">Breed: {dam.breed}</p>}
              <p className="text-slate-500 text-[11px]">
                Dam: {dam?.name || certItem.parentDamName || certItem.damName || 'Information not available'}
              </p>
            </div>
            {dam ? (
              <Link href={`/dams/${dam.id}`} className="mt-2 text-[11px] font-bold text-rose-800 hover:underline inline-flex items-center gap-1">
                <span>View Dam Master Record</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
            ) : (
              <span className="text-[10px] text-slate-400 font-bold">Master record not registered</span>
            )}
          </div>

          {/* 4. Ownership & Location Section */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 flex flex-col justify-between">
            <div>
              <h4 className="font-black text-[#dc5c15] uppercase tracking-wider flex items-center gap-1.5 text-[11px] mb-2">
                <Award className="h-4 w-4" /> Ownership & Location
              </h4>
              <p className="text-slate-500 text-[11px] font-medium">Program Number:</p>
              <p className="font-black text-[#dc5c15] text-sm">{bp?.programNumber || certItem.programNumber || 'N/A'}</p>
              <div className="mt-2 space-y-1 text-[11px] text-slate-600 bg-white p-2.5 rounded-xl border border-slate-100">
                <div className="flex justify-between">
                  <span className="text-slate-400">Owner:</span>
                  <span className="font-bold text-slate-800">{certItem.ownerName || 'Kaksedthan'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Station:</span>
                  <span className="font-bold text-slate-800">{certItem.farmLocation || 'Kandal'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Applicant:</span>
                  <span className="font-bold text-amber-800">{certItem.appliedBy || 'Registered Breeder'}</span>
                </div>
              </div>
            </div>
            {bpId ? (
              <Link href={`/breeding-programs/${bpId}`} className="mt-2 text-[11px] font-bold text-[#dc5c15] hover:underline inline-flex items-center gap-1">
                <span>View Breeding Program</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
            ) : (
              <span className="text-[10px] text-slate-400 font-bold">Standard Herdbook Certificate</span>
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
