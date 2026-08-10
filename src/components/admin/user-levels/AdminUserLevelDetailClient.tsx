'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Layers, Users, Grid3x3, ShieldCheck, History, Save,
  CheckCircle2, AlertTriangle, ToggleLeft, ToggleRight, Check,
  Sliders, Search, Plus, Trash2, Clock, XCircle, Info
} from 'lucide-react';
import {
  updateUserLevelAction, setUserLevelStatusAction,
  updateUserLevelModulesAction, setUserLevelRolesAction,
  deleteUserLevelAction,
} from '@/app/actions';

// ─────────────── Types ───────────────
interface UserLevelItem {
  id: string; code: string; name: string; description: string;
  purpose?: string; status: 'Active' | 'Inactive'; sortOrder: number;
  userCount: number; createdAt?: string; updatedAt?: string;
}
interface AssignedUser {
  id: string; name: string; email: string; role: string;
  dataScope: string; status: string; farmLocation?: string; companyName?: string;
}
interface ModuleItem { moduleKey: string; moduleName: string; isAvailable: boolean; }
interface RoleItem { roleName: string; roleLabel: string; }
interface AuditEntry {
  id: number; action: string; module: string; resourceId: string;
  performedBy: string; details: any; createdAt: string;
}

interface Props {
  initialLevel: UserLevelItem;
  initialUsers: AssignedUser[];
  initialModules: ModuleItem[];
  initialRoles: RoleItem[];
  initialAudit: AuditEntry[];
}

// Full module catalogue (same as create form)
const ALL_MODULES = [
  { key: 'dashboard',       name: 'Dashboard',               category: 'General' },
  { key: 'breeding',        name: 'Breeding Program',        category: 'Livestock' },
  { key: 'sires',           name: 'Sire Register',           category: 'Livestock' },
  { key: 'dams',            name: 'Dam Register',            category: 'Livestock' },
  { key: 'calves',          name: 'Calf Register',           category: 'Livestock' },
  { key: 'herdbook',        name: 'Herdbook Management',     category: 'Certification' },
  { key: 'certificates',    name: 'Certificate Center',      category: 'Certification' },
  { key: 'stock',           name: 'Stock Insemination',      category: 'Inventory' },
  { key: 'user_management', name: 'User Management',         category: 'Administration' },
  { key: 'user_levels',     name: 'User Level Management',   category: 'Administration' },
  { key: 'role_management', name: 'Role Management',         category: 'Administration' },
  { key: 'permission_mgmt', name: 'Permission Management',   category: 'Administration' },
  { key: 'system_setup',    name: 'System Setup',            category: 'Administration' },
  { key: 'audit_logs',      name: 'Audit Logs',              category: 'Administration' },
  { key: 'farm_management', name: 'Farm Management',         category: 'Administration' },
];

// All available system roles
const SYSTEM_ROLES = [
  { roleName: 'Super Admin',          category: 'System' },
  { roleName: 'Admin',                category: 'System' },
  { roleName: 'Breeder',              category: 'Breeding' },
  { roleName: 'Breeding Specialist',  category: 'Breeding' },
  { roleName: 'Breeding Manager',     category: 'Breeding' },
  { roleName: 'Farm Owner',           category: 'Farm' },
  { roleName: 'Farm Manager',         category: 'Farm' },
  { roleName: 'Farm Staff',           category: 'Farm' },
  { roleName: 'Veterinarian',         category: 'Farm' },
  { roleName: 'Customer',             category: 'Customer' },
  { roleName: 'Cow Owner',            category: 'Customer' },
  { roleName: 'Company Manager',      category: 'Sourcing' },
  { roleName: 'Sire Specialist',      category: 'Sourcing' },
  { roleName: 'Stock Manager',        category: 'Sourcing' },
  { roleName: 'Herdbook Verifier',    category: 'Herdbook' },
  { roleName: 'Certificate Officer',  category: 'Herdbook' },
];

