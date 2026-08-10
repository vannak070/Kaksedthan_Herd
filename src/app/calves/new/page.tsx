'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import PageHeader from '@/components/common/PageHeader';
import CalfRegisterForm from '@/components/breeding/CalfRegisterForm';
import { getLivestockDataAction } from '@/app/actions';
import { SireItem, DamItem, BreedingProgramItem } from '@/types/breeding.types';

function NewCalfPageContent() {
  const searchParams = useSearchParams();
  const initialBpId = searchParams.get('bpId') || '';

  const [sires, setSires] = useState<SireItem[]>([]);
  const [dams, setDams] = useState<DamItem[]>([]);
  const [programs, setPrograms] = useState<BreedingProgramItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await getLivestockDataAction();
        if (res.success && res.data) {
          setSires(res.data.sires || []);
          setDams(res.data.dams || []);
          setPrograms(res.data.breedingPrograms || []);
        }
      } catch (err) {
        console.error('Failed to load datasets for Calf Register', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400 font-bold text-xs">
        Loading Master Livestock Records & Breeding Programs...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="Register Calf & Confirm Herdbook Entry"
        subtitle="10-Section Structured Registration: Creates Calf + Herdbook Entry + Pedigree Tree + Certificate + Dynamic QR."
        breadcrumbs={[
          { label: 'Calf Register', href: '/calves' },
          { label: 'New Calf Registration' },
        ]}
        backHref="/calves"
        backLabel="Back to Calf Register"
      />

      <CalfRegisterForm
        sires={sires}
        dams={dams}
        programs={programs}
        initialBpId={initialBpId}
      />
    </div>
  );
}

export default function NewCalfPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400 font-bold text-xs">Loading Calf Registration Page...</div>}>
      <NewCalfPageContent />
    </Suspense>
  );
}
