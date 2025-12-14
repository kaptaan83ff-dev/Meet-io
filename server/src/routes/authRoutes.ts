import { Router } from 'express';
import passport from 'passport';
import {
    register,
    login,
    logout,
    getMe,
    verifyEmail,
    forgotPassword,
    resetPassword,
    socialLoginCallback
} from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/verify-email/:token', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

// Google Auth
router.get(
    '/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
    '/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/login' }),
    socialLoginCallback
);

// GitHub Auth
router.get(
    '/github',
    passport.authenticate('github', { scope: ['user:email'] })
);

router.get(
    '/github/callback',
    passport.authenticate('github', { session: false, failureRedirect: '/login' }),
    socialLoginCallback
);

// Protected routes
router.get('/me', protect, getMe);

export default router;
