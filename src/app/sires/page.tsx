'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/common/PageHeader';
import StandardAnimalImage from '@/components/common/StandardAnimalImage';
import GlobalPagination from '@/components/common/GlobalPagination';
import GlobalExport from '@/components/common/GlobalExport';
import { SireItem } from '@/types/breeding.types';
import { fetchSiresAction } from '@/app/actions';
import { Beef, Plus, ChevronRight } from 'lucide-react';

export default function SiresListPage() {
  const [sires, setSires] = useState<SireItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [breedFilter, setBreedFilter] = useState('All');

  // Global Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  useEffect(() => {
    fetchSiresAction()
      .then((data) => {
        setSires(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = sires.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.id.toLowerCase().includes(search.toLowerCase()) ||
      s.breed.toLowerCase().includes(search.toLowerCase()) ||
      (s.ownerName || '').toLowerCase().includes(search.toLowerCase());
    const matchesBreed = breedFilter === 'All' || s.breed === breedFilter;
    return matchesSearch && matchesBreed;
  });

  // Reset to page 1 on filter/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, breedFilter]);

  const totalCount = filtered.length;
  const paginatedItems = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const breeds = Array.from(new Set(sires.map((s) => s.breed))).filter(Boolean);

  const sireExportColumns = [
    { header: 'Sire ID', key: 'id' },
    { header: 'Sire Name', key: 'name' },
    { header: 'Breed', key: 'breed' },
    { header: 'DOB', key: 'dob' },
    { header: 'Bloodline', key: 'bloodline' },
    { header: 'Sourcing Company', key: 'sourcingCompany' },
    { header: 'Owner', key: 'ownerName' },
    { header: 'Status', key: 'status' },
    { header: 'Certification Status', key: 'certificationStatus' }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sire Register & Bull Bank"
        subtitle="Manage registered sires, bloodlines, physical profiles, and breeding availability."
        breadcrumbs={[{ label: 'Sire Register' }]}
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search Sire ID, name, breed, or owner..."
        actionHref="/sires/new"
        actionLabel="Register Sire"
      >
        <div className="flex items-center gap-2">
          <select
            value={breedFilter}
            onChange={(e) => setBreedFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#dc5c15]"
          >
            <option value="All">All Breeds</option>
            {breeds.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>

          <GlobalExport
            filenamePrefix="sire-register"
            columns={sireExportColumns}
            currentPageData={paginatedItems}
            fetchAllFilteredData={async () => filtered}
          />
        </div>
      </PageHeader>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin h-8 w-8 border-4 border-[#dc5c15] border-t-transparent rounded-full" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center my-6">
          <Beef className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Sires Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            No sire records match your search or filter parameters. Register a new sire to get started.
          </p>
          <Link
            href="/sires/new"
            className="inline-flex items-center gap-2 bg-[#dc5c15] text-white font-bold text-xs px-4 py-2.5 rounded-xl mt-4 hover:bg-[#c44f0e] transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Register First Sire</span>
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {paginatedItems.map((sire) => (
              <Link
                key={sire.id}
                href={`/sires/${sire.id}`}
                className="group bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-xl hover:border-[#dc5c15] transition-all duration-200 overflow-hidden flex flex-col justify-between cursor-pointer p-3.5"
              >
                <div>
                  <div className="relative mb-3">
                    <StandardAnimalImage src={sire.imageUrl} alt={sire.name} />
                    <span className="absolute top-2.5 left-2.5 bg-slate-900/80 backdrop-blur-md text-white font-black text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      {sire.id}
                    </span>
                    <span className="absolute top-2.5 right-2.5 bg-emerald-600 text-white font-black text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                      {sire.status}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-slate-900 group-hover:text-[#dc5c15] transition-colors truncate">
                      {sire.name}
                    </h3>
                    <p className="text-xs font-extrabold text-[#dc5c15]">Breed: {sire.breed}</p>

                    <div className="mt-2.5 space-y-1 text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-medium">Bloodline:</span>
                        <span className="font-bold text-slate-800 truncate max-w-[110px]">{sire.bloodline || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-medium">Owner:</span>
                        <span className="font-bold text-slate-800 truncate max-w-[110px]">{sire.ownerName || 'Kaksedthan'}</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-200/60 pt-1 mt-1">
                        <span className="font-extrabold text-slate-500">Certification:</span>
                        <span className={`font-black text-[10.5px] ${
                          sire.certificationStatus === 'APPROVED' ? 'text-emerald-700' :
                          sire.certificationStatus === 'PENDING_APPROVAL' ? 'text-amber-700 font-extrabold' :
                          sire.certificationStatus === 'REJECTED' ? 'text-rose-700 font-extrabold' : 'text-slate-400'
                        }`}>
                          ● {sire.certificationStatus === 'PENDING_APPROVAL' ? 'Pending Approval' : sire.certificationStatus === 'APPROVED' ? 'Approved' : sire.certificationStatus === 'REJECTED' ? 'Rejected' : 'Not Applied'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#dc5c15]">
                  <span>View Sire Profile</span>
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
