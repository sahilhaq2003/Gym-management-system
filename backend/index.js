const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

const db = require('./config/db');

dotenv.config();

const app = express();

app.use(cors({
    origin: [
        'https://gym-management-system-frontend-lspvmqcl5.vercel.app',
        'http://localhost:5173',
        'http://localhost:5000'
    ],
    credentials: true
}));
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
app.use('/api/memberships', require('./routes/membershipRoutes'));
app.use('/api/workout-plans', require('./routes/workoutPlanRoutes'));

const PORT = process.env.PORT || 5000;

// Test DB Connection
db.getConnection()
    .then(connection => {
        console.log('✅ Database connected successfully');
        connection.release();
    })
    .catch(err => {
        console.error('❌ Database connection failed:', err.message);
    });

// Only listen if not running in Vercel (or Vercel-like environment requiring export)
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;
