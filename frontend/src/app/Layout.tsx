import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/store';
import { logout } from '@/features/auth/api';

export default function Layout() {
    const user = useAuth((s) => s.user);
    const clear = useAuth((s) => s.clear);
    const navigate = useNavigate();

    async function onLogout() {
        try { await logout(); } finally { clear(); navigate('/login', { replace: true }); }
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
                                <span className="userbox__name">{user.name ?? user.email}</span>
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
