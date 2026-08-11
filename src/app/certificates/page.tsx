'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/common/PageHeader';
import StandardAnimalImage from '@/components/common/StandardAnimalImage';
import { HerdbookCertificateItem, SireItem, DamItem, CalfItem } from '@/types/breeding.types';
import { 
  fetchCertificatesAction, 
  fetchSiresAction, 
  fetchDamsAction, 
  fetchCalvesAction,
  applyCertificateAction,
  approveCertificateAction,
  rejectCertificateAction
} from '@/app/actions';
import { 
  FileText, 
  Award, 
  ShieldCheck, 
  Plus, 
  X as CloseIcon, 
  Loader2, 
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  Search,
  Filter,
  Check,
  Building,
  User,
  Beef,
  ChevronRight,
  AlertTriangle
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CertificatesListPage() {
  const [certs, setCerts] = useState<HerdbookCertificateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('PENDING_APPROVAL'); // Default to PENDING_APPROVAL for Super Admin
  const [activeTab, setActiveTab] = useState<'requests' | 'approved' | 'rejected'>('requests');

  // Apply Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<'Sire' | 'Dam' | 'Calf'>('Sire');
  const [selectedId, setSelectedId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Review Modal State
  const [reviewCert, setReviewCert] = useState<HerdbookCertificateItem | null>(null);
  const [rejecting, setRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [sires, setSires] = useState<SireItem[]>([]);
  const [dams, setDams] = useState<DamItem[]>([]);
  const [calves, setCalves] = useState<CalfItem[]>([]);

  const router = useRouter();

  const loadData = async () => {
    try {
      setLoading(true);
      const [certData, sireData, damData, calfData] = await Promise.all([
        fetchCertificatesAction(),
        fetchSiresAction(),
        fetchDamsAction(),
        fetchCalvesAction()
      ]);
      setCerts(certData);
      setSires(sireData);
      setDams(damData);
      setCalves(calfData);
      if (sireData.length > 0) setSelectedId(sireData[0].id);
    } catch (err) {
      console.error('Failed to load certificates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  const handleTypeChange = (type: 'Sire' | 'Dam' | 'Calf') => {
    setSelectedType(type);
    if (type === 'Sire' && sires.length > 0) setSelectedId(sires[0].id);
    if (type === 'Dam' && dams.length > 0) setSelectedId(dams[0].id);
    if (type === 'Calf' && calves.length > 0) setSelectedId(calves[0].id);
  };

  const handleCreateCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) return;

    try {
      setSubmitting(true);
      const currentUser = { id: 'BREEDER-01', name: 'Sokha Breeder', role: 'Breeder', userType: 'Breeder' };
      const res = await applyCertificateAction({ animalType: selectedType, animalId: selectedId }, currentUser);
      setSubmitting(false);
      setModalOpen(false);
      
      if (res.success) {
        showToast('success', `Certificate application for ${selectedType} (${selectedId}) submitted successfully for Admin approval.`);
        await loadData();
      } else {
        showToast('error', res.error || 'Failed to submit certificate application.');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Failed to create certificate application');
      setSubmitting(false);
    }
  };

  const handleApprove = async (cert: HerdbookCertificateItem) => {
    setActionLoading(true);
    try {
      const adminUser = { id: 'USR-01', name: 'Super Admin', role: 'Admin', userType: 'Admin' };
      const res = await approveCertificateAction(cert.id, adminUser);
      if (res.success) {
        showToast('success', `Certificate Request #${cert.certificateNumber} APPROVED successfully!`);
        setReviewCert(null);
        await loadData();
      } else {
        showToast('error', res.error || 'Failed to approve certificate.');
      }
    } catch (err: any) {
      showToast('error', err.message || 'An error occurred during approval.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewCert || !rejectionReason.trim()) return;

    setActionLoading(true);
    try {
      const adminUser = { id: 'USR-01', name: 'Super Admin', role: 'Admin', userType: 'Admin' };
      const res = await rejectCertificateAction(reviewCert.id, rejectionReason.trim(), adminUser);
      if (res.success) {
        showToast('success', `Certificate Request #${reviewCert.certificateNumber} REJECTED.`);
        setReviewCert(null);
        setRejecting(false);
        setRejectionReason('');
        await loadData();
      } else {
        showToast('error', res.error || 'Failed to reject certificate.');
      }
    } catch (err: any) {
      showToast('error', err.message || 'An error occurred during rejection.');
    } finally {
      setActionLoading(false);
    }
  };

  const pendingCount = certs.filter(c => (c as any).status === 'PENDING_APPROVAL').length;
  const approvedCount = certs.filter(c => (c as any).status === 'APPROVED' || !(c as any).status).length;
  const rejectedCount = certs.filter(c => (c as any).status === 'REJECTED').length;

  const filtered = certs.filter((c) => {
    const status = (c as any).status || 'APPROVED';
    const animalType = c.animalType || (c.calfId ? 'Calf' : c.sireId ? 'Sire' : 'Dam');
    const animalName = c.sireName || c.damName || c.calfName || '';

    const matchesSearch =
      c.certificateNumber.toLowerCase().includes(search.toLowerCase()) ||
      c.registrationId.toLowerCase().includes(search.toLowerCase()) ||
      animalName.toLowerCase().includes(search.toLowerCase()) ||
      (c.ownerName || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.appliedBy || '').toLowerCase().includes(search.toLowerCase()) ||
      c.id.toLowerCase().includes(search.toLowerCase());

    const matchesType = typeFilter === 'All' || animalType === typeFilter;

    let matchesStatus = true;
    if (activeTab === 'requests') {
      matchesStatus = statusFilter === 'All' ? true : status === statusFilter;
    } else if (activeTab === 'approved') {
      matchesStatus = status === 'APPROVED';
    } else if (activeTab === 'rejected') {
      matchesStatus = status === 'REJECTED';
    }

    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2 text-white font-bold text-xs px-4 py-3 rounded-2xl shadow-xl animate-in slide-in-from-top-2 duration-200 ${
          toast.type === 'success' ? 'bg-emerald-900 border border-emerald-500' : 'bg-rose-900 border border-rose-500'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <AlertTriangle className="h-4 w-4 text-rose-400" />}
          <span>{toast.message}</span>
        </div>
      )}

      <PageHeader
        title="Official Certificate Center"
        subtitle="Review, approve, and issue official A4 birth & pedigree certificates for Sires, Dams, and Calves."
        breadcrumbs={[{ label: 'Certificate Center' }]}
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search Cert #, Request ID, Animal Name, Owner, or Breeder..."
      >
        <div className="flex items-center gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#047857]"
          >
            <option value="All">All Animal Types</option>
            <option value="Sire">Sire Certificate</option>
            <option value="Dam">Dam Certificate</option>
            <option value="Calf">Calf Certificate</option>
          </select>

          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-1.5 bg-[#047857] hover:bg-emerald-700 text-white text-xs font-black px-4 py-2 rounded-xl transition-all shadow-md cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Apply Certificate</span>
          </button>
        </div>
      </PageHeader>

      {/* Super Admin Status Tabs Bar */}
      <div className="flex items-center justify-between bg-white rounded-2xl border border-slate-200/90 p-2 shadow-2xs">
        <div className="flex items-center gap-1 overflow-x-auto">
          <button
            type="button"
            onClick={() => { setActiveTab('requests'); setStatusFilter('PENDING_APPROVAL'); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'requests'
                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Clock className="h-4 w-4" />
            <span>Certification Requests</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              activeTab === 'requests' ? 'bg-amber-700 text-white' : 'bg-amber-100 text-amber-900'
            }`}>
              {pendingCount} Pending
            </span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('approved'); setStatusFilter('APPROVED'); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'approved'
                ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Approved Certificates</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              activeTab === 'approved' ? 'bg-emerald-900 text-white' : 'bg-emerald-100 text-emerald-900'
            }`}>
              {approvedCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('rejected'); setStatusFilter('REJECTED'); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'rejected'
                ? 'bg-rose-700 text-white shadow-md shadow-rose-700/20'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <XCircle className="h-4 w-4" />
            <span>Rejected Applications</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              activeTab === 'rejected' ? 'bg-rose-900 text-white' : 'bg-rose-100 text-rose-900'
            }`}>
              {rejectedCount}
            </span>
          </button>
        </div>

        {activeTab === 'requests' && (
          <div className="flex items-center gap-2 pr-2">
            <span className="text-[11px] font-bold text-slate-400">Filter Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl px-3 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="PENDING_APPROVAL">Pending Approval ({pendingCount})</option>
              <option value="APPROVED">Approved ({approvedCount})</option>
              <option value="REJECTED">Rejected ({rejectedCount})</option>
              <option value="All">All Requests</option>
            </select>
          </div>
        )}
      </div>

      {/* Main Grid View */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin h-8 w-8 border-4 border-[#047857] border-t-transparent rounded-full" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center my-6">
          <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Certification Requests Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {activeTab === 'requests'
              ? 'There are currently no pending certification requests requiring Super Admin review.'
              : 'No certificate records matching your current filter criteria.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((cert) => {
            const certStatus = (cert as any).status || 'APPROVED';
            const certType = cert.animalType || (cert.calfId ? 'Calf' : cert.sireId ? 'Sire' : 'Dam');
            const animalTitle = certType === 'Sire' ? (cert.sireName || cert.sireId) : certType === 'Dam' ? (cert.damName || cert.damId) : (cert.calfName || cert.calfId || 'Calf Record');
            const animalBreed = certType === 'Sire' ? (cert.sireBreed || 'Brahman') : certType === 'Dam' ? (cert.damBreed || 'Wagyu') : (cert.calfBreed || 'Wagyu');

            return (
              <div
                key={cert.id}
                className="group bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-xl hover:border-[#047857] transition-all p-5 flex flex-col justify-between"
              >
                <div>
                  {/* Header Row */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-[#047857]" />
                      <div>
                        <span className="text-[9px] font-black text-[#047857] uppercase tracking-widest">REQUEST NO</span>
                        <h3 className="text-sm font-black text-slate-900 group-hover:text-[#047857] transition-colors">
                          {cert.certificateNumber}
                        </h3>
                      </div>
                    </div>

                    <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase border ${
                      certStatus === 'APPROVED'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : certStatus === 'PENDING_APPROVAL'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-rose-50 text-rose-800 border-rose-200'
                    }`}>
                      {certStatus === 'PENDING_APPROVAL' ? 'Pending Approval' : certStatus}
                    </span>
                  </div>

                  {/* Animal & Specs Details */}
                  <div className="space-y-2 text-xs text-slate-600 my-4 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 font-medium">Type & Name:</span>
                      <span className="font-black text-[#047857]">{certType} • {animalTitle}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">Breed:</span>
                      <span className="font-bold text-slate-900">{animalBreed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">Applicant:</span>
                      <span className="font-bold text-slate-800">{cert.appliedBy || cert.ownerName || 'Breeder A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">Application Date:</span>
                      <span className="font-bold text-slate-800">{String(cert.issueDate || cert.appliedDate || new Date().toISOString()).substring(0, 10)}</span>
                    </div>
                    {(cert as any).rejectionReason && (
                      <div className="mt-2 pt-2 border-t border-rose-200 text-rose-800 text-[11px] font-medium bg-rose-50 p-2 rounded-xl">
                        <span className="font-bold block">Rejection Reason:</span>
                        {(cert as any).rejectionReason}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setReviewCert(cert)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold py-2 px-3 rounded-xl transition-all shadow-xs cursor-pointer"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>Review Request</span>
                  </button>

                  {certStatus === 'APPROVED' && (
                    <Link
                      href={`/certificates/${cert.id}`}
                      className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 px-3 rounded-xl transition-colors"
                    >
                      <span>View</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SUPER ADMIN REVIEW REQUEST MODAL */}
      {reviewCert && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-6 my-8 animate-in fade-in zoom-in duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-amber-50 border border-amber-200 text-amber-700 rounded-2xl flex items-center justify-center font-black">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      CERTIFICATION APPLICATION REVIEW
                    </span>
                    <span className="text-xs font-bold text-slate-400">ID: {reviewCert.id}</span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900">
                    Certificate Request #{reviewCert.certificateNumber}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => { setReviewCert(null); setRejecting(false); }}
                className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content Sections */}
            <div className="space-y-4 text-xs">
              
              {/* Section 1: Subject Animal Summary */}
              <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 flex items-center gap-4">
                <div className="h-20 w-20 flex-shrink-0 rounded-2xl overflow-hidden border border-slate-200">
                  <StandardAnimalImage src={reviewCert.imageUrl} alt="Animal" />
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                      {reviewCert.animalType || (reviewCert.calfId ? 'Calf' : reviewCert.sireId ? 'Sire' : 'Dam')} RECORD
                    </span>
                    <span className="font-extrabold text-slate-500">ID: {reviewCert.animalId || reviewCert.calfId || reviewCert.sireId || reviewCert.damId}</span>
                  </div>
                  <h4 className="text-base font-black text-slate-900">
                    {reviewCert.sireName || reviewCert.damName || reviewCert.calfName || 'Subject Animal'}
                  </h4>
                  <p className="text-slate-600 font-bold">
                    Breed: <span className="text-slate-900">{reviewCert.calfBreed || reviewCert.sireBreed || reviewCert.damBreed || 'Master Breed'}</span>
                  </p>
                </div>
              </div>

              {/* Section 2: Detailed Specifications Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1.5">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Ownership & Location</p>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Owner Name:</span>
                    <span className="font-bold text-slate-900">{reviewCert.ownerName || 'Kaksedthan'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Farm Station:</span>
                    <span className="font-bold text-slate-900">{reviewCert.farmLocation || 'Main Farm'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Applicant:</span>
                    <span className="font-bold text-amber-800">{reviewCert.appliedBy || 'Sokha Breeder'}</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1.5">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Herdbook & Lineage</p>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Registration No:</span>
                    <span className="font-bold text-slate-900">{reviewCert.registrationNumber || reviewCert.registrationId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Sire ID:</span>
                    <span className="font-bold text-slate-900">{reviewCert.sireId || 'SIR-001'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Dam ID:</span>
                    <span className="font-bold text-slate-900">{reviewCert.damId || 'DAM-001'}</span>
                  </div>
                </div>
              </div>

              {/* Rejection Form Input */}
              {rejecting && (
                <form onSubmit={handleRejectSubmit} className="bg-rose-50 border border-rose-200 p-4 rounded-2xl space-y-3 animate-in fade-in duration-200">
                  <label className="block font-black text-rose-900 uppercase tracking-wider">
                    Specify Mandatory Rejection Reason
                  </label>
                  <textarea
                    rows={3}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Enter explicit technical/pedigree reason for rejecting this application..."
                    className="w-full bg-white border border-rose-300 font-bold rounded-xl p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 text-xs"
                    required
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setRejecting(false)}
                      className="px-3 py-1.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={actionLoading || !rejectionReason.trim()}
                      className="bg-rose-700 hover:bg-rose-800 text-white font-extrabold px-4 py-1.5 rounded-xl shadow-md disabled:opacity-50"
                    >
                      {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm Rejection'}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Super Admin Action Controls */}
            {!rejecting && (
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setReviewCert(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => setRejecting(true)}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-1.5 bg-rose-100 hover:bg-rose-200 text-rose-900 text-xs font-black px-4 py-2 rounded-xl transition-all border border-rose-300 shadow-2xs"
                >
                  <XCircle className="h-4 w-4 text-rose-600" />
                  <span>Reject Application</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleApprove(reviewCert)}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black px-5 py-2 rounded-xl transition-all shadow-md cursor-pointer"
                >
                  {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  <span>Approve Certification</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* APPLY CERTIFICATE MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-[#047857]" />
                <h3 className="text-base font-black text-slate-900">Apply New Certificate</h3>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCertificate} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="block font-black text-slate-700 uppercase tracking-wider">1. Select Certificate Subject Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Sire', 'Dam', 'Calf'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => handleTypeChange(t)}
                      className={`py-2 px-3 rounded-xl font-extrabold border transition-all cursor-pointer ${
                        selectedType === t
                          ? 'bg-[#047857] text-white border-[#047857] shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {t} Certificate
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block font-black text-slate-700 uppercase tracking-wider">
                  2. Select Registered {selectedType} Master Record
                </label>
                {selectedType === 'Sire' ? (
                  <select
                    value={selectedId}
                    onChange={(e) => setSelectedId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 font-bold rounded-xl p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#047857]"
                  >
                    {sires.map((s) => (
                      <option key={s.id} value={s.id}>{s.name} ({s.id}) • {s.breed}</option>
                    ))}
                  </select>
                ) : selectedType === 'Dam' ? (
                  <select
                    value={selectedId}
                    onChange={(e) => setSelectedId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 font-bold rounded-xl p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#047857]"
                  >
                    {dams.map((d) => (
                      <option key={d.id} value={d.id}>{d.name || d.id} ({d.id}) • {d.breed}</option>
                    ))}
                  </select>
                ) : (
                  <select
                    value={selectedId}
                    onChange={(e) => setSelectedId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 font-bold rounded-xl p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#047857]"
                  >
                    {calves.map((c) => (
                      <option key={c.id} value={c.id}>{c.name || c.id} ({c.id}) • {c.breed}</option>
                    ))}
                  </select>
                )}
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-[11px] font-medium leading-relaxed">
                Certificate will automatically retrieve verified master info (breed, DOB, photos, owner location) from PostgreSQL database.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !selectedId}
                  className="inline-flex items-center gap-1.5 bg-[#047857] hover:bg-emerald-700 text-white text-xs font-black px-4 py-2 rounded-xl transition-all shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Award className="h-4 w-4" />}
                  <span>Issue {selectedType} Certificate</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
