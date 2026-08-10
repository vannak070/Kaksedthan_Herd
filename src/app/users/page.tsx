import React from 'react';
import PageHeader from '@/components/common/PageHeader';
import { getDbData } from '@/lib/db';
import SettingsTab from '@/components/SettingsTab';

export const dynamic = 'force-dynamic';

export default async function UsersPage() {
  const data = await getDbData();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users & Access Control (RBAC)"
        subtitle="Manage user accounts, roles (Super Admin, Farm Owner, Breeder), and module permissions."
        breadcrumbs={[{ label: 'Administration' }, { label: 'Users & Access Control' }]}
      />

      <SettingsTab settings={data?.settings} data={data} initialSubTab="users" initialSection="users" />
    </div>
  );
}
