/**
 * RESTORE PROD DATA SNAPSHOT TO LOCAL DATABASE
 * Reads /tmp/clone_from_prod.json and updates local PostgreSQL (localhost:5433/kaksedthan_herdbook)
 */
import fs from 'fs';
import { pool, connectWithRetry } from '../../config/database';

async function restoreLocal() {
  console.log('=== 🔄 Restoring Production Data Snapshot into Local Database ===');

  if (!fs.existsSync('/tmp/clone_from_prod.json')) {
    console.error('❌ File /tmp/clone_from_prod.json not found');
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync('/tmp/clone_from_prod.json', 'utf8'));

  await connectWithRetry(5, 1000);
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Ensure feed_products table exists locally if missing
    await client.query(`
      CREATE TABLE IF NOT EXISTS feed_products (
        id                 VARCHAR(50) PRIMARY KEY,
        name               VARCHAR(100) NOT NULL,
        category           VARCHAR(50),
        unit               VARCHAR(20) DEFAULT 'bag',
        weight_per_unit    NUMERIC(10, 2) DEFAULT 30,
        unit_cost          NUMERIC(12, 2) DEFAULT 0,
        cost_per_bag       NUMERIC(12, 2) DEFAULT 0,
        cost_per_kg        NUMERIC(12, 2) DEFAULT 0,
        min_threshold_bags NUMERIC(10, 2) DEFAULT 50,
        min_threshold_kg   NUMERIC(10, 2) DEFAULT 1500,
        description        TEXT,
        supplier           VARCHAR(100),
        status             VARCHAR(20) DEFAULT 'Active',
        created_at         TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at         TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS feed_transactions (
        id              VARCHAR(50) PRIMARY KEY,
        product_id      VARCHAR(50) REFERENCES feed_products(id) ON DELETE CASCADE,
        type            VARCHAR(20) NOT NULL,
        quantity_bags   NUMERIC(10, 2) DEFAULT 0,
        quantity_kg     NUMERIC(10, 2) DEFAULT 0,
        unit_cost       NUMERIC(12, 2) DEFAULT 0,
        total_cost      NUMERIC(12, 2) DEFAULT 0,
        date            TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        reference_no    VARCHAR(50),
        notes           TEXT,
        created_by      VARCHAR(50),
        created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Clean local tables
    await client.query('DELETE FROM batch_cows');
    await client.query('DELETE FROM feed_transactions');
    await client.query('DELETE FROM health_logs');
    await client.query('DELETE FROM sales_tracking');
    await client.query('DELETE FROM weight_tracking');
    await client.query('DELETE FROM expenses');
    await client.query('DELETE FROM batches');
    await client.query('DELETE FROM stock');
    await client.query('DELETE FROM feed_products');

    // 1. Stock
    for (const s of (data.stock || [])) {
      await client.query(
        `INSERT INTO stock (id,no,breed,sex,age,weight,owner_name,location,phone,buy_type,unit_price,total_price,health_status,status,purchase_date,remark,purchase_type,payment_method,image_url,created_at,updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21) ON CONFLICT (id) DO NOTHING`,
        [s.id,s.no,s.breed,s.sex,s.age,s.weight,s.owner_name,s.location,s.phone,s.buy_type,s.unit_price,s.total_price,s.health_status,s.status,s.purchase_date,s.remark,s.purchase_type,s.payment_method,s.image_url,s.created_at,s.updated_at]
      );
    }

    // 2. Weight Tracking
    for (const w of (data.weight_tracking || [])) {
      await client.query(
        `INSERT INTO weight_tracking (cow_id,breed,age,old_weight,current_weight,gain_loss,health_status,status,tracking_date)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [w.cow_id,w.breed,w.age,w.old_weight,w.current_weight,w.gain_loss,w.health_status,w.status,w.tracking_date]
      );
    }

    // 3. Batches
    for (const b of (data.batches || [])) {
      await client.query(
        `INSERT INTO batches (id,name,type,start_date,status,notes,farm_location,feeding_program,created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT (id) DO NOTHING`,
        [b.id,b.name,b.type,b.start_date,b.status,b.notes,b.farm_location,b.feeding_program ? JSON.stringify(b.feeding_program) : null,b.created_at]
      );
    }

    // 4. Batch Cows
    for (const bc of (data.batch_cows || [])) {
      await client.query(
        `INSERT INTO batch_cows (batch_id,cow_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`,
        [bc.batch_id, bc.cow_id]
      );
    }

    // 5. Sales Tracking
    for (const s of (data.sales_tracking || [])) {
      await client.query(
        `INSERT INTO sales_tracking (cow_id,breed,age,weight,unit_price,total_price,status,sales_date,sale_type,buyer)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [s.cow_id,s.breed,s.age,s.weight,s.unit_price,s.total_price,s.status,s.sales_date,s.sale_type,s.buyer]
      );
    }

    // 6. Expenses
    for (const e of (data.expenses || [])) {
      if (!e.id) continue;
      await client.query(
        `INSERT INTO expenses (id,category,amount,date,description,farm_location,created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (id) DO NOTHING`,
        [e.id,e.category,e.amount,e.date,e.description,e.farm_location,e.created_at]
      );
    }

    // 7. Health Logs
    for (const h of (data.health_logs || [])) {
      if (!h.id) continue;
      await client.query(
        `INSERT INTO health_logs (id,cow_id,type,name,date,administered_by,cost,notes,created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT (id) DO NOTHING`,
        [h.id,h.cow_id,h.type,h.name,h.date,h.administered_by,h.cost,h.notes,h.created_at]
      );
    }

    // 8. Feed Products
    for (const p of (data.feed_products || [])) {
      await client.query(
        `INSERT INTO feed_products (id, name, category, unit, weight_per_unit, unit_cost, min_threshold_bags, min_threshold_kg, description, supplier, status, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) ON CONFLICT (id) DO NOTHING`,
        [p.id, p.name, p.category || 'Concentrate', p.unit || 'bag', p.weight_per_unit || 30, p.unit_cost || 0, p.min_threshold_bags || 50, p.min_threshold_kg || 1500, p.description || null, p.supplier || null, p.status || 'Active', p.created_at || new Date()]
      );
    }

    // 9. Feed Transactions
    for (const ft of (data.feed_transactions || [])) {
      await client.query(
        `INSERT INTO feed_transactions (id, product_id, type, quantity_bags, quantity_kg, unit_cost, total_cost, date, reference_no, notes, created_by, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) ON CONFLICT (id) DO NOTHING`,
        [ft.id, ft.product_id, ft.type, ft.quantity_bags || 0, ft.quantity_kg || 0, ft.unit_cost || 0, ft.total_cost || 0, ft.date || new Date(), ft.reference_no || null, ft.notes || null, ft.created_by || null, ft.created_at || new Date()]
      );
    }

    // 10. Users
    for (const u of (data.users || [])) {
      await client.query(
        `INSERT INTO users (id,name,email,role,status,password,farm_location,permissions,created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name, role=EXCLUDED.role, status=EXCLUDED.status, farm_location=EXCLUDED.farm_location, permissions=EXCLUDED.permissions`,
        [u.id,u.name,u.email,u.role,u.status,u.password,u.farm_location,u.permissions ? JSON.stringify(u.permissions) : '[]',u.created_at]
      );
    }

    // 11. Master Settings
    for (const ms of (data.master_settings || [])) {
      await client.query(
        `INSERT INTO master_settings (key, data) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET data=EXCLUDED.data`,
        [ms.key, typeof ms.data === 'string' ? ms.data : JSON.stringify(ms.data)]
      );
    }

    await client.query('COMMIT');
    console.log('✅ Local database populated with production data successfully!');
  } catch (err: unknown) {
    await client.query('ROLLBACK');
    console.error('❌ Failed to restore local database:', err instanceof Error ? err.message : err);
    process.exit(1);
  } finally {
    client.release();
    process.exit(0);
  }
}

restoreLocal();
