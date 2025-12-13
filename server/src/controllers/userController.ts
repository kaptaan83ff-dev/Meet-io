
import { Request, Response } from 'express';
import User from '../models/User';
import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';

// --- Multer Configuration ---
const storage = multer.memoryStorage(); // Store in memory for sharp processing

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|webp/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only image files are allowed!'));
    },
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

        const user = await User.findById(req.user._id);
        if (!user) {
            res.status(404).json({ success: false, error: 'User not found' });
            return;
        }

        // Generate filename: avatar-<userId>-<timestamp>.png
        const filename = `avatar-${user._id}-${Date.now()}.png`;

        // Define upload path (client/public/uploads)
        // Adjust path based on your project structure. Assuming server/src/controllers -> navigate up to client
        const uploadDir = path.join(__dirname, '../../../client/public/uploads');

        // Ensure directory exists
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Resize and save image
        await sharp(req.file.buffer)
            .resize(200, 200)
            .toFormat('png')
            .toFile(path.join(uploadDir, filename));

        // Update user avatar URL
        // URL should be accessible from frontend, e.g., /uploads/filename
        const avatarUrl = `/uploads/${filename}`;
        user.avatar = avatarUrl;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Avatar uploaded',
            avatar: avatarUrl,
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

        const user = await User.findById(req.user._id);
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

        const user = await User.findById(req.user._id).select('+password');
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

        const user = await User.findById(req.user._id);
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

        const user = await User.findById(req.user._id);
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

// Add Delete Account logic if desired from prompts
