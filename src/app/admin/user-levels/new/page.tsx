import React from 'react';
import { Metadata } from 'next';
import AdminUserLevelCreateClient from '@/components/admin/user-levels/AdminUserLevelCreateClient';

export const metadata: Metadata = {
  title: 'New User Level | Kaksedthan Herdbook',
  description: 'Create a new business account type for the Kaksedthan Herdbook system.',
};

export default function AdminUserLevelNewPage() {
  return <AdminUserLevelCreateClient />;
}
