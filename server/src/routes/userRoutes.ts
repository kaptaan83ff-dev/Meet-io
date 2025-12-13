
import express from 'express';
import {
    uploadAvatar,
    uploadMiddleware,
    updateProfile,
    updatePassword,
    getSessions,
    logoutAllSessions,
    deleteAccount
} from '../controllers/userController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.use(protect); // All routes are protected

// Avatar upload
router.post('/avatar', uploadMiddleware, uploadAvatar);

// Profile updates
router.put('/profile', updateProfile);

// Security
router.put('/password', updatePassword);
router.get('/sessions', getSessions);
router.delete('/sessions', logoutAllSessions);

// Delete account
router.delete('/me', deleteAccount);

export default router;
