/**
 * GameArena Component
 * Canvas renderer for game world (800x600), renders players + bullets
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Player from './Player';
import Bullet from './Bullet';
import HealthBar from './HealthBar';
import ScoreBoard from './ScoreBoard';
import Timer from './Timer';
import { GameState, GameConfig } from '../types';
import { DEFAULT_CONFIG } from '../services/gameEngine';

interface GameArenaProps {
  gameState: GameState;
  config?: GameConfig;
}

const GameArena: React.FC<GameArenaProps> = ({
  gameState,
  config = DEFAULT_CONFIG,
}) => {
  const { players, bullets, duration } = gameState;
  const scaleX = 1;
  const scaleY = 1;

  return (
    <View
      style={[
        styles.arena,
        { width: config.arenaWidth * scaleX, height: config.arenaHeight * scaleY },
      ]}
    >
      {/* Grid background */}
      <View style={styles.gridOverlay} />

      {/* Players */}
      <Player
        player={players.p1}
        radius={config.playerRadius}
        color="#00d4ff"
      />
      <Player
        player={players.p2}
        radius={config.playerRadius}
        color="#ff4444"
      />

      {/* Bullets */}
      {bullets.map((bullet) => (
        <Bullet
          key={bullet.id}
          bullet={bullet}
          radius={config.bulletRadius}
        />
      ))}

      {/* HUD Overlay */}
      <View style={styles.hudTop}>
        <HealthBar
          current={players.p1.hp}
          max={players.p1.maxHp}
          label={players.p1.username}
          color="#00d4ff"
        />
        <Timer duration={duration} maxDuration={config.matchDuration} />
        <HealthBar
          current={players.p2.hp}
          max={players.p2.maxHp}
          label={players.p2.username}
          color="#ff4444"
          reversed
        />
      </View>

      <View style={styles.hudBottom}>
        <ScoreBoard
          p1Score={players.p1.score}
          p2Score={players.p2.score}
          p1Name={players.p1.username}
          p2Name={players.p2.username}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  arena: {
    backgroundColor: '#0a0a1a',
    borderWidth: 2,
    borderColor: '#00d4ff',
    overflow: 'hidden',
    position: 'relative',
  },
  gridOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.05,
    backgroundColor: '#16213e',
  },
  hudTop: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hudBottom: {
    position: 'absolute',
    bottom: 8,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
});

export default GameArena;
