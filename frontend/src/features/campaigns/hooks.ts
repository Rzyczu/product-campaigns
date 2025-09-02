import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createCampaign, deleteCampaign, getCampaign, listCampaigns, updateCampaign } from './api';
import type { Campaign, CampaignCreateDTO, CampaignUpdateDTO } from './types';

const key = ['campaigns'];

export function useCampaigns() {
    return useQuery({ queryKey: key, queryFn: listCampaigns });
}
export function useCampaign(id: string) {
    return useQuery({ queryKey: [...key, id], queryFn: () => getCampaign(id), enabled: !!id });
}
export function useCreateCampaign() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (dto: CampaignCreateDTO) => createCampaign(dto),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: key });
            qc.invalidateQueries({ queryKey: ['me'] });
        },
    });
}
export function useUpdateCampaign(id: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (dto: CampaignUpdateDTO) => updateCampaign(id, dto),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: key });
            qc.invalidateQueries({ queryKey: [...key, id] });
            qc.invalidateQueries({ queryKey: ['me'] });
        },
    });
}
export function useDeleteCampaign() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteCampaign(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: key });
            qc.invalidateQueries({ queryKey: ['me'] });
        },
    });
}
