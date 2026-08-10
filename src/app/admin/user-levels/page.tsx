import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { getUserLevelsAction } from '@/app/actions';
import AdminUserLevelsClient from '@/components/admin/user-levels/AdminUserLevelsClient';

export const metadata: Metadata = {
  title: 'User Level Management | Kaksedthan Herdbook',
  description: 'Manage business account types, module access, and associated roles. User Levels define who a user is in the system.',
};

export default async function AdminUserLevelsPage() {
  const result = await getUserLevelsAction();
  const initialLevels = (result.success && Array.isArray(result.data)) ? result.data : [];

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-slate-500 font-bold text-sm">Loading User Level Management...</div>
      </div>
    }>
      <AdminUserLevelsClient initialLevels={initialLevels} />
    </Suspense>
  );
}
