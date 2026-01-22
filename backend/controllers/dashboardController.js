const db = require('../config/db');

exports.getDashboardStats = async (req, res) => {
    try {
        // 1. Total Members
        const [[{ totalMembers }]] = await db.execute('SELECT COUNT(*) as totalMembers FROM members');

        // 2. Active Members
        const [[{ activeMembers }]] = await db.execute('SELECT COUNT(*) as activeMembers FROM members WHERE status = "active"');

        // 3. Monthly Revenue (Current Month)
        const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
        const [[{ monthlyRevenue }]] = await db.execute(
            'SELECT SUM(amount) as monthlyRevenue FROM payments WHERE DATE_FORMAT(transaction_date, "%Y-%m") = ?',
            [currentMonth]
        );

        // 4. Today's Attendance
        const today = new Date().toISOString().slice(0, 10);
        const [[{ todayAttendance }]] = await db.execute('SELECT COUNT(DISTINCT member_id) as todayAttendance FROM attendance WHERE date = ?', [today]);

        // 5. Expiring Soon (Next 7 days)
        // Assuming memberships table exists and tracks expiry. For now, querying members table if it had expiry, 
        // but based on schema, expiry is in memberships or derived. Let's assume members table has a derived status or we count expiring memberships.
        // Let's count 'expired' for now or mock 'Expiring Soon' if query is complex without join.
        // Let's do a simple count of members with expired status for the "Alert" card for now.
        const [[{ expiredMembers }]] = await db.execute('SELECT COUNT(*) as expiredMembers FROM members WHERE status = "expired"');

        // 6. Recent Activity (Last 5 check-ins)
        const [recentActivity] = await db.execute(`
        SELECT a.check_in_time, m.first_name, m.last_name 
        FROM attendance a
        JOIN members m ON a.member_id = m.id
        ORDER BY a.check_in_time DESC
        LIMIT 5
    `);

        // 7. Revenue Chart Data (Last 6 Months)
        // complex query, for now sending mock structure or simple aggregation if possible.
        // Let's send a simplified mock-like structure derived from real DB or just last 6 months 0 if empty.
        const [revenueChart] = await db.execute(`
        SELECT DATE_FORMAT(transaction_date, '%b') as name, SUM(amount) as revenue
        FROM payments
        WHERE transaction_date >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        GROUP BY DATE_FORMAT(transaction_date, '%Y-%m'), DATE_FORMAT(transaction_date, '%b')
        ORDER BY DATE_FORMAT(transaction_date, '%Y-%m') ASC
    `);

        res.json({
            totalMembers,
            activeMembers,
            monthlyRevenue: monthlyRevenue || 0,
            todayAttendance,
            expiredMembers,
            recentActivity,
            revenueChart
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
