import { io, Socket } from 'socket.io-client';

// Socket.io Singleton Service
// Maintains a single connection instance across the application

// Remove trailing slash and /api to get the root URL
const SOCKET_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '').replace(/\/api$/, '');

let socket: Socket | null = null;

export const getSocket = (): Socket => {
    if (!socket) {
        socket = io(SOCKET_URL, {
            autoConnect: false, // Manual connect for control
            withCredentials: true,
        });
    }
    return socket;
};

export const connectSocket = (): Socket => {
    const s = getSocket();
    if (!s.connected) {
        s.connect();
    }
    return s;
};

export const disconnectSocket = (): void => {
    if (socket?.connected) {
        socket.disconnect();
    }
};

// Type definitions for socket events
export interface ChatMessage {
    roomId: string;
    userId: string;
    userName: string;
    message: string;
    timestamp: string;
}

export interface HandToggle {
    roomId: string;
    userId: string;
    isRaised: boolean;
}

export default {
    getSocket,
    connectSocket,
    disconnectSocket,
};
