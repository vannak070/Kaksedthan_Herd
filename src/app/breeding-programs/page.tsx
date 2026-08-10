'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/common/PageHeader';
import StandardAnimalImage from '@/components/common/StandardAnimalImage';
import { BreedingProgramItem } from '@/types/breeding.types';
import { fetchBreedingProgramsAction } from '@/app/actions';
import { Heart, Plus, ChevronRight, Calendar, User } from 'lucide-react';

export default function BreedingProgramsListPage() {
  const [programs, setPrograms] = useState<BreedingProgramItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    fetchBreedingProgramsAction()
      .then((data) => {
        setPrograms(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
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

  return (
    <div>
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
            No breeding programs match your active filters. Launch a new breeding program wizard.
          </p>
          <Link
            href="/breeding-programs/new"
            className="inline-flex items-center gap-2 bg-[#dc5c15] text-white font-bold text-xs px-4 py-2.5 rounded-xl mt-4 hover:bg-[#c44f0e] transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Launch New Program</span>
          </Link>
        </div>
      ) : (
        /* Requirement 6 & 16: 5 Cards per Row Desktop Grid & Standardized 1:1 Image Component */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map((bp) => (
            <Link
              key={bp.id}
              href={`/breeding-programs/${bp.id}`}
              className="group bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-xl hover:border-[#dc5c15] transition-all duration-200 p-3.5 flex flex-col justify-between cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
                  <div>
                    <span className="text-[9px] font-black text-[#dc5c15] uppercase tracking-wider block">PROGRAM #</span>
                    <h3 className="text-sm font-black text-slate-900 group-hover:text-[#dc5c15] transition-colors">
                      {bp.programNumber}
                    </h3>
                  </div>
                  <span className="bg-orange-100 text-[#dc5c15] text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    {bp.status}
                  </span>
                </div>

                {/* 1:1 Sire & Dam Photos Grid */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="space-y-1">
                    <StandardAnimalImage src={bp.sireImageUrl} alt={bp.sireName || bp.sireId} />
                    <span className="text-[9px] font-black text-slate-500 block truncate">♂ {bp.sireId}</span>
                  </div>
                  <div className="space-y-1">
                    <StandardAnimalImage src={bp.damImageUrl} alt={bp.damName || bp.damId} />
                    <span className="text-[9px] font-black text-purple-700 block truncate">♀ {bp.damId}</span>
                  </div>
                </div>

                <div className="space-y-1 text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Breeding:</span>
                    <span className="font-bold text-slate-800">{bp.breedingDate ? String(bp.breedingDate).substring(0, 10) : 'TBD'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Calving:</span>
                    <span className="font-bold text-[#dc5c15]">{bp.expectedCalvingDate ? String(bp.expectedCalvingDate).substring(0, 10) : 'TBD'}</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#dc5c15]">
                <span>View Program</span>
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
