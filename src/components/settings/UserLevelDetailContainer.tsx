'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Layers, Users, Grid, ShieldCheck, History, Save, CheckCircle2, AlertCircle, ToggleLeft, Check, Sliders, Lock } from 'lucide-react';
import { updateUserLevelAction, setUserLevelStatusAction, updateUserLevelModulesAction } from '@/app/actions';

interface UserLevelItem {
  id: string;
  code: string;
  name: string;
  description: string;
  status: 'Active' | 'Inactive';
  sortOrder: number;
  userCount: number;
}

interface AssignedUserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  dataScope: string;
  status: string;
  farmLocation?: string;
  companyName?: string;
}

interface ModuleAccessItem {
  moduleKey: string;
  moduleName: string;
  isAvailable: boolean;
}

interface UserLevelDetailContainerProps {
  initialLevel: UserLevelItem;
  initialUsers: AssignedUserItem[];
  initialModules: ModuleAccessItem[];
}

export default function UserLevelDetailContainer({ initialLevel, initialUsers, initialModules }: UserLevelDetailContainerProps) {
  const [level, setLevel] = useState<UserLevelItem>(initialLevel);
  const [users, setUsers] = useState<AssignedUserItem[]>(initialUsers);
  const [modules, setModules] = useState<ModuleAccessItem[]>(initialModules);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'modules' | 'roles' | 'audit'>('overview');

  const [name, setName] = useState(level.name);
  const [description, setDescription] = useState(level.description || '');
  const [sortOrder, setSortOrder] = useState(level.sortOrder || 10);
  const [status, setStatus] = useState<'Active' | 'Inactive'>(level.status);

  const [savingOverview, setSavingOverview] = useState(false);
  const [savingModules, setSavingModules] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const allSystemModules = [
    { key: 'dashboard', name: 'Dashboard Overview', category: 'General' },
    { key: 'breeding', name: 'Breeding Program Operations', category: 'Livestock' },
    { key: 'sires', name: 'Sire Bull Register', category: 'Livestock' },
    { key: 'dams', name: 'Dam Cow Register', category: 'Livestock' },
    { key: 'calves', name: 'Calf Register & Management', category: 'Livestock' },
    { key: 'herdbook', name: 'Herdbook Official Registry', category: 'Certification' },
    { key: 'certificates', name: 'Certificate Center (A4 Landscape)', category: 'Certification' },
    { key: 'stock', name: 'Stock Insemination (Semen Straws)', category: 'Inventory' },
    { key: 'user_levels', name: 'User Level Management', category: 'Administration' },
    { key: 'roles', name: 'Role & Permission Management', category: 'Administration' },
    { key: 'users', name: 'User Account Management', category: 'Administration' },
    { key: 'system_setup', name: 'System Setup & Configuration', category: 'Administration' }
  ];

  const handleSaveOverview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingOverview(true);
    try {
      const res = await updateUserLevelAction(level.id, {
        name,
        description,
        sortOrder: Number(sortOrder),
        status
      });

      if (res.success) {
        setLevel(prev => ({ ...prev, name, description, sortOrder, status }));
        setToastMessage('Overview settings saved successfully.');
      } else {
        alert(res.error || 'Failed to save overview');
      }
    } catch (err: any) {
      alert(err.message || 'Error updating overview');
    } finally {
      setSavingOverview(false);
    }
  };

  const handleToggleModule = (moduleKey: string) => {
    setModules(prev =>
      prev.map(m => m.moduleKey === moduleKey ? { ...m, isAvailable: !m.isAvailable } : m)
    );
  };

  const handleSaveModules = async () => {
    setSavingModules(true);
    try {
      const res = await updateUserLevelModulesAction(level.id, modules);
      if (res.success) {
        setToastMessage('Module access permissions updated successfully.');
      } else {
        alert(res.error || 'Failed to update modules');
      }
    } catch (err: any) {
      alert(err.message || 'Error updating modules');
    } finally {
      setSavingModules(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      
      {/* Toast Banner */}
      {toastMessage && (
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center justify-between gap-3 text-xs text-emerald-900 shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <span className="font-bold">{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-emerald-700 font-black hover:underline cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/settings/user-levels"
              className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900">{level.name}</h1>
                <span className="font-mono text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-lg border border-slate-200">
                  {level.code}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-black border ${
                  level.status === 'Active' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-slate-100 text-slate-600 border-slate-300'
                }`}>
                  {level.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">{level.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-500 bg-purple-50 text-purple-700 px-3 py-1.5 rounded-xl border border-purple-200 flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              <span>{users.length} Users Assigned</span>
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-t border-slate-200 pt-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'overview' ? 'bg-[#047857] text-white shadow-md shadow-[#047857]/20' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Sliders className="h-4 w-4" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'users' ? 'bg-[#047857] text-white shadow-md shadow-[#047857]/20' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Assigned Users ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('modules')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'modules' ? 'bg-[#047857] text-white shadow-md shadow-[#047857]/20' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Grid className="h-4 w-4" />
            <span>Available Modules</span>
          </button>

          <button
            onClick={() => setActiveTab('roles')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'roles' ? 'bg-[#047857] text-white shadow-md shadow-[#047857]/20' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Associated Roles</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'audit' ? 'bg-[#047857] text-white shadow-md shadow-[#047857]/20' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <History className="h-4 w-4" />
            <span>Audit Log</span>
          </button>
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <form onSubmit={handleSaveOverview} className="bg-white border border-slate-200 rounded-3xl p-6 space-y-5 shadow-xs">
          <div className="border-b border-slate-200 pb-3">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">User Level Specifications</h3>
            <p className="text-xs text-slate-500 font-semibold">Configure basic business level metadata and status.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">Level Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 focus:outline-none focus:border-[#047857]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">Level Code (Read-Only)</label>
              <input
                type="text"
                readOnly
                value={level.code}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100 font-mono font-bold text-slate-600 cursor-not-allowed"
              />
            </div>

            <div className="col-span-2 space-y-1.5">
              <label className="font-bold text-slate-700 block">Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium text-slate-800 focus:outline-none focus:border-[#047857]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">Sort Order</label>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold focus:outline-none focus:border-[#047857]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'Active' | 'Inactive')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold focus:outline-none focus:border-[#047857]"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end border-t border-slate-200 pt-4">
            <button
              type="submit"
              disabled={savingOverview}
              className="px-6 py-2.5 rounded-2xl bg-[#047857] hover:bg-[#065f46] text-white text-xs font-black shadow-lg shadow-[#047857]/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{savingOverview ? 'Saving...' : 'Save Overview'}</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: ASSIGNED USERS */}
      {activeTab === 'users' && (
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
          <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Users Assigned to {level.name}</h3>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">Real users with primary account level set to {level.name}.</p>
            </div>
            <Link
              href="/settings/users"
              className="px-3.5 py-1.5 bg-[#047857] text-white text-xs font-bold rounded-xl hover:bg-[#065f46] transition-colors"
            >
              Manage System Users
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-100/60 text-[10px] font-black uppercase text-slate-500 tracking-wider">
                  <th className="py-3 px-5">User Name & Email</th>
                  <th className="py-3 px-5">Assigned Operational Role</th>
                  <th className="py-3 px-5">Data Scope</th>
                  <th className="py-3 px-5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-500 font-medium">
                      No users are currently assigned to this User Level.
                    </td>
                  </tr>
                ) : (
                  users.map((usr) => (
                    <tr key={usr.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-5">
                        <div>
                          <p className="font-black text-slate-900">{usr.name}</p>
                          <p className="text-[11px] text-slate-500">{usr.email}</p>
                        </div>
                      </td>
                      <td className="py-3.5 px-5 font-bold text-slate-800">{usr.role}</td>
                      <td className="py-3.5 px-5">
                        <span className="font-mono text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200">
                          {usr.dataScope}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          usr.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                          {usr.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: MODULE ACCESS CONFIGURATION */}
      {activeTab === 'modules' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Configure Module Availability</h3>
              <p className="text-xs text-slate-500 font-semibold">
                Select which system modules are visible to users with the {level.name} user level.
              </p>
            </div>
            <button
              onClick={handleSaveModules}
              disabled={savingModules}
              className="px-5 py-2 rounded-xl bg-[#047857] hover:bg-[#065f46] text-white text-xs font-black shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{savingModules ? 'Saving...' : 'Save Module Access'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {allSystemModules.map((sysMod) => {
              const currentMod = modules.find(m => m.moduleKey === sysMod.key);
              const isEnabled = currentMod ? currentMod.isAvailable : true;

              return (
                <div
                  key={sysMod.key}
                  onClick={() => handleToggleModule(sysMod.key)}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                    isEnabled
                      ? 'bg-emerald-50/70 border-emerald-200 shadow-2xs'
                      : 'bg-slate-50 border-slate-200 opacity-65'
                  }`}
                >
                  <div className="space-y-0.5">
                    <span className="text-[9.5px] font-black uppercase text-slate-400 tracking-wider block">{sysMod.category}</span>
                    <p className="font-black text-slate-900">{sysMod.name}</p>
                    <p className="text-[10px] text-slate-500 font-medium">Module Key: <code className="font-mono">{sysMod.key}</code></p>
                  </div>

                  <div className={`h-6 w-11 rounded-full p-0.5 transition-colors flex items-center ${isEnabled ? 'bg-[#047857] justify-end' : 'bg-slate-300 justify-start'}`}>
                    <div className="h-5 w-5 rounded-full bg-white shadow-xs" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: ASSOCIATED ROLES */}
      {activeTab === 'roles' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
          <div className="border-b border-slate-200 pb-3">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Operational Roles for {level.name}</h3>
            <p className="text-xs text-slate-500 font-semibold">
              Operational responsibilities assigned to users under this User Level.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-black text-slate-900">Breeding Specialist</span>
                <span className="text-[10px] font-bold bg-sky-50 text-sky-700 px-2 py-0.5 rounded-md border border-sky-200">Breeding</span>
              </div>
              <p className="text-slate-600 font-medium">Initiates 6-step breeding programs, confirms AI services, and manages technical costing.</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-black text-slate-900">Farm Manager</span>
                <span className="text-[10px] font-bold bg-purple-50 text-purple-700 px-2 py-0.5 rounded-md border border-purple-200">Farm</span>
              </div>
              <p className="text-slate-600 font-medium">Full operational control and lifecycle management of farm animals and breeding requests.</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: AUDIT LOG */}
      {activeTab === 'audit' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
          <div className="border-b border-slate-200 pb-3">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Audit Log & History</h3>
            <p className="text-xs text-slate-500 font-semibold">Track changes, status toggles, and user level assignments.</p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="font-bold text-slate-900">User Level Configured</p>
                <p className="text-[11px] text-slate-500">Initialized level code {level.code} with default module access.</p>
              </div>
              <span className="text-[10px] text-slate-400 font-mono font-bold">2026-08-10</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
