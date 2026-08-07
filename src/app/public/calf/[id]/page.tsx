'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Award, 
  ArrowLeft, 
  Dna, 
  MapPin, 
  Calendar, 
  Building2, 
  UserCheck, 
  FileText,
  Sparkles,
  Printer
} from 'lucide-react';

interface PublicCalfData {
  certNo: string;
  code: string;
  calfName: string;
  sex: string;
  breed: string;
  color: string;
  dob: string | null;
  birthWeight: string | null;
  height: string | null;
  birthType: string;
  status: string;
  farmName: string;
  provinceDistrict: string;
  communeVillage: string;
  gpsCoordinates: string;
  
  sireCode: string;
  sireName: string;
  sireBreed: string;
  sireOrigin?: string;
  
  damCode: string;
  damName: string;
  damBreed: string;
  damDob?: string;

  breedingRecordId: string;
  matingDate: string;
  breedingMethod: string;
  recordedBy: string;
  registrationDate: string;
  verifiedBy: string;
  verificationDate: string;

  ownerType: string;
  ownerName: string;

  healthStatus: string;
  vaccinationStatus: string;

  imageUrl: string;
  verificationCode: string;
  systemVersion: string;
  issuedDate: string;
  contact?: {
    companyName: string;
    phone: string;
    email: string;
    website: string;
  };
}

