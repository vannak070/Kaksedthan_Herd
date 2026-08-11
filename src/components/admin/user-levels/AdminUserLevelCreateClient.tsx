'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Layers, Plus, AlertTriangle, Info } from 'lucide-react';
import { createUserLevelAction } from '@/app/actions';

export default function AdminUserLevelCreateClient() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [purpose, setPurpose] = useState('');
  const [sortOrder, setSortOrder] = useState(10);
  
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
        status: 'Draft',
        purpose: purpose.trim(),
        defaultModules: [], // no longer configured on this screen
      } as any);
      
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

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-purple-700 to-purple-500 px-6 py-5 text-white">
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

      <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-indigo-900 shadow-sm">
        <Info className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="font-black block text-sm mb-0.5">Draft Status Default</strong>
          New User Levels are created in <strong className="font-bold">Draft</strong> status. You will be redirected to configure permissions on the next screen before activating.
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-rose-900">
            <AlertTriangle className="h-4 w-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <span className="font-bold">{error}</span>
          </div>
        )}

        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">User Level Information</h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Define the basic identity for this business account type.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">
                User Level Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => handleNameChange(e.target.value)}
                placeholder="e.g. Veterinarian Specialist"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium text-slate-900 focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/10 placeholder:text-slate-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">
                Unique Code <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={e => { setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '')); setCodeManual(true); }}
                placeholder="e.g. VET_SPECIALIST"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono font-bold text-slate-900 focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/10 placeholder:text-slate-400"
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="font-bold text-slate-700 block">Description</label>
              <textarea
                rows={2}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="e.g. Specialized role for certified veterinarians."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium text-slate-800 focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/10 placeholder:text-slate-400 resize-none"
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="font-bold text-slate-700 block">Business Purpose</label>
              <textarea
                rows={2}
                value={purpose}
                onChange={e => setPurpose(e.target.value)}
                placeholder="e.g. Medical oversight and certification approvals."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium text-slate-800 focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/10 placeholder:text-slate-400 resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">Sort Order</label>
              <input
                type="number"
                value={sortOrder}
                onChange={e => setSortOrder(Number(e.target.value))}
                min={1}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/10"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">Initial Status</label>
              <input
                type="text"
                disabled
                value="Draft"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-amber-700 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

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
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-black shadow-lg shadow-purple-600/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="h-4 w-4" />
            <span>{loading ? 'Creating...' : 'Create & Configure Permissions →'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
