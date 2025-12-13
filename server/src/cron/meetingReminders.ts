import cron from 'node-cron';
import Meeting from '../models/Meeting';
import { sendEmail } from '../utils/emailUtils';

/**
 * Initialize the meeting reminder cron job
 * Runs every minute to check for meetings starting in ~30 minutes
 */
export const initMeetingReminders = () => {
    console.log('Initializing meeting reminder cron job...');

    // Run every minute
    cron.schedule('* * * * *', async () => {
        try {
            const now = new Date();
            const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000 + 59000); // 30 mins window (+ margin)
            const twentyNineMinutesFromNow = new Date(now.getTime() + 29 * 60 * 1000); // lower bound

            // Find meetings that:
            // 1. Are scheduled
            // 2. Start roughly 30 minutes from now
            // 3. Have not had a reminder sent yet
            const upcomingMeetings = await Meeting.find({
                status: 'scheduled',
                reminderSent: false,
                startTime: {
                    $gte: twentyNineMinutesFromNow,
                    $lte: thirtyMinutesFromNow
                }
            }).populate('hostId', 'name email');

            if (upcomingMeetings.length > 0) {
                console.log(`Found ${upcomingMeetings.length} meetings starting in ~30 minutes.`);
            }

            for (const meeting of upcomingMeetings) {
                console.log(`Sending reminders for meeting: ${meeting.title}`);

                // Send to attendees
                if (meeting.attendees && meeting.attendees.length > 0) {
                    const hostName = (meeting.hostId as any).name || 'Host';
                    const meetingLink = `${process.env.CLIENT_URL || 'http://localhost:5173'}/meeting/${meeting.code}`;

                    const promises = meeting.attendees.map(attendee => {
                        const htmlContent = `
                            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                                <h2 style="color: #f59e0b;">Meeting Remediner</h2>
                                <p>This is a reminder that the meeting <strong>${meeting.title}</strong> hosted by <strong>${hostName}</strong> will start in approximately 30 minutes.</p>
                                
                                <div style="background-color: #fffbeb; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #fcd34d;">
                                    <h3 style="margin: 0 0 10px 0; color: #92400e;">${meeting.title}</h3>
                                    <p style="margin: 5px 0;"><strong>Time:</strong> ${new Date(meeting.startTime).toLocaleString()}</p>
                                </div>

                                <div style="text-align: center; margin: 30px 0;">
                                    <a href="${meetingLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Join Meeting</a>
                                </div>
                            </div>
                        `;

                        return sendEmail(
                            attendee.email,
                            `Reminder: ${meeting.title} starts in 30 minutes`,
                            htmlContent
                        );
                    });

                    await Promise.all(promises);
                }

                // Mark as sent
                meeting.reminderSent = true;
                await meeting.save();
            }

        } catch (error) {
            console.error('Error in meeting reminder cron job:', error);
        }
    });
};
