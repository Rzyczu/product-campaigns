// frontend/src/app/providers/apiClient.ts
const BASE_URL: string | undefined = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/+$/, '');

function joinUrl(base: string, path: string) {
    if (!path) return base;
    if (/^https?:\/\//i.test(path)) return path;
    const p = path.startsWith('/') ? path : `/${path}`;
    return `${base}${p}`;
}

export class ApiError extends Error {
    status: number;
    code?: string;
    missing_cents?: number;
    payload?: any;
    constructor(status: number, message: string, opts?: { code?: string; missing_cents?: number; payload?: any }) {
        super(message);
        this.status = status;
        this.code = opts?.code;
        this.missing_cents = opts?.missing_cents;
        this.payload = opts?.payload;
    }
}

export async function apiFetch<T>(
    path: string,
    init?: RequestInit & { parse?: 'json' | 'text' }
): Promise<T> {
    if (!BASE_URL) {
        throw new ApiError(0, 'VITE_API_URL is not set. Add it to frontend/.env and restart the dev server.');
    }

    const url = joinUrl(BASE_URL, path);
    const res = await fetch(url, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        ...init,
    });

    const ct = res.headers.get('content-type') || '';
    let body: any = null;
    if (ct.includes('application/json')) {
        body = await res.json().catch(() => null);
    } else if (init?.parse === 'text') {
        body = await res.text().catch(() => '');
    } else {
        body = await res.json().catch(() => null);
    }

    if (!res.ok) {
        const msg = body?.error ?? res.statusText ?? 'Request failed';
        const err = new ApiError(res.status, msg, {
            code: body?.code,
            missing_cents: body?.missing_cents,
            payload: body,
        });
        if (res.status === 401) {
            localStorage.removeItem('auth_user');
            if (location.pathname !== '/login') location.href = '/login';
        }
        throw err;
    }

    return body as T;
}
