'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/common/PageHeader';
import ImageUploadContainer from '@/components/common/ImageUploadContainer';
import { saveDamAction } from '@/app/actions';
import { Save, ArrowLeft, Heart, Sparkles, UserCheck, MapPin, ShieldCheck, Activity, Dna } from 'lucide-react';

export default function NewDamPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    id: `DAM-${Math.floor(100 + Math.random() * 900)}`,
    name: '',
    breed: 'Angus Cross',
    dob: '',
    fatherId: '',
    motherId: '',
    ownerName: 'SNR Farm Owner',
    farmLocation: 'រទាំង',
    imageUrl: '',
    availability: 'Available' as const,
    breedingStatus: 'Open',
    pregnancyStatus: 'Open',
  });

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
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Breed Lineage</label>
                  <select
                    value={formData.breed}
                    onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  >
                    <option value="Angus Cross">Angus Cross</option>
                    <option value="Red Brahman">Red Brahman</option>
                    <option value="Wagyu Cross">Wagyu Cross</option>
                    <option value="Local Cow">Local Cow</option>
                    <option value="Charolais Cross">Charolais Cross</option>
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

            {/* Section 2: Reproductive & Breeding Status */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <div className="h-8 w-8 rounded-xl bg-pink-50 flex items-center justify-center text-pink-700">
                  <Activity className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">2. Reproductive & Breeding Status</h3>
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
                    onChange={(e) => setFormData({ ...formData, breedingStatus: e.target.value })}
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

            {/* Section 3: Ownership & Station Location */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <div className="h-8 w-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700">
                  <UserCheck className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">3. Ownership & Station Location</h3>
                  <p className="text-[10px] text-slate-500">Owner entity and physical station location.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Owner Name</label>
                  <input
                    type="text"
                    value={formData.ownerName}
                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Station Location</label>
                  <input
                    type="text"
                    value={formData.farmLocation}
                    onChange={(e) => setFormData({ ...formData, farmLocation: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  />
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
