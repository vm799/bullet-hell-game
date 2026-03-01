/**
 * Firebase Authentication Middleware
 * Verifies Firebase tokens and attaches user info to requests
 */

import { Request, Response, NextFunction } from 'express';
import * as admin from 'firebase-admin';
import { createApiError } from './errorHandler';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userEmail?: string;
      id?: string;
    }
  }
}

export const firebaseAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createApiError('Missing or invalid authorization token', 401);
    }

    const token = authHeader.substring(7);

    // Verify Firebase token
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.userId = decodedToken.uid;
    req.userEmail = decodedToken.email;

    next();
  } catch (error) {
    if (error instanceof Error) {
      console.error('Firebase auth error:', error.message);
    }
    throw createApiError('Invalid or expired token', 401);
  }
};

/**
 * Optional Firebase auth - doesn't fail if token is missing
 */
export const firebaseAuthOptional = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decodedToken = await admin.auth().verifyIdToken(token);
      req.userId = decodedToken.uid;
      req.userEmail = decodedToken.email;
    }
  } catch (error) {
    console.warn('Firebase auth optional - skipping:', error instanceof Error ? error.message : 'Unknown error');
  }

  next();
};
