/**
 * useFirebaseSync Hook
 * Subscribes to match updates from Firebase Realtime Database
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { firebaseClient } from '../services/firebaseClient';
import { GameState, Player } from '../types';

interface UseFirebaseSyncOptions {
  matchId: string | null;
  playerId: 'p1' | 'p2';
  syncIntervalMs?: number;
}

interface UseFirebaseSyncResult {
  remoteState: GameState | null;
  connected: boolean;
  error: string | null;
  syncPlayerState: (player: Player) => void;
}

export function useFirebaseSync({
  matchId,
  playerId,
  syncIntervalMs = 60,
}: UseFirebaseSyncOptions): UseFirebaseSyncResult {
  const [remoteState, setRemoteState] = useState<GameState | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastSyncRef = useRef<number>(0);

  useEffect(() => {
    if (!matchId) return;

    const unsubscribe = firebaseClient.subscribeToMatch(matchId, (state) => {
      if (state) {
        setRemoteState(state);
        setConnected(true);
        setError(null);
      } else {
        setError('Match not found');
        setConnected(false);
      }
    });

    return () => {
      unsubscribe?.();
      firebaseClient.unsubscribeFromMatch();
      setConnected(false);
    };
  }, [matchId]);

  const syncPlayerState = useCallback(
    (player: Player) => {
      if (!matchId) return;

      const now = Date.now();
      if (now - lastSyncRef.current < syncIntervalMs) return;
      lastSyncRef.current = now;

      firebaseClient
        .updatePlayerState(matchId, playerId, {
          x: player.x,
          y: player.y,
          hp: player.hp,
          angle: player.angle,
          score: player.score,
        })
        .catch((err) => {
          console.error('Sync error:', err);
        });
    },
    [matchId, playerId, syncIntervalMs]
  );

  return { remoteState, connected, error, syncPlayerState };
}
