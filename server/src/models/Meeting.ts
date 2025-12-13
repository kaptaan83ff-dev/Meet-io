import mongoose, { Document, Schema } from 'mongoose';

export interface IParticipant {
    userId: mongoose.Types.ObjectId;
    joinedAt: Date;
    leftAt?: Date;
}

export interface IPendingParticipant {
    userId: mongoose.Types.ObjectId;
    name: string;
    requestedAt: Date;
}

export interface IMeeting extends Document {
    title: string;
    code: string;
    hostId: mongoose.Types.ObjectId;
    participants: IParticipant[];
    pendingParticipants: IPendingParticipant[];
    settings: {
        waitingRoom: boolean;
        muteOnEntry: boolean;
    };
    duration: number;
    description?: string;
    attendees: {
        email: string;
        status: 'pending' | 'accepted' | 'declined';
    }[];
    status: 'scheduled' | 'active' | 'ended';
    startTime: Date;
    endTime?: Date;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    reminderSent: boolean;
}

const meetingSchema = new Schema<IMeeting>(
    {
        title: {
            type: String,
            required: [true, 'Please provide a meeting title'],
            trim: true,
            maxlength: [100, 'Title cannot be more than 100 characters'],
        },
        code: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            match: [/^[A-Z]{3}-[A-Z]{3}-[A-Z]{3}$/, 'Invalid meeting code format'],
        },
        hostId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Meeting must have a host'],
        },
        participants: [
            {
                userId: {
                    type: Schema.Types.ObjectId,
                    ref: 'User',
                    required: true,
                },
                joinedAt: {
                    type: Date,
                    default: Date.now,
                },
                leftAt: {
                    type: Date,
                },
            },
        ],
        pendingParticipants: [
            {
                userId: {
                    type: Schema.Types.ObjectId,
                    ref: 'User',
                    required: true,
                },
                name: {
                    type: String,
                    required: true,
                },
                requestedAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        settings: {
            waitingRoom: {
                type: Boolean,
                default: false,
            },
            muteOnEntry: {
                type: Boolean,
                default: false,
            },
        },
        duration: {
            type: Number,
            default: 60, // minutes
        },
        description: {
            type: String,
            trim: true,
        },
        attendees: [
            {
                email: {
                    type: String,
                    trim: true,
                    lowercase: true,
                },
                status: {
                    type: String,
                    enum: ['pending', 'accepted', 'declined'],
                    default: 'pending',
                },
            },
        ],
        status: {
            type: String,
            enum: ['scheduled', 'active', 'ended'],
            default: 'active', // Default to active for instant meetings
        },
        startTime: {
            type: Date,
            default: Date.now,
        },
        endTime: {
            type: Date,
        },
        isActive: { // Keeping for backward compatibility, sync with status
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Index for faster code lookups
meetingSchema.index({ code: 1 });
meetingSchema.index({ hostId: 1 });
meetingSchema.index({ isActive: 1 });

const Meeting = mongoose.model<IMeeting>('Meeting', meetingSchema);

export default Meeting;
