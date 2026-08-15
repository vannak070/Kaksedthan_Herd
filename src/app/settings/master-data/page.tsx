'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { 
  Plus, Edit2, CheckCircle2, AlertCircle, RefreshCw, Power, ShieldCheck, Tag, Globe, 
  Layers, BookOpen, Heart, DollarSign, X, Layers3, ArrowRight, Image as ImageIcon, Upload, Eye
} from 'lucide-react';
import { 
  fetchMasterDataCatalogAction, 
  createBreedConfigurationAction, 
  updateBreedConfigurationAction, 
  toggleBreedConfigStatusAction,
  saveMasterCategoryItemAction
} from '@/app/actions';

interface BreedItem {
  id: string;
  code: string;
  name: string;
  category: string;
  origin: string;
  description: string;
  imageUrl?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
}

interface GenericMasterItem {
  id: string;
  code: string;
  name: string;
  category?: string;
  description?: string;
  imageUrl?: string;
  is_active: boolean;
  extraInfo?: string;
}

export default function MasterDataSettingsPage() {
  const [activeTab, setActiveTab] = useState<'breeds' | 'breeding' | 'stock' | 'commercial' | 'certification'>('breeds');
  
  // Master data states
  const [breeds, setBreeds] = useState<BreedItem[]>([]);
  const [breedingMethods, setBreedingMethods] = useState<GenericMasterItem[]>([]);
  const [stockTypes, setStockTypes] = useState<GenericMasterItem[]>([]);
  const [ownershipTypes, setOwnershipTypes] = useState<GenericMasterItem[]>([]);
  const [currencies, setCurrencies] = useState<GenericMasterItem[]>([]);
  const [certificationTypes, setCertificationTypes] = useState<GenericMasterItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  
  // Feedback banners
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Modal / Form state for Breeds & Generic Master Items
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBreed, setEditingBreed] = useState<BreedItem | null>(null);
  const [editingGeneric, setEditingGeneric] = useState<GenericMasterItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Lightbox preview image
  const [previewImageModal, setPreviewImageModal] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    category: 'Beef',
    origin: '',
    description: '',
    imageUrl: '',
    sortOrder: 10,
    unit: 'Dose',
    symbol: '$',
    exchangeRate: '4100',
  });

  const loadAllMasterData = async () => {
    setLoading(true);
    try {
      const res = await fetchMasterDataCatalogAction();
      if (res.success && res.data) {
        setBreeds(res.data.breeds || []);
        
        setBreedingMethods(
          (res.data.breedingMethods || []).map((m: any) => ({
            id: m.id,
            code: m.code,
            name: m.name,
            category: m.category || 'Reproduction Protocol',
            description: m.description || 'Approved breeding procedure',
            imageUrl: m.imageUrl || m.image_url || '',
            is_active: m.is_active ?? true,
          }))
        );

        setStockTypes(
          (res.data.stockTypes || []).map((s: any) => ({
            id: s.id,
            code: s.code,
            name: s.name,
            category: s.category || s.unit || 'Dose',
            description: s.description || `Packaging unit: ${s.unit || 'Dose'}`,
            imageUrl: s.imageUrl || s.image_url || '',
            is_active: s.is_active ?? true,
          }))
        );

        setOwnershipTypes(
          (res.data.ownershipTypes || []).map((o: any) => ({
            id: o.id,
            code: o.code,
            name: o.name,
            category: o.category || 'Scope Class',
            description: o.description || `Entity Source: ${o.entitySource || 'System'}`,
            imageUrl: o.imageUrl || o.image_url || '',
            is_active: o.is_active ?? true,
          }))
        );

        setCurrencies(
          (res.data.currencies || []).map((c: any) => ({
            id: c.id,
            code: c.code,
            name: c.name,
            category: c.symbol || '$',
            description: c.description || (c.isDefault ? 'Default Primary Currency' : `Exchange Rate: 1 USD = ${c.exchangeRate || 4100} KHR`),
            imageUrl: c.imageUrl || c.image_url || '',
            is_active: c.is_active ?? true,
          }))
        );

        setCertificationTypes(
          (res.data.certificationTypes || []).map((ct: any) => ({
            id: ct.id,
            code: ct.code,
            name: ct.name,
            category: ct.category || 'Official Registry',
            description: ct.description || 'Standardized A4 Certificate template',
            imageUrl: ct.imageUrl || ct.image_url || '',
            is_active: ct.is_active ?? true,
          }))
        );
      } else {
        setErrorMsg(res.error || 'Failed to load master data catalog from PostgreSQL database.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error loading master data catalog.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllMasterData();
  }, []);

  const openCreateModal = () => {
    setEditingBreed(null);
    setEditingGeneric(null);
    setErrorMsg('');

    let defaultCat = 'Beef';
    if (activeTab === 'breeding') defaultCat = 'Reproduction Protocol';
    if (activeTab === 'stock') defaultCat = 'Dose / Straw';
    if (activeTab === 'commercial') defaultCat = '$';
    if (activeTab === 'certification') defaultCat = 'Official Registry';

    setFormData({
      name: '',
      code: '',
      category: defaultCat,
      origin: '',
      description: '',
      imageUrl: '',
      sortOrder: (breeds.length + 1) * 10,
      unit: 'Dose',
      symbol: '$',
      exchangeRate: '4100',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (b: BreedItem) => {
    setEditingBreed(b);
    setEditingGeneric(null);
    setErrorMsg('');
    setFormData({
      name: b.name,
      code: b.code,
      category: b.category || 'Beef',
      origin: b.origin || '',
      description: b.description || '',
      imageUrl: b.imageUrl || '',
      sortOrder: b.sortOrder || 10,
      unit: 'Dose',
      symbol: '$',
      exchangeRate: '4100',
    });
    setIsModalOpen(true);
  };

  const openGenericEditModal = (item: GenericMasterItem) => {
    setEditingBreed(null);
    setEditingGeneric(item);
    setErrorMsg('');
    setFormData({
      name: item.name,
      code: item.code,
      category: item.category || 'General',
      origin: '',
      description: item.description || '',
      imageUrl: item.imageUrl || '',
      sortOrder: 10,
      unit: 'Dose',
      symbol: item.category || '$',
      exchangeRate: '4100',
    });
    setIsModalOpen(true);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMsg('Item Name is required.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    try {
      if (activeTab === 'breeds') {
        if (editingBreed) {
          const res = await updateBreedConfigurationAction(editingBreed.id, {
            name: formData.name.trim(),
            code: formData.code.trim().toUpperCase() || undefined,
            category: formData.category,
            origin: formData.origin,
            description: formData.description,
            imageUrl: formData.imageUrl,
            sortOrder: Number(formData.sortOrder) || 10,
          });

          if (res?.success) {
            setSuccessMsg(`Breed "${formData.name}" updated successfully.`);
            setIsModalOpen(false);
            await loadAllMasterData();
          } else {
            setErrorMsg(res?.error || 'Failed to update breed configuration.');
          }
        } else {
          const res = await createBreedConfigurationAction({
            name: formData.name.trim(),
            code: formData.code.trim().toUpperCase() || undefined,
            category: formData.category,
            origin: formData.origin,
            description: formData.description,
            imageUrl: formData.imageUrl,
            sortOrder: Number(formData.sortOrder) || 10,
          });

          if (res?.success) {
            setSuccessMsg(`New Breed "${formData.name}" created and added to PostgreSQL Master Catalog.`);
            setIsModalOpen(false);
            await loadAllMasterData();
          } else {
            setErrorMsg(res?.error || 'Failed to create breed configuration.');
          }
        }
      } else {
        const categoryKeyMap: Record<string, 'breedingMethods' | 'stockTypes' | 'ownershipTypes' | 'currencies' | 'certificationTypes'> = {
          breeding: 'breedingMethods',
          stock: 'stockTypes',
          ownership: 'ownershipTypes',
          commercial: 'currencies',
          certification: 'certificationTypes',
        };

        const categoryKey = categoryKeyMap[activeTab];
        const res = await saveMasterCategoryItemAction({
          categoryKey,
          item: {
            id: editingGeneric ? editingGeneric.id : undefined,
            code: formData.code.trim().toUpperCase() || `${activeTab.slice(0, 3).toUpperCase()}-${Math.floor(Math.random() * 1000)}`,
            name: formData.name.trim(),
            category: formData.category,
            description: formData.description,
            imageUrl: formData.imageUrl,
            is_active: editingGeneric ? editingGeneric.is_active : true,
          }
        });

        if (res?.success) {
          setSuccessMsg(`Master Configuration "${formData.name}" saved to PostgreSQL database.`);
          setIsModalOpen(false);
          await loadAllMasterData();
        } else {
          setErrorMsg(res?.error || 'Failed to save master item.');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error processing request.');
    } finally {
      setSubmitting(false);
      setTimeout(() => setSuccessMsg(''), 4000);
    }
  };

  const handleToggleStatus = async (b: BreedItem) => {
    const nextStatus = !b.isActive;
    const actionText = nextStatus ? 'activate' : 'deactivate';
    if (!window.confirm(`Are you sure you want to ${actionText} breed "${b.name}"?`)) {
      return;
    }

    try {
      const res = await toggleBreedConfigStatusAction(b.id, nextStatus);
      if (res?.success) {
        setSuccessMsg(`Breed "${b.name}" ${nextStatus ? 'activated' : 'deactivated'}.`);
        await loadAllMasterData();
      } else {
        setErrorMsg(res?.error || `Failed to ${actionText} breed.`);
      }
    } catch (err: any) {
      setErrorMsg(err.message || `Error status update.`);
    } finally {
      setTimeout(() => setSuccessMsg(''), 4000);
    }
  };

  const toggleGenericStatus = async (item: GenericMasterItem, categoryKey: 'breedingMethods' | 'stockTypes' | 'ownershipTypes' | 'currencies' | 'certificationTypes') => {
    const nextState = !item.is_active;
    try {
      const res = await saveMasterCategoryItemAction({
        categoryKey,
        item: {
          ...item,
          is_active: nextState,
        }
      });
      if (res?.success) {
        setSuccessMsg(`Master item "${item.name}" ${nextState ? 'activated' : 'deactivated'}.`);
        await loadAllMasterData();
      } else {
        setErrorMsg(res?.error || 'Failed to update item status.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Status update error.');
    } finally {
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  const filteredBreeds = breeds.filter((b) => {
    const matchesSearch =
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.code.toLowerCase().includes(search.toLowerCase()) ||
      (b.origin || '').toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === 'All' || b.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const categories = Array.from(new Set(breeds.map((b) => b.category).filter(Boolean)));

  const getAddButtonLabel = () => {
    switch (activeTab) {
      case 'breeds': return 'Breed Configuration';
      case 'breeding': return 'Breeding Method';
      case 'stock': return 'Stock Material Type';
      case 'commercial': return 'Currency';
      case 'certification': return 'Certificate Type';
      default: return 'Master Item';
    }
  };

  const masterModules = [
    {
      id: 'breeds',
      number: '1',
      title: 'Breed Configurations',
      subtitle: 'Angus, Brahman, Wagyu & Holstein rules',
      count: breeds.length,
      icon: BookOpen,
      color: 'from-orange-500 to-amber-600',
    },
    {
      id: 'breeding',
      number: '2',
      title: 'Breeding & AI Methods',
      subtitle: 'Reproduction procedures (AI, ET, IVF)',
      count: breedingMethods.length,
      icon: Heart,
      color: 'from-rose-500 to-pink-600',
    },
    {
      id: 'stock',
      number: '3',
      title: 'Genetics & Stock Types',
      subtitle: 'Straw & Embryo packaging units',
      count: stockTypes.length,
      icon: Tag,
      color: 'from-purple-500 to-indigo-600',
    },
    {
      id: 'commercial',
      number: '4',
      title: 'Commercial & Costing',
      subtitle: 'Currencies (USD $, KHR ៛) & fees',
      count: currencies.length,
      icon: DollarSign,
      color: 'from-emerald-500 to-teal-600',
    },
    {
      id: 'certification',
      number: '5',
      title: 'Certification Setup',
      subtitle: 'Pedigree & Registration passes',
      count: certificationTypes.length,
      icon: ShieldCheck,
      color: 'from-slate-700 to-slate-900',
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-orange-950 text-white p-6 rounded-3xl shadow-md border border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-orange-500/20 text-orange-400 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-orange-500/30">
              Single Source of Truth
            </span>
            <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-emerald-500/30">
              PostgreSQL Sync
            </span>
          </div>
          <h1 className="text-xl font-black mt-1.5 flex items-center gap-2">
            <Layers3 className="h-5 w-5 text-[#dc5c15]" />
            <span>Master Data Setup & Configuration</span>
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-3xl">
            Single Source of Truth for Breeds, Reproduction Protocols, Genetics Packaging, Ownership Scopes, Commercial Currencies, and Official Certificates.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="bg-[#dc5c15] hover:bg-orange-600 text-white text-xs font-black px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2 shrink-0 self-start md:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Add New {getAddButtonLabel()}</span>
        </button>
      </div>

      {/* 6 Aligned Master Configuration Module Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {masterModules.map((mod) => {
          const Icon = mod.icon;
          const isSelected = activeTab === mod.id;
          return (
            <button
              key={mod.id}
              onClick={() => setActiveTab(mod.id as any)}
              className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? 'bg-white border-[#dc5c15] ring-2 ring-[#dc5c15]/20 shadow-md'
                  : 'bg-white border-slate-200/90 hover:border-slate-300 hover:shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`h-9 w-9 rounded-xl bg-gradient-to-br ${mod.color} text-white flex items-center justify-center font-black shadow-xs shrink-0`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                      Module {mod.number}
                    </span>
                    <h3 className="text-xs font-black text-slate-900 line-clamp-1">{mod.title}</h3>
                  </div>
                </div>

                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black ${
                  isSelected ? 'bg-orange-100 text-[#dc5c15]' : 'bg-slate-100 text-slate-600'
                }`}>
                  {mod.count} {mod.count === 1 ? 'Item' : 'Items'}
                </span>
              </div>

              <p className="text-[11px] text-slate-500 mt-2 line-clamp-1">{mod.subtitle}</p>

              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold">
                <span className={isSelected ? 'text-[#dc5c15]' : 'text-slate-500'}>
                  {isSelected ? '● Active View' : 'Select to manage'}
                </span>
                <ArrowRight className={`h-3.5 w-3.5 transition-transform ${isSelected ? 'text-[#dc5c15] translate-x-1' : 'text-slate-400'}`} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Success / Error Banners */}
      {successMsg && !isModalOpen && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-2xs animate-in fade-in duration-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && !isModalOpen && (
        <div className="bg-rose-50 border border-rose-200 text-rose-900 p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-2xs animate-in fade-in duration-200">
          <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* TAB 1: BREED MASTER CATALOG */}
      {activeTab === 'breeds' && (
        <Card className="bg-white border-slate-200/90 rounded-3xl shadow-2xs overflow-hidden">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-[#dc5c15]" />
                  <span>Module 1: Cattle Breed Records ({filteredBreeds.length})</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Active breeds automatically populate Sire Register, Dam Listing & form dropdowns across the system.
                </CardDescription>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  placeholder="Search breed, code, or origin..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-white border border-slate-200 text-xs rounded-xl px-3 py-1.5 w-48 font-medium focus:outline-none focus:ring-2 focus:ring-[#dc5c15]"
                />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-white border border-slate-200 text-xs font-bold rounded-xl px-3 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#dc5c15]"
                >
                  <option value="All">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <button
                  onClick={loadAllMasterData}
                  title="Refresh Breed Data"
                  className="p-1.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin h-7 w-7 border-4 border-[#dc5c15] border-t-transparent rounded-full" />
              </div>
            ) : filteredBreeds.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-xs">
                No breeds found matching parameters. Click <strong>Add New Breed Configuration</strong> to create one.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Photo</th>
                      <th className="py-3 px-4">Sort</th>
                      <th className="py-3 px-4">Code</th>
                      <th className="py-3 px-4">Breed Name</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Origin</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredBreeds.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          {b.imageUrl ? (
                            <button
                              onClick={() => setPreviewImageModal(b.imageUrl || null)}
                              className="h-10 w-10 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 group relative block"
                            >
                              <img src={b.imageUrl} alt={b.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                            </button>
                          ) : (
                            <div className="h-10 w-10 rounded-xl bg-orange-50 border border-orange-200/80 text-[#dc5c15] flex items-center justify-center font-black text-xs shrink-0">
                              {b.name.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-400">#{b.sortOrder || 10}</td>
                        <td className="py-3 px-4">
                          <span className="font-mono font-black text-slate-800 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                            {b.code}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-black text-slate-900">
                          {b.name}
                          {b.description && (
                            <p className="text-[10px] text-slate-400 font-normal truncate max-w-xs">{b.description}</p>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-800 border border-purple-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
                            <Tag className="h-3 w-3" />
                            {b.category || 'Beef'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {b.origin ? (
                            <span className="inline-flex items-center gap-1">
                              <Globe className="h-3 w-3 text-slate-400" />
                              {b.origin}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">Unspecified</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              b.isActive
                                ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                                : 'bg-slate-100 border border-slate-200 text-slate-500'
                            }`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${b.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                            {b.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEditModal(b)}
                              className="p-1.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-bold text-[11px] flex items-center gap-1"
                              title="Edit Breed Details"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleToggleStatus(b)}
                              className={`p-1.5 rounded-lg transition-colors font-bold text-[11px] flex items-center gap-1 ${
                                b.isActive
                                  ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                              }`}
                              title={b.isActive ? 'Deactivate Breed' : 'Activate Breed'}
                            >
                              <Power className="h-3.5 w-3.5" />
                              <span>{b.isActive ? 'Deactivate' : 'Activate'}</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* TAB 2: BREEDING & AI METHODS */}
      {activeTab === 'breeding' && (
        <Card className="bg-white border-slate-200/90 rounded-3xl shadow-2xs overflow-hidden">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-5">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Heart className="h-4 w-4 text-[#dc5c15]" />
                  <span>Module 2: Breeding & Insemination Methods ({breedingMethods.length})</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Master reference procedures (AI, ET, Natural Service, IVF) consumed by Breeding Programs and Stock Insemination logs.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Media</th>
                    <th className="py-3 px-4">Code</th>
                    <th className="py-3 px-4">Method Name</th>
                    <th className="py-3 px-4">Reproduction Category</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {breedingMethods.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        {m.imageUrl ? (
                          <img src={m.imageUrl} alt={m.name} className="h-9 w-9 rounded-xl object-cover border border-slate-200" />
                        ) : (
                          <div className="h-9 w-9 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center font-black text-xs">
                            {m.code.slice(0, 2)}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono font-black text-slate-800">{m.code}</td>
                      <td className="py-3 px-4 font-black text-slate-900">{m.name}</td>
                      <td className="py-3 px-4 text-slate-600">{m.category}</td>
                      <td className="py-3 px-4 text-slate-500">{m.description}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${m.is_active ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                          {m.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openGenericEditModal(m)} className="p-1.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-bold text-[11px] flex items-center gap-1">
                            <Edit2 className="h-3.5 w-3.5" />
                            <span>Edit Method</span>
                          </button>
                          <button onClick={() => toggleGenericStatus(m, 'breedingMethods')} className="p-1.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-bold text-[11px]">
                            {m.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 3: GENETICS & STOCK TYPES */}
      {activeTab === 'stock' && (
        <Card className="bg-white border-slate-200/90 rounded-3xl shadow-2xs overflow-hidden">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-5">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Tag className="h-4 w-4 text-[#dc5c15]" />
                  <span>Module 3: Genetics & Stock Material Types ({stockTypes.length})</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Master classification of genetic material inventory (Semen Straw Conventional, Sexed Female, Sexed Male, Embryo Grade A).
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Media</th>
                    <th className="py-3 px-4">Code</th>
                    <th className="py-3 px-4">Stock Type Name</th>
                    <th className="py-3 px-4">Unit Packaging</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {stockTypes.map((st) => (
                    <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        {st.imageUrl ? (
                          <img src={st.imageUrl} alt={st.name} className="h-9 w-9 rounded-xl object-cover border border-slate-200" />
                        ) : (
                          <div className="h-9 w-9 rounded-xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center font-black text-xs">
                            {st.code.slice(0, 2)}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono font-black text-slate-800">{st.code}</td>
                      <td className="py-3 px-4 font-black text-slate-900">{st.name}</td>
                      <td className="py-3 px-4 text-slate-600">{st.category}</td>
                      <td className="py-3 px-4 text-slate-500">{st.description}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${st.is_active ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                          {st.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openGenericEditModal(st)} className="p-1.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-bold text-[11px] flex items-center gap-1">
                            <Edit2 className="h-3.5 w-3.5" />
                            <span>Edit Stock Type</span>
                          </button>
                          <button onClick={() => toggleGenericStatus(st, 'stockTypes')} className="p-1.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-bold text-[11px]">
                            {st.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 4: COMMERCIAL & COSTING RULES */}
      {activeTab === 'commercial' && (
        <Card className="bg-white border-slate-200/90 rounded-3xl shadow-2xs overflow-hidden">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-5">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-[#dc5c15]" />
                  <span>Module 4: Financial Currencies & Pricing Parameters ({currencies.length})</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Approved commercial transaction currencies (US Dollar $, Khmer Riel ៛) and default pricing units.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Media</th>
                    <th className="py-3 px-4">Code</th>
                    <th className="py-3 px-4">Currency Name</th>
                    <th className="py-3 px-4">Symbol</th>
                    <th className="py-3 px-4">Exchange / Default Rule</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {currencies.map((curr) => (
                    <tr key={curr.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        {curr.imageUrl ? (
                          <img src={curr.imageUrl} alt={curr.name} className="h-9 w-9 rounded-xl object-cover border border-slate-200" />
                        ) : (
                          <div className="h-9 w-9 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-black text-xs">
                            {curr.category || '$'}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono font-black text-slate-800">{curr.code}</td>
                      <td className="py-3 px-4 font-black text-slate-900">{curr.name}</td>
                      <td className="py-3 px-4 font-bold text-slate-800">{curr.category}</td>
                      <td className="py-3 px-4 text-slate-500">{curr.description}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${curr.is_active ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                          {curr.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openGenericEditModal(curr)} className="p-1.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-bold text-[11px] flex items-center gap-1">
                            <Edit2 className="h-3.5 w-3.5" />
                            <span>Edit Rate</span>
                          </button>
                          <button onClick={() => toggleGenericStatus(curr, 'currencies')} className="p-1.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-bold text-[11px]">
                            {curr.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 5: CERTIFICATION SETUP */}
      {activeTab === 'certification' && (
        <Card className="bg-white border-slate-200/90 rounded-3xl shadow-2xs overflow-hidden">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-5">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-[#dc5c15]" />
                  <span>Module 5: Pedigree & Registration Certificate Templates ({certificationTypes.length})</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Official certificate templates (Fullblood Pedigree, Sire Pass, Calf Pass, Herdbook Registration) generated by the Certificate Center.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Template Sample</th>
                    <th className="py-3 px-4">Code</th>
                    <th className="py-3 px-4">Certificate Type Name</th>
                    <th className="py-3 px-4">Format</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {certificationTypes.map((cert) => (
                    <tr key={cert.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        {cert.imageUrl ? (
                          <button
                            onClick={() => setPreviewImageModal(cert.imageUrl || null)}
                            className="h-10 w-10 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 group relative block"
                          >
                            <img src={cert.imageUrl} alt={cert.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                          </button>
                        ) : (
                          <div className="h-10 w-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-black text-xs">
                            <ShieldCheck className="h-5 w-5 text-slate-500" />
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono font-black text-slate-800">{cert.code}</td>
                      <td className="py-3 px-4 font-black text-slate-900">{cert.name}</td>
                      <td className="py-3 px-4 text-slate-600">{cert.category}</td>
                      <td className="py-3 px-4 text-slate-500">{cert.description}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${cert.is_active ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                          {cert.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openGenericEditModal(cert)} className="p-1.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-bold text-[11px] flex items-center gap-1">
                            <Edit2 className="h-3.5 w-3.5" />
                            <span>Edit Template</span>
                          </button>
                          <button onClick={() => toggleGenericStatus(cert, 'certificationTypes')} className="p-1.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-bold text-[11px]">
                            {cert.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lightbox Image Preview Modal */}
      {previewImageModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative max-w-2xl w-full bg-slate-900 rounded-3xl overflow-hidden p-2 border border-slate-700">
            <button
              onClick={() => setPreviewImageModal(null)}
              className="absolute top-4 right-4 bg-slate-800/80 text-white p-2 rounded-full hover:bg-slate-700 transition-colors z-10"
            >
              <X className="h-5 w-5" />
            </button>
            <img src={previewImageModal} alt="Reference Preview" className="w-full max-h-[75vh] object-contain rounded-2xl" />
          </div>
        </div>
      )}

      {/* Create / Edit Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider">
                  {editingBreed || editingGeneric ? `Edit ${getAddButtonLabel()}` : `Create New ${getAddButtonLabel()}`}
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Stored directly in PostgreSQL Master Setup tables.
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              {/* Modal Error Banner */}
              {errorMsg && (
                <div className="bg-rose-50 border border-rose-200 text-rose-900 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Attach Reference Image / Logo Upload Section */}
              <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-extrabold text-slate-800 flex items-center gap-1.5">
                    <ImageIcon className="h-4 w-4 text-[#dc5c15]" />
                    <span>Attach Reference Image / Logo</span>
                  </label>
                  {formData.imageUrl && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, imageUrl: '' })}
                      className="text-[10px] text-rose-600 font-bold hover:underline"
                    >
                      Remove Media
                    </button>
                  )}
                </div>

                {formData.imageUrl ? (
                  <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-slate-200">
                    <img src={formData.imageUrl} alt="Attached Preview" className="h-14 w-14 rounded-lg object-cover border border-slate-200 shrink-0" />
                    <div className="flex-1 truncate">
                      <p className="text-[11px] font-bold text-slate-800 truncate">Attached Media Preview</p>
                      <p className="text-[10px] text-slate-400 truncate">Saved directly to configuration record</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <label className="cursor-pointer bg-white border border-slate-200 rounded-xl p-3 text-center hover:border-orange-400 transition-all block">
                      <Upload className="h-5 w-5 text-slate-400 mx-auto mb-1" />
                      <span className="text-[11px] font-bold text-slate-700 block">Upload File</span>
                      <input type="file" accept="image/*" onChange={handleImageFileChange} className="hidden" />
                    </label>
                    <div className="bg-white border border-slate-200 rounded-xl p-2.5 flex items-center">
                      <input
                        type="url"
                        placeholder="Paste Image URL..."
                        value={formData.imageUrl}
                        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                        className="w-full text-[11px] font-medium bg-transparent focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder={`Enter ${getAddButtonLabel()} Name...`}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#dc5c15] focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Item Code (Unique)</label>
                  <input
                    type="text"
                    placeholder="e.g. CODE_X"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold font-mono text-slate-900 focus:ring-2 focus:ring-[#dc5c15] focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">Auto-generated if left blank</p>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category / Group</label>
                  <input
                    type="text"
                    placeholder="Category name..."
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#dc5c15] focus:outline-none"
                  />
                </div>
              </div>

              {activeTab === 'breeds' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Origin Country / Region</label>
                    <input
                      type="text"
                      placeholder="e.g. Australia, Japan"
                      value={formData.origin}
                      onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-[#dc5c15] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Sort Order</label>
                    <input
                      type="number"
                      value={formData.sortOrder}
                      onChange={(e) => setFormData({ ...formData, sortOrder: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#dc5c15] focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description / Notes</label>
                <textarea
                  rows={2}
                  placeholder="Optional item details, characteristics, or notes..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-[#dc5c15] focus:outline-none resize-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#dc5c15] text-white text-xs font-bold rounded-xl hover:bg-orange-700 transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                >
                  {submitting ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <ShieldCheck className="h-4 w-4" />
                  )}
                  <span>Save Configuration</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
