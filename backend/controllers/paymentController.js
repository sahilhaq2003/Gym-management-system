const db = require('../config/db');
const sendEmail = require('../utils/emailService');

exports.getAllPayments = async (req, res) => {
    try {
        const [payments] = await db.execute(`
      SELECT p.*, m.first_name, m.last_name, m.email 
      FROM payments p 
      JOIN members m ON p.member_id = m.id 
      ORDER BY p.created_at DESC
    `);
        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.createPayment = async (req, res) => {
    // membership_id in body is now optional, plan_id is used to create new membership
    const { member_id, plan_id, amount, payment_method } = req.body;

    if (!member_id || !amount || !payment_method) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    const connection = await db.getConnection();
    let memberDetails = null;
    let planName = 'General Payment';

    try {
        // Fetch member details first (can be done outside transaction for reading)
        const [members] = await connection.execute('SELECT first_name, last_name, email FROM members WHERE id = ?', [member_id]);
        if (members.length > 0) {
            memberDetails = members[0];
        }

        await connection.beginTransaction();

        let finalMembershipId = null;

        // If a plan is selected, create a new membership record
        if (plan_id) {
            // 1. Get Plan Details
            const [plans] = await connection.execute('SELECT * FROM membership_plans WHERE id = ?', [plan_id]);
            if (plans.length === 0) throw new Error('Invalid Plan ID');
            const plan = plans[0];
            planName = plan.name;

            // 2. Calculate Dates
            const startDate = new Date();
            const endDate = new Date();
            endDate.setMonth(endDate.getMonth() + plan.duration_months);

            // 3. Create Membership Record
            const [memResult] = await connection.execute(
                'INSERT INTO memberships (member_id, plan_id, start_date, end_date, amount, status) VALUES (?, ?, ?, ?, ?, ?)',
                [member_id, plan_id, startDate, endDate, amount, 'active']
            );
            finalMembershipId = memResult.insertId;
        }

        // Generate Invoice Number
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const randomSuffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        const invoice_number = `INV-${dateStr}-${randomSuffix}`;

        // Create Payment Record
        const [result] = await connection.execute(
            'INSERT INTO payments (member_id, membership_id, amount, payment_method, invoice_number) VALUES (?, ?, ?, ?, ?)',
            [member_id, finalMembershipId || null, amount, payment_method, invoice_number]
        );

        // Update member status to active
        await connection.execute(
            'UPDATE members SET status = ? WHERE id = ?',
            ['active', member_id]
        );

        await connection.commit();

        // Send Email Receipt
        if (memberDetails && memberDetails.email) {
            const emailSubject = `✅ Payment Receipt: ${invoice_number}`;
            const emailHtml = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Payment Receipt</title>
                </head>
                <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;">
                    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); margin-top: 40px; margin-bottom: 40px;">
                        <!-- Header -->
                        <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">Payment Successful</h1>
                            <p style="margin: 10px 0 0; color: #ecfdf5; font-size: 16px;">Thank you for your membership renewal</p>
                        </div>

                        <!-- Content -->
                        <div style="padding: 40px 30px;">
                            <h2 style="margin-top: 0; color: #1e293b; font-size: 20px;">Hi ${memberDetails.first_name},</h2>
                            <p style="color: #475569; line-height: 1.6; font-size: 16px;">
                                We have received your payment of <strong>LKR ${amount}</strong>. Your membership has been successfully renewed.
                            </p>

                            <!-- Receipt Card -->
                            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin-top: 24px; padding: 20px;">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                                    <span style="color: #64748b; font-size: 14px;">Invoice Number</span>
                                    <span style="color: #1e293b; font-weight: 600; font-size: 14px;">${invoice_number}</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                                    <span style="color: #64748b; font-size: 14px;">Date</span>
                                    <span style="color: #1e293b; font-weight: 600; font-size: 14px;">${new Date().toLocaleDateString()}</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                                    <span style="color: #64748b; font-size: 14px;">Payment Method</span>
                                    <span style="color: #1e293b; font-weight: 600; font-size: 14px; text-transform: capitalize;">${payment_method}</span>
                                </div>
                                <div style="height: 1px; background-color: #e2e8f0; margin: 12px 0;"></div>
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <span style="color: #0f172a; font-weight: 600; font-size: 16px;">Total Paid</span>
                                    <span style="color: #059669; font-weight: 700; font-size: 20px;">LKR ${amount}</span>
                                </div>
                            </div>

                             <!-- Plan Details -->
                            <p style="margin-top: 24px; text-align: center; color: #475569; font-size: 14px;">
                                Plan: <strong>${planName}</strong>
                            </p>

                            <!-- CTA Button -->
                            <div style="text-align: center; margin-top: 32px;">
                                <a href="http://localhost:5173/dashboard" style="display: inline-block; background-color: #059669; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; transition: background-color 0.2s; box-shadow: 0 4px 6px -1px rgba(5, 150, 105, 0.2);">
                                    View Dashboard
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
            // Fire and forget email
            sendEmail(memberDetails.email, emailSubject, emailHtml).catch(err => console.error('Failed to send payment receipt:', err));
        }

        res.status(201).json({
            id: result.insertId,
            invoice_number,
            message: 'Payment recorded and membership updated successfully'
        });
    } catch (error) {
        if (connection) await connection.rollback();
        res.status(500).json({ message: 'Server error', error: error.message });
    } finally {
        if (connection) connection.release();
    }
};

exports.getMemberPayments = async (req, res) => {
    const { id } = req.params;
    try {
        const [payments] = await db.execute(
            'SELECT * FROM payments WHERE member_id = ? ORDER BY created_at DESC',
            [id]
        );
        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
