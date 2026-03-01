/**
 * Match / Matchmaking Routes
 */

import { Router, Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import * as admin from 'firebase-admin';
import { getDb } from '../db/connection';
import { createApiError } from '../middleware/errorHandler';
import { getDatabase } from '../services/firebaseAdminInit';

const router = Router();

// In-memory matchmaking queue
interface QueueEntry {
  userId: string;
  rating: number;
  timestamp: number;
}

const matchmakingQueue: QueueEntry[] = [];
const MATCHMAKING_TIMEOUT = parseInt(process.env.MATCHMAKING_TIMEOUT || '30') * 1000;

/**
 * POST /match
 * Request matchmaking
 */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    const db = getDb();

    // Get user rating - find by firebaseId
    const usersSnapshot = await db.collection('users')
      .where('firebaseId', '==', userId)
      .limit(1)
      .get();

    if (usersSnapshot.empty) {
      throw createApiError('User not found', 404);
    }

    const userDoc = usersSnapshot.docs[0];
    const userRating = userDoc.data().rating;
    const userDocId = userDoc.id;

    // Find matching opponent
    const matchedIndex = matchmakingQueue.findIndex((entry) => {
      const ratingDiff = Math.abs(entry.userId !== userDocId ? entry.rating - userRating : 2000);
      return ratingDiff < 200 && entry.userId !== userDocId;
    });

    if (matchedIndex >= 0) {
      // Match found
      const opponent = matchmakingQueue.splice(matchedIndex, 1)[0];
      const matchId = uuidv4();

      // Create match record in Firestore
      await db.collection('matches').doc(matchId).set({
        player1Id: userDocId,
        player2Id: opponent.userId,
        winnerId: null,
        durationSeconds: null,
        player1Score: 0,
        player2Score: 0,
        matchData: null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Create Firebase Realtime Database match entry for real-time sync
      const rtdb = getDatabase();
      await rtdb.ref(`matches/${matchId}`).set({
        players: {
          p1: {
            id: userDocId,
            x: 200,
            y: 300,
            hp: 100,
            score: 0,
            cosmetics: { skinId: 'default', weaponId: 'standard', trailId: 'none' },
          },
          p2: {
            id: opponent.userId,
            x: 600,
            y: 300,
            hp: 100,
            score: 0,
            cosmetics: { skinId: 'default', weaponId: 'standard', trailId: 'none' },
          },
        },
        bullets: {},
        gameState: 'playing',
        winner: null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      res.json({ matchId, opponent: opponent.userId });
    } else {
      // Add to queue
      const queueEntry: QueueEntry = {
        userId: userDocId,
        rating: userRating,
        timestamp: Date.now(),
      };

      matchmakingQueue.push(queueEntry);

      // Remove after timeout
      setTimeout(() => {
        const index = matchmakingQueue.findIndex((e) => e.userId === userDocId);
        if (index >= 0) {
          matchmakingQueue.splice(index, 1);
        }
      }, MATCHMAKING_TIMEOUT);

      res.json({ matchId: null, message: 'Added to matchmaking queue' });
    }
  } catch (error) {
    next(error);
  }
});

/**
 * GET /match/:id
 * Get match state (fallback if Firebase RTDB is down)
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const db = getDb();

    const doc = await db.collection('matches').doc(id).get();

    if (!doc.exists) {
      throw createApiError('Match not found', 404);
    }

    const match = doc.data()!;

    res.json({
      id: doc.id,
      player1Id: match.player1Id,
      player2Id: match.player2Id,
      winnerId: match.winnerId,
      duration: match.durationSeconds,
      player1Score: match.player1Score,
      player2Score: match.player2Score,
      matchData: match.matchData,
      createdAt: match.createdAt?.toMillis?.() || match.createdAt,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /match/:id/end
 * End a match and update stats
 */
router.post('/:id/end', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { winnerId, duration, player1Score, player2Score } = req.body;

    if (!winnerId) {
      throw createApiError('Missing winnerId', 400);
    }

    const db = getDb();

    // Get match details
    const matchDoc = await db.collection('matches').doc(id).get();

    if (!matchDoc.exists) {
      throw createApiError('Match not found', 404);
    }

    const match = matchDoc.data()!;
    const loserId = winnerId === match.player1Id ? match.player2Id : match.player1Id;

    // Calculate ELO changes
    const K = parseInt(process.env.ELO_K_FACTOR || '32');

    const winnerDoc = await db.collection('users').doc(winnerId).get();
    const loserDoc = await db.collection('users').doc(loserId).get();

    const winnerRating = winnerDoc.data()?.rating || 1000;
    const loserRating = loserDoc.data()?.rating || 1000;

    const expectedWinner = 1 / (1 + Math.pow(10, (loserRating - winnerRating) / 400));
    const expectedLoser = 1 / (1 + Math.pow(10, (winnerRating - loserRating) / 400));

    const winnerDelta = Math.round(K * (1 - expectedWinner));
    const loserDelta = Math.round(K * (0 - expectedLoser));

    // Use a batch to update everything atomically
    const batch = db.batch();

    // Update match record
    batch.update(matchDoc.ref, {
      winnerId,
      durationSeconds: duration,
      player1Score,
      player2Score,
    });

    // Update winner stats
    batch.update(winnerDoc.ref, {
      wins: admin.firestore.FieldValue.increment(1),
      rating: admin.firestore.FieldValue.increment(winnerDelta),
    });

    // Update loser stats
    batch.update(loserDoc.ref, {
      losses: admin.firestore.FieldValue.increment(1),
      rating: admin.firestore.FieldValue.increment(loserDelta),
    });

    await batch.commit();

    res.json({
      success: true,
      winner: {
        userId: winnerId,
        ratingDelta: winnerDelta,
      },
      loser: {
        userId: loserId,
        ratingDelta: loserDelta,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
