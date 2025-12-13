import { Request, Response } from 'express';
import Meeting from '../models/Meeting';
import { generateMeetingCode } from '../utils/codeGenerator';
import { generateToken, getLiveKitUrl } from '../utils/livekit';

/**
 * Create a new meeting
 * @route POST /api/meetings
 * @access Private
 */
import { sendEmail, generateICS } from '../utils/emailUtils';

/**
 * Create a new meeting (Scheduled or Instant)
 * @route POST /api/meetings
 * @access Private
 */
export const createMeeting = async (req: Request, res: Response): Promise<void> => {
    try {
        const { title, date, time, duration, description, settings, attendees, startTime: rawStartTime } = req.body;
        const hostId = req.user?._id;
        const hostName = req.user?.name || 'Host';
        const hostEmail = req.user?.email || 'noreply@meet.io';

        // --- VALIDATION ---

        // 1. Authentication Check
        if (!hostId) {
            res.status(401).json({ success: false, error: 'User not authenticated' });
            return;
        }

        // 2. Title Validation
        const trimmedTitle = (title || '').trim();
        if (!trimmedTitle) {
            res.status(400).json({ success: false, error: 'Meeting title is required.' });
            return;
        }
        if (trimmedTitle.length < 3 || trimmedTitle.length > 100) {
            res.status(400).json({ success: false, error: 'Title must be between 3 and 100 characters.' });
            return;
        }

        // 3. Construct & Validate StartTime
        let startTime: Date;
        const now = new Date();

        if (date && time) {
            // Scheduled meeting with date/time inputs
            startTime = new Date(`${date}T${time}`);
        } else if (rawStartTime) {
            // Scheduled meeting with ISO string
            startTime = new Date(rawStartTime);
        } else {
            // Instant meeting - starts now
            startTime = now;
        }

        // Validate Date is not invalid
        if (isNaN(startTime.getTime())) {
            res.status(400).json({ success: false, error: 'Invalid date or time format.' });
            return;
        }

        // Prevent scheduling in the past (allow 2 minute buffer for clock drift)
        const isScheduledMeeting = date && time;
        if (isScheduledMeeting && startTime.getTime() < now.getTime() - 2 * 60 * 1000) {
            res.status(400).json({ success: false, error: 'Cannot schedule a meeting in the past.' });
            return;
        }

        // 4. Duration Validation
        const meetingDuration = Number(duration) || 60;
        if (meetingDuration < 5 || meetingDuration > 480) {
            res.status(400).json({ success: false, error: 'Duration must be between 5 and 480 minutes (8 hours).' });
            return;
        }

        // 5. Attendees Validation
        const validAttendees: { email: string; status: string }[] = [];
        if (attendees && Array.isArray(attendees)) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            for (const att of attendees) {
                const email = (att.email || '').trim().toLowerCase();
                if (email && emailRegex.test(email)) {
                    validAttendees.push({ email, status: 'pending' });
                }
            }
        }

        // 6. Duplicate Check (prevent double-submit)
        const existingMeeting = await Meeting.findOne({
            hostId,
            title: trimmedTitle,
            startTime,
            status: { $in: ['scheduled', 'active'] }
        });

        if (existingMeeting) {
            res.status(409).json({ success: false, error: 'A meeting with this title and time already exists.' });
            return;
        }

        // --- CREATE MEETING ---
        const code = await generateMeetingCode();

        const meeting = await Meeting.create({
            title: trimmedTitle,
            code,
            hostId,
            startTime,
            duration: meetingDuration,
            description: (description || '').trim().substring(0, 500),
            settings: {
                waitingRoom: settings?.waitingRoom ?? false,
                muteOnEntry: settings?.muteOnEntry ?? false,
            },
            attendees: validAttendees,
            status: isScheduledMeeting ? 'scheduled' : 'active',
            participants: [{ userId: hostId, joinedAt: new Date() }],
            isActive: true,
        });

        await meeting.populate('hostId', 'name email avatar');

        // Send Invitations if attendees exist
        if (attendees && attendees.length > 0) {
            // Generate ICS file
            const icsContent = await generateICS({
                title: meeting.title,
                description: meeting.description,
                startTime: meeting.startTime,
                durationMinutes: meeting.duration,
                url: `${Boolean(process.env.CLIENT_URL) ? process.env.CLIENT_URL : 'http://localhost:5173'}/meeting/${code}`,
                organizer: { name: hostName, email: hostEmail },
                attendees: attendees.map((a: any) => ({ email: a.email })),
            });

            // Send emails asynchronously (don't block response)
            const emailPromises = attendees.map((attendee: any) => {
                const meetingLink = `${Boolean(process.env.CLIENT_URL) ? process.env.CLIENT_URL : 'http://localhost:5173'}/meeting/${code}`;
                const htmlContent = `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                        <h2 style="color: #2563eb;">You're invited to a meeting</h2>
                        <p><strong>${hostName}</strong> has invited you to join a video meeting.</p>
                        
                        <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="margin: 0 0 10px 0;">${meeting.title}</h3>
                            ${meeting.description ? `<p style="color: #64748b; margin: 0 0 10px 0;">${meeting.description}</p>` : ''}
                            <p style="margin: 5px 0;"><strong>Time:</strong> ${new Date(meeting.startTime).toLocaleString()}</p>
                            <p style="margin: 5px 0;"><strong>Duration:</strong> ${meeting.duration} minutes</p>
                        </div>

                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${meetingLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Join Meeting</a>
                        </div>
                        
                        <p style="color: #64748b; font-size: 14px;">Or copy this link: <a href="${meetingLink}">${meetingLink}</a></p>
                    </div>
                `;

                return sendEmail(
                    attendee.email,
                    `Invitation: ${meeting.title}`,
                    htmlContent,
                    [{
                        filename: 'invite.ics',
                        content: icsContent,
                        contentType: 'text/calendar'
                    }]
                );
            });

            // Trigger email sending but don't await to keep response fast
            Promise.all(emailPromises).catch(err => console.error("Failed to send invitations:", err));
        }

        res.status(201).json({
            success: true,
            meeting,
        });
    } catch (error: any) {
        console.error('Create meeting error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Server error while creating meeting',
        });
    }
};

