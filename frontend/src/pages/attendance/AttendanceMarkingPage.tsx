import { useState } from 'react';
import { Fingerprint, User, CheckCircle2, AlertCircle, Loader2, LogOut, ArrowLeft } from 'lucide-react';
import { apiRequest } from '../../lib/api';
import { startAuthentication } from '@simplewebauthn/browser';
import { useNavigate } from 'react-router-dom';

export function AttendanceMarkingPage() {
    const [memberId, setMemberId] = useState('');
    const [status, setStatus] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const [memberData, setMemberData] = useState<{ name: string, status: string } | null>(null);
    const navigate = useNavigate();
    const [attendanceType, setAttendanceType] = useState<'in' | 'out'>('in');

    const handleFingerprintCheckIn = async () => {
        if (!memberId) {
            setStatus('error');
            setMessage('Please enter a Member ID to identify yourself.');
            return;
        }

        setStatus('scanning');
        setMessage(`Bio-scan for Check-${attendanceType === 'in' ? 'IN' : 'OUT'}...`);
        setMemberData(null);

        try {
            // 1. Get Options
            const options = await apiRequest('/biometrics/auth/options', {
                method: 'POST',
                body: JSON.stringify({ memberId })
            });

            // 2. Perform Browser Auth
            const asseResp = await startAuthentication(options);

            // 3. Verify
            const verifyResp = await apiRequest('/biometrics/auth/verify', {
                method: 'POST',
                body: JSON.stringify({ memberId, response: asseResp, type: attendanceType })
            });

            if (verifyResp.verified) {
                setStatus('success');
                setMessage(`Fingerprint verified! Checked ${attendanceType.toUpperCase()} successfully.`);
            } else {
                throw new Error('Verification failed');
            }
        } catch (error: any) {
            console.error(error);
            setStatus('error');
            setMessage(error.message || 'Authentication failed. Please try again.');
        }
    };

    const handleManualCheckIn = async () => {
        if (!memberId) {
            setStatus('error');
            setMessage('Please enter a Member ID.');
            return;
        }

        setStatus('scanning');
        setMessage(`Processing Check-${attendanceType === 'in' ? 'IN' : 'OUT'}...`);
        setMemberData(null);

        try {
            const data = await apiRequest('/attendance/mark', {
                method: 'POST',
                body: JSON.stringify({ memberId, type: attendanceType })
            });
            setStatus('success');
            setMessage(data.message);
            if (data.member) {
                setMemberData(data.member);
            }
        } catch (error: any) {
            console.error(error);
            setStatus('error');
            setMessage(error.message || 'Action failed.');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground animate-in fade-in zoom-in duration-500 relative">
            <button
                onClick={() => navigate('/')}
                className="absolute top-4 left-4 p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full transition-colors"
            >
                <ArrowLeft className="w-6 h-6" />
            </button>

            <div className="w-full max-w-md space-y-8 px-4">
                <div className="text-center space-y-2">
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-glow mb-4">
                        <Fingerprint className="h-8 w-8" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">Express Check-in</h1>
                    <p className="text-muted-foreground">Self-service Attendance Kiosk</p>
                </div>

                <div className="rounded-2xl border border-border/60 bg-card/50 p-6 shadow-xl backdrop-blur-xl">
                    <div className="space-y-6">

                        {/* Type Toggle */}
                        <div className="grid grid-cols-2 gap-2 p-1 bg-muted/50 rounded-xl">
                            <button
                                onClick={() => setAttendanceType('in')}
                                className={`flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all ${attendanceType === 'in'
                                    ? 'bg-emerald-500 text-white shadow-md'
                                    : 'text-muted-foreground hover:bg-background/50'
                                    }`}
                            >
                                <CheckCircle2 className="h-4 w-4" />
                                Check IN
                            </button>
                            <button
                                onClick={() => setAttendanceType('out')}
                                className={`flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all ${attendanceType === 'out'
                                    ? 'bg-orange-500 text-white shadow-md'
                                    : 'text-muted-foreground hover:bg-background/50'
                                    }`}
                            >
                                <LogOut className="h-4 w-4" />
                                Check OUT
                            </button>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Member ID
                            </label>
                            <input
                                type="text"
                                placeholder="enter ID..."
                                value={memberId}
                                onChange={(e) => {
                                    setMemberId(e.target.value);
                                    if (status === 'error') setStatus('idle');
                                }}
                                className="flex h-12 w-full rounded-xl border border-input bg-background/50 px-4 py-2 text-lg ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-center font-mono tracking-widest"
                                autoFocus
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={handleFingerprintCheckIn}
                                disabled={status === 'scanning'}
                                className="flex flex-col items-center justify-center gap-2 h-24 rounded-xl border-2 border-dashed border-border/60 bg-muted/20 hover:bg-primary/5 hover:border-primary/50 transition-all disabled:opacity-50"
                            >
                                <Fingerprint className="h-6 w-6 text-primary" />
                                <span className="text-sm font-medium">Bio Scan</span>
                            </button>

                            <button
                                onClick={handleManualCheckIn}
                                disabled={status === 'scanning'}
                                className="flex flex-col items-center justify-center gap-2 h-24 rounded-xl border-2 border-dashed border-border/60 bg-muted/20 hover:bg-primary/5 hover:border-primary/50 transition-all disabled:opacity-50"
                            >
                                <User className="h-6 w-6 text-blue-500" />
                                <span className="text-sm font-medium">ID Enter</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Status Feedback */}
                {status !== 'idle' && (
                    <div className={`rounded-xl p-4 flex items-start gap-3 transition-all duration-300 ${status === 'error' ? 'bg-destructive/10 text-destructive' :
                        status === 'success' ? 'bg-emerald-500/10 text-emerald-600' :
                            'bg-primary/10 text-primary'
                        }`}>
                        {status === 'scanning' && <Loader2 className="h-5 w-5 animate-spin shrink-0" />}
                        {status === 'success' && <CheckCircle2 className="h-5 w-5 shrink-0" />}
                        {status === 'error' && <AlertCircle className="h-5 w-5 shrink-0" />}

                        <div className="flex-1">
                            <p className="font-medium text-sm">{message}</p>
                            {memberData && status === 'success' && (
                                <div className="mt-2 text-xs opacity-90">
                                    <p>Welcome, <span className="font-bold">{memberData.name}</span></p>
                                    <p className="mt-1 uppercase tracking-wider text-[10px] opacity-70">Status: {memberData.status}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
