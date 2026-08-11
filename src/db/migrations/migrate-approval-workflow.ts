import { query } from '../../config/database';

export async function migrateApprovalWorkflow() {
  console.log('--- Migrating Certificate & Herdbook Approval Workflow Schema ---');

  // 1. Upgrade `certificates` table
  await query(`
    ALTER TABLE certificates
    ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'APPROVED',
    ADD COLUMN IF NOT EXISTS animal_type VARCHAR(50),
    ADD COLUMN IF NOT EXISTS animal_id VARCHAR(100),
    ADD COLUMN IF NOT EXISTS owner_name VARCHAR(255),
    ADD COLUMN IF NOT EXISTS farm_location VARCHAR(255),
    ADD COLUMN IF NOT EXISTS breeder_id VARCHAR(50),
    ADD COLUMN IF NOT EXISTS applied_by VARCHAR(100),
    ADD COLUMN IF NOT EXISTS applied_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN IF NOT EXISTS reviewed_by VARCHAR(100),
    ADD COLUMN IF NOT EXISTS reviewed_date TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
  `);

  // Ensure existing certificates have status = 'APPROVED'
  await query(`
    UPDATE certificates
    SET status = 'APPROVED'
    WHERE status IS NULL;
  `);

  // 2. Upgrade `herdbook_registrations` table
  await query(`
    ALTER TABLE herdbook_registrations
    ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
    ADD COLUMN IF NOT EXISTS applied_by VARCHAR(100);
  `);

  // Ensure existing herdbook records have status = 'APPROVED'
  await query(`
    UPDATE herdbook_registrations
    SET status = 'APPROVED'
    WHERE status IS NULL OR status = 'Active';
  `);

  console.log('✅ Certificate & Herdbook Approval Workflow Schema migration completed.');
}

if (require.main === module) {
  migrateApprovalWorkflow()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Migration error:', err);
      process.exit(1);
    });
}
