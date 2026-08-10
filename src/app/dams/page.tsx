'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/common/PageHeader';
import StandardAnimalImage from '@/components/common/StandardAnimalImage';
import { DamItem } from '@/types/breeding.types';
import { fetchDamsAction } from '@/app/actions';
import { Beef, Plus, ChevronRight } from 'lucide-react';

export default function DamsListPage() {
  const [dams, setDams] = useState<DamItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('All');

  useEffect(() => {
    fetchDamsAction()
      .then((data) => {
        setDams(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = dams.filter((d) => {
    const matchesSearch =
      (d.name || '').toLowerCase().includes(search.toLowerCase()) ||
      d.id.toLowerCase().includes(search.toLowerCase()) ||
      d.breed.toLowerCase().includes(search.toLowerCase()) ||
      (d.ownerName || '').toLowerCase().includes(search.toLowerCase());
    const matchesAvail = availabilityFilter === 'All' || d.availability === availabilityFilter;
    return matchesSearch && matchesAvail;
  });

  return (
    <div>
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
        <select
          value={availabilityFilter}
          onChange={(e) => setAvailabilityFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="All">All Availability</option>
          <option value="Available">Available (Open)</option>
          <option value="In Breeding">In Breeding</option>
          <option value="Pregnant">Pregnant</option>
        </select>
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
            No dam records match your search or availability criteria.
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
        /* Requirement 6 & 16: 5 Cards per Row Desktop Grid & Standardized 1:1 Image Component */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map((dam) => (
            <Link
              key={dam.id}
              href={`/dams/${dam.id}`}
              className="group bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-xl hover:border-purple-500 transition-all duration-200 overflow-hidden flex flex-col justify-between cursor-pointer p-3.5"
            >
              <div>
                <div className="relative mb-3">
                  <StandardAnimalImage src={dam.imageUrl} alt={dam.name || dam.id} />
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
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-purple-600">
                <span>View Dam Profile</span>
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
