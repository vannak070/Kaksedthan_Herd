'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import PageHeader from '@/components/common/PageHeader';
import StandardAnimalImage from '@/components/common/StandardAnimalImage';
import { StockInseminationItem, SireItem, BreedingProgramItem } from '@/types/breeding.types';
import { fetchStockInseminationAction, fetchSiresAction, updateStockInseminationAction, fetchBreedingProgramsAction } from '@/app/actions';
import {
  Syringe,
  Beef,
  ArrowLeft,
  Heart,
  DollarSign,
  Package,
  Calendar,
  MapPin,
  UserCheck,
  Plus,
  ShoppingCart,
  Send,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Layers,
  FileText,
  Activity,
  ChevronRight,
  ExternalLink,
  Info,
  Clock,
  Sparkles,
  Building,
  User,
  AlertCircle
} from 'lucide-react';

type TabKey = 'overview' | 'stock' | 'sire' | 'availability' | 'transactions' | 'breeding' | 'related';

export default function StockDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = params.id as string;

  const [stock, setStock] = useState<StockInseminationItem | null>(null);
  const [sire, setSire] = useState<SireItem | null>(null);
  const [relatedPrograms, setRelatedPrograms] = useState<BreedingProgramItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Tab State with URL query param support: overview | stock | sire | availability | transactions | breeding | related
  const initialTab = (searchParams.get('tab') as TabKey) || 'overview';
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);

  // Interactive Action Modals
  const [activeModal, setActiveModal] = useState<'add' | 'sell' | 'transfer' | 'reserve' | null>(null);
  const [actionQty, setActionQty] = useState<number>(50);
  const [buyerName, setBuyerName] = useState<string>('');
  const [recipientName, setRecipientName] = useState<string>('');
  const [processing, setProcessing] = useState<boolean>(false);

  // Audit Transactions Ledger
  const [transactions, setTransactions] = useState<Array<{ date: string; type: string; qty: number; balance: number; ref: string; user: string }>>([
    { date: '2026-01-10', type: 'Initial Stock Import', qty: 500, balance: 500, ref: 'INIT-BATCH-01', user: 'Super Admin' },
    { date: '2026-01-15', type: 'Sold to Prek Anchanh Farm', qty: -50, balance: 450, ref: 'SALE-USD-102', user: 'Super Admin' },
    { date: '2026-01-20', type: 'Reserved for Station B', qty: -20, balance: 430, ref: 'RESV-802', user: 'Super Admin' },
    { date: '2026-02-01', type: 'Used for AI Breeding BP-2026-001', qty: -10, balance: 420, ref: 'BP-USAGE-01', user: 'Sokha Vannak' },
  ]);

  // Sales & Transfer Ledger
  const [salesLedger, setSalesLedger] = useState<Array<{ type: string; recipient: string; qty: number; priceUsd: number; date: string; ref: string; status: string }>>([
    { type: 'Sold', recipient: 'Prek Anchanh Farm', qty: 50, priceUsd: 1250.00, date: '2026-01-15', ref: 'INV-2026-001', status: 'Completed' },
    { type: 'Transferred', recipient: 'Ang Snoul Station B', qty: 20, priceUsd: 0, date: '2026-01-20', ref: 'TR-2026-004', status: 'Completed' },
  ]);

  useEffect(() => {
    Promise.all([
      fetchStockInseminationAction(),
      fetchSiresAction(),
      fetchBreedingProgramsAction(),
    ]).then(([stList, siresList, bpList]) => {
      const decodedId = id ? decodeURIComponent(id).toLowerCase() : '';
      let found = stList.find((s) => 
        s.id.toLowerCase() === decodedId || 
        s.sireId.toLowerCase() === decodedId ||
        s.id.toLowerCase().replace(/[^a-z0-9]/g, '') === decodedId.replace(/[^a-z0-9]/g, '')
      );

      if (!found && stList.length > 0) {
        found = stList[0];
      }

      if (found) {
        setStock(found);
        const sFound = siresList.find((sr) => sr.id.toLowerCase() === found.sireId.toLowerCase() || sr.name.toLowerCase() === (found.sireName || '').toLowerCase());
        setSire(sFound || null);
        const relBp = bpList.filter((bp) => bp.sireId === found.sireId);
        setRelatedPrograms(relBp);
      }
      setLoading(false);
    });
  }, [id]);

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    router.replace(`/stock-insemination/${id}?tab=${tab}`, { scroll: false });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin h-8 w-8 border-4 border-purple-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!stock) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center my-6 max-w-xl mx-auto space-y-4 shadow-sm">
        <Syringe className="h-12 w-12 text-purple-300 mx-auto" />
        <h3 className="text-base font-bold text-slate-800">Semen Stock Record Not Found</h3>
        <p className="text-xs text-slate-500">No stock record found for Stock Code: {id}</p>
        <Link href="/stock-insemination" className="inline-flex items-center gap-2 bg-purple-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-purple-700 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Stock Insemination</span>
        </Link>
      </div>
    );
  }

  const sireName = sire?.name || stock.sireName || stock.sireId;
  const sireBreed = sire?.breed || stock.sireBreed || 'American Red Brahman';
  const availableCount = stock.stockAvailable;
  const initialStock = 500;
  const reservedCount = 50;
  const usedCount = relatedPrograms.length > 0 ? relatedPrograms.length * 10 : 50;
  const percentAvailable = Math.min(100, Math.max(0, Math.round((availableCount / initialStock) * 100)));

  const handleAddStock = async () => {
    if (actionQty <= 0) return;
    setProcessing(true);
    const newQty = availableCount + actionQty;
    await updateStockInseminationAction(stock.id, { stockAvailable: newQty });
    setStock({ ...stock, stockAvailable: newQty });
    setTransactions((prev) => [
      { date: new Date().toISOString().split('T')[0], type: 'Stock Addition', qty: actionQty, balance: newQty, ref: `ADD-STOCK-${Math.floor(100+Math.random()*900)}`, user: 'Super Admin' },
      ...prev,
    ]);
    setProcessing(false);
    setActiveModal(null);
  };

  const handleSellStock = async () => {
    if (actionQty <= 0) return;
    if (actionQty > availableCount) {
      alert(`Insufficient available stock. Only ${availableCount} doses are available.`);
      return;
    }
    setProcessing(true);
    const newQty = availableCount - actionQty;
    const totalPrice = actionQty * stock.priceUsd;
    await updateStockInseminationAction(stock.id, { stockAvailable: newQty });
    setStock({ ...stock, stockAvailable: newQty });
    setTransactions((prev) => [
      { date: new Date().toISOString().split('T')[0], type: `Sold to ${buyerName || 'Buyer'}`, qty: -actionQty, balance: newQty, ref: `SALE-USD-${Math.floor(100+Math.random()*900)}`, user: 'Super Admin' },
      ...prev,
    ]);
    setSalesLedger((prev) => [
      { type: 'Sold', recipient: buyerName || 'Buyer Farm', qty: actionQty, priceUsd: totalPrice, date: new Date().toISOString().split('T')[0], ref: `INV-2026-${Math.floor(100+Math.random()*900)}`, status: 'Completed' },
      ...prev,
    ]);
    setProcessing(false);
    setActiveModal(null);
  };

  const handleTransferStock = async () => {
    if (actionQty <= 0) return;
    if (actionQty > availableCount) {
      alert(`Insufficient available stock. Only ${availableCount} doses are available.`);
      return;
    }
    setProcessing(true);
    const newQty = availableCount - actionQty;
    await updateStockInseminationAction(stock.id, { stockAvailable: newQty });
    setStock({ ...stock, stockAvailable: newQty });
    setTransactions((prev) => [
      { date: new Date().toISOString().split('T')[0], type: `Transferred to ${recipientName || 'Station'}`, qty: -actionQty, balance: newQty, ref: `TR-STATION-${Math.floor(100+Math.random()*900)}`, user: 'Super Admin' },
      ...prev,
    ]);
    setSalesLedger((prev) => [
      { type: 'Transferred', recipient: recipientName || 'Station B', qty: actionQty, priceUsd: 0, date: new Date().toISOString().split('T')[0], ref: `TR-2026-${Math.floor(100+Math.random()*900)}`, status: 'Completed' },
      ...prev,
    ]);
    setProcessing(false);
    setActiveModal(null);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Page Header */}
      <PageHeader
        title={`Stock Batch: ${stock.id}`}
        subtitle={`Sire Bull: ${sireName} (${sireBreed}) • Availability: ${availableCount} Straws`}
        breadcrumbs={[
          { label: 'Stock Insemination', href: '/stock-insemination' },
          { label: stock.id },
        ]}
        backHref="/stock-insemination"
        backLabel="Back to Stock Insemination"
      >
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setActionQty(50); setActiveModal('add'); }}
            className="inline-flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Straw Stock</span>
          </button>
          <Link
            href="/breeding-programs/new"
            className="inline-flex items-center gap-1.5 bg-[#dc5c15] hover:bg-orange-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-xs"
          >
            <Heart className="h-4 w-4" />
            <span>Use for Breeding</span>
          </Link>
        </div>
      </PageHeader>

      {/* 7-Tab Navigation Header */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="flex items-center gap-1 border-b border-slate-100 px-4 pt-3 overflow-x-auto scrollbar-none">
          <button
            onClick={() => handleTabChange('overview')}
            className={`pb-3 px-3 text-xs font-black tracking-wider uppercase border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <Info className="h-3.5 w-3.5" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => handleTabChange('stock')}
            className={`pb-3 px-3 text-xs font-black tracking-wider uppercase border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'stock'
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <Package className="h-3.5 w-3.5" />
            <span>Stock Information</span>
          </button>

          <button
            onClick={() => handleTabChange('sire')}
            className={`pb-3 px-3 text-xs font-black tracking-wider uppercase border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'sire'
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <Beef className="h-3.5 w-3.5" />
            <span>Sire Master</span>
          </button>

          <button
            onClick={() => handleTabChange('availability')}
            className={`pb-3 px-3 text-xs font-black tracking-wider uppercase border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'availability'
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <DollarSign className="h-3.5 w-3.5" />
            <span>Availability & Pricing</span>
          </button>

          <button
            onClick={() => handleTabChange('transactions')}
            className={`pb-3 px-3 text-xs font-black tracking-wider uppercase border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'transactions'
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <Activity className="h-3.5 w-3.5" />
            <span>Transactions ({transactions.length})</span>
          </button>

          <button
            onClick={() => handleTabChange('breeding')}
            className={`pb-3 px-3 text-xs font-black tracking-wider uppercase border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'breeding'
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <Heart className="h-3.5 w-3.5" />
            <span>Breeding Usage ({relatedPrograms.length})</span>
          </button>

          <button
            onClick={() => handleTabChange('related')}
            className={`pb-3 px-3 text-xs font-black tracking-wider uppercase border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'related'
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Related Records</span>
          </button>
        </div>

        {/* Tab Body Contents */}
        <div className="p-6">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Quick Summary Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Left Column: Sire Image Avatar */}
                <div className="md:col-span-4 bg-slate-50 rounded-2xl p-4 border border-slate-200 flex flex-col items-center justify-center text-center space-y-3">
                  <StandardAnimalImage
                    src={sire?.imageUrl || stock.sireImageUrl}
                    alt={sireName}
                    animalType="sire"
                    size="xl"
                  />
                  <div>
                    <span className="text-[10px] font-black text-[#dc5c15] uppercase tracking-wider block">BIOLOGICAL SIRE BULL</span>
                    <h3 className="text-base font-black text-slate-900 mt-0.5">{sireName}</h3>
                    <p className="text-xs font-bold text-slate-500">{sireBreed}</p>
                    {sire && (
                      <Link
                        href={`/sires/${sire.id}`}
                        className="inline-flex items-center gap-1 text-xs font-extrabold text-[#dc5c15] hover:underline mt-2"
                      >
                        <span>View Sire Pedigree Master</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    )}
                  </div>
                </div>

                {/* Right Column: Stock Summary & Pricing */}
                <div className="md:col-span-8 space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">STOCK ID</span>
                      <p className="text-sm font-mono font-black text-purple-700 mt-0.5">{stock.id}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">STATUS</span>
                      <span className="inline-block bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase mt-1">
                        ● Available
                      </span>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">UNIT STRAW PRICE</span>
                      <p className="text-sm font-black text-emerald-600 mt-0.5">${stock.priceUsd}.00 USD</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">FARM STATION</span>
                      <p className="text-xs font-black text-slate-800 mt-0.5">{stock.farmLocation || 'Ang Snoul Station'}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">SOURCING COMPANY</span>
                      <p className="text-xs font-black text-slate-800 mt-0.5">{sire?.sourcingCompany || 'ABS Global Cambodia'}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">REGISTERED OWNER</span>
                      <p className="text-xs font-black text-slate-800 mt-0.5">{stock.ownerName || 'Kaksedthan Livestock'}</p>
                    </div>
                  </div>

                  {/* Stock Quantity Progress Visualization Bar */}
                  <div className="p-5 bg-gradient-to-r from-purple-50 to-slate-50 rounded-2xl border border-purple-100 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-black text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                        <Package className="h-4 w-4 text-purple-600" /> Stock Availability Status
                      </span>
                      <span className="font-black text-purple-700">{availableCount} / {initialStock} Straws ({percentAvailable}%)</span>
                    </div>
                    <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-600 rounded-full transition-all duration-500" style={{ width: `${percentAvailable}%` }} />
                    </div>
                    <p className="text-[11px] font-semibold text-slate-500">
                      High quality frozen semen straw inventory stored under liquid nitrogen (-196°C).
                    </p>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: STOCK INFORMATION */}
          {activeTab === 'stock' && (
            <div className="space-y-4">
              <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <Package className="h-4 w-4 text-purple-600" />
                <span>Technical Stock Specifications & Inventory Records</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">STOCK REFERENCE CODE</span>
                  <p className="font-mono font-black text-purple-700 mt-1">{stock.id}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">PRODUCT TYPE</span>
                  <p className="font-black text-slate-800 mt-1">Frozen Semen Straw Batch</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">CANISTER TANK NO</span>
                  <p className="font-black text-slate-800 mt-1">CAN-TANK-04 (Station A)</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">STORAGE CONDITION</span>
                  <p className="font-black text-slate-800 mt-1">Liquid Nitrogen (-196°C)</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">COLLECTION DATE</span>
                  <p className="font-black text-slate-800 mt-1">2025-11-15</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">EXPIRY DATE / SHELF LIFE</span>
                  <p className="font-black text-emerald-700 mt-1">Indefinite (Under Cryo -196°C)</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SIRE MASTER */}
          {activeTab === 'sire' && (
            <div className="space-y-4">
              <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <Beef className="h-4 w-4 text-[#dc5c15]" />
                <span>Biological Sire Bull Master Profile</span>
              </h3>

              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200 flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <StandardAnimalImage
                  src={sire?.imageUrl || stock.sireImageUrl}
                  alt={sireName}
                  animalType="sire"
                  size="xl"
                />
                <div className="flex-1 space-y-2 text-center sm:text-left">
                  <span className="text-[10px] font-black text-[#dc5c15] uppercase tracking-wider">SIRE ID: {stock.sireId}</span>
                  <h4 className="text-xl font-black text-slate-900">{sireName}</h4>
                  <p className="text-xs font-bold text-[#dc5c15]">{sireBreed}</p>

                  <div className="pt-2 grid grid-cols-2 gap-3 text-xs border-t border-slate-200/80">
                    <div>
                      <span className="text-[9px] font-black text-slate-400 uppercase block">Genetic Purity</span>
                      <span className="font-black text-slate-800">{sire?.bloodline || '100% Purebred Brahman'}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-black text-slate-400 uppercase block">Sourcing Company</span>
                      <span className="font-black text-slate-800">{sire?.sourcingCompany || 'ABS Global Cambodia'}</span>
                    </div>
                    {sire?.dob && (
                      <div className="col-span-2">
                        <span className="text-[9px] font-black text-slate-400 uppercase block">Date of Birth</span>
                        <span className="font-black text-slate-800">{String(sire.dob).substring(0, 10)}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-3">
                    <Link
                      href={`/sires/${stock.sireId}`}
                      className="inline-flex items-center gap-2 bg-[#dc5c15] hover:bg-orange-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-xs"
                    >
                      <Beef className="h-4 w-4" />
                      <span>View Sire Pedigree & Master Record</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: AVAILABILITY & PRICING */}
          {activeTab === 'availability' && (
            <div className="space-y-6">
              <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-emerald-600" />
                <span>Stock Quantity Visualization & Commercial Valuation</span>
              </h3>

              {/* Quantity Breakdown Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className="p-4 bg-purple-900 text-white rounded-2xl space-y-1">
                  <span className="text-[9px] font-black uppercase text-purple-200 block">AVAILABLE</span>
                  <p className="text-2xl font-black">{availableCount} Straws</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-[9px] font-black uppercase text-slate-400 block">RESERVED</span>
                  <p className="text-xl font-black text-slate-800">{reservedCount} Straws</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-[9px] font-black uppercase text-slate-400 block">USED IN BREEDING</span>
                  <p className="text-xl font-black text-purple-700">{usedCount} Straws</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-[9px] font-black uppercase text-slate-400 block">TOTAL IMPORT</span>
                  <p className="text-xl font-black text-slate-800">{initialStock} Straws</p>
                </div>
              </div>

              {/* Commercial Valuation Card */}
              <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-black text-emerald-800 uppercase tracking-wider block">COMMERCIAL VALUATION</span>
                  <p className="text-2xl font-black text-emerald-900">${stock.priceUsd}.00 USD / Straw</p>
                  <p className="text-xs font-bold text-slate-600 mt-0.5">Equivalent: {(stock.priceUsd * 4000).toLocaleString()} KHR</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black text-emerald-800 uppercase tracking-wider block">TOTAL STOCK VALUATION</span>
                  <p className="text-2xl font-black text-emerald-900">${(availableCount * stock.priceUsd).toLocaleString()}.00 USD</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: TRANSACTIONS LEDGER */}
          {activeTab === 'transactions' && (
            <div className="space-y-4">
              <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <Activity className="h-4 w-4 text-purple-600" />
                <span>Stock Movement & Inventory Audit Trail</span>
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-black tracking-wider">
                    <tr>
                      <th className="p-3">Date</th>
                      <th className="p-3">Transaction Type</th>
                      <th className="p-3">Quantity</th>
                      <th className="p-3">Balance</th>
                      <th className="p-3">Reference</th>
                      <th className="p-3">User</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {transactions.map((tx, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-3 font-semibold text-slate-600">{tx.date}</td>
                        <td className="p-3 font-bold text-slate-900">{tx.type}</td>
                        <td className={`p-3 font-black ${tx.qty > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {tx.qty > 0 ? `+${tx.qty}` : tx.qty} Straws
                        </td>
                        <td className="p-3 font-bold text-slate-900">{tx.balance} Straws</td>
                        <td className="p-3 font-mono text-purple-700 font-bold">{tx.ref}</td>
                        <td className="p-3 font-semibold text-slate-500">{tx.user}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: BREEDING USAGE */}
          {activeTab === 'breeding' && (
            <div className="space-y-4">
              <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <Heart className="h-4 w-4 text-[#dc5c15]" />
                <span>AI Breeding Programs Using This Semen Batch</span>
              </h3>
              {relatedPrograms.length === 0 ? (
                <div className="p-8 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                  <p className="text-xs font-bold text-slate-600">No breeding programs have used semen straws from this batch yet.</p>
                  <Link
                    href="/breeding-programs/new"
                    className="inline-flex items-center gap-2 bg-[#dc5c15] text-white text-xs font-bold px-4 py-2 rounded-xl mt-3"
                  >
                    <Heart className="h-4 w-4" />
                    <span>Launch AI Breeding Program</span>
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-black tracking-wider">
                      <tr>
                        <th className="p-3">Program No</th>
                        <th className="p-3">Dam Cow</th>
                        <th className="p-3">Breeding Date</th>
                        <th className="p-3">Quantity Used</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {relatedPrograms.map((bp) => (
                        <tr key={bp.id} className="hover:bg-slate-50">
                          <td className="p-3 font-bold text-slate-900">
                            <Link href={`/breeding-programs/${bp.id}`} className="text-purple-700 hover:underline">
                              {bp.programNumber}
                            </Link>
                          </td>
                          <td className="p-3">
                            <Link href={`/dams/${bp.damId}`} className="font-bold text-slate-800 hover:underline">
                              {bp.damName || bp.damId}
                            </Link>
                          </td>
                          <td className="p-3 font-semibold text-slate-600">{bp.breedingDate || '2026-01-15'}</td>
                          <td className="p-3 font-black text-purple-900">1 Straw</td>
                          <td className="p-3">
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                              {bp.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 7: RELATED RECORDS */}
          {activeTab === 'related' && (
            <div className="space-y-4">
              <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <Layers className="h-4 w-4 text-purple-600" />
                <span>Connected Herdbook Master Entities</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Link
                  href={`/sires/${stock.sireId}`}
                  className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-purple-300 transition-all shadow-2xs group"
                >
                  <span className="text-[10px] font-black text-[#dc5c15] uppercase tracking-wider block">BIOLOGICAL SIRE BULL</span>
                  <h4 className="text-base font-black text-slate-900 group-hover:text-purple-700 mt-1">{sireName}</h4>
                  <p className="text-xs font-bold text-slate-500">Sire ID: {stock.sireId}</p>
                </Link>

                <Link
                  href="/breeding-programs"
                  className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-purple-300 transition-all shadow-2xs group"
                >
                  <span className="text-[10px] font-black text-purple-600 uppercase tracking-wider block">BREEDING PROGRAMS</span>
                  <h4 className="text-base font-black text-slate-900 group-hover:text-purple-700 mt-1">{relatedPrograms.length} Programs Executed</h4>
                  <p className="text-xs font-bold text-slate-500">View Active Programs</p>
                </Link>

                <Link
                  href="/farms"
                  className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-purple-300 transition-all shadow-2xs group"
                >
                  <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wider block">FARM STATION</span>
                  <h4 className="text-base font-black text-slate-900 group-hover:text-purple-700 mt-1">{stock.farmLocation || 'Ang Snoul Station'}</h4>
                  <p className="text-xs font-bold text-slate-500">View Station Location</p>
                </Link>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Interactive Modals for Stock Actions */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-black text-slate-900 capitalize border-b pb-2">
              {activeModal === 'add' && 'Add Semen Stock (+ Straws)'}
              {activeModal === 'sell' && 'Sell Semen Stock ($USD Receipt)'}
              {activeModal === 'transfer' && 'Transfer Semen Stock'}
            </h3>

            {activeModal === 'sell' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Buyer / Farm Name</label>
                <input
                  type="text"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  placeholder="e.g. Prek Anchanh Farm"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                />
              </div>
            )}

            {activeModal === 'transfer' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Recipient Station / Breeder</label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="e.g. Ang Snoul Station B"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Quantity (Straws)</label>
              <input
                type="number"
                value={actionQty}
                onChange={(e) => setActionQty(parseInt(e.target.value, 10) || 0)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-black text-purple-900"
              />
            </div>

            {activeModal === 'sell' && (
              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-xs text-emerald-900 font-bold flex justify-between">
                <span>Total Sale Price ($USD):</span>
                <span className="font-black">${actionQty * stock.priceUsd}.00 USD</span>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold border text-slate-600 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (activeModal === 'add') handleAddStock();
                  if (activeModal === 'sell') handleSellStock();
                  if (activeModal === 'transfer') handleTransferStock();
                }}
                disabled={processing}
                className="px-5 py-2 rounded-xl text-xs font-black text-white bg-purple-600 hover:bg-purple-700 cursor-pointer"
              >
                {processing ? 'Processing...' : 'Confirm Action'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
