import { useState, useEffect } from 'react';
import { DollarSign, Download, Plus, Search, Filter, CreditCard, X } from 'lucide-react';
import { apiRequest } from '../../lib/api';

interface Payment {
    id: number;
    member_id: number;
    first_name: string;
    last_name: string;
    amount: number;
    payment_method: string;
    invoice_number: string;
    transaction_date: string;
}

export function Payments() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);

    const fetchPayments = async () => {
        try {
            const data = await apiRequest('/payments');
            setPayments(data);
        } catch (error) {
            console.error('Failed to fetch payments:', error);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, []);

    const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Payments</h1>
                    <p className="text-muted-foreground">Manage revenue and invoices.</p>
                </div>
                <button
                    onClick={() => setIsRecordModalOpen(true)}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium whitespace-nowrap shadow-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                    <Plus className="w-4 h-4" />
                    Record Payment
                </button>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="p-6 bg-card rounded-xl border border-border shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                            <h3 className="text-2xl font-bold mt-2">${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                        </div>
                        <div className="p-3 rounded-full bg-green-100 text-green-600 dark:bg-green-900/30">
                            <DollarSign className="w-6 h-6" />
                        </div>
                    </div>
                </div>
                <div className="p-6 bg-card rounded-xl border border-border shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Transactions</p>
                            <h3 className="text-2xl font-bold mt-2">{payments.length}</h3>
                        </div>
                        <div className="p-3 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30">
                            <CreditCard className="w-6 h-6" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4 bg-card p-4 rounded-lg border border-border shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search invoice or member..."
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm pl-9 focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                </div>
                <button className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground bg-accent/50 hover:bg-accent rounded-md">
                    <Filter className="w-4 h-4" />
                    Filter
                </button>
            </div>

            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 border-b border-border text-xs uppercase text-muted-foreground">
                            <tr>
                                <th className="px-6 py-3 font-medium">Invoice</th>
                                <th className="px-6 py-3 font-medium">Member</th>
                                <th className="px-6 py-3 font-medium">Date</th>
                                <th className="px-6 py-3 font-medium">Amount</th>
                                <th className="px-6 py-3 font-medium">Method</th>
                                <th className="px-6 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {payments.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">No payments recorded yet.</td>
                                </tr>
                            ) : (
                                payments.map((payment) => (
                                    <tr key={payment.id} className="hover:bg-muted/50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs">{payment.invoice_number}</td>
                                        <td className="px-6 py-4 font-medium">{payment.first_name} {payment.last_name}</td>
                                        <td className="px-6 py-4">{new Date(payment.transaction_date).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 font-bold text-green-600 dark:text-green-400">
                                            ${Number(payment.amount).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 capitalize">{payment.payment_method.replace('_', ' ')}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="p-2 hover:bg-accent rounded-full text-muted-foreground hover:text-foreground transition-colors">
                                                <Download className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isRecordModalOpen && <RecordPaymentModal onClose={() => setIsRecordModalOpen(false)} onSuccess={fetchPayments} />}
        </div>
    );
}

function RecordPaymentModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
    const [members, setMembers] = useState<any[]>([]);
    const [plans, setPlans] = useState<any[]>([]);
    const [selectedMember, setSelectedMember] = useState('');
    const [selectedPlan, setSelectedPlan] = useState('');
    const [amount, setAmount] = useState('');
    const [method, setMethod] = useState('cash');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const [membersData, plansData] = await Promise.all([
                    apiRequest('/members'),
                    apiRequest('/memberships/plans') // assuming route is /memberships/plans based on backend implementation
                ]);
                setMembers(membersData);
                setPlans(plansData);
            } catch (error) {
                console.error(error);
            }
        };
        load();
    }, []);

    const handlePlanChange = (planId: string) => {
        setSelectedPlan(planId);
        // Auto-fill amount based on plan price
        const plan = plans.find(p => p.id === Number(planId));
        if (plan) {
            setAmount(plan.price.toString());
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedMember || !amount) return;

        setLoading(true);
        try {
            if (method === 'online') {
                // Trigger PayHere Flow
                const response = await apiRequest('/payments/payhere/initiate', {
                    method: 'POST',
                    body: JSON.stringify({
                        member_id: Number(selectedMember),
                        plan_id: selectedPlan ? Number(selectedPlan) : undefined,
                        amount: parseFloat(amount)
                    })
                });

                // Submit Form to PayHere
                const actionUrl = response.sandbox
                    ? 'https://sandbox.payhere.lk/pay/checkout'
                    : 'https://www.payhere.lk/pay/checkout';

                const form = document.createElement('form');
                form.setAttribute('method', 'POST');
                form.setAttribute('action', actionUrl);

                Object.keys(response).forEach(key => {
                    if (key === 'sandbox') return;
                    const input = document.createElement('input');
                    input.setAttribute('type', 'hidden');
                    input.setAttribute('name', key);
                    input.setAttribute('value', String(response[key]));
                    form.appendChild(input);
                });

                document.body.appendChild(form);
                form.submit();
            } else {
                // Standard Manual Recording
                await apiRequest('/payments', {
                    method: 'POST',
                    body: JSON.stringify({
                        member_id: selectedMember,
                        plan_id: selectedPlan ? Number(selectedPlan) : null,
                        amount: parseFloat(amount),
                        payment_method: method
                    })
                });
                onSuccess();
                onClose();
            }

        } catch (error) {
            console.error(error);
            alert('Failed to record payment');
            setLoading(false);
        } finally {
            if (method !== 'online') {
                setLoading(false);
            }
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-card w-full max-w-md rounded-xl border border-border shadow-xl p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Record Manual Payment</h2>
                    <button onClick={onClose} className="p-1 hover:bg-muted rounded-full">
                        <X className="w-5 h-5 text-muted-foreground" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1.5">Select Member</label>
                        <select
                            className="input-field w-full"
                            value={selectedMember}
                            onChange={e => setSelectedMember(e.target.value)}
                            required
                        >
                            <option value="">Choose a member...</option>
                            {members.map(m => (
                                <option key={m.id} value={m.id}>{m.first_name} {m.last_name} ({m.phone})</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1.5">Membership Plan (Optional)</label>
                        <select
                            className="input-field w-full"
                            value={selectedPlan}
                            onChange={e => handlePlanChange(e.target.value)}
                        >
                            <option value="">-- No Plan (Just Payment) --</option>
                            {plans.map(p => (
                                <option key={p.id} value={p.id}>{p.name} - {Number(p.price).toLocaleString()} LKR / {p.duration_months}mo</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1.5">Amount (LKR)</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-medium">LKR</span>
                            <input
                                type="number"
                                className="input-field w-full pl-10"
                                placeholder="0.00"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                min="0"
                                step="0.01"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1.5">Payment Method</label>
                        <select
                            className="input-field w-full"
                            value={method}
                            onChange={e => setMethod(e.target.value)}
                        >
                            <option value="cash">Cash</option>
                            <option value="card">Card</option>
                            <option value="bank_transfer">Bank Transfer</option>
                            <option value="online">Online</option>
                        </select>
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-border mt-6">
                        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
                        <button type="submit" disabled={loading} className="btn-primary min-w-[100px]">
                            {loading ? 'Saving...' : 'Record Payment'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
