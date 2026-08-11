'use client';

import React, { useState, useMemo } from 'react';
import { SireItem, DamItem, StockInseminationItem, BreedingProgramItem } from '@/types/breeding.types';
import StandardAnimalImage from '@/components/common/StandardAnimalImage';
import { 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  Heart, 
  Sparkles, 
  User, 
  Building2, 
  Dna, 
  DollarSign, 
  Calendar, 
  ShieldCheck, 
  AlertCircle,
  Activity,
  Award,
  Beef,
  UserCheck,
  FileText,
  Info,
  CheckCircle2,
  Search,
  RefreshCw,
  Edit3,
  Calculator,
  Lock
} from 'lucide-react';

import { fetchCustomersAction, fetchBreedersAction } from '@/app/actions';

interface GuidedBreedingWizardProps {
  sires: SireItem[];
  dams: DamItem[];
  semenStock?: StockInseminationItem[];
  farms?: string[];
  /** The active role from localStorage (e.g. 'Breeder', 'Super Admin') */
  currentUserRole?: string;
  /** For Breeder accounts: the resolved Breeder profile from the backend */
  lockedBreeder?: { id: string; name: string } | null;
  onCancel: () => void;
  onSubmit: (program: BreedingProgramItem) => Promise<void>;
}

export default function GuidedBreedingWizard({
  sires,
  dams,
  semenStock = [],
  farms = ['រទាំង', 'ព្រៃវែង', 'បន្ទាយមានជ័យ'],
  currentUserRole = 'Super Admin',
  lockedBreeder = null,
  onCancel,
  onSubmit
}: GuidedBreedingWizardProps) {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Role detection
  const isBreederAccount = currentUserRole === 'Breeder' || currentUserRole === 'Breeder Account';
  const isAdminAccount = currentUserRole === 'Super Admin' || currentUserRole === 'Admin';

  // CUSTOMER LIST STATE — scoped to Breeder if applicable
  const [customerList, setCustomerList] = useState<any[]>([]);
  // BREEDER LIST STATE — for Admin dropdown
  const [breederList, setBreederList] = useState<any[]>([]);

  React.useEffect(() => {
    // Scope customers: pass Breeder ID for Breeder accounts, undefined for Admin (all customers)
    fetchCustomersAction(isBreederAccount && lockedBreeder ? lockedBreeder.id : undefined).then(res => {
      if (res.success && Array.isArray(res.data)) {
        setCustomerList(res.data);
      }
    });
    // Load Breeder list for Admin dropdown
    if (!isBreederAccount) {
      fetchBreedersAction().then(res => {
        if (res.success && Array.isArray(res.data)) {
          setBreederList(res.data.filter((b: any) => b.status === 'Active' || !b.status));
        }
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBreederAccount, lockedBreeder?.id]);

  // SEARCH STATES
  const [sireSearch, setSireSearch] = useState('');
  const [damSearch, setDamSearch] = useState('');

  // EDIT / CHANGE MODES
  const [isChangingOwner, setIsChangingOwner] = useState(false);
  const [isChangingBreeder, setIsChangingBreeder] = useState(false);

  // STEP 1 — Program Information
  const [recordId] = useState(`BP-2026-${Math.floor(1000 + Math.random() * 9000)}`);
  const [breedingDate, setBreedingDate] = useState(new Date().toISOString().split('T')[0]);
  const [breedingMethod, setBreedingMethod] = useState('Artificial Insemination (AI)');
  const [breedingType, setBreedingType] = useState<'AI' | 'Natural Mating' | 'Embryo Transfer'>('AI');
  const [breed, setBreed] = useState('Wagyu Cross');
  const [purpose, setPurpose] = useState('Genetic Upgrading');
  const [status, setStatus] = useState<'Breeding' | 'Scheduled' | 'Draft'>('Breeding');
  const [step1Notes, setStep1Notes] = useState('');

  // STEP 2 — Owner Information
  const [ownerType, setOwnerType] = useState<'Farm' | 'Cow Owner'>('Cow Owner');
  const [ownerName, setOwnerName] = useState('Sophea Nhek');
  const [cowOwner, setCowOwner] = useState('Sophea Nhek');
  const [farmLocation, setFarmLocation] = useState(farms[0] || 'រទាំង');
  const [ownerContact] = useState('+855 12 888 999');
  const [isOwnerSelected, setIsOwnerSelected] = useState(true);

  // STEP 3 — Breeder Information
  // For Breeder accounts: always use the locked Breeder from the backend (never trust frontend)
  // For Admin: allow selection from real DB breeders list
  const [breederId, setBreederId] = useState(
    lockedBreeder ? lockedBreeder.id : ''
  );
  const [breederName, setBreederName] = useState(
    lockedBreeder ? lockedBreeder.name : ''
  );
  const [breederContact] = useState('+855 99 777 555');
  const [breederStatus] = useState('Active & Available');
  const [isBreederSelected, setIsBreederSelected] = useState(!!lockedBreeder);

  // STEP 4 — Sire & Dam Selection
  const [selectedSireId, setSelectedSireId] = useState('');
  const [selectedDamId, setSelectedDamId] = useState('');

  // STEP 5 — Breeding Details & Complete Costing Breakdown
  const [serviceDate, setServiceDate] = useState(breedingDate);
  const [numServices, setNumServices] = useState<number>(1);
  const [semenQty, setSemenQty] = useState<number>(1);
  const [unitPrice, setUnitPrice] = useState<number>(100);
  const [originalPrice, setOriginalPrice] = useState<number>(100);
  const [serviceFee, setServiceFee] = useState<number>(50);
  const [breederFee, setBreederFee] = useState<number>(30);
  const [otherCost, setOtherCost] = useState<number>(20);
  const [discount, setDiscount] = useState<number>(10);
  const [allowPriceOverride, setAllowPriceOverride] = useState<boolean>(false);
  const [priceOverrideReason, setPriceOverrideReason] = useState<string>('');
  const [currency] = useState<'USD' | 'KHR'>('USD');
  const [detailNotes, setDetailNotes] = useState('');

  // Smart Selection Objects
  const selectedSire = useMemo(() => sires.find(s => s.id === selectedSireId), [sires, selectedSireId]);
  const selectedDam = useMemo(() => dams.find(d => d.id === selectedDamId), [dams, selectedDamId]);

  // Search filtered arrays
  const filteredSires = useMemo(() => {
    if (!sireSearch) return sires;
    const q = sireSearch.toLowerCase();
    return sires.filter(s => s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q) || s.breed.toLowerCase().includes(q));
  }, [sires, sireSearch]);

  const filteredDams = useMemo(() => {
    if (!damSearch) return dams;
    const q = damSearch.toLowerCase();
    return dams.filter(d => (d.name || '').toLowerCase().includes(q) || d.id.toLowerCase().includes(q) || d.breed.toLowerCase().includes(q));
  }, [dams, damSearch]);

  // Auto update semen price from Stock Insemination if available
  React.useEffect(() => {
    if (selectedSire) {
      if (selectedSire.ownerName) setOwnerName(selectedSire.ownerName);
      if (selectedSire.farmLocation) setFarmLocation(selectedSire.farmLocation);
      const sem = semenStock.find(st => st.sireId === selectedSire.id);
      if (sem && sem.priceUsd) {
        setUnitPrice(sem.priceUsd);
        setOriginalPrice(sem.priceUsd);
      }
    }
  }, [selectedSire, semenStock]);

  React.useEffect(() => {
    if (selectedDam) {
      if (selectedDam.ownerName) setCowOwner(selectedDam.ownerName);
      if (selectedDam.farmLocation) setFarmLocation(selectedDam.farmLocation);
    }
  }, [selectedDam]);

  // Auto calculate expected dates
  const expectedPregnancyCheckDate = useMemo(() => {
    if (!serviceDate) return '';
    const d = new Date(serviceDate);
    d.setDate(d.getDate() + 21);
    return d.toISOString().split('T')[0];
  }, [serviceDate]);

  const expectedCalvingDate = useMemo(() => {
    if (!serviceDate) return '';
    const d = new Date(serviceDate);
    d.setDate(d.getDate() + 283);
    return d.toISOString().split('T')[0];
  }, [serviceDate]);

  // Complete Automatic Financial Calculations
  const semenCost = useMemo(() => Number(semenQty || 1) * Number(unitPrice || 0), [semenQty, unitPrice]);
  const subtotalCost = useMemo(() => semenCost + Number(serviceFee || 0) + Number(breederFee || 0) + Number(otherCost || 0), [semenCost, serviceFee, breederFee, otherCost]);
  const totalCostUsd = useMemo(() => Math.max(0, subtotalCost - Number(discount || 0)), [subtotalCost, discount]);
  const totalCostKhr = useMemo(() => totalCostUsd * 4000, [totalCostUsd]);

  // Workflow Steps
  const steps = [
    { number: 1, title: '1. Breeding Info' },
    { number: 2, title: '2. Select Owner' },
    { number: 3, title: '3. Select Breeder' },
    { number: 4, title: '4. Sire & Dam' },
    { number: 5, title: '5. Details & Costing' },
    { number: 6, title: '6. Review & Confirm' }
  ];

  // Step Validation Logic
  const validateStep = (step: number): boolean => {
    setValidationError(null);
    if (step === 1) {
      if (!breedingDate || !breedingMethod || !breed || !purpose) {
        setValidationError('Please complete all required fields: Date, Method, Breed, and Purpose.');
        return false;
      }
    }
    if (step === 2) {
      if (!ownerName || !farmLocation) {
        setValidationError('Please select or specify the Owner Name and Farm Location.');
        return false;
      }
    }
    if (step === 3) {
      if (!breederName) {
        setValidationError('Please select an Assigned Breeder Specialist.');
        return false;
      }
    }
    if (step === 4) {
      if (!selectedSireId) {
        setValidationError('Please select a Sire Bull for this breeding program.');
        return false;
      }
      if (!selectedDamId) {
        setValidationError('Please select an eligible Dam Cow.');
        return false;
      }
      if (selectedDam) {
        const isUnavailable = ['Pregnant', 'In Breeding'].includes(selectedDam.availability) || selectedDam.breedingStatus === 'Confirmed Pregnant';
        if (isUnavailable) {
          setValidationError(`Dam ${selectedDam.id} is currently unavailable (${selectedDam.availability}). Please select an open eligible Dam.`);
          return false;
        }
      }
    }
    if (step === 5) {
      if (!serviceDate) {
        setValidationError('Please enter the Breeding Service Date.');
        return false;
      }
      if (unitPrice < 0 || serviceFee < 0 || breederFee < 0 || otherCost < 0 || discount < 0) {
        setValidationError('Cost components and fees cannot be negative amounts.');
        return false;
      }
      if (discount > subtotalCost) {
        setValidationError(`Discount ($${discount}) cannot be greater than Subtotal ($${subtotalCost}).`);
        return false;
      }
      if (allowPriceOverride && unitPrice !== originalPrice && !priceOverrideReason.trim()) {
        setValidationError('Please specify a reason for overriding the default stock unit price.');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) return;
    if (currentStep < 6) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setValidationError(null);
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleFinalSubmit = async () => {
    if (!selectedSireId || !selectedDamId) {
      setValidationError('Missing Sire or Dam selection.');
      return;
    }
    if (!validateStep(5)) return;
    
    setIsSubmitting(true);
    try {
      // Determine the authoritative breeder ID:
      // - Breeder account: always use lockedBreeder.id (backend will also enforce this)
      // - Admin account: use the selected breederId from the dropdown
      const effectiveBreederId = isBreederAccount && lockedBreeder
        ? lockedBreeder.id
        : breederId || null;
      const effectiveBreederName = isBreederAccount && lockedBreeder
        ? lockedBreeder.name
        : breederName || null;

      const program: BreedingProgramItem = {
        id: `BP-${Date.now()}`,
        programNumber: recordId,
        breedingType,
        breedingMethod,
        breed,
        purpose,
        startDate: breedingDate,
        sireId: selectedSireId,
        damId: selectedDamId,
        ownerName,
        cowOwner: cowOwner || ownerName,
        farmLocation,
        breederName: effectiveBreederName,
        semenQty,
        unitPrice,
        semenCost,
        serviceFee,
        semenPrice: unitPrice,
        breederFee,
        otherCost,
        discount,
        priceOverrideReason: allowPriceOverride ? priceOverrideReason : undefined,
        numServices,
        currency,
        priceUsd: totalCostUsd,
        priceKhr: totalCostKhr,
        breedingDate: serviceDate,
        pregnancyCheckDate: expectedPregnancyCheckDate,
        expectedCalvingDate,
        status: status as any,
        notes: detailNotes || step1Notes || '6-Step Guided Workflow Registered Program with Costing'
      };
      // Attach breederId for backend enforcement
      (program as any).breederId = effectiveBreederId;
      await onSubmit(program);
    } catch (err: any) {
      setValidationError(err.message || 'Failed to create breeding record');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-7 shadow-xl max-w-4xl mx-auto space-y-6">

      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-2xl bg-orange-50 text-[#dc5c15] shadow-xs">
              <Heart className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">Add New Breeding Program</h3>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">
                Guided workflow with integrated costing breakdown & PostgreSQL persistence.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="bg-orange-100 text-[#dc5c15] text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
            Step {currentStep} of 6
          </span>
          <button
            onClick={onCancel}
            className="text-xs font-extrabold text-slate-400 hover:text-slate-700 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Arrow Step Progress Indicator */}
      <div className="bg-slate-50/90 border border-slate-200/90 p-1.5 sm:p-2 rounded-2xl shadow-inner overflow-x-auto scrollbar-none">
        <div className="flex items-center min-w-[700px] gap-1">
          {steps.map((step, idx) => {
            const isCompleted = currentStep > step.number;
            const isCurrent = currentStep === step.number;

            return (
              <React.Fragment key={step.number}>
                <div
                  onClick={() => {
                    if (step.number < currentStep) setCurrentStep(step.number);
                  }}
                  className={`flex-1 py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-[#dc5c15] text-white shadow-md shadow-[#dc5c15]/30 ring-2 ring-orange-200 scale-[1.02]'
                      : isCompleted
                      ? 'bg-emerald-600 text-white shadow-xs hover:bg-emerald-700'
                      : 'bg-white text-slate-400 border border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <span
                    className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                      isCurrent || isCompleted ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {isCompleted ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : step.number}
                  </span>
                  <span className="text-[10.5px] uppercase tracking-wider font-extrabold truncate">
                    {step.title}
                  </span>
                </div>

                {idx < steps.length - 1 && (
                  <ChevronRight
                    className={`h-4 w-4 shrink-0 stroke-[3] transition-colors ${
                      currentStep > step.number ? 'text-emerald-600' : 'text-slate-300'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Inline Validation Alert */}
      {validationError && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-xs text-rose-800 font-bold animate-in fade-in duration-200">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{validationError}</span>
        </div>
      )}

      {/* STEP CONTENT BODY */}
      <div className="space-y-6">

        {/* STEP 1 — BREEDING INFORMATION */}
        {currentStep === 1 && (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Sparkles className="h-4 w-4 text-[#dc5c15]" />
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Step 1 — Breeding Information</h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Breeding Program Number <span className="text-slate-400 font-normal">(Auto-Generated)</span></label>
                <input
                  type="text"
                  value={recordId}
                  readOnly
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 font-mono font-bold text-slate-700 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Breeding Date <span className="text-rose-500">*</span></label>
                <input
                  type="date"
                  value={breedingDate}
                  onChange={e => {
                    setBreedingDate(e.target.value);
                    setServiceDate(e.target.value);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-[#dc5c15] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Breeding Type / Service Method <span className="text-rose-500">*</span></label>
                <select
                  value={breedingMethod}
                  onChange={e => {
                    setBreedingMethod(e.target.value);
                    if (e.target.value.includes('Natural')) setBreedingType('Natural Mating');
                    else if (e.target.value.includes('Embryo')) setBreedingType('Embryo Transfer');
                    else setBreedingType('AI');
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-[#dc5c15] focus:outline-none"
                >
                  <option value="Artificial Insemination (AI)">Artificial Insemination (AI)</option>
                  <option value="Natural Mating">Natural Mating</option>
                  <option value="Embryo Transfer (ET)">Embryo Transfer (ET)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Breed Target <span className="text-rose-500">*</span></label>
                <select
                  value={breed}
                  onChange={e => setBreed(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-[#dc5c15] focus:outline-none"
                >
                  <option value="Wagyu Cross">Wagyu Cross</option>
                  <option value="100% Fullblood Wagyu">100% Fullblood Wagyu</option>
                  <option value="Red Brahman">Red Brahman</option>
                  <option value="Angus Cross">Angus Cross</option>
                  <option value="Charolais Cross">Charolais Cross</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Purpose / Objective <span className="text-rose-500">*</span></label>
                <select
                  value={purpose}
                  onChange={e => setPurpose(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-[#dc5c15] focus:outline-none"
                >
                  <option value="Genetic Upgrading">Genetic Upgrading</option>
                  <option value="Commercial Beef">Commercial Beef Production</option>
                  <option value="Pedigree Stud">Pedigree Stud Breeding</option>
                  <option value="Dairy Production">Dairy Production</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Initial Program Status</label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-[#dc5c15] focus:outline-none"
                >
                  <option value="Breeding">Active (In Service)</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Draft">Draft Record</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Breeding Program Notes</label>
                <textarea
                  value={step1Notes}
                  onChange={e => setStep1Notes(e.target.value)}
                  rows={2}
                  placeholder="Additional breeding observations, physiological notes..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-medium text-slate-900 focus:ring-2 focus:ring-[#dc5c15] focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2 — SELECT OWNER */}
        {currentStep === 2 && (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-[#dc5c15]" />
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Step 2 — Select Owner</h4>
              </div>
              {isOwnerSelected && !isChangingOwner && (
                <button
                  type="button"
                  onClick={() => setIsChangingOwner(true)}
                  className="text-xs font-black text-[#dc5c15] hover:underline cursor-pointer flex items-center gap-1"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  [Change Owner]
                </button>
              )}
            </div>

            {/* Selected Owner Summary Card */}
            {isOwnerSelected && !isChangingOwner ? (
              <div className="p-4 bg-emerald-50/90 border border-emerald-200 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[9.5px] font-black uppercase tracking-wider text-emerald-700">Selected Owner</span>
                  <h5 className="text-sm font-black text-slate-900 mt-0.5">{ownerName}</h5>
                  <p className="text-xs text-slate-600 font-bold">{ownerType} • {farmLocation} Station • {ownerContact}</p>
                </div>
                <div className="flex items-center gap-1.5 bg-emerald-600 text-white text-xs font-black px-3 py-1.5 rounded-xl shadow-xs">
                  <Check className="h-4 w-4 stroke-[3]" />
                  <span>Selected</span>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Owner Category Type</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setOwnerType('Farm')}
                        className={`flex-1 py-2.5 rounded-xl font-black border transition-all cursor-pointer ${
                          ownerType === 'Farm' ? 'bg-[#dc5c15] text-white border-[#dc5c15]' : 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        Farm Owner
                      </button>
                      <button
                        type="button"
                        onClick={() => setOwnerType('Cow Owner')}
                        className={`flex-1 py-2.5 rounded-xl font-black border transition-all cursor-pointer ${
                          ownerType === 'Cow Owner' ? 'bg-[#dc5c15] text-white border-[#dc5c15]' : 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        Cow Owner
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Farm / Station Location</label>
                    <select
                      value={farmLocation}
                      onChange={e => setFarmLocation(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-[#dc5c15] focus:outline-none"
                    >
                      {farms.map(f => <option key={f} value={f}>{f} Station</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Select Customer / Cow Owner <span className="text-rose-500">*</span></label>
                    {customerList.length > 0 ? (
                      <select
                        value={cowOwner}
                        onChange={e => {
                          setCowOwner(e.target.value);
                          setOwnerName(e.target.value);
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-[#dc5c15] focus:outline-none"
                      >
                        {customerList.map((c: any) => (
                          <option key={c.id} value={c.name}>
                            {c.name} ({c.id} • {c.phone || c.email || 'No contact'})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={cowOwner}
                        onChange={e => {
                          setCowOwner(e.target.value);
                          setOwnerName(e.target.value);
                        }}
                        placeholder="e.g. Sophea Nhek"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-[#dc5c15] focus:outline-none"
                      />
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsOwnerSelected(true);
                    setIsChangingOwner(false);
                  }}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-black text-xs shadow-md hover:bg-emerald-700 transition-all cursor-pointer"
                >
                  ✓ Confirm & Select Owner
                </button>
              </div>
            )}
          </div>
        )}

        {/* STEP 3 — SELECT BREEDER */}
        {currentStep === 3 && (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-[#dc5c15]" />
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Step 3 — Breeder Assignment</h4>
              </div>
              {/* Only Admin can change breeder — Breeder account sees lock icon only */}
              {!isBreederAccount && isBreederSelected && !isChangingBreeder && (
                <button
                  type="button"
                  onClick={() => setIsChangingBreeder(true)}
                  className="text-xs font-black text-[#dc5c15] hover:underline cursor-pointer flex items-center gap-1"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  [Change Breeder]
                </button>
              )}
            </div>

            {/* ────────────────────────────────────────────────
                BREEDER ACCOUNT: Always show locked card
            ──────────────────────────────────────────────── */}
            {isBreederAccount && (
              <div>
                <div className="p-4 bg-indigo-50/80 border border-indigo-200 rounded-2xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center flex-shrink-0">
                      <UserCheck className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <span className="text-[9.5px] font-black uppercase tracking-wider text-indigo-700 block">Assigned Breeder (Auto)</span>
                      <h5 className="text-sm font-black text-slate-900 mt-0.5">
                        {lockedBreeder?.name || breederName || 'Current Account'}
                      </h5>
                      <p className="text-[10px] text-indigo-700 font-bold mt-0.5">
                        ID: {lockedBreeder?.id || breederId} • Current Account
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 bg-indigo-100 text-indigo-800 border border-indigo-200 text-xs font-black px-3 py-1.5 rounded-xl">
                    <Lock className="h-3.5 w-3.5" />
                    <span>Auto-Assigned</span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 font-medium mt-2 px-1">
                  As a Breeder account, you are automatically assigned as the responsible Breeder. This cannot be changed.
                </p>
              </div>
            )}

            {/* ────────────────────────────────────────────────
                ADMIN ACCOUNT: Show selected Breeder card or dropdown
            ──────────────────────────────────────────────── */}
            {!isBreederAccount && isBreederSelected && !isChangingBreeder && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[9.5px] font-black uppercase tracking-wider text-purple-700">Selected Breeder</span>
                  <h5 className="text-sm font-black text-slate-900 mt-0.5">{breederName || '— Not Selected —'}</h5>
                  <p className="text-xs text-slate-600 font-bold">Breeder ID: {breederId || 'N/A'}</p>
                </div>
                <div className="flex items-center gap-1.5 bg-[#dc5c15] text-white text-xs font-black px-3 py-1.5 rounded-xl shadow-xs">
                  <Check className="h-4 w-4 stroke-[3]" />
                  <span>Selected</span>
                </div>
              </div>
            )}

            {!isBreederAccount && (!isBreederSelected || isChangingBreeder) && (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Select Licensed Breeder Specialist <span className="text-rose-500">*</span></label>
                  {breederList.length > 0 ? (
                    <select
                      value={breederId}
                      onChange={e => {
                        const selected = breederList.find((b: any) => b.id === e.target.value);
                        setBreederId(e.target.value);
                        setBreederName(selected ? selected.name : '');
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-[#dc5c15] focus:outline-none"
                    >
                      <option value="">— Select Breeder —</option>
                      {breederList.map((b: any) => (
                        <option key={b.id} value={b.id}>
                          {b.name} ({b.id}) • {b.province || b.address || 'N/A'}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-medium">
                      Loading Breeder list… or no active Breeders found in the system.
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!breederId) {
                      setValidationError('Please select a Breeder Specialist.');
                      return;
                    }
                    setIsBreederSelected(true);
                    setIsChangingBreeder(false);
                    setValidationError(null);
                  }}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-black text-xs shadow-md hover:bg-emerald-700 transition-all cursor-pointer"
                >
                  ✓ Confirm & Select Breeder
                </button>
              </div>
            )}
          </div>
        )}

        {/* STEP 4 — SELECT SIRE & DAM */}
        {currentStep === 4 && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* SIRE SELECTION */}
              <div className="bg-white rounded-3xl border border-slate-200/90 p-4 space-y-3 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <Beef className="h-4 w-4 text-[#dc5c15]" />
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">SIRE (Father)</h4>
                  </div>
                  {selectedSire && (
                    <span className="text-[9px] font-black bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                      ✓ Selected
                    </span>
                  )}
                </div>

                <div className="relative">
                  <Search className="h-3.5 w-3.5 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={sireSearch}
                    onChange={e => setSireSearch(e.target.value)}
                    placeholder="Search Sire by name, ID, or breed..."
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#dc5c15] focus:outline-none"
                  />
                </div>

                {selectedSire ? (
                  <div className="p-3 bg-orange-50/70 border border-orange-200 rounded-2xl flex items-center gap-3">
                    <div className="h-14 w-14 rounded-xl border border-orange-200 bg-white overflow-hidden shrink-0">
                      <StandardAnimalImage src={selectedSire.imageUrl} alt={selectedSire.name} />
                    </div>
                    <div className="flex-1 min-w-0 text-xs">
                      <h5 className="font-black text-slate-900 truncate">{selectedSire.name}</h5>
                      <p className="text-[10px] text-slate-500 font-medium">ID: <span className="font-bold text-slate-800">{selectedSire.id}</span> • Breed: <span className="font-black text-[#dc5c15]">{selectedSire.breed}</span></p>
                      <p className="text-[10px] text-slate-500 font-medium truncate">Father: {selectedSire.fatherId || 'SIR-001'} • Mother: {selectedSire.motherId || 'DAM-001'}</p>
                      <p className="text-[9.5px] font-extrabold text-slate-400 mt-0.5">Source: {selectedSire.sourcingCompany || 'ABS Global'}</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl text-xs text-slate-400">
                    Search and select a Sire below:
                  </div>
                )}

                <div className="grid grid-cols-1 gap-2 max-h-[170px] overflow-y-auto pr-1">
                  {filteredSires.map(sire => {
                    const isSelected = selectedSireId === sire.id;
                    return (
                      <div
                        key={sire.id}
                        onClick={() => setSelectedSireId(sire.id)}
                        className={`p-2.5 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-2.5 ${
                          isSelected
                            ? 'border-[#dc5c15] bg-orange-50/80 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="h-9 w-9 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                          <StandardAnimalImage src={sire.imageUrl} alt={sire.name} />
                        </div>
                        <div className="flex-1 min-w-0 text-xs">
                          <div className="flex items-center justify-between">
                            <h5 className="font-black text-slate-900 truncate text-[11px]">{sire.name}</h5>
                            <span className="text-[8.5px] font-black text-[#dc5c15] bg-orange-100 px-1.5 py-0.2 rounded">{sire.breed}</span>
                          </div>
                          <p className="text-[9.5px] text-slate-400 font-semibold truncate">ID: {sire.id} • {sire.sourcingCompany || 'ABS Global'}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* DAM SELECTION */}
              <div className="bg-white rounded-3xl border border-slate-200/90 p-4 space-y-3 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-purple-700" />
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">DAM (Mother)</h4>
                  </div>
                  {selectedDam && (
                    <span className="text-[9px] font-black bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                      ✓ Selected
                    </span>
                  )}
                </div>

                <div className="relative">
                  <Search className="h-3.5 w-3.5 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={damSearch}
                    onChange={e => setDamSearch(e.target.value)}
                    placeholder="Search Dam by name, ID, or breed..."
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#dc5c15] focus:outline-none"
                  />
                </div>

                {selectedDam ? (
                  <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-2xl flex items-center gap-3">
                    <div className="h-14 w-14 rounded-xl border border-purple-200 bg-white overflow-hidden shrink-0">
                      <StandardAnimalImage src={selectedDam.imageUrl} alt={selectedDam.name || selectedDam.id} />
                    </div>
                    <div className="flex-1 min-w-0 text-xs">
                      <h5 className="font-black text-slate-900 truncate">{selectedDam.name || selectedDam.id}</h5>
                      <p className="text-[10px] text-slate-500 font-medium">ID: <span className="font-bold text-slate-800">{selectedDam.id}</span> • Breed: <span className="font-black text-purple-700">{selectedDam.breed}</span></p>
                      <p className="text-[10px] text-slate-500 font-medium truncate">Father: {selectedDam.fatherId || 'SIR-001'} • Mother: {selectedDam.motherId || 'DAM-001'}</p>
                      <p className="text-[9.5px] font-extrabold text-emerald-700 mt-0.5">✓ Available for Breeding</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl text-xs text-slate-400">
                    Search and select an eligible Dam below:
                  </div>
                )}

                <div className="grid grid-cols-1 gap-2 max-h-[170px] overflow-y-auto pr-1">
                  {filteredDams.map(dam => {
                    const isSelected = selectedDamId === dam.id;
                    const isUnavailable = ['Pregnant', 'In Breeding'].includes(dam.availability) || dam.breedingStatus === 'Confirmed Pregnant';

                    return (
                      <div
                        key={dam.id}
                        onClick={() => {
                          if (!isUnavailable) setSelectedDamId(dam.id);
                        }}
                        className={`p-2.5 rounded-xl border-2 transition-all flex items-center gap-2.5 ${
                          isUnavailable
                            ? 'border-slate-200 bg-slate-100/70 opacity-60 cursor-not-allowed'
                            : isSelected
                            ? 'border-purple-600 bg-purple-50/80 shadow-xs cursor-pointer'
                            : 'border-slate-200 hover:border-slate-300 bg-white cursor-pointer'
                        }`}
                      >
                        <div className="h-9 w-9 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                          <StandardAnimalImage src={dam.imageUrl} alt={dam.name || dam.id} />
                        </div>
                        <div className="flex-1 min-w-0 text-xs">
                          <div className="flex items-center justify-between">
                            <h5 className="font-black text-slate-900 truncate text-[11px]">{dam.name || dam.id}</h5>
                            {isUnavailable ? (
                              <span className="text-[8px] font-black text-rose-700 bg-rose-100 px-1 rounded">✕ Unavailable</span>
                            ) : (
                              <span className="text-[8.5px] font-black text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">✓ Available</span>
                            )}
                          </div>
                          <p className="text-[9.5px] text-slate-400 font-semibold truncate">ID: {dam.id} • {dam.breed}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* STEP 5 — BREEDING DETAILS & COMPLETE COSTING BREAKDOWN */}
        {currentStep === 5 && (
          <div className="space-y-4">
            
            {/* TECHNICAL DETAILS */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-5 space-y-4 shadow-sm">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Activity className="h-4 w-4 text-[#dc5c15]" />
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Breeding Technical Details</h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Breeding Method</label>
                  <input
                    type="text"
                    value={breedingMethod}
                    readOnly
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-700 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Service Date <span className="text-rose-500">*</span></label>
                  <input
                    type="date"
                    value={serviceDate}
                    onChange={e => setServiceDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-[#dc5c15] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Number of Services</label>
                  <input
                    type="number"
                    value={numServices}
                    onChange={e => setNumServices(Number(e.target.value))}
                    min={1}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-[#dc5c15] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* COSTING SECTION BREAKDOWN */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Calculator className="h-4 w-4 text-emerald-600" />
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Program Costing & Financial Schedule</h4>
                </div>
                <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full uppercase">
                  Currency: USD ($)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                
                {/* 1. Semen Quantity & Unit Price */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Semen Straw Quantity</label>
                  <input
                    type="number"
                    value={semenQty}
                    onChange={e => setSemenQty(Math.max(1, Number(e.target.value)))}
                    min={1}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-[#dc5c15] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Sire / Semen Straw Unit Price ($)
                    {allowPriceOverride && <span className="text-amber-600 font-extrabold ml-1">(Overridden)</span>}
                  </label>
                  <input
                    type="number"
                    value={unitPrice}
                    onChange={e => setUnitPrice(Number(e.target.value))}
                    disabled={!allowPriceOverride}
                    className={`w-full rounded-xl px-3.5 py-2.5 font-bold focus:outline-none ${
                      allowPriceOverride ? 'bg-amber-50 border border-amber-300 text-amber-900 focus:ring-2 focus:ring-amber-500' : 'bg-slate-100 border border-slate-200 text-slate-700 cursor-not-allowed'
                    }`}
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Total Semen Cost ($)</label>
                  <input
                    type="text"
                    value={`$${semenCost.toFixed(2)} (${semenQty} straw × $${unitPrice})`}
                    readOnly
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-800 cursor-not-allowed"
                  />
                </div>

                {/* Price Override Option */}
                <div className="sm:col-span-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="overrideCheck"
                      checked={allowPriceOverride}
                      onChange={e => setAllowPriceOverride(e.target.checked)}
                      className="h-4 w-4 text-[#dc5c15] rounded border-slate-300 focus:ring-[#dc5c15] cursor-pointer"
                    />
                    <label htmlFor="overrideCheck" className="font-bold text-xs text-slate-800 cursor-pointer">
                      Enable Authorized Stock Unit Price Override (Default: ${originalPrice}.00 USD)
                    </label>
                  </div>
                  {allowPriceOverride && (
                    <div>
                      <input
                        type="text"
                        value={priceOverrideReason}
                        onChange={e => setPriceOverrideReason(e.target.value)}
                        placeholder="State reason for unit price override (e.g., Bulk discount, Approved farm promotional rate)..."
                        className="w-full bg-white border border-amber-300 rounded-xl p-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500"
                        required
                      />
                    </div>
                  )}
                </div>

                {/* 2. Service Fee */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Breeding Service Fee ($)</label>
                  <input
                    type="number"
                    value={serviceFee}
                    onChange={e => setServiceFee(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-[#dc5c15] focus:outline-none"
                  />
                </div>

                {/* 3. Breeder Fee */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Breeder / Specialist Fee ($)</label>
                  <input
                    type="number"
                    value={breederFee}
                    onChange={e => setBreederFee(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-[#dc5c15] focus:outline-none"
                  />
                </div>

                {/* 4. Veterinary / Other Cost */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Veterinary / Other Cost ($)</label>
                  <input
                    type="number"
                    value={otherCost}
                    onChange={e => setOtherCost(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-[#dc5c15] focus:outline-none"
                  />
                </div>

                {/* 5. Subtotal & Discount */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Subtotal ($)</label>
                  <input
                    type="text"
                    value={`$${subtotalCost.toFixed(2)}`}
                    readOnly
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-800 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Discount Amount ($)</label>
                  <input
                    type="number"
                    value={discount}
                    onChange={e => setDiscount(Number(e.target.value))}
                    max={subtotalCost}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-emerald-700 focus:ring-2 focus:ring-[#dc5c15] focus:outline-none"
                  />
                </div>

                {/* Financial Total Banner */}
                <div className="sm:col-span-3 p-4 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-2xl shadow-md flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase text-emerald-100 tracking-wider">Calculated Total Breeding Program Cost</p>
                    <p className="text-xl font-black">${totalCostUsd.toFixed(2)} USD • ៛{totalCostKhr.toLocaleString()} KHR</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-emerald-200" />
                </div>

              </div>
            </div>

            {/* EXPECTED RESULT TIMELINE */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-5 space-y-4 shadow-sm">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Calendar className="h-4 w-4 text-emerald-600" />
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Expected Gestation & Calving Timeline</h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Expected Pregnancy Check (+21 Days)</label>
                  <input
                    type="date"
                    value={expectedPregnancyCheckDate}
                    readOnly
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-sky-700 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Expected Calving Date (+283 Days Gestation)</label>
                  <input
                    type="date"
                    value={expectedCalvingDate}
                    readOnly
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 font-black text-emerald-700 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

          </div>
        )}

        {/* STEP 6 — REVIEW & CONFIRM */}
        {currentStep === 6 && (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Award className="h-4 w-4 text-[#dc5c15]" />
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Step 6 — Review & Final Confirmation</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              
              {/* BREEDING INFORMATION */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1 relative">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase tracking-wider text-[#dc5c15]">BREEDING INFORMATION</span>
                  <button type="button" onClick={() => setCurrentStep(1)} className="text-[10px] font-bold text-[#dc5c15] hover:underline cursor-pointer">[Edit]</button>
                </div>
                <p className="font-bold text-slate-900">Record ID: {recordId}</p>
                <p className="text-slate-600">Method: {breedingMethod}</p>
                <p className="text-slate-600">Breed Target: {breed} ({purpose})</p>
              </div>

              {/* OWNER */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1 relative">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase tracking-wider text-emerald-700">OWNER</span>
                  <button type="button" onClick={() => setCurrentStep(2)} className="text-[10px] font-bold text-emerald-700 hover:underline cursor-pointer">[Edit]</button>
                </div>
                <p className="font-bold text-slate-900">Farm Owner: {ownerName}</p>
                <p className="text-slate-600">Dam Owner: {cowOwner}</p>
                <p className="text-slate-600">Station: {farmLocation}</p>
              </div>

              {/* BREEDER */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1 relative">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase tracking-wider text-purple-700">BREEDER</span>
                  <button type="button" onClick={() => setCurrentStep(3)} className="text-[10px] font-bold text-purple-700 hover:underline cursor-pointer">[Edit]</button>
                </div>
                <p className="font-bold text-slate-900">{breederName}</p>
                <p className="text-slate-600">ID: {breederId} • Status: {breederStatus}</p>
              </div>

              {/* SIRE */}
              <div className="p-3.5 bg-orange-50/70 rounded-2xl border border-orange-200 space-y-1 relative">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase tracking-wider text-[#dc5c15]">SIRE</span>
                  <button type="button" onClick={() => setCurrentStep(4)} className="text-[10px] font-bold text-[#dc5c15] hover:underline cursor-pointer">[Edit]</button>
                </div>
                <p className="font-bold text-slate-900">{selectedSire?.name || selectedSireId} ({selectedSire?.breed})</p>
                <p className="text-slate-600">Sire ID: {selectedSire?.id} • Source: {selectedSire?.sourcingCompany}</p>
              </div>

              {/* DAM */}
              <div className="p-3.5 bg-purple-50/70 rounded-2xl border border-purple-200 space-y-1 relative">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase tracking-wider text-purple-700">DAM</span>
                  <button type="button" onClick={() => setCurrentStep(4)} className="text-[10px] font-bold text-purple-700 hover:underline cursor-pointer">[Edit]</button>
                </div>
                <p className="font-bold text-slate-900">{selectedDam?.name || selectedDamId} ({selectedDam?.breed})</p>
                <p className="text-slate-600">Dam ID: {selectedDam?.id} • Status: {selectedDam?.availability}</p>
              </div>

              {/* BREEDING DETAILS */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1 relative">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-700">BREEDING DETAILS</span>
                  <button type="button" onClick={() => setCurrentStep(5)} className="text-[10px] font-bold text-slate-700 hover:underline cursor-pointer">[Edit]</button>
                </div>
                <p className="font-bold text-slate-900">Service Date: {serviceDate}</p>
                <p className="text-slate-600">Expected Calving: {expectedCalvingDate} (+283 Days)</p>
              </div>

              {/* COST SUMMARY */}
              <div className="md:col-span-2 p-4 bg-emerald-50/90 rounded-2xl border border-emerald-200 space-y-2 relative">
                <div className="flex items-center justify-between border-b border-emerald-200/80 pb-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800">COST SUMMARY</span>
                  <button type="button" onClick={() => setCurrentStep(5)} className="text-[10px] font-bold text-emerald-800 hover:underline cursor-pointer">[Edit Costing]</button>
                </div>
                <div className="space-y-1 font-mono text-xs text-slate-700">
                  <div className="flex justify-between">
                    <span>Sire / Semen Cost ({semenQty} straw × ${unitPrice.toFixed(2)})</span>
                    <span className="font-bold">${semenCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Service Fee</span>
                    <span className="font-bold">${serviceFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Breeder Fee</span>
                    <span className="font-bold">${breederFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Other / Veterinary Cost</span>
                    <span className="font-bold">${otherCost.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-emerald-200 pt-1 flex justify-between font-bold text-slate-800">
                    <span>Subtotal</span>
                    <span>${subtotalCost.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-bold">
                      <span>Discount</span>
                      <span>-${discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t-2 border-emerald-600 pt-1.5 flex justify-between font-black text-sm text-emerald-900">
                    <span>TOTAL COST</span>
                    <span>${totalCostUsd.toFixed(2)} USD (៛{totalCostKhr.toLocaleString()} KHR)</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* FOOTER NAVIGATION TOOLBAR */}
      <div className="flex items-center justify-between border-t border-slate-100 pt-4">
        <button
          type="button"
          onClick={handleBack}
          disabled={currentStep === 1}
          className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-30 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>

        {currentStep === 1 && (
          <button
            type="button"
            onClick={handleNext}
            className="px-6 py-2.5 rounded-xl bg-[#dc5c15] text-white text-xs font-black shadow-md shadow-[#dc5c15]/20 hover:bg-[#c44f0e] transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>Next: Select Owner</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        )}

        {currentStep === 2 && (
          <button
            type="button"
            onClick={handleNext}
            className="px-6 py-2.5 rounded-xl bg-[#dc5c15] text-white text-xs font-black shadow-md shadow-[#dc5c15]/20 hover:bg-[#c44f0e] transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>Next: Select Breeder</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        )}

        {currentStep === 3 && (
          <button
            type="button"
            onClick={handleNext}
            className="px-6 py-2.5 rounded-xl bg-[#dc5c15] text-white text-xs font-black shadow-md shadow-[#dc5c15]/20 hover:bg-[#c44f0e] transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>Next: Select Sire & Dam</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        )}

        {currentStep === 4 && (
          <button
            type="button"
            onClick={handleNext}
            className="px-6 py-2.5 rounded-xl bg-[#dc5c15] text-white text-xs font-black shadow-md shadow-[#dc5c15]/20 hover:bg-[#c44f0e] transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>Next: Details & Costing</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        )}

        {currentStep === 5 && (
          <button
            type="button"
            onClick={handleNext}
            className="px-6 py-2.5 rounded-xl bg-[#dc5c15] text-white text-xs font-black shadow-md shadow-[#dc5c15]/20 hover:bg-[#c44f0e] transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>Next: Review & Confirm</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        )}

        {currentStep === 6 && (
          <button
            type="button"
            onClick={handleFinalSubmit}
            disabled={isSubmitting}
            className="px-7 py-3 rounded-2xl bg-emerald-600 text-white text-xs font-black shadow-xl shadow-emerald-600/30 hover:bg-emerald-700 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Check className="h-4 w-4 stroke-[3]" />
            <span>{isSubmitting ? 'Creating Breeding Program...' : 'Confirm & Create Breeding Program'}</span>
          </button>
        )}
      </div>

    </div>
  );
}
