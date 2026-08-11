import React from 'react';
import Link from 'next/link';
import PageHeader from '@/components/common/PageHeader';
import StandardAnimalImage from '@/components/common/StandardAnimalImage';
import { fetchFarmByIdAction, fetchFarmCattleAction } from '@/app/actions';
import FarmAccountToggleClient from '@/components/farms/FarmAccountToggleClient';
import FarmCattleSectionClient from '@/components/farms/FarmCattleSectionClient';
import {
  Building,
  ArrowLeft,
  Edit,
  MapPin,
  Users,
  Beef,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Mail,
  Phone,
  FileText
} from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function FarmDetailPage({ params }: PageProps) {
  const { id } = await params;
  const res = await fetchFarmByIdAction(id);
  const cattleRes = await fetchFarmCattleAction(id);

  if (!res.success || !res.data) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center my-6 max-w-xl mx-auto">
        <Building className="h-12 w-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800">Farm Station Not Found</h3>
        <p className="text-xs text-slate-500 mt-1">No farm station record found for ID: {id}</p>
        <Link href="/farms" className="inline-flex items-center gap-2 bg-[#dc5c15] text-white text-xs font-bold px-4 py-2 rounded-xl mt-4">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Farm Station Register</span>
        </Link>
      </div>
    );
  }

  const farm = res.data;
  const cattleSummary = cattleRes.data?.summary || { total: 0, sires: 0, dams: 0, calves: 0 };
  const cattleList = cattleRes.data?.animals || [];

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* PageHeader (Sire Register UI Standard) */}
      <PageHeader
        title={farm.name}
        subtitle={`Station Code: ${farm.code} • ${farm.farmType || 'General Livestock Station'} • ${farm.province || farm.address || 'N/A'}`}
        breadcrumbs={[
          { label: 'Farm Stations', href: '/farms' },
          { label: farm.name },
        ]}
        backHref="/farms"
        backLabel="Back to Farm Stations"
      >
        <div className="flex items-center gap-2">
          <Link
            href="/farms"
            className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-3.5 py-2 rounded-xl transition-colors"
          >
            <Edit className="h-4 w-4" />
            <span>Edit Farm Station</span>
          </Link>
        </div>
      </PageHeader>

      {/* Top Section Grid (Sire Register UI Standard: 1/3 Image Card + 2/3 Profile Specifications) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column (1/3 width): Standard Image + Status Badge */}
        <div className="md:col-span-1 bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between">
          <StandardAnimalImage
            src={farm.imageUrl}
            alt={farm.name}
            fallbackText="Farm Station"
          />
          <div className="mt-4 text-center">
            <span className={`inline-block text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${
              farm.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
            }`}>
              ● {farm.status}
            </span>
          </div>
        </div>

        {/* Right Column (2/3 width): Profile & Location Specifications */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-3">Farm Station Profile & Location Specifications</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <p className="text-slate-400 font-medium">Station Code</p>
              <p className="font-mono font-bold text-purple-700 mt-0.5">{farm.code}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Farm Type</p>
              <p className="font-bold text-slate-900 mt-0.5">{farm.farmType || 'General Livestock Station'}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Barn Capacity</p>
              <p className="font-bold text-amber-700 mt-0.5">{farm.capacity || 100} Heads</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Province</p>
              <p className="font-bold text-slate-900 mt-0.5">{farm.province || 'N/A'}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">District</p>
              <p className="font-bold text-slate-900 mt-0.5">{farm.district || 'N/A'}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Commune / Village</p>
              <p className="font-bold text-slate-900 mt-0.5">
                {farm.commune ? `${farm.commune}${farm.village ? ' • ' + farm.village : ''}` : (farm.village || 'N/A')}
              </p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Station Phone</p>
              <p className="font-bold text-slate-900 mt-0.5">{farm.phone || farm.ownerPhone || 'N/A'}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Station Email</p>
              <p className="font-bold text-slate-900 mt-0.5">{farm.email || farm.ownerEmail || 'N/A'}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Address</p>
              <p className="font-bold text-slate-900 mt-0.5">{farm.address || 'N/A'}</p>
            </div>
          </div>

          {farm.notes && (
            <div className="pt-2 border-t border-slate-100">
              <p className="text-slate-400 font-medium text-xs">Station Notes & Description</p>
              <p className="text-xs text-slate-700 font-medium mt-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                "{farm.notes}"
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Middle Section Grid (Sire Register UI 3-Card Column Layout) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* 1. Owner & Responsible Person */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Users className="h-4 w-4 text-amber-600" />
              <span>Owner & Responsible Person</span>
            </h3>
          </div>
          <div className="space-y-2 text-xs">
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-slate-400 font-medium">Owner Name</p>
              <p className="font-bold text-slate-900 mt-0.5">{farm.ownerName || 'Bona Owner'}</p>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-slate-400 font-medium">Owner Phone</p>
              <p className="font-bold text-slate-900 mt-0.5">{farm.ownerPhone || farm.phone || 'N/A'}</p>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-slate-400 font-medium">Owner Email</p>
              <p className="font-bold text-slate-900 mt-0.5">{farm.ownerEmail || farm.email || 'N/A'}</p>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-slate-400 font-medium">National ID / Verification</p>
              <p className="font-bold text-slate-900 mt-0.5">{farm.ownerNationalId || 'Verified'}</p>
            </div>
          </div>
        </div>

        {/* 2. Login Account & Security */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-indigo-600" />
              <span>Login Account & Security</span>
            </h3>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              farm.accountStatus === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
            }`}>
              {farm.accountStatus || 'Inactive'}
            </span>
          </div>

          {farm.accountEmail ? (
            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-indigo-50/70 rounded-xl border border-indigo-100">
                <p className="text-indigo-400 font-medium text-[10px] uppercase">Login Email</p>
                <p className="font-black text-indigo-950 mt-0.5 truncate">{farm.accountEmail}</p>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-slate-400 font-medium text-[10px] uppercase">User Level</p>
                <p className="font-bold text-slate-900 mt-0.5">{farm.userLevel || 'Farm Owner Account'}</p>
              </div>
              <FarmAccountToggleClient farmId={farm.id} initialStatus={farm.accountStatus || 'Active'} />
            </div>
          ) : (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center text-xs space-y-1">
              <Lock className="h-6 w-6 text-slate-300 mx-auto" />
              <p className="font-bold text-slate-700">No Login Account</p>
              <p className="text-[11px] text-slate-400">Can be enabled via farm edit form.</p>
            </div>
          )}
        </div>

        {/* 3. Housed Animals Statistics Summary */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Beef className="h-4 w-4 text-purple-600" />
              <span>Livestock Summary</span>
            </h3>
            <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">{cattleSummary.total}</span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
              <span className="text-slate-500 font-medium">Total Cattle Housed:</span>
              <span className="font-black text-slate-900">{cattleSummary.total} heads</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
              <span className="text-slate-500 font-medium">Sires / Dams / Calves:</span>
              <span className="font-bold text-purple-700">{cattleSummary.sires} S • {cattleSummary.dams} D • {cattleSummary.calves} C</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
              <span className="text-slate-500 font-medium">Max Barn Capacity:</span>
              <span className="font-black text-amber-700">{farm.capacity || 100} heads</span>
            </div>
          </div>
        </div>

      </div>

      {/* ── CATTLE MANAGEMENT SECTION (All Cattle: Sire, Dam, Calf tabs) ────────────────── */}
      <FarmCattleSectionClient
        farmName={farm.name}
        summary={cattleSummary}
        animals={cattleList}
      />

    </div>
  );
}
