/**
 * User Routes
 */

import { Router, Request, Response, NextFunction } from 'express';
import { query } from '../db/connection';
import { createApiError } from '../middleware/errorHandler';

const router = Router();

/**
 * GET /user/:id
 * Get user profile
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT id, firebase_id as firebaseId, username, email, rating, wins, losses, coins, 
              avatar_url as avatarUrl, created_at as createdAt
       FROM users WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      throw createApiError('User not found', 404);
    }

    const user = result.rows[0];

    res.json({
      id: user.id,
      firebaseId: user.firebaseid,
      username: user.username,
      email: user.email,
      rating: user.rating,
      wins: user.wins,
      losses: user.losses,
      coins: user.coins,
      avatarUrl: user.avatarurl,
      createdAt: user.createdat,
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

    // Update user stats
    const result = await query(
      `UPDATE users
       SET 
        wins = wins + $1,
        losses = losses + $2,
        rating = rating + $3,
        coins = coins + $4,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING id, firebase_id as firebaseId, username, rating, wins, losses, coins`,
      [
        won ? 1 : 0,
        won ? 0 : 1,
        ratingDelta,
        coinsEarned || (won ? 100 : 10),
        id,
      ]
    );

    if (result.rows.length === 0) {
      throw createApiError('User not found', 404);
    }

    const user = result.rows[0];

    res.json({
      id: user.id,
      firebaseId: user.firebaseid,
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

    const result = await query(
      `SELECT uc.id, uc.user_id as userId, uc.cosmetic_id as cosmeticId, 
              uc.is_equipped as isEquipped, uc.purchased_at as purchasedAt
       FROM user_cosmetics uc
       WHERE uc.user_id = $1
       ORDER BY uc.purchased_at DESC`,
      [userId]
    );

    const cosmetics = result.rows.map((row) => ({
      id: row.id,
      userId: row.userid,
      cosmeticId: row.cosmeticid,
      isEquipped: row.isequipped,
      purchasedAt: row.purchased_at,
    }));

    res.json(cosmetics);
  } catch (error) {
    next(error);
  }
});

export default router;
