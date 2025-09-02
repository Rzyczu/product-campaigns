import { create } from 'zustand';
import { useEffect } from 'react';

type Toast = { id: number; type: 'success' | 'error'; message: string };
type ToastState = {
    list: Toast[];
    push: (t: Omit<Toast, 'id'>) => void;
    remove: (id: number) => void;
};
export const useToastStore = create<ToastState>((set) => ({
    list: [],
    push: (t) => set((s) => ({ list: [...s.list, { ...t, id: Date.now() + Math.random() }] })),
    remove: (id) => set((s) => ({ list: s.list.filter((x) => x.id !== id) })),
}));

export function useToast() {
    const push = useToastStore((s) => s.push);
    return {
        success: (message: string) => push({ type: 'success', message }),
        error: (message: string) => push({ type: 'error', message }),
    };
}

export default function ToastProvider() {
    const list = useToastStore((s) => s.list);
    const remove = useToastStore((s) => s.remove);

    useEffect(() => {
        const timers = list.map(t => setTimeout(() => remove(t.id), 2500));
        return () => { timers.forEach(clearTimeout); };
    }, [list, remove]);

    return (
        <div style={{
            position: 'fixed', right: 12, bottom: 12, display: 'grid', gap: 8, zIndex: 9999
        }}>
            {list.map(t => (
                <div key={t.id}
                    className="card"
                    style={{
                        borderLeft: `4px solid ${t.type === 'success' ? '#43d17f' : '#ff6473'}`,
                        minWidth: 260
                    }}
                >
                    {t.message}
                </div>
            ))}
        </div>
    );
}
