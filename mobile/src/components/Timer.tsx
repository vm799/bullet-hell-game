/**
 * Timer Component
 * Match countdown timer (3-5 minute matches)
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface TimerProps {
  duration: number;
  maxDuration: number;
}

const Timer: React.FC<TimerProps> = ({ duration, maxDuration }) => {
  const remaining = Math.max(0, maxDuration - duration);
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const isLow = remaining <= 30;

  return (
    <View style={[styles.container, isLow && styles.containerLow]}>
      <Text style={[styles.time, isLow && styles.timeLow]}>
        {minutes}:{seconds.toString().padStart(2, '0')}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  containerLow: {
    borderColor: '#ff4444',
  },
  time: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
  },
  timeLow: {
    color: '#ff4444',
  },
});

export default Timer;
