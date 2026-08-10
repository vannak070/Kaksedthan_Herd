'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Layers, Plus, Check, AlertTriangle } from 'lucide-react';
import { createUserLevelAction } from '@/app/actions';

const ALL_MODULES = [
  { key: 'dashboard',        label: 'Dashboard',                 category: 'General' },
  { key: 'breeding',         label: 'Breeding Program',          category: 'Livestock' },
  { key: 'sires',            label: 'Sire Register',             category: 'Livestock' },
  { key: 'dams',             label: 'Dam Register',              category: 'Livestock' },
  { key: 'calves',           label: 'Calf Register',             category: 'Livestock' },
  { key: 'herdbook',         label: 'Herdbook Management',       category: 'Certification' },
  { key: 'certificates',     label: 'Certificate Center',        category: 'Certification' },
  { key: 'stock',            label: 'Stock Insemination',        category: 'Inventory' },
  { key: 'user_management',  label: 'User Management',           category: 'Administration' },
  { key: 'user_levels',      label: 'User Level Management',     category: 'Administration' },
  { key: 'role_management',  label: 'Role Management',           category: 'Administration' },
  { key: 'permission_mgmt',  label: 'Permission Management',     category: 'Administration' },
  { key: 'system_setup',     label: 'System Setup',              category: 'Administration' },
  { key: 'audit_logs',       label: 'Audit Logs',                category: 'Administration' },
  { key: 'farm_management',  label: 'Farm Management',           category: 'Administration' },
];

const MODULE_CATEGORIES = ['General', 'Livestock', 'Certification', 'Inventory', 'Administration'];

