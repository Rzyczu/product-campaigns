import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { pool } from '../config/db.js';

const router = Router();
router.use(requireAuth);

router.post('/deposit', async (req, res, next) => {
    try {
        const amount = Number((req.body?.amount_cents ?? 0));
        if (!Number.isInteger(amount) || amount <= 0) {
            return res.status(400).json({ error: 'amount_cents must be a positive integer' });
        }

        await pool.query(
            `select app.wallet_apply_delta($1::uuid, $2::int, 'deposit'::app.tx_type, null, 'Manual deposit')`,
            [req.userId, amount]
        );

        const { rows } = await pool.query(
            `select id, email, name, balance_cents from app.users where id = $1`,
            [req.userId]
        );
        res.json(rows[0]);
    } catch (err) { next(err); }
});

export default router;
