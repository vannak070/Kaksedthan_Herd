import React from 'react';
import { herdbookRepository } from '@/repositories/herdbook.repository';
import { ShieldCheck, Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export const dynamic = 'force-dynamic';

export default async function AuditLogsSettingsPage() {
  const logs = await herdbookRepository.getAuditLogs();

  return (
    <div className="space-y-6">
      <Card className="bg-white border-slate-200">
        <CardHeader>
          <CardTitle className="text-base font-black text-slate-900 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-indigo-600" />
            <span>System Audit Trail & Security Logs</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Immutable log of configuration changes, user logins, status transitions, calf registrations, and certificate issuance events.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {logs.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 font-medium">
              No system audit logs recorded yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-100 px-4 py-2 text-[11px] font-black uppercase text-slate-500 grid grid-cols-5">
                <span>Timestamp</span>
                <span>Action</span>
                <span>Module</span>
                <span>User</span>
                <span>Resource ID</span>
              </div>
              {logs.map((log) => (
                <div key={log.id} className="px-4 py-3 text-xs grid grid-cols-5 items-center hover:bg-slate-50 transition-colors">
                  <span className="text-slate-500 text-[11px] font-medium flex items-center gap-1">
                    <Clock className="h-3 w-3 text-slate-400" />
                    {log.createdAt ? new Date(log.createdAt).toLocaleString('en-US') : 'N/A'}
                  </span>
                  <span className="font-bold text-slate-900">{log.action}</span>
                  <span className="font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md text-[11px] w-fit">
                    {log.module}
                  </span>
                  <span className="font-medium text-slate-700">{log.performedBy}</span>
                  <span className="font-mono text-slate-600 text-[11px]">{log.resourceId || 'N/A'}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
