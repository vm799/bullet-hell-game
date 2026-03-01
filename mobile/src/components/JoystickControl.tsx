/**
 * JoystickControl Component
 * Virtual joystick for mobile touch movement input
 */

import React, { useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  PanResponder,
  GestureResponderEvent,
  PanResponderGestureState,
} from 'react-native';
import { InputState } from '../types';

interface JoystickControlProps {
  size?: number;
  onInput: (input: Partial<InputState>) => void;
}

const JoystickControl: React.FC<JoystickControlProps> = ({
  size = 120,
  onInput,
}) => {
  const knobRadius = size * 0.25;
  const maxDistance = size * 0.35;
  const knobPosition = useRef({ x: 0, y: 0 });
  const centerRef = useRef({ x: 0, y: 0 });

  const processInput = useCallback(
    (dx: number, dy: number) => {
      const distance = Math.sqrt(dx * dx + dy * dy);
      const clampedDist = Math.min(distance, maxDistance);
      const angle = Math.atan2(dy, dx);

      const nx = clampedDist > 5 ? (Math.cos(angle) * clampedDist) / maxDistance : 0;
      const ny = clampedDist > 5 ? (Math.sin(angle) * clampedDist) / maxDistance : 0;

      const deadzone = 0.2;

      onInput({
        moveLeft: nx < -deadzone,
        moveRight: nx > deadzone,
        moveUp: ny < -deadzone,
        moveDown: ny > deadzone,
        angle: distance > 5 ? angle : undefined,
      });

      knobPosition.current = {
        x: Math.cos(angle) * clampedDist,
        y: Math.sin(angle) * clampedDist,
      };
    },
    [maxDistance, onInput]
  );

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (
        _evt: GestureResponderEvent,
        _gestureState: PanResponderGestureState
      ) => {
        processInput(0, 0);
      },
      onPanResponderMove: (
        _evt: GestureResponderEvent,
        gestureState: PanResponderGestureState
      ) => {
        processInput(gestureState.dx, gestureState.dy);
      },
      onPanResponderRelease: () => {
        knobPosition.current = { x: 0, y: 0 };
        onInput({
          moveLeft: false,
          moveRight: false,
          moveUp: false,
          moveDown: false,
        });
      },
    })
  ).current;

  return (
    <View
      style={[styles.container, { width: size, height: size, borderRadius: size / 2 }]}
      {...panResponder.panHandlers}
      onLayout={(event) => {
        const { x, y, width, height } = event.nativeEvent.layout;
        centerRef.current = { x: x + width / 2, y: y + height / 2 };
      }}
    >
      <View
        style={[
          styles.knob,
          {
            width: knobRadius * 2,
            height: knobRadius * 2,
            borderRadius: knobRadius,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(26, 26, 46, 0.8)',
    borderWidth: 2,
    borderColor: '#00d4ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  knob: {
    backgroundColor: 'rgba(0, 212, 255, 0.6)',
  },
});

export default JoystickControl;
