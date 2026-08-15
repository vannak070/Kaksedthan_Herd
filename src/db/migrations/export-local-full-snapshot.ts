import fs from 'fs';
import { Pool } from 'pg';

const localPool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5433,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres123',
  database: process.env.DB_NAME || 'kaksedthan_herdbook',
  ssl: false,
});

async function exportFullSnapshot() {
  console.log('=== 📦 Exporting Full Localhost Database Snapshot ===');
  const client = await localPool.connect();
  try {
    const getRows = async (table: string) => {
      try {
        const res = await client.query(`SELECT * FROM ${table}`);
        return res.rows;
      } catch {
        return [];
      }
    };

    const snapshot = {
      exported_at: new Date().toISOString(),
      stock: await getRows('stock'),
      weight_tracking: await getRows('weight_tracking'),
      sales_tracking: await getRows('sales_tracking'),
      batches: await getRows('batches'),
      batch_cows: await getRows('batch_cows'),
      expenses: await getRows('expenses'),
      health_logs: await getRows('health_logs'),
      feed_products: await getRows('feed_products'),
      feed_transactions: await getRows('feed_transactions'),
      users: await getRows('users'),
      master_settings: await getRows('master_settings'),
      sires: await getRows('sires'),
      dams: await getRows('dams'),
      calves: await getRows('calves'),
      breeding_programs: await getRows('breeding_programs'),
      stock_insemination: await getRows('stock_insemination'),
      certificates: await getRows('certificates'),
      breed_configurations: await getRows('breed_configurations'),
      sourcing_companies: await getRows('sourcing_companies'),
      breeders: await getRows('breeders'),
      customers: await getRows('customers'),
      farms: await getRows('farms'),
      user_levels: await getRows('user_levels'),
      roles: await getRows('roles'),
      permissions: await getRows('permissions'),
      role_permissions: await getRows('role_permissions'),
      user_roles: await getRows('user_roles'),
      user_level_roles: await getRows('user_level_roles'),
      user_level_permissions: await getRows('user_level_permissions'),
      user_level_modules: await getRows('user_level_modules'),
    };

    const outputPath = '/tmp/localhost_full_snapshot.json';
    fs.writeFileSync(outputPath, JSON.stringify(snapshot, null, 2), 'utf8');
    console.log(`✅ Snapshot successfully exported to ${outputPath}`);
    console.log(`   Cattle Stock: ${snapshot.stock.length} | Weight Logs: ${snapshot.weight_tracking.length} | Feed Txs: ${snapshot.feed_transactions.length} | Users: ${snapshot.users.length}`);
  } finally {
    client.release();
    await localPool.end();
  }
}

exportFullSnapshot().catch(err => {
  console.error('❌ Export failed:', err);
  process.exit(1);
});
