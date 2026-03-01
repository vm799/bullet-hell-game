/**
 * Cosmetics / Shop Routes
 */

import { Router, Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../db/connection';
import { createApiError } from '../middleware/errorHandler';

const router = Router();

/**
 * GET /cosmetics
 * Get all cosmetics shop items
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await query(
      `SELECT id, type, name, description, cost_coins as costCoins, image_url as imageUrl
       FROM cosmetics
       ORDER BY type ASC, name ASC`
    );

    const cosmetics = result.rows.map((row) => ({
      id: row.id,
      type: row.type,
      name: row.name,
      description: row.description,
      costCoins: row.costcoins,
      imageUrl: row.imageurl,
    }));

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

    // Get cosmetic details
    const cosmeticResult = await query(
      'SELECT id, cost_coins as costCoins FROM cosmetics WHERE id = $1',
      [cosmeticId]
    );

    if (cosmeticResult.rows.length === 0) {
      throw createApiError('Cosmetic not found', 404);
    }

    const cosmetic = cosmeticResult.rows[0];
    const cost = cosmetic.costcoins;

    // Check user balance
    const userResult = await query(
      'SELECT coins FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      throw createApiError('User not found', 404);
    }

    const userCoins = userResult.rows[0].coins;

    if (userCoins < cost) {
      throw createApiError('Insufficient coins', 400);
    }

    // Check if already owned
    const ownedResult = await query(
      'SELECT id FROM user_cosmetics WHERE user_id = $1 AND cosmetic_id = $2',
      [userId, cosmeticId]
    );

    if (ownedResult.rows.length > 0) {
      throw createApiError('Already owned', 400);
    }

    // Deduct coins and add cosmetic in transaction
    await query('BEGIN');

    try {
      // Deduct coins
      await query(
        'UPDATE users SET coins = coins - $1 WHERE id = $2',
        [cost, userId]
      );

      // Add cosmetic
      await query(
        `INSERT INTO user_cosmetics (id, user_id, cosmetic_id, is_equipped)
         VALUES ($1, $2, $3, $4)`,
        [uuidv4(), userId, cosmeticId, false]
      );

      await query('COMMIT');

      res.json({ success: true, message: 'Purchase successful' });
    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }
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

    // Check ownership
    const ownedResult = await query(
      'SELECT id FROM user_cosmetics WHERE user_id = $1 AND cosmetic_id = $2',
      [userId, cosmeticId]
    );

    if (ownedResult.rows.length === 0) {
      throw createApiError('Cosmetic not owned', 404);
    }

    // Get cosmetic type
    const typeResult = await query(
      'SELECT type FROM cosmetics WHERE id = $1',
      [cosmeticId]
    );

    const cosmeticType = typeResult.rows[0].type;

    // Unequip other cosmetics of same type
    await query(
      `UPDATE user_cosmetics uc
       SET is_equipped = FALSE
       WHERE uc.user_id = $1 
       AND uc.id != (SELECT id FROM user_cosmetics WHERE user_id = $1 AND cosmetic_id = $2)
       AND uc.cosmetic_id IN (SELECT id FROM cosmetics WHERE type = $3)`,
      [userId, cosmeticId, cosmeticType]
    );

    // Equip this cosmetic
    await query(
      'UPDATE user_cosmetics SET is_equipped = TRUE WHERE user_id = $1 AND cosmetic_id = $2',
      [userId, cosmeticId]
    );

    res.json({ success: true, message: 'Cosmetic equipped' });
  } catch (error) {
    next(error);
  }
});

export default router;
