import { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    LiveKitRoom,
    VideoConference,
    useLocalParticipant,
    useParticipants,
} from '@livekit/components-react';
import '@livekit/components-styles';
import { meetingAPI } from '../services/api';
import { KrispNoiseFilter, isKrispNoiseFilterSupported } from '@livekit/krisp-noise-filter';
import { Track } from 'livekit-client';
import MediaSettings from '../components/meeting/MediaSettings';
import ChatPanel from '../components/meeting/ChatPanel';
import ParticipantList from '../components/meeting/ParticipantList';
import WaitingRoomScreen from '../components/meeting/WaitingRoomScreen';
import { connectSocket, disconnectSocket, getSocket } from '../services/socket';
import type { ChatMessage } from '../services/socket';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, Users } from 'lucide-react';
import toast from 'react-hot-toast';

// Simple Loader Component
const Loader = () => (
    <div className="flex h-screen items-center justify-center bg-[#0B0E14]">
        <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent shadow-lg shadow-blue-500/20"></div>
            <p className="text-gray-400 text-sm font-medium animate-pulse">Connecting to Room...</p>
        </div>
    </div>
);

// Inner component to access LiveKit context
interface MeetingContentProps {
    chatMessages: ChatMessage[];
    roomId: string;
    userId: string;
    userName: string;
    isChatOpen: boolean;
    onToggleChat: () => void;
    isHost: boolean;
    isParticipantsOpen: boolean;
    onToggleParticipants: () => void;
    pendingParticipants: any[];
    onAdmit: (id: string) => void;
    onDeny: (id: string) => void;
}

