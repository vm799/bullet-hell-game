/**
 * User Routes
 */

import { Router, Request, Response, NextFunction } from 'express';
import * as admin from 'firebase-admin';
import { getDb } from '../db/connection';
import { createApiError } from '../middleware/errorHandler';

const router = Router();

/**
 * GET /user/:id
 * Get user profile
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const db = getDb();

    const doc = await db.collection('users').doc(id).get();

    if (!doc.exists) {
      throw createApiError('User not found', 404);
    }

    const user = doc.data()!;

    res.json({
      id: doc.id,
      firebaseId: user.firebaseId,
      username: user.username,
      email: user.email,
      rating: user.rating,
      wins: user.wins,
      losses: user.losses,
      coins: user.coins,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt?.toMillis?.() || user.createdAt,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /user/:id/stats
 * Update user stats after match
 */
router.post('/:id/stats', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { won, ratingDelta, coinsEarned } = req.body;

    if (typeof won !== 'boolean' || !ratingDelta) {
      throw createApiError('Invalid stats update data', 400);
    }

    const db = getDb();
    const userRef = db.collection('users').doc(id);

    await userRef.update({
      wins: admin.firestore.FieldValue.increment(won ? 1 : 0),
      losses: admin.firestore.FieldValue.increment(won ? 0 : 1),
      rating: admin.firestore.FieldValue.increment(ratingDelta),
      coins: admin.firestore.FieldValue.increment(coinsEarned || (won ? 100 : 10)),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const updatedDoc = await userRef.get();

    if (!updatedDoc.exists) {
      throw createApiError('User not found', 404);
    }

    const user = updatedDoc.data()!;

    res.json({
      id: updatedDoc.id,
      firebaseId: user.firebaseId,
      username: user.username,
      rating: user.rating,
      wins: user.wins,
      losses: user.losses,
      coins: user.coins,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /user/cosmetics
 * Get user's cosmetics
 */
router.get('/cosmetics', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    const db = getDb();

    const snapshot = await db.collection('user_cosmetics')
      .where('userId', '==', userId)
      .orderBy('purchasedAt', 'desc')
      .get();

    const cosmetics = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        cosmeticId: data.cosmeticId,
        isEquipped: data.isEquipped,
        purchasedAt: data.purchasedAt?.toMillis?.() || data.purchasedAt,
      };
    });

    res.json(cosmetics);
  } catch (error) {
    next(error);
  }
});

export default router;
