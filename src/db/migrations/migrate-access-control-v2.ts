import { pool, connectWithRetry } from '../../config/database';

/**
 * Migration: Access Control V2 (Idempotent)
 * Overhauls User Levels, Roles, Permissions, User Roles, and Data Scope.
 */
export async function migrateAccessControlV2() {
  console.log('=== 🛡️  Executing Access Control V2 Database Migration ===');
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
        purpose     TEXT,
        status      VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active','Inactive')),
        sort_order  INT DEFAULT 0,
        created_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. roles table
    await client.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id          VARCHAR(50) PRIMARY KEY,
        name        VARCHAR(100) UNIQUE NOT NULL,
        category    VARCHAR(50) DEFAULT 'System',
        description TEXT,
        is_system   BOOLEAN DEFAULT FALSE,
        status      VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active','Inactive')),
        created_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. permissions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS permissions (
        id          VARCHAR(50) PRIMARY KEY,
        key         VARCHAR(100) UNIQUE NOT NULL,
        name        VARCHAR(100) NOT NULL,
        category    VARCHAR(50) NOT NULL,
        module      VARCHAR(50) NOT NULL,
        description TEXT
      );
    `);

    // 4. role_permissions junction table
    await client.query(`
      CREATE TABLE IF NOT EXISTS role_permissions (
        role_id        VARCHAR(50) REFERENCES roles(id) ON DELETE CASCADE,
        permission_key VARCHAR(100) REFERENCES permissions(key) ON DELETE CASCADE,
        PRIMARY KEY (role_id, permission_key)
      );
    `);

    // 5. user_roles junction table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_roles (
        user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
        role_id VARCHAR(50) REFERENCES roles(id) ON DELETE CASCADE,
        PRIMARY KEY (user_id, role_id)
      );
    `);

    // 6. user_level_roles junction table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_level_roles (
        user_level_id VARCHAR(50) REFERENCES user_levels(id) ON DELETE CASCADE,
        role_name     VARCHAR(100) NOT NULL,
        role_label    VARCHAR(100),
        PRIMARY KEY (user_level_id, role_name)
      );
    `);

    // 7. Ensure columns exist on users table
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS user_level_id VARCHAR(50);`);
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS user_level VARCHAR(100);`);
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS data_scope VARCHAR(50) DEFAULT 'ASSIGNED_RECORD';`);
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS farm_id VARCHAR(50);`);
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS breeder_id VARCHAR(50);`);
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS sourcing_company_id VARCHAR(50);`);
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS company_name VARCHAR(100);`);
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'Active';`);

    // 8. Seed Standard Granular Permissions
    const permissionsData = [
      // Sire Module
      { id: 'P-01', key: 'sire.view', name: 'View Sire Registry', category: 'Sire', module: 'sires', description: 'Access sire profile & lineage records' },
      { id: 'P-02', key: 'sire.create', name: 'Register New Sire', category: 'Sire', module: 'sires', description: 'Add new sire to herdbook' },
      { id: 'P-03', key: 'sire.update', name: 'Edit Sire Profile', category: 'Sire', module: 'sires', description: 'Update sire measurements and info' },
      { id: 'P-04', key: 'sire.delete', name: 'Delete Sire Entry', category: 'Sire', module: 'sires', description: 'Remove sire record' },

      // Dam Module
      { id: 'P-05', key: 'dam.view', name: 'View Dam Registry', category: 'Dam', module: 'dams', description: 'Access dam profile & breeding history' },
      { id: 'P-06', key: 'dam.create', name: 'Register New Dam', category: 'Dam', module: 'dams', description: 'Add new dam to herdbook' },
      { id: 'P-07', key: 'dam.update', name: 'Edit Dam Profile', category: 'Dam', module: 'dams', description: 'Update dam measurements and pedigree' },
      { id: 'P-08', key: 'dam.delete', name: 'Delete Dam Entry', category: 'Dam', module: 'dams', description: 'Remove dam record' },

      // Calf Module
      { id: 'P-09', key: 'calf.view', name: 'View Calf Birth Registry', category: 'Calf', module: 'calves', description: 'Access calf birth registry and lineage' },
      { id: 'P-10', key: 'calf.create', name: 'Register Calf Birth', category: 'Calf', module: 'calves', description: 'Record new calf birth' },
      { id: 'P-11', key: 'calf.update', name: 'Edit Calf Record', category: 'Calf', module: 'calves', description: 'Update calf weight & status' },
      { id: 'P-12', key: 'calf.delete', name: 'Delete Calf Entry', category: 'Calf', module: 'calves', description: 'Remove calf birth log' },
      { id: 'P-13', key: 'calf.verify', name: 'Verify Calf Birth Entry', category: 'Calf', module: 'calves', description: 'Official verification of calf birth' },

      // Breeding Program Module
      { id: 'P-14', key: 'breeding_program.view', name: 'View Breeding Programs', category: 'Breeding', module: 'breeding-programs', description: 'Access 6-step breeding workflows' },
      { id: 'P-15', key: 'breeding_program.create', name: 'Create Breeding Program', category: 'Breeding', module: 'breeding-programs', description: 'Initiate new breeding workflow' },
      { id: 'P-16', key: 'breeding_program.update', name: 'Edit Breeding Program', category: 'Breeding', module: 'breeding-programs', description: 'Modify breeding details & dates' },
      { id: 'P-17', key: 'breeding_program.confirm', name: 'Confirm Breeding Service', category: 'Breeding', module: 'breeding-programs', description: 'Confirm Insemination execution' },
      { id: 'P-18', key: 'breeding_program.approve', name: 'Approve Pregnancy Status', category: 'Breeding', module: 'breeding-programs', description: 'Confirm PD results and calving' },

      // Certification Module
      { id: 'P-19', key: 'certification.view', name: 'View Certification Center', category: 'Certification', module: 'certificates', description: 'Access certification requests' },
      { id: 'P-20', key: 'certification.apply', name: 'Apply For Certification', category: 'Certification', module: 'certificates', description: 'Submit calf/animal certification request' },
      { id: 'P-21', key: 'certification.approve', name: 'Approve Certification Request', category: 'Certification', module: 'certificates', description: 'Grant official certification' },
      { id: 'P-22', key: 'certification.reject', name: 'Reject Certification Request', category: 'Certification', module: 'certificates', description: 'Deny certification request' },
      { id: 'P-23', key: 'certificate.generate', name: 'Generate Official Certificate', category: 'Certification', module: 'certificates', description: 'Issue official A4 certificate PNG' },

      // User & Access Control Management
      { id: 'P-24', key: 'user.view', name: 'View User Accounts', category: 'User Management', module: 'users', description: 'Access user accounts list' },
      { id: 'P-25', key: 'user.create', name: 'Create User Account', category: 'User Management', module: 'users', description: 'Register new user account' },
      { id: 'P-26', key: 'user.update', name: 'Edit User Account', category: 'User Management', module: 'users', description: 'Update user account details' },
      { id: 'P-27', key: 'user.disable', name: 'Disable User Account', category: 'User Management', module: 'users', description: 'Suspend or deactivate user account' },
      { id: 'P-28', key: 'role.view', name: 'View System Roles', category: 'Role Management', module: 'roles', description: 'Access roles & permissions list' },
      { id: 'P-29', key: 'role.create', name: 'Create System Role', category: 'Role Management', module: 'roles', description: 'Define custom operational role' },
      { id: 'P-30', key: 'role.update', name: 'Modify System Role', category: 'Role Management', module: 'roles', description: 'Edit role name & assign permissions' },
      { id: 'P-31', key: 'permission.assign', name: 'Assign Permissions', category: 'Role Management', module: 'permissions', description: 'Grant permissions to roles' },

      // Export Security
      { id: 'P-32', key: 'report.export', name: 'Export System Data', category: 'Reporting', module: 'export', description: 'Export records to CSV/Excel' }
    ];

    for (const p of permissionsData) {
      await client.query(`
        INSERT INTO permissions (id, key, name, category, module, description)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (key) DO UPDATE SET
          name = EXCLUDED.name,
          category = EXCLUDED.category,
          module = EXCLUDED.module,
          description = EXCLUDED.description;
      `, [p.id, p.key, p.name, p.category, p.module, p.description]);
    }

    // 9. Seed System Roles
    const rolesData = [
      { id: 'R-01', name: 'Super Administrator', category: 'System', description: 'Full system management and security authority.', isSystem: true },
      { id: 'R-02', name: 'System Administrator', category: 'System', description: 'Manages users, farms, and system configuration.', isSystem: true },
      { id: 'R-03', name: 'Breeding Manager', category: 'Breeding', description: 'Oversees breeding programs, inseminations, and certification requests.', isSystem: false },
      { id: 'R-04', name: 'Farm Manager', category: 'Farm', description: 'Manages daily farm operations, animal records, and calf births.', isSystem: false },
      { id: 'R-05', name: 'Certification Reviewer', category: 'Quality', description: 'Reviews and approves/rejects pedigree certificate applications.', isSystem: false },
      { id: 'R-06', name: 'Customer Viewer', category: 'Restricted', description: 'Read-only access to authorized personal animals and certificates.', isSystem: false },
      { id: 'R-07', name: 'Sourcing Manager', category: 'Inventory', description: 'Manages sire inventory and semen straw stock.', isSystem: false }
    ];

    for (const r of rolesData) {
      await client.query(`
        INSERT INTO roles (id, name, category, description, is_system)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (name) DO UPDATE SET
          category = EXCLUDED.category,
          description = EXCLUDED.description,
          is_system = EXCLUDED.is_system;
      `, [r.id, r.name, r.category, r.description, r.isSystem]);
    }

    // 10. Link Permissions to System Roles
    const allPerms = permissionsData.map(p => p.key);
    const rolePermissionMappings: Record<string, string[]> = {
      'R-01': allPerms,
      'R-02': [
        'dashboard.view', 'sire.view', 'sire.create', 'sire.update', 'sire.delete',
        'dam.view', 'dam.create', 'dam.update', 'dam.delete',
        'calf.view', 'calf.create', 'calf.update', 'calf.delete',
        'breeding_program.view', 'breeding_program.create', 'breeding_program.update',
        'breeding_cost.view', 'breeding_cost.create',
        'stock.view', 'stock.create', 'stock.update',
        'farm.view', 'farm.create', 'farm.update',
        'customer.view', 'customer.create', 'customer.update',
        'herdbook.view', 'certificate.view', 'certificate.generate', 'certification.view',
        'user.view', 'user.create', 'user.update', 'role.view'
      ],
      'R-03': [
        'dashboard.view', 'sire.view', 'sire.create', 'sire.update',
        'dam.view', 'dam.create', 'dam.update',
        'calf.view', 'calf.create', 'calf.update',
        'breeding_program.view', 'breeding_program.create', 'breeding_program.update', 'breeding_program.confirm', 'breeding_program.approve',
        'breeding_cost.view', 'breeding_cost.create', 'stock.view',
        'certification.view', 'certification.apply', 'certification.approve', 'certificate.view', 'certificate.generate'
      ],
      'R-04': [
        'dashboard.view', 'sire.view', 'dam.view', 'dam.create', 'dam.update',
        'calf.view', 'calf.create', 'calf.update',
        'stock.view', 'stock.create', 'stock.update',
        'farm.view', 'farm.create', 'farm.update', 'customer.view', 'herdbook.view'
      ],
      'R-05': [
        'dashboard.view', 'sire.view', 'dam.view', 'calf.view', 'herdbook.view',
        'certificate.view', 'certificate.generate', 'certificate.download',
        'certification.view', 'certification.apply', 'certification.approve', 'certification.reject'
      ],
      'R-06': [
        'dashboard.view', 'sire.view', 'dam.view', 'calf.view', 'certificate.view', 'certificate.download'
      ],
      'R-07': [
        'dashboard.view', 'sire.view', 'sire.create', 'sire.update',
        'stock.view', 'stock.create', 'stock.update', 'stock.transfer', 'breeding_cost.view'
      ]
    };

    const validPermKeys = new Set(permissionsData.map(p => p.key));
    const rolesRes = await client.query(`SELECT id FROM roles;`);
    const validRoleIds = new Set(rolesRes.rows.map(r => r.id));

    for (const [roleId, permKeys] of Object.entries(rolePermissionMappings)) {
      if (validRoleIds.has(roleId)) {
        for (const permKey of permKeys) {
          if (validPermKeys.has(permKey)) {
            await client.query(`
              INSERT INTO role_permissions (role_id, permission_key)
              VALUES ($1, $2)
              ON CONFLICT DO NOTHING;
            `, [roleId, permKey]);
          }
        }
      }
    }

    // 11. Seed Super Admin User Level & Link Super Admin Account
    await client.query(`
      INSERT INTO user_levels (id, code, name, description, purpose, status, sort_order, level_type)
      VALUES ('LEVEL-01', 'SYSTEM_ADMIN', 'Super Admin Account', 'Full system management and security authority', 'System Administration', 'Active', 1, 'SYSTEM_ACCOUNT')
      ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, level_type = EXCLUDED.level_type;
    `);

    // 11. Link Super Admin Users to R-01 in user_roles table
    const adminUsers = await client.query(`SELECT id FROM users WHERE email IN ('admin@kaksedthan.com', 'vannak@snrfarm.com') OR role LIKE '%Super%' OR id = 'USR-01' OR id = 'USR-ADMIN-KAKSEDTHAN'`);
    for (const uRow of adminUsers.rows) {
      await client.query(`
        INSERT INTO user_roles (user_id, role_id)
        VALUES ($1, 'R-01')
        ON CONFLICT DO NOTHING;
      `, [uRow.id]);
    }

    const allPermsJson = JSON.stringify(allPerms);
    await client.query(`
      UPDATE users 
      SET role = 'Super Admin',
          user_level = 'Super Admin Account',
          user_level_id = 'LEVEL-01',
          data_scope = 'GLOBAL',
          permissions = $1::jsonb,
          status = 'Active'
      WHERE email IN ('admin@kaksedthan.com', 'vannak@snrfarm.com') OR id = 'USR-ADMIN-KAKSEDTHAN';
    `, [allPermsJson]);

    // 12. Create Performance Indexes
    await client.query(`CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON role_permissions(role_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_user_roles_user ON user_roles(user_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_users_user_level ON users(user_level_id);`);

    await client.query('COMMIT');
    console.log('[✓] Access Control V2 database migration completed successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[✗] Access Control V2 migration failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

if (require.main === module) {
  migrateAccessControlV2().then(() => process.exit(0)).catch(() => process.exit(1));
}
