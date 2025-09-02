import { apiFetch } from '@/app/providers/apiClient';
import type { Campaign, CampaignCreateDTO, CampaignUpdateDTO } from './types';

export function listCampaigns(): Promise<Campaign[]> {
    return apiFetch<Campaign[]>('/campaigns');
}
export function getCampaign(id: string): Promise<Campaign> {
    return apiFetch<Campaign>(`/campaigns/${id}`);
}
export function createCampaign(data: CampaignCreateDTO): Promise<Campaign> {
    return apiFetch<Campaign>('/campaigns', { method: 'POST', body: JSON.stringify(data) });
}
export function updateCampaign(id: string, data: CampaignUpdateDTO): Promise<Campaign> {
    return apiFetch<Campaign>(`/campaigns/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}
export function deleteCampaign(id: string): Promise<void> {
    return apiFetch(`/campaigns/${id}`, { method: 'DELETE', parse: 'text' });
}
