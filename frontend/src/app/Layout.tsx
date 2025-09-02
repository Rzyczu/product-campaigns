import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/store';
import { logout, deposit } from '@/features/auth/api';
import { useMe } from '@/features/auth/hooks';
import { formatMoney } from '@/lib/format';
import MoneyInput from '@/components/MoneyInput/MoneyInput';
import { useToast } from '@/components/Toast/ToastProvider';
import { useState } from 'react';

export default function Layout() {
    useMe();
    const user = useAuth((s) => s.user);
    const clear = useAuth((s) => s.clear);
    const navigate = useNavigate();
    const setUser = useAuth((s) => s.setUser);
    const toast = useToast();
    const [showDeposit, setShowDeposit] = useState(false);
    const [amount, setAmount] = useState('100,00');


    async function onLogout() {
        try { await logout(); } finally { clear(); navigate('/login', { replace: true }); }
    }

    async function onDeposit() {
        try {
            const cents = Math.round(Number(amount.replace(',', '.')) * 100);
            if (!Number.isFinite(cents) || cents <= 0) {
                toast.error('Podaj prawidłową kwotę');
                return;
            }
            const u = await deposit(cents);
            setUser(u);
            setShowDeposit(false);
            toast.success('Wpłata zaksięgowana');
        } catch (e: any) {
            toast.error(e?.message ?? 'Nie udało się wpłacić środków');
        }
    }

    return (
        <>
            <header className="topbar">
                <div className="container topbar__inner">
                    <Link to="/" className="brand">Emerald</Link>
                    <nav className="nav">
                        <NavLink to="/campaigns">Campaigns</NavLink>
                        <NavLink to="/products">Products</NavLink>
                    </nav>
                    <div className="userbox">
                        {user ? (
                            <>
                                <span className="userbox__name" style={{ cursor: 'pointer' }} onClick={() => setShowDeposit(v => !v)}>
                                    {user.name ?? user.email} · {formatMoney(user.balance_cents)}
                                </span>
                                {showDeposit && (
                                    <div className="card" style={{ position: 'absolute', right: 12, top: 56, display: 'grid', gap: 8 }}>
                                        <div style={{ fontWeight: 600 }}>Wpłać środki</div>
                                        <MoneyInput value={amount} onValueChange={setAmount} placeholder="0,00" />
                                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                                            <button className="btn btn--ghost" onClick={() => setShowDeposit(false)}>Anuluj</button>
                                            <button className="btn btn--primary" onClick={onDeposit}>Wpłać</button>
                                        </div>
                                    </div>
                                )}
                                <button className="btn btn--ghost" onClick={onLogout}>Logout</button>
                            </>
                        ) : (
                            <NavLink to="/login" className="btn btn--primary">Login</NavLink>
                        )}
                    </div>
                </div>
            </header>
            <main className="container page">
                <Outlet />
            </main>
        </>
    );
}
