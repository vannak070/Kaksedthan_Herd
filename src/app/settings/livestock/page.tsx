'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Save, CheckCircle2 } from 'lucide-react';

export default function LivestockSettingsPage() {
  const [enableAutoNumbering, setEnableAutoNumbering] = useState(true);
  const [requireOwnerAssignment, setRequireOwnerAssignment] = useState(true);
  const [allowPublicScanning, setAllowPublicScanning] = useState(true);
  const [defaultHealthStatus, setDefaultHealthStatus] = useState('Good');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <Card className="bg-white border-slate-200">
        <CardHeader>
          <CardTitle className="text-base font-black text-slate-900">Livestock Operational Parameters</CardTitle>
          <CardDescription className="text-xs">
            Configure registration defaults, classification constraints, and farm assignment rules for Sires, Dams, and Calves.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {saved && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Livestock operational configuration saved successfully.</span>
            </div>
          )}

          <div className="space-y-3 divide-y divide-slate-100">
            <div className="flex items-center justify-between pt-2">
              <div>
                <p className="text-xs font-bold text-slate-900">Automatic Animal ID Generation</p>
                <p className="text-[11px] text-slate-500">Auto-assign unique IDs (e.g. SIR-2026-001, DAM-2026-001) during registration.</p>
              </div>
              <input
                type="checkbox"
                checked={enableAutoNumbering}
                onChange={e => setEnableAutoNumbering(e.target.checked)}
                className="h-4 w-4 text-[#dc5c15] rounded focus:ring-[#dc5c15]"
              />
            </div>

            <div className="flex items-center justify-between pt-3">
              <div>
                <p className="text-xs font-bold text-slate-900">Mandatory Farm Owner Assignment</p>
                <p className="text-[11px] text-slate-500">Require an explicit owner name or farm account for every newly registered animal.</p>
              </div>
              <input
                type="checkbox"
                checked={requireOwnerAssignment}
                onChange={e => setRequireOwnerAssignment(e.target.checked)}
                className="h-4 w-4 text-[#dc5c15] rounded focus:ring-[#dc5c15]"
              />
            </div>

            <div className="flex items-center justify-between pt-3">
              <div>
                <p className="text-xs font-bold text-slate-900">Public QR Verification Enabled</p>
                <p className="text-[11px] text-slate-500">Allow public non-authenticated users to view animal lineage via QR scan.</p>
              </div>
              <input
                type="checkbox"
                checked={allowPublicScanning}
                onChange={e => setAllowPublicScanning(e.target.checked)}
                className="h-4 w-4 text-[#dc5c15] rounded focus:ring-[#dc5c15]"
              />
            </div>

            <div className="pt-3">
              <label className="block text-xs font-bold text-slate-700 mb-1">Default Initial Health Status</label>
              <select
                value={defaultHealthStatus}
                onChange={e => setDefaultHealthStatus(e.target.value)}
                className="w-full max-w-xs px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#dc5c15]"
              >
                <option value="Good">Good (Healthy)</option>
                <option value="Fair">Fair (Needs Observation)</option>
                <option value="Quarantine">Quarantine</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="bg-[#dc5c15] text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-orange-700 transition-colors flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              <span>Save Livestock Parameters</span>
            </button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
