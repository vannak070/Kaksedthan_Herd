'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ModuleConfig } from '../../config/modules/types';
import { DynamicCardGrid } from './DynamicCardGrid';
import { DynamicTable } from './DynamicTable';
import { DynamicForm } from './DynamicForm';
import { Search, Plus, LayoutGrid, List, Filter, Download, RefreshCw } from 'lucide-react';

interface DynamicListingPageProps {
  config: ModuleConfig;
  onSelectDetailItem?: (item: Record<string, any>) => void;
}

export const DynamicListingPage: React.FC<DynamicListingPageProps> = ({
  config,
  onSelectDetailItem,
}) => {
  const [data, setData] = useState<Record<string, any>[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<Record<string, string>>({});
  const [sortField, setSortField] = useState(config.sortableFields[0]?.field || 'created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Record<string, any> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: String(page),
        limit: '12',
        sort: sortField,
        order: sortOrder,
      });

      if (searchQuery) queryParams.set('search', searchQuery);
      for (const [k, v] of Object.entries(selectedFilter)) {
        if (v) queryParams.set(k, v);
      }

      // Route to Generic API Module Endpoint e.g. /api/v1/modules/breeding or config.apiEndpoint
      const endpoint = `${config.apiEndpoint}?${queryParams.toString()}`;
      const res = await fetch(endpoint);
      const json = await res.json();

      if (json.success) {
        setData(json.data || []);
        if (json.pagination) {
          setTotalPages(json.pagination.totalPages || 1);
          setTotalCount(json.pagination.total || 0);
        }
      }
    } catch (err) {
      console.error(`Failed to fetch listing data for ${config.module}:`, err);
    } finally {
      setLoading(false);
    }
  }, [config, page, searchQuery, selectedFilter, sortField, sortOrder]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFormSubmit = async (formData: Record<string, any>) => {
    setIsSubmitting(true);
    try {
      const method = editingItem ? 'PUT' : 'POST';
      const endpoint = editingItem
        ? `${config.apiEndpoint}/${editingItem[config.primaryKey]}`
        : config.apiEndpoint;

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const json = await res.json();

      if (json.success) {
        setIsModalOpen(false);
        setEditingItem(null);
        fetchData();
      } else {
        alert(`Error: ${json.error || 'Failed to save record'}`);
      }
    } catch (err) {
      console.error('Failed to save record:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteItem = async (id: string | number) => {
    if (!confirm('Are you sure you want to delete this record?')) return;
    try {
      const res = await fetch(`${config.apiEndpoint}/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        fetchData();
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', margin: 0 }}>{config.title}</h1>
          {config.description && <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0' }}>{config.description}</p>}
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => {
              setEditingItem(null);
              setIsModalOpen(true);
            }}
            style={{
              padding: '10px 20px',
              fontSize: '13px',
              fontWeight: 700,
              background: '#16A34A',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 4px rgba(22, 163, 74, 0.2)',
            }}
          >
            <Plus className="h-4 w-4" /> Add New Record
          </button>
        </div>
      </div>

      {/* Search & Action Bar */}
      <div style={{ background: 'white', padding: '14px 18px', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        {/* Search Input */}
        <div style={{ position: 'relative', width: '280px' }}>
          <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', width: '16px', height: '16px' }} />
          <input
            type="text"
            placeholder={`Search ${config.title}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '8px 12px 8px 36px', fontSize: '13px', border: '1px solid #CBD5E1', borderRadius: '8px', outline: 'none', color: '#0F172A', boxSizing: 'border-box' }}
          />
        </div>

        {/* Dynamic Filters */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {config.filterableFields.map((filter) => (
            <select
              key={filter.field}
              value={selectedFilter[filter.field] || ''}
              onChange={(e) => setSelectedFilter((prev) => ({ ...prev, [filter.field]: e.target.value }))}
              style={{ padding: '8px 12px', fontSize: '12px', border: '1px solid #CBD5E1', borderRadius: '8px', background: 'white', color: '#334155', cursor: 'pointer' }}
            >
              <option value="">All {filter.label}</option>
              {filter.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ))}

          {/* View Mode Toggle Buttons */}
          <div style={{ display: 'flex', border: '1px solid #CBD5E1', borderRadius: '8px', overflow: 'hidden' }}>
            <button
              onClick={() => setViewMode('card')}
              style={{ padding: '7px 12px', background: viewMode === 'card' ? '#16A34A' : 'white', color: viewMode === 'card' ? 'white' : '#64748B', border: 'none', cursor: 'pointer' }}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              style={{ padding: '7px 12px', background: viewMode === 'table' ? '#16A34A' : 'white', color: viewMode === 'table' ? 'white' : '#64748B', border: 'none', cursor: 'pointer' }}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Render */}
      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#64748B' }}>
          <p style={{ fontSize: '14px', fontWeight: 600 }}>Loading {config.title}...</p>
        </div>
      ) : viewMode === 'card' ? (
        <DynamicCardGrid
          config={config}
          data={data}
          onCardClick={(item) => onSelectDetailItem && onSelectDetailItem(item)}
        />
      ) : (
        <DynamicTable
          config={config}
          data={data}
          sortField={sortField}
          sortOrder={sortOrder}
          onSortChange={(f) => {
            if (sortField === f) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
            else {
              setSortField(f);
              setSortOrder('desc');
            }
          }}
          onView={(item) => onSelectDetailItem && onSelectDetailItem(item)}
          onEdit={(item) => {
            setEditingItem(item);
            setIsModalOpen(true);
          }}
          onDelete={handleDeleteItem}
        />
      )}

      {/* Modal Dialog for Create / Edit */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: 'white', borderRadius: '16px', maxWidth: '750px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '24px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: '0 0 16px' }}>
              {editingItem ? `Edit ${config.title} Record` : `Add New ${config.title} Entry`}
            </h2>
            <DynamicForm
              config={config}
              initialValues={editingItem || {}}
              onSubmit={handleFormSubmit}
              onCancel={() => setIsModalOpen(false)}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      )}
    </div>
  );
};
