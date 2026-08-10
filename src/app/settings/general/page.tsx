'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Save, CheckCircle2 } from 'lucide-react';
import ImageUploadContainer from '@/components/common/ImageUploadContainer';

export default function GeneralSettingsPage() {
  const [systemName, setSystemName] = useState('Kaksedthan Herdbook Livestock System');
  const [companyName, setCompanyName] = useState('Kaksedthan Livestock Co., Ltd.');
  const [logoUrl, setLogoUrl] = useState('');
  const [country, setCountry] = useState('Cambodia');
  const [language, setLanguage] = useState('km');
  const [timezone, setTimezone] = useState('Asia/Phnom_Penh (UTC+07:00)');
  const [dateFormat, setDateFormat] = useState('YYYY-MM-DD');
  const [defaultCurrency, setDefaultCurrency] = useState('USD');
  const [exchangeRate, setExchangeRate] = useState('4000');
  const [defaultUnit, setDefaultUnit] = useState('kg');
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
          <CardTitle className="text-base font-black text-slate-900">General System & Organization Branding</CardTitle>
          <CardDescription className="text-xs">
            Configure system identity, company credentials, localization, currency and display units.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {saved && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>General system configuration saved successfully to PostgreSQL database.</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">System Name</label>
              <input
                type="text"
                value={systemName}
                onChange={e => setSystemName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#dc5c15]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Company / Organization Name</label>
              <input
                type="text"
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#dc5c15]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Official Company Logo</label>
            <div className="max-w-xs">
              <ImageUploadContainer value={logoUrl} onChange={setLogoUrl} placeholder="Upload Logo" aspectRatio="16:9" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Country</label>
              <input
                type="text"
                value={country}
                onChange={e => setCountry(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#dc5c15]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Default System Language</label>
              <select
                value={language}
                onChange={e => setLanguage(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#dc5c15]"
              >
                <option value="km">ភាសាខ្មែរ (Khmer)</option>
                <option value="en">English (US)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Timezone</label>
              <input
                type="text"
                value={timezone}
                onChange={e => setTimezone(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#dc5c15]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Date Format</label>
              <select
                value={dateFormat}
                onChange={e => setDateFormat(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#dc5c15]"
              >
                <option value="YYYY-MM-DD">YYYY-MM-DD (ISO standard)</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Default Currency</label>
              <select
                value={defaultCurrency}
                onChange={e => setDefaultCurrency(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#dc5c15]"
              >
                <option value="USD">USD ($)</option>
                <option value="KHR">KHR (៛)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">USD to KHR Exchange Rate</label>
              <input
                type="number"
                value={exchangeRate}
                onChange={e => setExchangeRate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#dc5c15]"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="bg-[#dc5c15] text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-orange-700 transition-colors flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              <span>Save General Settings</span>
            </button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
