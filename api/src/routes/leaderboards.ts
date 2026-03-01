/**
 * Leaderboard Routes
 */

import { Router, Request, Response, NextFunction } from 'express';
import { getDb } from '../db/connection';

const router = Router();

/**
 * GET /leaderboards
 * Get global leaderboard
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 100, 1000);
    const db = getDb();

    const snapshot = await db.collection('users')
      .orderBy('rating', 'desc')
      .limit(limit)
      .get();

    let rank = 0;
    const leaderboard = snapshot.docs
      .filter((doc) => {
        const data = doc.data();
        return data.wins > 0 || data.losses > 0;
      })
      .map((doc) => {
        rank++;
        const data = doc.data();
        const totalGames = data.wins + data.losses;
        return {
          rank,
          userId: doc.id,
          username: data.username,
          rating: data.rating,
          wins: data.wins,
          winRate: totalGames > 0
            ? Math.round((data.wins / totalGames) * 100) / 100
            : 0,
        };
      });

    res.json(leaderboard);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /leaderboards/weekly
 * Get weekly leaderboard
 */
router.get('/weekly', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 100, 1000);
    const db = getDb();

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Get matches from the last 7 days
    const matchesSnapshot = await db.collection('matches')
      .where('createdAt', '>=', oneWeekAgo)
      .get();

    // Count wins per user
    const winCounts: Record<string, number> = {};
    matchesSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      if (data.winnerId) {
        winCounts[data.winnerId] = (winCounts[data.winnerId] || 0) + 1;
      }
    });

    // Sort by wins and take top entries
    const sortedUserIds = Object.entries(winCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit);

    // Fetch user details for top winners
    const leaderboard = await Promise.all(
      sortedUserIds.map(async ([userId, wins], index) => {
        const userDoc = await db.collection('users').doc(userId).get();
        const userData = userDoc.data();
        return {
          rank: index + 1,
          userId,
          username: userData?.username || 'Unknown',
          rating: userData?.rating || 0,
          wins,
          winRate: 1.0,
        };
      })
    );

    res.json(leaderboard);
  } catch (error) {
    next(error);
  }
});

export default router;
