const db = require('../config/db');

async function updateSchema() {
    try {
        console.log('Checking members table schema...');

        // Check if 'nic' column exists
        const [columns] = await db.execute("SHOW COLUMNS FROM members LIKE 'nic'");

        if (columns.length === 0) {
            console.log("Adding 'nic' column to members table...");
            await db.execute("ALTER TABLE members ADD COLUMN nic VARCHAR(20) AFTER email");
            console.log("'nic' column added successfully.");
        } else {
            console.log("'nic' column already exists.");
        }

        // We also need to ensure the 'nic' is unique if we use it for login, but for now just adding it is enough.
        // Ideally: await db.execute("ALTER TABLE members ADD CONSTRAINT unique_nic UNIQUE (nic)");

    } catch (error) {
        console.error('Error updating schema:', error);
    } finally {
        process.exit();
    }
}

updateSchema();
