'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, Plus, Filter } from 'lucide-react';
import Breadcrumb, { BreadcrumbItem } from './Breadcrumb';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  backHref?: string;
  backLabel?: string;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  searchPlaceholder?: string;
  actionHref?: string;
  actionLabel?: string;
  onActionClick?: () => void;
  children?: React.ReactNode;
}

export default function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  backHref,
  backLabel,
  searchQuery,
  onSearchChange,
  searchPlaceholder = 'Search records...',
  actionHref,
  actionLabel,
  onActionClick,
  children
}: PageHeaderProps) {
  return (
    <div className="bg-white border-b border-slate-200/80 px-4 sm:px-6 py-4 shadow-2xs mb-6 rounded-2xl">
      {/* Top Bar: Back Button & Breadcrumbs */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        {backHref ? (
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#dc5c15] bg-slate-100/80 hover:bg-orange-50 px-3 py-1.5 rounded-xl border border-slate-200/80 transition-all"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>{backLabel || 'Back'}</span>
          </Link>
        ) : (
          <div />
        )}
        {breadcrumbs && <Breadcrumb items={breadcrumbs} />}
      </div>

      {/* Main Bar: Title & Primary Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{title}</h1>
          {subtitle && <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-2.5 flex-shrink-0">
          {actionHref && actionLabel && (
            <Link
              href={actionHref}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#dc5c15] to-[#f37d4f] hover:from-[#c44f0e] hover:to-[#dc5c15] text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-md shadow-[#dc5c15]/20 border border-orange-400/30 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>{actionLabel}</span>
            </Link>
          )}
          {onActionClick && actionLabel && !actionHref && (
            <button
              onClick={onActionClick}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#dc5c15] to-[#f37d4f] hover:from-[#c44f0e] hover:to-[#dc5c15] text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-md shadow-[#dc5c15]/20 border border-orange-400/30 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>{actionLabel}</span>
            </button>
          )}
        </div>
      </div>

      {/* Search Bar & Custom Filters */}
      {(onSearchChange || children) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-100">
          {onSearchChange && (
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery || ''}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#dc5c15]/30 focus:border-[#dc5c15] transition-all"
              />
            </div>
          )}
          {children && <div className="flex items-center gap-2 flex-wrap">{children}</div>}
        </div>
      )}
    </div>
  );
}
