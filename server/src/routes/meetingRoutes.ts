import { Router } from 'express';
import {
    createMeeting,
    joinMeeting,
    getMeeting,
    getMyMeetings,
    getTodayMeetings,
    getUserMeetingHistory,
    getPendingParticipants,
    admitParticipant,
    denyParticipant,
    toggleWaitingRoom,
    deleteOldMeetings,
    inviteToMeeting,
} from '../controllers/meetingController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// All meeting routes require authentication
router.use(protect);

// Create new meeting
router.post('/', createMeeting);

// Join meeting by code
router.post('/join', joinMeeting);

// Waiting room actions
router.post('/admit', admitParticipant);
router.post('/deny', denyParticipant);

// Get user's meetings
router.get('/my', getMyMeetings);

// Get user's meetings for today
router.get('/today', getTodayMeetings);

// Get user's meeting history with pagination
router.get('/history', getUserMeetingHistory);

// Send invites
router.post('/:code/invite', inviteToMeeting);

// Delete old meetings
router.delete('/old', deleteOldMeetings);

// Get pending participants (host only)
router.get('/:code/pending', getPendingParticipants);

// Toggle waiting room (host only)
router.post('/:code/waiting-room', toggleWaitingRoom);

// Get specific meeting by ID
router.get('/:id', getMeeting);

export default router;
