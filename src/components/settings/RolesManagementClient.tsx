'use client';

import React, { useState } from 'react';
import { ShieldCheck, Plus, Search, Check, Edit3, Trash2, Info } from 'lucide-react';
import { CustomRoleDefinition } from '@/lib/types';

interface Props {
  initialRoles: CustomRoleDefinition[];
}

export default function RolesManagementClient({ initialRoles }: Props) {
  const [roles] = useState<CustomRoleDefinition[]>(initialRoles);
  const [search, setSearch] = useState('');

  const filteredRoles = roles.filter(r =>
    !search ||
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    (r.description || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-700 to-purple-700 p-6 text-white">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-white/70 text-[11px] font-bold uppercase tracking-wider">Administration</p>
              <h1 className="text-xl font-black text-white">Role Management</h1>
              <p className="text-white/70 text-xs font-medium mt-0.5">
                Define operational responsibilities and permission presets.
              </p>
            </div>
          </div>
        </div>
        <div className="px-6 py-3 bg-indigo-50 border-b border-indigo-100 flex items-center gap-2 text-xs text-indigo-900 font-medium">
          <Info className="h-4 w-4 text-indigo-600 shrink-0" />
          <span><strong>Role vs User Level vs Permission:</strong> Role defines what a user is <em>responsible for</em> (e.g. Farm Manager, Breeder Specialist). Specific permissions govern individual actions.</span>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search operational roles..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-indigo-600"
          />
        </div>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredRoles.map(role => (
          <div key={role.id} className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-slate-900 text-sm">{role.name}</h3>
              {role.isSystem && (
                <span className="font-mono text-[9px] font-black bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md border border-indigo-100 uppercase">
                  System Role
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium line-clamp-2">{role.description}</p>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-400 text-[11px]">
                {role.permissions ? role.permissions.length : 0} Permissions
              </span>
              <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                Active
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
