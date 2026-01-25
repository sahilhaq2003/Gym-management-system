import { useEffect, useState } from 'react';
import { apiRequest } from '../../lib/api';
import { Receipt, Calendar, CreditCard, ChevronRight, Download } from 'lucide-react';

interface Payment {
    id: number;
    invoice_number: string;
    amount: number;
    payment_method: string;
    created_at: string;
    status: string;
}

const currencyFormatter = new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    maximumFractionDigits: 0,
});

export function MemberPaymentHistory({ memberId }: { memberId: number }) {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (memberId) {
            setLoading(true);
            apiRequest(`/payments/member/${memberId}`)
                .then(data => setPayments(data))
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [memberId]);

    if (loading) {
        return <div className="animate-pulse h-48 bg-muted/20 rounded-2xl" />;
    }

    // Limit to recent 5 payments for the dashboard view
    const recentPayments = payments.slice(0, 5);

    return (
        <div className="rounded-2xl border border-border/60 bg-card/95 shadow-soft overflow-hidden">
            <div className="p-5 border-b border-border/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-600">
                        <Receipt className="h-5 w-5" />
                    </div>
                    <h3 className="font-semibold text-foreground">Billing History</h3>
                </div>
                {payments.length > 5 && (
                    <button className="text-xs font-medium text-emerald-600 hover:text-emerald-500 transition-colors flex items-center gap-1">
                        View All <ChevronRight className="w-3 h-3" />
                    </button>
                )}
            </div>

            <div className="divide-y divide-border/50">
                {recentPayments.length > 0 ? (
                    recentPayments.map((payment) => (
                        <div key={payment.id} className="group p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                            <div className="flex flex-col gap-1">
                                <span className="text-sm font-medium text-foreground flex items-center gap-2">
                                    {payment.invoice_number}
                                    <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-bold">
                                        Paid
                                    </span>
                                </span>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(payment.created_at).toLocaleDateString()}
                                    </span>
                                    <span className="flex items-center gap-1 capitalize">
                                        <CreditCard className="w-3 h-3" />
                                        {payment.payment_method}
                                    </span>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <span className="font-bold text-emerald-600">
                                    {currencyFormatter.format(payment.amount)}
                                </span>
                                <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-muted-foreground hover:text-primary">
                                    <Download className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="p-8 text-center">
                        <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-muted mb-3">
                            <Receipt className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <p className="text-sm font-medium text-foreground">No payments yet</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Your payment history will appear here.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
