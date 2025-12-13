
import { Request, Response, NextFunction } from 'express';

/**
 * Admin middleware - requires admin role
 * Must be used AFTER the protect middleware
 */
export const admin = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    // Check if user exists (set by protect middleware) and has admin role
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({
            success: false,
            error: 'Not authorized as an admin',
        });
    }
};
