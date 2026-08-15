'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ERPLivestockData } from '@/lib/types';
import StandardAnimalImage from '@/components/common/StandardAnimalImage';
import { 
  Beef, 
  Heart, 
  Baby, 
  Award, 
  ArrowRight, 
  ShieldCheck, 
  Building2, 
  UserCheck, 
  Syringe, 
  AlertCircle,
  Plus,
  Eye,
  CheckCircle2,
  Calendar,
  DollarSign,
  Sparkles,
  Layers,
  Search,
  Filter,
  Check
} from 'lucide-react';

interface DashboardHomeProps {
  data: ERPLivestockData;
}

export default function DashboardHome({ data }: DashboardHomeProps) {
  const router = useRouter();

  // Role State Selector for testing/operational dashboard view
  const [activeRole, setActiveRole] = useState<'Super Admin' | 'Breeder' | 'Farm Owner' | 'Customer / Cow Owner' | 'Sire Sourcing Company'>('Super Admin');

  // Master PostgreSQL Datasets
  const sires = data.sires || [];
  const dams = data.dams || [];
  const calves = data.calves || [];
  const programs = data.breedingPrograms || [];
  const stock = data.stockInsemination || [];
  const herdbook = data.herdbookRegistrations || [];
  const certificates = data.certificates || [];

  // SCOPE FILTERED DATASETS
  const filteredData = useMemo(() => {
    if (activeRole === 'Farm Owner') {
      const farmLoc = 'រទាំង';
      const farmDams = dams.filter(d => d.farmLocation === farmLoc || d.ownerName?.includes('Farm') || !d.ownerName);
      const farmCalves = calves.filter(c => c.farmLocation === farmLoc || c.ownerName?.includes('Farm') || !c.ownerName);
      const farmPrograms = programs.filter(p => p.farmLocation === farmLoc || p.ownerName?.includes('Farm'));
      return {
        sires,
        dams: farmDams,
        calves: farmCalves,
        programs: farmPrograms,
        stock,
        certificates: certificates.filter(c => c.animalType !== 'Sire' || farmPrograms.some(p => p.sireId === c.animalId)),
        scopeLabel: `Station Scope: ${farmLoc}`
      };
    }

    if (activeRole === 'Customer / Cow Owner') {
      const custOwner = 'SNR Livestock Owner';
      const custDams = dams.filter(d => d.ownerName === custOwner || d.ownerName === 'Sophea Cow Owner');
      const custCalves = calves.filter(c => c.ownerName === custOwner || c.ownerName === 'Sophea Cow Owner');
      const custPrograms = programs.filter(p => p.cowOwner === custOwner || p.ownerName === custOwner);
      return {
        sires: [],
        dams: custDams,
        calves: custCalves,
        programs: custPrograms,
        stock: [],
        certificates: certificates.filter(c => custDams.some(d => d.id === c.animalId) || custCalves.some(cl => cl.id === c.animalId)),
        scopeLabel: `Customer Scope: ${custOwner}`
      };
    }

    if (activeRole === 'Sire Sourcing Company') {
      const companyName = 'ABS Global Inc.';
      const compSires = sires.filter(s => s.sourcingCompany === companyName || !s.sourcingCompany);
      const compStock = stock.filter(st => compSires.some(s => s.id === st.sireId));
      const compCerts = certificates.filter(c => c.animalType === 'Sire' && compSires.some(s => s.id === c.animalId));
      return {
        sires: compSires,
        dams: [],
        calves: [],
        programs: [],
        stock: compStock,
        certificates: compCerts,
        scopeLabel: `Sourcing Scope: ${companyName}`
      };
    }

    if (activeRole === 'Breeder') {
      return {
        sires,
        dams: dams.filter(d => (d.availability as string) === 'Open' || d.availability === 'In Breeding'),
        calves,
        programs: programs.filter(p => p.status === 'Breeding' || p.status === 'Scheduled'),
        stock,
        certificates,
        scopeLabel: 'Operations Scope: Licensed Breeder'
      };
    }

    // Super Admin
    return {
      sires,
      dams,
      calves,
      programs,
      stock,
      certificates,
      scopeLabel: 'Global Scope: System Administrator'
    };
  }, [activeRole, sires, dams, calves, programs, stock, certificates]);

  // Aggregation Metrics
  const activeProgramsCount = filteredData.programs.filter(p => p.status === 'Breeding' || p.status === 'Scheduled').length;
  const openDamsCount = filteredData.dams.filter(d => (d.availability as string) === 'Open' || !d.availability).length;
  const lowStockStraws = filteredData.stock.filter(s => (s.availableStraws ?? s.stockAvailable ?? 0) < 10);
  const totalCostingUsd = filteredData.programs.reduce((sum, p) => sum + (p.priceUsd || 0), 0);

  // Attention alerts
  const pendingPdChecks = filteredData.programs.filter(p => p.pregnancyCheckDate && new Date(p.pregnancyCheckDate) <= new Date());
  const upcomingCalvings = filteredData.programs.filter(p => p.expectedCalvingDate);

  return (
    <div className="space-y-6">

      {/* Welcome & Active Account Role Banner */}
      <div className="bg-[#121926] text-white rounded-3xl p-6 shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="h-12 w-12 rounded-2xl bg-[#dc5c15]/20 text-[#dc5c15] border border-[#dc5c15]/30 flex items-center justify-center font-black text-xl shrink-0 shadow-inner">
            {activeRole === 'Breeder' ? '🧬' : activeRole === 'Farm Owner' ? '🏡' : activeRole === 'Customer / Cow Owner' ? '🐮' : activeRole === 'Sire Sourcing Company' ? '🏢' : '🛡️'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black tracking-tight">
                Welcome to Kaksedthan Operational Dashboard
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              Real-time operational summary from PostgreSQL database <code className="text-orange-400 font-mono">livestock_db</code> • <span className="text-emerald-400 font-bold">{filteredData.scopeLabel}</span>
            </p>
          </div>
        </div>
      </div>

      {/* ATTENTION REQUIRED / ALERTS BANNER (If any alerts exist) */}
      {(pendingPdChecks.length > 0 || lowStockStraws.length > 0) && activeRole !== 'Customer / Cow Owner' && (
        <div className="bg-amber-50 border border-amber-200/90 rounded-3xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
            <div>
              <p className="font-black text-slate-900">Operational Alerts Needing Action:</p>
              <p className="text-slate-700 font-medium">
                {pendingPdChecks.length > 0 && <span>• {pendingPdChecks.length} Breeding Programs due for 21-Day PD Check. </span>}
                {lowStockStraws.length > 0 && <span>• {lowStockStraws.length} Semen straw batches low in inventory (&lt; 10 straws).</span>}
              </p>
            </div>
          </div>
          <Link href="/breeding-programs" className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-black rounded-xl text-xs shadow-xs text-center shrink-0">
            Review Programs →
          </Link>
        </div>
      )}

      {/* QUICK ACTIONS TOOLBAR (Permission & Role Aware) */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-4 shadow-sm space-y-2">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-400">
          <Sparkles className="h-4 w-4 text-[#dc5c15]" />
          <span>Quick Operational Actions</span>
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          {(activeRole === 'Super Admin' || activeRole === 'Breeder') && (
            <button
              onClick={() => router.push('/breeding-programs/new')}
              className="px-4 py-2.5 rounded-xl bg-[#dc5c15] text-white font-black shadow-md shadow-[#dc5c15]/20 hover:bg-[#c44f0e] transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>+ New Breeding Program</span>
            </button>
          )}

          {(activeRole === 'Super Admin' || activeRole === 'Breeder' || activeRole === 'Farm Owner') && (
            <>
              <button
                onClick={() => router.push('/dams/new')}
                className="px-4 py-2.5 rounded-xl bg-purple-700 text-white font-black shadow-md shadow-purple-700/20 hover:bg-purple-800 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>+ Register Dam Cow</span>
              </button>
              <button
                onClick={() => router.push('/calves/new')}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-black shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>+ Register Calf Birth</span>
              </button>
            </>
          )}

          {(activeRole === 'Super Admin' || activeRole === 'Sire Sourcing Company') && (
            <>
              <button
                onClick={() => router.push('/sires/new')}
                className="px-4 py-2.5 rounded-xl bg-[#dc5c15] text-white font-black shadow-md shadow-[#dc5c15]/20 hover:bg-[#c44f0e] transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>+ Register Sire Bull</span>
              </button>
              <button
                onClick={() => router.push('/stock-insemination/new')}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-black shadow-md shadow-indigo-600/20 hover:bg-indigo-700 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>+ Add Semen Stock</span>
              </button>
            </>
          )}

          {activeRole === 'Customer / Cow Owner' && (
            <>
              <button
                onClick={() => router.push('/dams')}
                className="px-4 py-2.5 rounded-xl bg-purple-700 text-white font-black shadow-md hover:bg-purple-800 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Eye className="h-4 w-4" />
                <span>View My Owned Animals</span>
              </button>
              <button
                onClick={() => router.push('/breeding-programs')}
                className="px-4 py-2.5 rounded-xl bg-[#dc5c15] text-white font-black shadow-md hover:bg-[#c44f0e] transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Heart className="h-4 w-4" />
                <span>View My Breeding Programs</span>
              </button>
              <button
                onClick={() => router.push('/certificates')}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-black shadow-md hover:bg-emerald-700 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Award className="h-4 w-4" />
                <span>View My Certificates</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* REAL-TIME SUMMARY CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Card 1: SIRES / SIRE MANAGEMENT */}
        {activeRole !== 'Customer / Cow Owner' && (
          <div
            onClick={() => router.push('/sires')}
            className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs hover:shadow-lg hover:border-[#dc5c15] transition-all cursor-pointer space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                {activeRole === 'Sire Sourcing Company' ? 'Supplied Sires' : 'Sire Bull Register'}
              </span>
              <span className="p-2 rounded-2xl bg-orange-50 text-[#dc5c15] group-hover:bg-[#dc5c15] group-hover:text-white transition-colors">
                <Beef className="h-4 w-4" />
              </span>
            </div>
            <p className="text-2xl font-black text-slate-900">{filteredData.sires.length}</p>
            <p className="text-xs text-[#dc5c15] font-extrabold flex items-center gap-1">
              <span>View Sire Bull Records</span> <ArrowRight className="h-3 w-3" />
            </p>
          </div>
        )}

        {/* Card 2: DAMS / DAM MANAGEMENT */}
        {activeRole !== 'Sire Sourcing Company' && (
          <div
            onClick={() => router.push('/dams')}
            className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs hover:shadow-lg hover:border-purple-600 transition-all cursor-pointer space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                {activeRole === 'Customer / Cow Owner' ? 'My Owned Cows' : 'Dam Cow Register'}
              </span>
              <span className="p-2 rounded-2xl bg-purple-50 text-purple-700 group-hover:bg-purple-700 group-hover:text-white transition-colors">
                <Beef className="h-4 w-4" />
              </span>
            </div>
            <p className="text-2xl font-black text-slate-900">{filteredData.dams.length}</p>
            <p className="text-xs text-purple-700 font-extrabold flex items-center gap-1">
              <span>View Dam Cow Records</span> <ArrowRight className="h-3 w-3" />
            </p>
          </div>
        )}

        {/* Card 3: BREEDING PROGRAMS */}
        {activeRole !== 'Sire Sourcing Company' && (
          <div
            onClick={() => router.push('/breeding-programs')}
            className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs hover:shadow-lg hover:border-[#dc5c15] transition-all cursor-pointer space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                {activeRole === 'Customer / Cow Owner' ? 'My Breeding Programs' : 'Active Breeding'}
              </span>
              <span className="p-2 rounded-2xl bg-orange-50 text-[#dc5c15] group-hover:bg-[#dc5c15] group-hover:text-white transition-colors">
                <Heart className="h-4 w-4" />
              </span>
            </div>
            <p className="text-2xl font-black text-slate-900">{activeProgramsCount}</p>
            <p className="text-xs text-[#dc5c15] font-extrabold flex items-center gap-1">
              <span>View Gestation Timetable</span> <ArrowRight className="h-3 w-3" />
            </p>
          </div>
        )}

        {/* Card 4: CALVES & CERTIFICATES */}
        <div
          onClick={() => router.push('/certificates')}
          className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs hover:shadow-lg hover:border-emerald-600 transition-all cursor-pointer space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Certificates Issued</span>
            <span className="p-2 rounded-2xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Award className="h-4 w-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-slate-900">{filteredData.certificates.length}</p>
          <p className="text-xs text-emerald-600 font-extrabold flex items-center gap-1">
            <span>View Certificate Center</span> <ArrowRight className="h-3 w-3" />
          </p>
        </div>

      </div>

      {/* OPERATIONAL SECTION 1 — BREEDING PROGRAMS & EXPECTED CALVINGS */}
      {activeRole !== 'Sire Sourcing Company' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-[#dc5c15]" />
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Breeding Program Overview & Calving Schedule</h4>
            </div>
            <Link href="/breeding-programs" className="text-xs font-black text-[#dc5c15] hover:underline flex items-center gap-1">
              <span>View All Programs</span> <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider bg-slate-50">
                  <th className="py-2.5 pl-3">Program ID</th>
                  <th className="py-2.5">Sire (Father)</th>
                  <th className="py-2.5">Dam (Mother)</th>
                  <th className="py-2.5">Service Date</th>
                  <th className="py-2.5">Expected Calving (+283d)</th>
                  <th className="py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredData.programs.length > 0 ? (
                  filteredData.programs.slice(0, 5).map(prog => (
                    <tr
                      key={prog.id}
                      onClick={() => router.push(`/breeding-programs/${prog.id}`)}
                      className="hover:bg-orange-50/50 cursor-pointer transition-colors"
                    >
                      <td className="py-3 pl-3 font-mono font-black text-slate-900">{prog.programNumber || prog.id}</td>
                      <td className="py-3 font-bold text-slate-800">{prog.sireName || prog.sireId}</td>
                      <td className="py-3 font-bold text-purple-700">{prog.damName || prog.damId}</td>
                      <td className="py-3 text-slate-600 font-semibold">{prog.breedingDate || prog.startDate}</td>
                      <td className="py-3 font-black text-emerald-700">{prog.expectedCalvingDate || 'N/A'}</td>
                      <td className="py-3">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9.5px] font-black uppercase ${
                          prog.status === 'Pregnant' ? 'bg-emerald-100 text-emerald-800' : 'bg-orange-100 text-[#dc5c15]'
                        }`}>
                          {prog.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 font-semibold">
                      No active breeding programs recorded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* OPERATIONAL SECTION 2 — SIRE SOURCING COMPANY VIEW */}
      {activeRole === 'Sire Sourcing Company' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-[#dc5c15]" />
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Company Supplied Sires & Semen Straw Inventory</h4>
            </div>
            <Link href="/sires" className="text-xs font-black text-[#dc5c15] hover:underline flex items-center gap-1">
              <span>Manage Sires</span> <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredData.sires.map(sire => (
              <div key={sire.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3">
                <Link href={`/sires/${sire.id}`} className="h-14 w-14 rounded-xl border border-slate-200 overflow-hidden bg-white shrink-0 block cursor-pointer">
                  <StandardAnimalImage src={sire.imageUrl} alt={sire.name} />
                </Link>
                <div className="flex-1 min-w-0 text-xs">
                  <h5 className="font-black text-slate-900 truncate">{sire.name}</h5>
                  <p className="text-[10px] text-slate-500 font-semibold">ID: {sire.id} • Breed: <span className="font-bold text-[#dc5c15]">{sire.breed}</span></p>
                  <p className="text-[10px] text-slate-500 font-semibold truncate">Supplier: {sire.sourcingCompany || 'ABS Global'}</p>
                </div>
                <Link href={`/sires/${sire.id}`} className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-[10px] font-bold rounded-xl hover:bg-slate-100">
                  View Profile
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* OPERATIONAL SECTION 3 — CERTIFICATE CENTER SUMMARY */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-emerald-600" />
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Official Certificate & Dynamic QR Verification Hub</h4>
          </div>
          <Link href="/certificates" className="text-xs font-black text-emerald-600 hover:underline flex items-center gap-1">
            <span>Certificate Center</span> <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          {filteredData.certificates.slice(0, 3).map(cert => (
            <div key={cert.id} className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[9.5px] font-black uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">{cert.animalType} Certificate</span>
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              </div>
              <h5 className="font-black text-slate-900 mt-1">{cert.animalName || cert.animalId}</h5>
              <p className="text-[10px] text-slate-500 font-semibold">Reg No: {cert.registrationNumber}</p>
              <Link href={`/certificates/${cert.id}`} className="text-[10px] font-black text-emerald-700 hover:underline block pt-1">
                View & Download PNG →
              </Link>
            </div>
          ))}
          {filteredData.certificates.length === 0 && (
            <div className="sm:col-span-3 py-6 text-center text-slate-400 font-semibold text-xs">
              No certificates issued for this scope.
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
