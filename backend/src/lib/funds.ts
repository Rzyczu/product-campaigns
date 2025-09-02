import type { PoolClient } from 'pg';

export class InsufficientFundsError extends Error {
    missing_cents: number;
    constructor(missing_cents: number, message = 'Niewystarczające środki') {
        super(message);
        this.name = 'InsufficientFundsError';
        this.missing_cents = missing_cents;
    }
}

export async function ensureFundsOrThrow(client: PoolClient, sellerId: string, requiredCents: number) {
    if (requiredCents <= 0) return;
    const { rows } = await client.query<{ balance_cents: number }>(
        `select balance_cents from app.users where id = $1 for update`,
        [sellerId]
    );
    const balance = rows[0]?.balance_cents;
    if (balance == null) throw new Error('Seller not found');
    const after = balance - requiredCents;
    if (after < 0) throw new InsufficientFundsError(Math.abs(after));
}
