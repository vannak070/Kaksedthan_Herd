import { redirect } from 'next/navigation';

// Redirect old /audit-logs route to the canonical /settings/audit-logs
export default function AuditLogsRedirectPage() {
  redirect('/settings/audit-logs');
}
