import React from 'react';
import Link from 'next/link';
import { SETTINGS_MENU_ITEMS, SettingsCategory } from '@/constants/settings-menu';
import { ArrowRight, ShieldCheck, Database, CheckCircle2, Shield, Settings, BookOpen, Heart } from 'lucide-react';

export const dynamic = 'force-dynamic';

const CATEGORY_SECTION_CONFIG: Record<SettingsCategory, { title: string; icon: any; iconColor: string; borderColor: string; hoverBorder: string; hoverText: string; iconBg: string }> = {
  USERS_ACCESS_CONTROL: {
    title: '1. Users & Access Control Setup',
    icon: Shield,
    iconColor: 'text-purple-600',
    borderColor: 'border-purple-200',
    hoverBorder: 'hover:border-purple-600',
    hoverText: 'group-hover:text-purple-600',
    iconBg: 'bg-purple-50 group-hover:bg-purple-600'
  },
  SYSTEM_SETUP: {
    title: '2. System & Organization Setup',
    icon: Settings,
    iconColor: 'text-slate-700',
    borderColor: 'border-slate-200',
    hoverBorder: 'hover:border-slate-800',
    hoverText: 'group-hover:text-slate-900',
    iconBg: 'bg-slate-100 group-hover:bg-slate-900'
  },
  MASTER_DATA: {
    title: '3. Master Data Setup',
    icon: BookOpen,
    iconColor: 'text-[#dc5c15]',
    borderColor: 'border-amber-200',
    hoverBorder: 'hover:border-[#dc5c15]',
    hoverText: 'group-hover:text-[#dc5c15]',
    iconBg: 'bg-orange-50 group-hover:bg-[#dc5c15]'
  },
  OPERATIONAL_RULES: {
    title: '4. Operational & Certification Setup',
    icon: Heart,
    iconColor: 'text-indigo-600',
    borderColor: 'border-indigo-200',
    hoverBorder: 'hover:border-indigo-600',
    hoverText: 'group-hover:text-indigo-600',
    iconBg: 'bg-indigo-50 group-hover:bg-indigo-600'
  }
};

export default async function SettingsOverviewPage() {
  const categories: SettingsCategory[] = ['USERS_ACCESS_CONTROL', 'SYSTEM_SETUP', 'MASTER_DATA', 'OPERATIONAL_RULES'];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-orange-950 text-white rounded-3xl p-6 shadow-md border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-orange-500/20 text-[#dc5c15] border border-orange-500/30 flex items-center justify-center font-black text-xl">
            ⚙️
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight">Kaksedthan System Setup Hub</h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Dedicated setup categories for security RBAC, system parameters, master lookups, and biological rules.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-800/80 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>PostgreSQL Single Source of Truth</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <Database className="h-4 w-4 text-orange-400 shrink-0" />
            <span>Independent Modular Setup</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <ShieldCheck className="h-4 w-4 text-indigo-400 shrink-0" />
            <span>RBAC & Scope Security Enforced</span>
          </div>
        </div>
      </div>

      {/* 4 DEDICATED SETUP SECTIONS */}
      {categories.map((catKey) => {
        const config = CATEGORY_SECTION_CONFIG[catKey];
        const SectionIcon = config.icon;
        const items = SETTINGS_MENU_ITEMS.filter(i => i.category === catKey);

        return (
          <div key={catKey} className="space-y-3">
            <div className={`flex items-center gap-2 pb-2 border-b ${config.borderColor}`}>
              <SectionIcon className={`h-5 w-5 ${config.iconColor}`} />
              <h3 className="text-base font-black text-slate-900">{config.title}</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {items.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`bg-white border border-slate-200 rounded-3xl p-5 ${config.hoverBorder} hover:shadow-md transition-all group flex flex-col justify-between`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className={`p-2.5 rounded-2xl ${config.iconBg} ${config.iconColor} group-hover:text-white transition-colors`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <ArrowRight className={`h-4 w-4 text-slate-400 ${config.hoverText} group-hover:translate-x-1 transition-all`} />
                      </div>
                      <h4 className={`text-sm font-black text-slate-900 ${config.hoverText} transition-colors`}>
                        {item.label}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.description}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
