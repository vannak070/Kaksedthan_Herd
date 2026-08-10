'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Plus, Trash2, CheckCircle2 } from 'lucide-react';

export default function MasterDataSettingsPage() {
  const [breeds, setBreeds] = useState(['Brahman', 'Angus', 'Wagyu', 'Charolais', 'Local Cow', 'Simmental', 'Nelore']);
  const [coatColors, setCoatColors] = useState(['Red', 'White', 'Black', 'Grey', 'Brown']);
  const [productionTypes, setProductionTypes] = useState(['Breeding', 'Fattening', 'Dairy', 'Dual Purpose']);
  const [newBreed, setNewBreed] = useState('');
  const [saved, setSaved] = useState(false);

  const handleAddBreed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBreed) return;
    setBreeds([...breeds, newBreed]);
    setNewBreed('');
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleRemoveBreed = (breed: string) => {
    setBreeds(breeds.filter(b => b !== breed));
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white border-slate-200">
        <CardHeader>
          <CardTitle className="text-base font-black text-slate-900">Centralized System Master Data</CardTitle>
          <CardDescription className="text-xs">
            Manage global lookup values (Breeds, Species, Coat Colors, Production Types) used as the single source of truth across Sire, Dam, Breeding Program, Calf, and Herdbook modules.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {saved && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Master data dropdown parameters updated across all system modules.</span>
            </div>
          )}

          {/* 1. Breed Master Catalog */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider">Cattle Breed Catalog</h4>
            <form onSubmit={handleAddBreed} className="flex gap-2">
              <input
                type="text"
                placeholder="Enter new breed name (e.g. Brangus)"
                value={newBreed}
                onChange={e => setNewBreed(e.target.value)}
                className="px-3 py-1.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#dc5c15] w-full max-w-sm"
              />
              <button type="submit" className="bg-[#dc5c15] text-white text-xs font-bold px-4 py-1.5 rounded-xl hover:bg-orange-700 transition-colors flex items-center gap-1">
                <Plus className="h-4 w-4" />
                <span>Add Breed</span>
              </button>
            </form>

            <div className="flex flex-wrap gap-2 pt-2">
              {breeds.map((b) => (
                <span key={b} className="bg-orange-50 border border-orange-200 text-[#dc5c15] text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-2">
                  <span>{b}</span>
                  <button onClick={() => handleRemoveBreed(b)} className="hover:text-rose-600">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* 2. Coat Colors */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider">Coat Color Types</h4>
            <div className="flex flex-wrap gap-2">
              {coatColors.map((color) => (
                <span key={color} className="bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold px-3 py-1.5 rounded-xl">
                  {color}
                </span>
              ))}
            </div>
          </div>

          {/* 3. Production Types */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider">Production & Purpose Types</h4>
            <div className="flex flex-wrap gap-2">
              {productionTypes.map((pt) => (
                <span key={pt} className="bg-purple-50 border border-purple-200 text-purple-800 text-xs font-bold px-3 py-1.5 rounded-xl">
                  {pt}
                </span>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
