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
    const { member_id, membership_id, amount, payment_method } = req.body;

    if (!member_id || !amount || !payment_method) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        // Generate Invoice Number (e.g., INV-YYYYMMDD-RANDOM)
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const randomSuffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        const invoice_number = `INV-${dateStr}-${randomSuffix}`;

        const [result] = await db.execute(
            'INSERT INTO payments (member_id, membership_id, amount, payment_method, invoice_number) VALUES (?, ?, ?, ?, ?)',
            [member_id, membership_id || null, amount, payment_method, invoice_number]
        );

        res.status(201).json({
            id: result.insertId,
            invoice_number,
            message: 'Payment recorded successfully'
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
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
