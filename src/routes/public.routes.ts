import { Router, Request, Response } from 'express';
import { pool } from '../config/database';

const router = Router();

/**
 * Case-insensitive & clean string normalization helper
 */
function cleanStr(val: any): string {
  if (val === null || val === undefined) return '';
  return String(val).trim().toLowerCase();
}

/**
 * Flexible identifier matcher for JSON items
 */
function isMatch(item: any, targetId: string): boolean {
  const search = cleanStr(targetId);
  if (!search) return false;

  const fieldsToTest = [
    item.id,
    item.code,
    item.tagId,
    item.tag_id,
    item.certNo,
    item.no,
    item.name,
    item.bullName,
    item.calfName,
    item.verificationCode
  ];

  for (const f of fieldsToTest) {
    if (!f) continue;
    const cleanF = cleanStr(f);
    if (cleanF === search) return true;
    if (cleanF.replace(/^(sire|sem|tag|dam|calf|brd|verified)-/i, '') === search.replace(/^(sire|sem|tag|dam|calf|brd|verified)-/i, '')) {
      return true;
    }
  }

  return false;
}

const defaultContact = {
  companyName: 'KAKSEDTHAN SNR Farm Facility',
  phone: '+855 12 345 678',
  email: 'info@kaksedthan.com',
  website: 'https://kaksedthan.com'
};

const defaultFallbackImage = 'https://images.unsplash.com/photo-1546445317-29f4545f9d52?auto=format&fit=crop&w=800&q=80';
const defaultSireImage = 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=800&q=80';

/**
 * GET /api/v1/public/breeding/:id
 * Public read-only endpoint returning non-sensitive breeding program details for QR scanning.
 */
