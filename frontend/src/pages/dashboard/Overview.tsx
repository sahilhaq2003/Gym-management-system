import { useState, useEffect, useMemo } from 'react';
// Force rebuild
import { useNavigate } from 'react-router-dom';
import { Users, DollarSign, UserCheck, AlertCircle, ArrowUpRight, Zap, Dumbbell, ShoppingBag } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { apiRequest } from '../../lib/api';


type DashboardStats = {
    totalMembers: number;
    monthlyRevenue: number;
    activeMembers: number;
    expiredMembers: number;
    revenueChart: Array<{ name: string; revenue: number }>;
    recentActivity: Array<{
        first_name: string;
        last_name: string;
        check_in_time: string;
    }>;
};

const currencyFormatter = new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat('en-US');

export function Overview() {
    const [stats, setStats] = useState<DashboardStats>({
        totalMembers: 0,
        monthlyRevenue: 0,
        activeMembers: 0,
        expiredMembers: 0,
        revenueChart: [],
        recentActivity: [],
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await apiRequest('/dashboard/stats');
                setStats(data);
            } catch (error) {
                console.error('Failed to fetch dashboard stats:', error);
            }
        };

        fetchStats();
    }, []);

    const hasRecentActivity = stats.recentActivity?.length > 0;
    const hasRevenueData = stats.revenueChart?.some((entry) => entry.revenue > 0);

    const statCards = useMemo(() => ([
        {
            title: 'Total Members',
            value: numberFormatter.format(stats.totalMembers),
            rawValue: stats.totalMembers,
            description: stats.totalMembers ? 'Active athletes in your roster' : 'Add your first member to get started',
            icon: Users,
            accent: 'from-blue-500/20 via-blue-500/5 to-transparent',
            iconWrap: 'border border-blue-100/70 bg-blue-500/10 text-blue-600',
        },
        {
            title: 'Monthly Revenue',
            value: currencyFormatter.format(stats.monthlyRevenue ?? 0),
            rawValue: stats.monthlyRevenue,
            description: stats.monthlyRevenue ? 'Collected in the current billing cycle' : 'Track payments as soon as they arrive',
            icon: DollarSign,
            accent: 'from-emerald-500/25 via-emerald-400/10 to-transparent',
            iconWrap: 'border border-emerald-100/70 bg-emerald-500/10 text-emerald-600',
        },
        {
            title: 'Active Members',
            value: numberFormatter.format(stats.activeMembers),
            rawValue: stats.activeMembers,
            description: stats.activeMembers ? 'Currently checked-in plans' : 'Assign plans to activate members',
            icon: UserCheck,
            accent: 'from-indigo-500/20 via-indigo-500/8 to-transparent',
            iconWrap: 'border border-indigo-100/70 bg-indigo-500/10 text-indigo-600',
        },
        {
            title: 'Expiring Soon',
            value: numberFormatter.format(stats.expiredMembers),
            rawValue: stats.expiredMembers,
            description: stats.expiredMembers ? 'Renewals to follow up this week' : 'No expiring memberships right now',
            icon: AlertCircle,
            accent: 'from-orange-500/25 via-orange-400/10 to-transparent',
            iconWrap: 'border border-orange-100/70 bg-orange-500/10 text-orange-600',
        },
    ]), [stats]);

    const normalizedRevenue = hasRevenueData ? stats.revenueChart : [{ name: 'Awaiting data', revenue: 0 }];

    const navigate = useNavigate();
    const todaysDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">Dashboard Overview</h1>
                    <p className="text-muted-foreground">{todaysDate}</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => navigate('/members/add')}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all hover:scale-105 active:scale-95"
                    >
                        <Users className="w-4 h-4" />
                        Add Member
                    </button>
                    <button
                        onClick={() => navigate('/attendance/test')}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-background border border-border/60 rounded-lg hover:bg-muted transition-colors"
                    >
                        <Zap className="w-4 h-4" />
                        Quick Scan
                    </button>
                </div>
            </div>

            {/* Stat Cards */}
            <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {statCards.map((card) => (
                    <div
                        key={card.title}
                        className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/60 bg-card/60 p-5 shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${card.iconWrap} hover:bg-card/90`}
                    >
                        {/* Subtle background glow */}
                        <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${card.accent} opacity-20 blur-2xl transition-opacity group-hover:opacity-40`} />

                        <div className="relative z-[1] flex flex-col gap-4 h-full">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-sm font-medium uppercase tracking-[0.05em] text-muted-foreground">{card.title}</p>
                                    <div className="mt-3 flex items-baseline gap-2">
                                        <span className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">{card.value}</span>
                                    </div>
                                </div>
                                <span className={`flex h-10 w-10 items-center justify-center rounded-xl bg-background/50 backdrop-blur-sm shadow-sm`}>
                                    <card.icon className="h-5 w-5" />
                                </span>
                            </div>
                            <p className="text-xs font-medium text-muted-foreground/80 md:text-sm">{card.description}</p>
                        </div>
                    </div>
                ))}
            </section>

            {/* Revenue & Activity */}
            <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-[2fr_1fr]">
                {/* Revenue Chart */}
                <div className="card-surface relative overflow-hidden p-6 md:p-8">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-semibold tracking-tight text-foreground">Revenue Analytics</h3>
                            <p className="mt-1 text-sm text-muted-foreground">Financial performance over time</p>
                        </div>
                        <select className="text-sm border-none bg-muted/50 rounded-lg px-3 py-1 font-medium text-muted-foreground focus:ring-0 cursor-pointer hover:text-foreground">
                            <option>Last 30 Days</option>
                            <option>This Year</option>
                        </select>
                    </div>

                    <div className="h-[250px] w-full sm:h-[320px]">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                            <AreaChart data={normalizedRevenue} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.4)" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                                    tickFormatter={(value) => currencyFormatter.format(value)}
                                    width={60}
                                />
                                <Tooltip
                                    cursor={{ strokeDasharray: '3 3', stroke: 'hsl(var(--primary) / 0.5)' }}
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--popover))',
                                        borderRadius: '0.75rem',
                                        border: '1px solid hsl(var(--border))',
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
                                    }}
                                    formatter={(value: number | undefined) => [currencyFormatter.format(value || 0), 'Revenue'] as [string, string]}
                                    labelStyle={{ color: 'hsl(var(--muted-foreground))', marginBottom: '0.25rem' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="hsl(var(--primary))"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorRevenue)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Activity Feed */}
                <div className="card-surface flex flex-col p-6 md:p-8 h-full">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-semibold tracking-tight text-foreground">Recent Check-ins</h3>
                            <p className="mt-1 text-sm text-muted-foreground">Latest member arrivals</p>
                        </div>
                        <button className="text-primary hover:bg-primary/10 rounded-full p-1 transition-colors">
                            <ArrowUpRight className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto -mr-2 pr-2 space-y-6 custom-scrollbar">
                        {hasRecentActivity ? (
                            <div className="relative border-l border-border/50 ml-3 space-y-6">
                                {stats.recentActivity.map((activity, index) => (
                                    <div key={index} className="relative pl-6">
                                        <span className="absolute -left-[5px] top-1 h-2.5 w-2.5 rounded-full border-2 border-background bg-primary ring-4 ring-primary/10" />
                                        <div className="flex flex-col gap-1">
                                            <p className="text-sm font-medium text-foreground">
                                                {activity.first_name} {activity.last_name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Checked in at <span className="font-medium text-foreground/80">{new Date(activity.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-[200px] text-center p-4 border border-dashed border-border/50 rounded-xl bg-muted/20">
                                <UserCheck className="h-8 w-8 text-muted-foreground/50 mb-3" />
                                <p className="text-sm font-medium text-foreground">No recent activity</p>
                                <p className="text-xs text-muted-foreground">Check-ins will appear here live.</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>


            {/* Featured Promotions & Pending Requests */}
            {/* Featured Promotions */}
            <section>
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-foreground">Active Campaigns</h3>
                        <button className="text-sm font-medium text-primary hover:underline">View All</button>
                    </div>
                    <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4">
                        {[
                            { title: "Summer Shred", desc: "8-week intensity program", color: "orange", icon: Dumbbell },
                            { title: "Protein Sale", desc: "Clearance on old stock", color: "emerald", icon: ShoppingBag }
                        ].map((item, i) => (
                            <div key={i} className={`group relative overflow-hidden rounded-xl border border-border/50 bg-card p-4 transition-all hover:border-${item.color}-500/30 hover:shadow-md cursor-pointer`}>
                                <div className="flex items-start gap-4">
                                    <div className={`p-3 rounded-lg bg-${item.color}-500/10 text-${item.color}-600 group-hover:scale-110 transition-transform`}>
                                        <item.icon className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-sm">{item.title}</h4>
                                        <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                                    </div>
                                </div>
                                <div className={`absolute bottom-0 left-0 h-1 w-0 bg-${item.color}-500 transition-all duration-300 group-hover:w-full`} />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

        </div>
    );
}
