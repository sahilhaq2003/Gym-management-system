const db = require('../config/db');

exports.getAllMembers = async (req, res) => {
    try {
        const [members] = await db.execute('SELECT * FROM members ORDER BY created_at DESC');
        res.json(members);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.createMember = async (req, res) => {
    const { first_name, last_name, email, phone, nic, dob, gender, address } = req.body;

    // Basic validation
    if (!first_name || !last_name || !phone) {
        return res.status(400).json({ message: 'Name and phone are required' });
    }

    try {
        // Check if email already exists
        if (email) {
            const [existing] = await db.execute('SELECT id FROM members WHERE email = ?', [email]);
            if (existing.length > 0) {
                return res.status(400).json({ message: 'Email already registered' });
            }
        }

        // Check if NIC already exists
        if (nic) {
            const [existingNic] = await db.execute('SELECT id FROM members WHERE nic = ?', [nic]);
            if (existingNic.length > 0) {
                return res.status(400).json({ message: 'NIC already registered' });
            }
        }

        const [result] = await db.execute(
            'INSERT INTO members (first_name, last_name, email, phone, nic, dob, gender, address) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [first_name, last_name, email || null, phone, nic || null, dob || null, gender || null, address || null]
        );

        res.status(201).json({ id: result.insertId, message: 'Member created successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getMemberById = async (req, res) => {
    try {
        const [members] = await db.execute('SELECT * FROM members WHERE id = ?', [req.params.id]);
        if (members.length === 0) return res.status(404).json({ message: 'Member not found' });
        res.json(members[0]);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.updateMember = async (req, res) => {
    const { id } = req.params;
    const { first_name, last_name, email, phone, nic, dob, gender, address, status } = req.body;

    try {
        await db.execute(
            `UPDATE members SET 
             first_name = ?, last_name = ?, email = ?, phone = ?, nic = ?, dob = ?, gender = ?, address = ?, status = ?
             WHERE id = ?`,
            [first_name, last_name, email, phone, nic, dob, gender, address, status, id]
        );
        res.json({ message: 'Member updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.deleteMember = async (req, res) => {
    try {
        await db.execute('DELETE FROM members WHERE id = ?', [req.params.id]);
        res.json({ message: 'Member deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error. This member might have dependent records.', error: error.message });
    }
};
