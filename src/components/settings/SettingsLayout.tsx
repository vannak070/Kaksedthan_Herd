'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import PageHeader from '@/components/common/PageHeader';
import { SETTINGS_MENU_ITEMS } from '@/constants/settings-menu';

interface SettingsLayoutProps {
  children: React.ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  const pathname = usePathname();

  const activeItem = SETTINGS_MENU_ITEMS.find(item => item.href === pathname) || SETTINGS_MENU_ITEMS[0];

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Setup & Configuration"
        subtitle="Centralized administration, master parameters, business rules, and security control."
        breadcrumbs={[
          { label: 'System Setup', href: '/settings' },
          { label: activeItem.label }
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation Sidebar */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 p-4 shadow-sm h-fit space-y-1">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-3 py-2">
            Configuration Modules
          </p>

          <nav className="space-y-1">
            {SETTINGS_MENU_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/settings' && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-start gap-3 p-3 rounded-xl transition-all ${
                    isActive
                      ? 'bg-[#dc5c15] text-white font-bold shadow-sm'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${isActive ? 'text-white' : 'text-[#dc5c15]'}`} />
                  <div>
                    <p className="text-xs font-bold leading-tight">{item.label}</p>
                    <p className={`text-[10px] mt-0.5 leading-tight ${isActive ? 'text-orange-100' : 'text-slate-400 font-medium'}`}>
                      {item.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Main Settings Content */}
        <div className="lg:col-span-3">
          {children}
        </div>
      </div>
    </div>
  );
}
