import React, { Suspense } from 'react';
import { Metadata } from 'next';
import {
  getUserLevelByIdAction,
  getUserLevelUsersAction,
  getUserLevelModulesAction,
  getUserLevelRolesAction,
  getUserLevelAuditAction,
} from '@/app/actions';
import AdminUserLevelDetailClient from '@/components/admin/user-levels/AdminUserLevelDetailClient';

export const metadata: Metadata = {
  title: 'User Level Detail | Kaksedthan Herdbook',
  description: 'Manage user level details, assigned users, available modules, associated roles and audit history.',
};

export default async function AdminUserLevelDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [levelRes, usersRes, modulesRes, rolesRes, auditRes] = await Promise.all([
    getUserLevelByIdAction(id),
    getUserLevelUsersAction(id),
    getUserLevelModulesAction(id),
    getUserLevelRolesAction(id),
    getUserLevelAuditAction(id),
  ]);

  const level = levelRes.success ? levelRes.data : null;

  if (!level) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center space-y-4">
        <div className="text-5xl">⚠️</div>
        <h2 className="text-xl font-black text-slate-900">User Level Not Found</h2>
        <p className="text-sm text-slate-500">
          The User Level with ID <code className="font-mono bg-slate-100 px-2 py-0.5 rounded">{id}</code> could not be found.
        </p>
        <a
          href="/admin/user-levels"
          className="inline-block mt-4 px-5 py-2.5 bg-[#047857] text-white text-sm font-bold rounded-xl hover:bg-[#065f46] transition-colors"
        >
          ← Back to User Level Management
        </a>
      </div>
    );
  }

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-slate-500 font-bold text-sm">Loading User Level Details...</div>
      </div>
    }>
      <AdminUserLevelDetailClient
        initialLevel={level}
        initialUsers={(usersRes.success && Array.isArray(usersRes.data)) ? usersRes.data : []}
        initialModules={(modulesRes.success && Array.isArray(modulesRes.data)) ? modulesRes.data : []}
        initialRoles={(rolesRes.success && Array.isArray(rolesRes.data)) ? rolesRes.data : []}
        initialAudit={(auditRes.success && Array.isArray(auditRes.data)) ? auditRes.data : []}
      />
    </Suspense>
  );
}
