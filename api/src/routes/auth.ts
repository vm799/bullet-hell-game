/**
 * Authentication Routes
 */

import { Router, Request, Response, NextFunction } from 'express';
import * as admin from 'firebase-admin';
import { query } from '../db/connection';
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

    // Check if user already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE firebase_id = $1',
      [firebaseId]
    );

    if (existingUser.rows.length > 0) {
      throw createApiError('User already exists', 409);
    }

    // Check if username is taken
    const usernameTaken = await query(
      'SELECT id FROM users WHERE username = $1',
      [username]
    );

    if (usernameTaken.rows.length > 0) {
      throw createApiError('Username already taken', 409);
    }

    // Create user
    const result = await query(
      `INSERT INTO users (firebase_id, username, email, coins)
       VALUES ($1, $2, $3, $4)
       RETURNING id, firebase_id, username, email, rating, wins, losses, coins, created_at`,
      [firebaseId, username, email, parseInt(process.env.STARTING_COINS || '0')]
    );

    const user = result.rows[0];

    res.status(201).json({
      user: {
        id: user.id,
        firebaseId: user.firebase_id,
        username: user.username,
        email: user.email,
        rating: user.rating,
        wins: user.wins,
        losses: user.losses,
        createdAt: user.created_at,
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

    // Find user
    const result = await query(
      `SELECT id, firebase_id, username, email, rating, wins, losses, coins, created_at
       FROM users WHERE firebase_id = $1`,
      [firebaseId]
    );

    if (result.rows.length === 0) {
      throw createApiError('User not found', 404);
    }

    const user = result.rows[0];

    res.json({
      user: {
        id: user.id,
        firebaseId: user.firebase_id,
        username: user.username,
        email: user.email,
        rating: user.rating,
        wins: user.wins,
        losses: user.losses,
        createdAt: user.created_at,
      },
      token: firebaseToken,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
