import jwt from 'jsonwebtoken';
import { Response } from 'express';
import { env } from '../config/validateEnv';
import { IUser } from '../models/User';

/**
 * Generate JWT token
 * @param userId - User ID to encode in token
 * @returns JWT token string
 */
export const generateToken = (userId: string): string => {
    return jwt.sign({ id: userId }, env.JWT_SECRET, {
        expiresIn: '7d', // 7 days
    });
};

/**
 * Send token response with HTTP-Only cookie
 * @param user - User object
 * @param statusCode - HTTP status code
 * @param res - Express response object
 */
export const sendTokenResponse = (
    user: IUser,
    statusCode: number,
    res: Response
): void => {
    // Generate token
    const token = generateToken(user._id.toString());

    // Cookie options
    const cookieOptions = {
        httpOnly: true, // Prevents XSS attacks
        secure: env.NODE_ENV === 'production', // HTTPS only in production
        sameSite: 'strict' as const, // CSRF protection
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    };

    // Remove password from output
    const userObject = user.toObject();
    delete (userObject as any).password;

    res
        .status(statusCode)
        .cookie('token', token, cookieOptions)
        .json({
            success: true,
            token, // Also send in response body for non-browser clients
            user: userObject,
        });
};

/**
 * Verify JWT token
 * @param token - JWT token string
 * @returns Decoded token payload or null if invalid
 */
export const verifyToken = (token: string): { id: string } | null => {
    try {
        const decoded = jwt.verify(token, env.JWT_SECRET) as { id: string };
        return decoded;
    } catch (error) {
        return null;
    }
};
