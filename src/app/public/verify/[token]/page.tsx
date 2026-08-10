import React from 'react';
import { getPublicVerificationAction } from '@/app/actions';
import { Award, CheckCircle, ShieldCheck, Beef, MapPin, Calendar, Heart, QrCode } from 'lucide-react';
import StandardAnimalImage from '@/components/common/StandardAnimalImage';

export const dynamic = 'force-dynamic';

interface PublicVerifyPageProps {
  params: Promise<{ token: string }>;
}

export default async function PublicVerifyPage({ params }: PublicVerifyPageProps) {
  const { token } = await params;
  const res = await getPublicVerificationAction(token);
  const data = res.data;

  if (!res.success || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-md text-center shadow-xl space-y-4">
          <div className="h-16 w-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-black text-slate-900">Record Not Found</h2>
          <p className="text-xs text-slate-500 font-semibold">The scanned QR code or token <span className="font-mono text-slate-700">{token}</span> could not be verified in the Kaksedthan Herdbook Registry.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans p-4 sm:p-6 md:p-10 flex flex-col items-center">
      
      {/* Kaksedthan Header Bar */}
      <header className="w-full max-w-3xl flex items-center justify-between bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm mb-6">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 p-1.5 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-center">
            <img src="/apple-touch-icon.png" alt="Kaksedthan Logo" className="h-full w-full object-contain" />
          </div>
          <div>
            <h1 className="text-base font-black text-slate-900 tracking-wider">KAKSEDTHAN</h1>
            <p className="text-[10px] font-black text-[#dc5c15] uppercase tracking-widest">Public Verification Portal</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-full text-xs font-black">
          <CheckCircle className="h-4 w-4" />
          <span>VERIFIED RECORD</span>
        </div>
      </header>

      {/* Main Verification Card */}
      <main className="w-full max-w-3xl bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        
        {/* Certificate / Registration Number Banner */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-2xl p-6 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-orange-100">HERDBOOK REGISTRATION NO</span>
            <h2 className="text-2xl font-black tracking-tight mt-0.5">{data.registrationNumber}</h2>
            <p className="text-xs text-orange-100 font-semibold mt-1">Official Cambodian Livestock Pedigree</p>
          </div>
          {data.certificate?.number && (
            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 text-right">
              <span className="text-[9px] font-black uppercase text-orange-100">CERTIFICATE NO</span>
              <p className="text-sm font-black">{data.certificate.number}</p>
            </div>
          )}
        </div>

        {/* Animal Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          
          {/* Photo */}
          <div className="aspect-video sm:aspect-square bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 relative">
            <StandardAnimalImage src={data.imageUrl} alt={data.animalName} />
          </div>

          {/* Metadata Specifications */}
          <div className="space-y-3.5">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Animal Name</span>
              <h3 className="text-xl font-black text-slate-900">{data.animalName}</h3>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Breed</span>
                <span className="font-bold text-[#dc5c15]">{data.breed}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Sex</span>
                <span className="font-bold text-slate-800">{data.sex || 'Male'}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Birth Date</span>
                <span className="font-bold text-slate-800">{data.birthDate || '2026-01-15'}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Farm Location</span>
                <span className="font-bold text-slate-800">{data.farmLocation || 'រទាំង'}</span>
              </div>
            </div>

            <div className="bg-orange-50/60 p-3 rounded-xl border border-orange-100 text-xs">
              <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Registered Owner</span>
              <span className="font-black text-slate-900">{data.ownerName || 'Kaksedthan Livestock Farm'}</span>
            </div>
          </div>

        </div>

        {/* Pedigree Parentage Tree */}
        {(data.sireInfo || data.damInfo) && (
          <div className="border-t border-slate-100 pt-6 space-y-4">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
              <Heart className="h-4 w-4 text-[#dc5c15]" />
              Verified Pedigree Lineage
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Sire */}
              {data.sireInfo && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[9px] font-black text-[#dc5c15] uppercase tracking-wider block">SIRE (FATHER)</span>
                    <h5 className="text-sm font-black text-slate-900 mt-1">{data.sireInfo.name}</h5>
                    <p className="text-xs font-bold text-slate-500 mt-0.5">{data.sireInfo.breed}</p>
                    <span className="inline-block mt-1 text-[9px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      ✓ Herdbook Verified
                    </span>
                  </div>
                  <div className="h-14 w-14 rounded-xl overflow-hidden shrink-0">
                    <StandardAnimalImage src={data.sireInfo.imageUrl} alt={data.sireInfo.name} />
                  </div>
                </div>
              )}

              {/* Dam */}
              {data.damInfo && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[9px] font-black text-purple-700 uppercase tracking-wider block">DAM (MOTHER)</span>
                    <h5 className="text-sm font-black text-slate-900 mt-1">{data.damInfo.name}</h5>
                    <p className="text-xs font-bold text-slate-500 mt-0.5">{data.damInfo.breed}</p>
                    <span className="inline-block mt-1 text-[9px] font-black text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                      ✓ Herdbook Verified
                    </span>
                  </div>
                  <div className="h-14 w-14 rounded-xl overflow-hidden shrink-0">
                    <StandardAnimalImage src={data.damInfo.imageUrl} alt={data.damInfo.name} />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Public Footer */}
        <div className="border-t border-slate-100 pt-4 text-center text-[10px] font-semibold text-slate-400">
          <p>© 2026 Kaksedthan Livestock Systems • Official Pedigree & Herdbook Verification</p>
        </div>

      </main>

    </div>
  );
}
