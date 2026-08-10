'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/common/PageHeader';
import StandardAnimalImage from '@/components/common/StandardAnimalImage';
import { CalfItem } from '@/types/breeding.types';
import { fetchCalvesAction } from '@/app/actions';
import { Baby, Plus, ChevronRight } from 'lucide-react';

export default function CalvesListPage() {
  const [calves, setCalves] = useState<CalfItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sexFilter, setSexFilter] = useState('All');

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

  return (
    <div>
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
        <select
          value={sexFilter}
          onChange={(e) => setSexFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="All">All Sexes</option>
          <option value="Male">Male Bull Calf</option>
          <option value="Female">Female Heifer Calf</option>
        </select>
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
            No calf records match your active search filters. Register a newborn calf.
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
        /* Requirement 6 & 16: 5 Cards per Row Desktop Grid & Standardized 1:1 Image Component */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map((calf) => (
            <Link
              key={calf.id}
              href={`/calves/${calf.id}`}
              className="group bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-xl hover:border-indigo-500 transition-all duration-200 overflow-hidden flex flex-col justify-between cursor-pointer p-3.5"
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
      )}
    </div>
  );
}