export default function PublicCalfPage() {
  const params = useParams();
  const rawId = params?.id as string;

  const [data, setData] = useState<PublicCalfData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fallbackImage = 'https://images.unsplash.com/photo-1546445317-29f4545f9d52?auto=format&fit=crop&w=800&q=80';

  useEffect(() => {
    if (!rawId) return;

    const controller = new AbortController();
    async function fetchPublicCalfData() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/v1/public/calf/${encodeURIComponent(rawId)}`, {
          signal: controller.signal
        });

        if (!res.ok) {
          setError('RECORD_NOT_FOUND');
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
          console.error('Public calf fetch error:', err);
          setError('FAILED_TO_LOAD');
        }
      } finally {
        setLoading(false);
      }
    }

    fetchPublicCalfData();
    return () => controller.abort();
  }, [rawId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-2xl font-black mb-4 animate-bounce">
          🌾
        </div>
        <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-slate-300 font-bold text-base">KAKSEDTHAN Public Registry</p>
        <p className="text-slate-500 font-medium text-xs mt-1">Verifying official Calf Pedigree Certificate...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
        <header className="bg-slate-900/90 border-b border-slate-800 px-6 py-4">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black text-xl">
                🌾
              </div>
              <span className="text-base font-extrabold text-white">
                KAKSEDTHAN <span className="text-emerald-400 font-semibold">Livestock</span>
              </span>
            </div>
          </div>
        </header>

        <main className="max-w-md w-full mx-auto px-6 py-12 text-center">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
            <div className="w-20 h-20 bg-amber-500/10 border border-amber-500/20 rounded-3xl flex items-center justify-center mx-auto mb-5 text-amber-400 text-3xl">
              📜
            </div>
            <h1 className="text-xl font-black text-white mb-2">Certificate Record Not Found</h1>
            <p className="text-xs text-slate-400 mb-6">
              The certificate ID <span className="font-mono text-emerald-400 font-bold">{rawId}</span> could not be verified in the active registry database.
            </p>
            <a
              href="/"
              className="inline-flex items-center justify-center gap-2 w-full px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg transition-all"
            >
              <ArrowLeft className="w-4 h-4" /> Return to KAKSEDTHAN Portal
            </a>
          </div>
        </main>

        <footer className="border-t border-slate-900 text-center py-6 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} KAKSEDTHAN Livestock Management System. All rights reserved.</p>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-20">

      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 py-3.5 shadow-md">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-black text-xl shadow-inner">
              🌾
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight text-white">
                  KAKSEDTHAN <span className="text-emerald-400 font-bold">Livestock</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  Pedigree Registry
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Official Digital Birth & Pedigree Verification</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" /> Print
            </button>
          </div>
        </div>
      </header>

      {/* Verification Banner */}
      <div className="bg-emerald-950/80 border-b border-emerald-800/60 px-4 py-3 text-center">
        <div className="max-w-5xl mx-auto flex items-center justify-center gap-2 text-emerald-400 font-bold text-xs sm:text-sm">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <span>OFFICIAL VERIFIED CERTIFICATE • REGISTRATION NO: <strong className="font-mono text-white">{data.certNo}</strong></span>
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-8 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Column 1: Photo & Verification Badge */}
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-3 shadow-xl overflow-hidden">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
                <img
                  src={data.imageUrl || fallbackImage}
                  alt={data.calfName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-3 text-center">
                <h2 className="text-lg font-black text-white">{data.calfName}</h2>
                <p className="text-xs font-mono text-emerald-400 font-bold mt-0.5">#{data.code}</p>
                <div className="mt-3 pt-3 border-t border-slate-800 flex justify-center gap-2">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {data.breed}
                  </span>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {data.sex}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400 text-2xl font-bold">
                ✓
              </div>
              <div>
                <p className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Database Verification</p>
                <p className="text-sm font-bold text-emerald-400 mt-0.5">{data.verificationCode}</p>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                This pedigree certificate is verified authentic and active in the Kaksedthan National Database.
              </p>
            </div>
          </div>

          {/* Column 2 & 3: Detailed Information Cards */}
          <div className="md:col-span-2 space-y-6">

            {/* Calf Identity Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
                <Award className="w-4 h-4 text-emerald-400" /> Calf Identification Profile
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <p className="text-slate-400 font-bold uppercase text-[10px]">Certificate No.</p>
                  <p className="font-mono font-bold text-emerald-400 text-sm mt-0.5">{data.certNo}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-bold uppercase text-[10px]">Calf Name</p>
                  <p className="font-bold text-white text-sm mt-0.5">{data.calfName}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-bold uppercase text-[10px]">Sex / Gender</p>
                  <p className="font-bold text-white text-sm mt-0.5">{data.sex}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-bold uppercase text-[10px]">Breed</p>
                  <p className="font-bold text-emerald-400 text-sm mt-0.5">{data.breed}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-bold uppercase text-[10px]">Coat Color</p>
                  <p className="font-bold text-white mt-0.5">{data.color}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-bold uppercase text-[10px]">Date of Birth</p>
                  <p className="font-bold text-white mt-0.5">{data.dob || '—'}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-bold uppercase text-[10px]">Birth Weight</p>
                  <p className="font-bold text-white mt-0.5">{data.birthWeight ? `${data.birthWeight} kg` : '—'}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-bold uppercase text-[10px]">Birth Type</p>
                  <p className="font-bold text-white mt-0.5">{data.birthType}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-bold uppercase text-[10px]">Current Status</p>
                  <span className="inline-block mt-0.5 font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    {data.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Pedigree Lineage Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
                <Dna className="w-4 h-4 text-emerald-400" /> Verified Pedigree Lineage
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-800/40 space-y-1">
                  <span className="text-[10px] font-extrabold text-blue-400 uppercase tracking-wider">♂ Sire Bull (Father)</span>
                  <p className="text-base font-black text-white">{data.sireName}</p>
                  <p className="text-xs text-blue-300 font-mono">Code: {data.sireCode} • Breed: {data.sireBreed}</p>
                </div>
                <div className="p-4 rounded-2xl bg-pink-950/40 border border-pink-800/40 space-y-1">
                  <span className="text-[10px] font-extrabold text-pink-400 uppercase tracking-wider">♀ Dam Cow (Mother)</span>
                  <p className="text-base font-black text-white">{data.damName}</p>
                  <p className="text-xs text-pink-300 font-mono">Code: {data.damCode} • Breed: {data.damBreed}</p>
                </div>
              </div>
            </div>

            {/* Location & Registration Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
                <MapPin className="w-4 h-4 text-emerald-400" /> Location of Birth & System Registration
              </h3>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-slate-400 font-bold uppercase text-[10px]">Farm Facility</p>
                  <p className="font-bold text-emerald-400 mt-0.5">{data.farmName}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-bold uppercase text-[10px]">Location</p>
                  <p className="font-bold text-white mt-0.5">{data.provinceDistrict}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-bold uppercase text-[10px]">Village / Commune</p>
                  <p className="font-bold text-white mt-0.5">{data.communeVillage}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-bold uppercase text-[10px]">GPS Coordinates</p>
                  <p className="font-mono text-slate-300 mt-0.5">{data.gpsCoordinates}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-bold uppercase text-[10px]">Registration Date</p>
                  <p className="font-bold text-white mt-0.5">{data.registrationDate}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-bold uppercase text-[10px]">Breeding Record ID</p>
                  <p className="font-mono text-white mt-0.5">{data.breedingRecordId}</p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </main>

      <footer className="mt-12 text-center text-xs text-slate-500 border-t border-slate-900 pt-6">
        <p>© {new Date().getFullYear()} KAKSEDTHAN Livestock Database System. All rights reserved.</p>
      </footer>
    </div>
  );
}
