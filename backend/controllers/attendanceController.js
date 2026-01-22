const db = require('../config/db');

// Manual Attendance (Check-in / Check-out)
exports.markAttendance = async (req, res) => {
    const { memberId, type } = req.body; // type: 'in' or 'out'

    if (!memberId || !['in', 'out'].includes(type)) {
        return res.status(400).json({ message: 'Member ID and valid type (in/out) are required' });
    }

    try {
        // Verify member exists
        const [members] = await db.execute('SELECT * FROM members WHERE id = ?', [memberId]);
        if (members.length === 0) {
            return res.status(404).json({ message: `Member with ID ${memberId} not found` });
        }
        const member = members[0];

        if (type === 'in') {
            // CHECK-IN Logic
            // Check if already checked in and not checked out? (Optional, skipping for simplicity/flexibility)
            await db.execute(
                'INSERT INTO attendance (member_id, method, date, check_in_time) VALUES (?, ?, CURDATE(), NOW())',
                [memberId, 'manual']
            );
            res.status(200).json({
                success: true,
                message: `Welcome, ${member.first_name}! Checked IN successfully.`,
                member: { id: member.id, name: `${member.first_name} ${member.last_name}`, status: member.status }
            });

        } else {
            // CHECK-OUT Logic
            // Find the last open check-in for today
            const [rows] = await db.execute(
                'SELECT id FROM attendance WHERE member_id = ? AND date = CURDATE() AND check_out_time IS NULL ORDER BY check_in_time DESC LIMIT 1',
                [memberId]
            );

            if (rows.length === 0) {
                return res.status(400).json({ message: 'No active check-in found for today. Please check in first.' });
            }

            const attendanceId = rows[0].id;
            await db.execute('UPDATE attendance SET check_out_time = NOW() WHERE id = ?', [attendanceId]);

            res.status(200).json({
                success: true,
                message: `Goodbye, ${member.first_name}! Checked OUT successfully.`,
                member: { id: member.id, name: `${member.first_name} ${member.last_name}`, status: member.status }
            });
        }

    } catch (error) {
        console.error('Attendance error:', error);
        res.status(500).json({ message: 'Server error during attendance', error: error.message });
    }
};

// Get Today's Attendance
exports.getTodayAttendance = async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT a.*, m.first_name, m.last_name, m.photo_url 
            FROM attendance a 
            JOIN members m ON a.member_id = m.id 
            WHERE a.date = CURDATE() 
            ORDER BY a.check_in_time DESC
        `);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching attendance:', error);
        res.status(500).json({ message: 'Failed to fetch attendance records' });
    }
};
