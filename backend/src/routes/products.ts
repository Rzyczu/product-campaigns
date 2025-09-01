import { Router } from 'express';
import { pool } from '../config/db.js';
import { requireAuth } from '../middlewares/auth.js';
import type { ProductCreate, ProductUpdate } from '../types.js';

const router = Router();
router.use(requireAuth);

// GET /products  
router.get('/', async (req, res, next) => {
    try {
        const { rows } = await pool.query(
            `select id, name, created_at, updated_at
         from app.products
        where seller_id = $1
        order by created_at desc`,
            [req.userId]
        );
        res.json(rows);
    } catch (err) { next(err); }
});

// POST /products
router.post('/', async (req, res, next) => {
    try {
        const body = req.body as ProductCreate;
        if (!body?.name?.trim()) return res.status(400).json({ error: 'name required' });

        const { rows } = await pool.query(
            `insert into app.products (seller_id, name)
       values ($1, $2)
       returning id, name, created_at, updated_at`,
            [req.userId, body.name.trim()]
        );
        res.status(201).json(rows[0]);
    } catch (err) { next(err); }
});

// PUT /products/:id
router.put('/:id', async (req, res, next) => {
    try {
        const id = req.params.id;
        const body = req.body as ProductUpdate;
        if (!body?.name?.trim()) return res.status(400).json({ error: 'name required' });

        const { rowCount, rows } = await pool.query(
            `update app.products
          set name = $1, updated_at = now()
        where id = $2 and seller_id = $3
        returning id, name, created_at, updated_at`,
            [body.name.trim(), id, req.userId]
        );
        if (!rowCount) return res.status(404).json({ error: 'Not found' });
        res.json(rows[0]);
    } catch (err) { next(err); }
});

// DELETE /products/:id
router.delete('/:id', async (req, res, next) => {
    try {
        const id = req.params.id;
        const { rowCount } = await pool.query(
            `delete from app.products where id = $1 and seller_id = $2`,
            [id, req.userId]
        );
        if (!rowCount) return res.status(404).json({ error: 'Not found' });
        res.status(204).end();
    } catch (err) { next(err); }
});

export default router;
