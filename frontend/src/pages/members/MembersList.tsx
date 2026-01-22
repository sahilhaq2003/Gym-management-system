import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { apiRequest } from '../../lib/api';

interface Member {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    status: 'active' | 'expired' | 'inactive';
    plan: string;
}

export function MembersList() {
    const navigate = useNavigate();
    const [members, setMembers] = useState<Member[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        try {
            const data = await apiRequest('/members');
            setMembers(data);
        } catch (error) {
            console.error('Failed to fetch members:', error);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">Member Directory</h1>
                    <p className="text-muted-foreground">Manage your athletes and billing details.</p>
                </div>
                <button
                    onClick={() => navigate('/members/add')}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all hover:scale-105 active:scale-95"
                >
                    <Plus className="w-4 h-4" />
                    New Member
                </button>
            </div>

            {/* Search & Stats Bar */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 card-surface p-1 rounded-xl border border-border/60 shadow-sm flex items-center">
                    <Search className="ml-3 h-5 w-5 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search by name, email, or ID..."
                        className="flex-1 bg-transparent border-none focus:ring-0 text-sm px-4 py-3 placeholder:text-muted-foreground/70"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 card-surface border border-border/60 hover:bg-muted/50 rounded-xl text-sm font-medium transition-colors">
                        <Filter className="w-4 h-4 text-muted-foreground" />
                        Filters
                    </button>
                </div>
            </div>

            {/* Members Table */}
            <div className="card-surface overflow-hidden border border-border/60 shadow-sm">
                <div className="p-6 border-b border-border/40 bg-muted/20 flex items-center justify-between">
                    <h2 className="text-lg font-semibold tracking-tight">All Members ({members.length})</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-[#0F172A]/5 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                            <tr>
                                <th className="px-6 py-4">Member Info</th>
                                <th className="px-6 py-4">Contact</th>
                                <th className="px-6 py-4">Plan Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50 bg-card/40 backdrop-blur-sm">
                            {members.filter(m =>
                                m.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                m.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                m.email.toLowerCase().includes(searchTerm.toLowerCase())
                            ).map((member) => (
                                <tr key={member.id} className="hover:bg-muted/40 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center font-bold text-white shadow-md">
                                                {member.first_name[0]}{member.last_name[0]}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-foreground text-base">{member.first_name} {member.last_name}</p>
                                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">ID: #{member.id.toString().padStart(4, '0')}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1.5">
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Mail className="w-3.5 h-3.5 opacity-70" />
                                                <span className="text-xs">{member.email}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <span className="text-xs opacity-70">Ph:</span>
                                                <span className="text-xs">{member.phone}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1.5">
                                            <p className="font-medium text-sm">{member.plan}</p>
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${member.status === 'active'
                                                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                                    : member.status === 'expired'
                                                        ? 'bg-red-500/10 text-red-600 border-red-500/20'
                                                        : 'bg-slate-100 text-slate-500 border-slate-200'
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${member.status === 'active' ? 'bg-emerald-500' : member.status === 'expired' ? 'bg-red-500' : 'bg-slate-400'}`} />
                                                {member.status}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => navigate(`/members/edit/${member.id}`)}
                                            className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-border hover:bg-background hover:text-primary transition-all shadow-sm"
                                            title="Edit Member"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {members.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                                        No members found. Add your first member to get started.
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
