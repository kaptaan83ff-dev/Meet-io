import { Server, Socket } from 'socket.io';

interface JoinRoomData {
    roomId: string;
    userId: string;
    userName: string;
}

interface ChatMessageData {
    roomId: string;
    userId: string;
    userName: string;
    message: string;
    timestamp: string;
}

interface ToggleHandData {
    roomId: string;
    userId: string;
    isRaised: boolean;
}

interface WaitingRoomJoinData {
    roomId: string;
    userId: string;
    userName: string;
}

interface AdmitUserData {
    roomId: string;
    participantId: string;
    token: string;
}

interface DenyUserData {
    roomId: string;
    participantId: string;
}

// Store socket mappings for waiting room notifications
const userSocketMap = new Map<string, string>(); // userId -> socketId

export const initializeSocketIO = (io: Server) => {
    io.on('connection', (socket: Socket) => {
        console.log('User connected:', socket.id);

        // Join Room (for admitted participants)
        socket.on('join-room', (data: JoinRoomData) => {
            const { roomId, userId, userName } = data;
            socket.join(roomId);
            userSocketMap.set(userId, socket.id);
            console.log(`User ${userName} (${userId}) joined room: ${roomId}`);

            // Broadcast to others in room
            socket.to(roomId).emit('user-joined-signal', { userId, userName });
        });

        // Waiting Room Join (user enters waiting room)
        socket.on('waiting-room-join', (data: WaitingRoomJoinData) => {
            const { roomId, userId, userName } = data;
            // Join a waiting room channel for this meeting
            socket.join(`waiting-${roomId}`);
            userSocketMap.set(userId, socket.id);
            console.log(`User ${userName} joined waiting room for: ${roomId}`);

            // Notify the host (who is in the main room) - include socketId for identification
            io.to(roomId).emit('pending-participant', { userId, userName, socketId: socket.id });
        });

        // Host admits a user
        socket.on('admit-user', (data: AdmitUserData) => {
            const { roomId, participantId, token } = data;
            const targetSocketId = userSocketMap.get(participantId);

            if (targetSocketId) {
                // Send token AND liveKitUrl directly to the admitted user
                io.to(targetSocketId).emit('admitted', {
                    roomId,
                    token,
                    liveKitUrl: process.env.LIVEKIT_URL || 'wss://meet-io-wd7xbiqz.livekit.cloud'
                });
                console.log(`User ${participantId} admitted to ${roomId}`);
            }
        });

        // Host denies a user
        socket.on('deny-user', (data: DenyUserData) => {
            const { roomId, participantId } = data;
            const targetSocketId = userSocketMap.get(participantId);

            if (targetSocketId) {
                io.to(targetSocketId).emit('denied', { roomId });
                console.log(`User ${participantId} denied from ${roomId}`);
            }
        });

        // Chat Message
        socket.on('chat-message', (data: ChatMessageData) => {
            const { roomId } = data;
            io.to(roomId).emit('chat-message', data);
        });

        // Toggle Hand
        socket.on('toggle-hand', (data: ToggleHandData) => {
            const { roomId } = data;
            io.to(roomId).emit('hand-toggled', data);
        });

        // Emoji Reaction
        socket.on('reaction', (data: { roomId: string; userId: string; emoji: string }) => {
            const { roomId } = data;
            io.to(roomId).emit('reaction', data);
        });

        socket.on('disconnect', () => {
            // Clean up user socket mapping
            for (const [userId, socketId] of userSocketMap.entries()) {
                if (socketId === socket.id) {
                    userSocketMap.delete(userId);
                    break;
                }
            }
            console.log('User disconnected:', socket.id);
        });
    });
};
