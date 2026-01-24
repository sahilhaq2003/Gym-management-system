const db = require('../config/db');
const sendEmail = require('../utils/emailService');

// Get all available membership plans
exports.getPlans = async (req, res) => {
    try {
        const [plans] = await db.execute('SELECT * FROM membership_plans');
        res.json(plans);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Request a new membership (Member side)
exports.requestMembership = async (req, res) => {
    const { member_id, plan_id, payment_method } = req.body;
    // member_id usually comes from req.user.id if auth is fully implemented, 
    // but we might pass it in body for now if using the mock user context.

    try {
        // 1. Get plan details for price and duration
        const [plans] = await db.execute('SELECT * FROM membership_plans WHERE id = ?', [plan_id]);
        if (plans.length === 0) return res.status(404).json({ message: 'Plan not found' });
        const plan = plans[0];

        // 2. Create active membership
        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + plan.duration_months);

        const [membershipResult] = await db.execute(
            'INSERT INTO memberships (member_id, plan_id, start_date, end_date, status, amount) VALUES (?, ?, ?, ?, "active", ?)',
            [member_id, plan_id, startDate, endDate, plan.price]
        );
        const membershipId = membershipResult.insertId;

        // Update member status to active
        await db.execute('UPDATE members SET status = "active" WHERE id = ?', [member_id]);

        // 3. Create payment record
        await db.execute(
            'INSERT INTO payments (membership_id, member_id, amount, payment_method, invoice_number) VALUES (?, ?, ?, ?, ?)',
            [membershipId, member_id, plan.price, payment_method || 'online', `INV-${Date.now()}`]
        );

        res.status(201).json({ message: 'Membership activated successfully', membershipId });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get pending memberships (Admin side)
exports.getPendingMemberships = async (req, res) => {
    try {
        const [pending] = await db.execute(`
            SELECT m.*, mb.first_name, mb.last_name, p.name as plan_name 
            FROM memberships m
            JOIN members mb ON m.member_id = mb.id
            JOIN membership_plans p ON m.plan_id = p.id
            WHERE m.status = 'pending'
            ORDER BY m.created_at DESC
        `);
        res.json(pending);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Approve membership (Admin side)
exports.approveMembership = async (req, res) => {
    const { id } = req.params; // membership id

    try {
        // Fetch details necessary for processing and email
        const [rows] = await db.execute(`
            SELECT m.member_id, mb.first_name, mb.email, p.name as plan_name, p.duration_months
            FROM memberships m
            JOIN members mb ON m.member_id = mb.id
            JOIN membership_plans p ON m.plan_id = p.id
            WHERE m.id = ?
        `, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Membership not found' });
        }

        const { member_id, first_name, email, plan_name } = rows[0];

        // Update membership status to active
        await db.execute('UPDATE memberships SET status = "active" WHERE id = ?', [id]);

        // Update member status to active (in case they were expired/inactive)
        await db.execute('UPDATE members SET status = "active" WHERE id = ?', [member_id]);

        // Send Approval Email
        if (email) {
            const emailSubject = `🎉 Membership Approved: ${plan_name}`;
            const emailHtml = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Membership Approved</title>
                </head>
                <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;">
                    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); margin-top: 40px; margin-bottom: 40px;">
                        <!-- Header -->
                        <div style="background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">You're All Set!</h1>
                            <p style="margin: 10px 0 0; color: #ede9fe; font-size: 16px;">Your membership is now active</p>
                        </div>

                        <!-- Content -->
                        <div style="padding: 40px 30px;">
                            <h2 style="margin-top: 0; color: #1e293b; font-size: 20px;">Hi ${first_name},</h2>
                            <p style="color: #475569; line-height: 1.6; font-size: 16px;">
                                Great news! Your request for the <strong>${plan_name}</strong> membership has been approved. You now have full access to our gym facilities.
                            </p>

                            <div style="background-color: #f3e8ff; border: 1px solid #d8b4fe; border-radius: 8px; padding: 16px; margin-top: 20px; color: #6b21a8; font-weight: 500;">
                                Note: Your access is valid starting immediately.
                            </div>

                            <!-- CTA Button -->
                            <div style="text-align: center; margin-top: 32px;">
                                <a href="http://localhost:5173/dashboard" style="display: inline-block; background-color: #7c3aed; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; transition: background-color 0.2s; box-shadow: 0 4px 6px -1px rgba(124, 58, 237, 0.2);">
                                    Go to Dashboard
                                </a>
                            </div>
                        </div>

                        <!-- Footer -->
                        <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
                                <p style="margin: 0; color: #94a3b8; font-size: 12px;">&copy; ${new Date().getFullYear()} Gym Management System</p>
                        </div>
                    </div>
                </body>
                </html>
            `;
            sendEmail(email, emailSubject, emailHtml).catch(err => console.error('Failed to send approval email:', err));
        }

        res.json({ message: 'Membership approved successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Reject/Cancel membership
exports.rejectMembership = async (req, res) => {
    const { id } = req.params;
    try {
        await db.execute('UPDATE memberships SET status = "cancelled" WHERE id = ?', [id]);
        res.json({ message: 'Membership rejected' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
