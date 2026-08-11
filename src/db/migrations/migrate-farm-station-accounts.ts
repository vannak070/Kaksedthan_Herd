import { query } from '../../config/database';

export async function migrateFarmStationAccounts() {
  console.log('🔄 Running migration: Adding extended Farm Station columns and User Account links...');

  const sql = `
    ALTER TABLE farms ADD COLUMN IF NOT EXISTS farm_type VARCHAR(50) DEFAULT 'General Livestock Station';
    ALTER TABLE farms ADD COLUMN IF NOT EXISTS province VARCHAR(100);
    ALTER TABLE farms ADD COLUMN IF NOT EXISTS district VARCHAR(100);
    ALTER TABLE farms ADD COLUMN IF NOT EXISTS commune VARCHAR(100);
    ALTER TABLE farms ADD COLUMN IF NOT EXISTS village VARCHAR(100);
    ALTER TABLE farms ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
    ALTER TABLE farms ADD COLUMN IF NOT EXISTS email VARCHAR(100);
    ALTER TABLE farms ADD COLUMN IF NOT EXISTS owner_phone VARCHAR(50);
    ALTER TABLE farms ADD COLUMN IF NOT EXISTS owner_email VARCHAR(100);
    ALTER TABLE farms ADD COLUMN IF NOT EXISTS owner_national_id VARCHAR(50);
    ALTER TABLE farms ADD COLUMN IF NOT EXISTS user_id VARCHAR(50);

    CREATE INDEX IF NOT EXISTS idx_farms_user_id ON farms(user_id);
    CREATE INDEX IF NOT EXISTS idx_farms_code ON farms(code);
    CREATE INDEX IF NOT EXISTS idx_farms_farm_type ON farms(farm_type);
  `;

  await query(sql);
  console.log('✅ Farm Station database columns and indexes migrated successfully.');
}

if (require.main === module) {
  migrateFarmStationAccounts()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Migration failed:', err);
      process.exit(1);
    });
}
