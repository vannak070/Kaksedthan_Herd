import React, { useState, useMemo } from 'react';
import { Plus, Search, Filter, Sparkles, Building2, User, DollarSign, ShieldCheck, CheckCircle2, AlertCircle, Calendar, Dna, Clock } from 'lucide-react';
import { BreedingRecord, PregnancyStatus, ServiceType, BreedingMethod, DamSource } from '@/types/breeding.types';
import { SemenBull } from './types';

interface BreedingLogsSubTabProps {
  breedingRecords: BreedingRecord[];
  semenBulls: SemenBull[];
  femaleStock: any[];
  calfRecords?: any[];
  viewMode: 'grid' | 'table';
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  statusFilter: string;
  setStatusFilter: (f: string) => void;
  onOpenDetailView: (type: 'breeding', rec: BreedingRecord) => void;
  onSaveBreedingRecord: (payload: Partial<BreedingRecord>, mode: 'create' | 'edit', recordId?: string | null) => Promise<void>;
  onDeleteBreedingRecord?: (id: string) => Promise<void>;
  onConfirmStatus: (id: string, newStatus: PregnancyStatus) => Promise<void>;
  onOpenCalfModal: (rec?: any, presetDamId?: string, presetBreedingId?: string) => void;
  onRegisterCalving?: (calvingData: any) => Promise<void>;
  onImageFileSelect?: (file: File, callback: (url: string) => void) => void;
}

// Master Data Collections for Farms, Owners, and Breeders
const MASTER_FARMS = [
  { code: 'FARM-001', name: '0001 - SNR Farm Facility', location: 'Kampong Cham', contact: '+855 12 345 678' },
  { code: 'FARM-002', name: '0002 - Kaksedthan Main Ranch', location: 'Battambang', contact: '+855 12 999 888' },
  { code: 'FARM-003', name: '0003 - Grassland Breeding Center', location: 'Takeo', contact: '+855 12 777 666' }
];

const MASTER_COW_OWNERS = [
  { name: 'Lok Oknha Heng', contact: '+855 12 888 999', address: 'Phnom Penh, Cambodia' },
  { name: 'Neak Oknha Sok', contact: '+855 11 777 666', address: 'Siem Reap, Cambodia' },
  { name: 'Sovan Agriculture', contact: '+855 92 555 444', address: 'Kandal, Cambodia' },
  { name: '0001 - SNR Farm', contact: '+855 12 345 678', address: 'Kampong Cham, Cambodia' }
];

const MASTER_BREEDERS = [
  { id: 'EMP-001', name: 'ATH Vannak (Breeder)', title: 'Senior Breeder & Specialist', contact: '+855 12 111 222' },
  { id: 'EMP-002', name: 'Dr. Veasna (Insemination Spec)', title: 'AI Specialist', contact: '+855 12 333 444' },
  { id: 'EMP-003', name: 'Technician Vannak (Senior Tech)', title: 'Senior Inseminator', contact: '+855 12 555 666' },
  { id: 'EMP-004', name: 'Dr. Chea (Livestock Geneticist)', title: 'Breeding Director', contact: '+855 12 777 888' }
];

