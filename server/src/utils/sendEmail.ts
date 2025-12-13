import nodemailer from 'nodemailer';
import { env } from '../config/validateEnv';

export const sendEmail = async (to: string, subject: string, html: string) => {
    // Determine transport based on environment
    // Use proper SMTP in production, or Ethereal/console for dev if no creds

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.ethereal.email',
        port: Number(process.env.SMTP_PORT) || 587,
        auth: {
            user: process.env.SMTP_USER || 'test_user',
            pass: process.env.SMTP_PASS || 'test_pass',
        },
    });

    try {
        const info = await transporter.sendMail({
            from: `"Meet-io" <${process.env.SMTP_FROM || 'no-reply@meet-io.com'}>`,
            to,
            subject,
            html,
        });

        console.log(`📧 Email sent: ${info.messageId}`);
    } catch (error) {
        console.error('❌ Failed to send email:', error);
        // Don't throw by default to prevent crashing the request, 
        // but can be adjusted based on requirements
    }
};
