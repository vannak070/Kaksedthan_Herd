'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Save, CheckCircle2 } from 'lucide-react';

export default function HerdbookSettingsPage() {
  const [registryPrefix, setRegistryPrefix] = useState('KH-2026');
  const [pedigreeGenerations, setPedigreeGenerations] = useState('2');
  const [requireDNAVerification, setRequireDNAVerification] = useState(false);
  const [autoPublishApproved, setAutoPublishApproved] = useState(true);
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
          <CardTitle className="text-base font-black text-slate-900">Official Herdbook Registry Parameters</CardTitle>
          <CardDescription className="text-xs">
            Configure official national registration number prefixes, pedigree generation depth, and lineage approval requirements.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {saved && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Herdbook registry parameters saved successfully.</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Registration Number Prefix</label>
              <input
                type="text"
                value={registryPrefix}
                onChange={e => setRegistryPrefix(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#dc5c15]"
                required
              />
              <p className="text-[10px] text-slate-400 mt-1">Generated registration number example: KH-2026-8891</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Pedigree Lineage Generation Depth</label>
              <select
                value={pedigreeGenerations}
                onChange={e => setPedigreeGenerations(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#dc5c15]"
              >
                <option value="2">2 Generations (Parents + Grandparents)</option>
                <option value="3">3 Generations (Parents, Grandparents, Great-Grandparents)</option>
              </select>
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-900">Require DNA / Bloodline Verification</p>
                <p className="text-[11px] text-slate-500">Require DNA test upload before issuing official Herdbook Certificate.</p>
              </div>
              <input
                type="checkbox"
                checked={requireDNAVerification}
                onChange={e => setRequireDNAVerification(e.target.checked)}
                className="h-4 w-4 text-[#dc5c15] rounded focus:ring-[#dc5c15]"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <div>
                <p className="text-xs font-bold text-slate-900">Auto-Publish Approved Registrations</p>
                <p className="text-[11px] text-slate-500">Automatically make approved registrations public via QR code scanner.</p>
              </div>
              <input
                type="checkbox"
                checked={autoPublishApproved}
                onChange={e => setAutoPublishApproved(e.target.checked)}
                className="h-4 w-4 text-[#dc5c15] rounded focus:ring-[#dc5c15]"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="bg-[#dc5c15] text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-orange-700 transition-colors flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              <span>Save Herdbook Setup</span>
            </button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
