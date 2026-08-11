'use client';

import React, { useState, useEffect } from 'react';
import {
  X, Shield, User, Lock, Database, Layers, CheckCircle2, XCircle,
  ChevronDown, ChevronRight, Crown, AlertTriangle, RefreshCw
} from 'lucide-react';
import { getUserEffectivePermissionsAction, assignRoleToUserAction, removeRoleFromUserAction, getRolesAction } from '@/app/actions';
import { CRUD_MODULES, SPECIAL_PERMISSION_GROUPS, UserRoleItem, CustomRoleDefinition } from '@/types/settings.types';

interface Props {
  user: UserRoleItem;
  callerUserId?: string;
  isSuperAdmin?: boolean;
  isOpen: boolean;
  onClose: () => void;
  onRefresh?: () => void;
}

const CATEGORY_COLOR: Record<string, string> = {
  Breeding: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  Farm: 'bg-amber-100 text-amber-800 border-amber-200',
  Stock: 'bg-blue-100 text-blue-800 border-blue-200',
  Herdbook: 'bg-violet-100 text-violet-800 border-violet-200',
  Certification: 'bg-rose-100 text-rose-800 border-rose-200',
  System: 'bg-slate-100 text-slate-800 border-slate-200',
  Customer: 'bg-orange-100 text-orange-800 border-orange-200',
  'Sourcing Company': 'bg-sky-100 text-sky-800 border-sky-200',
};

