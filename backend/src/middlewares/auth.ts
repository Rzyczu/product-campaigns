import type { Request, Response, NextFunction } from 'express';

declare module 'express-serve-static-core' {
    interface Request {
        userId?: string;
    }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
    const uid = req.signedCookies?.sid as string | undefined;
    if (!uid) return res.status(401).json({ error: 'Unauthorized' });
    req.userId = uid;
    next();
}
