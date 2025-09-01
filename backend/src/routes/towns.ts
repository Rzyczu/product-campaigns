import { Router } from 'express';
import { pool } from '../config/db.js';
import { requireAuth } from '../middlewares/auth.js';

const router = Router();
router.use(requireAuth);

// GET /towns?country=PL&q=kra
router.get('/', async (req, res, next) => {
    try {
        const q = (req.query.q as string | undefined)?.trim();
        const country = (req.query.country as string | undefined)?.trim();
        const like = q ? `%${q}%` : '%';

        const params: any[] = [];
        let sql = `select id, name, country_code from app.towns where 1=1`;

        if (country) { params.push(country.toUpperCase()); sql += ` and country_code = $${params.length}`; }
        params.push(like); sql += ` and name ilike $${params.length}`;

        sql += ` order by name limit 50`;

        const { rows } = await pool.query(sql, params);
        res.json(rows);
    } catch (err) { next(err); }
});

export default router;
