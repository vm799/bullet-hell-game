/**
 * Auth Service
 * User registration, Firebase token verification
 */

import * as admin from 'firebase-admin';
import { getDb } from '../db/connection';
import { createApiError } from '../middleware/errorHandler';
import { getBaseRating } from './stats';

interface UserData {
  id: string;
  firebaseId: string;
  username: string;
  email: string;
  rating: number;
  wins: number;
  losses: number;
  coins: number;
  createdAt: number;
}

/**
 * Verify a Firebase ID token and return the decoded claims
 */
export async function verifyFirebaseToken(
  token: string
): Promise<admin.auth.DecodedIdToken> {
  try {
    return await admin.auth().verifyIdToken(token);
  } catch {
    throw createApiError('Invalid or expired Firebase token', 401);
  }
}

/**
 * Register a new user
 */
export async function registerUser(
  firebaseId: string,
  email: string,
  username: string
): Promise<UserData> {
  const db = getDb();

  // Check for existing user
  const existingUser = await db
    .collection('users')
    .where('firebaseId', '==', firebaseId)
    .limit(1)
    .get();

  if (!existingUser.empty) {
    throw createApiError('User already exists', 409);
  }

  // Check username availability
  const usernameTaken = await db
    .collection('users')
    .where('username', '==', username)
    .limit(1)
    .get();

  if (!usernameTaken.empty) {
    throw createApiError('Username already taken', 409);
  }

  // Create user
  const startingCoins = parseInt(process.env.STARTING_COINS || '0');
  const userRef = db.collection('users').doc();

  const userData = {
    firebaseId,
    username,
    email,
    rating: getBaseRating(),
    wins: 0,
    losses: 0,
    coins: startingCoins,
    avatarUrl: null,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  await userRef.set(userData);

  return {
    id: userRef.id,
    firebaseId,
    username,
    email,
    rating: getBaseRating(),
    wins: 0,
    losses: 0,
    coins: startingCoins,
    createdAt: Date.now(),
  };
}

/**
 * Find user by Firebase UID
 */
export async function findUserByFirebaseId(
  firebaseId: string
): Promise<UserData | null> {
  const db = getDb();

  const snapshot = await db
    .collection('users')
    .where('firebaseId', '==', firebaseId)
    .limit(1)
    .get();

  if (snapshot.empty) return null;

  const doc = snapshot.docs[0];
  const data = doc.data();

  return {
    id: doc.id,
    firebaseId: data.firebaseId,
    username: data.username,
    email: data.email,
    rating: data.rating,
    wins: data.wins,
    losses: data.losses,
    coins: data.coins,
    createdAt: data.createdAt?.toMillis?.() || data.createdAt,
  };
}
