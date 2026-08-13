import { Pool } from 'pg';

export async function runSireSetupMigration(pool: Pool) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    console.log('[1/4] Adding Sire setup architectural columns to sires table...');

    await client.query(`
      ALTER TABLE sires 
        ADD COLUMN IF NOT EXISTS owner_type VARCHAR(50) DEFAULT 'Internal Company',
        ADD COLUMN IF NOT EXISTS owner_id VARCHAR(50),
        ADD COLUMN IF NOT EXISTS farm_id VARCHAR(50),
        ADD COLUMN IF NOT EXISTS registration_number VARCHAR(100),
        ADD COLUMN IF NOT EXISTS ownership_status VARCHAR(50) DEFAULT 'Active',
        ADD COLUMN IF NOT EXISTS ownership_start_date TIMESTAMP WITH TIME ZONE;
    `);

    // Add Foreign Key from sires.farm_id to farms.id
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint
          WHERE conrelid = 'sires'::regclass
            AND conname = 'sires_farm_id_fkey'
        ) THEN
          ALTER TABLE sires
            ADD CONSTRAINT sires_farm_id_fkey
            FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE SET NULL;
        END IF;
      END $$;
    `);

    console.log('[2/4] Backfilling farm_id from farm_location text matches...');
    await client.query(`
      UPDATE sires s
      SET farm_id = f.id
      FROM farms f
      WHERE s.farm_id IS NULL
        AND s.farm_location IS NOT NULL
        AND (
          LOWER(TRIM(s.farm_location)) = LOWER(TRIM(f.name))
          OR LOWER(TRIM(s.farm_location)) = LOWER(TRIM(f.code))
        );
    `);

    console.log('[3/4] Backfilling owner_type and owner_id from existing owners...');
    // Match Breeders
    await client.query(`
      UPDATE sires s
      SET owner_type = 'Breeder', owner_id = b.id
      FROM breeders b
      WHERE s.owner_id IS NULL
        AND s.owner_name IS NOT NULL
        AND LOWER(TRIM(b.name)) = LOWER(TRIM(s.owner_name));
    `);

    // Match Farms
    await client.query(`
      UPDATE sires s
      SET owner_type = 'Farm Station', owner_id = f.id
      FROM farms f
      WHERE s.owner_id IS NULL
        AND s.owner_name IS NOT NULL
        AND LOWER(TRIM(f.name)) = LOWER(TRIM(s.owner_name));
    `);

    // Match Sourcing Companies
    await client.query(`
      UPDATE sires s
      SET owner_type = 'Sire Sourcing Company', owner_id = sc.id
      FROM sourcing_companies sc
      WHERE s.owner_id IS NULL
        AND (sc.id = s.sourcing_company_id OR (s.owner_name IS NOT NULL AND LOWER(TRIM(sc.name)) = LOWER(TRIM(s.owner_name))));
    `);

    console.log('[4/4] Creating indexes for fast queries...');
    await client.query(`CREATE INDEX IF NOT EXISTS idx_sires_owner_type_id ON sires(owner_type, owner_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_sires_farm_id ON sires(farm_id);`);

    await client.query('COMMIT');
    console.log('[✓] Sire Setup Architecture Migration Completed Successfully!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[X] Sire Setup Migration Failed:', err);
    throw err;
  } finally {
    client.release();
  }
}
