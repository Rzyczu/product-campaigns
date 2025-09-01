import { Router } from 'express';
import { pool } from '../config/db.js';
import { requireAuth } from '../middlewares/auth.js';

const router = Router();
router.use(requireAuth);

// GET /keywords?q=run
router.get('/', async (req, res, next) => {
    try {
        const q = (req.query.q as string | undefined)?.trim();
        const like = q ? `${q}%` : '%';
        const { rows } = await pool.query(
            `select id, term 
         from app.keywords
        where term ilike $1
        order by term
        limit 20`,
            [like]
        );
        res.json(rows);
    } catch (err) { next(err); }
});

export default router;
