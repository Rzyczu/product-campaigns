export function formatMoney(cents: number) {
    return (cents / 100).toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' });
}

export function parseMoneyToCents(input: string): number {
    const s = input.replace(/\s/g, '').replace(',', '.').replace(/[^0-9.]/g, '');
    const n = Number(s);
    if (!Number.isFinite(n)) throw new Error('Invalid amount');
    return Math.round(n * 100);
}

export function toNumber1Dec(s: string | number): number {
    const n = typeof s === 'string' ? Number(s.replace(',', '.')) : s;
    if (!Number.isFinite(n)) throw new Error('Invalid number');
    return Math.round(n * 10) / 10;
}
