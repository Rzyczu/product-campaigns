const BASE_URL = import.meta.env.VITE_API_URL as string;

function buildUrl(path: string) {
    return path.startsWith('http') ? path : `${BASE_URL}${path}`;
}

export class ApiError extends Error {
    status: number;
    constructor(status: number, message: string) {
        super(message); this.status = status;
    }
}

export async function apiFetch<T>(url: string, init: RequestInit & { parse?: 'json' | 'text' } = {}) {
    const res = await fetch(`${import.meta.env.VITE_API_URL}${url}`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...(init.headers || {}) },
        ...init,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return init.parse === 'text' ? (res.text() as any as T) : res.json();
}

