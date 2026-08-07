import React from 'react';

export interface DownloadCertOptions {
  certNo?: string;
  code?: string;
  tagId?: string;
  calfName?: string;
  sex?: string;
  breed?: string;
  color?: string;
  dob?: string | null;
  birthWeight?: string | number | null;
  status?: string;
  farmName?: string;
  provinceDistrict?: string;
  sireName?: string;
  sireCode?: string;
  sireBreed?: string;
  damName?: string;
  damCode?: string;
  damBreed?: string;
  breedingRecordId?: string;
  registrationDate?: string;
  imageUrl?: string;
  publicQrUrl?: string;
}

/**
 * Dynamically loads html2canvas script if not already present on window
 */
async function ensureHtml2CanvasLoaded(): Promise<any> {
  if (typeof window === 'undefined') return null;
  if ((window as any).html2canvas) {
    return (window as any).html2canvas;
  }

  return new Promise((resolve, reject) => {
    const existingScript = document.querySelector('script[src*="html2canvas"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve((window as any).html2canvas));
      existingScript.addEventListener('error', () => reject(new Error('Failed to load html2canvas script')));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
    script.crossOrigin = 'anonymous';
    script.onload = () => resolve((window as any).html2canvas);
    script.onerror = () => reject(new Error('Failed to load html2canvas library'));
    document.body.appendChild(script);
  });
}

/**
 * 1-Click Instant High-Resolution PNG Certificate Downloader
 * Renders the official Kaksedthan A4 Landscape Certificate off-screen and triggers instant PNG download.
 */
export async function downloadCalfCertificatePng(options: DownloadCertOptions): Promise<{ success: boolean; fileName?: string; error?: string }> {
  if (typeof window === 'undefined') {
    return { success: false, error: 'Browser environment required' };
  }

  const rawCertNo = options.certNo || `BC-2026-${(options.tagId || options.code || '000123').replace(/\D/g, '') || '00000084'}`;
  const rawCode = options.tagId || options.code || 'CLF-000123';
  const cleanFilenameCode = (options.tagId || options.code || options.calfName || 'CLF-000123').replace(/[^a-zA-Z0-9_-]/g, '_');
  const fileName = `Kaksedthan_Calf_Certificate_${cleanFilenameCode}.png`;

  const calfName = options.calfName || 'Unnamed Calf';
  const sex = options.sex || 'Female (Heifer)';
  const breed = options.breed || 'Brahman / Cross-breed';
  const color = options.color || 'Red / Deep Brown';
  const dob = options.dob || '—';
  const birthWeight = options.birthWeight || 26.5;
  const status = options.status || 'Healthy & Vigorous';
  const farmName = options.farmName || 'SNR Farm Facility';
  const provinceDistrict = options.provinceDistrict || 'Kandal / Ang Snoul';
  
  const sireName = options.sireName || 'Sire Bull';
  const sireCode = options.sireCode || 'BULL-01';
  const sireBreed = options.sireBreed || breed;

  const damName = options.damName || 'Dam Cow';
  const damCode = options.damCode || 'DAM-01';
  const damBreed = options.damBreed || 'Local / Cross';

  const breedingRecordId = options.breedingRecordId || 'BRD-2025-0098';
  const registrationDate = options.registrationDate || new Date().toLocaleDateString('en-GB');
  const imageUrl = options.imageUrl || 'https://images.unsplash.com/photo-1546445317-29f4545f9d52?auto=format&fit=crop&w=800&q=80';
  
  const publicQrUrl = options.publicQrUrl || `${window.location.origin}/public/calf/${encodeURIComponent(rawCertNo)}`;

  let container: HTMLDivElement | null = null;

  try {
    const html2canvas = await ensureHtml2CanvasLoaded();
    if (!html2canvas) {
      throw new Error('html2canvas library unavailable');
    }

    // Create temporary off-screen container for rendering
    container = document.createElement('div');
    container.id = `cert-download-temp-${Date.now()}`;
    container.style.position = 'fixed';
    container.style.left = '-9999px';
    container.style.top = '-9999px';
    container.style.width = '1120px';
    container.style.backgroundColor = '#FFFFFF';
    container.style.zIndex = '-9999';

    // Build complete Official A4 Landscape Certificate HTML
    container.innerHTML = `
      <div style="box-sizing: border-box; background-color: #FFFFFF; border: 4px solid #0B6B3A; border-radius: 24px; padding: 28px; position: relative; font-family: system-ui, -apple-system, sans-serif; color: #0F172A; width: 1120px; margin: 0 auto; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
        
        <!-- Inner Gold Border Accent -->
        <div style="position: absolute; inset: 6px; border: 1.5px solid #C89B3C; border-radius: 18px; pointer-events: none;"></div>

        <!-- 1. HEADER SECTION -->
        <div style="display: grid; grid-template-columns: 240px 1fr 240px; gap: 16px; align-items: center; border-bottom: 2px solid #E2E8F0; padding-bottom: 16px; margin-bottom: 20px;">
          <div>
            <h2 style="font-size: 24px; font-weight: 900; color: #C89B3C; letter-spacing: 0.08em; margin: 0; line-height: 1.1;">PEDIGREE</h2>
            <div style="width: 80px; height: 3px; background: #C89B3C; margin-top: 4px; margin-bottom: 6px;"></div>
            <p style="font-size: 9px; font-weight: 800; color: #475569; text-transform: uppercase; letter-spacing: 0.05em; margin: 0;">BUILDING BETTER HERD FOR BETTER FUTURE</p>
          </div>

          <div style="text-align: center;">
            <div style="color: #C89B3C; font-size: 14px; line-height: 1;">◆</div>
            <h1 style="font-size: 24px; font-weight: 900; color: #0B6B3A; text-transform: uppercase; letter-spacing: 0.04em; margin: 2px 0 4px; line-height: 1.2;">BIRTH CERTIFICATE OF CALF</h1>
            <p style="font-size: 11px; color: #64748B; margin: 0; font-weight: 500;">Official birth & pedigree registration certificate issued by the Kaksedthan livestock management system.</p>
          </div>

          <div style="display: flex; flex-direction: column; align-items: flex-end; justify-content: center;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <div style="width: 36px; height: 36px; border-radius: 10px; background: #0B6B3A; color: white; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 18px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">K</div>
              <div style="text-align: left;">
                <p style="font-size: 14px; font-weight: 900; color: #0F172A; margin: 0; line-height: 1.1;">KAKSEDTHAN</p>
                <p style="font-size: 10px; font-weight: 800; color: #0B6B3A; margin: 2px 0 0; text-transform: uppercase;">Livestock Management</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 2. THREE-COLUMN MAIN GRID -->
        <div style="display: grid; grid-template-columns: 1fr 1fr 280px; gap: 20px; align-items: start;">

          <!-- COLUMN 1: CALF INFO & LOCATION -->
          <div style="display: flex; flex-direction: column; gap: 16px;">
            <div>
              <h3 style="font-size: 12px; font-weight: 900; color: #0B6B3A; text-transform: uppercase; margin: 0 0 8px;">🐄 CALF INFORMATION</h3>
              
              <div style="background: #0B6B3A; color: white; padding: 6px 12px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="font-size: 10px; font-weight: 800; text-transform: uppercase;">CERTIFICATE NO.</span>
                <span style="font-size: 13px; font-weight: 900; font-family: monospace;">${rawCertNo}</span>
              </div>

              <div style="border: 1px solid #E2E8F0; border-radius: 8px; overflow: hidden; font-size: 11px;">
                <div style="display: grid; grid-template-columns: 120px 1fr; padding: 5px 10px; border-bottom: 1px solid #F1F5F9;">
                  <span style="color: #64748B;">Calf ID (Tag)</span>
                  <span style="font-weight: 800; color: #0F172A; font-family: monospace;">: ${rawCode}</span>
                </div>
                <div style="display: grid; grid-template-columns: 120px 1fr; padding: 5px 10px; border-bottom: 1px solid #F1F5F9;">
                  <span style="color: #64748B;">Calf Name</span>
                  <span style="font-weight: 900; color: #0F172A;">: ${calfName}</span>
                </div>
                <div style="display: grid; grid-template-columns: 120px 1fr; padding: 5px 10px; border-bottom: 1px solid #F1F5F9;">
                  <span style="color: #64748B;">Sex</span>
                  <span style="font-weight: 800; color: ${sex.toLowerCase().includes('female') ? '#BE123C' : '#1D4ED8'};">: ${sex.toLowerCase().includes('female') ? 'Female (Heifer) ♀' : 'Male (Bull Calf) ♂'}</span>
                </div>
                <div style="display: grid; grid-template-columns: 120px 1fr; padding: 5px 10px; border-bottom: 1px solid #F1F5F9;">
                  <span style="color: #64748B;">Breed</span>
                  <span style="font-weight: 800; color: #0B6B3A;">: ${breed}</span>
                </div>
                <div style="display: grid; grid-template-columns: 120px 1fr; padding: 5px 10px; border-bottom: 1px solid #F1F5F9;">
                  <span style="color: #64748B;">Coat Color</span>
                  <span style="font-weight: 700; color: #0F172A;">: ${color}</span>
                </div>
                <div style="display: grid; grid-template-columns: 120px 1fr; padding: 5px 10px; border-bottom: 1px solid #F1F5F9;">
                  <span style="color: #64748B;">Date of Birth</span>
                  <span style="font-weight: 800; color: #0F172A;">: ${dob}</span>
                </div>
                <div style="display: grid; grid-template-columns: 120px 1fr; padding: 5px 10px; border-bottom: 1px solid #F1F5F9;">
                  <span style="color: #64748B;">Birth Weight</span>
                  <span style="font-weight: 800; color: #0F172A;">: ${birthWeight} kg</span>
                </div>
                <div style="display: grid; grid-template-columns: 120px 1fr; padding: 5px 10px;">
                  <span style="color: #64748B;">Current Status</span>
                  <span style="font-weight: 800; color: #16a34a;">: ✓ ${status}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 style="font-size: 11px; font-weight: 900; color: #0B6B3A; text-transform: uppercase; margin: 0 0 6px;">📍 LOCATION OF BIRTH</h3>
              <div style="border: 1px solid #E2E8F0; border-radius: 8px; padding: 8px 10px; font-size: 11px; display: flex; flex-direction: column; gap: 4px;">
                <div style="display: grid; grid-template-columns: 120px 1fr;">
                  <span style="color: #64748B;">Farm Name</span>
                  <span style="font-weight: 900; color: #16a34a;">: ${farmName}</span>
                </div>
                <div style="display: grid; grid-template-columns: 120px 1fr;">
                  <span style="color: #64748B;">Province / District</span>
                  <span style="font-weight: 700; color: #0F172A;">: ${provinceDistrict}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- COLUMN 2: PEDIGREE & REGISTRATION -->
          <div style="display: flex; flex-direction: column; gap: 16px;">
            <div>
              <h3 style="font-size: 12px; font-weight: 900; color: #0B6B3A; text-transform: uppercase; margin: 0 0 8px;">🔗 PARENT INFORMATION (PEDIGREE)</h3>
              <div style="display: flex; flex-direction: column; gap: 8px;">
                <div style="background: #F0F9FF; border: 1px solid #BFDBFE; border-radius: 10px; padding: 10px 12px;">
                  <p style="font-size: 10px; font-weight: 900; color: #1D4ED8; text-transform: uppercase; margin: 0 0 4px;">♂ SIRE (FATHER)</p>
                  <p style="font-size: 12px; font-weight: 900; color: #16a34a; margin: 0;">${sireName}</p>
                  <p style="font-size: 10px; color: #64748B; margin: 2px 0 0; font-family: monospace;">Code: ${sireCode} • Breed: ${sireBreed}</p>
                </div>
                <div style="background: #FFF1F2; border: 1px solid #FECDD3; border-radius: 10px; padding: 10px 12px;">
                  <p style="font-size: 10px; font-weight: 900; color: #BE123C; text-transform: uppercase; margin: 0 0 4px;">♀ DAM (MOTHER)</p>
                  <p style="font-size: 12px; font-weight: 900; color: #16a34a; margin: 0;">${damName}</p>
                  <p style="font-size: 10px; color: #64748B; margin: 2px 0 0; font-family: monospace;">Code: ${damCode} • Breed: ${damBreed}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 style="font-size: 11px; font-weight: 900; color: #0B6B3A; text-transform: uppercase; margin: 0 0 6px;">📋 REGISTRATION INFORMATION</h3>
              <div style="border: 1px solid #E2E8F0; border-radius: 8px; padding: 8px 10px; font-size: 11px; display: flex; flex-direction: column; gap: 4px;">
                <div style="display: grid; grid-template-columns: 120px 1fr;">
                  <span style="color: #64748B;">Date of Registration</span>
                  <span style="font-weight: 800; color: #0F172A;">: ${registrationDate}</span>
                </div>
                <div style="display: grid; grid-template-columns: 120px 1fr;">
                  <span style="color: #64748B;">Breeding Record ID</span>
                  <span style="font-weight: 800; color: #0F172A; font-family: monospace;">: ${breedingRecordId}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- COLUMN 3: RIGHT PANEL -->
          <div style="display: flex; flex-direction: column; gap: 14px; align-items: center;">
            <div style="width: 100%; border-radius: 16px; overflow: hidden; border: 2px solid #0B6B3A; background: #0F172A;">
              <div style="position: relative; width: 100%; height: 180px;">
                <img src="${imageUrl}" alt="${calfName}" style="width: 100%; height: 100%; object-fit: cover;" />
              </div>
              <div style="background: #0B6B3A; padding: 6px 8px; text-align: center;">
                <p style="font-size: 11px; font-weight: 900; color: white; margin: 0;">${calfName} - ${rawCode}</p>
              </div>
            </div>

            <div style="width: 100%; text-align: center; display: flex; flex-direction: column; align-items: center; background: #F8FAFC; border-radius: 14px; border: 1px solid #E2E8F0; padding: 12px;">
              <p style="font-size: 11px; font-weight: 900; color: #0B6B3A; margin: 0 0 6px; text-transform: uppercase;">🛡️ SCAN TO VERIFY</p>
              <div style="padding: 6px; background: white; border-radius: 10px; border: 2px solid #E2E8F0; display: inline-block;">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(publicQrUrl)}" alt="QR" style="width: 100px; height: 100px; display: block;" />
              </div>
            </div>

            <div style="width: 100%; background: #0B6B3A; border-radius: 12px; padding: 10px; text-align: center; color: white;">
              <p style="font-size: 10px; font-weight: 800; margin: 0; line-height: 1.3;">Building a traceable and productive livestock sector for Cambodia.</p>
            </div>
          </div>

        </div>

        <!-- 3. FOOTER SECTION -->
        <div style="margin-top: 20px; padding-top: 12px; border-top: 1px solid #E2E8F0; display: flex; align-items: center; justify-content: space-between;">
          <p style="font-size: 10px; color: #64748B; margin: 0; font-style: italic; font-weight: 500;">
            This certificate is electronically issued by the Kaksedthan Livestock Database and is valid without a physical signature.
          </p>

          <div style="padding: 4px 12px; background: #F8FAFC; border-radius: 6px; border: 1px solid #E2E8F0;">
            <p style="font-size: 11px; font-weight: 900; color: #0B6B3A; margin: 0; font-family: monospace;">
              Record ID: ${rawCertNo}
            </p>
          </div>
        </div>

      </div>
    `;

    document.body.appendChild(container);

    // Short pause for image loading and DOM layout computation
    await new Promise((resolve) => setTimeout(resolve, 250));

    // Render Canvas at 2.5x Scale (High-resolution A4 Landscape PNG)
    const canvas = await html2canvas(container.firstElementChild as HTMLElement, {
      scale: 2.5,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#FFFFFF',
      logging: false
    });

    const dataUrl = canvas.toDataURL('image/png');

    // Trigger Instant Browser Download
    const downloadLink = document.createElement('a');
    downloadLink.download = fileName;
    downloadLink.href = dataUrl;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    return { success: true, fileName };
  } catch (err: any) {
    console.error('[Certificate Downloader Error]:', err);
    return { success: false, error: err.message || 'Failed to generate PNG certificate' };
  } finally {
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  }
}
