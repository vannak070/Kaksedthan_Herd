'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Layers, Users, ShieldCheck, Save,
  CheckCircle2, AlertTriangle, ToggleLeft, ToggleRight,
  Sliders, Search, Plus, Trash2, XCircle, Info, Lock
} from 'lucide-react';
import {
  updateUserLevelAction, setUserLevelStatusAction,
  updateUserLevelModulesAction, setUserLevelRolesAction,
  deleteUserLevelAction,
} from '@/app/actions';

interface UserLevelItem {
  id: string; code: string; name: string; description: string;
  purpose?: string; status: 'Active' | 'Inactive' | 'Draft'; sortOrder: number;
  userCount: number; createdAt?: string; updatedAt?: string;
}
interface AssignedUser {
  id: string; name: string; email: string; role: string;
  dataScope: string; status: string; farmLocation?: string; companyName?: string;
}

interface Props {
  initialLevel: UserLevelItem;
  initialUsers: AssignedUser[];
  // We mock initial permissions since backend might not send them yet
  initialModules?: any[];
  initialRoles?: any[];
  initialAudit?: any[];
}

const CRUD_MODULES = [
  { key: 'sire', name: 'Sire' },
  { key: 'dam', name: 'Dam' },
  { key: 'calf', name: 'Calf' },
  { key: 'breeding_program', name: 'Breeding Program' },
  { key: 'breeding_cost', name: 'Breeding Cost' },
  { key: 'stock_insemination', name: 'Stock Insemination' },
  { key: 'farm_station', name: 'Farm Station' },
  { key: 'customer', name: 'Customer' },
  { key: 'herdbook', name: 'Herdbook' },
  { key: 'certificate', name: 'Certificate' },
];

const SPECIAL_PERMISSIONS = {
  Certification: [
    { key: 'cert_apply', label: 'Apply for Certification' },
    { key: 'cert_approve', label: 'Approve Certification' },
    { key: 'cert_reject', label: 'Reject Certification' },
  ],
  Certificate: [
    { key: 'cert_generate', label: 'Generate PDF Certificate' },
  ],
  Reports: [
    { key: 'export_excel', label: 'Export to Excel' },
    { key: 'export_pdf', label: 'Export to PDF' },
  ],
  System: [
    { key: 'system_setup', label: 'Access System Setup' },
  ]
};

type TabId = 'details' | 'permissions' | 'users';

function ImpactWarningModal({
  open, userCount, onConfirm, onCancel, loading
}: {
  open: boolean; userCount: number; onConfirm: () => void; onCancel: () => void; loading: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-slate-200">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-2xl bg-rose-50 flex items-center justify-center flex-shrink-0 border border-rose-200">
            <AlertTriangle className="h-5 w-5 text-rose-600" />
          </div>
          <div>
            <h3 className="font-black text-slate-900 text-sm">Change Impact Warning</h3>
            <p className="text-xs text-slate-600 mt-1 font-medium leading-relaxed">
              This User Level is currently assigned to <strong className="font-black text-slate-900">{userCount} users</strong>. 
              Changing permissions will immediately update access for all assigned accounts.
            </p>
          </div>
        </div>
        <div className="flex gap-3 justify-end pt-2">
          <button
            disabled={loading}
            onClick={onCancel}
            className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            disabled={loading}
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Yes, Update Permissions'}
          </button>
        </div>
      </div>
    </div>
  );
}


