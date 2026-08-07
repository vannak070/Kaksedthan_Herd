'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Award, 
  ExternalLink, 
  Globe, 
  ArrowLeft, 
  Dna, 
  Maximize2, 
  X,
  AlertCircle,
  Phone,
  Mail,
  Building2,
  Package,
  DollarSign,
  Info,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';

interface PublicStockData {
  id: string;
  name: string;
  code: string;
  breed: string;
  production: string;
  color: string;
  dob: string | null;
  fromCountry: string;
  weight: string | null;
  height: string | null;
  imageUrl: string;
  galleryImages?: string[];
  availabilityStatus: 'Available' | 'Low Stock' | 'Out of Stock' | string;
  stockQuantity?: number;
  unit?: string;
  price?: number | null;
  currency?: string;
  damName: string | null;
  damBreed: string | null;
  sireName: string | null;
  sireBreed: string | null;
  category: string;
  description?: string | null;
  verificationCode: string;
  contact?: {
    companyName: string;
    phone: string;
    email: string;
    website: string;
  };
}

export default function PublicStockPage() {
  const params = useParams();
  const rawId = params?.id as string;

  const [data, setData] = useState<PublicStockData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Gallery & Lightbox states
  const [activeImage, setActiveImage] = useState<string>('');
  const [lightboxOpen, setLightboxOpen] = useState<boolean>(false);

  const fallbackImage = 'https://images.unsplash.com/photo-1546445317-29f4545f9d52?auto=format&fit=crop&w=800&q=80';

  useEffect(() => {
    if (!rawId) return;

    const controller = new AbortController();
    async function fetchPublicData() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/v1/public/stock/${encodeURIComponent(rawId)}`, {
          signal: controller.signal
        });

        if (!res.ok) {
          if (res.status === 404) {
            setError('RECORD_NOT_FOUND');
          } else {
            setError('FAILED_TO_LOAD');
          }
          setLoading(false);
          return;
        }

        const json = await res.json();
        if (json.success && json.data) {
          setData(json.data);
          setActiveImage(json.data.imageUrl || fallbackImage);
        } else {
          setError('RECORD_NOT_FOUND');
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Public fetch error:', err);
          setError('FAILED_TO_LOAD');
        }
      } finally {
        setLoading(false);
      }
    }

    fetchPublicData();
    return () => controller.abort();
  }, [rawId]);

  // ── SKELETON LOADING STATE ──
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-2xl font-black mb-4 animate-bounce">
          🌾
        </div>
        <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-slate-300 font-bold text-base">KAKSEDTHAN Public Registry</p>
        <p className="text-slate-500 font-medium text-xs mt-1">Verifying digital pedigree record...</p>
      </div>
    );
  }

  // ── 404 ERROR PAGE (BRANDED) ──
  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
        {/* Header */}
        <header className="bg-slate-900/90 border-b border-slate-800 px-6 py-4">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black text-xl">
                🌾
              </div>
              <span className="text-base font-extrabold text-white tracking-tight">
                KAKSEDTHAN <span className="text-emerald-400 font-semibold">Livestock</span>
              </span>
            </div>
          </div>
        </header>

        {/* Branded 404 Hero Container */}
        <main className="max-w-md w-full mx-auto px-6 py-12 text-center">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl flex items-center justify-center mx-auto mb-5 text-emerald-400 text-3xl">
              🐂
            </div>
            <h1 className="text-xl font-black text-white mb-2">The livestock record could not be found</h1>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              The record ID <span className="font-mono text-emerald-400 font-bold">{rawId}</span> does not exist or may have been updated in the registry.
            </p>
            <a
              href="/"
              className="inline-flex items-center justify-center gap-2 w-full px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-sm shadow-lg shadow-emerald-900/30 transition-all"
            >
              <ArrowLeft className="w-4 h-4" /> Return to KAKSEDTHAN Home
            </a>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-900 text-center py-6 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} KAKSEDTHAN Livestock Management System. All rights reserved.</p>
        </footer>
      </div>
    );
  }

  // Determine Status Badge Colors
  const statusUpper = (data.availabilityStatus || 'Available').toUpperCase();
  let statusBg = 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400';
  let statusDot = 'bg-emerald-400';

  if (statusUpper.includes('LOW')) {
    statusBg = 'bg-amber-500/15 border-amber-500/30 text-amber-400';
    statusDot = 'bg-amber-400';
  } else if (statusUpper.includes('OUT')) {
    statusBg = 'bg-red-500/15 border-red-500/30 text-red-400';
    statusDot = 'bg-red-400';
  }

  const galleryList = data.galleryImages && data.galleryImages.length > 0
    ? data.galleryImages
    : [activeImage];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-20 selection:bg-emerald-500 selection:text-white">

      {/* ── 1. BRANDED PUBLIC HEADER ── */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 py-3.5 shadow-md">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black text-xl shadow-inner">
              🌾
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-extrabold text-white tracking-tight leading-tight">
                KAKSEDTHAN <span className="text-emerald-400 font-bold">Livestock</span>
              </h1>
              <p className="text-[11px] text-slate-400 font-medium">Public Livestock Information Portal</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold shadow-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Verified Record
            </span>
          </div>
        </div>
      </header>

      {/* ── 2. HERO SECTION ── */}
      <section className="bg-slate-900/60 border-b border-slate-800/80 px-4 sm:px-8 py-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Official Pedigree Record
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-xs font-mono text-slate-400">Code: {data.code}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
              {data.name}
            </h2>
            <p className="text-sm font-semibold text-emerald-400 mt-0.5">
              {data.breed} {data.production ? `• ${data.production}` : ''}
            </p>
          </div>

          {/* Availability Status Badge */}
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl border text-sm font-bold shadow-md ${statusBg}`}>
              <span className={`w-2.5 h-2.5 rounded-full animate-pulse ${statusDot}`} />
              {data.availabilityStatus}
            </span>
          </div>
        </div>
      </section>

      {/* ── 3. MAIN CONTENT (2-COLUMN RESPONSIVE LAYOUT) ── */}
      <main className="max-w-5xl mx-auto px-4 sm:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* ── LEFT COLUMN: LARGE FEATURED GALLERY (lg:col-span-5) ── */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            
            {/* Featured Image Box with Lightbox Trigger */}
            <div className="bg-slate-900 rounded-3xl border border-slate-800 p-3 shadow-xl group relative overflow-hidden">
              <div 
                onClick={() => setLightboxOpen(true)}
                className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-slate-950 cursor-pointer border border-slate-800/80"
                title="Tap to view full resolution photo"
              >
                {/* Blurred backdrop to eliminate cropping letterboxing */}
                <img
                  src={activeImage}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 w-full h-full object-cover blur-xl opacity-45 scale-110"
                  onError={(e) => { (e.target as HTMLImageElement).src = fallbackImage; }}
                />

                {/* Primary High-Res Photo */}
                <img
                  src={activeImage}
                  alt={data.name}
                  className="relative z-10 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => { (e.target as HTMLImageElement).src = fallbackImage; }}
                />

                {/* Tap to enlarge hint */}
                <div className="absolute top-3 right-3 z-20 bg-slate-900/80 backdrop-blur-md border border-slate-700/80 text-white text-[11px] font-bold px-2.5 py-1 rounded-xl flex items-center gap-1 shadow-md">
                  <Maximize2 className="w-3.5 h-3.5 text-emerald-400" /> Tap to Enlarge
                </div>
              </div>

              {/* Thumbnail Selector Gallery */}
              {galleryList.length > 1 && (
                <div className="flex items-center gap-2 mt-3 px-1 overflow-x-auto pb-1">
                  {galleryList.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(img)}
                      className={`w-14 h-14 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                        activeImage === img ? 'border-emerald-400 scale-105 shadow-md' : 'border-slate-800 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Authenticity Verification Card */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-lg flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3 shadow-inner">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-extrabold text-white mb-1">Authenticity Verification Stamp</h3>
              <p className="text-xs text-slate-400 font-mono mb-3">{data.verificationCode}</p>
              <div className="inline-flex items-center gap-2 text-emerald-400 text-xs font-bold bg-emerald-950/60 border border-emerald-800/50 px-3.5 py-1.5 rounded-xl shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Certified by KAKSEDTHAN System
              </div>
            </div>

          </div>

          {/* ── RIGHT COLUMN: STRUCTURED INFORMATION CARDS (lg:col-span-7) ── */}
          <div className="lg:col-span-7 flex flex-col gap-6">

            {/* CARD 1: Basic Information */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl hover:border-slate-700/80 transition-all">
              <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-slate-800 text-emerald-400 font-extrabold text-sm">
                <Info className="w-4 h-4" /> <span>Basic Information</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold">Stock Name</p>
                  <p className="text-sm font-extrabold text-white mt-1">{data.name}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold">Breed</p>
                  <p className="text-sm font-extrabold text-emerald-400 mt-1">{data.breed}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold">Category</p>
                  <span className="inline-block mt-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400">
                    {data.production}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold">Stock Code</p>
                  <p className="text-xs font-bold text-slate-200 font-mono mt-1">{data.code}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold">QR Verification ID</p>
                  <p className="text-xs font-bold text-slate-300 font-mono mt-1">{data.id}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold">Origin Country</p>
                  <p className="text-xs font-bold text-slate-200 mt-1">🌍 {data.fromCountry}</p>
                </div>
                {data.color && (
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold">Color / Coat</p>
                    <p className="text-xs font-bold text-slate-200 mt-1">{data.color}</p>
                  </div>
                )}
                {data.dob && (
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold">Date of Birth</p>
                    <p className="text-xs font-bold text-slate-200 mt-1">
                      {new Date(data.dob).toLocaleDateString('en-GB')}
                    </p>
                  </div>
                )}
                {data.weight && (
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold">Weight</p>
                    <p className="text-xs font-bold text-slate-200 mt-1">{data.weight}</p>
                  </div>
                )}
              </div>
            </div>

            {/* CARD 2: Availability & Pricing */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl hover:border-slate-700/80 transition-all">
              <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-slate-800 text-emerald-400 font-extrabold text-sm">
                <Package className="w-4 h-4" /> <span>Availability & Pricing</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 text-center">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold">Status</p>
                  <p className="text-sm font-black text-emerald-400 mt-1">{data.availabilityStatus}</p>
                </div>
                
                {data.stockQuantity !== undefined && (
                  <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 text-center">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold">Available Quantity</p>
                    <p className="text-base font-black text-white mt-1">
                      {data.stockQuantity} <span className="text-xs text-slate-400 font-normal">{data.unit || 'Units'}</span>
                    </p>
                  </div>
                )}

                {data.price && (
                  <div className="bg-emerald-950/30 border border-emerald-800/40 rounded-2xl p-3.5 text-center">
                    <p className="text-[10px] text-emerald-400 uppercase tracking-wider font-extrabold">Selling Price</p>
                    <p className="text-lg font-black text-emerald-400 mt-0.5">
                      ${data.price} <span className="text-xs text-emerald-300/80 font-normal">/ {data.unit || 'Unit'}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* CARD 3: Pedigree Lineage */}
            {(data.damName || data.sireName) && (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl hover:border-slate-700/80 transition-all">
                <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-slate-800 text-emerald-400 font-extrabold text-sm">
                  <Dna className="w-4 h-4" /> <span>Pedigree Lineage (Parents)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {data.damName && (
                    <div className="bg-pink-950/20 border border-pink-900/30 rounded-2xl p-4">
                      <span className="text-[10px] font-extrabold text-pink-400 uppercase tracking-wider">🐄 Dam Cow (Mother)</span>
                      <p className="text-base font-black text-pink-200 mt-1">{data.damName}</p>
                      {data.damBreed && (
                        <p className="text-xs text-pink-300/80 mt-0.5">Breed: <strong className="text-pink-200">{data.damBreed}</strong></p>
                      )}
                    </div>
                  )}

                  {data.sireName && (
                    <div className="bg-sky-950/20 border border-sky-900/30 rounded-2xl p-4">
                      <span className="text-[10px] font-extrabold text-sky-400 uppercase tracking-wider">🐂 Sire Bull (Father)</span>
                      <p className="text-base font-black text-sky-200 mt-1">{data.sireName}</p>
                      {data.sireBreed && (
                        <p className="text-xs text-sky-300/80 mt-0.5">Breed: <strong className="text-sky-200">{data.sireBreed}</strong></p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* CARD 4: Description (Only shown if description exists!) */}
            {data.description && (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl hover:border-slate-700/80 transition-all">
                <div className="flex items-center gap-2.5 pb-3 mb-3 border-b border-slate-800 text-emerald-400 font-extrabold text-sm">
                  <Info className="w-4 h-4" /> <span>Description & Genetics Overview</span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">{data.description}</p>
              </div>
            )}

            {/* CARD 5: Contact Information */}
            {data.contact && (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl hover:border-slate-700/80 transition-all">
                <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-slate-800 text-emerald-400 font-extrabold text-sm">
                  <Building2 className="w-4 h-4" /> <span>Contact & Facility Information</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 bg-slate-950/70 border border-slate-800 p-3.5 rounded-2xl">
                    <Building2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-400 font-extrabold uppercase">Company / Facility</p>
                      <p className="text-xs font-bold text-white mt-0.5">{data.contact.companyName}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-slate-950/70 border border-slate-800 p-3.5 rounded-2xl">
                    <Phone className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-400 font-extrabold uppercase">Phone Contact</p>
                      <a href={`tel:${data.contact.phone}`} className="text-xs font-bold text-emerald-400 hover:underline mt-0.5 block">
                        {data.contact.phone}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-slate-950/70 border border-slate-800 p-3.5 rounded-2xl">
                    <Mail className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-400 font-extrabold uppercase">Email Support</p>
                      <a href={`mailto:${data.contact.email}`} className="text-xs font-bold text-emerald-400 hover:underline mt-0.5 block">
                        {data.contact.email}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-slate-950/70 border border-slate-800 p-3.5 rounded-2xl">
                    <Globe className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-400 font-extrabold uppercase">Official Website</p>
                      <a href={data.contact.website} target="_blank" rel="noreferrer" className="text-xs font-bold text-emerald-400 hover:underline mt-0.5 block">
                        {data.contact.website.replace('https://', '')}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>

      {/* ── 4. LIGHTBOX OVERLAY ── */}
      {lightboxOpen && (
        <div
          onClick={() => setLightboxOpen(false)}
          className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out animate-in fade-in duration-200"
        >
          <img
            src={activeImage}
            alt={data.name}
            className="max-w-[92vw] max-h-[90vh] object-contain rounded-2xl border border-slate-800 shadow-2xl"
            onClick={e => e.stopPropagation()}
            onError={(e) => { (e.target as HTMLImageElement).src = fallbackImage; }}
          />
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-5 right-6 w-11 h-11 rounded-full bg-slate-800/80 hover:bg-slate-700 text-white flex items-center justify-center text-xl transition-all shadow-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* ── 5. BRANDED PUBLIC FOOTER ── */}
      <footer className="mt-20 border-t border-slate-900 bg-slate-950/80 py-10 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-xl font-black">
              🌾
            </div>
            <div>
              <p className="text-sm font-extrabold text-white">KAKSEDTHAN Livestock Management System</p>
              <p className="text-xs text-slate-500 mt-0.5">Official Verified Public Pedigree & Lineage Portal</p>
            </div>
          </div>

          <div className="text-xs text-slate-500">
            <p>© {new Date().getFullYear()} KAKSEDTHAN ERP. All rights reserved.</p>
            <p className="text-[11px] text-slate-600 mt-1">Powered by KAKSEDTHAN Livestock Management System</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
