const mysql = require('mysql2/promise');
const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

AWS.config.update({ region: 'eu-north-1' });

(async () => {
  const password = 'sahil123';

  const certPath = path.join(__dirname, '../certs/global-bundle.pem');
  let sslOptions;

  if (fs.existsSync(certPath)) {
    sslOptions = {
      rejectUnauthorized: true,
      ca: fs.readFileSync(certPath)
    };
  } else {
    console.warn('⚠️  RDS certificate not found at', certPath, '- proceeding with relaxed SSL.');
    sslOptions = { rejectUnauthorized: false };
  }

  let conn;
  try {
    conn = await mysql.createConnection({
      host: 'gym-db.ctaqimoaafgp.eu-north-1.rds.amazonaws.com',
      port: 3306,
      database: 'gymdb',
      user: 'gym',
      password,
      ssl: sslOptions
    });

    const [rows] = await conn.execute('SELECT VERSION() AS v');
    console.log('✅ Connected. MySQL version:', rows[0].v);
  } catch (error) {
    console.error('❌ Database error:', error);
    throw error;
  } finally {
    if (conn) {
      await conn.end();
    }
  }
})().catch((err) => {
  console.error('❌ Connection test failed:', err);
});
