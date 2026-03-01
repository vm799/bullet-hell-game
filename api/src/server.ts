/**
 * Main Express Server
 * Sets up middleware, routes, and database connections
 */

import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

// Load environment variables
dotenv.config();

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { rateLimitMiddleware } from './middleware/rateLimit';
import { firebaseAuthMiddleware } from './middleware/firebaseAuth';
import { corsMiddleware } from './middleware/cors';

// Import routes
import authRoutes from './routes/auth';
import leaderboardRoutes from './routes/leaderboards';
import userRoutes from './routes/users';
import cosmeticsRoutes from './routes/cosmetics';
import matchRoutes from './routes/match';
import healthRoutes from './routes/health';

// Import services
import { initializeFirebase } from './services/firebaseAdminInit';
import { initializeDatabase } from './db/connection';

const app: Express = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(corsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const requestId = uuidv4();
  req.id = requestId;
  console.log(
    `[${new Date().toISOString()}] ${req.method} ${req.path} (${requestId})`
  );
  next();
});

// Health check route (no auth required)
app.use('/health', healthRoutes);

// Apply rate limiting
app.use('/auth/login', rateLimitMiddleware('login'));
app.use('/auth/register', rateLimitMiddleware('login'));
app.use(rateLimitMiddleware('api'));

// Public routes (no auth required)
app.use('/auth', authRoutes);

// Protected routes (require Firebase auth)
app.use(firebaseAuthMiddleware);
app.use('/user', userRoutes);
app.use('/leaderboards', leaderboardRoutes);
app.use('/cosmetics', cosmeticsRoutes);
app.use('/match', matchRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path,
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

/**
 * Initialize application and start server
 */
async function startServer() {
  try {
    // Initialize Firebase
    console.log('Initializing Firebase...');
    await initializeFirebase();
    console.log('Firebase initialized');

    // Initialize database
    console.log('Initializing database...');
    await initializeDatabase();
    console.log('Database connected');

    // Start HTTP server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 API URL: ${process.env.API_URL || `http://localhost:${PORT}`}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  process.exit(0);
});

// Start the server
startServer();

export default app;
