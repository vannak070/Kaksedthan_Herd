import React, { useState, useMemo, useEffect } from 'react';
import { Search, Plus, Trash2, Edit, Award } from 'lucide-react';
import { FullCalfRecord, SemenBull, DamRecord } from './types';
import { BreedingRecord } from '@/types/breeding.types';
import PedigreeCertificateSubTab from './PedigreeCertificateSubTab';

const CALF_BREEDS = ['Angus', 'Brahman', 'Wagyu', 'Charolais', 'Hereford', 'Limousin', 'Simmental', 'Droughtmaster', 'Local/Cross'];

interface CalvesHerdSubTabProps {
  calfRecords: FullCalfRecord[];
  semenBulls?: SemenBull[];
  damRecords?: DamRecord[];
  breedingRecords?: BreedingRecord[];
  onOpenDetailView: (type: 'calf', calf: FullCalfRecord) => void;
  onSaveCalf: (calf: FullCalfRecord) => Promise<void>;
  onDeleteCalf: (id: string) => Promise<void>;
  onViewCertificate: (calfId: string) => void;
  onImageFileSelect: (file: File, callback: (url: string) => void) => void;
  initialSubView?: 'listing' | 'certificates';
}

export default function CalvesHerdSubTab({
  calfRecords,
  semenBulls = [],
  damRecords = [],
  breedingRecords = [],
  onOpenDetailView,
  onSaveCalf,
  onDeleteCalf,
  onViewCertificate,
  onImageFileSelect,
  initialSubView = 'listing'
}: CalvesHerdSubTabProps) {
  // Check URL params for deep-linking (e.g., ?tab=calf-listing&view=certificates)
  const [subView, setSubView] = useState<'listing' | 'certificates'>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlView = params.get('view');
      if (urlView === 'certificates' || urlView === 'listing') return urlView;
    }
    return initialSubView || 'listing';
  });

  useEffect(() => {
    if (initialSubView && typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlView = params.get('view');
      if (!urlView) {
        setSubView(initialSubView);
      }
    }
  }, [initialSubView]);

  const handleSubViewChange = (newView: 'listing' | 'certificates') => {
    setSubView(newView);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('view', newView);
      window.history.replaceState({}, '', url.toString());
    }
  };

  const [selectedCertCalfId, setSelectedCertCalfId] = useState<string>(calfRecords[0]?.id || 'CALF-2025-0004');

  const selectedCalfForCert = useMemo(() => {
    return calfRecords.find(c => c.id === selectedCertCalfId || c.code === selectedCertCalfId) || calfRecords[0];
  }, [selectedCertCalfId, calfRecords]);

  const [calfSearchQuery, setCalfSearchQuery] = useState('');
  const [isCalfModalOpen, setIsCalfModalOpen] = useState(false);
  const [calfModalMode, setCalfModalMode] = useState<'create' | 'edit'>('create');
  const [editingCalfId, setEditingCalfId] = useState<string | null>(null);

  // ── REGISTRATION TYPE: Option 1 (Breeding Program) vs Option 2 (Manual) ──
  const [regMode, setRegMode] = useState<'BREEDING_PROGRAM' | 'MANUAL'>('BREEDING_PROGRAM');
  const [selectedBreedingId, setSelectedBreedingId] = useState<string>('');
  const [selectedSireId, setSelectedSireId] = useState<string>('');
  const [selectedDamId, setSelectedDamId] = useState<string>('');

  // ── FORM FIELDS ──
  const [cCalfName, setCCalfName] = useState('');
  const [cBreedingRecordId, setCBreedingRecordId] = useState('');
  const [cCode, setCCode] = useState('');
  const [cTagId, setCTagId] = useState('');
  const [cGeneration, setCGeneration] = useState('F1 (First Cross)');
  const [cPlaceOfBirth, setCPlaceOfBirth] = useState('Kandal / Ang Snoul');
  const [cBirthFacility, setCBirthFacility] = useState('Maternity Barn A');
  const [cBirthStatusCed, setCBirthStatusCed] = useState('Nature / Unassisted (Easy)');
  const [cDob, setCDob] = useState(new Date().toISOString().split('T')[0]);
  const [cTime, setCTime] = useState('08:30 AM');
  const [cSex, setCSex] = useState<'Female' | 'Male'>('Female');
  const [cColor, setCColor] = useState('Red & White');
  const [cBreed, setCBreed] = useState('Wagyu');
  const [cBirthWeight, setCBirthWeight] = useState('26.5');
  const [cHeight, setCHeight] = useState('68');
  const [cBodyLength, setCBodyLength] = useState('72');
  const [cChestSize, setCChestSize] = useState('64');
  const [cLegSize, setCLegSize] = useState('38');
  const [cGestationPeriod, setCGestationPeriod] = useState('283');
  const [cNumberOfCalf, setCNumberOfCalf] = useState('Single (1)');
  const [cBirthTemperature, setCBirthTemperature] = useState('38.5');
  const [cNavelTreatment, setCNavelTreatment] = useState(true);
  const [cVirusTest, setCVirusTest] = useState(true);
  const [cTimingOfFeeding, setCTimingOfFeeding] = useState('Immediate (<1h)');
  const [cMethodOfFeeding, setCMethodOfFeeding] = useState<string[]>(['Natural Nursing']);
  const [cImageUrl, setCImageUrl] = useState('');
  const [cSireId, setCSireId] = useState('');
  const [cSireName, setCSireName] = useState('');
  const [cSireBreed, setCSireBreed] = useState('Wagyu');
  const [cDamId, setCDamId] = useState('');
  const [cDamName, setCDamName] = useState('');
  const [cDamBreed, setCDamBreed] = useState('Wagyu Cross');
  const [cFarmName, setCFarmName] = useState('0001 - SNR Farm Facility');
  const [cOwnerName, setCOwnerName] = useState('0001 - SNR Farm');
  const [cProvinceDistrict, setCProvinceDistrict] = useState('Kandal / Ang Snoul');
  const [cVillageCommune, setCVillageCommune] = useState('Prek Anchanh');
  const [cGpsCoordinates, setCGpsCoordinates] = useState('11.4707 N, 104.9390 E');
  const [cNotes, setCNotes] = useState('');
  const [cCurrentStatus, setCCurrentStatus] = useState('Healthy & Vigorous 🟢');

  const [calfFormError, setCalfFormError] = useState('');
  const [isSubmittingCalf, setIsSubmittingCalf] = useState(false);

  // Active Breeding Records eligible for calving
  const activeBreedingRecords = useMemo(() => {
    return breedingRecords.filter(r => r.pregnancyStatus !== 'Calved' && r.pregnancyStatus !== 'Cancelled');
  }, [breedingRecords]);

  // Open Modal Handler
  const openCalfModal = (calf?: FullCalfRecord) => {
    if (calf) {
      setCalfModalMode('edit');
      setEditingCalfId(calf.id);
      setRegMode(calf.breedingRecordId ? 'BREEDING_PROGRAM' : 'MANUAL');
      setSelectedBreedingId(calf.breedingRecordId || '');
      setSelectedSireId(calf.sireId || '');
      setSelectedDamId(calf.damId || '');

      setCCalfName(calf.calfName);
      setCBreedingRecordId(calf.breedingRecordId);
      setCCode(calf.code);
      setCTagId(calf.tagId);
      setCGeneration(calf.generation);
      setCPlaceOfBirth(calf.placeOfBirth);
      setCBirthFacility(calf.birthFacility);
      setCBirthStatusCed(calf.birthStatusCed);
      setCDob(calf.dob);
      setCTime(calf.time);
      setCSex(calf.sex);
      setCColor(calf.color);
      setCBreed(calf.breed);
      setCBirthWeight(calf.birthWeight);
      setCHeight(calf.height);
      setCBodyLength(calf.bodyLength);
      setCChestSize(calf.chestSize);
      setCLegSize(calf.legSize);
      setCGestationPeriod(calf.gestationPeriod);
      setCNumberOfCalf(calf.numberOfCalf);
      setCBirthTemperature(calf.birthTemperature);
      setCNavelTreatment(calf.navelTreatment);
      setCVirusTest(calf.virusTest);
      setCTimingOfFeeding(calf.timingOfFeeding);
      setCMethodOfFeeding(calf.methodOfFeeding || ['Natural Nursing']);
      setCImageUrl(calf.imageUrl || '');
      setCSireId(calf.sireId);
      setCSireName(calf.sireName);
      setCSireBreed(calf.sireBreed);
      setCDamId(calf.damId);
      setCDamName(calf.damName);
      setCDamBreed(calf.damBreed);
      setCFarmName(calf.farmName);
      setCOwnerName('0001 - SNR Farm');
      setCProvinceDistrict(calf.provinceDistrict);
      setCVillageCommune(calf.villageCommune);
      setCGpsCoordinates(calf.gpsCoordinates);
      setCNotes(calf.notes);
      setCCurrentStatus(calf.currentStatus);
    } else {
      setCalfModalMode('create');
      setEditingCalfId(null);
      setRegMode('BREEDING_PROGRAM');
      
      const year = new Date().getFullYear();
      const num = String(calfRecords.length + 5).padStart(4, '0');
      const autoCode = `CALF-${year}-${num}`;
      setCCode(autoCode);
      setCTagId(`TAG-${Math.floor(1000 + Math.random() * 9000)}`);
      setCCalfName('');
      setCGeneration('F1 (First Cross)');
      setCPlaceOfBirth('Kandal / Ang Snoul');
      setCBirthFacility('Maternity Barn A');
      setCBirthStatusCed('Nature / Unassisted (Easy)');
      setCDob(new Date().toISOString().split('T')[0]);
      setCTime('08:30 AM');
      setCSex('Female');
      setCColor('Red & White');
      setCBirthWeight('26.5');
      setCHeight('68');
      setCBodyLength('72');
      setCChestSize('64');
      setCLegSize('38');
      setCGestationPeriod('283');
      setCNumberOfCalf('Single (1)');
      setCBirthTemperature('38.5');
      setCNavelTreatment(true);
      setCVirusTest(true);
      setCTimingOfFeeding('Immediate (<1h)');
      setCMethodOfFeeding(['Natural Nursing']);
      setCImageUrl('');
      setCNotes('');
      setCCurrentStatus('Healthy & Vigorous 🟢');

      // Default to first breeding record if available
      if (activeBreedingRecords.length > 0) {
        const firstBreeding = activeBreedingRecords[0];
        setSelectedBreedingId(firstBreeding.id);
        setCBreedingRecordId(firstBreeding.id);
        setCSireId(firstBreeding.sireId || 'SEM-17482');
        setCSireName(firstBreeding.bullName || firstBreeding.sireName || '0000005 - វ៉ាហ្វូ');
        setCSireBreed(firstBreeding.targetBreed || 'Wagyu');
        setCDamId(firstBreeding.damId);
        setCDamName(firstBreeding.damName || firstBreeding.damId);
        setCDamBreed(firstBreeding.damBreed || 'សែនក្រហម');
        setCBreed(firstBreeding.targetBreed || firstBreeding.damBreed || 'Wagyu');
        setCFarmName(firstBreeding.farmLocation || '0001 - SNR Farm Facility');
        setCOwnerName(firstBreeding.cowOwner || '0001 - SNR Farm');
      } else {
        setSelectedBreedingId('');
        setCBreedingRecordId('');
        setCSireId(semenBulls[0]?.id || 'SEM-17482');
        setCSireName(semenBulls[0]?.name || '0000005 - វ៉ាហ្វូ');
        setCSireBreed(semenBulls[0]?.breed || 'Wagyu');
        setCDamId(damRecords[0]?.id || '0000049');
        setCDamName(damRecords[0]?.name || 'មេគោ សែនក្រហម #49');
        setCDamBreed(damRecords[0]?.breed || 'សែនក្រហម');
        setCBreed(damRecords[0]?.breed || 'Wagyu');
        setCFarmName('0001 - SNR Farm Facility');
        setCOwnerName('0001 - SNR Farm');
      }
    }
    setCalfFormError('');
    setIsCalfModalOpen(true);
  };

  // Handle Breeding Program Selection Change
  const handleBreedingRecordChange = (bId: string) => {
    setSelectedBreedingId(bId);
    setCBreedingRecordId(bId);
    const rec = breedingRecords.find(r => r.id === bId);
    if (rec) {
      setCSireId(rec.sireId || 'SEM-17482');
      setCSireName(rec.bullName || rec.sireName || '0000005 - វ៉ាហ្វូ');
      setCSireBreed(rec.targetBreed || 'Wagyu');
      setCDamId(rec.damId);
      setCDamName(rec.damName || rec.damId);
      setCDamBreed(rec.damBreed || 'សែនក្រហម');
      setCBreed(rec.targetBreed || rec.damBreed || 'Wagyu');
      setCFarmName(rec.farmLocation || '0001 - SNR Farm Facility');
      setCOwnerName(rec.cowOwner || '0001 - SNR Farm');
    }
  };

  // Handle Manual Sire Selection Change
  const handleSireSelectionChange = (sId: string) => {
    setSelectedSireId(sId);
    setCSireId(sId);
    const sire = semenBulls.find(s => s.id === sId);
    if (sire) {
      setCSireName(sire.name);
      setCSireBreed(sire.breed);
    }
  };

  // Handle Manual Dam Selection Change
  const handleDamSelectionChange = (dId: string) => {
    setSelectedDamId(dId);
    setCDamId(dId);
    const dam = damRecords.find(d => d.id === dId);
    if (dam) {
      setCDamName(dam.name);
      setCDamBreed(dam.breed);
      setCFarmName('0001 - SNR Farm Facility');
      setCOwnerName(dam.cowOwner || '0001 - SNR Farm');
    }
  };

  const handleCalfSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cCalfName.trim()) {
      setCalfFormError('Calf Name is required.');
      return;
    }
    if (!cBreed.trim()) {
      setCalfFormError('Calf Breed is required.');
      return;
    }
    if (!cTagId.trim()) {
      setCalfFormError('Ear Tag ID is required.');
      return;
    }

    if (calfModalMode === 'create') {
      const isDuplicateTag = calfRecords.some(
        c => String(c?.tagId || '').toLowerCase().trim() === cTagId.toLowerCase().trim()
      );
      if (isDuplicateTag) {
        setCalfFormError(`Ear Tag ID "${cTagId}" is already registered. Please enter a unique Ear Tag ID.`);
        return;
      }
    }

    setIsSubmittingCalf(true);
    try {
      const year = new Date().getFullYear();
      const certNum = String(Math.floor(1 + Math.random() * 99999999)).padStart(8, '0');
      const newCalf: FullCalfRecord = {
        id: editingCalfId || cCode || `CALF-${Date.now()}`,
        certNo: calfModalMode === 'edit' ? (calfRecords.find(c => c.id === editingCalfId)?.certNo || `BC-${year}-${certNum}`) : `BC-${year}-${certNum}`,
        calfName: cCalfName,
        breedingRecordId: cBreedingRecordId,
        code: cCode,
        tagId: cTagId,
        generation: cGeneration,
        placeOfBirth: cPlaceOfBirth,
        birthFacility: cBirthFacility,
        birthStatusCed: cBirthStatusCed,
        dob: cDob,
        time: cTime,
        sex: cSex,
        color: cColor,
        breed: cBreed,
        birthWeight: cBirthWeight,
        height: cHeight,
        bodyLength: cBodyLength,
        chestSize: cChestSize,
        legSize: cLegSize,
        gestationPeriod: cGestationPeriod,
        numberOfCalf: cNumberOfCalf,
        birthTemperature: cBirthTemperature,
        navelTreatment: cNavelTreatment,
        virusTest: cVirusTest,
        timingOfFeeding: cTimingOfFeeding,
        methodOfFeeding: cMethodOfFeeding,
        imageUrl: cImageUrl || 'https://images.unsplash.com/photo-1546445317-29f4545f9d52?auto=format&fit=crop&w=600&q=80',
        sireId: cSireId,
        sireName: cSireName,
        sireBreed: cSireBreed,
        damId: cDamId,
        damName: cDamName,
        damBreed: cDamBreed,
        farmName: cFarmName,
        provinceDistrict: cProvinceDistrict,
        villageCommune: cVillageCommune,
        gpsCoordinates: cGpsCoordinates,
        dateOfRegistration: new Date().toLocaleDateString('en-GB'),
        recordedBy: 'CCEC Kaksedthan',
        systemVersion: 'Kaksedthan v2.0',
        verifiedBy: 'Super Admin (CCEC)',
        verificationDate: new Date().toLocaleDateString('en-GB'),
        currentStatus: cCurrentStatus || 'Healthy & Vigorous 🟢',
        notes: cNotes || 'Calved with standard monitoring.'
      };

      await onSaveCalf(newCalf);
      setIsCalfModalOpen(false);
    } catch (err: any) {
      setCalfFormError(err.message || 'Failed to save Calf Record');
    } finally {
      setIsSubmittingCalf(false);
    }
  };

  const filteredCalves = calfRecords.filter(c => {
    if (!c) return false;
    const name = String(c.calfName || (c as any).name || '').toLowerCase();
    const code = String(c.code || c.id || '').toLowerCase();
    const tag = String(c.tagId || c.code || '').toLowerCase();
    const breed = String(c.breed || '').toLowerCase();
    const q = calfSearchQuery.toLowerCase();

    return name.includes(q) || code.includes(q) || tag.includes(q) || breed.includes(q);
  });

  const selectedBreedingRec = breedingRecords.find(r => r.id === selectedBreedingId);

  return (
    <div className="space-y-6">
      {/* ── TOP UNIFIED CALF MANAGEMENT HEADER & TABS ── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-600 flex items-center justify-center text-2xl font-bold">
            🐮
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-slate-900">Calf Management Hub</h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Unified newborn calf herd inventory, pedigree lineage, and official birth certificate center.
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
          <button
            onClick={() => handleSubViewChange('listing')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
              subView === 'listing'
                ? 'bg-[#0B6B3A] text-white shadow-sm'
                : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            🐮 Calf Listing ({calfRecords.length})
          </button>
          <button
            onClick={() => handleSubViewChange('certificates')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
              subView === 'certificates'
                ? 'bg-[#0B6B3A] text-white shadow-sm'
                : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            📜 Certificate Center ({calfRecords.length})
          </button>
        </div>
      </div>

      {subView === 'listing' ? (
        <div className="space-y-4">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: 0 }}>Calves Listing — Born Calves Inventory</h2>
              <p style={{ fontSize: '12px', color: '#6B7280', margin: '2px 0 0' }}>Manage newborn calves, birth records, pedigree tracking & birth certificates</p>
            </div>
            <button
              onClick={() => openCalfModal()}
              style={{ background: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', padding: '9px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus className="h-4 w-4" />
              Register Calf
            </button>
          </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px', maxWidth: '340px' }}>
          <Search className="h-3.5 w-3.5" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
          <input
            type="text"
            placeholder="Search calf name, code, tag ID, breed, location..."
            value={calfSearchQuery}
            onChange={e => setCalfSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '8px 12px 8px 32px', fontSize: '13px', border: '1px solid #E5E7EB', borderRadius: '8px', outline: 'none', color: '#111827', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
          <div style={{ padding: '6px 12px', background: '#FDF2F8', border: '1px solid #FBCFE8', borderRadius: '8px', textAlign: 'center' }}>
            <p style={{ fontSize: '14px', fontWeight: 700, color: '#9d174d', margin: 0, lineHeight: 1 }}>{calfRecords.filter(c => c.sex === 'Female').length}</p>
            <p style={{ fontSize: '10px', color: '#831843', margin: '2px 0 0', fontWeight: 500 }}>♀ Females</p>
          </div>
          <div style={{ padding: '6px 12px', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '8px', textAlign: 'center' }}>
            <p style={{ fontSize: '14px', fontWeight: 700, color: '#1e40af', margin: 0, lineHeight: 1 }}>{calfRecords.filter(c => c.sex === 'Male').length}</p>
            <p style={{ fontSize: '10px', color: '#1e3a8a', margin: '2px 0 0', fontWeight: 500 }}>♂ Males</p>
          </div>
        </div>
      </div>

      {/* Grid of Calf Cards — Responsive 4 to 5 per row desktop grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filteredCalves.map(calf => {
          // Calculate Age
          let ageStr = 'Newborn';
          if (calf.dob) {
            const diffMs = Date.now() - new Date(calf.dob).getTime();
            const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            if (days > 365) {
              const yrs = (days / 365).toFixed(1);
              ageStr = `${yrs} yrs`;
            } else if (days > 30) {
              const mos = Math.floor(days / 30.5);
              ageStr = `${mos} mos`;
            } else if (days >= 0) {
              ageStr = `${days} days`;
            }
          }

          return (
            <div
              key={calf.id}
              onClick={() => onOpenDetailView('calf', calf)}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden cursor-pointer hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col group"
            >
              {/* IMAGE THUMBNAIL: Fixed height 200px, object-cover, blurred backdrop layer */}
              <div className="relative w-full h-48 bg-slate-950 overflow-hidden border-b border-slate-200 shrink-0">
                {/* Blurred Backdrop */}
                <img
                  src={calf.imageUrl || 'https://images.unsplash.com/photo-1546445317-29f4545f9d52?auto=format&fit=crop&w=600&q=80'}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 w-full h-full object-cover filter blur-xl opacity-50 scale-125"
                />
                {/* Main Photo */}
                <img
                  src={calf.imageUrl || 'https://images.unsplash.com/photo-1546445317-29f4545f9d52?auto=format&fit=crop&w=600&q=80'}
                  alt={calf.calfName}
                  className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300 z-10"
                />

                {/* Top-Left Code Badge */}
                <div className="absolute top-2.5 left-2.5 z-20">
                  <span className="text-[10px] font-black px-2.5 py-1 rounded-lg bg-slate-900/80 text-white backdrop-blur-md font-mono border border-slate-700/50 shadow-xs">
                    #{calf.code || calf.tagId || calf.id}
                  </span>
                </div>

                {/* Top-Right Status Badge */}
                <div className="absolute top-2.5 right-2.5 z-20">
                  <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg backdrop-blur-md border shadow-xs ${
                    calf.currentStatus?.includes('Healthy') || calf.currentStatus?.includes('Vigorous')
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                      : calf.currentStatus?.includes('Observation') || calf.currentStatus?.includes('Weak')
                      ? 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                      : 'bg-slate-900/80 text-white border-slate-700/50'
                  }`}>
                    {calf.currentStatus?.split(' ')[0] || '🟢'} {calf.currentStatus?.replace(/[🟢🟡🔴]/g, '').trim() || 'Healthy'}
                  </span>
                </div>
              </div>

              {/* CARD BODY */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                
                {/* Name, Breed & Gender */}
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
                      {calf.calfName}
                    </h3>
                    <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md shrink-0 border border-emerald-200">
                      {calf.tagId}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-xs font-bold text-emerald-600">{calf.breed}</span>
                    <span className="text-slate-300">•</span>
                    <span className={`text-[11px] font-bold ${calf.sex === 'Female' ? 'text-rose-600' : 'text-sky-600'}`}>
                      {calf.sex === 'Female' ? '♀ Heifer' : '♂ Bull Calf'}
                    </span>
                  </div>
                </div>

                {/* Parent Lineage (Sire & Dam) */}
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-bold uppercase text-[9px]">🐂 Sire (Father):</span>
                    <span className="font-extrabold text-sky-900 truncate max-w-[130px]">{calf.sireName || calf.sireId || 'Sire Bull'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-bold uppercase text-[9px]">🐄 Dam (Mother):</span>
                    <span className="font-extrabold text-rose-900 truncate max-w-[130px]">{calf.damName || calf.damId || 'Dam Cow'}</span>
                  </div>
                </div>

                {/* Birth Metrics & Age */}
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-2 text-center">
                    <p className="text-[9px] font-bold text-emerald-800 uppercase">Birth Weight</p>
                    <p className="text-xs font-black text-emerald-700 mt-0.5">{calf.birthWeight || 25} kg</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2 text-center">
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Age</p>
                    <p className="text-xs font-bold text-slate-800 mt-0.5">{ageStr}</p>
                  </div>
                </div>

                {/* Certificates Summary Badge Row */}
                <div className="flex items-center justify-between bg-emerald-50/40 border border-emerald-100/80 rounded-xl p-2 text-[11px]">
                  <div className="flex items-center gap-1">
                    <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-extrabold text-[10px]">📜 Reg</span>
                    <span className="px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 font-extrabold text-[10px]">🧬 DNA</span>
                    <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-extrabold text-[10px]">🩺 Health</span>
                  </div>
                  <span className="text-[10px] font-extrabold text-emerald-700">3 Verified</span>
                </div>

                {/* Actions Footer */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onViewCertificate(calf.id); }}
                    className="flex-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs py-1.5 px-2 rounded-xl border border-emerald-200 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Award className="h-3.5 w-3.5" /> Certificate
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(`/public/stock/${calf.code || calf.tagId || calf.certNo || calf.id}`, '_blank');
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-1.5 px-3 rounded-xl shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                    title="Open Public Verification QR Page"
                  >
                    📱 QR
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); openCalfModal(calf); }}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-1.5 px-3 rounded-xl transition-colors cursor-pointer"
                  >
                    Edit
                  </button>
                </div>

              </div>
            </div>
          );
        })}
      </div>
        </div>
      ) : (
        <PedigreeCertificateSubTab
          selectedCalf={selectedCalfForCert}
          calfRecords={calfRecords}
          onSelectCalf={(id) => setSelectedCertCalfId(id)}
        />
      )}

      {/* ─── REGISTER / EDIT CALF WIZARD MODAL (MATCHES REGISTER SIRE & DAM LAYOUT) ─── */}
      {isCalfModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs overflow-y-auto p-4 py-8">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-5xl overflow-hidden my-auto">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-5 px-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-2xl shadow-inner">
                  🍼
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    {calfModalMode === 'create' ? 'Register New Born Calf' : 'Edit Calf Pedigree Record'}
                  </h3>
                  <p className="text-xs text-emerald-300/80">Complete newborn registration, parent lineage context, physical traits & birth certificate</p>
                </div>
              </div>
              <button
                onClick={() => setIsCalfModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-sm transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Error banner */}
            {calfFormError && (
              <div className="bg-rose-50 border-b border-rose-200 text-rose-800 text-xs font-bold p-3 px-6 flex items-center gap-2">
                ⚠️ {calfFormError}
              </div>
            )}

            {/* Modal Form Body */}
            <form onSubmit={handleCalfSubmit} className="p-6 space-y-6 max-h-[78vh] overflow-y-auto">

              {/* CARD 1: REGISTRATION TYPE & REGISTRATION INFO */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2 text-xs font-black text-slate-900 uppercase tracking-wider">
                    <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs">1</span>
                    📋 Section 1: Registration Method & Identification
                  </div>

                  {/* Dual Mode Switcher */}
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setRegMode('BREEDING_PROGRAM')}
                      className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition-all ${
                        regMode === 'BREEDING_PROGRAM'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      🧬 1. From Breeding Program (Recommended)
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegMode('MANUAL')}
                      className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition-all ${
                        regMode === 'MANUAL'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      🐮 2. Manual Parent Selection
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Calf Register Code <span className="text-rose-500">*</span></label>
                    <input
                      required
                      type="text"
                      value={cCode}
                      onChange={e => setCCode(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono font-bold border border-slate-300 rounded-xl bg-slate-50 text-emerald-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Registration Date</label>
                    <input
                      type="date"
                      value={cDob}
                      onChange={e => setCDob(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl bg-white text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Registration Status</label>
                    <select
                      value={cCurrentStatus}
                      onChange={e => setCCurrentStatus(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl bg-white text-slate-900 cursor-pointer"
                    >
                      <option value="Healthy & Vigorous 🟢">🟢 Healthy & Vigorous</option>
                      <option value="Weak / Under Observation 🟡">🟡 Weak / Under Observation</option>
                      <option value="Critical / Intensive Care 🔴">🔴 Critical / Intensive Care</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* CARD 2: BREEDING INFORMATION (DISPLAYED FOR OPTION 1) */}
              {regMode === 'BREEDING_PROGRAM' && (
                <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-5 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 text-xs font-black text-amber-900 uppercase tracking-wider border-b border-amber-200/80 pb-2.5">
                    <span className="w-6 h-6 rounded-lg bg-amber-600 text-white flex items-center justify-center text-xs">2</span>
                    🧬 Section 2: Linked Breeding Program Record
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-amber-900 mb-1">Select Breeding Program Record *</label>
                      <select
                        value={selectedBreedingId}
                        onChange={e => handleBreedingRecordChange(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-bold border border-amber-300 rounded-xl bg-white text-slate-900 cursor-pointer"
                      >
                        {activeBreedingRecords.map(r => (
                          <option key={r.id} value={r.id}>
                            #{r.id} — Dam: {r.damName || r.damId} × Sire: {r.bullName || r.sireName || r.sireId} ({r.pregnancyStatus})
                          </option>
                        ))}
                      </select>
                    </div>

                    {selectedBreedingRec && (
                      <div className="bg-white border border-amber-200 rounded-xl p-3 text-xs space-y-1">
                        <p><span className="text-slate-500 font-medium">Mating Date:</span> <strong className="text-slate-800">{selectedBreedingRec.matingDate ? new Date(selectedBreedingRec.matingDate).toLocaleDateString('en-GB') : '—'}</strong></p>
                        <p><span className="text-slate-500 font-medium">Service Type & Method:</span> <span className="font-bold text-amber-800">{selectedBreedingRec.serviceType || 'AI'} ({selectedBreedingRec.breedingMethod || 'Cross-Breeding'})</span></p>
                        <p><span className="text-slate-500 font-medium">Expected Calving:</span> <strong className="text-emerald-700">{selectedBreedingRec.expectedBirthdate ? new Date(selectedBreedingRec.expectedBirthdate).toLocaleDateString('en-GB') : '—'}</strong></p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* CARD 3: SIRE INFORMATION (FATHER) */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2.5">
                  <span className="w-6 h-6 rounded-lg bg-sky-600 text-white flex items-center justify-center text-xs">3</span>
                  🐂 Section 3: Sire Bull Information (Father)
                </div>

                {regMode === 'MANUAL' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Select Sire Bull *</label>
                    <select
                      value={selectedSireId}
                      onChange={e => handleSireSelectionChange(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl bg-white text-slate-900 cursor-pointer mb-3"
                    >
                      {semenBulls.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.breed}, Code: {s.code})</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="bg-sky-50/60 border border-sky-200 rounded-xl p-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div>
                    <p className="text-[10px] font-bold uppercase text-slate-500">Sire Name</p>
                    <p className="font-extrabold text-sky-950 text-sm mt-0.5">{cSireName || '—'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-slate-500">Sire ID / Code</p>
                    <p className="font-mono font-bold text-sky-800 mt-0.5">{cSireId || '—'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-slate-500">Sire Breed</p>
                    <p className="font-bold text-emerald-700 mt-0.5">{cSireBreed || '—'}</p>
                  </div>
                </div>
              </div>

              {/* CARD 4: DAM INFORMATION (MOTHER) */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2.5">
                  <span className="w-6 h-6 rounded-lg bg-rose-600 text-white flex items-center justify-center text-xs">4</span>
                  🐄 Section 4: Dam Cow Information (Mother)
                </div>

                {regMode === 'MANUAL' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Select Dam Cow *</label>
                    <select
                      value={selectedDamId}
                      onChange={e => handleDamSelectionChange(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl bg-white text-slate-900 cursor-pointer mb-3"
                    >
                      {damRecords.map(d => (
                        <option key={d.id} value={d.id}>{d.name} ({d.breed}, Tag: {d.tagId})</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="bg-rose-50/60 border border-rose-200 rounded-xl p-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div>
                    <p className="text-[10px] font-bold uppercase text-slate-500">Dam Name</p>
                    <p className="font-extrabold text-rose-950 text-sm mt-0.5">{cDamName || '—'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-slate-500">Dam ID / Tag</p>
                    <p className="font-mono font-bold text-rose-800 mt-0.5">{cDamId || '—'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-slate-500">Dam Breed</p>
                    <p className="font-bold text-emerald-700 mt-0.5">{cDamBreed || '—'}</p>
                  </div>
                </div>
              </div>

              {/* CARD 5: CALF IDENTIFICATION & PHYSICAL DETAILS */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2.5">
                  <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs">5</span>
                  🍼 Section 5: Newborn Calf Physical Details
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Calf Name <span className="text-rose-500">*</span></label>
                    <input
                      required
                      type="text"
                      value={cCalfName}
                      onChange={e => setCCalfName(e.target.value)}
                      placeholder="e.g. Maro Supreme Junior"
                      className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl bg-white text-slate-900 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Ear Tag ID <span className="text-rose-500">*</span></label>
                    <input
                      required
                      type="text"
                      value={cTagId}
                      onChange={e => setCTagId(e.target.value)}
                      placeholder="e.g. CF-2026-901"
                      className="w-full px-3 py-2 text-xs font-mono font-bold border border-slate-300 rounded-xl bg-white text-emerald-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Gender <span className="text-rose-500">*</span></label>
                    <select
                      value={cSex}
                      onChange={e => setCSex(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl bg-white text-slate-900 cursor-pointer"
                    >
                      <option value="Female">♀ Female (Heifer Calf)</option>
                      <option value="Male">♂ Male (Bull Calf)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Calf Breed <span className="text-rose-500">*</span></label>
                    <select
                      value={cBreed}
                      onChange={e => setCBreed(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl bg-white text-slate-900 cursor-pointer"
                    >
                      {CALF_BREEDS.map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Birth Date <span className="text-rose-500">*</span></label>
                    <input
                      type="date"
                      value={cDob}
                      onChange={e => setCDob(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl bg-white text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Birth Time</label>
                    <input
                      type="text"
                      value={cTime}
                      onChange={e => setCTime(e.target.value)}
                      placeholder="08:30 AM"
                      className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl bg-white text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Birth Weight (kg) <span className="text-rose-500">*</span></label>
                    <input
                      type="number"
                      step="0.1"
                      value={cBirthWeight}
                      onChange={e => setCBirthWeight(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-extrabold border border-slate-300 rounded-xl bg-white text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Height (cm)</label>
                    <input
                      type="number"
                      value={cHeight}
                      onChange={e => setCHeight(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl bg-white text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Coat Color</label>
                    <input
                      type="text"
                      value={cColor}
                      onChange={e => setCColor(e.target.value)}
                      placeholder="Red & White"
                      className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl bg-white text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* CARD 6: OWNERSHIP INFORMATION */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2.5">
                  <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs">6</span>
                  🏢 Section 6: Ownership & Farm Location
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Farm Facility Location</label>
                    <input
                      type="text"
                      value={cFarmName}
                      onChange={e => setCFarmName(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl bg-white text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Owner Name</label>
                    <input
                      type="text"
                      value={cOwnerName}
                      onChange={e => setCOwnerName(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl bg-white text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* CARD 7: MEDIA & ATTACHMENTS */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2.5">
                  <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs">7</span>
                  🖼️ Section 7: Calf Photo & Official Documents
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Calf Photo Upload / URL</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          onImageFileSelect(file, (url) => setCImageUrl(url));
                        }
                      }}
                      className="text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                    />
                    <input
                      type="text"
                      value={cImageUrl}
                      onChange={e => setCImageUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full mt-2 px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white text-slate-900"
                    />
                  </div>

                  {cImageUrl && (
                    <div className="relative w-32 h-24 rounded-2xl overflow-hidden border-2 border-emerald-500 shadow-md">
                      <img src={cImageUrl} alt="Calf Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setCImageUrl('')}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-rose-600 text-white text-xs font-bold flex items-center justify-center shadow-md"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* CARD 8: NOTES & REMARKS */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2.5">
                  <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs">8</span>
                  📝 Section 8: Notes & Birth Observations
                </div>

                <textarea
                  rows={3}
                  value={cNotes}
                  onChange={e => setCNotes(e.target.value)}
                  placeholder="Record birth condition, colostrum intake, maternal bonding..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white text-slate-900"
                />
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsCalfModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingCalf}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingCalf ? (
                    <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    '🍼 Register Calf Record'
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
