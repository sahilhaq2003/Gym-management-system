const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendEmail = async (to, subject, html) => {
    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM || '"Gym Management System" <no-reply@gym.com>',
            to,
            subject,
            html,
        });
        console.log("Message sent: %s", info.messageId);
        return info;
    } catch (error) {
        console.error("Error sending email: ", error);
        // Don't throw error to prevent blocking the main flow if email fails, 
        // but log it. Or maybe we should? The prompt says "system should be send a email", so it's a requirement.
        // But preventing member creation if email fails might be too harsh. 
        // I'll leave it as a logged error for now.
    }
};

module.exports = sendEmail;
