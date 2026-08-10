import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { getSettingsAction } from '@/app/actions';
import RolesManagementClient from '@/components/settings/RolesManagementClient';

export const metadata: Metadata = {
  title: 'Role Management | Kaksedthan Herdbook',
  description: 'Manage operational responsibilities and assigned roles in the system.',
};

export default async function RolesPage() {
  const result = await getSettingsAction();
  const settings = result.success ? result.data : null;

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-slate-500 font-bold text-sm">Loading Role Management...</div>
      </div>
    }>
      <RolesManagementClient initialRoles={settings?.roles || []} />
    </Suspense>
  );
}
