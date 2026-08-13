'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/common/PageHeader';
import {
  Building2, Plus, Search, Globe, Phone, Mail,
  MapPin, ExternalLink, Edit3, X, CheckCircle2,
  Dna, Beef, RefreshCw, Globe2, Star, Award, AlertTriangle,
  Upload, Image as ImageIcon, ShieldCheck, UserCheck, Eye
} from 'lucide-react';
import {
  fetchSourcingCompaniesAction,
  createSourcingCompanyAction,
  updateSourcingCompanyAction,
  fetchSourcingCompanySiresAction
} from '@/app/actions';

type Company = {
  id: string;
  code: string;
  name: string;
  country: string;
  contactName: string;
  phone: string;
  email: string;
  address: string;
  website: string;
  imageUrl: string | null;
  notes: string;
  status: 'Active' | 'Inactive';
  sireCount: number;
  stockCount: number;
};

const FLAG_MAP: Record<string, string> = {
  'USA': '🇺🇸', 'United States': '🇺🇸',
  'Canada': '🇨🇦',
  'Netherlands': '🇳🇱',
  'Australia': '🇦🇺',
  'Japan': '🇯🇵',
  'Cambodia': '🇰🇭',
  'France': '🇫🇷',
  'United Kingdom': '🇬🇧',
  'Germany': '🇩🇪',
  'New Zealand': '🇳🇿',
  'Brazil': '🇧🇷',
  'Argentina': '🇦🇷',
  'Thailand': '🇹🇭',
  'Vietnam': '🇻🇳',
};

const COUNTRIES = [
  'Cambodia', 'USA', 'Canada', 'Australia', 'Japan', 'France', 'Germany',
  'Netherlands', 'United Kingdom', 'New Zealand', 'Brazil', 'Argentina', 'Thailand',
  'Vietnam', 'China', 'India', 'South Korea',
];

