import type { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
    const status = err?.statusCode || 400;
    res.status(status).json({
        error: err?.message || 'Unexpected error',
    });
}
