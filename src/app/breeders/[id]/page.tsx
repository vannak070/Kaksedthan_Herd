import React from 'react';
import Link from 'next/link';
import PageHeader from '@/components/common/PageHeader';
import StandardAnimalImage from '@/components/common/StandardAnimalImage';
import { fetchBreederByIdAction, fetchCustomersAction, toggleBreederAccountStatusAction } from '@/app/actions';
import FarmAccountToggleClient from '@/components/farms/FarmAccountToggleClient';
import {
  Users,
  ArrowLeft,
  Edit,
  MapPin,
  Beef,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Mail,
  Phone,
  Heart,
  Calendar,
  UserCheck,
  ChevronRight
} from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function BreederDetailPage({ params }: PageProps) {
  const { id } = await params;
  const bRes = await fetchBreederByIdAction(id);

  if (!bRes.success || !bRes.data) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center my-6 max-w-xl mx-auto">
        <Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800">Breeder Account Not Found</h3>
        <p className="text-xs text-slate-500 mt-1">No breeder record found for ID: {id}</p>
        <Link href="/breeders" className="inline-flex items-center gap-2 bg-[#dc5c15] text-white text-xs font-bold px-4 py-2 rounded-xl mt-4">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Breeder Accounts</span>
        </Link>
      </div>
    );
  }

  const breeder = bRes.data;

  // Fetch customers managed by this breeder
  const cRes = await fetchCustomersAction(breeder.id);
  const managedCustomers = (cRes.success && Array.isArray(cRes.data)) ? cRes.data : [];

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* PageHeader (Sire Register / Farm Station UI Standard) */}
      <PageHeader
        title={breeder.name}
        subtitle={`Breeder Code: ${breeder.code} • ${breeder.userLevel || 'Professional Breeder Account'} • ${breeder.province || breeder.address || 'N/A'}`}
        breadcrumbs={[
          { label: 'Breeders', href: '/breeders' },
          { label: breeder.name },
        ]}
        backHref="/breeders"
        backLabel="Back to Breeders"
      >
        <div className="flex items-center gap-2">
          <Link
            href={`/breeders?edit=${breeder.id}`}
            className="inline-flex items-center gap-1.5 bg-[#dc5c15] hover:bg-[#c44f0e] text-white text-xs font-black px-4 py-2 rounded-xl transition-all shadow-md shadow-[#dc5c15]/20 cursor-pointer"
          >
            <Edit className="h-4 w-4" />
            <span>Edit Breeder Account</span>
          </Link>
        </div>
      </PageHeader>

      {/* Top Section Grid (Sire Register UI Standard: 1/3 Image Card + 2/3 Profile Specifications) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column (1/3 width): Standard Image + Status Badge */}
        <div className="md:col-span-1 bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between">
          <StandardAnimalImage
            src={breeder.imageUrl}
            alt={breeder.name}
            fallbackText="Breeder Profile"
          />
          <div className="mt-4 text-center">
            <span className={`inline-block text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${
              breeder.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
            }`}>
              ● {breeder.status}
            </span>
          </div>
        </div>

        {/* Right Column (2/3 width): Profile & Location Specifications */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-3">Breeder Profile & User Account Specifications</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <p className="text-slate-400 font-medium">Breeder Code</p>
              <p className="font-mono font-bold text-purple-700 mt-0.5">{breeder.code}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">User Level</p>
              <p className="font-bold text-slate-900 mt-0.5">{breeder.userLevel || 'Professional Breeder'}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Contact Phone</p>
              <p className="font-bold text-slate-900 mt-0.5">{breeder.phone || 'N/A'}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Contact Email</p>
              <p className="font-bold text-slate-900 mt-0.5">{breeder.email || 'N/A'}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Province</p>
              <p className="font-bold text-slate-900 mt-0.5">{breeder.province || 'N/A'}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">District / Commune</p>
              <p className="font-bold text-slate-900 mt-0.5">
                {breeder.district ? `${breeder.district}${breeder.commune ? ' • ' + breeder.commune : ''}` : (breeder.commune || 'N/A')}
              </p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Managed Clients</p>
              <p className="font-bold text-amber-700 mt-0.5">{managedCustomers.length} Customers</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">User Account Type</p>
              <p className="font-black text-indigo-700 mt-0.5">Breeder User Account</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Login Identity</p>
              <p className="font-bold text-slate-800 mt-0.5">{breeder.accountEmail || breeder.email || 'None'}</p>
            </div>
          </div>

          {breeder.notes && (
            <div className="pt-2 border-t border-slate-100">
              <p className="text-slate-400 font-medium text-xs">Breeder Notes & Bio</p>
              <p className="text-xs text-slate-700 font-medium mt-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                "{breeder.notes}"
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Middle Section Grid (Sire Register UI 3-Card Column Layout) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* 1. Location & Contact Details */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-purple-600" />
              <span>Location & Contact</span>
            </h3>
          </div>
          <div className="space-y-2 text-xs">
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-slate-400 font-medium">Phone</p>
              <p className="font-bold text-slate-900 mt-0.5">{breeder.phone || 'N/A'}</p>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-slate-400 font-medium">Email</p>
              <p className="font-bold text-slate-900 mt-0.5">{breeder.email || 'N/A'}</p>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-slate-400 font-medium">Full Address</p>
              <p className="font-bold text-slate-900 mt-0.5">{breeder.address || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* 2. Identification & Verification */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-indigo-600" />
              <span>Identification & Verification</span>
            </h3>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              breeder.idVerificationStatus === 'Verified' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
            }`}>
              {breeder.idVerificationStatus || 'Verified'}
            </span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-slate-400 font-medium">National ID Number</p>
              <p className="font-mono font-bold text-slate-900 mt-0.5">{breeder.nationalId || 'Verified Record'}</p>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-slate-400 font-medium">Verification Status</p>
              <p className="font-bold text-emerald-700 mt-0.5">{breeder.idVerificationStatus || 'Verified'}</p>
            </div>
          </div>
        </div>

        {/* 3. Authenticated User Account & Security */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Lock className="h-4 w-4 text-indigo-600" />
              <span>Login Account & Security</span>
            </h3>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              breeder.accountStatus === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
            }`}>
              {breeder.accountStatus || 'Inactive'}
            </span>
          </div>

          {breeder.accountEmail ? (
            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-indigo-50/70 rounded-xl border border-indigo-100">
                <p className="text-indigo-400 font-medium text-[10px] uppercase">Login Email</p>
                <p className="font-black text-indigo-950 mt-0.5 truncate">{breeder.accountEmail}</p>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-slate-400 font-medium text-[10px] uppercase">Assigned User Level</p>
                <p className="font-bold text-slate-900 mt-0.5">{breeder.userLevel || 'Professional Breeder Account'}</p>
              </div>
              <FarmAccountToggleClient farmId={breeder.id} initialStatus={breeder.accountStatus || 'Active'} />
            </div>
          ) : (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center text-xs space-y-1">
              <Lock className="h-6 w-6 text-slate-300 mx-auto" />
              <p className="font-bold text-slate-700">No Login Account Enabled</p>
              <p className="text-[11px] text-slate-400">Can be enabled via admin edit form.</p>
            </div>
          )}
        </div>

      </div>

      {/* ── MANAGED CUSTOMERS SECTION ────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <Users className="h-4 w-4 text-purple-600" />
            <span>Managed Customers & Cow Owners ({managedCustomers.length})</span>
          </h3>
        </div>

        {managedCustomers.length === 0 ? (
          <div className="p-8 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-2">
            <Users className="h-10 w-10 text-slate-300 mx-auto" />
            <p className="font-bold text-xs text-slate-700">No Managed Customers</p>
            <p className="text-[11px] text-slate-500">No customer records are currently assigned to {breeder.name}.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {managedCustomers.map((cust: any) => (
              <Link
                key={cust.id}
                href={`/customers/${cust.id}`}
                className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 hover:border-purple-500 transition-all flex items-center justify-between group"
              >
                <div>
                  <h4 className="font-black text-slate-900 text-xs group-hover:text-purple-600 transition-colors">
                    {cust.name}
                  </h4>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">{cust.id} • {cust.phone || 'No phone'}</p>
                </div>
                <span className="text-xs font-bold text-purple-600 flex items-center gap-1">
                  <span>View</span>
                  <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
