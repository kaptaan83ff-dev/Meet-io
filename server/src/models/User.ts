/**
 * User Model - Simple and Clean
 * 
 * This model stores user data for authentication.
 * Password is hashed before saving using bcrypt.
 */

import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

// TypeScript interface for User document
export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    avatar?: string;
    role?: string;
    title?: string;
    bio?: string;
    sessions?: any[];
    createdAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

// Mongoose Schema
const userSchema = new Schema<IUser>(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            maxlength: [50, 'Name cannot exceed 50 characters'],
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'],
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [6, 'Password must be at least 6 characters'],
            select: false, // Don't include password in queries by default
        },
        avatar: {
            type: String,
            default: null,
        },
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user',
        },
        title: {
            type: String,
            default: null,
        },
        bio: {
            type: String,
            default: null,
        },
        sessions: {
            type: [Schema.Types.Mixed],
            default: [],
        },
    },
    {
        timestamps: true, // Adds createdAt and updatedAt
    }
);

/**
 * Pre-save middleware: Hash password before saving
 * Note: For async middleware, mongoose handles the promise automatically
 */
userSchema.pre('save', async function () {
    // Only hash if password is new or modified
    if (!this.isModified('password')) {
        return;
    }

    // Generate salt and hash password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

/**
 * Compare entered password with stored hash
 * Usage: const isMatch = await user.comparePassword('entered_password');
 */
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
};

// Export the model
const User = mongoose.model<IUser>('User', userSchema);
export default User;
