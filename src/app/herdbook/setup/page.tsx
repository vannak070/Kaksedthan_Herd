'use client';

import React, { useState } from 'react';
import PageHeader from '@/components/common/PageHeader';
import { Settings, Save, ShieldCheck } from 'lucide-react';

export default function HerdbookSetupPage() {
  const [prefix, setPrefix] = useState('KH-2026-');
  const [layout, setLayout] = useState('A4 Landscape');
  const [autoApprove, setAutoApprove] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="Herdbook System Configuration"
        subtitle="Configure registration numbering formats, certificate layouts, approval rules, and public QR parameters."
        breadcrumbs={[
          { label: 'Herdbook System', href: '/herdbook' },
          { label: 'Herdbook Setup' },
        ]}
        backHref="/herdbook"
        backLabel="Back to Herdbook Management"
      />

      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
        {saved && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            <span>✓ Herdbook configuration parameters updated successfully!</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Registration Number Prefix</label>
            <input
              type="text"
              value={prefix}
              onChange={(e) => setPrefix(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
            />
            <p className="text-[11px] text-slate-400 mt-1">Example output: KH-2026-8891</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Certificate Export Layout</label>
            <select
              value={layout}
              onChange={(e) => setLayout(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
            >
              <option value="A4 Landscape">A4 Landscape PNG (Standard)</option>
              <option value="A4 Portrait">A4 Portrait</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={autoApprove}
                onChange={(e) => setAutoApprove(e.target.checked)}
                className="h-4 w-4 text-[#dc5c15] focus:ring-[#dc5c15] rounded border-slate-300"
              />
              <span className="text-xs font-bold text-slate-800">
                Auto-approve Herdbook Registration & Generate Certificate on Calf Confirmation
              </span>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end pt-4 border-t border-slate-100">
          <button
            type="submit"
            className="inline-flex items-center gap-2 bg-[#dc5c15] text-white text-xs font-bold px-6 py-2.5 rounded-xl hover:bg-[#c44f0e] shadow-md transition-all cursor-pointer"
          >
            <Save className="h-4 w-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
}
