/**
 * Authentication Routes
 */

import { Router, Request, Response, NextFunction } from 'express';
import * as admin from 'firebase-admin';
import { getDb } from '../db/connection';
import { createApiError } from '../middleware/errorHandler';

const router = Router();

/**
 * POST /auth/register
 * Register a new user
 */
router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { firebaseToken, username } = req.body;

    if (!firebaseToken || !username) {
      throw createApiError('Missing firebaseToken or username', 400);
    }

    // Verify Firebase token
    const decodedToken = await admin.auth().verifyIdToken(firebaseToken);
    const firebaseId = decodedToken.uid;
    const email = decodedToken.email || `user-${firebaseId}@bullethell.local`;

    const db = getDb();

    // Check if user already exists
    const existingUser = await db.collection('users')
      .where('firebaseId', '==', firebaseId)
      .limit(1)
      .get();

    if (!existingUser.empty) {
      throw createApiError('User already exists', 409);
    }

    // Check if username is taken
    const usernameTaken = await db.collection('users')
      .where('username', '==', username)
      .limit(1)
      .get();

    if (!usernameTaken.empty) {
      throw createApiError('Username already taken', 409);
    }

    // Create user
    const userRef = db.collection('users').doc();
    const userData = {
      firebaseId,
      username,
      email,
      rating: 1000,
      wins: 0,
      losses: 0,
      coins: parseInt(process.env.STARTING_COINS || '0'),
      avatarUrl: null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await userRef.set(userData);

    res.status(201).json({
      user: {
        id: userRef.id,
        firebaseId,
        username,
        email,
        rating: 1000,
        wins: 0,
        losses: 0,
        createdAt: Date.now(),
      },
      token: firebaseToken,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /auth/login
 * Login with Firebase token
 */
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { firebaseToken } = req.body;

    if (!firebaseToken) {
      throw createApiError('Missing firebaseToken', 400);
    }

    // Verify Firebase token
    const decodedToken = await admin.auth().verifyIdToken(firebaseToken);
    const firebaseId = decodedToken.uid;

    const db = getDb();

    // Find user
    const snapshot = await db.collection('users')
      .where('firebaseId', '==', firebaseId)
      .limit(1)
      .get();

    if (snapshot.empty) {
      throw createApiError('User not found', 404);
    }

    const doc = snapshot.docs[0];
    const user = doc.data();

    res.json({
      user: {
        id: doc.id,
        firebaseId: user.firebaseId,
        username: user.username,
        email: user.email,
        rating: user.rating,
        wins: user.wins,
        losses: user.losses,
        createdAt: user.createdAt?.toMillis?.() || user.createdAt,
      },
      token: firebaseToken,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