const ROLE_CATEGORIES = ['System', 'Breeding', 'Farm', 'Customer', 'Sourcing', 'Herdbook'];

const ACTION_LABELS: Record<string, string> = {
  CREATE_USER_LEVEL: 'User Level Created',
  UPDATE_USER_LEVEL: 'Details Updated',
  ACTIVATE_USER_LEVEL: 'Activated',
  DEACTIVATE_USER_LEVEL: 'Deactivated',
  UPDATE_MODULES: 'Module Access Updated',
  UPDATE_ROLES: 'Role Associations Updated',
  DELETE_USER_LEVEL: 'User Level Deleted',
};

type TabId = 'overview' | 'users' | 'modules' | 'roles' | 'audit';

// ─────────────── Component ───────────────
export default function AdminUserLevelDetailClient({ initialLevel, initialUsers, initialModules, initialRoles, initialAudit }: Props) {
  const router = useRouter();
  const [level, setLevel] = useState(initialLevel);
  const [users] = useState<AssignedUser[]>(initialUsers);
  const [modules, setModules] = useState<ModuleItem[]>(() => {
    // Merge with ALL_MODULES to ensure all modules are represented
    return ALL_MODULES.map(m => {
      const found = initialModules.find(im => im.moduleKey === m.key);
      return { moduleKey: m.key, moduleName: m.name, isAvailable: found ? found.isAvailable : false };
    });
  });
  const [assignedRoles, setAssignedRoles] = useState<Set<string>>(
    new Set(initialRoles.map(r => r.roleName))
  );
  const [auditLog] = useState<AuditEntry[]>(initialAudit);

  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [userSearch, setUserSearch] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState('All');

  // Form state for Overview
  const [name, setName] = useState(level.name);
  const [description, setDescription] = useState(level.description || '');
  const [purpose, setPurpose] = useState(level.purpose || '');
  const [sortOrder, setSortOrder] = useState(level.sortOrder || 10);

  // Loading/toast
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'warning'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error' | 'warning', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  // ── Overview Save ──
  const handleSaveOverview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await updateUserLevelAction(level.id, { name, description, sortOrder: Number(sortOrder) });
      if (res.success) {
        setLevel(prev => ({ ...prev, name, description, purpose, sortOrder }));
        showToast('success', 'User Level details saved successfully.');
      } else {
        showToast('error', res.error || 'Failed to save overview.');
      }
    } catch { showToast('error', 'An error occurred.'); }
    finally { setSaving(false); }
  };

  // ── Status Toggle ──
  const [togglingStatus, setTogglingStatus] = useState(false);
  const handleToggleStatus = async () => {
    const newStatus = level.status === 'Active' ? 'Inactive' : 'Active';
    const confirmed = window.confirm(
      newStatus === 'Inactive'
        ? `Are you sure you want to deactivate "${level.name}"? Users currently assigned to it may lose access to some functions.`
        : `Are you sure you want to activate "${level.name}"?`
    );
    if (!confirmed) return;
    setTogglingStatus(true);
    try {
      const res = await setUserLevelStatusAction(level.id, newStatus);
      if (res.success) {
        setLevel(prev => ({ ...prev, status: newStatus }));
        if (res.warning) showToast('warning', res.warning);
        else showToast('success', `Status changed to ${newStatus}.`);
      } else {
        showToast('error', res.error || 'Failed to update status.');
      }
    } catch { showToast('error', 'An error occurred.'); }
    finally { setTogglingStatus(false); }
  };

  // ── Module Save ──
  const [savingModules, setSavingModules] = useState(false);
  const handleSaveModules = async () => {
    setSavingModules(true);
    try {
      const res = await updateUserLevelModulesAction(level.id, modules.map(m => ({
        moduleKey: m.moduleKey, moduleName: m.moduleName, isAvailable: m.isAvailable
      })));
      if (res.success) showToast('success', 'Module access saved successfully.');
      else showToast('error', res.error || 'Failed to save modules.');
    } catch { showToast('error', 'An error occurred.'); }
    finally { setSavingModules(false); }
  };

  const toggleModule = (key: string) => {
    setModules(prev => prev.map(m => m.moduleKey === key ? { ...m, isAvailable: !m.isAvailable } : m));
  };

  // ── Role Save ──
  const [savingRoles, setSavingRoles] = useState(false);
  const handleSaveRoles = async () => {
    setSavingRoles(true);
    try {
      const roles = Array.from(assignedRoles).map(rn => ({ roleName: rn, roleLabel: rn }));
      const res = await setUserLevelRolesAction(level.id, roles);
      if (res.success) showToast('success', 'Role associations saved successfully.');
      else showToast('error', res.error || 'Failed to save roles.');
    } catch { showToast('error', 'An error occurred.'); }
    finally { setSavingRoles(false); }
  };

  const toggleRole = (roleName: string) => {
    setAssignedRoles(prev => {
      const next = new Set(prev);
      if (next.has(roleName)) next.delete(roleName); else next.add(roleName);
      return next;
    });
  };

  // ── Filtered users ──
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchSearch = !userSearch || u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase());
      const matchStatus = userStatusFilter === 'All' || u.status === userStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [users, userSearch, userStatusFilter]);

  const TABS: { id: TabId; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'overview', label: 'Overview', icon: <Sliders className="h-3.5 w-3.5" /> },
    { id: 'users', label: 'Users', icon: <Users className="h-3.5 w-3.5" />, badge: users.length },
    { id: 'modules', label: 'Modules', icon: <Grid3x3 className="h-3.5 w-3.5" />, badge: modules.filter(m => m.isAvailable).length },
    { id: 'roles', label: 'Roles', icon: <ShieldCheck className="h-3.5 w-3.5" />, badge: assignedRoles.size },
    { id: 'audit', label: 'Audit Log', icon: <History className="h-3.5 w-3.5" />, badge: auditLog.length },
  ];

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 max-w-sm p-4 rounded-2xl shadow-2xl border text-xs font-bold flex items-start gap-3 ${
          toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' :
          toast.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-900' :
          'bg-rose-50 border-rose-200 text-rose-900'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5" /> :
           toast.type === 'warning' ? <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" /> :
           <XCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />}
          <span className="flex-1 leading-relaxed">{toast.message}</span>
          <button onClick={() => setToast(null)} className="cursor-pointer opacity-60 hover:opacity-100">✕</button>
        </div>
      )}

      {/* ── Header ─────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-[#047857] to-[#059669] px-6 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link href="/admin/user-levels" className="p-2.5 rounded-xl bg-white/15 hover:bg-white/25 transition-colors border border-white/20 cursor-pointer">
                <ArrowLeft className="h-4 w-4 text-white" />
              </Link>
              <div className="h-11 w-11 bg-white/20 rounded-xl flex items-center justify-center border border-white/30 flex-shrink-0">
                <Layers className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-white/70 text-[11px] font-bold uppercase tracking-wider">Administration → User Level Management</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <h1 className="text-lg font-black text-white">{level.name}</h1>
                  <span className="font-mono text-xs font-bold bg-white/20 text-white px-2.5 py-0.5 rounded-lg border border-white/20">{level.code}</span>
                  <span className={`text-[10.5px] font-black px-2.5 py-0.5 rounded-full border ${
                    level.status === 'Active' ? 'bg-emerald-400/20 text-white border-white/30' : 'bg-slate-400/20 text-white/70 border-white/20'
                  }`}>{level.status}</span>
                </div>
                {level.purpose && <p className="text-white/60 text-xs font-medium mt-0.5">{level.purpose}</p>}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="flex items-center gap-1.5 text-white/80 text-xs font-bold bg-white/15 px-3 py-1.5 rounded-xl border border-white/20">
                <Users className="h-3.5 w-3.5" />
                {level.userCount || users.length} Users
              </span>
              <button
                onClick={handleToggleStatus}
                disabled={togglingStatus}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer border disabled:opacity-50 ${
                  level.status === 'Active'
                    ? 'bg-white/15 border-white/30 text-white hover:bg-white/25'
                    : 'bg-white text-[#047857] border-white/40 hover:bg-white/90'
                }`}
              >
                {level.status === 'Active' ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                {level.status === 'Active' ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
        </div>

        {/* Concept Banner */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-2 text-xs text-slate-600">
          <Info className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
          <span className="font-medium">
            This <strong className="font-black text-slate-900">User Level</strong> defines the business identity.{' '}
            Use the <strong className="font-black">Roles</strong> tab to associate responsibilities and configure{' '}
            <strong className="font-black">Modules</strong> to control which sections are visible.{' '}
            Actual action permissions are managed separately in Role Management.
          </span>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 px-4 py-2 border-t border-slate-100 overflow-x-auto scrollbar-none">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[#047857] text-white shadow-md shadow-[#047857]/20'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                }`}>{tab.badge}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ══════ TAB 1: OVERVIEW ══════ */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Edit Form */}
          <form onSubmit={handleSaveOverview} className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Edit User Level Details</h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Update the name, description, and configuration of this account type.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">Level Name *</label>
                <input type="text" required value={name} onChange={e => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 focus:outline-none focus:border-[#047857] focus:ring-2 focus:ring-[#047857]/10" />
              </div>
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">Unique Code (Read-only)</label>
                <input type="text" readOnly value={level.code}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100 font-mono font-bold text-slate-600 cursor-not-allowed" />
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <label className="font-bold text-slate-700 block">Description</label>
                <textarea rows={2} value={description} onChange={e => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium text-slate-800 focus:outline-none focus:border-[#047857] resize-none" />
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <label className="font-bold text-slate-700 block">Business Purpose</label>
                <textarea rows={2} value={purpose} onChange={e => setPurpose(e.target.value)}
                  placeholder="Describe the business purpose of this account type..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium text-slate-800 focus:outline-none focus:border-[#047857] resize-none placeholder:text-slate-400" />
              </div>
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">Sort Order</label>
                <input type="number" value={sortOrder} onChange={e => setSortOrder(Number(e.target.value))} min={1}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold focus:outline-none focus:border-[#047857]" />
              </div>
            </div>
            <div className="flex items-center justify-end border-t border-slate-100 pt-4">
              <button type="submit" disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#047857] hover:bg-[#065f46] text-white text-xs font-black shadow-lg transition-all cursor-pointer disabled:opacity-50">
                <Save className="h-4 w-4" />
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </form>

          {/* Info Panel */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4 text-xs">
              <h4 className="font-black text-slate-800 text-[11px] uppercase tracking-wider">Level Details</h4>
              {[
                { label: 'ID', value: level.id },
                { label: 'Code', value: level.code, mono: true },
                { label: 'Users Assigned', value: level.userCount || users.length },
                { label: 'Status', value: level.status },
                { label: 'Created', value: level.createdAt ? new Date(level.createdAt).toLocaleDateString() : '—' },
                { label: 'Last Updated', value: level.updatedAt ? new Date(level.updatedAt).toLocaleDateString() : '—' },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-slate-400 font-bold">{item.label}</span>
                  <span className={`font-black text-slate-900 ${(item as any).mono ? 'font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded-lg' : ''}`}>
                    {String(item.value)}
                  </span>
                </div>
              ))}
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs space-y-1.5">
              <p className="font-black text-amber-900 flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5" /> Remember
              </p>
              <p className="text-amber-800 font-medium leading-relaxed">
                This User Level defines the <strong>business identity</strong> only.
                Roles determine responsibilities. Permissions control specific actions.
                These three concepts are managed separately.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ══════ TAB 2: USERS ══════ */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
            <div>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Users Assigned to {level.name}</h3>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">{users.length} users with this primary account type</p>
            </div>
            <Link href="/admin/users" className="px-4 py-2 bg-[#047857] text-white text-xs font-bold rounded-xl hover:bg-[#065f46] transition-colors cursor-pointer">
              Manage All Users
            </Link>
          </div>
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input type="text" placeholder="Search by name or email..." value={userSearch} onChange={e => setUserSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#047857]" />
            </div>
            <div className="flex items-center gap-2 text-xs">
              {(['All', 'Active', 'Inactive'] as const).map(s => (
                <button key={s} onClick={() => setUserStatusFilter(s)}
                  className={`px-3 py-2 rounded-xl font-bold cursor-pointer transition-all ${userStatusFilter === s ? 'bg-[#047857] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/40 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  <th className="py-3 px-5">User</th>
                  <th className="py-3 px-5">Role</th>
                  <th className="py-3 px-5">Farm / Organization</th>
                  <th className="py-3 px-5">Data Scope</th>
                  <th className="py-3 px-5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredUsers.length === 0 ? (
                  <tr><td colSpan={5} className="py-12 text-center text-slate-500 font-medium">
                    <div className="flex flex-col items-center gap-2">
                      <Users className="h-8 w-8 text-slate-300" />
                      <p>No users found matching your criteria.</p>
                    </div>
                  </td></tr>
                ) : filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-[#047857] to-[#059669] flex items-center justify-center text-white font-black text-xs flex-shrink-0">
                          {u.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-black text-slate-900">{u.name}</p>
                          <p className="text-[11px] text-slate-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 font-bold text-slate-800">{u.role}</td>
                    <td className="py-3.5 px-5 text-slate-600 font-medium">{u.farmLocation || u.companyName || '—'}</td>
                    <td className="py-3.5 px-5">
                      <span className="font-mono text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200">{u.dataScope || 'ASSIGNED_RECORD'}</span>
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${u.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>{u.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══════ TAB 3: MODULES ══════ */}
      {activeTab === 'modules' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Module Access Configuration</h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Toggle which system modules are <strong>visible</strong> to users with the <strong>{level.name}</strong> account type.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                {modules.filter(m => m.isAvailable).length}/{modules.length} enabled
              </span>
              <button onClick={handleSaveModules} disabled={savingModules}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#047857] hover:bg-[#065f46] text-white font-black shadow-md transition-all cursor-pointer disabled:opacity-50">
                <Save className="h-4 w-4" />
                <span>{savingModules ? 'Saving...' : 'Save Access'}</span>
              </button>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs">
            <p className="text-amber-900 font-medium flex items-start gap-2">
              <Info className="h-3.5 w-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
              <span>Module access determines which sections are <strong>visible</strong> in the navigation.
              What a user can <strong>actually do</strong> within each module is controlled by their assigned <strong>Role</strong> and <strong>Permissions</strong>.
              These are separate configurations.</span>
            </p>
          </div>

          {['General', 'Livestock', 'Certification', 'Inventory', 'Administration'].map(category => {
            const catModules = modules.filter(m => ALL_MODULES.find(am => am.key === m.moduleKey)?.category === category);
            if (catModules.length === 0) return null;
            return (
              <div key={category} className="space-y-2 text-xs">
                <p className="font-black text-slate-700 uppercase tracking-wider text-[10.5px] border-b border-slate-100 pb-1">{category}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {catModules.map(mod => (
                    <button key={mod.moduleKey} type="button" onClick={() => toggleModule(mod.moduleKey)}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer text-left ${
                        mod.isAvailable
                          ? 'bg-emerald-50 border-emerald-200 shadow-xs'
                          : 'bg-slate-50 border-slate-200 opacity-70'
                      }`}>
                      <div className="flex items-center gap-2.5">
                        <div className={`h-5 w-5 rounded-md border flex items-center justify-center flex-shrink-0 ${mod.isAvailable ? 'bg-[#047857] border-[#047857]' : 'border-slate-300 bg-white'}`}>
                          {mod.isAvailable && <Check className="h-3 w-3 text-white" />}
                        </div>
                        <span className={`font-bold ${mod.isAvailable ? 'text-emerald-900' : 'text-slate-600'}`}>{mod.moduleName}</span>
                      </div>
                      <div className={`h-5 w-9 rounded-full p-0.5 flex items-center transition-colors ${mod.isAvailable ? 'bg-[#047857] justify-end' : 'bg-slate-300 justify-start'}`}>
                        <div className="h-4 w-4 rounded-full bg-white shadow-xs" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ══════ TAB 4: ROLES ══════ */}
      {activeTab === 'roles' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Role Associations</h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Select which roles can be assigned to users with the <strong>{level.name}</strong> account type.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                {assignedRoles.size} roles selected
              </span>
              <button onClick={handleSaveRoles} disabled={savingRoles}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#047857] hover:bg-[#065f46] text-white font-black shadow-md transition-all cursor-pointer disabled:opacity-50">
                <Save className="h-4 w-4" />
                <span>{savingRoles ? 'Saving...' : 'Save Roles'}</span>
              </button>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-xs">
            <p className="text-blue-900 font-medium flex items-start gap-2">
              <Info className="h-3.5 w-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
              <span>Roles define the <strong>responsibility</strong> of a user. Selecting a role here means users with this account type
              <em>can</em> be assigned that role. The actual CRUD permissions for each role are managed separately in <strong>Role Management</strong>.</span>
            </p>
          </div>

          {ROLE_CATEGORIES.map(category => {
            const catRoles = SYSTEM_ROLES.filter(r => r.category === category);
            return (
              <div key={category} className="space-y-2 text-xs">
                <p className="font-black text-slate-700 uppercase tracking-wider text-[10.5px] border-b border-slate-100 pb-1">{category} Roles</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {catRoles.map(role => {
                    const isSelected = assignedRoles.has(role.roleName);
                    return (
                      <button key={role.roleName} type="button" onClick={() => toggleRole(role.roleName)}
                        className={`flex items-center gap-2.5 p-3.5 rounded-2xl border transition-all cursor-pointer text-left ${
                          isSelected ? 'bg-emerald-50 border-emerald-200 shadow-xs' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                        }`}>
                        <div className={`h-5 w-5 rounded-md border flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-[#047857] border-[#047857]' : 'border-slate-300 bg-white'}`}>
                          {isSelected && <Check className="h-3 w-3 text-white" />}
                        </div>
                        <span className={`font-bold ${isSelected ? 'text-emerald-900' : 'text-slate-600'}`}>{role.roleName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ══════ TAB 5: AUDIT LOG ══════ */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50/60">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <History className="h-4 w-4 text-[#047857]" />
              Activity & Audit History
            </h3>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">All changes and actions recorded for this User Level.</p>
          </div>
          <div className="divide-y divide-slate-100">
            {auditLog.length === 0 ? (
              <div className="py-16 text-center text-slate-500 flex flex-col items-center gap-2">
                <History className="h-8 w-8 text-slate-300" />
                <p className="font-bold text-slate-600 text-sm">No audit entries yet</p>
                <p className="text-xs text-slate-400">Actions on this User Level will appear here.</p>
              </div>
            ) : auditLog.map(entry => (
              <div key={entry.id} className="flex items-start gap-4 px-6 py-4 hover:bg-slate-50 transition-colors text-xs">
                <div className="h-8 w-8 rounded-xl bg-[#047857]/10 border border-[#047857]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Clock className="h-4 w-4 text-[#047857]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-slate-900">{ACTION_LABELS[entry.action] || entry.action}</p>
                  <p className="text-slate-500 font-medium mt-0.5">
                    By <strong className="text-slate-700">{entry.performedBy}</strong>
                    {entry.details && Object.keys(entry.details).length > 0 && (
                      <span className="ml-1 text-slate-400">
                        · {typeof entry.details === 'object' ? JSON.stringify(entry.details).slice(0, 80) : ''}
                      </span>
                    )}
                  </p>
                </div>
                <span className="font-mono text-[10px] text-slate-400 font-bold flex-shrink-0">
                  {new Date(entry.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
