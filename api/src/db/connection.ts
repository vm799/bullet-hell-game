/**
 * Firestore Database Connection
 * Replaces PostgreSQL with Firebase Firestore
 */

import * as admin from 'firebase-admin';

let db: admin.firestore.Firestore | null = null;

/**
 * Initialize Firestore connection
 */
export async function initializeDatabase(): Promise<void> {
  if (db) {
    console.log('Firestore already initialized');
    return;
  }

  try {
    db = admin.firestore();
    console.log('Firestore initialized successfully');

    // Seed default cosmetics if they don't exist
    await seedDefaultCosmetics();
  } catch (error) {
    console.error('Firestore initialization error:', error);
    throw error;
  }
}

/**
 * Get Firestore instance
 */
export function getDb(): admin.firestore.Firestore {
  if (!db) {
    throw new Error('Firestore not initialized');
  }
  return db;
}

/**
 * Seed default cosmetics into Firestore
 */
async function seedDefaultCosmetics(): Promise<void> {
  const cosmeticsRef = getDb().collection('cosmetics');
  const snapshot = await cosmeticsRef.limit(1).get();

  if (!snapshot.empty) {
    return; // Already seeded
  }

  console.log('Seeding default cosmetics...');

  const defaults = [
    { type: 'skin', name: 'Default', description: 'Classic blue spaceship', costCoins: 0, imageUrl: null },
    { type: 'skin', name: 'Neon', description: 'Glowing neon skin', costCoins: 500, imageUrl: null },
    { type: 'skin', name: 'Crystal', description: 'Crystalline appearance', costCoins: 500, imageUrl: null },
    { type: 'skin', name: 'Fire', description: 'Burning hot aesthetic', costCoins: 500, imageUrl: null },
    { type: 'skin', name: 'Void', description: 'Dark void energy', costCoins: 500, imageUrl: null },
    { type: 'weapon', name: 'Standard', description: 'Standard bullets', costCoins: 0, imageUrl: null },
    { type: 'weapon', name: 'Plasma', description: 'Plasma charge bullets', costCoins: 500, imageUrl: null },
    { type: 'weapon', name: 'Ice', description: 'Frozen ice projectiles', costCoins: 500, imageUrl: null },
    { type: 'trail', name: 'None', description: 'No trail effect', costCoins: 0, imageUrl: null },
    { type: 'trail', name: 'Neon', description: 'Glowing trail', costCoins: 500, imageUrl: null },
    { type: 'trail', name: 'Flame', description: 'Flame trail effect', costCoins: 500, imageUrl: null },
  ];

  const batch = getDb().batch();
  for (const cosmetic of defaults) {
    const docRef = cosmeticsRef.doc();
    batch.set(docRef, {
      ...cosmetic,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  await batch.commit();
  console.log('Default cosmetics seeded');
}
