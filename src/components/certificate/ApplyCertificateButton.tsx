'use client';

import React, { useState } from 'react';
import { Award, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { applyCertificateAction } from '@/app/actions';

interface ApplyCertificateButtonProps {
  animalType: 'Sire' | 'Dam' | 'Calf';
  animalId: string;
  animalName?: string;
  className?: string;
}

export default function ApplyCertificateButton({
  animalType,
  animalId,
  animalName,
  className = '',
}: ApplyCertificateButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleApply = async () => {
    try {
      setLoading(true);
      const cert = await applyCertificateAction(animalType, animalId);
      if (cert && cert.id) {
        router.push(`/certificates/${cert.id}`);
      } else {
        router.push('/certificates');
      }
    } catch (err) {
      console.error('Failed to apply certificate:', err);
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleApply}
      disabled={loading}
      className={`inline-flex items-center gap-1.5 bg-[#047857] hover:bg-emerald-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all shadow-xs disabled:opacity-50 cursor-pointer ${className}`}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Award className="h-4 w-4" />}
      <span>Apply {animalType} Certificate</span>
    </button>
  );
}
