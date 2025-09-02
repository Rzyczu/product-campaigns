export function parseInsufficientFunds(message: string | undefined | null): number | null {
    if (!message) return null;
    const m = message.match(/(?:Needed|missing)[: ]\s*(\d+)\s*(?:more\s*)?cents?/i);
    if (m && m[1]) return Number(m[1]);
    return null;
}
