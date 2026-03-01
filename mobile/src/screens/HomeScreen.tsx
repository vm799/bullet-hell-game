/**
 * Home Screen
 * Main menu with play button and leaderboards
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { apiClient } from '../services/apiClient';
import { LeaderboardEntry } from '../types';

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getLeaderboard(10);
      setLeaderboard(data);
    } catch (error) {
      console.error('Load leaderboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayOnline = () => {
    navigation.navigate('Matchmaking');
  };

  const handlePlayOffline = () => {
    navigation.navigate('OfflineGame');
  };

  const renderLeaderboardItem = ({ item }: { item: LeaderboardEntry }) => (
    <View style={styles.leaderboardRow}>
      <Text style={styles.rank}>#{item.rank}</Text>
      <Text style={styles.username}>{item.username}</Text>
      <Text style={styles.rating}>{item.rating} ELO</Text>
      <Text style={styles.winRate}>{(item.winRate * 100).toFixed(1)}%</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>BULLET HELL</Text>
        <Text style={styles.subtitle}>PvP Battle Arena</Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={handlePlayOnline}
        >
          <Text style={styles.buttonText}>PLAY ONLINE</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={handlePlayOffline}
        >
          <Text style={styles.buttonText}>PRACTICE MODE</Text>
        </TouchableOpacity>
      </View>

      {/* Leaderboard Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>GLOBAL LEADERBOARD</Text>
          <TouchableOpacity onPress={loadLeaderboard}>
            <Text style={styles.refreshButton}>↻</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <Text style={styles.loadingText}>Loading...</Text>
        ) : leaderboard.length > 0 ? (
          <FlatList
            data={leaderboard}
            renderItem={renderLeaderboardItem}
            keyExtractor={(item) => item.userId}
            scrollEnabled={false}
          />
        ) : (
          <Text style={styles.emptyText}>No data available</Text>
        )}
      </View>

      {/* Stats Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>QUICK STATS</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Wins</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>1000</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Coins</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  header: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#00d4ff',
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#00d4ff',
    marginBottom: 8,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 16,
    color: '#999',
    letterSpacing: 1,
  },
  buttonsContainer: {
    padding: 20,
    gap: 12,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#00d4ff',
  },
  secondaryButton: {
    backgroundColor: '#1a1a2e',
    borderWidth: 2,
    borderColor: '#00d4ff',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f0f0f',
    letterSpacing: 1,
  },
  section: {
    marginHorizontal: 20,
    marginVertical: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1a1a2e',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#00d4ff',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00d4ff',
    letterSpacing: 1,
  },
  refreshButton: {
    fontSize: 20,
    color: '#00d4ff',
  },
  loadingText: {
    color: '#666',
    textAlign: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
    paddingVertical: 20,
  },
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#16213e',
  },
  rank: {
    color: '#00d4ff',
    fontWeight: 'bold',
    width: 40,
  },
  username: {
    flex: 1,
    color: '#fff',
    marginLeft: 12,
  },
  rating: {
    color: '#00d4ff',
    fontWeight: '600',
    width: 80,
    textAlign: 'right',
  },
  winRate: {
    color: '#0f0',
    fontWeight: '600',
    width: 60,
    textAlign: 'right',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#16213e',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00d4ff',
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
});

export default HomeScreen;
