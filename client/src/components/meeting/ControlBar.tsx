/**
 * ControlBar - Bottom control bar for meeting
 * 
 * Clean, minimal design matching reference
 */

import {
    Mic, MicOff, Video, VideoOff,
    Monitor, Hand, MessageSquare, Users
} from 'lucide-react';
import ReactionPicker from './ReactionPicker';

interface ControlBarProps {
    // Media controls
    isMicEnabled: boolean;
    isCameraEnabled: boolean;
    isScreenSharing: boolean;
    isHandRaised: boolean;
    onToggleMic: () => void;
    onToggleCamera: () => void;
    onToggleScreenShare: () => void;
    onToggleHand: () => void;
    // Panels
    isChatOpen: boolean;
    isParticipantsOpen: boolean;
    onToggleChat: () => void;
    onToggleParticipants: () => void;
    participantCount: number;
    pendingCount: number;
    // Actions
    onReaction: (emoji: string) => void;
    onLeave: () => void;
    // Meeting info
    meetingCode: string;
}

export default function ControlBar({
    isMicEnabled,
    isCameraEnabled,
    isScreenSharing,
    isHandRaised,
    onToggleMic,
    onToggleCamera,
    onToggleScreenShare,
    onToggleHand,
    isChatOpen,
    isParticipantsOpen,
    onToggleChat,
    onToggleParticipants,
    participantCount: _participantCount,
    pendingCount,
    onReaction,
    onLeave,
    meetingCode: _meetingCode,
}: ControlBarProps) {
    return (
        <div className="absolute bottom-4 md:bottom-6 left-1/2 transform -translate-x-1/2 z-50 px-2 w-full max-w-full md:w-auto">
            <div className="bg-[#1e2a3a] rounded-2xl px-2 sm:px-4 py-2 sm:py-3 shadow-2xl flex items-center gap-1.5 sm:gap-3 justify-center flex-wrap">
                {/* Mic */}
                <button
                    onClick={onToggleMic}
                    className={`p-3 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl transition-all ${isMicEnabled
                        ? 'bg-[#2d3748] hover:bg-[#3d4758] text-white'
                        : 'bg-red-500 hover:bg-red-600 text-white'
                        }`}
                    title={isMicEnabled ? 'Mute' : 'Unmute'}
                    aria-label={isMicEnabled ? 'Mute microphone' : 'Unmute microphone'}
                >
                    {isMicEnabled ? <Mic size={20} /> : <MicOff size={20} />}
                </button>

                {/* Camera */}
                <button
                    onClick={onToggleCamera}
                    className={`p-3 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl transition-all ${isCameraEnabled
                        ? 'bg-[#2d3748] hover:bg-[#3d4758]  text-white'
                        : 'bg-red-500 hover:bg-red-600 text-white'
                        }`}
                    title={isCameraEnabled ? 'Turn off camera' : 'Turn on camera'}
                    aria-label={isCameraEnabled ? 'Turn off camera' : 'Turn on camera'}
                >
                    {isCameraEnabled ? <Video size={20} /> : <VideoOff size={20} />}
                </button>

                {/* Screen Share - Hidden on small mobile */}
                <button
                    onClick={onToggleScreenShare}
                    className={`p-3 min-w-[44px] min-h-[44px] hidden sm:flex items-center justify-center rounded-xl transition-all ${isScreenSharing
                        ? 'bg-blue-500 hover:bg-blue-600 text-white'
                        : 'bg-[#2d3748] hover:bg-[#3d4758] text-white'
                        }`}
                    title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
                    aria-label={isScreenSharing ? 'Stop screen sharing' : 'Share screen'}
                >
                    <Monitor size={20} />
                </button>

                {/* Hand Raise */}
                <button
                    onClick={onToggleHand}
                    className={`p-3 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl transition-all ${isHandRaised
                        ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                        : 'bg-[#2d3748] hover:bg-[#3d4758] text-white'
                        }`}
                    title={isHandRaised ? 'Lower hand' : 'Raise hand'}
                    aria-label={isHandRaised ? 'Lower hand' : 'Raise hand'}
                >
                    <Hand size={20} />
                </button>

                {/* Reactions */}
                <div className="bg-[#2d3748] rounded-xl">
                    <ReactionPicker onReaction={onReaction} />
                </div>

                {/* Chat */}
                <button
                    onClick={onToggleChat}
                    className={`p-3 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl transition-all relative ${isChatOpen
                        ? 'bg-blue-500 text-white'
                        : 'bg-[#2d3748] hover:bg-[#3d4758] text-white'
                        }`}
                    title="Chat"
                    aria-label="Toggle chat"
                >
                    <MessageSquare size={20} />
                </button>

                {/* Participants */}
                <button
                    onClick={onToggleParticipants}
                    className={`p-3 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl transition-all relative ${isParticipantsOpen
                        ? 'bg-blue-500 text-white'
                        : 'bg-[#2d3748] hover:bg-[#3d4758] text-white'
                        }`}
                    title="Participants"
                    aria-label="Toggle participants list"
                >
                    <Users size={20} />
                    {pendingCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                            {pendingCount}
                        </span>
                    )}
                </button>

                {/* End - More prominent */}
                <button
                    onClick={onLeave}
                    className="px-4 sm:px-5 py-3 min-h-[44px] bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl transition-all flex items-center justify-center"
                    title="Leave meeting"
                    aria-label="Leave meeting"
                >
                    <span className="hidden sm:inline">End</span>
                    <span className="sm:hidden">Exit</span>
                </button>
            </div>
        </div>
    );
}
