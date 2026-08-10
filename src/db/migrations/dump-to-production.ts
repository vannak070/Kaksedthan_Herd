/**
 * DUMP LOCAL DB → PRODUCTION
 * Reads ALL real cattle data from the LOCAL PostgreSQL (port 5433)
 * and restores it to PRODUCTION PostgreSQL (port 5432 on server).
 *
 * Run locally: npx tsx src/db/migrations/dump-to-production.ts
 * The PROD_* env vars must be set or passed inline.
 */
import { Pool } from 'pg';

// ── Local DB (source of truth) ──────────────────────────────────────────────
const localPool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     Number(process.env.DB_PORT) || 5433,
  user:     process.env.DB_USER     || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres123',
  database: process.env.DB_NAME     || 'kaksedthan_herdbook',
  ssl: false,
});

// ── Production DB (destination) ─────────────────────────────────────────────
const prodPool = new Pool({
  host:     process.env.PROD_DB_HOST     || '104.248.149.103',
  port:     Number(process.env.PROD_DB_PORT) || 5432,
  user:     process.env.PROD_DB_USER     || 'postgres',
  password: process.env.PROD_DB_PASSWORD || 'postgres',
  database: process.env.PROD_DB_NAME     || 'kaksedthan_herdbook',
  ssl: false,
});

