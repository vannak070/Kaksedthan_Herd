import React from 'react';
import { getDbData } from '@/lib/db';
import { getUserLevelsAction, getUsersAction } from '@/app/actions';
import UnifiedAccessControlClient from '@/components/settings/UnifiedAccessControlClient';

export const dynamic = 'force-dynamic';

export default async function AccessControlSettingsPage() {
  const data = await getDbData();
  const [levelsRes, usersRes] = await Promise.all([
    getUserLevelsAction(),
    getUsersAction(),
  ]);

  const levels = levelsRes.success ? levelsRes.data : [];
  const rawUsers = (usersRes.success && Array.isArray(usersRes.data) && usersRes.data.length > 0)
    ? usersRes.data
    : (data?.settings?.users || []);

  return (
    <UnifiedAccessControlClient
      initialUsers={rawUsers as any}
      initialLevels={levels || []}
    />
  );
}
