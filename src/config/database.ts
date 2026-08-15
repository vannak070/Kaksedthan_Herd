import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const host = process.env.DB_HOST || '127.0.0.1';
const port = parseInt(process.env.DB_PORT || '5432', 10);
const user = process.env.DB_USER || 'postgres';
const password = process.env.DB_PASSWORD || 'postgres123';
const database = process.env.DB_NAME || 'livestock_db';
const ssl = process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false;

const max = parseInt(process.env.DB_POOL_MAX || '30', 10);
const idleTimeoutMillis = parseInt(process.env.DB_IDLE_TIMEOUT_MS || '10000', 10);
const connectionTimeoutMillis = parseInt(process.env.DB_CONN_TIMEOUT_MS || '3000', 10);

console.log(`[Database] Configuring connection pool (max ${max}) for PostgreSQL at ${user}@${host}:${port}/${database}...`);

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
  console.error('[Database Pool Error] Unexpected error on idle database client:', err.message);
});

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
        console.error(`[Database Connection] Failed to connect to database after ${maxRetries} attempts.`);
        throw err;
      }
      console.log(`[Database Connection] Retrying in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay = Math.min(delay * 2, 10000);
    }
  }
  return false;
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<QueryResult<T>> {
  const start = Date.now();
  try {
    const res = await pool.query<T>(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV !== 'production' && duration > 200) {
      console.log(`[Database Slow Query] Executed query in ${duration}ms: ${text.slice(0, 100)}`);
    }
    return res;
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    if (errorMsg.includes('EPERM') || errorMsg.includes('connect') || errorMsg.includes('AggregateError')) {
      try {
        console.warn(`[Database Connection Retry] Retrying query after socket notice: ${errorMsg}`);
        const client = await pool.connect();
        try {
          const retryRes = await client.query<T>(text, params);
          return retryRes;
        } finally {
          client.release();
        }
      } catch (retryErr: unknown) {
        const retryMsg = retryErr instanceof Error ? retryErr.message : String(retryErr);
        console.error(`[Database Query Retry Error] Query failed after retry: ${retryMsg} | SQL: ${text}`);
        throw retryErr;
      }
    }
    console.error(`[Database Query Error] Query failed: ${errorMsg} | SQL: ${text}`);
    throw error;
  }
}

export async function withTransaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    await client.query('ROLLBACK');
    console.error('[Database Transaction Error] Transaction rolled back due to error:', errorMsg);
    throw error;
  } finally {
    client.release();
  }
}
