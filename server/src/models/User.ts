import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

// Default avatar URLs (using DiceBear avatars API)
const DEFAULT_AVATARS = [
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Mittens',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Cuddles',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Fluffy',
];

// Get a random default avatar
const getRandomAvatar = (): string => {
    return DEFAULT_AVATARS[Math.floor(Math.random() * DEFAULT_AVATARS.length)];
};

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    avatar: string;
    bio?: string;
    title?: string;
    googleId?: string;
    githubId?: string;
    role: 'user' | 'admin';
    sessions: {
        ip?: string;
        userAgent?: string;
        lastActive: Date;
        tokenHash?: string;
    }[];
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
    {
        name: {
            type: String,
            required: [true, 'Please provide a name'],
            trim: true,
            maxlength: [50, 'Name cannot be more than 50 characters'],
        },
        email: {
            type: String,
            required: [true, 'Please provide an email'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                'Please provide a valid email',
            ],
        },
        password: {
            type: String,
            required: [true, 'Please provide a password'],
            minlength: [8, 'Password must be at least 8 characters'],
            select: false, // Don't return password by default
        },
        avatar: {
            type: String,
            default: getRandomAvatar,
        },
        bio: {
            type: String,
            default: '',
        },
        title: {
            type: String,
            default: '',
        },
        googleId: {
            type: String,
            unique: true,
            sparse: true,
        },
        githubId: {
            type: String,
            unique: true,
            sparse: true,
        },
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user',
        },
        sessions: [{
            ip: String,
            userAgent: String,
            lastActive: Date,
            tokenHash: String
        }],
    },
    {
        timestamps: true,
    }
);

// Hash password before saving
userSchema.pre('save', async function () {
    // Only hash the password if it's modified or new
    if (!this.isModified('password')) {
        return;
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare password
userSchema.methods.comparePassword = async function (
    candidatePassword: string
): Promise<boolean> {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        return false;
    }
};

const User = mongoose.model<IUser>('User', userSchema);

export default User;
