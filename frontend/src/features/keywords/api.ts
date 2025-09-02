import { apiFetch } from '@/app/providers/apiClient';

export type Keyword = { id: number; term: string };

export async function searchKeywords(q: string): Promise<Keyword[]> {
    const qs = new URLSearchParams({ q }).toString();
    return apiFetch<Keyword[]>(`/keywords?${qs}`);
}
