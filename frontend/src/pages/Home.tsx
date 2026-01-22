import { useNavigate } from 'react-router-dom';
import { Activity, ShieldCheck, Users, Zap, CheckCircle2, ArrowRight, BarChart3, Smartphone } from 'lucide-react';

export function Home() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#0F172A] text-slate-50 overflow-x-hidden selection:bg-indigo-500/30">

            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#0F172A]/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 shadow-lg shadow-indigo-500/20 text-white">
                            <Activity className="h-6 w-6" />
                        </div>
                        <span className="text-xl font-bold tracking-tight">FitSync</span>
                    </div>

                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
                        <a href="#features" className="hover:text-white transition-colors">Features</a>
                        <a href="#solutions" className="hover:text-white transition-colors">Solutions</a>
                        <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/login')}
                            className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => navigate('/login')}
                            className="hidden sm:flex items-center gap-2 bg-white text-[#0F172A] px-5 py-2.5 rounded-full text-sm font-bold hover:bg-indigo-50 transition-all hover:scale-105 active:scale-95"
                        >
                            Get Started
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[500px] bg-indigo-500/20 blur-[120px] rounded-full opacity-50 pointer-events-none" />

                <div className="max-w-5xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium mb-6 uppercase tracking-wider animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                        New v2.0 Released
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight mb-8">
                        The Operating System for <br />
                        <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">Modern Fitness Clubs</span>
                    </h1>

                    <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                        Streamline memberships, automate check-ins, and boost retention with the all-in-one platform designed for high-performance gyms.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                            onClick={() => navigate('/login')}
                            className="w-full sm:w-auto px-8 py-4 bg-indigo-500 hover:bg-indigo-400 text-white rounded-2xl font-bold text-lg shadow-xl shadow-indigo-500/25 ring-1 ring-indigo-400/50 transition-all hover:-translate-y-1"
                        >
                            Start Free Trial
                        </button>
                        <button className="w-full sm:w-auto px-8 py-4 bg-[#1E293B] hover:bg-[#334155] text-white rounded-2xl font-semibold text-lg border border-slate-700 transition-all hover:-translate-y-1">
                            View Demo
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 border-t border-white/5 pt-12">
                        {[
                            { label: 'Active Gyms', value: '500+' },
                            { label: 'Daily Check-ins', value: '50k+' },
                            { label: 'Uptime', value: '99.9%' },
                            { label: 'Support', value: '24/7' }
                        ].map((stat, i) => (
                            <div key={i}>
                                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                                <div className="text-sm text-slate-500 font-medium uppercase tracking-wider">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="py-24 bg-[#0B1120] relative">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to run your club</h2>
                        <p className="text-slate-400 max-w-2xl mx-auto">From biometrics to billing, FitSync handles the heavy lifting so you can focus on your members.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: ShieldCheck,
                                title: "Biometric Security",
                                desc: "Fingerprint and facial recognition integration for secure, cardless member access control."
                            },
                            {
                                icon: Users,
                                title: "Member Management",
                                desc: "Full CRM to track attendance, memberships, body stats, and progression over time."
                            },
                            {
                                icon: BarChart3,
                                title: "Advanced Analytics",
                                desc: "Real-time insights on revenue, retention, and peak hours to optimize your business."
                            },
                            {
                                icon: Zap,
                                title: "Automated Billing",
                                desc: "Set it and forget it. Recurring payments, invoices, and expiry reminders sent automatically."
                            },
                            {
                                icon: Smartphone,
                                title: "Member App",
                                desc: "Give members a dedicated portal to view schedules, book classes, and track their workouts."
                            },
                            {
                                icon: CheckCircle2,
                                title: "Staff Roles",
                                desc: "Granular permission controls for trainers, receptionists, and managers."
                            }
                        ].map((feature, i) => (
                            <div key={i} className="group p-8 rounded-3xl bg-[#1E293B]/50 border border-white/5 hover:border-indigo-500/30 transition-all hover:bg-[#1E293B] hover:-translate-y-1">
                                <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform mb-6">
                                    <feature.icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                                <p className="text-slate-400 leading-relaxed text-sm">
                                    {feature.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-white/5 bg-[#0F172A] text-slate-400 text-sm">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-indigo-500" />
                        <span className="font-bold text-white">FitSync</span>
                    </div>
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-white transition-colors">Privacy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms</a>
                        <a href="#" className="hover:text-white transition-colors">Contact</a>
                    </div>
                    <div>
                        &copy; 2026 FitSync Inc. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}
