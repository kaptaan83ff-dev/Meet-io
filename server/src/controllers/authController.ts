import { Request, Response } from 'express';
import User from '../models/User';
import { sendTokenResponse } from '../utils/jwtHelper';

/**
 * Register new user
 * @route POST /api/auth/register
 * @access Public
 */
export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password } = req.body;

        // Validation
        if (!name || !email || !password) {
            res.status(400).json({
                success: false,
                error: 'Please provide name, email, and password',
            });
            return;
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(400).json({
                success: false,
                error: 'Email already in use',
            });
            return;
        }

        // Create user (password will be hashed automatically by pre-save hook)
        const user = await User.create({
            name,
            email,
            password,
        });

        // Send token response
        sendTokenResponse(user, 201, res);
    } catch (error: any) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Server error during registration',
        });
    }
};

/**
 * Login user
 * @route POST /api/auth/login
 * @access Public
 */
export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            res.status(400).json({
                success: false,
                error: 'Please provide email and password',
            });
            return;
        }

        // Find user and include password field
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            res.status(401).json({
                success: false,
                error: 'Invalid credentials',
            });
            return;
        }

        // Check password
        const isPasswordCorrect = await user.comparePassword(password);

        if (!isPasswordCorrect) {
            res.status(401).json({
                success: false,
                error: 'Invalid credentials',
            });
            return;
        }

        // Store Session
        const ip = req.ip || req.connection.remoteAddress;
        const userAgent = req.headers['user-agent'];

        user.sessions.push({
            ip: ip as string,
            userAgent: userAgent as string,
            lastActive: new Date(),
        });

        // Optional: Limit active sessions to prevent array bloat (e.g. keep last 5)
        if (user.sessions.length > 5) {
            user.sessions.shift();
        }

        await user.save();

        // Send token response
        sendTokenResponse(user, 200, res);
    } catch (error: any) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Server error during login',
        });
    }
};

/**
 * Logout user
 * @route POST /api/auth/logout
 * @access Public
 */
export const logout = async (req: Request, res: Response): Promise<void> => {
    try {
        // Clear cookie
        res.cookie('token', 'none', {
            expires: new Date(Date.now() + 1000), // Expire in 1 second
            httpOnly: true,
        });

        res.status(200).json({
            success: true,
            message: 'Logged out successfully',
        });
    } catch (error: any) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Server error during logout',
        });
    }
};

/**
 * Get current logged in user
 * @route GET /api/auth/me
 * @access Private
 */
export const getMe = async (req: Request, res: Response): Promise<void> => {
    try {
        // User is already attached to req by protect middleware
        const user = req.user;

        if (!user) {
            res.status(404).json({
                success: false,
                error: 'User not found',
            });
            return;
        }

        res.status(200).json({
            success: true,
            user,
        });
    } catch (error: any) {
        console.error('Get me error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Server error',
        });
    }
};

/**
 * Handle Social Login Callback
 * Redirects to frontend with token
 */
export const socialLoginCallback = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = req.user as any;
        if (!user) {
            res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=auth_failed`);
            return;
        }

        // Generate token
        const token = user.getSignedJwtToken();

        // Redirect to frontend with token
        res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?token=${token}`);
    } catch (error) {
        console.error('Social login callback error:', error);
        res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=server_error`);
    }
};
