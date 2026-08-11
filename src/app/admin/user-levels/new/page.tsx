import React, { Suspense } from 'react';
import { Metadata } from 'next';
import AdminUserLevelCreateClient from '@/components/admin/user-levels/AdminUserLevelCreateClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'New User Level | Kaksedthan Herdbook',
  description: 'Create a new business account type for the Kaksedthan Herdbook system.',
};

export default function AdminUserLevelNewPage() {
  return (
    <Suspense fallback={
      <div className="max-w-4xl mx-auto p-12 text-center text-slate-500 font-bold">
        Loading User Level Form...
      </div>
    }>
      <AdminUserLevelCreateClient />
    </Suspense>
  );
}
