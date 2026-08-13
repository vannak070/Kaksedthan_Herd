'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/common/PageHeader';
import StandardAnimalImage from '@/components/common/StandardAnimalImage';
import {
  Users, Plus, Search, MapPin, Beef, CheckCircle2, AlertTriangle,
  XCircle, Save, X, ShieldCheck, Lock, Mail, Phone, UserCheck, Key,
  Heart, ChevronRight, Award, Edit3
} from 'lucide-react';
import { createBreederAction, updateBreederAction } from '@/app/actions';
import { DynamicUpload } from '@/components/common/DynamicUpload';
import ImageUploadContainer from '@/components/common/ImageUploadContainer';

interface BreederItem {
  id: string;
  code: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  province?: string;
  district?: string;
  commune?: string;
  village?: string;
  imageUrl?: string;
  nationalId?: string;
  idFrontUrl?: string;
  idBackUrl?: string;
  idVerificationStatus?: string;
  notes?: string;
  status: 'Active' | 'Inactive';
  userId?: string;
  accountEmail?: string;
  accountStatus?: string;
  userLevel?: string;
  role?: string;
  customerCount?: number;
  breedingCount?: number;
  createdAt?: string;
}

interface Props {
  initialBreeders: BreederItem[];
}

import GlobalPagination from '@/components/common/GlobalPagination';
import GlobalExport from '@/components/common/GlobalExport';

import { useSearchParams } from 'next/navigation';

