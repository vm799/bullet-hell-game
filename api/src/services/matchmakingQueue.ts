/**
 * Matchmaking Queue Service
 * Manages player queue, rank-based pairing, timeout after 30 seconds
 */

interface QueueEntry {
  userId: string;
  rating: number;
  joinedAt: number;
}

const RATING_RANGE_INITIAL = 100;
const RATING_RANGE_EXPANSION = 50; // expand range every 5 seconds
const RATING_RANGE_MAX = 500;
const QUEUE_TIMEOUT_MS = 30000;

class MatchmakingQueue {
  private queue: QueueEntry[] = [];

  /**
   * Add player to queue
   * Returns matched opponent if found, null otherwise
   */
  addPlayer(userId: string, rating: number): QueueEntry | null {
    // Remove existing entry for this user
    this.removePlayer(userId);

    // Clean expired entries
    this.cleanExpired();

    // Try to find a match
    const match = this.findMatch(userId, rating);
    if (match) {
      return match;
    }

    // Add to queue
    this.queue.push({
      userId,
      rating,
      joinedAt: Date.now(),
    });

    return null;
  }

  /**
   * Find best match for a player based on rating proximity
   */
  private findMatch(userId: string, rating: number): QueueEntry | null {
    if (this.queue.length === 0) return null;

    let bestMatch: QueueEntry | null = null;
    let bestDiff = Infinity;

    for (const entry of this.queue) {
      if (entry.userId === userId) continue;

      const diff = Math.abs(entry.rating - rating);

      // Calculate dynamic rating range based on wait time
      const waitTime = Date.now() - entry.joinedAt;
      const expansions = Math.floor(waitTime / 5000);
      const allowedRange = Math.min(
        RATING_RANGE_INITIAL + expansions * RATING_RANGE_EXPANSION,
        RATING_RANGE_MAX
      );

      if (diff <= allowedRange && diff < bestDiff) {
        bestMatch = entry;
        bestDiff = diff;
      }
    }

    if (bestMatch) {
      this.removePlayer(bestMatch.userId);
    }

    return bestMatch;
  }

  /**
   * Remove player from queue
   */
  removePlayer(userId: string): boolean {
    const index = this.queue.findIndex((e) => e.userId === userId);
    if (index >= 0) {
      this.queue.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Clean expired entries from queue
   */
  private cleanExpired(): void {
    const now = Date.now();
    this.queue = this.queue.filter(
      (entry) => now - entry.joinedAt < QUEUE_TIMEOUT_MS
    );
  }

  /**
   * Get queue size
   */
  getQueueSize(): number {
    this.cleanExpired();
    return this.queue.length;
  }

  /**
   * Check if player is in queue
   */
  isInQueue(userId: string): boolean {
    this.cleanExpired();
    return this.queue.some((e) => e.userId === userId);
  }
}

export const matchmakingQueue = new MatchmakingQueue();