router.get('/breeding/:id', async (req: Request, res: Response) => {
  const rawId = String(req.params.id || '');
  const decodedId = decodeURIComponent(rawId).trim();

  console.log(`[Public API] Searching public breeding record for identifier: "${decodedId}"`);

  try {
    // ── 1. SEARCH IN DB TABLE: breeding_records ─────────────────────────────
    const dbRes = await pool.query(
      `SELECT * FROM breeding_records 
       WHERE id::text = $1 
          OR id::text ILIKE $1 
          OR REPLACE(id::text, 'BRD-', '') = REPLACE($1, 'BRD-', '') 
          OR dam_id = $1 
          OR sire_id = $1`,
      [decodedId]
    );

    if (dbRes.rows.length > 0) {
      const row = dbRes.rows[0];
      console.log(`[Public API Match] Found breeding record in DB table: ID "${row.id}" (Dam: ${row.dam_id}, Sire: ${row.sire_id})`);

      // Resolve Dam & Sire details from master_settings or stock table if needed
      let damName = row.dam_name;
      let damBreed = row.dam_breed;
      let damImageUrl = row.dam_image_url;

      let sireName = row.bull_name || row.sire_name;
      let sireBreed = row.sire_breed;
      let sireImageUrl = row.sire_image_url;

      // Query semen_bulls for Sire
      try {
        const semenRes = await pool.query("SELECT data FROM master_settings WHERE key = 'semen_bulls'");
        if (semenRes.rows.length > 0) {
          const bulls: any[] = typeof semenRes.rows[0].data === 'string' ? JSON.parse(semenRes.rows[0].data) : semenRes.rows[0].data || [];
          const matchedBull = bulls.find((b: any) => String(b.id) === String(row.sire_id) || String(b.code) === String(row.sire_id));
          if (matchedBull) {
            if (!sireName) sireName = matchedBull.name;
            if (!sireBreed) sireBreed = matchedBull.breed;
            if (!sireImageUrl) sireImageUrl = matchedBull.imageUrl;
          }
        }
      } catch (e) {}

      // Query dams_herd / stock for Dam
      try {
        const damRes = await pool.query("SELECT name, breed, image_url FROM stock WHERE id::text = $1 OR tag_id = $1", [row.dam_id]);
        if (damRes.rows.length > 0) {
          if (!damName) damName = damRes.rows[0].name;
          if (!damBreed) damBreed = damRes.rows[0].breed;
          if (!damImageUrl) damImageUrl = damRes.rows[0].image_url;
        }
      } catch (e) {}

      const finalDamName = damName || `Dam Cow #${row.dam_id || ''}`;
      const finalSireName = sireName || `Sire Bull #${row.sire_id || ''}`;

      return res.json({
        success: true,
        data: {
          id: String(row.id),
          programName: `${finalDamName} × ${finalSireName} Breeding Program`,
          programCode: row.id,
          breedingType: row.service_type || row.breeding_type || row.breeding_method || 'Artificial Insemination (AI)',
          pregnancyStatus: row.pregnancy_status || 'Confirmed Pregnant',
          damId: row.dam_id || 'DAM-01',
          damName: finalDamName,
          damBreed: damBreed || 'Brahman',
          damImageUrl: damImageUrl || defaultFallbackImage,
          sireId: row.sire_id || 'SIRE-01',
          sireName: finalSireName,
          sireBreed: sireBreed || row.target_breed || 'Angus / Wagyu',
          sireImageUrl: sireImageUrl || defaultSireImage,
          targetBreed: row.target_breed || 'Crossbred Superior',
          matingDate: row.mating_date || null,
          expectedBirthdate: row.expected_birthdate || row.expected_calving_date || null,
          actualBirthdate: row.actual_calving_date || null,
          breedingMethod: row.breeding_method || 'Cross-Breeding (AI)',
          technician: row.breeder_name || row.technician || 'Dr. Sokha (Senior Vet)',
          farmLocation: row.cow_owner || '0001 - SNR Farm Facility',
          offspring: row.pregnancy_status === 'Calved' ? {
            count: 1,
            status: 'Born & Registered',
            targetBreed: row.target_breed || 'Crossbred'
          } : {
            count: 0,
            status: 'In Gestation Period',
            targetBreed: row.target_breed || 'Crossbred'
          },
          galleryImages: [
            damImageUrl || defaultFallbackImage,
            sireImageUrl || defaultSireImage
          ].filter(Boolean),
          verificationCode: `VERIFIED-BRD-${row.id}`,
          contact: defaultContact
        }
      });
    }

    // ── 2. SEARCH IN MASTER SETTINGS: breeding_records / breeding_programs ──
    const settingsRes = await pool.query(
      "SELECT data FROM master_settings WHERE key IN ('breeding_records', 'breeding_programs')"
    );

    for (const row of settingsRes.rows) {
      const records: any[] = typeof row.data === 'string' ? JSON.parse(row.data) : row.data || [];
      const match = records.find((r: any) => isMatch(r, decodedId));

      if (match) {
        console.log(`[Public API Match] Found breeding record in master_settings: ID ${match.id}`);
        const damImg = match.damImageUrl || defaultFallbackImage;
        const sireImg = match.sireImageUrl || defaultSireImage;

        return res.json({
          success: true,
          data: {
            id: String(match.id),
            programName: match.programName || `${match.damName || 'Dam'} × ${match.bullName || match.sireName || 'Sire'} Breeding Program`,
            programCode: match.programCode || match.code || `BRD-${match.id}`,
            breedingType: match.serviceType || match.breedingMethod || 'Artificial Insemination (AI)',
            pregnancyStatus: match.pregnancyStatus || 'Confirmed Pregnant',
            damId: match.damId || match.damTagId || 'DAM-01',
            damName: match.damName || 'Dam Cow',
            damBreed: match.damBreed || 'Brahman',
            damImageUrl: damImg,
            sireId: match.sireId || match.sireTagId || 'SIRE-01',
            sireName: match.bullName || match.sireName || 'Sire Bull',
            sireBreed: match.sireBreed || match.bullBreed || 'Angus / Wagyu',
            sireImageUrl: sireImg,
            targetBreed: match.targetBreed || 'Crossbred Superior',
            matingDate: match.matingDate || match.breedingDate || null,
            expectedBirthdate: match.expectedBirthdate || null,
            actualBirthdate: match.actualBirthdate || null,
            breedingMethod: match.breedingMethod || 'Cross-Breeding (AI)',
            technician: match.breederName || match.technician || 'Dr. Sokha (Senior Vet)',
            farmLocation: match.cowOwner || '0001 - SNR Farm Facility',
            offspring: match.pregnancyStatus === 'Calved' ? {
              count: 1,
              status: 'Born & Registered',
              targetBreed: match.targetBreed || 'Crossbred'
            } : {
              count: 0,
              status: 'In Gestation Period',
              targetBreed: match.targetBreed || 'Crossbred'
            },
            galleryImages: [damImg, sireImg],
            verificationCode: `VERIFIED-BRD-${match.id}`,
            contact: defaultContact
          }
        });
      }
    }

    // ── 3. FALLBACK SEARCH IN semen_bulls / stock for cross-referencing ─────
    const semenRes = await pool.query(
      "SELECT data FROM master_settings WHERE key = 'semen_bulls'"
    );

    if (semenRes.rows.length > 0) {
      const bulls: any[] = typeof semenRes.rows[0].data === 'string' ? JSON.parse(semenRes.rows[0].data) : semenRes.rows[0].data || [];
      const matchBull = bulls.find((b: any) => isMatch(b, decodedId));

      if (matchBull) {
        const sireImg = matchBull.imageUrl || defaultSireImage;
        return res.json({
          success: true,
          data: {
            id: String(matchBull.id),
            programName: `${matchBull.name} Sire Genetics Program`,
            programCode: matchBull.code || matchBull.id,
            breedingType: matchBull.production || 'Frozen Semen AI',
            pregnancyStatus: 'Confirmed Pregnant',
            damId: 'DAM-REGISTRY',
            damName: matchBull.damName || 'Registered Dam Cow',
            damBreed: matchBull.damBreed || 'Brahman Cross',
            damImageUrl: defaultFallbackImage,
            sireId: matchBull.code || matchBull.id,
            sireName: matchBull.name,
            sireBreed: matchBull.breed,
            sireImageUrl: sireImg,
            targetBreed: `${matchBull.breed} Cross`,
            matingDate: matchBull.dob || null,
            expectedBirthdate: null,
            actualBirthdate: null,
            breedingMethod: 'Artificial Insemination (AI)',
            technician: 'Senior Veterinary Specialist',
            farmLocation: matchBull.sourcingCompanies?.[0] || '0001 - SNR Farm Facility',
            offspring: {
              count: 0,
              status: 'Active Genetics Lineage',
              targetBreed: `${matchBull.breed} Cross`
            },
            galleryImages: [sireImg, defaultFallbackImage],
            verificationCode: `VERIFIED-BRD-${matchBull.code || matchBull.id}`,
            contact: defaultContact
          }
        });
      }
    }

    console.warn(`[Public API 404] No public breeding record found for identifier: "${decodedId}"`);
    return res.status(404).json({
      success: false,
      message: `Public breeding record for '${decodedId}' not found`,
      data: null
    });

  } catch (error: any) {
    console.error(`[Public API 500 Error] Breeding query execution failed for "${decodedId}":`, error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving public breeding record',
      data: null
    });
  }
});