export default function SourcingCompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [countryFilter, setCountryFilter] = useState<string>('All');

  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Company | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [companySires, setCompanySires] = useState<any[]>([]);
  const [siresLoading, setSiresLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Toast feedback
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form state
  const [form, setForm] = useState({
    name: '',
    code: '',
    country: 'Cambodia',
    contactName: '',
    phone: '',
    email: '',
    address: '',
    website: '',
    notes: '',
    imageUrl: '',
    status: 'Active' as 'Active' | 'Inactive',
  });

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  useEffect(() => { loadCompanies(); }, []);

  async function loadCompanies() {
    setLoading(true);
    const res = await fetchSourcingCompaniesAction();
    if (res.success && Array.isArray(res.data)) {
      setCompanies(res.data);
    } else {
      showToast('error', res.error || 'Failed to load sourcing companies.');
    }
    setLoading(false);
  }

  async function handleSelectCompany(c: Company) {
    if (selectedCompany?.id === c.id) {
      setSelectedCompany(null);
      return;
    }
    setSelectedCompany(c);
    setSiresLoading(true);
    const res = await fetchSourcingCompanySiresAction(c.id);
    if (res.success && Array.isArray(res.data)) {
      setCompanySires(res.data);
    } else {
      setCompanySires([]);
    }
    setSiresLoading(false);
  }

  function openCreate() {
    setEditTarget(null);
    setForm({
      name: '',
      code: '',
      country: 'Cambodia',
      contactName: '',
      phone: '',
      email: '',
      address: '',
      website: '',
      notes: '',
      imageUrl: '',
      status: 'Active',
    });
    setShowModal(true);
  }

  function openEdit(c: Company) {
    setEditTarget(c);
    setForm({
      name: c.name,
      code: c.code || '',
      country: c.country || 'Cambodia',
      contactName: c.contactName || '',
      phone: c.phone || '',
      email: c.email || '',
      address: c.address || '',
      website: c.website || '',
      notes: c.notes || '',
      imageUrl: c.imageUrl || '',
      status: c.status || 'Active',
    });
    setShowModal(true);
  }

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  async function handleSave() {
    if (!form.name.trim()) {
      showToast('error', 'Company Name is required.');
      return;
    }
    setSaving(true);
    try {
      if (editTarget) {
        const res = await updateSourcingCompanyAction(editTarget.id, form);
        if (res.success) {
          showToast('success', `Sourcing Company "${form.name}" updated successfully.`);
          setShowModal(false);
          await loadCompanies();
        } else {
          showToast('error', res.error || 'Failed to update sourcing company.');
        }
      } else {
        const res = await createSourcingCompanyAction(form);
        if (res.success) {
          showToast('success', `Sourcing Company "${form.name}" created successfully.`);
          setShowModal(false);
          await loadCompanies();
        } else {
          showToast('error', res.error || 'Failed to create sourcing company.');
        }
      }
    } catch (e: any) {
      showToast('error', e.message || 'An unexpected error occurred.');
    } finally {
      setSaving(false);
    }
  }

  const filtered = useMemo(() => {
    return companies.filter(c => {
      const matchSearch = !searchQuery ||
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.code || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.country || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.contactName || '').toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchStatus = statusFilter === 'All' || c.status === statusFilter;
      const matchCountry = countryFilter === 'All' || c.country === countryFilter;
      return matchSearch && matchStatus && matchCountry;
    });
  }, [companies, searchQuery, statusFilter, countryFilter]);

  const availableCountries = Array.from(new Set(companies.map(c => c.country).filter(Boolean)));
  const activeCount = companies.filter(c => c.status === 'Active').length;
  const totalSires = companies.reduce((sum, c) => sum + (c.sireCount || 0), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 max-w-sm p-4 rounded-2xl shadow-2xl border text-xs font-bold flex items-start gap-3 animate-in fade-in duration-200 ${
          toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" /> : <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />}
          <span className="flex-1">{toast.message}</span>
          <button onClick={() => setToast(null)} className="opacity-60 hover:opacity-100">✕</button>
        </div>
      )}

      {/* Page Header Standard */}
      <PageHeader
        title="Genetics Sourcing Companies"
        subtitle="Manage global sire genetics suppliers, registration parameters, contact profiles, and imported semen stock."
        breadcrumbs={[{ label: 'Account Management' }, { label: 'Sourcing Companies' }]}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search Company Name, Code, Country, Contact..."
        onActionClick={openCreate}
        actionLabel="+ Add New Sourcing Company"
      >
        <div className="flex flex-wrap items-center gap-2">
          {/* Country Filter */}
          <select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs font-semibold rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#dc5c15]"
          >
            <option value="All">All Countries</option>
            {availableCountries.map(c => (
              <option key={c} value={c}>{FLAG_MAP[c] || '🌏'} {c}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-slate-50 border border-slate-200 text-xs font-semibold rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#dc5c15]"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active Partners</option>
            <option value="Inactive">Inactive Partners</option>
          </select>

          <button
            onClick={loadCompanies}
            title="Refresh List"
            className="p-2 bg-slate-50 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </PageHeader>

      {/* KPI Stats Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-2xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Total Companies</span>
            <div className="text-2xl font-black text-slate-900 mt-0.5">{companies.length}</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-2xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Active Partners</span>
            <div className="text-2xl font-black text-slate-900 mt-0.5">{activeCount}</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-2xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-orange-50 text-[#dc5c15] flex items-center justify-center shrink-0">
            <Dna className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Total Sires Sourced</span>
            <div className="text-2xl font-black text-slate-900 mt-0.5">{totalSires}</div>
          </div>
        </div>
      </div>

      {/* Main Grid View + Detail Side Panel */}
      <div className={`grid grid-cols-1 ${selectedCompany ? 'lg:grid-cols-3' : 'grid-cols-1'} gap-6`}>
        {/* Company Cards Section */}
        <div className={selectedCompany ? 'lg:col-span-2' : ''}>
          {loading ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center">
              <RefreshCw className="h-8 w-8 text-[#dc5c15] animate-spin mx-auto mb-3" />
              <p className="text-xs font-bold text-slate-500">Loading Genetics Sourcing Companies...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center">
              <Building2 className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-black text-slate-800">No Sourcing Companies Found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No company records match your parameters. Click <strong>+ Add New Sourcing Company</strong> to register one.
              </p>
              <button
                onClick={openCreate}
                className="mt-4 bg-[#dc5c15] hover:bg-orange-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors inline-flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add Sourcing Company</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map(company => {
                const isSelected = selectedCompany?.id === company.id;
                return (
                  <div
                    key={company.id}
                    className={`bg-white border rounded-3xl p-5 transition-all relative flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#dc5c15] ring-2 ring-[#dc5c15]/20 shadow-md'
                        : 'border-slate-200/90 hover:border-slate-300 hover:shadow-2xs'
                    }`}
                  >
                    <div>
                      {/* Top Header Row */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <Link href={`/sourcing-companies/${company.id}`} className="flex items-center gap-3 group/link flex-1 min-w-0">
                          {company.imageUrl ? (
                            <img src={company.imageUrl} alt={company.name} className="h-11 w-11 rounded-2xl object-cover border border-slate-200 shrink-0 group-hover/link:scale-105 transition-transform" />
                          ) : (
                            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-xs shrink-0 group-hover/link:scale-105 transition-transform">
                              {FLAG_MAP[company.country] || '🌏'}
                            </div>
                          )}
                          <div className="min-w-0">
                            <h3 className="text-xs font-black text-slate-900 group-hover/link:text-[#dc5c15] transition-colors truncate">{company.name}</h3>
                            <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1 mt-0.5">
                              <Globe2 className="h-3 w-3 text-slate-400" />
                              {company.country || 'Global'}
                            </span>
                          </div>
                        </Link>

                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0 ${
                          company.status === 'Active'
                            ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                            : 'bg-slate-100 border border-slate-200 text-slate-500'
                        }`}>
                          {company.status}
                        </span>
                      </div>

                      {/* Stat Counters */}
                      <div className="grid grid-cols-2 gap-2 my-3">
                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-2 text-center">
                          <span className="text-[10px] font-bold text-slate-400 block">Sires</span>
                          <span className="text-xs font-black text-slate-900">{company.sireCount || 0}</span>
                        </div>
                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-2 text-center">
                          <span className="text-[10px] font-bold text-slate-400 block">Stock Logs</span>
                          <span className="text-xs font-black text-slate-900">{company.stockCount || 0}</span>
                        </div>
                      </div>

                      {/* Info Details */}
                      <div className="space-y-1 text-[11px] text-slate-600 border-t border-slate-100 pt-3">
                        {company.contactName && (
                          <div className="flex items-center gap-2">
                            <Star className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                            <span className="truncate">{company.contactName}</span>
                          </div>
                        )}
                        {company.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{company.phone}</span>
                          </div>
                        )}
                        {company.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{company.email}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-1.5">
                      <Link
                        href={`/sourcing-companies/${company.id}`}
                        className="flex-1 py-1.5 px-2 bg-purple-50 hover:bg-purple-100 text-purple-700 text-[11px] font-bold rounded-xl transition-colors flex items-center justify-center gap-1 border border-purple-200"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>View Detail</span>
                      </Link>
                      <button
                        onClick={(e) => { e.stopPropagation(); openEdit(company); }}
                        className="py-1.5 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold rounded-xl transition-colors flex items-center justify-center gap-1"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        <span>Edit</span>
                      </button>
                      {company.website && (
                        <a
                          href={company.website}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
                          title="Visit Official Website"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Company Detail Side Panel */}
        {selectedCompany && (
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xs space-y-5 h-fit sticky top-6 animate-in slide-in-from-right-4 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-[#dc5c15]" />
                <span>Company Details</span>
              </h3>
              <button
                onClick={() => setSelectedCompany(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="text-center">
              {selectedCompany.imageUrl ? (
                <img src={selectedCompany.imageUrl} alt={selectedCompany.name} className="h-16 w-16 rounded-2xl object-cover border border-slate-200 mx-auto mb-3" />
              ) : (
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-black text-3xl mx-auto mb-3 shadow-xs">
                  {FLAG_MAP[selectedCompany.country] || '🌏'}
                </div>
              )}
              <h4 className="text-base font-black text-slate-900">{selectedCompany.name}</h4>
              <p className="text-xs text-slate-500 font-bold mt-0.5">{selectedCompany.country}</p>
              <span className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-black uppercase mt-2 ${
                selectedCompany.status === 'Active'
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                  : 'bg-slate-100 border border-slate-200 text-slate-500'
              }`}>
                {selectedCompany.status}
              </span>
            </div>

            <div className="space-y-2 text-xs border-t border-slate-100 pt-4">
              {selectedCompany.contactName && (
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Contact Person</span>
                  <span className="font-bold text-slate-800">{selectedCompany.contactName}</span>
                </div>
              )}
              {selectedCompany.phone && (
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Phone Number</span>
                  <span className="font-bold text-slate-800">{selectedCompany.phone}</span>
                </div>
              )}
              {selectedCompany.email && (
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Email Address</span>
                  <span className="font-bold text-slate-800">{selectedCompany.email}</span>
                </div>
              )}
              {selectedCompany.address && (
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Physical Address</span>
                  <span className="font-medium text-slate-700">{selectedCompany.address}</span>
                </div>
              )}
              {selectedCompany.website && (
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Official Website</span>
                  <a href={selectedCompany.website} target="_blank" rel="noreferrer" className="font-bold text-[#dc5c15] hover:underline break-all">
                    {selectedCompany.website}
                  </a>
                </div>
              )}
            </div>

            {/* Registered Sires List */}
            <div className="border-t border-slate-100 pt-4">
              <h5 className="text-xs font-black text-slate-900 flex items-center gap-1.5 mb-3">
                <Dna className="h-4 w-4 text-[#dc5c15]" />
                <span>Registered Sires ({selectedCompany.sireCount || 0})</span>
              </h5>
              {siresLoading ? (
                <div className="text-center py-6 text-slate-400 text-xs font-bold">Loading sires...</div>
              ) : companySires.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs italic">No registered sires from this company yet.</div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {companySires.map((sire: any) => (
                    <div key={sire.id} className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-black text-slate-900 block">{sire.name}</span>
                        <span className="text-[10px] text-slate-500">{sire.breed}</span>
                      </div>
                      {sire.price_usd && (
                        <span className="font-black text-[#dc5c15] text-xs">${sire.price_usd}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => openEdit(selectedCompany)}
              className="w-full bg-[#dc5c15] hover:bg-orange-700 text-white text-xs font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              <Edit3 className="h-4 w-4" />
              <span>Edit Company Profile</span>
            </button>
          </div>
        )}
      </div>

      {/* Create / Edit Modal Dialog */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider">
                  {editTarget ? 'Edit Sourcing Company' : 'Add New Sourcing Company'}
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Global Sire Genetics & Semen Supplier Profile
                </p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
              {/* Media Logo Upload Section */}
              <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-extrabold text-slate-800 flex items-center gap-1.5">
                    <ImageIcon className="h-4 w-4 text-[#dc5c15]" />
                    <span>Company Logo / Reference Photo</span>
                  </label>
                  {form.imageUrl && (
                    <button
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, imageUrl: '' }))}
                      className="text-[10px] text-rose-600 font-bold hover:underline"
                    >
                      Remove Logo
                    </button>
                  )}
                </div>

                {form.imageUrl ? (
                  <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-slate-200">
                    <img src={form.imageUrl} alt="Company Logo Preview" className="h-14 w-14 rounded-lg object-cover border border-slate-200 shrink-0" />
                    <div className="flex-1 truncate">
                      <p className="text-[11px] font-bold text-slate-800 truncate">Logo Uploaded</p>
                      <p className="text-[10px] text-slate-400 truncate">Saved directly to company profile</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <label className="cursor-pointer bg-white border border-slate-200 rounded-xl p-3 text-center hover:border-orange-400 transition-all block">
                      <Upload className="h-5 w-5 text-slate-400 mx-auto mb-1" />
                      <span className="text-[11px] font-bold text-slate-700 block">Upload Logo File</span>
                      <input type="file" accept="image/*" onChange={handleImageFileChange} className="hidden" />
                    </label>
                    <div className="bg-white border border-slate-200 rounded-xl p-2.5 flex items-center">
                      <input
                        type="url"
                        placeholder="Paste Logo URL..."
                        value={form.imageUrl}
                        onChange={(e) => setForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                        className="w-full text-[11px] font-medium bg-transparent focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Company Name & Code */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Company Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. ABS Global Inc."
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#dc5c15] focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Country of Origin</label>
                  <select
                    value={form.country}
                    onChange={(e) => setForm({ ...form, country: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#dc5c15] focus:outline-none"
                  >
                    {COUNTRIES.map(c => (
                      <option key={c} value={c}>{FLAG_MAP[c] || '🌏'} {c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#dc5c15] focus:outline-none"
                  >
                    <option value="Active">Active Partner</option>
                    <option value="Inactive">Inactive Partner</option>
                  </select>
                </div>
              </div>

              {/* Contact Person */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Contact Person Name</label>
                <input
                  type="text"
                  placeholder="Primary contact representative..."
                  value={form.contactName}
                  onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-[#dc5c15] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+1 800 000 0000"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-[#dc5c15] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="info@company.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-[#dc5c15] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Official Website</label>
                <input
                  type="url"
                  placeholder="https://www.company.com"
                  value={form.website}
                  onChange={(e) => setForm({ ...form, website: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-[#dc5c15] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Physical Address</label>
                <input
                  type="text"
                  placeholder="Full office or station address..."
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-[#dc5c15] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Notes / Description</label>
                <textarea
                  rows={2}
                  placeholder="Optional company description, genetics specialty, or notes..."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-[#dc5c15] focus:outline-none resize-none"
                />
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 flex items-center justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2 bg-[#dc5c15] text-white text-xs font-bold rounded-xl hover:bg-orange-700 transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50"
              >
                {saving ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <ShieldCheck className="h-4 w-4" />
                )}
                <span>{editTarget ? 'Update Company Profile' : 'Save Sourcing Company'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
