import { Router } from 'express';
import { pool } from '../config/db.js';

const router = Router();

router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = (req.body ?? {}) as { email?: string; password?: string };

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const { rows } = await pool.query(
            `select id, email, name, balance_cents
         from app.users
        where email = $1 and password_hash = crypt($2, password_hash)`,
            [email, password]
        );

        const user = rows[0];
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });

        res.cookie('sid', user.id, {
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            signed: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.json({
            id: user.id,
            email: user.email,
            name: user.name,
            balance_cents: user.balance_cents,
        });
    } catch (err) {
        next(err);
    }
});

router.post('/logout', (req, res) => {
    res.clearCookie('sid', {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        signed: true,
    });
    res.status(204).end();
});


export default router;
