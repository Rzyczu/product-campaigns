import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/features/auth/store';
import { logout, deposit } from '@/features/auth/api';
import { useMe } from '@/features/auth/hooks';
import { formatMoney } from '@/lib/format';
import MoneyInput from '@/components/MoneyInput/MoneyInput';
import { useToast } from '@/components/Toast/ToastProvider';
import { Menu, X } from 'lucide-react';

export default function Layout() {
    useMe();
    const user = useAuth((s) => s.user);
    const clear = useAuth((s) => s.clear);
    const setUser = useAuth((s) => s.setUser);
    const navigate = useNavigate();
    const location = useLocation();
    const toast = useToast();

    const [showDeposit, setShowDeposit] = useState(false);
    const [amount, setAmount] = useState('100,00');

    const [menuOpen, setMenuOpen] = useState(false);
    const panelRef = useRef<HTMLDivElement | null>(null);

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

    useEffect(() => { setMenuOpen(false); }, [location.pathname]);

    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (e.key === 'Escape') setMenuOpen(false);
        }
        if (menuOpen) document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [menuOpen]);

    useEffect(() => {
        function onClick(e: MouseEvent) {
            if (!menuOpen) return;
            const target = e.target as Node;
            if (panelRef.current && !panelRef.current.contains(target)) {
                setMenuOpen(false);
            }
        }
        if (menuOpen) document.addEventListener('mousedown', onClick);
        return () => document.removeEventListener('mousedown', onClick);
    }, [menuOpen]);

    return (
        <>
            <header className="topbar">
                <div className="container topbar__inner">
                    <Link to="/" className="brand">
                        <img src="/favicon.png" alt="" className="brand__logo" />
                        <span>Product Campaigns</span>
                    </Link>

                    <nav className="nav">
                        <NavLink to="/campaigns">Campaigns</NavLink>
                        <NavLink to="/products">Products</NavLink>
                    </nav>

                    <button
                        className="menu-toggle"
                        aria-label="Open menu"
                        aria-controls="mobile-nav"
                        aria-expanded={menuOpen}
                        onClick={() => setMenuOpen(o => !o)}
                    >
                        {menuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>

                    <div className="userbox">
                        {user ? (
                            <>
                                <span
                                    className="userbox__name"
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => setShowDeposit(v => !v)}
                                    title="Kliknij, aby wpłacić środki"
                                >
                                    {user.name ?? user.email} · {formatMoney(user.balance_cents)}
                                </span>
                                {showDeposit && (
                                    <div className="card deposit-popover">
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

                {menuOpen && <div className="mobile-backdrop" />}
                <div
                    id="mobile-nav"
                    ref={panelRef}
                    className={`mobile-nav${menuOpen ? ' is-open' : ''}`}
                    role="dialog"
                    aria-modal="true"
                >
                    <div className="container mobile-nav__inner">
                        <NavLink to="/campaigns" onClick={() => setMenuOpen(false)}>Campaigns</NavLink>
                        <NavLink to="/products" onClick={() => setMenuOpen(false)}>Products</NavLink>
                    </div>
                </div>
            </header>

            <main className="container page">
                <Outlet />
            </main>
        </>
    );
}
