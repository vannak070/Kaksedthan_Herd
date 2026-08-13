import React from 'react';
import Link from 'next/link';
import PageHeader from '@/components/common/PageHeader';
import StandardAnimalImage from '@/components/common/StandardAnimalImage';
import ApplyCertificateButton from '@/components/certificate/ApplyCertificateButton';
import { herdbookRepository } from '@/repositories/herdbook.repository';
import { Beef, Syringe, Heart, Baby, Edit, ArrowLeft, Award } from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SireDetailPage({ params }: PageProps) {
  const { id } = await params;
  const sire = await herdbookRepository.getSireById(id);
  const sires = await herdbookRepository.getSires();
  const allStockInsemination = await herdbookRepository.getStockInsemination();
  const breedingPrograms = await herdbookRepository.getBreedingPrograms();
  const calves = await herdbookRepository.getCalves();

  if (!sire) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center my-6 max-w-xl mx-auto">
        <Beef className="h-12 w-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800">Sire Not Found</h3>
        <p className="text-xs text-slate-500 mt-1">No sire record found for ID: {id}</p>
        <Link href="/sires" className="inline-flex items-center gap-2 bg-[#dc5c15] text-white text-xs font-bold px-4 py-2 rounded-xl mt-4">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Sire Register</span>
        </Link>
      </div>
    );
  }

  const sireInsemination = allStockInsemination.filter(s => s.sireId === sire.id);
  const sireBreedingPrograms = breedingPrograms.filter(bp => bp.sireId === sire.id);
  const sireCalves = calves.filter(c => c.sireId === sire.id);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageHeader
        title={sire.name}
        subtitle={`Sire ID: ${sire.id} • ${sire.breed} • ${sire.bloodline || 'Fullblood'}`}
        breadcrumbs={[
          { label: 'Sire Register', href: '/sires' },
          { label: sire.name },
        ]}
        backHref="/sires"
        backLabel="Back to Sire Register"
      >
        <div className="flex items-center gap-2">
          <ApplyCertificateButton animalType="Sire" animalId={sire.id} animalName={sire.name} />
          <Link
            href={`/sires/${sire.id}/edit`}
            className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-3 py-2 rounded-xl transition-colors"
          >
            <Edit className="h-4 w-4" />
            <span>Edit Sire</span>
          </Link>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <StandardAnimalImage
            src={sire.imageUrl}
            alt={sire.name}
          />
          <div className="mt-4 text-center">
            <span className="inline-block bg-emerald-100 text-emerald-800 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
              {sire.status}
            </span>
          </div>
        </div>

        <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-3">Biological Profile & Setup Architecture</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <p className="text-slate-400 font-medium">Sire ID Tag</p>
              <p className="font-mono font-bold text-slate-900 mt-0.5">{sire.id}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Registration No.</p>
              <p className="font-bold text-slate-900 mt-0.5">{sire.registrationNumber || 'Unregistered'}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Master Breed</p>
              <p className="font-bold text-[#dc5c15] mt-0.5">{sire.breed}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Date of Birth</p>
              <p className="font-bold text-slate-900 mt-0.5">{sire.dob || 'N/A'}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Bloodline</p>
              <p className="font-bold text-slate-900 mt-0.5">{sire.bloodline || 'N/A'}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Genetics Provider</p>
              <p className="font-extrabold text-purple-700 mt-0.5">{sire.sourcingCompany || 'N/A'} {sire.sourcingCompanyCountry ? `(${sire.sourcingCompanyCountry})` : ''}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Ownership Type</p>
              <p className="font-bold text-slate-900 mt-0.5">{sire.ownerType || 'N/A'}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Actual Owner</p>
              <p className="font-bold text-emerald-700 mt-0.5">{sire.ownerName || 'N/A'}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Station Location</p>
              <p className="font-bold text-slate-900 mt-0.5">{sire.farmLocation || 'Unassigned Station'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Linked Livestock Lifecycle Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 1. Insemination Stock */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Syringe className="h-4 w-4 text-purple-600" />
              <span>Semen Stock Straws</span>
            </h3>
            <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">{sireInsemination.length}</span>
          </div>
          {sireInsemination.length === 0 ? (
            <p className="text-xs text-slate-400">No semen straws registered for this sire.</p>
          ) : (
            <div className="space-y-2">
              {sireInsemination.map(st => (
                <div key={st.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-slate-800">{st.id}</p>
                    <p className="text-[11px] text-slate-500">{st.stockAvailable} Straws • ${st.priceUsd}/straw</p>
                  </div>
                  <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">{st.availability}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 2. Breeding Programs */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Heart className="h-4 w-4 text-[#dc5c15]" />
              <span>Breeding Programs</span>
            </h3>
            <span className="text-xs font-bold text-[#dc5c15] bg-orange-50 px-2 py-0.5 rounded-full">{sireBreedingPrograms.length}</span>
          </div>
          {sireBreedingPrograms.length === 0 ? (
            <p className="text-xs text-slate-400">No active breeding programs for this sire.</p>
          ) : (
            <div className="space-y-2">
              {sireBreedingPrograms.map(bp => (
                <Link key={bp.id} href={`/breeding-programs/${bp.id}`} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs hover:border-orange-300 transition-colors">
                  <div>
                    <p className="font-bold text-slate-800">{bp.programNumber}</p>
                    <p className="text-[11px] text-slate-500">Dam: {bp.damId}</p>
                  </div>
                  <span className="font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md">{bp.status}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* 3. Offspring Calves */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Baby className="h-4 w-4 text-indigo-600" />
              <span>Offspring Calves</span>
            </h3>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{sireCalves.length}</span>
          </div>
          {sireCalves.length === 0 ? (
            <p className="text-xs text-slate-400">No offspring calves registered yet.</p>
          ) : (
            <div className="space-y-2">
              {sireCalves.map(c => (
                <Link key={c.id} href={`/calves/${c.id}`} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs hover:border-indigo-300 transition-colors">
                  <div>
                    <p className="font-bold text-slate-800">{c.name || c.id}</p>
                    <p className="text-[11px] text-slate-500">{c.sex} • {c.breed}</p>
                  </div>
                  <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">View</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
