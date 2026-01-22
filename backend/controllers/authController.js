const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    // Implement registration logic
    res.status(501).json({ message: 'Not implemented' });
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        // 1. Try to find in Users table (Admin/Staff)
        const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);

        if (users.length > 0) {
            const user = users[0];
            const isMatch = await bcrypt.compare(password, user.password);

            if (isMatch) {
                // Fetch role name
                const [roles] = await db.execute('SELECT name FROM roles WHERE id = ?', [user.role_id]);
                const roleName = roles[0]?.name || 'staff';

                const token = jwt.sign({ id: user.id, role: roleName }, process.env.JWT_SECRET, { expiresIn: '1d' });
                return res.json({ token, user: { id: user.id, name: user.name, role: roleName } });
            }
        }

        // 2. If not found or password mismatch in Users, try Members table
        // Member login: Email + NIC (as password)
        const [members] = await db.execute('SELECT * FROM members WHERE email = ?', [email]);

        if (members.length > 0) {
            const member = members[0];

            // Check if password matches NIC (case-insensitive check for NIC might be good, but strict for now)
            // Note: In a real app, NICs should probably be hashed too, but per requirement "password is nic"
            if (password === member.nic) {
                const token = jwt.sign({ id: member.id, role: 'member' }, process.env.JWT_SECRET, { expiresIn: '1d' });
                return res.json({
                    token,
                    user: {
                        id: member.id,
                        name: `${member.first_name} ${member.last_name}`,
                        role: 'member',
                        email: member.email
                    }
                });
            }
        }

        // If neither matched
        return res.status(401).json({ message: 'Invalid credentials' });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
