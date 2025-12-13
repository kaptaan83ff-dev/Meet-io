
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwtHelper';
import User, { IUser } from '../models/User';

/**
 * Protect routes - require authentication
 */
export const protect = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        let token: string | undefined;

        // Check for token in cookie
        if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }
        // Also check Authorization header for non-browser clients
        else if (req.headers.authorization?.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            res.status(401).json({
                success: false,
                error: 'Not authorized to access this route',
            });
            return;
        }

        // Verify token
        const decoded = verifyToken(token);

        if (!decoded) {
            res.status(401).json({
                success: false,
                error: 'Invalid or expired token',
            });
            return;
        }

        // Get user from token
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            res.status(404).json({
                success: false,
                error: 'User not found',
            });
            return;
        }

        // Attach user to request
        (req as any).user = user;
        next();
    } catch (error) {
        // Only log actual errors, not just 401/404s which are expected flows
        if ((error as any).message !== 'Not authorized') {
            // console.error('Auth middleware error:', error); 
        }
        res.status(401).json({
            success: false,
            error: 'Invalid or expired token',
        });
    }
};