export default function UserAccessDetailsModal({ user, callerUserId, isSuperAdmin, isOpen, onClose, onRefresh }: Props) {
  const [effectivePermissions, setEffectivePermissions] = useState<string[]>([]);
  const [assignedRoles, setAssignedRoles] = useState<{ id: string; name: string; category: string; status: string }[]>([]);
  const [allRoles, setAllRoles] = useState<CustomRoleDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set(['sire', 'breeding_program', 'herdbook']));
  const [assigningRole, setAssigningRole] = useState(false);
  const [selectedNewRole, setSelectedNewRole] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    loadData();
  }, [isOpen, user.id]);

  async function loadData() {
    setLoading(true);
    try {
      const [permsResult, rolesResult] = await Promise.all([
        getUserEffectivePermissionsAction(user.id, callerUserId),
        getRolesAction(),
      ]);
      if (permsResult.success && permsResult.data) {
        setEffectivePermissions((permsResult.data as any).permissions || []);
        setAssignedRoles((permsResult.data as any).roles || []);
      }
      if (rolesResult.success && rolesResult.data) {
        setAllRoles(rolesResult.data as CustomRoleDefinition[]);
      }
    } catch {}
    setLoading(false);
  }

  function showToast(type: 'success' | 'error', message: string) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  }

  async function handleAssignRole() {
    if (!selectedNewRole) return;
    setAssigningRole(true);
    const result = await assignRoleToUserAction(user.id, selectedNewRole, callerUserId);
    if (result.success) {
      showToast('success', 'Role assigned successfully.');
      setSelectedNewRole('');
      await loadData();
      onRefresh?.();
    } else {
      showToast('error', result.error || 'Failed to assign role.');
    }
    setAssigningRole(false);
  }

  async function handleRemoveRole(roleId: string) {
    const result = await removeRoleFromUserAction(user.id, roleId, callerUserId);
    if (result.success) {
      showToast('success', 'Role removed.');
      await loadData();
      onRefresh?.();
    } else {
      showToast('error', result.error || 'Failed to remove role.');
    }
  }

  const permSet = new Set(effectivePermissions.map(p => p.toLowerCase()));
  const hasPerm = (key: string) => permSet.has(key.toLowerCase());

  function toggleModule(id: string) {
    setExpandedModules(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const unassignedRoles = allRoles.filter(
    r => r.status === 'Active' && !assignedRoles.some(ar => ar.id === r.id || ar.name === r.name)
  );

  const totalCount = effectivePermissions.length;
  const crudPerms = effectivePermissions.filter(p => !p.includes('certification') && !p.includes('user.') && !p.includes('role.') && !p.includes('permission.') && !p.includes('report') && !p.includes('export') && !p.includes('system'));
  const specialPerms = effectivePermissions.filter(p => p.includes('user.') || p.includes('role.') || p.includes('permission.') || p.includes('certification'));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 bg-white/15 rounded-2xl flex items-center justify-center border border-white/20">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-white/60 text-[11px] font-bold uppercase tracking-wider">Access Details</p>
              <h2 className="text-white font-black text-lg leading-tight">{user.name}</h2>
            </div>
          </div>
          <button onClick={onClose} className="h-9 w-9 rounded-xl bg-white/10 hover:bg-white/20 transition flex items-center justify-center">
            <X className="h-4 w-4 text-white" />
          </button>
        </div>

        {/* Toast */}
        {toast && (
          <div className={`mx-6 mt-4 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 ${
            toast.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {toast.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
            {toast.message}
          </div>
        )}

        {/* Scrollable Body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-5">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <RefreshCw className="h-7 w-7 text-slate-400 animate-spin" />
            </div>
          ) : (
            <>
              {/* User Identity Panel */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <InfoCard icon={<User className="h-4 w-4 text-slate-500" />} label="User Level" value={user.userLevel || user.role || 'N/A'} />
                <InfoCard icon={<Layers className="h-4 w-4 text-indigo-500" />} label="Role" value={assignedRoles.length > 0 ? assignedRoles.map(r => r.name).join(', ') : (user.role || 'No Role')} />
                <InfoCard icon={<Database className="h-4 w-4 text-amber-500" />} label="Data Scope" value={user.dataScope || 'ASSIGNED_RECORD'} />
                <InfoCard icon={<Shield className="h-4 w-4 text-emerald-500" />} label="Status" value={user.status || 'Active'} highlight={user.status === 'Active'} />
              </div>

              {/* Assigned Roles + Role Assignment */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Crown className="h-3.5 w-3.5 text-amber-500" /> Assigned Roles
                  </h3>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">{assignedRoles.length} Role{assignedRoles.length !== 1 ? 's' : ''}</span>
                </div>
                {assignedRoles.length === 0 ? (
                  <p className="text-xs text-slate-400 font-medium italic">No roles assigned via role management. Using legacy role field: <span className="font-bold text-slate-600">{user.role}</span></p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {assignedRoles.map(role => (
                      <div key={role.id} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${CATEGORY_COLOR[role.category] || CATEGORY_COLOR.System}`}>
                        <Shield className="h-3 w-3" />
                        {role.name}
                        {isSuperAdmin && (
                          <button
                            onClick={() => handleRemoveRole(role.id)}
                            className="ml-1 h-4 w-4 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center transition"
                          >
                            <X className="h-2.5 w-2.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Assign New Role (Super Admin only) */}
                {isSuperAdmin && unassignedRoles.length > 0 && (
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <select
                      value={selectedNewRole}
                      onChange={e => setSelectedNewRole(e.target.value)}
                      className="flex-1 text-xs font-medium border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500 bg-white"
                    >
                      <option value="">— Assign a role —</option>
                      {unassignedRoles.map(r => (
                        <option key={r.id} value={r.id}>{r.name} ({r.category})</option>
                      ))}
                    </select>
                    <button
                      onClick={handleAssignRole}
                      disabled={!selectedNewRole || assigningRole}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      {assigningRole ? 'Assigning...' : 'Assign'}
                    </button>
                  </div>
                )}
              </div>

              {/* Effective Permissions Stats */}
              <div className="grid grid-cols-3 gap-3">
                <StatBadge label="Total Permissions" value={totalCount} color="slate" />
                <StatBadge label="Business Permissions" value={crudPerms.length} color="indigo" />
                <StatBadge label="Admin Permissions" value={specialPerms.length} color="rose" />
              </div>

              {/* CRUD Permission Matrix */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                <div className="bg-slate-50 px-5 py-3 border-b border-slate-200">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Business Module Permissions</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="text-left px-5 py-2.5 font-black text-slate-500 uppercase tracking-wider text-[10px]">Module</th>
                        <th className="text-center px-3 py-2.5 font-black text-slate-500 uppercase tracking-wider text-[10px]">View</th>
                        <th className="text-center px-3 py-2.5 font-black text-slate-500 uppercase tracking-wider text-[10px]">Create</th>
                        <th className="text-center px-3 py-2.5 font-black text-slate-500 uppercase tracking-wider text-[10px]">Update</th>
                        <th className="text-center px-3 py-2.5 font-black text-slate-500 uppercase tracking-wider text-[10px]">Delete</th>
                        <th className="text-left px-3 py-2.5 font-black text-slate-500 uppercase tracking-wider text-[10px]">Extra</th>
                      </tr>
                    </thead>
                    <tbody>
                      {CRUD_MODULES.map(mod => {
                        const hasAny = Object.values(mod.permissions).some(k => k && hasPerm(k as string));
                        return (
                          <tr key={mod.id} className={`border-b border-slate-50 transition ${hasAny ? '' : 'opacity-50'}`}>
                            <td className="px-5 py-2.5">
                              <span className="font-bold text-slate-800">{mod.icon} {mod.label}</span>
                            </td>
                            <td className="text-center px-3 py-2.5">
                              {mod.permissions.view ? (hasPerm(mod.permissions.view) ? <CheckCircle2 className="h-4 w-4 text-emerald-500 mx-auto" /> : <XCircle className="h-4 w-4 text-slate-200 mx-auto" />) : <span className="text-slate-200">—</span>}
                            </td>
                            <td className="text-center px-3 py-2.5">
                              {mod.permissions.create ? (hasPerm(mod.permissions.create) ? <CheckCircle2 className="h-4 w-4 text-emerald-500 mx-auto" /> : <XCircle className="h-4 w-4 text-slate-200 mx-auto" />) : <span className="text-slate-200">—</span>}
                            </td>
                            <td className="text-center px-3 py-2.5">
                              {mod.permissions.update ? (hasPerm(mod.permissions.update) ? <CheckCircle2 className="h-4 w-4 text-emerald-500 mx-auto" /> : <XCircle className="h-4 w-4 text-slate-200 mx-auto" />) : <span className="text-slate-200">—</span>}
                            </td>
                            <td className="text-center px-3 py-2.5">
                              {mod.permissions.delete ? (hasPerm(mod.permissions.delete) ? <CheckCircle2 className="h-4 w-4 text-emerald-500 mx-auto" /> : <XCircle className="h-4 w-4 text-slate-200 mx-auto" />) : <span className="text-slate-200">—</span>}
                            </td>
                            <td className="px-3 py-2.5">
                              <div className="flex flex-wrap gap-1">
                                {(mod.extraActions || []).map(extra => (
                                  <span key={extra.key} className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold border ${
                                    hasPerm(extra.key) ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-300 border-slate-100'
                                  }`}>{extra.label}</span>
                                ))}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Special Permissions */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                <div className="bg-slate-50 px-5 py-3 border-b border-slate-200">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Administrative & Special Permissions</h3>
                </div>
                <div className="divide-y divide-slate-50">
                  {SPECIAL_PERMISSION_GROUPS.map(group => (
                    <div key={group.category} className="px-5 py-3">
                      <button
                        className="w-full flex items-center justify-between text-left"
                        onClick={() => toggleModule(group.category)}
                      >
                        <span className="text-[11px] font-black text-slate-600 uppercase tracking-wider">
                          {group.icon} {group.category}
                        </span>
                        {expandedModules.has(group.category)
                          ? <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                          : <ChevronRight className="h-3.5 w-3.5 text-slate-400" />}
                      </button>
                      {expandedModules.has(group.category) && (
                        <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
                          {group.items.map(item => (
                            <div key={item.key} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border ${
                              hasPerm(item.key)
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-slate-50 text-slate-300 border-slate-100'
                            }`}>
                              {hasPerm(item.key)
                                ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                                : <XCircle className="h-3.5 w-3.5 shrink-0" />}
                              <span className="leading-tight">{item.label}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Raw Permission List (collapsed) */}
              <details className="group">
                <summary className="cursor-pointer text-xs font-bold text-slate-500 hover:text-slate-700 transition flex items-center gap-1 select-none list-none">
                  <ChevronRight className="h-3.5 w-3.5 group-open:rotate-90 transition-transform" />
                  Raw Permission Keys ({totalCount})
                </summary>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {effectivePermissions.sort().map(p => (
                    <code key={p} className="text-[9px] font-mono font-bold px-2 py-1 bg-slate-100 text-slate-700 rounded-lg border border-slate-200">
                      {p}
                    </code>
                  ))}
                </div>
              </details>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">
            Effective permissions are the union of all active assigned roles
          </p>
          <button onClick={onClose} className="px-5 py-2 text-xs font-bold rounded-xl bg-slate-800 text-white hover:bg-slate-700 transition">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ icon, label, value, highlight }: { icon: React.ReactNode; label: string; value: string; highlight?: boolean }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-3.5 space-y-1">
      <div className="flex items-center gap-1.5 text-slate-400">{icon}<span className="text-[10px] font-bold uppercase tracking-wider">{label}</span></div>
      <p className={`text-sm font-black leading-tight ${highlight ? 'text-emerald-700' : 'text-slate-900'}`}>{value}</p>
    </div>
  );
}

function StatBadge({ label, value, color }: { label: string; value: number; color: 'slate' | 'indigo' | 'rose' }) {
  const colors = {
    slate: 'bg-slate-50 border-slate-200 text-slate-800',
    indigo: 'bg-indigo-50 border-indigo-200 text-indigo-800',
    rose: 'bg-rose-50 border-rose-200 text-rose-800',
  };
  return (
    <div className={`rounded-2xl border px-4 py-3 text-center ${colors[color]}`}>
      <p className="text-2xl font-black">{value}</p>
      <p className="text-[10px] font-bold uppercase tracking-wider opacity-70 mt-0.5">{label}</p>
    </div>
  );
}
