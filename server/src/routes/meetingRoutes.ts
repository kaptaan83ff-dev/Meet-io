import { Router } from 'express';
import {
    createMeeting,
    joinMeeting,
    getMeeting,
    getMyMeetings,
    getTodayMeetings,
    getPendingParticipants,
    admitParticipant,
    denyParticipant,
    toggleWaitingRoom,
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

// Get pending participants (host only)
router.get('/:code/pending', getPendingParticipants);

// Toggle waiting room (host only)
router.post('/:code/waiting-room', toggleWaitingRoom);

// Get specific meeting by ID
router.get('/:id', getMeeting);

export default router;
