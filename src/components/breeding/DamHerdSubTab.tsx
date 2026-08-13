import React, { useState, useMemo, useEffect } from 'react';
import { Search, Plus, Edit, User, Building2, Calendar, ShieldCheck, HeartPulse, Filter, ArrowUpDown } from 'lucide-react';
import { fetchDamFormOptionsAction } from '@/app/actions';

export interface DamRecord {
  id: string;
  cowOwner: string;
  ownerType?: 'Farm' | 'Cow Owner';
  farmLocation?: string;
  ownerContact?: string;
  tagId: string;
  registrationNumber?: string;
  name: string;
  breed: string;
  generation?: string;
  dob: string;
  ageYears?: string;
  parity?: number;
  weight?: string;
  height?: string;
  color?: string;
  bcs?: number;
  healthStatus?: string;
  status?: 'Available' | 'In Breeding Program' | 'Pregnant' | 'Nursing' | 'Retired' | 'Sold' | 'Inactive';
  lastCalvingDate?: string;
  damBreed?: string;
  damName?: string;
  sireBreed?: string;
  sireName?: string;
  note?: string;
  imageUrl?: string;
  sex: 'Female';
}

const DAM_BREEDS = ['Angus', 'Brahman', 'Wagyu', 'Charolais', 'Hereford', 'Limousin', 'Simmental', 'Droughtmaster', 'Local/Cross'];
const DAM_GENERATIONS = ['F1', 'F2', 'F3', 'F4', 'F5', 'Purebred', 'Local'];

const MASTER_FARMS = [
  { code: 'FARM-001', name: '0001 - SNR Farm Facility', location: 'Kampong Cham', contact: '+855 12 345 678' },
  { code: 'FARM-002', name: '0002 - Kaksedthan Main Ranch', location: 'Battambang', contact: '+855 12 999 888' },
  { code: 'FARM-003', name: '0003 - Grassland Breeding Center', location: 'Takeo', contact: '+855 12 777 666' }
];

const MASTER_COW_OWNERS = [
  { name: '0001 - SNR Farm', contact: '+855 12 345 678', address: 'Kampong Cham, Cambodia' },
  { name: 'Lok Oknha Heng', contact: '+855 12 888 999', address: 'Phnom Penh, Cambodia' },
  { name: 'Neak Oknha Sok', contact: '+855 11 777 666', address: 'Siem Reap, Cambodia' },
  { name: 'Sovan Agriculture', contact: '+855 92 555 444', address: 'Kandal, Cambodia' }
];

interface DamHerdSubTabProps {
  damRecords: DamRecord[];
  onOpenDetailView: (type: 'dam', dam: DamRecord) => void;
  onSaveDam: (damData: Partial<DamRecord>, mode: 'create' | 'edit', editingId?: string | null) => Promise<void>;
  onDeleteDam?: (id: string) => Promise<void>;
  onOpenCalfModal: (rec?: any, presetDamId?: string) => void;
  onImageFileSelect: (file: File, callback: (url: string) => void) => void;
}

