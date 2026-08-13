'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import PageHeader from '@/components/common/PageHeader';
import { Settings, BookOpen, Sliders, Hash, Heart, Award, LayoutGrid } from 'lucide-react';

interface SettingsLayoutProps {
  children: React.ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="System Configuration"
        subtitle="Centralized master lookups, organization parameters, numbering schemes, and domain rules."
        breadcrumbs={[
          { label: 'Administration & Setup', href: '/settings/general' },
          { label: 'System Configuration' }
        ]}
      />

      {/* ── UNIFIED SYSTEM CONFIGURATION SUB-TABS ── */}
      <div className="bg-white border border-slate-200 shadow-xs rounded-2xl p-2 flex flex-wrap gap-2 text-xs">
        <Link
          href="/settings/general"
          className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            pathname.startsWith('/settings/general')
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Sliders className="h-3.5 w-3.5" />
          <span>General & Organization</span>
        </Link>

        <Link
          href="/settings/master-data"
          className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            pathname.startsWith('/settings/master-data')
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="h-3.5 w-3.5 text-[#dc5c15]" />
          <span>Master Data Lookups</span>
        </Link>

        <Link
          href="/settings/numbering"
          className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            pathname.startsWith('/settings/numbering')
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Hash className="h-3.5 w-3.5" />
          <span>Auto Numbering Schemes</span>
        </Link>

        <Link
          href="/settings/breeding"
          className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            pathname.startsWith('/settings/breeding')
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Heart className="h-3.5 w-3.5 text-rose-500" />
          <span>Breeding & Gestation Rules</span>
        </Link>

        <Link
          href="/settings/certificate"
          className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            pathname.startsWith('/settings/certificate')
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Award className="h-3.5 w-3.5 text-indigo-500" />
          <span>Certificate & Dynamic QR</span>
        </Link>
      </div>

      {/* ── FULL-WIDTH WORKSPACE CONTENT AREA ── */}
      <div className="w-full">
        {children}
      </div>
    </div>
  );
}
