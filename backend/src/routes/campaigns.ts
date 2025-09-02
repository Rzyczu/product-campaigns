import { Router } from 'express';
import { pool } from '../config/db.js';
import { requireAuth } from '../middlewares/auth.js';
import type { CampaignCreate, CampaignUpdate } from '../types.js';
import { ensureFundsOrThrow } from '../lib/funds.js';

const router = Router();
router.use(requireAuth);

// GET /campaigns
router.get('/', async (req, res, next) => {
    try {
        const { rows } = await pool.query(
            `select * from app.v_campaigns where seller_id = $1 order by created_at desc`,
            [req.userId]
        );
        res.json(rows);
    } catch (err) { next(err); }
});

// GET /campaigns/:id
router.get('/:id', async (req, res, next) => {
    try {
        const { rows } = await pool.query(
            `select * from app.v_campaigns where id = $1 and seller_id = $2`,
            [req.params.id, req.userId]
        );
        if (!rows[0]) return res.status(404).json({ error: 'Not found' });
        res.json(rows[0]);
    } catch (err) { next(err); }
});

// POST /campaigns
router.post('/', async (req, res, next) => {
    const client = await pool.connect();
    try {
        const body = req.body as CampaignCreate;
        if (!body?.product_id || !body?.name) {
            return res.status(400).json({ error: 'product_id and name are required' });
        }
        if (!Number.isInteger(body.bid_amount_cents) || body.bid_amount_cents < 0) {
            return res.status(400).json({ error: 'bid_amount_cents must be a non-negative integer' });
        }
        if (!Number.isInteger(body.fund_cents) || body.fund_cents < 0) {
            return res.status(400).json({ error: 'fund_cents must be a non-negative integer' });
        }
        if (!Number.isFinite(body.radius_km) || Number(body.radius_km) <= 0) {
            return res.status(400).json({ error: 'radius_km must be > 0' });
        }

        await client.query('begin');

        const prod = await client.query(
            `select 1 from app.products where id = $1 and seller_id = $2`,
            [body.product_id, req.userId]
        );
        if (!prod.rowCount) {
            await client.query('rollback');
            return res.status(404).json({ error: 'Product not found' });
        }

        await ensureFundsOrThrow(client, req.userId!, Number(body.fund_cents));

        const terms = Array.from(new Set((body.keywords || []).map(s => s.trim()).filter(Boolean)));
        if (terms.length) {
            const values = terms.map((_, i) => `($${i + 1})`).join(',');
            await client.query(
                `insert into app.keywords(term) values ${values} on conflict (term) do nothing`,
                terms
            );
        }
        const kw = terms.length
            ? await client.query<{ id: number }>(`select id from app.keywords where term = any($1::text[])`, [terms])
            : { rows: [] as { id: number }[] };

        const camp = await client.query<{ id: string }>(
            `insert into app.campaigns
       (seller_id, product_id, name, bid_amount_cents, fund_cents, status, town_id, radius_km)
       values ($1,$2,$3,$4,$5,$6,$7,$8)
       returning id`,
            [
                req.userId,
                body.product_id,
                body.name,
                body.bid_amount_cents,
                body.fund_cents,
                body.status,
                body.town_id,
                body.radius_km,
            ]
        );
        const campaignId = camp.rows[0].id;

        if (kw.rows.length) {
            const pairs = kw.rows.map((_, i) => `($1, $${i + 2})`).join(',');
            await client.query(
                `insert into app.campaign_keywords(campaign_id, keyword_id) values ${pairs} on conflict do nothing`,
                [campaignId, ...kw.rows.map(r => r.id)]
            );
        }

        await client.query('commit');

        const { rows } = await pool.query(
            `select * from app.v_campaigns where id = $1 and seller_id = $2`,
            [campaignId, req.userId]
        );
        res.status(201).json(rows[0]);
    } catch (err) {
        await client.query('rollback');
        next(err);
    } finally {
        client.release();
    }
});

