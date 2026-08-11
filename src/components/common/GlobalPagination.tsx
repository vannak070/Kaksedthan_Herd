'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface GlobalPaginationProps {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  className?: string;
}

export default function GlobalPagination({
  currentPage,
  pageSize,
  totalCount,
  onPageChange,
  onPageSizeChange,
  className = ''
}: GlobalPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const startRecord = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalCount);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }

      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  if (totalCount === 0) {
    return (
      <div className={`flex items-center justify-between bg-white border border-slate-200/80 rounded-2xl px-4 py-3 text-xs text-slate-500 font-bold shadow-2xs ${className}`}>
        <span>No records found</span>
      </div>
    );
  }

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs text-xs font-bold text-slate-700 ${className}`}>
      
      {/* Left: Record Range Summary */}
      <div className="flex items-center gap-3">
        <span className="text-slate-500">
          Showing <span className="font-black text-slate-900">{startRecord}</span>–<span className="font-black text-slate-900">{endRecord}</span> of <span className="font-black text-[#047857]">{totalCount}</span> records
        </span>

        {/* Page Size Selector */}
        <div className="flex items-center gap-1.5 border-l border-slate-200 pl-3">
          <span className="text-slate-400 font-medium">Rows:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              onPageSizeChange(Number(e.target.value));
              onPageChange(1); // Reset to page 1 on page size change
            }}
            className="bg-slate-50 border border-slate-200 font-black rounded-lg px-2 py-1 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#047857] cursor-pointer"
          >
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      {/* Right: Page Navigation Controls */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer font-extrabold text-slate-700"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Previous</span>
        </button>

        <div className="flex items-center gap-1">
          {getPageNumbers().map((num, idx) => (
            <React.Fragment key={idx}>
              {num === '...' ? (
                <span className="px-2 text-slate-400">...</span>
              ) : (
                <button
                  type="button"
                  onClick={() => onPageChange(Number(num))}
                  className={`h-8 w-8 rounded-xl font-black text-xs transition-all cursor-pointer ${
                    currentPage === num
                      ? 'bg-[#047857] text-white shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80'
                  }`}
                >
                  {num}
                </button>
              )}
            </React.Fragment>
          ))}
        </div>

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer font-extrabold text-slate-700"
        >
          <span>Next</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
