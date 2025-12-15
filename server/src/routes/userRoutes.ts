import express from 'express';
import {
    uploadAvatar,
    uploadMiddleware,
    updateProfile,
    updatePassword,
    getSessions,
    logoutAllSessions,
    deleteAccount,
    revokeSession
} from '../controllers/userController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.use(protect); // All routes are protected

// Avatar upload - with error handling
router.post('/avatar', (req, res, next) => {
    uploadMiddleware(req, res, (err) => {
        if (err) {
            console.error('Multer error:', err);
            return res.status(400).json({
                success: false,
                error: err.message || 'File upload error'
            });
        }
        next();
    });
}, uploadAvatar);

// Profile updates
router.put('/profile', updateProfile);

// Security
router.put('/password', updatePassword);
router.get('/sessions', getSessions);
router.delete('/sessions', logoutAllSessions);
router.post('/revoke-session', revokeSession);

// Delete account
router.delete('/me', deleteAccount);

export default router;
