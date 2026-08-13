'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/common/PageHeader';
import StandardAnimalImage from '@/components/common/StandardAnimalImage';
import {
  Building, Plus, Search, MapPin, Users, Beef, CheckCircle2,
  XCircle, Edit3, Trash2, Save, X, AlertTriangle, ShieldCheck, Lock, Mail,
  Phone, UserCheck, Key, ArrowUpRight, ChevronRight
} from 'lucide-react';
import { createFarmAction, updateFarmAction, deleteFarmAction } from '@/app/actions';
import { DynamicUpload } from '@/components/common/DynamicUpload';
import ImageUploadContainer from '@/components/common/ImageUploadContainer';

interface FarmItem {
  id: string;
  code: string;
  name: string;
  farmType?: string;
  ownerId?: string;
  ownerName?: string;
  ownerPhone?: string;
  ownerEmail?: string;
  ownerNationalId?: string;
  address?: string;
  province?: string;
  district?: string;
  commune?: string;
  village?: string;
  phone?: string;
  email?: string;
  capacity?: number;
  imageUrl?: string;
  notes?: string;
  status: 'Active' | 'Inactive';
  userId?: string;
  accountEmail?: string;
  accountStatus?: string;
  userLevel?: string;
  animalCount?: number;
  userCount?: number;
  createdAt?: string;
}

interface Props {
  initialFarms: FarmItem[];
}

