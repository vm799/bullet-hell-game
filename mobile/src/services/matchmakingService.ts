/**
 * Matchmaking Service
 * Manages queue, opponent pairing, and match creation
 */

import { apiClient } from './apiClient';

export type MatchmakingStatus = 'idle' | 'searching' | 'found' | 'error';

interface MatchmakingState {
  status: MatchmakingStatus;
  matchId: string | null;
  opponentId: string | null;
  error: string | null;
  startedAt: number | null;
}

class MatchmakingService {
  private state: MatchmakingState = {
    status: 'idle',
    matchId: null,
    opponentId: null,
    error: null,
    startedAt: null,
  };

  private pollTimer: ReturnType<typeof setInterval> | null = null;
  private readonly POLL_INTERVAL = 2000; // 2 seconds
  private readonly TIMEOUT = 30000; // 30 seconds

  /**
   * Start searching for a match
   */
  async startSearch(
    onStatusChange?: (state: MatchmakingState) => void
  ): Promise<MatchmakingState> {
    this.state = {
      status: 'searching',
      matchId: null,
      opponentId: null,
      error: null,
      startedAt: Date.now(),
    };

    onStatusChange?.(this.state);

    try {
      const result = await apiClient.requestMatchmaking();

      if (result.matchId) {
        this.state = {
          status: 'found',
          matchId: result.matchId,
          opponentId: null,
          error: null,
          startedAt: this.state.startedAt,
        };
        onStatusChange?.(this.state);
        return this.state;
      }

      // Start polling for match
      return await this.pollForMatch(onStatusChange);
    } catch (error) {
      this.state = {
        status: 'error',
        matchId: null,
        opponentId: null,
        error: error instanceof Error ? error.message : 'Matchmaking failed',
        startedAt: this.state.startedAt,
      };
      onStatusChange?.(this.state);
      return this.state;
    }
  }

  /**
   * Poll the server for a match
   */
  private pollForMatch(
    onStatusChange?: (state: MatchmakingState) => void
  ): Promise<MatchmakingState> {
    return new Promise((resolve) => {
      this.pollTimer = setInterval(async () => {
        // Check timeout
        if (
          this.state.startedAt &&
          Date.now() - this.state.startedAt > this.TIMEOUT
        ) {
          this.cancelSearch();
          this.state = {
            ...this.state,
            status: 'error',
            error: 'Matchmaking timed out',
          };
          onStatusChange?.(this.state);
          resolve(this.state);
          return;
        }

        try {
          const result = await apiClient.requestMatchmaking();
          if (result.matchId) {
            this.stopPolling();
            this.state = {
              status: 'found',
              matchId: result.matchId,
              opponentId: null,
              error: null,
              startedAt: this.state.startedAt,
            };
            onStatusChange?.(this.state);
            resolve(this.state);
          }
        } catch {
          // Retry on next poll
        }
      }, this.POLL_INTERVAL);
    });
  }

  /**
   * Cancel matchmaking search
   */
  cancelSearch(): void {
    this.stopPolling();
    this.state = {
      status: 'idle',
      matchId: null,
      opponentId: null,
      error: null,
      startedAt: null,
    };
  }

  private stopPolling(): void {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }

  /**
   * Get current matchmaking state
   */
  getState(): MatchmakingState {
    return { ...this.state };
  }

  /**
   * Get elapsed search time in seconds
   */
  getElapsedSeconds(): number {
    if (!this.state.startedAt) return 0;
    return Math.floor((Date.now() - this.state.startedAt) / 1000);
  }
}

export const matchmakingService = new MatchmakingService();
