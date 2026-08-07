import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import QrCodeCard from '../common/QrCodeCard';
import { downloadCalfCertificatePng } from '@/lib/utils/certificate-downloader';

export default function AnimalProfileDetailPage({
  item,
  onBack,
  onViewCertificate,
  stockList = [],
  semenList = []
}: {
  item: { type: 'semen' | 'dam' | 'calf' | 'breeding'; data: any };
  onBack: () => void;
  onViewCertificate?: (calfId: string) => void;
  stockList?: any[];
  semenList?: any[];
}) {
  const [detailData, setDetailData] = useState<any>(item.data || null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'timeline' | 'attachments' | 'audit'>('profile');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [downloadingCert, setDownloadingCert] = useState(false);

  const recordId = item.data?.id || item.data?.code || item.data?.tagId || item.data?.no;
  const recordType = item.type;

  // Clear state and fetch live record with AbortController signal
  useEffect(() => {
    setDetailData(item.data || null);
    setError(null);
    setLoading(true);

    const controller = new AbortController();
    let isMounted = true;

    async function fetchLiveRecord() {
      try {
        if (!recordId) {
          if (isMounted) setLoading(false);
          return;
        }

        const moduleName = recordType === 'breeding' ? 'breeding' : 'stock';
        const res = await fetch(`/api/v1/modules/${moduleName}/${encodeURIComponent(recordId)}`, {
          signal: controller.signal
        });

        if (res.ok) {
          const json = await res.json();
          if (isMounted && json.data) {
            setDetailData((prev: any) => ({ ...prev, ...json.data }));
          }
        }
      } catch (err: any) {
        if (err.name !== 'AbortError' && isMounted) {
          console.warn('Live detail fetch fallback:', err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchLiveRecord();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [recordId, recordType]);

  const data = detailData || item.data || {};

  const name = data.name || data.calfName || data.bullName || (data.damId ? `Dam: ${data.damId}` : `Record #${data.id || 'N/A'}`);
  const code = data.code || data.tagId || data.no || data.certNo || data.id || 'N/A';
  const breed = data.breed || data.targetBreed || data.damBreed || 'Brahman / Cross-breed';
  
  const rawSex = data.sex || (item.type === 'semen' ? 'Male' : item.type === 'dam' ? 'Female' : 'Female');
  const sex = rawSex === 'Female' ? 'Female (Dam)' : rawSex === 'Male' ? 'Male (Sire)' : String(rawSex);

  const color = data.color || 'Red / Deep Brown';
  const status = data.currentStatus || data.status || data.pregnancyStatus || data.production || 'Active';
  const dob = data.dob || (data.matingDate ? new Date(data.matingDate).toLocaleDateString('en-GB') : 'N/A');
  const placeOfBirth = data.placeOfBirth || data.location || data.farmLocation || 'SNR Farm Facility';
  
  const weight = data.weight || data.birthWeightKg || data.currentWeight || 'N/A';
  const height = data.height || data.heightCm || 'N/A';
  
  let age = data.age || 'N/A';
  if (data.dob) {
    const diffMs = Date.now() - new Date(data.dob).getTime();
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (days > 0) age = `${days} Days (${(days / 30.5).toFixed(1)} Months)`;
  }

  const imageUrl = data.imageUrl || data.image_url || 'https://images.unsplash.com/photo-1546445317-29f4545f9d52?auto=format&fit=crop&w=800&q=80';

  const sireName = data.sireName || data.sireId || 'Standard Sire Bull';
  const sireBreed = data.sireBreed || breed;
  const damName = data.damName || data.damId || 'Standard Dam Cow';
  const damBreed = data.damBreed || 'Local / Cross';

  const damRecord = stockList.find((s: any) => String(s.tagId) === String(data.damId) || String(s.id) === String(data.damId) || String(s.no) === String(data.damId));
  const damImg = data.damImageUrl || damRecord?.imageUrl || imageUrl;

  const sireRecord = semenList.find((b: any) => String(b.id) === String(data.sireId) || String(b.code) === String(data.sireId) || String(b.name) === String(data.sireId));
  const sireImg = data.sireImageUrl || sireRecord?.imageUrl || 'https://images.unsplash.com/photo-1546445317-29f4545f9d52?auto=format&fit=crop&w=400&q=80';

  const cowOwner = data.cowOwner || data.ownerName || data.fromCountry || 'SNR Farm';
  const breeder = data.breederName || data.technician || 'Veterinarian';
  const matingDate = data.matingDate;
  const checkupDate = data.checkupDate;
  const expectedBirthdate = data.expectedBirthdate || data.expectedCalvingDate;
  const notes = data.notes;

  const handleInstantCertDownload = async () => {
    if (downloadingCert) return;
    try {
      setDownloadingCert(true);
      const res = await downloadCalfCertificatePng({
        certNo: data.certNo,
        code: data.tagId || code,
        tagId: data.tagId || code,
        calfName: name,
        sex: data.sex,
        breed: breed,
        color: color,
        dob: dob ? new Date(dob).toLocaleDateString('en-GB') : undefined,
        birthWeight: weight,
        status: status,
        farmName: data.farmName || placeOfBirth,
        provinceDistrict: data.provinceDistrict,
        sireName: sireName,
        sireCode: data.sireId || 'BULL-01',
        sireBreed: sireBreed,
        damName: damName,
        damCode: data.damId || 'DAM-01',
        damBreed: damBreed,
        breedingRecordId: data.breedingRecordId,
        registrationDate: data.dateOfRegistration,
        imageUrl: imageUrl
      });

      if (!res.success) {
        alert(`Certificate Download Error: ${res.error}`);
      }
    } catch (err: any) {
      console.error('Instant certificate download error:', err);
      alert('Failed to generate PNG certificate. Please try again.');
    } finally {
      setDownloadingCert(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onBack();
      }}
    >
      <div
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-6xl max-h-[92vh] overflow-y-auto p-5 sm:p-6 relative text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar inside Popup Modal */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', background: '#F8FAFC', padding: '12px 20px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
          <button
            onClick={onBack}
            style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '8px 16px', fontSize: '13px', fontWeight: 700, color: '#334155', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            className="hover:bg-slate-100 transition-all"
          >
            ← Back to Listing (Close)
          </button>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              {item.type === 'calf' ? 'Calf Profile & Pedigree' :
               item.type === 'semen' ? 'Sire Bull Profile & Semen Registry' :
               item.type === 'dam' ? 'Dam Cow Profile' :
               'Breeding Record & Lineage Detail'}
            </h1>
            <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0' }}>{name} • {code}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, padding: '4px 12px', borderRadius: '999px', background: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A' }}>
              ✨ {status}
            </span>
            <button
              onClick={onBack}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              title="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Main Clean Structured Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* DEDICATED SIRE BULL PROFILE VIEW (when item.type === 'semen') */}
          {item.type === 'semen' ? (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '20px', alignItems: 'start' }}>

              {/* ── LEFT COLUMN ── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                {/* Large Image with Lightbox */}
                <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #E2E8F0', padding: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                  <div
                    onClick={() => setLightboxOpen(true)}
                    style={{ position: 'relative', width: '100%', aspectRatio: '4 / 3', borderRadius: '12px', overflow: 'hidden', background: '#0F172A', cursor: 'pointer', border: '1px solid #E2E8F0' }}
                    title="Click to enlarge"
                  >
                    {/* Blurred backdrop */}
                    <img src={imageUrl} alt="" aria-hidden style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(16px)', opacity: 0.5, transform: 'scale(1.15)' }} />
                    {/* Main photo */}
                    <img
                      src={imageUrl}
                      alt={name}
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', zIndex: 1 }}
                    />
                    {/* Enlarge hint */}
                    <div style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 2, background: 'rgba(0,0,0,0.55)', borderRadius: '6px', padding: '4px 8px', fontSize: '10px', color: 'white', backdropFilter: 'blur(4px)' }}>
                      🔍 Tap to enlarge
                    </div>
                  </div>
                  {/* Name & Code below image */}
                  <div style={{ marginTop: '12px', paddingBottom: '4px' }}>
                    <p style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: 0 }}>{name}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#16a34a' }}>{breed}</span>
                      <span style={{ color: '#CBD5E1' }}>•</span>
                      <span style={{ fontSize: '11px', color: '#94A3B8', fontFamily: 'monospace' }}>{code}</span>
                    </div>
                  </div>
                </div>

                {/* Key Stats Row */}
                <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', textAlign: 'center' }}>
                    <div style={{ background: '#F0FDF4', borderRadius: '12px', padding: '10px 6px', border: '1px solid #BBF7D0' }}>
                      <p style={{ fontSize: '20px', fontWeight: 900, color: '#16a34a', margin: 0 }}>{data.stockQuantity ?? 150}</p>
                      <p style={{ fontSize: '9px', color: '#166534', fontWeight: 700, margin: '2px 0 0', textTransform: 'uppercase' }}>Straws</p>
                    </div>
                    <div style={{ background: '#EFF6FF', borderRadius: '12px', padding: '10px 6px', border: '1px solid #BFDBFE' }}>
                      <p style={{ fontSize: '11px', fontWeight: 800, color: '#1D4ED8', margin: 0 }}>{data.production === 'Frozen Semen' ? '🧬 Frozen' : '🔬 Embryo'}</p>
                      <p style={{ fontSize: '9px', color: '#1E40AF', fontWeight: 700, margin: '2px 0 0', textTransform: 'uppercase' }}>Type</p>
                    </div>
                    <div style={{ background: '#FFF7ED', borderRadius: '12px', padding: '10px 6px', border: '1px solid #FED7AA' }}>
                      <p style={{ fontSize: '11px', fontWeight: 800, color: '#C2410C', margin: 0, lineHeight: 1.2 }}>{(data.fromCountry || 'USA').replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '').trim()}</p>
                      <p style={{ fontSize: '9px', color: '#9A3412', fontWeight: 700, margin: '2px 0 0', textTransform: 'uppercase' }}>Origin</p>
                    </div>
                  </div>
                </div>

                {/* Dynamic QR Code Card with Public Route & LAN IP Support */}
                <QrCodeCard path={`/public/stock/${code}`} title="📱 Public Sire Pedigree QR Code" />

              </div>{/* end LEFT */}

              {/* ── RIGHT COLUMN ── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                {/* Card 1: Basic Information */}
                <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                  <h3 style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', margin: '0 0 14px', borderBottom: '1px solid #F1F5F9', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    🐂 Basic Information
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px 20px' }}>
                    <div>
                      <p style={{ fontSize: '10px', color: '#94A3B8', margin: 0, fontWeight: 700, textTransform: 'uppercase' }}>Stock Name</p>
                      <p style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', margin: '3px 0 0' }}>{name}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '10px', color: '#94A3B8', margin: 0, fontWeight: 700, textTransform: 'uppercase' }}>Breed</p>
                      <p style={{ fontSize: '14px', fontWeight: 800, color: '#16a34a', margin: '3px 0 0' }}>{breed}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '10px', color: '#94A3B8', margin: 0, fontWeight: 700, textTransform: 'uppercase' }}>Production Type</p>
                      <span style={{ display: 'inline-block', marginTop: '3px', fontSize: '12px', fontWeight: 700, padding: '3px 10px', borderRadius: '999px', background: data.production === 'Frozen Semen' ? '#EFF6FF' : '#F0FDF4', color: data.production === 'Frozen Semen' ? '#1D4ED8' : '#15803D', border: `1px solid ${data.production === 'Frozen Semen' ? '#BFDBFE' : '#BBF7D0'}` }}>
                        {data.production === 'Frozen Semen' ? '🧬 Frozen Semen' : '🔬 Embryos'}
                      </span>
                    </div>
                    <div>
                      <p style={{ fontSize: '10px', color: '#94A3B8', margin: 0, fontWeight: 700, textTransform: 'uppercase' }}>Register Code</p>
                      <p style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', margin: '3px 0 0', fontFamily: 'monospace' }}>{code}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '10px', color: '#94A3B8', margin: 0, fontWeight: 700, textTransform: 'uppercase' }}>Color / Coat</p>
                      <p style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', margin: '3px 0 0' }}>{color}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '10px', color: '#94A3B8', margin: 0, fontWeight: 700, textTransform: 'uppercase' }}>Date of Birth</p>
                      <p style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', margin: '3px 0 0' }}>
                        {data.dob ? new Date(data.dob).toLocaleDateString('en-GB') : '—'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card 2: Inventory & Stock */}
                <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                  <h3 style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', margin: '0 0 14px', borderBottom: '1px solid #F1F5F9', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    🧪 Inventory & Stock
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px' }}>
                    <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
                      <p style={{ fontSize: '26px', fontWeight: 900, color: '#16a34a', margin: 0 }}>{data.stockQuantity ?? 150}</p>
                      <p style={{ fontSize: '10px', color: '#166534', fontWeight: 700, margin: '2px 0 0', textTransform: 'uppercase' }}>Available Straws</p>
                    </div>
                    <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
                      <p style={{ fontSize: '26px', fontWeight: 900, color: '#475569', margin: 0 }}>0</p>
                      <p style={{ fontSize: '10px', color: '#64748B', fontWeight: 700, margin: '2px 0 0', textTransform: 'uppercase' }}>Reserved</p>
                    </div>
                    <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
                      <p style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', margin: 0 }}>{data.tankStorageId || 'Tank 01'}</p>
                      <p style={{ fontSize: '10px', color: '#64748B', fontWeight: 700, margin: '2px 0 0', textTransform: 'uppercase' }}>Storage Tank</p>
                    </div>
                    <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
                      <p style={{ fontSize: '14px', fontWeight: 800, color: '#C2410C', margin: 0 }}>
                        {data.pricePerStraw ? `$${data.pricePerStraw}` : '—'}
                      </p>
                      <p style={{ fontSize: '10px', color: '#9A3412', fontWeight: 700, margin: '2px 0 0', textTransform: 'uppercase' }}>Price / Straw</p>
                    </div>
                  </div>
                </div>

                {/* Card 3: Sourcing & Origin */}
                <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                  <h3 style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', margin: '0 0 14px', borderBottom: '1px solid #F1F5F9', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    🌐 Sourcing & Origin
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 20px' }}>
                    <div>
                      <p style={{ fontSize: '10px', color: '#94A3B8', margin: 0, fontWeight: 700, textTransform: 'uppercase' }}>Country of Origin</p>
                      <div style={{ marginTop: '4px', display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 12px', borderRadius: '8px', background: '#EFF6FF', color: '#1D4ED8', fontWeight: 700, fontSize: '12px', border: '1px solid #BFDBFE' }}>
                        🌍 {data.fromCountry || '—'}
                      </div>
                    </div>
                    <div>
                      <p style={{ fontSize: '10px', color: '#94A3B8', margin: 0, fontWeight: 700, textTransform: 'uppercase' }}>Sourcing Company</p>
                      <div style={{ marginTop: '4px', display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 12px', borderRadius: '8px', background: '#F0FDF4', color: '#15803D', fontWeight: 700, fontSize: '12px', border: '1px solid #BBF7D0' }}>
                        🏢 {data.sourcingCompanies?.[0] || '—'}
                      </div>
                    </div>
                    <div>
                      <p style={{ fontSize: '10px', color: '#94A3B8', margin: 0, fontWeight: 700, textTransform: 'uppercase' }}>Weight</p>
                      <p style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', margin: '3px 0 0' }}>{data.weight ? `${data.weight} kg` : '—'}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '10px', color: '#94A3B8', margin: 0, fontWeight: 700, textTransform: 'uppercase' }}>Height</p>
                      <p style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', margin: '3px 0 0' }}>{data.height ? `${data.height} cm` : '—'}</p>
                    </div>
                  </div>
                </div>

                {/* Card 4: Pedigree Lineage */}
                <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                  <h3 style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', margin: '0 0 14px', borderBottom: '1px solid #F1F5F9', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    🧬 Pedigree Lineage — Dam & Sire
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div style={{ background: '#FFF1F2', border: '1px solid #FECDD3', borderRadius: '12px', padding: '14px' }}>
                      <span style={{ fontSize: '10px', fontWeight: 800, color: '#E11D48', textTransform: 'uppercase' }}>🐄 Dam Cow (Mother)</span>
                      <p style={{ fontSize: '15px', fontWeight: 800, color: '#BE123C', margin: '4px 0 2px' }}>{data.damName || '—'}</p>
                      <p style={{ fontSize: '11px', color: '#E11D48', margin: 0 }}>Breed: <strong>{data.damBreed || '—'}</strong></p>
                    </div>
                    <div style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: '12px', padding: '14px' }}>
                      <span style={{ fontSize: '10px', fontWeight: 800, color: '#0284C7', textTransform: 'uppercase' }}>🐂 Sire Bull (Father)</span>
                      <p style={{ fontSize: '15px', fontWeight: 800, color: '#0369A1', margin: '4px 0 2px' }}>{data.sireName || '—'}</p>
                      <p style={{ fontSize: '11px', color: '#0284C7', margin: 0 }}>Breed: <strong>{data.sireBreed || '—'}</strong></p>
                    </div>
                  </div>
                </div>

                {/* Card 5: Notes (conditional) */}
                {data.note && (
                  <div style={{ background: '#FAFAFA', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '18px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                    <h3 style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      📝 Notes & Observations
                    </h3>
                  </div>
                )}
              </div>{/* end RIGHT */}
            </div>{/* end MAIN GRID */}
          </>
        ) : item.type === 'calf' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

              {/* ── TOP HERO HEADER BANNER ── */}
              <div style={{ background: 'linear-gradient(135deg, #0F172A 0%, #064E3B 100%)', borderRadius: '24px', padding: '20px 24px', color: 'white', border: '1px solid #1E293B', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', backdropFilter: 'blur(8px)' }}>
                    🍼
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <h2 style={{ fontSize: '20px', fontWeight: 900, color: 'white', margin: 0 }}>{name}</h2>
                      <span style={{ fontSize: '12px', fontWeight: 800, padding: '3px 10px', borderRadius: '8px', background: 'rgba(16,185,129,0.25)', color: '#6EE7B7', border: '1px solid rgba(16,185,129,0.4)', fontFamily: 'monospace' }}>
                        #{data.tagId || code}
                      </span>
                      <span style={{ fontSize: '12px', fontWeight: 800, padding: '3px 10px', borderRadius: '8px', background: data.sex === 'Female' ? 'rgba(244,63,94,0.25)' : 'rgba(59,130,246,0.25)', color: data.sex === 'Female' ? '#FDA4AF' : '#93C5FD', border: `1px solid ${data.sex === 'Female' ? 'rgba(244,63,94,0.4)' : 'rgba(59,130,246,0.4)'}` }}>
                        {data.sex === 'Female' ? '♀ Heifer' : '♂ Bull Calf'}
                      </span>
                    </div>
                    <p style={{ fontSize: '13px', color: '#94A3B8', margin: '4px 0 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>Breed: <strong style={{ color: '#6EE7B7' }}>{breed}</strong></span>
                      <span>•</span>
                      <span>Birth Date: <strong style={{ color: 'white' }}>{dob ? new Date(dob).toLocaleDateString('en-GB') : '—'}</strong></span>
                      <span>•</span>
                      <span>Facility: <strong style={{ color: 'white' }}>{placeOfBirth}</strong></span>
                    </p>
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    onClick={handleInstantCertDownload}
                    disabled={downloadingCert}
                    style={{ padding: '10px 18px', background: downloadingCert ? '#94A3B8' : '#10B981', color: 'white', border: 'none', borderRadius: '12px', fontSize: '13px', fontWeight: 800, cursor: downloadingCert ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 2px 8px rgba(16,185,129,0.3)' }}
                    className="hover:bg-emerald-600 transition-all"
                  >
                    {downloadingCert ? '⏳ Generating PNG...' : '📥 Download PNG Certificate'}
                  </button>
                  <button
                    onClick={() => {
                      const certId = data.certNo || code || 'BC-2025-0004';
                      window.open(`/public/calf/${encodeURIComponent(certId)}`, '_blank');
                    }}
                    style={{ padding: '10px 16px', background: 'rgba(255,255,255,0.12)', color: 'white', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '12px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', backdropFilter: 'blur(6px)' }}
                    className="hover:bg-white/20 transition-all"
                  >
                    📱 Public QR
                  </button>
                </div>
              </div>

              {/* ── 2-COLUMN MAIN GRID ── */}
              <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '20px', alignItems: 'start' }}>

                {/* ── LEFT COLUMN (340px) ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                  {/* Calf Photo Container with Lightbox */}
                  <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #E2E8F0', padding: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                    <div
                      onClick={() => setLightboxOpen(true)}
                      style={{ position: 'relative', width: '100%', aspectRatio: '4 / 3', borderRadius: '14px', overflow: 'hidden', background: '#0F172A', cursor: 'pointer', border: '1px solid #E2E8F0' }}
                      title="Click to enlarge photo"
                    >
                      <img src={imageUrl} alt="" aria-hidden style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(16px)', opacity: 0.5, transform: 'scale(1.15)' }} />
                      <img
                        src={imageUrl}
                        alt={name}
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', zIndex: 1 }}
                      />
                      <div style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 2, background: 'rgba(0,0,0,0.6)', borderRadius: '6px', padding: '4px 8px', fontSize: '10px', color: 'white', backdropFilter: 'blur(4px)', fontWeight: 700 }}>
                        🔍 Tap to enlarge
                      </div>
                    </div>
                  </div>

                  {/* Vital Stats Card */}
                  <div style={{ background: 'white', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                    <p style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', margin: '0 0 10px', textTransform: 'uppercase' }}>📊 Vital Statistics</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', textAlign: 'center' }}>
                      <div style={{ background: '#F0FDF4', borderRadius: '12px', padding: '12px 8px', border: '1px solid #BBF7D0' }}>
                        <p style={{ fontSize: '20px', fontWeight: 900, color: '#16a34a', margin: 0 }}>{weight || 26.5} kg</p>
                        <p style={{ fontSize: '9px', color: '#166534', fontWeight: 800, margin: '2px 0 0', textTransform: 'uppercase' }}>Birth Weight</p>
                      </div>
                      <div style={{ background: '#EFF6FF', borderRadius: '12px', padding: '12px 8px', border: '1px solid #BFDBFE' }}>
                        <p style={{ fontSize: '14px', fontWeight: 800, color: '#1D4ED8', margin: 0 }}>{age}</p>
                        <p style={{ fontSize: '9px', color: '#1E40AF', fontWeight: 800, margin: '2px 0 0', textTransform: 'uppercase' }}>Current Age</p>
                      </div>
                    </div>
                  </div>

                  {/* Public QR Verification Component */}
                  <QrCodeCard
                    path={`/public/calf/${encodeURIComponent(data.certNo || code)}`}
                    title="Public Calf Verification QR Code"
                    subtitle="Scan with camera for public pedigree access"
                    size={140}
                  />

                  {/* 1-Click Instant PNG Download Button */}
                  <button
                    onClick={handleInstantCertDownload}
                    disabled={downloadingCert}
                    style={{ padding: '12px', background: downloadingCert ? '#94A3B8' : '#0B6B3A', color: 'white', border: 'none', borderRadius: '14px', fontSize: '13px', fontWeight: 800, cursor: downloadingCert ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 2px 6px rgba(11,107,58,0.2)' }}
                    className="hover:bg-[#08522c] transition-all"
                  >
                    {downloadingCert ? 'Generating...' : '📥 Download PNG Certificate'}
                  </button>

                </div>{/* end LEFT */}

                {/* ── RIGHT COLUMN (flex 1) ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                  {/* Card 1: Newborn Identification Profile */}
                  <div style={{ background: 'white', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', margin: '0 0 14px', borderBottom: '1px solid #F1F5F9', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      🍼 Newborn Identification Profile
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px 20px' }}>
                      <div>
                        <p style={{ fontSize: '10px', color: '#94A3B8', margin: 0, fontWeight: 700, textTransform: 'uppercase' }}>Calf Name</p>
                        <p style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', margin: '3px 0 0' }}>{name}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: '10px', color: '#94A3B8', margin: 0, fontWeight: 700, textTransform: 'uppercase' }}>Ear Tag ID</p>
                        <p style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', margin: '3px 0 0', fontFamily: 'monospace' }}>{data.tagId || code}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: '10px', color: '#94A3B8', margin: 0, fontWeight: 700, textTransform: 'uppercase' }}>Gender</p>
                        <p style={{ fontSize: '13px', fontWeight: 800, color: data.sex === 'Female' ? '#BE185D' : '#1D4ED8', margin: '3px 0 0' }}>
                          {data.sex === 'Female' ? '♀ Female Heifer' : '♂ Male Bull Calf'}
                        </p>
                      </div>
                      <div>
                        <p style={{ fontSize: '10px', color: '#94A3B8', margin: 0, fontWeight: 700, textTransform: 'uppercase' }}>Breed</p>
                        <p style={{ fontSize: '13px', fontWeight: 700, color: '#16a34a', margin: '3px 0 0' }}>{breed}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: '10px', color: '#94A3B8', margin: 0, fontWeight: 700, textTransform: 'uppercase' }}>Coat Color / Pattern</p>
                        <p style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', margin: '3px 0 0' }}>{color}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: '10px', color: '#94A3B8', margin: 0, fontWeight: 700, textTransform: 'uppercase' }}>Date of Birth</p>
                        <p style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', margin: '3px 0 0' }}>
                          {dob ? new Date(dob).toLocaleDateString('en-GB') : '—'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Pedigree Lineage — Dam & Sire */}
                  <div style={{ background: 'white', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '10px', marginBottom: '14px' }}>
                      <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        🧬 Pedigree Lineage — Mother & Father
                      </h3>
                      {data.breedingRecordId && (
                        <a
                          href={`/public/breeding/${encodeURIComponent(data.breedingRecordId)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 12px', borderRadius: '8px', background: '#F0FDF4', color: '#166534', border: '1px solid #BBF7D0', fontWeight: 800, fontSize: '12px', fontFamily: 'monospace', textDecoration: 'none' }}
                          className="hover:bg-emerald-100 transition-colors"
                        >
                          🔗 Breeding Program: {data.breedingRecordId} ↗
                        </a>
                      )}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                      {/* Dam Cow Card */}
                      <div style={{ background: '#FFF1F2', border: '1px solid #FECDD3', borderRadius: '14px', padding: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <img src={damImg} alt="" style={{ width: '50px', height: '50px', borderRadius: '10px', objectFit: 'cover', border: '1px solid #FDA4AF', flexShrink: 0 }} />
                        <div>
                          <span style={{ fontSize: '10px', fontWeight: 800, color: '#E11D48', textTransform: 'uppercase' }}>🐄 Dam Cow (Mother)</span>
                          <p style={{ fontSize: '15px', fontWeight: 800, color: '#BE123C', margin: '2px 0 1px' }}>{damName}</p>
                          <p style={{ fontSize: '11px', color: '#E11D48', margin: 0 }}>Breed: <strong>{damBreed}</strong></p>
                        </div>
                      </div>
                      {/* Sire Bull Card */}
                      <div style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: '14px', padding: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <img src={sireImg} alt="" style={{ width: '50px', height: '50px', borderRadius: '10px', objectFit: 'cover', border: '1px solid #7DD3FC', flexShrink: 0 }} />
                        <div>
                          <span style={{ fontSize: '10px', fontWeight: 800, color: '#0284C7', textTransform: 'uppercase' }}>🐂 Sire Bull (Father)</span>
                          <p style={{ fontSize: '15px', fontWeight: 800, color: '#0369A1', margin: '2px 0 1px' }}>{sireName}</p>
                          <p style={{ fontSize: '11px', color: '#0284C7', margin: 0 }}>Breed: <strong>{sireBreed}</strong></p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Birth Location & Ownership */}
                  <div style={{ background: 'white', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', margin: '0 0 14px', borderBottom: '1px solid #F1F5F9', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      📍 Location of Birth & Ownership
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 20px' }}>
                      <div>
                        <p style={{ fontSize: '10px', color: '#94A3B8', margin: 0, fontWeight: 700, textTransform: 'uppercase' }}>Farm Facility</p>
                        <p style={{ fontSize: '13px', fontWeight: 800, color: '#16a34a', margin: '3px 0 0' }}>{data.farmName || 'SNR Farm'}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: '10px', color: '#94A3B8', margin: 0, fontWeight: 700, textTransform: 'uppercase' }}>Cow Owner</p>
                        <p style={{ fontSize: '13px', fontWeight: 800, color: '#6B21A8', margin: '3px 0 0' }}>{cowOwner}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: '10px', color: '#94A3B8', margin: 0, fontWeight: 700, textTransform: 'uppercase' }}>Province / District</p>
                        <p style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', margin: '3px 0 0' }}>{data.provinceDistrict || 'Kandal / Ang Snoul'}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: '10px', color: '#94A3B8', margin: 0, fontWeight: 700, textTransform: 'uppercase' }}>GPS Coordinates</p>
                        <p style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', margin: '3px 0 0', fontFamily: 'monospace' }}>{data.gpsCoordinates || '11.4707 N, 104.9390 E'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Card 4: Official Birth Certificate Info */}
                  <div style={{ background: '#F8FAFC', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '18px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <p style={{ fontSize: '10px', color: '#64748B', margin: 0, fontWeight: 800, textTransform: 'uppercase' }}>📜 Official Certificate Number</p>
                        <p style={{ fontSize: '16px', fontWeight: 900, color: '#0F172A', margin: '2px 0 0', fontFamily: 'monospace' }}>
                          {data.certNo || `BC-2025-${code.replace(/\D/g, '') || '00000084'}`}
                        </p>
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: 800, padding: '4px 12px', borderRadius: '999px', background: '#DCFCE7', color: '#15803D', border: '1px solid #86EFAC' }}>
                        ✓ Verified & Active
                      </span>
                    </div>
                  </div>

                  {/* Card 5: Notes & Observations (conditional) */}
                  {notes && (
                    <div style={{ background: '#FAFAFA', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '18px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                      <h3 style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        📝 Birth Notes & Health Observations
                      </h3>
                      <p style={{ fontSize: '13px', color: '#334155', margin: 0, lineHeight: 1.6 }}>{notes}</p>
                    </div>
                  )}

                </div>{/* end RIGHT */}
              </div>{/* end MAIN GRID */}
            </div>
          ) : (
            <>
              {/* ROW 1: Identity & Reproduction Timeline + Breeding Method & Financials */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

                {/* CARD 1: Identity & Timeline */}
                <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', margin: '0 0 14px', borderBottom: '1px solid #F1F5F9', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    📋 General Identity & Reproduction Timeline
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 20px' }}>
                    <div>
                      <p style={{ fontSize: '10px', color: '#94A3B8', margin: 0, textTransform: 'uppercase' }}>Breeding Tag / ID</p>
                      <p style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', margin: '2px 0 0', fontFamily: 'monospace' }}>{code}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '10px', color: '#94A3B8', margin: 0, textTransform: 'uppercase' }}>Target Breed</p>
                      <p style={{ fontSize: '14px', fontWeight: 800, color: '#16a34a', margin: '2px 0 0' }}>{breed}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '10px', color: '#94A3B8', margin: 0, textTransform: 'uppercase' }}>🔥 Heat Detection Date</p>
                      <p style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', margin: '2px 0 0' }}>{data.heatDetectionDate ? new Date(data.heatDetectionDate).toLocaleDateString('en-GB') : '—'}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '10px', color: '#94A3B8', margin: 0, textTransform: 'uppercase' }}>💉 Mating / Service Date</p>
                      <p style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', margin: '2px 0 0' }}>{matingDate ? new Date(matingDate).toLocaleDateString('en-GB') : '—'}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '10px', color: '#94A3B8', margin: 0, textTransform: 'uppercase' }}>🩺 Pregnancy Check Date</p>
                      <p style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', margin: '2px 0 0' }}>{checkupDate ? new Date(checkupDate).toLocaleDateString('en-GB') : '—'}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '10px', color: '#94A3B8', margin: 0, textTransform: 'uppercase' }}>👶 Expected Birth Date</p>
                      <p style={{ fontSize: '13px', fontWeight: 800, color: '#16a34a', margin: '2px 0 0' }}>{expectedBirthdate ? new Date(expectedBirthdate).toLocaleDateString('en-GB') : '—'}</p>
                    </div>
                  </div>
                </div>

                {/* CARD 2: Service Method & Financial Costs */}
                <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', margin: '0 0 14px', borderBottom: '1px solid #F1F5F9', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    💵 Breeding Method & Financial Breakdown
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 20px' }}>
                    <div>
                      <p style={{ fontSize: '10px', color: '#94A3B8', margin: 0, textTransform: 'uppercase' }}>Service Type</p>
                      <p style={{ fontSize: '13px', fontWeight: 700, color: '#1D4ED8', margin: '2px 0 0' }}>🧬 {data.serviceType || 'AI'}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '10px', color: '#94A3B8', margin: 0, textTransform: 'uppercase' }}>Breeding Method</p>
                      <p style={{ fontSize: '13px', fontWeight: 700, color: '#6B21A8', margin: '2px 0 0' }}>🔀 {data.breedingMethod || 'Cross-Breeding'}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '10px', color: '#94A3B8', margin: 0, textTransform: 'uppercase' }}>Service Fee</p>
                      <p style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', margin: '2px 0 0' }}>
                        {data.currency === 'KHR' ? '៛' : '$'} {(data.breedingServiceCost || 50).toLocaleString()} {data.currency || 'USD'}
                      </p>
                    </div>
                    <div>
                      <p style={{ fontSize: '10px', color: '#94A3B8', margin: 0, textTransform: 'uppercase' }}>Straw / Semen Cost</p>
                      <p style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', margin: '2px 0 0' }}>
                        {data.currency === 'KHR' ? '៛' : '$'} {(data.breedingInseminationCost || 85).toLocaleString()} {data.currency || 'USD'}
                      </p>
                    </div>
                  </div>
                  <div style={{ marginTop: '14px', padding: '10px 14px', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#166534' }}>Total Breeding Cost:</span>
                    <span style={{ fontSize: '16px', fontWeight: 800, color: '#16a34a' }}>
                      {data.currency === 'KHR' ? '៛' : '$'} {((data.breedingServiceCost || 50) + (data.breedingInseminationCost || 85)).toLocaleString()} {data.currency || 'USD'}
                    </span>
                  </div>
                </div>

              </div>

              {/* ROW 2: Pedigree & Parentage Lineage (Dam Cow & Sire Bull side-by-side with 1:1 photos) */}
              <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', margin: '0 0 14px', borderBottom: '1px solid #F1F5F9', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  🧬 Pedigree & Parentage Lineage
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {/* Dam Cow Card */}
                  <div style={{ background: '#FFF1F2', border: '1px solid #FECDD3', borderRadius: '12px', padding: '14px', display: 'flex', gap: '14px', alignItems: 'center' }}>
                    <div style={{ width: '72px', height: '72px', borderRadius: '12px', overflow: 'hidden', border: '2px solid #F43F5E', flexShrink: 0, background: '#FFE4E6' }}>
                      <img src={damImg} alt="Dam Cow" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div>
                      <span style={{ fontSize: '10px', fontWeight: 800, color: '#E11D48', textTransform: 'uppercase' }}>🐄 Dam Cow (Mother)</span>
                      <p style={{ fontSize: '15px', fontWeight: 800, color: '#BE123C', margin: '2px 0 1px' }}>{damName}</p>
                      <p style={{ fontSize: '11px', color: '#E11D48', margin: 0 }}>Breed: <strong>{damBreed}</strong></p>
                    </div>
                  </div>

                  {/* Sire Bull Card */}
                  <div style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: '12px', padding: '14px', display: 'flex', gap: '14px', alignItems: 'center' }}>
                    <div style={{ width: '72px', height: '72px', borderRadius: '12px', overflow: 'hidden', border: '2px solid #0284C7', flexShrink: 0, background: '#E0F2FE' }}>
                      <img src={sireImg} alt="Sire Bull" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div>
                      <span style={{ fontSize: '10px', fontWeight: 800, color: '#0284C7', textTransform: 'uppercase' }}>🐂 Sire Bull (Father)</span>
                      <p style={{ fontSize: '15px', fontWeight: 800, color: '#0369A1', margin: '2px 0 1px' }}>{sireName}</p>
                      <p style={{ fontSize: '11px', color: '#0284C7', margin: 0 }}>Breed: <strong>{sireBreed}</strong></p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ROW 3: Attribution & Compact Scannable QR Code */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 240px', gap: '20px', alignItems: 'stretch' }}>
                <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', margin: '0 0 14px', borderBottom: '1px solid #F1F5F9', paddingBottom: '10px' }}>
                    🏠 Farm Owner & Breeder Technician
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <p style={{ fontSize: '10px', color: '#94A3B8', margin: 0, textTransform: 'uppercase' }}>Cow Owner Account</p>
                      <div style={{ marginTop: '6px', display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '999px', background: '#F3E8FF', color: '#6B21A8', fontWeight: 700, fontSize: '13px' }}>
                        🏠 {cowOwner}
                      </div>
                    </div>
                    <div>
                      <p style={{ fontSize: '10px', color: '#94A3B8', margin: 0, textTransform: 'uppercase' }}>Breeder / Inseminator</p>
                      <div style={{ marginTop: '6px', display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '999px', background: '#FEF3C7', color: '#92400E', fontWeight: 700, fontSize: '13px' }}>
                        👨‍⚕️ {breeder}
                      </div>
                    </div>
                  </div>
                  {notes && (
                    <div style={{ marginTop: '16px', padding: '12px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                      <p style={{ fontSize: '10px', color: '#64748B', fontWeight: 700, margin: '0 0 4px', textTransform: 'uppercase' }}>📝 Notes & Observations:</p>
                      <p style={{ fontSize: '12px', color: '#334155', margin: 0 }}>{notes}</p>
                    </div>
                  )}
                </div>

                {/* Dedicated Public Sharing Section for Breeding Detail */}
                <QrCodeCard
                  path={`/public/breeding/${recordId}`}
                  title="Public Breeding Program QR Code"
                  subtitle="Scan to view public pedigree record"
                  size={160}
                />
              </div>
            </>
          )}

        </div>

        {/* Lightbox overlay */}
        {lightboxOpen && (
          <div
            onClick={() => setLightboxOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out' }}
          >
            <img
              src={imageUrl}
              alt={name}
              style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: '12px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}
              onClick={e => e.stopPropagation()}
            />
            <button
              onClick={() => setLightboxOpen(false)}
              style={{ position: 'absolute', top: '20px', right: '24px', background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', fontSize: '24px', cursor: 'pointer', borderRadius: '50%', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(6px)' }}
            >✕</button>
          </div>
        )}
      </div>
    </div>
  );
}