/**
 * Join a meeting by code
 * @route POST /api/meetings/join
 * @access Private
 */
export const joinMeeting = async (req: Request, res: Response): Promise<void> => {
    try {
        const { code } = req.body;
        const userId = req.user?._id;
        const userName = req.user?.name || 'Guest';

        // Validation
        if (!code) {
            res.status(400).json({
                success: false,
                error: 'Please provide a meeting code',
            });
            return;
        }

        if (!userId) {
            res.status(401).json({
                success: false,
                error: 'User not authenticated',
            });
            return;
        }

        // Find meeting by code
        const meeting = await Meeting.findOne({
            code: code.toUpperCase(),
            isActive: true,
        }).populate('hostId', 'name email avatar');

        if (!meeting) {
            res.status(404).json({
                success: false,
                error: 'Meeting not found or has ended',
            });
            return;
        }

        const isHost = meeting.hostId._id.toString() === userId.toString();

        // Check Meeting Status
        if (meeting.status === 'scheduled') {
            if (isHost) {
                // Host starting the meeting
                meeting.status = 'active';
                // meeting.isActive = true; // Sync
                await meeting.save();
                console.log(`Meeting ${meeting.code} started by host`);
            } else {
                // Guest trying to join early
                res.status(200).json({
                    success: true,
                    status: 'not_started',
                    meeting: {
                        _id: meeting._id,
                        title: meeting.title,
                        code: meeting.code,
                        hostId: meeting.hostId,
                        startTime: meeting.startTime,
                    },
                    message: 'The meeting has not started yet',
                });
                return;
            }
        } else if (meeting.status === 'ended') {
            res.status(404).json({
                success: false,
                error: 'This meeting has ended',
            });
            return;
        }

        // Check if waiting room is enabled and user is not the host
        if (meeting.settings?.waitingRoom && !isHost) { // Updated to check settings.waitingRoom
            // Check if user is already a participant (previously admitted)
            const isParticipant = meeting.participants.some(
                (p) => p.userId.toString() === userId.toString()
            );

            if (!isParticipant) {
                // Check if already in pending list
                const isPending = meeting.pendingParticipants.some(
                    (p) => p.userId.toString() === userId.toString()
                );

                if (!isPending) {
                    // Add to pending participants
                    meeting.pendingParticipants.push({
                        userId,
                        name: userName,
                        requestedAt: new Date(),
                    });
                    await meeting.save();
                }

                // Return pending status (no token yet)
                res.status(200).json({
                    success: true,
                    status: 'pending',
                    meeting: {
                        _id: meeting._id,
                        title: meeting.title,
                        code: meeting.code,
                        hostId: meeting.hostId,
                    },
                    message: 'Waiting for host to admit you',
                });
                return;
            }
        }

        // Host or waiting room disabled or already admitted - proceed normally
        const isParticipant = meeting.participants.some(
            (p) => p.userId.toString() === userId.toString()
        );

        if (!isParticipant) {
            // Add user to participants
            meeting.participants.push({
                userId,
                joinedAt: new Date(),
            });
            await meeting.save();
        }

        // Generate LiveKit token for the user
        const livekitToken = await generateToken(
            userId.toString(),
            meeting.code,
            userName
        );

        res.status(200).json({
            success: true,
            status: 'admitted',
            meeting,
            token: livekitToken,
            livekit: {
                token: livekitToken,
                url: getLiveKitUrl(),
            },
            isHost,
        });
    } catch (error: any) {
        console.error('Join meeting error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Server error while joining meeting',
        });
    }
};

