/**
 * Leaderboard Routes
 */

import { Router, Request, Response, NextFunction } from 'express';
import { query } from '../db/connection';

const router = Router();

/**
 * GET /leaderboards
 * Get global leaderboard
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 100, 1000);

    const result = await query(
      `SELECT 
        ROW_NUMBER() OVER (ORDER BY rating DESC) as rank,
        id as userId,
        username,
        rating,
        wins,
        losses,
        CASE 
          WHEN (wins + losses) = 0 THEN 0 
          ELSE CAST(wins AS FLOAT) / (wins + losses) 
        END as winRate
       FROM users
       WHERE wins > 0 OR losses > 0
       ORDER BY rating DESC
       LIMIT $1`,
      [limit]
    );

    const leaderboard = result.rows.map((row) => ({
      rank: row.rank,
      userId: row.userid,
      username: row.username,
      rating: row.rating,
      wins: row.wins,
      winRate: Math.round(row.winrate * 100) / 100,
    }));

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

    const result = await query(
      `SELECT 
        ROW_NUMBER() OVER (ORDER BY week_wins DESC) as rank,
        u.id as userId,
        u.username,
        u.rating,
        COUNT(*) as week_wins,
        0 as losses
       FROM users u
       LEFT JOIN matches m ON (u.id = m.winner_id AND m.created_at > NOW() - INTERVAL '7 days')
       GROUP BY u.id, u.username, u.rating
       HAVING COUNT(*) > 0
       ORDER BY week_wins DESC
       LIMIT $1`,
      [limit]
    );

    const leaderboard = result.rows.map((row) => ({
      rank: row.rank,
      userId: row.userid,
      username: row.username,
      rating: row.rating,
      wins: row.week_wins,
      winRate: 1.0,
    }));

    res.json(leaderboard);
  } catch (error) {
    next(error);
  }
});

export default router;
