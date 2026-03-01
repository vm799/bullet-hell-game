/**
 * HealthBar Component
 * Displays player HP with a colored progress bar (100 HP max)
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface HealthBarProps {
  current: number;
  max: number;
  label: string;
  color: string;
  reversed?: boolean;
}

const HealthBar: React.FC<HealthBarProps> = ({
  current,
  max,
  label,
  color,
  reversed = false,
}) => {
  const percentage = Math.max(0, Math.min(100, (current / max) * 100));
  const barColor = percentage > 50 ? color : percentage > 25 ? '#ffaa00' : '#ff4444';

  return (
    <View style={[styles.container, reversed && styles.reversed]}>
      <Text style={[styles.label, { color }]}>{label}</Text>
      <View style={styles.barBackground}>
        <View
          style={[
            styles.barFill,
            reversed ? { right: 0 } : { left: 0 },
            { width: `${percentage}%`, backgroundColor: barColor },
          ]}
        />
      </View>
      <Text style={styles.hpText}>
        {current}/{max}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 120,
  },
  reversed: {
    alignItems: 'flex-end',
  },
  label: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  barBackground: {
    width: '100%',
    height: 8,
    backgroundColor: '#333',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    borderRadius: 4,
  },
  hpText: {
    fontSize: 9,
    color: '#ccc',
    marginTop: 1,
  },
});

export default HealthBar;