/**
 * Get meeting details by ID
 * @route GET /api/meetings/:id
 * @access Private
 */
export const getMeeting = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = req.user?._id;

        if (!userId) {
            res.status(401).json({
                success: false,
                error: 'User not authenticated',
            });
            return;
        }

        // Find meeting and populate host and participants
        const meeting = await Meeting.findById(id)
            .populate('hostId', 'name email avatar')
            .populate('participants.userId', 'name email avatar');

        if (!meeting) {
            res.status(404).json({
                success: false,
                error: 'Meeting not found',
            });
            return;
        }

        res.status(200).json({
            success: true,
            meeting,
        });
    } catch (error: any) {
        console.error('Get meeting error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Server error while fetching meeting',
        });
    }
};

/**
 * Get user's meetings (hosted and participated)
 * @route GET /api/meetings/my
 * @access Private
 */
export const getMyMeetings = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?._id;
        const userEmail = req.user?.email;

        if (!userId) {
            res.status(401).json({
                success: false,
                error: 'User not authenticated',
            });
            return;
        }

        // Find meetings where user is host OR participant OR invited attendee
        const meetings = await Meeting.find({
            $or: [
                { hostId: userId },
                { 'participants.userId': userId },
                { 'attendees.email': userEmail }
            ],
        })
            .populate('hostId', 'name email avatar')
            .sort({ startTime: -1 })
            .limit(20);

        res.status(200).json({
            success: true,
            count: meetings.length,
            meetings,
        });
    } catch (error: any) {
        console.error('Get my meetings error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Server error while fetching meetings',
        });
    }
};

/**
 * Get user's meetings for today (00:00 to 23:59)
 * @route GET /api/meetings/today
 * @access Private
 */
export const getTodayMeetings = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?._id;
        const userEmail = req.user?.email;

        if (!userId) {
            res.status(401).json({
                success: false,
                error: 'User not authenticated',
            });
            return;
        }

        const now = new Date();
        const startOfDay = new Date(now.setHours(0, 0, 0, 0));
        const endOfDay = new Date(now.setHours(23, 59, 59, 999));

        const meetings = await Meeting.find({
            $or: [
                { hostId: userId },
                { 'participants.userId': userId },
                { 'attendees.email': userEmail }
            ],
            startTime: {
                $gte: startOfDay,
                $lte: endOfDay
            }
        })
            .populate('hostId', 'name email avatar')
            .sort({ startTime: 1 });

        res.status(200).json({
            success: true,
            count: meetings.length,
            meetings,
        });
    } catch (error: any) {
        console.error('Get today meetings error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Server error while fetching today meetings',
        });
    }
};

/**
 * Get pending participants for a meeting (host only)
 * @route GET /api/meetings/:code/pending
 * @access Private (Host only)
 */
