import React from 'react';
import Link from 'next/link';
import PageHeader from '@/components/common/PageHeader';
import StandardAnimalImage from '@/components/common/StandardAnimalImage';
import { herdbookRepository } from '@/repositories/herdbook.repository';
import { 
  Heart, 
  Beef, 
  Baby, 
  Award, 
  ArrowLeft, 
  Calendar, 
  CheckCircle2, 
  Circle, 
  Edit, 
  FileText,
  User,
  Building,
  DollarSign,
  Syringe,
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function BreedingProgramDetailPage({ params }: PageProps) {
  const { id } = await params;
  const bp = await herdbookRepository.getBreedingProgramById(id);
  const sire = bp ? await herdbookRepository.getSireById(bp.sireId) : null;
  const dam = bp ? await herdbookRepository.getDamById(bp.damId) : null;
  const calves = await herdbookRepository.getCalves();
  const herdbookRegs = await herdbookRepository.getHerdbookRegistrations();

  if (!bp) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center my-6 max-w-xl mx-auto shadow-sm">
        <Heart className="h-12 w-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800">Breeding Program Not Found</h3>
        <p className="text-xs text-slate-500 mt-1">No breeding program record found for ID: {id}</p>
        <Link href="/breeding-programs" className="inline-flex items-center gap-2 bg-[#dc5c15] text-white text-xs font-bold px-4 py-2.5 rounded-xl mt-4 hover:bg-[#c44f0e] transition-colors">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Breeding Programs</span>
        </Link>
      </div>
    );
  }

  const linkedCalf = calves.find(c => c.breedingProgramId === bp.id || (c.sireId === bp.sireId && c.damId === bp.damId));
  const linkedHerdbook = herdbookRegs.find(hr => hr.breedingProgramId === bp.id || (linkedCalf && hr.calfId === linkedCalf.id));

  const steps = [
    { label: 'Breeding Insemination', date: bp.breedingDate || bp.startDate, done: true },
    { label: 'Pregnancy Check', date: bp.pregnancyCheckDate, done: bp.status === 'Pregnant' || bp.status === 'Calved' || bp.status === 'Completed' },
    { label: 'Expected Calving', date: bp.expectedCalvingDate, done: bp.status === 'Calved' || bp.status === 'Completed' },
    { label: 'Calving Complete', date: bp.actualCalvingDate, done: bp.status === 'Calved' || bp.status === 'Completed' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageHeader
        title={`Breeding Program: ${bp.programNumber}`}
        subtitle={`Method: ${bp.breedingMethod || 'Artificial Insemination (AI)'} • Status: ${bp.status}`}
        breadcrumbs={[
          { label: 'Breeding Program', href: '/breeding-programs' },
          { label: bp.programNumber },
        ]}
        backHref="/breeding-programs"
        backLabel="Back to Breeding Programs"
      >
        <Link
          href={`/breeding-programs/${bp.id}/edit`}
          className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-3 py-2 rounded-xl transition-colors"
        >
          <Edit className="h-4 w-4" />
          <span>Update Status</span>
        </Link>
      </PageHeader>

      {/* Overview Cards: Operational Responsibilities & Costing */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Owner Information */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
            <User className="h-3.5 w-3.5 text-[#dc5c15]" /> Cow Owner
          </span>
          <p className="text-sm font-black text-slate-900">{bp.cowOwner || bp.ownerName || 'Not Assigned'}</p>
          <p className="text-xs text-slate-500 mt-0.5">Registered Animal Owner</p>
        </div>

        {/* Breeder Specialist */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
            <Syringe className="h-3.5 w-3.5 text-[#dc5c15]" /> Breeder Specialist
          </span>
          <p className="text-sm font-black text-slate-900">{bp.breederName || 'Unassigned Specialist'}</p>
          <p className="text-xs text-slate-500 mt-0.5">Certified Inseminator</p>
        </div>

        {/* Farm Station Location */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
            <Building className="h-3.5 w-3.5 text-[#dc5c15]" /> Farm Station
          </span>
          <p className="text-sm font-black text-slate-900">{bp.farmLocation || 'Unassigned Farm Station'}</p>
          <p className="text-xs text-slate-500 mt-0.5">Operational Location</p>
        </div>
      </div>

      {/* Gestation Step Timetable */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-[#dc5c15]" />
            <span>Gestation & Calving Timetable</span>
          </h3>
          <span className="bg-orange-100 text-[#dc5c15] text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
            {bp.status}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {steps.map((st, i) => (
            <div key={i} className={`p-4 rounded-2xl border transition-all ${st.done ? 'bg-orange-50/60 border-orange-200/80 shadow-2xs' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center gap-2 mb-1.5">
                {st.done ? (
                  <CheckCircle2 className="h-4 w-4 text-[#dc5c15]" />
                ) : (
                  <Circle className="h-4 w-4 text-slate-400" />
                )}
                <span className={`text-xs font-extrabold ${st.done ? 'text-slate-900' : 'text-slate-500'}`}>{st.label}</span>
              </div>
              <p className="text-xs font-black text-slate-700 mt-1">
                {st.date ? String(st.date).substring(0, 10) : 'Pending Schedule'}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Connected Biological Lineage Cards (Sire & Dam) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sire Bull Master Record Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between">
          <div className="bg-gradient-to-r from-[#dc5c15]/10 via-orange-50/50 to-white p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-[#dc5c15] text-white flex items-center justify-center shadow-xs">
                <Beef className="h-4 w-4" />
              </div>
              <div>
                <span className="text-[10px] font-black text-[#dc5c15] uppercase tracking-wider block">Biological Father</span>
                <h3 className="text-sm font-black text-slate-900 leading-tight">Sire Bull Master Record</h3>
              </div>
            </div>
            <span className="bg-emerald-500/10 text-emerald-700 border border-emerald-500/30 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
              {sire?.status || 'Active'}
            </span>
          </div>

          <div className="p-5 space-y-4 flex-1">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <div className="relative flex-shrink-0">
                <StandardAnimalImage
                  src={sire?.imageUrl || bp.sireImageUrl}
                  alt={sire?.name || bp.sireName || bp.sireId}
                  animalType="sire"
                  size="xl"
                />
              </div>
              
              <div className="flex-1 min-w-0 text-center sm:text-left space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">ID: {bp.sireId}</span>
                <h4 className="text-lg font-black text-slate-900 truncate">{sire?.name || bp.sireName || bp.sireId}</h4>
                <p className="text-xs font-black text-[#dc5c15]">{sire?.breed || bp.sireBreed || 'American Red Brahman'}</p>
                
                <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-1.5">
                  <span className="bg-slate-100 text-slate-700 text-[10px] font-extrabold px-2.5 py-0.5 rounded-md border border-slate-200">
                    🧬 {sire?.bloodline || '100% Purebred Brahman'}
                  </span>
                  <span className="bg-orange-50 text-[#dc5c15] text-[10px] font-extrabold px-2.5 py-0.5 rounded-md border border-orange-200">
                    🏢 {sire?.sourcingCompany || 'ABS Global Cambodia'}
                  </span>
                </div>
              </div>
            </div>

            {/* Detailed Genetic Metrics Grid */}
            <div className="bg-slate-50/80 rounded-2xl p-3.5 border border-slate-200/80 grid grid-cols-2 gap-3 text-[11px]">
              <div>
                <span className="text-slate-400 font-extrabold block text-[9px] uppercase tracking-wider">Genetic Purity</span>
                <span className="font-black text-slate-800">{sire?.bloodline || '100% Purebred'}</span>
              </div>
              <div>
                <span className="text-slate-400 font-extrabold block text-[9px] uppercase tracking-wider">Sourcing Supplier</span>
                <span className="font-black text-slate-800 truncate block">{sire?.sourcingCompany || 'ABS Global'}</span>
              </div>
              <div>
                <span className="text-slate-400 font-extrabold block text-[9px] uppercase tracking-wider">Origin Country</span>
                <span className="font-black text-slate-800">USA / Imported</span>
              </div>
              <div>
                <span className="text-slate-400 font-extrabold block text-[9px] uppercase tracking-wider">Date of Birth</span>
                <span className="font-black text-slate-800">{sire?.dob ? String(sire.dob).substring(0, 10) : '2022-05-10'}</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-50/50 border-t border-slate-100">
            <Link
              href={`/sires/${bp.sireId}`}
              className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#dc5c15] to-[#f37d4f] hover:from-[#c44f0e] hover:to-[#dc5c15] text-white font-black text-xs py-2.5 rounded-xl shadow-xs transition-all"
            >
              <span>View Sire Pedigree & Stock</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Dam Cow Master Record Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between">
          <div className="bg-gradient-to-r from-purple-500/10 via-purple-50/50 to-white p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
                <Beef className="h-4 w-4" />
              </div>
              <div>
                <span className="text-[10px] font-black text-purple-600 uppercase tracking-wider block">Biological Mother</span>
                <h3 className="text-sm font-black text-slate-900 leading-tight">Dam Cow Master Record</h3>
              </div>
            </div>
            <span className="bg-purple-500/10 text-purple-700 border border-purple-500/30 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
              {dam?.availability || bp.status || 'In Breeding'}
            </span>
          </div>

          <div className="p-5 space-y-4 flex-1">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <div className="relative flex-shrink-0">
                <StandardAnimalImage
                  src={dam?.imageUrl || bp.damImageUrl}
                  alt={dam?.name || bp.damName || bp.damId}
                  animalType="dam"
                  size="xl"
                />
              </div>

              <div className="flex-1 min-w-0 text-center sm:text-left space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">TAG: {bp.damId}</span>
                <h4 className="text-lg font-black text-slate-900 truncate">{dam?.name || bp.damName || bp.damId}</h4>
                <p className="text-xs font-black text-purple-600">{dam?.breed || bp.damBreed || 'Brahman Cross'}</p>

                <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-1.5">
                  <span className="bg-slate-100 text-slate-700 text-[10px] font-extrabold px-2.5 py-0.5 rounded-md border border-slate-200">
                    🐄 {dam?.pregnancyStatus || dam?.breedingStatus || bp.status}
                  </span>
                  <span className="bg-purple-50 text-purple-700 text-[10px] font-extrabold px-2.5 py-0.5 rounded-md border border-purple-200">
                    🏡 {dam?.farmLocation || bp.farmLocation || 'Rothang Station'}
                  </span>
                </div>
              </div>
            </div>

            {/* Detailed Reproductive Metrics Grid */}
            <div className="bg-slate-50/80 rounded-2xl p-3.5 border border-slate-200/80 grid grid-cols-2 gap-3 text-[11px]">
              <div>
                <span className="text-slate-400 font-extrabold block text-[9px] uppercase tracking-wider">Reproductive Status</span>
                <span className="font-black text-slate-800">{dam?.pregnancyStatus || dam?.breedingStatus || bp.status}</span>
              </div>
              <div>
                <span className="text-slate-400 font-extrabold block text-[9px] uppercase tracking-wider">Registered Owner</span>
                <span className="font-black text-slate-800 truncate block">{dam?.ownerName || bp.cowOwner || bp.ownerName || 'Bona Van'}</span>
              </div>
              <div>
                <span className="text-slate-400 font-extrabold block text-[9px] uppercase tracking-wider">Farm Station</span>
                <span className="font-black text-slate-800 truncate block">{dam?.farmLocation || bp.farmLocation || 'Rothang Farm'}</span>
              </div>
              <div>
                <span className="text-slate-400 font-extrabold block text-[9px] uppercase tracking-wider">Date of Birth</span>
                <span className="font-black text-slate-800">{dam?.dob ? String(dam.dob).substring(0, 10) : '2023-01-15'}</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-50/50 border-t border-slate-100">
            <Link
              href={`/dams/${bp.damId}`}
              className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-xs py-2.5 rounded-xl shadow-xs transition-all"
            >
              <span>View Dam Reproductive Record</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Semen Inventory & Service Pricing Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs">
        <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-[#dc5c15]" />
          <span>Semen Straw Inventory & Insemination Pricing</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">SEMEN STRAWS USED</span>
            <p className="text-lg font-black text-slate-900 mt-1">{bp.semenQty || 1} Straw</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">UNIT STRAW PRICE</span>
            <p className="text-lg font-black text-[#dc5c15] mt-1">${bp.unitPrice || bp.priceUsd || 45.00} USD</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">TOTAL COST</span>
            <p className="text-lg font-black text-emerald-600 mt-1">
              ${bp.priceUsd || 45.00} USD <span className="text-xs font-bold text-slate-500">({(bp.priceKhr || 180000).toLocaleString()} KHR)</span>
            </p>
          </div>
        </div>
      </div>

      {/* Offspring Calf & Herdbook Verification Section */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
        <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-indigo-600" />
          <span>Offspring Calf & Official Herdbook Certification</span>
        </h3>

        {linkedCalf ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-gradient-to-r from-indigo-50/70 to-slate-50 rounded-2xl border border-indigo-100">
            <div className="flex items-center gap-4">
              <StandardAnimalImage
                src={linkedCalf.imageUrl}
                alt={linkedCalf.name}
                animalType="calf"
                size="md"
              />
              <div>
                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wider block">REGISTERED OFFSPRING CALF</span>
                <h4 className="text-base font-black text-slate-900 mt-0.5">{linkedCalf.name}</h4>
                <p className="text-xs font-bold text-slate-600">
                  {linkedCalf.sex} • {linkedCalf.breed} • Birth Weight: {linkedCalf.birthWeight || 35} kg
                </p>
                <p className="text-xs text-slate-400 mt-0.5">Birth Date: {String(linkedCalf.birthDate).substring(0, 10)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                href={`/calves/${linkedCalf.id}`}
                className="inline-flex items-center gap-1.5 bg-indigo-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
              >
                <Baby className="h-4 w-4" />
                <span>View Calf Profile</span>
              </Link>
              {linkedHerdbook && (
                <Link
                  href={`/certificates/${linkedHerdbook.id}`}
                  className="inline-flex items-center gap-1.5 bg-emerald-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-emerald-700 transition-colors shadow-sm"
                >
                  <Award className="h-4 w-4" />
                  <span>View Certificate</span>
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="p-8 bg-slate-50 rounded-2xl border border-slate-200/80 text-center">
            <div className="h-12 w-12 bg-orange-100 text-[#dc5c15] rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Baby className="h-6 w-6" />
            </div>
            <h4 className="text-sm font-black text-slate-800">Calving Pending / Calf Not Yet Registered</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Once calving takes place, register the calf to atomically link its Sire/Dam lineage and issue its official Herdbook Certificate.
            </p>
            <Link
              href={`/calves/new?programId=${bp.id}`}
              className="inline-flex items-center gap-2 bg-[#dc5c15] text-white text-xs font-bold px-5 py-2.5 rounded-xl mt-4 hover:bg-[#c44f0e] transition-colors shadow-md shadow-[#dc5c15]/20"
            >
              <Baby className="h-4 w-4" />
              <span>Confirm Calving & Register Calf</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
