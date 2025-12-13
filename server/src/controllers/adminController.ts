
import { Request, Response } from 'express';
import User from '../models/User';

/**
 * @desc    Get all users
 * @route   GET /api/admin/users
 * @access  Private/Admin
 */
export const getAllUsers = async (req: Request, res: Response) => {
    try {
        // Find all users (-password excludes the password field)
        const users = await User.find({}).select('-password').sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: users.length,
            users
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message || 'Server Error'
        });
    }
};

/**
 * @desc    Delete user
 * @route   DELETE /api/admin/users/:id
 * @access  Private/Admin
 */
export const deleteUser = async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            res.status(404).json({
                success: false,
                error: 'User not found'
            });
            return;
        }

        // Prevent admin from deleting themselves
        if (req.user && req.user._id.toString() === user._id.toString()) {
            res.status(400).json({
                success: false,
                error: 'You cannot delete your own admin account'
            });
            return;
        }

        await user.deleteOne();

        res.status(200).json({
            success: true,
            message: 'User removed'
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message || 'Server Error'
        });
    }
};

/**
 * @desc    Update user role
 * @route   PATCH /api/admin/users/:id/role
 * @access  Private/Admin
 */
export const updateUserRole = async (req: Request, res: Response) => {
    try {
        const { role } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            res.status(404).json({
                success: false,
                error: 'User not found'
            });
            return;
        }

        // Prevent admin from changing their own role
        if (req.user && req.user._id.toString() === user._id.toString()) {
            res.status(400).json({
                success: false,
                error: 'You cannot change your own role'
            });
            return;
        }

        // Validate role
        if (role !== 'user' && role !== 'admin') {
            res.status(400).json({
                success: false,
                error: 'Invalid role. Must be "user" or "admin"'
            });
            return;
        }

        user.role = role;
        await user.save();

        res.status(200).json({
            success: true,
            message: `User role updated to ${role}`,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt
            }
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message || 'Server Error'
        });
    }
};
