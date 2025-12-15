/**
 * MeetingRoomPage - Modern Meeting Room UI
 * 
 * Google Meet-inspired minimal design with:
 * - Custom video grid
 * - Hand raising
 * - Emoji reactions
 * - Screen sharing
 * - Clean control bar
 */

import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    LiveKitRoom,
    useLocalParticipant,
    useParticipants,
} from '@livekit/components-react';
import '@livekit/components-styles';

import toast from 'react-hot-toast';

import { useAuth } from '../context/AuthContext';
import { meetingAPI } from '../services/api';
import { connectSocket, disconnectSocket, getSocket, type ChatMessage } from '../services/socket';

// Components
import VideoGrid from '../components/meeting/VideoGrid';
import ControlBar from '../components/meeting/ControlBar';
import ChatPanel from '../components/meeting/ChatPanel';
import ParticipantList from '../components/meeting/ParticipantList';
import WaitingRoomScreen from '../components/meeting/WaitingRoomScreen';
import MeetingTopBar from '../components/meeting/MeetingTopBar';

// Loader component
const Loader = () => (
    <div className="flex h-screen w-full items-center justify-center bg-[#0B0E14]">
        <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
            <p className="text-gray-400 text-sm">Joining meeting...</p>
        </div>
    </div>
);

// Floating reaction component
interface FloatingReaction {
    id: string;
    emoji: string;
    x: number;
}

function FloatingReactions({ reactions }: { reactions: FloatingReaction[] }) {
    return (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {reactions.map((r) => (
                <div
                    key={r.id}
                    className="absolute bottom-24 text-5xl animate-float-up"
                    style={{ left: `${r.x}%` }}
                >
                    {r.emoji}
                </div>
            ))}
            <style>{`
                @keyframes float-up {
                    0% { transform: translateY(0) scale(1); opacity: 1; }
                    100% { transform: translateY(-400px) scale(1.5); opacity: 0; }
                }
                .animate-float-up {
                    animation: float-up 3s ease-out forwards;
                }
            `}</style>
        </div>
    );
}

