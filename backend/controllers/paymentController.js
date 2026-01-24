const db = require('../config/db');
const sendEmail = require('../utils/emailService');
const md5 = require('crypto-js/md5');

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

exports.initiatePayHerePayment = async (req, res) => {
    const { plan_id, member_id, amount: reqAmount } = req.body;

    if (!member_id) {
        return res.status(400).json({ message: 'Missing member_id' });
    }

    try {
        const connection = await db.getConnection();
        const [members] = await connection.execute('SELECT * FROM members WHERE id = ?', [member_id]);

        let plan = null;
        if (plan_id) {
            const [plans] = await connection.execute('SELECT * FROM membership_plans WHERE id = ?', [plan_id]);
            if (plans.length > 0) plan = plans[0];
        }
        connection.release();

        if (members.length === 0) {
            return res.status(404).json({ message: 'Member not found' });
        }

        const member = members[0];

        // Determine Amount and Item Name
        let finalAmount = reqAmount;
        let itemName = 'General Payment';

        if (plan) {
            itemName = plan.name;
            if (!finalAmount) {
                finalAmount = plan.price;
            }
        }

        if (!finalAmount) {
            return res.status(400).json({ message: 'Amount is required if no plan selected' });
        }

        const merchant_id = process.env.PAYHERE_MERCHANT_ID;
        const merchant_secret = process.env.PAYHERE_SECRET;
        const currency = process.env.PAYHERE_CURRENCY || 'LKR';
        const amount = Number(finalAmount).toFixed(2);
        const order_id = `ORD-${Date.now()}`;

        console.log('--- PayHere Debug Info ---');
        console.log('Merchant ID:', merchant_id);
        console.log('Order ID:', order_id);
        console.log('Amount:', amount);
        console.log('Currency:', currency);
        console.log('Merchant Secret (First 5):', merchant_secret ? merchant_secret.substring(0, 5) : 'MISSING');
        console.log('--------------------------');

        // Generate Hash
        // Hash = upper(md5(merchant_id + order_id + amount + currency + upper(md5(merchant_secret))))
        const hashedSecret = md5(merchant_secret).toString().toUpperCase();
        const hash = md5(merchant_id + order_id + amount + currency + hashedSecret).toString().toUpperCase();

        const payhereParams = {
            sandbox: true,
            merchant_id,
            return_url: 'http://localhost:5173/payments', // Return to Admin Payments page
            cancel_url: 'http://localhost:5173/payments',
            notify_url: 'http://localhost:5000/api/payments/payhere/notify',
            order_id,
            items: itemName,
            amount,
            currency,
            hash,
            first_name: member.first_name,
            last_name: member.last_name,
            email: member.email,
            phone: member.phone || '0777123456',
            address: member.address || 'Gym Address',
            city: 'Colombo',
            country: 'Sri Lanka',
            custom_1: member_id,
            custom_2: plan_id || '' // Send empty string if no plan
        };

        res.json(payhereParams);

    } catch (error) {
        console.error('PayHere Init Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.payhereNotify = async (req, res) => {
    console.log('PayHere Notification Received:', req.body);

    const {
        merchant_id,
        order_id,
        payment_id,
        payhere_amount,
        payhere_currency,
        status_code,
        md5sig,
        custom_1,
        custom_2
    } = req.body;

    const merchant_secret = process.env.PAYHERE_SECRET;

    // Verify Signature
    const hashedSecret = md5(merchant_secret).toString().toUpperCase();
    const localMd5sig = md5(merchant_id + order_id + payhere_amount + payhere_currency + status_code + hashedSecret).toString().toUpperCase();

    if (localMd5sig !== md5sig) {
        console.error('PayHere Signature Mismatch');
        return res.status(400).send('Signature Mismatch');
    }

    if (status_code === '2') {
        const member_id = custom_1;
        const plan_id = custom_2;
        const amount = payhere_amount;

        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // 1. Check if order processed already
            // (Optional: check payment_id in payments table)

            // 2. Create Membership
            const [plans] = await connection.execute('SELECT * FROM membership_plans WHERE id = ?', [plan_id]);
            if (plans.length === 0) throw new Error('Plan not found');
            const plan = plans[0];

            const startDate = new Date();
            const endDate = new Date();
            endDate.setMonth(endDate.getMonth() + plan.duration_months);

            const [memResult] = await connection.execute(
                'INSERT INTO memberships (member_id, plan_id, start_date, end_date, amount, status) VALUES (?, ?, ?, ?, ?, ?)',
                [member_id, plan_id, startDate, endDate, amount, 'active']
            );
            const membershipId = memResult.insertId;

            // 3. Record Payment
            await connection.execute(
                'INSERT INTO payments (member_id, membership_id, amount, payment_method, invoice_number) VALUES (?, ?, ?, ?, ?)',
                [member_id, membershipId, amount, 'payhere_online', order_id]
            );

            // 4. Update Member Status
            await connection.execute('UPDATE members SET status = "active" WHERE id = ?', [member_id]);

            await connection.commit();
            console.log('PayHere Payment Processed Successfully for Order:', order_id);
            res.status(200).send('Payment Verified and Processed');

        } catch (error) {
            await connection.rollback();
            console.error('PayHere Processing Error:', error);
            res.status(500).send('Internal Server Error');
        } finally {
            connection.release();
        }
    } else {
        console.log('PayHere Payment Failed/Pending. Status Code:', status_code);
        res.status(200).send('Status Received');
    }
};
