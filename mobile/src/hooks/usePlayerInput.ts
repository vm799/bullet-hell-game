/**
 * usePlayerInput Hook
 * Handles keyboard and touch input for player control
 */

import { useRef, useCallback } from 'react';
import { InputState } from '../types';

interface UsePlayerInputResult {
  inputRef: React.MutableRefObject<InputState>;
  setMovement: (input: Partial<InputState>) => void;
  setShooting: (shooting: boolean) => void;
  setAngle: (angle: number) => void;
  resetInput: () => void;
}

const DEFAULT_INPUT: InputState = {
  moveUp: false,
  moveDown: false,
  moveLeft: false,
  moveRight: false,
  shooting: false,
  angle: 0,
};

export function usePlayerInput(): UsePlayerInputResult {
  const inputRef = useRef<InputState>({ ...DEFAULT_INPUT });

  const setMovement = useCallback((input: Partial<InputState>) => {
    if (input.moveUp !== undefined) inputRef.current.moveUp = input.moveUp;
    if (input.moveDown !== undefined) inputRef.current.moveDown = input.moveDown;
    if (input.moveLeft !== undefined) inputRef.current.moveLeft = input.moveLeft;
    if (input.moveRight !== undefined) inputRef.current.moveRight = input.moveRight;
    if (input.angle !== undefined) inputRef.current.angle = input.angle;
  }, []);

  const setShooting = useCallback((shooting: boolean) => {
    inputRef.current.shooting = shooting;
  }, []);

  const setAngle = useCallback((angle: number) => {
    inputRef.current.angle = angle;
  }, []);

  const resetInput = useCallback(() => {
    inputRef.current = { ...DEFAULT_INPUT };
  }, []);

  return { inputRef, setMovement, setShooting, setAngle, resetInput };
}
