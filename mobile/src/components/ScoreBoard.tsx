/**
 * ScoreBoard Component
 * Displays current scores for both players
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ScoreBoardProps {
  p1Score: number;
  p2Score: number;
  p1Name: string;
  p2Name: string;
}

const ScoreBoard: React.FC<ScoreBoardProps> = ({
  p1Score,
  p2Score,
  p1Name,
  p2Name,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.scoreBlock}>
        <Text style={[styles.name, { color: '#00d4ff' }]}>{p1Name}</Text>
        <Text style={[styles.score, { color: '#00d4ff' }]}>{p1Score}</Text>
      </View>
      <Text style={styles.separator}>-</Text>
      <View style={styles.scoreBlock}>
        <Text style={[styles.name, { color: '#ff4444' }]}>{p2Name}</Text>
        <Text style={[styles.score, { color: '#ff4444' }]}>{p2Score}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  scoreBlock: {
    alignItems: 'center',
    minWidth: 50,
  },
  name: {
    fontSize: 8,
    fontWeight: '600',
  },
  score: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  separator: {
    color: '#666',
    fontSize: 16,
    marginHorizontal: 8,
  },
});

export default ScoreBoard;
