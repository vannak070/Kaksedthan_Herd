import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { getUserLevelsAction, getUsersAction } from '@/app/actions';
import UnifiedAccessControlClient from '@/components/settings/UnifiedAccessControlClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Account & User Levels | Kaksedthan Herdbook',
  description: 'Manage business account types and system access levels.',
};

export default async function AdminUserLevelsPage() {
  const [levelsRes, usersRes] = await Promise.all([
    getUserLevelsAction(),
    getUsersAction()
  ]);
  const initialLevels = (levelsRes.success && Array.isArray(levelsRes.data)) ? levelsRes.data : [];
  const initialUsers = (usersRes.success && Array.isArray(usersRes.data)) ? usersRes.data : [];

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-slate-500 font-bold text-sm">Loading User Levels...</div>
      </div>
    }>
      <UnifiedAccessControlClient
        initialLevels={initialLevels as any}
        initialUsers={initialUsers as any}
        initialTab="levels"
      />
    </Suspense>
  );
}
