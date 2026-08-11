import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import PageHeader from '@/components/common/PageHeader';
import StandardAnimalImage from '@/components/common/StandardAnimalImage';
import FarmCattleSectionClient from '@/components/farms/FarmCattleSectionClient';
import {
  fetchCustomerByIdAction,
  fetchCustomerAnimalsAction,
  fetchCustomerBreedingProgramsAction,
  fetchCustomerCertificatesAction
} from '@/app/actions';
import {
  Users,
  ArrowLeft,
  Edit,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Beef,
  Heart,
  FileText,
  Award,
  Calendar,
  UserCheck,
  CheckCircle2,
  Lock,
  Clock
} from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CustomerDetailPage({ params }: PageProps) {
  const { id } = await params;

  // Fetch customer details
  const custRes = await fetchCustomerByIdAction(id);
  if (!custRes.success || !custRes.data) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center my-6 max-w-xl mx-auto">
        <Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800">Customer Record Not Found</h3>
        <p className="text-xs text-slate-500 mt-1">No customer record found for ID: {id}</p>
        <Link href="/customers" className="inline-flex items-center gap-2 bg-[#dc5c15] text-white text-xs font-bold px-4 py-2 rounded-xl mt-4">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Customers List</span>
        </Link>
      </div>
    );
  }

  const customer = custRes.data;

  // Fetch related cattle & records in parallel
  const [animalsRes, programsRes, certsRes] = await Promise.all([
    fetchCustomerAnimalsAction(id),
    fetchCustomerBreedingProgramsAction(id),
    fetchCustomerCertificatesAction(id)
  ]);

  const rawAnimals = (animalsRes.success && Array.isArray(animalsRes.data)) ? animalsRes.data : [];
  const breedingPrograms = (programsRes.success && Array.isArray(programsRes.data)) ? programsRes.data : [];
  const certificates = (certsRes.success && Array.isArray(certsRes.data)) ? certsRes.data : [];

  // Format animals for FarmCattleSectionClient
  const formattedAnimals = rawAnimals.map((a: any) => ({
    category: (a.animal_type || a.category || 'Dam') as 'Sire' | 'Dam' | 'Calf',
    id: a.id,
    name: a.name || a.id,
    breed: a.breed || 'Brahman',
    sex: a.sex || (a.animal_type === 'Dam' ? 'Female' : 'Male'),
    status: a.status || 'Active',
    ownerName: customer.name,
    farmLocation: customer.address || customer.farmLocation || 'N/A',
    imageUrl: a.image_url || a.imageUrl,
    dob: a.dob,
    createdAt: a.created_at
  }));

  const siresCount = formattedAnimals.filter(a => a.category === 'Sire').length;
  const damsCount = formattedAnimals.filter(a => a.category === 'Dam').length;
  const calvesCount = formattedAnimals.filter(a => a.category === 'Calf').length;

  const cattleSummary = {
    total: formattedAnimals.length,
    sires: siresCount,
    dams: damsCount,
    calves: calvesCount
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* PageHeader (Sire Register / Farm Station UI Standard) */}
      <PageHeader
        title={customer.name}
        subtitle={`Customer Code: ${customer.code || customer.id} • Type: ${customer.customerType || 'Individual Owner'} • Phone: ${customer.phone || 'N/A'}`}
        breadcrumbs={[
          { label: 'Customers', href: '/customers' },
          { label: customer.name },
        ]}
        backHref="/customers"
        backLabel="Back to Customers"
      >
        <div className="flex items-center gap-2">
          <Link
            href="/customers"
            className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-3.5 py-2 rounded-xl transition-colors"
          >
            <Edit className="h-4 w-4" />
            <span>Edit Customer</span>
          </Link>
        </div>
      </PageHeader>

      {/* Top Section Grid (Sire Register / Farm Station UI Standard: 1/3 Image Card + 2/3 Profile Specifications) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column (1/3 width): Standard Image + Status Badge */}
        <div className="md:col-span-1 bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between">
          <StandardAnimalImage
            src={customer.imageUrl}
            alt={customer.name}
            fallbackText="Cow Owner Profile"
          />
          <div className="mt-4 text-center">
            <span className={`inline-block text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${
              customer.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
            }`}>
              ● {customer.status}
            </span>
          </div>
        </div>

        {/* Right Column (2/3 width): Customer Profile Specifications */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-3">Customer / Cow Owner Specifications</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <p className="text-slate-400 font-medium">Customer Code</p>
              <p className="font-mono font-bold text-purple-700 mt-0.5">{customer.code || customer.id}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Customer Type</p>
              <p className="font-bold text-slate-900 mt-0.5">{customer.customerType || 'Individual Owner'}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Phone Number</p>
              <p className="font-bold text-slate-900 mt-0.5">{customer.phone || 'N/A'}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Contact Email</p>
              <p className="font-bold text-slate-900 mt-0.5">{customer.email || 'N/A'}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Province</p>
              <p className="font-bold text-slate-900 mt-0.5">{customer.province || 'N/A'}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">District / Commune</p>
              <p className="font-bold text-slate-900 mt-0.5">
                {customer.district ? `${customer.district}${customer.commune ? ' • ' + customer.commune : ''}` : (customer.commune || 'N/A')}
              </p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Owned Cattle</p>
              <p className="font-bold text-amber-700 mt-0.5">{formattedAnimals.length} Heads</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Managed By Breeder</p>
              <p className="font-bold text-slate-900 mt-0.5">{customer.managedByBreederName || 'System Breeder'}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Login Access</p>
              <p className="font-bold text-slate-500 mt-0.5">No Login Account</p>
            </div>
          </div>

          {customer.notes && (
            <div className="pt-2 border-t border-slate-100">
              <p className="text-slate-400 font-medium text-xs">Customer Notes</p>
              <p className="text-xs text-slate-700 font-medium mt-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                "{customer.notes}"
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Middle Section Grid (Sire Register / Farm Station UI 3-Card Column Layout) */}
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
              <p className="font-bold text-slate-900 mt-0.5">{customer.phone || 'N/A'}</p>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-slate-400 font-medium">Contact Email (Contact Only)</p>
              <p className="font-bold text-slate-900 mt-0.5">{customer.email || 'N/A'}</p>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-slate-400 font-medium">Full Address</p>
              <p className="font-bold text-slate-900 mt-0.5">{customer.address || customer.farmLocation || 'N/A'}</p>
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
              customer.idVerificationStatus === 'Verified' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
            }`}>
              {customer.idVerificationStatus || 'Verified'}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-slate-400 font-medium">National ID Number</p>
              <p className="font-mono font-bold text-slate-900 mt-0.5">{customer.nationalId || 'Verified Record'}</p>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-slate-400 font-medium">Verification Status</p>
              <p className="font-bold text-emerald-700 mt-0.5">{customer.idVerificationStatus || 'Verified'}</p>
            </div>
          </div>
        </div>

        {/* 3. Managed By Breeder & Ownership Summary */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Users className="h-4 w-4 text-amber-600" />
              <span>Breeder Management</span>
            </h3>
          </div>
          <div className="space-y-2 text-xs">
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-slate-400 font-medium">Managing Breeder</p>
              <p className="font-bold text-slate-900 mt-0.5">{customer.managedByBreederName || 'System Breeder'}</p>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
              <span className="text-slate-500 font-medium">Owned Cattle:</span>
              <span className="font-black text-amber-700">{formattedAnimals.length} heads</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
              <span className="text-slate-500 font-medium">Breeding Programs:</span>
              <span className="font-bold text-purple-700">{breedingPrograms.length}</span>
            </div>
          </div>
        </div>

      </div>

      {/* ── CATTLE MANAGEMENT SECTION (All Cattle owned by Customer: Sires, Dams, Calves) ────────────────── */}
      <FarmCattleSectionClient
        farmName={customer.name}
        summary={cattleSummary}
        animals={formattedAnimals}
      />

    </div>
  );
}
