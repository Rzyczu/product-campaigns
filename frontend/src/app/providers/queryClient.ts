import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: (failureCount, error: any) => {
                const status = error?.status ?? error?.response?.status;
                if (status && [400, 401, 403, 404].includes(status)) return false;
                return failureCount < 2;
            },
            staleTime: 30_000,
        },
        mutations: { networkMode: 'always' },
    },
});
