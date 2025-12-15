import { Participant } from 'livekit-client';
import { useEffect, useState } from 'react';

interface ParticipantListProps {
    isOpen: boolean;
    onClose: () => void;
    participants: Participant[]; // LiveKit participants
    pendingParticipants: any[]; // Waiting room participants (our custom type)
    isHost: boolean;
    onAdmit: (userId: string, userName: string) => void;
    onDeny: (userId: string, userName: string) => void;
}

export default function ParticipantList({
    isOpen,
    onClose,
    participants,
    pendingParticipants = [],
    isHost,
    onAdmit,
    onDeny,
}: ParticipantListProps) {
    const [activeTab, setActiveTab] = useState<'in-meeting' | 'waiting'>('in-meeting');

    // Auto-switch to waiting tab if new people join and panel is open
    useEffect(() => {
        if (pendingParticipants.length > 0 && isHost) {
            // Optional: notifications or badges are better, but for now we won't auto-switch 
            // to avoid disrupting the user, we'll just show the badge count.
        }
    }, [pendingParticipants.length, isHost]);

    return (
        <div className={`
            fixed md:absolute inset-0 md:inset-auto
            md:right-4 md:top-20 md:bottom-24
            w-full md:w-80
            bg-[#1a1f2e]/95 backdrop-blur-xl 
            border-0 md:border md:border-white/10
            rounded-none md:rounded-2xl 
            overflow-hidden flex flex-col shadow-2xl z-50
            transform transition-transform duration-300 ease-in-out
            ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}>
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                <h3 className="font-semibold text-white">People</h3>
                <button
                    onClick={onClose}
                    className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-white/10 rounded-full transition-colors"
                    aria-label="Close participants list"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>

            {/* Tabs (Host Only) */}
            {isHost && (
                <div className="flex p-1 bg-black/20 m-4 rounded-xl">
                    <button
                        onClick={() => setActiveTab('in-meeting')}
                        className={`flex-1 py-2.5 min-h-[44px] text-sm font-medium rounded-lg transition-all ${activeTab === 'in-meeting'
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        In Meeting ({participants.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('waiting')}
                        className={`flex-1 py-2.5 min-h-[44px] text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${activeTab === 'waiting'
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        Waiting
                        {pendingParticipants.length > 0 && (
                            <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                                {pendingParticipants.length}
                            </span>
                        )}
                    </button>
                </div>
            )}

            {/* List Content */}
            <div className="flex-1 overflow-y-auto px-4 custom-scrollbar">

                {/* IN MEETING LIST */}
                {(activeTab === 'in-meeting' || !isHost) && (
                    <div className="space-y-2 py-2">
                        {participants.map((p) => (
                            <div key={p.sid} className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 transition-colors group">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white relative">
                                        {p.identity?.charAt(0).toUpperCase() || '?'}
                                        {/* Status Dot */}
                                        <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#1a1f2e] ${p.isSpeaking ? 'bg-green-500' : 'bg-gray-400'
                                            }`} />
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-white flex items-center gap-2">
                                            {p.identity || 'Unknown'}
                                            {p.isLocal && <span className="text-xs text-gray-500">(You)</span>}
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            {p.permissions?.canPublish ? 'Presenter' : 'Attendee'}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {/* Mic Icon Status */}
                                    {p.isMicrophoneEnabled ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                                            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                                            <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                                            <line x1="12" y1="19" x2="12" y2="23"></line>
                                            <line x1="8" y1="23" x2="16" y2="23"></line>
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
                                            <line x1="1" y1="1" x2="23" y2="23"></line>
                                            <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path>
                                            <path d="M17 16.95A7 7 0 0 1 5 12v-2"></path>
                                            <line x1="12" y1="19" x2="12" y2="23"></line>
                                            <line x1="8" y1="23" x2="16" y2="23"></line>
                                        </svg>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* WAITING ROOM LIST */}
                {isHost && activeTab === 'waiting' && (
                    <div className="space-y-3 py-2">
                        {pendingParticipants.length === 0 ? (
                            <div className="text-center py-8 text-gray-500 text-sm">
                                Waiting room is empty.
                            </div>
                        ) : (
                            pendingParticipants.map((p) => (
                                <div key={p.userId || p.socketId} className="bg-white/5 p-3 rounded-xl border border-white/5">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-xs font-bold text-white">
                                            {p.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium text-white truncate">{p.userName || p.name}</div>
                                            <div className="text-xs text-gray-400">Wants to join...</div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => onAdmit(p.userId, p.userName || p.name)}
                                            className="flex-1 py-2.5 min-h-[44px] bg-green-500/10 hover:bg-green-500/20 text-green-500 rounded-lg text-sm font-medium transition-colors border border-green-500/20"
                                            aria-label="Admit participant"
                                        >
                                            Admit
                                        </button>
                                        <button
                                            onClick={() => onDeny(p.userId, p.userName || p.name)}
                                            className="flex-1 py-2.5 min-h-[44px] bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg text-sm font-medium transition-colors border border-red-500/20"
                                            aria-label="Deny participant"
                                        >
                                            Deny
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
