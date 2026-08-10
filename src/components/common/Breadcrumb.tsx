'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center text-xs font-semibold text-slate-500 space-x-1.5 py-1" aria-label="Breadcrumb">
      <Link href="/" className="flex items-center gap-1 hover:text-[#dc5c15] transition-colors">
        <Home className="h-3.5 w-3.5" />
        <span>Home</span>
      </Link>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            <ChevronRight className="h-3 w-3 text-slate-400 flex-shrink-0" />
            {item.href && !isLast ? (
              <Link href={item.href} className="hover:text-[#dc5c15] transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className={`font-bold ${isLast ? 'text-slate-900' : 'text-slate-500'}`}>{item.label}</span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
