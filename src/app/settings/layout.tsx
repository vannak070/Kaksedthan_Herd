'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import SettingsLayout from '@/components/settings/SettingsLayout';

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAccessControl =
    pathname.startsWith('/settings/users') ||
    pathname.startsWith('/settings/access-control') ||
    pathname.startsWith('/admin/user-levels') ||
    pathname.startsWith('/settings/roles') ||
    pathname.startsWith('/settings/permissions');

  // Users & Access Control is now completely separated into its own dedicated workspace
  if (isAccessControl) {
    return <div className="w-full min-h-screen">{children}</div>;
  }

  return <SettingsLayout>{children}</SettingsLayout>;
}
