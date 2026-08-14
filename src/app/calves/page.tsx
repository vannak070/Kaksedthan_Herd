'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/common/PageHeader';
import StandardAnimalImage from '@/components/common/StandardAnimalImage';
import GlobalPagination from '@/components/common/GlobalPagination';
import GlobalExport from '@/components/common/GlobalExport';
import { CalfItem } from '@/types/breeding.types';
import { fetchCalvesAction } from '@/app/actions';
import { Baby, Plus, ChevronRight } from 'lucide-react';

export default function CalvesListPage() {
  const [calves, setCalves] = useState<CalfItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sexFilter, setSexFilter] = useState('All');

  // Global Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  useEffect(() => {
    fetchCalvesAction()
      .then((data) => {
        setCalves(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = calves.filter((c) => {
    const matchesSearch =
      (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
      c.id.toLowerCase().includes(search.toLowerCase()) ||
      c.sireId.toLowerCase().includes(search.toLowerCase()) ||
      c.damId.toLowerCase().includes(search.toLowerCase()) ||
      c.breed.toLowerCase().includes(search.toLowerCase());
    const matchesSex = sexFilter === 'All' || c.sex === sexFilter;
    return matchesSearch && matchesSex;
  });

  // Reset to page 1 on search/filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, sexFilter]);

  const totalCount = filtered.length;
  const paginatedItems = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const calfExportColumns = [
    { header: 'Calf ID', key: 'id' },
    { header: 'Calf Name', key: 'name' },
    { header: 'Breed', key: 'breed' },
    { header: 'Sex', key: 'sex' },
    { header: 'Birth Date', key: 'birthDate' },
    { header: 'Sire ID', key: 'sireId' },
    { header: 'Dam ID', key: 'damId' },
    { header: 'Owner', key: 'ownerName' },
    { header: 'Farm Location', key: 'farmLocation' },
    { header: 'Certification Status', key: 'certificationStatus' }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Calf Register & Herdbook Confirmation"
        subtitle="Manage newborn calves, birth weights, parentage linkage, and automatic herdbook certification."
        breadcrumbs={[{ label: 'Calf Register' }]}
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search Calf ID, name, breed, Sire ID, or Dam ID..."
        actionHref="/calves/new"
        actionLabel="Register Calf & Confirm"
      >
        <div className="flex items-center gap-2">
          <select
            value={sexFilter}
            onChange={(e) => setSexFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-600"
          >
            <option value="All">All Sexes</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>

          <GlobalExport
            filenamePrefix="calf-register"
            columns={calfExportColumns}
            currentPageData={paginatedItems}
            fetchAllFilteredData={async () => filtered}
          />
        </div>
      </PageHeader>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center my-6">
          <Baby className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Calves Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            No calf records match your search or filter parameters. Confirm a new calf birth to get started.
          </p>
          <Link
            href="/calves/new"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl mt-4 hover:bg-indigo-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Register First Calf</span>
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {paginatedItems.map((calf) => (
              <Link
                key={calf.id}
                href={`/calves/${calf.id}`}
                className="group bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-xl hover:border-indigo-600 transition-all duration-200 overflow-hidden flex flex-col justify-between cursor-pointer p-3.5"
              >
                <div>
                  <div className="relative mb-3">
                    <StandardAnimalImage src={calf.imageUrl} alt={calf.name || calf.id} />
                    <span className="absolute top-2.5 left-2.5 bg-slate-900/80 backdrop-blur-md text-white font-black text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      {calf.id}
                    </span>
                    <span className="absolute top-2.5 right-2.5 bg-indigo-600 text-white font-black text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                      {calf.sex}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                      {calf.name || calf.id}
                    </h3>
                    <p className="text-xs font-extrabold text-indigo-600">Breed: {calf.breed}</p>

                    <div className="mt-2.5 space-y-1 text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-medium">Sire ID:</span>
                        <span className="font-bold text-slate-800">{calf.sireId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-medium">Dam ID:</span>
                        <span className="font-bold text-slate-800">{calf.damId}</span>
                      </div>
                      <div className="flex justify-between items-center border-t border-slate-200/60 pt-1 mt-1">
                        <span className="font-extrabold text-indigo-600">Managed Breeder:</span>
                        <span className="font-bold text-indigo-900 truncate max-w-[110px] bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100/80 text-[10px]" title={`${(calf as any).breederName || (calf as any).resolvedBreederName || 'System Operation'} (${(calf as any).accountLevel || (calf as any).resolvedAccountLevel || 'Internal Staff'})`}>
                          {(calf as any).breederName || (calf as any).resolvedBreederName || 'System Operation'}
                        </span>
                      </div>
                      <div className="flex justify-between border-t border-slate-200/60 pt-1 mt-1">
                        <span className="font-extrabold text-slate-500">Certification:</span>
                        <span className={`font-black text-[10.5px] ${
                          calf.certificationStatus === 'APPROVED' ? 'text-emerald-700' :
                          calf.certificationStatus === 'PENDING_APPROVAL' ? 'text-amber-700 font-extrabold' :
                          calf.certificationStatus === 'REJECTED' ? 'text-rose-700 font-extrabold' : 'text-slate-400'
                        }`}>
                          ● {calf.certificationStatus === 'PENDING_APPROVAL' ? 'Pending Approval' : calf.certificationStatus === 'APPROVED' ? 'Approved' : calf.certificationStatus === 'REJECTED' ? 'Rejected' : 'Not Applied'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600">
                  <span>View Calf Profile</span>
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>

          <GlobalPagination
            currentPage={currentPage}
            pageSize={pageSize}
            totalCount={totalCount}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        </>
      )}
    </div>
  );
}
