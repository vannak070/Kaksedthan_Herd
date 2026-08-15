import { query, withTransaction } from '../../config/database';

export async function addLevelTypeToUserLevels() {
  console.log('=== ⚡ Executing Level Type Column Migration for user_levels ===');

  await withTransaction(async (client) => {
    // 1. Add level_type column if it doesn't exist
    await client.query(`
      ALTER TABLE user_levels 
      ADD COLUMN IF NOT EXISTS level_type VARCHAR(50) DEFAULT 'ACCOUNT_MANAGEMENT';
    `);
    console.log('[✓] Added level_type column to user_levels');

    // 2. Set default values for external account management levels vs internal system levels
    await client.query(`
      UPDATE user_levels 
      SET level_type = 'ACCOUNT_MANAGEMENT' 
      WHERE code IN ('FARM_OWNER', 'CUSTOMER_COW_OWNER', 'SIRE_SOURCING_COMPANY', 'COW_OWNER', 'SIRE_SOURCING_CO')
         OR id IN ('LEVEL-02', 'LEVEL-04', 'LEVEL-05');
    `);

    await client.query(`
      UPDATE user_levels 
      SET level_type = 'SYSTEM_ACCOUNT' 
      WHERE code IN ('BREEDER', 'ADMIN_OPERATION', 'FARM_MANAGER', 'SYSTEM_ADMIN')
         OR id IN ('LEVEL-01', 'LEVEL-03', 'LEVEL-446833')
         OR level_type IS NULL;
    `);
    console.log('[✓] Updated level_type categories for existing user levels');
  });

  console.log('✅ Level Type Column Migration Completed Successfully!');
}

if (require.main === module) {
  addLevelTypeToUserLevels()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Migration failed:', err);
      process.exit(1);
    });
}
