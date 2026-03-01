/**
 * Cosmetics Service
 * Shop logic, purchase verification, balance validation
 */

import * as admin from 'firebase-admin';
import { getDb } from '../db/connection';
import { createApiError } from '../middleware/errorHandler';

interface CosmeticItem {
  id: string;
  type: 'skin' | 'weapon' | 'trail';
  name: string;
  description: string;
  costCoins: number;
  imageUrl: string | null;
}

/**
 * Get all available cosmetics
 */
export async function getAllCosmetics(): Promise<CosmeticItem[]> {
  const db = getDb();
  const snapshot = await db
    .collection('cosmetics')
    .orderBy('type')
    .orderBy('name')
    .get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as CosmeticItem[];
}

/**
 * Verify and process a cosmetic purchase
 */
export async function purchaseCosmetic(
  firebaseUid: string,
  cosmeticId: string
): Promise<{ success: boolean; message: string }> {
  const db = getDb();

  // Get cosmetic
  const cosmeticDoc = await db.collection('cosmetics').doc(cosmeticId).get();
  if (!cosmeticDoc.exists) {
    throw createApiError('Cosmetic not found', 404);
  }

  const cosmetic = cosmeticDoc.data()!;

  // Get user by firebase ID
  const usersSnapshot = await db
    .collection('users')
    .where('firebaseId', '==', firebaseUid)
    .limit(1)
    .get();

  if (usersSnapshot.empty) {
    throw createApiError('User not found', 404);
  }

  const userDoc = usersSnapshot.docs[0];
  const userData = userDoc.data();

  // Check balance
  if (userData.coins < cosmetic.costCoins) {
    throw createApiError('Insufficient coins', 400);
  }

  // Check if already owned
  const ownedSnapshot = await db
    .collection('user_cosmetics')
    .where('userId', '==', userDoc.id)
    .where('cosmeticId', '==', cosmeticId)
    .limit(1)
    .get();

  if (!ownedSnapshot.empty) {
    throw createApiError('Already owned', 400);
  }

  // Process purchase atomically
  const batch = db.batch();

  batch.update(userDoc.ref, {
    coins: admin.firestore.FieldValue.increment(-cosmetic.costCoins),
  });

  const userCosmeticRef = db.collection('user_cosmetics').doc();
  batch.set(userCosmeticRef, {
    userId: userDoc.id,
    cosmeticId,
    isEquipped: false,
    purchasedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  await batch.commit();

  return { success: true, message: 'Purchase successful' };
}

/**
 * Get cosmetics owned by a user
 */
export async function getUserCosmetics(
  firebaseUid: string
): Promise<any[]> {
  const db = getDb();

  const usersSnapshot = await db
    .collection('users')
    .where('firebaseId', '==', firebaseUid)
    .limit(1)
    .get();

  if (usersSnapshot.empty) {
    return [];
  }

  const userDocId = usersSnapshot.docs[0].id;

  const snapshot = await db
    .collection('user_cosmetics')
    .where('userId', '==', userDocId)
    .get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    purchasedAt: doc.data().purchasedAt?.toMillis?.() || doc.data().purchasedAt,
  }));
}
