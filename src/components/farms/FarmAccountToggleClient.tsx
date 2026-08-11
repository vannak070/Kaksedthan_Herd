'use client';

import React, { useState } from 'react';
import { toggleFarmAccountStatusAction } from '@/app/actions';
import { ShieldCheck, XCircle, CheckCircle2, RefreshCw } from 'lucide-react';

interface Props {
  farmId: string;
  initialStatus: string;
}

export default function FarmAccountToggleClient({ farmId, initialStatus }: Props) {
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const handleToggle = async (newStatus: 'Active' | 'Inactive' | 'Suspended') => {
    setLoading(true);
    setMsg(null);
    try {
      const res = await toggleFarmAccountStatusAction(farmId, newStatus);
      if (res.success) {
        setStatus(newStatus);
        setMsg(`Account status changed to "${newStatus}".`);
      } else {
        setMsg(res.error || 'Failed to update account status.');
      }
    } catch {
      setMsg('An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-2 border-t border-indigo-100 space-y-2">
      {msg && (
        <p className="text-[11px] font-bold text-indigo-700 bg-indigo-50 p-2 rounded-xl border border-indigo-200">
          {msg}
        </p>
      )}

      <div className="flex items-center gap-2">
        {status === 'Active' ? (
          <button
            onClick={() => handleToggle('Inactive')}
            disabled={loading}
            className="px-3.5 py-2 bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 font-extrabold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
          >
            {loading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />}
            Deactivate Login Account
          </button>
        ) : (
          <button
            onClick={() => handleToggle('Active')}
            disabled={loading}
            className="px-3.5 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 font-extrabold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
          >
            {loading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
            Activate Login Account
          </button>
        )}
      </div>
    </div>
  );
}
