'use client';

import React, { useState } from 'react';
import { Lock, ShieldCheck, Check, Search, AlertTriangle } from 'lucide-react';

const PERMISSION_GROUPS = [
  {
    category: 'Livestock & Registers',
    permissions: [
      { code: 'view:sires', label: 'View Sire Register', description: 'Access sire profiles and semen inventory.' },
      { code: 'create:sires', label: 'Create Sire', description: 'Register new sire records in system.' },
      { code: 'view:dams', label: 'View Dam Register', description: 'Access dam profiles and breeding status.' },
      { code: 'create:dams', label: 'Create Dam', description: 'Register new dam records in system.' },
      { code: 'view:calves', label: 'View Calf Register', description: 'Access calf birth registry records.' },
      { code: 'create:calves', label: 'Create Calf', description: 'Register newborn calves.' }
    ]
  },
  {
    category: 'Breeding Operations',
    permissions: [
      { code: 'view:breeding', label: 'View Breeding Programs', description: 'View active and past breeding programs.' },
      { code: 'create:breeding', label: 'Create Breeding Program', description: 'Schedule new artificial insemination / breeding programs.' },
      { code: 'update:breeding_status', label: 'Update Breeding Status', description: 'Update pregnancy check results and calving dates.' },
      { code: 'manage:semen_stock', label: 'Manage Semen Stock', description: 'Update stock quantities and USD pricing.' }
    ]
  },
  {
    category: 'Herdbook & Certificates',
    permissions: [
      { code: 'view:herdbook', label: 'View Herdbook Registry', description: 'View official cattle pedigree registrations.' },
      { code: 'approve:herdbook', label: 'Approve Registrations', description: 'Approve pending herdbook applications.' },
      { code: 'issue:certificate', label: 'Issue Certificate', description: 'Generate and issue official A4 certificates.' },
      { code: 'export:certificate', label: 'Export Certificate PNG', description: 'Download high-resolution certificate images.' }
    ]
  },
  {
    category: 'Administration & System',
    permissions: [
      { code: 'manage:users', label: 'User Management', description: 'Create, edit, and deactivate user accounts.' },
      { code: 'verify:national_id', label: 'Verify National ID', description: 'Review and verify customer National ID documents.' },
      { code: 'manage:user_levels', label: 'User Level Management', description: 'Configure business account levels and module access.' },
      { code: 'manage:farms', label: 'Farm Management', description: 'Create and configure farm locations and barn capacities.' }
    ]
  }
];

export default function PermissionsManagementClient() {
  const [search, setSearch] = useState('');

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-6 text-white">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30">
              <Lock className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-white/70 text-[11px] font-bold uppercase tracking-wider">Administration</p>
              <h1 className="text-xl font-black text-white">Permission Management</h1>
              <p className="text-white/70 text-xs font-medium mt-0.5">
                Granular action permissions enforced via 403 Forbidden REST authorization.
              </p>
            </div>
          </div>
        </div>
        <div className="px-6 py-3 bg-amber-50 border-b border-amber-100 flex items-center gap-2 text-xs text-amber-900 font-medium">
          <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
          <span><strong>Backend Authorization Enforced:</strong> Action permissions are checked by backend REST APIs. Unauthorized requests automatically return <code>403 Forbidden</code>.</span>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search permission code or description..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-slate-700"
          />
        </div>
      </div>

      {/* Permission Groups */}
      <div className="space-y-6">
        {PERMISSION_GROUPS.map(group => {
          const groupFiltered = group.permissions.filter(p =>
            !search ||
            p.code.toLowerCase().includes(search.toLowerCase()) ||
            p.label.toLowerCase().includes(search.toLowerCase()) ||
            p.description.toLowerCase().includes(search.toLowerCase())
          );
          if (groupFiltered.length === 0) return null;

          return (
            <div key={group.category} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h3 className="font-black text-slate-900 text-xs uppercase tracking-wider border-b border-slate-100 pb-2">
                {group.category}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {groupFiltered.map(perm => (
                  <div key={perm.code} className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{perm.label}</span>
                      <span className="font-mono text-[9.5px] font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded border border-slate-300">
                        {perm.code}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium">{perm.description}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
