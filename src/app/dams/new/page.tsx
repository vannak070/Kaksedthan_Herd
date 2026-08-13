'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/common/PageHeader';
import ImageUploadContainer from '@/components/common/ImageUploadContainer';
import { saveDamAction, fetchDamFormOptionsAction } from '@/app/actions';
import { Save, ArrowLeft, Heart, Sparkles, UserCheck, MapPin, ShieldCheck, Activity, Dna } from 'lucide-react';

export default function NewDamPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [activeBreeds, setActiveBreeds] = useState<Array<{ id: string; name: string; code: string }>>([]);
  const [options, setOptions] = useState<{
    userLevels: Array<{ id: string; name: string }>;
    customers: Array<{ id: string; name: string }>;
    breeders: Array<{ id: string; name: string }>;
    farms: Array<{ id: string; name: string; code?: string; location?: string }>;
    sourcingCompanies: Array<{ id: string; name: string; country?: string }>;
  }>({
    userLevels: [],
    customers: [],
    breeders: [],
    farms: [],
    sourcingCompanies: [],
  });

  const [formData, setFormData] = useState<any>(() => ({
    id: `DAM-${Math.floor(100 + Math.random() * 900)}`,
    name: '',
    breed: '',
    breedId: '',
    dob: '',
    fatherId: '',
    motherId: '',
    ownerType: 'Customer / Cow Owner Account',
    ownerId: '',
    ownerName: '',
    farmId: '',
    farmLocation: '',
    imageUrl: '',
    availability: 'Available' as const,
    breedingStatus: 'Open' as const,
    pregnancyStatus: 'Open' as const,
  }));

  React.useEffect(() => {
    fetchDamFormOptionsAction().then((res) => {
      if (res.success && res.data) {
        const breedList = res.data.breeds || [];
        setActiveBreeds(breedList);
        
        const userLevels = res.data.userLevels || [];
        const customers = res.data.customers || [];
        const breeders = res.data.breeders || [];
        const farms = res.data.farms || [];
        const sourcingCompanies = res.data.sourcingCompanies || [];

        setOptions({
          userLevels: userLevels.map((ul: any) => ({ id: String(ul.id), name: String(ul.name) })),
          customers,
          breeders,
          farms,
          sourcingCompanies,
        });

        const defaultBreed = breedList[0];
        const defaultUserLevel = userLevels[0]?.name || 'Customer / Cow Owner Account';
        const defaultCustomer = customers[0];
        const defaultFarm = farms[0];

        setFormData((prev: any) => ({
          ...prev,
          breed: prev.breed || (defaultBreed ? defaultBreed.name : ''),
          breedId: prev.breedId || (defaultBreed ? defaultBreed.id : ''),
          ownerType: prev.ownerType || defaultUserLevel,
          ownerId: prev.ownerId || (defaultCustomer ? defaultCustomer.id : ''),
          ownerName: prev.ownerName || (defaultCustomer ? defaultCustomer.name : ''),
          farmId: prev.farmId || (defaultFarm ? defaultFarm.id : ''),
          farmLocation: prev.farmLocation || (defaultFarm ? defaultFarm.name : ''),
        }));
      }
    });
  }, []);

  const getOwnerTypeCategory = (ownerType: string): 'CUSTOMER' | 'BREEDER' | 'FARM_OWNER' | 'SOURCING_COMPANY' | 'INTERNAL' => {
    const normalized = (ownerType || '').toLowerCase();
    if (normalized.includes('customer') || normalized.includes('cow owner')) return 'CUSTOMER';
    if (normalized.includes('breeder')) return 'BREEDER';
    if (normalized.includes('farm owner') || normalized.includes('station owner')) return 'FARM_OWNER';
    if (normalized.includes('sourcing')) return 'SOURCING_COMPANY';
    return 'INTERNAL';
  };

  const handleOwnerTypeChange = (newType: string) => {
    const cat = getOwnerTypeCategory(newType);
    let newOwnerId = '';
    let newOwnerName = '';

    if (cat === 'CUSTOMER') {
      const first = options.customers[0];
      newOwnerId = first ? first.id : '';
      newOwnerName = first ? first.name : '';
    } else if (cat === 'BREEDER') {
      const first = options.breeders[0];
      newOwnerId = first ? first.id : '';
      newOwnerName = first ? first.name : '';
    } else if (cat === 'FARM_OWNER') {
      const first = options.farms[0];
      newOwnerId = first ? first.id : '';
      newOwnerName = first ? first.name : '';
    } else if (cat === 'SOURCING_COMPANY') {
      const first = options.sourcingCompanies[0];
      newOwnerId = first ? first.id : '';
      newOwnerName = first ? first.name : '';
    } else {
      newOwnerId = 'INTERNAL';
      newOwnerName = 'Kaksedthan Dam Bank';
    }

    setFormData({
      ...formData,
      ownerType: newType,
      ownerId: newOwnerId,
      ownerName: newOwnerName,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.breed) {
      alert('Please fill out the Dam name and breed.');
      return;
    }
    setSubmitting(true);
    try {
      await saveDamAction(formData);
      router.push(`/dams/${formData.id}`);
    } catch (err: any) {
      alert(`Error saving Dam: ${err.message}`);
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <PageHeader
        title="Register New Dam Cow"
        subtitle="Add a new female breeding cow to the Kaksedthan Dam Herdbook database."
        breadcrumbs={[
          { label: 'Dam Register', href: '/dams' },
          { label: 'Register New Dam' },
        ]}
        backHref="/dams"
        backLabel="Back to Dam Register"
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Main Grid: 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: 1:1 Image Upload & Status Summary (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-xl bg-purple-50 flex items-center justify-center text-purple-700">
                    <Heart className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Dam Profile Photo</h3>
                    <p className="text-[10px] text-slate-500">1:1 Square Standardized (1200×1200)</p>
                  </div>
                </div>
                <span className="bg-purple-100 text-purple-800 text-[9px] font-black px-2 py-0.5 rounded-full uppercase">1:1 Standard</span>
              </div>

              <ImageUploadContainer
                value={formData.imageUrl}
                onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                aspectRatio="1:1"
                placeholder="Upload or Capture Dam Photo"
              />

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-600">
                  <span className="text-slate-400 font-medium">System Record:</span>
                  <span className="font-bold text-slate-900">{formData.id}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span className="text-slate-400 font-medium">Herdbook Pass:</span>
                  <span className="font-extrabold text-purple-700 flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5" /> Auto-Verified
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Form Sections (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Section 1: Basic Identity */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <div className="h-8 w-8 rounded-xl bg-purple-50 flex items-center justify-center text-purple-700">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">1. Basic Identity & Registration</h3>
                  <p className="text-[10px] text-slate-500">Official ear tag, name, breed, and birth date.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Dam ID Tag <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    value={formData.id}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-black text-slate-900 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Dam Name / Ear Tag <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Queen Angus 49"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-purple-600 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Breed Lineage (Master Catalog)</label>
                  <select
                    value={formData.breedId || formData.breed}
                    onChange={(e) => {
                      const selectedVal = e.target.value;
                      const found = activeBreeds.find(b => b.id === selectedVal || b.name === selectedVal);
                      setFormData({
                        ...formData,
                        breedId: found ? found.id : selectedVal,
                        breed: found ? found.name : selectedVal,
                      });
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-purple-600 focus:outline-none"
                    required
                  >
                    {activeBreeds.length === 0 ? (
                      <option value="">Loading Breeds from PostgreSQL...</option>
                    ) : (
                      activeBreeds.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name} ({b.code})
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Genetic Pedigree Lineage */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <div className="h-8 w-8 rounded-xl bg-purple-50 flex items-center justify-center text-purple-700">
                  <Dna className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">2. Master Genetic Pedigree</h3>
                  <p className="text-[10px] text-slate-500">Father Sire ID and Mother Dam ID parental lineage.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Father Sire ID <span className="text-slate-400 font-normal">(Optional)</span></label>
                  <input
                    type="text"
                    value={formData.fatherId}
                    onChange={(e) => setFormData({ ...formData, fatherId: e.target.value })}
                    placeholder="e.g. SIR-001"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Mother Dam ID <span className="text-slate-400 font-normal">(Optional)</span></label>
                  <input
                    type="text"
                    value={formData.motherId}
                    onChange={(e) => setFormData({ ...formData, motherId: e.target.value })}
                    placeholder="e.g. DAM-001"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Reproductive & Breeding Status */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <div className="h-8 w-8 rounded-xl bg-pink-50 flex items-center justify-center text-pink-700">
                  <Activity className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Reproductive & Breeding Status</h3>
                  <p className="text-[10px] text-slate-500">Current fertility status, availability, and breeding stage.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Availability Status</label>
                  <select
                    value={formData.availability}
                    onChange={(e) => setFormData({ ...formData, availability: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-black text-slate-900 focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  >
                    <option value="Available">Available (Open Cow)</option>
                    <option value="In Breeding">In Breeding Program</option>
                    <option value="Pregnant">Confirmed Pregnant</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Breeding Cycle Stage</label>
                  <select
                    value={formData.breedingStatus}
                    onChange={(e) => setFormData({ ...formData, breedingStatus: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  >
                    <option value="Open">Open (Ready to Mate)</option>
                    <option value="Inseminated">Inseminated (AI Pending)</option>
                    <option value="Lactating">Lactating Dam</option>
                    <option value="Resting">Resting Period</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 3: Dynamic Polymorphic Ownership & Station Location */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <div className="h-8 w-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700">
                  <UserCheck className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    3. OWNERSHIP & STATION LOCATION SETUP
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    Dynamic Account Ownership (Cow Owner / Breeder / Station) and Physical Farm Location from PostgreSQL setup.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Ownership Type */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Ownership Type <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.ownerType || ''}
                    onChange={(e) => handleOwnerTypeChange(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-black text-slate-900 focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  >
                    {options.userLevels && options.userLevels.length > 0 ? (
                      options.userLevels.map((ul) => (
                        <option key={ul.id} value={ul.name}>
                          {ul.name}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="Customer / Cow Owner Account">Customer / Cow Owner Account</option>
                        <option value="Breeder Account">Breeder Account</option>
                        <option value="Farm Owner Account">Farm Owner Account</option>
                        <option value="Sire Sourcing Company Account">Sire Sourcing Company Account</option>
                        <option value="Admin">Admin (Internal Company)</option>
                      </>
                    )}
                  </select>
                </div>

                {/* Dynamic Owner Entity Selector based on Ownership Type */}
                {(() => {
                  const cat = getOwnerTypeCategory(formData.ownerType || '');
                  if (cat === 'CUSTOMER') {
                    return (
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Select Cow Owner Account <span className="text-rose-500">*</span>
                        </label>
                        <select
                          value={formData.ownerId || ''}
                          onChange={(e) => {
                            const selId = e.target.value;
                            const found = options.customers.find((c) => c.id === selId);
                            setFormData({ ...formData, ownerId: selId, ownerName: found ? found.name : '' });
                          }}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-purple-600 focus:outline-none"
                        >
                          {options.customers.length === 0 ? (
                            <option value="">No Active Cow Owner Accounts Found</option>
                          ) : (
                            options.customers.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))
                          )}
                        </select>
                      </div>
                    );
                  }
                  if (cat === 'BREEDER') {
                    return (
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Select Breeder Account <span className="text-rose-500">*</span>
                        </label>
                        <select
                          value={formData.ownerId || ''}
                          onChange={(e) => {
                            const selId = e.target.value;
                            const found = options.breeders.find((b) => b.id === selId);
                            setFormData({ ...formData, ownerId: selId, ownerName: found ? found.name : '' });
                          }}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-purple-600 focus:outline-none"
                        >
                          {options.breeders.length === 0 ? (
                            <option value="">No Active Breeder Accounts Found</option>
                          ) : (
                            options.breeders.map((b) => (
                              <option key={b.id} value={b.id}>
                                {b.name}
                              </option>
                            ))
                          )}
                        </select>
                      </div>
                    );
                  }
                  if (cat === 'FARM_OWNER') {
                    return (
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Select Farm Owner Account <span className="text-rose-500">*</span>
                        </label>
                        <select
                          value={formData.ownerId || ''}
                          onChange={(e) => {
                            const selId = e.target.value;
                            const found = options.farms.find((f) => f.id === selId);
                            setFormData({ ...formData, ownerId: selId, ownerName: found ? found.name : '' });
                          }}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-purple-600 focus:outline-none"
                        >
                          {options.farms.length === 0 ? (
                            <option value="">No Active Farm Accounts Found</option>
                          ) : (
                            options.farms.map((f) => (
                              <option key={f.id} value={f.id}>
                                {f.name} ({f.code || 'Farm'})
                              </option>
                            ))
                          )}
                        </select>
                      </div>
                    );
                  }
                  if (cat === 'SOURCING_COMPANY') {
                    return (
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Select Sourcing Company Owner <span className="text-rose-500">*</span>
                        </label>
                        <select
                          value={formData.ownerId || ''}
                          onChange={(e) => {
                            const selId = e.target.value;
                            const found = options.sourcingCompanies.find((s) => s.id === selId);
                            setFormData({ ...formData, ownerId: selId, ownerName: found ? found.name : '' });
                          }}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-purple-600 focus:outline-none"
                        >
                          {options.sourcingCompanies.length === 0 ? (
                            <option value="">No Active Sourcing Companies Found</option>
                          ) : (
                            options.sourcingCompanies.map((sc) => (
                              <option key={sc.id} value={sc.id}>
                                {sc.name} ({sc.country || 'Global'})
                              </option>
                            ))
                          )}
                        </select>
                      </div>
                    );
                  }
                  // Default: Internal
                  return (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Select Internal Entity <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.ownerName || 'Kaksedthan Dam Bank'}
                        onChange={(e) => setFormData({ ...formData, ownerName: e.target.value, ownerId: 'INTERNAL' })}
                        className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800"
                      />
                    </div>
                  );
                })()}

                {/* Physical Farm Station Location Selector */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Physical Farm Station Location <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.farmId || ''}
                    onChange={(e) => {
                      const selId = e.target.value;
                      const found = options.farms.find((f) => f.id === selId);
                      setFormData({
                        ...formData,
                        farmId: selId,
                        farmLocation: found ? found.name : '',
                      });
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  >
                    {options.farms.length === 0 ? (
                      <option value="">No Active Farm Stations Found in PostgreSQL</option>
                    ) : (
                      options.farms.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name} ({f.location || 'Station Location'})
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>
            </div>

            {/* Form Actions Footer Toolbar */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => router.push('/dams')}
                className="px-5 py-3 rounded-2xl border border-slate-200 text-xs font-extrabold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 bg-purple-700 hover:bg-purple-800 text-white text-xs font-black px-7 py-3 rounded-2xl shadow-lg shadow-purple-700/20 transition-all cursor-pointer disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                <span>{submitting ? 'Registering Dam...' : 'Save & Register Dam'}</span>
              </button>
            </div>

          </div>

        </div>

      </form>
    </div>
  );
}
