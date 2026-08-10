'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/common/PageHeader';
import StandardAnimalImage from '@/components/common/StandardAnimalImage';
import { HerdbookRegistrationItem } from '@/types/breeding.types';
import { fetchHerdbookRegistrationsAction } from '@/app/actions';
import { Award, ShieldCheck, Beef, Heart, Baby } from 'lucide-react';

export default function HerdbookListPage() {
  const [regs, setRegs] = useState<HerdbookRegistrationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Requirement 9: Four Tab Views (All Registrations | Sires | Dams | Calves)
  const [activeTab, setActiveTab] = useState<'all' | 'sires' | 'dams' | 'calves'>('all');

  useEffect(() => {
    fetchHerdbookRegistrationsAction()
      .then((data) => {
        setRegs(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const sireRegs = regs.filter((r) => r.animalType === 'Sire');
  const damRegs = regs.filter((r) => r.animalType === 'Dam');
  const calfRegs = regs.filter((r) => r.animalType === 'Calf' || !r.animalType);

  const displayedRegs = regs.filter((r) => {
    const matchesTab =
      activeTab === 'all' ||
      (activeTab === 'sires' && r.animalType === 'Sire') ||
      (activeTab === 'dams' && r.animalType === 'Dam') ||
      (activeTab === 'calves' && (r.animalType === 'Calf' || !r.animalType));

    const matchesSearch =
      r.registrationNumber.toLowerCase().includes(search.toLowerCase()) ||
      r.animalId.toLowerCase().includes(search.toLowerCase()) ||
      (r.animalName || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.ownerName || '').toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;

    return matchesTab && matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Official Cattle Registry & Pedigree Book"
        subtitle="Official certified bovine records, pedigree parentage trees, and instant mobile QR verification."
        breadcrumbs={[{ label: 'Herdbook System' }]}
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search Reg #, Animal ID, Name, or Owner..."
      >
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#dc5c15]"
        >
          <option value="All">All Statuses</option>
          <option value="Published">Published (Approved)</option>
          <option value="Verified">Verified</option>
          <option value="Under Review">Under Review</option>
        </select>
      </PageHeader>

      {/* Friendly 3-Step Process Guide for Farm Owners */}
      <div className="bg-[#dc5c15]/5 border border-[#dc5c15]/20 rounded-2xl p-4">
        <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-2">
          💡 How Cattle Registration & QR Verification Works (3 Simple Steps)
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
            <span className="font-black text-[#dc5c15]">Step 1: Register Animal</span>
            <p className="text-[11px] text-slate-500 mt-0.5">Sires, Dams & Calves automatically sync into Herdbook.</p>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
            <span className="font-black text-purple-700">Step 2: Assign Registration Code</span>
            <p className="text-[11px] text-slate-500 mt-0.5">Assign unique KH-2026 registration number & token.</p>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
            <span className="font-black text-emerald-700">Step 3: Mobile QR Verification</span>
            <p className="text-[11px] text-slate-500 mt-0.5">Public users scan QR code to verify master pedigree.</p>
          </div>
        </div>
      </div>

      {/* HERDBOOK MANAGEMENT TAB BAR ([ Sires ] [ Dams ] [ Calves ] [ All Registrations ]) */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Award className="h-4 w-4" />
          <span>All Registrations ({regs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('sires')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'sires'
              ? 'bg-[#dc5c15] text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Beef className="h-4 w-4" />
          <span>Sires ({sireRegs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('dams')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'dams'
              ? 'bg-purple-700 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Heart className="h-4 w-4" />
          <span>Dams ({damRegs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('calves')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'calves'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Baby className="h-4 w-4" />
          <span>Calves ({calfRegs.length})</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin h-8 w-8 border-4 border-[#dc5c15] border-t-transparent rounded-full" />
        </div>
      ) : displayedRegs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center my-6">
          <Award className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Herdbook Records Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            No animal records match your search filter in this category.
          </p>
        </div>
      ) : activeTab === 'sires' || activeTab === 'dams' ? (
        /* Requirement 6 & 16: 5 Cards per Row Desktop Grid & Standardized 1:1 Image Component */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {displayedRegs.map((r) => (
            <Link
              key={r.id}
              href={r.animalType === 'Sire' ? `/sires/${r.animalId}` : `/dams/${r.animalId}`}
              className="group bg-white rounded-3xl border border-slate-200 shadow-2xs hover:shadow-xl hover:border-[#dc5c15] transition-all overflow-hidden flex flex-col justify-between cursor-pointer p-3.5"
            >
              <div>
                <div className="relative mb-3">
                  <StandardAnimalImage src={r.imageUrl} alt={r.animalName || r.animalId} />
                  <div className="absolute top-2.5 right-2.5">
                    <span className="bg-emerald-600 text-white text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase shadow-xs flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3" />
                      <span>{r.status}</span>
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">
                    HERDBOOK {r.animalType?.toUpperCase()} RECORD
                  </span>
                  <h3 className="text-sm font-black text-slate-900 group-hover:text-[#dc5c15] transition-colors truncate">
                    {r.animalName || r.animalId}
                  </h3>
                  <p className="text-xs font-extrabold text-[#dc5c15]">Breed: {r.breed || 'Brahman'}</p>
                </div>

                <div className="space-y-1 text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-100 mt-2.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">{r.animalType} ID:</span>
                    <span className="font-mono font-bold text-slate-900">{r.animalId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Herdbook Reg:</span>
                    <span className="font-mono font-bold text-purple-700 truncate max-w-[100px]">{r.registrationNumber}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2.5 mt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#dc5c15]">
                <span>View Profile</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        /* Full Registrations Table for All & Calves */
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-black tracking-wider">
                <tr>
                  <th className="p-4">Reg Number</th>
                  <th className="p-4">Animal Type & Name</th>
                  <th className="p-4">Breed</th>
                  <th className="p-4">Sire / Dam</th>
                  <th className="p-4">Owner & Location</th>
                  <th className="p-4">Reg Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Certificate & QR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {displayedRegs.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-black text-slate-900">
                      <Link href={`/herdbook/${r.id}`} className="flex items-center gap-2 hover:text-[#dc5c15] transition-colors">
                        <Award className="h-4 w-4 text-[#dc5c15]" />
                        <span>{r.registrationNumber}</span>
                      </Link>
                    </td>
                    <td className="p-4">
                      <Link href={r.animalType === 'Sire' ? `/sires/${r.animalId}` : r.animalType === 'Dam' ? `/dams/${r.animalId}` : `/calves/${r.calfId || r.animalId}`} className="font-bold text-slate-900 hover:text-[#dc5c15]">
                        <span className="text-[10px] uppercase text-purple-700 font-black tracking-wider block">{r.animalType || 'Calf'}</span>
                        <span>{r.animalName || r.animalId} ({r.animalId})</span>
                      </Link>
                    </td>
                    <td className="p-4 font-bold text-slate-800">
                      {r.breed || 'Brahman'}
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-slate-800">Sire: {r.sireName || r.sireId || 'N/A'}</p>
                      <p className="text-slate-500 text-[11px]">Dam: {r.damName || r.damId || 'N/A'}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-slate-800">{r.ownerName || 'Kaksedthan Livestock'}</p>
                      <p className="text-slate-500 text-[11px]">{r.farmLocation || 'Kandal'}</p>
                    </td>
                    <td className="p-4 font-bold text-slate-600">
                      {String(r.registrationDate).substring(0, 10)}
                    </td>
                    <td className="p-4">
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-1 rounded-full uppercase">
                        {r.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        href={`/herdbook/${r.id}`}
                        className="inline-flex items-center gap-1.5 bg-[#dc5c15] text-white hover:bg-orange-700 text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-xs transition-colors"
                      >
                        <Award className="h-3.5 w-3.5" />
                        <span>View Details</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