export const getPendingParticipants = async (req: Request, res: Response): Promise<void> => {
    try {
        const { code } = req.params;
        const userId = req.user?._id;

        if (!userId) {
            res.status(401).json({ success: false, error: 'User not authenticated' });
            return;
        }

        const meeting = await Meeting.findOne({ code: code.toUpperCase() });

        if (!meeting) {
            res.status(404).json({ success: false, error: 'Meeting not found' });
            return;
        }

        // Verify user is host
        if (meeting.hostId.toString() !== userId.toString()) {
            res.status(403).json({ success: false, error: 'Only the host can view pending participants' });
            return;
        }

        res.status(200).json({
            success: true,
            pendingParticipants: meeting.pendingParticipants,
        });
    } catch (error: any) {
        console.error('Get pending participants error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Admit a participant from waiting room
 * @route POST /api/meetings/admit
 * @access Private (Host only)
 */
export const admitParticipant = async (req: Request, res: Response): Promise<void> => {
    try {
        const { code, participantId } = req.body;
        const userId = req.user?._id;

        if (!userId) {
            res.status(401).json({ success: false, error: 'User not authenticated' });
            return;
        }

        const meeting = await Meeting.findOne({ code: code.toUpperCase() });

        if (!meeting) {
            res.status(404).json({ success: false, error: 'Meeting not found' });
            return;
        }

        // Verify user is host
        if (meeting.hostId.toString() !== userId.toString()) {
            res.status(403).json({ success: false, error: 'Only the host can admit participants' });
            return;
        }

        // Find and remove from pending
        const pendingIndex = meeting.pendingParticipants.findIndex(
            (p) => p.userId.toString() === participantId
        );

        if (pendingIndex === -1) {
            res.status(404).json({ success: false, error: 'Participant not found in waiting room' });
            return;
        }

        const pendingUser = meeting.pendingParticipants[pendingIndex];
        meeting.pendingParticipants.splice(pendingIndex, 1);

        // Add to participants
        meeting.participants.push({
            userId: pendingUser.userId,
            joinedAt: new Date(),
        });

        await meeting.save();

        // Generate token for the admitted user
        const livekitToken = await generateToken(
            participantId,
            meeting.code,
            pendingUser.name
        );

        res.status(200).json({
            success: true,
            message: 'Participant admitted',
            participantId,
            token: livekitToken,
            livekit: {
                token: livekitToken,
                url: getLiveKitUrl(),
            },
        });
    } catch (error: any) {
        console.error('Admit participant error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Deny a participant from waiting room
 * @route POST /api/meetings/deny
 * @access Private (Host only)
 */
export const denyParticipant = async (req: Request, res: Response): Promise<void> => {
    try {
        const { code, participantId } = req.body;
        const userId = req.user?._id;

        if (!userId) {
            res.status(401).json({ success: false, error: 'User not authenticated' });
            return;
        }

        const meeting = await Meeting.findOne({ code: code.toUpperCase() });

        if (!meeting) {
            res.status(404).json({ success: false, error: 'Meeting not found' });
            return;
        }

        // Verify user is host
        if (meeting.hostId.toString() !== userId.toString()) {
            res.status(403).json({ success: false, error: 'Only the host can deny participants' });
            return;
        }

        // Find and remove from pending
        const pendingIndex = meeting.pendingParticipants.findIndex(
            (p) => p.userId.toString() === participantId
        );

        if (pendingIndex === -1) {
            res.status(404).json({ success: false, error: 'Participant not found in waiting room' });
            return;
        }

        meeting.pendingParticipants.splice(pendingIndex, 1);
        await meeting.save();

        res.status(200).json({
            success: true,
            message: 'Participant denied',
            participantId,
        });
    } catch (error: any) {
        console.error('Deny participant error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Toggle waiting room for a meeting
 * @route POST /api/meetings/:code/waiting-room
 * @access Private (Host only)
 */
export const toggleWaitingRoom = async (req: Request, res: Response): Promise<void> => {
    try {
        const { code } = req.params;
        const { enabled } = req.body;
        const userId = req.user?._id;

        if (!userId) {
            res.status(401).json({ success: false, error: 'User not authenticated' });
            return;
        }

        const meeting = await Meeting.findOne({ code: code.toUpperCase() });

        if (!meeting) {
            res.status(404).json({ success: false, error: 'Meeting not found' });
            return;
        }

        if (meeting.hostId.toString() !== userId.toString()) {
            res.status(403).json({ success: false, error: 'Only the host can toggle waiting room' });
            return;
        }

        if (!meeting.settings) {
            meeting.settings = { waitingRoom: false, muteOnEntry: false };
        }

        meeting.settings.waitingRoom = enabled;
        meeting.markModified('settings'); // standard mongoose requirement for mixed/nested updates if strict is off, but safe here
        await meeting.save();

        res.status(200).json({
            success: true,
            waitingRoomEnabled: meeting.settings.waitingRoom,
        });
    } catch (error: any) {
        console.error('Toggle waiting room error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};
