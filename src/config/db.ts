import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import env from './env';
import logger from './logger';
import * as schema from '../db/schema';

const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  logger.error({ err }, 'Unexpected PostgreSQL pool error');
});

pool.on('connect', () => {
  logger.info('PostgreSQL pool connected');
});

export const db = drizzle(pool, { schema });

export default db;
export { pool };
