/**
 * Game Screen
 * Main gameplay area with real-time PvP action
 */

import { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { firebaseClient } from '../services/firebaseClient';
import { gameEngine, DEFAULT_CONFIG } from '../services/gameEngine';
import { GameState, InputState } from '../types';

type GameScreenProps = {
  navigation: StackNavigationProp<any>;
  route: any;
};

const GameScreen: React.FC<GameScreenProps> = ({ navigation, route }) => {
  const { matchId } = route.params || {};
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [error, setError] = useState<string | null>(null);
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

  useEffect(() => {
    if (!matchId) {
      setError('No match ID provided');
      return;
    }

    // Subscribe to Firebase updates
    const unsubscribe = firebaseClient.subscribeToMatch(matchId, (state) => {
      if (state) {
        setGameState(state);
      } else {
        setError('Match not found');
      }
    });

    // Start game loop
    startGameLoop();

    return () => {
      unsubscribe?.();
      firebaseClient.unsubscribeFromMatch();
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [matchId]);

  const startGameLoop = () => {
    const update = () => {
      if (!gameState) {
        gameLoopRef.current = requestAnimationFrame(update);
        return;
      }

      const now = Date.now();
      const deltaTime = now - lastUpdateRef.current;
      lastUpdateRef.current = now;

      // Update game state
      const newState = gameEngine.updateGameState(
        gameState,
        inputRef.current,
        inputRef.current, // TODO: Get opponent input from Firebase
        deltaTime
      );

      setGameState(newState);

      // Check if game ended
      if (newState.gameState === 'ended') {
        navigation.navigate('Result', {
          matchResult: {
            matchId,
            winner: newState.winner,
            p1Score: newState.players.p1.score,
            p2Score: newState.players.p2.score,
            duration: newState.duration,
          },
        });
        return;
      }

      gameLoopRef.current = requestAnimationFrame(update);
    };

    gameLoopRef.current = requestAnimationFrame(update);
  };

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!gameState) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading Game...</Text>
      </View>
    );
  }

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
        {/* Placeholder - actual rendering would use Canvas API */}
        <Text style={styles.canvasText}>Game Rendering Here</Text>
        <Text style={styles.playerInfo}>
          P1 HP: {gameState.players.p1.hp}
        </Text>
        <Text style={styles.playerInfo}>
          P2 HP: {gameState.players.p2.hp}
        </Text>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => (inputRef.current.moveUp = true)}
          onPressOut={() => (inputRef.current.moveUp = false)}
        >
          <Text>↑</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.controlButton, styles.shootButton]}
          onPress={() => (inputRef.current.shooting = true)}
          onPressOut={() => (inputRef.current.shooting = false)}
        >
          <Text>SHOOT</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  canvasText: {
    color: '#666',
    fontSize: 18,
  },
  playerInfo: {
    color: '#00d4ff',
    fontSize: 14,
    marginTop: 10,
  },
  controls: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 20,
  },
  controlButton: {
    width: 60,
    height: 60,
    backgroundColor: '#1a1a2e',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#00d4ff',
  },
  shootButton: {
    flex: 1,
    width: 100,
    backgroundColor: '#00d4ff',
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
  errorContainer: {
    flex: 1,
    backgroundColor: '#0f0f0f',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#1a1a2e',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#00d4ff',
  },
  buttonText: {
    color: '#00d4ff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0f0f0f',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#00d4ff',
    fontSize: 20,
  },
});

export default GameScreen;