export default function AdminUserLevelCreateClient() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [purpose, setPurpose] = useState('');
  const [sortOrder, setSortOrder] = useState(10);
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
  const [selectedModules, setSelectedModules] = useState<string[]>(['dashboard']);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [codeManual, setCodeManual] = useState(false);

  // Auto-generate code from name
  const handleNameChange = (val: string) => {
    setName(val);
    if (!codeManual) {
      setCode(val.trim().toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_|_$/g, ''));
    }
  };

  const toggleModule = (key: string) => {
    setSelectedModules(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const toggleCategory = (category: string) => {
    const catKeys = ALL_MODULES.filter(m => m.category === category).map(m => m.key);
    const allSelected = catKeys.every(k => selectedModules.includes(k));
    if (allSelected) {
      setSelectedModules(prev => prev.filter(k => !catKeys.includes(k)));
    } else {
      setSelectedModules(prev => Array.from(new Set([...prev, ...catKeys])));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      setError('Name and Code are required.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await createUserLevelAction({
        name: name.trim(),
        code: code.trim().toUpperCase(),
        description: description.trim(),
        sortOrder: Number(sortOrder) || 10,
        defaultModules: selectedModules,
      });
      if (res.success && res.data) {
        router.push(`/admin/user-levels/${res.data.id}`);
      } else {
        setError(res.error || 'Failed to create User Level.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">

      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-[#047857] to-[#059669] px-6 py-5 text-white">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/user-levels"
              className="p-2.5 rounded-xl bg-white/15 hover:bg-white/25 transition-colors border border-white/20 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="h-10 w-10 bg-white/20 rounded-xl flex items-center justify-center border border-white/30">
              <Layers className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-white/70 text-[11px] font-bold uppercase tracking-wider">Administration → User Level Management</p>
              <h1 className="text-lg font-black text-white">Create New User Level</h1>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error banner */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-rose-900">
            <AlertTriangle className="h-4 w-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <span className="font-bold">{error}</span>
          </div>
        )}

        {/* ── Section 1: User Level Information ─── */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">User Level Information</h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Define the basic identity for this business account type.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
            {/* Name */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">
                User Level Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => handleNameChange(e.target.value)}
                placeholder="e.g. Veterinary Partner"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium text-slate-900 focus:outline-none focus:border-[#047857] focus:ring-2 focus:ring-[#047857]/10 placeholder:text-slate-400"
              />
              <p className="text-[10px] text-slate-400 font-medium">The name displayed to administrators.</p>
            </div>

            {/* Code */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">
                Unique Code <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={e => { setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '')); setCodeManual(true); }}
                placeholder="e.g. VETERINARY_PARTNER"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono font-bold text-slate-900 focus:outline-none focus:border-[#047857] focus:ring-2 focus:ring-[#047857]/10 placeholder:text-slate-400"
              />
              <p className="text-[10px] text-slate-400 font-medium">Auto-generated from name. Only uppercase letters, numbers, and underscores.</p>
            </div>

            {/* Description */}
            <div className="sm:col-span-2 space-y-1.5">
              <label className="font-bold text-slate-700 block">Description</label>
              <textarea
                rows={2}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="e.g. External veterinary professional supporting authorized breeding activities."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium text-slate-800 focus:outline-none focus:border-[#047857] focus:ring-2 focus:ring-[#047857]/10 placeholder:text-slate-400 resize-none"
              />
            </div>

            {/* Purpose */}
            <div className="sm:col-span-2 space-y-1.5">
              <label className="font-bold text-slate-700 block">Business Purpose</label>
              <textarea
                rows={2}
                value={purpose}
                onChange={e => setPurpose(e.target.value)}
                placeholder="e.g. Support veterinary health management and authorized breeding activity oversight."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium text-slate-800 focus:outline-none focus:border-[#047857] focus:ring-2 focus:ring-[#047857]/10 placeholder:text-slate-400 resize-none"
              />
              <p className="text-[10px] text-slate-400 font-medium">Explain the business purpose of this account type in plain language.</p>
            </div>

            {/* Sort Order */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">Sort Order</label>
              <input
                type="number"
                value={sortOrder}
                onChange={e => setSortOrder(Number(e.target.value))}
                min={1}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 focus:outline-none focus:border-[#047857] focus:ring-2 focus:ring-[#047857]/10"
              />
              <p className="text-[10px] text-slate-400 font-medium">Controls display order in lists (lower = first).</p>
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as 'Active' | 'Inactive')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 focus:outline-none focus:border-[#047857] focus:ring-2 focus:ring-[#047857]/10"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── Section 2: Default Module Access ─── */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-5">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">Default Module Access</h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Select which modules are available to this User Level. This can be changed after creation.
              </p>
            </div>
            <span className="text-[11px] font-bold bg-[#047857]/10 text-[#047857] px-3 py-1 rounded-xl border border-[#047857]/20">
              {selectedModules.length} selected
            </span>
          </div>

          <div className="space-y-4 text-xs">
            {MODULE_CATEGORIES.map(category => {
              const catModules = ALL_MODULES.filter(m => m.category === category);
              const allCatSelected = catModules.every(m => selectedModules.includes(m.key));
              const someCatSelected = catModules.some(m => selectedModules.includes(m.key));
              return (
                <div key={category}>
                  <div className="flex items-center gap-2 mb-2">
                    <button
                      type="button"
                      onClick={() => toggleCategory(category)}
                      className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors cursor-pointer ${
                        allCatSelected ? 'bg-[#047857] border-[#047857]' :
                        someCatSelected ? 'bg-[#047857]/30 border-[#047857]/50' :
                        'border-slate-300 bg-white'
                      }`}
                    >
                      {(allCatSelected || someCatSelected) && <Check className="h-2.5 w-2.5 text-white" />}
                    </button>
                    <span className="font-black text-slate-700 uppercase tracking-wider text-[10px]">{category}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pl-6">
                    {catModules.map(mod => {
                      const isSelected = selectedModules.includes(mod.key);
                      return (
                        <button
                          key={mod.key}
                          type="button"
                          onClick={() => toggleModule(mod.key)}
                          className={`flex items-center gap-2.5 p-3 rounded-xl border transition-all text-left cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center ${
                            isSelected ? 'bg-[#047857] border-[#047857]' : 'border-slate-300 bg-white'
                          }`}>
                            {isSelected && <Check className="h-2.5 w-2.5 text-white" />}
                          </div>
                          <span className="font-bold text-[11px] leading-tight">{mod.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t border-slate-100 pt-3">
            <p className="text-[10.5px] text-slate-500 font-medium">
              <strong className="font-black text-slate-700">Important:</strong> Module access only determines which modules are <em>visible</em>.
              What users can actually do within each module is controlled by their assigned <strong>Role</strong> and <strong>Permissions</strong>.
            </p>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-between bg-white rounded-2xl border border-slate-200 shadow-xs p-4">
          <Link
            href="/admin/user-levels"
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading || !name.trim() || !code.trim()}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#047857] hover:bg-[#065f46] text-white text-xs font-black shadow-lg shadow-[#047857]/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="h-4 w-4" />
            <span>{loading ? 'Creating...' : 'Create User Level'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
