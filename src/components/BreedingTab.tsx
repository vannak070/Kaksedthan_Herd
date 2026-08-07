import React, { useState, useEffect, useMemo } from 'react';
import { Heart, Plus, Search, Filter, Baby, Award, Package, DollarSign } from 'lucide-react';
import { StockItem } from '@/types/stock.types';
import { BreedingRecord, PregnancyStatus } from '@/types/breeding.types';
import { breedingApi } from '@/lib/api/breeding.api';
import { settingsApi } from '@/lib/api/settings.api';

import {
  StockMovementRecord,
  SemenBull,
  DamRecord,
  FullCalfRecord,
  DEFAULT_SEMEN_BULLS
} from './breeding/types';
import InteractiveCropperModal from './breeding/InteractiveCropperModal';
import AnimalProfileDetailPage from './breeding/AnimalProfileDetailPage';
import SemenStockSubTab from './breeding/SemenStockSubTab';
import BreedingLogsSubTab from './breeding/BreedingLogsSubTab';
import DamHerdSubTab from './breeding/DamHerdSubTab';
import CalvesHerdSubTab from './breeding/CalvesHerdSubTab';
import PedigreeCertificateSubTab from './breeding/PedigreeCertificateSubTab';
import FinancialsSubTab from './breeding/FinancialsSubTab';
import GestationCalendarSubTab from './breeding/GestationCalendarSubTab';

export type BreedingSubTab = 
  | 'semen' 
  | 'dams' 
  | 'calves' 
  | 'certificate' 
  | 'logs' 
  | 'calendar' 
  | 'financials' 
  | 'analytics';

interface BreedingTabProps {
  stock: StockItem[];
  onRefreshData?: () => void;
  farmLocationFilter?: string;
  expenses?: any[];
  onAddCow?: (cowData: any) => Promise<void>;
  initialSubTab?: BreedingSubTab;
}

