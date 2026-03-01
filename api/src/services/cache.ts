/**
 * Cache Service
 * In-memory caching for leaderboards with TTL-based invalidation
 */

const CACHE_TTL = parseInt(process.env.CACHE_TTL || '300') * 1000; // 5 minutes default

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class CacheService {
  private store = new Map<string, CacheEntry<any>>();

  /**
   * Get cached value
   */
  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.store.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Set cached value
   */
  set<T>(key: string, data: T, ttl: number = CACHE_TTL): void {
    this.store.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Invalidate a specific cache key
   */
  invalidate(key: string): void {
    this.store.delete(key);
  }

  /**
   * Invalidate all keys matching a pattern
   */
  invalidatePattern(pattern: string): void {
    for (const key of this.store.keys()) {
      if (key.includes(pattern)) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Invalidate leaderboard caches (called after match end)
   */
  invalidateLeaderboards(): void {
    this.invalidatePattern('leaderboard');
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.store.clear();
  }

  /**
   * Get cache stats
   */
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.store.size,
      keys: Array.from(this.store.keys()),
    };
  }
}

export const cacheService = new CacheService();

// Cache keys
export const CACHE_KEYS = {
  GLOBAL_LEADERBOARD: 'leaderboard:global',
  WEEKLY_LEADERBOARD: 'leaderboard:weekly',
  COSMETICS_LIST: 'cosmetics:all',
} as const;
