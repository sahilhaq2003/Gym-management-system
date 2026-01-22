const mysql = require('mysql2');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

const caPath = path.join(__dirname, '../certs/global-bundle.pem');
let sslOptions;

if (fs.existsSync(caPath)) {
  sslOptions = {
    rejectUnauthorized: true,
    ca: fs.readFileSync(caPath)
  };
} else {
  sslOptions = {
    rejectUnauthorized: false
  };
}

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: sslOptions
});

module.exports = pool.promise();