// Inner meeting content (inside LiveKitRoom context)
function MeetingContent({
    roomId,
    userId,
    userName,
    isHost,
    meetingTitle,
    pendingParticipants,
    onAdmit,
    onDeny,
    onLeave,
}: {
    roomId: string;
    userId: string;
    userName: string;
    isHost: boolean;
    meetingTitle: string;
    pendingParticipants: any[];
    onAdmit: (userId: string, userName: string) => void;
    onDeny: (userId: string, userName: string) => void;
    onLeave: () => void;
}) {
    const { localParticipant } = useLocalParticipant();
    const participants = useParticipants();

    // UI State
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [raisedHands, setRaisedHands] = useState<Set<string>>(new Set());
    const [floatingReactions, setFloatingReactions] = useState<FloatingReaction[]>([]);

    // Media state
    const [isMicEnabled, setIsMicEnabled] = useState(true);
    const [isCameraEnabled, setIsCameraEnabled] = useState(true);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [isHandRaised, setIsHandRaised] = useState(false);

    // Sync media state with LiveKit
    useEffect(() => {
        if (localParticipant) {
            setIsMicEnabled(localParticipant.isMicrophoneEnabled);
            setIsCameraEnabled(localParticipant.isCameraEnabled);
            setIsScreenSharing(localParticipant.isScreenShareEnabled);
        }
    }, [localParticipant?.isMicrophoneEnabled, localParticipant?.isCameraEnabled, localParticipant?.isScreenShareEnabled]);

    // Socket listeners
    useEffect(() => {
        const socket = getSocket();

        const handleChatMessage = (data: ChatMessage) => {
            setChatMessages(prev => [...prev, data]);
        };

        const handleHandToggled = (data: { userId: string; isRaised: boolean }) => {
            setRaisedHands(prev => {
                const newSet = new Set(prev);
                if (data.isRaised) {
                    newSet.add(data.userId);
                } else {
                    newSet.delete(data.userId);
                }
                return newSet;
            });
        };

        const handleReaction = (data: { emoji: string; userId: string }) => {
            const reaction: FloatingReaction = {
                id: `${Date.now()}-${Math.random()}`,
                emoji: data.emoji,
                x: 20 + Math.random() * 60, // Random position 20-80%
            };
            setFloatingReactions(prev => [...prev, reaction]);

            // Remove after animation
            setTimeout(() => {
                setFloatingReactions(prev => prev.filter(r => r.id !== reaction.id));
            }, 3000);
        };

        socket.on('chat-message', handleChatMessage);
        socket.on('hand-toggled', handleHandToggled);
        socket.on('reaction', handleReaction);

        return () => {
            socket.off('chat-message', handleChatMessage);
            socket.off('hand-toggled', handleHandToggled);
            socket.off('reaction', handleReaction);
        };
    }, []);

    // Control handlers
    const toggleMic = async () => {
        if (!localParticipant) {
            toast.error('Not connected to meeting');
            return;
        }

        try {
            const newState = !isMicEnabled;
            await localParticipant.setMicrophoneEnabled(newState);

            // Only update state after successful operation
            setIsMicEnabled(newState);
        } catch (e: any) {
            console.error('Microphone toggle error:', e);
            const errorMessage = e.message || 'Failed to toggle microphone';
            toast.error(errorMessage);

            // Sync state with actual device state
            if (localParticipant) {
                setIsMicEnabled(localParticipant.isMicrophoneEnabled);
            }
        }
    };

    const toggleCamera = async () => {
        if (!localParticipant) {
            toast.error('Not connected to meeting');
            return;
        }

        try {
            const newState = !isCameraEnabled;
            await localParticipant.setCameraEnabled(newState);

            // Only update state after successful operation
            setIsCameraEnabled(newState);
        } catch (e: any) {
            console.error('Camera toggle error:', e);
            const errorMessage = e.message || 'Failed to toggle camera';
            toast.error(errorMessage);

            // Sync state with actual device state
            if (localParticipant) {
                setIsCameraEnabled(localParticipant.isCameraEnabled);
            }
        }
    };

    const toggleScreenShare = async () => {
        if (!localParticipant) {
            toast.error('Not connected to meeting');
            return;
        }

        try {
            const newState = !isScreenSharing;
            await localParticipant.setScreenShareEnabled(newState);

            // Only update state after successful operation
            setIsScreenSharing(newState);

            if (newState) {
                toast.success('Screen sharing started');
            } else {
                toast.success('Screen sharing stopped');
            }
        } catch (e: any) {
            console.error('Screen share error:', e);
            const errorMessage = e.message || 'Failed to share screen';
            toast.error(errorMessage);

            // Make sure state matches reality
            if (localParticipant) {
                setIsScreenSharing(localParticipant.isScreenShareEnabled);
            }
        }
    };

    const toggleHand = () => {
        const newState = !isHandRaised;
        console.log('✋ Hand Raise: Toggle clicked', {
            currentState: isHandRaised,
            newState,
            roomId,
            userId,
            socketConnected: getSocket().connected
        });

        setIsHandRaised(newState);

        // Emit socket event
        const socket = getSocket();
        console.log('✋ Emitting toggle-hand event:', { roomId, userId, isRaised: newState });
        socket.emit('toggle-hand', { roomId, userId, isRaised: newState });

        // Update local raised hands
        setRaisedHands(prev => {
            const newSet = new Set(prev);
            const identity = localParticipant?.identity || userId;
            if (newState) {
                newSet.add(identity);
                console.log('✋ Added hand for:', identity);
            } else {
                newSet.delete(identity);
                console.log('✋ Removed hand for:', identity);
            }
            return newSet;
        });
    };

    const handleReaction = (emoji: string) => {
        getSocket().emit('reaction', { roomId, userId, emoji });

        // Show locally immediately
        const reaction: FloatingReaction = {
            id: `${Date.now()}-local`,
            emoji,
            x: 20 + Math.random() * 60,
        };
        setFloatingReactions(prev => [...prev, reaction]);
        setTimeout(() => {
            setFloatingReactions(prev => prev.filter(r => r.id !== reaction.id));
        }, 3000);
    };

    return (
        <div className="relative h-screen w-full bg-[#1e2a3a] overflow-hidden">
            {/* Top Bar */}
            <MeetingTopBar
                meetingTitle={meetingTitle}
                meetingCode={roomId}
            />

            {/* Floating Reactions */}
            <FloatingReactions reactions={floatingReactions} />

            {/* Video Grid - Adjusts width when panels are open */}
            <div
                className={`
                    absolute inset-0 pt-20 pb-32 transition-all duration-300
                    ${(isChatOpen || isParticipantsOpen) ? 'md:right-[336px]' : 'right-0'}
                `}
            >
                {localParticipant && (
                    <VideoGrid
                        participants={participants}
                        localParticipant={localParticipant}
                        raisedHands={raisedHands}
                    />
                )}
            </div>

            {/* Control Bar */}
            <ControlBar
                isMicEnabled={isMicEnabled}
                isCameraEnabled={isCameraEnabled}
                isScreenSharing={isScreenSharing}
                isHandRaised={isHandRaised}
                onToggleMic={toggleMic}
                onToggleCamera={toggleCamera}
                onToggleScreenShare={toggleScreenShare}
                onToggleHand={toggleHand}
                isChatOpen={isChatOpen}
                isParticipantsOpen={isParticipantsOpen}
                onToggleChat={() => setIsChatOpen(!isChatOpen)}
                onToggleParticipants={() => setIsParticipantsOpen(!isParticipantsOpen)}
                participantCount={participants.length}
                pendingCount={pendingParticipants.length}
                onReaction={handleReaction}
                onLeave={onLeave}
                meetingCode={roomId}
            />

            {/* Chat Panel */}
            <ChatPanel
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
                roomId={roomId}
                userId={userId}
                userName={userName}
                messages={chatMessages}
            />

            {/* Participants Panel */}
            <ParticipantList
                isOpen={isParticipantsOpen}
                onClose={() => setIsParticipantsOpen(false)}
                participants={participants}
                pendingParticipants={pendingParticipants}
                isHost={isHost}
                onAdmit={onAdmit}
                onDeny={onDeny}
            />
        </div>
    );
}

