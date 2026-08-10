'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/common/PageHeader';
import GuidedBreedingWizard from '@/components/breeding/GuidedBreedingWizard';
import { SireItem, DamItem, StockInseminationItem, BreedingProgramItem } from '@/types/breeding.types';
import { fetchSiresAction, fetchDamsAction, fetchStockInseminationAction, createBreedingProgramAction } from '@/app/actions';

export default function NewBreedingProgramPage() {
  const router = useRouter();
  const [sires, setSires] = useState<SireItem[]>([]);
  const [dams, setDams] = useState<DamItem[]>([]);
  const [semenStock, setSemenStock] = useState<StockInseminationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchSiresAction(), fetchDamsAction(), fetchStockInseminationAction()])
      .then(([sData, dData, stData]) => {
        setSires(sData || []);
        setDams(dData || []);
        setSemenStock(stData || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSubmit = async (program: BreedingProgramItem) => {
    const res = await createBreedingProgramAction(program);
    router.push(`/breeding-programs/${res.id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin h-8 w-8 border-4 border-[#dc5c15] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PageHeader
        title="Guided 7-Step Breeding Program Wizard"
        subtitle="Step-by-step artificial insemination setup with automatic Sire/Dam data linkage."
        breadcrumbs={[
          { label: 'Breeding Program', href: '/breeding-programs' },
          { label: 'New Program Wizard' },
        ]}
        backHref="/breeding-programs"
        backLabel="Back to Breeding Programs"
      />

      <GuidedBreedingWizard
        sires={sires}
        dams={dams}
        semenStock={semenStock}
        onCancel={() => router.push('/breeding-programs')}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
