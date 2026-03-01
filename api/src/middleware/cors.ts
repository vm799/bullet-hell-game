/**
 * CORS Middleware
 * Handles Cross-Origin Resource Sharing configuration
 */

import cors from 'cors';

export const corsMiddleware = cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:8081',
    'http://localhost:19006', // Expo web
    'exp://*', // Expo
    'http://*', // Allow localhost variants
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200,
});
