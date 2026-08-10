import React from 'react';
import { getDbData } from '@/lib/db';
import SettingsTab from '@/components/SettingsTab';

export const dynamic = 'force-dynamic';

export default async function UsersSettingsPage() {
  const data = await getDbData();

  return <SettingsTab settings={data?.settings} data={data} initialSubTab="users" initialSection="users" />;
}
