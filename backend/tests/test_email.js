const sendEmail = require('../utils/emailService');

async function test() {
    console.log('Testing email service...');
    try {
        const info = await sendEmail(
            'sahilhaq2003@gmail.com',
            'Test Email from Gym System',
            `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
                <h2 style="color: #2563eb;">Test Successful!</h2>
                <p>This is a test email from your Gym Management System.</p>
                <p>If you see this, your email configuration works perfectly.</p>
                <hr>
                <p style="font-size: 12px; color: #666;">Sent at: ${new Date().toLocaleString()}</p>
            </div>
            `
        );
        if (info) {
            console.log('✅ Email sent successfully!');
            console.log('Message ID:', info.messageId);
        } else {
            console.log('❌ Email function returned undefined (check logs above)');
        }
    } catch (error) {
        console.error('❌ Email failed:', error);
    }
}

test();
