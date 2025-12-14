import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import http from 'http';
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { env } from './config/validateEnv';
import { connectDB } from './config/db';
import authRoutes from './routes/authRoutes';
import meetingRoutes from './routes/meetingRoutes';
import adminRoutes from './routes/adminRoutes';
import userRoutes from './routes/userRoutes';
import { initializeSocketIO } from './socket/socketHandlers';
import { initMeetingReminders } from './cron/meetingReminders';

// Initialize Express application
const app: Application = express();

// Create HTTP Server
const httpServer = http.createServer(app);

// Trust Proxy (Required for Render/Vercel/Heroku to detect HTTPS)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());

// Passport Config
import './config/passport';

// Webhook Route - MUST be defined before body parsers to capture raw body
// Signature verification requires the raw body buffer
import { handleLiveKitWebhook } from './controllers/webhookController';
app.post(
    '/api/webhooks/livekit',
    express.raw({ type: 'application/webhook+json' }),
    handleLiveKitWebhook
);

// CORS configuration
const allowedOrigins = [
    env.CLIENT_URL,
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:5176'
];

app.use(
    cors({
        origin: allowedOrigins,
        credentials: true,
    })
);

// Initialize Socket.IO
const io = new Server(httpServer, {
    cors: {
        origin: allowedOrigins,
        credentials: true,
    }
});

// Redis Adapter Setup
const pubClient = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
const subClient = pubClient.duplicate();

Promise.all([pubClient.connect(), subClient.connect()])
    .then(() => {
        io.adapter(createAdapter(pubClient, subClient));
        console.log('Redis Adapter connected successfully');
    })
    .catch((err) => {
        console.error('Redis connection failed:', err);
    });

// Setup Socket Handlers
initializeSocketIO(io);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser middleware
app.use(cookieParser());

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: env.NODE_ENV,
    });
});

// Server time endpoint - returns current server time for calendar sync
app.get('/api/server-time', (_req: Request, res: Response) => {
    const now = new Date();
    res.status(200).json({
        success: true,
        serverTime: now.toISOString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
});

// API root endpoint
app.get('/', (_req: Request, res: Response) => {
    res.json({
        message: 'Meet.io API Server',
        version: '1.0.0',
        status: 'running',
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);

// 404 handler
app.use((_req: Request, res: Response) => {
    res.status(404).json({
        error: 'Not Found',
        message: 'The requested resource does not exist',
    });
});

// Global error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Error:', err.message);
    console.error(err.stack);

    res.status(500).json({
        error: 'Internal Server Error',
        message: env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    });
});

// Start server
const PORT = parseInt(env.PORT, 10);

const startServer = async () => {
    try {
        // Connect to database
        await connectDB();

        // Initialize Cron Jobs
        initMeetingReminders();

        // Start listening
        httpServer.listen(PORT, () => {
            console.log('\n🚀 Server started successfully!');
            console.log(`📡 Listening on port ${PORT}`);
            console.log(`🌍 Environment: ${env.NODE_ENV}`);
            console.log(`🔗 API URL: http://localhost:${PORT}`);
            console.log(`💚 Health check: http://localhost:${PORT}/health`);
            console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth`);
            console.log(`⚡ Socket.IO ready\n`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

export default app;



// Restart
