/**
 * Firebase Cloud Functions Entry Point
 * Wraps the Express app as a Cloud Function for Firebase deployment
 */

import * as functions from 'firebase-functions';
import express, { Express, Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

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

// Initialize Firebase Admin (runs once on cold start)
initializeFirebase();

const app: Express = express();

// Middleware
app.use(corsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
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

// Error handling middleware
app.use(errorHandler);

// Initialize Firestore on first request
let initialized = false;
const originalHandler = app;
const wrappedApp = express();
wrappedApp.use(async (req: Request, res: Response, next: NextFunction) => {
  if (!initialized) {
    await initializeDatabase();
    initialized = true;
  }
  next();
});
wrappedApp.use(originalHandler);

// Export as Firebase Cloud Function
export const api = functions.https.onRequest(wrappedApp);
