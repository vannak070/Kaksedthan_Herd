/**
 * ECOSYSTEM ALIGNMENT MIGRATION
 * ─────────────────────────────────────────────────────────────────────────────
 * Purpose : Connect Breeding Operations into ONE linked ecosystem.
 *           Creates sourcing_companies table, breed_configurations table,
 *           and adds breeder_id / customer_id / sourcing_company_id FK columns
 *           to all core animal and transaction tables.
 *
 * Safety  : 100 % non-destructive — uses CREATE TABLE IF NOT EXISTS and
 *           ADD COLUMN IF NOT EXISTS throughout.  Existing data is preserved.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { pool, connectWithRetry } from '../../config/database';

export async function migrateEcosystemAlignment() {
  console.log('=== 🌐  Ecosystem Alignment Migration ===');
  await connectWithRetry(5, 2000);
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // ── 1. sourcing_companies table ───────────────────────────────────────────
    console.log('[1/12] Creating sourcing_companies table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS sourcing_companies (
        id            VARCHAR(50) PRIMARY KEY,
        code          VARCHAR(50) UNIQUE NOT NULL,
        name          VARCHAR(150) NOT NULL,
        country       VARCHAR(100),
        contact_name  VARCHAR(100),
        phone         VARCHAR(50),
        email         VARCHAR(100),
        address       TEXT,
        website       VARCHAR(200),
        image_url     TEXT,
        notes         TEXT,
        status        VARCHAR(20) DEFAULT 'Active',
        user_id       VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
        created_at    TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at    TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('[✓] sourcing_companies');

    // ── 2. breed_configurations table ────────────────────────────────────────
    console.log('[2/12] Creating breed_configurations table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS breed_configurations (
        id          VARCHAR(50) PRIMARY KEY,
        code        VARCHAR(50) UNIQUE NOT NULL,
        name        VARCHAR(100) NOT NULL,
        category    VARCHAR(50) DEFAULT 'Beef',
        origin      VARCHAR(100),
        description TEXT,
        is_active   BOOLEAN DEFAULT true,
        sort_order  INTEGER DEFAULT 10,
        created_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('[✓] breed_configurations');

    // ── 3. Seed default breeds (ON CONFLICT DO NOTHING = idempotent) ─────────
    console.log('[3/12] Seeding default breed configurations...');
    const defaultBreeds = [
      { id: 'BRD-01', code: 'WAGYU',        name: 'Wagyu',           category: 'Beef',         origin: 'Japan',        sort: 1 },
      { id: 'BRD-02', code: 'BRAHMAN',      name: 'Brahman',         category: 'Beef',         origin: 'India / USA',  sort: 2 },
      { id: 'BRD-03', code: 'WAGYU_CROSS',  name: 'Wagyu Cross',     category: 'Beef',         origin: 'Cross Breed',  sort: 3 },
      { id: 'BRD-04', code: 'ANGUS',        name: 'Angus',           category: 'Beef',         origin: 'Scotland',     sort: 4 },
      { id: 'BRD-05', code: 'SIMMENTAL',    name: 'Simmental',       category: 'Dual Purpose', origin: 'Switzerland',  sort: 5 },
      { id: 'BRD-06', code: 'LIMOUSIN',     name: 'Limousin',        category: 'Beef',         origin: 'France',       sort: 6 },
      { id: 'BRD-07', code: 'DROUGHTMASTER',name: 'Droughtmaster',   category: 'Beef',         origin: 'Australia',    sort: 7 },
      { id: 'BRD-08', code: 'SENEPOL',      name: 'Senepol',         category: 'Beef',         origin: 'USA',          sort: 8 },
      { id: 'BRD-09', code: 'BRANGUS',      name: 'Brangus',         category: 'Beef',         origin: 'USA',          sort: 9 },
      { id: 'BRD-10', code: 'KHMER_LOCAL',  name: 'Khmer Local',     category: 'Dual Purpose', origin: 'Cambodia',     sort: 10 },
    ];

    for (const b of defaultBreeds) {
      await client.query(`
        INSERT INTO breed_configurations (id, code, name, category, origin, sort_order)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (code) DO NOTHING
      `, [b.id, b.code, b.name, b.category, b.origin, b.sort]);
    }
    console.log('[✓] breed_configurations seeded');

    // ── 4. Seed default sourcing companies ───────────────────────────────────
    console.log('[4/12] Seeding default sourcing companies...');
    const defaultCompanies = [
      { id: 'SC-01', code: 'ABS_GLOBAL',    name: 'ABS Global Inc.',              country: 'USA',       phone: '+1-800-227-6637', email: 'info@absglobal.com',       website: 'https://www.absglobal.com' },
      { id: 'SC-02', code: 'SEMEX',         name: 'Semex Alliance',               country: 'Canada',    phone: '+1-519-821-5060', email: 'info@semex.com',           website: 'https://www.semex.com' },
      { id: 'SC-03', code: 'CRV',           name: 'CRV International',            country: 'Netherlands', phone: '+31-26-389-1111', email: 'info@crv4all.com',       website: 'https://www.crv4all.com' },
      { id: 'SC-04', code: 'ANGUS_AUS',     name: 'Angus Australia',              country: 'Australia', phone: '+61-2-9736-2022', email: 'info@angusaustralia.com.au', website: 'https://www.angusaustralia.com.au' },
      { id: 'SC-05', code: 'WAGYU_INTL',    name: 'Wagyu International',          country: 'Japan',     phone: '',               email: 'info@wagyu.jp',            website: '' },
      { id: 'SC-06', code: 'KAKSEDTHAN',    name: 'Kaksedthan Livestock Station', country: 'Cambodia',  phone: '+855 23 000 000', email: 'info@kaksedthan.gov.kh',   website: '' },
    ];

    for (const c of defaultCompanies) {
      await client.query(`
        INSERT INTO sourcing_companies (id, code, name, country, phone, email, website, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'Active')
        ON CONFLICT (code) DO NOTHING
      `, [c.id, c.code, c.name, c.country, c.phone, c.email, c.website]);
    }
    console.log('[✓] sourcing_companies seeded');

    // ── 5. Fix sires.sourcing_company_id — must reference sourcing_companies ─
    // The previous migration pointed this to users.id (wrong). We drop and re-add.
    console.log('[5/12] Fixing sires.sourcing_company_id FK reference...');
    // Drop old FK constraint if it references users
    await client.query(`
      DO $$
      DECLARE
        r RECORD;
      BEGIN
        FOR r IN
          SELECT conname FROM pg_constraint
          WHERE conrelid = 'sires'::regclass
            AND contype = 'f'
            AND conname LIKE '%sourcing_company_id%'
        LOOP
          EXECUTE 'ALTER TABLE sires DROP CONSTRAINT IF EXISTS ' || quote_ident(r.conname);
        END LOOP;
      END $$;
    `);
    // Ensure column exists and re-add proper FK
    await client.query(`ALTER TABLE sires ADD COLUMN IF NOT EXISTS sourcing_company_id VARCHAR(50);`);
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint
          WHERE conrelid = 'sires'::regclass
            AND conname = 'sires_sourcing_company_id_fkey_sc'
        ) THEN
          ALTER TABLE sires
            ADD CONSTRAINT sires_sourcing_company_id_fkey_sc
            FOREIGN KEY (sourcing_company_id) REFERENCES sourcing_companies(id) ON DELETE SET NULL;
        END IF;
      END $$;
    `);
    // Backfill sourcing_company_id from text name where possible
    await client.query(`
      UPDATE sires s
      SET sourcing_company_id = sc.id
      FROM sourcing_companies sc
      WHERE s.sourcing_company_id IS NULL
        AND (
          LOWER(s.sourcing_company) ILIKE '%' || LOWER(sc.name) || '%'
          OR LOWER(sc.name) ILIKE '%' || LOWER(s.sourcing_company) || '%'
          OR LOWER(s.sourcing_company) = LOWER(sc.code)
        )
    `);
    // Default remaining sires to 'ABS Global Inc.' (SC-01) if they have ABS in name
    await client.query(`
      UPDATE sires SET sourcing_company_id = 'SC-01'
      WHERE sourcing_company_id IS NULL AND (sourcing_company ILIKE '%ABS%' OR sourcing_company IS NULL OR sourcing_company = '')
    `);
    console.log('[✓] sires.sourcing_company_id fixed');

    // ── 6. Add breeder_id to sires ───────────────────────────────────────────
    console.log('[6/12] Adding breeder_id to sires...');
    await client.query(`ALTER TABLE sires ADD COLUMN IF NOT EXISTS breeder_id VARCHAR(50) REFERENCES breeders(id) ON DELETE SET NULL;`);
    console.log('[✓] sires.breeder_id');

    // ── 7. Add breeder_id + customer_id to dams ──────────────────────────────
    console.log('[7/12] Adding breeder_id + customer_id to dams...');
    await client.query(`ALTER TABLE dams ADD COLUMN IF NOT EXISTS breeder_id VARCHAR(50) REFERENCES breeders(id) ON DELETE SET NULL;`);
    await client.query(`ALTER TABLE dams ADD COLUMN IF NOT EXISTS customer_id VARCHAR(50) REFERENCES customers(id) ON DELETE SET NULL;`);
    // Backfill: try to link dams to customers by owner_name match
    await client.query(`
      UPDATE dams d
      SET customer_id = c.id
      FROM customers c
      WHERE d.customer_id IS NULL
        AND c.name = d.owner_name
        AND d.owner_name IS NOT NULL
    `);
    console.log('[✓] dams.breeder_id + dams.customer_id');

    // ── 8. Add breeder_id + customer_id to calves ────────────────────────────
    console.log('[8/12] Adding breeder_id + customer_id to calves...');
    await client.query(`ALTER TABLE calves ADD COLUMN IF NOT EXISTS breeder_id VARCHAR(50) REFERENCES breeders(id) ON DELETE SET NULL;`);
    await client.query(`ALTER TABLE calves ADD COLUMN IF NOT EXISTS customer_id VARCHAR(50) REFERENCES customers(id) ON DELETE SET NULL;`);
    // Backfill: try to link calves to customers by owner_name match
    await client.query(`
      UPDATE calves c
      SET customer_id = cu.id
      FROM customers cu
      WHERE c.customer_id IS NULL
        AND cu.name = c.owner_name
        AND c.owner_name IS NOT NULL
    `);
    // Backfill breeder_id on calves from breeding_programs
    await client.query(`
      UPDATE calves c
      SET breeder_id = bp.breeder_id
      FROM breeding_programs bp
      WHERE c.breeder_id IS NULL
        AND c.breeding_program_id = bp.id
        AND bp.breeder_id IS NOT NULL
    `);
    console.log('[✓] calves.breeder_id + calves.customer_id');

    // ── 9. Add breeder_id + sourcing_company_id to stock_insemination ────────
    console.log('[9/12] Adding breeder_id + sourcing_company_id to stock_insemination...');
    await client.query(`ALTER TABLE stock_insemination ADD COLUMN IF NOT EXISTS breeder_id VARCHAR(50) REFERENCES breeders(id) ON DELETE SET NULL;`);
    await client.query(`ALTER TABLE stock_insemination ADD COLUMN IF NOT EXISTS sourcing_company_id VARCHAR(50) REFERENCES sourcing_companies(id) ON DELETE SET NULL;`);
    // Backfill from sire's sourcing_company_id
    await client.query(`
      UPDATE stock_insemination si
      SET sourcing_company_id = s.sourcing_company_id
      FROM sires s
      WHERE si.sourcing_company_id IS NULL
        AND si.sire_id = s.id
        AND s.sourcing_company_id IS NOT NULL
    `);
    console.log('[✓] stock_insemination.breeder_id + sourcing_company_id');

    // ── 10. Add customer_id to breeding_programs ─────────────────────────────
    console.log('[10/12] Adding customer_id to breeding_programs...');
    await client.query(`ALTER TABLE breeding_programs ADD COLUMN IF NOT EXISTS customer_id VARCHAR(50) REFERENCES customers(id) ON DELETE SET NULL;`);
    // Backfill: match cow_owner or owner_name to customers.name
    await client.query(`
      UPDATE breeding_programs bp
      SET customer_id = c.id
      FROM customers c
      WHERE bp.customer_id IS NULL
        AND (c.name = bp.cow_owner OR c.name = bp.owner_name)
        AND bp.cow_owner IS NOT NULL
    `);
    console.log('[✓] breeding_programs.customer_id');

    // ── 11. Add breeder_id to herdbook_registrations ─────────────────────────
    console.log('[11/12] Adding breeder_id to herdbook_registrations...');
    await client.query(`ALTER TABLE herdbook_registrations ADD COLUMN IF NOT EXISTS breeder_id VARCHAR(50) REFERENCES breeders(id) ON DELETE SET NULL;`);
    // Backfill from breeding_programs
    await client.query(`
      UPDATE herdbook_registrations hr
      SET breeder_id = bp.breeder_id
      FROM breeding_programs bp
      WHERE hr.breeder_id IS NULL
        AND hr.breeding_program_id = bp.id
        AND bp.breeder_id IS NOT NULL
    `);
    // Also backfill from calves
    await client.query(`
      UPDATE herdbook_registrations hr
      SET breeder_id = c.breeder_id
      FROM calves c
      WHERE hr.breeder_id IS NULL
        AND hr.calf_id = c.id
        AND c.breeder_id IS NOT NULL
    `);
    console.log('[✓] herdbook_registrations.breeder_id');

    // ── 12. Add breeder_id to certificates + performance indexes ─────────────
    console.log('[12/12] Adding breeder_id to certificates + indexes...');
    await client.query(`ALTER TABLE certificates ADD COLUMN IF NOT EXISTS breeder_id VARCHAR(50) REFERENCES breeders(id) ON DELETE SET NULL;`);
    // Backfill from herdbook_registrations
    await client.query(`
      UPDATE certificates cert
      SET breeder_id = hr.breeder_id
      FROM herdbook_registrations hr
      WHERE cert.breeder_id IS NULL
        AND cert.registration_id = hr.id
        AND hr.breeder_id IS NOT NULL
    `);

    // Performance indexes
    await client.query(`CREATE INDEX IF NOT EXISTS idx_sires_breeder_id ON sires(breeder_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_sires_sourcing_company_id ON sires(sourcing_company_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_dams_breeder_id ON dams(breeder_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_dams_customer_id ON dams(customer_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_calves_breeder_id ON calves(breeder_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_calves_customer_id ON calves(customer_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_stock_insemination_sourcing_company_id ON stock_insemination(sourcing_company_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_breeding_programs_customer_id ON breeding_programs(customer_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_herdbook_registrations_breeder_id ON herdbook_registrations(breeder_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_certificates_breeder_id ON certificates(breeder_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_sourcing_companies_code ON sourcing_companies(code);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_breed_configs_code ON breed_configurations(code);`);
    console.log('[✓] Indexes created');

    await client.query('COMMIT');
    console.log('\n✅ Ecosystem Alignment Migration completed successfully!');
    console.log('   - sourcing_companies table: ✓');
    console.log('   - breed_configurations table: ✓');
    console.log('   - sires: sourcing_company_id (fixed FK), breeder_id ✓');
    console.log('   - dams: breeder_id, customer_id ✓');
    console.log('   - calves: breeder_id, customer_id ✓');
    console.log('   - stock_insemination: breeder_id, sourcing_company_id ✓');
    console.log('   - breeding_programs: customer_id ✓');
    console.log('   - herdbook_registrations: breeder_id ✓');
    console.log('   - certificates: breeder_id ✓');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Ecosystem alignment migration failed:', err);
    throw err;
  } finally {
    client.release();
  }
}

if (require.main === module) {
  migrateEcosystemAlignment()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
