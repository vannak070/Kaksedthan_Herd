import { Pool } from 'pg';

export async function runBreedMasterMigration(pool: Pool) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    console.log('[1/5] Ensuring breed_configurations table schema...');

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
        created_by  VARCHAR(100),
        created_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Ensure created_by column exists
    await client.query(`ALTER TABLE breed_configurations ADD COLUMN IF NOT EXISTS created_by VARCHAR(100);`);

    console.log('[2/5] Seeding standard breeds if not present...');
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
      { id: 'BRD-11', code: 'RED_ANGUS',    name: 'Red Angus',       category: 'Beef',         origin: 'Scotland',     sort: 11 },
      { id: 'BRD-12', code: 'BLACK_ANGUS',  name: 'Black Angus',     category: 'Beef',         origin: 'Scotland',     sort: 12 },
      { id: 'BRD-13', code: 'RED_BRAHMAN',  name: 'Red Brahman',     category: 'Beef',         origin: 'USA',          sort: 13 },
      { id: 'BRD-14', code: 'GREY_BRAHMAN', name: 'Grey Brahman',    category: 'Beef',         origin: 'USA',          sort: 14 },
      { id: 'BRD-15', code: 'CHAROLAIS',    name: 'Charolais',       category: 'Beef',         origin: 'France',       sort: 15 },
    ];

    for (const b of defaultBreeds) {
      await client.query(`
        INSERT INTO breed_configurations (id, code, name, category, origin, sort_order, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, true)
        ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, category = EXCLUDED.category
      `, [b.id, b.code, b.name, b.category, b.origin, b.sort]);
    }

    console.log('[3/5] Adding breed_id FK column to sires, dams, calves, stock_insemination...');
    const tables = ['sires', 'dams', 'calves', 'stock_insemination'];
    for (const tbl of tables) {
      const tblCheck = await client.query(`SELECT 1 FROM information_schema.tables WHERE table_name = '${tbl}';`);
      if (tblCheck.rows.length === 0) continue;
      
      await client.query(`ALTER TABLE ${tbl} ADD COLUMN IF NOT EXISTS breed_id VARCHAR(50);`);
      await client.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint
            WHERE conrelid = '${tbl}'::regclass
              AND conname = '${tbl}_breed_id_fkey'
          ) THEN
            ALTER TABLE ${tbl}
              ADD CONSTRAINT ${tbl}_breed_id_fkey
              FOREIGN KEY (breed_id) REFERENCES breed_configurations(id) ON DELETE SET NULL;
          END IF;
        END $$;
      `);
    }

    console.log('[4/5] Backfilling breed_id references across tables...');
    for (const tbl of ['sires', 'dams', 'calves']) {
      const colCheck = await client.query(`SELECT 1 FROM information_schema.columns WHERE table_name = '${tbl}' AND column_name = 'breed';`);
      if (colCheck.rows.length > 0) {
        await client.query(`
          UPDATE ${tbl} t
          SET breed_id = bc.id
          FROM breed_configurations bc
          WHERE t.breed_id IS NULL
            AND t.breed IS NOT NULL
            AND (
              LOWER(TRIM(t.breed)) = LOWER(TRIM(bc.name))
              OR LOWER(TRIM(t.breed)) = LOWER(TRIM(bc.code))
              OR LOWER(TRIM(t.breed)) ILIKE '%' || LOWER(TRIM(bc.name)) || '%'
            );
        `);
      }
    }

    console.log('[5/5] Creating indexes...');
    for (const tbl of tables) {
      const tblCheck = await client.query(`SELECT 1 FROM information_schema.tables WHERE table_name = '${tbl}';`);
      if (tblCheck.rows.length > 0) {
        await client.query(`CREATE INDEX IF NOT EXISTS idx_${tbl}_breed_id ON ${tbl}(breed_id);`);
      }
    }

    await client.query('COMMIT');
    console.log('[✓] Breed Master Migration Completed Successfully!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[X] Breed Master Migration Failed:', err);
    throw err;
  } finally {
    client.release();
  }
}
