import { sendEmail } from './src/utils/emailService.js';
import dotenv from 'dotenv';
dotenv.config();

console.log('Testing Email Service...');

if (process.env.SMTP_HOST === 'smtp.example.com') {
    console.log('[TEST] Detected default config. Expecting connection error or mock output.');
}

sendEmail({
    to: 'test@example.com',
    subject: 'Test Email from Task Manager',
    html: '<p>This is a test email.</p>'
}).then(() => {
    console.log('[TEST] Email send attempt completed.');
}).catch((err) => {
    console.error('[TEST] Email send failed as expected (dummy credentials):', err.message);
});
