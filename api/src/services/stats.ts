/**
 * Stats Service
 * ELO rating system with K=32
 */

const K_FACTOR = parseInt(process.env.ELO_K_FACTOR || '32');
const BASE_RATING = parseInt(process.env.ELO_BASE_RATING || '1000');
const COINS_PER_WIN = parseInt(process.env.COINS_PER_WIN || '100');
const COINS_PER_LOSS = parseInt(process.env.COINS_PER_LOSS || '10');

interface EloResult {
  winnerDelta: number;
  loserDelta: number;
  winnerNewRating: number;
  loserNewRating: number;
}

/**
 * Calculate ELO rating changes after a match
 */
export function calculateElo(winnerRating: number, loserRating: number): EloResult {
  const expectedWinner =
    1 / (1 + Math.pow(10, (loserRating - winnerRating) / 400));
  const expectedLoser =
    1 / (1 + Math.pow(10, (winnerRating - loserRating) / 400));

  const winnerDelta = Math.round(K_FACTOR * (1 - expectedWinner));
  const loserDelta = Math.round(K_FACTOR * (0 - expectedLoser));

  return {
    winnerDelta,
    loserDelta,
    winnerNewRating: Math.max(0, winnerRating + winnerDelta),
    loserNewRating: Math.max(0, loserRating + loserDelta),
  };
}

/**
 * Get coins reward for match result
 */
export function getMatchReward(won: boolean): number {
  return won ? COINS_PER_WIN : COINS_PER_LOSS;
}

/**
 * Get default rating for new players
 */
export function getBaseRating(): number {
  return BASE_RATING;
}

/**
 * Calculate win rate percentage
 */
export function calculateWinRate(wins: number, losses: number): number {
  const total = wins + losses;
  if (total === 0) return 0;
  return Math.round((wins / total) * 10000) / 100; // 2 decimal places
}
