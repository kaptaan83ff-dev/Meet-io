/**
 * VideoGrid - Responsive participant grid
 * 
 * Adapts layout based on participant count:
 * - 1 person: Full screen
 * - 2 people: Side by side
 * - 3-4: 2x2 grid
 * - 5-9: 3x3 grid
 * - 10+: 4 columns, scrollable
 */

import type { Participant } from 'livekit-client';
import VideoTile from './VideoTile';

interface VideoGridProps {
    participants: Participant[];
    localParticipant: Participant;
    raisedHands: Set<string>; // Set of participant identities with raised hands
}

export default function VideoGrid({ participants, localParticipant, raisedHands }: VideoGridProps) {
    // Combine local + remote participants (local first)
    const allParticipants = [localParticipant, ...participants.filter(p => p.identity !== localParticipant.identity)];
    const count = allParticipants.length;

    // Determine grid layout and sizing with mobile-first responsive design
    const getGridClass = () => {
        if (count === 1) return 'grid-cols-1';
        if (count === 2) return 'grid-cols-1 sm:grid-cols-2'; // Stack on mobile, side-by-side on desktop
        if (count <= 4) return 'grid-cols-2'; // 2x2 grid works on mobile
        if (count <= 9) return 'grid-cols-2 sm:grid-cols-3'; // 2 cols mobile, 3 cols desktop
        return 'grid-cols-2 sm:grid-cols-4'; // 2 cols mobile, 4 cols desktop
    };

    // Dynamic max width and height based on count - responsive
    const getContainerClass = () => {
        if (count === 1) return 'max-w-full'; // Use full width for single participant
        if (count === 2) return 'max-w-7xl'; // Large for 2 participants
        if (count <= 4) return 'max-w-7xl'; // Still large for 4
        return 'max-w-full px-4 sm:px-8'; // Full width for 5+, responsive padding
    };

    // Mobile-optimized tile sizing
    const getTileStyle = () => {
        if (count === 1) return { height: '100%' }; // Fill available height for single participant
        if (count === 2) return { minHeight: '200px', maxHeight: '70vh' }; // Reduced from 350px
        if (count <= 4) return { minHeight: '150px', maxHeight: '60vh' }; // Reduced from 300px
        return { minHeight: '120px', maxHeight: '400px' }; // Reduced from 200px for better mobile fit
    };

    const getTileClass = () => {
        // For single user, use full dimensions
        if (count === 1) return 'w-full h-full';
        // For 2 users, use full height and let aspect ratio adapt
        if (count === 2) return 'w-full';
        // For 3+, maintain aspect ratio
        return 'aspect-video';
    };

    return (
        <div className="w-full h-full flex items-center justify-center p-2 sm:p-4">
            <div className={`grid ${getGridClass()} gap-2 sm:gap-4 w-full ${count === 1 ? 'h-full' : ''} ${getContainerClass()}`}>
                {allParticipants.map((participant) => (
                    <div
                        key={participant.identity}
                        className={getTileClass()}
                        style={getTileStyle()}
                    >
                        <VideoTile
                            participant={participant}
                            isLocal={participant.identity === localParticipant.identity}
                            isHandRaised={raisedHands.has(participant.identity)}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
