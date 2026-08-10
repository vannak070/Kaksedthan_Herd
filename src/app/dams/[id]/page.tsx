import React from 'react';
import Link from 'next/link';
import PageHeader from '@/components/common/PageHeader';
import StandardAnimalImage from '@/components/common/StandardAnimalImage';
import ApplyCertificateButton from '@/components/certificate/ApplyCertificateButton';
import { herdbookRepository } from '@/repositories/herdbook.repository';
import { Beef, Heart, Baby, Edit, ArrowLeft } from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DamDetailPage({ params }: PageProps) {
  const { id } = await params;
  const dam = await herdbookRepository.getDamById(id);
  const breedingPrograms = await herdbookRepository.getBreedingPrograms();
  const calves = await herdbookRepository.getCalves();

  if (!dam) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center my-6 max-w-xl mx-auto">
        <Beef className="h-12 w-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800">Dam Not Found</h3>
        <p className="text-xs text-slate-500 mt-1">No dam record found for ID: {id}</p>
        <Link href="/dams" className="inline-flex items-center gap-2 bg-purple-600 text-white text-xs font-bold px-4 py-2 rounded-xl mt-4">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dam Register</span>
        </Link>
      </div>
    );
  }

  const damBreedingPrograms = breedingPrograms.filter(bp => bp.damId === dam.id);
  const damCalves = calves.filter(c => c.damId === dam.id);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageHeader
        title={dam.name || dam.id}
        subtitle={`Dam ID: ${dam.id} • ${dam.breed} • ${dam.availability}`}
        breadcrumbs={[
          { label: 'Dam Register', href: '/dams' },
          { label: dam.name || dam.id },
        ]}
        backHref="/dams"
        backLabel="Back to Dam Register"
      >
        <div className="flex items-center gap-2">
          <ApplyCertificateButton animalType="Dam" animalId={dam.id} animalName={dam.name || dam.id} />
          <Link
            href={`/dams/${dam.id}/edit`}
            className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-3 py-2 rounded-xl transition-colors"
          >
            <Edit className="h-4 w-4" />
            <span>Edit Dam</span>
          </Link>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <StandardAnimalImage
            src={dam.imageUrl}
            alt={dam.name || dam.id}
          />
          <div className="mt-4 text-center">
            <span className={`inline-block text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${
              dam.availability === 'Available' ? 'bg-emerald-100 text-emerald-800' : 'bg-purple-100 text-purple-800'
            }`}>
              {dam.availability}
            </span>
          </div>
        </div>

        <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-3">Biological Profile & Breeding History</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <p className="text-slate-400 font-medium">Dam ID</p>
              <p className="font-bold text-slate-900 mt-0.5">{dam.id}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Breed</p>
              <p className="font-bold text-slate-900 mt-0.5">{dam.breed}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Date of Birth</p>
              <p className="font-bold text-slate-900 mt-0.5">{dam.dob || 'N/A'}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Breeding Status</p>
              <p className="font-bold text-slate-900 mt-0.5">{dam.breedingStatus || 'Open'}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Father (Sire ID)</p>
              <p className="font-extrabold text-[#dc5c15] mt-0.5">{dam.fatherId || 'SIR-001'}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Mother (Dam ID)</p>
              <p className="font-extrabold text-purple-700 mt-0.5">{dam.motherId || 'DAM-001'}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Owner Name</p>
              <p className="font-bold text-slate-900 mt-0.5">{dam.ownerName || 'SNR Farm Owner'}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Farm Location</p>
              <p className="font-bold text-slate-900 mt-0.5">{dam.farmLocation || 'រទាំង'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Linked Breeding History & Calves */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Breeding Programs */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Heart className="h-4 w-4 text-[#dc5c15]" />
              <span>Breeding History</span>
            </h3>
            <span className="text-xs font-bold text-[#dc5c15] bg-orange-50 px-2 py-0.5 rounded-full">{damBreedingPrograms.length}</span>
          </div>
          {damBreedingPrograms.length === 0 ? (
            <p className="text-xs text-slate-400">No breeding history records for this dam.</p>
          ) : (
            <div className="space-y-2">
              {damBreedingPrograms.map(bp => (
                <Link key={bp.id} href={`/breeding-programs/${bp.id}`} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs hover:border-orange-300 transition-colors">
                  <div>
                    <p className="font-bold text-slate-800">{bp.programNumber}</p>
                    <p className="text-[11px] text-slate-500">Sire: {bp.sireId}</p>
                  </div>
                  <span className="font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md">{bp.status}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* 2. Offspring Calves */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Baby className="h-4 w-4 text-purple-600" />
              <span>Offspring Calves</span>
            </h3>
            <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">{damCalves.length}</span>
          </div>
          {damCalves.length === 0 ? (
            <p className="text-xs text-slate-400">No offspring calves registered for this dam.</p>
          ) : (
            <div className="space-y-2">
              {damCalves.map(c => (
                <Link key={c.id} href={`/calves/${c.id}`} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs hover:border-purple-300 transition-colors">
                  <div>
                    <p className="font-bold text-slate-800">{c.name || c.id}</p>
                    <p className="text-[11px] text-slate-500">{c.sex} • {c.breed}</p>
                  </div>
                  <span className="font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">View</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
