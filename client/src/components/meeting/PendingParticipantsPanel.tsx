import { useState, useEffect } from 'react';
import { Users, Check, X, Clock } from 'lucide-react';
import { getSocket } from '../../services/socket';
import axios from 'axios';

interface PendingParticipant {
    userId: string;
    name: string;
    requestedAt: string;
}

interface PendingParticipantsPanelProps {
    isOpen: boolean;
    onClose: () => void;
    roomCode: string;
}

export default function PendingParticipantsPanel({
    isOpen,
    onClose,
    roomCode,
}: PendingParticipantsPanelProps) {
    const [pendingUsers, setPendingUsers] = useState<PendingParticipant[]>([]);
    const [loading, setLoading] = useState(false);

    // Fetch pending participants on open
    useEffect(() => {
        if (isOpen && roomCode) {
            fetchPending();
        }
    }, [isOpen, roomCode]);

    // Listen for new pending participants
    useEffect(() => {
        const socket = getSocket();

        const handlePending = (data: { userId: string; userName: string }) => {
            setPendingUsers(prev => {
                // Avoid duplicates
                if (prev.some(p => p.userId === data.userId)) return prev;
                return [...prev, {
                    userId: data.userId,
                    name: data.userName,
                    requestedAt: new Date().toISOString(),
                }];
            });
        };

        socket.on('pending-participant', handlePending);

        return () => {
            socket.off('pending-participant', handlePending);
        };
    }, []);

    const fetchPending = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                `${(import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '').replace(/\/api$/, '')}/api/meetings/${roomCode}/pending`,
                { withCredentials: true }
            );
            if (response.data.success) {
                setPendingUsers(response.data.pendingParticipants || []);
            }
        } catch (error) {
            console.error('Failed to fetch pending participants:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdmit = async (userId: string) => {
        try {
            const response = await axios.post(
                `${(import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '').replace(/\/api$/, '')}/api/meetings/admit`,
                { code: roomCode, participantId: userId },
                { withCredentials: true }
            );

            if (response.data.success) {
                // Remove from local state
                setPendingUsers(prev => prev.filter(p => p.userId !== userId));

                // Notify user via socket
                const socket = getSocket();
                socket.emit('admit-user', {
                    roomId: roomCode,
                    participantId: userId,
                    token: response.data.token,
                });
            }
        } catch (error) {
            console.error('Failed to admit participant:', error);
        }
    };

    const handleDeny = async (userId: string) => {
        try {
            const response = await axios.post(
                `${(import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '').replace(/\/api$/, '')}/api/meetings/deny`,
                { code: roomCode, participantId: userId },
                { withCredentials: true }
            );

            if (response.data.success) {
                setPendingUsers(prev => prev.filter(p => p.userId !== userId));

                const socket = getSocket();
                socket.emit('deny-user', {
                    roomId: roomCode,
                    participantId: userId,
                });
            }
        } catch (error) {
            console.error('Failed to deny participant:', error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="absolute left-4 top-4 bottom-4 w-80 bg-[#1a1f2e]/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl flex flex-col z-50 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                    <Users size={20} className="text-orange-400" />
                    <span className="font-semibold text-white">Waiting Room</span>
                    {pendingUsers.length > 0 && (
                        <span className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                            {pendingUsers.length}
                        </span>
                    )}
                </div>
                <button
                    onClick={onClose}
                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                >
                    <X size={18} className="text-gray-400" />
                </button>
            </div>

            {/* Pending Users List */}
            <div className="flex-1 overflow-y-auto p-4">
                {loading ? (
                    <div className="text-center text-gray-500 py-8">Loading...</div>
                ) : pendingUsers.length === 0 ? (
                    <div className="text-center text-gray-500 text-sm py-8">
                        <Clock className="mx-auto mb-2 text-gray-600" size={32} />
                        No one is waiting
                    </div>
                ) : (
                    <div className="space-y-3">
                        {pendingUsers.map((user) => (
                            <div
                                key={user.userId}
                                className="bg-white/5 rounded-xl p-3 flex items-center justify-between"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-white font-medium">{user.name}</p>
                                        <p className="text-xs text-gray-500">Waiting to join</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleAdmit(user.userId)}
                                        className="p-2 bg-green-600 hover:bg-green-500 rounded-lg transition-colors"
                                        title="Admit"
                                    >
                                        <Check size={16} className="text-white" />
                                    </button>
                                    <button
                                        onClick={() => handleDeny(user.userId)}
                                        className="p-2 bg-red-600 hover:bg-red-500 rounded-lg transition-colors"
                                        title="Deny"
                                    >
                                        <X size={16} className="text-white" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
