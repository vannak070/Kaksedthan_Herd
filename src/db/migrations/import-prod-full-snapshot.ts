import fs from 'fs';
import { Pool } from 'pg';

const prodPool = new Pool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres123',
  database: process.env.DB_NAME || 'livestock_db',
  ssl: false,
});

async function importFullSnapshot() {
  const filePath = process.argv[2] || '/tmp/localhost_full_snapshot.json';
  console.log(`=== 🔄 Importing Full Snapshot from ${filePath} into Production Database ===`);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Snapshot file not found: ${filePath}`);
  }

  const snapshot = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const client = await prodPool.connect();

  try {
    await client.query('BEGIN');

    // Clean tables in reverse dependency order
    const tablesToClean = [
      'user_level_modules', 'user_level_permissions', 'user_level_roles', 'user_roles', 'role_permissions',
      'batch_cows', 'health_logs', 'sales_tracking', 'weight_tracking', 'expenses', 'feed_transactions',
      'certificates', 'stock_insemination', 'calves', 'breeding_programs', 'dams', 'sires',
      'batches', 'stock', 'users', 'feed_products', 'master_settings', 'breed_configurations',
      'sourcing_companies', 'customers', 'farms', 'breeders', 'user_levels', 'roles', 'permissions'
    ];

    for (const tbl of tablesToClean) {
      try {
        await client.query(`SAVEPOINT clean_sp`);
        await client.query(`DELETE FROM ${tbl}`);
        await client.query(`RELEASE SAVEPOINT clean_sp`);
      } catch {
        await client.query(`ROLLBACK TO SAVEPOINT clean_sp`);
      }
    }

    // Helper to insert rows dynamically
    const insertRows = async (table: string, rows: any[]) => {
      if (!rows || rows.length === 0) return;
      let inserted = 0;
      for (const row of rows) {
        const keys = Object.keys(row);
        const values = Object.values(row).map(v => typeof v === 'object' && v !== null ? JSON.stringify(v) : v);
        const colNames = keys.join(', ');
        const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
        const sql = `INSERT INTO ${table} (${colNames}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`;
        try {
          await client.query(`SAVEPOINT row_sp`);
          await client.query(sql, values);
          await client.query(`RELEASE SAVEPOINT row_sp`);
          inserted++;
        } catch (err: any) {
          await client.query(`ROLLBACK TO SAVEPOINT row_sp`);
        }
      }
      console.log(`   ✓ ${table}: ${inserted}/${rows.length} rows inserted`);
    };

    await insertRows('permissions', snapshot.permissions);
    await insertRows('roles', snapshot.roles);
    await insertRows('user_levels', snapshot.user_levels);
    await insertRows('breeders', snapshot.breeders);
    await insertRows('farms', snapshot.farms);
    await insertRows('customers', snapshot.customers);
    await insertRows('sourcing_companies', snapshot.sourcing_companies);
    await insertRows('breed_configurations', snapshot.breed_configurations);
    await insertRows('master_settings', snapshot.master_settings);
    await insertRows('feed_products', snapshot.feed_products);
    await insertRows('users', snapshot.users);
    await insertRows('stock', snapshot.stock);
    await insertRows('batches', snapshot.batches);
    await insertRows('sires', snapshot.sires);
    await insertRows('dams', snapshot.dams);
    await insertRows('breeding_programs', snapshot.breeding_programs);
    await insertRows('calves', snapshot.calves);
    await insertRows('stock_insemination', snapshot.stock_insemination);
    await insertRows('certificates', snapshot.certificates);
    await insertRows('feed_transactions', snapshot.feed_transactions);
    await insertRows('expenses', snapshot.expenses);
    await insertRows('weight_tracking', snapshot.weight_tracking);
    await insertRows('sales_tracking', snapshot.sales_tracking);
    await insertRows('health_logs', snapshot.health_logs);
    await insertRows('batch_cows', snapshot.batch_cows);
    await insertRows('role_permissions', snapshot.role_permissions);
    await insertRows('user_roles', snapshot.user_roles);
    await insertRows('user_level_roles', snapshot.user_level_roles);
    await insertRows('user_level_permissions', snapshot.user_level_permissions);
    await insertRows('user_level_modules', snapshot.user_level_modules);

    await client.query('COMMIT');
    console.log('✅ Full snapshot successfully imported into production database!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Import failed (rolled back):', err);
    process.exit(1);
  } finally {
    client.release();
    await prodPool.end();
  }
}

importFullSnapshot().catch(err => {
  console.error('❌ Import execution error:', err);
  process.exit(1);
});
