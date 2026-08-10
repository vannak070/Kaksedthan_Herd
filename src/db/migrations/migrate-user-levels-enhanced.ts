import { pool, connectWithRetry } from '../../config/database';

/**
 * Migration: Enhance User Levels System
 * - Adds user_level_roles junction table
 * - Adds purpose column to user_levels
 * - Seeds/updates 5 correct default User Levels (BREEDER, FARM_OWNER, FARM_MANAGER, CUSTOMER_COW_OWNER, SIRE_SOURCING_COMPANY)
 * - Seeds default module access for each level
 * - Seeds default role associations
 * - Adds indexes for performance
 */
export async function migrateUserLevelsEnhanced() {
  console.log('=== 🏗️  Migrating Enhanced User Levels System ===');
  await connectWithRetry(5, 2000);
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // ── 1. Create / ensure user_levels table with purpose column ──
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_levels (
        id          VARCHAR(50) PRIMARY KEY,
        code        VARCHAR(50) UNIQUE NOT NULL,
        name        VARCHAR(100) NOT NULL,
        description TEXT,
        purpose     TEXT,
        status      VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active','Inactive')),
        sort_order  INT DEFAULT 0,
        created_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Add purpose column if it doesn't exist yet (idempotent)
    await client.query(`ALTER TABLE user_levels ADD COLUMN IF NOT EXISTS purpose TEXT;`);

    // ── 2. Create user_level_modules table ──
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_level_modules (
        id            SERIAL PRIMARY KEY,
        user_level_id VARCHAR(50) REFERENCES user_levels(id) ON DELETE CASCADE,
        module_key    VARCHAR(50) NOT NULL,
        module_name   VARCHAR(100) NOT NULL,
        is_available  BOOLEAN DEFAULT FALSE,
        CONSTRAINT unique_user_level_module UNIQUE(user_level_id, module_key)
      );
    `);

    // ── 3. Create user_level_roles junction table ──
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_level_roles (
        user_level_id VARCHAR(50) REFERENCES user_levels(id) ON DELETE CASCADE,
        role_name     VARCHAR(100) NOT NULL,
        role_label    VARCHAR(100),
        PRIMARY KEY (user_level_id, role_name)
      );
    `);

    // ── 4. Ensure users table has required columns ──
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS user_level_id VARCHAR(50);`);
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS user_level VARCHAR(100);`);
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS data_scope VARCHAR(50) DEFAULT 'ASSIGNED_RECORD';`);
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS company_name VARCHAR(100);`);

    // ── 5. Seed / upsert 5 correct default User Levels ──
    const defaultUserLevels = [
      {
        id: 'LEVEL-01',
        code: 'BREEDER',
        name: 'Breeder Account',
        description: 'Breeding specialist & AI operations professional managing services and programs.',
        purpose: 'Manage and provide breeding services.',
        sortOrder: 1
      },
      {
        id: 'LEVEL-02',
        code: 'FARM_OWNER',
        name: 'Farm Owner Account',
        description: 'Owner/manager of farm stations controlling farm animals, breeding, and costs.',
        purpose: 'Own and manage farm operations and authorized livestock.',
        sortOrder: 2
      },
      {
        id: 'LEVEL-03',
        code: 'FARM_MANAGER',
        name: 'Farmer / Farm Manager Account',
        description: 'Day-to-day operational manager of an authorized farm under a Farm Owner.',
        purpose: 'Manage daily farm and livestock operations for an authorized farm.',
        sortOrder: 3
      },
      {
        id: 'LEVEL-04',
        code: 'CUSTOMER_COW_OWNER',
        name: 'Customer / Cow Owner Account',
        description: 'Restricted account for customers owning cows with read-only access to their animals.',
        purpose: 'Own cattle and access authorized animal, breeding, herdbook and certificate information.',
        sortOrder: 4
      },
      {
        id: 'LEVEL-05',
        code: 'SIRE_SOURCING_COMPANY',
        name: 'Sire Sourcing Company Account',
        description: 'Supplier providing Sires or Sire/Semen stock to the herdbook system.',
        purpose: 'Manage sire sourcing, sire information and semen stock activities.',
        sortOrder: 5
      }
    ];

    for (const lvl of defaultUserLevels) {
      await client.query(`
        INSERT INTO user_levels (id, code, name, description, purpose, sort_order, status)
        VALUES ($1, $2, $3, $4, $5, $6, 'Active')
        ON CONFLICT (id) DO UPDATE SET
          code        = EXCLUDED.code,
          name        = EXCLUDED.name,
          description = EXCLUDED.description,
          purpose     = EXCLUDED.purpose,
          sort_order  = EXCLUDED.sort_order,
          updated_at  = CURRENT_TIMESTAMP;
      `, [lvl.id, lvl.code, lvl.name, lvl.description, lvl.purpose, lvl.sortOrder]);
    }

    // ── 6. Full module catalogue ──
    const allModules = [
      { key: 'dashboard',          name: 'Dashboard',                  category: 'General' },
      { key: 'breeding',           name: 'Breeding Program',           category: 'Livestock' },
      { key: 'sires',              name: 'Sire Register',              category: 'Livestock' },
      { key: 'dams',               name: 'Dam Register',               category: 'Livestock' },
      { key: 'calves',             name: 'Calf Register',              category: 'Livestock' },
      { key: 'herdbook',           name: 'Herdbook Management',        category: 'Certification' },
      { key: 'certificates',       name: 'Certificate Center',         category: 'Certification' },
      { key: 'stock',              name: 'Stock Insemination',         category: 'Inventory' },
      { key: 'user_management',    name: 'User Management',            category: 'Administration' },
      { key: 'user_levels',        name: 'User Level Management',      category: 'Administration' },
      { key: 'role_management',    name: 'Role Management',            category: 'Administration' },
      { key: 'permission_mgmt',    name: 'Permission Management',      category: 'Administration' },
      { key: 'system_setup',       name: 'System Setup',               category: 'Administration' },
      { key: 'audit_logs',         name: 'Audit Logs',                 category: 'Administration' },
      { key: 'farm_management',    name: 'Farm Management',            category: 'Administration' },
    ];

    // Default modules per level
    const defaultModuleMap: Record<string, string[]> = {
      'LEVEL-01': ['dashboard', 'breeding', 'sires', 'dams', 'calves', 'herdbook', 'certificates', 'stock'],
      'LEVEL-02': ['dashboard', 'breeding', 'sires', 'dams', 'calves', 'herdbook', 'certificates'],
      'LEVEL-03': ['dashboard', 'breeding', 'dams', 'calves', 'herdbook', 'certificates'],
      'LEVEL-04': ['dashboard', 'calves', 'herdbook', 'certificates'],
      'LEVEL-05': ['dashboard', 'sires', 'stock', 'herdbook', 'certificates'],
    };

    for (const [levelId, enabledModules] of Object.entries(defaultModuleMap)) {
      for (const mod of allModules) {
        const isAvailable = enabledModules.includes(mod.key);
        await client.query(`
          INSERT INTO user_level_modules (user_level_id, module_key, module_name, is_available)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (user_level_id, module_key) DO UPDATE SET
            module_name  = EXCLUDED.module_name,
            is_available = EXCLUDED.is_available;
        `, [levelId, mod.key, mod.name, isAvailable]);
      }
    }

    // ── 7. Seed default role associations ──
    const defaultRoleMap: Record<string, { role_name: string; role_label: string }[]> = {
      'LEVEL-01': [
        { role_name: 'Breeder',             role_label: 'Breeder' },
        { role_name: 'Breeding Specialist', role_label: 'Breeding Specialist' },
        { role_name: 'Breeding Manager',    role_label: 'Breeding Manager' },
      ],
      'LEVEL-02': [
        { role_name: 'Farm Owner',   role_label: 'Farm Owner' },
        { role_name: 'Farm Manager', role_label: 'Farm Manager' },
      ],
      'LEVEL-03': [
        { role_name: 'Farm Manager', role_label: 'Farm Manager' },
        { role_name: 'Farm Staff',   role_label: 'Farm Staff' },
        { role_name: 'Veterinarian', role_label: 'Veterinarian' },
      ],
      'LEVEL-04': [
        { role_name: 'Customer',   role_label: 'Customer' },
        { role_name: 'Cow Owner',  role_label: 'Cow Owner' },
      ],
      'LEVEL-05': [
        { role_name: 'Company Manager', role_label: 'Company Manager' },
        { role_name: 'Sire Specialist', role_label: 'Sire Specialist' },
        { role_name: 'Stock Manager',   role_label: 'Stock Manager' },
      ],
    };

    for (const [levelId, roles] of Object.entries(defaultRoleMap)) {
      for (const r of roles) {
        await client.query(`
          INSERT INTO user_level_roles (user_level_id, role_name, role_label)
          VALUES ($1, $2, $3)
          ON CONFLICT (user_level_id, role_name) DO UPDATE SET role_label = EXCLUDED.role_label;
        `, [levelId, r.role_name, r.role_label]);
      }
    }

    // ── 8. Performance indexes ──
    await client.query(`CREATE INDEX IF NOT EXISTS idx_user_level_modules_level ON user_level_modules(user_level_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_user_level_roles_level ON user_level_roles(user_level_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_users_user_level_id ON users(user_level_id);`);

    await client.query('COMMIT');
    console.log('[✓] Successfully migrated enhanced user_levels system');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error migrating user_levels enhanced tables:', err);
    throw err;
  } finally {
    client.release();
  }
}

if (require.main === module) {
  migrateUserLevelsEnhanced().then(() => process.exit(0)).catch(() => process.exit(1));
}
