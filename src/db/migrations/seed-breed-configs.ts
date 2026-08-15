import { Pool } from 'pg';

const host = process.env.DB_HOST || '127.0.0.1';
const port = Number(process.env.DB_PORT) || 5432;
const user = process.env.DB_USER || 'postgres';
const password = process.env.DB_PASSWORD || 'postgres123';
const database = process.env.DB_NAME || 'livestock_db';

const pool = new Pool({ host, port, user, password, database });

async function seedBreeds() {
  console.log(`=== 🐄 Seeding breed_configurations in ${database} ===`);
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS breed_configurations (
        id          VARCHAR(50) PRIMARY KEY,
        code        VARCHAR(50) UNIQUE NOT NULL,
        name        VARCHAR(100) NOT NULL,
        category    VARCHAR(50) DEFAULT 'Cattle',
        origin      VARCHAR(100),
        description TEXT,
        image_url   TEXT,
        sort_order  INTEGER DEFAULT 0,
        is_active   BOOLEAN DEFAULT true,
        created_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      ALTER TABLE breed_configurations ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
    `);

    const breeds = [
      ['BC-BRAHMAN', 'BRAHMAN', 'Brahman', 'Cattle', 'USA / India'],
      ['BC-WAGYU', 'WAGYU', 'Wagyu', 'Cattle', 'Japan'],
      ['BC-ANGUS', 'ANGUS', 'Angus', 'Cattle', 'Scotland'],
      ['BC-KHMER', 'KHMER', 'គោទន្លេ (Khmer Native)', 'Cattle', 'Cambodia'],
      ['BC-NELORE', 'NELORE', 'Nelore', 'Cattle', 'Brazil / India'],
      ['BC-HOLSTEIN', 'HOLSTEIN', 'Holstein Friesian', 'Cattle', 'Netherlands']
    ];

    for (const b of breeds) {
      await client.query(
        `INSERT INTO breed_configurations (id, code, name, category, origin, is_active)
         VALUES ($1, $2, $3, $4, $5, true)
         ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, category = EXCLUDED.category`,
        b
      );
    }
    console.log('✅ breed_configurations seeded successfully!');
  } finally {
    client.release();
    await pool.end();
  }
}

seedBreeds().catch(err => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
