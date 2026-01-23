const db = require('../config/db');
const sendEmail = require('../utils/emailService');

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

    console.log(`Assigning plan ${planId} to members:`, memberIds);

    // Normalize to array
    const targetMemberIds = Array.isArray(memberIds)
        ? memberIds
        : (req.body.memberId ? [req.body.memberId] : []);

    if (targetMemberIds.length === 0) {
        return res.status(400).json({ message: 'No members selected' });
    }

    const connection = await db.getConnection();
    const membersToNotify = []; // Array to store member details for email
    let planName = 'Workout Plan';

    try {
        await connection.beginTransaction();

        // 1. Get plan items and details
        const [planItems] = await connection.execute('SELECT * FROM workout_plan_items WHERE plan_id = ?', [planId]);
        const [plans] = await connection.execute('SELECT name FROM workout_plans WHERE id = ?', [planId]);

        if (plans.length > 0) {
            planName = plans[0].name;
        }

        if (planItems.length === 0) {
            await connection.rollback();
            return res.status(400).json({ message: 'The selected workout plan has no exercises. Please add exercises to the plan before assigning it.' });
        }

        // Loop over each member
        for (const mId of targetMemberIds) {
            // 2. Clear existing schedule
            await connection.execute('DELETE FROM member_schedules WHERE member_id = ?', [mId]);

            // 2.5 Update member's active_plan_id
            await connection.execute('UPDATE members SET active_plan_id = ? WHERE id = ?', [planId, mId]);

            // Fetch member details for email (inside transaction is fine for reading)
            const [memberRows] = await connection.execute('SELECT first_name, last_name, email FROM members WHERE id = ?', [mId]);
            if (memberRows.length > 0 && memberRows[0].email) {
                membersToNotify.push(memberRows[0]);
            }

            // 3. Insert new items
            for (const item of planItems) {
                await connection.execute(
                    'INSERT INTO member_schedules (member_id, day_of_week, activity, time, type, trainer) VALUES (?, ?, ?, ?, ?, ?)',
                    [mId, item.day_of_week, item.activity, item.time, item.type, item.trainer]
                );
            }
        }

        await connection.commit();

        // Send Emails (Fire and forget)
        // We do this after commit so we don't send emails if transaction fails
        try {
            const emailSubject = `💪 New Workout Plan Assigned: ${planName}`;

            // Build table rows
            const exercisesHtml = planItems.map(item => `
                <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 12px; color: #334155; font-weight: 500;">${item.day_of_week}</td>
                    <td style="padding: 12px; color: #0f172a; font-weight: 600;">${item.activity}</td>
                    <td style="padding: 12px; color: #64748b;">${item.time}</td>
                    <td style="padding: 12px;"><span style="background: #e0f2fe; color: #0369a1; padding: 4px 8px; border-radius: 9999px; font-size: 12px; font-weight: 600;">${item.type}</span></td>
                </tr>
            `).join('');

            const promises = membersToNotify.map(member => {
                const emailHtml = `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="utf-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>New Workout Plan</title>
                    </head>
                    <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;">
                        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); margin-top: 40px; margin-bottom: 40px;">
                            <!-- Header -->
                            <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 40px 30px; text-align: center;">
                                <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">New Challenge Unlocked!</h1>
                                <p style="margin: 10px 0 0; color: #dbeafe; font-size: 16px;">Your fitness journey just got an upgrade</p>
                            </div>

                            <!-- Content -->
                            <div style="padding: 40px 30px;">
                                <h2 style="margin-top: 0; color: #1e293b; font-size: 20px;">Hi ${member.first_name},</h2>
                                <p style="color: #475569; line-height: 1.6; font-size: 16px;">
                                    Your trainer has assigned you a new workout plan aimed at crushing your fitness goals. Check out the details of <strong>${planName}</strong> below:
                                </p>

                                <!-- Plan Card -->
                                <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; margin-top: 24px; overflow: hidden;">
                                    <div style="background-color: #f1f5f9; padding: 12px 20px; border-bottom: 1px solid #e2e8f0;">
                                        <h3 style="margin: 0; color: #334155; font-size: 16px; font-weight: 600;">Weekly Schedule</h3>
                                    </div>
                                    <table style="width: 100%; border-collapse: collapse; font-size: 14px; text-align: left;">
                                        <thead>
                                            <tr style="background-color: #f8fafc;">
                                                <th style="padding: 12px; color: #64748b; font-weight: 600; font-size: 12px; text-transform: uppercase;">Day</th>
                                                <th style="padding: 12px; color: #64748b; font-weight: 600; font-size: 12px; text-transform: uppercase;">Activity</th>
                                                <th style="padding: 12px; color: #64748b; font-weight: 600; font-size: 12px; text-transform: uppercase;">Time</th>
                                                <th style="padding: 12px; color: #64748b; font-weight: 600; font-size: 12px; text-transform: uppercase;">Type</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${exercisesHtml}
                                        </tbody>
                                    </table>
                                </div>

                                <!-- CTA Button -->
                                <div style="text-align: center; margin-top: 32px;">
                                    <a href="http://localhost:5173/dashboard" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; transition: background-color 0.2s; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);">
                                        View Full Schedule
                                    </a>
                                </div>

                                <p style="margin-top: 32px; text-align: center; color: #94a3b8; font-size: 14px;">
                                    "The only bad workout is the one that didn't happen."
                                </p>
                            </div>

                            <!-- Footer -->
                            <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
                                <p style="margin: 0; color: #94a3b8; font-size: 12px;">&copy; ${new Date().getFullYear()} Gym Management System</p>
                            </div>
                        </div>
                    </body>
                    </html>
                `;
                return sendEmail(member.email, emailSubject, emailHtml).catch(err =>
                    console.error('Failed to send plan email to', member.email, err)
                );
            });

            // Note: We don't await Promise.all here to avoid delaying the response.
            // But if reliability is paramount over speed, uncomment the next line:
            // await Promise.all(promises);
            Promise.all(promises).then(() => console.log('All assignment emails processed'));

        } catch (emailError) {
            console.error('Email module error:', emailError);
        }

        res.json({ message: `Plan assigned to ${targetMemberIds.length} member(s) successfully` });
    } catch (error) {
        if (connection) await connection.rollback();
        console.error("Assign plan error:", error);
        res.status(500).json({ message: 'Assignment failed', error: error.message });
    } finally {
        if (connection) connection.release();
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
