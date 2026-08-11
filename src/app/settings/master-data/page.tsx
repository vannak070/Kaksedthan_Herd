'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Plus, Edit2, CheckCircle2, AlertCircle, RefreshCw, Power, ShieldCheck, Tag, Globe, Layers } from 'lucide-react';
import { fetchBreedConfigurationsAction, createBreedConfigurationAction, updateBreedConfigurationAction, toggleBreedConfigStatusAction } from '@/app/actions';

interface BreedItem {
  id: string;
  code: string;
  name: string;
  category: string;
  origin: string;
  description: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
}

export default function MasterDataSettingsPage() {
  const [breeds, setBreeds] = useState<BreedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  
  // Feedback banners
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBreed, setEditingBreed] = useState<BreedItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    category: 'Beef',
    origin: '',
    description: '',
    sortOrder: 10,
  });

  const loadBreeds = async () => {
    setLoading(true);
    try {
      const res = await fetchBreedConfigurationsAction(false);
      if (res.success && Array.isArray(res.data)) {
        setBreeds(res.data);
      } else {
        setErrorMsg(res.error || 'Failed to load breed catalog from PostgreSQL database.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error loading breeds.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBreeds();
  }, []);

  const openCreateModal = () => {
    setEditingBreed(null);
    setFormData({
      name: '',
      code: '',
      category: 'Beef',
      origin: '',
      description: '',
      sortOrder: (breeds.length + 1) * 10,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (b: BreedItem) => {
    setEditingBreed(b);
    setFormData({
      name: b.name,
      code: b.code,
      category: b.category || 'Beef',
      origin: b.origin || '',
      description: b.description || '',
      sortOrder: b.sortOrder || 10,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMsg('Breed Name is required.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    try {
      if (editingBreed) {
        // Edit existing breed
        const res = await updateBreedConfigurationAction(editingBreed.id, {
          name: formData.name.trim(),
          code: formData.code.trim().toUpperCase() || undefined,
          category: formData.category,
          origin: formData.origin,
          description: formData.description,
          sortOrder: Number(formData.sortOrder) || 10,
        });

        if (res.success) {
          setSuccessMsg(`Breed "${formData.name}" updated successfully.`);
          setIsModalOpen(false);
          await loadBreeds();
        } else {
          setErrorMsg(res.error || 'Failed to update breed.');
        }
      } else {
        // Create new breed
        const res = await createBreedConfigurationAction({
          name: formData.name.trim(),
          code: formData.code.trim().toUpperCase() || undefined,
          category: formData.category,
          origin: formData.origin,
          description: formData.description,
          sortOrder: Number(formData.sortOrder) || 10,
        });

        if (res.success) {
          setSuccessMsg(`New Breed "${formData.name}" created and added to PostgreSQL Master Catalog.`);
          setIsModalOpen(false);
          await loadBreeds();
        } else {
          setErrorMsg(res.error || 'Failed to create breed.');
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
    if (!window.confirm(`Are you sure you want to ${actionText} breed "${b.name}"?\n${!nextStatus ? 'Deactivated breeds will remain linked to historical records, but cannot be selected for new Sire/Dam/Calf registrations.' : ''}`)) {
      return;
    }

    try {
      const res = await toggleBreedConfigStatusAction(b.id, nextStatus);
      if (res.success) {
        setSuccessMsg(`Breed "${b.name}" ${nextStatus ? 'activated' : 'deactivated'}.`);
        await loadBreeds();
      } else {
        setErrorMsg(res.error || `Failed to ${actionText} breed.`);
      }
    } catch (err: any) {
      setErrorMsg(err.message || `Error status update.`);
    } finally {
      setTimeout(() => setSuccessMsg(''), 4000);
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-orange-100 text-[#dc5c15] text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Single Source of Truth
            </span>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              PostgreSQL Sync
            </span>
          </div>
          <h1 className="text-xl font-black text-slate-900 mt-1">Super Admin Breed Master Catalog</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure global cattle breeds used dynamically across Sire Register, Dam Listing, Stock & Sourcing, Breeding Programs, Calf Register, and Certificates.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="bg-[#dc5c15] hover:bg-orange-700 text-white text-xs font-black px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-2 shrink-0 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Breed</span>
        </button>
      </div>

      {/* Success / Error Banners */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-2xs animate-in fade-in duration-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-900 p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-2xs animate-in fade-in duration-200">
          <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Breed Management Card */}
      <Card className="bg-white border-slate-200/90 rounded-3xl shadow-2xs overflow-hidden">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Layers className="h-4 w-4 text-[#dc5c15]" />
                <span>Cattle Breed Records ({filteredBreeds.length})</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Active breeds automatically populate Sire Register & form dropdowns across the system.
              </CardDescription>
            </div>

            {/* Filter & Search */}
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
                onClick={loadBreeds}
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
              No breeds found matching parameters. Click <strong>Add New Breed</strong> to create one.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider">
                  <tr>
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

      {/* Create / Edit Breed Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider">
                  {editingBreed ? 'Edit Breed Configuration' : 'Create New Breed Configuration'}
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Stored directly in PostgreSQL `breed_configurations` master table.
                </p>
              </div>
              <span className="bg-[#dc5c15] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                Master Data
              </span>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Breed Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Wagyu Cross, Brangus, Santa Gertrudis"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#dc5c15] focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Breed Code (Unique)</label>
                  <input
                    type="text"
                    placeholder="e.g. WAG_X"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold font-mono text-slate-900 focus:ring-2 focus:ring-[#dc5c15] focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">Auto-generated if left blank</p>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#dc5c15] focus:outline-none"
                  >
                    <option value="Beef">Beef</option>
                    <option value="Dairy">Dairy</option>
                    <option value="Dual Purpose">Dual Purpose</option>
                    <option value="Draft / Local">Draft / Local</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Origin Country / Region</label>
                  <input
                    type="text"
                    placeholder="e.g. Australia, Japan, Scotland"
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

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description / Notes</label>
                <textarea
                  rows={2}
                  placeholder="Optional breed lineage traits, characteristics, or notes..."
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
                  <span>{editingBreed ? 'Save Changes' : 'Create Breed Master'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
