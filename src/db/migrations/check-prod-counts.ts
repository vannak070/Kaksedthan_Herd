import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres123',
  database: process.env.DB_NAME || 'livestock_db',
  ssl: false,
});

async function check() {
  console.log(`=== 📊 Checking Production Database (${process.env.DB_NAME || 'livestock_db'}) Table Counts ===`);
  const tables = [
    'stock', 'weight_tracking', 'sales_tracking', 'batches', 'batch_cows',
    'expenses', 'health_logs', 'feed_products', 'feed_transactions', 'users',
    'master_settings', 'sires', 'dams', 'calves', 'breeding_programs',
    'stock_insemination', 'certificates', 'breed_configurations', 'sourcing_companies',
    'breeders', 'customers', 'farms', 'user_levels', 'roles', 'permissions'
  ];

  const client = await pool.connect();
  try {
    for (const t of tables) {
      try {
        const res = await client.query(`SELECT count(*) FROM ${t}`);
        console.log(`   ${t.padEnd(25, ' ')}: ${res.rows[0].count} rows`);
      } catch (err: any) {
        console.log(`   ${t.padEnd(25, ' ')}: ❌ ERROR -> ${err.message}`);
      }
    }
  } finally {
    client.release();
    await pool.end();
  }
}

check().catch(console.error);
