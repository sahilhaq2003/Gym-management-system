import { useState, useEffect } from 'react';
import { apiRequest } from '../../lib/api';
import { Check, X, AlertCircle } from 'lucide-react';

interface PendingRequest {
    id: number;
    first_name: string;
    last_name: string;
    plan_name: string;
    start_date: string;
    amount: string;
}

export function PendingApprovals() {
    const [requests, setRequests] = useState<PendingRequest[]>([]);

    useEffect(() => {
        fetchPending();
    }, []);

    const fetchPending = async () => {
        try {
            const data = await apiRequest('/memberships/pending');
            setRequests(data);
        } catch (error) {
            console.error('Failed to fetch pending requests', error);
        }
    };

    const handleApprove = async (id: number) => {
        if (!confirm('Approve this membership?')) return;
        try {
            await apiRequest(`/memberships/${id}/approve`, { method: 'PUT' });
            setRequests(prev => prev.filter(r => r.id !== id));
        } catch (error) {
            console.error(error);
            alert('Failed to approve');
        }
    };

    const handleReject = async (id: number) => {
        if (!confirm('Reject this membership?')) return;
        try {
            await apiRequest(`/memberships/${id}/reject`, { method: 'PUT' });
            setRequests(prev => prev.filter(r => r.id !== id));
        } catch (error) {
            console.error(error);
            alert('Failed to reject');
        }
    };

    return (
        <div className="card-surface p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold tracking-tight text-foreground">Membership Requests</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Pending approvals from members</p>
                </div>
                {requests.length > 0 && (
                    <span className="bg-orange-500/10 text-orange-600 text-xs font-bold px-2 py-1 rounded-full">
                        {requests.length} Pending
                    </span>
                )}
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 -mr-2 pr-2 custom-scrollbar">
                {requests.length > 0 ? (
                    requests.map(req => (
                        <div key={req.id} className="p-4 rounded-lg bg-background/50 border border-border/60 flex items-center justify-between">
                            <div>
                                <h4 className="font-semibold text-sm">{req.first_name} {req.last_name}</h4>
                                <p className="text-xs text-muted-foreground">{req.plan_name} • Rs. {parseFloat(req.amount).toLocaleString()}</p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleApprove(req.id)}
                                    className="p-1.5 rounded-full bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-colors"
                                    title="Approve"
                                >
                                    <Check className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleReject(req.id)}
                                    className="p-1.5 rounded-full bg-red-500/10 text-red-600 hover:bg-red-500/20 transition-colors"
                                    title="Reject"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center h-40 text-center border border-dashed border-border/50 rounded-xl bg-muted/20">
                        <AlertCircle className="h-6 w-6 text-muted-foreground/50 mb-2" />
                        <p className="text-sm text-muted-foreground">No pending requests</p>
                    </div>
                )}
            </div>
        </div>
    );
}
