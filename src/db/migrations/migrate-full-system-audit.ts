import { pool, connectWithRetry } from '../../config/database';

/**
 * Migration: Full System Audit & Schema Enhancements
 * - Creates relational `farms` table
 * - Adds National ID fields to `users` (national_id, id_front_url, id_back_url, id_verification_status, farm_id)
 * - Seeds default farms if none exist
 * - Adds performance indexes and constraints
 */
export async function migrateFullSystemAudit() {
  console.log('=== 🏗️  Migrating Full System Audit Schema Enhancements ===');
  await connectWithRetry(5, 2000);
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // ── 1. Create farms table ──────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS farms (
        id          VARCHAR(50) PRIMARY KEY,
        code        VARCHAR(50) UNIQUE NOT NULL,
        name        VARCHAR(100) NOT NULL,
        owner_id    VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
        owner_name  VARCHAR(100),
        address     TEXT,
        capacity    INT DEFAULT 100,
        image_url   TEXT,
        notes       TEXT,
        status      VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active','Inactive')),
        created_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('[✓] farms table created/verified');

    // ── 2. Add National ID & Farm association columns to users table ───────
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS national_id VARCHAR(50);`);
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS id_front_url TEXT;`);
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS id_back_url TEXT;`);
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS id_verification_status VARCHAR(30) DEFAULT 'Pending';`);
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS farm_id VARCHAR(50) REFERENCES farms(id) ON DELETE SET NULL;`);
    console.log('[✓] users table enhanced with National ID & farm_id columns');

    // ── 3. Seed default farms ───────────────────────────────────────────────
    const userRes = await client.query(`SELECT id, name FROM users WHERE role ILIKE '%Owner%' LIMIT 1`);
    const realOwnerId = userRes.rows.length > 0 ? userRes.rows[0].id : null;
    const realOwnerName = userRes.rows.length > 0 ? userRes.rows[0].name : 'Bona Farm Owner';

    const defaultFarms = [
      { id: 'FARM-01', code: 'ROTHANG', name: 'រទាំង (Rothang Farm)', ownerId: realOwnerId, ownerName: realOwnerName, address: 'រទាំង, ព្រែកព្នៅ, ភ្នំពេញ', capacity: 100, notes: 'ទីតាំងបំប៉នសាច់ និងផលិតចំណី' },
      { id: 'FARM-02', code: 'PREY_VENG', name: 'ព្រៃវែង (Prey Veng Station)', ownerId: realOwnerId, ownerName: realOwnerName, address: 'ក្រុងព្រៃវែង, ខេត្តព្រៃវែង', capacity: 150, notes: 'ទីតាំងបង្កាត់ពូជ និងព្យាបាល' },
      { id: 'FARM-03', code: 'BANTEAY_MEANCHEAY', name: 'បន្ទាយមានជ័យ (Banteay Meanchey Station)', ownerId: realOwnerId, ownerName: realOwnerName, address: 'ក្រុងសិរីសោភ័ណ, ខេត្តបន្ទាយមានជ័យ', capacity: 80, notes: 'ក្រោលផ្ទេរ និងចែកចាយ' },
      { id: 'FARM-04', code: 'KROL_A', name: 'ក្រោល A (Special Barn A)', ownerId: realOwnerId, ownerName: realOwnerName, address: 'ក្រោលបំប៉នពិសេស A', capacity: 50, notes: 'ក្រោលបំប៉នពិសេស A' },
      { id: 'FARM-05', code: 'KROL_B', name: 'ក្រោល B (Special Barn B)', ownerId: realOwnerId, ownerName: realOwnerName, address: 'ក្រោលបំប៉នពិសេស B', capacity: 50, notes: 'ក្រោលបំប៉នពិសេស B' }
    ];

    for (const f of defaultFarms) {
      await client.query(`
        INSERT INTO farms (id, code, name, owner_id, owner_name, address, capacity, notes, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'Active')
        ON CONFLICT (code) DO UPDATE SET
          name       = EXCLUDED.name,
          owner_id   = EXCLUDED.owner_id,
          owner_name = EXCLUDED.owner_name,
          address    = EXCLUDED.address,
          capacity   = EXCLUDED.capacity,
          notes      = EXCLUDED.notes;
      `, [f.id, f.code, f.name, f.ownerId, f.ownerName, f.address, f.capacity, f.notes]);
    }
    console.log('[✓] default farms seeded');

    // ── 4. Add performance indexes ──────────────────────────────────────────
    await client.query(`CREATE INDEX IF NOT EXISTS idx_users_national_id ON users(national_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_users_id_verification ON users(id_verification_status);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_farms_owner ON farms(owner_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_dams_breeding_status ON dams(breeding_status);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_calves_owner ON calves(owner_name);`);

    await client.query('COMMIT');
    console.log('[✓] Successfully completed full system audit database migration');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error migrating full system audit schema:', err);
    throw err;
  } finally {
    client.release();
  }
}

if (require.main === module) {
  migrateFullSystemAudit().then(() => process.exit(0)).catch(() => process.exit(1));
}
