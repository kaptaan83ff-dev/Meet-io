/**
 * VideoTile - Individual participant video tile
 * 
 * Displays:
 * - Video stream or avatar
 * - Name overlay
 * - Mic muted indicator
 * - Hand raised indicator
 * - Speaking border glow
 */

import { Track } from 'livekit-client';
import {
    VideoTrack,
    AudioTrack,
    useIsSpeaking,
} from '@livekit/components-react';
import type { Participant } from 'livekit-client';
import { MicOff, Hand } from 'lucide-react';

interface VideoTileProps {
    participant: Participant;
    isHandRaised?: boolean;
    isLocal?: boolean;
}

export default function VideoTile({ participant, isHandRaised = false, isLocal = false }: VideoTileProps) {
    const isSpeaking = useIsSpeaking(participant);

    // Get media states directly from participant
    const isMicrophoneEnabled = participant.isMicrophoneEnabled;
    const isCameraEnabled = participant.isCameraEnabled;

    // Get video and audio tracks
    const videoTrack = participant.getTrackPublication(Track.Source.Camera)?.track;
    const audioTrack = participant.getTrackPublication(Track.Source.Microphone)?.track;

    // Get participant name (or identity as fallback)
    // Parse metadata for display name fallback
    let displayName = participant.name;
    if (!displayName && participant.metadata) {
        try {
            const meta = JSON.parse(participant.metadata);
            displayName = meta.displayName;
        } catch (e) {
            // ignore
        }
    }
    const name = displayName || participant.identity || 'Guest';
    const initial = name.charAt(0).toUpperCase();

    return (
        <div
            className={`relative bg-[#2d3748] rounded-xl overflow-hidden h-full transition-all duration-300 ${isSpeaking ? 'ring-4 ring-blue-500' : ''
                }`}
        >
            {/* Video or Avatar */}
            {isCameraEnabled && videoTrack ? (
                <VideoTrack
                    trackRef={{ participant, source: Track.Source.Camera, publication: participant.getTrackPublication(Track.Source.Camera)! }}
                    className="w-full h-full object-contain bg-black"
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#2d3748] to-[#1a202c]">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-4xl font-bold text-white shadow-xl">
                        {initial}
                    </div>
                </div>
            )}

            {/* Audio Track (hidden, for audio playback) */}
            {audioTrack && !isLocal && (
                <AudioTrack
                    trackRef={{ participant, source: Track.Source.Microphone, publication: participant.getTrackPublication(Track.Source.Microphone)! }}
                />
            )}

            {/* Bottom overlay - Name and indicators */}
            <div className="absolute bottom-0 left-0 right-0 p-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                        {/* Name */}
                        <span className="text-white text-sm font-medium">
                            {isLocal ? 'You' : name}
                        </span>
                        {/* Mic indicator */}
                        {!isMicrophoneEnabled && (
                            <MicOff size={14} className="text-red-400" />
                        )}
                    </div>

                    {/* Hand raised indicator */}
                    {isHandRaised && (
                        <div className="p-1.5 bg-yellow-500 rounded-full animate-bounce">
                            <Hand size={14} className="text-white" />
                        </div>
                    )}
                </div>
            </div>

            {/* Speaking indicator glow */}
            {isSpeaking && (
                <div className="absolute inset-0 border-2 border-green-500 rounded-2xl pointer-events-none" />
            )}
        </div>
    );
}
