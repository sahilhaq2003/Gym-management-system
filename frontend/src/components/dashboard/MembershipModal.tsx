import { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { apiRequest } from '../../lib/api';

interface Plan {
    id: number;
    name: string;
    price: number;
    duration_months: number;
    description: string;
}

export function MembershipModal({ isOpen, onClose, memberId }: { isOpen: boolean; onClose: () => void; memberId: number }) {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            apiRequest('/memberships/plans')
                .then(setPlans)
                .catch(console.error);
        }
    }, [isOpen]);

    const handlePurchase = async () => {
        if (!selectedPlan) return;
        setLoading(true);
        try {
            // 1. Get Payment Params from Backend
            const response = await apiRequest('/payments/payhere/initiate', {
                method: 'POST',
                body: JSON.stringify({
                    member_id: memberId,
                    plan_id: selectedPlan
                })
            });

            // 2. Submit Form to PayHere
            // Determine URL based on sandbox flag
            const actionUrl = response.sandbox
                ? 'https://sandbox.payhere.lk/pay/checkout'
                : 'https://www.payhere.lk/pay/checkout';

            const form = document.createElement('form');
            form.setAttribute('method', 'POST');
            form.setAttribute('action', actionUrl);

            // Add all PayHere parameters as hidden inputs
            Object.keys(response).forEach(key => {
                // Skip internal flags not meant for the form
                if (key === 'sandbox') return;

                const input = document.createElement('input');
                input.setAttribute('type', 'hidden');
                input.setAttribute('name', key);
                input.setAttribute('value', String(response[key]));
                form.appendChild(input);
            });

            document.body.appendChild(form);
            form.submit();

            // Note: Page will redirect, so no need to close modal or stop loading manually
        } catch (error) {
            console.error('Purchase failed', error);
            alert('Failed to initiate payment.');
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-card w-full max-w-lg rounded-xl border border-border shadow-xl p-6 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
                    <X className="w-5 h-5" />
                </button>

                <h2 className="text-xl font-bold mb-1">Select Membership Plan</h2>
                <p className="text-sm text-muted-foreground mb-6">Choose a plan that fits your goals.</p>

                <div className="space-y-3 mb-6">
                    {plans.map(plan => (
                        <div
                            key={plan.id}
                            onClick={() => setSelectedPlan(plan.id)}
                            className={`p-4 rounded-lg border cursor-pointer transition-all ${selectedPlan === plan.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border hover:border-primary/50'}`}
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="font-semibold">{plan.name}</h3>
                                    <p className="text-sm text-muted-foreground">{plan.duration_months} Month{plan.duration_months > 1 ? 's' : ''}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-lg">Rs. {plan.price.toLocaleString()}</p>
                                    {selectedPlan === plan.id && <Check className="w-5 h-5 text-primary inline-block" />}
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">{plan.description}</p>
                        </div>
                    ))}
                </div>

                <div className="flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted rounded-lg">Cancel</button>
                    <button
                        onClick={handlePurchase}
                        disabled={!selectedPlan || loading}
                        className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg disabled:opacity-50"
                    >
                        {loading ? 'Processing...' : 'Pay & Update'}
                    </button>
                </div>
            </div>
        </div>
    );
}
