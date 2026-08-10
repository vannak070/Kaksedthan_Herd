import fs from 'fs';
import path from 'path';
import { pool } from '../config/database';

export async function seedDatabase() {
  console.log('=== Kaksedthan Herdbook Database Seeding Script ===');
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

    // 2. Populate master_settings
    console.log('[Seed] Populating master_settings & herdbook config...');
    const settingsJson = {
      farms: [
        { id: 'FARM-01', name: 'SNR Breeding Station', location: 'រទាំង', type: 'Breeding', capacity: 500 },
        { id: 'FARM-02', name: 'Prey Veng Farm', location: 'ព្រៃវែង', type: 'Breeding', capacity: 1000 },
        { id: 'FARM-03', name: 'Banteay Meanchey Station', location: 'បន្ទាយមានជ័យ', type: 'Feedlot', capacity: 1500 }
      ],
      roles: ['Super Admin', 'Administrator', 'Manager', 'Breeder', 'Farm Owner', 'Technician', 'Staff', 'Public User'],
      registrationPrefix: 'KH-2026-',
      certificateLayout: 'A4 Landscape'
    };
    await client.query(
      `INSERT INTO master_settings (key, data) VALUES ('system_config', $1)
       ON CONFLICT (key) DO UPDATE SET data = EXCLUDED.data`,
      [JSON.stringify(settingsJson)]
    );

    // 3. Populate users
    console.log('[Seed] Populating users...');
    const users = [
      { id: 'USR-01', name: 'Vannak Admin', email: 'vannak@snrfarm.com', password: 'password123', role: 'Super Admin', farmLocation: 'All' },
      { id: 'USR-02', name: 'SNR Farm Owner', email: 'owner@snrfarm.com', password: 'password123', role: 'Farm Owner', farmLocation: 'រទាំង' },
      { id: 'USR-03', name: 'Senior Breeder', email: 'breeder@snrfarm.com', password: 'password123', role: 'Breeder', farmLocation: 'រទាំង' }
    ];
    for (const u of users) {
      await client.query(
        `INSERT INTO users (id, name, email, role, password, farm_location)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role`,
        [u.id, u.name, u.email, u.role, u.password, u.farmLocation]
      );
    }

    // 4. Populate Sires
    console.log('[Seed] Populating sires...');
    const sampleSires = [
      { id: 'SIR-001', name: 'Bull King Wagyu 001', breed: 'Wagyu', dob: '2022-03-15', bloodline: '100% Fullblood Tajima', imageUrl: 'https://images.unsplash.com/photo-1546445317-29f4545f9d52?auto=format&fit=crop&w=600&q=80', ownerName: 'Kaksedthan Sire Bank', farmLocation: 'រទាំង', status: 'Active' },
      { id: 'SIR-002', name: 'Red Angus Legend', breed: 'Red Angus', dob: '2021-06-10', bloodline: 'Red Angus Supreme', imageUrl: 'https://images.unsplash.com/photo-1546445317-29f4545f9d52?auto=format&fit=crop&w=600&q=80', ownerName: 'Kaksedthan Sire Bank', farmLocation: 'រទាំង', status: 'Active' },
      { id: 'SIR-003', name: 'Brahman Champion 05', breed: 'Red Brahman', dob: '2020-11-20', bloodline: 'American Brahman HK 88', imageUrl: 'https://images.unsplash.com/photo-1546445317-29f4545f9d52?auto=format&fit=crop&w=600&q=80', ownerName: 'Kaksedthan Sire Bank', farmLocation: 'ព្រៃវែង', status: 'Active' }
    ];
    for (const s of sampleSires) {
      await client.query(
        `INSERT INTO sires (id, name, breed, dob, bloodline, image_url, owner_name, farm_location, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name`,
        [s.id, s.name, s.breed, s.dob, s.bloodline, s.imageUrl, s.ownerName, s.farmLocation, s.status]
      );
    }

    // 5. Populate Stock Insemination
    console.log('[Seed] Populating stock_insemination...');
    const sampleStockInsemination = [
      { id: 'SEM-001', sireId: 'SIR-001', stockAvailable: 150, priceUsd: 85, priceKhr: 340000, currency: 'USD', ownerName: 'Kaksedthan Sire Bank', farmLocation: 'រទាំង', breederName: 'Dr. Vannak', availability: 'Available', status: 'Active' },
      { id: 'SEM-002', sireId: 'SIR-002', stockAvailable: 80, priceUsd: 65, priceKhr: 260000, currency: 'USD', ownerName: 'Kaksedthan Sire Bank', farmLocation: 'រទាំង', breederName: 'Dr. Vannak', availability: 'Available', status: 'Active' },
      { id: 'SEM-003', sireId: 'SIR-003', stockAvailable: 200, priceUsd: 50, priceKhr: 200000, currency: 'USD', ownerName: 'Kaksedthan Sire Bank', farmLocation: 'ព្រៃវែង', breederName: 'Dr. Somnang', availability: 'Available', status: 'Active' }
    ];
    for (const st of sampleStockInsemination) {
      await client.query(
        `INSERT INTO stock_insemination (id, sire_id, stock_available, price_usd, price_khr, currency, owner_name, farm_location, breeder_name, availability, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         ON CONFLICT (id) DO UPDATE SET stock_available = EXCLUDED.stock_available`,
        [st.id, st.sireId, st.stockAvailable, st.priceUsd, st.priceKhr, st.currency, st.ownerName, st.farmLocation, st.breederName, st.availability, st.status]
      );
    }

    // 6. Populate Dams
    console.log('[Seed] Populating dams...');
    const sampleDams = [
      { id: 'DAM-001', name: 'Queen Angus 49', breed: 'Angus Cross', dob: '2023-01-10', ownerName: 'SNR Farm Owner', farmLocation: 'រទាំង', imageUrl: 'https://images.unsplash.com/photo-1546445317-29f4545f9d52?auto=format&fit=crop&w=600&q=80', availability: 'Available', breedingStatus: 'Open', pregnancyStatus: 'Open' },
      { id: 'DAM-002', name: 'Red Queen 28', breed: 'Red Brahman', dob: '2022-08-25', ownerName: 'SNR Farm Owner', farmLocation: 'រទាំង', imageUrl: 'https://images.unsplash.com/photo-1546445317-29f4545f9d52?auto=format&fit=crop&w=600&q=80', availability: 'Pregnant', breedingStatus: 'Confirmed Pregnant', pregnancyStatus: 'Confirmed Pregnant' }
    ];
    for (const d of sampleDams) {
      await client.query(
        `INSERT INTO dams (id, name, breed, dob, owner_name, farm_location, image_url, availability, breeding_status, pregnancy_status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (id) DO UPDATE SET availability = EXCLUDED.availability`,
        [d.id, d.name, d.breed, d.dob, d.ownerName, d.farmLocation, d.imageUrl, d.availability, d.breedingStatus, d.pregnancyStatus]
      );
    }

    // 7. Populate Breeding Programs
    console.log('[Seed] Populating breeding_programs...');
    await client.query(
      `INSERT INTO breeding_programs (
        id, program_number, breeding_type, breeding_method, start_date, sire_id, dam_id,
        owner_name, cow_owner, farm_location, breeder_name, price_usd, price_khr, breeding_date,
        expected_calving_date, status
      ) VALUES ($1, $2, $3, $4, CURRENT_DATE, $5, $6, $7, $8, $9, $10, $11, $12, CURRENT_DATE, CURRENT_DATE + INTERVAL '283 days', $13)
      ON CONFLICT (id) DO NOTHING`,
      ['BP-2026-001', 'BP-2026-8891', 'AI', 'Artificial Insemination', 'SIR-001', 'DAM-001', 'Kaksedthan Sire Bank', 'SNR Farm Owner', 'រទាំង', 'Senior Breeder', 85, 340000, 'Breeding']
    );

    // 8. Populate Calves, Herdbook Registrations, Pedigree, Certificates
    console.log('[Seed] Populating calves, herdbook_registrations, pedigrees, certificates...');
    const calfId = 'CLF-2026-001';
    const regId = 'HR-2026-001';
    const regNum = 'KH-2026-8891';
    const token = 'token_demo_verify_kh2026';
    const certId = 'CERT-2026-001';
    const certNum = 'KC-998811';

    await client.query(
      `INSERT INTO calves (id, breeding_program_id, sire_id, dam_id, name, sex, breed, birth_date, birth_weight, owner_name, farm_location, breeder_name, status)
       VALUES ($1, 'BP-2026-001', 'SIR-001', 'DAM-001', 'Wagyu Calf Prince 01', 'Male', 'Wagyu Cross', CURRENT_DATE - INTERVAL '10 days', 28.5, 'SNR Farm Owner', 'រទាំង', 'Senior Breeder', 'Registered to Herdbook')
       ON CONFLICT (id) DO NOTHING`,
      [calfId]
    );

    await client.query(
      `INSERT INTO herdbook_registrations (id, registration_number, animal_type, animal_id, sire_id, dam_id, calf_id, breeding_program_id, owner_name, farm_location, breeder_name, registration_date, status, approved_by, approved_at, public_token)
       VALUES ($1, $2, 'Calf', $3, 'SIR-001', 'DAM-001', $3, 'BP-2026-001', 'SNR Farm Owner', 'រទាំង', 'Senior Breeder', CURRENT_DATE, 'Published', 'Super Admin', CURRENT_TIMESTAMP, $4)
       ON CONFLICT (id) DO NOTHING`,
      [regId, regNum, calfId, token]
    );

    await client.query(
      `INSERT INTO pedigrees (animal_id, sire_id, dam_id, generation_level, verified)
       VALUES ($1, 'SIR-001', 'DAM-001', 2, true)
       ON CONFLICT (animal_id) DO NOTHING`,
      [calfId]
    );

    await client.query(
      `INSERT INTO certificates (id, certificate_number, registration_id, calf_id, issue_date, layout_type, public_verification_url, qr_code_data)
       VALUES ($1, $2, $3, $4, CURRENT_DATE, 'A4 Landscape', $5, $5)
       ON CONFLICT (id) DO NOTHING`,
      [certId, certNum, regId, calfId, `/public/verify/${token}`]
    );

    await client.query('COMMIT');
    console.log('=== Kaksedthan Herdbook Database Seeding Completed Successfully! ===');
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
