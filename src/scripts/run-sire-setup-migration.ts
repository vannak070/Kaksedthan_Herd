import { pool } from '../config/database';
import { runSireSetupMigration } from '../db/migrations/migrate-sire-setup-architecture';

async function main() {
  try {
    console.log('Running Sire Setup Migration...');
    await runSireSetupMigration(pool);
    console.log('Finished Sire Setup Migration successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

main();
