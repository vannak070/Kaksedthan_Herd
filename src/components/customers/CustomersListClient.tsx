'use client';

import React, { useState, useMemo } from 'react';
import {
  Users, Search, ShieldCheck, Beef, CheckCircle2, AlertTriangle,
  Clock, XCircle, FileText, Check, X, Phone, Mail, MapPin, Eye
} from 'lucide-react';
import { updateUserNationalIdAction } from '@/app/actions';

interface CustomerItem {
  id: string;
  name: string;
  email: string;
  role: string;
  userLevel?: string;
  status: string;
  phone?: string;
  farmLocation?: string;
  companyName?: string;
  nationalId?: string;
  idFrontUrl?: string;
  idBackUrl?: string;
  idVerificationStatus: 'Pending' | 'Under Review' | 'Verified' | 'Rejected' | 'Action Required';
  animalCount: number;
  createdAt?: string;
}

interface Props {
  initialCustomers: CustomerItem[];
}

const STATUS_BADGES: Record<string, string> = {
  Verified: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Under Review': 'bg-amber-50 text-amber-700 border-amber-200',
  Pending: 'bg-slate-100 text-slate-600 border-slate-200',
  Rejected: 'bg-rose-50 text-rose-700 border-rose-200',
  'Action Required': 'bg-orange-50 text-orange-700 border-orange-200',
};

export default function CustomersListClient({ initialCustomers }: Props) {
  const [customers, setCustomers] = useState<CustomerItem[]>(initialCustomers);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerItem | null>(null);

  // Edit Modal State
  const [nationalId, setNationalId] = useState('');
  const [verificationStatus, setVerificationStatus] = useState<string>('Pending');
  const [idFrontUrl, setIdFrontUrl] = useState('');
  const [idBackUrl, setIdBackUrl] = useState('');

  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  const openVerifyModal = (cust: CustomerItem) => {
    setSelectedCustomer(cust);
    setNationalId(cust.nationalId || '');
    setVerificationStatus(cust.idVerificationStatus || 'Pending');
    setIdFrontUrl(cust.idFrontUrl || '');
    setIdBackUrl(cust.idBackUrl || '');
  };

  const handleSaveVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    setSaving(true);
    try {
      const res = await updateUserNationalIdAction(selectedCustomer.id, {
        nationalId: nationalId.trim(),
        idVerificationStatus: verificationStatus,
        idFrontUrl: idFrontUrl.trim(),
        idBackUrl: idBackUrl.trim()
      });
      if (res.success) {
        setCustomers(prev => prev.map(c => c.id === selectedCustomer.id ? {
          ...c,
          nationalId,
          idVerificationStatus: verificationStatus as any,
          idFrontUrl,
          idBackUrl
        } : c));
        showToast('success', `National ID verification status updated for ${selectedCustomer.name}.`);
        setSelectedCustomer(null);
      } else {
        showToast('error', res.error || 'Failed to update verification status.');
      }
    } catch {
      showToast('error', 'An error occurred while updating status.');
    } finally {
      setSaving(false);
    }
  };

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      const matchesSearch = !search ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase()) ||
        (c.nationalId || '').toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'All' || c.idVerificationStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [customers, search, statusFilter]);

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
        <div className="bg-gradient-to-r from-purple-700 to-indigo-700 p-6 text-white">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-white/70 text-[11px] font-bold uppercase tracking-wider">Farm & Ownership</p>
              <h1 className="text-xl font-black text-white">Customer / Cow Owner Accounts</h1>
              <p className="text-white/70 text-xs font-medium mt-0.5">
                Manage registered cow owners, National ID document verification, and animal ownership rights.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── KPI Summary Cards ────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center">
            <Users className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase">Total Owners</p>
            <p className="text-xl font-black text-slate-900">{customers.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase">ID Verified</p>
            <p className="text-xl font-black text-slate-900">{customers.filter(c => c.idVerificationStatus === 'Verified').length}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center">
            <Clock className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase">Under Review</p>
            <p className="text-xl font-black text-slate-900">{customers.filter(c => c.idVerificationStatus === 'Under Review' || c.idVerificationStatus === 'Pending').length}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
            <Beef className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase">Owned Livestock</p>
            <p className="text-xl font-black text-slate-900">{customers.reduce((s, c) => s + (c.animalCount || 0), 0)}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by owner name, email, or National ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-purple-600"
          />
        </div>
        <div className="flex items-center gap-1.5 text-xs overflow-x-auto">
          {['All', 'Verified', 'Under Review', 'Pending', 'Action Required', 'Rejected'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all whitespace-nowrap ${
                statusFilter === st ? 'bg-purple-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                <th className="py-3.5 px-5">Cow Owner</th>
                <th className="py-3.5 px-5">National ID</th>
                <th className="py-3.5 px-5 text-center">ID Verification</th>
                <th className="py-3.5 px-5 text-center">Owned Animals</th>
                <th className="py-3.5 px-5 text-center">Account Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 font-medium">
                    No customer / cow owner accounts found.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map(cust => (
                  <tr key={cust.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-black text-xs shrink-0">
                          {cust.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-black text-slate-900">{cust.name}</p>
                          <p className="text-[11px] text-slate-500">{cust.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      {cust.nationalId ? (
                        <span className="font-mono text-[11px] font-bold bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg border border-slate-200">
                          {cust.nationalId}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Not provided</span>
                      )}
                    </td>
                    <td className="py-4 px-5 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10.5px] font-black border ${STATUS_BADGES[cust.idVerificationStatus || 'Pending']}`}>
                        {cust.idVerificationStatus || 'Pending'}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-center">
                      <span className="font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-100">
                        {cust.animalCount} animals
                      </span>
                    </td>
                    <td className="py-4 px-5 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${cust.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                        {cust.status}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right">
                      <button
                        onClick={() => openVerifyModal(cust)}
                        className="px-3 py-1.5 rounded-xl bg-purple-700 text-white text-[11px] font-bold hover:bg-purple-800 cursor-pointer shadow-xs"
                      >
                        Manage ID Verification
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Manage National ID Verification Modal ─────── */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 space-y-5 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-purple-700" />
                National ID Verification — {selectedCustomer.name}
              </h3>
              <button onClick={() => setSelectedCustomer(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVerification} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">National ID Number</label>
                <input
                  type="text"
                  value={nationalId}
                  onChange={e => setNationalId(e.target.value)}
                  placeholder="e.g. 010203040506"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-mono font-bold focus:outline-none focus:border-purple-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">Verification Status</label>
                <select
                  value={verificationStatus}
                  onChange={e => setVerificationStatus(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-bold focus:outline-none focus:border-purple-600"
                >
                  <option value="Pending">Pending</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Verified">Verified</option>
                  <option value="Action Required">Action Required</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">National ID Front Image URL</label>
                <input
                  type="text"
                  value={idFrontUrl}
                  onChange={e => setIdFrontUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-medium focus:outline-none focus:border-purple-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">National ID Back Image URL</label>
                <input
                  type="text"
                  value={idBackUrl}
                  onChange={e => setIdBackUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-medium focus:outline-none focus:border-purple-600"
                />
              </div>

              <div className="bg-amber-50 p-3 rounded-xl border border-amber-100 text-[11px] text-amber-900 font-medium">
                🔒 <strong>Privacy Protection:</strong> National ID documents and numbers are encrypted and strictly private. They will <strong>never</strong> be shown on public QR verification pages or certificate exports.
              </div>

              <div className="flex gap-3 justify-end pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedCustomer(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-purple-700 text-white text-xs font-black hover:bg-purple-800 cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Verification Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
