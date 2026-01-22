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

exports.getMemberSchedule = async (req, res) => {
    try {
        const [schedule] = await db.execute('SELECT * FROM member_schedules WHERE member_id = ? ORDER BY FIELD(day_of_week, "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun")', [req.params.id]);

        // Fetch active plan info
        const [members] = await db.execute('SELECT active_plan_id FROM members WHERE id = ?', [req.params.id]);
        let plan = null;

        if (members.length > 0 && members[0].active_plan_id) {
            const [plans] = await db.execute('SELECT * FROM workout_plans WHERE id = ?', [members[0].active_plan_id]);
            if (plans.length > 0) plan = plans[0];
        }

        res.json({ schedule, plan });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.updateMemberSchedule = async (req, res) => {
    const { id } = req.params; // member_id
    const { day, activity, time, type, trainer } = req.body;

    try {
        // Upsert logic: Delete existing for that day and insert new (simpler than complex update for now)
        // Or actually, let's just insert. If we want to replace, we should probably have a specific ID or delete first.
        // For this simple implementation, let's assume one activity per day per type or just list them.
        // Let's just add a new item. Deletion can be separate.

        const [result] = await db.execute(
            'INSERT INTO member_schedules (member_id, day_of_week, activity, time, type, trainer) VALUES (?, ?, ?, ?, ?, ?)',
            [id, day, activity, time, type || 'Gym', trainer || null]
        );
        res.status(201).json({ id: result.insertId, message: 'Schedule added' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.deleteScheduleItem = async (req, res) => {
    try {
        await db.execute('DELETE FROM member_schedules WHERE id = ?', [req.params.itemId]);
        res.json({ message: 'Schedule item removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getScheduleCompletions = async (req, res) => {
    const { id } = req.params;
    // Get completions for the last 7 days + future
    // Actually, just get all completions for this member for simplicity or filter by recent date in frontend
    // Let's filter by last 30 days to keep it light
    try {
        const [completions] = await db.execute(
            'SELECT * FROM activity_completions WHERE member_id = ? AND completion_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)',
            [id]
        );
        res.json(completions);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.toggleScheduleCompletion = async (req, res) => {
    const { id, itemId } = req.params; // member_id, schedule_id
    const { date, completed } = req.body; // date in YYYY-MM-DD

    try {
        if (completed) {
            // Mark as done
            await db.execute(
                'INSERT IGNORE INTO activity_completions (member_id, schedule_id, completion_date) VALUES (?, ?, ?)',
                [id, itemId, date]
            );
        } else {
            // Unmark
            await db.execute(
                'DELETE FROM activity_completions WHERE member_id = ? AND schedule_id = ? AND completion_date = ?',
                [id, itemId, date]
            );
        }
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getMemberMembership = async (req, res) => {
    try {
        const [memberships] = await db.execute(`
            SELECT m.*, mp.name as plan_name, mp.description 
            FROM memberships m
            JOIN membership_plans mp ON m.plan_id = mp.id
            WHERE m.member_id = ? AND m.status = 'active'
            ORDER BY m.end_date DESC
            LIMIT 1
        `, [req.params.id]);

        if (memberships.length === 0) {
            return res.json(null);
        }
        res.json(memberships[0]);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
