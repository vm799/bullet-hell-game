/**
 * Auth Endpoint Tests
 */

import { calculateElo, getBaseRating, getMatchReward, calculateWinRate } from '../services/stats';

describe('Auth & Stats Service', () => {
  describe('ELO Calculation', () => {
    it('should compute positive delta for winner', () => {
      const result = calculateElo(1000, 1000);
      expect(result.winnerDelta).toBeGreaterThan(0);
      expect(result.loserDelta).toBeLessThan(0);
    });

    it('should give higher delta when underdog wins', () => {
      const underdogWins = calculateElo(800, 1200);
      const favoriteWins = calculateElo(1200, 800);
      expect(underdogWins.winnerDelta).toBeGreaterThan(favoriteWins.winnerDelta);
    });

    it('should give equal and opposite deltas for equal ratings', () => {
      const result = calculateElo(1000, 1000);
      expect(result.winnerDelta).toBe(-result.loserDelta);
    });

    it('should not produce negative ratings', () => {
      const result = calculateElo(10, 2000);
      expect(result.loserNewRating).toBeGreaterThanOrEqual(0);
    });

    it('should return K/2 delta for equal ratings', () => {
      const result = calculateElo(1000, 1000);
      // With K=32, expected is 0.5, so delta = 32 * (1 - 0.5) = 16
      expect(result.winnerDelta).toBe(16);
    });
  });

  describe('Base Rating', () => {
    it('should return default base rating of 1000', () => {
      expect(getBaseRating()).toBe(1000);
    });
  });

  describe('Match Rewards', () => {
    it('should give 100 coins for a win', () => {
      expect(getMatchReward(true)).toBe(100);
    });

    it('should give 10 coins for a loss', () => {
      expect(getMatchReward(false)).toBe(10);
    });
  });

  describe('Win Rate', () => {
    it('should calculate correct win rate', () => {
      expect(calculateWinRate(7, 3)).toBe(70);
    });

    it('should return 0 for no games played', () => {
      expect(calculateWinRate(0, 0)).toBe(0);
    });

    it('should return 100 for all wins', () => {
      expect(calculateWinRate(10, 0)).toBe(100);
    });
  });
});
