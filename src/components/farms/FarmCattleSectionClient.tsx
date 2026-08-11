'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import StandardAnimalImage from '@/components/common/StandardAnimalImage';
import {
  Beef,
  Syringe,
  Heart,
  Baby,
  Search,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Users
} from 'lucide-react';

export interface FarmAnimal {
  category: 'Sire' | 'Dam' | 'Calf';
  id: string;
  name: string;
  breed: string;
  sex: string;
  status: string;
  ownerName?: string;
  farmLocation?: string;
  imageUrl?: string;
  dob?: string;
  createdAt?: string;
}

interface Props {
  farmName: string;
  summary: {
    total: number;
    sires: number;
    dams: number;
    calves: number;
  };
  animals: FarmAnimal[];
}

export default function FarmCattleSectionClient({ farmName, summary, animals }: Props) {
  const [activeTab, setActiveTab] = useState<'all' | 'sire' | 'dam' | 'calf'>('all');
  const [search, setSearch] = useState('');

  const filteredAnimals = useMemo(() => {
    return animals.filter((a) => {
      const matchesCategory =
        activeTab === 'all' || a.category.toLowerCase() === activeTab;

      const matchesSearch =
        !search ||
        a.id.toLowerCase().includes(search.toLowerCase()) ||
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.breed.toLowerCase().includes(search.toLowerCase()) ||
        (a.ownerName || '').toLowerCase().includes(search.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [animals, activeTab, search]);

  const getAnimalHref = (animal: FarmAnimal) => {
    if (animal.category === 'Sire') return `/sires/${animal.id}`;
    if (animal.category === 'Dam') return `/dams/${animal.id}`;
    return `/calves/${animal.id}`;
  };

  const getBadgeColor = (category: string) => {
    if (category === 'Sire') return 'bg-orange-100 text-orange-800 border-orange-200';
    if (category === 'Dam') return 'bg-purple-100 text-purple-800 border-purple-200';
    return 'bg-indigo-100 text-indigo-800 border-indigo-200';
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Beef className="h-5 w-5 text-purple-600" />
            <span>Cattle Management & Housed Livestock</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            All registered cattle (Sires, Dams, and Calves) associated with {farmName}.
          </p>
        </div>

        {/* 4 KPI Metric Counters */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-center">
            <span className="text-[9px] font-black uppercase text-slate-400 block">Total Cattle</span>
            <span className="text-sm font-black text-slate-900">{summary.total}</span>
          </div>
          <div className="bg-orange-50 px-3 py-1.5 rounded-xl border border-orange-100 text-center">
            <span className="text-[9px] font-black uppercase text-orange-600 block">Sires</span>
            <span className="text-sm font-black text-orange-900">{summary.sires}</span>
          </div>
          <div className="bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-100 text-center">
            <span className="text-[9px] font-black uppercase text-purple-600 block">Dams</span>
            <span className="text-sm font-black text-purple-900">{summary.dams}</span>
          </div>
          <div className="bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100 text-center">
            <span className="text-[9px] font-black uppercase text-indigo-600 block">Calves</span>
            <span className="text-sm font-black text-indigo-900">{summary.calves}</span>
          </div>
        </div>
      </div>

      {/* Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 text-xs font-black rounded-lg transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            All Cattle ({summary.total})
          </button>
          <button
            onClick={() => setActiveTab('sire')}
            className={`px-3 py-1.5 text-xs font-black rounded-lg transition-all cursor-pointer ${
              activeTab === 'sire'
                ? 'bg-white text-orange-700 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Sires ({summary.sires})
          </button>
          <button
            onClick={() => setActiveTab('dam')}
            className={`px-3 py-1.5 text-xs font-black rounded-lg transition-all cursor-pointer ${
              activeTab === 'dam'
                ? 'bg-white text-purple-700 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Dams ({summary.dams})
          </button>
          <button
            onClick={() => setActiveTab('calf')}
            className={`px-3 py-1.5 text-xs font-black rounded-lg transition-all cursor-pointer ${
              activeTab === 'calf'
                ? 'bg-white text-indigo-700 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Calves ({summary.calves})
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search ID, Name, Breed, Owner..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 font-semibold"
          />
        </div>
      </div>

      {/* Animal Cards Grid (Reusing Sire/Dam/Calf Card Standards) */}
      {filteredAnimals.length === 0 ? (
        <div className="p-10 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-2">
          <Beef className="h-10 w-10 text-slate-300 mx-auto" />
          <p className="font-bold text-xs text-slate-700">No Cattle Found</p>
          <p className="text-[11px] text-slate-500">
            No {activeTab !== 'all' ? activeTab : 'cattle'} records match your search query for {farmName}.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredAnimals.map((animal) => (
            <Link
              key={`${animal.category}-${animal.id}`}
              href={getAnimalHref(animal)}
              className="group bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-lg hover:border-purple-500 transition-all duration-200 overflow-hidden flex flex-col justify-between cursor-pointer p-3"
            >
              <div>
                {/* Animal Image & Category Badge */}
                <div className="relative mb-2.5">
                  <StandardAnimalImage
                    src={animal.imageUrl}
                    alt={animal.name}
                    animalType={animal.category.toLowerCase() as any}
                  />
                  <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-md text-[9px] font-black uppercase border shadow-2xs ${getBadgeColor(animal.category)}`}>
                    {animal.category}
                  </span>
                  <span className="absolute top-2 right-2 bg-slate-900/80 text-white font-black text-[9px] px-2 py-0.5 rounded-md backdrop-blur-md">
                    {animal.status || 'Active'}
                  </span>
                </div>

                {/* Title & Metadata */}
                <div className="space-y-1 text-xs">
                  <h4 className="font-black text-slate-900 group-hover:text-purple-600 transition-colors truncate">
                    {animal.name}
                  </h4>
                  <p className="text-[11px] font-extrabold text-[#dc5c15]">{animal.breed}</p>

                  <div className="pt-2 border-t border-slate-100 space-y-1 text-[11px] text-slate-600">
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">ID:</span>
                      <span className="font-mono font-bold text-slate-800">{animal.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">Sex:</span>
                      <span className="font-bold text-slate-800">{animal.sex}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">Owner:</span>
                      <span className="font-bold text-slate-800 truncate max-w-[100px]">{animal.ownerName || 'Bona Owner'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer Link */}
              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-purple-600">
                <span>View {animal.category} Details</span>
                <span className="group-hover:translate-x-0.5 transition-transform">→</span>
              </div>
            </Link>
          ))}
        </div>
      )}

    </div>
  );
}
