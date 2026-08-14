'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/common/PageHeader';
import StandardAnimalImage from '@/components/common/StandardAnimalImage';
import {
  Users, Search, ShieldCheck, Beef, CheckCircle2, AlertTriangle,
  Clock, XCircle, FileText, Check, X, Phone, Mail, MapPin, Eye, Plus,
  Edit, ToggleLeft, ToggleRight, UserCheck, Heart, Award, ArrowUpRight,
  Building, Edit3, Trash2
} from 'lucide-react';
import {
  createCustomerAction,
  updateCustomerAction,
  toggleCustomerStatusAction
} from '@/app/actions';
import { DynamicUpload } from '@/components/common/DynamicUpload';
import ImageUploadContainer from '@/components/common/ImageUploadContainer';
import GlobalPagination from '@/components/common/GlobalPagination';
import GlobalExport from '@/components/common/GlobalExport';

interface CustomerItem {
  id: string;
  code?: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  farmLocation?: string;
  province?: string;
  district?: string;
  commune?: string;
  village?: string;
  imageUrl?: string;
  nationalId?: string;
  idFrontUrl?: string;
  idBackUrl?: string;
  idVerificationStatus?: string;
  customerType?: string;
  notes?: string;
  status: 'Active' | 'Inactive';
  managedByBreederId?: string;
  managedByBreederName?: string;
  animalCount: number;
  breedingCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface Props {
  initialCustomers: CustomerItem[];
}

export default function CustomersListClient({ initialCustomers }: Props) {
  const [customers, setCustomers] = useState<CustomerItem[]>(initialCustomers);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [breederFilter, setBreederFilter] = useState<string>('All');
  const [idVerificationFilter, setIdVerificationFilter] = useState<string>('All');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerItem | null>(null);

  // Form State (3 Sections — NO LOGIN ACCOUNT)
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [customerType, setCustomerType] = useState('Individual Owner');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [province, setProvince] = useState('');
  const [district, setDistrict] = useState('');
  const [commune, setCommune] = useState('');
  const [village, setVillage] = useState('');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
  const [notes, setNotes] = useState('');
  
  // Section 2: Identification
  const [nationalId, setNationalId] = useState('');
  const [idFrontUrl, setIdFrontUrl] = useState('');
  const [idBackUrl, setIdBackUrl] = useState('');
  const [idVerificationStatus, setIdVerificationStatus] = useState('Verified');

  // Section 3: Customer Image
  const [imageUrl, setImageUrl] = useState('');

  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  const openCreateModal = () => {
    setEditingCustomer(null);
    setName('');
    setCode('');
    setCustomerType('Individual Owner');
    setPhone('');
    setEmail('');
    setAddress('');
    setProvince('');
    setDistrict('');
    setCommune('');
    setVillage('');
    setStatus('Active');
    setNotes('');
    setNationalId('');
    setIdFrontUrl('');
    setIdBackUrl('');
    setIdVerificationStatus('Verified');
    setImageUrl('');
    setIsModalOpen(true);
  };

  const openEditModal = (cust: CustomerItem) => {
    setEditingCustomer(cust);
    setName(cust.name);
    setCode(cust.code || cust.id);
    setCustomerType(cust.customerType || 'Individual Owner');
    setPhone(cust.phone || '');
    setEmail(cust.email || '');
    setAddress(cust.address || cust.farmLocation || '');
    setProvince(cust.province || '');
    setDistrict(cust.district || '');
    setCommune(cust.commune || '');
    setVillage(cust.village || '');
    setStatus(cust.status || 'Active');
    setNotes(cust.notes || '');
    setNationalId(cust.nationalId || '');
    setIdFrontUrl(cust.idFrontUrl || '');
    setIdBackUrl(cust.idBackUrl || '');
    setIdVerificationStatus(cust.idVerificationStatus || 'Verified');
    setImageUrl(cust.imageUrl || '');
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
        customerType,
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
        idVerificationStatus: nationalId.trim() ? 'Verified' : 'Pending',
        notes: notes.trim() || undefined,
        status
      };

      if (editingCustomer) {
        const res = await updateCustomerAction(editingCustomer.id, payload);
        if (res.success && res.data) {
          setCustomers(prev => prev.map(c => c.id === editingCustomer.id ? { ...c, ...res.data } : c));
          showToast('success', `Customer "${name}" updated successfully.`);
          setIsModalOpen(false);
        } else {
          showToast('error', res.error || 'Failed to update customer.');
        }
      } else {
        const res = await createCustomerAction(payload, 'BREEDER-01');
        if (res.success && res.data) {
          setCustomers(prev => [res.data, ...prev]);
          showToast('success', `Customer "${name}" created successfully.`);
          setIsModalOpen(false);
        } else {
          showToast('error', res.error || 'Failed to create customer.');
        }
      }
    } catch (err: any) {
      showToast('error', err.message || 'An error occurred.');
    } finally {
      setSaving(false);
    }
  };

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      const matchesSearch = !search ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.code || '').toLowerCase().includes(search.toLowerCase()) ||
        (c.phone || '').toLowerCase().includes(search.toLowerCase()) ||
        (c.email || '').toLowerCase().includes(search.toLowerCase()) ||
        (c.address || '').toLowerCase().includes(search.toLowerCase()) ||
        (c.province || '').toLowerCase().includes(search.toLowerCase()) ||
        (c.managedByBreederName || '').toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
      const matchesType = typeFilter === 'All' || c.customerType === typeFilter;
      const matchesBreeder = breederFilter === 'All' || (c.managedByBreederName || 'System Breeder') === breederFilter;
      const matchesIdVerif = idVerificationFilter === 'All' || (c.idVerificationStatus || 'Pending') === idVerificationFilter;

      return matchesSearch && matchesStatus && matchesType && matchesBreeder && matchesIdVerif;
    });
  }, [customers, search, statusFilter, typeFilter, breederFilter, idVerificationFilter]);

  const availableTypes = Array.from(new Set(customers.map(c => c.customerType || 'Individual Owner')));
  const availableBreeders = Array.from(new Set(customers.map(c => c.managedByBreederName || 'System Breeder')));

  const totalCount = filteredCustomers.length;
  const paginatedCustomers = useMemo(() => {
    return filteredCustomers.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  }, [filteredCustomers, currentPage, pageSize]);

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

      {/* ── Page Header (Farm Station Layout Standard) ────────────────── */}
      <PageHeader
        title="Customer / Cow Owner Management"
        subtitle="Manage cattle owner profiles, contact records, National ID verification, and animal ownership rights."
        breadcrumbs={[{ label: 'Customers' }]}
        searchQuery={search}
        onSearchChange={(q) => { setSearch(q); setCurrentPage(1); }}
        searchPlaceholder="Search Owner Name, Code, Phone, Province, Breeder..."
        onActionClick={openCreateModal}
        actionLabel="+ Add New Customer"
      >
        <div className="flex flex-wrap items-center gap-2">
          {/* Breeder Filter */}
          <select
            value={breederFilter}
            onChange={(e) => { setBreederFilter(e.target.value); setCurrentPage(1); }}
            className="bg-slate-50 border border-slate-200 text-xs font-semibold rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-600 cursor-pointer"
          >
            <option value="All">All Breeders / Creators</option>
            {availableBreeders.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
            className="bg-slate-50 border border-slate-200 text-xs font-semibold rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-600 cursor-pointer"
          >
            <option value="All">All Customer Types</option>
            {availableTypes.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          {/* ID Verification Filter */}
          <select
            value={idVerificationFilter}
            onChange={(e) => { setIdVerificationFilter(e.target.value); setCurrentPage(1); }}
            className="bg-slate-50 border border-slate-200 text-xs font-semibold rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-600 cursor-pointer"
          >
            <option value="All">All ID Statuses</option>
            <option value="Verified">Verified ID</option>
            <option value="Pending">Pending Verification</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="bg-slate-50 border border-slate-200 text-xs font-semibold rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-600 cursor-pointer"
          >
            <option value="All">All Account Statuses</option>
            <option value="Active">Active</option>
          </select>
        </div>
      </PageHeader>

      {/* ── Farm Station Standard 5-Column Grid ────────────────── */}
      {filteredCustomers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center my-6">
          <Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Customers Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            No customer records match your search query. Add a new customer.
          </p>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 bg-purple-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl mt-4 hover:bg-purple-700 transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>+ Add New Customer</span>
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {paginatedCustomers.map((cust) => {
              const ownerName = cust.name;
              const typeLabel = cust.customerType || 'Individual Owner';
              const photoUrl = cust.imageUrl;
              const animalCount = cust.animalCount || 0;

              return (
                <Link
                  key={cust.id}
                  href={`/customers/${cust.id}`}
                  className="group bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-xl hover:border-purple-500 transition-all duration-200 overflow-hidden flex flex-col justify-between cursor-pointer p-3.5"
                >
                  <div>
                    {/* Standard Image Container with Status Badge */}
                    <div className="relative mb-3">
                      <StandardAnimalImage
                        src={photoUrl}
                        alt={ownerName}
                        fallbackText="Cow Owner"
                      />
                      <span className={`absolute top-2.5 right-2.5 font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs ${
                        cust.status === 'Active' ? 'bg-emerald-600 text-white' : 'bg-slate-500 text-white'
                      }`}>
                        {cust.status}
                      </span>
                      {cust.nationalId && (
                        <span className="absolute top-2.5 left-2.5 bg-purple-600 text-white font-black text-[8.5px] px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs flex items-center gap-1">
                          <ShieldCheck className="h-2.5 w-2.5" /> ID Verified
                        </span>
                      )}
                    </div>

                    {/* Title & Metadata Hierarchy */}
                    <div className="space-y-1">
                      <h3 className="text-sm font-black text-slate-900 group-hover:text-purple-600 transition-colors truncate">
                        {ownerName}
                      </h3>
                      <p className="text-xs font-extrabold text-[#dc5c15] truncate">{typeLabel}</p>

                      {/* Specs Box */}
                      <div className="mt-2.5 space-y-1 text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-slate-600">
                        <div className="flex justify-between">
                          <span className="text-slate-400 font-medium">Code:</span>
                          <span className="font-mono font-bold text-purple-700">{cust.code || cust.id}</span>
                        </div>
                        <div className="flex justify-between border-t border-slate-200/60 pt-1 mt-1">
                          <span className="font-extrabold text-slate-500">Phone:</span>
                          <span className="font-bold text-slate-900 truncate max-w-[110px]">{cust.phone || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-extrabold text-slate-500">Location:</span>
                          <span className="font-bold text-slate-800 truncate max-w-[110px]">{cust.province || cust.address || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-extrabold text-slate-500">Owned Cattle:</span>
                          <span className="font-black text-amber-700">{animalCount} heads</span>
                        </div>
                        <div className="flex justify-between items-center border-t border-slate-200/60 pt-1 mt-1">
                          <span className="font-extrabold text-purple-700">Managed By:</span>
                          <span className="font-bold text-purple-900 truncate max-w-[110px] bg-purple-50 px-1.5 py-0.5 rounded border border-purple-100/80 text-[10px]" title={`${cust.managedByBreederName || 'System Breeder'} (${cust.managedByAccountLevel || 'Internal Staff'})`}>
                            {cust.managedByBreederName || 'System Breeder'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Action */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-purple-600">
                    <span>View Customer Profile</span>
                    <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                  </div>
                </Link>
              );
            })}
          </div>

          <GlobalPagination
            currentPage={currentPage}
            pageSize={pageSize}
            totalCount={totalCount}
            onPageChange={setCurrentPage}
            onPageSizeChange={(newSize) => { setPageSize(newSize); setCurrentPage(1); }}
          />
        </>
      )}

      {/* ── 3-Section Create / Edit Modal (NO LOGIN ACCOUNT) ───────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 space-y-6 border border-slate-200 my-8 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-150">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest block">Customer Management</span>
                <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  {editingCustomer ? 'Edit Customer Profile' : 'Create New Customer / Cow Owner'}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 text-xs">
              
              {/* SECTION 1 — CUSTOMER INFORMATION */}
              <div className="space-y-3.5 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80">
                <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2">
                  <span className="h-5 w-5 rounded-md bg-purple-600 text-white font-black text-[11px] flex items-center justify-center">1</span>
                  <h4 className="font-black text-slate-900 uppercase text-[11px] tracking-wider">SECTION 1 — CUSTOMER INFORMATION</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. Sophea Nhek"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-bold focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Customer Code</label>
                    <input
                      type="text"
                      value={code}
                      onChange={e => setCode(e.target.value.toUpperCase())}
                      placeholder="e.g. CUST-101"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Customer Type</label>
                    <select
                      value={customerType}
                      onChange={e => setCustomerType(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-bold focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white cursor-pointer"
                    >
                      <option value="Individual Owner">Individual Owner</option>
                      <option value="Farm Partner">Farm Partner</option>
                      <option value="Commercial Breeder">Commercial Breeder</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Phone Number</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="e.g. 012 915 067"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Contact Email (Contact Information Only — Not Used For Login)</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="e.g. sophea@gmail.com"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                  />
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

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Full Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="Street, Village, Commune, District, Province..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                  />
                </div>
              </div>

              {/* SECTION 2 — IDENTIFICATION */}
              <div className="space-y-3.5 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80">
                <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2">
                  <span className="h-5 w-5 rounded-md bg-purple-600 text-white font-black text-[11px] flex items-center justify-center">2</span>
                  <h4 className="font-black text-slate-900 uppercase text-[11px] tracking-wider">SECTION 2 — IDENTIFICATION</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">National ID Number</label>
                    <input
                      type="text"
                      value={nationalId}
                      onChange={e => setNationalId(e.target.value)}
                      placeholder="e.g. ID-KH-300301"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Verification Status</label>
                    <select
                      value={idVerificationStatus}
                      onChange={e => setIdVerificationStatus(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-bold focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white cursor-pointer"
                    >
                      <option value="Verified">Verified</option>
                      <option value="Pending">Pending</option>
                      <option value="Unverified">Unverified</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 3 — CUSTOMER IMAGE */}
              <div className="space-y-3.5 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80">
                <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2">
                  <span className="h-5 w-5 rounded-md bg-purple-600 text-white font-black text-[11px] flex items-center justify-center">3</span>
                  <h4 className="font-black text-slate-900 uppercase text-[11px] tracking-wider">SECTION 3 — CUSTOMER IMAGE</h4>
                </div>

                <ImageUploadContainer
                  value={imageUrl}
                  onChange={(url) => setImageUrl(url)}
                  aspectRatio="1:1"
                  placeholder="Upload or Capture Cow Owner Photo"
                  label="Customer Profile Image (1:1 Standardized HD)"
                />
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
                  {saving ? 'Saving Customer Record...' : (editingCustomer ? 'Update Customer' : 'Create Customer Record')}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
