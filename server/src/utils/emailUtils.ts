import nodemailer from 'nodemailer';
import { createEvent, DateArray } from 'ics';
import { env } from '../config/validateEnv';

interface EmailAttachment {
    filename: string;
    content: string | Buffer;
    contentType?: string;
}

export const sendEmail = async (
    to: string | string[],
    subject: string,
    html: string,
    attachments: EmailAttachment[] = []
): Promise<boolean> => {
    try {
        // Create reusable transporter object using the default SMTP transport
        // For development, if no credentials are provided, we log email to console.
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.ethereal.email',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER || 'ethereal_user', // generated ethereal user
                pass: process.env.SMTP_PASS || 'ethereal_pass', // generated ethereal password
            },
        });

        // In development/dry-run mode or if strictly testing
        if (env.NODE_ENV === 'development' && !process.env.SMTP_HOST) {
            console.log('---------------------------------------------------');
            console.log(`[Email Utils] Would send email to: ${Array.isArray(to) ? to.join(', ') : to}`);
            console.log(`[Email Utils] Subject: ${subject}`);
            console.log(`[Email Utils] Attachments: ${attachments.length}`);
            console.log('---------------------------------------------------');
            return true;
        }

        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM || '"Meet.io" <noreply@meet.io>', // sender address
            to: Array.isArray(to) ? to.join(', ') : to, // list of receivers
            subject, // Subject line
            html, // html body
            attachments,
        });

        console.log('Message sent: %s', info.messageId);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};

interface MeetingDetails {
    title: string;
    description?: string;
    startTime: Date;
    durationMinutes: number;
    url: string;
    organizer: { name: string; email: string };
    attendees: { name?: string; email: string }[];
}

export const generateICS = (meeting: MeetingDetails): Promise<string> => {
    return new Promise((resolve, reject) => {
        const start = new Date(meeting.startTime);
        const duration = meeting.durationMinutes || 60;

        // Format date to [year, month, day, hour, minute]
        const startDate: DateArray = [
            start.getFullYear(),
            start.getMonth() + 1,
            start.getDate(),
            start.getHours(),
            start.getMinutes(),
        ];

        createEvent(
            {
                start: startDate,
                duration: { minutes: duration },
                title: meeting.title,
                description: meeting.description || `Join your meeting: ${meeting.url}`,
                location: meeting.url,
                url: meeting.url,
                organizer: meeting.organizer,
                attendees: meeting.attendees,
                status: 'CONFIRMED',
                busyStatus: 'BUSY',
            },
            (error, value) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(value);
            }
        );
    });
};
