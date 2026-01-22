import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';

import { apiRequest } from '../../lib/api';

import { registerFingerprint } from '../../lib/webauthn';
import { Fingerprint } from 'lucide-react';

export function AddMember() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [registerBiometrics, setRegisterBiometrics] = useState(true);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        nic: '',
        phone: '',
        dob: '',
        gender: 'male',
        address: '',
        plan: '1_month'
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // 1. Create Member
            const data = await apiRequest('/members', {
                method: 'POST',
                body: JSON.stringify(formData)
            });

            // 2. Register Fingerprint (if unchecked, just skip)
            if (registerBiometrics && data.id) {
                try {
                    await registerFingerprint(data.id);
                    // alert('Fingerprint registered successfully!');
                } catch (bioError) {
                    console.error('Fingerprint registration failed:', bioError);
                    alert('Member created, but fingerprint registration failed. Please try from member profile.');
                }
            }

            navigate('/members');
        } catch (error) {
            console.error('Failed to create member:', error);
            alert('Failed to create member. Please check details.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/members')}
                    className="p-2 hover:bg-accent rounded-full transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Add New Member</h1>
                    <p className="text-muted-foreground">Fill in the details to register a new member.</p>
                </div>
            </div>

            <div className="bg-card border border-border rounded-xl shadow-sm p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label htmlFor="first_name" className="text-sm font-medium">First Name *</label>
                            <input
                                id="first_name"
                                name="first_name"
                                required
                                className="w-full px-3 py-2 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                                value={formData.first_name}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="last_name" className="text-sm font-medium">Last Name *</label>
                            <input
                                id="last_name"
                                name="last_name"
                                required
                                className="w-full px-3 py-2 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                                value={formData.last_name}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium">Email</label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                className="w-full px-3 py-2 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="nic" className="text-sm font-medium">NIC (National Identity Card)</label>
                            <input
                                id="nic"
                                name="nic"
                                className="w-full px-3 py-2 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                                value={formData.nic}
                                onChange={handleChange}
                                placeholder="Used as password for login"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="phone" className="text-sm font-medium">Phone Number *</label>
                            <input
                                id="phone"
                                type="tel"
                                name="phone"
                                required
                                className="w-full px-3 py-2 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                                value={formData.phone}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="dob" className="text-sm font-medium">Date of Birth</label>
                            <input
                                id="dob"
                                type="date"
                                name="dob"
                                className="w-full px-3 py-2 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                                value={formData.dob}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="gender" className="text-sm font-medium">Gender</label>
                            <select
                                id="gender"
                                name="gender"
                                className="w-full px-3 py-2 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                                value={formData.gender}
                                onChange={handleChange}
                            >
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="address" className="text-sm font-medium">Address</label>
                        <textarea
                            id="address"
                            name="address"
                            rows={3}
                            className="w-full px-3 py-2 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                            value={formData.address}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="plan" className="text-sm font-medium">Membership Plan</label>
                        <select
                            id="plan"
                            name="plan"
                            className="w-full px-3 py-2 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                            value={formData.plan}
                            onChange={handleChange}
                        >
                            <option value="1_month">1 Month</option>
                            <option value="3_months">3 Months</option>
                            <option value="6_months">6 Months</option>
                            <option value="annual">Annual</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2 p-4 border border-border rounded-lg bg-background/50">
                        <input
                            type="checkbox"
                            id="biometrics"
                            checked={registerBiometrics}
                            onChange={(e) => setRegisterBiometrics(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <label htmlFor="biometrics" className="text-sm font-medium flex items-center gap-2 cursor-pointer">
                            <Fingerprint className="h-4 w-4 text-muted-foreground" />
                            Enroll Fingerprint Now (Recommended for Attendance)
                        </label>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-border">
                        <button
                            type="button"
                            onClick={() => navigate('/members')}
                            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent rounded-md transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-md shadow-sm transition-colors disabled:opacity-50"
                        >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Save Member
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
