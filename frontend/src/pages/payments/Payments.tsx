import { useState, useEffect } from 'react';
import { DollarSign, Download, Plus, Search, Filter, CreditCard } from 'lucide-react';

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

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const data = await apiRequest('/payments');
                setPayments(data);
            } catch (error) {
                console.error('Failed to fetch payments:', error);
            }
        };
        fetchPayments();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Payments</h1>
                    <p className="text-muted-foreground">Manage revenue and invoices.</p>
                </div>
                <button className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium whitespace-nowrap">
                    <Plus className="w-4 h-4" />
                    Record Payment
                </button>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="p-6 bg-card rounded-xl border border-border shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Total Revenue (Monthly)</p>
                            <h3 className="text-2xl font-bold mt-2">$4,250.00</h3>
                        </div>
                        <div className="p-3 rounded-full bg-green-100 text-green-600 dark:bg-green-900/30">
                            <DollarSign className="w-6 h-6" />
                        </div>
                    </div>
                </div>
                <div className="p-6 bg-card rounded-xl border border-border shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Pending Invoices</p>
                            <h3 className="text-2xl font-bold mt-2">5</h3>
                        </div>
                        <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30">
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
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm pl-9"
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
                            {payments.map((payment) => (
                                <tr key={payment.id} className="hover:bg-muted/50 transition-colors">
                                    <td className="px-6 py-4 font-mono text-xs">{payment.invoice_number}</td>
                                    <td className="px-6 py-4 font-medium">{payment.first_name} {payment.last_name}</td>
                                    <td className="px-6 py-4">{new Date(payment.transaction_date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 font-bold text-green-600 dark:text-green-400">
                                        ${payment.amount.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 capitalize">{payment.payment_method}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="p-2 hover:bg-accent rounded-full text-muted-foreground hover:text-foreground transition-colors">
                                            <Download className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
