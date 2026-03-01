/**
 * useCollisions Hook
 * Detects and handles bullet-player collisions
 */

import { useCallback } from 'react';
import { GameState, Bullet } from '../types';

interface CollisionResult {
  bulletsToRemove: string[];
  damageToP1: number;
  damageToP2: number;
  p1Hits: number;
  p2Hits: number;
}

interface UseCollisionsOptions {
  playerRadius: number;
  bulletRadius: number;
}

export function useCollisions({ playerRadius, bulletRadius }: UseCollisionsOptions) {
  const checkCollisions = useCallback(
    (gameState: GameState): CollisionResult => {
      const result: CollisionResult = {
        bulletsToRemove: [],
        damageToP1: 0,
        damageToP2: 0,
        p1Hits: 0,
        p2Hits: 0,
      };

      const { players, bullets } = gameState;
      const collisionDist = playerRadius + bulletRadius;

      for (const bullet of bullets) {
        // Check p1 collision (only from p2's bullets)
        if (bullet.owner !== 'p1') {
          const dx = bullet.x - players.p1.x;
          const dy = bullet.y - players.p1.y;
          if (dx * dx + dy * dy < collisionDist * collisionDist) {
            result.bulletsToRemove.push(bullet.id);
            result.damageToP1 += bullet.damage;
            result.p2Hits++;
            continue;
          }
        }

        // Check p2 collision (only from p1's bullets)
        if (bullet.owner !== 'p2') {
          const dx = bullet.x - players.p2.x;
          const dy = bullet.y - players.p2.y;
          if (dx * dx + dy * dy < collisionDist * collisionDist) {
            result.bulletsToRemove.push(bullet.id);
            result.damageToP2 += bullet.damage;
            result.p1Hits++;
            continue;
          }
        }
      }

      return result;
    },
    [playerRadius, bulletRadius]
  );

  const isOffScreen = useCallback(
    (bullet: Bullet, arenaWidth: number, arenaHeight: number): boolean => {
      const margin = 50;
      return (
        bullet.x < -margin ||
        bullet.x > arenaWidth + margin ||
        bullet.y < -margin ||
        bullet.y > arenaHeight + margin
      );
    },
    []
  );

  const isBulletExpired = useCallback((bullet: Bullet, maxAgeMs: number = 10000): boolean => {
    return Date.now() - bullet.createdAt > maxAgeMs;
  }, []);

  return { checkCollisions, isOffScreen, isBulletExpired };
}
