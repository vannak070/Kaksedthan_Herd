'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Save, CheckCircle2, Award } from 'lucide-react';

export default function CertificateSettingsPage() {
  const [certTitle, setCertTitle] = useState('OFFICIAL PEDIGREE & HERDBOOK CERTIFICATE');
  const [certLayout, setCertLayout] = useState('A4 Landscape');
  const [certPrefix, setCertPrefix] = useState('KC');
  const [showWatermark, setShowWatermark] = useState(true);
  const [authoritySignatureTitle, setAuthoritySignatureTitle] = useState('General Manager / Registrar');
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
          <CardTitle className="text-base font-black text-slate-900">Certificate Generation & Template Layout</CardTitle>
          <CardDescription className="text-xs">
            Configure A4 Landscape print templates, certificate numbering rules, watermark seals, and official signature titles.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {saved && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Certificate layout & print template settings saved successfully.</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Certificate Header Title</label>
              <input
                type="text"
                value={certTitle}
                onChange={e => setCertTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#dc5c15]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Certificate Output Layout</label>
              <select
                value={certLayout}
                onChange={e => setCertLayout(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#dc5c15]"
              >
                <option value="A4 Landscape">A4 Landscape (297mm x 210mm) - Standard</option>
                <option value="A4 Portrait">A4 Portrait (210mm x 297mm)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Certificate Number Prefix</label>
              <input
                type="text"
                value={certPrefix}
                onChange={e => setCertPrefix(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#dc5c15]"
                required
              />
              <p className="text-[10px] text-slate-400 mt-1">Generated certificate number example: KC-889102</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Signatory Title</label>
              <input
                type="text"
                value={authoritySignatureTitle}
                onChange={e => setAuthoritySignatureTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#dc5c15]"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-900">Include Official Kaksedthan Watermark Seal</p>
              <p className="text-[11px] text-slate-500">Render background security emblem on A4 PDF export.</p>
            </div>
            <input
              type="checkbox"
              checked={showWatermark}
              onChange={e => setShowWatermark(e.target.checked)}
              className="h-4 w-4 text-[#dc5c15] rounded focus:ring-[#dc5c15]"
            />
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="bg-[#dc5c15] text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-orange-700 transition-colors flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              <span>Save Certificate Setup</span>
            </button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
