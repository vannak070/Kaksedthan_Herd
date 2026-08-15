import { pool } from '../../../config/database';

async function seedDevelopmentData() {
  if (process.env.NODE_ENV === 'production') {
    console.error('❌ SAFETY ABORT: Cannot run dev-seed in production environment!');
    process.exit(1);
  }

  console.log('🌱 Seeding Development Sample & Test Data (Localhost ONLY)...');
  const client = await pool.connect();

  try {
    // 1. Dev Breed Configurations
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
    console.log('   ✓ Dev breeds seeded');

    // 2. Dev Super Admin User Account
    await client.query(`
      INSERT INTO users (id, name, email, role, user_level, status, password)
      VALUES ('USR-010000', 'Admin Account', 'admin@kaksedthan.com', 'Super Admin', 'Super Admin Account', 'Active', 'password123')
      ON CONFLICT (email) DO UPDATE SET role = 'Super Admin', user_level = 'Super Admin Account', password = 'password123';
    `);
    console.log('   ✓ Dev Super Admin account seeded');

    console.log('✅ Development seeding completed successfully!');
  } finally {
    client.release();
    await pool.end();
  }
}

seedDevelopmentData().catch(err => {
  console.error('❌ Dev seeding failed:', err);
  process.exit(1);
});
