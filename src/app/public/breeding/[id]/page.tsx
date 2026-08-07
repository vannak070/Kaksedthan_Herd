'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Award, 
  ArrowLeft, 
  Dna, 
  Maximize2, 
  X,
  AlertCircle,
  Phone,
  Mail,
  Building2,
  Calendar,
  Layers,
  Sparkles,
  Heart,
  Clock,
  Baby,
  UserCheck,
  Globe
} from 'lucide-react';

interface PublicBreedingData {
  id: string;
  programName: string;
  programCode: string;
  breedingType: string;
  pregnancyStatus: 'Pending' | 'Confirmed Pregnant' | 'Calved' | 'Open' | string;
  damId: string;
  damName: string;
  damBreed: string;
  damImageUrl: string;
  sireId: string;
  sireName: string;
  sireBreed: string;
  sireImageUrl: string;
  targetBreed: string;
  matingDate: string | null;
  expectedBirthdate: string | null;
  actualBirthdate?: string | null;
  breedingMethod: string;
  technician: string;
  farmLocation: string;
  offspring?: {
    count: number;
    status: string;
    targetBreed: string;
  };
  galleryImages?: string[];
  verificationCode: string;
  contact?: {
    companyName: string;
    phone: string;
    email: string;
    website: string;
  };
}

