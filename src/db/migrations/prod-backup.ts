import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { pool, connectWithRetry } from '../../config/database';

async function backupProdDatabase() {
  await connectWithRetry(5, 2000);
  const client = await pool.connect();
  const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
  const backupDir = path.resolve(process.cwd(), 'backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const backupPath = path.join(backupDir, `prod_backup_${timestamp}.json.gz`);

  try {
    const tablesRes = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE' 
      ORDER BY table_name;
    `);

    const snapshot: Record<string, any> = {
      exported_at: new Date().toISOString(),
      database: process.env.DB_NAME || 'livestock_db',
      tables: {}
    };

    for (const r of tablesRes.rows) {
      const tbl = r.table_name;
      const rowsRes = await client.query(`SELECT * FROM "${tbl}"`);
      snapshot.tables[tbl] = rowsRes.rows;
    }

    const jsonString = JSON.stringify(snapshot, null, 2);
    const compressed = zlib.gzipSync(Buffer.from(jsonString, 'utf-8'));
    fs.writeFileSync(backupPath, compressed);

    const stats = fs.statSync(backupPath);
    const sizeKB = (stats.size / 1024).toFixed(1);
    console.log(`✅ Production database backup successfully created! Size: ${sizeKB}KB`);
    console.log(`   • Output File: ${backupPath}`);
  } finally {
    client.release();
  }
}

if (require.main === module) {
  backupProdDatabase().then(() => process.exit(0)).catch((err) => {
    console.error('❌ Production backup failed:', err);
    process.exit(1);
  });
}