function MeetingContent({
    chatMessages,
    roomId,
    userId,
    userName,
    isChatOpen,
    onToggleChat,
    isHost,
    isParticipantsOpen,
    onToggleParticipants,
    pendingParticipants,
    onAdmit,
    onDeny,
}: MeetingContentProps) {
    const { localParticipant } = useLocalParticipant();
    const participants = useParticipants(); // All participants (local + remote)

    const [isNoiseFilterEnabled, setNoiseFilterEnabled] = useState(false);
    const [isProcessorInitialized, setIsProcessorInitialized] = useState(false);

    // Create processor instance once
    const processor = useMemo(() => KrispNoiseFilter(), []);

    useEffect(() => {
        const init = async () => {
            try {
                if (!isKrispNoiseFilterSupported()) {
                    console.warn('Krisp Noise Filter not supported on this browser');
                    return;
                }
                setIsProcessorInitialized(true);
                console.log('Krisp Noise Filter ready');
            } catch (e) {
                console.error('Failed to initialize Krisp:', e);
            }
        };
        init();
    }, [processor]);

    const toggleNoiseFilter = async (enabled: boolean) => {
        if (!localParticipant || !isProcessorInitialized) return;

        try {
            const micPub = localParticipant.getTrackPublication(Track.Source.Microphone);

            if (micPub?.track) {
                if (enabled) {
                    await micPub.track.setProcessor(processor as any);
                    console.log('Enabled Krisp Noise Filter');
                } else {
                    await micPub.track.stopProcessor();
                    console.log('Disabled Krisp Noise Filter');
                }
                setNoiseFilterEnabled(enabled);
            } else {
                console.warn("No microphone track found to attach processor");
                if (enabled) {
                    toast.error("Enable microphone first to use noise cancellation");
                    // Revert toggle state if we couldn't enable it
                    setNoiseFilterEnabled(false);
                }
            }
        } catch (error) {
            console.error('Error toggling noise filter:', error);
        }
    };

    const unreadCount = isChatOpen ? 0 : chatMessages.length;
    const pendingCount = pendingParticipants.length;

    return (
        <div className="relative h-full">
            <MediaSettings
                isNoiseFilterEnabled={isNoiseFilterEnabled}
                onToggleNoiseFilter={toggleNoiseFilter}
                isProcessorSupported={isKrispNoiseFilterSupported()}
            />

            {/* Meeting Info Overlay */}
            <div className="absolute top-4 left-4 z-40 bg-[#1a1f2e]/90 backdrop-blur-md rounded-xl border border-white/10 p-3 flex items-center gap-3 shadow-lg">
                <div className="flex flex-col">
                    <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Meeting Code</span>
                    <div className="flex items-center gap-2">
                        <code className="text-white font-mono font-bold text-lg tracking-wide">{roomId}</code>
                        <button
                            onClick={() => {
                                const url = window.location.href;
                                navigator.clipboard.writeText(url);
                                toast.success('Meeting link copied!');
                            }}
                            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors group"
                            title="Copy Link"
                        >
                            <span className="sr-only">Copy Link</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 group-hover:text-white">
                                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                            </svg>
                        </button>
                    </div>
                </div>
                <div className="h-8 w-px bg-white/10 mx-1"></div>
                <button
                    onClick={() => {
                        const url = window.location.href;
                        navigator.clipboard.writeText(url);
                        toast.success('Meeting link copied!');
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-white text-xs font-medium transition-colors"
                >
                    Copy Link
                </button>
            </div>

            {/* Control Bar */}
            <div className="absolute top-4 right-4 z-40 flex gap-2">
                {/* Participants Toggle */}
                <button
                    onClick={onToggleParticipants}
                    className={`flex items-center gap-2 px-4 py-2 backdrop-blur-md rounded-xl border transition-colors ${isParticipantsOpen
                        ? 'bg-blue-600 border-blue-500'
                        : 'bg-[#1a1f2e]/90 border-white/10 hover:bg-[#252b3d]'
                        }`}
                >
                    <Users size={20} className={isParticipantsOpen ? "text-white" : "text-blue-400"} />
                    <span className="text-white text-sm font-medium">People</span>
                    {/* Show badge for hosts if there are pending users */}
                    {isHost && pendingCount > 0 && (
                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                            {pendingCount}
                        </span>
                    )}
                </button>

                {/* Chat Toggle */}
                <button
                    onClick={onToggleChat}
                    className={`flex items-center gap-2 px-4 py-2 backdrop-blur-md rounded-xl border transition-colors ${isChatOpen
                        ? 'bg-blue-600 border-blue-500'
                        : 'bg-[#1a1f2e]/90 border-white/10 hover:bg-[#252b3d]'
                        }`}
                >
                    <MessageSquare size={20} className={isChatOpen ? "text-white" : "text-blue-400"} />
                    <span className="text-white text-sm font-medium">Chat</span>
                    {unreadCount > 0 && (
                        <span className="bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    )}
                </button>
            </div>

            {/* Participants Panel */}
            <ParticipantList
                isOpen={isParticipantsOpen}
                onClose={onToggleParticipants}
                participants={participants}
                pendingParticipants={pendingParticipants}
                isHost={isHost}
                onAdmit={onAdmit}
                onDeny={onDeny}
            />

            {/* Chat Panel */}
            <ChatPanel
                isOpen={isChatOpen}
                onClose={onToggleChat}
                roomId={roomId}
                userId={userId}
                userName={userName}
                messages={chatMessages}
            />

            <VideoConference />
        </div>
    );
}

export default function MeetingRoomPage() {
    const { code } = useParams<{ code: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [token, setToken] = useState<string>("");
    const [liveKitUrl, setLiveKitUrl] = useState<string>(import.meta.env.VITE_LIVEKIT_URL || "");
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
    const [isHost, setIsHost] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [meetingTitle, setMeetingTitle] = useState("");
    const [loading, setLoading] = useState(true);

    // Pending participants state (for host)
    const [pendingParticipants, setPendingParticipants] = useState<any[]>([]);

    // Handle admission callback
    const handleAdmitted = useCallback((newToken: string) => {
        setIsPending(false);
        setToken(newToken);
        toast.success('You have been admitted to the meeting!');
    }, []);

    // Handle denial callback
    const handleDenied = useCallback(() => {
        toast.error('You were denied entry to the meeting');
        navigate('/dashboard');
    }, [navigate]);

    const handleAdmitUser = useCallback((socketId: string) => {
        if (!code) return;
        getSocket().emit('admit-user', { roomId: code, socketId });
        // Optimistic update
        setPendingParticipants(prev => prev.filter(p => p.socketId !== socketId));
        toast.success('User admitted');
    }, [code]);

    const handleDenyUser = useCallback((socketId: string) => {
        if (!code) return;
        getSocket().emit('deny-user', { roomId: code, socketId });
        // Optimistic update
        setPendingParticipants(prev => prev.filter(p => p.socketId !== socketId));
        toast.success('User denied');
    }, [code]);

    // Socket Connection Effect
    useEffect(() => {
        if (!code || !user) return;

        const socket = connectSocket();

        if (isPending) {
            // Join waiting room channel
            socket.emit('waiting-room-join', {
                roomId: code,
                userId: user._id,
                userName: user.name,
            });
        } else if (token) {
            // Join the main socket room
            socket.emit('join-room', {
                roomId: code,
                userId: user._id,
                userName: user.name,
            });
        }

        // Listen for chat messages
        const handleChatMessage = (data: ChatMessage) => {
            setChatMessages(prev => [...prev, data]);
        };

        // Host listeners for waiting room
        const handleUserPending = (data: any) => {
            if (isHost) {
                setPendingParticipants(prev => {
                    if (prev.find(p => p.socketId === data.socketId)) return prev;
                    toast(`New user waiting: ${data.name}`, { icon: '👋' });
                    return [...prev, data];
                });
            }
        };

        // Listen for user cancelled join request (disconnected while waiting)
        const handleUserLeftWaiting = (data: { socketId: string }) => {
            setPendingParticipants(prev => prev.filter(p => p.socketId !== data.socketId));
        };

        socket.on('chat-message', handleChatMessage);
        socket.on('user-pending', handleUserPending);
        socket.on('user-left-waiting', handleUserLeftWaiting);

        // Cleanup on unmount
        return () => {
            socket.off('chat-message', handleChatMessage);
            socket.off('user-pending', handleUserPending);
            socket.off('user-left-waiting', handleUserLeftWaiting);
            disconnectSocket();
        };
    }, [code, user, isPending, token, isHost]);

    const [isNotStarted, setIsNotStarted] = useState(false);
    const [meetingStartTime, setMeetingStartTime] = useState<string | null>(null);

    // Token Fetch / Join Logic
    const joinMeeting = useCallback(async () => {
        if (!code) return;
        try {
            // only set loading on initial fetch
            if (!isNotStarted) setLoading(true);

            const response = await meetingAPI.join({ code });

            if (response.status === 'not_started') {
                setIsNotStarted(true);
                setMeetingStartTime(response.meeting?.startTime);
                setMeetingTitle(response.meeting?.title);
                setLoading(false);
                return false; // Not joined yet
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
            if (response.livekit?.url) {
                setLiveKitUrl(response.livekit.url);
            }
            setToken(response.token || response.livekit?.token);
            setIsHost(response.isHost || false);
            setLoading(false);
            return true; // Joined successfully
        } catch (error: any) {
            console.error("Failed to join meeting", error);
            if (error.response?.data?.error) {
                toast.error(error.response.data.error);
            } else {
                toast.error('Failed to join meeting');
            }
            if (error.response?.status === 404 || error.response?.status === 401) {
                navigate('/dashboard');
            }
            setLoading(false);
            return false;
        }
    }, [code, navigate, isNotStarted]);

    // Initial Join
    useEffect(() => {
        joinMeeting();
    }, [joinMeeting]);

    // Polling for Not Started
    useEffect(() => {
        if (!isNotStarted) return;

        const interval = setInterval(async () => {
            const joined = await joinMeeting();
            if (joined) {
                clearInterval(interval);
                toast.success('Meeting started!');
            }
        }, 5000); // Check every 5 seconds

        return () => clearInterval(interval);
    }, [isNotStarted, joinMeeting]);

    // Show loader while fetching
    if (loading) return <Loader />;

    // Show waiting room screen if pending
    if (isPending) {
        return (
            <WaitingRoomScreen
                meetingTitle={meetingTitle}
                onAdmitted={handleAdmitted}
                onDenied={handleDenied}
            />
        );
    }

    // Show waiting for host screen
    if (isNotStarted) {
        return (
            <div className="flex min-h-screen bg-[#0B0E14] items-center justify-center p-4">
                <div className="max-w-md w-full bg-[#1a1f2e]/50 backdrop-blur-md rounded-2xl border border-white/10 p-8 text-center space-y-6 shadow-2xl">
                    <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto animate-pulse">
                        <svg className="w-10 h-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-white mb-2">{meetingTitle}</h2>
                        <p className="text-blue-200 font-medium">Waiting for the host to start the meeting</p>
                    </div>

                    {meetingStartTime && (
                        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                            <p className="text-sm text-gray-400 mb-1">Scheduled for</p>
                            <p className="text-white text-lg font-semibold">
                                {new Date(meetingStartTime).toLocaleString()}
                            </p>
                        </div>
                    )}

                    <div className="pt-4 border-t border-white/10">
                        <p className="text-sm text-gray-500 animate-pulse">
                            The meeting will start automatically when the host joins.
                        </p>
                    </div>

                    <button
                        onClick={() => navigate('/dashboard')}
                        className="text-gray-400 hover:text-white text-sm transition-colors"
                    >
                        Go back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    // Show loader if no token yet
    if (!token || !user) return <Loader />;

    return (
        <LiveKitRoom
            video={true}
            audio={true}
            token={token}
            serverUrl={liveKitUrl}
            data-lk-theme="default"
            style={{ height: '100vh' }}
            onDisconnected={() => navigate('/dashboard')}
        >
            <MeetingContent
                chatMessages={chatMessages}
                roomId={code || ''}
                userId={user._id}
                userName={user.name}
                isChatOpen={isChatOpen}
                onToggleChat={() => setIsChatOpen(prev => !prev)}
                isHost={isHost}
                isParticipantsOpen={isParticipantsOpen}
                onToggleParticipants={() => setIsParticipantsOpen(prev => !prev)}
                pendingParticipants={pendingParticipants}
                onAdmit={handleAdmitUser}
                onDeny={handleDenyUser}
            />
        </LiveKitRoom>
    );
}
