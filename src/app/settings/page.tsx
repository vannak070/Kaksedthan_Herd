import React from 'react';
import Link from 'next/link';
import { SETTINGS_MENU_ITEMS } from '@/constants/settings-menu';
import { ArrowRight, ShieldCheck, Database, CheckCircle2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function SettingsOverviewPage() {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-orange-950 text-white rounded-2xl p-6 shadow-md border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-orange-500/20 text-[#dc5c15] border border-orange-500/30 flex items-center justify-center font-black">
            ⚙️
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight">Kaksedthan System Setup Hub</h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Centralized administration and business rule enforcement for PostgreSQL database <code className="text-orange-400 font-mono">kaksedthan_herdbook</code>.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-800/80 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>PostgreSQL Direct Persistence</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <Database className="h-4 w-4 text-orange-400 shrink-0" />
            <span>Single Source of Truth</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <ShieldCheck className="h-4 w-4 text-indigo-400 shrink-0" />
            <span>RBAC Security Enforced</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {SETTINGS_MENU_ITEMS.filter(i => i.href !== '/settings').map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-orange-400 hover:shadow-md transition-all group block"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-orange-50 text-[#dc5c15] group-hover:bg-[#dc5c15] group-hover:text-white transition-colors">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 group-hover:text-[#dc5c15] transition-colors">
                      {item.label}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-[#dc5c15] group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
