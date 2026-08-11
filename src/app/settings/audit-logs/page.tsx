'use client';

import React, { useState, useEffect, useMemo } from 'react';
import PageHeader from '@/components/common/PageHeader';
import GlobalPagination from '@/components/common/GlobalPagination';
import GlobalExport from '@/components/common/GlobalExport';
import { fetchAuditLogsAction } from '@/app/actions';
import { 
  ShieldCheck, Clock, Filter, AlertTriangle, 
  ClipboardList, RefreshCw, Loader2, Tag, User
} from 'lucide-react';

type AuditLog = {
  id: string | number;
  action: string;
  module: string;
  resourceId?: string;
  performedBy?: string;
  details?: any;
  createdAt?: string;
};

const MODULE_COLORS: Record<string, string> = {
  Certificates: 'bg-amber-100 text-amber-800',
  CERTIFICATE_CENTER: 'bg-amber-100 text-amber-800',
  Herdbook: 'bg-emerald-100 text-emerald-800',
  USER_LEVEL: 'bg-indigo-100 text-indigo-800',
  Sire: 'bg-orange-100 text-orange-800',
  Dam: 'bg-purple-100 text-purple-800',
  Calf: 'bg-blue-100 text-blue-800',
  Farm: 'bg-teal-100 text-teal-800',
  Breeder: 'bg-pink-100 text-pink-800',
  Customer: 'bg-cyan-100 text-cyan-800',
  System: 'bg-slate-200 text-slate-700',
};

const ACTION_COLORS: Record<string, string> = {
  APPROVE: 'text-emerald-700 font-black',
  APPROVE_CERTIFICATE: 'text-emerald-700 font-black',
  REJECT: 'text-rose-700 font-black',
  REJECT_CERTIFICATE: 'text-rose-700 font-black',
  REJECT_APPLICATION: 'text-rose-700 font-black',
  CREATE: 'text-sky-700 font-black',
  UPDATE: 'text-indigo-700 font-black',
  DELETE: 'text-red-600 font-black',
  CONFIRM_CALF_HERDBOOK: 'text-emerald-700 font-black',
  APPLY_CERTIFICATE: 'text-amber-700 font-black',
};

function getActionColor(action: string): string {
  for (const [key, cls] of Object.entries(ACTION_COLORS)) {
    if (action?.toUpperCase().includes(key)) return cls;
  }
  return 'text-slate-900 font-bold';
}

function getModuleColor(module: string): string {
  return MODULE_COLORS[module] || 'bg-slate-100 text-slate-700';
}

function formatTimestamp(ts?: string): string {
  if (!ts) return 'N/A';
  try {
    return new Date(ts).toLocaleString('en-US', {
      year: 'numeric', month: 'short', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false
    });
  } catch {
    return String(ts).substring(0, 19).replace('T', ' ');
  }
}

const AUDIT_EXPORT_COLUMNS = [
  { header: 'Log ID', key: 'id' },
  { header: 'Timestamp', key: 'createdAt' },
  { header: 'Action', key: 'action' },
  { header: 'Module', key: 'module' },
  { header: 'Resource ID', key: 'resourceId' },
  { header: 'Performed By', key: 'performedBy' },
  {
    header: 'Details',
    key: 'details',
    formatter: (val: any) => val ? JSON.stringify(val) : ''
  }
];

