import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export const sendEmail = async ({ to, subject, html }) => {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
        console.warn('[EmailService] SMTP not configured. Skipping email send.');
        console.log(`[EmailService] To: ${to}, Subject: ${subject}`);
        return;
    }

    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM || '"Task Manager" <noreply@taskmanager.com>',
            to,
            subject,
            html,
        });
        console.log('[EmailService] Message sent: %s', info.messageId);
        return info;
    } catch (error) {
        console.error('[EmailService] Error sending email:', error);
        throw error;
    }
};
