import { apiFetch } from '@/app/providers/apiClient';
import type { User } from './store';

export async function me(): Promise<User> {
    return apiFetch<User>('/auth/me');
}

export async function login(email: string, password: string): Promise<User> {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Accept', 'application/json');
    headers.append('Origin', 'http://localhost:3000');
    const data = await apiFetch<User>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });
    return data;
}

export async function logout(): Promise<void> {
    await apiFetch('/auth/logout', { method: 'POST', parse: 'text' });
}
