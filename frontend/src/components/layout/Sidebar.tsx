import { LayoutDashboard, Users, CreditCard, CalendarCheck, Settings, LogOut, FileText, Fingerprint, Activity } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';

export function Sidebar() {
    const { user, logout } = useAuth();

    const allItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', roles: ['admin', 'staff', 'member', 'trainer'] },
        { icon: Users, label: 'Members', path: '/members', roles: ['admin', 'staff'] },
        { icon: FileText, label: 'Plans', path: '/plans', roles: ['admin'] },
        { icon: CalendarCheck, label: 'Attendance', path: '/attendance', roles: ['admin', 'staff'] },
        { icon: Fingerprint, label: 'Check-in Kiosk', path: '/attendance/test', roles: ['admin', 'staff'] },
        { icon: CreditCard, label: 'Payments', path: '/payments', roles: ['admin'] },
        { icon: Fingerprint, label: 'Devices', path: '/devices', roles: ['admin', 'staff'] },
        { icon: Settings, label: 'Settings', path: '/settings', roles: ['admin', 'staff', 'member'] },
    ];

    const sidebarItems = allItems.filter(item => item.roles.includes(user?.role || ''));

    return (
        <aside className="sticky top-0 z-20 flex h-screen w-64 flex-col bg-[#0F172A] text-slate-300 border-r border-slate-800 shadow-2xl transition-all duration-300">
            {/* Logo Section */}
            <div className="relative flex h-20 items-center gap-3 px-6 border-b border-slate-800/60">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/20 text-white">
                    <Activity className="h-6 w-6" />
                </div>
                <div className="flex flex-col">
                    <span className="text-lg font-bold tracking-tight text-white antialiased">FitSync</span>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-medium">Pro Admin</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-4 py-6 custom-scrollbar">
                <div className="space-y-1.5">
                    {sidebarItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                cn(
                                    "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 outline-none",
                                    isActive
                                        ? "bg-slate-800/50 text-white shadow-inner"
                                        : "text-slate-400 hover:bg-slate-800/30 hover:text-slate-200"
                                )
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    {isActive && (
                                        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-r-full bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.5)]" />
                                    )}
                                    <span className={cn(
                                        "flex items-center justify-center transition-colors duration-200",
                                        isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"
                                    )}>
                                        <item.icon className="h-5 w-5" />
                                    </span>
                                    <span>{item.label}</span>
                                </>
                            )}
                        </NavLink>
                    ))}
                </div>
            </nav>

            {/* User Profile / Logout */}
            <div className="border-t border-slate-800 p-4">
                <div className="mb-4 rounded-xl bg-slate-800/40 p-3 flex items-center gap-3 border border-slate-700/50">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                        {user?.name?.slice(0, 2).toUpperCase() || 'AD'}
                    </div>
                    <div className="overflow-hidden">
                        <p className="truncate text-sm font-medium text-white">{user?.name || 'Administrator'}</p>
                        <p className="truncate text-xs text-slate-500 capitalize">{user?.role || 'Access Level 5'}</p>
                    </div>
                </div>

                <button
                    onClick={logout}
                    className="flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium text-slate-400 transition-colors hover:bg-rose-500/10 hover:text-rose-400"
                >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                </button>
            </div>
        </aside>
    );
}
