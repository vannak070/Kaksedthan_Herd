import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { fetchCustomersAction } from '@/app/actions';
import CustomersListClient from '@/components/customers/CustomersListClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Customer / Cow Owner Management | Kaksedthan Herdbook',
  description: 'Manage cow owner accounts, National ID verification status, and animal ownership records.',
};

export default async function CustomersPage() {
  const result = await fetchCustomersAction();
  const initialCustomers = (result.success && Array.isArray(result.data)) ? result.data : [];

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-slate-500 font-bold text-sm">Loading Customer Accounts...</div>
      </div>
    }>
      <CustomersListClient initialCustomers={initialCustomers} />
    </Suspense>
  );
}
