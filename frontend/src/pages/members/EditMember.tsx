import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, Trash2, Fingerprint } from 'lucide-react';
import { apiRequest } from '../../lib/api';
import { registerFingerprint } from '../../lib/webauthn';

export function EditMember() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    // Initialize with safe defaults, but will populate from API
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        nic: '',
        phone: '',
        dob: '',
        gender: 'male',
        address: '',
        status: 'active'
    });

    useEffect(() => {
        const fetchMember = async () => {
            try {
                const data = await apiRequest(`/members/${id}`);
                // Format DOB for input date if present
                const formattedData = {
                    ...data,
                    dob: data.dob ? new Date(data.dob).toISOString().split('T')[0] : '',
                    // Ensure fields aren't null or undefined for controlled inputs
                    nic: data.nic || '',
                    email: data.email || '',
                    address: data.address || ''
                };
                setFormData(formattedData);
            } catch (error) {
                console.error('Failed to fetch member:', error);
                alert('Could not load member details.');
            }
        };

        if (id) fetchMember();
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await apiRequest(`/members/${id}`, {
                method: 'PUT',
                body: JSON.stringify(formData)
            });
            alert('Member updated successfully!');
            navigate('/members');
        } catch (error) {
            console.error('Failed to update member:', error);
            alert('Failed to update member.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this member? This action cannot be undone.')) return;

        setIsDeleting(true);
        try {
            await apiRequest(`/members/${id}`, {
                method: 'DELETE'
            });
            alert('Member deleted successfully!');
            navigate('/members');
        } catch (error) {
            console.error('Failed to delete member:', error);
            alert('Failed to delete member. They may have related payments or records.');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleRegisterFingerprint = async () => {
        if (!id) return;
        try {
            await registerFingerprint(parseInt(id));
            alert('Fingerprint registered successfully!');
        } catch (error) {
            console.error(error);
            alert('Fingerprint registration failed. See console.');
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
                <div className="flex-1">
                    <h1 className="text-2xl font-bold tracking-tight">Edit Member</h1>
                    <p className="text-muted-foreground">Manage details for {formData.first_name} {formData.last_name}</p>
                </div>
                <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                >
                    {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    Delete Member
                </button>
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
                            <label htmlFor="nic" className="text-sm font-medium">NIC</label>
                            <input
                                id="nic"
                                name="nic"
                                className="w-full px-3 py-2 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                                value={formData.nic}
                                onChange={handleChange}
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

                        <div className="space-y-2">
                            <label htmlFor="status" className="text-sm font-medium">Status</label>
                            <select
                                id="status"
                                name="status"
                                className="w-full px-3 py-2 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                                value={formData.status}
                                onChange={handleChange}
                            >
                                <option value="active">Active</option>
                                <option value="expired">Expired</option>
                                <option value="inactive">Inactive</option>
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

                    {/* Fingerprint Management Section */}
                    <div className="p-4 border border-border rounded-lg bg-background/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-full text-primary">
                                <Fingerprint className="h-5 w-5" />
                            </div>
                            <div>
                                <h4 className="font-medium text-sm">Biometric Authentication</h4>
                                <p className="text-xs text-muted-foreground">Manage fingerprint for attendance</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={handleRegisterFingerprint}
                            className="text-sm font-medium text-primary hover:underline"
                        >
                            Register New Fingerprint
                        </button>
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
                            Update Member
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
