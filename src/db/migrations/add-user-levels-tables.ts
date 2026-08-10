import { pool, connectWithRetry } from '../../config/database';

export async function migrateUserLevelsTables() {
  console.log('=== 🛡️  Migrating User Levels & Modules Tables ===');
  await connectWithRetry(5, 2000);
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. user_levels table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_levels (
        id          VARCHAR(50) PRIMARY KEY,
        code        VARCHAR(50) UNIQUE NOT NULL,
        name        VARCHAR(100) NOT NULL,
        description TEXT,
        status      VARCHAR(20) DEFAULT 'Active',
        sort_order  INT DEFAULT 0,
        created_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. user_level_modules table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_level_modules (
        id            SERIAL PRIMARY KEY,
        user_level_id VARCHAR(50) REFERENCES user_levels(id) ON DELETE CASCADE,
        module_key    VARCHAR(50) NOT NULL,
        module_name   VARCHAR(100) NOT NULL,
        is_available  BOOLEAN DEFAULT TRUE,
        CONSTRAINT unique_user_level_module UNIQUE(user_level_id, module_key)
      );
    `);

    // 3. Update users table with user_level_id & data_scope columns
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS user_level_id VARCHAR(50);`);
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS user_level VARCHAR(100);`);
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS data_scope VARCHAR(50) DEFAULT 'ASSIGNED_RECORD';`);
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS company_name VARCHAR(100);`);

    // 4. Seed default user levels if not existing
    const defaultUserLevels = [
      { id: 'LEVEL-01', code: 'BREEDER', name: 'Breeder Account', description: 'Breeding specialist & AI operations professional managing services and programs.', sortOrder: 1 },
      { id: 'LEVEL-02', code: 'FARM_OWNER', name: 'Farm Owner Account', description: 'Owner/manager of farm stations controlling farm animals, breeding, and costs.', sortOrder: 2 },
      { id: 'LEVEL-03', code: 'CUSTOMER', name: 'Customer Account / Cow Owner', description: 'Restricted account for customers owning cows with read-only access to their animals.', sortOrder: 3 },
      { id: 'LEVEL-04', code: 'SIRE_SOURCE', name: 'Sire Sourcing Company Account', description: 'Supplier supplying Sires or Sire/Semen stock to the herdbook system.', sortOrder: 4 },
      { id: 'LEVEL-05', code: 'SUPER_ADMIN', name: 'Super Administrator', description: 'System administrator account with unconstrained operational access.', sortOrder: 5 }
    ];

    for (const lvl of defaultUserLevels) {
      await client.query(`
        INSERT INTO user_levels (id, code, name, description, sort_order, status)
        VALUES ($1, $2, $3, $4, $5, 'Active')
        ON CONFLICT (code) DO UPDATE SET
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          sort_order = EXCLUDED.sort_order;
      `, [lvl.id, lvl.code, lvl.name, lvl.description, lvl.sortOrder]);
    }

    // 5. Seed default module access per level
    const allModules = [
      { key: 'dashboard', name: 'Dashboard' },
      { key: 'breeding', name: 'Breeding Program' },
      { key: 'sires', name: 'Sire Register' },
      { key: 'dams', name: 'Dam Register' },
      { key: 'calves', name: 'Calf Register' },
      { key: 'herdbook', name: 'Herdbook Management' },
      { key: 'certificates', name: 'Certificate Center' },
      { key: 'stock', name: 'Stock Insemination' },
      { key: 'user_levels', name: 'User Level Management' },
      { key: 'roles', name: 'Role Management' },
      { key: 'users', name: 'User Management' },
      { key: 'system_setup', name: 'System Setup' }
    ];

    const defaultModuleMap: Record<string, string[]> = {
      'LEVEL-01': ['dashboard', 'breeding', 'sires', 'dams', 'calves', 'herdbook', 'certificates', 'stock'],
      'LEVEL-02': ['dashboard', 'breeding', 'sires', 'dams', 'calves', 'herdbook', 'certificates'],
      'LEVEL-03': ['dashboard', 'calves', 'herdbook', 'certificates'],
      'LEVEL-04': ['dashboard', 'sires', 'stock', 'herdbook', 'certificates'],
      'LEVEL-05': allModules.map(m => m.key)
    };

    for (const [levelId, enabledModules] of Object.entries(defaultModuleMap)) {
      for (const mod of allModules) {
        const isAvailable = enabledModules.includes(mod.key);
        await client.query(`
          INSERT INTO user_level_modules (user_level_id, module_key, module_name, is_available)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (user_level_id, module_key) DO UPDATE SET
            module_name = EXCLUDED.module_name,
            is_available = EXCLUDED.is_available;
        `, [levelId, mod.key, mod.name, isAvailable]);
      }
    }

    await client.query('COMMIT');
    console.log('[✓] Successfully migrated user_levels and user_level_modules tables');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error migrating user_levels tables:', err);
    throw err;
  } finally {
    client.release();
  }
}

if (require.main === module) {
  migrateUserLevelsTables().then(() => process.exit(0)).catch(() => process.exit(1));
}
