import { apiFetch } from '@/app/providers/apiClient';

export type Town = { id: number; name: string; country_code: string };

export async function searchTowns(q: string, country = 'PL'): Promise<Town[]> {
    const qs = new URLSearchParams({ q, country }).toString();
    return apiFetch<Town[]>(`/towns?${qs}`);
}
