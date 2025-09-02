import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { login } from '@/features/auth/api';
import { useAuth } from '@/features/auth/store';
import { useNavigate } from 'react-router-dom';

type Form = { email: string; password: string };

export default function LoginPage() {
    const { register, handleSubmit } = useForm<Form>({ defaultValues: { email: '', password: '' } });
    const [error, setError] = useState<string | null>(null);
    const setUser = useAuth((s) => s.setUser);
    const navigate = useNavigate();

    const onSubmit = async (data: Form) => {
        setError(null);
        try {
            const user = await login(data.email, data.password);
            setUser(user);
            navigate('/campaigns', { replace: true });
        } catch (e: any) {
            setError(e?.message ?? 'Login failed');
        }
    };

    return (
        <section className="card card--centered">
            <h1>Login</h1>
            <form onSubmit={handleSubmit(onSubmit)} className="form">
                <label className="form__row">
                    <span>Email</span>
                    <input type="email" {...register('email', { required: true })} />
                </label>
                <label className="form__row">
                    <span>Password</span>
                    <input type="password" {...register('password', { required: true })} />
                </label>
                {error && <div className="alert">{error}</div>}
                <button className="btn btn--primary" type="submit">Sign in</button>
            </form>
            <p className="muted mt-2">Test user: <code>test@emerald.dev</code> / <code>Test1234!</code></p>
        </section>
    );
}
