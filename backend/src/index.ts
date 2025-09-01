import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { env } from './config/env.js';
import { errorHandler } from './middlewares/error.js';
import { pingDb, pool } from './config/db.js';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';

const app = express();

app.use(express.json());

app.use(cookieParser(env.COOKIE_SECRET));

app.use('/auth', authRoutes);
app.use('/products', productRoutes);

app.use(
    cors({
        origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN,
        credentials: true,
    })
);

app.get('/health', (_req, res) => {
    res.json({ ok: true, env: env.NODE_ENV });
});

app.get('/db/ping', async (_req, res, next) => {
    try {
        const now = await pingDb();
        res.json({ ok: true, now });
    } catch (err) {
        next(err);
    }
});

app.get('/db/check', async (_req, res, next) => {
    try {
        const q = async (sql: string) => (await pool.query(sql)).rows?.[0]?.count ?? '0';
        const users = await q(`select count(*)::int as count from app.users`);
        const products = await q(`select count(*)::int as count from app.products`);
        const campaigns = await q(`select count(*)::int as count from app.campaigns`);
        res.json({ ok: true, tables: { users, products, campaigns } });
    } catch (err) {
        next(err);
    }
});

app.use(errorHandler);

app.listen(env.PORT, () => {
    console.log(`API listening on http://localhost:${env.PORT}`);
});
