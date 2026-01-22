import { startRegistration } from '@simplewebauthn/browser';

const API_URL = 'http://localhost:5000/api/biometrics';

export async function checkSupport() {
    return await startRegistration ? true : false;
}

export async function registerFingerprint(memberId: number) {
    try {
        // 1. Get options from server
        const resp = await fetch(`${API_URL}/register/options`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ memberId })
        });

        if (!resp.ok) throw new Error('Failed to get registration options');
        const options = await resp.json();

        // 2. Browser interaction (Fingerprint prompt)
        const attResp = await startRegistration(options);

        // 3. Verify with server
        const verifyResp = await fetch(`${API_URL}/register/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ memberId, response: attResp })
        });

        if (!verifyResp.ok) {
            const err = await verifyResp.json();
            throw new Error(err.message || 'Verification failed');
        }

        return await verifyResp.json();
    } catch (error) {
        console.error('Registration failed', error);
        throw error;
    }
}
