'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Save, CheckCircle2 } from 'lucide-react';

export default function BreedingSettingsPage() {
  const [gestationDays, setGestationDays] = useState('283');
  const [pregCheckDays, setPregCheckDays] = useState('60');
  const [defaultAiPriceUsd, setDefaultAiPriceUsd] = useState('50');
  const [defaultAiPriceKhr, setDefaultAiPriceKhr] = useState('200000');
  const [autoLockPregnantDam, setAutoLockPregnantDam] = useState(true);
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
          <CardTitle className="text-base font-black text-slate-900">Breeding Program & Timetable Rules</CardTitle>
          <CardDescription className="text-xs">
            Configure biological gestation schedules, dam availability lock rules, and default artificial insemination service pricing.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {saved && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Breeding business rules & pricing saved successfully.</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Standard Gestation Period (Days)</label>
              <input
                type="number"
                value={gestationDays}
                onChange={e => setGestationDays(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#dc5c15]"
                required
              />
              <p className="text-[10px] text-slate-400 mt-1">Average bovine pregnancy duration (default: 283 days).</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Pregnancy Check Reminder (Days Post-AI)</label>
              <input
                type="number"
                value={pregCheckDays}
                onChange={e => setPregCheckDays(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#dc5c15]"
                required
              />
              <p className="text-[10px] text-slate-400 mt-1">Recommended timeframe for vet palpation/ultrasound check.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Default AI Service Fee ($ USD)</label>
              <input
                type="number"
                value={defaultAiPriceUsd}
                onChange={e => setDefaultAiPriceUsd(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#dc5c15]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Default AI Service Fee (៛ KHR)</label>
              <input
                type="number"
                value={defaultAiPriceKhr}
                onChange={e => setDefaultAiPriceKhr(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#dc5c15]"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-900">Automatic Dam Availability Lock</p>
              <p className="text-[11px] text-slate-500">Automatically switch Dam availability to "In Breeding" or "Pregnant" to prevent double-assignment in new breeding programs.</p>
            </div>
            <input
              type="checkbox"
              checked={autoLockPregnantDam}
              onChange={e => setAutoLockPregnantDam(e.target.checked)}
              className="h-4 w-4 text-[#dc5c15] rounded focus:ring-[#dc5c15]"
            />
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="bg-[#dc5c15] text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-orange-700 transition-colors flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              <span>Save Breeding Setup</span>
            </button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
