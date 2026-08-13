import fs from 'fs';
import path from 'path';
import { pool, connectWithRetry } from '../../config/database';
import { invalidateDbDataCache } from '../../lib/db';

async function resetSystemKeepSuperAdmin() {
  console.log('=== 🧹 Resetting Database & Clearing All Data (Keeping Super Admin) ===');

  await connectWithRetry(5, 1000);
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Operational data tables to truncate
    const tablesToTruncate = [
      'activity_logs',
      'attachments',
      'audit_logs',
      'batch_cows',
      'batches',
      'birth_certificates',
      'breeders',
      'breeding_programs',
      'breeding_records',
      'breeding_setup',
      'calves',
      'calves_herd',
      'calving_events',
      'certificates',
      'customers',
      'dams',
      'expenses',
      'farms',
      'feed_products',
      'feed_transactions',
      'health_logs',
      'herdbook_registrations',
      'herdbook_setup',
      'media_assets',
      'pedigrees',
      'sales_tracking',
      'sires',
      'sourcing_companies',
      'stock',
      'stock_insemination',
      'weight_tracking'
    ];

    console.log('[1/4] Truncating operational data tables...');
    for (const table of tablesToTruncate) {
      await client.query(`TRUNCATE TABLE ${table} RESTART IDENTITY CASCADE;`).catch((err) => {
        console.warn(`[Truncate Notice] Could not truncate ${table}:`, err.message);
      });
    }
    console.log('[✓] Operational data tables truncated successfully.');

    // 2. Clean users table — preserve ONLY Super Admin
    console.log('[2/4] Preserving Super Admin user and removing other accounts...');
    await client.query(`
      DELETE FROM users 
      WHERE role NOT IN ('Super Admin', 'Super Administrator') 
        AND email != 'vannak@snrfarm.com' 
        AND id != 'USR-01';
    `);

    // Ensure Super Admin user exists in DB
    const adminCheck = await client.query(`SELECT * FROM users WHERE email = 'vannak@snrfarm.com' OR id = 'USR-01' OR role = 'Super Admin'`);
    if (adminCheck.rows.length === 0) {
      console.log('[Notice] Seeding default Super Admin user USR-01...');
      await client.query(`
        INSERT INTO users (id, name, email, role, user_level, password, status)
        VALUES ('USR-01', 'Vannak Admin', 'vannak@snrfarm.com', 'Super Admin', 'Super Admin Account', 'admin', 'Active')
      `);
    } else {
      console.log(`[✓] Super Admin user preserved: ${adminCheck.rows[0].email} (${adminCheck.rows[0].name})`);
    }

    // Also clean non-superadmin user roles mapping
    await client.query(`
      DELETE FROM user_roles 
      WHERE user_id NOT IN (SELECT id FROM users);
    `).catch(() => {});

    await client.query('COMMIT');
    console.log('[3/4] Database transaction committed.');

    // 3. Reset JSON database file (src/data/db.json)
    const jsonPath = path.resolve(process.cwd(), 'src/data/db.json');
    if (fs.existsSync(jsonPath)) {
      try {
        const raw = fs.readFileSync(jsonPath, 'utf8');
        const data = JSON.parse(raw);
        data.stock = [];
        data.weightTracking = [];
        data.salesTracking = [];
        data.batches = [];
        data.healthLogs = [];
        data.expenses = [];
        data.feedProducts = [];
        data.feedTransactions = [];
        data.sires = [];
        data.dams = [];
        data.calves = [];
        data.stockInsemination = [];
        data.breedingPrograms = [];
        data.certificates = [];
        data.herdbookRegistrations = [];

        if (!data.settings) data.settings = {};
        data.settings.users = [
          {
            id: 'USR-01',
            name: 'Vannak Admin',
            email: 'vannak@snrfarm.com',
            role: 'Super Admin',
            status: 'Active',
            password: 'admin'
          }
        ];

        fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');
        console.log('[4/4] src/data/db.json reset successfully.');
      } catch (e) {
        console.warn('JSON DB reset notice:', e);
      }
    }

    // Invalidate in-memory server cache
    invalidateDbDataCache();

    console.log('=== 🎉 System Data Wipe Complete! Ready for Fresh System Setup. ===');
  } catch (error: unknown) {
    await client.query('ROLLBACK');
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[Reset DB Error]:', msg);
    throw error;
  } finally {
    client.release();
  }
}

if (require.main === module) {
  resetSystemKeepSuperAdmin()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
