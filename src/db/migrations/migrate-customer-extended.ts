import { query } from '../../config/database';

export async function migrateCustomerExtended() {
  console.log('--- Migrating Customers Table Extended Fields ---');

  await query(`
    ALTER TABLE customers
    ADD COLUMN IF NOT EXISTS code VARCHAR(50),
    ADD COLUMN IF NOT EXISTS image_url TEXT,
    ADD COLUMN IF NOT EXISTS province VARCHAR(100),
    ADD COLUMN IF NOT EXISTS district VARCHAR(100),
    ADD COLUMN IF NOT EXISTS commune VARCHAR(100),
    ADD COLUMN IF NOT EXISTS village VARCHAR(100);
  `);

  // Populate code for existing customers if missing
  await query(`
    UPDATE customers
    SET code = id
    WHERE code IS NULL;
  `);

  console.log('✅ Customers table extended migration complete.');
}

if (require.main === module) {
  migrateCustomerExtended()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Migration error:', err);
      process.exit(1);
    });
}
