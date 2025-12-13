import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Define the schema for environment variables
const envSchema = z.object({
    PORT: z.string().default('5000'),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

    // MongoDB Configuration
    MONGO_URI: z.string().min(1, 'MONGO_URI is required'),

    // JWT Configuration
    JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),

    // LiveKit Configuration
    LIVEKIT_API_KEY: z.string().min(1, 'LIVEKIT_API_KEY is required'),
    LIVEKIT_API_SECRET: z.string().min(1, 'LIVEKIT_API_SECRET is required'),
    LIVEKIT_URL: z.string().url('LIVEKIT_URL must be a valid URL').default('ws://localhost:7880'),

    // Redis Configuration (optional)
    REDIS_URL: z.string().optional(),

    // Client URL for CORS
    CLIENT_URL: z.string().url('CLIENT_URL must be a valid URL').default('http://localhost:5173'),
});

// Export the validated environment variables type
export type Env = z.infer<typeof envSchema>;

/**
 * Validates environment variables on application startup
 * @throws {Error} If validation fails
 * @returns {Env} Validated environment variables
 */
export function validateEnv(): Env {
    try {
        const env = envSchema.parse(process.env);

        console.log('✅ Environment variables validated successfully');
        console.log(`📍 Server will run in ${env.NODE_ENV} mode on port ${env.PORT}`);

        return env;
    } catch (error) {
        if (error instanceof z.ZodError) {
            console.error('❌ Environment validation failed:');
            error.errors.forEach((err: z.ZodIssue) => {
                console.error(`  - ${err.path.join('.')}: ${err.message}`);
            });
            throw new Error('Invalid environment configuration');
        }
        throw error;
    }
}

// Validate and export environment variables
export const env = validateEnv();
