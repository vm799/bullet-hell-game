/**
 * useGameLoop Hook
 * 60 FPS game loop using requestAnimationFrame
 */

import { useRef, useCallback, useEffect } from 'react';

interface UseGameLoopOptions {
  onUpdate: (deltaTime: number) => void;
  enabled?: boolean;
}

export function useGameLoop({ onUpdate, enabled = true }: UseGameLoopOptions) {
  const frameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const callbackRef = useRef(onUpdate);

  callbackRef.current = onUpdate;

  const loop = useCallback((timestamp: number) => {
    if (lastTimeRef.current === 0) {
      lastTimeRef.current = timestamp;
    }

    const deltaTime = timestamp - lastTimeRef.current;
    lastTimeRef.current = timestamp;

    // Cap delta to prevent physics jumps after tab switch
    const cappedDelta = Math.min(deltaTime, 33); // ~30 FPS minimum
    callbackRef.current(cappedDelta);

    frameRef.current = requestAnimationFrame(loop);
  }, []);

  const start = useCallback(() => {
    if (frameRef.current !== null) return;
    lastTimeRef.current = 0;
    frameRef.current = requestAnimationFrame(loop);
  }, [loop]);

  const stop = useCallback(() => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      start();
    } else {
      stop();
    }

    return stop;
  }, [enabled, start, stop]);

  return { start, stop };
}