/**
 * GET /api/v1/public/calf/:id
 * Public read-only endpoint returning sanitized calf birth & pedigree certificate details.
 * Excludes internal financial prices, staff notes, and internal primary key IDs.
 */
router.get('/calf/:id', async (req: Request, res: Response) => {
  const rawId = String(req.params.id || '');
  const decodedId = decodeURIComponent(rawId).trim();

  console.log(`[Public API] Searching public calf pedigree certificate for: "${decodedId}"`);

  try {
    // ── 1. SEARCH IN MASTER SETTINGS: calves_herd & calf_records ────────────
    const calvesRes = await pool.query(
      "SELECT data FROM master_settings WHERE key IN ('calves_herd', 'calf_records')"
    );

    for (const row of calvesRes.rows) {
      const calves: any[] = typeof row.data === 'string' ? JSON.parse(row.data) : row.data || [];
      const matched = calves.find(c => isMatch(c, decodedId));

      if (matched) {
        console.log(`[Public API Match] Found Calf Certificate: "${matched.calfName || matched.name}" (${matched.certNo || matched.code})`);
        
        return res.json({
          success: true,
          data: {
            certNo: matched.certNo || `BC-2025-${(matched.code || matched.id || '0084').replace(/\D/g, '')}`,
            code: matched.code || matched.tagId || matched.id,
            calfName: matched.calfName || matched.name || 'Registered Calf',
            sex: matched.sex || matched.gender || 'Female',
            breed: matched.breed || 'Wagyu Cross',
            color: matched.color || matched.coatColor || 'Red & White',
            dob: matched.dob || matched.birthDate || '2025-10-15',
            birthWeight: matched.birthWeight || matched.weight || '18.8',
            height: matched.height || '—',
            birthType: matched.birthType || 'Single Birth (Normal)',
            status: matched.status || matched.healthStatus || 'Healthy (Nursing)',
            farmName: matched.farmName || 'SNR Farm',
            provinceDistrict: matched.provinceDistrict || 'Kandal / Ang Snoul',
            communeVillage: matched.communeVillage || matched.location || 'Prek Anchanh',
            gpsCoordinates: matched.gpsCoordinates || '11.4707 N, 104.9390 E',
            
            // Sire Pedigree
            sireCode: matched.sireId || matched.sireCode || 'SIRE-2022-0156',
            sireName: matched.sireName || matched.bullName || 'ARGUS Blonde',
            sireBreed: matched.sireBreed || 'Wagyu',
            sireOrigin: matched.sireOrigin || matched.sireFromCountry || 'USA 🇺🇸',
            
            // Dam Pedigree
            damCode: matched.damId || matched.damCode || 'CALF-2023-0004',
            damName: matched.damName || 'best5',
            damBreed: matched.damBreed || 'Brahman',
            damDob: matched.damDob || '2023-04-12',

            // Registration & System Context
            breedingRecordId: matched.breedingRecordId || matched.breedingProgramCode || 'BR-2025-0098',
            matingDate: matched.matingDate || '2024-12-10',
            breedingMethod: matched.breedingMethod || 'Artificial Insemination (AI)',
            recordedBy: matched.recordedBy || 'CCEC Kaksedthan Registry',
            registrationDate: matched.registrationDate || matched.createdDate || '04/08/2025',
            verifiedBy: 'Super Admin (CCEC)',
            verificationDate: matched.verificationDate || '04/08/2025',

            // Owner Information
            ownerType: matched.ownerType || 'Cow Owner / Farm Facility',
            ownerName: matched.cowOwner || matched.ownerName || 'Kaksedthan Partner Herd',
            
            // Health Details
            healthStatus: matched.healthStatus || 'Healthy & Active',
            vaccinationStatus: matched.vaccinationStatus || 'Up to date (Core 3 Vaccines)',

            imageUrl: matched.imageUrl || defaultFallbackImage,
            verificationCode: `VERIFIED-BC-${matched.certNo || matched.code || matched.id}`,
            systemVersion: 'Kaksedthan v2.0',
            issuedDate: matched.issuedDate || '2025-08-04',
            contact: defaultContact
          }
        });
      }
    }

    // ── 2. SEARCH IN DB TABLE: stock ─────────────────────────────────────────
    const dbStock = await pool.query(
      `SELECT * FROM stock 
       WHERE id::text = $1 
          OR tag_id ILIKE $1 
          OR name ILIKE $1 
          OR CONCAT('TAG-', tag_id) ILIKE $1`,
      [decodedId]
    );

    if (dbStock.rows.length > 0) {
      const row = dbStock.rows[0];
      return res.json({
        success: true,
        data: {
          certNo: `BC-2025-${row.tag_id || row.id}`,
          code: row.tag_id || String(row.id),
          calfName: row.name || `Calf #${row.tag_id}`,
          sex: row.sex || 'Female',
          breed: row.breed || 'Brahman Cross',
          color: row.color || 'Standard Coat',
          dob: row.dob || null,
          birthWeight: row.weight_kg ? `${row.weight_kg}` : '20.0',
          height: row.height_cm ? `${row.height_cm}` : '—',
          birthType: 'Single Birth',
          status: row.status || 'Healthy',
          farmName: row.farm_location || 'SNR Farm',
          provinceDistrict: 'Kandal / Ang Snoul',
          communeVillage: 'Prek Anchanh',
          gpsCoordinates: '11.4707 N, 104.9390 E',
          sireCode: 'SIRE-2022-0156',
          sireName: 'ARGUS Blonde',
          sireBreed: 'Wagyu',
          damCode: 'DAM-2023-0004',
          damName: 'Mother Dam',
          damBreed: 'Brahman',
          breedingRecordId: 'BR-2025-0098',
          matingDate: '2024-12-10',
          breedingMethod: 'Artificial Insemination (AI)',
          recordedBy: 'CCEC Kaksedthan Registry',
          registrationDate: '04/08/2025',
          verifiedBy: 'Super Admin (CCEC)',
          verificationDate: '04/08/2025',
          ownerType: 'Farm Facility',
          ownerName: 'SNR Farm Owner',
          healthStatus: 'Healthy',
          vaccinationStatus: 'Up to Date',
          imageUrl: row.image_url || defaultFallbackImage,
          verificationCode: `VERIFIED-BC-${row.tag_id || row.id}`,
          systemVersion: 'Kaksedthan v2.0',
          issuedDate: '2025-08-04',
          contact: defaultContact
        }
      });
    }

    return res.status(404).json({
      success: false,
      message: `Calf pedigree certificate for '${decodedId}' not found`,
      data: null
    });

  } catch (err: any) {
    console.error(`[Public API 500 Error] Calf certificate query failed for "${decodedId}":`, err.message);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving public calf certificate',
      data: null
    });
  }
});