export default function BreedersListClient({ initialBreeders }: Props) {
  const searchParams = useSearchParams();
  const [breeders, setBreeders] = useState<BreederItem[]>(initialBreeders);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Global Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBreeder, setEditingBreeder] = useState<BreederItem | null>(null);

  // ── Form State (4 Sections — Aligned with Farm Station) ──────────────────
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [province, setProvince] = useState('');
  const [district, setDistrict] = useState('');
  const [commune, setCommune] = useState('');
  const [village, setVillage] = useState('');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
  const [notes, setNotes] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [idFrontUrl, setIdFrontUrl] = useState('');
  const [idBackUrl, setIdBackUrl] = useState('');

  // Section 4: Login Account (Authentication)
  const [createAccount, setCreateAccount] = useState(true);
  const [accountEmail, setAccountEmail] = useState('');
  const [accountPassword, setAccountPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accountStatus, setAccountStatus] = useState<'Active' | 'Inactive' | 'Suspended'>('Active');
  const [userLevel, setUserLevel] = useState<'Professional Breeder Account' | 'Senior Breeder Account'>('Professional Breeder Account');

  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  // Auto-open modal if URL contains ?edit=BREEDER_ID
  useEffect(() => {
    const editId = searchParams?.get('edit');
    if (editId) {
      const targetBreeder = breeders.find(b => b.id === editId);
      if (targetBreeder) {
        openEditModal(targetBreeder);
      }
    }
  }, [searchParams, breeders]);

  const openCreateModal = () => {
    setEditingBreeder(null);
    setName('');
    setCode('');
    setPhone('');
    setEmail('');
    setAddress('');
    setProvince('');
    setDistrict('');
    setCommune('');
    setVillage('');
    setStatus('Active');
    setNotes('');
    setImageUrl('');
    setNationalId('');
    setIdFrontUrl('');
    setIdBackUrl('');
    setCreateAccount(true);
    setAccountEmail('');
    setAccountPassword('');
    setConfirmPassword('');
    setAccountStatus('Active');
    setUserLevel('Professional Breeder Account');
    setIsModalOpen(true);
  };

  const openEditModal = (brd: BreederItem) => {
    setEditingBreeder(brd);
    setName(brd.name);
    setCode(brd.code);
    setPhone(brd.phone || '');
    setEmail(brd.email || '');
    setAddress(brd.address || '');
    setProvince(brd.province || '');
    setDistrict(brd.district || '');
    setCommune(brd.commune || '');
    setVillage(brd.village || '');
    setStatus(brd.status || 'Active');
    setNotes(brd.notes || '');
    setImageUrl(brd.imageUrl || '');
    setNationalId(brd.nationalId || '');
    setIdFrontUrl(brd.idFrontUrl || '');
    setIdBackUrl(brd.idBackUrl || '');
    
    const hasUser = Boolean(brd.userId || brd.accountEmail);
    setCreateAccount(hasUser);
    setAccountEmail(brd.accountEmail || brd.email || '');
    setAccountPassword('');
    setConfirmPassword('');
    setAccountStatus((brd.accountStatus as any) || 'Active');
    setUserLevel((brd.userLevel as any) || 'Professional Breeder Account');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (createAccount && accountPassword.trim()) {
      if (accountPassword.trim().length < 6) {
        showToast('error', 'Password must be at least 6 characters long.');
        return;
      }
      if (accountPassword.trim() !== confirmPassword.trim()) {
        showToast('error', 'Passwords do not match. Please verify your confirm password.');
        return;
      }
    } else if (createAccount && !editingBreeder && !accountPassword.trim()) {
      showToast('error', 'Initial password is required when creating a new login account.');
      return;
    }

    setSaving(true);

    try {
      const payload = {
        name: name.trim(),
        code: code.trim() || undefined,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        address: address.trim() || undefined,
        province: province.trim() || undefined,
        district: district.trim() || undefined,
        commune: commune.trim() || undefined,
        village: village.trim() || undefined,
        imageUrl: imageUrl.trim() || undefined,
        nationalId: nationalId.trim() || undefined,
        idFrontUrl: idFrontUrl.trim() || undefined,
        idBackUrl: idBackUrl.trim() || undefined,
        notes: notes.trim() || undefined,
        status,
        createAccount,
        accountEmail: createAccount ? (accountEmail.trim() || email.trim()) : undefined,
        accountPassword: createAccount && accountPassword.trim() ? accountPassword.trim() : undefined,
        accountStatus: createAccount ? accountStatus : undefined,
        userLevel: createAccount ? userLevel : undefined
      };

      if (editingBreeder) {
        const res = await updateBreederAction(editingBreeder.id, payload);
        if (res.success && res.data) {
          setBreeders(prev => prev.map(b => b.id === editingBreeder.id ? { ...b, ...res.data } : b));
          showToast('success', `Breeder "${name}" updated successfully.`);
          setIsModalOpen(false);
        } else {
          showToast('error', res.error || 'Failed to update breeder profile.');
        }
      } else {
        const res = await createBreederAction(payload);
        if (res.success && res.data) {
          setBreeders(prev => [res.data, ...prev]);
          showToast('success', `Breeder "${name}" created successfully.`);
          setIsModalOpen(false);
        } else {
          showToast('error', res.error || 'Failed to create breeder account.');
        }
      }
    } catch (err: any) {
      showToast('error', err.message || 'An error occurred.');
    } finally {
      setSaving(false);
    }
  };

  const filteredBreeders = useMemo(() => {
    return breeders.filter(b => {
      const matchesSearch = !search ||
        b.name.toLowerCase().includes(search.toLowerCase()) ||
        b.code.toLowerCase().includes(search.toLowerCase()) ||
        (b.phone || '').toLowerCase().includes(search.toLowerCase()) ||
        (b.email || '').toLowerCase().includes(search.toLowerCase()) ||
        (b.province || '').toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === 'All' || b.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [breeders, search, statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  const totalCount = filteredBreeders.length;
  const paginatedBreeders = useMemo(() => {
    return filteredBreeders.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  }, [filteredBreeders, currentPage, pageSize]);

  const breederExportColumns = [
    { header: 'Breeder ID', key: 'id' },
    { header: 'Breeder Code', key: 'code' },
    { header: 'Breeder Name', key: 'name' },
    { header: 'Phone', key: 'phone' },
    { header: 'Email', key: 'email' },
    { header: 'Province', key: 'province' },
    { header: 'Status', key: 'status' },
    { header: 'Account Email', key: 'accountEmail' },
    { header: 'User Level', key: 'userLevel' }
  ];

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

      {/* ── Page Header (Farm Station Standard) ────────────────── */}
      <PageHeader
        title="Breeder Account Management"
        subtitle="Manage breeder profiles, login user accounts, assigned user levels, and managed customer relationships."
        breadcrumbs={[{ label: 'Breeders' }]}
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search Breeder Name, Code, Phone, Province..."
        onActionClick={openCreateModal}
        actionLabel="+ Add New Breeder Account"
      >
        <div className="flex items-center gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs font-semibold rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-600 cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          <GlobalExport
            filenamePrefix="breeder-accounts"
            columns={breederExportColumns}
            currentPageData={paginatedBreeders}
            fetchAllFilteredData={async () => filteredBreeders}
          />
        </div>
      </PageHeader>

      {/* ── Farm Station Standard 5-Column Grid ────────────────── */}
      {filteredBreeders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center my-6">
          <Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Breeders Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            No breeder records match your search filter. Create a new breeder.
          </p>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 bg-purple-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl mt-4 hover:bg-purple-700 transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>+ Add New Breeder Account</span>
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {paginatedBreeders.map((breeder) => (
              <Link
                key={breeder.id}
                href={`/breeders/${breeder.id}`}
                className="group bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-xl hover:border-purple-600 transition-all duration-200 overflow-hidden flex flex-col justify-between cursor-pointer p-3.5"
              >
                <div>
                  <div className="relative mb-3">
                    <StandardAnimalImage src={breeder.imageUrl} alt={breeder.name} />
                    <span className="absolute top-2.5 left-2.5 bg-slate-900/80 backdrop-blur-md text-white font-black text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      {breeder.code || breeder.id}
                    </span>
                    <span className={`absolute top-2.5 right-2.5 font-black text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs ${
                      breeder.status === 'Active' ? 'bg-emerald-600 text-white' : 'bg-slate-600 text-white'
                    }`}>
                      {breeder.status}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-slate-900 group-hover:text-purple-600 transition-colors truncate">
                      {breeder.name}
                    </h3>
                    <p className="text-xs font-extrabold text-purple-700 truncate">{breeder.province || 'Phnom Penh'}</p>

                    <div className="mt-2.5 space-y-1 text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-medium">Account:</span>
                        <span className="font-bold text-slate-800 truncate max-w-[110px]">
                          {breeder.accountEmail ? breeder.accountEmail.split('@')[0] : 'No Account'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-medium">User Level:</span>
                        <span className="font-bold text-purple-800 truncate max-w-[110px]">
                          {breeder.userLevel || 'Professional'}
                        </span>
                      </div>
                      <div className="flex justify-between border-t border-slate-200/60 pt-1 mt-1">
                        <span className="font-extrabold text-slate-500">Customers:</span>
                        <span className="font-black text-slate-900">{breeder.customerCount || 0} Records</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-purple-600">
                  <span>View Breeder Profile</span>
                  <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                </div>
              </Link>
            ))}
          </div>

          <GlobalPagination
            currentPage={currentPage}
            pageSize={pageSize}
            totalCount={totalCount}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        </>
      )}

      {/* ── 4-Section Create / Edit Modal (Aligned with Farm Station) ───────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 space-y-6 border border-slate-200 my-8 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-150">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest block">Account & Profile Setup</span>
                <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  {editingBreeder ? 'Edit Breeder Profile' : 'Create New Breeder User Account'}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 text-xs">
              
              {/* SECTION 1 — BREEDER INFORMATION */}
              <div className="space-y-3.5 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80">
                <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2">
                  <span className="h-5 w-5 rounded-md bg-purple-600 text-white font-black text-[11px] flex items-center justify-center">1</span>
                  <h4 className="font-black text-slate-900 uppercase text-[11px] tracking-wider">SECTION 1 — BREEDER INFORMATION</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. Sokha Vannak"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-bold focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Breeder Reg. Code</label>
                    <input
                      type="text"
                      value={code}
                      onChange={e => setCode(e.target.value.toUpperCase())}
                      placeholder="e.g. BRD-101"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Contact Phone</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="e.g. 012 999 888"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Contact Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="e.g. sokha@snrfarm.com"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
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
                      placeholder="e.g. Phnom Penh"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 block text-[10.5px]">District</label>
                    <input
                      type="text"
                      value={district}
                      onChange={e => setDistrict(e.target.value)}
                      placeholder="e.g. Chamkarmon"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 block text-[10.5px]">Commune</label>
                    <input
                      type="text"
                      value={commune}
                      onChange={e => setCommune(e.target.value)}
                      placeholder="e.g. Tonle Bassac"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 block text-[10.5px]">Village</label>
                    <input
                      type="text"
                      value={village}
                      onChange={e => setVillage(e.target.value)}
                      placeholder="e.g. Village 4"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Full Address & Notes</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Optional address, description, notes..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                  />
                </div>
              </div>

              {/* SECTION 2 — BREEDER IMAGE */}
              <div className="space-y-3.5 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80">
                <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2">
                  <span className="h-5 w-5 rounded-md bg-purple-600 text-white font-black text-[11px] flex items-center justify-center">2</span>
                  <h4 className="font-black text-slate-900 uppercase text-[11px] tracking-wider">SECTION 2 — BREEDER IMAGE</h4>
                </div>

                <ImageUploadContainer
                  value={imageUrl}
                  onChange={(url) => setImageUrl(url)}
                  aspectRatio="1:1"
                  placeholder="Upload or Capture Breeder Photo"
                  label="Breeder Profile Image (1:1 Standardized HD)"
                />
              </div>

              {/* SECTION 3 — IDENTIFICATION */}
              <div className="space-y-3.5 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80">
                <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2">
                  <span className="h-5 w-5 rounded-md bg-purple-600 text-white font-black text-[11px] flex items-center justify-center">3</span>
                  <h4 className="font-black text-slate-900 uppercase text-[11px] tracking-wider">SECTION 3 — IDENTIFICATION & CARDS</h4>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">National ID / Verification No.</label>
                    <input
                      type="text"
                      value={nationalId}
                      onChange={e => setNationalId(e.target.value)}
                      placeholder="e.g. ID-KH-900800"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <DynamicUpload
                      label="National ID Card (Front Photo)"
                      value={idFrontUrl}
                      onChange={(url) => setIdFrontUrl(url)}
                      targetSizeText="ID Front Photo (Auto-optimized & compressed)"
                    />
                    <DynamicUpload
                      label="National ID Card (Back Photo)"
                      value={idBackUrl}
                      onChange={(url) => setIdBackUrl(url)}
                      targetSizeText="ID Back Photo (Auto-optimized & compressed)"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 4 — LOGIN ACCOUNT */}
              <div className="space-y-3.5 bg-indigo-50/60 p-4 rounded-2xl border border-indigo-200/80">
                <div className="flex items-center justify-between border-b border-indigo-200/80 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="h-5 w-5 rounded-md bg-indigo-600 text-white font-black text-[11px] flex items-center justify-center">4</span>
                    <h4 className="font-black text-indigo-950 uppercase text-[11px] tracking-wider">SECTION 4 — LOGIN ACCOUNT & PASSWORD MANAGEMENT</h4>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-1 rounded-xl border border-indigo-200 text-xs font-bold text-indigo-900 shadow-2xs">
                    <input
                      type="checkbox"
                      checked={createAccount}
                      onChange={e => setCreateAccount(e.target.checked)}
                      className="h-4 w-4 text-indigo-600 rounded border-indigo-300 focus:ring-indigo-500"
                    />
                    <span>{editingBreeder ? 'Enable Login Account' : 'Create Login Account'}</span>
                  </label>
                </div>

                {createAccount ? (
                  <div className="space-y-3 pt-1">
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
                        placeholder="e.g. sokha.breeder@snrfarm.com"
                        className="w-full px-3.5 py-2 rounded-xl border border-indigo-300 font-bold text-indigo-950 focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="font-bold text-indigo-900 block flex items-center gap-1.5">
                          <Lock className="h-3.5 w-3.5 text-indigo-600" />
                          <span>{editingBreeder ? 'New Password (Optional)' : 'Password *'}</span>
                        </label>
                        <input
                          type="password"
                          required={createAccount && !editingBreeder}
                          value={accountPassword}
                          onChange={e => setAccountPassword(e.target.value)}
                          placeholder={editingBreeder ? "Leave blank to keep existing" : "••••••••••••"}
                          className="w-full px-3.5 py-2 rounded-xl border border-indigo-300 font-medium text-indigo-950 focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-indigo-900 block flex items-center gap-1.5">
                          <Lock className="h-3.5 w-3.5 text-indigo-600" />
                          <span>Confirm {editingBreeder ? 'New ' : ''}Password</span>
                        </label>
                        <input
                          type="password"
                          required={createAccount && !editingBreeder && accountPassword.length > 0}
                          value={confirmPassword}
                          onChange={e => setConfirmPassword(e.target.value)}
                          placeholder={editingBreeder ? "Leave blank to keep existing" : "••••••••••••"}
                          className="w-full px-3.5 py-2 rounded-xl border border-indigo-300 font-medium text-indigo-950 focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white"
                        />
                      </div>
                    </div>
                    {editingBreeder && (
                      <p className="text-[10.5px] text-slate-500 font-medium italic">
                        💡 Leave password fields empty to keep the breeder&apos;s current password unchanged.
                      </p>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="font-bold text-indigo-900 block">Account Level</label>
                        <select
                          value={userLevel}
                          onChange={e => setUserLevel(e.target.value as any)}
                          className="w-full px-3.5 py-2 rounded-xl border border-indigo-300 font-bold text-indigo-950 focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white cursor-pointer"
                        >
                          <option value="Professional Breeder Account">🩺 Breeder Account (LEVEL-01)</option>
                          <option value="Senior Breeder Account">👑 Senior Breeder Account (LEVEL-01)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-indigo-900 block">Account Status</label>
                        <select
                          value={accountStatus}
                          onChange={e => setAccountStatus(e.target.value as any)}
                          className="w-full px-3.5 py-2 rounded-xl border border-indigo-300 font-bold text-indigo-950 focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white cursor-pointer"
                        >
                          <option value="Active">🟢 Active (Authorized to log in)</option>
                          <option value="Inactive">⚪ Inactive (Deactivated account)</option>
                          <option value="Suspended">🔴 Suspended (Temporarily blocked)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] font-medium text-slate-500 italic py-1">
                    Check the box above to enable a login account for this Breeder.
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
                  {saving ? 'Saving Breeder Account...' : (editingBreeder ? 'Update Breeder Account' : 'Create Breeder Account')}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
