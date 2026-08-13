import { query, withTransaction } from '../../config/database';

export async function migrateV3PerformanceIndexes() {
  console.log('=== ⚡ Executing V3 System-Wide Performance Index Migration ===');

  await withTransaction(async (client) => {
    // 1. Breed Configurations Functional & Field Indexes
    await client.query(`CREATE INDEX IF NOT EXISTS idx_breed_conf_name_lower ON breed_configurations (LOWER(TRIM(name)));`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_breed_conf_code_lower ON breed_configurations (LOWER(TRIM(code)));`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_breed_conf_is_active ON breed_configurations (is_active);`);
    console.log('[✓] Indexed breed_configurations (functional & filter indexes)');

    // 2. Audit Logs Performance Indexes
    await client.query(`CREATE INDEX IF NOT EXISTS idx_audit_logs_module ON audit_logs(module);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_audit_logs_performed_by ON audit_logs(performed_by);`);
    console.log('[✓] Indexed audit_logs table');

    // 3. Stock & Inventory Performance Indexes
    await client.query(`CREATE INDEX IF NOT EXISTS idx_stock_status ON stock(status);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_stock_location ON stock(location);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_stock_breed ON stock(breed);`);
    console.log('[✓] Indexed stock table');

    // 4. Tracking & Analytics Indexes
    await client.query(`CREATE INDEX IF NOT EXISTS idx_weight_tracking_cow_id ON weight_tracking(cow_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_weight_tracking_date ON weight_tracking(tracking_date DESC);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_sales_tracking_cow_id ON sales_tracking(cow_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_sales_tracking_date ON sales_tracking(sales_date DESC);`);
    console.log('[✓] Indexed weight_tracking and sales_tracking tables');

    // 5. Insemination Stock & Sire References
    await client.query(`CREATE INDEX IF NOT EXISTS idx_sires_breed_id ON sires(breed_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_dams_breed_id ON dams(breed_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_calves_breed_id ON calves(breed_id);`);
    console.log('[✓] Indexed breed foreign keys on livestock registers');
  });

  console.log('✅ V3 System-Wide Performance Index Migration Completed Successfully!');
}

if (require.main === module) {
  migrateV3PerformanceIndexes()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ V3 Index migration failed:', err);
      process.exit(1);
    });
}
