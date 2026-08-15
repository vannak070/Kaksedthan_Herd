import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres123',
  database: process.env.DB_NAME || 'livestock_db',
  connectionTimeoutMillis: 3000
});

async function audit() {
  console.log('=== 🔍 Production Database Connection & Health Audit ===');
  const start = Date.now();
  const client = await pool.connect();
  const connTime = Date.now() - start;
  console.log(`✓ Connection Latency: ${connTime}ms`);

  const ver = await client.query('SELECT version(), current_database(), current_user;');
  console.log(`✓ Database Name: ${ver.rows[0].current_database}`);
  console.log(`✓ Database User: ${ver.rows[0].current_user}`);
  console.log(`✓ PostgreSQL Version: ${ver.rows[0].version.split(',')[0]}`);

  const stat = await client.query("SELECT count(*) as active_conns FROM pg_stat_activity WHERE datname = 'livestock_db';");
  console.log(`✓ Active Connections: ${stat.rows[0].active_conns}`);

  const tables = ['stock', 'weight_tracking', 'expenses', 'feed_transactions', 'users', 'breed_configurations', 'user_levels', 'master_settings'];
  console.log('\n--- Table Row Counts & Query Latency ---');
  for (const t of tables) {
    const qStart = Date.now();
    const res = await client.query(`SELECT count(*) FROM ${t}`);
    const qTime = Date.now() - qStart;
    console.log(`   • ${t.padEnd(22, ' ')}: ${res.rows[0].count} rows (${qTime}ms)`);
  }

  client.release();
  await pool.end();
  console.log('\n✅ Production database connection audit completed successfully!');
}

audit().catch(err => {
  console.error('❌ Audit failed:', err.message);
  process.exit(1);
});
