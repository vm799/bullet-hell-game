/**
 * Bullet Component
 * Renders a bullet with position and owner-based color
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Bullet as BulletType } from '../types';

interface BulletProps {
  bullet: BulletType;
  radius: number;
}

const OWNER_COLORS = {
  p1: '#00d4ff',
  p2: '#ff4444',
};

const BulletComponent: React.FC<BulletProps> = ({ bullet, radius }) => {
  const diameter = radius * 2;
  const color = OWNER_COLORS[bullet.owner];

  return (
    <View
      style={[
        styles.bullet,
        {
          left: bullet.x - radius,
          top: bullet.y - radius,
          width: diameter,
          height: diameter,
          borderRadius: radius,
          backgroundColor: color,
          shadowColor: color,
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  bullet: {
    position: 'absolute',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 3,
  },
});

export default BulletComponent;
