'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/common/PageHeader';
import StandardAnimalImage from '@/components/common/StandardAnimalImage';
import GlobalPagination from '@/components/common/GlobalPagination';
import GlobalExport from '@/components/common/GlobalExport';
import { StockInseminationItem, SireItem } from '@/types/breeding.types';
import { fetchStockInseminationAction, fetchSiresAction } from '@/app/actions';
import { useAccessControl } from '@/hooks/useAccessControl';
import { Syringe, Plus, ChevronRight, Lock } from 'lucide-react';

export default function StockInseminationListPage() {
  const { currentUser, isBreeder, isAdmin, isSuperAdmin } = useAccessControl();
  const [stock, setStock] = useState<StockInseminationItem[]>([]);
  const [sires, setSires] = useState<SireItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [breedFilter, setBreedFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Global Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

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
    // RBAC Data Scoping: Breeder User Level cannot see global master stock.
    // They can ONLY see stock transferred to them or assigned to their breeder ID / account name.
    if (isBreeder && !isAdmin && !isSuperAdmin) {
      const userBreederId = (currentUser?.breederId || currentUser?.id || '').toLowerCase();
      const userName = (currentUser?.name || '').toLowerCase();
      const userEmail = (currentUser?.email || '').toLowerCase();
      const transferRecipients = ((s as any).transferRecipients || '').toLowerCase();

      const isAllocatedToBreeder =
        (userBreederId && (s.breederId?.toLowerCase() === userBreederId || (s as any).transferredToBreederId?.toLowerCase() === userBreederId)) ||
        (userName && s.breederName?.toLowerCase() === userName) ||
        (userName && s.ownerName?.toLowerCase() === userName) ||
        (userEmail && (s as any).transferredToEmail?.toLowerCase() === userEmail) ||
        (userName && transferRecipients.includes(userName)) ||
        (userBreederId && transferRecipients.includes(userBreederId)) ||
        s.status === 'Transferred' ||
        (s as any).transferStatus === 'TRANSFERRED';

      if (!isAllocatedToBreeder) return false;
    }

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

  // Reset to page 1 on filter/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, breedFilter, statusFilter]);

  const totalCount = filtered.length;
  const paginatedItems = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const stockExportColumns = [
    { header: 'Stock Batch ID', key: 'id' },
    { header: 'Sire ID', key: 'sireId' },
    { header: 'Sire Name', key: 'sireName' },
    { header: 'Sire Breed', key: 'sireBreed' },
    { header: 'Stock Available (Doses)', key: 'stockAvailable' },
    { header: 'Price USD ($)', key: 'priceUsd' },
    { header: 'Price KHR (៛)', key: 'priceKhr' },
    { header: 'Owner', key: 'ownerName' },
    { header: 'Farm Location', key: 'farmLocation' },
    { header: 'Breeder Specialist', key: 'breederName' },
    { header: 'Availability', key: 'availability' }
  ];

  const availableBreeds = Array.from(
    new Set(
      sires.map(s => s.breed).concat(stock.map(s => s.sireBreed || '')).filter(Boolean)
    )
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stock Insemination & Semen Bank"
        subtitle="Manage frozen straw inventory, unit prices, owner distributions, and breeding services."
        breadcrumbs={[{ label: 'Stock Insemination' }]}
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search Batch ID, Sire ID, Sire Name, or Owner..."
        actionHref={!isBreeder || isAdmin || isSuperAdmin ? "/stock-insemination/new" : undefined}
        actionLabel={!isBreeder || isAdmin || isSuperAdmin ? "Add Semen Stock Batch" : undefined}
      >
        <div className="flex items-center gap-2">
          <select
            value={breedFilter}
            onChange={(e) => setBreedFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-600"
          >
            <option value="All">All Breeds</option>
            {availableBreeds.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-600"
          >
            <option value="All">All Statuses</option>
            <option value="Available">Available</option>
            <option value="Out of Stock">Out of Stock</option>
            <option value="Reserved">Reserved</option>
          </select>

          <GlobalExport
            filenamePrefix="semen-stock"
            columns={stockExportColumns}
            currentPageData={paginatedItems}
            fetchAllFilteredData={async () => filtered}
          />
        </div>
      </PageHeader>

      {isBreeder && !isAdmin && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-2xl text-xs flex items-center gap-3">
          <Syringe className="h-5 w-5 text-amber-600 shrink-0" />
          <div>
            <p className="font-bold">Breeder Stock & Allocation Filter Active</p>
            <p className="text-amber-700 mt-0.5">As a Registered Breeder, global master stock insemination is hidden. You can only view semen straw stock that has been explicitly transferred to your breeder account or allocated to your farm station by Internal System User Level managers.</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin h-8 w-8 border-4 border-sky-600 border-t-transparent rounded-full" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center my-6">
          <Syringe className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">
            {isBreeder && !isAdmin ? 'No Allocated Semen Stock Batches Found' : 'No Semen Batches Found'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {isBreeder && !isAdmin
              ? 'No stock insemination straws have been transferred to your breeder account or allocated to your farm station by Internal System User Level managers.'
              : 'No stock insemination records match your search or filter parameters. Add a new stock batch.'}
          </p>
          {(!isBreeder || isAdmin || isSuperAdmin) && (
            <Link
              href="/stock-insemination/new"
              className="inline-flex items-center gap-2 bg-sky-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl mt-4 hover:bg-sky-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add First Semen Batch</span>
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {paginatedItems.map((item) => {
              const sire = sires.find((s) => s.id === item.sireId);
              const sireName = sire?.name || item.sireName || 'Sire Record';
              const sireBreed = sire?.breed || item.sireBreed || 'Wagyu';
              const sireImg = sire?.imageUrl || item.sireImageUrl;

              return (
                <Link
                  key={item.id}
                  href={`/stock-insemination/${item.id}`}
                  className="group bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-xl hover:border-sky-600 transition-all duration-200 overflow-hidden flex flex-col justify-between cursor-pointer p-3.5"
                >
                  <div>
                    <div className="relative mb-3">
                      <StandardAnimalImage src={sireImg} alt={sireName} />
                      <span className="absolute top-2.5 left-2.5 bg-slate-900/80 backdrop-blur-md text-white font-black text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        {item.id}
                      </span>
                      <span className={`absolute top-2.5 right-2.5 text-white font-black text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs ${
                        isBreeder && !isAdmin && !isSuperAdmin
                          ? 'bg-amber-600'
                          : item.stockAvailable > 0 ? 'bg-emerald-600' : 'bg-rose-600'
                      }`}>
                        {isBreeder && !isAdmin && !isSuperAdmin
                          ? 'Allocated Stock'
                          : item.stockAvailable > 0 ? `${item.stockAvailable} Straws` : 'Out of Stock'}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-sm font-black text-slate-900 group-hover:text-sky-600 transition-colors truncate">
                        {sireName}
                      </h3>
                      <p className="text-xs font-extrabold text-sky-600">Breed: {sireBreed}</p>

                      <div className="mt-2.5 space-y-1 text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <div className="flex justify-between">
                          <span className="text-slate-400 font-medium">Straw Price:</span>
                          <span className="font-black text-emerald-700">${item.priceUsd} / ៛{item.priceKhr?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400 font-medium">Owner:</span>
                          <span className="font-bold text-slate-800 truncate max-w-[110px]">{item.ownerName || 'Kaksedthan'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-sky-600">
                    <span>View Batch Details</span>
                    <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
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
