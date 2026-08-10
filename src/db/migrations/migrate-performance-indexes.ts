import { query, withTransaction } from '../../config/database';

export async function migratePerformanceIndexes() {
  console.log('=== ⚡ Creating High-Speed Database Indexes on PostgreSQL ===');

  await withTransaction(async (client) => {
    // 1. Sires Indexes
    await client.query(`CREATE INDEX IF NOT EXISTS idx_sires_sourcing_company_id ON sires(sourcing_company_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_sires_status ON sires(status);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_sires_created_at ON sires(created_at DESC);`);
    console.log('[✓] Indexed sires table');

    // 2. Dams Indexes
    await client.query(`CREATE INDEX IF NOT EXISTS idx_dams_owner_id ON dams(owner_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_dams_farm_id ON dams(farm_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_dams_availability ON dams(availability);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_dams_pregnancy_status ON dams(pregnancy_status);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_dams_created_at ON dams(created_at DESC);`);
    console.log('[✓] Indexed dams table');

    // 3. Stock Insemination Indexes
    await client.query(`CREATE INDEX IF NOT EXISTS idx_stock_insemination_sire_id ON stock_insemination(sire_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_stock_insemination_availability ON stock_insemination(availability);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_stock_insemination_created_at ON stock_insemination(created_at DESC);`);
    console.log('[✓] Indexed stock_insemination table');

    // 4. Breeding Programs Indexes
    await client.query(`CREATE INDEX IF NOT EXISTS idx_breeding_programs_sire_id ON breeding_programs(sire_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_breeding_programs_dam_id ON breeding_programs(dam_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_breeding_programs_owner_id ON breeding_programs(owner_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_breeding_programs_farm_id ON breeding_programs(farm_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_breeding_programs_breeder_id ON breeding_programs(breeder_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_breeding_programs_status ON breeding_programs(status);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_breeding_programs_created_at ON breeding_programs(created_at DESC);`);
    console.log('[✓] Indexed breeding_programs table');

    // 5. Calves Indexes
    await client.query(`CREATE INDEX IF NOT EXISTS idx_calves_breeding_program_id ON calves(breeding_program_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_calves_sire_id ON calves(sire_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_calves_dam_id ON calves(dam_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_calves_owner_id ON calves(owner_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_calves_farm_id ON calves(farm_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_calves_created_at ON calves(created_at DESC);`);
    console.log('[✓] Indexed calves table');

    // 6. Certificates & Registrations Indexes
    await client.query(`CREATE INDEX IF NOT EXISTS idx_certificates_registration_id ON certificates(registration_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_herdbook_registrations_public_token ON herdbook_registrations(public_token);`);
    console.log('[✓] Indexed certificates & herdbook_registrations tables');
  });

  console.log('✅ Performance indexing migration executed successfully!');
}

if (require.main === module) {
  migratePerformanceIndexes()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Index migration failed:', err);
      process.exit(1);
    });
}