// Main page component
export default function MeetingRoomPage() {
    const { code } = useParams<{ code: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    // State
    const [token, setToken] = useState<string>('');
    const [liveKitUrl, setLiveKitUrl] = useState<string>(import.meta.env.VITE_LIVEKIT_URL || '');
    const [loading, setLoading] = useState(true);
    const [isPending, setIsPending] = useState(false);
    const [meetingTitle, setMeetingTitle] = useState('');
    const [isHost, setIsHost] = useState(false);
    const [pendingParticipants, setPendingParticipants] = useState<any[]>([]);
    const [isNotStarted, setIsNotStarted] = useState(false);
    const [meetingStartTime, setMeetingStartTime] = useState<string | null>(null);

    // Validate meeting code
    useEffect(() => {
        if (!code || code === '404' || code.length < 3) {
            toast.error('Invalid meeting code');
            navigate('/dashboard');
        }
    }, [code, navigate]);

    // Callbacks
    const handleAdmitted = useCallback((newToken: string, url?: string) => {
        setIsPending(false);
        setToken(newToken);
        if (url) setLiveKitUrl(url);
        toast.success('You have been admitted!');
    }, []);

    const handleDenied = useCallback(() => {
        toast.error('You were denied entry');
        navigate('/dashboard');
    }, [navigate]);

    const handleAdmitUser = useCallback(async (userId: string, userName: string) => {
        if (!code) return;
        try {
            const response = await meetingAPI.admitParticipant({ code, participantId: userId });
            if (response.success) {
                getSocket().emit('admit-user', {
                    roomId: code,
                    participantId: userId,
                    token: response.token
                });
                setPendingParticipants(prev => prev.filter(p => p.userId !== userId));
                toast.success(`${userName} admitted`);
            }
        } catch (error) {
            toast.error('Failed to admit user');
        }
    }, [code]);

    const handleDenyUser = useCallback((userId: string, userName: string) => {
        if (!code) return;
        getSocket().emit('deny-user', { roomId: code, participantId: userId });
        setPendingParticipants(prev => prev.filter(p => p.userId !== userId));
        toast.success(`${userName} denied`);
    }, [code]);

    const handleLeave = useCallback(() => {
        disconnectSocket();
        navigate('/dashboard');
    }, [navigate]);

    // Socket connection
    useEffect(() => {
        if (!code || !user) return;

        const socket = connectSocket();

        if (isPending) {
            socket.emit('waiting-room-join', {
                roomId: code,
                userId: user._id,
                userName: user.name,
            });
        } else if (token) {
            socket.emit('join-room', {
                roomId: code,
                userId: user._id,
                userName: user.name,
            });
        }

        // Host listener for pending participants
        const handleUserPending = (data: any) => {
            if (isHost) {
                setPendingParticipants(prev => {
                    // Check if already in list
                    if (prev.find(p => p.userId === data.userId)) return prev;

                    // Add to list
                    const userName = data.userName || data.name || 'Unknown';
                    return [...prev, { ...data, name: userName }];
                });

                // Show toast AFTER setState (outside the updater function)
                const userName = data.userName || data.name || 'Unknown';
                toast(`${userName} wants to join!`, { icon: '👋', duration: 10000 });
            }
        };

        socket.on('pending-participant', handleUserPending);

        return () => {
            socket.off('pending-participant', handleUserPending);
            disconnectSocket();
        };
    }, [code, user, isPending, token, isHost]);

    // Join meeting API
    const joinMeeting = useCallback(async () => {
        if (!code) return;
        try {
            if (!isNotStarted) setLoading(true);
            const response = await meetingAPI.join({ code });

            if (response.status === 'not_started') {
                setIsNotStarted(true);
                setMeetingStartTime(response.meeting?.startTime);
                setMeetingTitle(response.meeting?.title);
                setLoading(false);
                return false;
            }

            if (response.status === 'pending') {
                setIsNotStarted(false);
                setIsPending(true);
                setMeetingTitle(response.meeting?.title || 'Meeting');
                setLoading(false);
                return false;
            }

            // Admitted
            setIsNotStarted(false);
            if (response.livekit?.url) setLiveKitUrl(response.livekit.url);
            setToken(response.token || response.livekit?.token);
            setIsHost(response.isHost || false);
            setLoading(false);
            return true;
        } catch (error: any) {
            console.error('Failed to join', error);
            toast.error(error.response?.data?.error || 'Failed to join');
            if (error.response?.status === 404 || error.response?.status === 401) {
                navigate('/dashboard');
            }
            setLoading(false);
            return false;
        }
    }, [code, navigate, isNotStarted]);

    // Initial join
    useEffect(() => {
        joinMeeting();
    }, [joinMeeting]);

    // Polling for not started meetings
    useEffect(() => {
        if (!isNotStarted) return;
        const interval = setInterval(async () => {
            const joined = await joinMeeting();
            if (joined) {
                clearInterval(interval);
                toast.success('Meeting started!');
            }
        }, 5000);
        return () => clearInterval(interval);
    }, [isNotStarted, joinMeeting]);

    // Render states
    if (loading) return <Loader />;

    if (isPending) {
        return (
            <WaitingRoomScreen
                meetingTitle={meetingTitle}
                onAdmitted={handleAdmitted}
                onDenied={handleDenied}
            />
        );
    }

    if (isNotStarted) {
        return (
            <div className="flex min-h-screen bg-[#0B0E14] items-center justify-center p-4">
                <div className="max-w-md w-full bg-[#1a1f2e]/50 backdrop-blur-md rounded-2xl border border-white/10 p-8 text-center space-y-6">
                    <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto animate-pulse">
                        <svg className="w-10 h-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-2">{meetingTitle}</h2>
                        <p className="text-blue-200">Waiting for the host to start</p>
                    </div>
                    {meetingStartTime && (
                        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                            <p className="text-sm text-gray-400 mb-1">Scheduled for</p>
                            <p className="text-white font-semibold">{new Date(meetingStartTime).toLocaleString()}</p>
                        </div>
                    )}
                    <button onClick={() => navigate('/dashboard')} className="text-gray-400 hover:text-white text-sm">
                        Go back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    if (!token || !user) return <Loader />;

    return (
        <LiveKitRoom
            video={true}
            audio={true}
            token={token}
            serverUrl={liveKitUrl}
            onDisconnected={handleLeave}
            style={{ height: '100vh' }}
        >
            <MeetingContent
                roomId={code || ''}
                userId={user._id}
                userName={user.name}
                isHost={isHost}
                meetingTitle={meetingTitle}
                pendingParticipants={pendingParticipants}
                onAdmit={handleAdmitUser}
                onDeny={handleDenyUser}
                onLeave={handleLeave}
            />
        </LiveKitRoom>
    );
}