export default function FarmsListClient({ initialFarms }: Props) {
  const [farms, setFarms] = useState<FarmItem[]>(initialFarms);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFarm, setEditingFarm] = useState<FarmItem | null>(null);

  // ── Form State (4 Sections) ──────────────────────
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [farmType, setFarmType] = useState('General Livestock Station');
  const [address, setAddress] = useState('');
  const [province, setProvince] = useState('');
  const [district, setDistrict] = useState('');
  const [commune, setCommune] = useState('');
  const [village, setVillage] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [capacity, setCapacity] = useState(100);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
  const [imageUrl, setImageUrl] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerNationalId, setOwnerNationalId] = useState('');

  // Account State
  const [createAccount, setCreateAccount] = useState(false);
  const [accountEmail, setAccountEmail] = useState('');
  const [accountPassword, setAccountPassword] = useState('');
  const [accountStatus, setAccountStatus] = useState<'Active' | 'Inactive' | 'Suspended'>('Active');
  const [userLevel, setUserLevel] = useState<'Farm Owner Account' | 'Farmer / Farm Manager Account'>('Farm Owner Account');

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
    setFarmType('General Livestock Station');
    setAddress('');
    setProvince('');
    setDistrict('');
    setCommune('');
    setVillage('');
    setPhone('');
    setEmail('');
    setCapacity(100);
    setNotes('');
    setStatus('Active');
    setImageUrl('');
    setOwnerName('');
    setOwnerPhone('');
    setOwnerEmail('');
    setOwnerNationalId('');
    setCreateAccount(false);
    setAccountEmail('');
    setAccountPassword('');
    setAccountStatus('Active');
    setUserLevel('Farm Owner Account');
    setIsModalOpen(true);
  };

  const openEditModal = (farm: FarmItem) => {
    setEditingFarm(farm);
    setName(farm.name);
    setCode(farm.code);
    setFarmType(farm.farmType || 'General Livestock Station');
    setAddress(farm.address || '');
    setProvince(farm.province || '');
    setDistrict(farm.district || '');
    setCommune(farm.commune || '');
    setVillage(farm.village || '');
    setPhone(farm.phone || '');
    setEmail(farm.email || '');
    setCapacity(farm.capacity || 100);
    setNotes(farm.notes || '');
    setStatus(farm.status || 'Active');
    setImageUrl(farm.imageUrl || '');
    setOwnerName(farm.ownerName || '');
    setOwnerPhone(farm.ownerPhone || '');
    setOwnerEmail(farm.ownerEmail || '');
    setOwnerNationalId(farm.ownerNationalId || '');
    
    const hasUser = Boolean(farm.userId || farm.accountEmail);
    setCreateAccount(hasUser);
    setAccountEmail(farm.accountEmail || farm.email || '');
    setAccountPassword('');
    setAccountStatus((farm.accountStatus as any) || 'Active');
    setUserLevel((farm.userLevel as any) || 'Farm Owner Account');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);

    try {
      const payload = {
        name: name.trim(),
        code: code.trim() || undefined,
        farmType,
        ownerName: ownerName.trim() || undefined,
        ownerPhone: ownerPhone.trim() || undefined,
        ownerEmail: ownerEmail.trim() || undefined,
        ownerNationalId: ownerNationalId.trim() || undefined,
        address: address.trim() || undefined,
        province: province.trim() || undefined,
        district: district.trim() || undefined,
        commune: commune.trim() || undefined,
        village: village.trim() || undefined,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        capacity: Number(capacity),
        imageUrl: imageUrl.trim() || undefined,
        notes: notes.trim() || undefined,
        status,
        createAccount,
        accountEmail: createAccount ? accountEmail.trim() : undefined,
        accountPassword: createAccount && accountPassword ? accountPassword : undefined,
        accountStatus: createAccount ? accountStatus : undefined,
        userLevel: createAccount ? userLevel : undefined
      };

      if (editingFarm) {
        const res = await updateFarmAction(editingFarm.id, payload);
        if (res.success && res.data) {
          setFarms(prev => prev.map(f => f.id === editingFarm.id ? { ...f, ...res.data } : f));
          showToast('success', `Farm "${name}" updated successfully.`);
          setIsModalOpen(false);
        } else {
          showToast('error', res.error || 'Failed to update farm station.');
        }
      } else {
        const res = await createFarmAction(payload);
        if (res.success && res.data) {
          setFarms(prev => [res.data, ...prev]);
          showToast('success', `Farm "${name}" created successfully.`);
          setIsModalOpen(false);
        } else {
          showToast('error', res.error || 'Failed to create farm station.');
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
    return farms.filter(f => {
      const matchesSearch = !search ||
        f.name.toLowerCase().includes(search.toLowerCase()) ||
        f.code.toLowerCase().includes(search.toLowerCase()) ||
        (f.province || '').toLowerCase().includes(search.toLowerCase()) ||
        (f.address || '').toLowerCase().includes(search.toLowerCase()) ||
        (f.ownerName || '').toLowerCase().includes(search.toLowerCase());

      const matchesType = typeFilter === 'All' || f.farmType === typeFilter;
      const matchesStatus = statusFilter === 'All' || f.status === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [farms, search, typeFilter, statusFilter]);

  const availableTypes = Array.from(new Set(farms.map(f => f.farmType || 'General Livestock Station')));

  return (
    <div className="space-y-6">

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

      {/* ── Page Header (Stock Insemination Layout Standard) ────────────────── */}
      <PageHeader
        title="Farm Station Management"
        subtitle="Manage farm station locations, login accounts, barn capacities, and housed livestock."
        breadcrumbs={[{ label: 'Farm Stations' }]}
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search Station Name, Code, Province, Owner..."
        onActionClick={openCreateModal}
        actionLabel="+ Add New Farm Station"
      >
        <div className="flex items-center gap-2">
          {/* Station Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs font-semibold rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-600"
          >
            <option value="All">All Station Types</option>
            {availableTypes.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs font-semibold rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-600"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </PageHeader>

      {/* ── Stock Insemination Card Standard Grid (5 Columns on XL Desktop) ────────────────── */}
      {filteredFarms.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center my-6">
          <Building className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Farm Stations Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            No farm station items match your search filter. Create a new farm station.
          </p>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 bg-purple-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl mt-4 hover:bg-purple-700 transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>+ Add New Farm Station</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredFarms.map((farm) => {
            const stationName = farm.name;
            const stationType = farm.farmType || 'General Livestock Station';
            const photoUrl = farm.imageUrl;
            const housedCount = farm.animalCount || 0;

            return (
              <Link
                key={farm.id}
                href={`/farms/${farm.id}`}
                className="group bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-xl hover:border-purple-500 transition-all duration-200 overflow-hidden flex flex-col justify-between cursor-pointer p-3.5"
              >
                <div>
                  {/* Standard Image Container with Stock Insemination Badge placement */}
                  <div className="relative mb-3">
                    <StandardAnimalImage src={photoUrl} alt={stationName} fallbackText="Farm Station" />
                    <span className={`absolute top-2.5 right-2.5 font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs ${
                      farm.status === 'Active' ? 'bg-emerald-600 text-white' : 'bg-slate-500 text-white'
                    }`}>
                      {farm.status}
                    </span>
                    {(farm.userId || farm.accountEmail) && (
                      <span className="absolute top-2.5 left-2.5 bg-indigo-600 text-white font-black text-[8.5px] px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs flex items-center gap-1">
                        <ShieldCheck className="h-2.5 w-2.5" /> Account
                      </span>
                    )}
                  </div>

                  {/* Title & Metadata Hierarchy */}
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-slate-900 group-hover:text-purple-600 transition-colors truncate">
                      {stationName}
                    </h3>
                    <p className="text-xs font-extrabold text-[#dc5c15] truncate">{stationType}</p>

                    {/* Stock Insemination Style Specs Box */}
                    <div className="mt-2.5 space-y-1 text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-slate-600">
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-medium">Code:</span>
                        <span className="font-mono font-bold text-purple-700">{farm.code}</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-200/60 pt-1 mt-1">
                        <span className="font-extrabold text-slate-500">Location:</span>
                        <span className="font-bold text-slate-900 truncate max-w-[110px]">{farm.province || farm.address || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-extrabold text-slate-500">Owner:</span>
                        <span className="font-bold text-slate-800 truncate max-w-[110px]">{farm.ownerName || 'Bona Owner'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-extrabold text-slate-500">Capacity:</span>
                        <span className="font-black text-amber-700">{farm.capacity || 100} heads</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer (View Details link matching Stock Insemination) */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-purple-600">
                  <span>View Details</span>
                  <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* ── 4-Section Create / Edit Modal ───────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 space-y-6 border border-slate-200 my-8 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-150">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest block">Operational Setup</span>
                <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                  <Building className="h-5 w-5 text-purple-600" />
                  {editingFarm ? 'Edit Farm Station Profile' : 'Create New Farm Station'}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 text-xs">
              
              {/* SECTION 1 — FARM STATION INFORMATION */}
              <div className="space-y-3.5 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80">
                <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2">
                  <span className="h-5 w-5 rounded-md bg-purple-600 text-white font-black text-[11px] flex items-center justify-center">1</span>
                  <h4 className="font-black text-slate-900 uppercase text-[11px] tracking-wider">SECTION 1 — FARM STATION INFORMATION</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Farm Station Name *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. Green Valley Station"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-bold focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Farm Code / Reg. Number</label>
                    <input
                      type="text"
                      value={code}
                      onChange={e => setCode(e.target.value.toUpperCase())}
                      placeholder="e.g. GREEN_VALLEY"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Farm Type</label>
                    <select
                      value={farmType}
                      onChange={e => setFarmType(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-bold focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white cursor-pointer"
                    >
                      <option value="General Livestock Station">General Livestock Station</option>
                      <option value="Breeding Station">Breeding Station</option>
                      <option value="Fattening Station">Fattening Station</option>
                      <option value="Artificial Insemination Station">Artificial Insemination Station</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Capacity (Heads)</label>
                    <input
                      type="number"
                      value={capacity}
                      onChange={e => setCapacity(Number(e.target.value))}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-bold focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                    />
                  </div>
                </div>

                {/* Location Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  <div>
                    <label className="font-bold text-slate-600 block text-[10.5px]">Province</label>
                    <input
                      type="text"
                      value={province}
                      onChange={e => setProvince(e.target.value)}
                      placeholder="e.g. Prey Veng"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 block text-[10.5px]">District</label>
                    <input
                      type="text"
                      value={district}
                      onChange={e => setDistrict(e.target.value)}
                      placeholder="e.g. Peam Ro"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 block text-[10.5px]">Commune</label>
                    <input
                      type="text"
                      value={commune}
                      onChange={e => setCommune(e.target.value)}
                      placeholder="e.g. Neak Loeung"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 block text-[10.5px]">Village</label>
                    <input
                      type="text"
                      value={village}
                      onChange={e => setVillage(e.target.value)}
                      placeholder="e.g. Village 1"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Station Phone</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="e.g. 012 998 332"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Station Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="e.g. contact@greenvalley.com"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Farm Description & Notes</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Optional facilities, description, notes..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                  />
                </div>
              </div>

              {/* SECTION 2 — FARM STATION IMAGE */}
              <div className="space-y-3.5 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80">
                <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2">
                  <span className="h-5 w-5 rounded-md bg-purple-600 text-white font-black text-[11px] flex items-center justify-center">2</span>
                  <h4 className="font-black text-slate-900 uppercase text-[11px] tracking-wider">SECTION 2 — FARM STATION IMAGE</h4>
                </div>

                <ImageUploadContainer
                  value={imageUrl}
                  onChange={(url) => setImageUrl(url)}
                  aspectRatio="1:1"
                  placeholder="Upload or Capture Farm Station Photo"
                  label="Farm Station Display Image (1:1 Standardized HD)"
                />
              </div>

              {/* SECTION 3 — OWNER / RESPONSIBLE PERSON */}
              <div className="space-y-3.5 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80">
                <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2">
                  <span className="h-5 w-5 rounded-md bg-purple-600 text-white font-black text-[11px] flex items-center justify-center">3</span>
                  <h4 className="font-black text-slate-900 uppercase text-[11px] tracking-wider">SECTION 3 — OWNER / RESPONSIBLE PERSON</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Owner / Responsible Person Name</label>
                    <input
                      type="text"
                      value={ownerName}
                      onChange={e => setOwnerName(e.target.value)}
                      placeholder="e.g. Bona Farm Owner"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-bold focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Owner Contact Phone</label>
                    <input
                      type="text"
                      value={ownerPhone}
                      onChange={e => setOwnerPhone(e.target.value)}
                      placeholder="e.g. 012 445 778"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Owner Email Address</label>
                    <input
                      type="email"
                      value={ownerEmail}
                      onChange={e => setOwnerEmail(e.target.value)}
                      placeholder="e.g. owner@greenvalley.com"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">National ID / Verification No.</label>
                    <input
                      type="text"
                      value={ownerNationalId}
                      onChange={e => setOwnerNationalId(e.target.value)}
                      placeholder="e.g. 010298374"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 4 — LOGIN ACCOUNT */}
              <div className="space-y-3.5 bg-indigo-50/60 p-4 rounded-2xl border border-indigo-200/80">
                <div className="flex items-center justify-between border-b border-indigo-200/80 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="h-5 w-5 rounded-md bg-indigo-600 text-white font-black text-[11px] flex items-center justify-center">4</span>
                    <h4 className="font-black text-indigo-950 uppercase text-[11px] tracking-wider">SECTION 4 — LOGIN ACCOUNT (AUTHENTICATION)</h4>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-1 rounded-xl border border-indigo-200 text-xs font-bold text-indigo-900 shadow-2xs">
                    <input
                      type="checkbox"
                      checked={createAccount}
                      onChange={e => setCreateAccount(e.target.checked)}
                      className="h-4 w-4 text-indigo-600 rounded border-indigo-300 focus:ring-indigo-500"
                    />
                    <span>Create / Enable Login Account</span>
                  </label>
                </div>

                {createAccount ? (
                  <div className="space-y-3 pt-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="font-bold text-indigo-900 block flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5 text-indigo-600" />
                          <span>Login Email / Username *</span>
                        </label>
                        <input
                          type="email"
                          required={createAccount}
                          value={accountEmail}
                          onChange={e => setAccountEmail(e.target.value)}
                          placeholder="e.g. greenvalley@snrfarm.com"
                          className="w-full px-3.5 py-2 rounded-xl border border-indigo-300 font-bold text-indigo-950 focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-indigo-900 block flex items-center gap-1.5">
                          <Lock className="h-3.5 w-3.5 text-indigo-600" />
                          <span>{editingFarm ? 'New Password (Leave blank to keep existing)' : 'Password *'}</span>
                        </label>
                        <input
                          type="password"
                          required={createAccount && !editingFarm}
                          value={accountPassword}
                          onChange={e => setAccountPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full px-3.5 py-2 rounded-xl border border-indigo-300 font-medium text-indigo-950 focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="font-bold text-indigo-900 block">User Level</label>
                        <select
                          value={userLevel}
                          onChange={e => setUserLevel(e.target.value as any)}
                          className="w-full px-3.5 py-2 rounded-xl border border-indigo-300 font-bold text-indigo-950 focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white cursor-pointer"
                        >
                          <option value="Farm Owner Account">🏡 Farm Owner Account (LEVEL-02)</option>
                          <option value="Farmer / Farm Manager Account">🚜 Farm Manager Account (LEVEL-03)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-indigo-900 block">Account Status</label>
                        <select
                          value={accountStatus}
                          onChange={e => setAccountStatus(e.target.value as any)}
                          className="w-full px-3.5 py-2 rounded-xl border border-indigo-300 font-bold text-indigo-950 focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white cursor-pointer"
                        >
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                          <option value="Suspended">Suspended</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] font-medium text-slate-500 italic py-1">
                    Check the box above to generate a login account for this Farm Station. (Uses standard <code className="bg-white px-1.5 py-0.5 rounded border text-indigo-700 font-mono">/login</code>)
                  </p>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-purple-600 text-white font-black rounded-xl hover:bg-purple-700 shadow-md cursor-pointer flex items-center gap-2"
                >
                  {saving ? 'Saving Farm Station...' : (editingFarm ? 'Update Farm Station' : 'Create Farm Station & Account')}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
