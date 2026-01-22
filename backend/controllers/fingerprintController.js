const { generateRegistrationOptions, verifyRegistrationResponse, generateAuthenticationOptions, verifyAuthenticationResponse } = require('@simplewebauthn/server');
const db = require('../config/db');

// In-memory store for challenges (Use Redis/DB in production)
const currentChallenges = {};

const rpName = 'Gym Management System';
const rpID = 'localhost'; // Change this in production
const origin = 'http://localhost:5173'; // Change this in production

exports.generateRegistrationOptions = async (req, res) => {
    const { memberId } = req.body;

    try {
        const [members] = await db.execute('SELECT * FROM members WHERE id = ?', [memberId]);
        if (members.length === 0) return res.status(404).json({ message: 'Member not found' });
        const member = members[0];

        const [credentials] = await db.execute('SELECT * FROM biometric_credentials WHERE member_id = ?', [memberId]);

        const options = await generateRegistrationOptions({
            rpName,
            rpID,
            userID: `${member.id}`,
            userName: member.email || `member-${member.id}`,
            // Don't exclude credentials, so we can add multiple fingers if needed, but typically we exclude existing:
            // excludeCredentials: credentials.map(cred => ({
            //     id: cred.id,
            //     transports: cred.transports ? JSON.parse(cred.transports) : undefined,
            // })),
            authenticatorSelection: {
                residentKey: 'discouraged', // 'required' for passwordless
                userVerification: 'preferred',
                authenticatorAttachment: 'platform', // Limit to platform (TouchID/Hello) for "laptop sensor"
            },
        });

        currentChallenges[member.id] = options.challenge;

        res.json(options);
    } catch (error) {
        console.error('Error generating registration options:', error);
        res.status(500).json({ message: 'Failed to generate options', error: error.message });
    }
};

exports.verifyRegistration = async (req, res) => {
    const { memberId, response } = req.body;

    try {
        const expectedChallenge = currentChallenges[memberId];
        if (!expectedChallenge) return res.status(400).json({ message: 'Challenge expired or not found' });

        const verification = await verifyRegistrationResponse({
            response,
            expectedChallenge,
            expectedOrigin: origin,
            expectedRPID: rpID,
        });

        if (verification.verified && verification.registrationInfo) {
            const { credentialID, credentialPublicKey, counter } = verification.registrationInfo;

            // Save to DB
            await db.execute(
                'INSERT INTO biometric_credentials (id, member_id, public_key, counter, attestation_type) VALUES (?, ?, ?, ?, ?)',
                [
                    credentialID, // Base64URL encoded ID is returned by library usually, but let's ensure format
                    memberId,
                    Buffer.from(credentialPublicKey).toString('base64'), // Store as base64
                    counter,
                    'none' // simplistic
                ]
            );

            delete currentChallenges[memberId];
            res.json({ verified: true });
        } else {
            res.status(400).json({ verified: false, message: 'Verification failed' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during verification', error: error.message });
    }
};

// --- Authentication (Check-in) ---

exports.generateAuthOptions = async (req, res) => {
    // For passwordless/1-touch, we might not know the user ID yet if using resident keys.
    // But typically for "Scan Fingerprint" button, we might ask for ID first OR iterate all? 
    // Actually, for a specific member login/checkin, we usually want to identify them first or use resident keys.
    // Simplifying: Assume we claim "Check In" for a specific Member ID (simulated kiosk flow selection) 
    // OR we just do an empty allowCredentials for discoverable credentials? 
    // Let's implement "Check In for Member X" first as it is easier.

    // Actually user said "use my laptop fingerprint sensor for test".
    // Let's assume we picked a member from the list to "Test Check-in".

    // Improved Flow: "Identify User via Fingerprint" (Resident Key) is harder without specific setup.
    // Let's stick to: Enter ID/Email -> Click Scan -> Check In. 
    // OR: Just "Scan" button on the "Add Member" page to test IT works.

    // Handling "Test" flow:
    const { memberId } = req.body;

    try {
        const [credentials] = await db.execute('SELECT * FROM biometric_credentials WHERE member_id = ?', [memberId]);
        if (credentials.length === 0) return res.status(400).json({ message: 'No fingerprints registered' });

        const options = await generateAuthenticationOptions({
            rpID,
            allowCredentials: credentials.map(cred => ({
                id: cred.id, // Ensure this matches the format saved (base64url)
                type: 'public-key',
            })),
            userVerification: 'preferred',
        });

        currentChallenges[`auth-${memberId}`] = options.challenge;
        res.json(options);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

exports.verifyAuth = async (req, res) => {
    const { memberId, response } = req.body;

    try {
        const expectedChallenge = currentChallenges[`auth-${memberId}`];
        if (!expectedChallenge) return res.status(400).json({ message: 'Challenge expired' });

        const [credentials] = await db.execute('SELECT * FROM biometric_credentials WHERE id = ?', [response.id]);
        if (credentials.length === 0) return res.status(400).json({ message: 'Credential not found' });

        const credential = credentials[0];

        const verification = await verifyAuthenticationResponse({
            response,
            expectedChallenge,
            expectedOrigin: origin,
            expectedRPID: rpID,
            authenticator: {
                credentialPublicKey: Buffer.from(credential.public_key, 'base64'),
                credentialID: credential.id,
                counter: credential.counter,
            },
        });

        if (verification.verified) {
            const { newCounter } = verification.authenticationInfo;
            // Update counter
            await db.execute('UPDATE biometric_credentials SET counter = ? WHERE id = ?', [newCounter, credential.id]);

            const type = req.body.type || 'in'; // Default to 'in' if not specified

            if (type === 'in') {
                await db.execute('INSERT INTO attendance (member_id, method, date, check_in_time) VALUES (?, ?, CURDATE(), NOW())', [memberId, 'fingerprint']);
            } else {
                // Check-out logic
                const [rows] = await db.execute(
                    'SELECT id FROM attendance WHERE member_id = ? AND date = CURDATE() AND check_out_time IS NULL ORDER BY check_in_time DESC LIMIT 1',
                    [memberId]
                );

                if (rows.length > 0) {
                    await db.execute('UPDATE attendance SET check_out_time = NOW() WHERE id = ?', [rows[0].id]);
                } else {
                    // If trying to check out but no check in found? 
                    // For now, let's treat it as a new record or ignore. 
                    // Let's return a specific message if possible, but the frontend expects 'verified: true'.
                    // We'll optionally return a message.
                }
            }

            delete currentChallenges[`auth-${memberId}`];
            res.json({ verified: true, type });
        } else {
            res.status(400).json({ verified: false });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};
