'use client';

import React, { useState, useEffect } from 'react';
import {
  Building2, Plus, Search, Globe, Phone, Mail,
  MapPin, ExternalLink, Edit3, X, CheckCircle2,
  Dna, Beef, RefreshCw, Globe2, Star, Award
} from 'lucide-react';
import {
  fetchSourcingCompaniesAction,
  createSourcingCompanyAction,
  updateSourcingCompanyAction,
  fetchSourcingCompanySiresAction
} from '@/app/actions';

type Company = {
  id: string;
  code: string;
  name: string;
  country: string;
  contactName: string;
  phone: string;
  email: string;
  address: string;
  website: string;
  imageUrl: string | null;
  notes: string;
  status: 'Active' | 'Inactive';
  sireCount: number;
  stockCount: number;
};

const FLAG_MAP: Record<string, string> = {
  'USA': '🇺🇸', 'United States': '🇺🇸',
  'Canada': '🇨🇦',
  'Netherlands': '🇳🇱',
  'Australia': '🇦🇺',
  'Japan': '🇯🇵',
  'Cambodia': '🇰🇭',
  'France': '🇫🇷',
  'United Kingdom': '🇬🇧',
  'Germany': '🇩🇪',
  'New Zealand': '🇳🇿',
};

const COUNTRIES = [
  'Cambodia', 'USA', 'Canada', 'Australia', 'Japan', 'France', 'Germany',
  'Netherlands', 'United Kingdom', 'New Zealand', 'Brazil', 'Argentina', 'Thailand',
  'Vietnam', 'China', 'India', 'South Korea',
];

