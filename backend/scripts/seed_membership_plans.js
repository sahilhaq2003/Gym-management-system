const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const seedPlans = async () => {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
    });

    try {
        // Check if plans exist
        const [existing] = await connection.execute('SELECT COUNT(*) as count FROM membership_plans');
        if (existing[0].count > 0) {
            console.log('ℹ️ Plans already seeded');
            return;
        }

        const plans = [
            { name: 'Monthly Basic', duration: 1, price: 5000, desc: 'Access to gym equipment' },
            { name: 'Monthly Premium', duration: 1, price: 8000, desc: 'Gym + Classes + Sauna' },
            { name: '3 Months Standard', duration: 3, price: 13500, desc: 'Quarterly membership with 10% discount' },
            { name: '6 Months Pro', duration: 6, price: 25000, desc: 'Half-yearly commitment' },
            { name: 'Annual Elite', duration: 12, price: 45000, desc: 'Full year access with all perks' },
        ];

        for (const p of plans) {
            await connection.execute(
                'INSERT INTO membership_plans (name, duration_months, price, description) VALUES (?, ?, ?, ?)',
                [p.name, p.duration, p.price, p.desc]
            );
        }
        console.log('✅ Membership plans seeded');

    } catch (error) {
        console.error('❌ Error seeding plans:', error);
    } finally {
        await connection.end();
    }
};

seedPlans();
