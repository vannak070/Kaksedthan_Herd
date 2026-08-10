'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/common/PageHeader';
import ImageUploadContainer from '@/components/common/ImageUploadContainer';
import { SireItem } from '@/types/breeding.types';
import { fetchSiresAction, saveStockInseminationAction } from '@/app/actions';
import { Save, Syringe, Package, DollarSign, Beef, Info } from 'lucide-react';

export default function NewStockInseminationPage() {
  const router = useRouter();
  const [sires, setSires] = useState<SireItem[]>([]);
  const [selectedSire, setSelectedSire] = useState<SireItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Requirement 9: Auto-generated unique Stock Code format SEM-2026-XXXXXX
  const [stockCode] = useState(() => `SEM-2026-${Math.floor(100000 + Math.random() * 900000)}`);

  const [formData, setFormData] = useState({
    id: stockCode,
    stockName: '',
    sireId: '',
    breed: 'Brahman',
    initialStock: 500,
    unit: 'Dose',
    priceUsd: 25.0,
    ownerName: 'Kaksedthan Livestock Farm',
    farmLocation: 'Ang Snoul Station',
    breederName: 'Super Admin (CCEC)',
    description: '',
    imageUrl: '',
    availability: 'Available' as const,
    status: 'Active' as const,
  });

  useEffect(() => {
    fetchSiresAction().then((sData) => {
      setSires(sData);
      if (sData.length > 0) {
        const defaultSire = sData[0];
        setSelectedSire(defaultSire);
        setFormData((prev) => ({
          ...prev,
          sireId: defaultSire.id,
          breed: defaultSire.breed || 'Brahman',
          stockName: `${defaultSire.name} Semen Straw Batch`,
          imageUrl: defaultSire.imageUrl || '',
        }));
      }
    });
  }, []);

  // Requirement 7: When selecting a Sire, automatically populate Sire Name, Sire ID, Breed, and Image
  const handleSireChange = (sireId: string) => {
    const sire = sires.find((s) => s.id === sireId) || null;
    setSelectedSire(sire);
    if (sire) {
      setFormData((prev) => ({
        ...prev,
        sireId: sire.id,
        breed: sire.breed || 'Brahman',
        stockName: `${sire.name} Semen Straw Batch`,
        imageUrl: sire.imageUrl || prev.imageUrl,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Requirement 10 & 11: Backend & Frontend USD-ONLY enforcement (currency: 'USD')
      const payload = {
        id: formData.id,
        sireId: formData.sireId,
        stockAvailable: formData.initialStock,
        priceUsd: formData.priceUsd,
        priceKhr: formData.priceUsd * 4100, // Calculated for DB consistency if needed
        currency: 'USD', // Forced USD ONLY
        ownerName: formData.ownerName,
        farmLocation: formData.farmLocation,
        breederName: formData.breederName,
        sireName: selectedSire?.name,
        sireBreed: formData.breed,
        sireImageUrl: formData.imageUrl,
        availability: formData.availability,
        status: formData.status,
      };

      await saveStockInseminationAction(payload as any);
      // Requirement 11: Display Stock Detail Page immediately after saving
      router.push(`/stock-insemination/${formData.id}`);
    } catch (err: any) {
      alert(`Error adding semen stock: ${err.message}`);
      setSubmitting(false);
    }
  };

  const totalValueUsd = formData.initialStock * formData.priceUsd;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="Add New Semen Stock"
        subtitle="Register artificial insemination semen straws with USD-only pricing and Sire Register integration."
        breadcrumbs={[
          { label: 'Stock Insemination', href: '/stock-insemination' },
          { label: 'Add New Semen Stock' },
        ]}
        backHref="/stock-insemination"
        backLabel="Back to Stock Insemination"
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* SECTION 1: SEMEN INFORMATION */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <Syringe className="h-5 w-5 text-purple-600" />
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              1. Semen Information
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Sire Selection from Sire Register */}
            <div className="space-y-1.5 md:col-span-2 bg-purple-50/60 p-4 rounded-2xl border border-purple-100">
              <label className="block text-xs font-black text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                <Beef className="h-4 w-4 text-purple-700" />
                <span>Select Sire Bull (From Master Sire Register) *</span>
              </label>
              <select
                value={formData.sireId}
                onChange={(e) => handleSireChange(e.target.value)}
                className="w-full bg-white border border-purple-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-purple-600 focus:outline-none"
                required
              >
                {sires.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} (Sire ID: {s.id}) • Breed: {s.breed || 'Brahman'}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-purple-700 font-semibold mt-1">
                Selecting a Sire automatically populates Sire Name, Breed, and Sire ID without manual re-entry.
              </p>
            </div>

            {/* Auto-populated Sire Summary Card */}
            {selectedSire && (
              <div className="md:col-span-2 bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-slate-200 overflow-hidden border border-slate-300">
                    <img
                      src={selectedSire.imageUrl || '/logo.png'}
                      alt={selectedSire.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">AUTO-POPULATED SIRE</span>
                    <h4 className="font-black text-slate-900 text-sm">{selectedSire.name}</h4>
                    <p className="text-slate-500 font-bold">Breed: <span className="text-[#dc5c15]">{selectedSire.breed || 'Brahman'}</span> • ID: {selectedSire.id}</p>
                  </div>
                </div>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-1 rounded-full uppercase">
                  Verified Sire
                </span>
              </div>
            )}

            {/* Semen Stock Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Semen Stock Name *</label>
              <input
                type="text"
                value={formData.stockName}
                onChange={(e) => setFormData({ ...formData, stockName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900"
                placeholder="e.g. Brahman Bull Semen Batch A"
                required
              />
            </div>

            {/* Stock Code (Auto-generated) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Stock Code (Auto-Generated) *</label>
              <input
                type="text"
                value={formData.id}
                readOnly
                className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-black text-purple-700 cursor-not-allowed"
              />
            </div>

            {/* Product Type */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Product Type</label>
              <input
                type="text"
                value="Semen Straw Batch"
                readOnly
                className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-600 cursor-not-allowed"
              />
            </div>

            {/* Breed */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Breed (Auto-Populated)</label>
              <input
                type="text"
                value={formData.breed}
                readOnly
                className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-[#dc5c15] cursor-not-allowed"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Description / Notes</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800"
                placeholder="Batch quality notes, tank storage location..."
              />
            </div>

            {/* Requirement 3: Image Upload Component */}
            <div className="md:col-span-2">
              <ImageUploadContainer
                label="Semen Stock / Sire Image"
                value={formData.imageUrl}
                onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                aspectRatio="landscape"
              />
            </div>

          </div>
        </div>

        {/* SECTION 2: STOCK QUANTITY & UNITS */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <Package className="h-5 w-5 text-purple-600" />
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              2. Stock Quantity & Unit
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Initial Stock Quantity *</label>
              <input
                type="number"
                min="1"
                value={formData.initialStock}
                onChange={(e) => setFormData({ ...formData, initialStock: Math.max(1, parseInt(e.target.value, 10) || 0) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-black text-purple-900"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Unit Type *</label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800"
              >
                <option value="Dose">Dose</option>
                <option value="Straw">Straw</option>
                <option value="Unit">Unit</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 3: USD-ONLY PRICING (REQUIREMENT 10) */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <DollarSign className="h-5 w-5 text-emerald-600" />
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                3. USD-Only Pricing (No KHR Dropdown)
              </h3>
            </div>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
              Currency: USD ($)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Unit Price (USD $) *</label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-xs font-black text-emerald-700">$</span>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={formData.priceUsd}
                  onChange={(e) => setFormData({ ...formData, priceUsd: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3.5 py-2.5 text-sm font-black text-emerald-900"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Total Stock Inventory Value ($USD)</label>
              <div className="w-full bg-emerald-50 border border-emerald-200 rounded-xl px-3.5 py-2.5 text-sm font-black text-emerald-900">
                ${totalValueUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.push('/stock-insemination')}
            className="px-5 py-3 rounded-2xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          {/* Requirement 11: Save Semen Stock button */}
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-black px-7 py-3 rounded-2xl shadow-lg shadow-purple-600/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>{submitting ? 'Saving Semen Stock...' : 'Save Semen Stock'}</span>
          </button>
        </div>

      </form>
    </div>
  );
}
