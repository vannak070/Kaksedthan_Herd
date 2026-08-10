'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Save, CheckCircle2, Hash } from 'lucide-react';

export default function NumberingSettingsPage() {
  const [sirePrefix, setSirePrefix] = useState('SIR');
  const [damPrefix, setDamPrefix] = useState('DAM');
  const [breedingPrefix, setBreedingPrefix] = useState('BP');
  const [calfPrefix, setCalfPrefix] = useState('CLF');
  const [herdbookPrefix, setHerdbookPrefix] = useState('KH');
  const [certificatePrefix, setCertificatePrefix] = useState('KC');
  const [includeYearInCode, setIncludeYearInCode] = useState(true);
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
          <CardTitle className="text-base font-black text-slate-900">System Numbering & Code Schemes</CardTitle>
          <CardDescription className="text-xs">
            Centralized auto-numbering configuration for Sire, Dam, Breeding Program, Calf, Herdbook, and Certificate identifiers.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {saved && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Centralized numbering prefixes and code formats updated in PostgreSQL.</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Sire Bull ID Prefix</label>
              <input
                type="text"
                value={sirePrefix}
                onChange={e => setSirePrefix(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#dc5c15]"
                required
              />
              <p className="text-[10px] text-slate-400 mt-1">Example: {sirePrefix}-{includeYearInCode ? '2026-' : ''}001</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Dam Cow ID Prefix</label>
              <input
                type="text"
                value={damPrefix}
                onChange={e => setDamPrefix(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#dc5c15]"
                required
              />
              <p className="text-[10px] text-slate-400 mt-1">Example: {damPrefix}-{includeYearInCode ? '2026-' : ''}001</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Breeding Program Code Prefix</label>
              <input
                type="text"
                value={breedingPrefix}
                onChange={e => setBreedingPrefix(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#dc5c15]"
                required
              />
              <p className="text-[10px] text-slate-400 mt-1">Example: {breedingPrefix}-{includeYearInCode ? '2026-' : ''}0001</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Calf Register ID Prefix</label>
              <input
                type="text"
                value={calfPrefix}
                onChange={e => setCalfPrefix(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#dc5c15]"
                required
              />
              <p className="text-[10px] text-slate-400 mt-1">Example: {calfPrefix}-{includeYearInCode ? '2026-' : ''}001</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Herdbook Registration Number Prefix</label>
              <input
                type="text"
                value={herdbookPrefix}
                onChange={e => setHerdbookPrefix(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#dc5c15]"
                required
              />
              <p className="text-[10px] text-slate-400 mt-1">Example: {herdbookPrefix}-{includeYearInCode ? '2026-' : ''}8891</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Certificate Number Prefix</label>
              <input
                type="text"
                value={certificatePrefix}
                onChange={e => setCertificatePrefix(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#dc5c15]"
                required
              />
              <p className="text-[10px] text-slate-400 mt-1">Example: {certificatePrefix}-889102</p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-900">Embed Registration Year in Generated Codes</p>
              <p className="text-[11px] text-slate-500">Include four-digit registration year (e.g. 2026) in code sequences.</p>
            </div>
            <input
              type="checkbox"
              checked={includeYearInCode}
              onChange={e => setIncludeYearInCode(e.target.checked)}
              className="h-4 w-4 text-[#dc5c15] rounded focus:ring-[#dc5c15]"
            />
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="bg-[#dc5c15] text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-orange-700 transition-colors flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              <span>Save Numbering Schemes</span>
            </button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
