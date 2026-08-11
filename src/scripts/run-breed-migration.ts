import { pool } from '../config/database';
import { runBreedMasterMigration } from '../db/migrations/migrate-breed-master-alignment';

async function main() {
  try {
    console.log('Running Breed Master Migration...');
    await runBreedMasterMigration(pool);
    console.log('Finished Breed Master Migration successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

main();