// PUT /campaigns/:id
router.put('/:id', async (req, res, next) => {
    const client = await pool.connect();
    try {
        const id = req.params.id;
        const body = req.body as CampaignUpdate;

        await client.query('begin');

        const cur = await client.query<{ seller_id: string; fund_cents: number }>(
            `select seller_id, fund_cents from app.campaigns where id = $1 for update`,
            [id]
        );
        const row = cur.rows[0];
        if (!row) {
            await client.query('rollback');
            return res.status(404).json({ error: 'Not found' });
        }
        if (row.seller_id !== req.userId) {
            await client.query('rollback');
            return res.status(403).json({ error: 'Forbidden' });
        }

        if (typeof body.fund_cents === 'number') {
            if (!Number.isInteger(body.fund_cents) || body.fund_cents < 0) {
                await client.query('rollback');
                return res.status(400).json({ error: 'fund_cents must be a non-negative integer' });
            }
            const diff = Number(body.fund_cents) - Number(row.fund_cents);
            if (diff > 0) {
                await ensureFundsOrThrow(client, req.userId!, diff);
            }
        }
        if (typeof body.bid_amount_cents === 'number' && (!Number.isInteger(body.bid_amount_cents) || body.bid_amount_cents < 0)) {
            await client.query('rollback');
            return res.status(400).json({ error: 'bid_amount_cents must be a non-negative integer' });
        }
        if (typeof body.radius_km === 'number' && !(body.radius_km > 0)) {
            await client.query('rollback');
            return res.status(400).json({ error: 'radius_km must be > 0' });
        }

        const updates: string[] = [];
        const args: any[] = [];
        const set = (field: string, value: any) => { args.push(value); updates.push(`${field} = $${args.length}`); };

        if (body.name !== undefined) set('name', body.name);
        if (body.bid_amount_cents !== undefined) set('bid_amount_cents', body.bid_amount_cents);
        if (body.fund_cents !== undefined) set('fund_cents', body.fund_cents);
        if (body.status !== undefined) set('status', body.status);
        if (body.town_id !== undefined) set('town_id', body.town_id);
        if (body.radius_km !== undefined) set('radius_km', body.radius_km);

        if (updates.length) {
            args.push(id, req.userId);
            await client.query(
                `update app.campaigns set ${updates.join(', ')}, updated_at = now()
         where id = $${args.length - 1} and seller_id = $${args.length}`,
                args
            );
        }

        if (Array.isArray(body.keywords)) {
            const terms = Array.from(new Set(body.keywords.map(s => s.trim()).filter(Boolean)));
            if (terms.length) {
                const values = terms.map((_, i) => `($${i + 1})`).join(',');
                await client.query(
                    `insert into app.keywords(term) values ${values} on conflict (term) do nothing`,
                    terms
                );
            }
            await client.query(`delete from app.campaign_keywords where campaign_id = $1`, [id]);
            if (terms.length) {
                const kw = await client.query<{ id: number }>(
                    `select id from app.keywords where term = any($1::text[])`,
                    [terms]
                );
                const pairs = kw.rows.map((_, i) => `($1, $${i + 2})`).join(',');
                await client.query(
                    `insert into app.campaign_keywords(campaign_id, keyword_id) values ${pairs} on conflict do nothing`,
                    [id, ...kw.rows.map(r => r.id)]
                );
            }
        }

        await client.query('commit');

        const { rows } = await pool.query(
            `select * from app.v_campaigns where id = $1 and seller_id = $2`,
            [id, req.userId]
        );
        res.json(rows[0]);
    } catch (err) {
        await client.query('rollback');
        next(err);
    } finally {
        client.release();
    }
});

// DELETE /campaigns/:id
router.delete('/:id', async (req, res, next) => {
    try {
        const { rowCount } = await pool.query(
            `delete from app.campaigns where id = $1 and seller_id = $2`,
            [req.params.id, req.userId]
        );
        if (!rowCount) return res.status(404).json({ error: 'Not found' });
        res.status(204).end();
    } catch (err) { next(err); }
});

export default router;
