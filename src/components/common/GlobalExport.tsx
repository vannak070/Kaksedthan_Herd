'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Download, FileSpreadsheet, ChevronDown, Loader2 } from 'lucide-react';
import { exportToCSV, ExportColumn, getFormattedDateString } from '@/utils/exportUtils';

interface GlobalExportProps {
  filenamePrefix: string;
  columns: ExportColumn[];
  currentPageData: any[];
  fetchAllFilteredData?: () => Promise<any[]>;
  className?: string;
}

export default function GlobalExport({
  filenamePrefix,
  columns,
  currentPageData,
  fetchAllFilteredData,
  className = ''
}: GlobalExportProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExportPage = () => {
    const filename = `${filenamePrefix}-${getFormattedDateString()}`;
    exportToCSV(filename, columns, currentPageData);
    setOpen(false);
  };

  const handleExportAll = async () => {
    setLoading(true);
    try {
      const dataToExport = fetchAllFilteredData ? await fetchAllFilteredData() : currentPageData;
      const filename = `${filenamePrefix}-all-${getFormattedDateString()}`;
      exportToCSV(filename, columns, dataToExport);
    } catch (err) {
      console.error('Failed to export all records:', err);
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        disabled={loading}
        className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-extrabold px-3.5 py-2 rounded-xl transition-all shadow-2xs cursor-pointer border border-slate-200"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin text-[#047857]" /> : <Download className="h-4 w-4 text-[#047857]" />}
        <span>Export Data</span>
        <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200/90 rounded-2xl shadow-xl z-50 py-1.5 animate-in fade-in zoom-in duration-150 text-xs">
          <div className="px-3 py-1.5 border-b border-slate-100 font-extrabold text-[10px] uppercase text-slate-400">
            Export Dataset Format
          </div>

          <button
            type="button"
            onClick={handleExportPage}
            className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 font-bold text-slate-700 hover:text-slate-900 cursor-pointer"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            <div>
              <span>Export Current Page (CSV)</span>
              <span className="block text-[10px] text-slate-400 font-normal">Exports {currentPageData.length} visible items</span>
            </div>
          </button>

          <button
            type="button"
            onClick={handleExportAll}
            className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 font-bold text-slate-700 hover:text-slate-900 cursor-pointer"
          >
            <Download className="h-4 w-4 text-[#047857]" />
            <div>
              <span>Export All Filtered Records</span>
              <span className="block text-[10px] text-slate-400 font-normal">Full database query export</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
