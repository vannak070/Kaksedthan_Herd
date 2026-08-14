'use client';

import React, { useState, useEffect } from 'react';
import { Award, Loader2, Clock, CheckCircle2, XCircle, FileText, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { applyCertificateAction, fetchCertificateByAnimalAction } from '@/app/actions';

interface ApplyCertificateButtonProps {
  animalType: 'Sire' | 'Dam' | 'Calf';
  animalId: string;
  animalName?: string;
  className?: string;
  initialCert?: any;
}

export default function ApplyCertificateButton({
  animalType,
  animalId,
  animalName,
  className = '',
  initialCert
}: ApplyCertificateButtonProps) {
  const [loading, setLoading] = useState(false);
  const [cert, setCert] = useState<any>(initialCert || null);
  const [status, setStatus] = useState<string>(initialCert?.status || 'NOT_APPLIED');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!initialCert) {
      fetchCertificateByAnimalAction(animalType, animalId).then(res => {
        if (res.success && res.data) {
          setCert(res.data);
          setStatus(res.data.status || 'PENDING_APPROVAL');
        }
      });
    }
  }, [animalType, animalId, initialCert]);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  const handleApply = async () => {
    if (status === 'PENDING_APPROVAL' || status === 'APPROVED') return;
    
    setLoading(true);
    try {
      // Current Breeder session context
      const currentUser = { id: 'BRD-484516', name: 'ATH Vannak', role: 'Breeder', userType: 'Breeder' };
      const res = await applyCertificateAction({ animalType, animalId }, currentUser);

      if (res.success && res.data) {
        const newCert = res.data;
        setCert(newCert);
        setStatus(newCert.status || 'PENDING_APPROVAL');
        showToast('success', `Certificate application for ${animalType} (${animalId}) submitted successfully for Admin approval.`);
        router.refresh();
      } else {
        showToast('error', res.error || 'Failed to submit certificate application.');
      }
    } catch (err: any) {
      showToast('error', err.message || 'An error occurred during submission.');
    } finally {
      setLoading(false);
    }
  };

  // ── STATE 2: PENDING APPROVAL ──────────────────────────────────────────
  if (status === 'PENDING_APPROVAL') {
    return (
      <div className="relative inline-block">
        {toast && (
          <div className="absolute bottom-full mb-2 right-0 z-50 whitespace-nowrap bg-emerald-900 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-lg">
            {toast.message}
          </div>
        )}
        <div className={`inline-flex items-center gap-1.5 bg-amber-50 text-amber-900 border border-amber-300 font-extrabold text-xs px-3.5 py-2 rounded-xl shadow-2xs ${className}`}>
          <Clock className="h-4 w-4 text-amber-600 animate-pulse" />
          <span>Pending Certification Approval</span>
        </div>
      </div>
    );
  }

  // ── STATE 3: APPROVED ──────────────────────────────────────────────────
  if (status === 'APPROVED') {
    return (
      <div className="relative inline-block">
        <button
          type="button"
          onClick={() => router.push(cert?.id ? `/certificates/${cert.id}` : '/certificates')}
          className={`inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black px-3.5 py-2 rounded-xl transition-all shadow-xs cursor-pointer ${className}`}
        >
          <CheckCircle2 className="h-4 w-4" />
          <span>Certification Approved</span>
          <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
        </button>
      </div>
    );
  }

  // ── STATE 4: REJECTED ──────────────────────────────────────────────────
  if (status === 'REJECTED') {
    return (
      <div className="relative inline-block">
        {toast && (
          <div className="absolute bottom-full mb-2 right-0 z-50 whitespace-nowrap bg-rose-900 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-lg">
            {toast.message}
          </div>
        )}
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-900 border border-rose-300 font-bold text-xs px-3 py-2 rounded-xl">
            <XCircle className="h-4 w-4 text-rose-600" />
            <span>Certification Rejected</span>
          </div>
          <button
            type="button"
            onClick={handleApply}
            disabled={loading}
            className="text-xs font-bold text-purple-700 underline hover:text-purple-900 cursor-pointer"
          >
            Re-Apply
          </button>
        </div>
      </div>
    );
  }

  // ── STATE 1: NOT APPLIED (ACTIVE APPLICATION BUTTON) ──────────────────
  return (
    <div className="relative inline-block">
      {toast && (
        <div className={`absolute bottom-full mb-2 right-0 z-50 whitespace-nowrap text-white text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-lg ${
          toast.type === 'success' ? 'bg-emerald-900' : 'bg-rose-900'
        }`}>
          {toast.message}
        </div>
      )}
      <button
        type="button"
        onClick={handleApply}
        disabled={loading}
        className={`inline-flex items-center gap-1.5 bg-[#047857] hover:bg-emerald-700 text-white text-xs font-black px-3.5 py-2 rounded-xl transition-all shadow-md disabled:opacity-50 cursor-pointer ${className}`}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Award className="h-4 w-4" />}
        <span>Apply {animalType} Certification</span>
      </button>
    </div>
  );
}
