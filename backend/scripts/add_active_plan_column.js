const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const addActivePlanColumn = async () => {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
    });

    try {
        // Add active_plan_id column to members table if it doesn't exist
        await connection.execute(`
            ALTER TABLE members 
            ADD COLUMN active_plan_id INT NULL,
            ADD CONSTRAINT fk_member_active_plan FOREIGN KEY (active_plan_id) REFERENCES workout_plans(id) ON DELETE SET NULL
        `);
        console.log('✅ active_plan_id column added to members table');
    } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log('ℹ️ active_plan_id column already exists');
        } else {
            console.error('❌ Error adding column:', error);
        }
    } finally {
        await connection.end();
    }
};

addActivePlanColumn();
