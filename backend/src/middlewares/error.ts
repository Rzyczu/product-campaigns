import type { Request, Response, NextFunction } from 'express';
import { InsufficientFundsError } from '../lib/funds.js';

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
    if (err instanceof InsufficientFundsError) {
        return res.status(409).json({
            error: 'Niewystarczające środki',
            code: 'INSUFFICIENT_FUNDS',
            missing_cents: err.missing_cents,
        });
    }

    const msg = String(err?.message ?? '');
    const m = msg.match(/INSUFFICIENT_FUNDS.*missing:(\d+)/i) || msg.match(/Needed\s+(\d+)\s+more\s+cents/i);
    if (m) {
        return res.status(409).json({
            error: 'Niewystarczające środki',
            code: 'INSUFFICIENT_FUNDS',
            missing_cents: Number(m[1]),
        });
    }

    const status = err.statusCode || err.status || 400;
    res.status(status).json({ error: msg || 'Wystąpił błąd' });
}
