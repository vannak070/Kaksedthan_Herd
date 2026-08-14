'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, XCircle, Clock, ShieldCheck, AlertTriangle, ExternalLink, Loader2, ArrowRight } from 'lucide-react';
import { approveCertificateAction, rejectCertificateAction } from '@/app/actions';
import Link from 'next/link';

interface Props {
  cert: {
    id: string;
    certificateNumber: string;
    registrationId?: string;
    animalType: string;
    animalId: string;
    animalName?: string;
    status: string;
    appliedBy?: string;
    appliedDate?: string;
    reviewedBy?: string;
    reviewedDate?: string;
    rejectionReason?: string;
    ownerName?: string;
    farmLocation?: string;
  };
}

export default function CertificateReviewActions({ cert }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  const handleApprove = async () => {
    setLoading(true);
    try {
      const adminUser = { id: 'USR-01', name: 'Super Admin', role: 'Super Admin', userType: 'Admin' };
      const res = await approveCertificateAction(cert.id, adminUser);
      if (res.success) {
        showToast('success', `Certificate #${cert.certificateNumber} has been APPROVED!`);
        router.refresh();
      } else {
        showToast('error', res.error || 'Failed to approve certificate.');
      }
    } catch (err: any) {
      showToast('error', err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectionReason.trim()) return;

    setLoading(true);
    try {
      const adminUser = { id: 'USR-01', name: 'Super Admin', role: 'Super Admin', userType: 'Admin' };
      const res = await rejectCertificateAction(cert.id, rejectionReason.trim(), adminUser);
      if (res.success) {
        showToast('success', `Certificate #${cert.certificateNumber} has been REJECTED.`);
        setIsRejectModalOpen(false);
        router.refresh();
      } else {
        showToast('error', res.error || 'Failed to reject certificate.');
      }
    } catch (err: any) {
      showToast('error', err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const isPending = cert.status === 'PENDING_APPROVAL';
  const isApproved = cert.status === 'APPROVED';
  const isRejected = cert.status === 'REJECTED';

  const animalHref = cert.animalType === 'Sire' ? `/sires/${cert.animalId}` : cert.animalType === 'Dam' ? `/dams/${cert.animalId}` : `/calves/${cert.animalId}`;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2 text-white font-bold text-xs px-4 py-3 rounded-2xl shadow-xl animate-in slide-in-from-top-2 duration-200 ${
          toast.type === 'success' ? 'bg-emerald-900 border border-emerald-500' : 'bg-rose-900 border border-rose-500'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <AlertTriangle className="h-4 w-4 text-rose-400" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
              Internal User Review & Approval Status
            </span>
            <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
              isPending ? 'bg-amber-50 text-amber-800 border-amber-200' :
              isApproved ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}>
              {isPending ? '● Pending Review' : isApproved ? '✓ Approved' : '✕ Rejected'}
            </span>
          </div>
          <h3 className="text-lg font-black text-slate-900">
            Certificate Request Audit Detail #{cert.certificateNumber}
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Internal System User Level Authorization & Audit Trail Linkage
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {isPending && (
            <>
              <button
                onClick={handleApprove}
                disabled={loading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-4 py-2.5 rounded-2xl transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                <span>Approve Certificate</span>
              </button>
              <button
                onClick={() => setIsRejectModalOpen(true)}
                disabled={loading}
                className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-black text-xs px-4 py-2.5 rounded-2xl transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <XCircle className="h-4 w-4" />
                <span>Reject</span>
              </button>
            </>
          )}

          {isApproved && (
            <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-4 py-2 rounded-2xl text-xs font-black flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Approved by {cert.reviewedBy || 'Internal Admin'}</span>
            </div>
          )}

          {isRejected && (
            <div className="bg-rose-50 text-rose-800 border border-rose-200 px-4 py-2 rounded-2xl text-xs font-black flex items-center gap-2">
              <XCircle className="h-4 w-4 text-rose-600" />
              <span>Rejected by {cert.reviewedBy || 'Internal Admin'}</span>
            </div>
          )}
        </div>
      </div>

      {/* Relational Request Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
        <div>
          <span className="text-slate-400 font-medium block text-[10px]">Requested By:</span>
          <span className="font-bold text-slate-900">{cert.appliedBy || 'Breeder Account'}</span>
        </div>

        <div>
          <span className="text-slate-400 font-medium block text-[10px]">Application Date:</span>
          <span className="font-bold text-slate-900">{cert.appliedDate ? new Date(cert.appliedDate).toLocaleDateString() : 'N/A'}</span>
        </div>

        <div>
          <span className="text-slate-400 font-medium block text-[10px]">Animal Linkage:</span>
          <Link href={animalHref} className="font-bold text-purple-700 hover:underline inline-flex items-center gap-1">
            <span>{cert.animalType}: {cert.animalName || cert.animalId}</span>
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>

        <div>
          <span className="text-slate-400 font-medium block text-[10px]">Herdbook Record:</span>
          {cert.registrationId ? (
            <Link href={`/herdbook/${cert.registrationId}`} className="font-bold text-emerald-700 hover:underline inline-flex items-center gap-1">
              <span>{cert.registrationId}</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          ) : (
            <span className="font-bold text-slate-700">Herdbook Auto-Linked</span>
          )}
        </div>
      </div>

      {isRejected && cert.rejectionReason && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5 text-xs text-rose-900">
          <span className="font-black block text-[11px] mb-0.5">Rejection Reason:</span>
          <p className="font-medium text-rose-800">{cert.rejectionReason}</p>
        </div>
      )}

      {/* Rejection Modal */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-rose-600" />
              <span>Reject Certificate Application</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Please specify the reason for rejecting request #{cert.certificateNumber}. This will be logged into the permanent audit trail.
            </p>

            <form onSubmit={handleReject} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Rejection Reason <span className="text-rose-500">*</span></label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Incomplete genetic documentation or DNA lineage verification required."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-rose-600 focus:outline-none"
                  rows={3}
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRejectModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !rejectionReason.trim()}
                  className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>Confirm Rejection</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
