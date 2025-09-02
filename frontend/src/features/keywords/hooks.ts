import { useQuery } from '@tanstack/react-query';
import { searchKeywords } from './api';

export function useKeywordTypeahead(q: string) {
    return useQuery({
        queryKey: ['keywords', q],
        queryFn: () => searchKeywords(q),
        enabled: q.trim().length > 0,
        staleTime: 5 * 60 * 1000,
    });
}
