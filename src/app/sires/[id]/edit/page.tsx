'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/common/PageHeader';
import ImageUploadContainer from '@/components/common/ImageUploadContainer';
import { fetchSiresAction, saveSireAction } from '@/app/actions';
import { Save, ArrowLeft, Beef, Dna, MapPin, Building2, ShieldCheck, Sparkles, UserCheck } from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditSirePage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    id: id,
    name: '',
    breed: 'Wagyu',
    dob: '',
    bloodline: '',
    sourcingCompany: 'ABS Global Inc.',
    fatherId: '',
    motherId: '',
    imageUrl: '',
    ownerName: '',
    farmLocation: '',
    status: 'Active' as const,
  });

  useEffect(() => {
    fetchSiresAction()
      .then((sires) => {
        const found = sires.find((s) => s.id === id);
        if (found) {
          setFormData({
            id: found.id,
            name: found.name,
            breed: found.breed,
            dob: found.dob || '',
            bloodline: found.bloodline || '',
            sourcingCompany: found.sourcingCompany || 'ABS Global Inc.',
            fatherId: found.fatherId || '',
            motherId: found.motherId || '',
            imageUrl: found.imageUrl || '',
            ownerName: found.ownerName || '',
            farmLocation: found.farmLocation || '',
            status: found.status,
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

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
        title={`Edit Sire: ${formData.name || id}`}
        subtitle="Update biological profile, bloodline, sourcing company, owner, and photo."
        breadcrumbs={[
          { label: 'Sire Register', href: '/sires' },
          { label: formData.name || id, href: `/sires/${id}` },
          { label: 'Edit Sire' },
        ]}
        backHref={`/sires/${id}`}
        backLabel="Back to Sire Profile"
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Main Grid: 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: 1:1 Image Upload & Status Summary (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-xl bg-orange-50 flex items-center justify-center text-[#dc5c15]">
                    <Beef className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Sire Photo</h3>
                    <p className="text-[10px] text-slate-500">1:1 Square Standardized (1200×1200)</p>
                  </div>
                </div>
                <span className="bg-orange-100 text-[#dc5c15] text-[9px] font-black px-2 py-0.5 rounded-full uppercase">1:1 Standard</span>
              </div>

              <ImageUploadContainer
                value={formData.imageUrl}
                onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                aspectRatio="1:1"
                placeholder="Upload or Update Sire Photo"
              />

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-600">
                  <span className="text-slate-400 font-medium">System Record:</span>
                  <span className="font-bold text-slate-900">{formData.id}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span className="text-slate-400 font-medium">Herdbook Pass:</span>
                  <span className="font-extrabold text-emerald-600 flex items-center gap-1">
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
                <div className="h-8 w-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">1. Basic Identity & Registration</h3>
                  <p className="text-[10px] text-slate-500">Official title, ID tag, breed, and birth date.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Sire ID Tag</label>
                  <input
                    type="text"
                    value={formData.id}
                    readOnly
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-black text-slate-500 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Sire Name / Official Title <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#dc5c15] focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Breed Lineage</label>
                  <select
                    value={formData.breed}
                    onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#dc5c15] focus:outline-none"
                  >
                    <option value="Wagyu">Wagyu (和牛)</option>
                    <option value="Red Angus">Red Angus</option>
                    <option value="Black Angus">Black Angus</option>
                    <option value="Red Brahman">Red Brahman</option>
                    <option value="Grey Brahman">Grey Brahman</option>
                    <option value="Charolais">Charolais</option>
                    <option value="Limousin">Limousin</option>
                    <option value="Local Cross">Local Cross</option>
                  </select>
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
              </div>
            </div>

            {/* Section 2: Genetic Lineage & Sourcing Company */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <div className="h-8 w-8 rounded-xl bg-purple-50 flex items-center justify-center text-purple-700">
                  <Dna className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">2. Genetic Sourcing & Pedigree</h3>
                  <p className="text-[10px] text-slate-500">Genetics provider, bloodline specification, and parentage.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Genetics Sourcing Company <span className="text-slate-400 font-normal">(Provider)</span>
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
                    <select
                      value={formData.sourcingCompany}
                      onChange={(e) => setFormData({ ...formData, sourcingCompany: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#dc5c15] focus:outline-none"
                    >
                      <option value="ABS Global Inc.">ABS Global Inc. (USA)</option>
                      <option value="Semex Alliance">Semex Alliance (Canada)</option>
                      <option value="World Wide Sires">World Wide Sires (WWS)</option>
                      <option value="CRV International">CRV International (Netherlands)</option>
                      <option value="STgenetics">STgenetics (USA)</option>
                      <option value="VikingGenetics">VikingGenetics (Denmark)</option>
                      <option value="Kaksedthan Breeding Corp">Kaksedthan Breeding Corp (Cambodia)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Bloodline / Specification</label>
                  <input
                    type="text"
                    value={formData.bloodline}
                    onChange={(e) => setFormData({ ...formData, bloodline: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#dc5c15] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Father Sire ID <span className="text-slate-400 font-normal">(Optional)</span></label>
                  <input
                    type="text"
                    value={formData.fatherId}
                    onChange={(e) => setFormData({ ...formData, fatherId: e.target.value })}
                    placeholder="e.g. SIR-001"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#dc5c15] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Mother Dam ID <span className="text-slate-400 font-normal">(Optional)</span></label>
                  <input
                    type="text"
                    value={formData.motherId}
                    onChange={(e) => setFormData({ ...formData, motherId: e.target.value })}
                    placeholder="e.g. DAM-001"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#dc5c15] focus:outline-none"
                  />
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
                  <p className="text-[10px] text-slate-500">Owner entity, physical station, and registration status.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Owner Name</label>
                  <input
                    type="text"
                    value={formData.ownerName}
                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#dc5c15] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Station Location</label>
                  <input
                    type="text"
                    value={formData.farmLocation}
                    onChange={(e) => setFormData({ ...formData, farmLocation: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#dc5c15] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Registration Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-black text-slate-900 focus:ring-2 focus:ring-[#dc5c15] focus:outline-none"
                  >
                    <option value="Active">Active (In Service)</option>
                    <option value="Retired">Retired</option>
                    <option value="Sold">Sold</option>
                    <option value="Deceased">Deceased</option>
                  </select>
                </div>
              </div>
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
                <span>{submitting ? 'Updating...' : 'Update Sire Profile'}</span>
              </button>
            </div>

          </div>

        </div>

      </form>
    </div>
  );
}
