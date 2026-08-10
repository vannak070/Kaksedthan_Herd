'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building, Plus, Search, MapPin, Users, Beef, CheckCircle2,
  XCircle, Edit3, Trash2, Save, X, AlertTriangle, Image as ImageIcon
} from 'lucide-react';
import { createFarmAction, updateFarmAction, deleteFarmAction } from '@/app/actions';

interface FarmItem {
  id: string;
  code: string;
  name: string;
  ownerId?: string;
  ownerName?: string;
  address?: string;
  capacity?: number;
  imageUrl?: string;
  notes?: string;
  status: 'Active' | 'Inactive';
  animalCount?: number;
  userCount?: number;
  createdAt?: string;
}

interface Props {
  initialFarms: FarmItem[];
}

export default function FarmsListClient({ initialFarms }: Props) {
  const router = useRouter();
  const [farms, setFarms] = useState<FarmItem[]>(initialFarms);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFarm, setEditingFarm] = useState<FarmItem | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [address, setAddress] = useState('');
  const [capacity, setCapacity] = useState(100);
  const [imageUrl, setImageUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');

  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  const openCreateModal = () => {
    setEditingFarm(null);
    setName('');
    setCode('');
    setOwnerName('Bona Farm Owner');
    setAddress('');
    setCapacity(100);
    setImageUrl('');
    setNotes('');
    setStatus('Active');
    setIsModalOpen(true);
  };

  const openEditModal = (farm: FarmItem) => {
    setEditingFarm(farm);
    setName(farm.name);
    setCode(farm.code);
    setOwnerName(farm.ownerName || '');
    setAddress(farm.address || '');
    setCapacity(farm.capacity || 100);
    setImageUrl(farm.imageUrl || '');
    setNotes(farm.notes || '');
    setStatus(farm.status || 'Active');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      if (editingFarm) {
        const res = await updateFarmAction(editingFarm.id, {
          name: name.trim(),
          ownerName: ownerName.trim(),
          address: address.trim(),
          capacity: Number(capacity),
          imageUrl: imageUrl.trim(),
          notes: notes.trim(),
          status
        });
        if (res.success && res.data) {
          setFarms(prev => prev.map(f => f.id === editingFarm.id ? { ...f, ...res.data } : f));
          showToast('success', `Farm "${name}" updated successfully.`);
          setIsModalOpen(false);
        } else {
          showToast('error', res.error || 'Failed to update farm.');
        }
      } else {
        const res = await createFarmAction({
          name: name.trim(),
          code: code.trim() || undefined,
          ownerName: ownerName.trim(),
          address: address.trim(),
          capacity: Number(capacity),
          imageUrl: imageUrl.trim(),
          notes: notes.trim()
        });
        if (res.success && res.data) {
          setFarms(prev => [...prev, res.data]);
          showToast('success', `Farm "${name}" created successfully.`);
          setIsModalOpen(false);
        } else {
          showToast('error', res.error || 'Failed to create farm.');
        }
      }
    } catch (err: any) {
      showToast('error', err.message || 'An error occurred.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (farm: FarmItem) => {
    if (!window.confirm(`Are you sure you want to delete "${farm.name}"?`)) return;
    try {
      const res = await deleteFarmAction(farm.id);
      if (res.success) {
        setFarms(prev => prev.filter(f => f.id !== farm.id));
        showToast('success', `Farm "${farm.name}" deleted.`);
      } else {
        showToast('error', res.error || 'Cannot delete farm.');
      }
    } catch {
      showToast('error', 'An error occurred while deleting farm.');
    }
  };

  const filteredFarms = useMemo(() => {
    return farms.filter(f =>
      !search ||
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.code.toLowerCase().includes(search.toLowerCase()) ||
      (f.address || '').toLowerCase().includes(search.toLowerCase())
    );
  }, [farms, search]);

  const totalCapacity = farms.reduce((sum, f) => sum + (f.capacity || 0), 0);
  const totalAnimals = farms.reduce((sum, f) => sum + (f.animalCount || 0), 0);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 max-w-sm p-4 rounded-2xl shadow-2xl border text-xs font-bold flex items-start gap-3 ${
          toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" /> : <AlertTriangle className="h-4 w-4 text-rose-600 flex-shrink-0" />}
          <span className="flex-1">{toast.message}</span>
          <button onClick={() => setToast(null)} className="opacity-60 hover:opacity-100">✕</button>
        </div>
      )}

      {/* ── Page Header ─────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-amber-600 to-orange-600 p-6 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30">
                <Building className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-white/70 text-[11px] font-bold uppercase tracking-wider">Farm & Ownership</p>
                <h1 className="text-xl font-black text-white">Farm Management</h1>
                <p className="text-white/70 text-xs font-medium mt-0.5">
                  Manage farm stations, barn capacities, farm owners, and assigned livestock.
                </p>
              </div>
            </div>
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-amber-700 text-xs font-black shadow-lg hover:shadow-xl transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>+ Add New Farm</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── KPI Summary Cards ────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center">
            <Building className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase">Total Farms</p>
            <p className="text-xl font-black text-slate-900">{farms.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase">Active Farms</p>
            <p className="text-xl font-black text-slate-900">{farms.filter(f => f.status === 'Active').length}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
            <Users className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase">Total Capacity</p>
            <p className="text-xl font-black text-slate-900">{totalCapacity} heads</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center">
            <Beef className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase">Housed Livestock</p>
            <p className="text-xl font-black text-slate-900">{totalAnimals}</p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search farm name, code, address..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-amber-600"
          />
        </div>
      </div>

      {/* Farms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredFarms.length === 0 ? (
          <div className="col-span-full bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500 font-medium space-y-2">
            <Building className="h-10 w-10 text-slate-300 mx-auto" />
            <p className="font-bold">No farm locations found.</p>
          </div>
        ) : (
          filteredFarms.map(farm => (
            <div key={farm.id} className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden flex flex-col hover:shadow-md transition-shadow">
              {/* Farm Image Header */}
              <div className="h-36 bg-slate-100 relative border-b border-slate-100">
                {farm.imageUrl ? (
                  <img src={farm.imageUrl} alt={farm.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-1 bg-gradient-to-br from-amber-50 to-orange-50">
                    <Building className="h-10 w-10 text-amber-400/50" />
                    <span className="text-[10px] font-bold text-amber-700/50">KAKSEDTHAN FARM</span>
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border backdrop-blur-md shadow-xs ${
                    farm.status === 'Active' ? 'bg-emerald-500/90 text-white border-emerald-400' : 'bg-slate-500/90 text-white border-slate-400'
                  }`}>
                    {farm.status}
                  </span>
                </div>
                <div className="absolute bottom-3 left-3">
                  <span className="font-mono text-[10px] font-bold bg-black/60 text-white px-2 py-0.5 rounded-md backdrop-blur-md">
                    {farm.code}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 flex-1 space-y-3.5 text-xs">
                <div>
                  <h3 className="font-black text-slate-900 text-sm">{farm.name}</h3>
                  {farm.address && (
                    <p className="text-slate-500 font-medium flex items-center gap-1 mt-1 text-[11px]">
                      <MapPin className="h-3.5 w-3.5 text-amber-600 flex-shrink-0" />
                      <span>{farm.address}</span>
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-[9px] font-bold uppercase text-slate-400 block">Farm Owner</span>
                    <span className="font-bold text-slate-800 truncate block mt-0.5">{farm.ownerName || 'Bona Farm Owner'}</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-[9px] font-bold uppercase text-slate-400 block">Capacity</span>
                    <span className="font-bold text-amber-700 block mt-0.5">{farm.capacity || 100} heads</span>
                  </div>
                </div>

                {farm.notes && (
                  <p className="text-[11px] text-slate-500 font-medium italic bg-amber-50/50 p-2.5 rounded-xl border border-amber-100">
                    "{farm.notes}"
                  </p>
                )}
              </div>

              {/* Footer Actions */}
              <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400">
                  {farm.animalCount || 0} animals housed
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(farm)}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer"
                    title="Edit Farm"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(farm)}
                    className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 cursor-pointer"
                    title="Delete Farm"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── Create / Edit Modal ───────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 space-y-5 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                <Building className="h-4 w-4 text-amber-600" />
                {editingFarm ? 'Edit Farm Location' : 'Create New Farm Location'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">Farm Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. ព្រៃវែង Station"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-bold focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">Farm Code</label>
                  <input
                    type="text"
                    value={code}
                    onChange={e => setCode(e.target.value.toUpperCase())}
                    placeholder="e.g. PREY_VENG"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-mono font-bold focus:outline-none focus:border-amber-600"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">Barn Capacity (heads)</label>
                  <input
                    type="number"
                    value={capacity}
                    onChange={e => setCapacity(Number(e.target.value))}
                    min={10}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-bold focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">Registered Farm Owner</label>
                <input
                  type="text"
                  value={ownerName}
                  onChange={e => setOwnerName(e.target.value)}
                  placeholder="e.g. Bona Farm Owner"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-bold focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">Location Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="e.g. ក្រុងព្រៃវែង, ខេត្តព្រៃវែង"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-medium focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">Farm Photo URL</label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-medium focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">Notes & Purpose</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="e.g. Breeding station and quarantine facility"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-medium focus:outline-none focus:border-amber-600 resize-none"
                />
              </div>

              <div className="flex gap-3 justify-end pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-amber-600 text-white text-xs font-black hover:bg-amber-700 cursor-pointer disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  <span>{saving ? 'Saving...' : 'Save Farm'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
