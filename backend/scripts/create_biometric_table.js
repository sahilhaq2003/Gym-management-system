const db = require('../config/db');

async function updateSchema() {
    try {
        console.log('Checking for biometric_credentials table...');

        const [tables] = await db.execute("SHOW TABLES LIKE 'biometric_credentials'");

        if (tables.length === 0) {
            console.log("Creating 'biometric_credentials' table...");
            await db.execute(`
                CREATE TABLE biometric_credentials (
                    id VARCHAR(255) PRIMARY KEY,
                    member_id INT NOT NULL,
                    public_key TEXT NOT NULL,
                    counter INT DEFAULT 0,
                    transports VARCHAR(255),
                    attestation_type VARCHAR(255),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
                )
            `);
            console.log("'biometric_credentials' table created successfully.");
        } else {
            console.log("'biometric_credentials' table already exists.");
        }

    } catch (error) {
        console.error('Error updating schema:', error);
    } finally {
        process.exit();
    }
}

updateSchema();
