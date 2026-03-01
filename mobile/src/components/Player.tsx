/**
 * Player Component
 * Renders a ship sprite with position, rotation, and cosmetic skin
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Player as PlayerType } from '../types';

interface PlayerProps {
  player: PlayerType;
  radius: number;
  color: string;
}

const SKIN_COLORS: Record<string, string> = {
  default: '',
  neon: '#39ff14',
  crystal: '#e0e0ff',
  fire: '#ff6600',
  void: '#8800cc',
};

const PlayerComponent: React.FC<PlayerProps> = ({ player, radius, color }) => {
  const skinColor = SKIN_COLORS[player.cosmetics.skinId] || color;
  const diameter = radius * 2;

  return (
    <View
      style={[
        styles.container,
        {
          left: player.x - radius,
          top: player.y - radius,
          width: diameter,
          height: diameter,
          transform: [{ rotate: `${player.angle}rad` }],
        },
      ]}
    >
      {/* Ship body */}
      <View
        style={[
          styles.shipBody,
          {
            width: diameter,
            height: diameter,
            borderRadius: radius,
            backgroundColor: skinColor,
          },
        ]}
      />
      {/* Direction indicator (nose of the ship) */}
      <View
        style={[
          styles.nose,
          {
            left: diameter - 4,
            top: radius - 3,
            borderLeftColor: skinColor,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
  },
  shipBody: {
    opacity: 0.9,
  },
  nose: {
    position: 'absolute',
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderTopWidth: 3,
    borderBottomWidth: 3,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },
});

export default PlayerComponent;