export default function BreedingTab({
  stock,
  onRefreshData,
  farmLocationFilter = 'ALL',
  expenses = [],
  onAddCow,
  initialSubTab = 'semen'
}: BreedingTabProps) {
  // Navigation & SubTab state
  const [subTab, setSubTab] = useState<BreedingSubTab>(initialSubTab);

  useEffect(() => {
    if (initialSubTab) {
      setSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  // General Listing View mode & search filters
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Detail Modal Item state
  const [detailModalItem, setDetailModalItem] = useState<{ type: 'semen' | 'dam' | 'calf' | 'breeding'; data: any } | null>(null);

  // Selected Calf ID for Pedigree Certificate viewer
  const [selectedCertificateCalfId, setSelectedCertificateCalfId] = useState<string>('CALF-2025-0004');

  // Interactive Cropper Modal state
  const [cropperState, setCropperState] = useState<{
    isOpen: boolean;
    imageSrc: string;
    onCropComplete: (croppedDataUrl: string) => void;
  } | null>(null);

  // Domain data collections
  const [breedingRecords, setBreedingRecords] = useState<BreedingRecord[]>([]);
  const [semenBulls, setSemenBulls] = useState<SemenBull[]>(DEFAULT_SEMEN_BULLS);
  const [stockMovements, setStockMovements] = useState<StockMovementRecord[]>([]);
  const [damRecords, setDamRecords] = useState<DamRecord[]>([]);
  const [calfRecords, setCalfRecords] = useState<FullCalfRecord[]>([]);

  // Filter female stock for dam selection
  const femaleStock = useMemo(() => {
    return stock.filter(s => {
      const isFemale = s.sex === 'Female' || (s as any).gender === 'Female';
      const ageM = (s as any).ageMonths;
      const isNotCalf = !s.purpose?.toLowerCase().includes('calf') && ageM !== undefined ? ageM >= 6 : true;
      const loc = (s as any).farmLocation || s.location;
      const isAllLocations = !farmLocationFilter || farmLocationFilter.toUpperCase() === 'ALL';
      const matchesLocation = isAllLocations || !loc || loc === farmLocationFilter;
      return isFemale && isNotCalf && matchesLocation;
    });
  }, [stock, farmLocationFilter]);

  // Load Breeding Records from PostgreSQL API
  const loadRecords = async () => {
    try {
      const data = await breedingApi.getAll();
      if (Array.isArray(data)) {
        setBreedingRecords(data);
      }
    } catch (err) {
      console.warn('Notice: Custom breeding records loading from PostgreSQL database:', err);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  // Load Persisted Sires, Stock Movements, Dams, and Calves from PostgreSQL Database
  useEffect(() => {
    const loadPersistedEntities = async () => {
      try {
        const [savedSires, savedMovements, savedDams, savedCalves] = await Promise.all([
          settingsApi.getByKey<SemenBull[]>('semen_bulls').catch(() => null),
          settingsApi.getByKey<StockMovementRecord[]>('semen_stock_movements').catch(() => null),
          settingsApi.getByKey<DamRecord[]>('dam_records').catch(() => null),
          settingsApi.getByKey<FullCalfRecord[]>('calf_records').catch(() => null)
        ]);

        if (Array.isArray(savedSires) && savedSires.length > 0) {
          setSemenBulls(savedSires);
        }
        if (Array.isArray(savedMovements) && savedMovements.length > 0) {
          setStockMovements(savedMovements);
        }
        if (Array.isArray(savedDams) && savedDams.length > 0) {
          setDamRecords(savedDams);
        }
        if (Array.isArray(savedCalves) && savedCalves.length > 0) {
          setCalfRecords(savedCalves);
        }
      } catch (err) {
        console.warn('Notice: Custom breeding entities loading:', err);
      }
    };

    loadPersistedEntities();
  }, []);

  // Open & Close Detail View Modal
  const openDetailView = (type: 'semen' | 'dam' | 'calf' | 'breeding', data: any) => {
    setDetailModalItem({ type, data });
  };

  const closeDetailView = () => {
    setDetailModalItem(null);
  };

  // Image Cropper Callback helper
  const handleImageFileSelect = (file: File, callback: (url: string) => void) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setCropperState({
          isOpen: true,
          imageSrc: reader.result,
          onCropComplete: callback
        });
      }
    };
    reader.readAsDataURL(file);
  };

  // Sire Bull Handlers
  const handleSaveSemenBull = async (bullData: Partial<SemenBull>, mode: 'create' | 'edit', editingId?: string | null) => {
    let updated: SemenBull[];
    if (mode === 'create') {
      const newBull: SemenBull = {
        id: `SEM-${Date.now()}`,
        name: bullData.name || 'New Sire Bull',
        fromCountry: bullData.fromCountry || 'USA 🇺🇸',
        code: bullData.code || `SIRE-${Date.now()}`,
        dob: bullData.dob || '',
        breed: bullData.breed || 'Angus',
        production: bullData.production || 'Frozen Semen',
        color: bullData.color || '',
        weight: bullData.weight || '',
        height: bullData.height || '',
        damBreed: bullData.damBreed || '',
        damName: bullData.damName || '',
        sireBreed: bullData.sireBreed || '',
        sireName: bullData.sireName || '',
        sourcingCompanies: bullData.sourcingCompanies || ['0001 - SNR Farm'],
        note: bullData.note || '',
        imageUrl: bullData.imageUrl || 'https://images.unsplash.com/photo-1546445317-29f4545f9d52?auto=format&fit=crop&w=800&q=80',
        stockQuantity: 150,
        pricePerStraw: 85,
        currency: 'USD',
        tankStorageId: 'Tank 01 - Canister A'
      };
      updated = [newBull, ...semenBulls];
    } else {
      updated = semenBulls.map(b => b.id === editingId ? { ...b, ...bullData } as SemenBull : b);
    }
    setSemenBulls(updated);
    await settingsApi.setByKey('semen_bulls', updated);
  };

  const handleDeleteSemenBull = async (id: string) => {
    const updated = semenBulls.filter(b => b.id !== id);
    setSemenBulls(updated);
    await settingsApi.setByKey('semen_bulls', updated);
  };

  const handleSaveStockMovement = async (movement: StockMovementRecord, targetSireId: string) => {
    const updatedMovements = [movement, ...stockMovements];
    setStockMovements(updatedMovements);

    // Update Sire available straw stock count
    const updatedBulls = semenBulls.map(b => {
      if (b.id === targetSireId) {
        const currentQty = b.stockQuantity ?? 150;
        const newQty = movement.type === 'STOCK_IN'
          ? currentQty + movement.quantity
          : Math.max(0, currentQty - movement.quantity);
        return { ...b, stockQuantity: newQty };
      }
      return b;
    });
    setSemenBulls(updatedBulls);

    await Promise.all([
      settingsApi.setByKey('semen_stock_movements', updatedMovements),
      settingsApi.setByKey('semen_bulls', updatedBulls)
    ]);
  };

  // Dam Handlers
  const handleSaveDam = async (damData: Partial<DamRecord>, mode: 'create' | 'edit', editingId?: string | null) => {
    let updated: DamRecord[];
    if (mode === 'create') {
      const newDam: DamRecord = {
        id: `DAM-${Date.now()}`,
        cowOwner: damData.cowOwner || '0001 - SNR Farm',
        tagId: damData.tagId || `TAG-${Math.floor(1000 + Math.random() * 9000)}`,
        name: damData.name || 'New Dam Cow',
        breed: damData.breed || 'Angus',
        generation: damData.generation || 'F1',
        dob: damData.dob || '',
        parity: damData.parity || 1,
        weight: damData.weight || '',
        height: damData.height || '',
        color: damData.color || '',
        damBreed: damData.damBreed || '',
        damName: damData.damName || '',
        sireBreed: damData.sireBreed || '',
        sireName: damData.sireName || '',
        note: damData.note || '',
        imageUrl: damData.imageUrl || 'https://images.unsplash.com/photo-1546445317-29f4545f9d52?auto=format&fit=crop&w=400&q=80',
        sex: 'Female'
      };
      updated = [newDam, ...damRecords];
    } else {
      updated = damRecords.map(d => d.id === editingId ? { ...d, ...damData } as DamRecord : d);
    }
    setDamRecords(updated);
    await settingsApi.setByKey('dam_records', updated);
  };

  const handleDeleteDam = async (id: string) => {
    const updated = damRecords.filter(d => d.id !== id);
    setDamRecords(updated);
    await settingsApi.setByKey('dam_records', updated);
  };

  // Unified Atomic Calf Save Handler (Synchronizes Calf + Breeding Program + Dam + PostgreSQL)
  const handleSaveCalf = async (calf: FullCalfRecord) => {
    // 1. Update Calf Records list
    const exists = calfRecords.some(c => c.id === calf.id || c.code === calf.code || c.tagId === calf.tagId);
    const updatedCalfRecords = exists
      ? calfRecords.map(c => (c.id === calf.id || c.code === calf.code || c.tagId === calf.tagId) ? calf : c)
      : [calf, ...calfRecords];

    setCalfRecords(updatedCalfRecords);
    setSelectedCertificateCalfId(calf.id);

    // 2. Update linked Breeding Record to 'Calved' and set actualCalvingDate & calfId
    let updatedBreedingRecords = [...breedingRecords];
    if (calf.breedingRecordId) {
      const targetBreedingId = calf.breedingRecordId;
      updatedBreedingRecords = breedingRecords.map(r => {
        if (r.id === targetBreedingId) {
          return {
            ...r,
            pregnancyStatus: 'Calved' as PregnancyStatus,
            actualCalvingDate: calf.dob || new Date().toISOString().split('T')[0],
            calfId: calf.tagId || calf.code || calf.id,
            notes: `${r.notes || ''}\n[Calf Registered ${calf.dob}]: ${calf.calfName} (${calf.tagId}) registered successfully.`.trim()
          };
        }
        return r;
      });
      setBreedingRecords(updatedBreedingRecords);

      // Call PostgreSQL breeding API update
      try {
        await breedingApi.update(targetBreedingId, {
          pregnancyStatus: 'Calved',
          actualCalvingDate: calf.dob || new Date().toISOString().split('T')[0],
          calfId: calf.tagId || calf.code || calf.id
        });
      } catch (err) {
        console.error('Failed to update PostgreSQL breeding record status:', err);
      }
    }

    // 3. Update linked Dam in Dam Listing to 'Nursing', pregnancyStatus: 'Open', parity +1
    let updatedDamRecords = [...damRecords];
    if (calf.damId) {
      const targetDamId = calf.damId;
      updatedDamRecords = damRecords.map(d => {
        if (d.id === targetDamId || d.tagId === targetDamId) {
          return {
            ...d,
            pregnancyStatus: 'Open',
            status: 'Nursing',
            lastCalvingDate: calf.dob || new Date().toISOString().split('T')[0],
            parity: (d.parity || 0) + 1
          };
        }
        return d;
      });
      setDamRecords(updatedDamRecords);
    }

    // 4. Persist all updated domains to PostgreSQL master_settings atomically
    await Promise.all([
      settingsApi.setByKey('calf_records', updatedCalfRecords),
      settingsApi.setByKey('dam_records', updatedDamRecords),
      settingsApi.setByKey('breeding_records', updatedBreedingRecords)
    ]);

    await loadRecords();
    if (onRefreshData) onRefreshData();
  };

  const handleDeleteCalf = async (id: string) => {
    const updated = calfRecords.filter(c => c.id !== id);
    setCalfRecords(updated);
    await settingsApi.setByKey('calf_records', updated);
  };

  // Breeding Record Handlers
  const handleSaveBreedingRecord = async (payload: Partial<BreedingRecord>, mode: 'create' | 'edit', recordId?: string | null) => {
    if (mode === 'create') {
      await breedingApi.create(payload);

      // Automatically deduct 1 straw of semen from Sire Stock inventory & log movement
      if (payload.sireId) {
        const targetSire = semenBulls.find(b => b.id === payload.sireId || b.code === payload.sireId);
        if (targetSire) {
          const currentQty = targetSire.stockQuantity ?? 150;
          const updatedQty = Math.max(0, currentQty - 1);

          const newMovement: StockMovementRecord = {
            id: `MOV-OUT-${Date.now()}`,
            sireId: targetSire.id,
            sireCode: targetSire.code,
            sireName: targetSire.name,
            type: 'STOCK_OUT',
            quantity: 1,
            date: payload.matingDate || new Date().toISOString().split('T')[0],
            recipientOrSupplier: payload.cowOwner || 'Customer Breeding Service',
            pricePerUnit: payload.price || payload.breedingInseminationCost || 85,
            currency: payload.currency || 'USD',
            tankStorageId: targetSire.tankStorageId || 'Tank 01',
            notes: `Breeding Service performed for Dam ${payload.damName || payload.damId} (${payload.serviceType || 'AI'})`
          };

          const updatedBulls = semenBulls.map(b => b.id === targetSire.id ? { ...b, stockQuantity: updatedQty } : b);
          const updatedMovements = [newMovement, ...stockMovements];

          setSemenBulls(updatedBulls);
          setStockMovements(updatedMovements);

          await Promise.all([
            settingsApi.setByKey('semen_bulls', updatedBulls),
            settingsApi.setByKey('semen_stock_movements', updatedMovements)
          ]);
        }
      }
    } else if (recordId) {
      await breedingApi.update(recordId, payload);
    }
    await loadRecords();
    if (onRefreshData) onRefreshData();
  };

  const handleDeleteBreedingRecord = async (id: string) => {
    if (!window.confirm(`Are you sure you want to delete breeding record #${id}?`)) return;
    await breedingApi.delete(id);
    await loadRecords();
    if (onRefreshData) onRefreshData();
  };

  const handleConfirmStatus = async (id: string, newStatus: PregnancyStatus) => {
    setBreedingRecords(prev => prev.map(r => r.id === id ? { ...r, pregnancyStatus: newStatus } : r));
    await breedingApi.update(id, { pregnancyStatus: newStatus });
    await loadRecords();
    if (onRefreshData) onRefreshData();
  };

  // Calving Event Handler (Supports Twins, Triplets, Gestation Log Registration)
  const handleRegisterCalving = async (calvingData: {
    breedingRecord: BreedingRecord;
    birthInfo: {
      birthDate: string;
      birthTime: string;
      birthLocation: string;
      birthType: string;
      birthOutcome: string;
      deliveryMethod: string;
      assistedDelivery: boolean;
      technician: string;
      notes: string;
    };
    calves: Array<{
      id: string;
      name: string;
      tagId: string;
      sex: 'Male' | 'Female';
      weight: number;
      height?: number;
      coatColor: string;
      healthStatus: string;
      imageUrl?: string;
    }>;
  }) => {
    const { breedingRecord, birthInfo, calves } = calvingData;

    const year = new Date().getFullYear();
    const newCalfEntries: FullCalfRecord[] = calves.map((c, idx) => {
      const certNum = String(Math.floor(10000000 + Math.random() * 89999999));
      return {
        id: c.id || `CALF-${Date.now()}-${idx}`,
        certNo: `BC-${year}-${certNum}`,
        calfName: c.name || `Calf of ${breedingRecord.damName || breedingRecord.damId}`,
        breedingRecordId: breedingRecord.id,
        code: c.id || c.tagId,
        tagId: c.tagId || c.id,
        generation: 'F1 (First Cross)',
        placeOfBirth: birthInfo.birthLocation || breedingRecord.farmLocation || 'Kandal / Ang Snoul',
        birthFacility: 'Maternity Barn A',
        birthStatusCed: birthInfo.deliveryMethod || 'Nature / Unassisted (Easy)',
        dob: birthInfo.birthDate || new Date().toISOString().split('T')[0],
        time: birthInfo.birthTime || '08:30 AM',
        sex: c.sex,
        color: c.coatColor || 'Red & White',
        breed: breedingRecord.targetBreed || breedingRecord.damBreed || 'Wagyu',
        birthWeight: String(c.weight || 26.5),
        height: String(c.height || 68),
        bodyLength: '72',
        chestSize: '64',
        legSize: '38',
        gestationPeriod: '283',
        numberOfCalf: calves.length > 1 ? `Multiple (${calves.length})` : 'Single (1)',
        birthTemperature: '38.5',
        navelTreatment: true,
        virusTest: true,
        timingOfFeeding: 'Immediate (<1h)',
        methodOfFeeding: ['Natural Nursing'],
        imageUrl: c.imageUrl || 'https://images.unsplash.com/photo-1546445317-29f4545f9d52?auto=format&fit=crop&w=600&q=80',
        sireId: breedingRecord.sireId || '',
        sireName: breedingRecord.bullName || breedingRecord.sireName || 'Sire Bull',
        sireBreed: breedingRecord.targetBreed || 'Wagyu',
        damId: breedingRecord.damId,
        damName: breedingRecord.damName || breedingRecord.damId,
        damBreed: breedingRecord.damBreed || 'Angus',
        farmName: birthInfo.birthLocation || breedingRecord.farmLocation || '0001 - SNR Farm Facility',
        provinceDistrict: 'Kandal / Ang Snoul',
        villageCommune: 'Prek Anchanh',
        gpsCoordinates: '11.4707 N, 104.9390 E',
        dateOfRegistration: new Date().toLocaleDateString('en-GB'),
        recordedBy: birthInfo.technician || 'CCEC Kaksedthan',
        systemVersion: 'Kaksedthan v2.0',
        verifiedBy: 'Super Admin (CCEC)',
        verificationDate: new Date().toLocaleDateString('en-GB'),
        currentStatus: c.healthStatus || 'Healthy & Vigorous 🟢',
        notes: birthInfo.notes || 'Calved with standard monitoring.'
      };
    });

    const updatedCalfRecords = [...newCalfEntries, ...calfRecords];
    setCalfRecords(updatedCalfRecords);
    if (newCalfEntries.length > 0) {
      setSelectedCertificateCalfId(newCalfEntries[0].id);
    }

    // Update Dam Records
    const updatedDamRecords = damRecords.map(d => {
      if (d.id === breedingRecord.damId || d.tagId === breedingRecord.damId) {
        return {
          ...d,
          pregnancyStatus: 'Open',
          status: 'Nursing',
          lastCalvingDate: birthInfo.birthDate,
          parity: (d.parity || 0) + 1
        };
      }
      return d;
    });
    setDamRecords(updatedDamRecords);

    // Update Breeding Records
    const primaryCalfTag = calves[0]?.tagId || calves[0]?.id;
    const updatedBreedingRecords = breedingRecords.map(r => {
      if (r.id === breedingRecord.id) {
        return {
          ...r,
          pregnancyStatus: 'Calved' as PregnancyStatus,
          actualCalvingDate: birthInfo.birthDate,
          calfId: primaryCalfTag
        };
      }
      return r;
    });
    setBreedingRecords(updatedBreedingRecords);

    // Update PostgreSQL DB
    try {
      await breedingApi.update(breedingRecord.id, {
        pregnancyStatus: 'Calved' as PregnancyStatus,
        actualCalvingDate: birthInfo.birthDate,
        calfId: primaryCalfTag,
        notes: `${breedingRecord.notes || ''}\n[Calving Registered ${birthInfo.birthDate}]: ${calves.length} calf (${calves.map(c => c.name).join(', ')}) born via ${birthInfo.deliveryMethod}.`.trim()
      });
    } catch (err) {
      console.error('PostgreSQL breeding update error:', err);
    }

    // Save all to master_settings
    await Promise.all([
      settingsApi.setByKey('calf_records', updatedCalfRecords),
      settingsApi.setByKey('dam_records', updatedDamRecords),
      settingsApi.setByKey('breeding_records', updatedBreedingRecords)
    ]);

    await loadRecords();
    if (onRefreshData) onRefreshData();
  };

  const selectedCalf = useMemo(() => {
    return calfRecords.find(c => c.id === selectedCertificateCalfId || c.code === selectedCertificateCalfId) || calfRecords[0];
  }, [selectedCertificateCalfId, calfRecords]);

  return (
    <div className="space-y-6">
      {/* Render Active SubTab Component */}
      {subTab === 'semen' && (
        <SemenStockSubTab
          semenBulls={semenBulls}
          stockMovements={stockMovements}
          onOpenDetailView={openDetailView}
          onSaveSemenBull={handleSaveSemenBull}
          onDeleteSemenBull={handleDeleteSemenBull}
          onSaveStockMovement={handleSaveStockMovement}
          onImageFileSelect={handleImageFileSelect}
        />
      )}

      {subTab === 'logs' && (
        <BreedingLogsSubTab
          breedingRecords={breedingRecords}
          semenBulls={semenBulls}
          femaleStock={femaleStock}
          calfRecords={calfRecords}
          viewMode={viewMode}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          onOpenDetailView={openDetailView}
          onSaveBreedingRecord={handleSaveBreedingRecord}
          onDeleteBreedingRecord={handleDeleteBreedingRecord}
          onConfirmStatus={handleConfirmStatus}
          onOpenCalfModal={() => setSubTab('calves')}
          onRegisterCalving={handleRegisterCalving}
          onImageFileSelect={handleImageFileSelect}
        />
      )}

      {subTab === 'dams' && (
        <DamHerdSubTab
          damRecords={damRecords}
          onOpenDetailView={openDetailView}
          onSaveDam={handleSaveDam}
          onDeleteDam={handleDeleteDam}
          onOpenCalfModal={() => setSubTab('calves')}
          onImageFileSelect={handleImageFileSelect}
        />
      )}

      {(subTab === 'calves' || subTab === 'certificate') && (
        <CalvesHerdSubTab
          calfRecords={calfRecords}
          semenBulls={semenBulls}
          damRecords={damRecords}
          breedingRecords={breedingRecords}
          onOpenDetailView={openDetailView}
          onSaveCalf={handleSaveCalf}
          onDeleteCalf={handleDeleteCalf}
          onViewCertificate={(id) => {
            setSelectedCertificateCalfId(id);
            setSubTab('certificate');
          }}
          onImageFileSelect={handleImageFileSelect}
          initialSubView={subTab === 'certificate' ? 'certificates' : 'listing'}
        />
      )}

      {subTab === 'financials' && (
        <FinancialsSubTab
          breedingRecords={breedingRecords}
          expenses={expenses}
        />
      )}

      {subTab === 'calendar' && (
        <GestationCalendarSubTab
          breedingRecords={breedingRecords}
          onOpenDetailView={openDetailView}
          onOpenCalvingModal={(record) => {
            setSubTab('logs');
          }}
        />
      )}

      {/* Standalone Interactive Image Cropper Modal */}
      {cropperState && cropperState.isOpen && (
        <InteractiveCropperModal
          imageSrc={cropperState.imageSrc}
          onClose={() => setCropperState(null)}
          onConfirm={(croppedUrl) => {
            cropperState.onCropComplete(croppedUrl);
            setCropperState(null);
          }}
        />
      )}

      {/* Animal Profile & Pedigree Detail Page Modal */}
      {detailModalItem !== null && (
        <AnimalProfileDetailPage
          key={`${detailModalItem.type}-${detailModalItem.data?.id || detailModalItem.data?.code || detailModalItem.data?.tagId || 'unknown'}`}
          item={detailModalItem}
          stockList={stock}
          semenList={semenBulls}
          onBack={closeDetailView}
          onViewCertificate={(calfId) => {
            setSelectedCertificateCalfId(calfId);
            closeDetailView();
            setSubTab('certificate');
          }}
        />
      )}
    </div>
  );
}
