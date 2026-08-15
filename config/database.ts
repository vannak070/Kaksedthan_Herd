import { Pool, PoolClient } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Load environment configuration (.env.development vs .env.production vs .env)
const envFile = process.env.NODE_ENV === 'production' 
  ? '.env.production' 
  : (process.env.NODE_ENV === 'development' ? '.env.development' : '.env');

dotenv.config({ path: path.resolve(process.cwd(), envFile) });

// Fallback to default .env if specific env file not loaded
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const isProd = process.env.NODE_ENV === 'production' || process.env.DB_NAME === 'livestock_db';
const host = process.env.DB_HOST || '127.0.0.1';
const port = parseInt(process.env.DB_PORT || (isProd ? '5432' : '5433'), 10);
const user = process.env.DB_USER || 'postgres';
const password = process.env.DB_PASSWORD || 'postgres123';
const database = process.env.DB_NAME || (isProd ? 'livestock_db' : 'kaksedthan_herdbook');
const ssl = process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false;

const max = parseInt(process.env.DB_POOL_MAX || '20', 10);
const idleTimeoutMillis = parseInt(process.env.DB_IDLE_TIMEOUT_MS || '30000', 10);
const connectionTimeoutMillis = parseInt(process.env.DB_CONN_TIMEOUT_MS || '5000', 10);

console.log(`[Database Config] Environment: ${process.env.NODE_ENV || 'development'} | Pool connecting to ${user}@${host}:${port}/${database}`);

export const pool = new Pool({
  host,
  port,
  user,
  password,
  database,
  ssl,
  max,
  idleTimeoutMillis,
  connectionTimeoutMillis,
  family: 4,
} as any);

pool.on('error', (err: Error) => {
  console.error('[Database Pool Error] Unexpected error on idle client:', err.message);
});

export async function query(text: string, params?: any[]) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  if (process.env.DEBUG_SQL === 'true') {
    console.log('[Database Query]', { text, duration, rows: res.rowCount });
  }
  return res;
}

export async function getClient(): Promise<PoolClient> {
  return await pool.connect();
}

export async function withTransaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('[Database Transaction Error] Transaction rolled back due to error:', e);
    throw e;
  } finally {
    client.release();
  }
}

export async function connectWithRetry(maxRetries = 10, initialDelayMs = 1000): Promise<boolean> {
  let delay = initialDelayMs;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[Database Connection] Attempt ${attempt}/${maxRetries} to connect to ${host}:${port}/${database}...`);
      const client = await pool.connect();
      const res = await client.query('SELECT NOW() as now, current_database() as db_name');
      client.release();
      console.log(`[Database Connection] Connected successfully to "${res.rows[0].db_name}" at ${res.rows[0].now}`);
      return true;
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.warn(`[Database Connection] Connection attempt ${attempt} failed: ${errorMsg}`);

      if (attempt === maxRetries) {
        console.error(`[Database Connection] All ${maxRetries} connection attempts failed. Retrying pool initialization...`);
        return false;
      }

      console.log(`[Database Connection] Waiting ${delay}ms before retry ${attempt + 1}...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay = Math.min(delay * 1.5, 10000);
    }
  }

  return false;
}
