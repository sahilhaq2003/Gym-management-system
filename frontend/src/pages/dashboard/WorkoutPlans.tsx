import { useState, useEffect } from 'react';
import { Plus, Trash2, UserPlus, Dumbbell, Check } from 'lucide-react';
import { apiRequest } from '../../lib/api';

interface WorkoutPlan {
    id: number;
    name: string;
    description: string;
    difficulty_level: string;
    items?: any[];
}

export function WorkoutPlans() {
    const [plans, setPlans] = useState<WorkoutPlan[]>([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            const data = await apiRequest('/workout-plans');
            setPlans(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure? This cannot be undone.')) return;
        await apiRequest(`/workout-plans/${id}`, { method: 'DELETE' });
        fetchPlans();
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">Workout Plans</h1>
                    <p className="text-muted-foreground">Manage templates and assign routines to members.</p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                >
                    <Plus className="w-4 h-4" />
                    Create New Plan
                </button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {plans.map(plan => (
                    <div key={plan.id} className="card-surface p-6 flex flex-col justify-between group hover:border-primary/30 transition-colors">
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-primary/10 text-primary rounded-xl">
                                    <Dumbbell className="w-6 h-6" />
                                </div>
                                <div className={`text-xs font-semibold px-2 py-1 rounded-full ${plan.difficulty_level === 'Beginner' ? 'bg-green-500/10 text-green-500' :
                                    plan.difficulty_level === 'Intermediate' ? 'bg-orange-500/10 text-orange-500' :
                                        'bg-red-500/10 text-red-500'
                                    }`}>
                                    {plan.difficulty_level}
                                </div>
                            </div>
                            <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{plan.description}</p>

                            <div className="space-y-2 mb-6">
                                {plan.items?.slice(0, 3).map((item: any, i: number) => (
                                    <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary/50" />
                                        <span className="font-mono uppercase text-[10px] w-8">{item.day_of_week}</span>
                                        <span className="truncate">{item.activity}</span>
                                    </div>
                                ))}
                                {(plan.items?.length || 0) > 3 && (
                                    <p className="text-xs text-muted-foreground italic pl-3">+ {plan.items!.length - 3} more exercises</p>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-2 mt-4 pt-4 border-t border-border/40">
                            <button
                                onClick={() => { setSelectedPlanId(plan.id); setIsAssignModalOpen(true); }}
                                className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
                            >
                                <UserPlus className="w-4 h-4" />
                                Assign
                            </button>
                            <button
                                onClick={() => handleDelete(plan.id)}
                                className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {isCreateModalOpen && <CreatePlanModal onClose={() => setIsCreateModalOpen(false)} onSuccess={fetchPlans} />}
            {isAssignModalOpen && selectedPlanId && <AssignPlanModal planId={selectedPlanId} onClose={() => setIsAssignModalOpen(false)} />}
        </div>
    );
}

function CreatePlanModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [difficulty, setDifficulty] = useState('Beginner');
    const [items, setItems] = useState<any[]>([]);

    // Temporary state for adding an item
    const [newItem, setNewItem] = useState({ day: 'Mon', activity: '', type: 'Gym' });

    const handleAddItem = () => {
        if (!newItem.activity) return;
        setItems(prev => [...prev, { day_of_week: newItem.day, activity: newItem.activity, type: newItem.type }]);
        setNewItem(prev => ({ ...prev, activity: '' }));
    };

    const handleSubmit = async () => {
        try {
            await apiRequest('/workout-plans', {
                method: 'POST',
                body: JSON.stringify({ name, description, difficulty, items })
            });
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            alert('Failed to create plan');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-card w-full max-w-2xl rounded-xl border border-border shadow-xl p-6 max-h-[90vh] overflow-y-auto custom-scrollbar">
                <h2 className="text-xl font-bold mb-4">Create Workout Plan</h2>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <input className="input-field" placeholder="Plan Name" value={name} onChange={e => setName(e.target.value)} />
                        <select className="input-field" value={difficulty} onChange={e => setDifficulty(e.target.value)}>
                            <option>Beginner</option>
                            <option>Intermediate</option>
                            <option>Advanced</option>
                        </select>
                    </div>
                    <textarea className="input-field min-h-[80px]" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />

                    <div className="border border-border/50 rounded-lg p-4 bg-muted/20">
                        <h4 className="font-semibold text-sm mb-3">Add Exercises</h4>
                        <div className="flex gap-2 mb-4">
                            <select className="input-field w-24" value={newItem.day} onChange={e => setNewItem({ ...newItem, day: e.target.value })}>
                                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => <option key={d}>{d}</option>)}
                            </select>
                            <input className="input-field flex-1" placeholder="Activity (e.g. Bench Press)" value={newItem.activity} onChange={e => setNewItem({ ...newItem, activity: e.target.value })} />
                            <select className="input-field w-24" value={newItem.type} onChange={e => setNewItem({ ...newItem, type: e.target.value })}>
                                <option>Gym</option>
                                <option>Class</option>
                            </select>
                            <button onClick={handleAddItem} className="p-2 bg-primary text-primary-foreground rounded-lg"><Plus className="w-5 h-5" /></button>
                        </div>

                        <div className="space-y-2 max-h-[150px] overflow-y-auto">
                            {items.map((item, i) => (
                                <div key={i} className="flex items-center justify-between text-sm bg-background p-2 rounded border border-border/50">
                                    <span><span className="font-bold w-8 inline-block">{item.day_of_week}</span> {item.activity}</span>
                                    <button onClick={() => setItems(items.filter((_, idx) => idx !== i))} className="text-destructive"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button onClick={onClose} className="btn-secondary">Cancel</button>
                        <button onClick={handleSubmit} className="btn-primary">Create Plan</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function AssignPlanModal({ planId, onClose }: { planId: number; onClose: () => void }) {
    const [members, setMembers] = useState<any[]>([]);
    const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

    useEffect(() => {
        apiRequest('/members').then(setMembers).catch(console.error);
    }, []);

    const toggleMember = (id: string) => {
        setSelectedMembers(prev =>
            prev.includes(id) ? prev.filter(mid => mid !== id) : [...prev, id]
        );
    };

    const handleAssign = async () => {
        if (selectedMembers.length === 0) return;
        try {
            await apiRequest('/workout-plans/assign', {
                method: 'POST',
                body: JSON.stringify({ planId, memberIds: selectedMembers })
            });
            alert('Plan assigned successfully to selected members!');
            onClose();
        } catch (error) {
            console.error(error);
            alert('Failed to assign plan');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-card w-full max-w-md rounded-xl border border-border shadow-xl p-6 flex flex-col max-h-[90vh]">
                <h2 className="text-xl font-bold mb-2">Assign Plan to Members</h2>
                <p className="text-sm text-muted-foreground mb-4">Select members to assign this workout plan to.</p>

                <div className="flex-1 overflow-y-auto custom-scrollbar border border-border/50 rounded-lg bg-muted/10 p-2 mb-6">
                    {members.map(m => (
                        <div
                            key={m.id}
                            onClick={() => toggleMember(String(m.id))}
                            className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${selectedMembers.includes(String(m.id))
                                ? 'bg-primary/10 border-primary/20'
                                : 'hover:bg-muted/50'
                                }`}
                        >
                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedMembers.includes(String(m.id))
                                ? 'bg-primary border-primary text-primary-foreground'
                                : 'border-muted-foreground'
                                }`}>
                                {selectedMembers.includes(String(m.id)) && <Check className="w-3 h-3" />}
                            </div>
                            <span className="text-sm font-medium">{m.first_name} {m.last_name}</span>
                        </div>
                    ))}
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-border/40">
                    <span className="text-xs text-muted-foreground">{selectedMembers.length} selected</span>
                    <div className="flex gap-3">
                        <button onClick={onClose} className="btn-secondary">Cancel</button>
                        <button
                            onClick={handleAssign}
                            disabled={selectedMembers.length === 0}
                            className="btn-primary"
                        >
                            Assign
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
