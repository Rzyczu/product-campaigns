import { useQuery } from '@tanstack/react-query';
import { searchTowns } from './api';

export function useTownsDropdown(q: string, country = 'PL') {
    return useQuery({
        queryKey: ['towns', country, q],
        queryFn: () => searchTowns(q, country),
        enabled: q.trim().length >= 0,
        staleTime: 10 * 60 * 1000,
    });
}
