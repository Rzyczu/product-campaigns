import { create } from 'zustand';

export type User = { id: string; email: string; name: string | null; balance_cents: number };

type AuthState = {
    user?: User;
    setUser: (u?: User) => void;
    clear: () => void;
};

export const useAuth = create<AuthState>((set) => ({
    user: (() => {
        const raw = localStorage.getItem('auth_user');
        return raw ? (JSON.parse(raw) as User) : undefined;
    })(),
    setUser: (u) => {
        if (u) localStorage.setItem('auth_user', JSON.stringify(u));
        else localStorage.removeItem('auth_user');
        set({ user: u });
    },
    clear: () => {
        localStorage.removeItem('auth_user');
        set({ user: undefined });
    },
}));
