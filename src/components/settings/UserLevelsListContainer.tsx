'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Layers, Plus, ShieldCheck, Users, CheckCircle2, AlertCircle, ArrowRight, Settings, Sliders, Lock, Check, ToggleLeft, ToggleRight } from 'lucide-react';
import { createUserLevelAction, setUserLevelStatusAction } from '@/app/actions';

interface UserLevelItem {
  id: string;
  code: string;
  name: string;
  description: string;
  status: 'Active' | 'Inactive';
  sortOrder: number;
  userCount: number;
}

interface UserLevelsListContainerProps {
  initialLevels: UserLevelItem[];
}

export default function UserLevelsListContainer({ initialLevels }: UserLevelsListContainerProps) {
  const router = useRouter();
  const [levels, setLevels] = useState<UserLevelItem[]>(initialLevels);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  // New User Level Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [sortOrder, setSortOrder] = useState(10);
  const [selectedModules, setSelectedModules] = useState<string[]>(['dashboard', 'breeding', 'calves', 'certificates']);

  const allAvailableModules = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'breeding', label: 'Breeding Program' },
    { key: 'sires', label: 'Sire Register' },
    { key: 'dams', label: 'Dam Register' },
    { key: 'calves', label: 'Calf Register' },
    { key: 'herdbook', label: 'Herdbook Management' },
    { key: 'certificates', label: 'Certificate Center' },
    { key: 'stock', label: 'Stock Insemination' },
    { key: 'user_levels', label: 'User Level Management' },
    { key: 'roles', label: 'Role Management' },
    { key: 'users', label: 'User Management' },
    { key: 'system_setup', label: 'System Setup' }
  ];

  const totalUsers = levels.reduce((acc, lvl) => acc + (lvl.userCount || 0), 0);
  const activeLevels = levels.filter(lvl => lvl.status === 'Active').length;

  const handleToggleModule = (key: string) => {
    setSelectedModules(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const handleCreateLevel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;

    setLoading(true);
    try {
      const res = await createUserLevelAction({
        name: name.trim(),
        code: code.trim().toUpperCase(),
        description: description.trim(),
        sortOrder: Number(sortOrder) || 10,
        defaultModules: selectedModules
      });

      if (res.success && res.data) {
        setLevels(prev => [...prev, res.data]);
        setIsModalOpen(false);
        setName('');
        setCode('');
        setDescription('');
      } else {
        alert(res.error || 'Failed to create user level');
      }
    } catch (err: any) {
      alert(err.message || 'Error creating level');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (level: UserLevelItem) => {
    const newStatus = level.status === 'Active' ? 'Inactive' : 'Active';
    try {
      const res = await setUserLevelStatusAction(level.id, newStatus);
      if (res.success) {
        if (res.warning) {
          setWarningMessage(res.warning);
        }
        setLevels(prev => prev.map(l => l.id === level.id ? { ...l, status: newStatus } : l));
      } else {
        alert(res.error || 'Failed to update status');
      }
    } catch (err: any) {
      alert(err.message || 'Error toggling status');
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      
      {/* Warning Banner if Safety Constraint Triggered */}
      {warningMessage && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start justify-between gap-3 text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
            <span className="font-bold">{warningMessage}</span>
          </div>
          <button onClick={() => setWarningMessage(null)} className="text-amber-700 font-black hover:underline cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-6 rounded-3xl border border-slate-200 shadow-sm gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-200">
              <Layers className="h-6 w-6 text-[#047857]" />
            </div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">User Level Management</h1>
          </div>
          <p className="text-xs text-slate-500 font-semibold">
            Database-driven business account categories defining WHO the user is and available module access.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/settings/users"
            className="px-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Users className="h-4 w-4 text-purple-600" />
            <span>User Management</span>
          </Link>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 rounded-2xl bg-[#047857] hover:bg-[#065f46] text-white text-xs font-black shadow-lg shadow-[#047857]/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>+ New User Level</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">TOTAL USER LEVELS</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{levels.length}</p>
          </div>
          <div className="h-10 w-10 bg-emerald-50 rounded-xl flex items-center justify-center border border-emerald-100">
            <Layers className="h-5 w-5 text-[#047857]" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">ACTIVE USER LEVELS</p>
            <p className="text-2xl font-black text-emerald-700 mt-1">{activeLevels}</p>
          </div>
          <div className="h-10 w-10 bg-emerald-50 rounded-xl flex items-center justify-center border border-emerald-100">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">ASSIGNED SYSTEM USERS</p>
            <p className="text-2xl font-black text-purple-700 mt-1">{totalUsers}</p>
          </div>
          <div className="h-10 w-10 bg-purple-50 rounded-xl flex items-center justify-center border border-purple-100">
            <Users className="h-5 w-5 text-purple-600" />
          </div>
        </div>
      </div>

      {/* User Levels Table Container */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#047857]" />
            <span>Configured Business Account Levels</span>
          </h2>
          <span className="text-[11px] font-bold text-slate-500">{levels.length} User Levels Defined</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100/60 text-[10px] font-black uppercase text-slate-500 tracking-wider">
                <th className="py-3.5 px-5">Level Name & Code</th>
                <th className="py-3.5 px-5">Description</th>
                <th className="py-3.5 px-5 text-center">Assigned Users</th>
                <th className="py-3.5 px-5 text-center">Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {levels.map((lvl) => (
                <tr key={lvl.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-5">
                    <div className="space-y-0.5">
                      <p className="font-black text-slate-900">{lvl.name}</p>
                      <span className="inline-block font-mono text-[9.5px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200">
                        {lvl.code}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-5 max-w-md text-slate-600 font-medium leading-relaxed">
                    {lvl.description || 'No description provided.'}
                  </td>
                  <td className="py-4 px-5 text-center">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 font-bold border border-purple-200 text-xs">
                      <Users className="h-3.5 w-3.5" />
                      <span>{lvl.userCount} Users</span>
                    </span>
                  </td>
                  <td className="py-4 px-5 text-center">
                    <button
                      onClick={() => handleStatusToggle(lvl)}
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10.5px] font-black border cursor-pointer transition-all ${
                        lvl.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                          : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {lvl.status === 'Active' ? (
                        <>
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                          <span>Active</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="h-3.5 w-3.5 text-slate-400" />
                          <span>Inactive</span>
                        </>
                      )}
                    </button>
                  </td>
                  <td className="py-4 px-5 text-right">
                    <Link
                      href={`/settings/user-levels/${lvl.id}`}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-[#047857] text-white text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Sliders className="h-3.5 w-3.5" />
                      <span>Manage</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Creating New User Level */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-200">
                  <Layers className="h-5 w-5 text-[#047857]" />
                </div>
                <h3 className="text-base font-black text-slate-900">+ Create New User Level</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-black text-lg p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateLevel} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">User Level Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Veterinary Partner"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold focus:outline-none focus:border-[#047857]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Level Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. VET_PARTNER"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold uppercase focus:outline-none focus:border-[#047857]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Description</label>
                <textarea
                  rows={2}
                  placeholder="Business scope and operational description for this level..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium focus:outline-none focus:border-[#047857]"
                />
              </div>

              <div className="space-y-2 border-t border-slate-200 pt-3">
                <label className="font-black text-slate-900 uppercase text-[10px] tracking-wider block">Default Available Modules</label>
                <div className="grid grid-cols-2 gap-2">
                  {allAvailableModules.map((mod) => (
                    <label key={mod.key} className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedModules.includes(mod.key)}
                        onChange={() => handleToggleModule(mod.key)}
                        className="rounded border-slate-300 text-[#047857] focus:ring-[#047857]"
                      />
                      <span className="font-bold text-slate-800">{mod.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-[#047857] hover:bg-[#065f46] text-white font-black shadow-md cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Save User Level'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