export default function BreedingLogsSubTab({
  breedingRecords,
  semenBulls,
  femaleStock,
  calfRecords = [],
  viewMode,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  onOpenDetailView,
  onSaveBreedingRecord,
  onConfirmStatus,
  onOpenCalfModal,
  onRegisterCalving,
  onImageFileSelect
}: BreedingLogsSubTabProps) {
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── SECTION 1: PROGRAM INFORMATION ──
  const [programCodeInput, setProgramCodeInput] = useState('');
  const [programNameInput, setProgramNameInput] = useState('');
  const [serviceTypeInput, setServiceTypeInput] = useState<ServiceType>('AI');
  const [breedingMethodInput, setBreedingMethodInput] = useState<BreedingMethod>('Cross-Breeding');
  const [pregnancyStatusInput, setPregnancyStatusInput] = useState<PregnancyStatus>('Pending');
  const [matingDateInput, setMatingDateInput] = useState('');
  const [farmLocationInput, setFarmLocationInput] = useState('0001 - SNR Farm Facility');
  const [notesInput, setNotesInput] = useState('');

  // ── SECTION 2: OWNER SELECTION ──
  const [ownerTypeInput, setOwnerTypeInput] = useState<'Farm' | 'Cow Owner'>('Farm');
  const [selectedFarmName, setSelectedFarmName] = useState('0001 - SNR Farm Facility');
  const [selectedOwnerName, setSelectedOwnerName] = useState('0001 - SNR Farm');

  // ── SECTION 3: SIRE INFORMATION ──
  const [sireIdInput, setSireIdInput] = useState('');
  const [bullNameInput, setBullNameInput] = useState('Mr. HIROSHI - Wagyu');

  // ── SECTION 4: DAM SELECTION ──
  const [damSourceInput, setDamSourceInput] = useState<DamSource>('Existing Dam');
  const [damIdInput, setDamIdInput] = useState('');
  const [selectedCalfIdInput, setSelectedCalfIdInput] = useState('');

  // ── SECTION 5: PRICING & BREEDER ──
  const [priceInput, setPriceInput] = useState<number>(85);
  const [currencyInput, setCurrencyInput] = useState<'USD' | 'KHR'>('USD');
  const [breederIdInput, setBreederIdInput] = useState('EMP-001');
  const [breederNameInput, setBreederNameInput] = useState(MASTER_BREEDERS[0].name);

  // ── SECTION 6: TIMETABLE & EXPECTED RESULT ──
  const [followUpDateInput, setFollowUpDateInput] = useState('');
  const [pregnancyCheckDateInput, setPregnancyCheckDateInput] = useState('');
  const [expectedBirthdateInput, setExpectedBirthdateInput] = useState('');
  const [actualCalvingDateInput, setActualCalvingDateInput] = useState('');

  const [targetBreedInput, setTargetBreedInput] = useState('Angus Cross');
  const [expectedOffspringCount, setExpectedOffspringCount] = useState('1 Calf (Single)');
  const [expectedGenderInput, setExpectedGenderInput] = useState('Any / Natural');
  const [expectedBirthWeightInput, setExpectedBirthWeightInput] = useState('32 kg - 38 kg');
  const [expectedHealthStatusInput, setExpectedHealthStatusInput] = useState('Prime Grade (Superior Genetics)');

  // ── REGISTER CALVE WIZARD MODAL STATE & HANDLERS ──
  const [isCalvingModalOpen, setIsCalvingModalOpen] = useState(false);
  const [selectedCalvingRecord, setSelectedCalvingRecord] = useState<BreedingRecord | null>(null);
  const [isCalvingSubmitting, setIsCalvingSubmitting] = useState(false);

  // Calving Birth Information Inputs
  const [calvingBirthDate, setCalvingBirthDate] = useState('');
  const [calvingBirthTime, setCalvingBirthTime] = useState('08:30');
  const [calvingBirthLocation, setCalvingBirthLocation] = useState('');
  const [calvingBirthType, setCalvingBirthType] = useState<'Single' | 'Twin' | 'Multiple'>('Single');
  const [calvingBirthOutcome, setCalvingBirthOutcome] = useState('Normal / Alive');
  const [calvingDeliveryMethod, setCalvingDeliveryMethod] = useState('Natural Spontaneous');
  const [calvingAssistedDelivery, setCalvingAssistedDelivery] = useState(false);
  const [calvingTechnician, setCalvingTechnician] = useState(MASTER_BREEDERS[0].name);
  const [calvingNotes, setCalvingNotes] = useState('');

  // Calf List State (supports multiple calves for twins/multiples)
  interface CalfItemInput {
    id: string;
    name: string;
    tagId: string;
    sex: 'Male' | 'Female';
    weight: number;
    height: number;
    coatColor: string;
    healthStatus: string;
    imageUrl: string;
  }
  const [calfItems, setCalfItems] = useState<CalfItemInput[]>([]);

  const openCalvingModal = (rec: BreedingRecord) => {
    setSelectedCalvingRecord(rec);
    const today = new Date().toISOString().split('T')[0];
    setCalvingBirthDate(today);
    setCalvingBirthTime('08:30');
    setCalvingBirthLocation(rec.farmLocation || '0001 - SNR Farm Facility');
    setCalvingBirthType('Single');
    setCalvingBirthOutcome('Normal / Alive');
    setCalvingDeliveryMethod('Natural Spontaneous');
    setCalvingAssistedDelivery(false);
    setCalvingTechnician(rec.breederName || MASTER_BREEDERS[0].name);
    setCalvingNotes(`Normal calving event registered for Dam ${rec.damName || rec.damId}.`);

    const defaultCalf: CalfItemInput = {
      id: `CALF-${Date.now()}-1`,
      name: `កូនគោ ${rec.damName || rec.damId} Junior #1`,
      tagId: `CF-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      sex: 'Male',
      weight: 28.5,
      height: 55,
      coatColor: 'Red / Dark Brown',
      healthStatus: 'Vigorous / Healthy',
      imageUrl: 'https://images.unsplash.com/photo-1546445317-29f4545f9d52?auto=format&fit=crop&w=400&q=80'
    };
    setCalfItems([defaultCalf]);
    setIsCalvingModalOpen(true);
  };

  const handleBirthTypeChange = (type: 'Single' | 'Twin' | 'Multiple') => {
    setCalvingBirthType(type);
    if (!selectedCalvingRecord) return;
    const baseDam = selectedCalvingRecord.damName || selectedCalvingRecord.damId;

    if (type === 'Single') {
      setCalfItems(prev => [prev[0] || {
        id: `CALF-${Date.now()}-1`,
        name: `កូនគោ ${baseDam} Junior #1`,
        tagId: `CF-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        sex: 'Male',
        weight: 28.5,
        height: 55,
        coatColor: 'Red',
        healthStatus: 'Vigorous / Healthy',
        imageUrl: 'https://images.unsplash.com/photo-1546445317-29f4545f9d52?auto=format&fit=crop&w=400&q=80'
      }]);
    } else if (type === 'Twin') {
      setCalfItems(prev => {
        const item1 = prev[0] || {
          id: `CALF-${Date.now()}-1`,
          name: `កូនគោ ${baseDam} Twin #1`,
          tagId: `CF-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
          sex: 'Male',
          weight: 26.0,
          height: 52,
          coatColor: 'Red',
          healthStatus: 'Vigorous / Healthy',
          imageUrl: 'https://images.unsplash.com/photo-1546445317-29f4545f9d52?auto=format&fit=crop&w=400&q=80'
        };
        const item2 = prev[1] || {
          id: `CALF-${Date.now()}-2`,
          name: `កូនគោ ${baseDam} Twin #2`,
          tagId: `CF-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
          sex: 'Female',
          weight: 24.5,
          height: 50,
          coatColor: 'Red',
          healthStatus: 'Vigorous / Healthy',
          imageUrl: 'https://images.unsplash.com/photo-1546445317-29f4545f9d52?auto=format&fit=crop&w=400&q=80'
        };
        return [item1, item2];
      });
    }
  };

  const handleAddCalfItem = () => {
    if (!selectedCalvingRecord) return;
    const baseDam = selectedCalvingRecord.damName || selectedCalvingRecord.damId;
    const idx = calfItems.length + 1;
    const newCalf: CalfItemInput = {
      id: `CALF-${Date.now()}-${idx}`,
      name: `កូនគោ ${baseDam} Multiple #${idx}`,
      tagId: `CF-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      sex: idx % 2 === 0 ? 'Female' : 'Male',
      weight: 23.0,
      height: 48,
      coatColor: 'Red',
      healthStatus: 'Vigorous / Healthy',
      imageUrl: 'https://images.unsplash.com/photo-1546445317-29f4545f9d52?auto=format&fit=crop&w=400&q=80'
    };
    setCalfItems(prev => [...prev, newCalf]);
  };

  const handleRemoveCalfItem = (index: number) => {
    if (calfItems.length <= 1) return;
    setCalfItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleCalfItemChange = (index: number, field: keyof CalfItemInput, value: any) => {
    setCalfItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  };

  const handleCalvingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCalvingRecord) return;
    try {
      setIsCalvingSubmitting(true);
      if (onRegisterCalving) {
        await onRegisterCalving({
          breedingRecord: selectedCalvingRecord,
          birthInfo: {
            birthDate: calvingBirthDate,
            birthTime: calvingBirthTime,
            birthLocation: calvingBirthLocation,
            birthType: calvingBirthType,
            birthOutcome: calvingBirthOutcome,
            deliveryMethod: calvingDeliveryMethod,
            assistedDelivery: calvingAssistedDelivery,
            technician: calvingTechnician,
            notes: calvingNotes
          },
          calves: calfItems
        });
      }
      setIsCalvingModalOpen(false);
    } catch (err) {
      console.error('Calving registration failed:', err);
    } finally {
      setIsCalvingSubmitting(false);
    }
  };

  // ── FILTER AVAILABLE DAMS (Excludes Confirmed Pregnant & Pending Active Dams) ──
  const availableFemaleStock = useMemo(() => {
    const activeDamIds = new Set(
      breedingRecords
        .filter(r => r.pregnancyStatus === 'Pending' || r.pregnancyStatus === 'Confirmed Pregnant' || (r.pregnancyStatus as string) === 'Active')
        .map(r => r.damId)
    );

    return femaleStock.filter(cow => {
      const cowId = cow.tagId || cow.id;
      const isAlreadyActive = activeDamIds.has(cowId);
      const isInactive = cow.status === 'Inactive' || cow.status === 'Sold' || cow.status === 'Deceased';
      return !isAlreadyActive && !isInactive;
    });
  }, [femaleStock, breedingRecords]);

  // Selected Objects for Auto-Populated Cards
  const selectedSireObj = semenBulls.find(b => b.id === sireIdInput || b.code === sireIdInput);
  const selectedDamObj = useMemo(() => {
    if (damSourceInput === 'Dam from Calf') {
      const matchedCalf = calfRecords.find(c => c.id === selectedCalfIdInput || c.code === selectedCalfIdInput);
      if (matchedCalf) {
        return {
          id: matchedCalf.damId || matchedCalf.id,
          tagId: matchedCalf.damId || matchedCalf.code || matchedCalf.id,
          name: matchedCalf.damName || `Dam of ${matchedCalf.name || matchedCalf.code}`,
          breed: matchedCalf.damBreed || matchedCalf.breed || 'Brahman',
          imageUrl: matchedCalf.imageUrl || matchedCalf.image_url,
          cowOwner: matchedCalf.cowOwner || matchedCalf.farmLocation || 'SNR Farm Facility',
          dob: matchedCalf.birthDate || matchedCalf.dob,
          healthStatus: matchedCalf.healthStatus || 'Healthy & Prime Reproductive Status',
          ageMonths: matchedCalf.ageMonths || 36
        };
      }
    }
    return femaleStock.find(f => f.tagId === damIdInput || f.id === damIdInput);
  }, [damSourceInput, damIdInput, selectedCalfIdInput, femaleStock, calfRecords]);

  const selectedFarmObj = MASTER_FARMS.find(f => f.name === selectedFarmName) || MASTER_FARMS[0];
  const selectedOwnerObj = MASTER_COW_OWNERS.find(o => o.name === selectedOwnerName) || MASTER_COW_OWNERS[0];
  const selectedBreederObj = MASTER_BREEDERS.find(b => b.id === breederIdInput || b.name === breederNameInput) || MASTER_BREEDERS[0];

  const handleSireChange = (sireId: string) => {
    setSireIdInput(sireId);
    const s = semenBulls.find(b => b.id === sireId || b.code === sireId);
    if (s) {
      setBullNameInput(s.name);
      if (s.breed) {
        const damBreed = selectedDamObj?.breed || 'Brahman';
        setTargetBreedInput(`${s.breed} × ${damBreed} Cross`);
      }
    }
  };

  const handleDamChange = (damId: string) => {
    setDamIdInput(damId);
    const d = femaleStock.find(f => f.tagId === damId || f.id === damId);
    if (d) {
      if (d.cowOwner) setSelectedOwnerName(d.cowOwner);
      if (selectedSireObj?.breed) {
        setTargetBreedInput(`${selectedSireObj.breed} × ${d.breed || 'Dam'} Cross`);
      }
    }
  };

  const handleCalfSelect = (calfId: string) => {
    setSelectedCalfIdInput(calfId);
    const matchedCalf = calfRecords.find(c => c.id === calfId || c.code === calfId);
    if (matchedCalf) {
      setDamIdInput(matchedCalf.damId || matchedCalf.id);
      if (matchedCalf.cowOwner) setSelectedOwnerName(matchedCalf.cowOwner);
    }
  };

  const handleMatingDateChange = (dateVal: string) => {
    setMatingDateInput(dateVal);
    if (dateVal) {
      const baseDate = new Date(dateVal);
      
      // Follow-up Date (+21 days)
      const followUp = new Date(baseDate);
      followUp.setDate(followUp.getDate() + 21);
      setFollowUpDateInput(followUp.toISOString().split('T')[0]);

      // Pregnancy Check Date (+45 days)
      const checkDate = new Date(baseDate);
      checkDate.setDate(checkDate.getDate() + 45);
      setPregnancyCheckDateInput(checkDate.toISOString().split('T')[0]);

      // Expected Calving Date (+283 days)
      const expDate = new Date(baseDate);
      expDate.setDate(expDate.getDate() + 283);
      setExpectedBirthdateInput(expDate.toISOString().split('T')[0]);
    }
  };

  const openCreateModal = () => {
    setModalMode('create');
    setSelectedRecordId(null);

    const autoCode = `BRD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    setProgramCodeInput(autoCode);

    const firstAvailableDam = availableFemaleStock[0] || femaleStock[0];
    const firstSire = semenBulls[0];
    const firstCalf = calfRecords[0];

    setDamSourceInput('Existing Dam');
    setDamIdInput(firstAvailableDam?.tagId || firstAvailableDam?.id || '');
    setSelectedCalfIdInput(firstCalf?.id || '');
    setSireIdInput(firstSire?.id || '');
    setBullNameInput(firstSire?.name || '');

    setOwnerTypeInput('Farm');
    setSelectedFarmName('0001 - SNR Farm Facility');
    setSelectedOwnerName('0001 - SNR Farm');

    setPriceInput(85);
    setCurrencyInput('USD');

    setBreederIdInput('EMP-001');
    setBreederNameInput(MASTER_BREEDERS[0].name);

    setServiceTypeInput('AI');
    setBreedingMethodInput('Cross-Breeding');
    setTargetBreedInput(firstSire?.breed ? `${firstSire.breed} × Brahman Cross` : 'Wagyu Cross');

    const today = new Date().toISOString().split('T')[0];
    handleMatingDateChange(today);
    setActualCalvingDateInput('');

    setPregnancyStatusInput('Pending');
    setNotesInput('');
    setIsModalOpen(true);
  };

  const openEditModal = (rec: BreedingRecord) => {
    setModalMode('edit');
    setSelectedRecordId(rec.id);
    setProgramCodeInput(rec.id);

    setDamSourceInput(rec.damSource || 'Existing Dam');
    setDamIdInput(rec.damId || '');
    setSelectedCalfIdInput(rec.calfIdSource || '');
    setSireIdInput(rec.sireId || '');
    setBullNameInput(rec.bullName || rec.sireName || '');

    setOwnerTypeInput((rec.ownerType as any) || 'Farm');
    setSelectedFarmName(rec.farmLocation || '0001 - SNR Farm Facility');
    setSelectedOwnerName(rec.cowOwner || '0001 - SNR Farm');

    setPriceInput(rec.price || rec.breedingInseminationCost || 85);
    setCurrencyInput(rec.currency || 'USD');

    setBreederIdInput(rec.breederId || 'EMP-001');
    setBreederNameInput(rec.breederName || MASTER_BREEDERS[0].name);

    setServiceTypeInput(rec.serviceType || 'AI');
    setBreedingMethodInput(rec.breedingMethod || 'Cross-Breeding');
    setTargetBreedInput(rec.targetBreed || 'Angus Cross');

    const matingStr = rec.matingDate ? rec.matingDate.split('T')[0] : '';
    setMatingDateInput(matingStr);

    if (matingStr) {
      handleMatingDateChange(matingStr);
    }
    if (rec.expectedBirthdate) setExpectedBirthdateInput(rec.expectedBirthdate.split('T')[0]);
    if (rec.pregnancyCheckDate) setPregnancyCheckDateInput(rec.pregnancyCheckDate.split('T')[0]);
    if (rec.actualCalvingDate) setActualCalvingDateInput(rec.actualCalvingDate.split('T')[0]);

    setPregnancyStatusInput(rec.pregnancyStatus || 'Pending');
    setNotesInput(rec.notes || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const damName = selectedDamObj ? selectedDamObj.name : damIdInput;
      const damImageUrl = selectedDamObj ? (selectedDamObj.imageUrl || selectedDamObj.image_url) : undefined;
      const sireImageUrl = selectedSireObj ? selectedSireObj.imageUrl : undefined;

      const payload: Partial<BreedingRecord> = {
        id: programCodeInput || undefined,
        cowOwner: ownerTypeInput === 'Farm' ? selectedFarmObj.name : selectedOwnerObj.name,
        ownerType: ownerTypeInput,
        farmLocation: selectedFarmObj.name,
        farmCode: selectedFarmObj.code,
        ownerContact: ownerTypeInput === 'Farm' ? selectedFarmObj.contact : selectedOwnerObj.contact,
        damSource: damSourceInput,
        calfIdSource: damSourceInput === 'Dam from Calf' ? selectedCalfIdInput : undefined,
        damId: damIdInput,
        damName: damName,
        damImageUrl: damImageUrl,
        breederId: selectedBreederObj.id,
        breederName: selectedBreederObj.name,
        breederContact: selectedBreederObj.contact,
        serviceType: serviceTypeInput,
        breedingMethod: breedingMethodInput,
        targetBreed: targetBreedInput,
        bullName: bullNameInput,
        sireId: sireIdInput,
        sireName: bullNameInput,
        sireImageUrl: sireImageUrl,
        heatDetectionDate: matingDateInput || undefined,
        matingDate: matingDateInput,
        pregnancyCheckDate: pregnancyCheckDateInput || undefined,
        expectedBirthdate: expectedBirthdateInput || undefined,
        actualCalvingDate: actualCalvingDateInput || undefined,
        pregnancyStatus: pregnancyStatusInput,
        price: priceInput,
        breedingInseminationCost: priceInput,
        currency: currencyInput,
        notes: notesInput || undefined
      };

      await onSaveBreedingRecord(payload, modalMode, selectedRecordId);
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to save breeding record:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredRecords = breedingRecords.filter(rec => {
    const matchesSearch =
      rec.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (rec.damName && rec.damName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (rec.bullName && rec.bullName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (rec.targetBreed && rec.targetBreed.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'All' || rec.pregnancyStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-xs">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="Search record ID, Dam cow, Sire bull, target breed..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#16a34a] text-[#111827]"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={openCreateModal}
            className="bg-[#16a34a] hover:bg-[#15803d] text-white font-semibold py-2 px-4 rounded-lg text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Breeding Record</span>
          </button>
          <div className="flex items-center gap-1.5 border-l border-[#E5E7EB] pl-2">
            <Filter className="h-3.5 w-3.5 text-[#6B7280]" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs border border-[#E5E7EB] rounded-lg px-2.5 py-1.5 bg-white font-medium text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#16a34a] cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed Pregnant">Confirmed Pregnant</option>
              <option value="Open">Open</option>
              <option value="Calved">Calved</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Archived">Archived</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid View: Fully Responsive & Clickable Cards (No View / Delete Icons) */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {filteredRecords.map(rec => (
            <div
              key={rec.id}
              onClick={() => onOpenDetailView('breeding', rec)}
              className="bg-white rounded-2xl border border-[#E5E7EB] p-4 hover:shadow-lg hover:border-[#16a34a]/60 hover:scale-[1.008] transition-all duration-200 cursor-pointer space-y-3 flex flex-col justify-between group"
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-[#F3F4F6] pb-2.5">
                  <span className="text-xs font-mono font-bold text-[#16a34a] bg-[#DCFCE7] px-2.5 py-0.5 rounded-full border border-[#BBF7D0]">
                    #{rec.id}
                  </span>
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                    rec.pregnancyStatus === 'Confirmed Pregnant' ? 'bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]' :
                    rec.pregnancyStatus === 'Pending' ? 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]' :
                    rec.pregnancyStatus === 'Calved' ? 'bg-[#E0F2FE] text-[#0369A1] border-[#BAE6FD]' :
                    rec.pregnancyStatus === 'Draft' ? 'bg-slate-100 text-slate-700 border-slate-300' :
                    rec.pregnancyStatus === 'Cancelled' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                    rec.pregnancyStatus === 'Archived' ? 'bg-gray-200 text-gray-700 border-gray-400' :
                    'bg-[#FEE2E2] text-[#B91C1C] border-[#FCA5A5]'
                  }`}>
                    {rec.pregnancyStatus}
                  </span>
                </div>

                {/* Parents Thumbnails */}
                <div className="grid grid-cols-2 gap-2 bg-[#F8FAFC] p-2.5 rounded-xl border border-[#F1F5F9] group-hover:bg-slate-100/80 transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-[#E2E8F0] shrink-0 bg-slate-900 relative">
                      <img
                        src={rec.damImageUrl || 'https://images.unsplash.com/photo-1546445317-29f4545f9d52?auto=format&fit=crop&w=400&q=80'}
                        alt="Dam Cow"
                        className="w-full h-full object-cover object-center"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] text-[#94A3B8] font-extrabold uppercase">Mother (Dam)</p>
                      <p className="text-xs font-bold text-[#0F172A] truncate">{rec.damName || rec.damId}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-[#E2E8F0] shrink-0 bg-slate-900 relative">
                      <img
                        src={rec.sireImageUrl || 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=400&q=80'}
                        alt="Sire Bull"
                        className="w-full h-full object-cover object-center"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] text-[#94A3B8] font-extrabold uppercase">Father (Sire)</p>
                      <p className="text-xs font-bold text-[#0F172A] truncate">{rec.bullName || rec.sireName || rec.sireId || 'Sire'}</p>
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-[10px] text-[#94A3B8] font-medium">Breed Target</p>
                    <p className="font-bold text-[#0F172A]">{rec.targetBreed || 'Cross-breed'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#94A3B8] font-medium">Mating Date</p>
                    <p className="font-semibold text-[#334155]">{rec.matingDate ? new Date(rec.matingDate).toLocaleDateString('en-GB') : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#94A3B8] font-medium">Expected Birth</p>
                    <p className="font-bold text-[#16a34a]">{rec.expectedBirthdate ? new Date(rec.expectedBirthdate).toLocaleDateString('en-GB') : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#94A3B8] font-medium">Breeding Price</p>
                    <p className="font-extrabold text-[#16a34a]">
                      {rec.currency === 'KHR' ? '៛' : '$'} {(rec.price || rec.breedingInseminationCost || 85).toLocaleString()} {rec.currency || 'USD'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Selector & Actions */}
              <div className="pt-3 border-t border-[#F1F5F9] flex items-center justify-between gap-2" onClick={e => e.stopPropagation()}>
                <select
                  value={rec.pregnancyStatus}
                  onChange={e => onConfirmStatus(rec.id, e.target.value as PregnancyStatus)}
                  className="text-xs font-semibold px-2 py-1.5 rounded-lg border border-[#CBD5E1] bg-white text-[#334155] cursor-pointer"
                >
                  <option value="Draft">📝 Draft</option>
                  <option value="Pending">⏳ Pending</option>
                  <option value="Confirmed Pregnant">✅ Confirmed Pregnant</option>
                  <option value="Open">❌ Open</option>
                  <option value="Calved">👶 Calved</option>
                  <option value="Cancelled">⚠️ Cancelled</option>
                  <option value="Archived">📦 Archived</option>
                </select>

                <div className="flex items-center gap-2">
                  {(rec.pregnancyStatus === 'Confirmed Pregnant' || (rec.pregnancyStatus as string) === 'Expected Calving' || (rec.pregnancyStatus as string) === 'Ready for Calving') && (rec.pregnancyStatus as string) !== 'Completed' && rec.pregnancyStatus !== 'Calved' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openCalvingModal(rec);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-xs font-extrabold shadow-sm flex items-center gap-1.5 transition-all transform active:scale-95 cursor-pointer"
                    >
                      👶 Register Calving
                    </button>
                  )}

                  <button
                    onClick={() => openEditModal(rec)}
                    className="px-3 py-1.5 rounded-lg bg-[#16a34a] text-white hover:bg-[#15803d] text-xs font-bold transition-colors cursor-pointer"
                  >
                    Edit Record
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E5E7EB] text-[#475569] font-bold">
                <th className="p-3">Record ID</th>
                <th className="p-3">Dam (Mother)</th>
                <th className="p-3">Sire (Father)</th>
                <th className="p-3">Target Breed</th>
                <th className="p-3">Price</th>
                <th className="p-3">Expected Birth</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {filteredRecords.map(rec => (
                <tr key={rec.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => onOpenDetailView('breeding', rec)}>
                  <td className="p-3 font-mono font-bold text-[#16a34a]">#{rec.id}</td>
                  <td className="p-3 font-bold text-[#0F172A]">{rec.damName || rec.damId}</td>
                  <td className="p-3 font-bold text-[#0F172A]">{rec.bullName || rec.sireName || rec.sireId}</td>
                  <td className="p-3 text-[#15803D] font-semibold">{rec.targetBreed || 'Cross'}</td>
                  <td className="p-3 font-bold text-[#16a34a]">
                    {rec.currency === 'KHR' ? '៛' : '$'} {(rec.price || rec.breedingInseminationCost || 85).toLocaleString()} {rec.currency || 'USD'}
                  </td>
                  <td className="p-3 font-bold text-[#16a34a]">{rec.expectedBirthdate ? new Date(rec.expectedBirthdate).toLocaleDateString('en-GB') : '—'}</td>
                  <td className="p-3" onClick={e => e.stopPropagation()}>
                    <select
                      value={rec.pregnancyStatus}
                      onChange={e => onConfirmStatus(rec.id, e.target.value as PregnancyStatus)}
                      className="text-xs font-semibold px-2 py-1 rounded-md border border-[#CBD5E1] bg-white cursor-pointer"
                    >
                      <option value="Draft">📝 Draft</option>
                      <option value="Pending">⏳ Pending</option>
                      <option value="Confirmed Pregnant">✅ Confirmed Pregnant</option>
                      <option value="Open">❌ Open</option>
                      <option value="Calved">👶 Calved</option>
                      <option value="Cancelled">⚠️ Cancelled</option>
                      <option value="Archived">📦 Archived</option>
                    </select>
                  </td>
                  <td className="p-3 text-right" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                      {(rec.pregnancyStatus === 'Confirmed Pregnant' || (rec.pregnancyStatus as string) === 'Expected Calving' || (rec.pregnancyStatus as string) === 'Ready for Calving') && (rec.pregnancyStatus as string) !== 'Completed' && rec.pregnancyStatus !== 'Calved' && (
                        <button
                          onClick={() => openCalvingModal(rec)}
                          className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-xs font-extrabold shadow-xs"
                        >
                          👶 Register Calving
                        </button>
                      )}
                      <button
                        onClick={() => openEditModal(rec)}
                        className="px-3 py-1 rounded-lg bg-[#16a34a] text-white hover:bg-[#15803d] font-bold text-xs"
                      >
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ─── ENHANCED NEW BREED RECORD FORM WIZARD (6 STRUCTURED SECTIONS) ─── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm overflow-y-auto p-4 py-8">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-3xl overflow-hidden my-auto">
            
            {/* Form Header */}
            <div className="bg-slate-900 text-white p-5 px-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xl">
                  🧬
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    {modalMode === 'create' ? 'New Breed Record Wizard (6 Logical Sections)' : 'Edit Breeding Program Record'}
                  </h3>
                  <p className="text-xs text-slate-400">Structured pedigree, timetable & auto-populated lineage workflow</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-sm transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body: 6 Grouped Form Sections */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              
              {/* SECTION 1: Program Information */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-black text-slate-800 uppercase tracking-wider">
                  <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs">1</span>
                  📋 Section 1: Program Information
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Program Code (Auto-Generated) *</label>
                    <input
                      type="text"
                      readOnly
                      value={programCodeInput}
                      className="w-full px-3 py-2 text-xs font-mono font-bold text-emerald-700 bg-slate-100 border border-slate-300 rounded-xl outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Program Name *</label>
                    <input
                      type="text"
                      value={programNameInput || `${selectedDamObj?.name || 'Dam'} × ${selectedSireObj?.name || bullNameInput || 'Sire'} Breeding Program`}
                      onChange={e => setProgramNameInput(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-bold text-slate-800 bg-white border border-slate-300 rounded-xl focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Breeding Type</label>
                    <select
                      value={serviceTypeInput}
                      onChange={e => setServiceTypeInput(e.target.value as ServiceType)}
                      className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl bg-white text-slate-800"
                    >
                      <option value="AI">🧬 Artificial Insemination (AI)</option>
                      <option value="ET">🔬 Embryo Transfer (ET)</option>
                      <option value="IVF">🧪 In Vitro Fertilization (IVF)</option>
                      <option value="Nature">🐂 Natural Service</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Breeding Method</label>
                    <select
                      value={breedingMethodInput}
                      onChange={e => setBreedingMethodInput(e.target.value as BreedingMethod)}
                      className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl bg-white text-slate-800"
                    >
                      <option value="Cross-Breeding">🔀 Cross-Breeding</option>
                      <option value="Purebreeding">🧬 Purebreeding</option>
                      <option value="Inbreeding">⚡ Linebreeding / Inbreeding</option>
                      <option value="Back-cross">↩️ Back-cross</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Program Status *</label>
                    <select
                      value={pregnancyStatusInput}
                      onChange={e => setPregnancyStatusInput(e.target.value as PregnancyStatus)}
                      className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl bg-white text-slate-800"
                    >
                      <option value="Draft">📝 Draft</option>
                      <option value="Pending">⏳ Pending</option>
                      <option value="Confirmed Pregnant">✅ Confirmed Pregnant</option>
                      <option value="Open">❌ Open</option>
                      <option value="Calved">👶 Calved</option>
                      <option value="Cancelled">⚠️ Cancelled</option>
                      <option value="Archived">📦 Archived</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Breeding Date *</label>
                    <input
                      required
                      type="date"
                      value={matingDateInput}
                      onChange={e => handleMatingDateChange(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl bg-white text-slate-800"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Farm Facility Location</label>
                    <input
                      type="text"
                      value={farmLocationInput}
                      onChange={e => setFarmLocationInput(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl bg-white text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: Owner Selection (Farm vs Cow Owner) */}
              <div className="bg-purple-50/50 border border-purple-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-black text-purple-900 uppercase tracking-wider">
                    <span className="w-6 h-6 rounded-lg bg-purple-600 text-white flex items-center justify-center text-xs">2</span>
                    🏠 Section 2: Owner Selection (Farm vs Cow Owner)
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
                      {MASTER_FARMS.map(f => (
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
                      {MASTER_COW_OWNERS.map(o => (
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

              {/* SECTION 3: Auto Populate Sire Information (From Sire Insemination Module) */}
              <div className="bg-sky-50/50 border border-sky-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-black text-sky-900 uppercase tracking-wider">
                    <span className="w-6 h-6 rounded-lg bg-sky-600 text-white flex items-center justify-center text-xs">3</span>
                    🐂 Section 3: Auto Populate Sire Information (From Sire Insemination Module)
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 border border-sky-200">
                    Read-Only Auto-Populated
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-sky-950 mb-1">Select Active Sire Bull *</label>
                  <select
                    required
                    value={sireIdInput}
                    onChange={e => handleSireChange(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold border border-sky-300 rounded-xl bg-white text-slate-900 shadow-xs"
                  >
                    {semenBulls.map(bull => (
                      <option key={bull.id} value={bull.id}>
                        {bull.name} — {bull.breed} (Code: {bull.code}, Tank: {bull.tankStorageId || 'Tank 01'})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Auto-populated Sire Summary Card */}
                {selectedSireObj && (
                  <div className="bg-white border border-sky-200 rounded-xl p-4 flex items-start gap-4 shadow-xs">
                    <img
                      src={selectedSireObj.imageUrl || 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=400&q=80'}
                      alt=""
                      className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
                    />
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 flex-1 text-xs">
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Sire ID & Name</p>
                        <p className="font-extrabold text-slate-900">{selectedSireObj.name} ({selectedSireObj.code})</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Breed & Lineage</p>
                        <p className="font-bold text-sky-700">{selectedSireObj.breed}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Semen Code & Storage</p>
                        <p className="font-bold text-slate-800 font-mono">{selectedSireObj.code} ({selectedSireObj.tankStorageId || 'Tank 01'})</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Collection & Type</p>
                        <p className="font-bold text-slate-800">{selectedSireObj.production || 'Frozen Semen'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Health & Genetic Line</p>
                        <p className="font-bold text-emerald-700">Verified Clean Lineage</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Farm & Country</p>
                        <p className="font-bold text-slate-800">{selectedSireObj.sourcingCompanies?.[0] || 'SNR Farm'} ({selectedSireObj.fromCountry || 'USA'})</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 4: Dam Selection & Auto-Populated Information */}
              <div className="bg-pink-50/50 border border-pink-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-black text-pink-900 uppercase tracking-wider">
                    <span className="w-6 h-6 rounded-lg bg-pink-600 text-white flex items-center justify-center text-xs">4</span>
                    🐄 Section 4: Dam Selection & Auto-Populated Info
                  </div>
                  
                  {/* Dam Source Toggle */}
                  <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-pink-200">
                    <button
                      type="button"
                      onClick={() => {
                        setDamSourceInput('Existing Dam');
                        if (availableFemaleStock[0]) handleDamChange(availableFemaleStock[0].tagId || availableFemaleStock[0].id);
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        damSourceInput === 'Existing Dam'
                          ? 'bg-pink-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Option 1: Existing Dam Listing
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDamSourceInput('Dam from Calf');
                        if (calfRecords[0]) handleCalfSelect(calfRecords[0].id);
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        damSourceInput === 'Dam from Calf'
                          ? 'bg-pink-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Option 2: Dam from Calf Module
                    </button>
                  </div>
                </div>

                {damSourceInput === 'Existing Dam' ? (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-bold text-pink-950">Select Available Dam Cow *</label>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        {availableFemaleStock.length} Eligible Dams (Available & Non-Pregnant)
                      </span>
                    </div>
                    <select
                      required
                      value={damIdInput}
                      onChange={e => handleDamChange(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-bold border border-pink-300 rounded-xl bg-white text-slate-900 shadow-xs"
                    >
                      {availableFemaleStock.map(cow => (
                        <option key={cow.id} value={cow.tagId || cow.id}>
                          {cow.name} — Tag #{cow.tagId || cow.id} ({cow.breed}) [{cow.healthStatus || 'Healthy'}]
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-[11px] font-bold text-pink-950 mb-1">Select Calf Record (Linked Related Dam) *</label>
                    <select
                      required
                      value={selectedCalfIdInput}
                      onChange={e => handleCalfSelect(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-bold border border-pink-300 rounded-xl bg-white text-slate-900 shadow-xs"
                    >
                      {calfRecords.map(calf => (
                        <option key={calf.id} value={calf.id}>
                          Calf #{calf.code || calf.id}: {calf.name} — Related Dam: {calf.damName || calf.damId} ({calf.breed})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Auto-populated Dam Card */}
                {selectedDamObj && (
                  <div className="bg-white border border-pink-200 rounded-xl p-4 flex items-start gap-4 shadow-xs">
                    <img
                      src={selectedDamObj.imageUrl || 'https://images.unsplash.com/photo-1546445317-29f4545f9d52?auto=format&fit=crop&w=400&q=80'}
                      alt=""
                      className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
                    />
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 flex-1 text-xs">
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Dam ID & Name</p>
                        <p className="font-extrabold text-slate-900">{selectedDamObj.name} (#{selectedDamObj.tagId || selectedDamObj.id})</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Breed</p>
                        <p className="font-bold text-pink-700">{selectedDamObj.breed}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Birth Date / Age</p>
                        <p className="font-bold text-slate-800">
                          {selectedDamObj.dob ? new Date(selectedDamObj.dob).toLocaleDateString('en-GB') : '3 Years (Prime)'}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Health Status</p>
                        <p className="font-bold text-emerald-700">{selectedDamObj.healthStatus || 'Healthy & Active'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 5: Pricing Breakdown & Breeder Specialist */}
              <div className="bg-amber-50/50 border border-amber-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-black text-amber-900 uppercase tracking-wider">
                    <span className="w-6 h-6 rounded-lg bg-amber-600 text-white flex items-center justify-center text-xs">5</span>
                    💵 Section 5: Service Pricing Breakdown & Breeder Specialist
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                    Supports USD ($) & KHR (៛)
                  </span>
                </div>

                {/* Comprehensive Fee Breakdown */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-white p-3 rounded-xl border border-amber-200">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">1. Service Fee</label>
                    <input
                      type="number"
                      min="0"
                      value={priceInput}
                      onChange={e => setPriceInput(parseFloat(e.target.value) || 0)}
                      placeholder="Service Fee"
                      className="w-full px-2.5 py-1.5 font-bold border border-slate-300 rounded-lg text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">2. Semen Straw Price</label>
                    <input
                      type="number"
                      min="0"
                      value={selectedSireObj?.pricePerStraw || 85}
                      readOnly
                      className="w-full px-2.5 py-1.5 font-bold border border-slate-300 rounded-lg bg-slate-100 text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">3. Transport Fee</label>
                    <input
                      type="number"
                      min="0"
                      defaultValue={15}
                      className="w-full px-2.5 py-1.5 font-bold border border-slate-300 rounded-lg text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Currency Selector *</label>
                    <select
                      value={currencyInput}
                      onChange={e => setCurrencyInput(e.target.value as 'USD' | 'KHR')}
                      className="w-full px-2.5 py-1.5 font-bold border border-amber-300 rounded-lg bg-amber-100 text-amber-900 cursor-pointer"
                    >
                      <option value="USD">$ USD ($)</option>
                      <option value="KHR">៛ KHR (៛)</option>
                    </select>
                  </div>
                </div>

                {/* Total Summary Row & Breeder Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="bg-amber-100/60 border border-amber-300 rounded-xl p-3 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-extrabold text-amber-900 uppercase">Total Breeding Service Amount</p>
                      <p className="text-xl font-black text-amber-950">
                        {currencyInput === 'KHR' ? '៛' : '$'} {((priceInput || 85) + (selectedSireObj?.pricePerStraw || 85) + 15).toLocaleString()} {currencyInput}
                      </p>
                    </div>
                    <span className="text-xs font-extrabold px-2.5 py-1 bg-amber-600 text-white rounded-lg shadow-xs">
                      1 Straw Auto-Deducted
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Assign Breeder Specialist *</label>
                    <select
                      value={breederIdInput}
                      onChange={e => {
                        setBreederIdInput(e.target.value);
                        const b = MASTER_BREEDERS.find(br => br.id === e.target.value);
                        if (b) setBreederNameInput(b.name);
                      }}
                      className="w-full px-3 py-2 text-xs font-bold border border-amber-300 rounded-xl bg-white text-slate-900 shadow-xs"
                    >
                      {MASTER_BREEDERS.map(b => (
                        <option key={b.id} value={b.id}>
                          {b.name} ({b.id} — {b.title})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {selectedBreederObj && (
                  <div className="text-[11px] bg-white p-2.5 rounded-xl border border-amber-200 flex items-center justify-between text-slate-700 font-semibold">
                    <span>👨‍⚕️ <strong>Breeder:</strong> {selectedBreederObj.name}</span>
                    <span>🆔 <strong>Employee ID:</strong> {selectedBreederObj.id}</span>
                    <span>💼 <strong>Position:</strong> {selectedBreederObj.title}</span>
                    <span>📞 <strong>Tel:</strong> {selectedBreederObj.contact}</span>
                  </div>
                )}
              </div>

              {/* SECTION 6: Breeding Timetable & Expected Result */}
              <div className="bg-emerald-50/40 border border-emerald-200 rounded-2xl p-4 space-y-4">
                <div className="flex items-center gap-2 text-xs font-black text-emerald-900 uppercase tracking-wider">
                  <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs">6</span>
                  🔬 Section 6: Breeding Timetable & Expected Outcome
                </div>

                {/* Sub-section 6.1: Breeding Timetable */}
                <div className="space-y-2">
                  <h4 className="text-[11px] font-extrabold text-emerald-900 uppercase tracking-wide flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" /> 6.1 Breeding Scheduling Timetable (Auto-Calculated)
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">Mating / Breeding Date *</label>
                      <input
                        required
                        type="date"
                        value={matingDateInput}
                        onChange={e => handleMatingDateChange(e.target.value)}
                        className="w-full px-2.5 py-1.5 font-bold border border-slate-300 rounded-lg bg-white text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">Follow-up Date (+21d)</label>
                      <input
                        type="date"
                        value={followUpDateInput}
                        onChange={e => setFollowUpDateInput(e.target.value)}
                        className="w-full px-2.5 py-1.5 font-bold border border-slate-300 rounded-lg bg-emerald-50/60 text-emerald-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">Pregnancy Check (+45d)</label>
                      <input
                        type="date"
                        value={pregnancyCheckDateInput}
                        onChange={e => setPregnancyCheckDateInput(e.target.value)}
                        className="w-full px-2.5 py-1.5 font-bold border border-slate-300 rounded-lg bg-emerald-50/60 text-emerald-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">Expected Calving (+283d)</label>
                      <input
                        type="date"
                        value={expectedBirthdateInput}
                        onChange={e => setExpectedBirthdateInput(e.target.value)}
                        className="w-full px-2.5 py-1.5 font-extrabold border border-emerald-400 rounded-lg bg-emerald-100/70 text-emerald-900"
                      />
                    </div>
                  </div>
                </div>

                {/* Sub-section 6.2: Expected Result */}
                <div className="space-y-2 pt-2 border-t border-emerald-200">
                  <h4 className="text-[11px] font-extrabold text-emerald-900 uppercase tracking-wide flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> 6.2 Expected Breed & Offspring Result
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">Suggested Expected Breed</label>
                      <input
                        type="text"
                        value={targetBreedInput}
                        onChange={e => setTargetBreedInput(e.target.value)}
                        className="w-full px-3 py-2 font-bold border border-slate-300 rounded-xl bg-white text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">Expected Offspring Count</label>
                      <select
                        value={expectedOffspringCount}
                        onChange={e => setExpectedOffspringCount(e.target.value)}
                        className="w-full px-3 py-2 font-bold border border-slate-300 rounded-xl bg-white text-slate-900"
                      >
                        <option value="1 Calf (Single)">1 Calf (Single)</option>
                        <option value="2 Calves (Twins)">2 Calves (Twins)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">Expected Gender (Optional)</label>
                      <select
                        value={expectedGenderInput}
                        onChange={e => setExpectedGenderInput(e.target.value)}
                        className="w-full px-3 py-2 font-bold border border-slate-300 rounded-xl bg-white text-slate-900"
                      >
                        <option value="Any / Natural">Any / Natural (50/50)</option>
                        <option value="Male">Male (Sexed Semen)</option>
                        <option value="Female">Female (Sexed Semen)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">Expected Birth Weight</label>
                      <input
                        type="text"
                        value={expectedBirthWeightInput}
                        onChange={e => setExpectedBirthWeightInput(e.target.value)}
                        className="w-full px-3 py-2 font-bold border border-slate-300 rounded-xl bg-white text-slate-900"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">Expected Health Grade</label>
                      <input
                        type="text"
                        value={expectedHealthStatusInput}
                        onChange={e => setExpectedHealthStatusInput(e.target.value)}
                        className="w-full px-3 py-2 font-bold border border-slate-300 rounded-xl bg-white text-slate-900"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">Program Notes & Instructions</label>
                      <textarea
                        rows={2}
                        value={notesInput}
                        onChange={e => setNotesInput(e.target.value)}
                        placeholder="Add special feeding, monitoring, or veterinary notes..."
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-slate-900"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {isSubmitting ? 'Saving Record...' : 'Save Breeding Program Record'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
      {/* ─── REGISTER CALVING EVENT WIZARD MODAL ─── */}
      {isCalvingModalOpen && selectedCalvingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs overflow-y-auto p-4 py-8">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl overflow-hidden my-auto">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 text-white p-5 px-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-2xl shadow-inner">
                  👶
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    Register Calving Event — Record #{selectedCalvingRecord.id}
                  </h3>
                  <p className="text-xs text-amber-300/80">Auto-populated parent lineage, birth event stats & newborn calf registration</p>
                </div>
              </div>
              <button
                onClick={() => setIsCalvingModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-sm transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleCalvingSubmit} className="p-6 space-y-6 max-h-[78vh] overflow-y-auto">

              {/* READ-ONLY AUTO-POPULATED CARDS (3 COLUMNS) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Card 1: Breeding Info */}
                <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-black text-amber-900 uppercase tracking-wider border-b border-amber-200/80 pb-2">
                    🧬 1. Breeding Program Info
                  </div>
                  <div className="text-xs space-y-1">
                    <p><span className="text-slate-500 font-medium">Program Code:</span> <strong className="font-mono text-amber-900">{selectedCalvingRecord.id}</strong></p>
                    <p><span className="text-slate-500 font-medium">Breeding Date:</span> <strong className="text-slate-800">{selectedCalvingRecord.matingDate ? new Date(selectedCalvingRecord.matingDate).toLocaleDateString('en-GB') : '—'}</strong></p>
                    <p><span className="text-slate-500 font-medium">Service Type:</span> <span className="font-bold text-amber-800">{selectedCalvingRecord.serviceType || 'AI'}</span></p>
                    <p><span className="text-slate-500 font-medium">Method:</span> <strong className="text-slate-800">{selectedCalvingRecord.breedingMethod || 'Cross-Breeding'}</strong></p>
                  </div>
                </div>

                {/* Card 2: Sire Info */}
                <div className="bg-sky-50/60 border border-sky-200 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-black text-sky-900 uppercase tracking-wider border-b border-sky-200/80 pb-2">
                    🐂 2. Sire Bull Info (Father)
                  </div>
                  <div className="text-xs space-y-1">
                    <p><span className="text-slate-500 font-medium">Sire Bull:</span> <strong className="text-sky-900">{selectedCalvingRecord.bullName || selectedCalvingRecord.sireName || '—'}</strong></p>
                    <p><span className="text-slate-500 font-medium">Target Breed:</span> <span className="font-bold text-sky-700">{selectedCalvingRecord.targetBreed || '—'}</span></p>
                    <p><span className="text-slate-500 font-medium">Sire ID / Tag:</span> <span className="font-mono font-semibold text-slate-700">{selectedCalvingRecord.sireId || '—'}</span></p>
                  </div>
                </div>

                {/* Card 3: Dam Info */}
                <div className="bg-rose-50/60 border border-rose-200 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-black text-rose-900 uppercase tracking-wider border-b border-rose-200/80 pb-2">
                    🐄 3. Dam Cow Info (Mother)
                  </div>
                  <div className="text-xs space-y-1">
                    <p><span className="text-slate-500 font-medium">Dam Cow:</span> <strong className="text-rose-900">{selectedCalvingRecord.damName || selectedCalvingRecord.damId}</strong></p>
                    <p><span className="text-slate-500 font-medium">Dam Breed:</span> <span className="font-bold text-rose-700">{selectedCalvingRecord.damBreed || '—'}</span></p>
                    <p><span className="text-slate-500 font-medium">Farm Location:</span> <strong className="text-slate-800">{selectedCalvingRecord.farmLocation || '—'}</strong></p>
                    <p><span className="text-slate-500 font-medium">Cow Owner:</span> <strong className="text-slate-800">{selectedCalvingRecord.cowOwner || '—'}</strong></p>
                  </div>
                </div>

              </div>

              {/* SECTION 4: CALVING EVENT INFORMATION (EDITABLE) */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-black text-slate-800 uppercase tracking-wider">
                  <span className="w-6 h-6 rounded-lg bg-amber-600 text-white flex items-center justify-center text-xs">4</span>
                  🏥 Section 4: Calving Event & Delivery Details
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Birth Date *</label>
                    <input
                      type="date"
                      required
                      value={calvingBirthDate}
                      onChange={e => setCalvingBirthDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl bg-white text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Birth Time</label>
                    <input
                      type="time"
                      value={calvingBirthTime}
                      onChange={e => setCalvingBirthTime(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl bg-white text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Birth Location</label>
                    <input
                      type="text"
                      value={calvingBirthLocation}
                      onChange={e => setCalvingBirthLocation(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl bg-white text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Birth Type *</label>
                    <select
                      value={calvingBirthType}
                      onChange={e => handleBirthTypeChange(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl bg-white text-slate-900 cursor-pointer"
                    >
                      <option value="Single">1 Calf (Single Birth)</option>
                      <option value="Twin">2 Calves (Twin Birth)</option>
                      <option value="Multiple">Multiple (3+ Calves)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Birth Outcome</label>
                    <select
                      value={calvingBirthOutcome}
                      onChange={e => setCalvingBirthOutcome(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl bg-white text-slate-900 cursor-pointer"
                    >
                      <option value="Normal / Alive">🟢 Normal / Healthy Alive</option>
                      <option value="Assisted Alive">🟡 Assisted Delivery (Alive)</option>
                      <option value="Weak / Observation">🟠 Weak / Under Observation</option>
                      <option value="Stillborn">🔴 Stillborn</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Delivery Method</label>
                    <select
                      value={calvingDeliveryMethod}
                      onChange={e => setCalvingDeliveryMethod(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl bg-white text-slate-900 cursor-pointer"
                    >
                      <option value="Natural Spontaneous">🌿 Natural Spontaneous</option>
                      <option value="Assisted Extraction">🩺 Assisted Manual Extraction</option>
                      <option value="Surgical C-Section">🏥 Surgical C-Section</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Assisted Delivery Required?</label>
                    <button
                      type="button"
                      onClick={() => setCalvingAssistedDelivery(!calvingAssistedDelivery)}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 transition-all ${
                        calvingAssistedDelivery
                          ? 'bg-amber-500 text-white border-amber-600'
                          : 'bg-white text-slate-700 border-slate-300'
                      }`}
                    >
                      {calvingAssistedDelivery ? '✅ Assisted Delivery (Yes)' : '❌ Unassisted Natural (No)'}
                    </button>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Attending Technician / Veterinarian</label>
                    <select
                      value={calvingTechnician}
                      onChange={e => setCalvingTechnician(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl bg-white text-slate-900 cursor-pointer"
                    >
                      {MASTER_BREEDERS.map(b => (
                        <option key={b.id} value={b.name}>{b.name} ({b.title})</option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Calving Notes & Observations</label>
                    <textarea
                      rows={2}
                      value={calvingNotes}
                      onChange={e => setCalvingNotes(e.target.value)}
                      placeholder="Enter calving condition, colostrum intake, maternal behavior..."
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 5: NEWBORN CALF / CALVES REGISTRATION CARDS */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-black text-slate-800 uppercase tracking-wider">
                    <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs">5</span>
                    🍼 Section 5: Newborn Calf Registration ({calfItems.length} {calfItems.length === 1 ? 'Calf' : 'Calves'})
                  </div>
                  {calvingBirthType === 'Multiple' && (
                    <button
                      type="button"
                      onClick={handleAddCalfItem}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      + Add Another Calf
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  {calfItems.map((item, idx) => (
                    <div key={item.id} className="bg-white border-2 border-emerald-200 rounded-2xl p-4 shadow-xs relative space-y-4">
                      
                      <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
                        <span className="text-xs font-black text-emerald-800 uppercase tracking-wider flex items-center gap-2">
                          🐮 Calf #{idx + 1} Record
                        </span>
                        {calfItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveCalfItem(idx)}
                            className="text-xs text-rose-600 hover:text-rose-800 font-bold"
                          >
                            ✕ Remove Calf
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">Calf Name *</label>
                          <input
                            type="text"
                            required
                            value={item.name}
                            onChange={e => handleCalfItemChange(idx, 'name', e.target.value)}
                            className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl bg-white text-slate-900"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">Ear Tag / ID *</label>
                          <input
                            type="text"
                            required
                            value={item.tagId}
                            onChange={e => handleCalfItemChange(idx, 'tagId', e.target.value)}
                            className="w-full px-3 py-2 text-xs font-mono font-bold text-emerald-700 border border-slate-300 rounded-xl bg-slate-50"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">Gender *</label>
                          <select
                            value={item.sex}
                            onChange={e => handleCalfItemChange(idx, 'sex', e.target.value as any)}
                            className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl bg-white text-slate-900 cursor-pointer"
                          >
                            <option value="Male">♂ Male (Bull Calf)</option>
                            <option value="Female">♀ Female (Heifer Calf)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">Birth Weight (kg) *</label>
                          <input
                            type="number"
                            step="0.1"
                            required
                            value={item.weight}
                            onChange={e => handleCalfItemChange(idx, 'weight', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl bg-white text-slate-900"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">Height (cm)</label>
                          <input
                            type="number"
                            value={item.height}
                            onChange={e => handleCalfItemChange(idx, 'height', parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl bg-white text-slate-900"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">Coat Color</label>
                          <input
                            type="text"
                            value={item.coatColor}
                            onChange={e => handleCalfItemChange(idx, 'coatColor', e.target.value)}
                            className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl bg-white text-slate-900"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">Health Status</label>
                          <select
                            value={item.healthStatus}
                            onChange={e => handleCalfItemChange(idx, 'healthStatus', e.target.value)}
                            className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl bg-white text-slate-900 cursor-pointer"
                          >
                            <option value="Vigorous / Healthy">🟢 Vigorous / Healthy</option>
                            <option value="Weak / Under Observation">🟡 Weak / Under Observation</option>
                            <option value="Critical">🔴 Critical / Intensive Care</option>
                          </select>
                        </div>

                      </div>

                    </div>
                  ))}
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsCalvingModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCalvingSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-extrabold text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isCalvingSubmitting ? (
                    <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    '👶 Confirm & Register Calving Event'
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
