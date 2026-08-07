import React, { useState } from 'react';
import { Search, Plus, Edit, Trash2, Package, Syringe, ShoppingCart, ArrowRightLeft, Building2, User, ShieldCheck, HeartPulse, FileText, Layers, Globe, Calendar, DollarSign, Dna, Tag, UploadCloud, CheckCircle2 } from 'lucide-react';
import { SemenBull, StockMovementRecord, SOURCING_COMPANIES } from './types';

const SIRE_BREEDS = ['Angus', 'Brahman', 'Wagyu', 'Charolais', 'Hereford', 'Limousin', 'Simmental', 'Droughtmaster', 'Local/Cross'];

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

interface SemenStockSubTabProps {
  semenBulls: SemenBull[];
  stockMovements: StockMovementRecord[];
  onOpenDetailView: (type: 'semen', bull: SemenBull) => void;
  onSaveSemenBull: (bullData: Partial<SemenBull>, mode: 'create' | 'edit', editingId?: string | null) => Promise<void>;
  onDeleteSemenBull: (id: string) => Promise<void>;
  onSaveStockMovement: (movement: StockMovementRecord, targetSireId: string) => Promise<void>;
  onImageFileSelect: (file: File, callback: (url: string) => void) => void;
}

export default function SemenStockSubTab({
  semenBulls,
  stockMovements,
  onOpenDetailView,
  onSaveSemenBull,
  onDeleteSemenBull,
  onSaveStockMovement,
  onImageFileSelect
}: SemenStockSubTabProps) {
  // Tab view state
  const [semenTabMode, setSemenTabMode] = useState<'registry' | 'ledger'>('registry');

  // Filter states
  const [semenSearchQuery, setSemenSearchQuery] = useState('');
  const [semenBreedFilter, setSemenBreedFilter] = useState('ALL');
  const [semenCountryFilter, setSemenCountryFilter] = useState('ALL');
  const [semenProductionFilter, setSemenProductionFilter] = useState('ALL');

  // ── SIRE REGISTER WIZARD MODAL STATES (CARD-BASED MATCHING REGISTER DAM FORM) ──
  const [isSemenModalOpen, setIsSemenModalOpen] = useState(false);
  const [semenModalMode, setSemenModalMode] = useState<'create' | 'edit'>('create');
  const [editingSemenId, setEditingSemenId] = useState<string | null>(null);

  // Section 1: Basic Info
  const [sName, setSName] = useState('');
  const [sCode, setSCode] = useState('');
  const [sTagId, setSTagId] = useState('');
  const [sRegistrationNumber, setSRegistrationNumber] = useState('');
  const [sFromCountry, setSFromCountry] = useState('USA 🇺🇸');
  const [sBreed, setSBreed] = useState('Angus');
  const [sDob, setSsDob] = useState('');
  const [sProduction, setSProduction] = useState<'Frozen Semen' | 'Live Bull' | 'Fresh Semen' | 'Imported Semen' | 'Embryos'>('Frozen Semen');

  // Section 2: Ownership Info
  const [sOwnerType, setSOwnerType] = useState<'Farm' | 'Cow Owner' | 'Company-Owned'>('Farm');
  const [sSelectedFarmName, setSSelectedFarmName] = useState('0001 - SNR Farm Facility');
  const [sSelectedOwnerName, setSSelectedOwnerName] = useState('0001 - SNR Farm');
  const [sOwnerPhone, setSOwnerPhone] = useState('+855 12 345 678');
  const [sOwnerAddress, setSOwnerAddress] = useState('Kampong Cham, Cambodia');

  // Section 3: Genetics & Pedigree
  const [sBloodline, setSBloodline] = useState('100% Fullblood Pedigree');
  const [sGeneticLine, setSGeneticLine] = useState('Top Elite Lineage A-1');
  const [sSireName, setSSireName] = useState('');
  const [sSireBreed, setSSireBreed] = useState('Angus');
  const [sDamName, setSDamName] = useState('');
  const [sDamBreed, setSDamBreed] = useState('Angus');
  const [sGeneticGrade, setSGeneticGrade] = useState('Grade AA');
  const [sRegistrationAssociation, setSRegistrationAssociation] = useState('American Angus Association (AAA)');
  const [sDnaNumber, setSDnaNumber] = useState('');
  const [sPedigreeNotes, setSPedigreeNotes] = useState('');

  // Section 4: Physical Info
  const [sWeight, setSWeight] = useState('850');
  const [sHeight, setSHeight] = useState('145');
  const [sBcs, setSBcs] = useState<number>(4);
  const [sColor, setSColor] = useState('Black');
  const [sHornStatus, setSHornStatus] = useState<'Polled' | 'Horned' | 'Dehorned'>('Polled');
  const [sHealthStatus, setSHealthStatus] = useState('Healthy & Prime Breeding Condition 🟢');
  const [sVaccinationStatus, setSVaccinationStatus] = useState('Fully Vaccinated & Verified 🛡️');

  // Section 5: Inventory Info
  const [sSemenCode, setSSemenCode] = useState('');
  const [sBatchNumber, setSBatchNumber] = useState('');
  const [sCollectionDate, setSCollectionDate] = useState('');
  const [sExpiryDate, setSExpiryDate] = useState('');
  const [sAvailableQuantity, setSAvailableQuantity] = useState<number>(150);
  const [sUnit, setSUnit] = useState<'Straws' | 'Doses' | 'Vials'>('Straws');
  const [sTankStorageId, setSTankStorageId] = useState('Tank 01 - Canister A');

  // Section 6: Pricing Info
  const [sPurchasePrice, setSPurchasePrice] = useState<number>(15);
  const [sPurchaseCurrency, setSPurchaseCurrency] = useState<'USD' | 'KHR'>('USD');
  const [sPricePerStraw, setSPricePerStraw] = useState<number>(25);
  const [sCurrency, setSCurrency] = useState<'USD' | 'KHR'>('USD');
  const [sSupplier, setSSupplier] = useState('0001 - SNR Farm');

  // Section 7: Media & Attachments
  const [sImagePreview, setSImagePreview] = useState<string>('');
  const [sCertRegistration, setSCertRegistration] = useState(true);
  const [sCertHealth, setSCertHealth] = useState(true);
  const [sCertImport, setSCertImport] = useState(true);

  // Section 8: Notes
  const [sNote, setSNote] = useState('');
  const [sSourcingCompanies, setSSourcingCompanies] = useState<string[]>(['0001 - SNR Farm']);

  // Error & submitting
  const [sireFormError, setSireFormError] = useState('');
  const [isSubmittingSire, setIsSubmittingSire] = useState(false);

  // Stock Movement / Sell & Transfer Modal State
  const [isStockMovementModalOpen, setIsStockMovementModalOpen] = useState(false);
  const [selectedStockSire, setSelectedStockSire] = useState<SemenBull | null>(null);
  const [stockMovementType, setStockMovementType] = useState<'STOCK_IN' | 'STOCK_OUT' | 'TRANSFER' | 'SALE'>('SALE');
  const [smQuantity, setSmQuantity] = useState<number>(5);
  const [recipientType, setRecipientType] = useState<'Farm' | 'Cow Owner' | 'External Breeder'>('Cow Owner');
  const [smRecipientSupplier, setSmRecipientSupplier] = useState<string>('Lok Oknha Heng');
  const [smPrice, setSmPrice] = useState<number>(85);
  const [smCurrency, setSmCurrency] = useState<'USD' | 'KHR'>('USD');
  const [smTankId, setSmTankId] = useState<string>('Tank 01 - Canister A');
  const [smBatchNumber, setSmBatchNumber] = useState<string>('LOT-2026-08');
  const [smNotes, setSmNotes] = useState<string>('Official Sire Stock Transfer & Sale Transaction');
  const [stockErrorMsg, setStockErrorMsg] = useState<string>('');

  // Handlers for Sire Modal
  const openSemenModal = (bull?: SemenBull) => {
    if (bull) {
      setSemenModalMode('edit');
      setEditingSemenId(bull.id);
      setSName(bull.name);
      setSFromCountry(bull.fromCountry || 'USA 🇺🇸');
      setSCode(bull.code || '');
      setSTagId(bull.tagId || `TAG-${bull.code || bull.id}`);
      setSRegistrationNumber(bull.registrationNumber || `REG-${bull.code || bull.id}`);
      setSsDob(bull.dob || '');
      setSBreed(bull.breed || 'Angus');
      setSProduction((bull.production as any) || 'Frozen Semen');

      setSOwnerType(bull.ownerType || 'Farm');
      setSSelectedFarmName(bull.farmLocation || '0001 - SNR Farm Facility');
      setSSelectedOwnerName(bull.ownerName || '0001 - SNR Farm');
      setSOwnerPhone(bull.ownerPhone || '+855 12 345 678');
      setSOwnerAddress(bull.ownerAddress || 'Kampong Cham, Cambodia');

      setSBloodline(bull.bloodline || '100% Fullblood Pedigree');
      setSGeneticLine(bull.geneticLine || 'Top Elite Lineage A-1');
      setSSireName(bull.sireName || '');
      setSSireBreed(bull.sireBreed || '');
      setSDamName(bull.damName || '');
      setSDamBreed(bull.damBreed || '');
      setSGeneticGrade(bull.geneticGrade || 'Grade AA');
      setSRegistrationAssociation(bull.registrationAssociation || 'International Cattle Registry');
      setSDnaNumber(bull.dnaNumber || `DNA-${Math.floor(100000 + Math.random() * 900000)}`);
      setSPedigreeNotes(bull.pedigreeNotes || '');

      setSWeight(bull.weight || '850');
      setSHeight(bull.height || '145');
      setSBcs(bull.bcs || 4);
      setSColor(bull.color || 'Black');
      setSHornStatus(bull.hornStatus || 'Polled');
      setSHealthStatus(bull.healthStatus || 'Healthy & Prime Breeding Condition 🟢');
      setSVaccinationStatus(bull.vaccinationStatus || 'Fully Vaccinated & Verified 🛡️');

      setSSemenCode(bull.semenCode || bull.code || `SEM-${bull.breed.toUpperCase()}-01`);
      setSBatchNumber(bull.batchNumber || `LOT-${new Date().getFullYear()}-08`);
      setSCollectionDate(bull.collectionDate || '');
      setSExpiryDate(bull.expiryDate || '');
      setSAvailableQuantity(bull.stockQuantity ?? 150);
      setSUnit(bull.unit || 'Straws');
      setSTankStorageId(bull.tankStorageId || 'Tank 01 - Canister A');

      setSPurchasePrice(bull.purchasePrice ?? 15);
      setSPurchaseCurrency(bull.purchaseCurrency || 'USD');
      setSPricePerStraw(bull.pricePerStraw ?? 25);
      setSCurrency(bull.currency || 'USD');
      setSSupplier(bull.supplier || '0001 - SNR Farm');

      setSImagePreview(bull.imageUrl || '');
      setSNote(bull.note || '');
    } else {
      setSemenModalMode('create');
      setEditingSemenId(null);
      const autoId = `SIRE-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      setSName('');
      setSFromCountry('USA 🇺🇸');
      setSCode(autoId);
      setSTagId(`TAG-${Math.floor(1000 + Math.random() * 9000)}`);
      setSRegistrationNumber(`REG-${autoId}`);
      setSsDob('');
      setSBreed('Angus');
      setSProduction('Frozen Semen');

      setSOwnerType('Farm');
      setSSelectedFarmName('0001 - SNR Farm Facility');
      setSSelectedOwnerName('0001 - SNR Farm');
      setSOwnerPhone('+855 12 345 678');
      setSOwnerAddress('Kampong Cham, Cambodia');

      setSBloodline('100% Fullblood Pedigree');
      setSGeneticLine('Top Elite Lineage A-1');
      setSSireName('');
      setSSireBreed('Angus');
      setSDamName('');
      setSDamBreed('Angus');
      setSGeneticGrade('Grade AA');
      setSRegistrationAssociation('American Angus Association (AAA)');
      setSDnaNumber(`DNA-${Math.floor(100000 + Math.random() * 900000)}`);
      setSPedigreeNotes('');

      setSWeight('850');
      setSHeight('145');
      setSBcs(4);
      setSColor('Black');
      setSHornStatus('Polled');
      setSHealthStatus('Healthy & Prime Breeding Condition 🟢');
      setSVaccinationStatus('Fully Vaccinated & Verified 🛡️');

      setSSemenCode(`SEM-${autoId}`);
      setSBatchNumber(`LOT-${new Date().getFullYear()}-08`);
      setSCollectionDate('');
      setSExpiryDate('');
      setSAvailableQuantity(150);
      setSUnit('Straws');
      setSTankStorageId('Tank 01 - Canister A');

      setSPurchasePrice(15);
      setSPurchaseCurrency('USD');
      setSPricePerStraw(25);
      setSCurrency('USD');
      setSSupplier('0001 - SNR Farm');

      setSImagePreview('');
      setSNote('');
    }
    setSireFormError('');
    setIsSemenModalOpen(true);
  };

  const handleSemenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sName.trim()) {
      setSireFormError('Sire Name is required.');
      return;
    }
    if (!sBreed.trim()) {
      setSireFormError('Breed is required.');
      return;
    }
    if (!sFromCountry) {
      setSireFormError('Country of Origin is required.');
      return;
    }
    if (sProduction !== 'Live Bull' && (sAvailableQuantity === undefined || sAvailableQuantity < 0)) {
      setSireFormError('Available Straw Quantity is required for semen production types.');
      return;
    }

    setIsSubmittingSire(true);
    try {
      await onSaveSemenBull(
        {
          name: sName,
          fromCountry: sFromCountry,
          code: sCode || `SIRE-${sBreed.toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`,
          tagId: sTagId,
          registrationNumber: sRegistrationNumber,
          dob: sDob,
          breed: sBreed,
          production: sProduction,
          color: sColor,
          weight: sWeight,
          height: sHeight,
          bcs: sBcs,
          hornStatus: sHornStatus,
          healthStatus: sHealthStatus,
          vaccinationStatus: sVaccinationStatus,

          ownerType: sOwnerType,
          ownerName: sOwnerType === 'Farm' ? sSelectedFarmName : sOwnerType === 'Company-Owned' ? 'Kaksedthan Livestock Systems Co., Ltd.' : sSelectedOwnerName,
          ownerPhone: sOwnerPhone,
          ownerAddress: sOwnerAddress,
          farmLocation: sSelectedFarmName,

          bloodline: sBloodline,
          geneticLine: sGeneticLine,
          geneticGrade: sGeneticGrade,
          registrationAssociation: sRegistrationAssociation,
          dnaNumber: sDnaNumber,
          pedigreeNotes: sPedigreeNotes,
          damBreed: sDamBreed,
          damName: sDamName,
          sireBreed: sSireBreed,
          sireName: sSireName,

          semenCode: sSemenCode,
          batchNumber: sBatchNumber,
          collectionDate: sCollectionDate,
          expiryDate: sExpiryDate,
          stockQuantity: sProduction === 'Live Bull' ? 0 : sAvailableQuantity,
          unit: sUnit,
          tankStorageId: sTankStorageId,

          purchasePrice: sPurchasePrice,
          purchaseCurrency: sPurchaseCurrency,
          pricePerStraw: sPricePerStraw,
          currency: sCurrency,
          supplier: sSupplier,

          note: sNote,
          imageUrl: sImagePreview || 'https://images.unsplash.com/photo-1546445317-29f4545f9d52?auto=format&fit=crop&w=800&q=80',
          sourcingCompanies: [sSupplier || '0001 - SNR Farm']
        },
        semenModalMode,
        editingSemenId
      );

      setIsSemenModalOpen(false);
    } catch (err: any) {
      setSireFormError(err.message || 'Failed to save Sire Bull record');
    } finally {
      setIsSubmittingSire(false);
    }
  };

  // Handlers for Stock Movement / Sale Transfer Modal
  const openStockMovementModal = (bull?: SemenBull, initialType: 'STOCK_IN' | 'STOCK_OUT' | 'TRANSFER' | 'SALE' = 'STOCK_IN') => {
    const target = bull || semenBulls[0];
    setSelectedStockSire(target);
    setStockMovementType(initialType);
    setSmQuantity(initialType === 'SALE' || initialType === 'TRANSFER' ? 5 : 10);
    setRecipientType('Cow Owner');
    setSmRecipientSupplier(initialType === 'STOCK_IN' ? 'World Wide Sires' : 'Lok Oknha Heng (Customer)');
    setSmPrice(target?.pricePerStraw || 85);
    setSmCurrency(target?.currency || 'USD');
    setSmTankId(target?.tankStorageId || 'Tank 01 - Canister A');
    setSmBatchNumber(`LOT-${new Date().getFullYear()}-${Math.floor(10 + Math.random() * 90)}`);
    setSmNotes(initialType === 'SALE' ? 'Direct Sire Semen Straw Sale to Customer' : initialType === 'TRANSFER' ? 'Semen Straw Stock Transfer to Partner Ranch' : 'Stock Intake Arrival');
    setStockErrorMsg('');
    setIsStockMovementModalOpen(true);
  };

  const handleStockMovementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStockSire) return;

    const availableQty = selectedStockSire.stockQuantity ?? 150;
    if ((stockMovementType === 'SALE' || stockMovementType === 'TRANSFER' || stockMovementType === 'STOCK_OUT') && smQuantity > availableQty) {
      setStockErrorMsg(`❌ Insufficient stock! Requested ${smQuantity} straws, but only ${availableQty} straws available for ${selectedStockSire.name}.`);
      return;
    }

    const newRecord: StockMovementRecord = {
      id: `MOV-${Date.now()}`,
      sireId: selectedStockSire.id,
      sireCode: selectedStockSire.code,
      sireName: selectedStockSire.name,
      type: stockMovementType,
      quantity: smQuantity,
      date: new Date().toISOString().split('T')[0],
      recipientOrSupplier: `${recipientType}: ${smRecipientSupplier}`,
      pricePerUnit: smPrice,
      currency: smCurrency,
      tankStorageId: smTankId,
      notes: `[Batch ${smBatchNumber}] ${smNotes}`
    };

    await onSaveStockMovement(newRecord, selectedStockSire.id);
    setIsStockMovementModalOpen(false);
  };

  // Filtered sire list
  const filteredSemenBulls = semenBulls.filter(bull => {
    const matchesSearch =
      bull.name.toLowerCase().includes(semenSearchQuery.toLowerCase()) ||
      bull.code.toLowerCase().includes(semenSearchQuery.toLowerCase()) ||
      bull.breed.toLowerCase().includes(semenSearchQuery.toLowerCase()) ||
      bull.fromCountry.toLowerCase().includes(semenSearchQuery.toLowerCase());

    const matchesBreed = semenBreedFilter === 'ALL' || bull.breed === semenBreedFilter;
    const matchesCountry = semenCountryFilter === 'ALL' || bull.fromCountry.includes(semenCountryFilter);
    const matchesProduction = semenProductionFilter === 'ALL' || bull.production === semenProductionFilter;

    return matchesSearch && matchesBreed && matchesCountry && matchesProduction;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Top Controls Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', background: 'white', padding: '16px', borderRadius: '16px', border: '1px solid #E5E7EB' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setSemenTabMode('registry')}
            style={{
              padding: '8px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, border: 'none', cursor: 'pointer',
              background: semenTabMode === 'registry' ? '#16a34a' : '#F1F5F9',
              color: semenTabMode === 'registry' ? 'white' : '#475569',
            }}
          >
            🐂 Sire Bull Registry ({semenBulls.length})
          </button>
          <button
            onClick={() => setSemenTabMode('ledger')}
            style={{
              padding: '8px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, border: 'none', cursor: 'pointer',
              background: semenTabMode === 'ledger' ? '#16a34a' : '#F1F5F9',
              color: semenTabMode === 'ledger' ? 'white' : '#475569',
            }}
          >
            📦 Stock In/Out Ledger & Movements ({stockMovements.length})
          </button>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Scenario 1: Dedicated Sell / Transfer Sire Stock Action Button */}
          <button
            onClick={() => openStockMovementModal(semenBulls[0], 'SALE')}
            style={{ background: '#2563EB', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            className="hover:bg-blue-700 transition-colors shadow-xs"
          >
            <ShoppingCart className="h-4 w-4" />
            Sell / Transfer Sire Stock
          </button>

          <button
            onClick={() => openSemenModal()}
            style={{ background: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            className="hover:bg-[#15803d] transition-colors"
          >
            <Plus className="h-4 w-4" />
            Register Sire / Bull
          </button>
        </div>
      </div>

      {semenTabMode === 'registry' ? (
        <>
          {/* Search + Filter bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '220px', maxWidth: '300px' }}>
              <Search className="h-3.5 w-3.5" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
              <input
                type="text"
                placeholder="Search name, code, breed, country..."
                value={semenSearchQuery}
                onChange={e => setSemenSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '8px 12px 8px 32px', fontSize: '13px', border: '1px solid #E5E7EB', borderRadius: '8px', outline: 'none', color: '#111827', boxSizing: 'border-box' }}
              />
            </div>

            <select
              value={semenBreedFilter}
              onChange={e => setSemenBreedFilter(e.target.value)}
              style={{ padding: '8px 12px', fontSize: '12px', fontWeight: 600, border: '1px solid #CBD5E1', borderRadius: '8px', background: 'white', color: '#334155', cursor: 'pointer' }}
            >
              <option value="ALL">All Breeds</option>
              <option value="Angus">Angus</option>
              <option value="Brahman">Brahman</option>
              <option value="Wagyu">Wagyu</option>
              <option value="Charolais">Charolais</option>
              <option value="Hereford">Hereford</option>
              <option value="Limousin">Limousin</option>
              <option value="Simmental">Simmental</option>
            </select>

            <select
              value={semenCountryFilter}
              onChange={e => setSemenCountryFilter(e.target.value)}
              style={{ padding: '8px 12px', fontSize: '12px', fontWeight: 600, border: '1px solid #CBD5E1', borderRadius: '8px', background: 'white', color: '#334155', cursor: 'pointer' }}
            >
              <option value="ALL">All Countries</option>
              <option value="USA">USA 🇺🇸</option>
              <option value="Japan">Japan 🇯🇵</option>
              <option value="Australia">Australia 🇦🇺</option>
              <option value="Brazil">Brazil 🇧🇷</option>
              <option value="France">France 🇫🇷</option>
              <option value="Cambodia">Cambodia 🇰🇭</option>
            </select>

            <select
              value={semenProductionFilter}
              onChange={e => setSemenProductionFilter(e.target.value)}
              style={{ padding: '8px 12px', fontSize: '12px', fontWeight: 600, border: '1px solid #CBD5E1', borderRadius: '8px', background: 'white', color: '#334155', cursor: 'pointer' }}
            >
              <option value="ALL">All Production Types</option>
              <option value="Frozen Semen">🧬 Frozen Semen</option>
              <option value="Embryos">🔬 Embryos</option>
            </select>
          </div>

          {/* Card Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {filteredSemenBulls.map(bull => (
              <div
                key={bull.id}
                onClick={() => onOpenDetailView('semen', bull)}
                style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
                className="hover:shadow-xl hover:-translate-y-1 transition-all duration-200 group"
              >
                {/* ── IMAGE AREA: Fixed 240px height ── */}
                <div style={{ position: 'relative', width: '100%', height: '240px', background: '#0F172A', overflow: 'hidden', borderBottom: '1px solid #E2E8F0', borderRadius: '0' }}>
                  <img
                    src={bull.imageUrl || 'https://images.unsplash.com/photo-1546445317-29f4545f9d52?auto=format&fit=crop&w=800&q=80'}
                    alt=""
                    aria-hidden="true"
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', filter: 'blur(20px)', opacity: 0.5, transform: 'scale(1.15)' }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546445317-29f4545f9d52?auto=format&fit=crop&w=800&q=80';
                    }}
                  />

                  <img
                    src={bull.imageUrl || 'https://images.unsplash.com/photo-1546445317-29f4545f9d52?auto=format&fit=crop&w=800&q=80'}
                    alt={bull.name}
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', zIndex: 1 }}
                    className="group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546445317-29f4545f9d52?auto=format&fit=crop&w=800&q=80';
                    }}
                  />

                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '60px', background: 'linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 100%)', zIndex: 2 }} />

                  <div style={{ position: 'absolute', bottom: '10px', right: '10px', zIndex: 3 }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 9px', borderRadius: '7px', background: 'rgba(15,23,42,0.8)', color: 'white', backdropFilter: 'blur(4px)', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>
                      🌍 {bull.fromCountry}
                    </span>
                  </div>
                </div>

                {/* 2. CARD CONTENT BODY */}
                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', flexWrap: 'wrap' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: 0, lineHeight: 1.3 }}>
                        {bull.name}
                      </h3>
                      <span style={{ fontSize: '13px', color: '#CBD5E1', fontWeight: 600 }}>•</span>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#16a34a', whiteSpace: 'nowrap' }}>
                        {bull.breed}
                      </span>
                    </div>
                    <p style={{ fontSize: '11px', color: '#94A3B8', fontFamily: 'monospace', fontWeight: 600, margin: '4px 0 0' }}>
                      Code: {bull.code || '—'}
                    </p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', background: '#F8FAFC', padding: '10px 12px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                    <div>
                      <p style={{ fontSize: '10px', color: '#64748B', fontWeight: 700, margin: 0, textTransform: 'uppercase' }}>🧪 Available Stock</p>
                      <p style={{ fontSize: '14px', color: '#16a34a', fontWeight: 800, margin: '2px 0 0' }}>
                        {bull.stockQuantity ?? 150} Straws
                      </p>
                    </div>
                    <div>
                      <p style={{ fontSize: '10px', color: '#64748B', fontWeight: 700, margin: 0, textTransform: 'uppercase' }}>🛢️ Storage Tank</p>
                      <p style={{ fontSize: '12px', color: '#0F172A', fontWeight: 700, margin: '2px 0 0' }} className="truncate">
                        {bull.tankStorageId || 'Tank 01'}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: '#475569', borderTop: '1px solid #F1F5F9', paddingTop: '8px' }}>
                    <span>🏢 Sourcing: <strong>{bull.sourcingCompanies?.[0] || '0001 - SNR Farm'}</strong></span>
                    <span>🎨 {bull.color || 'Standard'}</span>
                  </div>
                </div>

                {/* 3. CARD FOOTER ACTIONS */}
                <div style={{ padding: '12px 16px', borderTop: '1px solid #F1F5F9', background: '#FAF5FF', display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); openStockMovementModal(bull, 'SALE'); }}
                    style={{ flex: 1, background: '#2563EB', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 12px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    className="hover:bg-blue-700 transition-colors"
                  >
                    <ShoppingCart className="h-3.5 w-3.5" />
                    Sell / Transfer
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); openSemenModal(bull); }}
                    style={{ background: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 12px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                    className="hover:bg-[#15803d] transition-colors"
                  >
                    <Edit className="h-3.5 w-3.5" />
                    Edit Log
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDeleteSemenBull(bull.id); }}
                    style={{ width: '36px', height: '34px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-red-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        /* STOCK IN/OUT AUDIT LEDGER TABLE */
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              📋 AI Semen & Embryo Stock Transactions Audit Trail
            </h3>
            <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>Total Transactions: {stockMovements.length}</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0', textAlign: 'left', color: '#475569' }}>
                  <th style={{ padding: '10px 12px', fontWeight: 700 }}>Date</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700 }}>Sire Code & Name</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700 }}>Type</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700 }}>Quantity</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700 }}>Supplier / Recipient / Customer</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700 }}>Unit Price</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700 }}>Storage Tank</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700 }}>Notes</th>
                </tr>
              </thead>
              <tbody>
                {stockMovements.map((m, idx) => (
                  <tr key={m.id || idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '12px', color: '#64748B', fontWeight: 600 }}>{m.date}</td>
                    <td style={{ padding: '12px' }}>
                      <p style={{ margin: 0, fontWeight: 800, color: '#0F172A' }}>{m.sireName}</p>
                      <p style={{ margin: '2px 0 0', fontSize: '11px', fontFamily: 'monospace', color: '#16a34a' }}>{m.sireCode}</p>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '4px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 800,
                        background: m.type === 'STOCK_IN' ? '#DCFCE7' : m.type === 'SALE' ? '#E0F2FE' : m.type === 'TRANSFER' ? '#F3E8FF' : '#FEE2E2',
                        color: m.type === 'STOCK_IN' ? '#15803D' : m.type === 'SALE' ? '#0369A1' : m.type === 'TRANSFER' ? '#6B21A8' : '#B91C1C'
                      }}>
                        {m.type === 'STOCK_IN' ? '📥 Stock In' : m.type === 'SALE' ? '💰 Sale' : m.type === 'TRANSFER' ? '🚚 Transfer' : '📤 Stock Out'}
                      </span>
                    </td>
                    <td style={{ padding: '12px', fontWeight: 800, color: m.type === 'STOCK_IN' ? '#15803D' : '#B91C1C' }}>
                      {m.type === 'STOCK_IN' ? `+${m.quantity}` : `-${m.quantity}`} Straws
                    </td>
                    <td style={{ padding: '12px', color: '#334155', fontWeight: 700 }}>{m.recipientOrSupplier}</td>
                    <td style={{ padding: '12px', fontWeight: 700, color: '#0F172A' }}>
                      {m.currency === 'KHR' ? '៛' : '$'} {m.pricePerUnit}
                    </td>
                    <td style={{ padding: '12px', color: '#64748B', fontSize: '12px' }}>{m.tankStorageId}</td>
                    <td style={{ padding: '12px', color: '#64748B', fontSize: '12px' }}>{m.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── SCENARIO 1: Sell / Transfer Sire Stock Modal ─── */}
      {isStockMovementModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div style={{ background: '#FFFFFF', borderRadius: '20px', border: '1px solid #E5E7EB', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', width: '100%', maxWidth: '620px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '14px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShoppingCart className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    Business Scenario 1: Sell or Transfer Sire Stock
                  </h3>
                  <p style={{ fontSize: '11px', color: '#64748B', margin: '2px 0 0' }}>Transfer semen stock to Farm, Cow Owner or External Breeder</p>
                </div>
              </div>
              <button onClick={() => setIsStockMovementModalOpen(false)} style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #E2E8F0', background: 'white', cursor: 'pointer' }}>✕</button>
            </div>

            {stockErrorMsg && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#B91C1C', padding: '10px 14px', borderRadius: '12px', fontSize: '12px', fontWeight: 700, marginBottom: '14px' }}>
                {stockErrorMsg}
              </div>
            )}

            <form onSubmit={handleStockMovementSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Select Sire Stock */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '6px', textTransform: 'uppercase' }}>
                  1. Select Available Sire Stock *
                </label>
                <select
                  value={selectedStockSire?.id || semenBulls[0]?.id}
                  onChange={e => {
                    const bull = semenBulls.find(b => b.id === e.target.value);
                    if (bull) setSelectedStockSire(bull);
                  }}
                  style={{ width: '100%', padding: '10px 12px', fontSize: '13px', fontWeight: 700, border: '1px solid #CBD5E1', borderRadius: '10px', background: 'white', outline: 'none' }}
                >
                  {semenBulls.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.name} — ({b.breed}, Code: {b.code}) [Available: {b.stockQuantity ?? 150} Straws]
                    </option>
                  ))}
                </select>
              </div>

              {/* Transaction Type Toggle */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '6px', textTransform: 'uppercase' }}>
                  2. Select Transaction Category
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px' }}>
                  {[
                    { key: 'SALE', label: '💰 Direct Sale', color: '#2563EB' },
                    { key: 'TRANSFER', label: '🚚 Transfer', color: '#9333EA' },
                    { key: 'STOCK_IN', label: '📥 Stock In', color: '#16a34a' },
                    { key: 'STOCK_OUT', label: '📤 Usage Out', color: '#DC2626' }
                  ].map(t => (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => setStockMovementType(t.key as any)}
                      style={{
                        padding: '10px 6px', borderRadius: '10px', fontSize: '12px', fontWeight: 700, border: '1px solid', cursor: 'pointer', textAlign: 'center',
                        background: stockMovementType === t.key ? t.color : 'white',
                        color: stockMovementType === t.key ? 'white' : '#334155',
                        borderColor: stockMovementType === t.key ? t.color : '#CBD5E1'
                      }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recipient Details */}
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '14px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase' }}>3. Recipient Information</span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {(['Farm', 'Cow Owner', 'External Breeder'] as const).map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setRecipientType(type)}
                        style={{
                          padding: '3px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 700, border: 'none', cursor: 'pointer',
                          background: recipientType === type ? '#2563EB' : '#E2E8F0',
                          color: recipientType === type ? 'white' : '#475569'
                        }}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#64748B', marginBottom: '4px' }}>Recipient Name *</label>
                    <input
                      required
                      type="text"
                      value={smRecipientSupplier}
                      onChange={e => setSmRecipientSupplier(e.target.value)}
                      placeholder="e.g. Lok Oknha Heng or Satellite Ranch"
                      style={{ width: '100%', padding: '8px 12px', fontSize: '12px', border: '1px solid #CBD5E1', borderRadius: '8px', outline: 'none', background: 'white' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#64748B', marginBottom: '4px' }}>Batch / Lot Number</label>
                    <input
                      type="text"
                      value={smBatchNumber}
                      onChange={e => setSmBatchNumber(e.target.value)}
                      placeholder="e.g. LOT-2026-08"
                      style={{ width: '100%', padding: '8px 12px', fontSize: '12px', border: '1px solid #CBD5E1', borderRadius: '8px', outline: 'none', background: 'white' }}
                    />
                  </div>
                </div>
              </div>

              {/* Quantity & Pricing */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748B', marginBottom: '4px' }}>
                    Quantity (Straws) *
                  </label>
                  <input
                    required
                    type="number"
                    min="1"
                    max={selectedStockSire?.stockQuantity ?? 150}
                    value={smQuantity}
                    onChange={e => setSmQuantity(Number(e.target.value))}
                    style={{ width: '100%', padding: '9px 12px', fontSize: '13px', fontWeight: 800, border: '1px solid #CBD5E1', borderRadius: '8px', outline: 'none' }}
                  />
                  <p style={{ fontSize: '10px', color: '#16a34a', margin: '2px 0 0', fontWeight: 600 }}>
                    Max Available: {selectedStockSire?.stockQuantity ?? 150}
                  </p>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748B', marginBottom: '4px' }}>Price / Straw</label>
                  <input
                    type="number"
                    min="0"
                    value={smPrice}
                    onChange={e => setSmPrice(Number(e.target.value))}
                    style={{ width: '100%', padding: '9px 12px', fontSize: '13px', fontWeight: 800, border: '1px solid #CBD5E1', borderRadius: '8px', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748B', marginBottom: '4px' }}>Currency</label>
                  <select
                    value={smCurrency}
                    onChange={e => setSmCurrency(e.target.value as any)}
                    style={{ width: '100%', padding: '9px 10px', fontSize: '12px', fontWeight: 700, border: '1px solid #CBD5E1', borderRadius: '8px', background: 'white' }}
                  >
                    <option value="USD">$ USD</option>
                    <option value="KHR">៛ KHR</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748B', marginBottom: '4px' }}>Storage Tank ID</label>
                <input
                  type="text"
                  value={smTankId}
                  onChange={e => setSmTankId(e.target.value)}
                  placeholder="e.g. Tank 01 - Canister A"
                  style={{ width: '100%', padding: '9px 12px', fontSize: '13px', border: '1px solid #CBD5E1', borderRadius: '8px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748B', marginBottom: '4px' }}>Notes / Remarks</label>
                <textarea
                  rows={2}
                  value={smNotes}
                  onChange={e => setSmNotes(e.target.value)}
                  placeholder="Record transport details, health certifications or payment reference..."
                  style={{ width: '100%', padding: '8px 12px', fontSize: '12px', border: '1px solid #CBD5E1', borderRadius: '8px', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setIsStockMovementModalOpen(false)}
                  style={{ flex: 1, padding: '12px', background: 'white', border: '1px solid #CBD5E1', borderRadius: '10px', fontSize: '13px', fontWeight: 700, color: '#475569', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ flex: 2, padding: '12px', background: '#2563EB', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 800, color: 'white', cursor: 'pointer' }}
                  className="hover:bg-blue-700 shadow-md"
                >
                  Confirm Transfer & Deduct Inventory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── REGISTER / EDIT SIRE BULL WIZARD MODAL (MATCHES REGISTER DAM LAYOUT) ─── */}
      {isSemenModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs overflow-y-auto p-4 py-8">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-5xl overflow-hidden my-auto">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-5 px-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-2xl shadow-inner">
                  🐂
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    {semenModalMode === 'create' ? 'Register New Sire / Bull' : 'Edit Sire Bull Profile'}
                  </h3>
                  <p className="text-xs text-emerald-300/80">Complete Sire registration, ownership context, genetics & inventory specification</p>
                </div>
              </div>
              <button
                onClick={() => setIsSemenModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-sm transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Error banner */}
            {sireFormError && (
              <div className="bg-rose-50 border-b border-rose-200 text-rose-800 text-xs font-bold p-3 px-6 flex items-center gap-2">
                ⚠️ {sireFormError}
              </div>
            )}

            {/* Modal Form Body */}
            <form onSubmit={handleSemenSubmit} className="p-6 space-y-6 max-h-[78vh] overflow-y-auto">

              {/* CARD 1: BASIC INFORMATION */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2.5">
                  <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs">1</span>
                  🐂 Section 1: Basic Identification & Breed
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Sire Name <span className="text-rose-500">*</span></label>
                    <input
                      required
                      type="text"
                      value={sName}
                      onChange={e => setSName(e.target.value)}
                      placeholder="e.g. Mr. HIROSHI"
                      className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Register Code <span className="text-rose-500">*</span></label>
                    <input
                      required
                      type="text"
                      value={sCode}
                      onChange={e => setSCode(e.target.value)}
                      placeholder="e.g. SIRE-2026-901"
                      className="w-full px-3 py-2 text-xs font-mono font-bold border border-slate-300 rounded-xl bg-slate-50 text-emerald-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Ear Tag / ID Number</label>
                    <input
                      type="text"
                      value={sTagId}
                      onChange={e => setSTagId(e.target.value)}
                      placeholder="e.g. TAG-SIRE-901"
                      className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl bg-white text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Registration Number</label>
                    <input
                      type="text"
                      value={sRegistrationNumber}
                      onChange={e => setSRegistrationNumber(e.target.value)}
                      placeholder="e.g. REG-2026-901"
                      className="w-full px-3 py-2 text-xs font-mono font-bold border border-slate-300 rounded-xl bg-white text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Country of Origin <span className="text-rose-500">*</span></label>
                    <select
                      value={sFromCountry}
                      onChange={e => setSFromCountry(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl bg-white text-slate-900 cursor-pointer"
                    >
                      <option value="USA 🇺🇸">USA 🇺🇸</option>
                      <option value="Japan 🇯🇵">Japan 🇯🇵</option>
                      <option value="Australia 🇦🇺">Australia 🇦🇺</option>
                      <option value="Brazil 🇧🇷">Brazil 🇧🇷</option>
                      <option value="France 🇫🇷">France 🇫🇷</option>
                      <option value="Cambodia 🇰🇭">Cambodia 🇰🇭</option>
                      <option value="Germany 🇩🇪">Germany 🇩🇪</option>
                      <option value="Canada 🇨🇦">Canada 🇨🇦</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Breed <span className="text-rose-500">*</span></label>
                    <select
                      value={sBreed}
                      onChange={e => setSBreed(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl bg-white text-slate-900 cursor-pointer"
                    >
                      {SIRE_BREEDS.map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={sDob}
                      onChange={e => setSsDob(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl bg-white text-slate-900"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Production Type <span className="text-rose-500">*</span></label>
                    <select
                      value={sProduction}
                      onChange={e => setSProduction(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl bg-white text-slate-900 cursor-pointer"
                    >
                      <option value="Frozen Semen">🧬 Frozen Semen (Straw Inventory)</option>
                      <option value="Live Bull">🐂 Live Bull (On-Farm Natural Mating)</option>
                      <option value="Fresh Semen">🔬 Fresh Semen</option>
                      <option value="Imported Semen">🌐 Imported Semen (Canister Consignment)</option>
                      <option value="Embryos">🔬 Embryos</option>
                    </select>
                  </div>

                </div>
              </div>

              {/* CARD 2: OWNERSHIP INFORMATION */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2 text-xs font-black text-slate-900 uppercase tracking-wider">
                    <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs">2</span>
                    🏢 Section 2: Ownership & Farm Location
                  </div>
                  
                  {/* Owner Type Selector */}
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                    {(['Farm', 'Cow Owner', 'Company-Owned'] as const).map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setSOwnerType(type)}
                        className={`px-3 py-1 text-xs font-extrabold rounded-lg transition-all ${
                          sOwnerType === type
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {type === 'Farm' ? '🏠 Farm' : type === 'Cow Owner' ? '👤 Cow Owner' : '🏢 Company'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sOwnerType === 'Farm' && (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Select Farm Facility *</label>
                        <select
                          value={sSelectedFarmName}
                          onChange={e => setSSelectedFarmName(e.target.value)}
                          className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl bg-white text-slate-900 cursor-pointer"
                        >
                          {MASTER_FARMS.map(f => (
                            <option key={f.code} value={f.name}>{f.name} ({f.location})</option>
                          ))}
                        </select>
                      </div>

                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1">
                        <p><span className="text-slate-500 font-medium">Farm Contact:</span> <strong className="text-slate-800">+855 12 345 678</strong></p>
                        <p><span className="text-slate-500 font-medium">Facility Region:</span> <strong className="text-emerald-700">Kampong Cham Breeding Station</strong></p>
                      </div>
                    </>
                  )}

                  {sOwnerType === 'Cow Owner' && (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Select Owner *</label>
                        <select
                          value={sSelectedOwnerName}
                          onChange={e => setSSelectedOwnerName(e.target.value)}
                          className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl bg-white text-slate-900 cursor-pointer"
                        >
                          {MASTER_COW_OWNERS.map(o => (
                            <option key={o.name} value={o.name}>{o.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Owner Contact Phone</label>
                        <input
                          type="text"
                          value={sOwnerPhone}
                          onChange={e => setSOwnerPhone(e.target.value)}
                          className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl bg-white text-slate-900"
                        />
                      </div>
                    </>
                  )}

                  {sOwnerType === 'Company-Owned' && (
                    <div className="md:col-span-2 bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-lg">
                        🏢
                      </div>
                      <div>
                        <p className="text-xs font-black text-emerald-900 uppercase">Kaksedthan Livestock Systems Co., Ltd.</p>
                        <p className="text-[11px] text-emerald-700 font-medium">Registered under Corporate Main Genetic Reserve • Station #0001</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* CARD 3: GENETICS & PEDIGREE */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2.5">
                  <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs">3</span>
                  🧬 Section 3: Genetics & Pedigree Lineage
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Bloodline Purity</label>
                    <input
                      type="text"
                      value={sBloodline}
                      onChange={e => setSBloodline(e.target.value)}
                      placeholder="e.g. 100% Fullblood"
                      className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl bg-white text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Genetic Lineage</label>
                    <input
                      type="text"
                      value={sGeneticLine}
                      onChange={e => setSGeneticLine(e.target.value)}
                      placeholder="e.g. Kobe Lineage A-5"
                      className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl bg-white text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Genetic Grade</label>
                    <select
                      value={sGeneticGrade}
                      onChange={e => setSGeneticGrade(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl bg-white text-slate-900 cursor-pointer"
                    >
                      <option value="Grade AA">Grade AA (Elite Master Sire)</option>
                      <option value="Grade A">Grade A (Premium Sire)</option>
                      <option value="Grade B">Grade B (Standard Sire)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Father (Sire Bull Name)</label>
                    <input
                      type="text"
                      value={sSireName}
                      onChange={e => setSSireName(e.target.value)}
                      placeholder="e.g. Grand Champion #01"
                      className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl bg-white text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Mother (Dam Cow Name)</label>
                    <input
                      type="text"
                      value={sDamName}
                      onChange={e => setSDamName(e.target.value)}
                      placeholder="e.g. Queen Angus #44"
                      className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl bg-white text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">DNA Profile / Cert Number</label>
                    <input
                      type="text"
                      value={sDnaNumber}
                      onChange={e => setSDnaNumber(e.target.value)}
                      placeholder="e.g. DNA-987654"
                      className="w-full px-3 py-2 text-xs font-mono font-bold border border-slate-300 rounded-xl bg-white text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* CARD 4: PHYSICAL & HEALTH INFORMATION */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2.5">
                  <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs">4</span>
                  ⚕️ Section 4: Physical Traits & Health Status
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Weight (kg)</label>
                    <input
                      type="number"
                      value={sWeight}
                      onChange={e => setSWeight(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl bg-white text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Height (cm)</label>
                    <input
                      type="number"
                      value={sHeight}
                      onChange={e => setSHeight(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl bg-white text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Horn Status</label>
                    <select
                      value={sHornStatus}
                      onChange={e => setSHornStatus(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl bg-white text-slate-900 cursor-pointer"
                    >
                      <option value="Polled">Polled (Naturally Hornless)</option>
                      <option value="Horned">Horned</option>
                      <option value="Dehorned">Dehorned</option>
                    </select>
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Health & Reproductive Status</label>
                    <select
                      value={sHealthStatus}
                      onChange={e => setSHealthStatus(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl bg-white text-slate-900 cursor-pointer"
                    >
                      <option value="Healthy & Prime Breeding Condition 🟢">🟢 Healthy & Prime Breeding Condition</option>
                      <option value="Under Observation 🟡">🟡 Under Observation</option>
                      <option value="Quarantined 🔴">🔴 Quarantined</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* CARD 5: INVENTORY & STORAGE (HIDDEN IF LIVE BULL) */}
              {sProduction !== 'Live Bull' && (
                <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-5 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 text-xs font-black text-emerald-900 uppercase tracking-wider border-b border-emerald-200/80 pb-2.5">
                    <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs">5</span>
                    🧪 Section 5: Semen Inventory & Canister Storage
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Batch / Lot Number</label>
                      <input
                        type="text"
                        value={sBatchNumber}
                        onChange={e => setSBatchNumber(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-mono font-bold border border-slate-300 rounded-xl bg-white text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Available Quantity <span className="text-rose-500">*</span></label>
                      <input
                        required
                        type="number"
                        min="0"
                        value={sAvailableQuantity}
                        onChange={e => setSAvailableQuantity(Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs font-black text-emerald-700 border border-slate-300 rounded-xl bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Storage Canister / Tank ID</label>
                      <select
                        value={sTankStorageId}
                        onChange={e => setSTankStorageId(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl bg-white text-slate-900 cursor-pointer"
                      >
                        <option value="Tank 01 - Canister A">Tank 01 - Canister A</option>
                        <option value="Tank 02 - Canister B">Tank 02 - Canister B</option>
                        <option value="Tank 03 - Canister C">Tank 03 - Canister C</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* CARD 6: PRICING & FINANCIAL BREAKDOWN */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2.5">
                  <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs">6</span>
                  💵 Section 6: Sourcing & Financial Breakdown
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Price per Straw / Unit <span className="text-rose-500">*</span></label>
                    <div className="flex gap-2">
                      <input
                        required
                        type="number"
                        min="0"
                        value={sPricePerStraw}
                        onChange={e => setSPricePerStraw(Number(e.target.value))}
                        className="flex-1 px-3 py-2 text-xs font-extrabold border border-slate-300 rounded-xl bg-white text-slate-900"
                      />
                      <select
                        value={sCurrency}
                        onChange={e => setSCurrency(e.target.value as any)}
                        className="px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl bg-slate-100 text-slate-900 cursor-pointer"
                      >
                        <option value="USD">$ USD</option>
                        <option value="KHR">៛ KHR</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Sourcing Company / Supplier</label>
                    <select
                      value={sSupplier}
                      onChange={e => setSSupplier(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl bg-white text-slate-900 cursor-pointer"
                    >
                      {SOURCING_COMPANIES.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* CARD 7: MEDIA & ATTACHMENTS */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2.5">
                  <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs">7</span>
                  🖼️ Section 7: Sire Photo & Attachments
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Image Upload / URL</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) {
                            onImageFileSelect(file, (url) => setSImagePreview(url));
                          }
                        }}
                        className="text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                      />
                    </div>
                    <input
                      type="text"
                      value={sImagePreview}
                      onChange={e => setSImagePreview(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full mt-2 px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white text-slate-900"
                    />
                  </div>

                  {sImagePreview && (
                    <div className="relative w-32 h-24 rounded-2xl overflow-hidden border-2 border-emerald-500 shadow-md">
                      <img src={sImagePreview} alt="Sire Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setSImagePreview('')}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-rose-600 text-white text-xs font-bold flex items-center justify-center shadow-md"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* CARD 8: NOTES & OBSERVATIONS */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2.5">
                  <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs">8</span>
                  📝 Section 8: Notes & Breeding Guidelines
                </div>

                <textarea
                  rows={3}
                  value={sNote}
                  onChange={e => setSNote(e.target.value)}
                  placeholder="Record genetic line details, health history, or special breeding guidelines..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white text-slate-900"
                />
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsSemenModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingSire}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingSire ? (
                    <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    '🐂 Register Sire Bull Record'
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
