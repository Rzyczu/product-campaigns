import { useEffect, useState } from 'react';

export function debounce<T extends (...args: any[]) => void>(fn: T, ms = 300) {
    let t: ReturnType<typeof setTimeout> | undefined;
    return (...args: Parameters<T>) => {
        if (t) clearTimeout(t);
        t = setTimeout(() => fn(...args), ms);
    };
}

export type Option<T = string | number> = { label: string; value: T };

export function useDebouncedValue<T>(value: T, delay = 300) {
    const [v, setV] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setV(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return v;
}
