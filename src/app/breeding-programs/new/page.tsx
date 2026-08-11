'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/common/PageHeader';
import GuidedBreedingWizard from '@/components/breeding/GuidedBreedingWizard';
import { SireItem, DamItem, StockInseminationItem, BreedingProgramItem } from '@/types/breeding.types';
import {
  fetchSiresAction,
  fetchDamsAction,
  fetchStockInseminationAction,
  createBreedingProgramAction,
  resolveCurrentBreederAction,
} from '@/app/actions';

export default function NewBreedingProgramPage() {
  const router = useRouter();
  const [sires, setSires] = useState<SireItem[]>([]);
  const [dams, setDams] = useState<DamItem[]>([]);
  const [semenStock, setSemenStock] = useState<StockInseminationItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Active role from the sidebar role-switcher (stored in localStorage)
  const [activeRole, setActiveRole] = useState<string>('Super Admin');
  // Locked Breeder identity resolved from the backend (only for Breeder accounts)
  const [lockedBreeder, setLockedBreeder] = useState<{ id: string; name: string } | null>(null);
  // Caller email passed to the backend for identity enforcement
  const [callerEmail, setCallerEmail] = useState<string>('');

  useEffect(() => {
    // Read the persisted active role from localStorage (set by SidebarLayout)
    const savedRole = localStorage.getItem('kaksedthan_active_role') || 'Super Admin';
    setActiveRole(savedRole);

    const isBreederRole = savedRole === 'Breeder' || savedRole === 'Breeder Account';
    // Demo: map role to a known email. In production this comes from the auth session.
    const email = isBreederRole ? 'breeder@snrfarm.com' : 'vannak@snrfarm.com';
    setCallerEmail(email);

    // Load animal data + optionally resolve Breeder identity in parallel
    const dataLoad = Promise.all([
      fetchSiresAction(),
      fetchDamsAction(),
      fetchStockInseminationAction(),
    ]).then(([sData, dData, stData]) => {
      setSires(sData || []);
      setDams(dData || []);
      setSemenStock(stData || []);
    });

    // For Breeder accounts: resolve the Breeder profile from the backend
    const breederLoad = isBreederRole
      ? resolveCurrentBreederAction(email).then(res => {
          if (res.success && res.data) {
            setLockedBreeder(res.data);
          }
        })
      : Promise.resolve();

    Promise.all([dataLoad, breederLoad])
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (program: BreedingProgramItem) => {
    // Pass callerRole + callerEmail so backend can enforce Breeder identity
    const res = await createBreedingProgramAction(program, activeRole, callerEmail);
    router.push(`/breeding-programs/${(res as any).id || ''}`);
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
        currentUserRole={activeRole}
        lockedBreeder={lockedBreeder}
        onCancel={() => router.push('/breeding-programs')}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
