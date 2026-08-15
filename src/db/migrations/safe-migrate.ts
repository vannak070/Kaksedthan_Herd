/**
 * SAFE PRODUCTION MIGRATION SCRIPT
 * ─────────────────────────────────────────────────────────────────────────────
 * Purpose : Ensure the production database schema is up-to-date WITHOUT
 *           touching any existing data.  Uses CREATE TABLE IF NOT EXISTS and
 *           ADD COLUMN IF NOT EXISTS throughout — 100 % non-destructive.
 *
 * ⚠️  DO NOT run init-db.ts / restore-db in production — it seeds local test
 *     data and drops/recreates all tables, wiping the production database.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import fs from 'fs';
import path from 'path';
import { pool, connectWithRetry } from '../../config/database';
import { migrateUserLevelsEnhanced } from './migrate-user-levels-enhanced';
import { migrateAccessControlV2 } from './migrate-access-control-v2';

async function safeMigrate() {
  console.log('=== 🛡️  Safe Production Schema Migration (non-destructive) ===');
  await connectWithRetry(5, 2000);
  const client = await pool.connect();

  try {
    // ── 1. master_settings ──────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS master_settings (
        id         SERIAL PRIMARY KEY,
        key        VARCHAR(50) UNIQUE NOT NULL,
        data       JSONB NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('[✓] master_settings');

    // ── 2. users ─────────────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id         VARCHAR(50) PRIMARY KEY,
        name       VARCHAR(100) NOT NULL,
        email      VARCHAR(100) UNIQUE NOT NULL,
        role       VARCHAR(50)  NOT NULL,
        status     VARCHAR(20)  DEFAULT 'Active',
        password   VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    // Optional columns added in later migrations
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS farm_location VARCHAR(100);`);
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '[]'::jsonb;`);
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS breeder_id VARCHAR(50);`);
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS farm_id VARCHAR(50);`);
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS customer_id VARCHAR(50);`);
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS sourcing_company_id VARCHAR(50);`);
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS user_level_id VARCHAR(50);`);
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS user_level VARCHAR(100);`);
    await client.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id                   VARCHAR(50) PRIMARY KEY,
        name                 VARCHAR(100) NOT NULL,
        phone                VARCHAR(50),
        email                VARCHAR(100),
        address              TEXT,
        status               VARCHAR(20) DEFAULT 'Active',
        created_at           TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await client.query(`ALTER TABLE customers ADD COLUMN IF NOT EXISTS farm_location VARCHAR(100);`);
    console.log('[✓] users & customers base');

    // ── 3. stock ─────────────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS stock (
        id             VARCHAR(50) PRIMARY KEY,
        no             VARCHAR(20) NOT NULL,
        breed          VARCHAR(50),
        sex            VARCHAR(20),
        age            VARCHAR(50),
        weight         NUMERIC(10,2) DEFAULT 0,
        owner_name     VARCHAR(100),
        location       VARCHAR(100),
        phone          VARCHAR(50),
        buy_type       VARCHAR(50),
        unit_price     NUMERIC(12,2) DEFAULT 0,
        total_price    NUMERIC(12,2) DEFAULT 0,
        health_status  VARCHAR(50) DEFAULT 'Good',
        status         VARCHAR(50) DEFAULT 'Active',
        purchase_date  TIMESTAMP WITH TIME ZONE,
        remark         TEXT,
        purchase_type  VARCHAR(50),
        payment_method VARCHAR(50),
        image_url      TEXT,
        created_at     TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at     TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    // Optional columns added for breeding & lineage
    await client.query(`ALTER TABLE stock ADD COLUMN IF NOT EXISTS purpose VARCHAR(50) DEFAULT 'Fattening';`);
    await client.query(`ALTER TABLE stock ADD COLUMN IF NOT EXISTS dam_id VARCHAR(50);`);
    await client.query(`ALTER TABLE stock ADD COLUMN IF NOT EXISTS sire_id VARCHAR(50);`);
    await client.query(`ALTER TABLE stock ADD COLUMN IF NOT EXISTS breeding_status VARCHAR(50) DEFAULT 'Open';`);
    console.log('[✓] stock');

    // ── 4. weight_tracking ───────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS weight_tracking (
        id             SERIAL PRIMARY KEY,
        cow_id         VARCHAR(50) NOT NULL REFERENCES stock(id) ON DELETE CASCADE,
        breed          VARCHAR(50),
        age            VARCHAR(50),
        old_weight     NUMERIC(10,2) DEFAULT 0,
        current_weight NUMERIC(10,2) DEFAULT 0,
        gain_loss      NUMERIC(10,4) DEFAULT 0,
        health_status  VARCHAR(50),
        status         VARCHAR(50),
        tracking_date  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('[✓] weight_tracking');

    // ── 5. sales_tracking ────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS sales_tracking (
        id          SERIAL PRIMARY KEY,
        cow_id      VARCHAR(50) NOT NULL REFERENCES stock(id) ON DELETE CASCADE,
        breed       VARCHAR(50),
        age         VARCHAR(50),
        weight      NUMERIC(10,2) DEFAULT 0,
        unit_price  NUMERIC(12,2) DEFAULT 0,
        total_price NUMERIC(12,2) DEFAULT 0,
        status      VARCHAR(50) DEFAULT 'Sold',
        sales_date  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        sale_type   VARCHAR(50),
        buyer       VARCHAR(100)
      );
    `);
    console.log('[✓] sales_tracking');

    // ── 6. batches ───────────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS batches (
        id            VARCHAR(50) PRIMARY KEY,
        name          VARCHAR(100) NOT NULL,
        type          VARCHAR(50)  NOT NULL,
        start_date    TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        status        VARCHAR(20)  DEFAULT 'Active',
        notes         TEXT,
        farm_location VARCHAR(100),
        created_at    TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    // feeding_program & expected_selling_price columns added in later migration
    await client.query(`ALTER TABLE batches ADD COLUMN IF NOT EXISTS feeding_program JSONB DEFAULT NULL;`);
    await client.query(`ALTER TABLE batches ADD COLUMN IF NOT EXISTS expected_selling_price NUMERIC DEFAULT NULL;`);
    console.log('[✓] batches');

    // ── 7. batch_cows ─────────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS batch_cows (
        batch_id VARCHAR(50) NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
        cow_id   VARCHAR(50) NOT NULL REFERENCES stock(id)   ON DELETE CASCADE,
        PRIMARY KEY (batch_id, cow_id)
      );
    `);
    console.log('[✓] batch_cows');

    // ── 8. health_logs ───────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS health_logs (
        id             VARCHAR(50) PRIMARY KEY,
        cow_id         VARCHAR(50) NOT NULL REFERENCES stock(id) ON DELETE CASCADE,
        type           VARCHAR(50)  NOT NULL,
        name           VARCHAR(100) NOT NULL,
        date           TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        administered_by VARCHAR(100),
        cost           NUMERIC(10,2) DEFAULT 0,
        notes          TEXT,
        created_at     TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS breed_configurations (
        id           VARCHAR(50) PRIMARY KEY,
        name         VARCHAR(100) NOT NULL,
        code         VARCHAR(50),
        species      VARCHAR(50) DEFAULT 'Cattle',
        description  TEXT,
        status       VARCHAR(20) DEFAULT 'Active',
        created_at   TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS sourcing_companies (
        id           VARCHAR(50) PRIMARY KEY,
        code         VARCHAR(50),
        name         VARCHAR(100) NOT NULL,
        country      VARCHAR(100),
        contact_person VARCHAR(100),
        phone        VARCHAR(50),
        email        VARCHAR(100),
        image_url    TEXT,
        notes        TEXT,
        status       VARCHAR(20) DEFAULT 'Active',
        created_at   TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      ALTER TABLE breed_configurations ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'Cattle';
      ALTER TABLE breed_configurations ADD COLUMN IF NOT EXISTS origin VARCHAR(100);
      ALTER TABLE breed_configurations ADD COLUMN IF NOT EXISTS description TEXT;
      ALTER TABLE breed_configurations ADD COLUMN IF NOT EXISTS image_url TEXT;
      ALTER TABLE breed_configurations ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
      ALTER TABLE breed_configurations ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
      ALTER TABLE breed_configurations ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
      CREATE UNIQUE INDEX IF NOT EXISTS idx_breed_configs_code ON breed_configurations(code);

      ALTER TABLE sourcing_companies ADD COLUMN IF NOT EXISTS country VARCHAR(100);
      ALTER TABLE sourcing_companies ADD COLUMN IF NOT EXISTS image_url TEXT;
      ALTER TABLE sourcing_companies ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'Active';
      ALTER TABLE sourcing_companies ADD COLUMN IF NOT EXISTS contact_person VARCHAR(100);
      ALTER TABLE sourcing_companies ADD COLUMN IF NOT EXISTS contact_name VARCHAR(100);
      ALTER TABLE sourcing_companies ADD COLUMN IF NOT EXISTS address TEXT;
      ALTER TABLE sourcing_companies ADD COLUMN IF NOT EXISTS website TEXT;
      ALTER TABLE sourcing_companies ADD COLUMN IF NOT EXISTS user_id VARCHAR(50);
      ALTER TABLE sourcing_companies ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
      ALTER TABLE sourcing_companies ADD COLUMN IF NOT EXISTS email VARCHAR(100);
      ALTER TABLE sourcing_companies ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
      CREATE UNIQUE INDEX IF NOT EXISTS idx_sourcing_companies_code ON sourcing_companies(code);
    `);
    console.log('[✓] breed_configurations & sourcing_companies');

    // ── 9. expenses ──────────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS expenses (
        id            VARCHAR(50) PRIMARY KEY,
        category      VARCHAR(50) NOT NULL,
        amount        NUMERIC(12,2) DEFAULT 0,
        date          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        description   TEXT,
        farm_location VARCHAR(100),
        created_at    TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await client.query(`ALTER TABLE expenses ADD COLUMN IF NOT EXISTS farm_location VARCHAR(100);`);

    // Seed expenses from src/data/db.json safely (ON CONFLICT DO NOTHING)
    try {
      const dbJsonPath = path.join(__dirname, '../../data/db.json');
      if (fs.existsSync(dbJsonPath)) {
        const raw = fs.readFileSync(dbJsonPath, 'utf-8');
        const dbData = JSON.parse(raw);
        if (Array.isArray(dbData.expenses) && dbData.expenses.length > 0) {
          const values: any[] = [];
          const valueClauses: string[] = [];
          dbData.expenses.forEach((exp: any, idx: number) => {
            const base = idx * 6;
            valueClauses.push(`($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6})`);
            values.push(exp.id, exp.category, exp.amount || 0, exp.date ? new Date(exp.date) : new Date(), exp.description || '', exp.farmLocation || null);
          });
          await client.query(`
            INSERT INTO expenses (id, category, amount, date, description, farm_location)
            VALUES ${valueClauses.join(', ')}
            ON CONFLICT (id) DO NOTHING;
          `, values);
          console.log(`[✓] Synced ${dbData.expenses.length} expense entries to database.`);
        }
      }
    } catch (e) {
      console.warn('[!] Note on expense sync:', e);
    }
    console.log('[✓] expenses');

    // ── 10. feed_products & feed_transactions ─────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS feed_products (
        id                 VARCHAR(50) PRIMARY KEY,
        name               VARCHAR(100) NOT NULL,
        category           VARCHAR(50),
        unit               VARCHAR(20) DEFAULT 'bag',
        weight_per_unit    NUMERIC(10,2) DEFAULT 30,
        unit_cost          NUMERIC(15,4) DEFAULT 0,
        cost_type          VARCHAR(20) DEFAULT 'per_bag',
        cost_per_bag       NUMERIC(15,2) DEFAULT 0,
        min_threshold_bags NUMERIC(10,2) DEFAULT 50,
        min_threshold_kg   NUMERIC(10,2) DEFAULT 1500,
        description        TEXT,
        supplier           VARCHAR(100),
        status             VARCHAR(20) DEFAULT 'Active',
        created_at         TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at         TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      ALTER TABLE feed_products ADD COLUMN IF NOT EXISTS cost_type VARCHAR(20) DEFAULT 'per_bag';
      ALTER TABLE feed_products ADD COLUMN IF NOT EXISTS cost_per_bag NUMERIC(15,2) DEFAULT 0;

      CREATE TABLE IF NOT EXISTS feed_transactions (
        id VARCHAR(100) PRIMARY KEY,
        date TIMESTAMP WITH TIME ZONE NOT NULL,
        product_id VARCHAR(100),
        product_name VARCHAR(255),
        type VARCHAR(50) NOT NULL,
        quantity_bags NUMERIC(12, 2) DEFAULT 0,
        quantity_kg NUMERIC(12, 2) DEFAULT 0,
        unit_cost NUMERIC(15, 4) DEFAULT 0,
        total_cost NUMERIC(15, 2) DEFAULT 0,
        source_farm VARCHAR(255),
        target_farm VARCHAR(255),
        reference_no VARCHAR(100),
        recorded_by VARCHAR(255),
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      ALTER TABLE feed_transactions ADD COLUMN IF NOT EXISTS product_id VARCHAR(100);
      ALTER TABLE feed_transactions ADD COLUMN IF NOT EXISTS product_name VARCHAR(255);
      ALTER TABLE feed_transactions ADD COLUMN IF NOT EXISTS reference_no VARCHAR(100);
      ALTER TABLE feed_transactions ADD COLUMN IF NOT EXISTS created_by VARCHAR(100);
    `);
    console.log('[✓] feed_products & feed_transactions');

    // ── 11. breeding_records ─────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS breeding_records (
        id                    VARCHAR(50) PRIMARY KEY,
        dam_id                VARCHAR(50) NOT NULL REFERENCES stock(id) ON DELETE CASCADE,
        sire_id               VARCHAR(50),
        mating_date           TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        breeding_type         VARCHAR(20) DEFAULT 'AI',
        technician            VARCHAR(100),
        pregnancy_status      VARCHAR(30) DEFAULT 'Pending',
        pregnancy_check_date TIMESTAMP WITH TIME ZONE,
        expected_calving_date TIMESTAMP WITH TIME ZONE,
        actual_calving_date   TIMESTAMP WITH TIME ZONE,
        calf_id               VARCHAR(50),
        notes                 TEXT,
        created_at            TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      ALTER TABLE breeding_records ADD COLUMN IF NOT EXISTS cow_owner VARCHAR(100);
      ALTER TABLE breeding_records ADD COLUMN IF NOT EXISTS dam_source VARCHAR(50);
      ALTER TABLE breeding_records ADD COLUMN IF NOT EXISTS breeder_name VARCHAR(100);
      ALTER TABLE breeding_records ADD COLUMN IF NOT EXISTS service_type VARCHAR(20) DEFAULT 'AI';
      ALTER TABLE breeding_records ADD COLUMN IF NOT EXISTS breeding_method VARCHAR(50) DEFAULT 'Cross-Breeding';
      ALTER TABLE breeding_records ADD COLUMN IF NOT EXISTS target_breed VARCHAR(50);
      ALTER TABLE breeding_records ADD COLUMN IF NOT EXISTS bull_name VARCHAR(100);
      ALTER TABLE breeding_records ADD COLUMN IF NOT EXISTS heat_detection_date TIMESTAMP WITH TIME ZONE;
      ALTER TABLE breeding_records ADD COLUMN IF NOT EXISTS checkup_date TIMESTAMP WITH TIME ZONE;
      ALTER TABLE breeding_records ADD COLUMN IF NOT EXISTS expected_birthdate TIMESTAMP WITH TIME ZONE;
      ALTER TABLE breeding_records ADD COLUMN IF NOT EXISTS breeding_service_cost NUMERIC(12, 2) DEFAULT 0;
      ALTER TABLE breeding_records ADD COLUMN IF NOT EXISTS breeding_insemination_cost NUMERIC(12, 2) DEFAULT 0;
    `);
    console.log('[✓] breeding_records');

    // ── 12. media_assets (Unified Storage Media Table) ──────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS media_assets (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        entity_type VARCHAR(50) NOT NULL,
        entity_id   VARCHAR(100) NOT NULL,
        category    VARCHAR(50) DEFAULT 'cover',
        file_path   VARCHAR(255) NOT NULL,
        file_name   VARCHAR(255) NOT NULL,
        mime_type   VARCHAR(50) NOT NULL,
        file_size   INTEGER NOT NULL,
        width       INTEGER,
        height      INTEGER,
        thumb_path  VARCHAR(255),
        medium_path VARCHAR(255),
        large_path  VARCHAR(255),
        is_primary  BOOLEAN DEFAULT false,
        created_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('[✓] media_assets');

    // ── 13. calving_events (Delivery Logs) ───────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS calving_events (
        id                     VARCHAR(50) PRIMARY KEY,
        breeding_record_id     VARCHAR(50) NOT NULL REFERENCES breeding_records(id) ON DELETE CASCADE,
        dam_id                 VARCHAR(50) NOT NULL REFERENCES stock(id) ON DELETE CASCADE,
        actual_calving_date    TIMESTAMP WITH TIME ZONE NOT NULL,
        place_of_birth         VARCHAR(100) NOT NULL,
        birth_facility         VARCHAR(100) NOT NULL,
        delivery_status_ced    VARCHAR(100) NOT NULL,
        number_of_calves       VARCHAR(20) DEFAULT 'Single (1)',
        gestation_period_days  INTEGER NOT NULL,
        veterinarian_notes     TEXT,
        created_at             TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('[✓] calving_events');

    // ── 14. calves_herd, sires, dams, calves, breeding_programs ───────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS sires (
        id                   VARCHAR(50) PRIMARY KEY,
        code                 VARCHAR(50) UNIQUE,
        name                 VARCHAR(100) NOT NULL,
        breed                VARCHAR(50),
        sourcing_company     VARCHAR(100),
        sourcing_company_id VARCHAR(50),
        breeder_id          VARCHAR(50),
        breed_id             VARCHAR(50),
        registration_number VARCHAR(50),
        father_id            VARCHAR(50),
        mother_id            VARCHAR(50),
        owner_type           VARCHAR(50),
        image_url            TEXT,
        status               VARCHAR(20) DEFAULT 'Active',
        created_at           TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS dams (
        id                   VARCHAR(50) PRIMARY KEY,
        code                 VARCHAR(50) UNIQUE,
        name                 VARCHAR(100) NOT NULL,
        breed                VARCHAR(50),
        sourcing_company     VARCHAR(100),
        sourcing_company_id VARCHAR(50),
        customer_id          VARCHAR(50),
        breeder_id          VARCHAR(50),
        breed_id             VARCHAR(50),
        registration_number VARCHAR(50),
        father_id            VARCHAR(50),
        mother_id            VARCHAR(50),
        owner_type           VARCHAR(50),
        ownership_status     VARCHAR(50) DEFAULT 'Active',
        ownership_start_date TIMESTAMP WITH TIME ZONE,
        image_url            TEXT,
        status               VARCHAR(20) DEFAULT 'Active',
        created_at           TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS calves (
        id                   VARCHAR(50) PRIMARY KEY,
        code                 VARCHAR(50) UNIQUE,
        tag_id               VARCHAR(50),
        calf_name            VARCHAR(100) NOT NULL,
        sex                  VARCHAR(10) NOT NULL,
        breed                VARCHAR(50) NOT NULL,
        color                VARCHAR(50),
        customer_id          VARCHAR(50),
        breeder_id          VARCHAR(50),
        breed_id             VARCHAR(50),
        registration_number VARCHAR(50),
        created_at           TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS breeding_programs (
        id                   VARCHAR(50) PRIMARY KEY,
        code                 VARCHAR(50) UNIQUE,
        title                VARCHAR(100) NOT NULL,
        sire_id              VARCHAR(50),
        dam_id               VARCHAR(50),
        customer_id          VARCHAR(50),
        status               VARCHAR(50) DEFAULT 'Active',
        created_at           TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS certificates (
        id                   VARCHAR(50) PRIMARY KEY,
        certificate_number   VARCHAR(100) UNIQUE NOT NULL,
        calf_id              VARCHAR(50),
        issued_date          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        qr_code              TEXT,
        status               VARCHAR(50) DEFAULT 'Active'
      );
      ALTER TABLE certificates ADD COLUMN IF NOT EXISTS registration_id VARCHAR(50);
      ALTER TABLE certificates ADD COLUMN IF NOT EXISTS breeder_id VARCHAR(50);
      ALTER TABLE certificates ADD COLUMN IF NOT EXISTS customer_id VARCHAR(50);
      ALTER TABLE certificates ADD COLUMN IF NOT EXISTS animal_id VARCHAR(50);
      ALTER TABLE certificates ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

      CREATE TABLE IF NOT EXISTS breeders (
        id                   VARCHAR(50) PRIMARY KEY,
        name                 VARCHAR(100) NOT NULL,
        email                VARCHAR(100),
        phone                VARCHAR(50),
        station              VARCHAR(100),
        status               VARCHAR(20) DEFAULT 'Active',
        created_at           TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS farms (
        id                   VARCHAR(50) PRIMARY KEY,
        name                 VARCHAR(100) NOT NULL,
        code                 VARCHAR(50),
        address              TEXT,
        location             VARCHAR(100),
        status               VARCHAR(20) DEFAULT 'Active',
        created_at           TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS customers (
        id                   VARCHAR(50) PRIMARY KEY,
        name                 VARCHAR(100) NOT NULL,
        phone                VARCHAR(50),
        email                VARCHAR(100),
        address              TEXT,
        status               VARCHAR(20) DEFAULT 'Active',
        created_at           TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      ALTER TABLE breeders ADD COLUMN IF NOT EXISTS code VARCHAR(50);
      ALTER TABLE breeders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

      ALTER TABLE customers ADD COLUMN IF NOT EXISTS code VARCHAR(50);
      ALTER TABLE customers ADD COLUMN IF NOT EXISTS national_id VARCHAR(50);
      ALTER TABLE customers ADD COLUMN IF NOT EXISTS id_front_url TEXT;
      ALTER TABLE customers ADD COLUMN IF NOT EXISTS id_back_url TEXT;
      ALTER TABLE customers ADD COLUMN IF NOT EXISTS profile_image_url TEXT;
      ALTER TABLE customers ADD COLUMN IF NOT EXISTS image_url TEXT;
      ALTER TABLE customers ADD COLUMN IF NOT EXISTS id_verification_status VARCHAR(50) DEFAULT 'UNVERIFIED';
      ALTER TABLE customers ADD COLUMN IF NOT EXISTS customer_type VARCHAR(50) DEFAULT 'INDIVIDUAL';
      ALTER TABLE customers ADD COLUMN IF NOT EXISTS notes TEXT;
      ALTER TABLE customers ADD COLUMN IF NOT EXISTS village VARCHAR(100);
      ALTER TABLE customers ADD COLUMN IF NOT EXISTS commune VARCHAR(100);
      ALTER TABLE customers ADD COLUMN IF NOT EXISTS district VARCHAR(100);
      ALTER TABLE customers ADD COLUMN IF NOT EXISTS province VARCHAR(100);
      ALTER TABLE customers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

      ALTER TABLE farms ADD COLUMN IF NOT EXISTS code VARCHAR(50);
      ALTER TABLE farms ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

      CREATE TABLE IF NOT EXISTS calves_herd (
        id                   VARCHAR(50) PRIMARY KEY,
        calving_event_id     VARCHAR(50) REFERENCES calving_events(id) ON DELETE CASCADE,
        breeding_record_id   VARCHAR(50) REFERENCES breeding_records(id) ON DELETE CASCADE,
        code                 VARCHAR(50) UNIQUE NOT NULL,
        tag_id               VARCHAR(50),
        calf_name            VARCHAR(100) NOT NULL,
        sex                  VARCHAR(10) NOT NULL,
        breed                VARCHAR(50) NOT NULL,
        color                VARCHAR(50) NOT NULL,
        generation           VARCHAR(30) NOT NULL,
        birth_weight_kg      NUMERIC(6,2) NOT NULL,
        height_cm            NUMERIC(6,2),
        body_length_cm       NUMERIC(6,2),
        chest_size_cm        NUMERIC(6,2),
        leg_size_cm          NUMERIC(6,2),
        birth_temperature_c  NUMERIC(4,2),
        navel_treatment      BOOLEAN DEFAULT true,
        virus_test           BOOLEAN DEFAULT true,
        timing_of_feeding    VARCHAR(50),
        method_of_feeding    JSONB DEFAULT '[]'::jsonb,
        current_status       VARCHAR(50) DEFAULT 'Healthy (Nursing)',
        created_at           TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      ALTER TABLE calves ADD COLUMN IF NOT EXISTS customer_id VARCHAR(50);
      ALTER TABLE calves ADD COLUMN IF NOT EXISTS breeder_id VARCHAR(50);
      ALTER TABLE calves ADD COLUMN IF NOT EXISTS breed_id VARCHAR(50);
      ALTER TABLE calves ADD COLUMN IF NOT EXISTS registration_number VARCHAR(50);
      ALTER TABLE calves ADD COLUMN IF NOT EXISTS owner_name VARCHAR(100);
      ALTER TABLE calves ADD COLUMN IF NOT EXISTS owner_id VARCHAR(50);
      ALTER TABLE calves ADD COLUMN IF NOT EXISTS breeding_program_id VARCHAR(50);
      ALTER TABLE calves ADD COLUMN IF NOT EXISTS sire_id VARCHAR(50);
      ALTER TABLE calves ADD COLUMN IF NOT EXISTS dam_id VARCHAR(50);
      ALTER TABLE calves ADD COLUMN IF NOT EXISTS farm_id VARCHAR(50);

      ALTER TABLE dams ADD COLUMN IF NOT EXISTS customer_id VARCHAR(50);
      ALTER TABLE dams ADD COLUMN IF NOT EXISTS breeder_id VARCHAR(50);
      ALTER TABLE dams ADD COLUMN IF NOT EXISTS breed_id VARCHAR(50);
      ALTER TABLE dams ADD COLUMN IF NOT EXISTS registration_number VARCHAR(50);
      ALTER TABLE dams ADD COLUMN IF NOT EXISTS father_id VARCHAR(50);
      ALTER TABLE dams ADD COLUMN IF NOT EXISTS mother_id VARCHAR(50);
      ALTER TABLE dams ADD COLUMN IF NOT EXISTS owner_type VARCHAR(50);
      ALTER TABLE dams ADD COLUMN IF NOT EXISTS owner_name VARCHAR(100);
      ALTER TABLE dams ADD COLUMN IF NOT EXISTS owner_id VARCHAR(50);
      ALTER TABLE dams ADD COLUMN IF NOT EXISTS ownership_status VARCHAR(50) DEFAULT 'Active';
      ALTER TABLE dams ADD COLUMN IF NOT EXISTS ownership_start_date TIMESTAMP WITH TIME ZONE;
      ALTER TABLE dams ADD COLUMN IF NOT EXISTS farm_id VARCHAR(50);

      ALTER TABLE sires ADD COLUMN IF NOT EXISTS breeder_id VARCHAR(50);
      ALTER TABLE sires ADD COLUMN IF NOT EXISTS breed_id VARCHAR(50);
      ALTER TABLE sires ADD COLUMN IF NOT EXISTS registration_number VARCHAR(50);
      ALTER TABLE sires ADD COLUMN IF NOT EXISTS father_id VARCHAR(50);
      ALTER TABLE sires ADD COLUMN IF NOT EXISTS mother_id VARCHAR(50);
      ALTER TABLE sires ADD COLUMN IF NOT EXISTS owner_type VARCHAR(50);
      ALTER TABLE sires ADD COLUMN IF NOT EXISTS owner_name VARCHAR(100);
      ALTER TABLE sires ADD COLUMN IF NOT EXISTS owner_id VARCHAR(50);
      ALTER TABLE sires ADD COLUMN IF NOT EXISTS farm_id VARCHAR(50);

      ALTER TABLE customers ADD COLUMN IF NOT EXISTS managed_by_breeder_id VARCHAR(50);

      ALTER TABLE breeding_programs ADD COLUMN IF NOT EXISTS customer_id VARCHAR(50);
      ALTER TABLE breeding_programs ADD COLUMN IF NOT EXISTS breeder_id VARCHAR(50);
      ALTER TABLE breeding_programs ADD COLUMN IF NOT EXISTS farm_id VARCHAR(50);
      ALTER TABLE breeding_programs ADD COLUMN IF NOT EXISTS breed_id VARCHAR(50);
      ALTER TABLE breeding_programs ADD COLUMN IF NOT EXISTS cow_owner VARCHAR(100);
      ALTER TABLE breeding_programs ADD COLUMN IF NOT EXISTS owner_name VARCHAR(100);
      ALTER TABLE breeding_programs ADD COLUMN IF NOT EXISTS breeder_name VARCHAR(100);
      ALTER TABLE breeding_programs ADD COLUMN IF NOT EXISTS customer_name VARCHAR(100);

      CREATE TABLE IF NOT EXISTS herdbook_registrations (
        id           VARCHAR(50) PRIMARY KEY,
        code         VARCHAR(50) UNIQUE,
        animal_type  VARCHAR(50),
        animal_id    VARCHAR(50),
        breeder_id   VARCHAR(50),
        customer_id  VARCHAR(50),
        status       VARCHAR(20) DEFAULT 'Active',
        created_at   TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      ALTER TABLE herdbook_registrations ADD COLUMN IF NOT EXISTS breeder_id VARCHAR(50);
      ALTER TABLE herdbook_registrations ADD COLUMN IF NOT EXISTS customer_id VARCHAR(50);
      ALTER TABLE herdbook_registrations ADD COLUMN IF NOT EXISTS breeding_program_id VARCHAR(50);
      ALTER TABLE herdbook_registrations ADD COLUMN IF NOT EXISTS sire_id VARCHAR(50);
      ALTER TABLE herdbook_registrations ADD COLUMN IF NOT EXISTS dam_id VARCHAR(50);
      ALTER TABLE herdbook_registrations ADD COLUMN IF NOT EXISTS calf_id VARCHAR(50);
    `);
    console.log('[✓] calves_herd & master tables');

    // ── 15. birth_certificates (Pedigree Certificates) ───────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS birth_certificates (
        cert_no               VARCHAR(50) PRIMARY KEY,
        calf_id               VARCHAR(50) NOT NULL UNIQUE REFERENCES calves_herd(id) ON DELETE CASCADE,
        qr_verification_code VARCHAR(100) UNIQUE NOT NULL,
        farm_name             VARCHAR(100) NOT NULL,
        province_district     VARCHAR(100) NOT NULL,
        village_commune       VARCHAR(100) NOT NULL,
        gps_coordinates       VARCHAR(100),
        recorded_by           VARCHAR(100) NOT NULL,
        verified_by           VARCHAR(100) NOT NULL,
        issued_date           TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        pdf_path              VARCHAR(255),
        png_path              VARCHAR(255)
      );
    `);
    console.log('[✓] birth_certificates');

    // ── Audit & Soft-Delete Columns across Core Tables ─────────────────────────
    const auditTables = ['stock', 'breeding_records', 'health_logs', 'weight_tracking', 'sales_tracking', 'batches', 'expenses', 'feed_products', 'calves_herd'];
    for (const tbl of auditTables) {
      await client.query(`ALTER TABLE ${tbl} ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;`);
      await client.query(`ALTER TABLE ${tbl} ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE;`);
      await client.query(`ALTER TABLE ${tbl} ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;`);
      await client.query(`ALTER TABLE ${tbl} ADD COLUMN IF NOT EXISTS created_by VARCHAR(100);`);
      await client.query(`ALTER TABLE ${tbl} ADD COLUMN IF NOT EXISTS updated_by VARCHAR(100);`);
    }

    // ── 16. attachments (Central Generic File Upload Table) ──────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS attachments (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        entity_type VARCHAR(50) NOT NULL,
        entity_id   VARCHAR(100) NOT NULL,
        file_name   VARCHAR(255) NOT NULL,
        file_path   VARCHAR(255) NOT NULL,
        mime_type   VARCHAR(100) NOT NULL,
        file_size   INTEGER NOT NULL,
        uploaded_by VARCHAR(100),
        created_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('[✓] attachments');

    // ── 17. activity_logs (Central Audit & Activity Trail Table) ─────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id          SERIAL PRIMARY KEY,
        entity_type VARCHAR(50) NOT NULL,
        entity_id   VARCHAR(100) NOT NULL,
        action      VARCHAR(50) NOT NULL, -- CREATE | UPDATE | DELETE | RESTORE | ARCHIVE
        actor_name  VARCHAR(100) DEFAULT 'System',
        details     JSONB DEFAULT '{}'::jsonb,
        created_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('[✓] activity_logs');

    // ── 18. stock_insemination & stock_transactions ─────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS stock_insemination (
        id                  VARCHAR(100) PRIMARY KEY,
        sire_id             VARCHAR(100) NOT NULL,
        stock_available     INTEGER DEFAULT 0,
        price_usd           NUMERIC(10, 2) DEFAULT 0,
        price_khr           NUMERIC(15, 2) DEFAULT 0,
        currency            VARCHAR(10) DEFAULT 'USD',
        owner_name          VARCHAR(100),
        farm_location       VARCHAR(100),
        breeder_name        VARCHAR(100),
        availability        VARCHAR(50) DEFAULT 'Available',
        status              VARCHAR(50) DEFAULT 'Active',
        sourcing_company_id VARCHAR(50),
        breeder_id          VARCHAR(50),
        farm_id             VARCHAR(50),
        unit_type           VARCHAR(50) DEFAULT 'Dose',
        tank_number         VARCHAR(50),
        collection_date     TIMESTAMP WITH TIME ZONE,
        notes               TEXT,
        initial_quantity    INTEGER DEFAULT 100,
        created_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      ALTER TABLE stock_insemination ADD COLUMN IF NOT EXISTS breeder_id VARCHAR(50);
      ALTER TABLE stock_insemination ADD COLUMN IF NOT EXISTS farm_id VARCHAR(50);
      ALTER TABLE stock_insemination ADD COLUMN IF NOT EXISTS unit_type VARCHAR(50);
      ALTER TABLE stock_insemination ADD COLUMN IF NOT EXISTS tank_number VARCHAR(50);
      ALTER TABLE stock_insemination ADD COLUMN IF NOT EXISTS collection_date TIMESTAMP WITH TIME ZONE;
      ALTER TABLE stock_insemination ADD COLUMN IF NOT EXISTS notes TEXT;
      ALTER TABLE stock_insemination ADD COLUMN IF NOT EXISTS initial_quantity INTEGER;
      ALTER TABLE stock_insemination ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

      CREATE TABLE IF NOT EXISTS stock_transactions (
        id                    VARCHAR(100) PRIMARY KEY,
        stock_insemination_id VARCHAR(100) NOT NULL REFERENCES stock_insemination(id) ON DELETE CASCADE,
        transaction_type      VARCHAR(100) NOT NULL,
        quantity              INTEGER NOT NULL,
        balance               INTEGER NOT NULL,
        reference             VARCHAR(100),
        recipient             VARCHAR(255),
        breeder_id            VARCHAR(50),
        farm_id               VARCHAR(50),
        customer_id           VARCHAR(50),
        price_usd             NUMERIC(10, 2),
        user_name             VARCHAR(100),
        created_at            TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      ALTER TABLE stock_transactions ADD COLUMN IF NOT EXISTS breeder_id VARCHAR(50);
      ALTER TABLE stock_transactions ADD COLUMN IF NOT EXISTS farm_id VARCHAR(50);
      ALTER TABLE stock_transactions ADD COLUMN IF NOT EXISTS customer_id VARCHAR(50);

      ALTER TABLE breed_configurations ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
      ALTER TABLE sires ADD COLUMN IF NOT EXISTS sourcing_company VARCHAR(100);
      ALTER TABLE dams ADD COLUMN IF NOT EXISTS sourcing_company VARCHAR(100);
    `);
    console.log('[✓] stock_insemination & stock_transactions');

    // ── Indexes (CREATE INDEX IF NOT EXISTS is idempotent) ──────────────────
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_stock_status          ON stock(status)',
      'CREATE INDEX IF NOT EXISTS idx_stock_health          ON stock(health_status)',
      'CREATE INDEX IF NOT EXISTS idx_weight_cow_id         ON weight_tracking(cow_id)',
      'CREATE INDEX IF NOT EXISTS idx_weight_tracking_date  ON weight_tracking(tracking_date)',
      'CREATE INDEX IF NOT EXISTS idx_sales_cow_id          ON sales_tracking(cow_id)',
      'CREATE INDEX IF NOT EXISTS idx_health_cow_id         ON health_logs(cow_id)',
      'CREATE INDEX IF NOT EXISTS idx_batch_cows_cow_id     ON batch_cows(cow_id)',
      'CREATE INDEX IF NOT EXISTS idx_expenses_category     ON expenses(category)',
      'CREATE INDEX IF NOT EXISTS idx_expenses_date         ON expenses(date)',
      'CREATE INDEX IF NOT EXISTS idx_breeding_dam_id       ON breeding_records(dam_id)',
      'CREATE INDEX IF NOT EXISTS idx_breeding_status       ON breeding_records(pregnancy_status)',
      'CREATE INDEX IF NOT EXISTS idx_breeding_calving      ON breeding_records(expected_calving_date)',
      'CREATE INDEX IF NOT EXISTS idx_media_entity          ON media_assets(entity_type, entity_id)',
      'CREATE INDEX IF NOT EXISTS idx_attachments_entity    ON attachments(entity_type, entity_id)',
      'CREATE INDEX IF NOT EXISTS idx_activity_entity       ON activity_logs(entity_type, entity_id)',
      'CREATE INDEX IF NOT EXISTS idx_calves_code           ON calves_herd(code)',
      'CREATE INDEX IF NOT EXISTS idx_calves_tag            ON calves_herd(tag_id)',
      'CREATE INDEX IF NOT EXISTS idx_stock_tx_stock_id     ON stock_transactions(stock_insemination_id)',
      'CREATE INDEX IF NOT EXISTS idx_stock_tx_breeder_id   ON stock_transactions(breeder_id)',
    ];
    for (const idx of indexes) {
      await client.query(idx + ';');
    }
    console.log('\n✅ Safe migration completed successfully — production data is untouched.');
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('\n❌ Migration failed:', msg);
    process.exit(1);
  } finally {
    client.release();
    process.exit(0);
  }
}

safeMigrate();
