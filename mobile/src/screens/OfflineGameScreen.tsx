/**
 * Offline Game Screen
 * Practice mode against AI opponent
 */

import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { gameEngine, DEFAULT_CONFIG } from '../services/gameEngine';
import { GameState, Player, InputState } from '../types';

type OfflineGameScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

const OfflineGameScreen: React.FC<OfflineGameScreenProps> = ({
  navigation,
}) => {
  const [gameState, setGameState] = useState<GameState>({
    matchId: 'offline-practice',
    players: {
      p1: {
        id: 'player',
        x: 200,
        y: 300,
        vx: 0,
        vy: 0,
        hp: 100,
        maxHp: 100,
        angle: 0,
        score: 0,
        username: 'You',
        cosmetics: { skinId: 'default', weaponId: 'standard', trailId: 'none' },
      },
      p2: {
        id: 'ai',
        x: 600,
        y: 300,
        vx: 0,
        vy: 0,
        hp: 100,
        maxHp: 100,
        angle: Math.PI,
        score: 0,
        username: 'AI Bot',
        cosmetics: { skinId: 'default', weaponId: 'standard', trailId: 'none' },
      },
    },
    bullets: [],
    gameState: 'playing',
    winner: null,
    duration: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  const gameLoopRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(Date.now());
  const inputRef = useRef<InputState>({
    moveUp: false,
    moveDown: false,
    moveLeft: false,
    moveRight: false,
    shooting: false,
    angle: 0,
  });
  const lastShotRef = useRef<number>(0);

  useEffect(() => {
    startGameLoop();

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, []);

  const startGameLoop = () => {
    const update = () => {
      const now = Date.now();
      const deltaTime = now - lastUpdateRef.current;
      lastUpdateRef.current = now;

      // Simple AI behavior
      const aiInput: InputState = {
        moveUp: false,
        moveDown: false,
        moveLeft: false,
        moveRight: false,
        shooting: Math.random() < 0.1, // 10% chance to shoot
        angle: Math.atan2(
          gameState.players.p1.y - gameState.players.p2.y,
          gameState.players.p1.x - gameState.players.p2.x
        ),
      };

      // AI simple pathfinding - move toward player
      const dx = gameState.players.p1.x - gameState.players.p2.x;
      const dy = gameState.players.p1.y - gameState.players.p2.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 150) {
        if (dx > 0) aiInput.moveRight = true;
        else aiInput.moveLeft = true;

        if (dy > 0) aiInput.moveDown = true;
        else aiInput.moveUp = true;
      } else {
        // Dodge - move away sometimes
        if (Math.random() < 0.3) {
          aiInput.moveLeft = !aiInput.moveLeft;
          aiInput.moveRight = !aiInput.moveRight;
        }
      }

      // Update game state
      const newState = gameEngine.updateGameState(
        gameState,
        inputRef.current,
        aiInput,
        deltaTime
      );

      // Create bullets on shoot
      if (inputRef.current.shooting && now - lastShotRef.current > 100) {
        const bullet = gameEngine.createBullet(
          newState.players.p1,
          `bullet-${now}`
        );
        newState.bullets.push(bullet);
        lastShotRef.current = now;
      }

      if (aiInput.shooting && now - lastShotRef.current > 200) {
        const bullet = gameEngine.createBullet(
          newState.players.p2,
          `ai-bullet-${now}`
        );
        newState.bullets.push(bullet);
        lastShotRef.current = now;
      }

      newState.duration = Math.floor((now - gameState.createdAt) / 1000);
      setGameState(newState);

      // Check if game ended
      if (newState.gameState === 'ended') {
        setTimeout(() => {
          navigation.navigate('Result', {
            matchResult: {
              matchId: 'offline-practice',
              winner: newState.winner,
              p1Score: newState.players.p1.score,
              p2Score: newState.players.p2.score,
              duration: newState.duration,
            },
          });
        }, 1000);
        return;
      }

      gameLoopRef.current = requestAnimationFrame(update);
    };

    gameLoopRef.current = requestAnimationFrame(update);
  };

  return (
    <View style={styles.container}>
      {/* Game Canvas */}
      <View
        style={[
          styles.canvas,
          {
            width: DEFAULT_CONFIG.arenaWidth,
            height: DEFAULT_CONFIG.arenaHeight,
            backgroundColor: '#1a1a2e',
            borderWidth: 2,
            borderColor: '#00d4ff',
          },
        ]}
      >
        {/* Player 1 */}
        <View
          style={{
            position: 'absolute',
            left: gameState.players.p1.x - 15,
            top: gameState.players.p1.y - 15,
            width: 30,
            height: 30,
            borderRadius: 15,
            backgroundColor: '#00d4ff',
          }}
        />

        {/* Player 2 (AI) */}
        <View
          style={{
            position: 'absolute',
            left: gameState.players.p2.x - 15,
            top: gameState.players.p2.y - 15,
            width: 30,
            height: 30,
            borderRadius: 15,
            backgroundColor: '#ff4444',
          }}
        />

        {/* Bullets */}
        {gameState.bullets.map((bullet) => (
          <View
            key={bullet.id}
            style={{
              position: 'absolute',
              left: bullet.x - 3,
              top: bullet.y - 3,
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: bullet.owner === 'p1' ? '#00d4ff' : '#ff4444',
            }}
          />
        ))}

        {/* UI Overlays */}
        <View style={styles.playerInfoOverlay}>
          <Text style={styles.playerName}>
            {gameState.players.p1.username}
          </Text>
          <Text style={styles.playerHp}>
            HP: {gameState.players.p1.hp}/{gameState.players.p1.maxHp}
          </Text>
        </View>

        <View
          style={[styles.playerInfoOverlay, { right: 10, textAlign: 'right' }]}
        >
          <Text style={styles.playerName}>
            {gameState.players.p2.username}
          </Text>
          <Text style={styles.playerHp}>
            HP: {gameState.players.p2.hp}/{gameState.players.p2.maxHp}
          </Text>
        </View>

        <View style={styles.timerOverlay}>
          <Text style={styles.timer}>{gameState.duration}s</Text>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <View style={styles.dpadContainer}>
          <TouchableOpacity
            style={styles.dpadButton}
            onPress={() => (inputRef.current.moveUp = true)}
            onPressOut={() => (inputRef.current.moveUp = false)}
          >
            <Text>▲</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.controlButton, styles.shootButton]}
          onPress={() => (inputRef.current.shooting = true)}
          onPressOut={() => (inputRef.current.shooting = false)}
        >
          <Text style={styles.shootButtonText}>SHOOT</Text>
        </TouchableOpacity>
      </View>

      {/* Menu Button */}
      <TouchableOpacity
        style={styles.menuButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.menuButtonText}>☰</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  canvas: {
    marginBottom: 20,
    overflow: 'hidden',
  },
  playerInfoOverlay: {
    position: 'absolute',
    top: 10,
    left: 10,
  },
  playerName: {
    color: '#00d4ff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  playerHp: {
    color: '#0f0',
    fontSize: 11,
  },
  timerOverlay: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  timer: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  controls: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 20,
  },
  dpadContainer: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dpadButton: {
    width: 50,
    height: 50,
    backgroundColor: '#1a1a2e',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#00d4ff',
  },
  controlButton: {
    flex: 1,
    height: 60,
    backgroundColor: '#1a1a2e',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#00d4ff',
  },
  shootButton: {
    backgroundColor: '#00d4ff',
  },
  shootButtonText: {
    color: '#0f0f0f',
    fontSize: 12,
    fontWeight: 'bold',
  },
  menuButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 44,
    height: 44,
    backgroundColor: '#1a1a2e',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#666',
  },
  menuButtonText: {
    fontSize: 24,
    color: '#999',
  },
});

export default OfflineGameScreen;
