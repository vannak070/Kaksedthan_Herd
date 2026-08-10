import { Client } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function createDatabaseIfNotExists() {
  const host = process.env.DB_HOST || 'localhost';
  const port = parseInt(process.env.DB_PORT || '5433', 10);
  const user = process.env.DB_USER || 'postgres';
  const password = process.env.DB_PASSWORD || 'postgres123';
  const targetDb = process.env.DB_NAME || 'kaksedthan_herdbook';

  console.log(`[Init DB] Connecting to PostgreSQL default instance at ${user}@${host}:${port}/postgres...`);
  const client = new Client({
    host,
    port,
    user,
    password,
    database: 'postgres'
  });

  try {
    await client.connect();
    const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [targetDb]);
    if (res.rows.length === 0) {
      console.log(`[Init DB] Database "${targetDb}" does not exist. Creating database "${targetDb}" now...`);
      await client.query(`CREATE DATABASE ${targetDb}`);
      console.log(`[Init DB] Database "${targetDb}" created successfully!`);
    } else {
      console.log(`[Init DB] Database "${targetDb}" already exists.`);
    }
  } catch (err: any) {
    console.error('[Init DB Error]', err.message);
  } finally {
    await client.end();
  }
}

createDatabaseIfNotExists();
