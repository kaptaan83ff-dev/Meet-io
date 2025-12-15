/**
 * Auth Middleware - Simple and Clean
 * 
 * Protects routes by verifying JWT from cookie.
 * Attaches user to req.user if authenticated.
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

// Extend Express Request to include user
declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * Protect routes - require authentication
 * Usage: router.get('/protected', protect, handler);
 */
export const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // Get token from cookie
        const token = req.cookies.token;

        if (!token) {
            res.status(401).json({ success: false, error: 'Not authorized - no token' });
            return;
        }

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string };

        // Find user by ID from token
        const user = await User.findById(decoded.id);

        if (!user) {
            res.status(401).json({ success: false, error: 'Not authorized - user not found' });
            return;
        }

        // Attach user to request
        req.user = user;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({ success: false, error: 'Not authorized - invalid token' });
    }
};
