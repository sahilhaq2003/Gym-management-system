const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config({ path: path.join(__dirname, '../.env') });

const ADMIN_EMAIL = 'admin@gym.com';
const ADMIN_PASSWORD = 'admin@123';
const ADMIN_NAME = 'Admin';

async function getSslOptions() {
    const caPath = path.join(__dirname, '../certs/global-bundle.pem');

    if (fs.existsSync(caPath)) {
        return {
            rejectUnauthorized: true,
            ca: fs.readFileSync(caPath)
        };
    }

    console.warn('⚠️  RDS certificate not found. Proceeding with relaxed SSL validation.');
    return { rejectUnauthorized: false };
}

async function ensureAdminUser() {
    const ssl = await getSslOptions();

    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        ssl
    });

    try {
        console.log('🔐 Ensuring admin role exists...');
        const [roleRows] = await connection.execute('SELECT id FROM roles WHERE name = ? LIMIT 1', ['admin']);

        let roleId;
        if (roleRows.length === 0) {
            const [roleResult] = await connection.execute('INSERT INTO roles (name) VALUES (?)', ['admin']);
            roleId = roleResult.insertId;
            console.log('✅ Admin role created.');
        } else {
            roleId = roleRows[0].id;
            console.log('ℹ️  Admin role already present.');
        }

        console.log('🔐 Preparing admin user credentials...');
        const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

        const [userRows] = await connection.execute('SELECT id FROM users WHERE email = ? LIMIT 1', [ADMIN_EMAIL]);

        if (userRows.length === 0) {
            await connection.execute(
                'INSERT INTO users (name, email, password, role_id, status) VALUES (?, ?, ?, ?, ?)',
                [ADMIN_NAME, ADMIN_EMAIL, hashedPassword, roleId, 'active']
            );
            console.log('✅ Admin user created successfully.');
        } else {
            const userId = userRows[0].id;
            await connection.execute(
                'UPDATE users SET name = ?, password = ?, role_id = ?, status = ? WHERE id = ?',
                [ADMIN_NAME, hashedPassword, roleId, 'active', userId]
            );
            console.log('ℹ️  Admin user already existed. Credentials refreshed.');
        }

        console.log('🎉 Admin credentials ready -> Email: admin@gym.com | Password: admin@123');
    } catch (error) {
        console.error('❌ Failed to ensure admin user:', error.message);
        throw error;
    } finally {
        await connection.end();
    }
}

ensureAdminUser().catch((err) => {
    console.error('❌ Script execution failed:', err);
    process.exit(1);
});
