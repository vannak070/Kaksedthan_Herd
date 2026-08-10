'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Building2, Plus, Trash2, CheckCircle2 } from 'lucide-react';

export default function OrganizationSettingsPage() {
  const [farms, setFarms] = useState([
    { id: 'FARM-01', name: 'រទាំង', province: 'ភ្នំពេញ', district: 'ព្រែកព្នៅ', capacity: 100 },
    { id: 'FARM-02', name: 'ព្រៃវែង', province: 'ព្រៃវែង', district: 'ក្រុងព្រៃវែង', capacity: 150 },
    { id: 'FARM-03', name: 'បន្ទាយមានជ័យ', province: 'បន្ទាយមានជ័យ', district: 'សិរីសោភ័ណ', capacity: 80 }
  ]);

  const [newFarmName, setNewFarmName] = useState('');
  const [newProvince, setNewProvince] = useState('');
  const [newCapacity, setNewCapacity] = useState('50');
  const [saved, setSaved] = useState(false);

  const handleAddFarm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFarmName) return;
    const newId = `FARM-0${farms.length + 1}`;
    setFarms([...farms, { id: newId, name: newFarmName, province: newProvince || 'ភ្នំពេញ', district: 'ទូទៅ', capacity: Number(newCapacity) }]);
    setNewFarmName('');
    setNewProvince('');
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleRemove = (id: string) => {
    setFarms(farms.filter(f => f.id !== id));
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white border-slate-200">
        <CardHeader>
          <CardTitle className="text-base font-black text-slate-900">Organization & Farm Location Structure</CardTitle>
          <CardDescription className="text-xs">
            Manage physical farm branches, pasture locations, and geographic administrative hierarchy (Province → District → Commune → Village).
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {saved && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Organization farm location hierarchy updated successfully.</span>
            </div>
          )}

          <form onSubmit={handleAddFarm} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
              <Plus className="h-4 w-4 text-[#dc5c15]" />
              <span>Register New Farm Location</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Farm Name</label>
                <input
                  type="text"
                  placeholder="e.g. ក្រោល C"
                  value={newFarmName}
                  onChange={e => setNewFarmName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#dc5c15]"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Province / City</label>
                <input
                  type="text"
                  placeholder="e.g. កំពង់ចាម"
                  value={newProvince}
                  onChange={e => setNewProvince(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#dc5c15]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Max Capacity (Head)</label>
                <input
                  type="number"
                  value={newCapacity}
                  onChange={e => setNewCapacity(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#dc5c15]"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button type="submit" className="bg-[#dc5c15] text-white text-xs font-bold px-4 py-1.5 rounded-lg hover:bg-orange-700 transition-colors">
                Add Farm Location
              </button>
            </div>
          </form>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-100 px-4 py-2 text-[11px] font-black uppercase text-slate-500 grid grid-cols-4">
              <span>Farm ID & Name</span>
              <span>Province</span>
              <span>District</span>
              <span className="text-right">Actions</span>
            </div>
            {farms.map((f) => (
              <div key={f.id} className="px-4 py-3 text-xs flex items-center justify-between grid grid-cols-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-[#dc5c15]" />
                  <div>
                    <p className="font-bold text-slate-900">{f.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{f.id}</p>
                  </div>
                </div>
                <span className="font-medium text-slate-700">{f.province}</span>
                <span className="font-medium text-slate-700">{f.district}</span>
                <div className="text-right">
                  <button onClick={() => handleRemove(f.id)} className="text-rose-600 hover:text-rose-800 p-1">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