export default function AuditLogsSettingsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('All');
  const [actionFilter, setActionFilter] = useState('All');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const loadLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAuditLogsAction();
      if (res.success && res.data) {
        setLogs(res.data);
      } else {
        setError(res.error || 'Failed to load audit logs.');
        setLogs([]);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred loading audit logs.');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, moduleFilter, actionFilter]);

  const modules = useMemo(() => Array.from(new Set(logs.map(l => l.module).filter(Boolean))).sort(), [logs]);
  const actions = useMemo(() => Array.from(new Set(logs.map(l => l.action).filter(Boolean))).sort(), [logs]);

  const filtered = useMemo(() => {
    return logs.filter(log => {
      const q = search.toLowerCase();
      const matchesSearch = !search ||
        (log.action || '').toLowerCase().includes(q) ||
        (log.module || '').toLowerCase().includes(q) ||
        (log.resourceId || '').toLowerCase().includes(q) ||
        (log.performedBy || '').toLowerCase().includes(q);
      const matchesModule = moduleFilter === 'All' || log.module === moduleFilter;
      const matchesAction = actionFilter === 'All' || log.action === actionFilter;
      return matchesSearch && matchesModule && matchesAction;
    });
  }, [logs, search, moduleFilter, actionFilter]);

  const totalCount = filtered.length;
  const paginatedLogs = useMemo(() =>
    filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [filtered, currentPage, pageSize]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Logs & System Activity History"
        subtitle="Complete immutable trail of all system actions: logins, registrations, certification approvals, status changes, and admin operations."
        breadcrumbs={[{ label: 'Administration' }, { label: 'Audit Logs' }]}
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by action, module, resource ID, or user..."
      >
        <div className="flex items-center gap-2 flex-wrap">
          {/* Module Filter */}
          <select
            value={moduleFilter}
            onChange={e => setModuleFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs font-semibold rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 cursor-pointer"
          >
            <option value="All">All Modules</option>
            {modules.map(m => <option key={m} value={m}>{m}</option>)}
          </select>

          {/* Action Filter */}
          <select
            value={actionFilter}
            onChange={e => setActionFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs font-semibold rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 cursor-pointer"
          >
            <option value="All">All Actions</option>
            {actions.map(a => <option key={a} value={a}>{a}</option>)}
          </select>

          {/* Refresh */}
          <button
            type="button"
            onClick={loadLogs}
            disabled={loading}
            className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 transition-all cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          {/* Export */}
          <GlobalExport
            filenamePrefix="audit-logs"
            columns={AUDIT_EXPORT_COLUMNS}
            currentPageData={paginatedLogs}
            fetchAllFilteredData={async () => filtered}
          />
        </div>
      </PageHeader>

      {/* Error State */}
      {error && (
        <div className="flex items-start gap-3 bg-rose-50 border border-rose-200 rounded-2xl p-4 text-sm text-rose-800">
          <AlertTriangle className="h-5 w-5 text-rose-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-black">Failed to load audit logs</p>
            <p className="font-medium text-rose-700 mt-0.5 text-xs">{error}</p>
            <button
              onClick={loadLogs}
              className="mt-2 text-xs font-black text-rose-700 underline cursor-pointer hover:text-rose-900"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            <p className="text-xs font-bold text-slate-500">Loading audit trail...</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filtered.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <ClipboardList className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">
            {logs.length === 0 ? 'No Audit Logs Yet' : 'No Matching Logs'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {logs.length === 0
              ? 'System actions will be recorded here once operations begin.'
              : 'Adjust your search or filter criteria to find logs.'}
          </p>
        </div>
      )}

      {/* Audit Logs Table */}
      {!loading && !error && filtered.length > 0 && (
        <>
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            {/* Table Header */}
            <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 text-[10px] font-black uppercase tracking-wider text-slate-400">
              <span className="w-32">Timestamp</span>
              <span>Action / Details</span>
              <span className="w-32">Module</span>
              <span className="w-28">Resource ID</span>
              <span className="w-32">Performed By</span>
            </div>

            <div className="divide-y divide-slate-100/80">
              {paginatedLogs.map((log) => (
                <div
                  key={log.id}
                  className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-4 py-3 text-xs items-start hover:bg-slate-50/80 transition-colors"
                >
                  {/* Timestamp */}
                  <div className="w-32 flex-shrink-0">
                    <span className="flex items-center gap-1 text-slate-500 font-medium text-[11px] font-mono whitespace-nowrap">
                      <Clock className="h-3 w-3 text-slate-400 flex-shrink-0" />
                      {formatTimestamp(log.createdAt)}
                    </span>
                  </div>

                  {/* Action + Details */}
                  <div className="min-w-0">
                    <span className={`block text-[12px] ${getActionColor(log.action)}`}>
                      {log.action || 'Unknown Action'}
                    </span>
                    {log.details && typeof log.details === 'object' && (
                      <span className="block text-[10px] text-slate-400 font-medium mt-0.5 truncate max-w-xs">
                        {Object.entries(log.details)
                          .filter(([, v]) => v !== null && v !== undefined)
                          .map(([k, v]) => `${k}: ${v}`)
                          .join(' · ')}
                      </span>
                    )}
                  </div>

                  {/* Module */}
                  <div className="w-32 flex-shrink-0">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-md ${getModuleColor(log.module)}`}>
                      <Tag className="h-2.5 w-2.5" />
                      {log.module || 'System'}
                    </span>
                  </div>

                  {/* Resource ID */}
                  <div className="w-28 flex-shrink-0">
                    <span className="font-mono text-[11px] text-slate-600 font-bold">
                      {log.resourceId || '—'}
                    </span>
                  </div>

                  {/* Performed By */}
                  <div className="w-32 flex-shrink-0">
                    <span className="flex items-center gap-1 text-[11px] font-bold text-[#047857]">
                      <User className="h-3 w-3 text-slate-400" />
                      {log.performedBy || 'System'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <GlobalPagination
            currentPage={currentPage}
            pageSize={pageSize}
            totalCount={totalCount}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        </>
      )}
    </div>
  );
}
