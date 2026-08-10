import React, { Suspense } from 'react';
import { Metadata } from 'next';
import PermissionsManagementClient from '@/components/settings/PermissionsManagementClient';

export const metadata: Metadata = {
  title: 'Permission Management | Kaksedthan Herdbook',
  description: 'Manage action permissions and backend security enforcement in the system.',
};

export default function PermissionsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-slate-500 font-bold text-sm">Loading Permission Management...</div>
      </div>
    }>
      <PermissionsManagementClient />
    </Suspense>
  );
}
