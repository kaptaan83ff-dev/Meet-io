import { Request, Response } from 'express';
import User from '../models/User';
import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

// --- Multer Configuration ---
const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    // Remove strict fileFilter for cropped blobs
});

export const uploadMiddleware = upload.single('avatar');

// --- Controllers ---

/**
 * @desc    Upload user avatar
 * @route   POST /api/users/avatar
 * @access  Private
 */
export const uploadAvatar = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            res.status(400).json({ success: false, error: 'Please upload a file' });
            return;
        }

        if (!req.user) {
            res.status(401).json({ success: false, error: 'Not authorized' });
            return;
        }

        const user = await User.findById((req.user as any)._id);
        if (!user) {
            res.status(404).json({ success: false, error: 'User not found' });
            return;
        }

        // Resize image and convert to base64
        const resizedImageBuffer = await sharp(req.file.buffer)
            .resize(200, 200)
            .toFormat('png')
            .toBuffer();

        // Convert to base64 data URL
        const base64Image = `data:image/png;base64,${resizedImageBuffer.toString('base64')}`;

        // Update user avatar (store as base64)
        user.avatar = base64Image;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Avatar uploaded',
            avatar: base64Image,
        });
    } catch (error: any) {
        console.error('Avatar upload error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Server Error',
        });
    }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
export const updateProfile = async (req: Request, res: Response) => {
    try {
        const { name, bio, title } = req.body;

        if (!req.user) {
            res.status(401).json({ success: false, error: 'Not authorized' });
            return;
        }

        const user = await User.findById((req.user as any)._id);
        if (!user) {
            res.status(404).json({ success: false, error: 'User not found' });
            return;
        }

        user.name = name || user.name;
        user.bio = bio !== undefined ? bio : user.bio;
        user.title = title !== undefined ? title : user.title;

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Profile updated',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                role: user.role,
                bio: user.bio,
                title: user.title,
            },
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message || 'Server Error',
        });
    }
};

/**
 * @desc    Update password
 * @route   PUT /api/users/password
 * @access  Private
 */
export const updatePassword = async (req: Request, res: Response) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!req.user) {
            res.status(401).json({ success: false, error: 'Not authorized' });
            return;
        }

        const user = await User.findById((req.user as any)._id).select('+password');
        if (!user) {
            res.status(404).json({ success: false, error: 'User not found' });
            return;
        }

        // Check current password
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            res.status(401).json({ success: false, error: 'Incorrect current password' });
            return;
        }

        user.password = newPassword;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password updated',
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message || 'Server Error',
        });
    }
};

/**
 * @desc    Get active sessions
 * @route   GET /api/users/sessions
 * @access  Private
 */
export const getSessions = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'Not authorized' });
            return;
        }

        const user = await User.findById((req.user as any)._id);
        if (!user) {
            res.status(404).json({ success: false, error: 'User not found' });
            return;
        }

        // In a real app with proper session storage, we would have meaningful data here.
        // Since we are adding this to the model now, it might be empty initially.
        // We will just return the sessions array.
        // Note: Currently we are not pushing to this array on login in authController.
        // That logic needs to be added to authController.login if we want this to be populated.
        // For now, let's return a dummy "Current Session" based on the request.

        const currentSession = {
            ip: req.ip,
            userAgent: req.headers['user-agent'],
            lastActive: new Date(),
            current: true
        };

        // Combine stored sessions with current (deduplication logic would be needed ideally)
        const sessions = user.sessions || [];

        res.status(200).json({
            success: true,
            sessions: [currentSession, ...sessions],
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message || 'Server Error',
        });
    }
};

/**
 * @desc    Log out all other sessions (delete account logic placeholder)
 * @route   DELETE /api/users/sessions
 * @access  Private
 */
export const logoutAllSessions = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'Not authorized' });
            return;
        }

        const user = await User.findById((req.user as any)._id);
        if (!user) {
            res.status(404).json({ success: false, error: 'User not found' });
            return;
        }

        user.sessions = [];
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Logged out of all other devices',
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message || 'Server Error',
        });
    }
};

/**
 * @desc    Delete user account permanently
 * @route   DELETE /api/users/me
 * @access  Private
 */
export const deleteAccount = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'Not authorized' });
            return;
        }

        const userId = (req.user as any)._id;

        // Find and delete user
        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({ success: false, error: 'User not found' });
            return;
        }

        // Optionally: Delete user's hosted meetings (import Meeting model if needed)
        // For now, we just delete the user. In a real app, you'd handle orphaned data.

        // Delete the user
        await User.findByIdAndDelete(userId);

        // Clear the auth cookie
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
        });

        res.status(200).json({
            success: true,
            message: 'Account deleted successfully',
        });
    } catch (error: any) {
        console.error('Delete account error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Server Error',
        });
    }
};
/**
 * @desc    Revoke a specific session
 * @route   POST /api/users/revoke-session
 * @access  Private
 */
export const revokeSession = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'Not authorized' });
            return;
        }

        const { sessionId } = req.body;
        const user = await User.findById((req.user as any)._id);

        if (!user) {
            res.status(404).json({ success: false, error: 'User not found' });
            return;
        }

        const initialLength = user.sessions.length;
        user.sessions = user.sessions.filter(s => s._id && s._id.toString() !== sessionId);

        if (user.sessions.length === initialLength) {
            res.status(404).json({ success: false, error: 'Session not found' });
            return;
        }

        await user.save({ validateBeforeSave: false });

        res.status(200).json({
            success: true,
            message: 'Session revoked',
            sessions: user.sessions
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message || 'Server Error'
        });
    }
};
