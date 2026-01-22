const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

const db = require('./config/db');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Gym Management System API is running...');
});

// Routes will be imported here
const authRoutes = require('./routes/authRoutes');
const memberRoutes = require('./routes/memberRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const fingerprintRoutes = require('./routes/fingerprintRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/biometrics', fingerprintRoutes);

const PORT = process.env.PORT || 5000;

// Test DB Connection
db.getConnection()
    .then(connection => {
        console.log('✅ Database connected successfully');
        connection.release();
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('❌ Database connection failed:', err.message);
        // We typically want to fail hard here, but for dev we might keep it running to show the error
        // But restarting on env change (nodemon) is better.
        process.exit(1);
    });
