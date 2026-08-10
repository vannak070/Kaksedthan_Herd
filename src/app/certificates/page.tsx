'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/common/PageHeader';
import { HerdbookCertificateItem, SireItem, DamItem, CalfItem } from '@/types/breeding.types';
import { 
  fetchCertificatesAction, 
  fetchSiresAction, 
  fetchDamsAction, 
  fetchCalvesAction,
  applyCertificateAction 
} from '@/app/actions';
import { FileText, Download, Award, ShieldCheck, Plus, X as CloseIcon, Loader2, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CertificatesListPage() {
  const [certs, setCerts] = useState<HerdbookCertificateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [breedFilter, setBreedFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  // Apply Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<'Sire' | 'Dam' | 'Calf'>('Sire');
  const [selectedId, setSelectedId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [sires, setSires] = useState<SireItem[]>([]);
  const [dams, setDams] = useState<DamItem[]>([]);
  const [calves, setCalves] = useState<CalfItem[]>([]);

  const router = useRouter();

  useEffect(() => {
    Promise.all([
      fetchCertificatesAction(),
      fetchSiresAction(),
      fetchDamsAction(),
      fetchCalvesAction()
    ])
      .then(([certData, sireData, damData, calfData]) => {
        setCerts(certData);
        setSires(sireData);
        setDams(damData);
        setCalves(calfData);
        if (sireData.length > 0) setSelectedId(sireData[0].id);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleTypeChange = (type: 'Sire' | 'Dam' | 'Calf') => {
    setSelectedType(type);
    if (type === 'Sire' && sires.length > 0) setSelectedId(sires[0].id);
    if (type === 'Dam' && dams.length > 0) setSelectedId(dams[0].id);
    if (type === 'Calf' && calves.length > 0) setSelectedId(calves[0].id);
  };

  const handleCreateCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) return;

    try {
      setSubmitting(true);
      const newCert = await applyCertificateAction(selectedType, selectedId);
      setSubmitting(false);
      setModalOpen(false);
      if (newCert && newCert.id) {
        router.push(`/certificates/${newCert.id}`);
      } else {
        const refreshed = await fetchCertificatesAction();
        setCerts(refreshed);
      }
    } catch (err) {
      console.error('Failed to create certificate:', err);
      setSubmitting(false);
    }
  };

  const filtered = certs.filter((c) => {
    const matchesSearch =
      c.certificateNumber.toLowerCase().includes(search.toLowerCase()) ||
      c.registrationId.toLowerCase().includes(search.toLowerCase()) ||
      (c.calfName || c.sireName || c.damName || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.ownerName || '').toLowerCase().includes(search.toLowerCase());
    const matchesBreed = breedFilter === 'All' || c.calfBreed === breedFilter || c.sireBreed === breedFilter || c.damBreed === breedFilter;
    const matchesType = typeFilter === 'All' || (c.animalType || (c.calfId ? 'Calf' : c.sireId ? 'Sire' : 'Dam')) === typeFilter;
    return matchesSearch && matchesBreed && matchesType;
  });

  const availableBreeds = Array.from(new Set(certs.map(c => c.calfBreed || c.sireBreed || c.damBreed).filter(Boolean)));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Official Certificate Center"
        subtitle="Review, view, and download official A4 Landscape birth & pedigree certificates for Sires, Dams, and Calves."
        breadcrumbs={[{ label: 'Certificate Center' }]}
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search Cert #, Animal Name, Owner, or Reg ID..."
      >
        <div className="flex items-center gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#047857]"
          >
            <option value="All">All Types</option>
            <option value="Sire">Sire Certificate</option>
            <option value="Dam">Dam Certificate</option>
            <option value="Calf">Calf Certificate</option>
          </select>

          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-1.5 bg-[#047857] hover:bg-emerald-700 text-white text-xs sm:text-sm font-black px-4 py-2 rounded-xl transition-all shadow-md cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Apply Certificate</span>
          </button>
        </div>
      </PageHeader>

      {/* Overview Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3 shadow-2xs">
          <div className="h-10 w-10 bg-emerald-50 rounded-xl flex items-center justify-center text-[#047857]">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Total Certificates</p>
            <p className="text-xl font-black text-slate-900">{certs.length} Issued Records</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3 shadow-2xs">
          <div className="h-10 w-10 bg-sky-50 rounded-xl flex items-center justify-center text-sky-700">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Certificate Scope</p>
            <p className="text-sm font-black text-slate-900">Sire • Dam • Calf Verified</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3 shadow-2xs">
          <div className="h-10 w-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-700">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Verification Standard</p>
            <p className="text-sm font-black text-slate-900">PostgreSQL Verified QR Pass</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin h-8 w-8 border-4 border-[#047857] border-t-transparent rounded-full" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center my-6">
          <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Certificates Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Click "Apply Certificate" above to issue an official Sire, Dam, or Calf Certificate from master records.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((cert) => {
            const certType = cert.animalType || (cert.calfId ? 'Calf' : cert.sireId ? 'Sire' : 'Dam');
            const animalTitle = certType === 'Sire' ? (cert.sireName || cert.sireId) : certType === 'Dam' ? (cert.damName || cert.damId) : (cert.calfName || cert.calfId || 'Calf Record');
            const animalBreed = certType === 'Sire' ? (cert.sireBreed || 'Brahman') : certType === 'Dam' ? (cert.damBreed || 'Wagyu') : (cert.calfBreed || 'Wagyu');

            return (
              <Link
                key={cert.id}
                href={`/certificates/${cert.id}`}
                className="group bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-[#047857] transition-all p-5 flex flex-col justify-between cursor-pointer"
              >
                <div>
                  {/* Cert Header */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-[#047857]" />
                      <div>
                        <span className="text-[9px] font-black text-[#047857] uppercase tracking-widest">CERTIFICATE NO</span>
                        <h3 className="text-sm font-black text-slate-900 group-hover:text-[#047857] transition-colors">
                          {cert.certificateNumber}
                        </h3>
                      </div>
                    </div>
                    <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase border ${
                      certType === 'Sire' ? 'bg-amber-50 text-amber-800 border-amber-200' : certType === 'Dam' ? 'bg-purple-50 text-purple-800 border-purple-200' : 'bg-emerald-50 text-[#047857] border-emerald-200'
                    }`}>
                      {certType} CERTIFICATE
                    </span>
                  </div>

                  {/* Cert Details */}
                  <div className="space-y-2 text-xs text-slate-600 my-4 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100">
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">{certType} Name:</span>
                      <span className="font-black text-[#047857]">{animalTitle}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">Breed:</span>
                      <span className="font-bold text-slate-900">{animalBreed}</span>
                    </div>
                    {certType === 'Calf' && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-slate-400 font-medium">Sire:</span>
                          <span className="font-bold text-slate-800">{cert.sireName || 'Sire master'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400 font-medium">Dam:</span>
                          <span className="font-bold text-slate-800">{cert.damName || 'Dam master'}</span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">Reg No:</span>
                      <span className="font-bold text-slate-800">{cert.registrationNumber || cert.registrationId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">Issue Date:</span>
                      <span className="font-bold text-slate-800">{String(cert.issueDate).substring(0, 10)}</span>
                    </div>
                  </div>
                </div>

                {/* Action Link Footer */}
                <div className="pt-2 flex items-center justify-between text-xs font-bold text-[#047857] border-t border-slate-100">
                  <span>View Official Certificate</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* APPLY CERTIFICATE MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-[#047857]" />
                <h3 className="text-base font-black text-slate-900">Apply New Certificate</h3>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCertificate} className="space-y-4 text-xs">
              {/* Step 1: Select Animal Type */}
              <div className="space-y-1.5">
                <label className="block font-black text-slate-700 uppercase tracking-wider">1. Select Certificate Subject Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Sire', 'Dam', 'Calf'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => handleTypeChange(t)}
                      className={`py-2 px-3 rounded-xl font-extrabold border transition-all cursor-pointer ${
                        selectedType === t
                          ? 'bg-[#047857] text-white border-[#047857] shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {t} Certificate
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Select Animal from Master */}
              <div className="space-y-1.5">
                <label className="block font-black text-slate-700 uppercase tracking-wider">
                  2. Select Registered {selectedType} Master Record
                </label>
                {selectedType === 'Sire' ? (
                  <select
                    value={selectedId}
                    onChange={(e) => setSelectedId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 font-bold rounded-xl p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#047857]"
                  >
                    {sires.map((s) => (
                      <option key={s.id} value={s.id}>{s.name} ({s.id}) • {s.breed}</option>
                    ))}
                  </select>
                ) : selectedType === 'Dam' ? (
                  <select
                    value={selectedId}
                    onChange={(e) => setSelectedId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 font-bold rounded-xl p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#047857]"
                  >
                    {dams.map((d) => (
                      <option key={d.id} value={d.id}>{d.name || d.id} ({d.id}) • {d.breed}</option>
                    ))}
                  </select>
                ) : (
                  <select
                    value={selectedId}
                    onChange={(e) => setSelectedId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 font-bold rounded-xl p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#047857]"
                  >
                    {calves.map((c) => (
                      <option key={c.id} value={c.id}>{c.name || c.id} ({c.id}) • {c.breed}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Info Note */}
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-[11px] font-medium leading-relaxed">
                Certificate will automatically retrieve verified master info (breed, DOB, photos, owner location) from PostgreSQL database.
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !selectedId}
                  className="inline-flex items-center gap-1.5 bg-[#047857] hover:bg-emerald-700 text-white text-xs font-black px-4 py-2 rounded-xl transition-all shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Award className="h-4 w-4" />}
                  <span>Issue {selectedType} Certificate</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
