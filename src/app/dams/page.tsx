'use client';

import React, { useState, useEffect, useMemo, memo } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/common/PageHeader';
import StandardAnimalImage from '@/components/common/StandardAnimalImage';
import GlobalPagination from '@/components/common/GlobalPagination';
import GlobalExport from '@/components/common/GlobalExport';
import { DamItem } from '@/types/breeding.types';
import { fetchDamsAction } from '@/app/actions';
import { useDebounce } from '@/hooks/useDebounce';
import { Beef, Plus, ChevronRight } from 'lucide-react';

// ── Memoized Dam Card Component (Prevents Unnecessary Grid Re-renders) ──────
const DamCard = memo(function DamCard({ dam }: { dam: DamItem }) {
  return (
    <Link
      href={`/dams/${dam.id}`}
      className="group bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-xl hover:border-purple-600 transition-all duration-200 overflow-hidden flex flex-col justify-between cursor-pointer p-3.5"
    >
      <div>
        <div className="relative mb-3">
          <StandardAnimalImage src={dam.imageUrl} alt={dam.name || dam.id} fallbackText="NO IMAGE" animalType="dam" />
          <span className="absolute top-2.5 left-2.5 bg-slate-900/80 backdrop-blur-md text-white font-black text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            {dam.id}
          </span>
          <span
            className={`absolute top-2.5 right-2.5 text-white font-black text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs ${
              dam.availability === 'Available'
                ? 'bg-emerald-600'
                : dam.availability === 'Pregnant'
                ? 'bg-purple-600'
                : 'bg-amber-500'
            }`}
          >
            {dam.availability}
          </span>
        </div>

        <div className="space-y-1">
          <h3 className="text-sm font-black text-slate-900 group-hover:text-purple-600 transition-colors truncate">
            {dam.name || dam.id}
          </h3>
          <p className="text-xs font-extrabold text-purple-700">Breed: {dam.breed}</p>

          <div className="mt-2.5 space-y-1 text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <div className="flex justify-between">
              <span className="text-slate-400 font-medium">Status:</span>
              <span className="font-bold text-slate-800">{dam.breedingStatus || 'Open'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-medium">Owner:</span>
              <span className="font-bold text-slate-800 truncate max-w-[110px]">{dam.ownerName || 'SNR Farm'}</span>
            </div>
            <div className="flex justify-between border-t border-slate-200/60 pt-1 mt-1">
              <span className="font-extrabold text-slate-500">Certification:</span>
              <span className={`font-black text-[10.5px] ${
                dam.certificationStatus === 'APPROVED' ? 'text-emerald-700' :
                dam.certificationStatus === 'PENDING_APPROVAL' ? 'text-amber-700 font-extrabold' :
                dam.certificationStatus === 'REJECTED' ? 'text-rose-700 font-extrabold' : 'text-slate-400'
              }`}>
                ● {dam.certificationStatus === 'PENDING_APPROVAL' ? 'Pending Approval' : dam.certificationStatus === 'APPROVED' ? 'Approved' : dam.certificationStatus === 'REJECTED' ? 'Rejected' : 'Not Applied'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-purple-600">
        <span>View Dam Profile</span>
        <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  );
});

export default function DamsListPage() {
  const [dams, setDams] = useState<DamItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search state + debounced value
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const [availabilityFilter, setAvailabilityFilter] = useState('All');

  // Global Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  useEffect(() => {
    fetchDamsAction()
      .then((data) => {
        setDams(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Reset to page 1 on filter/debounced search change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, availabilityFilter]);

  // Memoized Filtered Dataset (Only recalculates when debounced search, availability, or dams change)
  const filtered = useMemo(() => {
    const q = debouncedSearch.toLowerCase().trim();
    return dams.filter((d) => {
      const matchesSearch =
        !q ||
        (d.name || '').toLowerCase().includes(q) ||
        d.id.toLowerCase().includes(q) ||
        d.breed.toLowerCase().includes(q) ||
        (d.ownerName || '').toLowerCase().includes(q);
      const matchesAvail = availabilityFilter === 'All' || d.availability === availabilityFilter;
      return matchesSearch && matchesAvail;
    });
  }, [dams, debouncedSearch, availabilityFilter]);

  const totalCount = filtered.length;

  // Memoized Paginated Items
  const paginatedItems = useMemo(() => {
    return filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  }, [filtered, currentPage, pageSize]);

  const damExportColumns = [
    { header: 'Dam ID', key: 'id' },
    { header: 'Dam Name', key: 'name' },
    { header: 'Breed', key: 'breed' },
    { header: 'DOB', key: 'dob' },
    { header: 'Owner', key: 'ownerName' },
    { header: 'Farm Location', key: 'farmLocation' },
    { header: 'Availability', key: 'availability' },
    { header: 'Breeding Status', key: 'breedingStatus' },
    { header: 'Certification Status', key: 'certificationStatus' }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dam Register (Female Breeding Stock)"
        subtitle="Manage female breeding cows, availability status, and pregnancy checks."
        breadcrumbs={[{ label: 'Dam Register' }]}
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search Dam ID, name, breed, or owner..."
        actionHref="/dams/new"
        actionLabel="Register Dam"
      >
        <div className="flex items-center gap-2">
          <select
            value={availabilityFilter}
            onChange={(e) => setAvailabilityFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-600"
          >
            <option value="All">All Availability</option>
            <option value="Available">Available</option>
            <option value="In Breeding">In Breeding</option>
            <option value="Pregnant">Pregnant</option>
          </select>

          <GlobalExport
            filenamePrefix="dam-register"
            columns={damExportColumns}
            currentPageData={paginatedItems}
            fetchAllFilteredData={async () => filtered}
          />
        </div>
      </PageHeader>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin h-8 w-8 border-4 border-purple-600 border-t-transparent rounded-full" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center my-6">
          <Beef className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Dams Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            No dam records match your search or filter parameters. Register a new dam to get started.
          </p>
          <Link
            href="/dams/new"
            className="inline-flex items-center gap-2 bg-purple-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl mt-4 hover:bg-purple-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Register First Dam</span>
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {paginatedItems.map((dam) => (
              <DamCard key={dam.id} dam={dam} />
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