export default function SourcingCompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Company | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [companySires, setCompanySires] = useState<any[]>([]);
  const [siresLoading, setSiresLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState({
    name: '', country: 'Cambodia', contactName: '', phone: '', email: '',
    address: '', website: '', notes: '', status: 'Active',
  });

  useEffect(() => { loadCompanies(); }, []);

  async function loadCompanies() {
    setLoading(true);
    const res = await fetchSourcingCompaniesAction();
    if (res.success && Array.isArray(res.data)) setCompanies(res.data);
    setLoading(false);
  }

  async function handleSelectCompany(c: Company) {
    setSelectedCompany(c);
    setSiresLoading(true);
    const res = await fetchSourcingCompanySiresAction(c.id);
    if (res.success && Array.isArray(res.data)) setCompanySires(res.data);
    else setCompanySires([]);
    setSiresLoading(false);
  }

  function openCreate() {
    setEditTarget(null);
    setForm({ name: '', country: 'Cambodia', contactName: '', phone: '', email: '', address: '', website: '', notes: '', status: 'Active' });
    setShowModal(true);
    setError(null);
  }

  function openEdit(c: Company) {
    setEditTarget(c);
    setForm({ name: c.name, country: c.country || 'Cambodia', contactName: c.contactName || '', phone: c.phone || '', email: c.email || '', address: c.address || '', website: c.website || '', notes: c.notes || '', status: c.status || 'Active' });
    setShowModal(true);
    setError(null);
  }

  async function handleSave() {
    if (!form.name.trim()) { setError('Company name is required.'); return; }
    setSaving(true);
    setError(null);
    try {
      if (editTarget) {
        const res = await updateSourcingCompanyAction(editTarget.id, form);
        if (!res.success) { setError(res.error || 'Failed to update'); setSaving(false); return; }
      } else {
        const res = await createSourcingCompanyAction(form);
        if (!res.success) { setError(res.error || 'Failed to create'); setSaving(false); return; }
      }
      setShowModal(false);
      await loadCompanies();
    } catch (e: any) {
      setError(e.message || 'An unexpected error occurred');
    }
    setSaving(false);
  }

  const filtered = companies.filter(c => {
    const matchSearch = !searchQuery ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.country?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.contactName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1b2a 50%, #0a1628 100%)', padding: '24px', fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg, #3b82f6, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(99,102,241,0.4)' }}>
              <Building2 size={24} color="white" />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 800, color: 'white', letterSpacing: '-0.5px' }}>Sire Sourcing Companies</h1>
              <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>Manage genetic material sourcing partners</p>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button onClick={loadCompanies} style={{ padding: '10px 16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
            <RefreshCw size={14} /> Refresh
          </button>
          <button onClick={openCreate} style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #3b82f6, #6366f1)', color: 'white', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', boxShadow: '0 4px 16px rgba(99,102,241,0.4)' }}>
            <Plus size={16} /> Add Company
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '28px' }}>
        {[
          { label: 'Total Companies', value: companies.length, icon: <Building2 size={18} />, color: '#3b82f6' },
          { label: 'Active Partners', value: companies.filter(c => c.status === 'Active').length, icon: <CheckCircle2 size={18} />, color: '#10b981' },
          { label: 'Total Sires Sourced', value: companies.reduce((s, c) => s + (c.sireCount || 0), 0), icon: <Dna size={18} />, color: '#f59e0b' },
        ].map((stat, i) => (
          <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', backdropFilter: 'blur(10px)' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${stat.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color }}>
              {stat.icon}
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'white' }}>{stat.value}</div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedCompany ? '1fr 380px' : '1fr', gap: '24px' }}>
        {/* Company List */}
        <div>
          {/* Search + Filter */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search companies, countries, contacts..."
                style={{ width: '100%', padding: '11px 14px 11px 42px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {(['All', 'Active', 'Inactive'] as const).map(s => (
                <button key={s} onClick={() => setStatusFilter(s)} style={{ padding: '10px 16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: statusFilter === s ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.03)', color: statusFilter === s ? '#818cf8' : '#64748b', cursor: 'pointer', fontSize: '13px', fontWeight: statusFilter === s ? 600 : 400, transition: 'all 0.2s' }}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Company Cards */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px', color: '#64748b' }}>
              <RefreshCw size={32} style={{ animation: 'spin 1s linear infinite', marginBottom: '12px' }} />
              <div>Loading companies...</div>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px', color: '#64748b' }}>
              <Building2 size={40} style={{ marginBottom: '12px', opacity: 0.5 }} />
              <div>No sourcing companies found</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
              {filtered.map(company => (
                <div
                  key={company.id}
                  onClick={() => handleSelectCompany(company)}
                  style={{
                    background: selectedCompany?.id === company.id ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${selectedCompany?.id === company.id ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.08)'}`,
                    borderRadius: '16px',
                    padding: '20px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    backdropFilter: 'blur(10px)',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {/* Status badge */}
                  <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
                    <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, background: company.status === 'Active' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: company.status === 'Active' ? '#10b981' : '#ef4444', border: `1px solid ${company.status === 'Active' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}` }}>
                      {company.status}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '16px', paddingRight: '60px' }}>
                    <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'linear-gradient(135deg, #3b82f6, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0 }}>
                      {FLAG_MAP[company.country] || '🌏'}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '15px', color: 'white', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{company.name}</div>
                      <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Globe2 size={11} /> {company.country || 'Unknown'}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                    {[
                      { label: 'Sires', value: company.sireCount, icon: <Dna size={13} />, color: '#3b82f6' },
                      { label: 'Stock', value: company.stockCount, icon: <Beef size={13} />, color: '#f59e0b' },
                    ].map((m, i) => (
                      <div key={i} style={{ flex: 1, background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', color: m.color, marginBottom: '4px' }}>{m.icon}</div>
                        <div style={{ fontSize: '18px', fontWeight: 700, color: 'white' }}>{m.value}</div>
                        <div style={{ fontSize: '10px', color: '#64748b' }}>{m.label}</div>
                      </div>
                    ))}
                  </div>

                  {company.contactName && <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}><Star size={11} />{company.contactName}</div>}
                  {company.phone && <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={11} />{company.phone}</div>}
                  {company.email && <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}><Mail size={11} />{company.email}</div>}

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={e => { e.stopPropagation(); openEdit(company); }} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#94a3b8', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', transition: 'all 0.2s' }}>
                      <Edit3 size={12} /> Edit
                    </button>
                    {company.website && (
                      <a href={company.website} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#94a3b8', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', textDecoration: 'none', transition: 'all 0.2s' }}>
                        <ExternalLink size={12} /> Website
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detail Panel */}
        {selectedCompany && (
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '24px', height: 'fit-content', position: 'sticky', top: '24px', backdropFilter: 'blur(16px)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: 'white', fontSize: '16px', fontWeight: 700 }}>Company Detail</h3>
              <button onClick={() => setSelectedCompany(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}>
                <X size={16} />
              </button>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: 'linear-gradient(135deg, #3b82f6, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', margin: '0 auto 12px' }}>
                {FLAG_MAP[selectedCompany.country] || '🌏'}
              </div>
              <div style={{ fontWeight: 700, fontSize: '18px', color: 'white', marginBottom: '4px' }}>{selectedCompany.name}</div>
              <div style={{ fontSize: '13px', color: '#64748b' }}>{selectedCompany.country}</div>
              <span style={{ marginTop: '8px', display: 'inline-block', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, background: selectedCompany.status === 'Active' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: selectedCompany.status === 'Active' ? '#10b981' : '#ef4444' }}>
                {selectedCompany.status}
              </span>
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '16px', marginBottom: '16px' }}>
              {[
                { label: 'Contact', value: selectedCompany.contactName, icon: <Star size={13} /> },
                { label: 'Phone', value: selectedCompany.phone, icon: <Phone size={13} /> },
                { label: 'Email', value: selectedCompany.email, icon: <Mail size={13} /> },
                { label: 'Address', value: selectedCompany.address, icon: <MapPin size={13} /> },
                { label: 'Website', value: selectedCompany.website, icon: <Globe size={13} />, link: true },
              ].filter(f => f.value).map((f, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'flex-start' }}>
                  <div style={{ color: '#64748b', marginTop: '2px', flexShrink: 0 }}>{f.icon}</div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{f.label}</div>
                    {f.link ? (
                      <a href={f.value} target="_blank" rel="noreferrer" style={{ fontSize: '13px', color: '#818cf8', textDecoration: 'none', wordBreak: 'break-all' }}>{f.value}</a>
                    ) : (
                      <div style={{ fontSize: '13px', color: '#e2e8f0', wordBreak: 'break-word' }}>{f.value}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Sires from this company */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '16px' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#94a3b8', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Dna size={13} /> Registered Sires ({selectedCompany.sireCount})
              </div>
              {siresLoading ? (
                <div style={{ textAlign: 'center', color: '#64748b', padding: '20px 0', fontSize: '13px' }}>Loading sires...</div>
              ) : companySires.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#64748b', padding: '20px 0', fontSize: '13px' }}>No sires from this company yet</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                  {companySires.map((sire: any) => (
                    <div key={sire.id} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'white' }}>{sire.name}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{sire.breed}</div>
                      </div>
                      {sire.price_usd && (
                        <div style={{ fontSize: '12px', color: '#f59e0b', fontWeight: 600 }}>${sire.price_usd}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button onClick={() => openEdit(selectedCompany)} style={{ marginTop: '20px', width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid rgba(99,102,241,0.4)', background: 'rgba(99,102,241,0.1)', color: '#818cf8', cursor: 'pointer', fontWeight: 600, fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s' }}>
              <Edit3 size={14} /> Edit Company
            </button>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)', padding: '20px' }}>
          <div style={{ background: '#0f1729', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', width: '100%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto', padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: 'white' }}>
                  {editTarget ? 'Edit Sourcing Company' : 'Add Sourcing Company'}
                </h2>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>Sire genetic material supplier</p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}>
                <X size={20} />
              </button>
            </div>

            {error && (
              <div style={{ padding: '12px 16px', borderRadius: '10px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', fontSize: '13px', marginBottom: '20px' }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Company Name */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Company Name *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. ABS Global Inc." style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {/* Country */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Country</label>
                  <select value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }}>
                    {COUNTRIES.map(c => <option key={c} value={c} style={{ background: '#1e293b' }}>{FLAG_MAP[c] || '🌏'} {c}</option>)}
                  </select>
                </div>
                {/* Status */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }}>
                    <option value="Active" style={{ background: '#1e293b' }}>Active</option>
                    <option value="Inactive" style={{ background: '#1e293b' }}>Inactive</option>
                  </select>
                </div>
              </div>

              {/* Contact Name */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Contact Person</label>
                <input value={form.contactName} onChange={e => setForm(f => ({ ...f, contactName: e.target.value }))} placeholder="Contact name" style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Phone</label>
                  <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+1 800 000 0000" style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email</label>
                  <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="info@company.com" style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Website</label>
                <input value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} placeholder="https://www.company.com" style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Address</label>
                <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Full address" style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Notes</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Additional notes..." rows={3} style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '14px', boxSizing: 'border-box', outline: 'none', resize: 'vertical' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '28px' }}>
              <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: '13px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}>
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving} style={{ flex: 2, padding: '13px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #3b82f6, #6366f1)', color: 'white', cursor: 'pointer', fontWeight: 700, fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: saving ? 0.7 : 1, boxShadow: '0 4px 16px rgba(99,102,241,0.4)' }}>
                {saving ? <><RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> Saving...</> : <><CheckCircle2 size={14} /> {editTarget ? 'Update Company' : 'Add Company'}</>}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        input::placeholder, textarea::placeholder { color: #475569; }
        select option { background: #1e293b; color: white; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
      `}</style>
    </div>
  );
}
