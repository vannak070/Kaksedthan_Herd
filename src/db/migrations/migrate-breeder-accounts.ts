import { query } from '../../config/database';

export async function migrateBreederAccounts() {
  console.log('--- Migrating Breeder Accounts & Profile Architecture ---');

  // 1. Create `breeders` table
  await query(`
    CREATE TABLE IF NOT EXISTS breeders (
      id VARCHAR(50) PRIMARY KEY,
      code VARCHAR(50) UNIQUE,
      name VARCHAR(255) NOT NULL,
      phone VARCHAR(50),
      email VARCHAR(255),
      address TEXT,
      province VARCHAR(100),
      district VARCHAR(100),
      commune VARCHAR(100),
      village VARCHAR(100),
      image_url TEXT,
      national_id VARCHAR(100),
      id_front_url TEXT,
      id_back_url TEXT,
      id_verification_status VARCHAR(50) DEFAULT 'Verified',
      notes TEXT,
      status VARCHAR(50) DEFAULT 'Active',
      user_id VARCHAR(50),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 2. Add `user_type` and `breeder_id` to `users` table if not existing
  await query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS phone VARCHAR(50),
    ADD COLUMN IF NOT EXISTS user_type VARCHAR(50) DEFAULT 'General User',
    ADD COLUMN IF NOT EXISTS breeder_id VARCHAR(50),
    ADD COLUMN IF NOT EXISTS national_id VARCHAR(100),
    ADD COLUMN IF NOT EXISTS id_front_url TEXT,
    ADD COLUMN IF NOT EXISTS id_back_url TEXT,
    ADD COLUMN IF NOT EXISTS id_verification_status VARCHAR(50) DEFAULT 'UNVERIFIED';
  `);

  // 3. Migrate existing breeder users from `users` table into `breeders` profile table if missing
  const existingBreedersInUsers = await query(`
    SELECT id, name, email, phone, role, user_level, status, farm_location, national_id, id_front_url, id_back_url, id_verification_status
    FROM users
    WHERE id LIKE 'BREEDER-%' OR role ILIKE '%breeder%' OR user_level ILIKE '%breeder%'
  `);

  for (const u of existingBreedersInUsers.rows) {
    const breederId = u.id.startsWith('BREEDER-') ? u.id : `BRD-${u.id}`;
    const code = u.id.replace(/[^A-Z0-9_]/gi, '');

    // Insert into `breeders` profile table if not exists
    await query(`
      INSERT INTO breeders (
        id, code, name, phone, email, address, national_id, id_front_url, id_back_url,
        id_verification_status, status, user_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      ON CONFLICT (id) DO UPDATE SET
        user_id = EXCLUDED.user_id,
        phone = COALESCE(breeders.phone, EXCLUDED.phone),
        email = COALESCE(breeders.email, EXCLUDED.email);
    `, [
      breederId,
      code,
      u.name,
      u.phone || '012 999 888',
      u.email,
      u.farm_location || 'Phnom Penh, Cambodia',
      u.national_id || 'ID-KH-900800',
      u.id_front_url || null,
      u.id_back_url || null,
      u.id_verification_status || 'Verified',
      u.status || 'Active',
      u.id
    ]);

    // Update `users` table with `user_type = 'Breeder'` and `breeder_id = breederId`
    await query(`
      UPDATE users
      SET user_type = 'Breeder', breeder_id = $1
      WHERE id = $2;
    `, [breederId, u.id]);
  }

  console.log('✅ Breeder Accounts & Profile Architecture migration completed.');
}

if (require.main === module) {
  migrateBreederAccounts()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Migration error:', err);
      process.exit(1);
    });
}
