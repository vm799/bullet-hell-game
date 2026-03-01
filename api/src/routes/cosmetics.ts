/**
 * Cosmetics / Shop Routes
 */

import { Router, Request, Response, NextFunction } from 'express';
import * as admin from 'firebase-admin';
import { getDb } from '../db/connection';
import { createApiError } from '../middleware/errorHandler';

const router = Router();

/**
 * GET /cosmetics
 * Get all cosmetics shop items
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const db = getDb();

    const snapshot = await db.collection('cosmetics')
      .orderBy('type')
      .orderBy('name')
      .get();

    const cosmetics = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        type: data.type,
        name: data.name,
        description: data.description,
        costCoins: data.costCoins,
        imageUrl: data.imageUrl,
      };
    });

    res.json(cosmetics);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /cosmetics/buy
 * Purchase a cosmetic item
 */
router.post('/buy', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    const { cosmeticId } = req.body;

    if (!cosmeticId) {
      throw createApiError('Missing cosmeticId', 400);
    }

    const db = getDb();

    // Get cosmetic details
    const cosmeticDoc = await db.collection('cosmetics').doc(cosmeticId).get();

    if (!cosmeticDoc.exists) {
      throw createApiError('Cosmetic not found', 404);
    }

    const cosmetic = cosmeticDoc.data()!;
    const cost = cosmetic.costCoins;

    // Get user - find by firebaseId since userId from auth is firebase uid
    const usersSnapshot = await db.collection('users')
      .where('firebaseId', '==', userId)
      .limit(1)
      .get();

    if (usersSnapshot.empty) {
      throw createApiError('User not found', 404);
    }

    const userDoc = usersSnapshot.docs[0];
    const userData = userDoc.data();

    if (userData.coins < cost) {
      throw createApiError('Insufficient coins', 400);
    }

    // Check if already owned
    const ownedSnapshot = await db.collection('user_cosmetics')
      .where('userId', '==', userDoc.id)
      .where('cosmeticId', '==', cosmeticId)
      .limit(1)
      .get();

    if (!ownedSnapshot.empty) {
      throw createApiError('Already owned', 400);
    }

    // Use a batch to deduct coins and add cosmetic atomically
    const batch = db.batch();

    batch.update(userDoc.ref, {
      coins: admin.firestore.FieldValue.increment(-cost),
    });

    const userCosmeticRef = db.collection('user_cosmetics').doc();
    batch.set(userCosmeticRef, {
      userId: userDoc.id,
      cosmeticId,
      isEquipped: false,
      purchasedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await batch.commit();

    res.json({ success: true, message: 'Purchase successful' });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /cosmetics/:cosmeticId/equip
 * Equip a cosmetic
 */
router.post('/:cosmeticId/equip', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    const { cosmeticId } = req.params;
    const db = getDb();

    // Find user doc by firebaseId
    const usersSnapshot = await db.collection('users')
      .where('firebaseId', '==', userId)
      .limit(1)
      .get();

    if (usersSnapshot.empty) {
      throw createApiError('User not found', 404);
    }

    const userDocId = usersSnapshot.docs[0].id;

    // Check ownership
    const ownedSnapshot = await db.collection('user_cosmetics')
      .where('userId', '==', userDocId)
      .where('cosmeticId', '==', cosmeticId)
      .limit(1)
      .get();

    if (ownedSnapshot.empty) {
      throw createApiError('Cosmetic not owned', 404);
    }

    // Get cosmetic type
    const cosmeticDoc = await db.collection('cosmetics').doc(cosmeticId).get();
    const cosmeticType = cosmeticDoc.data()?.type;

    // Get all cosmetic IDs of the same type
    const allCosmeticsOfType = await db.collection('cosmetics')
      .where('type', '==', cosmeticType)
      .get();
    const cosmeticIdsOfType = allCosmeticsOfType.docs.map((d) => d.id);

    // Find all user_cosmetics to unequip ones of the same type
    const userCosmeticsSnapshot = await db.collection('user_cosmetics')
      .where('userId', '==', userDocId)
      .get();

    const batch = db.batch();

    userCosmeticsSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      if (cosmeticIdsOfType.includes(data.cosmeticId) && data.cosmeticId !== cosmeticId) {
        batch.update(doc.ref, { isEquipped: false });
      }
    });

    // Equip the selected cosmetic
    batch.update(ownedSnapshot.docs[0].ref, { isEquipped: true });

    await batch.commit();

    res.json({ success: true, message: 'Cosmetic equipped' });
  } catch (error) {
    next(error);
  }
});

export default router;
