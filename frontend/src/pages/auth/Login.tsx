import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Dumbbell, Loader2, ArrowLeft } from 'lucide-react';

export function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            login(data.token, data.user);

            // Check for redirect location
            const from = (location.state as any)?.from?.pathname || '/dashboard';
            navigate(from, { replace: true });
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen bg-[#030721] text-foreground">
            <button
                onClick={() => navigate('/')}
                className="absolute top-6 left-6 z-50 p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            >
                <ArrowLeft className="w-6 h-6" />
            </button>

            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -left-24 top-8 h-72 w-72 rounded-full bg-primary/30 blur-3xl" />
                <div className="absolute right-[-4rem] bottom-[-6rem] h-[22rem] w-[22rem] rounded-full bg-primary/20 blur-3xl" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(148,163,184,0.18),transparent_45%),radial-gradient(circle_at_80%_80%,rgba(30,64,175,0.22),transparent_55%)]" />
            </div>

            <div className="relative flex min-h-screen items-center justify-center px-6 py-20">
                <div className="w-full max-w-5xl overflow-hidden rounded-[2.25rem] border border-white/10 bg-white/5 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.9)] backdrop-blur-xl">
                    <div className="grid md:grid-cols-[1.1fr,0.9fr]">
                        <div className="flex flex-col justify-between bg-gradient-to-br from-[#0a102b] via-[#070d27] to-[#050a20] p-10 text-white sm:p-14">
                            <div className="space-y-8">
                                <span className="inline-flex items-center rounded-full border border-white/20 px-5 py-1 text-[11px] font-semibold uppercase tracking-[0.35em] text-white/70">
                                    Gymflow Management
                                </span>
                                <div className="space-y-6">
                                    <h1 className="text-3xl font-semibold tracking-tight sm:text-[2.45rem] sm:leading-[1.1]">
                                        Power up your operations
                                    </h1>
                                    <p className="max-w-sm text-sm text-white/70">
                                        Streamline memberships, track performance, and keep your team connected with a centralized, real-time dashboard built for modern studios.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-12 space-y-5 text-[13px]">
                                <div className="flex items-center gap-3 text-white/80">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10">
                                        <Dumbbell className="h-5 w-5" />
                                    </div>
                                    Trusted by premium fitness clubs
                                </div>
                                <ul className="space-y-2 text-white/70">
                                    <li>• Seamless member onboarding</li>
                                    <li>• Automated attendance tracking</li>
                                    <li>• Insightful revenue analytics</li>
                                </ul>
                            </div>
                        </div>

                        <div className="relative flex flex-col justify-center bg-[#0d132f]/90 p-8 sm:px-12 sm:py-14">
                            <div className="absolute inset-x-8 top-0 h-32 rounded-b-[2rem] bg-gradient-to-b from-white/10 to-transparent" />
                            <div className="relative">
                                <div className="mb-9 text-center sm:text-left">
                                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 text-white sm:mx-0">
                                        <Dumbbell className="h-6 w-6" />
                                    </div>
                                    <h2 className="mt-6 text-[1.8rem] font-semibold tracking-tight text-white">
                                        Welcome back
                                    </h2>
                                    <p className="mt-2 text-sm text-white/60">
                                        Sign in to access your dashboard
                                    </p>
                                </div>

                                <form className="space-y-7" onSubmit={handleSubmit}>
                                    {error && (
                                        <div className="rounded-xl border border-destructive/40 bg-destructive/15 px-4 py-3 text-sm text-destructive">
                                            {error}
                                        </div>
                                    )}

                                    <div className="space-y-5">
                                        <div className="space-y-2">
                                            <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
                                                Email address
                                            </label>
                                            <input
                                                id="email"
                                                type="email"
                                                required
                                                className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white shadow-[0_20px_40px_-25px_rgba(15,23,42,0.8)] outline-none transition focus:border-primary focus:bg-white/15 focus:ring-2 focus:ring-primary/40"
                                                placeholder="admin@gym.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
                                                Password / NIC
                                            </label>
                                            <input
                                                id="password"
                                                type="password"
                                                required
                                                className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white shadow-[0_20px_40px_-25px_rgba(15,23,42,0.8)] outline-none transition focus:border-primary focus:bg-white/15 focus:ring-2 focus:ring-primary/40"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between text-xs text-white/50">
                                        <label className="inline-flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                className="h-3.5 w-3.5 rounded border border-white/20 bg-transparent text-primary focus:ring-primary/40"
                                            />
                                            Remember me
                                        </label>
                                        <button type="button" className="font-medium text-primary/80 transition hover:text-primary">
                                            Forgot password?
                                        </button>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-primary to-primary/70 px-4 py-3 text-sm font-semibold text-primary-foreground shadow-[0_18px_45px_-30px_rgba(59,130,246,0.8)] transition hover:from-primary/90 hover:to-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {isLoading ? (
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        ) : (
                                            'Sign in'
                                        )}
                                    </button>
                                </form>

                                <div className="mt-10 text-center text-xs text-white/50">
                                    <button
                                        onClick={() => {
                                            setEmail('admin@gym.com');
                                            setPassword('password');
                                        }}
                                        className="font-medium text-white/60 transition hover:text-primary"
                                    >
                                        Use demo credentials
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
