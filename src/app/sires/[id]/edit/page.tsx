'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/common/PageHeader';
import ImageUploadContainer from '@/components/common/ImageUploadContainer';
import { fetchSiresAction, saveSireAction, fetchSireFormOptionsAction } from '@/app/actions';
import { SireItem } from '@/types/breeding.types';
import { Save, ArrowLeft, Beef, Dna, MapPin, Building2, ShieldCheck, Sparkles, UserCheck } from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditSirePage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Dynamic Options from PostgreSQL Setup
  const [options, setOptions] = useState<{
    breeds: Array<{ id: string; name: string; code: string }>;
    sourcingCompanies: Array<{ id: string; name: string; code?: string; country?: string }>;
    farms: Array<{ id: string; name: string; code?: string; location?: string }>;
    breeders: Array<{ id: string; name: string; code?: string }>;
    customers: Array<{ id: string; name: string; code?: string }>;
    userLevels: Array<{ id: string; code: string; name: string; level_type?: string }>;
  }>({
    breeds: [],
    sourcingCompanies: [],
    farms: [],
    breeders: [],
    customers: [],
    userLevels: [],
  });

  const getOwnerTypeCategory = (typeStr: string) => {
    const s = (typeStr || '').toLowerCase();
    if (s.includes('sourcing') || s.includes('sire_sourcing')) return 'SOURCING_COMPANY';
    if (s.includes('breeder')) return 'BREEDER';
    if (s.includes('customer') || s.includes('cow_owner') || s.includes('cow owner')) return 'CUSTOMER';
    if (s.includes('farm')) return 'FARM';
    if (s.includes('admin') || s.includes('internal')) return 'INTERNAL';
    return 'FARM';
  };

  const [formData, setFormData] = useState<any>({
    id: id,
    name: '',
    registrationNumber: '',
    breed: '',
    breedId: '',
    dob: '',
    bloodline: '',

    // Section 2: Genetics Source
    sourcingCompanyId: '',
    sourcingCompany: '',
    sourcingCompanyCountry: '',
    fatherId: '',
    motherId: '',

    // Section 3: Ownership
    ownerType: 'Sire Sourcing Company Account',
    ownerId: '',
    ownerName: '',
    ownershipStatus: 'Active',
    ownershipStartDate: '',

    // Section 4: Station Location
    farmId: '',
    farmLocation: '',

    imageUrl: '',
    status: 'Active' as const,
  });

  useEffect(() => {
    Promise.all([
      fetchSireFormOptionsAction(),
      fetchSiresAction(),
    ]).then(([optsRes, siresRes]) => {
      let loadedBreeds: Array<{ id: string; name: string; code: string }> = [];
      if (optsRes.success && optsRes.data) {
        setOptions(optsRes.data as any);
        loadedBreeds = optsRes.data.breeds || [];
      }

      const found = siresRes.find((s) => s.id === id);
      if (found) {
        let resolvedBreedId = found.breedId || '';
        let resolvedBreedName = found.breed || '';

        // If breedId is missing, resolve it from loadedBreeds
        if (!resolvedBreedId && resolvedBreedName && loadedBreeds.length > 0) {
          const match = loadedBreeds.find(b => b.name === resolvedBreedName || b.code === resolvedBreedName);
          if (match) {
            resolvedBreedId = match.id;
            resolvedBreedName = match.name;
          }
        }

        setFormData({
          id: found.id,
          name: found.name,
          registrationNumber: found.registrationNumber || '',
          breed: resolvedBreedName,
          breedId: resolvedBreedId,
          dob: found.dob || '',
          bloodline: found.bloodline || '',
          sourcingCompany: found.sourcingCompany || '',
          sourcingCompanyId: found.sourcingCompanyId || '',
          sourcingCompanyCountry: found.sourcingCompanyCountry || '',
          fatherId: found.fatherId || '',
          motherId: found.motherId || '',
          imageUrl: found.imageUrl || '',
          ownerType: found.ownerType || 'Sire Sourcing Company Account',
          ownerId: found.ownerId || '',
          ownerName: found.ownerName || '',
          farmId: found.farmId || '',
          farmLocation: found.farmLocation || '',
          ownershipStatus: found.ownershipStatus || 'Active',
          ownershipStartDate: found.ownershipStartDate || '',
          status: found.status as SireItem['status'],
        });
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const [showAdvancedOwnership, setShowAdvancedOwnership] = useState<boolean>(false);

  const handleSourcingCompanySelect = (companyId: string) => {
    const foundSc = options.sourcingCompanies.find((c) => c.id === companyId);
    if (!foundSc) return;

    // Smart Relational Cascading: check database options for linked farm/customer entities
    const matchingFarm = options.farms.find((f) => 
      f.name.toLowerCase().includes(foundSc.name.toLowerCase()) || 
      foundSc.name.toLowerCase().includes(f.name.toLowerCase())
    );
    const matchingCustomer = options.customers.find((c) => 
      c.name.toLowerCase().includes(foundSc.name.toLowerCase())
    );

    let defaultOwnerType = 'Sire Sourcing Company Account';
    let defaultOwnerId = foundSc.id;
    let defaultOwnerName = foundSc.name;

    if (matchingCustomer) {
      defaultOwnerType = 'Customer / Cow Owner Account';
      defaultOwnerId = matchingCustomer.id;
      defaultOwnerName = matchingCustomer.name;
    } else if (matchingFarm) {
      defaultOwnerType = 'Farm Owner Account';
      defaultOwnerId = matchingFarm.id;
      defaultOwnerName = matchingFarm.name;
    }

    const assignedFarm = matchingFarm || options.farms[0];

    setFormData((prev: any) => ({
      ...prev,
      sourcingCompanyId: companyId,
      sourcingCompany: foundSc.name,
      sourcingCompanyCountry: foundSc.country || '',
      ownerType: defaultOwnerType,
      ownerId: defaultOwnerId,
      ownerName: defaultOwnerName,
      farmId: assignedFarm ? assignedFarm.id : prev.farmId,
      farmLocation: assignedFarm ? assignedFarm.name : prev.farmLocation,
    }));
  };

  const handleOwnerTypeChange = (newOwnerType: string) => {
    const cat = getOwnerTypeCategory(newOwnerType);
    let defaultId = '';
    let defaultName = '';

    if (cat === 'SOURCING_COMPANY' && options.sourcingCompanies.length > 0) {
      defaultId = options.sourcingCompanies[0].id;
      defaultName = options.sourcingCompanies[0].name;
    } else if (cat === 'BREEDER' && options.breeders.length > 0) {
      defaultId = options.breeders[0].id;
      defaultName = options.breeders[0].name;
    } else if (cat === 'CUSTOMER' && options.customers.length > 0) {
      defaultId = options.customers[0].id;
      defaultName = options.customers[0].name;
    } else if (cat === 'FARM' && options.farms.length > 0) {
      defaultId = options.farms[0].id;
      defaultName = options.farms[0].name;
    } else if (cat === 'INTERNAL') {
      defaultId = 'INTERNAL';
      defaultName = 'Kaksedthan Sire Bank';
    }

    setFormData((prev: any) => ({
      ...prev,
      ownerType: newOwnerType,
      ownerId: defaultId,
      ownerName: defaultName,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await saveSireAction(formData);
      router.push(`/sires/${id}`);
    } catch (err: any) {
      alert(`Error updating Sire: ${err.message}`);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin h-8 w-8 border-4 border-[#dc5c15] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <PageHeader
        title={`Edit Sire Profile: ${formData.name || id}`}
        subtitle="Update Sire biological traits, Master Breed, Genetics Provider, Ownership Entity, and Station Location."
        breadcrumbs={[
          { label: 'Sire Register', href: '/sires' },
          { label: formData.name || id, href: `/sires/${id}` },
          { label: 'Edit Sire' },
        ]}
        backHref={`/sires/${id}`}
        backLabel="Back to Sire Profile"
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Photo & Record Info (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-xl bg-orange-50 flex items-center justify-center text-[#dc5c15]">
                    <Beef className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Sire Photo Standard</h3>
                    <p className="text-[10px] text-slate-500">1:1 Square (1200×1200)</p>
                  </div>
                </div>
                <span className="bg-orange-100 text-[#dc5c15] text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                  Square 1:1
                </span>
              </div>

              <ImageUploadContainer
                value={formData.imageUrl}
                onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                aspectRatio="1:1"
                placeholder="Upload or Update Sire Photo"
              />

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2.5 text-xs">
                <div className="flex justify-between items-center text-slate-600">
                  <span className="text-slate-400 font-medium">Sire ID Tag:</span>
                  <span className="font-mono font-black text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                    {formData.id}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span className="text-slate-400 font-medium">Master Breed:</span>
                  <span className="font-bold text-[#dc5c15]">{formData.breed || 'None'}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span className="text-slate-400 font-medium">Ownership:</span>
                  <span className="font-bold text-slate-800 truncate max-w-[140px]">{formData.ownerName || 'None'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic Form Sections (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Section 1: Sire Identity */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <div className="h-8 w-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    SECTION 1 — Sire Identity & Master Breed
                  </h3>
                  <p className="text-[10px] text-slate-500">Official title, tag code, birth date, and master breed lineup.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Sire ID Tag</label>
                  <input
                    type="text"
                    value={formData.id}
                    readOnly
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-black font-mono text-slate-500 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Sire Name / Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#dc5c15] focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Master Breed <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.breedId}
                    onChange={(e) => {
                      const selVal = e.target.value;
                      const found = options.breeds.find((b) => b.id === selVal);
                      if (found) {
                        setFormData({
                          ...formData,
                          breedId: found.id,
                          breed: found.name,
                        });
                      } else {
                        setFormData({
                          ...formData,
                          breedId: selVal,
                        });
                      }
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#dc5c15] focus:outline-none"
                    required
                  >
                    {/* Include historical breed if inactive */}
                    {formData.breed && !options.breeds.some(b => b.name === formData.breed || b.id === formData.breedId) && (
                      <option value={formData.breedId || formData.breed}>
                        {formData.breed} (Historical / Inactive)
                      </option>
                    )}
                    {options.breeds.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Official Registration Number</label>
                  <input
                    type="text"
                    value={formData.registrationNumber}
                    onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#dc5c15] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#dc5c15] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Bloodline / Lineage Trait</label>
                  <input
                    type="text"
                    value={formData.bloodline}
                    onChange={(e) => setFormData({ ...formData, bloodline: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#dc5c15] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Unified Sourcing, Ownership & Location Setup */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <div className="h-8 w-8 rounded-xl bg-purple-50 flex items-center justify-center text-purple-700">
                  <Building2 className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    SECTION 2 — SOURCING, OWNERSHIP & LOCATION SETUP
                  </h3>
                  <p className="text-[10px] text-slate-500 font-medium">
                    Selecting the Genetics Provider Sourcing Company automatically resolves related Ownership & Farm Station settings.
                  </p>
                </div>
              </div>

              {/* 1. Genetics Provider Sourcing Company (Primary Cascading Selector) */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                    <span>Select Genetics Provider Sourcing Company <span className="text-rose-500">*</span></span>
                    <span className="text-[10px] font-extrabold text-purple-700">Auto-populates setup relations</span>
                  </label>
                  <select
                    value={formData.sourcingCompanyId}
                    onChange={(e) => handleSourcingCompanySelect(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#dc5c15] focus:outline-none"
                  >
                    {formData.sourcingCompany && !options.sourcingCompanies.some(sc => sc.id === formData.sourcingCompanyId || sc.name === formData.sourcingCompany) && (
                      <option value={formData.sourcingCompanyId || formData.sourcingCompany}>
                        {formData.sourcingCompany} (Historical / Inactive)
                      </option>
                    )}
                    {options.sourcingCompanies.map((sc) => (
                      <option key={sc.id} value={sc.id}>
                        {sc.name} ({sc.country || 'Global Supplier'})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Relational Summary & Auto-Populated Link Banner */}
                <div className="p-4 bg-gradient-to-r from-purple-50 to-slate-50 rounded-2xl border border-purple-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-purple-600" /> Dynamic Relational Relationship Setup
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowAdvancedOwnership(!showAdvancedOwnership)}
                      className="text-[10px] font-black text-purple-700 hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <span>{showAdvancedOwnership ? 'Hide Advanced Settings' : '✏️ Edit Ownership & Farm Location'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-slate-700 font-semibold pt-1">
                    <div className="bg-white/80 p-2.5 rounded-xl border border-slate-200/60">
                      <span className="text-[9px] font-black text-slate-400 uppercase block">GENETICS SUPPLIER</span>
                      <span className="font-bold text-slate-900">{formData.sourcingCompany || 'Not Selected'}</span>
                    </div>

                    <div className="bg-white/80 p-2.5 rounded-xl border border-slate-200/60">
                      <span className="text-[9px] font-black text-slate-400 uppercase block">SIRE OWNER ({formData.ownerType || 'Owner'})</span>
                      <span className="font-bold text-purple-900">{formData.ownerName || 'Not Selected'}</span>
                    </div>

                    <div className="bg-white/80 p-2.5 rounded-xl border border-slate-200/60">
                      <span className="text-[9px] font-black text-slate-400 uppercase block">PHYSICAL FARM STATION</span>
                      <span className="font-bold text-slate-900">{formData.farmLocation || 'Central Station'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Parent Lineage */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Father Sire ID (Optional)</label>
                  <input
                    type="text"
                    value={formData.fatherId}
                    onChange={(e) => setFormData({ ...formData, fatherId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#dc5c15] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Mother Dam ID (Optional)</label>
                  <input
                    type="text"
                    value={formData.motherId}
                    onChange={(e) => setFormData({ ...formData, motherId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#dc5c15] focus:outline-none"
                  />
                </div>
              </div>

              {/* 3. Advanced Customization Block (Optional Override) */}
              {showAdvancedOwnership && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-3 border-t border-slate-100 bg-slate-50/50 p-4 rounded-2xl">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Ownership Type <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.ownerType}
                      onChange={(e) => handleOwnerTypeChange(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-black text-slate-900 focus:ring-2 focus:ring-[#dc5c15] focus:outline-none"
                    >
                      {options.userLevels && options.userLevels.length > 0 ? (
                        options.userLevels.map((ul) => (
                          <option key={ul.id} value={ul.name}>
                            {ul.name}
                          </option>
                        ))
                      ) : (
                        <>
                          <option value="Sire Sourcing Company Account">Sire Sourcing Company Account</option>
                          <option value="Breeder Account">Breeder Account</option>
                          <option value="Farm Owner Account">Farm Owner Account</option>
                          <option value="Customer / Cow Owner Account">Customer / Cow Owner Account</option>
                        </>
                      )}
                    </select>
                  </div>

                  {(() => {
                    const cat = getOwnerTypeCategory(formData.ownerType);
                    if (cat === 'SOURCING_COMPANY') {
                      return (
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            Select Sire Sourcing Company Owner <span className="text-rose-500">*</span>
                          </label>
                          <select
                            value={formData.ownerId}
                            onChange={(e) => {
                              const selId = e.target.value;
                              const foundName = options.sourcingCompanies.find((s) => s.id === selId)?.name || '';
                              setFormData({ ...formData, ownerId: selId, ownerName: foundName });
                            }}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#dc5c15] focus:outline-none"
                          >
                            {options.sourcingCompanies.map((sc) => (
                              <option key={sc.id} value={sc.id}>
                                {sc.name} ({sc.country || 'International'})
                              </option>
                            ))}
                          </select>
                        </div>
                      );
                    }
                    if (cat === 'BREEDER') {
                      return (
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            Select Breeder Account Owner <span className="text-rose-500">*</span>
                          </label>
                          <select
                            value={formData.ownerId}
                            onChange={(e) => {
                              const selId = e.target.value;
                              const foundName = options.breeders.find((b) => b.id === selId)?.name || '';
                              setFormData({ ...formData, ownerId: selId, ownerName: foundName });
                            }}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#dc5c15] focus:outline-none"
                          >
                            {options.breeders.map((b) => (
                              <option key={b.id} value={b.id}>
                                {b.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      );
                    }
                    if (cat === 'CUSTOMER') {
                      return (
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            Select Customer / Cow Owner <span className="text-rose-500">*</span>
                          </label>
                          <select
                            value={formData.ownerId}
                            onChange={(e) => {
                              const selId = e.target.value;
                              const foundName = options.customers.find((c) => c.id === selId)?.name || '';
                              setFormData({ ...formData, ownerId: selId, ownerName: foundName });
                            }}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#dc5c15] focus:outline-none"
                          >
                            {options.customers.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      );
                    }
                    return (
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Select Farm Station Owner <span className="text-rose-500">*</span>
                        </label>
                        <select
                          value={formData.ownerId}
                          onChange={(e) => {
                            const selId = e.target.value;
                            const foundName = options.farms.find((f) => f.id === selId)?.name || '';
                            setFormData({ ...formData, ownerId: selId, ownerName: foundName });
                          }}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#dc5c15] focus:outline-none"
                        >
                          {options.farms.map((f) => (
                            <option key={f.id} value={f.id}>
                              {f.name} ({f.code || 'Farm'})
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  })()}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Physical Farm Station Location
                    </label>
                    <select
                      value={formData.farmId}
                      onChange={(e) => {
                        const selId = e.target.value;
                        const found = options.farms.find((f) => f.id === selId);
                        setFormData({
                          ...formData,
                          farmId: selId,
                          farmLocation: found ? found.name : '',
                        });
                      }}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#dc5c15] focus:outline-none"
                    >
                      {options.farms.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name} ({f.code || f.id})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Sire Account Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#dc5c15] focus:outline-none"
                    >
                      <option value="Active">Active (In Service)</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Archived">Archived</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Form Actions Footer Toolbar */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => router.push(`/sires/${id}`)}
                className="px-5 py-3 rounded-2xl border border-slate-200 text-xs font-extrabold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 bg-[#dc5c15] hover:bg-[#c44f0e] text-white text-xs font-black px-7 py-3 rounded-2xl shadow-lg shadow-[#dc5c15]/20 transition-all cursor-pointer disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                <span>{submitting ? 'Updating...' : 'Save & Update Sire'}</span>
              </button>
            </div>

          </div>
        </div>
      </form>
    </div>
  );
}
