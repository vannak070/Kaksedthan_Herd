import React from 'react';
import Link from 'next/link';
import PageHeader from '@/components/common/PageHeader';
import StandardAnimalImage from '@/components/common/StandardAnimalImage';
import ApplyCertificateButton from '@/components/certificate/ApplyCertificateButton';
import { herdbookRepository } from '@/repositories/herdbook.repository';
import { Baby, Beef, Heart, Award, FileText, QrCode, ArrowLeft, Edit, Sparkles } from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CalfDetailPage({ params }: PageProps) {
  const { id } = await params;
  const calf = await herdbookRepository.getCalfById(id);
  const sire = calf ? await herdbookRepository.getSireById(calf.sireId) : null;
  const dam = calf ? await herdbookRepository.getDamById(calf.damId) : null;
  const bp = calf && calf.breedingProgramId ? await herdbookRepository.getBreedingProgramById(calf.breedingProgramId) : null;
  const herdbookRegs = await herdbookRepository.getHerdbookRegistrations();
  const certs = await herdbookRepository.getCertificates();

  if (!calf) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center my-6 max-w-xl mx-auto">
        <Baby className="h-12 w-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800">Calf Not Found</h3>
        <p className="text-xs text-slate-500 mt-1">No calf record found for ID: {id}</p>
        <Link href="/calves" className="inline-flex items-center gap-2 bg-indigo-600 text-white text-xs font-bold px-4 py-2 rounded-xl mt-4">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Calf Register</span>
        </Link>
      </div>
    );
  }

  const linkedHerdbook = herdbookRegs.find(hr => hr.calfId === calf.id || hr.animalId === calf.id);
  const linkedCert = certs.find(c => c.calfId === calf.id || (linkedHerdbook && c.registrationId === linkedHerdbook.id));

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageHeader
        title={calf.name || calf.id}
        subtitle={`Calf ID: ${calf.id} • ${calf.sex} • ${calf.breed} • Born ${String(calf.birthDate).substring(0, 10)}`}
        breadcrumbs={[
          { label: 'Calf Register', href: '/calves' },
          { label: calf.name || calf.id },
        ]}
        backHref="/calves"
        backLabel="Back to Calf Register"
      >
        <div className="flex items-center gap-2">
          <ApplyCertificateButton animalType="Calf" animalId={calf.id} animalName={calf.name || calf.id} />
          <Link
            href={`/calves/${calf.id}/edit`}
            className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-3 py-2 rounded-xl transition-colors"
          >
            <Edit className="h-4 w-4" />
            <span>Edit Calf</span>
          </Link>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <StandardAnimalImage
            src={calf.imageUrl}
            alt={calf.name || calf.id}
          />
          <div className="mt-4 text-center">
            <span className="inline-block bg-indigo-100 text-indigo-800 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
              {calf.status || 'Registered to Herdbook'}
            </span>
          </div>
        </div>

        <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-3">Biological Profile & Registration</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <p className="text-slate-400 font-medium">Calf ID</p>
              <p className="font-bold text-slate-900 mt-0.5">{calf.id}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Sex</p>
              <p className="font-bold text-slate-900 mt-0.5">{calf.sex}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Breed</p>
              <p className="font-bold text-slate-900 mt-0.5">{calf.breed}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Birth Weight</p>
              <p className="font-bold text-slate-900 mt-0.5">{calf.birthWeight || 25} kg</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Owner Name</p>
              <p className="font-bold text-slate-900 mt-0.5">{calf.ownerName || 'SNR Farm Owner'}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Farm Location</p>
              <p className="font-bold text-slate-900 mt-0.5">{calf.farmLocation || 'រទាំង'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Connected 7 Lifecycle Link Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* 1. Sire Link */}
        <Link href={`/sires/${calf.sireId}`} className="group bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-orange-400 transition-all">
          <span className="text-[10px] font-black text-[#dc5c15] uppercase tracking-wider flex items-center gap-1">
            <Beef className="h-3.5 w-3.5" /> Sire Bull
          </span>
          <h4 className="text-sm font-black text-slate-900 group-hover:text-[#dc5c15] mt-1">{sire?.name || calf.sireId}</h4>
          <p className="text-xs text-slate-500">{sire?.breed || 'Wagyu'}</p>
        </Link>

        {/* 2. Dam Link */}
        <Link href={`/dams/${calf.damId}`} className="group bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-purple-400 transition-all">
          <span className="text-[10px] font-black text-purple-600 uppercase tracking-wider flex items-center gap-1">
            <Beef className="h-3.5 w-3.5" /> Dam Cow
          </span>
          <h4 className="text-sm font-black text-slate-900 group-hover:text-purple-600 mt-1">{dam?.name || calf.damId}</h4>
          <p className="text-xs text-slate-500">{dam?.breed || 'Angus Cross'}</p>
        </Link>

        {/* 3. Breeding Program Link */}
        {bp ? (
          <Link href={`/breeding-programs/${bp.id}`} className="group bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-orange-400 transition-all">
            <span className="text-[10px] font-black text-orange-600 uppercase tracking-wider flex items-center gap-1">
              <Heart className="h-3.5 w-3.5" /> Breeding Program
            </span>
            <h4 className="text-sm font-black text-slate-900 group-hover:text-orange-600 mt-1">{bp.programNumber}</h4>
            <p className="text-xs text-slate-500">{bp.status}</p>
          </Link>
        ) : (
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Breeding Program</span>
            <p className="text-xs font-bold text-slate-600 mt-1">Manual Registration</p>
          </div>
        )}

        {/* 4. Herdbook Record Link */}
        {linkedHerdbook ? (
          <Link href={`/herdbook`} className="group bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-amber-400 transition-all">
            <span className="text-[10px] font-black text-amber-600 uppercase tracking-wider flex items-center gap-1">
              <Award className="h-3.5 w-3.5" /> Herdbook Reg #
            </span>
            <h4 className="text-sm font-black text-slate-900 group-hover:text-amber-600 mt-1">{linkedHerdbook.registrationNumber}</h4>
            <p className="text-xs text-slate-500">{linkedHerdbook.status}</p>
          </Link>
        ) : null}

        {/* 5. Certificate Link */}
        {linkedHerdbook ? (
          <Link href={`/certificates/${linkedHerdbook.id}`} className="group bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-400 transition-all">
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider flex items-center gap-1">
              <FileText className="h-3.5 w-3.5" /> A4 Certificate
            </span>
            <h4 className="text-sm font-black text-slate-900 group-hover:text-emerald-600 mt-1">View Certificate</h4>
            <p className="text-xs text-slate-500">Download A4 PNG</p>
          </Link>
        ) : null}

        {/* 6. QR Verification Link */}
        {linkedHerdbook ? (
          <Link href={`/public/verify/${linkedHerdbook.publicToken}`} className="group bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-blue-400 transition-all">
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-wider flex items-center gap-1">
              <QrCode className="h-3.5 w-3.5" /> Public QR Code
            </span>
            <h4 className="text-sm font-black text-slate-900 group-hover:text-blue-600 mt-1">Test QR Scanner</h4>
            <p className="text-xs text-slate-500">Public Page</p>
          </Link>
        ) : null}
      </div>
    </div>
  );
}
