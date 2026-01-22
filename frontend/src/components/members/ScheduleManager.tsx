import { useState, useEffect } from 'react';
import { Plus, Trash2, Calendar, Clock, Dumbbell } from 'lucide-react';
import { apiRequest } from '../../lib/api';

interface ScheduleItem {
    id: number;
    day_of_week: string;
    activity: string;
    time: string;
    type: 'Gym' | 'Class';
    trainer?: string;
}

export function ScheduleManager({ memberId }: { memberId: string | undefined }) {
    const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
    const [newItem, setNewItem] = useState({
        day_of_week: 'Mon',
        activity: '',
        time: '',
        type: 'Gym',
        trainer: ''
    });

    useEffect(() => {
        if (memberId) fetchSchedule();
    }, [memberId]);

    const fetchSchedule = async () => {
        try {
            const data = await apiRequest(`/members/${memberId}/schedule`);
            // Handle new response format { schedule: [], plan: {} }
            const scheduleData = Array.isArray(data) ? data : (data.schedule || []);
            setSchedule(Array.isArray(scheduleData) ? scheduleData : []);
        } catch (error) {
            console.error('Failed to fetch schedule:', error);
        }
    };

    const handleAdd = async () => {
        if (!memberId || !newItem.activity || !newItem.time) return;

        try {
            await apiRequest(`/members/${memberId}/schedule`, {
                method: 'POST',
                body: JSON.stringify({
                    day: newItem.day_of_week,
                    activity: newItem.activity,
                    time: newItem.time,
                    type: newItem.type,
                    trainer: newItem.trainer
                })
            });
            fetchSchedule();
            setNewItem(prev => ({ ...prev, activity: '', time: '', trainer: '' }));
        } catch (error) {
            console.error('Failed to add schedule item:', error);
        }
    };

    const handleDelete = async (itemId: number) => {
        if (!memberId) return;
        try {
            await apiRequest(`/members/${memberId}/schedule/${itemId}`, {
                method: 'DELETE'
            });
            setSchedule(prev => prev.filter(item => item.id !== itemId));
        } catch (error) {
            console.error('Failed to delete item:', error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3 p-4 bg-muted/30 rounded-lg border border-border/60">
                <select
                    className="p-2 rounded-md bg-background border border-border text-sm"
                    value={newItem.day_of_week}
                    onChange={e => setNewItem({ ...newItem, day_of_week: e.target.value })}
                >
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                        <option key={day} value={day}>{day}</option>
                    ))}
                </select>
                <input
                    placeholder="Activity (e.g. Leg Day)"
                    className="md:col-span-2 p-2 rounded-md bg-background border border-border text-sm"
                    value={newItem.activity}
                    onChange={e => setNewItem({ ...newItem, activity: e.target.value })}
                />
                <input
                    type="time"
                    className="p-2 rounded-md bg-background border border-border text-sm"
                    value={newItem.time}
                    onChange={e => setNewItem({ ...newItem, time: e.target.value })}
                />
                <select
                    className="p-2 rounded-md bg-background border border-border text-sm"
                    value={newItem.type}
                    onChange={e => setNewItem({ ...newItem, type: e.target.value as 'Gym' | 'Class' })}
                >
                    <option value="Gym">Gym</option>
                    <option value="Class">Class</option>
                </select>
                <button
                    onClick={handleAdd}
                    className="flex items-center justify-center bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                    <Plus className="w-4 h-4 mr-1" /> Add
                </button>
            </div>

            <div className="space-y-2">
                {schedule.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No schedule set for this member.</p>
                ) : (
                    schedule.map(item => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-card border border-border/50 rounded-lg group">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center font-bold text-sm text-primary">
                                    {item.day_of_week.substring(0, 3)}
                                </div>
                                <div>
                                    <h4 className="font-medium text-sm">{item.activity}</h4>
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> {item.time}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            {item.type === 'Class' ? <Calendar className="w-3 h-3" /> : <Dumbbell className="w-3 h-3" />}
                                            {item.type}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => handleDelete(item.id)}
                                className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
