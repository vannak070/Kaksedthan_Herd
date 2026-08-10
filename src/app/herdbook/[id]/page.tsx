import React from 'react';
import Link from 'next/link';
import PageHeader from '@/components/common/PageHeader';
import { herdbookRepository } from '@/repositories/herdbook.repository';
import { Award, Beef, Heart, Baby, QrCode, ShieldCheck, ArrowLeft, ExternalLink, Calendar, MapPin, UserCheck } from 'lucide-react';
import ImageUploadContainer from '@/components/common/ImageUploadContainer';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function HerdbookDetailPage({ params }: PageProps) {
  const { id } = await params;
  const reg = await herdbookRepository.getHerdbookRegistrationById(id);

  if (!reg) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center my-6 max-w-xl mx-auto space-y-4">
        <Award className="h-12 w-12 text-slate-300 mx-auto" />
        <h3 className="text-base font-bold text-slate-800">Herdbook Registration Not Found</h3>
        <p className="text-xs text-slate-500">No official registration record found for ID: {id}</p>
        <Link href="/herdbook" className="inline-flex items-center gap-2 bg-[#dc5c15] text-white text-xs font-bold px-4 py-2 rounded-xl">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Herdbook Management</span>
        </Link>
      </div>
    );
  }

  const sire = reg.sireId ? await herdbookRepository.getSireById(reg.sireId) : null;
  const dam = reg.damId ? await herdbookRepository.getDamById(reg.damId) : null;
  const calf = reg.calfId ? await herdbookRepository.getCalfById(reg.calfId) : null;
  const bp = reg.breedingProgramId ? await herdbookRepository.getBreedingProgramById(reg.breedingProgramId) : null;
  const certs = await herdbookRepository.getCertificates();
  const cert = certs.find(c => c.registrationId === reg.id || c.registrationNumber === reg.registrationNumber);

  const publicVerifyUrl = `/public/verify/${reg.publicToken}`;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageHeader
        title={`Herdbook Registration: ${reg.registrationNumber}`}
        subtitle={`Official Registry Record • ${reg.animalType} (${reg.animalName || reg.animalId})`}
        breadcrumbs={[
          { label: 'Herdbook System', href: '/herdbook' },
          { label: reg.registrationNumber }
        ]}
        backHref="/herdbook"
        backLabel="Back to Herdbook Registry"
      >
        {cert && (
          <Link
            href={`/certificates/${cert.id}`}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors shadow-sm"
          >
            <Award className="h-4 w-4" />
            <span>View Certificate</span>
          </Link>
        )}
      </PageHeader>

      {/* Main Registration Overview Banner */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-3xl p-6 sm:p-8 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-orange-100 bg-white/20 px-3 py-1 rounded-full">
            OFFICIAL REGISTERED RECORD
          </span>
          <h2 className="text-3xl font-black tracking-tight mt-2">{reg.registrationNumber}</h2>
          <p className="text-xs text-orange-100 font-semibold mt-1">
            Registered on {reg.registrationDate || '2026-01-15'} • Approved by {reg.approvedBy || 'System Admin'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={publicVerifyUrl}
            target="_blank"
            className="bg-white text-[#dc5c15] hover:bg-orange-50 px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 shadow-sm transition-all"
          >
            <QrCode className="h-4 w-4" />
            <span>Public Verification URL</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Photo & Status */}
        <div className="md:col-span-1 bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-4">
          <ImageUploadContainer
            value={reg.imageUrl}
            aspectRatio="1:1"
            readOnly
            placeholder="Registered Animal Photo"
          />
          <div className="text-center">
            <span className="inline-block text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
              Status: {reg.status}
            </span>
          </div>
        </div>

        {/* Specifications */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3">Animal Specification</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <p className="text-slate-400 font-medium">Animal Type</p>
              <p className="font-bold text-slate-900 mt-0.5">{reg.animalType}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Animal Name</p>
              <p className="font-bold text-[#dc5c15] mt-0.5">{reg.animalName || reg.animalId}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Breed</p>
              <p className="font-bold text-slate-900 mt-0.5">{reg.breed || 'Brahman'}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Registered Owner</p>
              <p className="font-bold text-slate-900 mt-0.5">{reg.ownerName || 'Kaksedthan Livestock Farm'}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Farm Location</p>
              <p className="font-bold text-slate-900 mt-0.5">{reg.farmLocation || 'រទាំង'}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Breeder Name</p>
              <p className="font-bold text-slate-900 mt-0.5">{reg.breederName || 'SNR Farm'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Relational Lineage Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Sire Bull Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h4 className="text-xs font-black text-[#dc5c15] uppercase tracking-wider flex items-center gap-2">
              <Beef className="h-4 w-4" />
              <span>Sire Bull (Father)</span>
            </h4>
            {sire && (
              <Link href={`/sires/${sire.id}`} className="text-xs font-extrabold text-[#dc5c15] hover:underline flex items-center gap-1">
                <span>View Sire</span> →
              </Link>
            )}
          </div>
          {sire ? (
            <div className="text-xs space-y-1">
              <p className="font-bold text-slate-900">{sire.name} <span className="text-slate-400 font-normal">({sire.id})</span></p>
              <p className="text-slate-500">Breed: {sire.breed} • Bloodline: {sire.bloodline || 'Purebred'}</p>
            </div>
          ) : (
            <p className="text-xs text-slate-400">Sire ID: {reg.sireId || 'Not specified'}</p>
          )}
        </div>

        {/* Dam Cow Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h4 className="text-xs font-black text-purple-700 uppercase tracking-wider flex items-center gap-2">
              <Beef className="h-4 w-4" />
              <span>Dam Cow (Mother)</span>
            </h4>
            {dam && (
              <Link href={`/dams/${dam.id}`} className="text-xs font-extrabold text-purple-700 hover:underline flex items-center gap-1">
                <span>View Dam</span> →
              </Link>
            )}
          </div>
          {dam ? (
            <div className="text-xs space-y-1">
              <p className="font-bold text-slate-900">{dam.name} <span className="text-slate-400 font-normal">({dam.id})</span></p>
              <p className="text-slate-500">Breed: {dam.breed} • Status: {dam.availability}</p>
            </div>
          ) : (
            <p className="text-xs text-slate-400">Dam ID: {reg.damId || 'Not specified'}</p>
          )}
        </div>

        {/* Breeding Program Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Heart className="h-4 w-4 text-[#dc5c15]" />
              <span>Connected Breeding Program</span>
            </h4>
            {bp && (
              <Link href={`/breeding-programs/${bp.id}`} className="text-xs font-extrabold text-[#dc5c15] hover:underline flex items-center gap-1">
                <span>View Program</span> →
              </Link>
            )}
          </div>
          {bp ? (
            <div className="text-xs space-y-1">
              <p className="font-bold text-slate-900">{bp.programNumber}</p>
              <p className="text-slate-500">Method: {bp.breedingMethod} • Calved: {bp.actualCalvingDate || 'Completed'}</p>
            </div>
          ) : (
            <p className="text-xs text-slate-400">Program ID: {reg.breedingProgramId || 'N/A'}</p>
          )}
        </div>

        {/* Calf Record Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h4 className="text-xs font-black text-indigo-700 uppercase tracking-wider flex items-center gap-2">
              <Baby className="h-4 w-4" />
              <span>Offspring Calf Profile</span>
            </h4>
            {calf && (
              <Link href={`/calves/${calf.id}`} className="text-xs font-extrabold text-indigo-700 hover:underline flex items-center gap-1">
                <span>View Calf</span> →
              </Link>
            )}
          </div>
          {calf ? (
            <div className="text-xs space-y-1">
              <p className="font-bold text-slate-900">{calf.name || calf.id}</p>
              <p className="text-slate-500">Sex: {calf.sex} • Breed: {calf.breed} • Birth Weight: {calf.birthWeight} kg</p>
            </div>
          ) : (
            <p className="text-xs text-slate-400">Calf ID: {reg.calfId || 'N/A'}</p>
          )}
        </div>

      </div>
    </div>
  );
}
