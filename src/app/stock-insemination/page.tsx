'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/common/PageHeader';
import StandardAnimalImage from '@/components/common/StandardAnimalImage';
import { StockInseminationItem, SireItem } from '@/types/breeding.types';
import { fetchStockInseminationAction, fetchSiresAction } from '@/app/actions';
import { Syringe, Plus } from 'lucide-react';

export default function StockInseminationListPage() {
  const [stock, setStock] = useState<StockInseminationItem[]>([]);
  const [sires, setSires] = useState<SireItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [breedFilter, setBreedFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    Promise.all([fetchStockInseminationAction(), fetchSiresAction()])
      .then(([stData, siresData]) => {
        setStock(stData);
        setSires(siresData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = stock.filter((s) => {
    const sire = sires.find((sr) => sr.id === s.sireId);
    const sireName = sire?.name || s.sireName || '';
    const sireBreed = sire?.breed || s.sireBreed || '';
    
    const matchesSearch =
      s.id.toLowerCase().includes(search.toLowerCase()) ||
      s.sireId.toLowerCase().includes(search.toLowerCase()) ||
      sireName.toLowerCase().includes(search.toLowerCase()) ||
      (s.ownerName || '').toLowerCase().includes(search.toLowerCase());
    
    const matchesBreed = breedFilter === 'All' || sireBreed === breedFilter;
    const matchesStatus = statusFilter === 'All' || (s.availability || 'Available') === statusFilter;

    return matchesSearch && matchesBreed && matchesStatus;
  });

  const availableBreeds = Array.from(
    new Set(
      sires.map(s => s.breed).concat(stock.map(s => s.sireBreed || '')).filter(Boolean)
    )
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stock Insemination & Semen Inventory"
        subtitle="Manage semen straw inventory, USD-only pricing, and station availability."
        breadcrumbs={[{ label: 'Stock Insemination' }]}
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search Stock Code, Sire ID, or Owner..."
        actionHref="/stock-insemination/new"
        actionLabel="+ Add New Semen Stock"
      >
        <div className="flex items-center gap-2">
          {/* Breed Filter */}
          <select
            value={breedFilter}
            onChange={(e) => setBreedFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs font-semibold rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-600"
          >
            <option value="All">All Breeds</option>
            {availableBreeds.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs font-semibold rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-600"
          >
            <option value="All">All Statuses</option>
            <option value="Available">Available</option>
            <option value="Reserved">Reserved</option>
            <option value="Sold">Sold</option>
            <option value="Out of Stock">Out of Stock</option>
          </select>
        </div>
      </PageHeader>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin h-8 w-8 border-4 border-purple-600 border-t-transparent rounded-full" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center my-6">
          <Syringe className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Insemination Stock Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            No semen straw stock items match your search filter. Add a new semen stock item.
          </p>
          <Link
            href="/stock-insemination/new"
            className="inline-flex items-center gap-2 bg-purple-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl mt-4 hover:bg-purple-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>+ Add New Semen Stock</span>
          </Link>
        </div>
      ) : (
        /* Requirement 6 & 16: 5 Cards per Row Desktop Grid & Standardized 1:1 Image Component */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map((item) => {
            const sire = sires.find((sr) => sr.id === item.sireId);
            const sireName = sire?.name || item.sireName || item.sireId;
            const sireBreed = sire?.breed || item.sireBreed || 'Brahman';
            const photoUrl = sire?.imageUrl || item.sireImageUrl;
            const availableDoses = item.stockAvailable || 0;

            return (
              <Link
                key={item.id}
                href={`/stock-insemination/${item.id}`}
                className="group bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-xl hover:border-purple-500 transition-all duration-200 overflow-hidden flex flex-col justify-between cursor-pointer p-3.5"
              >
                <div>
                  <div className="relative mb-3">
                    <StandardAnimalImage src={photoUrl} alt={sireName} />
                    <span className="absolute top-2.5 right-2.5 bg-emerald-600 text-white font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                      {item.availability || 'Available'}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-slate-900 group-hover:text-purple-600 transition-colors truncate">
                      {sireName} Semen Stock
                    </h3>
                    <p className="text-xs font-extrabold text-[#dc5c15]">Breed: {sireBreed}</p>

                    <div className="mt-2.5 space-y-1 text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-slate-600">
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-medium">Code:</span>
                        <span className="font-mono font-bold text-purple-700">{item.id}</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-200/60 pt-1 mt-1">
                        <span className="font-extrabold text-slate-500">Available:</span>
                        <span className="font-black text-purple-900">{availableDoses} doses</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-extrabold text-slate-500">Price:</span>
                        <span className="font-black text-emerald-700">${item.priceUsd}.00 / dose</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-purple-600">
                  <span>View Details</span>
                  <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
