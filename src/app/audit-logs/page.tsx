import React from 'react';
import PageHeader from '@/components/common/PageHeader';
import { herdbookRepository } from '@/repositories/herdbook.repository';
import { ClipboardList, ShieldCheck } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AuditLogsPage() {
  const logs = await herdbookRepository.getAuditLogs();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Logs & System Activity History"
        subtitle="Security audit Trail logging actions, registration verifications, and status changes."
        breadcrumbs={[{ label: 'Administration' }, { label: 'Audit Logs' }]}
      />

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {logs.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <ClipboardList className="h-10 w-10 mx-auto mb-2 text-slate-300" />
            <p className="text-xs font-bold">No audit logs recorded yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-black tracking-wider">
                <tr>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Action</th>
                  <th className="p-4">Module</th>
                  <th className="p-4">Resource ID</th>
                  <th className="p-4">Performed By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {logs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-slate-50/80">
                    <td className="p-4 text-slate-500 font-mono text-[11px]">
                      {String(log.createdAt || new Date().toISOString()).substring(0, 19).replace('T', ' ')}
                    </td>
                    <td className="p-4 font-bold text-slate-900">{log.action}</td>
                    <td className="p-4">
                      <span className="bg-slate-100 text-slate-800 text-[10px] font-black px-2 py-0.5 rounded-md">
                        {log.module}
                      </span>
                    </td>
                    <td className="p-4 font-mono font-bold text-slate-800">{log.resourceId || 'N/A'}</td>
                    <td className="p-4 font-bold text-[#dc5c15]">{log.performedBy || 'System Admin'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
