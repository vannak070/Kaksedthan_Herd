'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import PageHeader from '@/components/common/PageHeader';
import StandardAnimalImage from '@/components/common/StandardAnimalImage';
import { StockInseminationItem, SireItem, BreedingProgramItem } from '@/types/breeding.types';
import {
  fetchStockInseminationAction,
  fetchSiresAction,
  updateStockInseminationAction,
  deleteStockInseminationAction,
  fetchBreedingProgramsAction,
  fetchStockTransactionsAction,
  createStockTransactionAction,
  fetchBreedersAction,
  fetchFarmsAction,
  fetchCustomersAction,
  fetchSourcingCompaniesAction
} from '@/app/actions';
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
  AlertCircle,
  Edit,
  Trash2
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
  const [breeders, setBreeders] = useState<Array<{ id: string; name: string; email?: string; phone?: string; station?: string }>>([]);
  const [farmsList, setFarmsList] = useState<Array<{ id: string; name: string; code?: string; address?: string; location?: string }>>([]);
  const [customersList, setCustomersList] = useState<Array<{ id: string; name: string; phone?: string }>>([]);
  const [sourcingCompaniesList, setSourcingCompaniesList] = useState<Array<{ id: string; name: string; country?: string }>>([]);
  const [loading, setLoading] = useState(true);

  // Tab State with URL query param support: overview | stock | sire | availability | transactions | breeding | related
  const initialTab = (searchParams.get('tab') as TabKey) || 'overview';
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);

  // Interactive Action Modals: 'add' | 'sell' | 'transfer_breeder' | 'breeder_stock_out' | 'edit_batch'
  const [activeModal, setActiveModal] = useState<'add' | 'sell' | 'transfer_breeder' | 'breeder_stock_out' | 'edit_batch' | null>(null);
  const [actionQty, setActionQty] = useState<number>(50);
  const [buyerName, setBuyerName] = useState<string>('');
  const [selectedBreederId, setSelectedBreederId] = useState<string>('');
  const [selectedBreederName, setSelectedBreederName] = useState<string>('');
  const [stockOutReason, setStockOutReason] = useState<string>('Field AI Insemination Service');
  const [processing, setProcessing] = useState<boolean>(false);

  // Editable Form States for CRUD Update Operation
  const [editPriceUsd, setEditPriceUsd] = useState<number>(10);
  const [editFarmLocation, setEditFarmLocation] = useState<string>('');
  const [editOwnerName, setEditOwnerName] = useState<string>('');
  const [editBreederName, setEditBreederName] = useState<string>('');
  const [editTankNumber, setEditTankNumber] = useState<string>('');
  const [editCollectionDate, setEditCollectionDate] = useState<string>('');
  const [editNotes, setEditNotes] = useState<string>('');
  const [editAvailability, setEditAvailability] = useState<'Available' | 'Out of Stock' | 'Reserved' | 'Discontinued'>('Available');

  // Audit Transactions Ledger loaded 100% dynamically from PostgreSQL database
  const [transactions, setTransactions] = useState<Array<{ id?: string; date: string; type: string; qty: number; balance: number; ref: string; recipient?: string; priceUsd?: number; user: string }>>([]);

  const loadTransactions = async (stockId: string) => {
    const res = await fetchStockTransactionsAction(stockId);
    if (res.success && res.data) {
      setTransactions(res.data);
    }
  };

  useEffect(() => {
    Promise.all([
      fetchStockInseminationAction(),
      fetchSiresAction(),
      fetchBreedingProgramsAction(),
      fetchBreedersAction(),
      fetchFarmsAction(),
      fetchCustomersAction(),
      fetchSourcingCompaniesAction(),
    ]).then(([stList, siresList, bpList, breedersData, farmsRes, customersRes, companiesRes]) => {
      if (Array.isArray(breedersData)) {
        setBreeders(breedersData);
        if (breedersData.length > 0) {
          setSelectedBreederId(breedersData[0].id);
          setSelectedBreederName(breedersData[0].name);
        }
      }
      if (farmsRes && farmsRes.success && Array.isArray(farmsRes.data)) {
        setFarmsList(farmsRes.data);
      }
      if (customersRes && customersRes.success && Array.isArray(customersRes.data)) {
        setCustomersList(customersRes.data);
      }
      if (companiesRes && companiesRes.success && Array.isArray(companiesRes.data)) {
        setSourcingCompaniesList(companiesRes.data);
      }

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
        loadTransactions(found.id);
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
  const sireBreed = sire?.breed || stock.sireBreed || 'N/A';
  const availableCount = stock.stockAvailable;
  
  // ── CRUD EDIT / DELETE HANDLERS ──────────────────────────────────────
  const openEditModal = () => {
    if (!stock) return;
    setEditPriceUsd(stock.priceUsd);
    setEditFarmLocation(stock.farmLocation || (farmsList.length > 0 ? farmsList[0].name : 'Ang Snoul Station'));
    setEditOwnerName(stock.ownerName || (customersList.length > 0 ? customersList[0].name : 'Kaksedthan Livestock Farm'));
    setEditBreederName(stock.breederName || (breeders.length > 0 ? breeders[0].name : 'Super Admin (CCEC)'));
    setEditTankNumber(stock.tankNumber || 'CAN-TANK-01');
    setEditCollectionDate(stock.collectionDate || '');
    setEditNotes(stock.notes || '');
    setEditAvailability(stock.availability || 'Available');
    setActiveModal('edit_batch');
  };

  const handleSaveEditBatch = async () => {
    if (!stock) return;
    setProcessing(true);
    const updates = {
      priceUsd: editPriceUsd,
      priceKhr: editPriceUsd * 4000,
      farmLocation: editFarmLocation,
      ownerName: editOwnerName,
      breederName: editBreederName,
      tankNumber: editTankNumber,
      collectionDate: editCollectionDate || undefined,
      notes: editNotes,
      availability: editAvailability,
    };
    await updateStockInseminationAction(stock.id, updates);
    setStock({ ...stock, ...updates });
    setProcessing(false);
    setActiveModal(null);
  };

  const handleDeleteBatch = async () => {
    if (!stock) return;
    if (confirm(`Are you sure you want to delete stock batch ${stock.id}? This will remove the record permanently from the database.`)) {
      setProcessing(true);
      await deleteStockInseminationAction(stock.id);
      router.push('/stock-insemination');
    }
  };

  // ── ACTION HANDLERS FOR STOCK MOVEMENTS ──────────────────────────────
  const handleAddStock = async () => {
    if (actionQty <= 0) return;
    setProcessing(true);
    const newQty = availableCount + actionQty;
    await createStockTransactionAction({
      stockInseminationId: stock.id,
      transactionType: 'Inbound Restock',
      quantity: actionQty,
      balance: newQty,
      reference: `RESTOCK-${Math.floor(1000 + Math.random() * 9000)}`,
      userName: 'Super Admin',
    });
    setStock({ ...stock, stockAvailable: newQty });
    await loadTransactions(stock.id);
    setProcessing(false);
    setActiveModal(null);
  };

  const handleSellStock = async () => {
    if (actionQty <= 0) return;
    if (actionQty > availableCount) {
      alert(`Insufficient available stock. Only ${availableCount} straws are available.`);
      return;
    }
    setProcessing(true);
    const newQty = availableCount - actionQty;
    const totalPrice = actionQty * stock.priceUsd;
    await createStockTransactionAction({
      stockInseminationId: stock.id,
      transactionType: `Commercial Sale to ${buyerName || 'Buyer Farm'}`,
      quantity: -actionQty,
      balance: newQty,
      reference: `SALE-USD-${Math.floor(1000 + Math.random() * 9000)}`,
      recipient: buyerName || 'Buyer Farm',
      priceUsd: totalPrice,
      userName: 'Super Admin',
    });
    setStock({ ...stock, stockAvailable: newQty });
    await loadTransactions(stock.id);
    setProcessing(false);
    setActiveModal(null);
  };

  const handleStockTransferToBreeder = async () => {
    if (actionQty <= 0) return;
    if (actionQty > availableCount) {
      alert(`Insufficient available stock. Only ${availableCount} straws are available in inventory.`);
      return;
    }
    setProcessing(true);
    const newQty = availableCount - actionQty;
    const bName = selectedBreederName || (breeders.find(b => b.id === selectedBreederId)?.name) || 'Breeder Specialist';
    const recipient = `${bName} (${selectedBreederId || 'BRD'})`;

    await createStockTransactionAction({
      stockInseminationId: stock.id,
      transactionType: `Stock Transfer to Breeder`,
      quantity: -actionQty,
      balance: newQty,
      reference: `TR-BREEDER-${Math.floor(1000 + Math.random() * 9000)}`,
      recipient: recipient,
      priceUsd: 0,
      userName: 'Super Admin',
    });

    setStock({ ...stock, stockAvailable: newQty });
    await loadTransactions(stock.id);
    setProcessing(false);
    setActiveModal(null);
  };

  const handleBreederStockOut = async () => {
    if (actionQty <= 0) return;
    if (actionQty > availableCount) {
      alert(`Insufficient available stock. Only ${availableCount} straws are available.`);
      return;
    }
    setProcessing(true);
    const newQty = availableCount - actionQty;
    const bName = selectedBreederName || (breeders.find(b => b.id === selectedBreederId)?.name) || 'Breeder Specialist';
    const recipient = `${bName} (${selectedBreederId || 'BRD'}) • Reason: ${stockOutReason}`;

    await createStockTransactionAction({
      stockInseminationId: stock.id,
      transactionType: `Breeder Stock-Out`,
      quantity: -actionQty,
      balance: newQty,
      reference: `OUT-BREEDER-${Math.floor(1000 + Math.random() * 9000)}`,
      recipient: recipient,
      priceUsd: 0,
      userName: bName,
    });

    setStock({ ...stock, stockAvailable: newQty });
    await loadTransactions(stock.id);
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
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => openEditModal()}
            className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <Edit className="h-4 w-4" />
            <span>Edit Stock Record</span>
          </button>

          <button
            onClick={() => { setActionQty(50); setActiveModal('add'); }}
            className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>+ Restock Inbound</span>
          </button>

          <button
            onClick={() => { setActionQty(10); setActiveModal('transfer_breeder'); }}
            className="inline-flex items-center gap-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <Send className="h-4 w-4" />
            <span>⇄ Transfer to Breeder</span>
          </button>

          <button
            onClick={() => { setActionQty(5); setActiveModal('breeder_stock_out'); }}
            className="inline-flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <Package className="h-4 w-4" />
            <span>⤓ Breeder Stock-Out</span>
          </button>

          <button
            onClick={() => { setActionQty(10); setActiveModal('sell'); }}
            className="inline-flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <ShoppingCart className="h-4 w-4" />
            <span>🛒 Commercial Sale</span>
          </button>

          <button
            onClick={() => handleDeleteBatch()}
            className="inline-flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
            title="Delete Stock Record"
          >
            <Trash2 className="h-4 w-4 text-rose-600" />
            <span>Delete</span>
          </button>
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
              
              {/* Section Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Info className="h-4.5 w-4.5 text-purple-600" />
                  <div>
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      Biological Profile & Setup Architecture Overview
                    </h3>
                    <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                      Loaded live from PostgreSQL database tables (`stock_insemination`, `sires`, `farms`, `customers`, `sourcing_companies`).
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => openEditModal()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-2xs transition-colors cursor-pointer"
                >
                  <Edit className="h-3.5 w-3.5 text-purple-300" />
                  <span>Edit Setup Architecture</span>
                </button>
              </div>

              {/* 2-Column Architectural Layout */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Column 1: BIOLOGICAL SIRE PROFILE ARCHITECTURE */}
                <div className="md:col-span-5 bg-gradient-to-br from-slate-50 to-orange-50/30 rounded-3xl p-5 border border-slate-200/90 space-y-4 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-slate-200/60 pb-2.5">
                    <span className="text-[10px] font-black text-[#dc5c15] uppercase tracking-wider flex items-center gap-1.5">
                      <Beef className="h-3.5 w-3.5 text-[#dc5c15]" /> Biological Sire Profile
                    </span>
                    <span className="text-[10px] font-mono font-bold text-slate-400">SIRE ID: {stock.sireId}</span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                    <StandardAnimalImage
                      src={sire?.imageUrl || stock.sireImageUrl}
                      alt={sireName}
                      animalType="sire"
                      size="xl"
                    />
                    <div className="flex-1 text-center sm:text-left space-y-1">
                      <h3 className="text-lg font-black text-slate-900">{sireName}</h3>
                      <p className="text-xs font-extrabold text-[#dc5c15]">{sireBreed}</p>
                      
                      <div className="pt-2 text-xs space-y-1 text-slate-600 font-medium">
                        <p><span className="font-bold text-slate-400 text-[10px] uppercase block">Bloodline Purity:</span> <span className="font-black text-slate-800">{sire?.bloodline || '100% Purebred Brahman'}</span></p>
                        <p><span className="font-bold text-slate-400 text-[10px] uppercase block">Sourcing Company:</span> <span className="font-black text-slate-800">{sire?.sourcingCompany || 'ABS Global Cambodia'}</span></p>
                        {sire?.dob && (
                          <p><span className="font-bold text-slate-400 text-[10px] uppercase block">Date of Birth:</span> <span className="font-bold text-slate-700">{String(sire.dob).substring(0, 10)}</span></p>
                        )}
                      </div>

                      {sire && (
                        <div className="pt-3">
                          <Link
                            href={`/sires/${sire.id}`}
                            className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#dc5c15] hover:underline"
                          >
                            <span>View Sire Pedigree Master</span>
                            <ChevronRight className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Column 2: SETUP ARCHITECTURE & INVENTORY MASTER */}
                <div className="md:col-span-7 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-purple-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Building className="h-3.5 w-3.5 text-purple-600" /> Setup Architecture & Inventory Master
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 text-xs">
                    
                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">STOCK ID</span>
                      <p className="text-sm font-mono font-black text-purple-700 mt-0.5">{stock.id}</p>
                    </div>

                    <div
                      onClick={() => openEditModal()}
                      className="p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200/80 hover:border-purple-300 transition-all cursor-pointer group"
                      title="Click to edit status in PostgreSQL"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">STATUS</span>
                        <Edit className="h-3 w-3 text-slate-300 group-hover:text-purple-600 transition-colors" />
                      </div>
                      <span className={`inline-block text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase mt-1 ${
                        stock.availability === 'Available' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        ● {stock.availability || 'Available'}
                      </span>
                    </div>

                    <div
                      onClick={() => openEditModal()}
                      className="p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200/80 hover:border-purple-300 transition-all cursor-pointer group"
                      title="Click to edit unit price in PostgreSQL"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">UNIT STRAW PRICE</span>
                        <Edit className="h-3 w-3 text-slate-300 group-hover:text-purple-600 transition-colors" />
                      </div>
                      <p className="text-sm font-black text-emerald-600 mt-0.5">${stock.priceUsd}.00 USD</p>
                      <p className="text-[9px] font-bold text-slate-400 mt-0.5">{(stock.priceUsd * 4000).toLocaleString()} ៛</p>
                    </div>

                    <div
                      onClick={() => openEditModal()}
                      className="p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200/80 hover:border-purple-300 transition-all cursor-pointer group"
                      title="Click to select Farm Station from PostgreSQL farms table"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">FARM STATION</span>
                        <Edit className="h-3 w-3 text-slate-300 group-hover:text-purple-600 transition-colors" />
                      </div>
                      <p className="text-xs font-black text-slate-800 mt-0.5">{stock.farmLocation || 'Ang Snoul Station'}</p>
                    </div>

                    <div
                      onClick={() => openEditModal()}
                      className="p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200/80 hover:border-purple-300 transition-all cursor-pointer group"
                      title="Click to select Sourcing Company from PostgreSQL"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">SOURCING COMPANY</span>
                        <Edit className="h-3 w-3 text-slate-300 group-hover:text-purple-600 transition-colors" />
                      </div>
                      <p className="text-xs font-black text-slate-800 mt-0.5">{sire?.sourcingCompany || 'ABS Global Cambodia'}</p>
                    </div>

                    <div
                      onClick={() => openEditModal()}
                      className="p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200/80 hover:border-purple-300 transition-all cursor-pointer group"
                      title="Click to select Registered Owner from PostgreSQL customers table"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">REGISTERED OWNER</span>
                        <Edit className="h-3 w-3 text-slate-300 group-hover:text-purple-600 transition-colors" />
                      </div>
                      <p className="text-xs font-black text-slate-800 mt-0.5">{stock.ownerName || 'Kaksedthan Livestock Farm'}</p>
                    </div>

                  </div>

                  {/* Stock Quantity Progress Visualization Bar */}
                  {(() => {
                    const initVal = stock.initialQuantity || (transactions.length > 0 
                      ? (transactions.find(t => t.type.includes('Initial'))?.balance || Math.max(...transactions.map(t => t.balance), availableCount))
                      : Math.max(availableCount, 100));
                    const pctAvailable = Math.min(100, Math.max(0, Math.round((availableCount / initVal) * 100)));
                    return (
                      <div className="p-4 bg-gradient-to-r from-purple-50 to-slate-50 rounded-2xl border border-purple-100 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-black text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                            <Package className="h-4 w-4 text-purple-600" /> Cryo Stock Storage Inventory (-196°C)
                          </span>
                          <span className="font-black text-purple-700">{availableCount} / {initVal} Straws ({pctAvailable}%)</span>
                        </div>
                        <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-purple-600 rounded-full transition-all duration-500" style={{ width: `${pctAvailable}%` }} />
                        </div>
                        <p className="text-[11px] font-semibold text-slate-500">
                          Stored under liquid nitrogen. Tank: <span className="font-bold text-slate-800">{stock.tankNumber || 'CAN-TANK-01'}</span> • Collection: <span className="font-bold text-slate-800">{stock.collectionDate || '2025-11-15'}</span>
                        </p>
                      </div>
                    );
                  })()}
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: STOCK INFORMATION */}
          {activeTab === 'stock' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Package className="h-4 w-4 text-purple-600" />
                  <span>Technical Stock Specifications & Inventory Records</span>
                </h3>
                <button
                  onClick={() => openEditModal()}
                  className="inline-flex items-center gap-1 text-xs font-extrabold text-purple-700 hover:underline cursor-pointer"
                >
                  <Edit className="h-3.5 w-3.5" />
                  <span>Edit Details</span>
                </button>
              </div>

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
                  <p className="font-black text-slate-800 mt-1">{stock.tankNumber || 'CAN-TANK-01'}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">STORAGE CONDITION</span>
                  <p className="font-black text-slate-800 mt-1">Liquid Nitrogen (-196°C)</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">COLLECTION DATE</span>
                  <p className="font-black text-slate-800 mt-1">{stock.collectionDate || '2025-11-15'}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">EXPIRY DATE / SHELF LIFE</span>
                  <p className="font-black text-emerald-700 mt-1">Indefinite (Under Cryo -196°C)</p>
                </div>
              </div>

              {stock.notes && (
                <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100 text-xs">
                  <span className="text-[10px] font-black text-purple-700 uppercase tracking-wider block">BATCH NOTES</span>
                  <p className="font-semibold text-slate-700 mt-1">{stock.notes}</p>
                </div>
              )}
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
              {(() => {
                const initialStockVal = stock.initialQuantity || (transactions.length > 0 
                  ? (transactions.find(t => t.type.includes('Initial'))?.balance || Math.max(...transactions.map(t => t.balance), availableCount))
                  : availableCount);

                const reservedCountVal = transactions
                  .filter(t => t.type.toLowerCase().includes('reserve'))
                  .reduce((acc, t) => acc + Math.abs(t.qty), 0);

                const usedCountVal = relatedPrograms.length > 0 
                  ? relatedPrograms.length * 10 
                  : transactions.filter(t => t.type.toLowerCase().includes('breeding') || t.type.toLowerCase().includes('used')).reduce((acc, t) => acc + Math.abs(t.qty), 0);

                return (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    <div className="p-4 bg-purple-900 text-white rounded-2xl space-y-1">
                      <span className="text-[9px] font-black uppercase text-purple-200 block">AVAILABLE</span>
                      <p className="text-2xl font-black">{availableCount} Straws</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                      <span className="text-[9px] font-black uppercase text-slate-400 block">RESERVED</span>
                      <p className="text-xl font-black text-slate-800">{reservedCountVal} Straws</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                      <span className="text-[9px] font-black uppercase text-slate-400 block">USED IN BREEDING</span>
                      <p className="text-xl font-black text-purple-700">{usedCountVal} Straws</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                      <span className="text-[9px] font-black uppercase text-slate-400 block">TOTAL IMPORT</span>
                      <p className="text-xl font-black text-slate-800">{initialStockVal} Straws</p>
                    </div>
                  </div>
                );
              })()}

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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Activity className="h-4.5 w-4.5 text-purple-600" />
                  <div>
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      Stock Transactions & Movement Ledger ({transactions.length} Records)
                    </h3>
                    <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                      Recorded in PostgreSQL: Inbound Restocks, Stock Transfers to Breeders, Breeder Stock-Outs & AI Breeding Program Usages.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => { setActionQty(10); setActiveModal('transfer_breeder'); }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-sky-600 text-white text-xs font-bold rounded-xl shadow-2xs hover:bg-sky-700 transition-colors cursor-pointer"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Transfer to Breeder</span>
                  </button>
                  <button
                    onClick={() => { setActionQty(5); setActiveModal('breeder_stock_out'); }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-600 text-white text-xs font-bold rounded-xl shadow-2xs hover:bg-amber-700 transition-colors cursor-pointer"
                  >
                    <Package className="h-3.5 w-3.5" />
                    <span>Breeder Stock-Out</span>
                  </button>
                </div>
              </div>

              {transactions.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs text-slate-500">
                  No stock transactions recorded yet for this batch.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-black tracking-wider">
                      <tr>
                        <th className="p-3.5">Date & Time</th>
                        <th className="p-3.5">Transaction Type</th>
                        <th className="p-3.5 text-right">Quantity</th>
                        <th className="p-3.5 text-right">Balance</th>
                        <th className="p-3.5">Reference / Program #</th>
                        <th className="p-3.5">Recipient / Breeder / Purpose</th>
                        <th className="p-3.5">Recorded By</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {transactions.map((tx, idx) => {
                        const isBreedingProg = tx.type.includes('Breeding Program');
                        const isTransfer = tx.type.includes('Transfer');
                        const isStockOut = tx.type.includes('Stock-Out') || tx.type.includes('Out');
                        const isRestock = tx.type.includes('Addition') || tx.type.includes('Import') || tx.type.includes('Inbound');
                        const isSale = tx.type.includes('Sold') || tx.type.includes('Sale');

                        return (
                          <tr key={tx.id || idx} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-3.5 font-mono text-[11px] font-bold text-slate-600 whitespace-nowrap">
                              {tx.date}
                            </td>
                            
                            <td className="p-3.5">
                              {isBreedingProg ? (
                                <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-900 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                                  <Heart className="h-3 w-3 text-purple-700" />
                                  <span>Breeding Program Application</span>
                                </span>
                              ) : isTransfer ? (
                                <span className="inline-flex items-center gap-1 bg-sky-100 text-sky-900 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                                  <Send className="h-3 w-3 text-sky-700" />
                                  <span>{tx.type}</span>
                                </span>
                              ) : isStockOut ? (
                                <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                                  <Package className="h-3 w-3 text-amber-700" />
                                  <span>{tx.type}</span>
                                </span>
                              ) : isRestock ? (
                                <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-900 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                                  <Plus className="h-3 w-3 text-emerald-700" />
                                  <span>{tx.type}</span>
                                </span>
                              ) : isSale ? (
                                <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-900 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                                  <ShoppingCart className="h-3 w-3 text-emerald-700" />
                                  <span>{tx.type}</span>
                                </span>
                              ) : (
                                <span className="bg-slate-100 text-slate-800 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                                  {tx.type}
                                </span>
                              )}
                            </td>

                            <td className={`p-3.5 text-right font-black text-xs ${tx.qty > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {tx.qty > 0 ? `+${tx.qty}` : tx.qty} Straws
                            </td>

                            <td className="p-3.5 text-right font-black text-slate-900">
                              {tx.balance} Straws
                            </td>

                            <td className="p-3.5 font-mono text-[11px] font-bold text-purple-700">
                              {tx.ref.startsWith('BP-') ? (
                                <Link href={`/breeding-programs/${tx.ref}`} className="hover:underline flex items-center gap-1 text-purple-700">
                                  <span>{tx.ref}</span>
                                  <ExternalLink className="h-3 w-3" />
                                </Link>
                              ) : (
                                <span>{tx.ref}</span>
                              )}
                            </td>

                            <td className="p-3.5 font-semibold text-slate-800">
                              {tx.recipient || 'Central Inventory'}
                            </td>

                            <td className="p-3.5 font-semibold text-slate-500">
                              {tx.user}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
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
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                {activeModal === 'edit_batch' && <><Edit className="h-4 w-4 text-slate-800" /> Edit Setup Architecture & Master Details</>}
                {activeModal === 'add' && <><Plus className="h-4 w-4 text-emerald-600" /> Restock Semen Straws (+)</>}
                {activeModal === 'sell' && <><ShoppingCart className="h-4 w-4 text-purple-600" /> Commercial Sale Invoice</>}
                {activeModal === 'transfer_breeder' && <><Send className="h-4 w-4 text-sky-600" /> Stock Transfer to Breeder Specialist</>}
                {activeModal === 'breeder_stock_out' && <><Package className="h-4 w-4 text-amber-600" /> Breeder Stock-Out (Dispense)</>}
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal 0: Edit Setup Architecture & Master Details (CRUD UPDATE) */}
            {activeModal === 'edit_batch' && (
              <div className="space-y-3.5 max-h-[70vh] overflow-y-auto pr-1 text-xs">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Unit Straw Price ($USD)</label>
                  <input
                    type="number"
                    min={0}
                    value={editPriceUsd}
                    onChange={(e) => setEditPriceUsd(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-emerald-800"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">Equivalent KHR: ${(editPriceUsd * 4000).toLocaleString()} ៛</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Select Farm Station (PostgreSQL Setup Architecture) <span className="text-rose-500">*</span>
                  </label>
                  {farmsList.length > 0 ? (
                    <select
                      value={editFarmLocation}
                      onChange={(e) => setEditFarmLocation(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-purple-600 focus:outline-none"
                    >
                      {farmsList.map((f) => (
                        <option key={f.id} value={f.name}>
                          {f.name} ({f.code || f.id} • {f.address || f.location || 'Station Location'})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={editFarmLocation}
                      onChange={(e) => setEditFarmLocation(e.target.value)}
                      placeholder="e.g. Ang Snoul Station"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Select Registered Owner (PostgreSQL Setup Architecture) <span className="text-rose-500">*</span>
                  </label>
                  {customersList.length > 0 ? (
                    <select
                      value={editOwnerName}
                      onChange={(e) => setEditOwnerName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-purple-600 focus:outline-none"
                    >
                      {customersList.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name} ({c.id} • {c.phone || 'Cow Owner / Farm'})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={editOwnerName}
                      onChange={(e) => setEditOwnerName(e.target.value)}
                      placeholder="e.g. Kaksedthan Livestock Farm"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Select Breeder Specialist <span className="text-rose-500">*</span>
                  </label>
                  {breeders.length > 0 ? (
                    <select
                      value={editBreederName}
                      onChange={(e) => setEditBreederName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-purple-600 focus:outline-none"
                    >
                      {breeders.map((b) => (
                        <option key={b.id} value={b.name}>
                          {b.name} ({b.id} • {b.station || 'Breeder Specialist'})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={editBreederName}
                      onChange={(e) => setEditBreederName(e.target.value)}
                      placeholder="e.g. Super Admin (CCEC)"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Canister Tank No</label>
                  <input
                    type="text"
                    value={editTankNumber}
                    onChange={(e) => setEditTankNumber(e.target.value)}
                    placeholder="e.g. CAN-TANK-01"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Collection Date</label>
                  <input
                    type="date"
                    value={editCollectionDate}
                    onChange={(e) => setEditCollectionDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Availability Status</label>
                  <select
                    value={editAvailability}
                    onChange={(e) => setEditAvailability(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold"
                  >
                    <option value="Available">Available</option>
                    <option value="Out of Stock">Out of Stock</option>
                    <option value="Reserved">Reserved</option>
                    <option value="Discontinued">Discontinued</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Batch Notes</label>
                  <textarea
                    rows={2}
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="Additional storage or origin details..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold"
                  />
                </div>
              </div>
            )}

            {/* Modal 1: Restock Inbound */}
            {activeModal === 'add' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Inbound Quantity (Straws)</label>
                  <input
                    type="number"
                    min={1}
                    value={actionQty}
                    onChange={(e) => setActionQty(parseInt(e.target.value, 10) || 0)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-black text-emerald-800"
                  />
                </div>
              </div>
            )}

            {/* Modal 2: Commercial Sale */}
            {activeModal === 'sell' && (
              <div className="space-y-3">
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
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Quantity (Straws)</label>
                  <input
                    type="number"
                    min={1}
                    max={availableCount}
                    value={actionQty}
                    onChange={(e) => setActionQty(parseInt(e.target.value, 10) || 0)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-black text-purple-900"
                  />
                </div>
                <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-xs text-emerald-900 font-bold flex justify-between">
                  <span>Total Sale Price ($USD):</span>
                  <span className="font-black">${actionQty * stock.priceUsd}.00 USD</span>
                </div>
              </div>
            )}

            {/* Modal 3: Transfer Stock to Breeder */}
            {activeModal === 'transfer_breeder' && (
              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Select Target Breeder Specialist <span className="text-rose-500">*</span>
                  </label>
                  {breeders.length > 0 ? (
                    <select
                      value={selectedBreederId}
                      onChange={e => {
                        const bId = e.target.value;
                        setSelectedBreederId(bId);
                        const b = breeders.find(br => br.id === bId);
                        if (b) setSelectedBreederName(b.name);
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-sky-600 focus:outline-none"
                    >
                      {breeders.map(b => (
                        <option key={b.id} value={b.id}>
                          {b.name} ({b.id} • {b.station || b.phone || 'Breeder Specialist'})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={selectedBreederName}
                      onChange={e => setSelectedBreederName(e.target.value)}
                      placeholder="Type Breeder Specialist Name..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Quantity to Transfer (Straws) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={availableCount}
                    value={actionQty}
                    onChange={e => setActionQty(parseInt(e.target.value, 10) || 0)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-black text-sky-900"
                  />
                  <p className="text-[10px] text-slate-400 font-semibold mt-1">Available in stock: {availableCount} Straws</p>
                </div>
              </div>
            )}

            {/* Modal 4: Breeder Stock-Out */}
            {activeModal === 'breeder_stock_out' && (
              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Breeder Specialist Performing Stock-Out <span className="text-rose-500">*</span>
                  </label>
                  {breeders.length > 0 ? (
                    <select
                      value={selectedBreederId}
                      onChange={e => {
                        const bId = e.target.value;
                        setSelectedBreederId(bId);
                        const b = breeders.find(br => br.id === bId);
                        if (b) setSelectedBreederName(b.name);
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-600 focus:outline-none"
                    >
                      {breeders.map(b => (
                        <option key={b.id} value={b.id}>
                          {b.name} ({b.id} • {b.station || b.phone || 'Breeder Specialist'})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={selectedBreederName}
                      onChange={e => setSelectedBreederName(e.target.value)}
                      placeholder="Type Breeder Specialist Name..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Stock-Out Purpose / Reason <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={stockOutReason}
                    onChange={e => setStockOutReason(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-600 focus:outline-none"
                  >
                    <option value="Field AI Insemination Service">Field AI Insemination Service</option>
                    <option value="Sample Quality Testing & Motility Check">Sample Quality Testing & Motility Check</option>
                    <option value="Direct Dam Insemination Dispatch">Direct Dam Insemination Dispatch</option>
                    <option value="Dam Breeding Emergency Service">Dam Breeding Emergency Service</option>
                    <option value="Tank Transport & Field Storage">Tank Transport & Field Storage</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Quantity to Stock-Out (Straws) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={availableCount}
                    value={actionQty}
                    onChange={e => setActionQty(parseInt(e.target.value, 10) || 0)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-black text-amber-900"
                  />
                  <p className="text-[10px] text-slate-400 font-semibold mt-1">Available in stock: {availableCount} Straws</p>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold border text-slate-600 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (activeModal === 'edit_batch') handleSaveEditBatch();
                  if (activeModal === 'add') handleAddStock();
                  if (activeModal === 'sell') handleSellStock();
                  if (activeModal === 'transfer_breeder') handleStockTransferToBreeder();
                  if (activeModal === 'breeder_stock_out') handleBreederStockOut();
                }}
                disabled={processing}
                className={`px-5 py-2 rounded-xl text-xs font-black text-white transition-all cursor-pointer ${
                  activeModal === 'edit_batch'
                    ? 'bg-slate-900 hover:bg-black'
                    : activeModal === 'transfer_breeder'
                    ? 'bg-sky-600 hover:bg-sky-700'
                    : activeModal === 'breeder_stock_out'
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-purple-600 hover:bg-purple-700'
                }`}
              >
                {processing ? 'Processing...' : activeModal === 'edit_batch' ? 'Save Changes to DB' : 'Confirm Stock Movement'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}