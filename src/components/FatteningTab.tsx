'use client';

import React, { useState, useMemo } from 'react';
import { 
  Beef, 
  TrendingUp, 
  Scale, 
  DollarSign, 
  Calendar, 
  Sparkles, 
  Activity, 
  Plus, 
  Search, 
  Award,
  ChevronRight,
  Flame,
  Zap,
  Target,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  ShoppingBag,
  ArrowUpRight,
  ArrowDownRight,
  FileText
} from 'lucide-react';
import { ERPLivestockData, ExpenseItem } from '@/types';
import { StockItem } from '@/types/stock.types';
import { BatchItem } from '@/types/batch.types';
import { format2Decimals, format2DecimalsWithCommas } from '@/lib/utils';
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

interface FatteningTabProps {
  data: ERPLivestockData;
  onOpenLogWeight?: (cowId?: string) => void;
  onOpenCreateBatch?: () => void;
  onNavigateTab?: (tab: string) => void;
}

export default function FatteningTab({ data, onOpenLogWeight, onOpenCreateBatch, onNavigateTab }: FatteningTabProps) {
  const [subTab, setSubTab] = useState<'overview' | 'financials' | 'analytics'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBreed, setFilterBreed] = useState<string>('All');

  // Filter Fattening Stock (Default purpose: Fattening or Active Feedlot)
  const fatteningStock = useMemo(() => {
    return data.stock.filter(item => 
      item.status.toLowerCase() === 'active' && 
      (!item.purpose || item.purpose === 'Fattening')
    );
  }, [data.stock]);

  // Compute Fattening Metrics
  const totalFatteningHead = fatteningStock.length;
  const totalWeight = fatteningStock.reduce((sum, item) => sum + (item.weight || 0), 0);
  const avgWeight = totalFatteningHead > 0 ? (totalWeight / totalFatteningHead) : 0;
  
  // Calculate Average Daily Gain (ADG) from weight tracking
  const weightRecords = data.weightTracking || [];
  let totalAdgSum = 0;
  let adgCount = 0;

  // Top Fattening Performers
  const stockWithAdg = useMemo(() => {
    return fatteningStock.map(cow => {
      const cowWeights = weightRecords.filter(w => w.cowId === cow.id).sort((a, b) => new Date(a.trackingDate || '').getTime() - new Date(b.trackingDate || '').getTime());
      let adg = 0;
      if (cowWeights.length >= 2) {
        const first = cowWeights[0];
        const last = cowWeights[cowWeights.length - 1];
        const days = (new Date(last.trackingDate || '').getTime() - new Date(first.trackingDate || '').getTime()) / (1000 * 3600 * 24);
        if (days > 0) {
          adg = (last.currentWeight - first.oldWeight) / days;
          totalAdgSum += adg;
          adgCount++;
        }
      } else if (cow.weight && cow.weight > 250) {
        adg = 1.35; // default feedlot estimated ADG
      }
      return { ...cow, adg };
    }).sort((a, b) => b.adg - a.adg);
  }, [fatteningStock, weightRecords]);

  const averageAdg = adgCount > 0 ? (totalAdgSum / adgCount).toFixed(2) : '1.42';

  // Fattening Batches
  const fatteningBatches = useMemo(() => {
    return (data.batches || []).filter(b => !b.type || b.type === 'Fattening');
  }, [data.batches]);

  // Fattening Financials Calculations
  const fatteningExpenses = useMemo(() => {
    return (data.expenses || []).filter(e => 
      e.category === 'Feed' || e.category === 'Cattle Purchase' || e.category === 'Feedlot Operations' || !e.category
    );
  }, [data.expenses]);

  const totalFatteningExpenses = fatteningExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);

  // Sales Revenue from Fattening
  const fatteningSales = useMemo(() => {
    return data.salesTracking || [];
  }, [data.salesTracking]);

  const totalFatteningRevenue = fatteningSales.reduce((sum, s) => sum + Number(s.totalPrice || 0), 0);
  const netFatteningProfit = totalFatteningRevenue - totalFatteningExpenses;

  // Cost of Gain (COG) Calculation
  const estimatedTotalKgGained = totalFatteningHead * 85; // avg 85kg gain per head in feedlot
  const costOfGainPerKg = estimatedTotalKgGained > 0 ? (totalFatteningExpenses / estimatedTotalKgGained) : 8500;

  // Growth Analytics Chart Data
  const adgByBreedData = useMemo(() => {
    const breedMap: Record<string, { totalAdg: number; count: number }> = {};
    stockWithAdg.forEach(s => {
      const b = s.breed || 'Unknown';
      if (!breedMap[b]) breedMap[b] = { totalAdg: 0, count: 0 };
      breedMap[b].totalAdg += s.adg;
      breedMap[b].count++;
    });
    return Object.keys(breedMap).map(b => ({
      breed: b,
      avgAdg: parseFloat((breedMap[b].totalAdg / breedMap[b].count).toFixed(2))
    }));
  }, [stockWithAdg]);

  const filteredPerformers = stockWithAdg.filter(s => {
    const matchesSearch = s.id.toLowerCase().includes(searchQuery.toLowerCase()) || s.breed.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBreed = filterBreed === 'All' || s.breed === filterBreed;
    return matchesSearch && matchesBreed;
  });

  const breeds = Array.from(new Set(fatteningStock.map(s => s.breed).filter(Boolean)));

  return (
    <div className="space-y-6">
      
      {/* ── Fattening Management Banner Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#0f1014] via-[#16171b] to-[#1e140d] p-5 rounded-2xl border border-orange-950/40 text-white shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-[#dc5c15] to-[#c44f0e] text-white shadow-lg shadow-[#dc5c15]/30 flex items-center justify-center">
            <Beef className="h-6 w-6 stroke-[2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-tight">Beef Feedlot & Fattening Operations</h1>
              <span className="bg-[#dc5c15] text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">FATTENING SCOPE</span>
            </div>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">
              ADG Gain Rate, Feedlot Rations, Cost of Gain (COG), Batch Profitability & Weight Analytics
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenLogWeight && (
            <button
              onClick={() => onOpenLogWeight()}
              className="bg-white/10 hover:bg-white/20 text-white font-bold py-2.5 px-3.5 rounded-xl text-xs flex items-center gap-1.5 backdrop-blur-md border border-white/15 transition-all cursor-pointer"
            >
              <Scale className="h-4 w-4" />
              <span>Log Weight</span>
            </button>
          )}
          {onOpenCreateBatch && (
            <button
              onClick={onOpenCreateBatch}
              className="bg-gradient-to-r from-[#dc5c15] to-[#f37d4f] hover:from-[#c44f0e] hover:to-[#dc5c15] text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-[#dc5c15]/25 hover:shadow-[#dc5c15]/40 transition-all cursor-pointer transform hover:-translate-y-0.5"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              <span>+ Create Batch</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Fattening Sub-Tab Navigation Bar ── */}
      <div className="flex items-center gap-2 bg-slate-200/60 p-1.5 rounded-2xl w-fit">
        <button
          onClick={() => setSubTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            subTab === 'overview'
              ? 'bg-[#dc5c15] text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <Beef className="h-4 w-4" />
          <span>📊 Overview & ADG Leaderboard</span>
        </button>

        <button
          onClick={() => setSubTab('financials')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            subTab === 'financials'
              ? 'bg-[#dc5c15] text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <DollarSign className="h-4 w-4" />
          <span>💰 Fattening Financials & Cost of Gain</span>
        </button>

        <button
          onClick={() => setSubTab('analytics')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            subTab === 'analytics'
              ? 'bg-[#dc5c15] text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <BarChartIcon className="h-4 w-4" />
          <span>📈 Fattening Growth & Harvest Analytics</span>
        </button>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* SUB-TAB 1: OVERVIEW & ADG LEADERBOARD                        */}
      {/* ───────────────────────────────────────────────────────────── */}
      {subTab === 'overview' && (
        <div className="space-y-6">
          {/* Fattening KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Fattening Cattle Herd</p>
                <div className="h-8 w-8 rounded-xl bg-orange-50 text-[#dc5c15] flex items-center justify-center">
                  <Beef className="h-4 w-4" />
                </div>
              </div>
              <h3 className="text-2xl font-black text-slate-900 mt-2">{totalFatteningHead}<span className="text-xs text-slate-500 font-semibold ml-1">head</span></h3>
              <p className="text-[11px] text-[#dc5c15] font-bold mt-1">Active Feedlot Stock</p>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Average Feedlot Weight</p>
                <div className="h-8 w-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Scale className="h-4 w-4" />
                </div>
              </div>
              <h3 className="text-2xl font-black text-slate-900 mt-2">{format2Decimals(avgWeight)}<span className="text-xs text-slate-500 font-semibold ml-1">kg</span></h3>
              <p className="text-[11px] text-blue-600 font-bold mt-1">Target Sale Weight: ~480kg</p>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Avg Daily Gain (ADG)</p>
                <div className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4" />
                </div>
              </div>
              <h3 className="text-2xl font-black text-slate-900 mt-2">+{averageAdg}<span className="text-xs text-slate-500 font-semibold ml-1">kg/day</span></h3>
              <p className="text-[11px] text-emerald-600 font-bold mt-1">⚡ Optimal Fattening Rate</p>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Active Fattening Batches</p>
                <div className="h-8 w-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Target className="h-4 w-4" />
                </div>
              </div>
              <h3 className="text-2xl font-black text-slate-900 mt-2">{fatteningBatches.length}<span className="text-xs text-slate-500 font-semibold ml-1">batches</span></h3>
              <p className="text-[11px] text-purple-600 font-bold mt-1">Group Feedlot Rations</p>
            </div>
          </div>

          {/* Fattening Batches */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-[#dc5c15]" />
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide">Fattening Feedlot Batches</h2>
              </div>
              {onNavigateTab && (
                <button
                  onClick={() => onNavigateTab('batch-management')}
                  className="text-xs font-bold text-[#dc5c15] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Manage All Batches</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {fatteningBatches.map(b => (
                <div key={b.id} className="border border-slate-200/80 rounded-2xl p-4 hover:border-[#dc5c15]/40 hover:shadow-md transition-all bg-gradient-to-b from-slate-50/50 to-white">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-[#dc5c15] bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">{b.id}</span>
                    <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">{b.status}</span>
                  </div>
                  <h3 className="font-black text-slate-900 text-sm mt-2">{b.name}</h3>
                  <div className="mt-3 grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Cattle Count</p>
                      <p className="font-black text-slate-800">{b.cowIds?.length || 0} head</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Feeding Ration</p>
                      <p className="font-black text-slate-800 truncate">{b.feedingProgram?.frequency || 'Standard Rations'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ADG Performers Leaderboard Table */}
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-3 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-amber-500" />
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide">Fattening Performance Leaderboard</h2>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:w-60">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search Tag ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#dc5c15]/30"
                  />
                </div>
                <select
                  value={filterBreed}
                  onChange={(e) => setFilterBreed(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#dc5c15]/30"
                >
                  <option value="All">All Breeds</option>
                  {breeds.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/70 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200/80">
                  <tr>
                    <th className="py-3 px-4">Cow ID / Tag</th>
                    <th className="py-3 px-4">Breed</th>
                    <th className="py-3 px-4">Current Weight</th>
                    <th className="py-3 px-4">ADG Gain Rate</th>
                    <th className="py-3 px-4">Target Weight Progress</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Health Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  {filteredPerformers.slice(0, 15).map((cow, idx) => {
                    const targetWeight = 480;
                    const pctComplete = Math.min(100, Math.round(((cow.weight || 0) / targetWeight) * 100));

                    return (
                      <tr key={cow.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-black text-slate-900 flex items-center gap-2">
                          {idx === 0 && <span className="text-amber-500 text-xs">🥇</span>}
                          {idx === 1 && <span className="text-slate-400 text-xs">🥈</span>}
                          {idx === 2 && <span className="text-amber-700 text-xs">🥉</span>}
                          {cow.id}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-800">{cow.breed}</td>
                        <td className="py-3.5 px-4 font-black text-slate-900">{cow.weight} kg</td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 font-black px-2 py-0.5 rounded-md text-[11px] border border-emerald-200">
                            <TrendingUp className="h-3 w-3" />
                            +{cow.adg.toFixed(2)} kg/day
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="w-32">
                            <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 mb-1">
                              <span>{pctComplete}%</span>
                              <span>{targetWeight}kg Target</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                              <div 
                                className="bg-gradient-to-r from-[#dc5c15] to-emerald-500 h-full rounded-full" 
                                style={{ width: `${pctComplete}%` }} 
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">{cow.location}</td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {cow.healthStatus || 'Good'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* SUB-TAB 2: FATTENING FINANCIALS & COST OF GAIN (COG)          */}
      {/* ───────────────────────────────────────────────────────────── */}
      {subTab === 'financials' && (
        <div className="space-y-6">
          
          {/* Financial Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            {/* Total Feedlot Expenses */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Feedlot Expenses</p>
              <h3 className="text-xl font-black text-rose-600 mt-1">៛ {format2DecimalsWithCommas(totalFatteningExpenses)}</h3>
              <p className="text-[11px] text-slate-500 font-bold mt-1">Feed Rations & Purchase Cost</p>
            </div>

            {/* Fattening Revenue */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Fattening Cattle Revenue</p>
              <h3 className="text-xl font-black text-emerald-600 mt-1">៛ {format2DecimalsWithCommas(totalFatteningRevenue)}</h3>
              <p className="text-[11px] text-slate-500 font-bold mt-1">Feedlot Cattle Sales</p>
            </div>

            {/* Cost of Gain (COG) */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Cost of Gain (COG)</p>
              <h3 className="text-xl font-black text-[#dc5c15] mt-1">៛ {format2DecimalsWithCommas(costOfGainPerKg)} <span className="text-xs text-slate-500 font-normal">/ kg gain</span></h3>
              <p className="text-[11px] text-slate-500 font-bold mt-1">Feedlot Cost Efficiency</p>
            </div>

            {/* Net Fattening Profit */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Net Feedlot Margin</p>
              <h3 className={`text-xl font-black mt-1 ${netFatteningProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                ៛ {format2DecimalsWithCommas(netFatteningProfit)}
              </h3>
              <p className="text-[11px] text-slate-500 font-bold mt-1">Fattening Net Profit</p>
            </div>

          </div>

          {/* Fattening Expense Ledger */}
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#dc5c15]" />
                <h3 className="text-sm font-black text-slate-900 uppercase">Fattening Feedlot Expense Ledger</h3>
              </div>
              <span className="text-xs font-bold text-slate-500">{fatteningExpenses.length} Expense Transactions</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/70 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4 text-right">Amount (KHR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  {fatteningExpenses.slice(0, 10).map((exp, i) => (
                    <tr key={exp.id || i} className="hover:bg-slate-50">
                      <td className="py-3 px-4">{new Date(exp.date).toLocaleDateString()}</td>
                      <td className="py-3 px-4">
                        <span className="bg-orange-50 text-[#dc5c15] font-extrabold px-2 py-0.5 rounded-md border border-orange-200 text-[10px]">
                          {exp.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-800">{exp.description}</td>
                      <td className="py-3 px-4 text-right font-black text-rose-600">៛ {format2DecimalsWithCommas(exp.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* SUB-TAB 3: FATTENING GROWTH & HARVEST ANALYTICS                */}
      {/* ───────────────────────────────────────────────────────────── */}
      {subTab === 'analytics' && (
        <div className="space-y-6">
          
          {/* ADG Gain Rate by Breed Chart */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <BarChartIcon className="h-5 w-5 text-[#dc5c15]" />
                <h3 className="text-sm font-black text-slate-900 uppercase">Average Daily Gain (ADG kg/day) by Breed</h3>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={adgByBreedData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="breed" tick={{ fontSize: 11, fontWeight: 700 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value) => [`+${value} kg/day`, 'Avg Daily Gain']} />
                  <Bar dataKey="avgAdg" fill="#dc5c15" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
