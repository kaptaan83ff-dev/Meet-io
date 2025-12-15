import { AccessToken } from 'livekit-server-sdk';
import { env } from '../config/validateEnv';

/**
 * Generate a LiveKit access token for a user to join a room
 * @param userId - User ID (used as participant identity)
 * @param roomName - Room name (meeting code)
 * @param participantName - Display name for the participant
 * @returns LiveKit access token string
 */
export const generateToken = async (
    userId: string,
    roomName: string,
    participantName?: string
): Promise<string> => {
    try {
        // Create access token
        const token = new AccessToken(
            env.LIVEKIT_API_KEY,
            env.LIVEKIT_API_SECRET,
            {
                identity: userId, // Unique identifier for the participant
                name: participantName, // Display name (optional)
                metadata: JSON.stringify({ displayName: participantName }),
            }
        );

        // Grant permissions to join the room
        token.addGrant({
            roomJoin: true,
            room: roomName,
            canPublish: true, // Allow publishing audio/video
            canSubscribe: true, // Allow subscribing to others' streams
            canPublishData: true, // Allow sending data messages (chat, etc.)
        });

        // Generate the JWT token
        const jwt = await token.toJwt();

        return jwt;
    } catch (error) {
        console.error('Error generating LiveKit token:', error);
        throw new Error('Failed to generate LiveKit token');
    }
};

/**
 * Get LiveKit server URL from environment
 */
export const getLiveKitUrl = (): string => {
    return env.LIVEKIT_URL;
};
