/**
 * Auth Controller - Simple and Clean
 * 
 * Handles user authentication:
 * - register: Create new user
 * - login: Authenticate user and set cookie
 * - logout: Clear cookie
 * - getMe: Get current logged-in user
 */

import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

// Get JWT secret from environment (with fallback for development)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d'; // Token valid for 7 days

/**
 * Generate JWT token for a user
 */
const generateToken = (userId: string): string => {
    return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * Set JWT as HTTP-only cookie
 */
const sendTokenResponse = (user: any, statusCode: number, res: Response) => {
    const token = generateToken(user._id);

    // Cookie options
    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: (process.env.NODE_ENV === 'production' ? 'none' : 'lax') as 'none' | 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    };

    // Set cookie and send response
    res.cookie('token', token, cookieOptions).status(statusCode).json({
        success: true,
        token, // Return token for localStorage fallback
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
        },
    });
};

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(400).json({ success: false, error: 'Email already registered' });
            return;
        }

        // Create user (password will be hashed by pre-save middleware)
        const user = await User.create({ name, email, password });

        // Send token in cookie
        sendTokenResponse(user, 201, res);
    } catch (error: any) {
        console.error('Register error:', error);
        res.status(500).json({ success: false, error: error.message || 'Registration failed' });
    }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            res.status(400).json({ success: false, error: 'Please provide email and password' });
            return;
        }

        // Find user and include password field
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            res.status(401).json({ success: false, error: 'Invalid credentials' });
            return;
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            res.status(401).json({ success: false, error: 'Invalid credentials' });
            return;
        }

        // Send token in cookie
        sendTokenResponse(user, 200, res);
    } catch (error: any) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, error: error.message || 'Login failed' });
    }
};

/**
 * @desc    Logout user (clear cookie)
 * @route   POST /api/auth/logout
 * @access  Public
 */
export const logout = async (_req: Request, res: Response): Promise<void> => {
    res.cookie('token', '', {
        httpOnly: true,
        expires: new Date(0), // Expire immediately
    });

    res.status(200).json({ success: true, message: 'Logged out successfully' });
};

/**
 * @desc    Get current logged-in user
 * @route   GET /api/auth/me
 * @access  Private (requires authentication)
 */
export const getMe = async (req: Request, res: Response): Promise<void> => {
    try {
        // req.user is set by the protect middleware
        const user = req.user;

        if (!user) {
            res.status(404).json({ success: false, error: 'User not found' });
            return;
        }

        // Check if there's a token to return (for client syncing)
        let token = req.cookies.token;
        if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        res.status(200).json({
            success: true,
            token, // Return current token so client can sync localStorage
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                role: user.role,
                title: user.title,
                bio: user.bio,
            },
        });
    } catch (error: any) {
        console.error('GetMe error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};
