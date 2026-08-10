'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Save, CheckCircle2, GitCommit } from 'lucide-react';

export default function WorkflowsSettingsPage() {
  const [allowManualDamStatusOverride, setAllowManualDamStatusOverride] = useState(false);
  const [enforceStrictProgramTransitions, setEnforceStrictProgramTransitions] = useState(true);
  const [autoCompleteProgramOnCalving, setAutoCompleteProgramOnCalving] = useState(true);
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
          <CardTitle className="text-base font-black text-slate-900">Status Workflows & Transition Business Rules</CardTitle>
          <CardDescription className="text-xs">
            Centralized validation rules governing valid state transitions across Sire, Dam, Breeding Program, Calf, and Herdbook lifecycles.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {saved && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Workflow state transition rules saved successfully.</span>
            </div>
          )}

          <div className="space-y-4 divide-y divide-slate-100">
            {/* 1. Dam Status Rule */}
            <div className="flex items-center justify-between pt-2">
              <div>
                <p className="text-xs font-bold text-slate-900">Strict Dam Availability Guard</p>
                <p className="text-[11px] text-slate-500">Prevent pregnant or in-breeding dams from being selected in new inseminations.</p>
              </div>
              <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                ENFORCED (Backend)
              </span>
            </div>

            {/* 2. Program Transitions */}
            <div className="flex items-center justify-between pt-3">
              <div>
                <p className="text-xs font-bold text-slate-900">Enforce Sequential Breeding Steps</p>
                <p className="text-[11px] text-slate-500">Require programs to progress in order: Draft → Insemination → Pregnancy Check → Pregnant → Calved.</p>
              </div>
              <input
                type="checkbox"
                checked={enforceStrictProgramTransitions}
                onChange={e => setEnforceStrictProgramTransitions(e.target.checked)}
                className="h-4 w-4 text-[#dc5c15] rounded focus:ring-[#dc5c15]"
              />
            </div>

            {/* 3. Automatic Completion */}
            <div className="flex items-center justify-between pt-3">
              <div>
                <p className="text-xs font-bold text-slate-900">Auto-Complete Program on Calf Registration</p>
                <p className="text-[11px] text-slate-500">Automatically mark Breeding Program as "Completed" when calf is confirmed to Herdbook.</p>
              </div>
              <input
                type="checkbox"
                checked={autoCompleteProgramOnCalving}
                onChange={e => setAutoCompleteProgramOnCalving(e.target.checked)}
                className="h-4 w-4 text-[#dc5c15] rounded focus:ring-[#dc5c15]"
              />
            </div>

            {/* 4. Manual Override */}
            <div className="flex items-center justify-between pt-3">
              <div>
                <p className="text-xs font-bold text-slate-900">Allow Admin Manual Status Override</p>
                <p className="text-[11px] text-slate-500">Permit Super Admins to manually unlock dam statuses in case of accidental entry.</p>
              </div>
              <input
                type="checkbox"
                checked={allowManualDamStatusOverride}
                onChange={e => setAllowManualDamStatusOverride(e.target.checked)}
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
              <span>Save Workflow Rules</span>
            </button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
