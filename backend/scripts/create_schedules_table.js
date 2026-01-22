const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const createScheduleTable = async () => {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
    });

    try {
        const createTableQuery = `
      CREATE TABLE IF NOT EXISTS member_schedules (
        id INT AUTO_INCREMENT PRIMARY KEY,
        member_id INT NOT NULL,
        day_of_week ENUM('Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun') NOT NULL,
        activity VARCHAR(255) NOT NULL,
        time VARCHAR(20) NOT NULL,
        type ENUM('Gym', 'Class') DEFAULT 'Gym',
        trainer VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
      );
    `;

        await connection.execute(createTableQuery);
        console.log('✅ member_schedules table created successfully');
    } catch (error) {
        console.error('❌ Error creating table:', error);
    } finally {
        await connection.end();
    }
};

createScheduleTable();
