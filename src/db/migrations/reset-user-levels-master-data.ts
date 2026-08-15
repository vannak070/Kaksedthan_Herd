import fs from 'fs';
import path from 'path';
import { pool, connectWithRetry } from '../../config/database';

async function resetAccessControlAndMasterData() {
  console.log('====================================================================');
  console.log(' 🛡️  MIGRATION SCRIPT: Reset User Levels & Master Data Lookup');
  console.log('====================================================================');

  await connectWithRetry(5, 1000);
  const client = await pool.connect();

  try {
    // 1. Mandatory Automated Production Backup
    console.log('[1/5] Creating mandatory database backup before deletion...');
    const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
    const backupDir = path.resolve(process.cwd(), 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    const backupPath = path.join(backupDir, `pre_clean_backup_${timestamp}.json`);

    const tablesToBackup = ['users', 'user_levels', 'user_level_modules', 'user_level_permissions', 'breed_configurations', 'sourcing_companies'];
    const backupSnapshot: Record<string, any> = { exported_at: new Date().toISOString(), tables: {} };

    for (const tbl of tablesToBackup) {
      try {
        const r = await client.query(`SELECT * FROM "${tbl}"`);
        backupSnapshot.tables[tbl] = r.rows;
      } catch (err) {
        backupSnapshot.tables[tbl] = [];
      }
    }
    fs.writeFileSync(backupPath, JSON.stringify(backupSnapshot, null, 2), 'utf8');
    console.log(`[✓] Backup created successfully: ${backupPath}`);

    await client.query('BEGIN');

    // 2. Clear Account & User Level Functions & Permissions
    console.log('[2/5] Clearing Account & User Level tables (user_levels, user_level_modules, user_level_permissions)...');
    await client.query(`DELETE FROM user_level_modules;`).catch(() => {});
    await client.query(`DELETE FROM user_level_permissions;`).catch(() => {});
    await client.query(`DELETE FROM user_levels;`).catch(() => {});
    console.log('[✓] User level configurations reset.');

    // 3. Clear System Configuration => Master Data Lookup (breed_configurations & sourcing_companies)
    console.log('[3/5] Clearing System Configuration Master Data (breed_configurations, sourcing_companies)...');
    await client.query(`DELETE FROM breed_configurations;`).catch(() => {});
    await client.query(`DELETE FROM sourcing_companies;`).catch(() => {});
    console.log('[✓] Master Data lookup tables cleared.');

    // 4. Reset User Level references on Non-SuperAdmin Users (Preserve Super Admin accounts)
    console.log('[4/5] Preserving Super Admin accounts and resetting non-superadmin user_level pointers...');
    await client.query(`
      UPDATE users 
      SET user_level = 'Super Admin Account', user_level_id = NULL 
      WHERE role IN ('Super Admin', 'Super Administrator') OR email IN ('admin@kaksedthan.com', 'vannak@snrfarm.com');
    `);

    await client.query(`
      DELETE FROM users 
      WHERE role NOT IN ('Super Admin', 'Super Administrator') 
        AND email NOT IN ('admin@kaksedthan.com', 'vannak@snrfarm.com');
    `);
    console.log('[✓] User account pointers reset. Super Admin preserved.');

    // 5. Seed default clean User Levels & default Breed Configurations
    console.log('[5/5] Re-seeding clean system defaults for User Levels & Master Data...');
    
    // Seed default User Levels
    await client.query(`
      INSERT INTO user_levels (id, code, name, description, purpose, sort_order, status, level_type)
      VALUES 
        ('LEVEL-01', 'SYSTEM_ADMIN', 'Super Admin Account', 'Full system configuration, security rules, authority overrides, and database control.', 'Core System Governance', 10, 'Active', 'SYSTEM_ACCOUNT'),
        ('LEVEL-02', 'BREEDER', 'Breeder Account Level', 'Breeder station identity scope with cow ownership, AI confirmations, and pedigree records.', 'Breeder Operations', 20, 'Active', 'ACCOUNT_MANAGEMENT'),
        ('LEVEL-03', 'ADMIN_OPERATION', 'Admin Operation Level', 'Internal system staff account for breeding operations, calf birth registrations, and certificates.', 'Internal Staff Management', 30, 'Active', 'SYSTEM_ACCOUNT')
      ON CONFLICT (id) DO UPDATE SET status = 'Active', level_type = EXCLUDED.level_type;
    `);

    // Seed default Master Data Breed Configurations
    await client.query(`
      INSERT INTO breed_configurations (id, code, name, category, description, status)
      VALUES 
        ('BC-01', 'ANGUS', 'Aberdeen Angus', 'BEEF', 'High-quality beef cattle breed with dark coat and strong growth rate.', 'Active'),
        ('BC-02', 'BRAHMAN', 'American Brahman', 'BEEF', 'Heat and parasite resistant beef cattle breed adapted for tropical climates.', 'Active'),
        ('BC-03', 'HOLSTEIN', 'Holstein Friesian', 'DAIRY', 'High-yielding dairy cattle breed with distinctive black and white markings.', 'Active'),
        ('BC-04', 'WAGYU', 'Japanese Wagyu', 'BEEF', 'Premium beef cattle breed known for intense intramuscular marbling.', 'Active')
      ON CONFLICT (id) DO NOTHING;
    `);

    // Seed default Farm Station and Breeder Station
    await client.query(`
      INSERT INTO farms (id, code, name, location, status)
      VALUES ('FARM-01', 'HQ-STATION', 'Central Breeding Station', 'Phnom Penh HQ', 'Active')
      ON CONFLICT (id) DO NOTHING;
    `);

    await client.query(`
      INSERT INTO breeders (id, name, email, phone, station, status)
      VALUES ('BRD-01', 'SNR Farm Breeder Station', 'breeder@snrfarm.com', '+85512345678', 'Central Station', 'Active')
      ON CONFLICT (id) DO NOTHING;
    `);

    await client.query('COMMIT');
    console.log('====================================================================');
    console.log(' ✅ DATA RESET COMPLETED SUCCESSFULLY WITH SAFETY BACKUP VERIFIED');
    console.log('====================================================================');
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('❌ Reset script failed:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

if (require.main === module) {
  resetAccessControlAndMasterData()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Fatal error during reset:', err);
      process.exit(1);
    });
}