/**
 * GET /api/v1/public/stock/:id
 * Public read-only endpoint returning non-sensitive livestock data for QR code scanning.
 */
router.get('/stock/:id', async (req: Request, res: Response) => {
  const rawId = String(req.params.id || '');
  const decodedId = decodeURIComponent(rawId).trim();

  console.log(`[Public API] Searching public stock record for identifier: "${decodedId}"`);

  try {
    // ── 1. SEARCH IN MASTER SETTINGS: semen_bulls ────────────────────────────
    const semenRes = await pool.query(
      "SELECT data FROM master_settings WHERE key = 'semen_bulls'"
    );

    if (semenRes.rows.length > 0) {
      const semenBulls: any[] = typeof semenRes.rows[0].data === 'string'
        ? JSON.parse(semenRes.rows[0].data)
        : semenRes.rows[0].data || [];

      const matchedBull = semenBulls.find(b => isMatch(b, decodedId));

      if (matchedBull) {
        console.log(`[Public API Match] Found Sire Bull in semen_bulls: "${matchedBull.name}" (${matchedBull.code || matchedBull.id})`);
        
        const mainImg = matchedBull.imageUrl || defaultFallbackImage;
        const gallery = [mainImg];
        if (matchedBull.damImageUrl && !gallery.includes(matchedBull.damImageUrl)) gallery.push(matchedBull.damImageUrl);
        if (matchedBull.sireImageUrl && !gallery.includes(matchedBull.sireImageUrl)) gallery.push(matchedBull.sireImageUrl);

        const qty = matchedBull.stockQuantity ?? 150;
        let status = 'Available';
        if (qty === 0) status = 'Out of Stock';
        else if (qty < 20) status = 'Low Stock';

        return res.json({
          success: true,
          data: {
            id: matchedBull.id,
            name: matchedBull.name,
            code: matchedBull.code || matchedBull.id,
            breed: matchedBull.breed || 'Standard Breed',
            production: matchedBull.production || 'Frozen Semen',
            color: matchedBull.color || 'Standard',
            dob: matchedBull.dob || null,
            fromCountry: matchedBull.fromCountry || 'USA 🇺🇸',
            weight: matchedBull.weight ? `${matchedBull.weight} kg` : null,
            height: matchedBull.height ? `${matchedBull.height} cm` : null,
            imageUrl: mainImg,
            galleryImages: gallery,
            availabilityStatus: status,
            stockQuantity: qty,
            unit: matchedBull.production === 'Frozen Semen' ? 'Straws' : 'Units',
            price: matchedBull.pricePerStraw || 85,
            currency: matchedBull.currency || 'USD',
            damName: matchedBull.damName || null,
            damBreed: matchedBull.damBreed || null,
            sireName: matchedBull.sireName || null,
            sireBreed: matchedBull.sireBreed || null,
            category: 'Sire Bull Semen & Pedigree',
            description: matchedBull.note || 'Official certified Sire Bull genetics record registered under SNR Farm Facility.',
            verificationCode: `VERIFIED-${matchedBull.code || matchedBull.id}`,
            contact: {
              ...defaultContact,
              companyName: matchedBull.sourcingCompanies?.[0] || defaultContact.companyName
            }
          }
        });
      }
    }

    // ── 2. SEARCH IN MASTER SETTINGS: calves_herd ────────────────────────────
    const calvesRes = await pool.query(
      "SELECT data FROM master_settings WHERE key = 'calves_herd'"
    );

    if (calvesRes.rows.length > 0) {
      const calves: any[] = typeof calvesRes.rows[0].data === 'string'
        ? JSON.parse(calvesRes.rows[0].data)
        : calvesRes.rows[0].data || [];

      const matchedCalf = calves.find(c => isMatch(c, decodedId));

      if (matchedCalf) {
        console.log(`[Public API Match] Found Calf in calves_herd: "${matchedCalf.calfName || matchedCalf.name}" (${matchedCalf.certNo || matchedCalf.code})`);
        
        const mainImg = matchedCalf.imageUrl || defaultFallbackImage;

        return res.json({
          success: true,
          data: {
            id: matchedCalf.id,
            name: matchedCalf.calfName || matchedCalf.name || 'Calf Record',
            code: matchedCalf.code || matchedCalf.tagId || matchedCalf.certNo || matchedCalf.id,
            breed: matchedCalf.breed || 'Brahman Cross',
            production: 'Calf Lineage',
            color: matchedCalf.color || 'Standard',
            dob: matchedCalf.dob || null,
            fromCountry: matchedCalf.placeOfBirth || 'Cambodia 🇰🇭',
            weight: matchedCalf.birthWeight ? `${matchedCalf.birthWeight} kg` : null,
            height: matchedCalf.height ? `${matchedCalf.height} cm` : null,
            imageUrl: mainImg,
            galleryImages: [mainImg],
            availabilityStatus: 'Available',
            stockQuantity: 1,
            unit: 'Head',
            price: null,
            currency: 'USD',
            damName: matchedCalf.damName || null,
            damBreed: matchedCalf.damBreed || null,
            sireName: matchedCalf.sireName || null,
            sireBreed: matchedCalf.sireBreed || null,
            category: 'Born Calf Pedigree',
            description: 'Registered offspring calf certificate under SNR Farm Facility lineage.',
            verificationCode: `VERIFIED-${matchedCalf.certNo || matchedCalf.code || matchedCalf.id}`,
            contact: defaultContact
          }
        });
      }
    }

    // ── 3. SEARCH IN MASTER SETTINGS: dams_herd ─────────────────────────────
    const damsRes = await pool.query(
      "SELECT data FROM master_settings WHERE key = 'dams_herd'"
    );

    if (damsRes.rows.length > 0) {
      const dams: any[] = typeof damsRes.rows[0].data === 'string'
        ? JSON.parse(damsRes.rows[0].data)
        : damsRes.rows[0].data || [];

      const matchedDam = dams.find(d => isMatch(d, decodedId));

      if (matchedDam) {
        console.log(`[Public API Match] Found Dam Cow in dams_herd: "${matchedDam.name}" (${matchedDam.tagId || matchedDam.id})`);
        const mainImg = matchedDam.imageUrl || defaultFallbackImage;
        return res.json({
          success: true,
          data: {
            id: matchedDam.id,
            name: matchedDam.name || `Dam Cow #${matchedDam.tagId}`,
            code: matchedDam.tagId || matchedDam.id,
            breed: matchedDam.breed || 'Brahman / Angus Cross',
            production: 'Dam Breeding Cow',
            color: matchedDam.color || 'Standard',
            dob: matchedDam.dob || null,
            fromCountry: matchedDam.cowOwner || 'Cambodia 🇰🇭',
            weight: matchedDam.weight ? `${matchedDam.weight} kg` : null,
            height: matchedDam.height ? `${matchedDam.height} cm` : null,
            imageUrl: mainImg,
            galleryImages: [mainImg],
            availabilityStatus: 'Available',
            stockQuantity: 1,
            unit: 'Head',
            price: null,
            currency: 'USD',
            damName: matchedDam.damName || null,
            damBreed: matchedDam.damBreed || null,
            sireName: matchedDam.sireName || null,
            sireBreed: matchedDam.sireBreed || null,
            category: 'Dam Cow Profile',
            description: 'Verified breeding dam cow record in KAKSEDTHAN registry.',
            verificationCode: `VERIFIED-${matchedDam.tagId || matchedDam.id}`,
            contact: defaultContact
          }
        });
      }
    }

    // ── 4. SEARCH IN POSTGRES DB TABLE: stock ────────────────────────────────
    const stockRes = await pool.query(
      `SELECT id, name, tag_id, breed, sex, dob, color, weight_kg, height_cm, 
              image_url, status, category, farm_location 
       FROM stock 
       WHERE id::text = $1 OR tag_id ILIKE $1 OR name ILIKE $1 OR CONCAT('TAG-', tag_id) ILIKE $1`,
      [decodedId]
    );

    if (stockRes.rows.length > 0) {
      const row = stockRes.rows[0];
      console.log(`[Public API Match] Found Stock row in database table: "${row.name}" (Tag: ${row.tag_id})`);
      const mainImg = row.image_url || defaultFallbackImage;

      let status = row.status || 'Available';
      if (status.toLowerCase().includes('out')) status = 'Out of Stock';
      else if (status.toLowerCase().includes('low')) status = 'Low Stock';
      else status = 'Available';

      return res.json({
        success: true,
        data: {
          id: row.id,
          name: row.name || `Cattle #${row.tag_id}`,
          code: row.tag_id || String(row.id),
          breed: row.breed || 'Brahman / Local Cross',
          production: row.category || 'Livestock Herd',
          color: row.color || 'Standard',
          dob: row.dob || null,
          fromCountry: row.farm_location || 'Cambodia 🇰🇭',
          weight: row.weight_kg ? `${row.weight_kg} kg` : null,
          height: row.height_cm ? `${row.height_cm} cm` : null,
          imageUrl: mainImg,
          galleryImages: [mainImg],
          availabilityStatus: status,
          stockQuantity: 1,
          unit: 'Head',
          price: null,
          currency: 'USD',
          damName: null,
          damBreed: null,
          sireName: null,
          sireBreed: null,
          category: row.category || 'Livestock Herd',
          description: 'Official public cattle herd record.',
          verificationCode: `VERIFIED-${row.tag_id || row.id}`,
          contact: defaultContact
        }
      });
    }

    // ── 5. RECORD NOT FOUND IN ANY REPOSITORY ─────────────────────────────────
    console.warn(`[Public API 404] No public stock record found for identifier: "${decodedId}"`);
    return res.status(404).json({
      success: false,
      message: `Public record for '${decodedId}' not found or has been removed`,
      data: null
    });

  } catch (error: any) {
    console.error(`[Public API 500 Error] Query execution failed for identifier "${decodedId}":`, error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving public record',
      data: null
    });
  }
});

export default router;
