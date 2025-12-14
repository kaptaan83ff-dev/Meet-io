import { Request, Response } from 'express';
import crypto from 'crypto';
import User from '../models/User';
import { sendTokenResponse } from '../utils/jwtHelper';
import { sendEmail } from '../utils/sendEmail';

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
            isVerified: false, // Explicitly set to false
        });

        // Generate verification token
        const verificationToken = user.getVerificationToken();
        await user.save({ validateBeforeSave: false });

        // Create verification URL
        // Frontend route: /verify-email/:token
        const verifyUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email/${verificationToken}`;

        const message = `
            <h1>Email Verification</h1>
            <p>Please verify your email address to activate your account.</p>
            <a href="${verifyUrl}" clicktracking=off>${verifyUrl}</a>
        `;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Email Verification - Meet.io',
                message,
            });

            res.status(200).json({
                success: true,
                message: `Verification email sent to ${email}`,
            });
        } catch (error) {
            user.verificationToken = undefined;
            user.verificationTokenExpires = undefined;
            await user.save({ validateBeforeSave: false });

            res.status(500).json({
                success: false,
                error: 'Email could not be sent',
            });
        }
    } catch (error: any) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Server error during registration',
        });
    }
};

/**
 * Verify Email
 * @route POST /api/auth/verify-email/:token
 * @access Public
 */
export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
    try {
        // Get token from params
        const verificationToken = crypto
            .createHash('sha256')
            .update(req.params.token)
            .digest('hex');

        // Find user with matching token and valid expiration
        const user = await User.findOne({
            verificationToken,
            verificationTokenExpires: { $gt: Date.now() },
        });

        if (!user) {
            res.status(400).json({
                success: false,
                error: 'Invalid or expired verification token',
            });
            return;
        }

        // Verify user and clear token
        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpires = undefined;

        await user.save();

        // Login user
        sendTokenResponse(user, 200, res);
    } catch (error: any) {
        console.error('Verify email error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Server error during verification',
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

        // Check if verified
        if (!user.isVerified) {
            res.status(401).json({
                success: false,
                error: 'Please verify your email to log in',
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

        // Optional: Limit active stations to prevent array bloat (e.g. keep last 5)
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
 * Forgot Password
 * @route POST /api/auth/forgot-password
 * @access Public
 */
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            res.status(404).json({
                success: false,
                error: 'No user found with that email',
            });
            return;
        }

        // Get reset token
        const resetToken = user.getResetPasswordToken();
        await user.save({ validateBeforeSave: false });

        // Create reset URL
        // Frontend route: /reset-password/:token
        const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

        const message = `
            <h1>Password Reset Request</h1>
            <p>You have requested a password reset. Please go to the following link to reset your password:</p>
            <a href="${resetUrl}" clicktracking=off>${resetUrl}</a>
        `;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Password Reset Token - Meet.io',
                message,
            });

            res.status(200).json({
                success: true,
                message: 'Email sent',
            });
        } catch (error) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save({ validateBeforeSave: false });

            res.status(500).json({
                success: false,
                error: 'Email could not be sent',
            });
        }
    } catch (error: any) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Server error',
        });
    }
};

/**
 * Reset Password
 * @route PUT /api/auth/reset-password/:token
 * @access Public
 */
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
        // Get token from params and hash it
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(req.params.token)
            .digest('hex');

        // Find user with matching token and valid expiry
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) {
            res.status(400).json({
                success: false,
                error: 'Invalid or expired token',
            });
            return;
        }

        // Set new password
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        // Login user
        sendTokenResponse(user, 200, res);
    } catch (error: any) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Server error',
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

        // Ensure social login users are verified
        if (!user.isVerified) {
            user.isVerified = true;
            await user.save({ validateBeforeSave: false });
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