export default function DamHerdSubTab({
  damRecords,
  onOpenDetailView,
  onSaveDam,
  onOpenCalfModal,
  onImageFileSelect
}: DamHerdSubTabProps) {
  // ── FILTER STATES (NO BREED FILTER) ──
  const [damSearchQuery, setDamSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [farmFilter, setFarmFilter] = useState<string>('ALL');
  const [ownerFilter, setOwnerFilter] = useState<string>('ALL');
  const [ageCategoryFilter, setAgeCategoryFilter] = useState<string>('ALL');
  const [sortOption, setSortOption] = useState<string>('LATEST');

  // ── REGISTER / EDIT DAM FORM WIZARD STATE ──
  const [isDamModalOpen, setIsDamModalOpen] = useState(false);
  const [damModalMode, setDamModalMode] = useState<'create' | 'edit'>('create');
  const [editingDamId, setEditingDamId] = useState<string | null>(null);

  // Section 1: Basic Info
  const [dId, setDId] = useState('');
  const [dName, setDName] = useState('');
  const [dTagId, setDTagId] = useState('');
  const [dRegNum, setDRegNum] = useState('');
  const [dBreed, setDBreed] = useState('Angus');
  const [dGeneration, setDGeneration] = useState('F1');
  const [dDob, setDDob] = useState('');
  const [calculatedAge, setCalculatedAge] = useState('');

  // Section 2: Ownership Info
  const [ownerTypeInput, setOwnerTypeInput] = useState<'Farm' | 'Cow Owner'>('Farm');
  const [selectedFarmName, setSelectedFarmName] = useState('0001 - SNR Farm Facility');
  const [selectedOwnerName, setSelectedOwnerName] = useState('0001 - SNR Farm');

  const [masterFarmsList, setMasterFarmsList] = useState(MASTER_FARMS);
  const [masterOwnersList, setMasterOwnersList] = useState(MASTER_COW_OWNERS);

  useEffect(() => {
    fetchDamFormOptionsAction().then((res) => {
      if (res.success && res.data) {
        if (res.data.farms?.length > 0) {
          const mappedFarms = res.data.farms.map((f: any) => ({
            code: f.code || f.id,
            name: f.name,
            location: f.address || f.province || 'Station Location',
            contact: f.phone || '+855 12 345 678'
          }));
          setMasterFarmsList(mappedFarms);
          setSelectedFarmName(mappedFarms[0].name);
        }
        if (res.data.customers?.length > 0) {
          const mappedOwners = res.data.customers.map((c: any) => ({
            name: c.name,
            contact: c.phone || '+855 12 345 678',
            address: c.address || 'Cambodia'
          }));
          setMasterOwnersList(mappedOwners);
          setSelectedOwnerName(mappedOwners[0].name);
        }
      }
    });
  }, []);

  // Section 3: Physical Info
  const [dWeight, setDWeight] = useState('');
  const [dHeight, setDHeight] = useState('');
  const [dColor, setDColor] = useState('');
  const [dBcs, setDBcs] = useState<number>(3);
  const [dHealthStatus, setDHealthStatus] = useState('Healthy & Prime Reproductive Status');

  // Section 4: Breeding Info
  const [dStatus, setDStatus] = useState<'Available' | 'In Breeding Program' | 'Pregnant' | 'Nursing' | 'Retired' | 'Sold' | 'Inactive'>('Available');
  const [dParity, setDParity] = useState(1);
  const [dLastCalvingDate, setDLastCalvingDate] = useState('');
  const [dNote, setDNote] = useState('');

  // Section 5: Image
  const [dImageUrl, setDImageUrl] = useState('');

  const calculateAgeFromDob = (dobStr: string) => {
    if (!dobStr) return '';
    const birth = new Date(dobStr);
    const now = new Date();
    const diffMonths = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
    if (diffMonths < 12) return `${diffMonths} Months`;
    const years = Math.floor(diffMonths / 12);
    const remMonths = diffMonths % 12;
    return remMonths > 0 ? `${years} Yrs ${remMonths} Mos` : `${years} Years`;
  };

  const handleDobChange = (dateVal: string) => {
    setDDob(dateVal);
    setCalculatedAge(calculateAgeFromDob(dateVal));
  };

  const openDamModal = (dam?: DamRecord) => {
    if (dam) {
      setDamModalMode('edit');
      setEditingDamId(dam.id);
      setDId(dam.id);
      setDName(dam.name || '');
      setDTagId(dam.tagId || '');
      setDRegNum(dam.registrationNumber || `REG-${dam.tagId || dam.id}`);
      setDBreed(dam.breed || 'Angus');
      setDGeneration(dam.generation || 'F1');
      setDDob(dam.dob || '');
      setCalculatedAge(calculateAgeFromDob(dam.dob || ''));

      setOwnerTypeInput(dam.ownerType || 'Farm');
      setSelectedFarmName(dam.farmLocation || '0001 - SNR Farm Facility');
      setSelectedOwnerName(dam.cowOwner || '0001 - SNR Farm');

      setDWeight(dam.weight || '');
      setDHeight(dam.height || '');
      setDColor(dam.color || '');
      setDBcs(dam.bcs || 3);
      setDHealthStatus(dam.healthStatus || 'Healthy & Prime Reproductive Status');

      setDStatus(dam.status || 'Available');
      setDParity(dam.parity || 1);
      setDLastCalvingDate(dam.lastCalvingDate || '');
      setDNote(dam.note || '');
      setDImageUrl(dam.imageUrl || '');
    } else {
      setDamModalMode('create');
      setEditingDamId(null);
      const autoId = `DAM-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      setDId(autoId);
      setDName('');
      setDTagId(`TAG-${Math.floor(1000 + Math.random() * 9000)}`);
      setDRegNum(`REG-${autoId}`);
      setDBreed('Angus');
      setDGeneration('F1');
      setDDob('');
      setCalculatedAge('');

      setOwnerTypeInput('Farm');
      setSelectedFarmName('0001 - SNR Farm Facility');
      setSelectedOwnerName('0001 - SNR Farm');

      setDWeight('480');
      setDHeight('138');
      setDColor('Black');
      setDBcs(3);
      setDHealthStatus('Healthy & Prime Reproductive Status');

      setDStatus('Available');
      setDParity(1);
      setDLastCalvingDate('');
      setDNote('');
      setDImageUrl('');
    }
    setIsDamModalOpen(true);
  };

  const handleDamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const farmObj = masterFarmsList.find(f => f.name === selectedFarmName) || masterFarmsList[0];
    const ownerObj = masterOwnersList.find(o => o.name === selectedOwnerName) || masterOwnersList[0];

    await onSaveDam({
      id: dId,
      cowOwner: ownerTypeInput === 'Farm' ? farmObj.name : ownerObj.name,
      ownerType: ownerTypeInput,
      farmLocation: farmObj.name,
      ownerContact: ownerTypeInput === 'Farm' ? farmObj.contact : ownerObj.contact,
      tagId: dTagId,
      registrationNumber: dRegNum,
      name: dName,
      breed: dBreed,
      generation: dGeneration,
      dob: dDob,
      ageYears: calculatedAge,
      parity: dParity,
      weight: dWeight,
      height: dHeight,
      color: dColor,
      bcs: dBcs,
      healthStatus: dHealthStatus,
      status: dStatus,
      lastCalvingDate: dLastCalvingDate,
      note: dNote,
      imageUrl: dImageUrl || 'https://images.unsplash.com/photo-1546445317-29f4545f9d52?auto=format&fit=crop&w=800&q=80',
      sex: 'Female'
    }, damModalMode, editingDamId);

    setIsDamModalOpen(false);
  };

  // Selected objects for auto-populated card
  const selectedFarmObj = masterFarmsList.find(f => f.name === selectedFarmName) || masterFarmsList[0];
  const selectedOwnerObj = masterOwnersList.find(o => o.name === selectedOwnerName) || masterOwnersList[0];

  // ── ADVANCED FILTERING & SORTING (NO BREED FILTER) ──
  const filteredAndSortedDams = useMemo(() => {
    return damRecords
      .filter(d => {
        // Search Filter (Dam ID, Name, Tag, Reg #, Owner, Farm)
        const q = damSearchQuery.toLowerCase();
        const matchesSearch = !q || (
          d.name.toLowerCase().includes(q) ||
          d.tagId.toLowerCase().includes(q) ||
          d.id.toLowerCase().includes(q) ||
          (d.registrationNumber && d.registrationNumber.toLowerCase().includes(q)) ||
          d.cowOwner.toLowerCase().includes(q) ||
          (d.farmLocation && d.farmLocation.toLowerCase().includes(q))
        );

        // Status Filter
        const matchesStatus = statusFilter === 'ALL' || (d.status || 'Available') === statusFilter;

        // Farm Filter
        const matchesFarm = farmFilter === 'ALL' || (d.farmLocation || d.cowOwner) === farmFilter;

        // Owner Filter
        const matchesOwner = ownerFilter === 'ALL' || d.cowOwner === ownerFilter;

        // Age Category Filter
        let matchesAge = true;
        if (ageCategoryFilter !== 'ALL' && d.dob) {
          const birth = new Date(d.dob);
          const now = new Date();
          const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
          if (ageCategoryFilter === 'Calf') matchesAge = months < 12;
          else if (ageCategoryFilter === 'Heifer') matchesAge = months >= 12 && months < 24;
          else if (ageCategoryFilter === 'Adult') matchesAge = months >= 24 && months < 72;
          else if (ageCategoryFilter === 'Senior') matchesAge = months >= 72;
        }

        return matchesSearch && matchesStatus && matchesFarm && matchesOwner && matchesAge;
      })
      .sort((a, b) => {
        if (sortOption === 'NAME_ASC') return a.name.localeCompare(b.name);
        if (sortOption === 'NAME_DESC') return b.name.localeCompare(a.name);
        if (sortOption === 'YOUNGEST_AGE') return new Date(b.dob || 0).getTime() - new Date(a.dob || 0).getTime();
        if (sortOption === 'OLDEST_AGE') return new Date(a.dob || 0).getTime() - new Date(b.dob || 0).getTime();
        if (sortOption === 'OLDEST') return a.id.localeCompare(b.id);
        // Default: LATEST
        return b.id.localeCompare(a.id);
      });
  }, [damRecords, damSearchQuery, statusFilter, farmFilter, ownerFilter, ageCategoryFilter, sortOption]);

  const getStatusBadgeStyle = (statusStr?: string) => {
    switch (statusStr) {
      case 'In Breeding Program':
        return { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE', icon: '🔵', label: 'In Breeding Program' };
      case 'Pregnant':
        return { bg: '#FEF3C7', text: '#92400E', border: '#FDE68A', icon: '🟡', label: 'Pregnant' };
      case 'Nursing':
        return { bg: '#FFEDD5', text: '#C2410C', border: '#FED7AA', icon: '🟠', label: 'Nursing' };
      case 'Retired':
        return { bg: '#F1F5F9', text: '#475569', border: '#CBD5E1', icon: '⚫', label: 'Retired' };
      case 'Sold':
        return { bg: '#FEE2E2', text: '#B91C1C', border: '#FCA5A5', icon: '🔴', label: 'Sold' };
      case 'Inactive':
        return { bg: '#E2E8F0', text: '#64748B', border: '#CBD5E1', icon: '⚪', label: 'Inactive' };
      default:
        return { bg: '#DCFCE7', text: '#15803D', border: '#BBF7D0', icon: '🟢', label: 'Available' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', background: 'white', padding: '16px', borderRadius: '16px', border: '1px solid #E5E7EB' }}>
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
            🐄 Dam Listing — Female Breeding Herd ({filteredAndSortedDams.length})
          </h2>
          <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0' }}>Internal livestock management for female breeding dams</p>
        </div>
        <button
          onClick={() => openDamModal()}
          style={{ background: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', padding: '9px 18px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          className="hover:bg-[#15803d] transition-colors shadow-xs"
        >
          <Plus className="h-4 w-4" />
          Register Dam
        </button>
      </div>

      {/* ── PRACTICAL FILTER BAR (SEARCH, STATUS, FARM, OWNER, AGE CATEGORY, SORT) ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', background: '#F8FAFC', padding: '12px', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: '220px', maxWidth: '300px' }}>
          <Search className="h-3.5 w-3.5" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
          <input
            type="text"
            placeholder="Search Dam ID, Tag #, Reg #, Owner..."
            value={damSearchQuery}
            onChange={e => setDamSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '8px 12px 8px 32px', fontSize: '12px', border: '1px solid #CBD5E1', borderRadius: '8px', outline: 'none', color: '#111827', background: 'white' }}
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          style={{ padding: '8px 12px', fontSize: '12px', fontWeight: 600, border: '1px solid #CBD5E1', borderRadius: '8px', background: 'white', color: '#334155', cursor: 'pointer' }}
        >
          <option value="ALL">All Statuses</option>
          <option value="Available">🟢 Available</option>
          <option value="In Breeding Program">🔵 In Breeding Program</option>
          <option value="Pregnant">🟡 Pregnant</option>
          <option value="Nursing">🟠 Nursing</option>
          <option value="Retired">⚫ Retired</option>
          <option value="Sold">🔴 Sold</option>
          <option value="Inactive">⚪ Inactive</option>
        </select>

        {/* Farm Filter */}
        <select
          value={farmFilter}
          onChange={e => setFarmFilter(e.target.value)}
          style={{ padding: '8px 12px', fontSize: '12px', fontWeight: 600, border: '1px solid #CBD5E1', borderRadius: '8px', background: 'white', color: '#334155', cursor: 'pointer' }}
        >
          <option value="ALL">All Farms</option>
          {MASTER_FARMS.map(f => (
            <option key={f.code} value={f.name}>{f.name}</option>
          ))}
        </select>

        {/* Owner Filter */}
        <select
          value={ownerFilter}
          onChange={e => setOwnerFilter(e.target.value)}
          style={{ padding: '8px 12px', fontSize: '12px', fontWeight: 600, border: '1px solid #CBD5E1', borderRadius: '8px', background: 'white', color: '#334155', cursor: 'pointer' }}
        >
          <option value="ALL">All Cow Owners</option>
          {MASTER_COW_OWNERS.map(o => (
            <option key={o.name} value={o.name}>{o.name}</option>
          ))}
        </select>

        {/* Age Category Filter */}
        <select
          value={ageCategoryFilter}
          onChange={e => setAgeCategoryFilter(e.target.value)}
          style={{ padding: '8px 12px', fontSize: '12px', fontWeight: 600, border: '1px solid #CBD5E1', borderRadius: '8px', background: 'white', color: '#334155', cursor: 'pointer' }}
        >
          <option value="ALL">All Ages</option>
          <option value="Calf">Calf (&lt; 12 mos)</option>
          <option value="Heifer">Heifer (12–24 mos)</option>
          <option value="Adult">Adult Cow (24–72 mos)</option>
          <option value="Senior">Senior Cow (&gt; 72 mos)</option>
        </select>

        {/* Sort Options */}
        <select
          value={sortOption}
          onChange={e => setSortOption(e.target.value)}
          style={{ padding: '8px 12px', fontSize: '12px', fontWeight: 600, border: '1px solid #CBD5E1', borderRadius: '8px', background: 'white', color: '#334155', cursor: 'pointer', marginLeft: 'auto' }}
        >
          <option value="LATEST">Sort: Latest Registered</option>
          <option value="OLDEST">Sort: Oldest Registered</option>
          <option value="NAME_ASC">Name (A–Z)</option>
          <option value="NAME_DESC">Name (Z–A)</option>
          <option value="YOUNGEST_AGE">Youngest DOB</option>
          <option value="OLDEST_AGE">Oldest DOB</option>
        </select>
      </div>

      {/* ── CARD GRID: Matching Sire Insemination Module Design Standards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {filteredAndSortedDams.map(dam => {
          const badge = getStatusBadgeStyle(dam.status);
          const damAge = dam.ageYears || calculateAgeFromDob(dam.dob);

          return (
            <div
              key={dam.id}
              onClick={() => onOpenDetailView('dam', dam)}
              style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
              className="hover:shadow-xl hover:-translate-y-1 transition-all duration-200 group"
            >
              {/* 1. IMAGE CONTAINER: 240px fixed height with blurred backdrop & status badge (no stretch) */}
              <div style={{ position: 'relative', width: '100%', height: '240px', background: '#0F172A', overflow: 'hidden', borderBottom: '1px solid #E2E8F0' }}>
                <img
                  src={dam.imageUrl || 'https://images.unsplash.com/photo-1546445317-29f4545f9d52?auto=format&fit=crop&w=800&q=80'}
                  alt=""
                  aria-hidden="true"
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', filter: 'blur(20px)', opacity: 0.5, transform: 'scale(1.15)' }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546445317-29f4545f9d52?auto=format&fit=crop&w=800&q=80';
                  }}
                />

                <img
                  src={dam.imageUrl || 'https://images.unsplash.com/photo-1546445317-29f4545f9d52?auto=format&fit=crop&w=800&q=80'}
                  alt={dam.name}
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', zIndex: 1 }}
                  className="group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546445317-29f4545f9d52?auto=format&fit=crop&w=800&q=80';
                  }}
                />

                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '60px', background: 'linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 100%)', zIndex: 2 }} />

                {/* Color-Coded Status Badge */}
                <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 3 }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, padding: '4px 10px', borderRadius: '8px', background: badge.bg, color: badge.text, border: `1px solid ${badge.border}`, backdropFilter: 'blur(4px)', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                    {badge.icon} {badge.label}
                  </span>
                </div>
              </div>

              {/* 2. CARD CONTENT BODY */}
              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', flexWrap: 'wrap' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: 0, lineHeight: 1.3 }}>
                      {dam.name}
                    </h3>
                    <span style={{ fontSize: '13px', color: '#CBD5E1', fontWeight: 600 }}>•</span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#9d174d', whiteSpace: 'nowrap' }}>
                      {dam.breed} (♀ Female)
                    </span>
                  </div>
                  <p style={{ fontSize: '11px', color: '#94A3B8', fontFamily: 'monospace', fontWeight: 600, margin: '4px 0 0' }}>
                    Tag: #{dam.tagId || dam.id} | Reg: {dam.registrationNumber || dam.id}
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', background: '#F8FAFC', padding: '10px 12px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <div>
                    <p style={{ fontSize: '10px', color: '#64748B', fontWeight: 700, margin: 0, textTransform: 'uppercase' }}>📅 Age & DOB</p>
                    <p style={{ fontSize: '12px', color: '#0F172A', fontWeight: 800, margin: '2px 0 0' }}>
                      {damAge || '3 Years'} ({dam.dob ? new Date(dam.dob).toLocaleDateString('en-GB') : 'N/A'})
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: '10px', color: '#64748B', fontWeight: 700, margin: 0, textTransform: 'uppercase' }}>🏠 Owner & Farm</p>
                    <p style={{ fontSize: '12px', color: '#0F172A', fontWeight: 700, margin: '2px 0 0' }} className="truncate">
                      {dam.cowOwner}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: '#475569', borderTop: '1px solid #F1F5F9', paddingTop: '8px' }}>
                  <span>⚖️ Weight: <strong>{dam.weight ? `${dam.weight} kg` : '480 kg'}</strong></span>
                  <span>👶 Parity: <strong>{dam.parity || 1} Calves</strong></span>
                </div>
              </div>

              {/* 3. CARD FOOTER ACTIONS (NO QR CODE, NO DELETE) */}
              <div style={{ padding: '12px 16px', borderTop: '1px solid #F1F5F9', background: '#FFF5F8', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  onClick={(e) => { e.stopPropagation(); openDamModal(dam); }}
                  style={{ flex: 1, background: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 12px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  className="hover:bg-[#15803d] transition-colors"
                >
                  <Edit className="h-3.5 w-3.5" />
                  Edit Log
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onOpenCalfModal(undefined, dam.tagId || dam.id); }}
                  style={{ flex: 1, background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '8px', padding: '8px 12px', fontSize: '12px', fontWeight: 700, color: '#15803d', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                  className="hover:bg-emerald-100 transition-colors"
                >
                  + Register Birth
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── REGISTER / EDIT DAM FORM WIZARD (5 STRUCTURED SECTIONS) ─── */}
      {isDamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm overflow-y-auto p-4 py-8">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-3xl overflow-hidden my-auto">
            
            {/* Form Header */}
            <div className="bg-pink-950 text-white p-5 px-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-300 font-bold text-xl">
                  🐄
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    {damModalMode === 'create' ? 'Register Dam Wizard (5 Structured Sections)' : 'Edit Dam Breeding Record'}
                  </h3>
                  <p className="text-xs text-pink-200">Internal female breeding cow management — Sex auto-set to Female</p>
                </div>
              </div>
              <button
                onClick={() => setIsDamModalOpen(false)}
                className="w-8 h-8 rounded-full bg-pink-900 hover:bg-pink-800 text-pink-200 flex items-center justify-center text-sm transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body: 5 Grouped Form Sections */}
            <form onSubmit={handleDamSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              
              {/* SECTION 1: Basic Information */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-black text-slate-800 uppercase tracking-wider">
                  <span className="w-6 h-6 rounded-lg bg-pink-700 text-white flex items-center justify-center text-xs">1</span>
                  📋 Section 1: Basic Information
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Dam ID (Auto-Generated) *</label>
                    <input
                      type="text"
                      readOnly
                      value={dId}
                      className="w-full px-3 py-2 font-mono font-bold text-pink-700 bg-slate-100 border border-slate-300 rounded-xl outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Dam Name *</label>
                    <input
                      required
                      type="text"
                      value={dName}
                      onChange={e => setDName(e.target.value)}
                      placeholder="e.g. Lady Supreme"
                      className="w-full px-3 py-2 font-bold text-slate-800 bg-white border border-slate-300 rounded-xl focus:ring-1 focus:ring-pink-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Ear Tag / Tag ID *</label>
                    <input
                      required
                      type="text"
                      value={dTagId}
                      onChange={e => setDTagId(e.target.value)}
                      placeholder="e.g. 0000049"
                      className="w-full px-3 py-2 font-bold text-slate-800 bg-white border border-slate-300 rounded-xl focus:ring-1 focus:ring-pink-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Registration Number</label>
                    <input
                      type="text"
                      value={dRegNum}
                      onChange={e => setDRegNum(e.target.value)}
                      placeholder="e.g. REG-DAM-0042"
                      className="w-full px-3 py-2 font-bold font-mono text-slate-800 bg-white border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Breed *</label>
                    <select
                      value={dBreed}
                      onChange={e => setDBreed(e.target.value)}
                      className="w-full px-3 py-2 font-bold border border-slate-300 rounded-xl bg-white text-slate-800 cursor-pointer"
                    >
                      {DAM_BREEDS.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Birth Date</label>
                    <input
                      type="date"
                      value={dDob}
                      onChange={e => handleDobChange(e.target.value)}
                      className="w-full px-3 py-2 font-bold border border-slate-300 rounded-xl bg-white text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Age (Auto-Calculated)</label>
                    <input
                      type="text"
                      readOnly
                      value={calculatedAge || 'N/A'}
                      className="w-full px-3 py-2 font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 rounded-xl outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Generation</label>
                    <select
                      value={dGeneration}
                      onChange={e => setDGeneration(e.target.value)}
                      className="w-full px-3 py-2 font-bold border border-slate-300 rounded-xl bg-white text-slate-800"
                    >
                      {DAM_GENERATIONS.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Gender (Fixed)</label>
                    <input
                      type="text"
                      readOnly
                      value="♀ Female"
                      className="w-full px-3 py-2 font-bold text-pink-700 bg-pink-50 border border-pink-300 rounded-xl outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: Ownership Information (Farm vs Cow Owner) */}
              <div className="bg-purple-50/50 border border-purple-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-black text-purple-900 uppercase tracking-wider">
                    <span className="w-6 h-6 rounded-lg bg-purple-600 text-white flex items-center justify-center text-xs">2</span>
                    🏠 Section 2: Ownership Information (Farm vs Cow Owner)
                  </div>
                  
                  {/* Owner Type Selector */}
                  <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-purple-200">
                    <button
                      type="button"
                      onClick={() => setOwnerTypeInput('Farm')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        ownerTypeInput === 'Farm'
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Building2 className="w-3 h-3 inline mr-1" /> Farm Module
                    </button>
                    <button
                      type="button"
                      onClick={() => setOwnerTypeInput('Cow Owner')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        ownerTypeInput === 'Cow Owner'
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <User className="w-3 h-3 inline mr-1" /> Cow Owner Module
                    </button>
                  </div>
                </div>

                {ownerTypeInput === 'Farm' ? (
                  <div>
                    <label className="block text-[11px] font-bold text-purple-950 mb-1">Select Farm Record *</label>
                    <select
                      value={selectedFarmName}
                      onChange={e => setSelectedFarmName(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-bold border border-purple-300 rounded-xl bg-white text-slate-900 shadow-xs"
                    >
                      {masterFarmsList.map(f => (
                        <option key={f.code} value={f.name}>
                          {f.name} — ({f.location}, Code: {f.code})
                        </option>
                      ))}
                    </select>
                    {selectedFarmObj && (
                      <div className="mt-2 text-[11px] bg-white p-2.5 rounded-xl border border-purple-200 grid grid-cols-3 gap-2">
                        <p><strong>Farm Name:</strong> {selectedFarmObj.name}</p>
                        <p><strong>Farm Code:</strong> {selectedFarmObj.code}</p>
                        <p><strong>Location:</strong> {selectedFarmObj.location}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <label className="block text-[11px] font-bold text-purple-950 mb-1">Select Cow Owner Record *</label>
                    <select
                      value={selectedOwnerName}
                      onChange={e => setSelectedOwnerName(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-bold border border-purple-300 rounded-xl bg-white text-slate-900 shadow-xs"
                    >
                      {masterOwnersList.map(o => (
                        <option key={o.name} value={o.name}>
                          {o.name} — ({o.address})
                        </option>
                      ))}
                    </select>
                    {selectedOwnerObj && (
                      <div className="mt-2 text-[11px] bg-white p-2.5 rounded-xl border border-purple-200 grid grid-cols-3 gap-2">
                        <p><strong>Owner Name:</strong> {selectedOwnerObj.name}</p>
                        <p><strong>Phone Number:</strong> {selectedOwnerObj.contact}</p>
                        <p><strong>Address:</strong> {selectedOwnerObj.address}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* SECTION 3: Physical Information */}
              <div className="bg-sky-50/50 border border-sky-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-black text-sky-900 uppercase tracking-wider">
                  <span className="w-6 h-6 rounded-lg bg-sky-600 text-white flex items-center justify-center text-xs">3</span>
                  ⚖️ Section 3: Physical Information & Condition Score
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Weight (kg)</label>
                    <input
                      type="text"
                      value={dWeight}
                      onChange={e => setDWeight(e.target.value)}
                      placeholder="e.g. 480"
                      className="w-full px-3 py-2 font-bold border border-slate-300 rounded-xl bg-white text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Height (cm)</label>
                    <input
                      type="text"
                      value={dHeight}
                      onChange={e => setDHeight(e.target.value)}
                      placeholder="e.g. 138"
                      className="w-full px-3 py-2 font-bold border border-slate-300 rounded-xl bg-white text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Coat Color</label>
                    <input
                      type="text"
                      value={dColor}
                      onChange={e => setDColor(e.target.value)}
                      placeholder="e.g. Black / Red"
                      className="w-full px-3 py-2 font-bold border border-slate-300 rounded-xl bg-white text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Body Condition Score (BCS 1–5)</label>
                    <select
                      value={dBcs}
                      onChange={e => setDBcs(parseInt(e.target.value) || 3)}
                      className="w-full px-3 py-2 font-bold border border-slate-300 rounded-xl bg-white text-slate-800 cursor-pointer"
                    >
                      <option value={1}>1 - Thin / Emaciated</option>
                      <option value={2}>2 - Moderate / Lean</option>
                      <option value={3}>3 - Good / Prime Condition</option>
                      <option value={4}>4 - Heavy / Fat</option>
                      <option value={5}>5 - Obese</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Health Status</label>
                    <input
                      type="text"
                      value={dHealthStatus}
                      onChange={e => setDHealthStatus(e.target.value)}
                      className="w-full px-3 py-2 font-bold border border-slate-300 rounded-xl bg-white text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 4: Breeding Information & Status */}
              <div className="bg-pink-50/50 border border-pink-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-black text-pink-900 uppercase tracking-wider">
                  <span className="w-6 h-6 rounded-lg bg-pink-600 text-white flex items-center justify-center text-xs">4</span>
                  🩺 Section 4: Breeding Information & Current Status
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Current Status *</label>
                    <select
                      value={dStatus}
                      onChange={e => setDStatus(e.target.value as any)}
                      className="w-full px-3 py-2 font-bold border border-slate-300 rounded-xl bg-white text-slate-800 cursor-pointer"
                    >
                      <option value="Available">🟢 Available</option>
                      <option value="In Breeding Program">🔵 In Breeding Program</option>
                      <option value="Pregnant">🟡 Pregnant</option>
                      <option value="Nursing">🟠 Nursing</option>
                      <option value="Retired">⚫ Retired</option>
                      <option value="Sold">🔴 Sold</option>
                      <option value="Inactive">⚪ Inactive</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Previous Pregnancies (Parity)</label>
                    <input
                      type="number"
                      min="0"
                      value={dParity}
                      onChange={e => setDParity(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 font-bold border border-slate-300 rounded-xl bg-white text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Last Calving Date</label>
                    <input
                      type="date"
                      value={dLastCalvingDate}
                      onChange={e => setDLastCalvingDate(e.target.value)}
                      className="w-full px-3 py-2 font-bold border border-slate-300 rounded-xl bg-white text-slate-800"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Pedigree Notes & Health Observations</label>
                    <textarea
                      rows={2}
                      value={dNote}
                      onChange={e => setDNote(e.target.value)}
                      placeholder="Add dam pedigree background, veterinary history or breeding notes..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 5: Image Upload */}
              <div className="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-black text-emerald-900 uppercase tracking-wider">
                  <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs">5</span>
                  📷 Section 5: Image & Media Upload
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden border border-slate-300 shrink-0 bg-slate-900 relative">
                    <img
                      src={dImageUrl || 'https://images.unsplash.com/photo-1546445317-29f4545f9d52?auto=format&fit=crop&w=400&q=80'}
                      alt="Dam Preview"
                      className="w-full h-full object-cover object-center"
                    />
                  </div>
                  <div className="flex-1 text-xs space-y-2">
                    <label className="block text-[11px] font-bold text-slate-700">Select Dam Photo File & Auto-Crop</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) onImageFileSelect(file, (url) => setDImageUrl(url));
                      }}
                      className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-pink-700 file:text-white hover:file:bg-pink-800 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={dImageUrl}
                      onChange={e => setDImageUrl(e.target.value)}
                      placeholder="Or enter image URL preview (https://...)"
                      className="w-full px-3 py-2 font-mono text-xs border border-slate-300 rounded-xl bg-white text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsDamModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-pink-700 hover:bg-pink-800 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  Save Dam Record
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
