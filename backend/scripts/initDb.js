const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

async function initDb() {
    console.log('🔄 Initializing Database...');

    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        multipleStatements: true // Allow executing the whole script at once
    });

    try {
        // 1. Create Database if not exists
        await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
        console.log(`✅ Database ${process.env.DB_NAME} checked/created.`);

        // 2. Use Database
        await connection.query(`USE ${process.env.DB_NAME}`);

        // 3. Read SQL File
        const sqlPath = path.join(__dirname, '../database.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        // 4. Execute SQL
        // We'll execute it. If tables exist, it might error depending on schema.
        // However, the schema uses straightforward CREATE TABLE. 
        // It's safer to execute statements one by one or ignore specific errors,
        // but for specific user request "fix database", re-running valid create statements might fail if tables exist.
        // Let's assume it's a fresh DB or we append "IF NOT EXISTS" to tables?
        // Modifying the SQL file on the fly is tricky.
        // Let's try executing. If it fails, we log it.

        // A robust way: Split by ';' and run individually, catching 'already exists' errors.
        const statements = sql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0);

        for (const statement of statements) {
            try {
                await connection.query(statement);
            } catch (err) {
                if (err.code === 'ER_TABLE_EXISTS_ERROR' || err.code === 'ER_DUP_ENTRY') {
                    // Ignore table exists or duplicate entry errors
                    console.log(`ℹ️  Skipped (already exists): ${statement.substring(0, 30)}...`);
                } else {
                    console.error(`❌ Error executing: ${statement.substring(0, 50)}...`, err.message);
                }
            }
        }
        console.log('✅ Schema synchronization complete.');

        // 5. Check if Admin Exists, if not create one
        const [users] = await connection.query('SELECT * FROM users WHERE email = ?', ['admin@gym.com']);
        if (users.length === 0) {
            console.log('👤 Creating default admin account...');
            const hashedPassword = await bcrypt.hash('admin123', 10);

            // Ensure role exists first (it should from the SQL script)
            // ID 1 is likely 'admin' from the seed data: INSERT INTO roles (name) VALUES ('admin')...
            // But if roles table was just created, ID might be 1.
            // Let's verify role id for 'admin'
            const [roles] = await connection.query('SELECT id FROM roles WHERE name = "admin"');
            let adminRoleId = 1;
            if (roles.length > 0) {
                adminRoleId = roles[0].id;
            }

            await connection.query(
                'INSERT INTO users (name, email, password, role_id) VALUES (?, ?, ?, ?)',
                ['Admin', 'admin@gym.com', hashedPassword, adminRoleId]
            );
            console.log('✅ Default admin created: admin@gym.com / admin123');
        } else {
            console.log('👤 Admin account already exists.');
        }

    } catch (error) {
        console.error('❌ Database Initialization Failed:', error);
    } finally {
        await connection.end();
    }
}

initDb();
