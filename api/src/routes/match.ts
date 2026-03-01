/**
 * Match / Matchmaking Routes
 */

import { Router, Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../db/connection';
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

    // Get user rating
    const userResult = await query(
      'SELECT rating FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      throw createApiError('User not found', 404);
    }

    const userRating = userResult.rows[0].rating;

    // Find matching opponent
    const matchedIndex = matchmakingQueue.findIndex((entry) => {
      const ratingDiff = Math.abs(entry.userId !== userId ? entry.rating - userRating : 2000);
      return ratingDiff < 200 && entry.userId !== userId;
    });

    if (matchedIndex >= 0) {
      // Match found
      const opponent = matchmakingQueue.splice(matchedIndex, 1)[0];
      const matchId = uuidv4();

      // Create match record in database
      await query(
        `INSERT INTO matches (id, player1_id, player2_id)
         VALUES ($1, $2, $3)`,
        [matchId, userId, opponent.userId]
      );

      // Create Firebase match entry
      const db = getDatabase();
      await db.ref(`matches/${matchId}`).set({
        players: {
          p1: {
            id: userId,
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
        userId,
        rating: userRating,
        timestamp: Date.now(),
      };

      matchmakingQueue.push(queueEntry);

      // Remove after timeout
      setTimeout(() => {
        const index = matchmakingQueue.findIndex((e) => e.userId === userId);
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
 * Get match state (fallback if Firebase is down)
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT id, player1_id, player2_id, winner_id, duration_seconds, 
              player1_score, player2_score, match_data, created_at
       FROM matches WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      throw createApiError('Match not found', 404);
    }

    const match = result.rows[0];

    res.json({
      id: match.id,
      player1Id: match.player1_id,
      player2Id: match.player2_id,
      winnerId: match.winner_id,
      duration: match.duration_seconds,
      player1Score: match.player1_score,
      player2Score: match.player2_score,
      matchData: match.match_data,
      createdAt: match.created_at,
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

    // Get match details
    const matchResult = await query(
      'SELECT player1_id, player2_id FROM matches WHERE id = $1',
      [id]
    );

    if (matchResult.rows.length === 0) {
      throw createApiError('Match not found', 404);
    }

    const match = matchResult.rows[0];
    const loserIdId = winnerId === match.player1_id ? match.player2_id : match.player1_id;

    // Calculate ELO changes
    const K = parseInt(process.env.ELO_K_FACTOR || '32');
    const baseRating = parseInt(process.env.ELO_BASE_RATING || '1000');

    const winnerResult = await query('SELECT rating FROM users WHERE id = $1', [winnerId]);
    const loserResult = await query('SELECT rating FROM users WHERE id = $1', [loserIdId]);

    const winnerRating = winnerResult.rows[0].rating;
    const loserRating = loserResult.rows[0].rating;

    const expectedWinner = 1 / (1 + Math.pow(10, (loserRating - winnerRating) / 400));
    const expectedLoser = 1 / (1 + Math.pow(10, (winnerRating - loserRating) / 400));

    const winnerDelta = Math.round(K * (1 - expectedWinner));
    const loserDelta = Math.round(K * (0 - expectedLoser));

    // Update match record
    await query(
      `UPDATE matches
       SET winner_id = $1, duration_seconds = $2, player1_score = $3, player2_score = $4
       WHERE id = $5`,
      [winnerId, duration, player1Score, player2Score, id]
    );

    // Update both players' stats
    await query(
      `UPDATE users
       SET wins = wins + 1, rating = rating + $1
       WHERE id = $2`,
      [winnerDelta, winnerId]
    );

    await query(
      `UPDATE users
       SET losses = losses + 1, rating = rating + $1
       WHERE id = $2`,
      [loserDelta, loserIdId]
    );

    res.json({
      success: true,
      winner: {
        userId: winnerId,
        ratingDelta: winnerDelta,
      },
      loser: {
        userId: loserIdId,
        ratingDelta: loserDelta,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
