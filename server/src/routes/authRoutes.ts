/**
 * Auth Routes - Simple and Clean
 * 
 * POST /api/auth/register - Create new user
 * POST /api/auth/login    - Login user
 * POST /api/auth/logout   - Logout user
 * GET  /api/auth/me       - Get current user (protected)
 */

import { Router } from 'express';
import { register, login, logout, getMe } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

// Protected routes
router.get('/me', protect, getMe);

export default router;
