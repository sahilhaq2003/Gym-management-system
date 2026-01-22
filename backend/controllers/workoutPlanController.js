const db = require('../config/db');

// Get all workout plans
exports.getAllPlans = async (req, res) => {
    try {
        const [plans] = await db.execute('SELECT * FROM workout_plans ORDER BY created_at DESC');

        // Fetch items for each plan (naive approach, but fine for small scale)
        for (let plan of plans) {
            const [items] = await db.execute('SELECT * FROM workout_plan_items WHERE plan_id = ? ORDER BY FIELD(day_of_week, "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun")', [plan.id]);
            plan.items = items;
        }

        res.json(plans);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Create a new workout plan
exports.createPlan = async (req, res) => {
    const { name, description, difficulty, items } = req.body;
    // items should be array of { day_of_week, activity, time, type, trainer }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const [result] = await connection.execute(
            'INSERT INTO workout_plans (name, description, difficulty_level) VALUES (?, ?, ?)',
            [name, description, difficulty]
        );
        const planId = result.insertId;

        if (items && items.length > 0) {
            for (const item of items) {
                await connection.execute(
                    'INSERT INTO workout_plan_items (plan_id, day_of_week, activity, time, type, trainer) VALUES (?, ?, ?, ?, ?, ?)',
                    [planId, item.day_of_week, item.activity, item.time || '09:00 AM', item.type || 'Gym', item.trainer || 'Staff']
                );
            }
        }

        await connection.commit();
        res.status(201).json({ message: 'Workout plan created successfully', planId });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ message: 'Server error', error: error.message });
    } finally {
        connection.release();
    }
};

// Assign plan to member(s)
exports.assignPlanToMember = async (req, res) => {
    // memberIds should be an array. Support legacy memberId for single assign if needed.
    const { planId, memberIds } = req.body;

    // Normalize to array
    const targetMemberIds = Array.isArray(memberIds)
        ? memberIds
        : (req.body.memberId ? [req.body.memberId] : []);

    if (targetMemberIds.length === 0) {
        return res.status(400).json({ message: 'No members selected' });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Get plan items
        const [planItems] = await connection.execute('SELECT * FROM workout_plan_items WHERE plan_id = ?', [planId]);

        if (planItems.length === 0) {
            throw new Error('Plan has no items or does not exist');
        }

        // Loop over each member
        for (const mId of targetMemberIds) {
            // 2. Clear existing schedule
            await connection.execute('DELETE FROM member_schedules WHERE member_id = ?', [mId]);

            // 2.5 Update member's active_plan_id
            await connection.execute('UPDATE members SET active_plan_id = ? WHERE id = ?', [planId, mId]);

            // 3. Insert new items
            for (const item of planItems) {
                await connection.execute(
                    'INSERT INTO member_schedules (member_id, day_of_week, activity, time, type, trainer) VALUES (?, ?, ?, ?, ?, ?)',
                    [mId, item.day_of_week, item.activity, item.time, item.type, item.trainer]
                );
            }
        }

        await connection.commit();
        res.json({ message: `Plan assigned to ${targetMemberIds.length} member(s) successfully` });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ message: 'Assignment failed', error: error.message });
    } finally {
        connection.release();
    }
};

// Delete a plan
exports.deletePlan = async (req, res) => {
    const { id } = req.params;
    try {
        await db.execute('DELETE FROM workout_plans WHERE id = ?', [id]);
        res.json({ message: 'Plan deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
