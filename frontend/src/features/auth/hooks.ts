import { useQuery } from '@tanstack/react-query';
import { me } from './api';
import { useAuth } from './store';
import React from 'react';

export function useMe() {
    const setUser = useAuth(s => s.setUser);

    const q = useQuery({
        queryKey: ['me'],
        queryFn: me,
        retry: 1,
        staleTime: 5_000,
    });

    React.useEffect(() => {
        if (q.data) setUser(q.data);
    }, [q.data, setUser]);

    return q;

}
