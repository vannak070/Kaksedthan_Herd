'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { QrCode, Save, CheckCircle2, Globe, ShieldAlert } from 'lucide-react';

export default function QrPublicSettingsPage() {
  const [publicDomain, setPublicDomain] = useState('http://localhost:3000');
  const [lanIp, setLanIp] = useState('192.168.1.100');
  const [allowPublicBreedingView, setAllowPublicBreedingView] = useState(true);
  const [allowPublicCalfView, setAllowPublicCalfView] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPublicDomain(window.location.origin);
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <Card className="bg-white border-slate-200">
        <CardHeader>
          <CardTitle className="text-base font-black text-slate-900">QR Code & Public Verification Access</CardTitle>
          <CardDescription className="text-xs">
            Configure public verification URL resolution, LAN network IP auto-detection, and unauthenticated public route access for QR code scanning.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {saved && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>QR code & public verification domain settings updated.</span>
            </div>
          )}

          <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-xl text-xs space-y-1">
            <p className="font-extrabold flex items-center gap-1.5 text-amber-800">
              <ShieldAlert className="h-4 w-4 text-amber-600" />
              <span>Public Verification Security Notice</span>
            </p>
            <p className="text-[11px] opacity-90">
              Public QR routes (<code className="font-bold">/public/verify/[token]</code>, <code className="font-bold">/public/calf/[id]</code>) are unauthenticated by design so buyers & breeders can scan animal certificates on mobile devices without logging in.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Public Application Base Domain URL</label>
              <input
                type="text"
                value={publicDomain}
                onChange={e => setPublicDomain(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#dc5c15]"
                required
              />
              <p className="text-[10px] text-slate-400 mt-1">Production domain or LAN IP embedded in generated QR images.</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Local Network LAN IP</label>
              <input
                type="text"
                value={lanIp}
                onChange={e => setLanIp(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#dc5c15]"
              />
              <p className="text-[10px] text-slate-400 mt-1">Host machine local IP for testing QR code scanning on mobile devices.</p>
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-900">Allow Public Breeding Certificate Viewing</p>
                <p className="text-[11px] text-slate-500">Unauthenticated users can view verified breeding program details via QR scan.</p>
              </div>
              <input
                type="checkbox"
                checked={allowPublicBreedingView}
                onChange={e => setAllowPublicBreedingView(e.target.checked)}
                className="h-4 w-4 text-[#dc5c15] rounded focus:ring-[#dc5c15]"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <div>
                <p className="text-xs font-bold text-slate-900">Allow Public Calf Lineage Viewing</p>
                <p className="text-[11px] text-slate-500">Unauthenticated users can view calf pedigree tree lineage details via QR scan.</p>
              </div>
              <input
                type="checkbox"
                checked={allowPublicCalfView}
                onChange={e => setAllowPublicCalfView(e.target.checked)}
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
              <span>Save QR & Public Settings</span>
            </button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
