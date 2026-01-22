const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const createWorkoutPlansTables = async () => {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
    });

    try {
        // 1. Create workout_plans table
        await connection.execute(`
      CREATE TABLE IF NOT EXISTS workout_plans (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        difficulty_level ENUM('Beginner', 'Intermediate', 'Advanced') DEFAULT 'Beginner',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
        console.log('✅ workout_plans table created');

        // 2. Create workout_plan_items table
        await connection.execute(`
      CREATE TABLE IF NOT EXISTS workout_plan_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        plan_id INT NOT NULL,
        day_of_week ENUM('Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun') NOT NULL,
        activity VARCHAR(255) NOT NULL,
        time VARCHAR(20) DEFAULT '09:00 AM',
        type ENUM('Gym', 'Class') DEFAULT 'Gym',
        trainer VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (plan_id) REFERENCES workout_plans(id) ON DELETE CASCADE
      )
    `);
        console.log('✅ workout_plan_items table created');

    } catch (error) {
        console.error('❌ Error creating tables:', error);
    } finally {
        await connection.end();
    }
};

createWorkoutPlansTables();