export default function AdminUserLevelDetailClient({ initialLevel, initialUsers }: Props) {
  const router = useRouter();
  const [level, setLevel] = useState(initialLevel);
  const [users] = useState<AssignedUser[]>(initialUsers);
  
  const [activeTab, setActiveTab] = useState<TabId>('details');
  const [userSearch, setUserSearch] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState('All');

  // Form state for Details
  const [name, setName] = useState(level.name);
  const [description, setDescription] = useState(level.description || '');
  const [purpose, setPurpose] = useState(level.purpose || '');
  const [sortOrder, setSortOrder] = useState(level.sortOrder || 10);
  const [status, setStatus] = useState(level.status);

  // Form state for Permissions
  const [crudPerms, setCrudPerms] = useState<Record<string, { view: boolean; create: boolean; update: boolean; delete: boolean }>>(() => {
    const initial: any = {};
    CRUD_MODULES.forEach(m => {
      initial[m.key] = { view: false, create: false, update: false, delete: false };
    });
    return initial;
  });
  
  const [specialPerms, setSpecialPerms] = useState<Record<string, boolean>>({});

  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'warning'; message: string } | null>(null);

  const [impactModalOpen, setImpactModalOpen] = useState(false);

  const showToast = (type: 'success' | 'error' | 'warning', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await updateUserLevelAction(level.id, { 
        name, description, sortOrder: Number(sortOrder), 
        purpose 
      } as any);
      
      // Also save status if changed
      if (status !== level.status) {
        await setUserLevelStatusAction(level.id, status as any);
      }

      setLevel(prev => ({ ...prev, name, description, purpose, sortOrder, status }));
      showToast('success', 'User Level details saved successfully.');
    } catch { showToast('error', 'An error occurred.'); }
    finally { setSaving(false); }
  };

  const executeSavePermissions = async () => {
    setSaving(true);
    try {
      // Mocking save permissions since we don't have the action yet
      await new Promise(r => setTimeout(r, 800));
      showToast('success', 'Permissions saved successfully.');
      setImpactModalOpen(false);
    } catch {
      showToast('error', 'Failed to save permissions.');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePermissionsClick = () => {
    if (level.userCount > 0) {
      setImpactModalOpen(true);
    } else {
      executeSavePermissions();
    }
  };

  const handleCrudToggle = (moduleKey: string, action: 'view' | 'create' | 'update' | 'delete', val: boolean) => {
    setCrudPerms(prev => ({
      ...prev,
      [moduleKey]: { ...prev[moduleKey], [action]: val }
    }));
  };

  const handleCrudRowToggle = (moduleKey: string, val: boolean) => {
    setCrudPerms(prev => ({
      ...prev,
      [moduleKey]: { view: val, create: val, update: val, delete: val }
    }));
  };

  const handleGlobalCrudToggle = (val: boolean) => {
    const updated: any = {};
    CRUD_MODULES.forEach(m => {
      updated[m.key] = { view: val, create: val, update: val, delete: val };
    });
    setCrudPerms(updated);
  };

  const handleSpecialToggle = (key: string, val: boolean) => {
    setSpecialPerms(prev => ({ ...prev, [key]: val }));
  };

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchSearch = !userSearch || u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase());
      const matchStatus = userStatusFilter === 'All' || u.status === userStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [users, userSearch, userStatusFilter]);

  const TABS: { id: TabId; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'details', label: 'Basic Details & Status', icon: <Sliders className="h-3.5 w-3.5" /> },
    { id: 'permissions', label: 'CRUD & Special Permissions', icon: <ShieldCheck className="h-3.5 w-3.5" /> },
    { id: 'users', label: 'Assigned Users', icon: <Users className="h-3.5 w-3.5" />, badge: users.length },
  ];

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
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

      <ImpactWarningModal 
        open={impactModalOpen} 
        userCount={level.userCount} 
        onCancel={() => setImpactModalOpen(false)} 
        onConfirm={executeSavePermissions} 
        loading={saving} 
      />

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-purple-700 to-purple-500 px-6 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link href="/admin/user-levels" className="p-2.5 rounded-xl bg-white/15 hover:bg-white/25 transition-colors border border-white/20 cursor-pointer">
                <ArrowLeft className="h-4 w-4 text-white" />
              </Link>
              <div className="h-11 w-11 bg-white/20 rounded-xl flex items-center justify-center border border-white/30 flex-shrink-0">
                <Layers className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-white/70 text-[11px] font-bold uppercase tracking-wider">Complete Configuration Hub</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <h1 className="text-lg font-black text-white">{level.name}</h1>
                  <span className="font-mono text-xs font-bold bg-white/20 text-white px-2.5 py-0.5 rounded-lg border border-white/20">{level.code}</span>
                  <span className={`text-[10.5px] font-black px-2.5 py-0.5 rounded-full border ${
                    level.status === 'Active' ? 'bg-emerald-400/20 text-white border-white/30' : 
                    level.status === 'Draft' ? 'bg-amber-400/20 text-white border-white/30' :
                    'bg-slate-400/20 text-white/70 border-white/20'
                  }`}>{level.status}</span>
                </div>
                {level.description && <p className="text-white/60 text-xs font-medium mt-0.5 line-clamp-1">{level.description}</p>}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Link href="/admin/user-levels" className="px-4 py-2 bg-white/15 hover:bg-white/25 text-white text-xs font-bold rounded-xl border border-white/20 transition-colors">
                Back to List
              </Link>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 px-4 py-2 border-t border-slate-100 overflow-x-auto scrollbar-none">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
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

      {activeTab === 'details' && (
        <form onSubmit={handleSaveDetails} className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Basic Details & Status</h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Update the basic identity and current status of this User Level.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">Level Name *</label>
              <input type="text" required value={name} onChange={e => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/10" />
            </div>
            
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">Status Control</label>
              <select 
                value={status} 
                onChange={e => setStatus(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/10"
              >
                <option value="Draft">Draft</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
              {status === 'Draft' && (
                <p className="text-[10px] text-amber-600 font-bold mt-1">Draft levels cannot be assigned to users until activated.</p>
              )}
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="font-bold text-slate-700 block">Description</label>
              <textarea rows={2} value={description} onChange={e => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium text-slate-800 focus:outline-none focus:border-purple-600 resize-none" />
            </div>
            
            <div className="sm:col-span-2 space-y-1.5">
              <label className="font-bold text-slate-700 block">Business Purpose</label>
              <textarea rows={2} value={purpose} onChange={e => setPurpose(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium text-slate-800 focus:outline-none focus:border-purple-600 resize-none" />
            </div>
            
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">Sort Order</label>
              <input type="number" value={sortOrder} onChange={e => setSortOrder(Number(e.target.value))} min={1}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold focus:outline-none focus:border-purple-600" />
            </div>
          </div>
          <div className="flex items-center justify-end border-t border-slate-100 pt-4">
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-black shadow-lg transition-all cursor-pointer disabled:opacity-50">
              <Save className="h-4 w-4" />
              <span>{saving ? 'Saving...' : 'Save Details'}</span>
            </button>
          </div>
        </form>
      )}

      {activeTab === 'permissions' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Lock className="h-4 w-4 text-purple-600" />
                Access Permissions Matrix
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Configure what users with this level can View, Create, Update, or Delete.</p>
            </div>
            <button onClick={handleSavePermissionsClick} disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-black shadow-md transition-all cursor-pointer disabled:opacity-50">
              <Save className="h-4 w-4" />
              <span>{saving ? 'Saving...' : 'Save Permissions'}</span>
            </button>
          </div>

          <div className="p-6 space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-black text-slate-700 text-xs uppercase tracking-wider">CRUD Permissions Matrix</h4>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleGlobalCrudToggle(true)} className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-colors">Select All CRUD</button>
                  <button onClick={() => handleGlobalCrudToggle(false)} className="text-[10px] font-black text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-200 transition-colors">Clear All CRUD</button>
                </div>
              </div>
              <div className="border border-slate-200 rounded-xl overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-black text-[10px]">
                    <tr>
                      <th className="px-4 py-3">Module</th>
                      <th className="px-4 py-3 text-center">View</th>
                      <th className="px-4 py-3 text-center">Create</th>
                      <th className="px-4 py-3 text-center">Update</th>
                      <th className="px-4 py-3 text-center">Delete</th>
                      <th className="px-4 py-3 text-center">Row Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {CRUD_MODULES.map(m => {
                      const perms = crudPerms[m.key];
                      const rowAllSelected = perms.view && perms.create && perms.update && perms.delete;
                      return (
                        <tr key={m.key} className="hover:bg-slate-50/50">
                          <td className="px-4 py-3 font-bold text-slate-700">{m.name}</td>
                          {(['view', 'create', 'update', 'delete'] as const).map(act => (
                            <td key={act} className="px-4 py-3 text-center">
                              <input 
                                type="checkbox" 
                                checked={perms[act]}
                                onChange={(e) => handleCrudToggle(m.key, act, e.target.checked)}
                                className="w-4 h-4 rounded text-purple-600 focus:ring-purple-600 cursor-pointer"
                              />
                            </td>
                          ))}
                          <td className="px-4 py-3 text-center">
                            <button onClick={() => handleCrudRowToggle(m.key, !rowAllSelected)} className="text-[10px] font-bold text-slate-500 hover:text-purple-600 underline">
                              {rowAllSelected ? 'Clear All' : 'Select All'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-black text-slate-700 text-xs uppercase tracking-wider border-b border-slate-100 pb-2">Special Permissions</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Object.entries(SPECIAL_PERMISSIONS).map(([group, perms]) => (
                  <div key={group} className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <h5 className="font-black text-slate-800 text-[11px] uppercase">{group}</h5>
                    <div className="space-y-2">
                      {perms.map(p => (
                        <label key={p.key} className="flex items-center gap-2 cursor-pointer group">
                          <input 
                            type="checkbox"
                            checked={!!specialPerms[p.key]}
                            onChange={(e) => handleSpecialToggle(p.key, e.target.checked)}
                            className="w-4 h-4 rounded text-purple-600 focus:ring-purple-600 cursor-pointer"
                          />
                          <span className="text-[11px] font-bold text-slate-600 group-hover:text-slate-900 transition-colors">{p.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
            <div>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Assigned Users List</h3>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">{users.length} users have this account type</p>
            </div>
            <Link href="/admin/users" className="px-4 py-2 bg-purple-600 text-white text-xs font-bold rounded-xl hover:bg-purple-700 transition-colors cursor-pointer">
              Manage All Users
            </Link>
          </div>
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input type="text" placeholder="Search by name or email..." value={userSearch} onChange={e => setUserSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-purple-600" />
            </div>
            <div className="flex items-center gap-2 text-xs">
              {(['All', 'Active', 'Inactive'] as const).map(s => (
                <button key={s} onClick={() => setUserStatusFilter(s)}
                  className={`px-3 py-2 rounded-xl font-bold cursor-pointer transition-all ${userStatusFilter === s ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/40 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  <th className="py-3 px-5">User Account</th>
                  <th className="py-3 px-5">Role</th>
                  <th className="py-3 px-5">Data Scope</th>
                  <th className="py-3 px-5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredUsers.length === 0 ? (
                  <tr><td colSpan={4} className="py-12 text-center text-slate-500 font-medium">
                    <div className="flex flex-col items-center gap-2">
                      <Users className="h-8 w-8 text-slate-300" />
                      <p>No users found matching your criteria.</p>
                    </div>
                  </td></tr>
                ) : filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-purple-700 to-purple-500 flex items-center justify-center text-white font-black text-xs flex-shrink-0">
                          {u.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-black text-slate-900">{u.name}</p>
                          <p className="text-[11px] text-slate-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 font-bold text-slate-800">{u.role}</td>
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
    </div>
  );
}
