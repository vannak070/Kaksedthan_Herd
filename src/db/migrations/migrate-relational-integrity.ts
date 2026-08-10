import { query, withTransaction } from '../../config/database';

export async function migrateRelationalIntegrity() {
  console.log('=== 🏗️  Migrating Relational Foreign Key Integrity ===');

  await withTransaction(async (client) => {
    // 1. Add sourcing_company_id to sires table
    await client.query(`
      ALTER TABLE sires ADD COLUMN IF NOT EXISTS sourcing_company_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL;
    `);
    console.log('[✓] Added sourcing_company_id to sires table');

    // 2. Add owner_id and farm_id to dams table
    await client.query(`
      ALTER TABLE dams ADD COLUMN IF NOT EXISTS owner_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL;
      ALTER TABLE dams ADD COLUMN IF NOT EXISTS farm_id VARCHAR(50) REFERENCES farms(id) ON DELETE SET NULL;
    `);
    console.log('[✓] Added owner_id & farm_id to dams table');

    // 3. Add owner_id, farm_id, and breeder_id to breeding_programs table
    await client.query(`
      ALTER TABLE breeding_programs ADD COLUMN IF NOT EXISTS owner_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL;
      ALTER TABLE breeding_programs ADD COLUMN IF NOT EXISTS farm_id VARCHAR(50) REFERENCES farms(id) ON DELETE SET NULL;
      ALTER TABLE breeding_programs ADD COLUMN IF NOT EXISTS breeder_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL;
    `);
    console.log('[✓] Added owner_id, farm_id, breeder_id to breeding_programs table');

    // 4. Add owner_id and farm_id to calves table
    await client.query(`
      ALTER TABLE calves ADD COLUMN IF NOT EXISTS owner_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL;
      ALTER TABLE calves ADD COLUMN IF NOT EXISTS farm_id VARCHAR(50) REFERENCES farms(id) ON DELETE SET NULL;
    `);
    console.log('[✓] Added owner_id & farm_id to calves table');

    // 5. Populate foreign key IDs from text names where existing records match
    await client.query(`
      UPDATE sires s
      SET sourcing_company_id = u.id
      FROM users u
      WHERE s.sourcing_company_id IS NULL AND (u.name = s.sourcing_company OR u.name = s.owner_name);
    `);

    await client.query(`
      UPDATE dams d
      SET owner_id = u.id
      FROM users u
      WHERE d.owner_id IS NULL AND u.name = d.owner_name;
    `);

    await client.query(`
      UPDATE dams d
      SET farm_id = f.id
      FROM farms f
      WHERE d.farm_id IS NULL AND f.name = d.farm_location;
    `);

    await client.query(`
      UPDATE breeding_programs bp
      SET owner_id = u.id
      FROM users u
      WHERE bp.owner_id IS NULL AND u.name = bp.owner_name;
    `);

    await client.query(`
      UPDATE breeding_programs bp
      SET farm_id = f.id
      FROM farms f
      WHERE bp.farm_id IS NULL AND f.name = bp.farm_location;
    `);

    await client.query(`
      UPDATE breeding_programs bp
      SET breeder_id = u.id
      FROM users u
      WHERE bp.breeder_id IS NULL AND u.name = bp.breeder_name;
    `);

    await client.query(`
      UPDATE calves c
      SET owner_id = u.id
      FROM users u
      WHERE c.owner_id IS NULL AND u.name = c.owner_name;
    `);

    await client.query(`
      UPDATE calves c
      SET farm_id = f.id
      FROM farms f
      WHERE c.farm_id IS NULL AND f.name = c.farm_location;
    `);

    console.log('[✓] Successfully backfilled foreign key ID relationships from existing master data');
  });

  console.log('✅ Relational foreign key integrity migration completed successfully!');
}

if (require.main === module) {
  migrateRelationalIntegrity()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Migration failed:', err);
      process.exit(1);
    });
}
