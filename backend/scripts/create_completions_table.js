const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const createCompletionsTable = async () => {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
    });

    try {
        const createTableQuery = `
      CREATE TABLE IF NOT EXISTS activity_completions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        member_id INT NOT NULL,
        schedule_id INT NOT NULL,
        completion_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
        FOREIGN KEY (schedule_id) REFERENCES member_schedules(id) ON DELETE CASCADE,
        UNIQUE KEY unique_completion (member_id, schedule_id, completion_date)
      );
    `;

        await connection.execute(createTableQuery);
        console.log('✅ activity_completions table created successfully');
    } catch (error) {
        console.error('❌ Error creating table:', error);
    } finally {
        await connection.end();
    }
};

createCompletionsTable();
