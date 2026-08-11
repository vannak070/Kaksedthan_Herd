'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/common/PageHeader';
import StandardAnimalImage from '@/components/common/StandardAnimalImage';
import GlobalPagination from '@/components/common/GlobalPagination';
import GlobalExport from '@/components/common/GlobalExport';
import { BreedingProgramItem } from '@/types/breeding.types';
import { fetchBreedingProgramsAction, resolveCurrentBreederAction } from '@/app/actions';
import { Heart, Plus, ChevronRight, Calendar, User, Lock } from 'lucide-react';

export default function BreedingProgramsListPage() {
  const [programs, setPrograms] = useState<BreedingProgramItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Active role & Breeder scope
  const [activeRole, setActiveRole] = useState<string>('Super Admin');
  const [scopedBreeder, setScopedBreeder] = useState<{ id: string; name: string } | null>(null);

  // Global Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  useEffect(() => {
    const savedRole = localStorage.getItem('kaksedthan_active_role') || 'Super Admin';
    setActiveRole(savedRole);

    const isBreederRole = savedRole === 'Breeder' || savedRole === 'Breeder Account';

    const loadData = async () => {
      let breederIdScope: string | undefined;

      if (isBreederRole) {
        // Resolve Breeder identity from the backend to scope the listing
        const email = 'breeder@snrfarm.com'; // Demo: in production from auth session
        const res = await resolveCurrentBreederAction(email).catch(() => null);
        if (res?.success && res.data) {
          setScopedBreeder(res.data);
          breederIdScope = res.data.id;
        }
      }

      try {
        const data = await fetchBreedingProgramsAction(breederIdScope);
        setPrograms(Array.isArray(data) ? data : []);
      } catch {
        setPrograms([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filtered = programs.filter((bp) => {
    const matchesSearch =
      bp.programNumber.toLowerCase().includes(search.toLowerCase()) ||
      bp.sireId.toLowerCase().includes(search.toLowerCase()) ||
      bp.damId.toLowerCase().includes(search.toLowerCase()) ||
      (bp.breederName || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || bp.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Reset to page 1 on search/filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  const totalCount = filtered.length;
  const paginatedItems = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const bpExportColumns = [
    { header: 'Program ID', key: 'id' },
    { header: 'Program Number', key: 'programNumber' },
    { header: 'Breeding Method', key: 'breedingMethod' },
    { header: 'Sire ID', key: 'sireId' },
    { header: 'Sire Name', key: 'sireName' },
    { header: 'Dam ID', key: 'damId' },
    { header: 'Dam Name', key: 'damName' },
    { header: 'Breeder Specialist', key: 'breederName' },
    { header: 'Owner', key: 'ownerName' },
    { header: 'Farm Location', key: 'farmLocation' },
    { header: 'Breeding Date', key: 'breedingDate' },
    { header: 'Expected Calving', key: 'expectedCalvingDate' },
    { header: 'Status', key: 'status' }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Breeding Programs & Gestation Timetable"
        subtitle="Manage artificial insemination, gestation tracking, and expected calving schedules."
        breadcrumbs={[{ label: 'Breeding Program' }]}
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search Program #, Sire ID, Dam ID, or Breeder..."
        actionHref="/breeding-programs/new"
        actionLabel="New Breeding Program"
      >
        <div className="flex items-center gap-2 flex-wrap">
          {/* Breeder scope indicator: visible when listing is filtered to one Breeder */}
          {scopedBreeder && (
            <div className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-200 text-indigo-800 text-[10px] font-black px-2.5 py-1 rounded-xl">
              <Lock className="h-3 w-3" />
              <span>Scoped: {scopedBreeder.name}</span>
            </div>
          )}

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#dc5c15]"
          >
            <option value="All">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Breeding">Breeding</option>
            <option value="Pregnant">Pregnant</option>
            <option value="Expected Calving">Expected Calving</option>
            <option value="Calved">Calved</option>
          </select>

          <GlobalExport
            filenamePrefix="breeding-program"
            columns={bpExportColumns}
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
          <Heart className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Breeding Programs Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            No breeding program records match your search or status filter. Create a new breeding program.
          </p>
          <Link
            href="/breeding-programs/new"
            className="inline-flex items-center gap-2 bg-[#dc5c15] text-white font-bold text-xs px-4 py-2.5 rounded-xl mt-4 hover:bg-[#c44f0e] transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Start First Program</span>
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedItems.map((bp) => (
              <Link
                key={bp.id}
                href={`/breeding-programs/${bp.id}`}
                className="group bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-xl hover:border-[#dc5c15] transition-all duration-200 p-5 flex flex-col justify-between cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span className="text-[10px] font-black text-[#dc5c15] bg-orange-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                      {bp.programNumber}
                    </span>
                    <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800">
                      {bp.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 my-4">
                    <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100 flex items-center gap-2.5">
                      <div className="h-10 w-10 flex-shrink-0 rounded-xl overflow-hidden border border-slate-200">
                        <StandardAnimalImage src={bp.sireImageUrl} alt={bp.sireName || bp.sireId} />
                      </div>
                      <div className="overflow-hidden">
                        <span className="text-[9px] font-black text-slate-400 uppercase">SIRE</span>
                        <p className="text-xs font-black text-slate-900 truncate">{bp.sireName || bp.sireId}</p>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100 flex items-center gap-2.5">
                      <div className="h-10 w-10 flex-shrink-0 rounded-xl overflow-hidden border border-slate-200">
                        <StandardAnimalImage src={bp.damImageUrl} alt={bp.damName || bp.damId} />
                      </div>
                      <div className="overflow-hidden">
                        <span className="text-[9px] font-black text-slate-400 uppercase">DAM</span>
                        <p className="text-xs font-black text-slate-900 truncate">{bp.damName || bp.damId}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs text-slate-600 bg-slate-50/80 p-3 rounded-2xl border border-slate-100">
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">Breeder:</span>
                      <span className="font-bold text-slate-900">{bp.breederName || 'Sokha Breeder'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">Expected Calving:</span>
                      <span className="font-bold text-[#dc5c15]">{bp.expectedCalvingDate || 'TBD'}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#dc5c15]">
                  <span>View Program Details</span>
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
