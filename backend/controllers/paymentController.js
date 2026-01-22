const db = require('../config/db');

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

    try {
        await connection.beginTransaction();

        let finalMembershipId = null;

        // If a plan is selected, create a new membership record
        if (plan_id) {
            // 1. Get Plan Details
            const [plans] = await connection.execute('SELECT * FROM membership_plans WHERE id = ?', [plan_id]);
            if (plans.length === 0) throw new Error('Invalid Plan ID');
            const plan = plans[0];

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

        res.status(201).json({
            id: result.insertId,
            invoice_number,
            message: 'Payment recorded and membership updated successfully'
        });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ message: 'Server error', error: error.message });
    } finally {
        connection.release();
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
