import { useState, useEffect } from 'react';
import { Clock, User, CheckCircle2, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { apiRequest } from '../../lib/api';

interface AttendanceRecord {
    id: number;
    member_id: number;
    first_name: string;
    last_name: string;
    check_in_time: string;
    check_out_time: string | null;
    method: string;
    date: string;
}

export function Attendance() {
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    const [viewMode, setViewMode] = useState<'today' | 'history' | 'search'>('today');
    const [searchId, setSearchId] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                let endpoint = '/attendance/today';
                if (viewMode === 'history') endpoint = '/attendance/history';
                if (viewMode === 'search' && searchId) endpoint = `/attendance/member/${searchId}`;

                // Don't fetch if search mode but no ID, unless switching modes clears it
                if (viewMode === 'search' && !searchId) return;

                const data = await apiRequest(endpoint);
                setAttendance(data);
            } catch (error) {
                console.error('Failed to fetch attendance:', error);
                setAttendance([]); // Clear on error or not found
            }
        };
        fetchAttendance();
    }, [viewMode, searchId]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchId.trim()) {
            setViewMode('search');
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">Live Attendance</h1>
                    <p className="text-muted-foreground">Monitor real-time gym traffic and member activity.</p>
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search Member ID..."
                                value={searchId}
                                onChange={(e) => setSearchId(e.target.value)}
                                className="pl-9 h-10 w-48 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            />
                        </div>
                        <button
                            type="submit"
                            className="h-10 px-4 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"
                        >
                            Search
                        </button>
                    </form>
                    <button
                        onClick={() => navigate('/attendance/test')}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all hover:scale-105 active:scale-95"
                    >
                        <CheckCircle2 className="w-4 h-4" />
                        Manual Check-In
                    </button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <div className="card-surface p-5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <User className="w-16 h-16 text-emerald-500" />
                    </div>
                    <div>
                        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Present Today</p>
                        <h3 className="text-3xl font-bold mt-2 text-foreground">{attendance.length}</h3>
                        <p className="text-xs text-emerald-500 mt-1 font-medium">+12% from yesterday</p>
                    </div>
                </div>
                <div className="card-surface p-5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Clock className="w-16 h-16 text-blue-500" />
                    </div>
                    <div>
                        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Currently Active</p>
                        <h3 className="text-3xl font-bold mt-2 text-foreground">{attendance.filter(r => !r.check_out_time).length}</h3>
                        <p className="text-xs text-blue-500 mt-1 font-medium">Live count</p>
                    </div>
                </div>
            </div>

            <div className="card-surface overflow-hidden border border-border/60 shadow-sm">
                <div className="p-6 border-b border-border/40 flex items-center justify-between bg-muted/20">
                    <h2 className="text-lg font-semibold tracking-tight">
                        {viewMode === 'today' ? 'Activity Feed' :
                            viewMode === 'history' ? 'Attendance History (Past Year)' :
                                `Search Results for ID: ${searchId}`}
                    </h2>
                    <div className="flex bg-muted/50 rounded-lg p-1">
                        <button
                            onClick={() => { setViewMode('today'); setSearchId(''); }}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${viewMode === 'today'
                                ? 'bg-background shadow text-foreground'
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            Today
                        </button>
                        <button
                            onClick={() => { setViewMode('history'); setSearchId(''); }}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${viewMode === 'history'
                                ? 'bg-background shadow text-foreground'
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            History
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-[#0F172A]/5 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                            <tr>
                                <th className="px-6 py-4">Member</th>
                                {(viewMode === 'history' || viewMode === 'search') && <th className="px-6 py-4">Date</th>}
                                <th className="px-6 py-4">Check In</th>
                                <th className="px-6 py-4">Check Out</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Method</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50 bg-card/40 backdrop-blur-sm">
                            {attendance.length > 0 ? (
                                attendance.map((record) => (
                                    <tr key={record.id} className="hover:bg-muted/40 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center font-bold text-white shadow-md text-xs">
                                                    {record.first_name[0]}{record.last_name[0]}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-foreground">{record.first_name} {record.last_name}</p>
                                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">ID: {record.member_id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        {(viewMode === 'history' || viewMode === 'search') && (
                                            <td className="px-6 py-4 text-muted-foreground font-mono text-xs">
                                                {new Date(record.date).toLocaleDateString()}
                                            </td>
                                        )}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Clock className="w-3.5 h-3.5" />
                                                <span className="font-mono text-xs">{new Date(record.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {record.check_out_time ? (
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    <span className="font-mono text-xs">{new Date(record.check_out_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground/40 text-xs italic">-- : --</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${!record.check_out_time
                                                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                                : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${!record.check_out_time ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                                                {!record.check_out_time ? 'Active Session' : 'Completed'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground text-xs font-medium uppercase tracking-wider">
                                            {record.method}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={(viewMode === 'history' || viewMode === 'search') ? 6 : 5} className="px-6 py-12 text-center text-muted-foreground">
                                        {viewMode === 'today' ? 'No attendance records found for today.' :
                                            viewMode === 'history' ? 'No attendance records found for the past year.' :
                                                'No records found for this member ID.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
