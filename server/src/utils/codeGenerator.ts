import Meeting from '../models/Meeting';

/**
 * Generate a random 3-character segment using uppercase letters
 */
const generateSegment = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let segment = '';
    for (let i = 0; i < 3; i++) {
        segment += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return segment;
};

/**
 * Generate a unique 9-character meeting code in format: ABC-DEF-GHI
 * Ensures the code doesn't already exist in the database
 */
export const generateMeetingCode = async (): Promise<string> => {
    let code: string;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
        // Generate code in format: ABC-DEF-GHI
        code = `${generateSegment()}-${generateSegment()}-${generateSegment()}`;

        // Check if code already exists
        const existingMeeting = await Meeting.findOne({ code });

        if (!existingMeeting) {
            isUnique = true;
            return code;
        }

        attempts++;
    }

    // If we couldn't generate a unique code after max attempts, throw error
    throw new Error('Failed to generate unique meeting code');
};
