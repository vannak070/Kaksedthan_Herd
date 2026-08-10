import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { fetchFarmsAction } from '@/app/actions';
import FarmsListClient from '@/components/farms/FarmsListClient';

export const metadata: Metadata = {
  title: 'Farm Management | Kaksedthan Herdbook',
  description: 'Manage farm locations, barn stations, capacities, farm owners, and assigned livestock.',
};

export default async function FarmsPage() {
  const result = await fetchFarmsAction();
  const initialFarms = (result.success && Array.isArray(result.data)) ? result.data : [];

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-slate-500 font-bold text-sm">Loading Farm Management...</div>
      </div>
    }>
      <FarmsListClient initialFarms={initialFarms} />
    </Suspense>
  );
}
