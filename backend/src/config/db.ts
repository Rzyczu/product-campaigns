import { Pool } from 'pg';
import { env } from './env.js';

export const pool = new Pool({
    connectionString: env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

export async function pingDb() {
    const { rows } = await pool.query('select now() as now');
    return rows[0].now as string;
}
