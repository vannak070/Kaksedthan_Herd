'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Layers, Plus, Users, CheckCircle2, XCircle, AlertTriangle, ArrowRight,
  ToggleLeft, ToggleRight, Trash2, Search, RefreshCw, Building2,
  ShieldCheck, Activity
} from 'lucide-react';
import { setUserLevelStatusAction, deleteUserLevelAction } from '@/app/actions';

interface UserLevelItem {
  id: string;
  code: string;
  name: string;
  description: string;
  purpose?: string;
  status: 'Active' | 'Inactive';
  sortOrder: number;
  userCount: number;
  createdAt?: string;
  updatedAt?: string;
}

interface Props {
  initialLevels: UserLevelItem[];
}

const STATUS_BADGE = {
  Active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Inactive: 'bg-slate-100 text-slate-500 border-slate-200',
};

function ConfirmDialog({
  open, title, message, confirmLabel, confirmClass, onConfirm, onCancel
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  confirmClass: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-slate-200">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-2xl bg-amber-50 flex items-center justify-center flex-shrink-0 border border-amber-200">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <h3 className="font-black text-slate-900 text-sm">{title}</h3>
            <p className="text-xs text-slate-600 mt-1 font-medium leading-relaxed">{message}</p>
          </div>
        </div>
        <div className="flex gap-3 justify-end pt-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-xl text-xs font-bold text-white transition-all cursor-pointer ${confirmClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminUserLevelsClient({ initialLevels }: Props) {
  const router = useRouter();
  const [levels, setLevels] = useState<UserLevelItem[]>(initialLevels);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [loading, setLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'warning'; message: string } | null>(null);

  // Confirm dialog state
  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    type: 'toggle' | 'delete';
    level?: UserLevelItem;
  }>({ open: false, type: 'toggle' });

  const showToast = (type: 'success' | 'error' | 'warning', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  // KPI calculations
  const totalLevels = levels.length;
  const activeLevels = levels.filter(l => l.status === 'Active').length;
  const inactiveLevels = levels.filter(l => l.status === 'Inactive').length;
  const totalUsers = levels.reduce((sum, l) => sum + (l.userCount || 0), 0);

  // Filtered list
  const filteredLevels = useMemo(() => {
    return levels.filter(l => {
      const matchesSearch = !search ||
        l.name.toLowerCase().includes(search.toLowerCase()) ||
        l.code.toLowerCase().includes(search.toLowerCase()) ||
        (l.description || '').toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'All' || l.status === statusFilter;
      return matchesSearch && matchesStatus;
    }).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }, [levels, search, statusFilter]);

  const handleToggleStatus = async (level: UserLevelItem) => {
    setConfirmState({ open: false, type: 'toggle' });
    const newStatus = level.status === 'Active' ? 'Inactive' : 'Active';
    setLoading(level.id);
    try {
      const res = await setUserLevelStatusAction(level.id, newStatus);
      if (res.success) {
        setLevels(prev => prev.map(l => l.id === level.id ? { ...l, status: newStatus } : l));
        if (res.warning) {
          showToast('warning', res.warning);
        } else {
          showToast('success', `"${level.name}" has been ${newStatus === 'Active' ? 'activated' : 'deactivated'}.`);
        }
      } else {
        showToast('error', res.error || 'Failed to update status');
      }
    } catch {
      showToast('error', 'An error occurred while updating status.');
    } finally {
      setLoading(null);
    }
  };

  const handleDeleteLevel = async (level: UserLevelItem) => {
    setConfirmState({ open: false, type: 'delete' });
    setLoading(level.id);
    try {
      const res = await deleteUserLevelAction(level.id);
      if (res.success) {
        setLevels(prev => prev.filter(l => l.id !== level.id));
        showToast('success', `"${level.name}" has been deleted.`);
      } else {
        showToast('error', res.error || 'Cannot delete this User Level.');
      }
    } catch {
      showToast('error', 'An error occurred during deletion.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 max-w-sm p-4 rounded-2xl shadow-2xl border text-xs font-bold flex items-start gap-3 transition-all ${
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

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmState.open}
        title={confirmState.type === 'toggle'
          ? (confirmState.level?.status === 'Active' ? 'Deactivate User Level?' : 'Activate User Level?')
          : 'Delete User Level?'}
        message={confirmState.type === 'toggle'
          ? (confirmState.level?.status === 'Active'
              ? `Are you sure you want to deactivate "${confirmState.level?.name}"? Users currently assigned to it may lose access to some functions.`
              : `Are you sure you want to activate "${confirmState.level?.name}"?`)
          : `Are you sure you want to permanently delete "${confirmState.level?.name}"? This action cannot be undone. If users are assigned, deletion will be blocked.`}
        confirmLabel={confirmState.type === 'toggle'
          ? (confirmState.level?.status === 'Active' ? 'Yes, Deactivate' : 'Yes, Activate')
          : 'Delete User Level'}
        confirmClass={confirmState.type === 'delete' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-[#047857] hover:bg-[#065f46]'}
        onConfirm={() => {
          if (!confirmState.level) return;
          if (confirmState.type === 'toggle') handleToggleStatus(confirmState.level);
          else handleDeleteLevel(confirmState.level);
        }}
        onCancel={() => setConfirmState({ open: false, type: 'toggle' })}
      />

      {/* ── Page Header ─────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-[#047857] to-[#059669] p-6 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30">
                <Layers className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-white/70 text-[11px] font-bold uppercase tracking-wider">Administration</p>
                <h1 className="text-xl font-black text-white">User Level Management</h1>
                <p className="text-white/70 text-xs font-medium mt-0.5">
                  Business account types — defines WHO a user is in the system.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => router.refresh()}
                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all border border-white/20 cursor-pointer"
                title="Refresh"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
              <Link
                href="/admin/user-levels/new"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-[#047857] text-xs font-black shadow-lg hover:shadow-xl transition-all"
              >
                <Plus className="h-4 w-4" />
                <span>+ New User Level</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Concept notice */}
        <div className="px-6 py-3 bg-amber-50 border-b border-amber-100 flex items-start gap-2.5 text-xs text-amber-900">
          <ShieldCheck className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="font-medium leading-relaxed">
            <strong className="font-black">Three separate concepts:</strong>{' '}
            <strong>User Level</strong> = who the user is (business identity) •{' '}
            <strong>Role</strong> = their responsibility •{' '}
            <strong>Permission</strong> = specific actions they can perform.
            These are managed independently.
          </p>
        </div>
      </div>

      {/* ── KPI Summary Cards ────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total User Levels', value: totalLevels, icon: <Layers className="h-5 w-5 text-[#047857]" />, color: 'bg-emerald-50 border-emerald-100' },
          { label: 'Active Levels', value: activeLevels, icon: <CheckCircle2 className="h-5 w-5 text-emerald-600" />, color: 'bg-emerald-50 border-emerald-100' },
          { label: 'Inactive Levels', value: inactiveLevels, icon: <XCircle className="h-5 w-5 text-slate-400" />, color: 'bg-slate-50 border-slate-100' },
          { label: 'Total Users', value: totalUsers, icon: <Users className="h-5 w-5 text-purple-600" />, color: 'bg-purple-50 border-purple-100' },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex items-center gap-3">
            <div className={`h-11 w-11 rounded-xl ${kpi.color} border flex items-center justify-center flex-shrink-0`}>
              {kpi.icon}
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider leading-none">{kpi.label}</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{kpi.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filters & Search ─────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, code, or description..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#047857] focus:ring-2 focus:ring-[#047857]/10"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex-shrink-0">Status:</span>
          {(['All', 'Active', 'Inactive'] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                statusFilter === s
                  ? 'bg-[#047857] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* ── User Levels Table ────────────────────────── */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between">
          <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Building2 className="h-4 w-4 text-[#047857]" />
            Configured Business Account Levels
          </h2>
          <span className="text-[11px] font-bold text-slate-400">{filteredLevels.length} of {totalLevels} levels</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/40 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                <th className="py-3 px-5">User Level</th>
                <th className="py-3 px-5">Code</th>
                <th className="py-3 px-5 text-center">Users</th>
                <th className="py-3 px-5 text-center">Status</th>
                <th className="py-3 px-5">Last Updated</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredLevels.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-500 font-medium">
                    <div className="flex flex-col items-center gap-2">
                      <Layers className="h-8 w-8 text-slate-300" />
                      <p className="font-bold text-slate-600">No user levels found</p>
                      <p className="text-slate-400">Try adjusting your search or filter.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLevels.map((level) => (
                  <tr key={level.id} className="hover:bg-slate-50/60 transition-colors group">
                    <td className="py-4 px-5">
                      <div>
                        <p className="font-black text-slate-900 group-hover:text-[#047857] transition-colors">
                          {level.name}
                        </p>
                        <p className="text-[11px] text-slate-500 font-medium mt-0.5 line-clamp-1 max-w-xs">
                          {level.description}
                        </p>
                        {level.purpose && (
                          <p className="text-[10px] text-[#047857] font-bold mt-0.5 line-clamp-1 max-w-xs">
                            → {level.purpose}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <span className="font-mono text-[11px] font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200">
                        {level.code}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-center">
                      <span className="inline-flex items-center gap-1.5 font-bold text-purple-700">
                        <Users className="h-3.5 w-3.5" />
                        {level.userCount || 0}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10.5px] font-black border ${STATUS_BADGE[level.status]}`}>
                        {level.status}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-slate-500 font-medium">
                      {level.updatedAt
                        ? new Date(level.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                        : '—'}
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2 justify-end">
                        {/* Toggle Status */}
                        <button
                          disabled={loading === level.id}
                          onClick={() => setConfirmState({ open: true, type: 'toggle', level })}
                          className={`p-2 rounded-xl border transition-all cursor-pointer disabled:opacity-40 ${
                            level.status === 'Active'
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                              : 'bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200'
                          }`}
                          title={level.status === 'Active' ? 'Deactivate' : 'Activate'}
                        >
                          {level.status === 'Active'
                            ? <ToggleRight className="h-4 w-4" />
                            : <ToggleLeft className="h-4 w-4" />}
                        </button>

                        {/* Manage */}
                        <Link
                          href={`/admin/user-levels/${level.id}`}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#047857] text-white text-[11px] font-bold hover:bg-[#065f46] transition-all shadow-xs"
                        >
                          <span>Manage</span>
                          <ArrowRight className="h-3 w-3" />
                        </Link>

                        {/* Delete (only if no users) */}
                        {level.userCount === 0 && (
                          <button
                            disabled={loading === level.id}
                            onClick={() => setConfirmState({ open: true, type: 'delete', level })}
                            className="p-2 rounded-xl border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all cursor-pointer disabled:opacity-40"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer note */}
        <div className="px-6 py-3 bg-slate-50/60 border-t border-slate-100 flex items-center gap-2 text-[10.5px] text-slate-400 font-medium">
          <Activity className="h-3.5 w-3.5" />
          <span>Delete is only available for User Levels with no assigned users. Use Deactivate to safely disable active levels.</span>
        </div>
      </div>
    </div>
  );
}
