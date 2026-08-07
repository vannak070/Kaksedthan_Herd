import fs from 'fs';
import path from 'path';
import { pool } from '../config/database';

export async function seedDatabase() {
  console.log('=== Livestock ERP Database Seeding Script ===');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. DDL Schema Execution
    const schemaPath = path.join(process.cwd(), 'src', 'db', 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      console.log('[Seed] Executing DDL Schema in schema.sql...');
      const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
      await client.query(schemaSql);
      console.log('[Seed] Database DDL schema applied successfully.');
    }

    // 2. Load JSON Data fallback
    const jsonPath = path.join(process.cwd(), 'src', 'db', 'db.json');
    let data: any = { stock: [], weightTracking: [], salesTracking: [], batches: [], healthLogs: [], expenses: [] };
    if (fs.existsSync(jsonPath)) {
      const fileContent = fs.readFileSync(jsonPath, 'utf-8');
      data = JSON.parse(fileContent);
    }

    // 3. Populate master_settings
    console.log('[Seed] Populating master_settings...');
    const settingsJson = {
      farms: [
        { id: 'FARM-01', name: 'Battambang Main Feedlot', location: 'Battambang', type: 'Feedlot', capacity: 1500 },
        { id: 'FARM-02', name: 'SNR Breeding Station', location: 'Phnom Penh', type: 'Breeding', capacity: 500 }
      ],
      roles: ['Admin', 'Manager', 'Staff', 'Veterinarian'],
      expenseCategories: ['Feed', 'Medicine', 'Labour', 'Utilities', 'Artificial Insemination', 'Transport', 'Equipment']
    };
    await client.query(
      `INSERT INTO master_settings (key, data) VALUES ('system_config', $1)
       ON CONFLICT (key) DO UPDATE SET data = EXCLUDED.data`,
      [JSON.stringify(settingsJson)]
    );

    // 4. Populate users
    console.log('[Seed] Populating users...');
    const users = [
      { id: 'USR-01', name: 'Admin KKP', email: 'admin@kkp.com', password: 'CCEC@12345', role: 'Admin', farmLocation: 'All' },
      { id: 'USR-02', name: 'SNR Farm Admin', email: 'snrfarm@kkp.com', password: '123456', role: 'Manager', farmLocation: 'SNR Breeding Station' }
    ];
    for (const u of users) {
      await client.query(
        `INSERT INTO users (id, name, email, role, password, farm_location)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role`,
        [u.id, u.name, u.email, u.role, u.password, u.farmLocation]
      );
    }

    // 5. Populate stock (including dams 0000049 and 0000028)
    console.log('[Seed] Populating stock table...');
    const sampleStock = [
      { id: '0000049', no: 'DAM-49', breed: 'សែនក្រហម - តោមស', sex: 'Female', age: '3 years', weight: 420, ownerName: '0001 - SNR Farm', location: 'SNR Breeding Station', phone: '012345678', buyType: 'Farm Born', unitPrice: 3500000, totalPrice: 3500000, healthStatus: 'Good', status: 'Active', purpose: 'Breeding Dam' },
      { id: '0000028', no: 'DAM-28', breed: 'Mr. HIROSHI - Wagyu', sex: 'Female', age: '2.5 years', weight: 380, ownerName: '0001 - SNR Farm', location: 'SNR Breeding Station', phone: '012345678', buyType: 'Imported', unitPrice: 4200000, totalPrice: 4200000, healthStatus: 'Good', status: 'Active', purpose: 'Breeding Dam' },
      { id: 'DAM-ANGUS-102', no: 'DAM-102', breed: 'Black Angus', sex: 'Female', age: '4 years', weight: 480, ownerName: '0002 - KAKSEDTHAN Main', location: 'Battambang', phone: '012987654', buyType: 'Local', unitPrice: 3800000, totalPrice: 3800000, healthStatus: 'Good', status: 'Active', purpose: 'Breeding Dam' },
      { id: 'DAM-BRAHMAN-88', no: 'DAM-88', breed: 'Red Brahman', sex: 'Female', age: '3.5 years', weight: 450, ownerName: '0001 - SNR Farm', location: 'SNR Breeding Station', phone: '012345678', buyType: 'Local', unitPrice: 3900000, totalPrice: 3900000, healthStatus: 'Good', status: 'Active', purpose: 'Breeding Dam' }
    ];

    for (const s of sampleStock) {
      await client.query(
        `INSERT INTO stock (id, no, breed, sex, age, weight, owner_name, location, phone, buy_type, unit_price, total_price, health_status, status, purpose)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
         ON CONFLICT (id) DO UPDATE SET breed = EXCLUDED.breed, purpose = EXCLUDED.purpose`,
        [s.id, s.no, s.breed, s.sex, s.age, s.weight, s.ownerName, s.location, s.phone, s.buyType, s.unitPrice, s.totalPrice, s.healthStatus, s.status, s.purpose]
      );
    }

    // 6. Populate breeding_records (Sample Data from Attached Screenshot & Program Requirements)
    console.log('[Seed] Populating breeding_records table...');
    const seedBreedingRecords = [
      {
        id: 'BRD-0000049-01',
        dam_id: '0000049',
        target_breed: 'សែនក្រហម - តោមស',
        sire_id: '0000005',
        bull_name: '0000005 - វ៉ាហ្វូ',
        cow_owner: '0001 - SNR Farm',
        dam_source: 'Existing Dam',
        breeder_name: '0001 - SNR Farm',
        service_type: 'AI',
        breeding_method: 'Cross-breeding',
        pregnancy_status: 'Pending',
        heat_detection_date: new Date('2026-07-05'),
        mating_date: new Date('2026-07-06'),
        checkup_date: new Date('2026-08-20'),
        expected_birthdate: new Date('2027-04-19'),
        expected_calving_date: new Date('2027-04-19'),
        breeding_service_cost: 50000,
        breeding_insemination_cost: 85000
      },
      {
        id: 'BRD-0000049-02',
        dam_id: '0000049',
        target_breed: 'សែនក្រហម - តោមស',
        sire_id: '0000005',
        bull_name: '0000005 - វ៉ាហ្វូ',
        cow_owner: '0001 - SNR Farm',
        dam_source: 'Existing Dam',
        breeder_name: '0001 - SNR Farm',
        service_type: 'AI',
        breeding_method: 'Cross-breeding',
        pregnancy_status: 'Open',
        heat_detection_date: new Date('2026-07-03'),
        mating_date: new Date('2026-07-04'),
        checkup_date: new Date('2026-08-18'),
        expected_birthdate: new Date('2027-04-17'),
        expected_calving_date: new Date('2027-04-17'),
        breeding_service_cost: 50000,
        breeding_insemination_cost: 85000
      },
      {
        id: 'BRD-0000028-01',
        dam_id: '0000028',
        target_breed: 'Mr. HIROSHI - Wagyu',
        sire_id: '0000004',
        bull_name: '0000004 - បីសរ ស្វែងស្ដែង',
        cow_owner: '0001 - SNR Farm',
        dam_source: 'New Dam',
        breeder_name: '0001 - SNR Farm',
        service_type: 'AI',
        breeding_method: 'Cross-breeding',
        pregnancy_status: 'Pending',
        heat_detection_date: new Date('2026-06-25'),
        mating_date: new Date('2026-06-26'),
        checkup_date: new Date('2026-08-10'),
        expected_birthdate: new Date('2027-04-08'),
        expected_calving_date: new Date('2027-04-08'),
        breeding_service_cost: 60000,
        breeding_insemination_cost: 110000
      },
      {
        id: 'BRD-0000102-01',
        dam_id: 'DAM-ANGUS-102',
        target_breed: 'Black Angus',
        sire_id: 'SIRE-ANGUS-01',
        bull_name: 'Black Angus Supreme',
        cow_owner: '0002 - KAKSEDTHAN Main',
        dam_source: 'Existing Dam',
        breeder_name: 'Dr. Somnang (Vet)',
        service_type: 'AI',
        breeding_method: 'Cross-breeding',
        pregnancy_status: 'Confirmed Pregnant',
        heat_detection_date: new Date('2026-01-10'),
        mating_date: new Date('2026-01-11'),
        checkup_date: new Date('2026-02-25'),
        expected_birthdate: new Date('2026-10-21'),
        expected_calving_date: new Date('2026-10-21'),
        breeding_service_cost: 50000,
        breeding_insemination_cost: 85000
      }
    ];

    for (const r of seedBreedingRecords) {
      await client.query(
        `INSERT INTO breeding_records (
          id, dam_id, sire_id, mating_date, breeding_type, technician, 
          pregnancy_status, pregnancy_check_date, expected_calving_date, 
          cow_owner, dam_source, breeder_name, service_type, breeding_method,
          target_breed, bull_name, heat_detection_date, checkup_date, expected_birthdate,
          breeding_service_cost, breeding_insemination_cost
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
        ON CONFLICT (id) DO UPDATE SET 
          pregnancy_status = EXCLUDED.pregnancy_status,
          expected_birthdate = EXCLUDED.expected_birthdate,
          expected_calving_date = EXCLUDED.expected_calving_date`,
        [
          r.id, r.dam_id, r.sire_id, r.mating_date, r.service_type, r.breeder_name,
          r.pregnancy_status, r.checkup_date, r.expected_calving_date,
          r.cow_owner, r.dam_source, r.breeder_name, r.service_type, r.breeding_method,
          r.target_breed, r.bull_name, r.heat_detection_date, r.checkup_date, r.expected_birthdate,
          r.breeding_service_cost, r.breeding_insemination_cost
        ]
      );
    }

    await client.query('COMMIT');
    console.log('=== PostgreSQL Database Seeding Completed Successfully! ===');
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('[Seed Error] Database seeding failed:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seedDatabase().catch((err) => {
  console.error('[Seed Fatal]', err);
  process.exit(1);
});
