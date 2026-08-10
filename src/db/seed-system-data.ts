import { query, withTransaction } from '../config/database';
import { DEFAULT_ROLE_PERMISSIONS } from '../lib/types';

export async function seedSystemData() {
  console.log('=== 🌾 Seeding Production-Grade Cambodian Sample Data ===');

  await withTransaction(async (client) => {
    // ── 1. Seed Users (11 Accounts across 4 Official User Levels) ───────────
    const users = [
      // 1. Breeders (3)
      {
        id: 'BREEDER-01',
        name: 'Sokha Vannak',
        email: 'sokha.breeder@snrfarm.com',
        role: 'Breeder',
        userLevel: 'Breeder',
        userLevelId: 'LEVEL-01',
        dataScope: 'ASSIGNED_RECORD',
        status: 'Active',
        password: 'password123',
        permissions: DEFAULT_ROLE_PERMISSIONS['Breeder'] || [],
        farmLocation: 'រទាំង',
        nationalId: 'ID-KH-100201',
        idVerificationStatus: 'Verified'
      },
      {
        id: 'BREEDER-02',
        name: 'Chea Rithy',
        email: 'rithy.breeder@snrfarm.com',
        role: 'Breeder',
        userLevel: 'Breeder',
        userLevelId: 'LEVEL-01',
        dataScope: 'ASSIGNED_RECORD',
        status: 'Active',
        password: 'password123',
        permissions: DEFAULT_ROLE_PERMISSIONS['Breeder'] || [],
        farmLocation: 'ព្រៃវែង',
        nationalId: 'ID-KH-100202',
        idVerificationStatus: 'Verified'
      },
      {
        id: 'BREEDER-03',
        name: 'Heng Sophat',
        email: 'sophat.breeder@snrfarm.com',
        role: 'Breeder',
        userLevel: 'Breeder',
        userLevelId: 'LEVEL-01',
        dataScope: 'ASSIGNED_RECORD',
        status: 'Active',
        password: 'password123',
        permissions: DEFAULT_ROLE_PERMISSIONS['Breeder'] || [],
        farmLocation: 'បន្ទាយមានជ័យ',
        nationalId: 'ID-KH-100203',
        idVerificationStatus: 'Verified'
      },

      // 2. Farm Owners (3)
      {
        id: 'FARM-OWNER-01',
        name: 'Bona Van',
        email: 'bona.v@snrfarm.com',
        role: 'Farm Owner',
        userLevel: 'Farm Owner',
        userLevelId: 'LEVEL-02',
        dataScope: 'FARM_LEVEL',
        status: 'Active',
        password: 'password123',
        permissions: DEFAULT_ROLE_PERMISSIONS['Farm Owner'] || [],
        farmLocation: 'រទាំង',
        nationalId: 'ID-KH-200101',
        idVerificationStatus: 'Verified'
      },
      {
        id: 'FARM-OWNER-02',
        name: 'Kiri Seng',
        email: 'kiri.seng@snrfarm.com',
        role: 'Farm Owner',
        userLevel: 'Farm Owner',
        userLevelId: 'LEVEL-02',
        dataScope: 'FARM_LEVEL',
        status: 'Active',
        password: 'password123',
        permissions: DEFAULT_ROLE_PERMISSIONS['Farm Owner'] || [],
        farmLocation: 'ព្រៃវែង',
        nationalId: 'ID-KH-200102',
        idVerificationStatus: 'Verified'
      },
      {
        id: 'FARM-OWNER-03',
        name: 'Chan Dara',
        email: 'dara.chan@snrfarm.com',
        role: 'Farm Owner',
        userLevel: 'Farm Owner',
        userLevelId: 'LEVEL-02',
        dataScope: 'FARM_LEVEL',
        status: 'Active',
        password: 'password123',
        permissions: DEFAULT_ROLE_PERMISSIONS['Farm Owner'] || [],
        farmLocation: 'បន្ទាយមានជ័យ',
        nationalId: 'ID-KH-200103',
        idVerificationStatus: 'Verified'
      },

      // 3. Customers / Cow Owners (3)
      {
        id: 'CUSTOMER-01',
        name: 'Sophea Nhek',
        email: 'sophea.nhek@customer.com',
        role: 'Customer / Cow Owner',
        userLevel: 'Customer / Cow Owner',
        userLevelId: 'LEVEL-04',
        dataScope: 'OWNED_RECORD',
        status: 'Active',
        password: 'password123',
        permissions: DEFAULT_ROLE_PERMISSIONS['Customer / Cow Owner'] || [],
        farmLocation: 'ជ្រោយចង្វារ',
        nationalId: 'ID-KH-300301',
        idVerificationStatus: 'Verified'
      },
      {
        id: 'CUSTOMER-02',
        name: 'Piseth Mak',
        email: 'piseth.mak@customer.com',
        role: 'Customer / Cow Owner',
        userLevel: 'Customer / Cow Owner',
        userLevelId: 'LEVEL-04',
        dataScope: 'OWNED_RECORD',
        status: 'Active',
        password: 'password123',
        permissions: DEFAULT_ROLE_PERMISSIONS['Customer / Cow Owner'] || [],
        farmLocation: 'កណ្តាល',
        nationalId: 'ID-KH-300302',
        idVerificationStatus: 'Verified'
      },
      {
        id: 'CUSTOMER-03',
        name: 'Sreyneang Pich',
        email: 'sreyneang@customer.com',
        role: 'Customer / Cow Owner',
        userLevel: 'Customer / Cow Owner',
        userLevelId: 'LEVEL-04',
        dataScope: 'OWNED_RECORD',
        status: 'Active',
        password: 'password123',
        permissions: DEFAULT_ROLE_PERMISSIONS['Customer / Cow Owner'] || [],
        farmLocation: 'តាកែវ',
        nationalId: 'ID-KH-300303',
        idVerificationStatus: 'Verified'
      },

      // 4. Sire Sourcing Companies (2)
      {
        id: 'SOURCING-01',
        name: 'ABS Global Cambodia',
        email: 'sourcing.kh@absglobal.com',
        role: 'Sire Sourcing Company',
        userLevel: 'Sire Sourcing Company',
        userLevelId: 'LEVEL-05',
        dataScope: 'GLOBAL_VIEW',
        status: 'Active',
        password: 'password123',
        permissions: DEFAULT_ROLE_PERMISSIONS['Sire Sourcing Company'] || [],
        farmLocation: 'ភ្នំពេញ',
        nationalId: 'COMP-KH-9001',
        idVerificationStatus: 'Verified'
      },
      {
        id: 'SOURCING-02',
        name: 'Semex Indochina',
        email: 'contact@semexindochina.com',
        role: 'Sire Sourcing Company',
        userLevel: 'Sire Sourcing Company',
        userLevelId: 'LEVEL-05',
        dataScope: 'GLOBAL_VIEW',
        status: 'Active',
        password: 'password123',
        permissions: DEFAULT_ROLE_PERMISSIONS['Sire Sourcing Company'] || [],
        farmLocation: 'ភ្នំពេញ',
        nationalId: 'COMP-KH-9002',
        idVerificationStatus: 'Verified'
      }
    ];

    for (const u of users) {
      await client.query(`
        INSERT INTO users (
          id, name, email, role, user_level, user_level_id, data_scope, status, password, permissions, farm_location, national_id, id_verification_status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          email = EXCLUDED.email,
          role = EXCLUDED.role,
          user_level = EXCLUDED.user_level,
          user_level_id = EXCLUDED.user_level_id,
          data_scope = EXCLUDED.data_scope,
          status = EXCLUDED.status,
          password = EXCLUDED.password,
          permissions = EXCLUDED.permissions,
          farm_location = EXCLUDED.farm_location,
          national_id = EXCLUDED.national_id,
          id_verification_status = EXCLUDED.id_verification_status;
      `, [
        u.id, u.name, u.email, u.role, u.userLevel, u.userLevelId, u.dataScope,
        u.status, u.password, JSON.stringify(u.permissions), u.farmLocation, u.nationalId, u.idVerificationStatus
      ]);
    }
    console.log(`[✓] Seeded ${users.length} Users across 4 official user levels.`);

    // ── 2. Seed Farms (3 Cambodian Farms) ──────────────────────────────────
    const farms = [
      {
        id: 'FARM-01',
        code: 'ROTHANG',
        name: 'រទាំង (Rothang Farm)',
        ownerId: 'FARM-OWNER-01',
        ownerName: 'Bona Van',
        address: 'រទាំង, ព្រែកព្នៅ, ភ្នំពេញ',
        capacity: 100,
        notes: 'ទីតាំងបំប៉នសាច់ និងផលិតចំណី',
        status: 'Active'
      },
      {
        id: 'FARM-02',
        code: 'PREY_VENG',
        name: 'ព្រៃវែង (Prey Veng Station)',
        ownerId: 'FARM-OWNER-02',
        ownerName: 'Kiri Seng',
        address: 'ក្រុងព្រៃវែង, ខេត្តព្រៃវែង',
        capacity: 150,
        notes: 'ទីតាំងបង្កាត់ពូជ និងព្យាបាល',
        status: 'Active'
      },
      {
        id: 'FARM-03',
        code: 'BANTEAY_MEANCHEAY',
        name: 'បន្ទាយមានជ័យ (Banteay Meanchey Station)',
        ownerId: 'FARM-OWNER-03',
        ownerName: 'Chan Dara',
        address: 'ក្រុងសិរីសោភ័ណ, ខេត្តបន្ទាយមានជ័យ',
        capacity: 80,
        notes: 'ក្រោលផ្ទេរ និងចែកចាយ',
        status: 'Active'
      }
    ];

    for (const f of farms) {
      await client.query(`
        INSERT INTO farms (id, code, name, owner_id, owner_name, address, capacity, notes, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (id) DO UPDATE SET
          code = EXCLUDED.code,
          name = EXCLUDED.name,
          owner_id = EXCLUDED.owner_id,
          owner_name = EXCLUDED.owner_name,
          address = EXCLUDED.address,
          capacity = EXCLUDED.capacity,
          notes = EXCLUDED.notes,
          status = EXCLUDED.status;
      `, [f.id, f.code, f.name, f.ownerId, f.ownerName, f.address, f.capacity, f.notes, f.status]);
    }
    console.log(`[✓] Seeded ${farms.length} Farms.`);

    // ── 3. Seed Sires (5 Genetic Sires) ────────────────────────────────────
    const sires = [
      {
        id: 'SIRE-01',
        name: 'Brahman King #888',
        breed: 'American Brahman Red',
        dob: '2021-03-15',
        bloodline: '100% Purebred Red Brahman',
        sourcingCompany: 'ABS Global Cambodia',
        ownerName: 'ABS Global Cambodia',
        farmLocation: 'ភ្នំពេញ',
        status: 'Active'
      },
      {
        id: 'SIRE-02',
        name: 'Wagyu Master Tajima',
        breed: 'Fullblood Wagyu Black',
        dob: '2020-05-20',
        bloodline: 'Tajima Bloodline KOBE-01',
        sourcingCompany: 'ABS Global Cambodia',
        ownerName: 'ABS Global Cambodia',
        farmLocation: 'ភ្នំពេញ',
        status: 'Active'
      },
      {
        id: 'SIRE-03',
        name: 'Nelore Champion #102',
        breed: 'Nelore White',
        dob: '2022-01-10',
        bloodline: 'Brazilian Championship Nelore',
        sourcingCompany: 'Semex Indochina',
        ownerName: 'Semex Indochina',
        farmLocation: 'ភ្នំពេញ',
        status: 'Active'
      },
      {
        id: 'SIRE-04',
        name: 'Brangus Prime 505',
        breed: 'Brangus Black',
        dob: '2021-11-05',
        bloodline: '5/8 Angus 3/8 Brahman',
        sourcingCompany: 'Semex Indochina',
        ownerName: 'Semex Indochina',
        farmLocation: 'ភ្នំពេញ',
        status: 'Active'
      },
      {
        id: 'SIRE-05',
        name: 'Indu-Brasil Red Star',
        breed: 'Indu-Brasil Red',
        dob: '2020-08-14',
        bloodline: 'Purebred Indu-Brasil',
        sourcingCompany: 'ABS Global Cambodia',
        ownerName: 'ABS Global Cambodia',
        farmLocation: 'ភ្នំពេញ',
        status: 'Active'
      }
    ];

    for (const s of sires) {
      await client.query(`
        INSERT INTO sires (id, name, breed, dob, bloodline, sourcing_company, owner_name, farm_location, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          breed = EXCLUDED.breed,
          dob = EXCLUDED.dob,
          bloodline = EXCLUDED.bloodline,
          sourcing_company = EXCLUDED.sourcing_company,
          owner_name = EXCLUDED.owner_name,
          farm_location = EXCLUDED.farm_location,
          status = EXCLUDED.status;
      `, [s.id, s.name, s.breed, new Date(s.dob), s.bloodline, s.sourcingCompany, s.ownerName, s.farmLocation, s.status]);
    }
    console.log(`[✓] Seeded ${sires.length} Sires.`);

    // ── 4. Seed Stock Insemination (Semen Straw Stock) ─────────────────────
    const semenStock = [
      { id: 'STRAW-01', sireId: 'SIRE-01', code: 'STRAW-BR-888', straws: 250, priceUsd: 45.00 },
      { id: 'STRAW-02', sireId: 'SIRE-02', code: 'STRAW-WG-101', straws: 180, priceUsd: 65.00 },
      { id: 'STRAW-03', sireId: 'SIRE-03', code: 'STRAW-NL-102', straws: 300, priceUsd: 35.00 },
      { id: 'STRAW-04', sireId: 'SIRE-04', code: 'STRAW-BG-505', straws: 200, priceUsd: 40.00 },
      { id: 'STRAW-05', sireId: 'SIRE-05', code: 'STRAW-IB-777', straws: 150, priceUsd: 50.00 }
    ];

    for (const st of semenStock) {
      await client.query(`
        INSERT INTO stock_insemination (id, sire_id, stock_available, price_usd, currency, availability, status)
        VALUES ($1, $2, $3, $4, 'USD', 'Available', 'Active')
        ON CONFLICT (id) DO UPDATE SET
          sire_id = EXCLUDED.sire_id,
          stock_available = EXCLUDED.stock_available,
          price_usd = EXCLUDED.price_usd,
          availability = EXCLUDED.availability,
          status = EXCLUDED.status;
      `, [st.id, st.sireId, st.straws, st.priceUsd]);
    }
    console.log(`[✓] Seeded ${semenStock.length} Semen Straw Stock items.`);

    // ── 5. Seed Dams (5 Dams with Mixed Pregnancy/Breeding Statuses) ────────
    const dams = [
      {
        id: 'DAM-01',
        name: 'Krom Rothang Red 01',
        breed: 'Brahman Cross',
        dob: '2022-04-10',
        breedingStatus: 'Pregnant',
        pregnancyStatus: 'Confirmed Pregnant',
        availability: 'In Breeding',
        ownerName: 'Bona Van',
        farmLocation: 'រទាំង',
        status: 'Active'
      },
      {
        id: 'DAM-02',
        name: 'Chroy Changvar Beauty 02',
        breed: 'Wagyu Cross',
        dob: '2022-09-18',
        breedingStatus: 'Open',
        pregnancyStatus: 'Not Pregnant',
        availability: 'Available',
        ownerName: 'Sophea Nhek',
        farmLocation: 'ជ្រោយចង្វារ',
        status: 'Active'
      },
      {
        id: 'DAM-03',
        name: 'Prey Veng Star 03',
        breed: 'Nelore Cross',
        dob: '2021-12-05',
        breedingStatus: 'In Breeding',
        pregnancyStatus: 'In Breeding',
        availability: 'In Breeding',
        ownerName: 'Kiri Seng',
        farmLocation: 'ព្រៃវែង',
        status: 'Active'
      },
      {
        id: 'DAM-04',
        name: 'Takeo Gold 04',
        breed: 'Brahman Cross',
        dob: '2022-02-14',
        breedingStatus: 'Confirmed Pregnant',
        pregnancyStatus: 'Confirmed Pregnant',
        availability: 'In Breeding',
        ownerName: 'Sreyneang Pich',
        farmLocation: 'តាកែវ',
        status: 'Active'
      },
      {
        id: 'DAM-05',
        name: 'Serei Saophoan Queen 05',
        breed: 'Brangus Cross',
        dob: '2023-01-20',
        breedingStatus: 'Open',
        pregnancyStatus: 'Not Pregnant',
        availability: 'Available',
        ownerName: 'Chan Dara',
        farmLocation: 'បន្ទាយមានជ័យ',
        status: 'Active'
      }
    ];

    for (const d of dams) {
      await client.query(`
        INSERT INTO dams (
          id, name, breed, dob, breeding_status, pregnancy_status, availability, owner_name, farm_location
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          breed = EXCLUDED.breed,
          dob = EXCLUDED.dob,
          breeding_status = EXCLUDED.breeding_status,
          pregnancy_status = EXCLUDED.pregnancy_status,
          availability = EXCLUDED.availability,
          owner_name = EXCLUDED.owner_name,
          farm_location = EXCLUDED.farm_location;
      `, [d.id, d.name, d.breed, new Date(d.dob), d.breedingStatus, d.pregnancyStatus, d.availability, d.ownerName, d.farmLocation]);
    }
    console.log(`[✓] Seeded ${dams.length} Dams.`);

    // ── 6. Seed Breeding Programs (5 Real Programs) ─────────────────────────
    const programs = [
      {
        id: 'BP-2026-001',
        programCode: 'BP-2026-001',
        ownerName: 'Bona Van',
        farmLocation: 'រទាំង',
        breederName: 'Sokha Vannak',
        sireId: 'SIRE-01',
        damId: 'DAM-01',
        breed: 'American Brahman Red',
        breedingMethod: 'Artificial Insemination (AI)',
        breedingDate: '2025-05-10',
        expectedCalvingDate: '2026-02-15',
        cost: 45.00,
        status: 'Confirmed'
      },
      {
        id: 'BP-2026-002',
        programCode: 'BP-2026-002',
        ownerName: 'Sophea Nhek',
        farmLocation: 'ជ្រោយចង្វារ',
        breederName: 'Sokha Vannak',
        sireId: 'SIRE-02',
        damId: 'DAM-02',
        breed: 'Fullblood Wagyu Black',
        breedingMethod: 'Artificial Insemination (AI)',
        breedingDate: '2025-11-01',
        expectedCalvingDate: '2026-08-05',
        cost: 65.00,
        status: 'Requested'
      },
      {
        id: 'BP-2026-003',
        programCode: 'BP-2026-003',
        ownerName: 'Kiri Seng',
        farmLocation: 'ព្រៃវែង',
        breederName: 'Chea Rithy',
        sireId: 'SIRE-03',
        damId: 'DAM-03',
        breed: 'Nelore White',
        breedingMethod: 'Artificial Insemination (AI)',
        breedingDate: '2025-12-12',
        expectedCalvingDate: '2026-09-18',
        cost: 35.00,
        status: 'In Progress'
      },
      {
        id: 'BP-2026-004',
        programCode: 'BP-2026-004',
        ownerName: 'Sreyneang Pich',
        farmLocation: 'តាកែវ',
        breederName: 'Heng Sophat',
        sireId: 'SIRE-04',
        damId: 'DAM-04',
        breed: 'Brangus Black',
        breedingMethod: 'Artificial Insemination (AI)',
        breedingDate: '2025-06-20',
        expectedCalvingDate: '2026-03-27',
        cost: 40.00,
        status: 'Confirmed'
      },
      {
        id: 'BP-2026-005',
        programCode: 'BP-2026-005',
        ownerName: 'Chan Dara',
        farmLocation: 'បន្ទាយមានជ័យ',
        breederName: 'Heng Sophat',
        sireId: 'SIRE-05',
        damId: 'DAM-05',
        breed: 'Indu-Brasil Red',
        breedingMethod: 'Artificial Insemination (AI)',
        breedingDate: '2025-02-15',
        expectedCalvingDate: '2025-11-20',
        cost: 50.00,
        status: 'Completed'
      }
    ];

    for (const p of programs) {
      await client.query(`
        INSERT INTO breeding_programs (
          id, program_number, owner_name, farm_location, breeder_name, sire_id, dam_id, breeding_method, breeding_date, expected_calving_date, price_usd, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (id) DO UPDATE SET
          program_number = EXCLUDED.program_number,
          owner_name = EXCLUDED.owner_name,
          farm_location = EXCLUDED.farm_location,
          breeder_name = EXCLUDED.breeder_name,
          sire_id = EXCLUDED.sire_id,
          dam_id = EXCLUDED.dam_id,
          breeding_method = EXCLUDED.breeding_method,
          breeding_date = EXCLUDED.breeding_date,
          expected_calving_date = EXCLUDED.expected_calving_date,
          price_usd = EXCLUDED.price_usd,
          status = EXCLUDED.status;
      `, [
        p.id, p.programCode, p.ownerName, p.farmLocation, p.breederName,
        p.sireId, p.damId, p.breedingMethod,
        new Date(p.breedingDate), new Date(p.expectedCalvingDate), p.cost, p.status
      ]);
    }
    console.log(`[✓] Seeded ${programs.length} Breeding Programs.`);

    // ── 7. Seed Calves (5 Calves) ───────────────────────────────────────────
    const calves = [
      {
        id: 'CALF-2026-01',
        registrationNumber: 'KH-CALF-001',
        name: 'Bona Red Bull 01',
        breed: 'American Brahman Red Cross',
        gender: 'Male',
        dob: '2026-02-14',
        birthWeight: 34.5,
        sireId: 'SIRE-01',
        damId: 'DAM-01',
        ownerName: 'Bona Van',
        farmLocation: 'រទាំង',
        status: 'Active'
      },
      {
        id: 'CALF-2026-02',
        registrationNumber: 'KH-CALF-002',
        name: 'Sophea Tajima Calf',
        breed: 'Wagyu Cross',
        gender: 'Female',
        dob: '2026-01-20',
        birthWeight: 29.0,
        sireId: 'SIRE-02',
        damId: 'DAM-02',
        ownerName: 'Sophea Nhek',
        farmLocation: 'ជ្រោយចង្វារ',
        status: 'Active'
      },
      {
        id: 'CALF-2026-03',
        registrationNumber: 'KH-CALF-003',
        name: 'Prey Veng Prince',
        breed: 'Nelore Cross',
        gender: 'Male',
        dob: '2025-12-28',
        birthWeight: 32.0,
        sireId: 'SIRE-03',
        damId: 'DAM-03',
        ownerName: 'Kiri Seng',
        farmLocation: 'ព្រៃវែង',
        status: 'Active'
      },
      {
        id: 'CALF-2026-04',
        registrationNumber: 'KH-CALF-004',
        name: 'Takeo Brangus Star',
        breed: 'Brangus Cross',
        gender: 'Female',
        dob: '2026-03-01',
        birthWeight: 31.2,
        sireId: 'SIRE-04',
        damId: 'DAM-04',
        ownerName: 'Sreyneang Pich',
        farmLocation: 'តាកែវ',
        status: 'Active'
      },
      {
        id: 'CALF-2026-05',
        registrationNumber: 'KH-CALF-005',
        name: 'Serei Saophoan Junior',
        breed: 'Indu-Brasil Cross',
        gender: 'Male',
        dob: '2025-11-22',
        birthWeight: 35.0,
        sireId: 'SIRE-05',
        damId: 'DAM-05',
        ownerName: 'Chan Dara',
        farmLocation: 'បន្ទាយមានជ័យ',
        status: 'Active'
      }
    ];

    for (const c of calves) {
      await client.query(`
        INSERT INTO calves (
          id, name, breed, sex, birth_date, birth_weight, sire_id, dam_id, owner_name, farm_location, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          breed = EXCLUDED.breed,
          sex = EXCLUDED.sex,
          birth_date = EXCLUDED.birth_date,
          birth_weight = EXCLUDED.birth_weight,
          sire_id = EXCLUDED.sire_id,
          dam_id = EXCLUDED.dam_id,
          owner_name = EXCLUDED.owner_name,
          farm_location = EXCLUDED.farm_location,
          status = EXCLUDED.status;
      `, [
        c.id, c.name, c.breed, c.gender, new Date(c.dob),
        c.birthWeight, c.sireId, c.damId, c.ownerName, c.farmLocation, c.status
      ]);
    }
    console.log(`[✓] Seeded ${calves.length} Calves.`);

    // ── 8. Seed Herdbook Registrations (3 Registrations) ────────────────────
    const registrations = [
      {
        id: 'HR-2026-001',
        registrationNumber: 'KH-2026-8801',
        animalType: 'Calf',
        animalId: 'CALF-2026-01',
        sireId: 'SIRE-01',
        damId: 'DAM-01',
        calfId: 'CALF-2026-01',
        breedingProgramId: 'BP-2026-001',
        ownerName: 'Bona Van',
        farmLocation: 'រទាំង',
        breederName: 'Sokha Vannak',
        publicToken: 'TOKEN-KH-CERT-0001',
        status: 'Verified'
      },
      {
        id: 'HR-2026-002',
        registrationNumber: 'KH-2026-8802',
        animalType: 'Calf',
        animalId: 'CALF-2026-02',
        sireId: 'SIRE-02',
        damId: 'DAM-02',
        calfId: 'CALF-2026-02',
        breedingProgramId: 'BP-2026-002',
        ownerName: 'Sophea Nhek',
        farmLocation: 'ជ្រោយចង្វារ',
        breederName: 'Sokha Vannak',
        publicToken: 'TOKEN-KH-CERT-0002',
        status: 'Verified'
      },
      {
        id: 'HR-2026-003',
        registrationNumber: 'KH-2026-8803',
        animalType: 'Calf',
        animalId: 'CALF-2026-03',
        sireId: 'SIRE-03',
        damId: 'DAM-03',
        calfId: 'CALF-2026-03',
        breedingProgramId: 'BP-2026-003',
        ownerName: 'Kiri Seng',
        farmLocation: 'ព្រៃវែង',
        breederName: 'Chea Rithy',
        publicToken: 'TOKEN-KH-CERT-0003',
        status: 'Verified'
      }
    ];

    for (const r of registrations) {
      await client.query(`
        INSERT INTO herdbook_registrations (
          id, registration_number, animal_type, animal_id, sire_id, dam_id, calf_id, breeding_program_id, owner_name, farm_location, breeder_name, public_token, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        ON CONFLICT (id) DO UPDATE SET
          registration_number = EXCLUDED.registration_number,
          animal_type = EXCLUDED.animal_type,
          animal_id = EXCLUDED.animal_id,
          sire_id = EXCLUDED.sire_id,
          dam_id = EXCLUDED.dam_id,
          calf_id = EXCLUDED.calf_id,
          breeding_program_id = EXCLUDED.breeding_program_id,
          owner_name = EXCLUDED.owner_name,
          farm_location = EXCLUDED.farm_location,
          breeder_name = EXCLUDED.breeder_name,
          public_token = EXCLUDED.public_token,
          status = EXCLUDED.status;
      `, [
        r.id, r.registrationNumber, r.animalType, r.animalId, r.sireId, r.damId, r.calfId,
        r.breedingProgramId, r.ownerName, r.farmLocation, r.breederName, r.publicToken, r.status
      ]);
    }
    console.log(`[✓] Seeded ${registrations.length} Herdbook Registrations.`);

    // ── 9. Seed Certificates (3 Official Certificates) ──────────────────────
    const certificates = [
      {
        id: 'CERT-2026-001',
        certificateNumber: 'HERD-CERT-0001',
        registrationId: 'HR-2026-001',
        calfId: 'CALF-2026-01',
        issueDate: '2026-02-15',
        publicUrl: 'http://localhost:3000/public/verify/TOKEN-KH-CERT-0001',
        qrData: 'TOKEN-KH-CERT-0001'
      },
      {
        id: 'CERT-2026-002',
        certificateNumber: 'HERD-CERT-0002',
        registrationId: 'HR-2026-002',
        calfId: 'CALF-2026-02',
        issueDate: '2026-01-22',
        publicUrl: 'http://localhost:3000/public/verify/TOKEN-KH-CERT-0002',
        qrData: 'TOKEN-KH-CERT-0002'
      },
      {
        id: 'CERT-2026-003',
        certificateNumber: 'HERD-CERT-0003',
        registrationId: 'HR-2026-003',
        calfId: 'CALF-2026-03',
        issueDate: '2026-01-02',
        publicUrl: 'http://localhost:3000/public/verify/TOKEN-KH-CERT-0003',
        qrData: 'TOKEN-KH-CERT-0003'
      }
    ];

    for (const cert of certificates) {
      await client.query(`
        INSERT INTO certificates (
          id, certificate_number, registration_id, calf_id, issue_date, public_verification_url, qr_code_data
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (id) DO UPDATE SET
          certificate_number = EXCLUDED.certificate_number,
          registration_id = EXCLUDED.registration_id,
          calf_id = EXCLUDED.calf_id,
          issue_date = EXCLUDED.issue_date,
          public_verification_url = EXCLUDED.public_verification_url,
          qr_code_data = EXCLUDED.qr_code_data;
      `, [
        cert.id, cert.certificateNumber, cert.registrationId, cert.calfId,
        new Date(cert.issueDate), cert.publicUrl, cert.qrData
      ]);
    }
    console.log(`[✓] Seeded ${certificates.length} Official Certificates.`);
  });

  console.log('✅ Successfully finished seeding production-grade Cambodian sample data to PostgreSQL!');
}

if (require.main === module) {
  seedSystemData()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Error seeding system data:', err);
      process.exit(1);
    });
}
