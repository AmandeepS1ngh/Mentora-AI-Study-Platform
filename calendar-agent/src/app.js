/**
 * Calendar Agent - Express Application Entry Point
 * Calendar and Task Management Agent (Agent 3.1) for Mentora
 * 
 * Features:
 * - Google OAuth 2.0 integration
 * - Study task management with timezone support
 * - Google Calendar and Tasks sync
 * - AI-powered daily/weekly summaries via Groq
 * 
 * Architecture:
 * - Routes: HTTP handling only
 * - Services: Business logic
 * - DB Helpers: Database operations
 * - Middleware: Cross-cutting concerns
 * 
 * TODO: Add graceful shutdown handling
 * TODO: Add health check with dependency validation
 * TODO: Implement request ID middleware for tracing
 * TODO: Add API rate limiting
 * TODO: Add request body size limits
 * TODO: Implement async job queue for sync operations
 * TODO: Add webhook endpoints for Google Calendar push notifications
 */

const express = require('express');
const cors = require('cors');

const config = require('./config');
const logger = require('./utils/logger');
const latencyTracker = require('./middleware/latencyTracker');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// Import routes
const calendarRouter = require('./routes/calendar');
const studyPlanRouter = require('./routes/studyPlan');

// Initialize Express app
const app = express();

// =============================================================================
// Middleware Stack
// =============================================================================

// Enable CORS
// TODO: Configure allowed origins for production
app.use(cors({
    origin: '*', // TODO: Restrict in production to specific domains
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-User-Id']
}));

// Parse JSON bodies
// TODO: Add request body size limit for production
app.use(express.json({
    limit: '1mb'
}));

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Latency tracking for all requests
app.use(latencyTracker);

// =============================================================================
// Routes
// =============================================================================

// Root endpoint - API information
app.get('/', (req, res) => {
    res.json({
        name: 'Mentora Calendar Agent API',
        version: '1.0.0',
        description: 'Calendar and Task Management Agent (Agent 3.1)',
        endpoints: {
            oauth: {
                connect: 'POST /calendar/connect-google',
                callback: 'POST /calendar/oauth/callback'
            },
            tasks: {
                create: 'POST /calendar/tasks',
                today: 'GET /calendar/tasks/today',
                week: 'GET /calendar/tasks/week',
                updateStatus: 'PATCH /calendar/tasks/:taskId/status'
            },
            sync: {
                syncAll: 'POST /calendar/sync'
            },
            summaries: {
                daily: 'POST /calendar/summary/daily',
                weekly: 'POST /calendar/summary/weekly'
            },
            studyPlans: {
                generate: 'POST /study-plan/generate',
                apply: 'POST /study-plan/apply',
                getById: 'GET /study-plan/:id',
                getUserPlans: 'GET /study-plan/user/plans'
            }
        },
        authentication: {
            header: 'X-User-Id',
            format: 'UUID',
            description: 'User ID passed in header for all authenticated endpoints'
        },
        status: 'running'
    });
});

// Health check endpoint
// TODO: Add actual health checks (DB connection, API keys validity, Google connectivity)
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'calendar-agent',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: config.nodeEnv
    });
});

// Mount Calendar routes
app.use('/calendar', calendarRouter);

// Mount Study Plan routes
app.use('/study-plan', studyPlanRouter);

// =============================================================================
// Error Handling
// =============================================================================

// 404 handler - must be after all routes
app.use(notFoundHandler);

// Global error handler - must be last
app.use(errorHandler);

// =============================================================================
// Server Startup
// =============================================================================

const PORT = config.port;

// TODO: Add graceful shutdown handling
// process.on('SIGTERM', async () => {
//     logger.info('SIGTERM received, shutting down gracefully');
//     // Close database connections
//     // Complete in-flight requests
//     await server.close();
//     process.exit(0);
// });

app.listen(PORT, () => {
    logger.info(`🚀 Calendar Agent server started`, {
        port: PORT,
        environment: config.nodeEnv,
        timestamp: new Date().toISOString()
    });

    logger.info('Available endpoints:', {
        root: `http://localhost:${PORT}/`,
        health: `http://localhost:${PORT}/health`,
        calendar: `http://localhost:${PORT}/calendar`
    });

    // Log configuration status (without sensitive info)
    logger.info('Configuration loaded:', {
        hasSupabaseUrl: !!config.supabase.url,
        hasGroqApiKey: !!config.groq.apiKey,
        hasGoogleClientId: !!config.google.clientId,
        hasGoogleClientSecret: !!config.google.clientSecret,
        defaultTimezone: config.timezone.default
    });
});

// Export app for testing
module.exports = app;
