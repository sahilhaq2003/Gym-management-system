import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../lib/api';
import { MembershipModal } from '../../components/dashboard/MembershipModal';
import { UserCheck, Calendar, Trophy, QrCode, Clock, Dumbbell, Zap, Activity } from 'lucide-react';

export function MemberOverview() {
    const { user } = useAuth();

    // Mock user data simulation
    const streak = 12;

    const [schedule, setSchedule] = useState<any[]>([]);
    const [completions, setCompletions] = useState<any[]>([]);
    const [activePlan, setActivePlan] = useState<any>(null);
    const [isMembershipModalOpen, setIsMembershipModalOpen] = useState(false);

    useEffect(() => {
        if (user?.id) {
            apiRequest(`/members/${user.id}/schedule`)
                .then(data => {
                    setSchedule(data.schedule || data); // Handle both old array and new object format
                    if (data.plan) setActivePlan(data.plan);
                })
                .catch(console.error);

            apiRequest(`/members/${user.id}/schedule/completions`)
                .then(setCompletions)
                .catch(console.error);
        }
    }, [user?.id]);

    const handleToggleComplete = async (scheduleId: number) => {
        if (!user?.id) return;
        const todayStr = new Date().toISOString().split('T')[0];
        const isCompleted = completions.some(c => c.schedule_id === scheduleId && c.completion_date.startsWith(todayStr));

        try {
            await apiRequest(`/members/${user.id}/schedule/${scheduleId}/completion`, {
                method: 'POST',
                body: JSON.stringify({
                    date: todayStr,
                    completed: !isCompleted
                })
            });

            // Optimistic update
            if (isCompleted) {
                setCompletions(prev => prev.filter(c => !(c.schedule_id === scheduleId && c.completion_date.startsWith(todayStr))));
            } else {
                setCompletions(prev => [...prev, { member_id: user.id, schedule_id: scheduleId, completion_date: todayStr }]);
            }
        } catch (error) {
            console.error('Failed to toggle completion:', error);
        }
    };

    // Calculate next workout (simple logic: first item in schedule that matches today or after)
    const today = new Date().toLocaleDateString('en-US', { weekday: 'short' });
    const nextWorkoutItem = schedule.find(s => s.day_of_week === today) || schedule[0];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                        Welcome back, {user?.name?.split(' ')[0]}
                    </h1>
                    <p className="text-muted-foreground">Here's your fitness journey at a glance.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsMembershipModalOpen(true)}
                        className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors shadow-sm"
                    >
                        Renew / Upgrade
                    </button>
                    <div className="flex items-center gap-3 bg-card border border-border/60 rounded-full px-4 py-2 shadow-sm">
                        <div className="text-sm font-medium">
                            Active Member
                        </div>
                    </div>
                </div>
            </div>

            <MembershipModal
                isOpen={isMembershipModalOpen}
                onClose={() => setIsMembershipModalOpen(false)}
                memberId={user?.id ? parseInt(String(user.id)) : 0}
            />

            <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">

                {/* Left Column: Stats & Schedule */}
                <div className="space-y-6">
                    {/* Stat Cards */}
                    <div className="grid gap-4 sm:grid-cols-3">
                        <div className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/95 p-5 shadow-soft transition-all hover:shadow-glow hover:-translate-y-1">
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-2.5 bg-emerald-500/10 text-emerald-600 rounded-xl">
                                        <UserCheck className="h-5 w-5" />
                                    </div>
                                    <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 bg-emerald-500/5 px-2 py-1 rounded-md">Active</span>
                                </div>
                                <p className="text-sm text-muted-foreground">Membership</p>
                                <p className="text-xl font-bold mt-1">Standard Plan</p>
                            </div>
                        </div>

                        <div className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/95 p-5 shadow-soft transition-all hover:shadow-glow hover:-translate-y-1">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-2.5 bg-blue-500/10 text-blue-600 rounded-xl">
                                        <Calendar className="h-5 w-5" />
                                    </div>
                                    <span className="text-xs font-semibold text-blue-600 bg-blue-500/5 px-2 py-1 rounded-md">Next Up</span>
                                </div>
                                <p className="text-sm text-muted-foreground">Upcoming</p>
                                <p className="text-xl font-bold mt-1 truncate">{nextWorkoutItem ? nextWorkoutItem.activity : 'Rest Day'}</p>
                            </div>
                        </div>

                        <div className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/95 p-5 shadow-soft transition-all hover:shadow-glow hover:-translate-y-1">
                            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-2.5 bg-orange-500/10 text-orange-600 rounded-xl">
                                        <Trophy className="h-5 w-5" />
                                    </div>
                                    <span className="text-xs font-semibold text-orange-600 bg-orange-500/5 px-2 py-1 rounded-md">Streak</span>
                                </div>
                                <p className="text-sm text-muted-foreground">Consistency</p>
                                <p className="text-xl font-bold mt-1">{streak} Days</p>
                            </div>
                        </div>
                    </div>

                    {/* Upcoming Schedule */}
                    <div className="rounded-2xl border border-border/60 bg-card/95 shadow-soft overflow-hidden">
                        <div className="p-6 border-b border-border/50 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold">Your Weekly Schedule</h3>
                                <div className="flex flex-col gap-1">
                                    {activePlan ? (
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-sm font-medium text-primary">{activePlan.name}</span>
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">{activePlan.difficulty_level}</span>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">Check off items as you complete them!</p>
                                    )}
                                    {activePlan && <p className="text-xs text-muted-foreground mt-1">{activePlan.description}</p>}
                                </div>
                            </div>
                        </div>
                        <div className="divide-y divide-border/50">
                            {schedule.length > 0 ? schedule.map((item, i) => {
                                const isCompleted = completions.some(c => c.schedule_id === item.id && c.completion_date.startsWith(new Date().toISOString().split('T')[0]));
                                const isToday = item.day_of_week === today;

                                return (
                                    <div key={i} className={`p-4 flex items-center gap-4 transition-colors group ${isCompleted ? 'bg-muted/40' : 'hover:bg-muted/30'}`}>
                                        <button
                                            onClick={() => handleToggleComplete(item.id)}
                                            disabled={!isToday}
                                            className={`flex flex-col items-center justify-center h-14 w-14 rounded-xl border transition-all ${isCompleted ? 'bg-green-500 text-white border-green-500' : 'bg-muted text-foreground border-border hover:border-primary/50'} ${!isToday && !isCompleted ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            {isCompleted ? <UserCheck className="w-6 h-6" /> : (
                                                <>
                                                    <span className="text-xs font-medium uppercase text-muted-foreground">{item.day_of_week.substring(0, 3)}</span>
                                                    {/* <span className="text-lg font-bold">Done?</span> */}
                                                </>
                                            )}
                                        </button>
                                        <div className="flex-1">
                                            <h4 className={`font-semibold transition-colors ${isCompleted ? 'text-muted-foreground line-through' : 'text-foreground group-hover:text-primary'}`}>{item.activity}</h4>
                                            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {item.time}</span>
                                                {item.trainer && <span className="flex items-center gap-1"><Dumbbell className="w-3 h-3" /> {item.trainer}</span>}
                                            </div>
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${isCompleted ? 'bg-green-500/10 text-green-600' : item.type === 'Class' ? 'bg-purple-500/10 text-purple-600' : 'bg-blue-500/10 text-blue-600'}`}>
                                            {isCompleted ? 'Done' : item.type}
                                        </div>
                                    </div>
                                )
                            }) : (
                                <div className="p-8 text-center text-muted-foreground">
                                    No schedule assigned yet. Ask your trainer to set one up!
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Digital Card & Quick Actions */}
                <div className="space-y-6">
                    {/* Digital Member Card */}
                    <div className="group relative aspect-[1.586] w-full overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-800 text-white shadow-2xl transition-transform hover:scale-[1.02]">
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
                        <div className="absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />

                        <div className="relative z-10 flex h-full flex-col justify-between p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-xs uppercase tracking-widest opacity-60">Gym Pass</p>
                                    <h3 className="text-xl font-bold tracking-tight mt-1">GYM MEMBER</h3>
                                </div>
                                <QrCode className="h-12 w-12 text-white/80" />
                            </div>

                            <div>
                                <p className="text-sm opacity-80">Member Name</p>
                                <p className="text-lg font-medium tracking-wide">{user?.name || 'Member Name'}</p>
                                <div className="mt-4 flex justify-between items-end">
                                    <div>
                                        <p className="text-[10px] uppercase tracking-wider opacity-60">ID Number</p>
                                        <p className="font-mono text-sm">{user?.id?.toString().padStart(8, '0')}</p>
                                    </div>
                                    <div className="h-8 w-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center">
                                        <Zap className="h-4 w-4" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats / Location */}
                    <div className="rounded-2xl border border-border/60 bg-card/95 p-5 shadow-soft">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-rose-500/10 rounded-lg text-rose-500">
                                <Activity className="h-5 w-5" />
                            </div>
                            <h3 className="font-semibold">Live Traffic</h3>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-muted-foreground">Gym Capacity</span>
                                    <span className="font-medium text-rose-500">Busy</span>
                                </div>
                                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                                    <div className="h-full bg-rose-500 w-[75%] rounded-full animate-pulse" />
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Peak hours right now. Usually quiets down by 8:00 PM.
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