export default function PublicBreedingPage() {
  const params = useParams();
  const rawId = params?.id as string;

  const [data, setData] = useState<PublicBreedingData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Lightbox State
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const fallbackDamImg = 'https://images.unsplash.com/photo-1546445317-29f4545f9d52?auto=format&fit=crop&w=800&q=80';
  const fallbackSireImg = 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=800&q=80';

  useEffect(() => {
    if (!rawId) return;

    const controller = new AbortController();
    async function fetchPublicBreeding() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/v1/public/breeding/${encodeURIComponent(rawId)}`, {
          signal: controller.signal
        });

        if (!res.ok) {
          if (res.status === 404) {
            setError('RECORD_NOT_FOUND');
          } else {
            setError('FAILED_TO_LOAD');
          }
          setLoading(false);
          return;
        }

        const json = await res.json();
        if (json.success && json.data) {
          setData(json.data);
        } else {
          setError('RECORD_NOT_FOUND');
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Public breeding fetch error:', err);
          setError('FAILED_TO_LOAD');
        }
      } finally {
        setLoading(false);
      }
    }

    fetchPublicBreeding();
    return () => controller.abort();
  }, [rawId]);

  // ── SKELETON LOADING STATE ──
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-2xl font-black mb-4 animate-bounce">
          🧬
        </div>
        <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-slate-300 font-bold text-base">KAKSEDTHAN Breeding Registry</p>
        <p className="text-slate-500 font-medium text-xs mt-1">Loading public breeding program record...</p>
      </div>
    );
  }

  // ── 404 ERROR PAGE (BRANDED) ──
  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
        <header className="bg-slate-900/90 border-b border-slate-800 px-6 py-4">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black text-xl">
                🌾
              </div>
              <span className="text-base font-extrabold text-white tracking-tight">
                KAKSEDTHAN <span className="text-emerald-400 font-semibold">Breeding Program</span>
              </span>
            </div>
          </div>
        </header>

        <main className="max-w-md w-full mx-auto px-6 py-12 text-center">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl flex items-center justify-center mx-auto mb-5 text-emerald-400 text-3xl">
              🧬
            </div>
            <h1 className="text-xl font-black text-white mb-2">The breeding record could not be found</h1>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              The record ID <span className="font-mono text-emerald-400 font-bold">{rawId}</span> does not exist or may have been updated in the registry.
            </p>
            <a
              href="/"
              className="inline-flex items-center justify-center gap-2 w-full px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-900/30 transition-all"
            >
              <ArrowLeft className="w-4 h-4" /> Return to KAKSEDTHAN Home
            </a>
          </div>
        </main>

        <footer className="border-t border-slate-900 text-center py-6 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} KAKSEDTHAN Livestock Management System. All rights reserved.</p>
        </footer>
      </div>
    );
  }

  // Determine Active Stage for Timeline
  const statusUpper = (data.pregnancyStatus || '').toUpperCase();
  let currentStageStep = 1; // 1: Planned, 2: Insemination, 3: Pregnant, 4: Calved

  if (statusUpper.includes('CALVED') || statusUpper.includes('BIRTH')) {
    currentStageStep = 4;
  } else if (statusUpper.includes('PREGNANT') || statusUpper.includes('CONFIRMED')) {
    currentStageStep = 3;
  } else if (statusUpper.includes('PENDING') || statusUpper.includes('INSEMINAT')) {
    currentStageStep = 2;
  }

  let statusBg = 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400';
  if (statusUpper.includes('PENDING')) statusBg = 'bg-amber-500/15 border-amber-500/30 text-amber-400';
  if (statusUpper.includes('OPEN')) statusBg = 'bg-red-500/15 border-red-500/30 text-red-400';
  if (statusUpper.includes('CALVED')) statusBg = 'bg-sky-500/15 border-sky-500/30 text-sky-400';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-20 selection:bg-emerald-500 selection:text-white">

      {/* ── 1. BRANDED PUBLIC HEADER ── */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 py-3.5 shadow-md">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black text-xl">
              🌾
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-extrabold text-white tracking-tight leading-tight">
                KAKSEDTHAN <span className="text-emerald-400 font-bold">Breeding Program</span>
              </h1>
              <p className="text-[11px] text-slate-400 font-medium">Public Pedigree & Lineage Verification Sheet</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Verified Record
            </span>
          </div>
        </div>
      </header>

      {/* ── 2. HERO SECTION ── */}
      <section className="bg-slate-900/60 border-b border-slate-800/80 px-4 sm:px-8 py-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Breeding Program Record
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-xs font-mono text-slate-400">Code: {data.programCode}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
              {data.programName}
            </h2>
            <p className="text-sm font-semibold text-emerald-400 mt-0.5">
              Target Breed: <span className="text-white font-extrabold">{data.targetBreed}</span> • Method: {data.breedingMethod}
            </p>
          </div>

          <div>
            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl border text-sm font-bold shadow-md ${statusBg}`}>
              <span className="w-2.5 h-2.5 rounded-full bg-current animate-pulse" />
              {data.pregnancyStatus}
            </span>
          </div>
        </div>
      </section>

      {/* ── 3. MAIN CONTENT (2-COLUMN RESPONSIVE LAYOUT) ── */}
      <main className="max-w-5xl mx-auto px-4 sm:px-8 pt-8 space-y-8">
        
        {/* ── PARENT IMAGE SHOWCASE (SIDE BY SIDE HERO SHOWCASE) ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Female Parent (Dam Cow) */}
          <div 
            onClick={() => setLightboxImage(data.damImageUrl || fallbackDamImg)}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-3 shadow-xl group cursor-pointer hover:border-pink-500/40 transition-all relative"
          >
            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
              <img
                src={data.damImageUrl || fallbackDamImg}
                alt=""
                className="absolute inset-0 w-full h-full object-cover blur-xl opacity-40 scale-110"
              />
              <img
                src={data.damImageUrl || fallbackDamImg}
                alt={data.damName}
                className="relative z-10 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => { (e.target as HTMLImageElement).src = fallbackDamImg; }}
              />
              <div className="absolute top-3 left-3 z-20 bg-pink-950/80 backdrop-blur-md border border-pink-700/60 text-pink-300 text-xs font-bold px-3 py-1 rounded-xl">
                🐄 Female Parent (Dam Cow)
              </div>
              <div className="absolute bottom-3 right-3 z-20 bg-slate-900/80 backdrop-blur-md border border-slate-700 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1">
                <Maximize2 className="w-3 h-3 text-emerald-400" /> Tap to Enlarge
              </div>
            </div>
            <div className="p-3 pt-3 flex items-center justify-between">
              <div>
                <p className="text-base font-black text-white">{data.damName}</p>
                <p className="text-xs text-pink-400 font-semibold mt-0.5">Breed: {data.damBreed}</p>
              </div>
              <span className="text-xs font-mono font-bold text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                {data.damId}
              </span>
            </div>
          </div>

          {/* Male Parent (Sire Bull) */}
          <div 
            onClick={() => setLightboxImage(data.sireImageUrl || fallbackSireImg)}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-3 shadow-xl group cursor-pointer hover:border-sky-500/40 transition-all relative"
          >
            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
              <img
                src={data.sireImageUrl || fallbackSireImg}
                alt=""
                className="absolute inset-0 w-full h-full object-cover blur-xl opacity-40 scale-110"
              />
              <img
                src={data.sireImageUrl || fallbackSireImg}
                alt={data.sireName}
                className="relative z-10 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => { (e.target as HTMLImageElement).src = fallbackSireImg; }}
              />
              <div className="absolute top-3 left-3 z-20 bg-sky-950/80 backdrop-blur-md border border-sky-700/60 text-sky-300 text-xs font-bold px-3 py-1 rounded-xl">
                🐂 Male Parent (Sire Bull)
              </div>
              <div className="absolute bottom-3 right-3 z-20 bg-slate-900/80 backdrop-blur-md border border-slate-700 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1">
                <Maximize2 className="w-3 h-3 text-emerald-400" /> Tap to Enlarge
              </div>
            </div>
            <div className="p-3 pt-3 flex items-center justify-between">
              <div>
                <p className="text-base font-black text-white">{data.sireName}</p>
                <p className="text-xs text-sky-400 font-semibold mt-0.5">Breed: {data.sireBreed}</p>
              </div>
              <span className="text-xs font-mono font-bold text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                {data.sireId}
              </span>
            </div>
          </div>

        </div>

        {/* ── 4. PROGRESS TIMELINE STAGES ── */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center gap-2.5 pb-4 mb-6 border-b border-slate-800 text-emerald-400 font-extrabold text-sm">
            <Clock className="w-4 h-4" /> <span>Breeding Stage Progress Timeline</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 relative">
            
            {/* Step 1: Planned */}
            <div className={`p-4 rounded-2xl border text-center transition-all ${
              currentStageStep >= 1 ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' : 'bg-slate-950 border-slate-800 text-slate-500'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mx-auto mb-2 ${
                currentStageStep >= 1 ? 'bg-emerald-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-400'
              }`}>1</div>
              <p className="text-xs font-bold">Planned</p>
              <p className="text-[10px] text-slate-400 mt-1">Breeding Schedule</p>
            </div>

            {/* Step 2: Insemination */}
            <div className={`p-4 rounded-2xl border text-center transition-all ${
              currentStageStep >= 2 ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' : 'bg-slate-950 border-slate-800 text-slate-500'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mx-auto mb-2 ${
                currentStageStep >= 2 ? 'bg-emerald-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-400'
              }`}>2</div>
              <p className="text-xs font-bold">Insemination Done</p>
              <p className="text-[10px] text-slate-400 mt-1">
                {data.matingDate ? new Date(data.matingDate).toLocaleDateString('en-GB') : 'Completed'}
              </p>
            </div>

            {/* Step 3: Confirmed Pregnant */}
            <div className={`p-4 rounded-2xl border text-center transition-all ${
              currentStageStep >= 3 ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' : 'bg-slate-950 border-slate-800 text-slate-500'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mx-auto mb-2 ${
                currentStageStep >= 3 ? 'bg-emerald-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-400'
              }`}>3</div>
              <p className="text-xs font-bold">Pregnant Confirmed</p>
              <p className="text-[10px] text-slate-400 mt-1">Gestation Active</p>
            </div>

            {/* Step 4: Calving / Birth */}
            <div className={`p-4 rounded-2xl border text-center transition-all ${
              currentStageStep >= 4 ? 'bg-sky-950/40 border-sky-500/40 text-sky-300' : 'bg-slate-950 border-slate-800 text-slate-500'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mx-auto mb-2 ${
                currentStageStep >= 4 ? 'bg-sky-400 text-slate-950 font-black' : 'bg-slate-800 text-slate-400'
              }`}>4</div>
              <p className="text-xs font-bold">Birth Completed</p>
              <p className="text-[10px] text-slate-400 mt-1">
                {data.expectedBirthdate ? `Exp: ${new Date(data.expectedBirthdate).toLocaleDateString('en-GB')}` : 'Calved'}
              </p>
            </div>

          </div>
        </div>

        {/* ── 5. STRUCTURED INFORMATION CARDS (2-COLUMN GRID) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* CARD 1: Program Information */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800 text-emerald-400 font-extrabold text-sm">
              <Dna className="w-4 h-4" /> <span>Program Specifications</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold">Program Name</p>
                <p className="text-sm font-extrabold text-white mt-1">{data.programName}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold">Program Code</p>
                <p className="text-xs font-bold text-emerald-400 font-mono mt-1">{data.programCode}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold">Breeding Type</p>
                <p className="text-xs font-bold text-slate-200 mt-1">{data.breedingType}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold">Target Breed</p>
                <p className="text-xs font-bold text-slate-200 mt-1">{data.targetBreed}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold">Breeding Method</p>
                <p className="text-xs font-bold text-slate-200 mt-1">{data.breedingMethod}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold">Verification Code</p>
                <p className="text-xs font-bold text-slate-300 font-mono mt-1">{data.verificationCode}</p>
              </div>
            </div>
          </div>

          {/* CARD 2: Breeding Timetable & Location */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800 text-emerald-400 font-extrabold text-sm">
              <Calendar className="w-4 h-4" /> <span>Breeding Timetable & Facility</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold">Breeding / Mating Date</p>
                <p className="text-sm font-extrabold text-white mt-1">
                  {data.matingDate ? new Date(data.matingDate).toLocaleDateString('en-GB') : '—'}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold">Expected Birth Date</p>
                <p className="text-sm font-extrabold text-emerald-400 mt-1">
                  {data.expectedBirthdate ? new Date(data.expectedBirthdate).toLocaleDateString('en-GB') : '—'}
                </p>
              </div>
              {data.actualBirthdate && (
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold">Actual Calving Date</p>
                  <p className="text-xs font-bold text-sky-400 mt-1">
                    {new Date(data.actualBirthdate).toLocaleDateString('en-GB')}
                  </p>
                </div>
              )}
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold">Attending Specialist</p>
                <p className="text-xs font-bold text-slate-200 mt-1">{data.technician}</p>
              </div>
              <div className="col-span-2">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold">Facility / Location</p>
                <p className="text-xs font-bold text-slate-200 mt-1">🏢 {data.farmLocation}</p>
              </div>
            </div>
          </div>

        </div>

        {/* ── CARD 3: OFFSPRING INFORMATION (CONDITIONAL) ── */}
        {data.offspring && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-slate-800 text-sky-400 font-extrabold text-sm">
              <Baby className="w-4 h-4" /> <span>Offspring & Calving Record</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
                <p className="text-[10px] text-slate-400 font-extrabold uppercase">Offspring Count</p>
                <p className="text-xl font-black text-sky-400 mt-1">{data.offspring.count} Head</p>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
                <p className="text-[10px] text-slate-400 font-extrabold uppercase">Calving Status</p>
                <p className="text-sm font-bold text-white mt-1">{data.offspring.status}</p>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
                <p className="text-[10px] text-slate-400 font-extrabold uppercase">Expected Breed</p>
                <p className="text-sm font-bold text-emerald-400 mt-1">{data.offspring.targetBreed}</p>
              </div>
            </div>
          </div>
        )}

        {/* ── CARD 4: CONTACT & FACILITY INFORMATION ── */}
        {data.contact && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-slate-800 text-emerald-400 font-extrabold text-sm">
              <Building2 className="w-4 h-4" /> <span>Facility Contact & Verification Support</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 bg-slate-950/70 border border-slate-800 p-3.5 rounded-2xl">
                <Building2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-400 font-extrabold uppercase">Facility</p>
                  <p className="text-xs font-bold text-white mt-0.5">{data.contact.companyName}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-slate-950/70 border border-slate-800 p-3.5 rounded-2xl">
                <Phone className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-400 font-extrabold uppercase">Phone</p>
                  <a href={`tel:${data.contact.phone}`} className="text-xs font-bold text-emerald-400 hover:underline mt-0.5 block">
                    {data.contact.phone}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-slate-950/70 border border-slate-800 p-3.5 rounded-2xl">
                <Mail className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-400 font-extrabold uppercase">Email Support</p>
                  <a href={`mailto:${data.contact.email}`} className="text-xs font-bold text-emerald-400 hover:underline mt-0.5 block">
                    {data.contact.email}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-slate-950/70 border border-slate-800 p-3.5 rounded-2xl">
                <Globe className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-400 font-extrabold uppercase">Website</p>
                  <a href={data.contact.website} target="_blank" rel="noreferrer" className="text-xs font-bold text-emerald-400 hover:underline mt-0.5 block">
                    {data.contact.website.replace('https://', '')}
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* ── 5. LIGHTBOX OVERLAY ── */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out animate-in fade-in duration-200"
        >
          <img
            src={lightboxImage}
            alt=""
            className="max-w-[92vw] max-h-[90vh] object-contain rounded-2xl border border-slate-800 shadow-2xl"
            onClick={e => e.stopPropagation()}
            onError={(e) => { (e.target as HTMLImageElement).src = fallbackDamImg; }}
          />
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-5 right-6 w-11 h-11 rounded-full bg-slate-800/80 hover:bg-slate-700 text-white flex items-center justify-center text-xl transition-all shadow-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* ── 6. BRANDED PUBLIC FOOTER ── */}
      <footer className="mt-20 border-t border-slate-900 bg-slate-950/80 py-10 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-xl font-black">
              🌾
            </div>
            <div>
              <p className="text-sm font-extrabold text-white">KAKSEDTHAN Livestock Management System</p>
              <p className="text-xs text-slate-500 mt-0.5">Official Verified Public Breeding Registry</p>
            </div>
          </div>

          <div className="text-xs text-slate-500">
            <p>© {new Date().getFullYear()} KAKSEDTHAN ERP. All rights reserved.</p>
            <p className="text-[11px] text-slate-600 mt-1">Powered by KAKSEDTHAN Livestock Management System</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