async function run() {
  console.log('=== 🐄 Dump Local Real Data → Production ===');

  const local  = await localPool.connect();
  const prod   = await prodPool.connect();

  try {
    // ── Read all data from local ──────────────────────────────────────────
    console.log('\n[1] Reading from local database...');
    const stock    = (await local.query('SELECT * FROM stock')).rows;
    const wt       = (await local.query('SELECT * FROM weight_tracking')).rows;
    const sales    = (await local.query('SELECT * FROM sales_tracking')).rows;
    const batches  = (await local.query('SELECT * FROM batches')).rows;
    const batchCows= (await local.query('SELECT * FROM batch_cows')).rows;
    const expenses = (await local.query('SELECT * FROM expenses')).rows;
    const health   = (await local.query('SELECT * FROM health_logs')).rows;
    const users    = (await local.query('SELECT * FROM users')).rows;
    const settings = (await local.query('SELECT * FROM master_settings')).rows;

    console.log(`   stock: ${stock.length}`);
    console.log(`   weight_tracking: ${wt.length}`);
    console.log(`   sales_tracking: ${sales.length}`);
    console.log(`   batches: ${batches.length}`);
    console.log(`   batch_cows: ${batchCows.length}`);
    console.log(`   expenses: ${expenses.length}`);
    console.log(`   health_logs: ${health.length}`);
    console.log(`   users: ${users.length}`);

    // ── Write to production ───────────────────────────────────────────────
    console.log('\n[2] Writing to production database...');
    await prod.query('BEGIN');

    // Clear existing test data (preserves table structure)
    await prod.query('DELETE FROM batch_cows');
    await prod.query('DELETE FROM health_logs');
    await prod.query('DELETE FROM sales_tracking');
    await prod.query('DELETE FROM weight_tracking');
    await prod.query('DELETE FROM expenses');
    await prod.query('DELETE FROM batches');
    await prod.query('DELETE FROM stock');

    // Restore stock
    for (const s of stock) {
      await prod.query(
        `INSERT INTO stock (id,no,breed,sex,age,weight,owner_name,location,phone,
           buy_type,unit_price,total_price,health_status,status,purchase_date,
           remark,purchase_type,payment_method,image_url,created_at,updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)
         ON CONFLICT (id) DO UPDATE SET
           no=EXCLUDED.no, breed=EXCLUDED.breed, sex=EXCLUDED.sex,
           age=EXCLUDED.age, weight=EXCLUDED.weight, owner_name=EXCLUDED.owner_name,
           location=EXCLUDED.location, status=EXCLUDED.status,
           health_status=EXCLUDED.health_status, updated_at=NOW()`,
        [s.id,s.no,s.breed,s.sex,s.age,s.weight,s.owner_name,s.location,
         s.phone,s.buy_type,s.unit_price,s.total_price,s.health_status,
         s.status,s.purchase_date,s.remark,s.purchase_type,s.payment_method,
         s.image_url,s.created_at,s.updated_at]
      );
    }
    console.log(`   ✓ ${stock.length} cattle restored`);

    // Restore weight_tracking
    for (const w of wt) {
      await prod.query(
        `INSERT INTO weight_tracking (cow_id,breed,age,old_weight,current_weight,gain_loss,health_status,status,tracking_date)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [w.cow_id,w.breed,w.age,w.old_weight,w.current_weight,w.gain_loss,w.health_status,w.status,w.tracking_date]
      );
    }
    console.log(`   ✓ ${wt.length} weight records restored`);

    // Restore sales_tracking
    for (const s of sales) {
      await prod.query(
        `INSERT INTO sales_tracking (cow_id,breed,age,weight,unit_price,total_price,status,sales_date,sale_type,buyer)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [s.cow_id,s.breed,s.age,s.weight,s.unit_price,s.total_price,s.status,s.sales_date,s.sale_type,s.buyer]
      );
    }
    console.log(`   ✓ ${sales.length} sales records restored`);

    // Restore batches
    for (const b of batches) {
      await prod.query(
        `INSERT INTO batches (id,name,type,start_date,status,notes,farm_location,feeding_program,created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, status=EXCLUDED.status,
           feeding_program=EXCLUDED.feeding_program`,
        [b.id,b.name,b.type,b.start_date,b.status,b.notes,b.farm_location,b.feeding_program,b.created_at]
      );
    }
    console.log(`   ✓ ${batches.length} batches restored`);

    // Restore batch_cows
    for (const bc of batchCows) {
      await prod.query(
        `INSERT INTO batch_cows (batch_id,cow_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`,
        [bc.batch_id,bc.cow_id]
      );
    }
    console.log(`   ✓ ${batchCows.length} batch-cow links restored`);

    // Restore expenses
    for (const e of expenses) {
      await prod.query(
        `INSERT INTO expenses (id,category,amount,date,description,farm_location,created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7)
         ON CONFLICT (id) DO UPDATE SET amount=EXCLUDED.amount`,
        [e.id,e.category,e.amount,e.date,e.description,e.farm_location,e.created_at]
      );
    }
    console.log(`   ✓ ${expenses.length} expenses restored`);

    // Restore health logs
    for (const h of health) {
      await prod.query(
        `INSERT INTO health_logs (id,cow_id,type,name,date,administered_by,cost,notes,created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         ON CONFLICT (id) DO NOTHING`,
        [h.id,h.cow_id,h.type,h.name,h.date,h.administered_by,h.cost,h.notes,h.created_at]
      );
    }
    console.log(`   ✓ ${health.length} health logs restored`);

    // Restore users (ON CONFLICT — keep existing prod passwords)
    for (const u of users) {
      await prod.query(
        `INSERT INTO users (id,name,email,role,status,password,farm_location,permissions,created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         ON CONFLICT (id) DO UPDATE SET
           name=EXCLUDED.name, role=EXCLUDED.role, status=EXCLUDED.status,
           farm_location=EXCLUDED.farm_location, permissions=EXCLUDED.permissions`,
        [u.id,u.name,u.email,u.role,u.status,u.password,u.farm_location,u.permissions,u.created_at]
      );
    }
    console.log(`   ✓ ${users.length} users synced`);

    // Restore master_settings
    for (const ms of settings) {
      await prod.query(
        `INSERT INTO master_settings (key, data) VALUES ($1, $2)
         ON CONFLICT (key) DO UPDATE SET data=EXCLUDED.data`,
        [ms.key, ms.data]
      );
    }
    console.log(`   ✓ master_settings synced`);

    await prod.query('COMMIT');
    console.log('\n✅ All real data successfully pushed to production!');

  } catch (err: unknown) {
    await prod.query('ROLLBACK');
    console.error('\n❌ Failed (rolled back):', err instanceof Error ? err.message : err);
    process.exit(1);
  } finally {
    local.release();
    prod.release();
    await localPool.end();
    await prodPool.end();
    process.exit(0);
  }
}

run();
