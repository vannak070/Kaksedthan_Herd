import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { fetchBreedersAction } from '@/app/actions';
import BreedersListClient from '@/components/breeders/BreedersListClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Breeder Account & Management | Kaksedthan Herdbook',
  description: 'Manage breeder profiles, login user accounts, assigned user levels, and managed customers.',
};

export default async function BreedersPage() {
  const result = await fetchBreedersAction();
  const initialBreeders = (result.success && Array.isArray(result.data)) ? result.data : [];

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-slate-500 font-bold text-sm">Loading Breeder Accounts...</div>
      </div>
    }>
      <BreedersListClient initialBreeders={initialBreeders} />
    </Suspense>
  );
}
