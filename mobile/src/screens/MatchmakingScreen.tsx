/**
 * Matchmaking Screen
 * Displays matchmaking queue status
 */

import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { apiClient } from '../services/apiClient';

type MatchmakingScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

const MatchmakingScreen: React.FC<MatchmakingScreenProps> = ({
  navigation,
}) => {
  const [matchId, setMatchId] = useState<string | null>(null);
  const [searching, setSearching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const spinValue = new Animated.Value(0);

  useEffect(() => {
    // Start searching for match
    searchForMatch();

    // Animate spinner
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const searchForMatch = async () => {
    try {
      setSearching(true);
      setError(null);

      const result = await apiClient.requestMatchmaking();
      setMatchId(result.matchId);

      // Navigate to game after match found
      setTimeout(() => {
        navigation.navigate('Game', { matchId: result.matchId });
      }, 1000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to find match'
      );
      setSearching(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  const spinStyle = {
    transform: [
      {
        rotate: spinValue.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '360deg'],
        }),
      },
    ],
  };

  return (
    <View style={styles.container}>
      <View style={styles.centerContent}>
        {searching && !error ? (
          <>
            <Animated.Text style={[styles.spinner, spinStyle]}>
              ◐
            </Animated.Text>
            <Text style={styles.title}>Finding Opponent...</Text>
            <Text style={styles.subtitle}>
              {matchId ? 'Match found! Starting game...' : 'Please wait'}
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.title}>Matchmaking Error</Text>
            <Text style={styles.errorText}>{error}</Text>
          </>
        )}
      </View>

      {error && (
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <Text style={styles.cancelButtonText}>← Back to Menu</Text>
        </TouchableOpacity>
      )}

      {searching && (
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinner: {
    fontSize: 80,
    color: '#00d4ff',
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#ff4444',
    marginTop: 10,
    textAlign: 'center',
  },
  cancelButton: {
    backgroundColor: '#1a1a2e',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#666',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#999',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MatchmakingScreen;
