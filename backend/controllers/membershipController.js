const db = require('../config/db');

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

        // 2. Create pending membership
        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + plan.duration_months);

        const [membershipResult] = await db.execute(
            'INSERT INTO memberships (member_id, plan_id, start_date, end_date, status, amount) VALUES (?, ?, ?, ?, "pending", ?)',
            [member_id, plan_id, startDate, endDate, plan.price]
        );
        const membershipId = membershipResult.insertId;

        // 3. Create payment record (also could be pending or completed based on gateway, assuming completed "request" for now)
        // In a real app, this might be 'pending' too until admin verifies money in bank.
        // Let's assume the user "Paid" and admin just needs to verify and approve the membership.
        await db.execute(
            'INSERT INTO payments (membership_id, member_id, amount, payment_method, invoice_number) VALUES (?, ?, ?, ?, ?)',
            [membershipId, member_id, plan.price, payment_method || 'online', `INV-${Date.now()}`]
        );

        res.status(201).json({ message: 'Membership request submitted successfully', membershipId });
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
        await db.execute('UPDATE memberships SET status = "active" WHERE id = ?', [id]);
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
