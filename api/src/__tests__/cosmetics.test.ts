/**
 * Cosmetics / Shop Logic Tests
 */

import { matchmakingQueue } from '../services/matchmakingQueue';
import { cacheService, CACHE_KEYS } from '../services/cache';

describe('Matchmaking Queue', () => {
  beforeEach(() => {
    // Reset queue between tests
    while (matchmakingQueue.getQueueSize() > 0) {
      matchmakingQueue.removePlayer('any');
    }
  });

  it('should add a player to the queue when no match is available', () => {
    const result = matchmakingQueue.addPlayer('user-1', 1000);
    expect(result).toBeNull();
    expect(matchmakingQueue.getQueueSize()).toBe(1);
  });

  it('should match players with similar ratings', () => {
    matchmakingQueue.addPlayer('user-1', 1000);
    const result = matchmakingQueue.addPlayer('user-2', 1050);
    expect(result).not.toBeNull();
    expect(result?.userId).toBe('user-1');
    expect(matchmakingQueue.getQueueSize()).toBe(0);
  });

  it('should not match players with very different ratings', () => {
    matchmakingQueue.addPlayer('user-1', 1000);
    const result = matchmakingQueue.addPlayer('user-2', 1500);
    expect(result).toBeNull();
    expect(matchmakingQueue.getQueueSize()).toBe(2);
  });

  it('should not match a player with themselves', () => {
    matchmakingQueue.addPlayer('user-1', 1000);
    const result = matchmakingQueue.addPlayer('user-1', 1000);
    expect(result).toBeNull();
    // Should have replaced the existing entry
    expect(matchmakingQueue.getQueueSize()).toBe(1);
  });

  it('should remove player from queue', () => {
    matchmakingQueue.addPlayer('user-1', 1000);
    expect(matchmakingQueue.isInQueue('user-1')).toBe(true);
    matchmakingQueue.removePlayer('user-1');
    expect(matchmakingQueue.isInQueue('user-1')).toBe(false);
  });
});

describe('Cache Service', () => {
  beforeEach(() => {
    cacheService.clear();
  });

  it('should store and retrieve cached values', () => {
    cacheService.set('test-key', { data: 'hello' });
    const result = cacheService.get<{ data: string }>('test-key');
    expect(result).toEqual({ data: 'hello' });
  });

  it('should return null for missing keys', () => {
    const result = cacheService.get('missing');
    expect(result).toBeNull();
  });

  it('should invalidate specific keys', () => {
    cacheService.set('key-1', 'value-1');
    cacheService.set('key-2', 'value-2');
    cacheService.invalidate('key-1');
    expect(cacheService.get('key-1')).toBeNull();
    expect(cacheService.get('key-2')).toBe('value-2');
  });

  it('should invalidate by pattern', () => {
    cacheService.set(CACHE_KEYS.GLOBAL_LEADERBOARD, []);
    cacheService.set(CACHE_KEYS.WEEKLY_LEADERBOARD, []);
    cacheService.set(CACHE_KEYS.COSMETICS_LIST, []);
    cacheService.invalidateLeaderboards();
    expect(cacheService.get(CACHE_KEYS.GLOBAL_LEADERBOARD)).toBeNull();
    expect(cacheService.get(CACHE_KEYS.WEEKLY_LEADERBOARD)).toBeNull();
    expect(cacheService.get(CACHE_KEYS.COSMETICS_LIST)).not.toBeNull();
  });

  it('should expire entries after TTL', () => {
    cacheService.set('short-lived', 'data', 1); // 1ms TTL
    // Wait for expiration
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        expect(cacheService.get('short-lived')).toBeNull();
        resolve();
      }, 10);
    });
  });

  it('should clear all entries', () => {
    cacheService.set('a', 1);
    cacheService.set('b', 2);
    cacheService.clear();
    expect(cacheService.getStats().size).toBe(0);
  });
});
