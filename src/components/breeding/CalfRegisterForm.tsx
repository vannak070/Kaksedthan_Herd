'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import StandardAnimalImage from '@/components/common/StandardAnimalImage';
import ImageUploadContainer from '@/components/common/ImageUploadContainer';
import { confirmCalfTransactionAction } from '@/app/actions';
import { 
  Baby, 
  Beef, 
  Heart, 
  Award, 
  FileText, 
  QrCode, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  UserCheck, 
  Sparkles, 
  Check, 
  Lock, 
  Info,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { SireItem, DamItem, BreedingProgramItem } from '@/types/breeding.types';

interface CalfRegisterFormProps {
  sires: SireItem[];
  dams: DamItem[];
  programs: BreedingProgramItem[];
  initialBpId?: string;
  onCancel?: () => void;
}

export default function CalfRegisterForm({
  sires,
  dams,
  programs,
  initialBpId = '',
  onCancel
}: CalfRegisterFormProps) {
  const router = useRouter();

  // SECTION 1 — REGISTRATION SOURCE
  const [sourceType, setSourceType] = useState<'from_program' | 'standalone'>(initialBpId ? 'from_program' : 'from_program');
  const [selectedBpId, setSelectedBpId] = useState<string>(initialBpId);

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<{ calfId: string; regNumber: string; certNumber: string } | null>(null);

  // SECTION 3 — CALF IDENTIFICATION
  const [calfId] = useState(`CLF-2026-${Math.floor(100 + Math.random() * 900)}`);
  const [registrationNumber] = useState(`KH-2026-${Math.floor(1000 + Math.random() * 9000)}`);
  const [tagNumber, setTagNumber] = useState('');
  const [calfName, setCalfName] = useState('');
  const [sex, setSex] = useState<'Male' | 'Female'>('Male');
  const [birthDate, setBirthDate] = useState(new Date().toISOString().split('T')[0]);
  const [birthWeight, setBirthWeight] = useState<number>(28.5);
  const [color, setColor] = useState('Black & White Markings');
  const [breed, setBreed] = useState('Wagyu Cross');

  // SECTION 4 — PARENTAGE & OWNERSHIP (Auto-Populated when inherited)
  const [sireId, setSireId] = useState(sires[0]?.id || 'SIR-001');
  const [damId, setDamId] = useState(dams[0]?.id || 'DAM-001');
  const [ownerName, setOwnerName] = useState('Kaksedthan Station Farm');
  const [cowOwner, setCowOwner] = useState('SNR Livestock Owner');
  const [farmLocation, setFarmLocation] = useState('រទាំង');
  const [breederName, setBreederName] = useState('Dr. Vannak (Senior Inseminator)');

  // SECTION 6 — BREEDING INFO
  const [breedingDate, setBreedingDate] = useState(birthDate);
  const [breedingMethod, setBreedingMethod] = useState('Artificial Insemination (AI)');
  const [expectedCalvingDate, setExpectedCalvingDate] = useState(birthDate);

  // SECTION 7 — CALF IMAGE
  const [imageUrl, setImageUrl] = useState('');

  // Selected Program object
  const selectedProgram = useMemo(() => programs.find(p => p.id === selectedBpId || p.programNumber === selectedBpId), [programs, selectedBpId]);

  // Selected Sire & Dam objects
  const selectedSire = useMemo(() => sires.find(s => s.id === sireId), [sires, sireId]);
  const selectedDam = useMemo(() => dams.find(d => d.id === damId), [dams, damId]);

  // Auto-populate fields when Breeding Program changes
  useEffect(() => {
    if (sourceType === 'from_program' && selectedProgram) {
      setSireId(selectedProgram.sireId);
      setDamId(selectedProgram.damId);
      if (selectedProgram.ownerName) setOwnerName(selectedProgram.ownerName);
      if (selectedProgram.cowOwner) setCowOwner(selectedProgram.cowOwner);
      if (selectedProgram.farmLocation) setFarmLocation(selectedProgram.farmLocation);
      if (selectedProgram.breederName) setBreederName(selectedProgram.breederName);
      if (selectedProgram.breed) setBreed(selectedProgram.breed);
      if (selectedProgram.breedingDate) setBreedingDate(selectedProgram.breedingDate);
      if (selectedProgram.breedingMethod) setBreedingMethod(selectedProgram.breedingMethod);
      if (selectedProgram.expectedCalvingDate) setExpectedCalvingDate(selectedProgram.expectedCalvingDate);
      if (!calfName) setCalfName(`Calf of ${selectedProgram.damName || selectedProgram.damId}`);
    }
  }, [sourceType, selectedProgram]);

  // Sync Sire & Dam attributes on manual selection
  useEffect(() => {
    if (selectedSire) {
      if (selectedSire.ownerName) setOwnerName(selectedSire.ownerName);
      if (selectedSire.farmLocation) setFarmLocation(selectedSire.farmLocation);
    }
  }, [selectedSire]);

  useEffect(() => {
    if (selectedDam) {
      if (selectedDam.ownerName) setCowOwner(selectedDam.ownerName);
      if (selectedDam.farmLocation) setFarmLocation(selectedDam.farmLocation);
    }
  }, [selectedDam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!calfName.trim()) {
      setErrorMessage('Please enter the Calf Name / Tag Title.');
      return;
    }
    if (!sireId || !damId) {
      setErrorMessage('Sire Bull and Dam Cow must be selected.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await confirmCalfTransactionAction({
        id: calfId,
        breedingProgramId: sourceType === 'from_program' ? selectedBpId : undefined,
        sireId,
        sireName: selectedSire?.name,
        sireBreed: selectedSire?.breed,
        damId,
        damName: selectedDam?.name,
        damBreed: selectedDam?.breed,
        name: calfName.trim(),
        sex,
        breed,
        birthDate,
        birthWeight,
        color,
        ownerName,
        cowOwner,
        farmLocation,
        breederName,
        imageUrl,
        registrationNumber,
        status: 'Registered to Herdbook'
      });

      setSuccessResult({
        calfId: (res as any).calfId || res.calf?.id || calfId,
        regNumber: registrationNumber,
        certNumber: `KC-${Math.floor(100000 + Math.random() * 900000)}`
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to register calf record');
      setSubmitting(false);
    }
  };

  if (successResult) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200/90 p-8 shadow-xl max-w-2xl mx-auto text-center space-y-5 animate-in fade-in duration-300">
        <div className="h-16 w-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="h-10 w-10 stroke-[2.5]" />
        </div>

        <div>
          <h3 className="text-xl font-black text-slate-900">Calf Registered Successfully!</h3>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Atomic transaction created Calf record + Herdbook Entry + Pedigree Tree + Certificate + Dynamic QR Code.
          </p>
        </div>

        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs font-mono space-y-1 text-slate-700 text-left">
          <p><span className="font-bold text-slate-400">Calf ID:</span> {successResult.calfId}</p>
          <p><span className="font-bold text-slate-400">Herdbook Registration:</span> {successResult.regNumber}</p>
          <p><span className="font-bold text-slate-400">Certificate Number:</span> {successResult.certNumber}</p>
          <p><span className="font-bold text-slate-400">Status:</span> Published & Verified</p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => router.push(`/calves/${successResult.calfId}`)}
            className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-black shadow-md hover:bg-slate-800 transition-all cursor-pointer"
          >
            View Calf Detail
          </button>
          <button
            onClick={() => router.push('/herdbook')}
            className="px-5 py-2.5 rounded-xl bg-amber-600 text-white text-xs font-black shadow-md hover:bg-amber-700 transition-all cursor-pointer"
          >
            View Herdbook
          </button>
          <button
            onClick={() => router.push('/certificates')}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-black shadow-md hover:bg-emerald-700 transition-all cursor-pointer"
          >
            Certificate Center
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xl max-w-4xl mx-auto space-y-6">
      
      {/* SECTION 1 — REGISTRATION SOURCE */}
      <div className="bg-slate-50/90 border border-slate-200/90 rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#dc5c15]" />
          <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Section 1 — Registration Source</h4>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <label className={`flex-1 p-3.5 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-3 ${
            sourceType === 'from_program' ? 'border-[#dc5c15] bg-orange-50/80 shadow-xs' : 'border-slate-200 bg-white'
          }`}>
            <input
              type="radio"
              name="sourceType"
              checked={sourceType === 'from_program'}
              onChange={() => setSourceType('from_program')}
              className="text-[#dc5c15] focus:ring-[#dc5c15] cursor-pointer"
            />
            <div>
              <p className="text-xs font-black text-slate-900">○ From Breeding Program</p>
              <p className="text-[10px] text-slate-500 font-medium">Auto-populates Sire, Dam, Breeder, Owner, and Breed.</p>
            </div>
          </label>

          <label className={`flex-1 p-3.5 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-3 ${
            sourceType === 'standalone' ? 'border-[#dc5c15] bg-orange-50/80 shadow-xs' : 'border-slate-200 bg-white'
          }`}>
            <input
              type="radio"
              name="sourceType"
              checked={sourceType === 'standalone'}
              onChange={() => setSourceType('standalone')}
              className="text-[#dc5c15] focus:ring-[#dc5c15] cursor-pointer"
            />
            <div>
              <p className="text-xs font-black text-slate-900">○ New Calf Registration</p>
              <p className="text-[10px] text-slate-500 font-medium">Manually select Sire Bull & Dam Cow from master database.</p>
            </div>
          </label>
        </div>
      </div>

      {/* SECTION 2 — BREEDING PROGRAM INFORMATION (Visible when from_program) */}
      {sourceType === 'from_program' && (
        <div className="bg-orange-50/60 border border-orange-200/90 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-orange-200/60 pb-2">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-[#dc5c15]" />
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Section 2 — Breeding Program Information</h4>
            </div>
            <span className="text-[9.5px] font-black text-[#dc5c15] bg-orange-100 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Lock className="h-3 w-3" /> Auto-populated from Breeding Program
            </span>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-800">Select Confirmed Breeding Program</label>
            <select
              value={selectedBpId}
              onChange={e => setSelectedBpId(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#dc5c15] focus:outline-none cursor-pointer"
            >
              <option value="">-- Choose Breeding Program --</option>
              {programs.map(p => (
                <option key={p.id} value={p.id}>
                  {p.programNumber || p.id} • Sire: {p.sireName || p.sireId} × Dam: {p.damName || p.damId} ({p.status})
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Inline Error Alert */}
      {errorMessage && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-bold flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* SECTION 3 — CALF IDENTIFICATION */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
          <Baby className="h-4 w-4 text-[#dc5c15]" />
          <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Section 3 — Calf Identification</h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Calf Registration Number <span className="text-slate-400 font-normal">(Auto-Generated)</span></label>
            <input
              type="text"
              value={registrationNumber}
              readOnly
              className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 font-mono font-bold text-slate-700 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Calf System ID <span className="text-slate-400 font-normal">(Auto-Generated)</span></label>
            <input
              type="text"
              value={calfId}
              readOnly
              className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 font-mono font-bold text-slate-700 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Ear Tag Number</label>
            <input
              type="text"
              value={tagNumber}
              onChange={e => setTagNumber(e.target.value)}
              placeholder="e.g. TAG-2026-99"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-[#dc5c15] focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Calf Name / Title <span className="text-rose-500">*</span></label>
            <input
              type="text"
              value={calfName}
              onChange={e => setCalfName(e.target.value)}
              placeholder="e.g. Wagyu Prince 01"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-[#dc5c15] focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Sex <span className="text-rose-500">*</span></label>
            <select
              value={sex}
              onChange={e => setSex(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-[#dc5c15] focus:outline-none"
            >
              <option value="Male">Male Bull Calf</option>
              <option value="Female">Female Heifer Calf</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Date of Birth <span className="text-rose-500">*</span></label>
            <input
              type="date"
              value={birthDate}
              onChange={e => setBirthDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-[#dc5c15] focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Birth Weight (kg)</label>
            <input
              type="number"
              step="0.1"
              value={birthWeight}
              onChange={e => setBirthWeight(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-[#dc5c15] focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Coat Color / Markings</label>
            <input
              type="text"
              value={color}
              onChange={e => setColor(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-[#dc5c15] focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Breed Classification</label>
            <input
              type="text"
              value={breed}
              onChange={e => setBreed(e.target.value)}
              disabled={sourceType === 'from_program'}
              className={`w-full rounded-xl px-3.5 py-2.5 font-bold focus:outline-none ${
                sourceType === 'from_program' ? 'bg-slate-100 border border-slate-200 text-slate-700 cursor-not-allowed' : 'bg-slate-50 border border-slate-200 text-slate-900'
              }`}
            />
          </div>
        </div>
      </div>

      {/* SECTION 4 — PARENTAGE */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <Beef className="h-4 w-4 text-[#dc5c15]" />
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Section 4 — Parentage (Biological Lineage)</h4>
          </div>
          {sourceType === 'from_program' && (
            <span className="text-[9.5px] font-black text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Lock className="h-3 w-3" /> Inherited from Program
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          
          {/* Sire Selection Card */}
          <div className="p-3.5 bg-orange-50/70 border border-orange-200 rounded-2xl space-y-2">
            <label className="block font-black text-[#dc5c15]">SIRE BULL (Father)</label>
            {sourceType === 'standalone' ? (
              <select
                value={sireId}
                onChange={e => setSireId(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#dc5c15] focus:outline-none"
              >
                {sires.map(s => <option key={s.id} value={s.id}>{s.name} ({s.id}) • {s.breed}</option>)}
              </select>
            ) : (
              <p className="font-bold text-slate-900">{selectedSire?.name || sireId} (ID: {sireId})</p>
            )}
            <p className="text-[10.5px] text-slate-600 font-semibold">Breed: {selectedSire?.breed || breed} • Supplier: {selectedSire?.sourcingCompany || 'ABS Global'}</p>
          </div>

          {/* Dam Selection Card */}
          <div className="p-3.5 bg-purple-50/70 border border-purple-200 rounded-2xl space-y-2">
            <label className="block font-black text-purple-700">DAM COW (Mother)</label>
            {sourceType === 'standalone' ? (
              <select
                value={damId}
                onChange={e => setDamId(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#dc5c15] focus:outline-none"
              >
                {dams.map(d => <option key={d.id} value={d.id}>{d.name || d.id} ({d.id}) • {d.breed}</option>)}
              </select>
            ) : (
              <p className="font-bold text-slate-900">{selectedDam?.name || damId} (ID: {damId})</p>
            )}
            <p className="text-[10.5px] text-slate-600 font-semibold">Breed: {selectedDam?.breed || breed} • Availability: {selectedDam?.availability || 'Open'}</p>
          </div>

        </div>
      </div>

      {/* SECTION 5 — OWNERSHIP & SECTION 6 — BREEDING INFO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* SECTION 5 — OWNERSHIP */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 space-y-3 text-xs">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <Building2 className="h-4 w-4 text-emerald-600" />
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Section 5 — Ownership</h4>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Farm Owner</label>
            <input
              type="text"
              value={ownerName}
              onChange={e => setOwnerName(e.target.value)}
              disabled={sourceType === 'from_program'}
              className={`w-full rounded-xl px-3.5 py-2.5 font-bold focus:outline-none ${
                sourceType === 'from_program' ? 'bg-slate-100 border border-slate-200 text-slate-700 cursor-not-allowed' : 'bg-slate-50 border border-slate-200 text-slate-900'
              }`}
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Dam Cow Owner</label>
            <input
              type="text"
              value={cowOwner}
              onChange={e => setCowOwner(e.target.value)}
              disabled={sourceType === 'from_program'}
              className={`w-full rounded-xl px-3.5 py-2.5 font-bold focus:outline-none ${
                sourceType === 'from_program' ? 'bg-slate-100 border border-slate-200 text-slate-700 cursor-not-allowed' : 'bg-slate-50 border border-slate-200 text-slate-900'
              }`}
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Farm Station Location</label>
            <input
              type="text"
              value={farmLocation}
              onChange={e => setFarmLocation(e.target.value)}
              disabled={sourceType === 'from_program'}
              className={`w-full rounded-xl px-3.5 py-2.5 font-bold focus:outline-none ${
                sourceType === 'from_program' ? 'bg-slate-100 border border-slate-200 text-slate-700 cursor-not-allowed' : 'bg-slate-50 border border-slate-200 text-slate-900'
              }`}
            />
          </div>
        </div>

        {/* SECTION 6 — BREEDING INFO */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 space-y-3 text-xs">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <UserCheck className="h-4 w-4 text-[#dc5c15]" />
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Section 6 — Breeding Info</h4>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Assigned Breeder Specialist</label>
            <input
              type="text"
              value={breederName}
              onChange={e => setBreederName(e.target.value)}
              disabled={sourceType === 'from_program'}
              className={`w-full rounded-xl px-3.5 py-2.5 font-bold focus:outline-none ${
                sourceType === 'from_program' ? 'bg-slate-100 border border-slate-200 text-slate-700 cursor-not-allowed' : 'bg-slate-50 border border-slate-200 text-slate-900'
              }`}
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Breeding Service Method</label>
            <input
              type="text"
              value={breedingMethod}
              readOnly
              className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-700 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Insemination / Breeding Date</label>
            <input
              type="date"
              value={breedingDate}
              onChange={e => setBreedingDate(e.target.value)}
              disabled={sourceType === 'from_program'}
              className={`w-full rounded-xl px-3.5 py-2.5 font-bold focus:outline-none ${
                sourceType === 'from_program' ? 'bg-slate-100 border border-slate-200 text-slate-700 cursor-not-allowed' : 'bg-slate-50 border border-slate-200 text-slate-900'
              }`}
            />
          </div>
        </div>

      </div>

      {/* SECTION 7 — CALF IMAGE */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#dc5c15]" />
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Section 7 — Calf Photo Upload</h4>
          </div>
          <span className="text-[10px] font-bold text-slate-400">
            Recommended image: 1:1 square format for best display.
          </span>
        </div>

        <ImageUploadContainer
          value={imageUrl}
          onChange={(url) => setImageUrl(url)}
          aspectRatio="1:1"
          placeholder="Upload or Capture Calf Photo"
        />
      </div>

      {/* SECTION 8 — HERDBOOK & SECTION 9 — CERTIFICATE PREVIEW */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* SECTION 8 — HERDBOOK */}
        <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-amber-600" />
            <h4 className="text-xs font-black text-amber-900 uppercase tracking-wider">Section 8 — Herdbook Status</h4>
          </div>
          <p className="font-bold text-slate-900">Registration Number: {registrationNumber}</p>
          <p className="text-slate-600 font-medium">Status: <span className="font-bold text-emerald-700">Published & Verified</span></p>
        </div>

        {/* SECTION 9 — CERTIFICATE */}
        <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-emerald-600" />
            <h4 className="text-xs font-black text-emerald-900 uppercase tracking-wider">Section 9 — Certificate & Dynamic QR</h4>
          </div>
          <p className="font-bold text-slate-900">A4 Landscape Certificate (PNG Output)</p>
          <p className="text-slate-600 font-medium">Dynamic QR Code Token will be generated automatically.</p>
        </div>

      </div>

      {/* SECTION 10 — REVIEW & CONFIRM */}
      <div className="bg-slate-900 text-white rounded-3xl p-5 space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <h4 className="text-xs font-black text-white uppercase tracking-wider">Section 10 — Review & Final Confirmation</h4>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-300">
          <div>
            <p className="text-[10px] font-bold uppercase text-slate-400">Calf</p>
            <p className="font-black text-white">{calfName || 'Calf Name'} ({sex})</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase text-slate-400">Sire Bull</p>
            <p className="font-black text-white">{selectedSire?.name || sireId}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase text-slate-400">Dam Cow</p>
            <p className="font-black text-white">{selectedDam?.name || damId}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase text-slate-400">Owner & Farm</p>
            <p className="font-black text-white">{ownerName} ({farmLocation})</p>
          </div>
        </div>
      </div>

      {/* FORM ACTIONS */}
      <div className="flex items-center justify-between border-t border-slate-100 pt-4">
        <button
          type="button"
          onClick={() => {
            if (onCancel) onCancel();
            else router.push('/calves');
          }}
          className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={submitting}
          className="px-8 py-3 rounded-2xl bg-[#dc5c15] text-white text-xs font-black shadow-lg shadow-[#dc5c15]/20 hover:bg-[#c44f0e] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <CheckCircle2 className="h-4 w-4 stroke-[3]" />
          <span>{submitting ? 'Confirming Transaction...' : 'Confirm & Register Calf'}</span>
        </button>
      </div>

    </form>
  );
}
