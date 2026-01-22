const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const updateMembershipStatus = async () => {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
    });

    try {
        // Modify the enum to include 'pending'
        await connection.execute(`
      ALTER TABLE memberships 
      MODIFY COLUMN status ENUM('active', 'expired', 'cancelled', 'pending') DEFAULT 'pending'
    `);
        console.log('✅ memberships table status updated to include pending');

        // Seed some plans if empty
        const [plans] = await connection.execute('SELECT * FROM membership_plans');
        if (plans.length === 0) {
            await connection.execute(`
        INSERT INTO membership_plans (name, duration_months, price, description) VALUES 
        ('Standard Monthly', 1, 5000.00, 'Access to gym equipment, 1 month validity'),
        ('Premium Quarterly', 3, 14000.00, 'Access to all facilities, sauna, 3 months validity'),
        ('Gold Annual', 12, 50000.00, 'All access, personal trainer sessions, 12 months validity')
      `);
            console.log('✅ Sample membership plans seeded');
        }

    } catch (error) {
        console.error('❌ Error updating table:', error);
    } finally {
        await connection.end();
    }
};

updateMembershipStatus();
