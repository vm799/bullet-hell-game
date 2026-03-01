/**
 * Profile Screen
 * User profile, stats, cosmetics collection
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { apiClient } from '../services/apiClient';
import { UserProfile, UserCosmetic } from '../types';

const ProfileScreen: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [cosmetics, setCosmetics] = useState<UserCosmetic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      // TODO: Get actual user ID from Firebase
      const userId = 'user-123';
      const [userProfile, userCosmetics] = await Promise.all([
        apiClient.getUserProfile(userId),
        apiClient.getUserCosmetics(),
      ]);
      setProfile(userProfile);
      setCosmetics(userCosmetics);
    } catch (error) {
      console.error('Load profile error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !profile) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading Profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>👤</Text>
        </View>
        <Text style={styles.username}>{profile.username}</Text>
        <Text style={styles.joinDate}>
          Joined {new Date(profile.createdAt).toLocaleDateString()}
        </Text>
      </View>

      {/* Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>STATISTICS</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{profile.wins}</Text>
            <Text style={styles.statLabel}>Wins</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{profile.losses}</Text>
            <Text style={styles.statLabel}>Losses</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{profile.rating}</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {profile.wins + profile.losses === 0
                ? '0'
                : (
                    (profile.wins / (profile.wins + profile.losses)) *
                    100
                  ).toFixed(0)}
              %
            </Text>
            <Text style={styles.statLabel}>Win Rate</Text>
          </View>
        </View>
      </View>

      {/* Cosmetics Collection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>COSMETICS ({cosmetics.length})</Text>
        {cosmetics.length > 0 ? (
          <View style={styles.cosmeticsGrid}>
            {cosmetics.map((cosmetic) => (
              <View key={cosmetic.id} style={styles.cosmeticItem}>
                <View style={styles.cosmeticIcon}>📦</View>
                <Text style={styles.cosmeticName}>
                  {cosmetic.isEquipped && '✓ '}
                  Cosmetic
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyText}>No cosmetics yet. Visit the shop!</Text>
        )}
      </View>

      {/* Settings */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.settingButton}>
          <Text style={styles.settingText}>⚙️ Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.settingButton, styles.dangerButton]}>
          <Text style={styles.settingText}>🚪 Log Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  loadingText: {
    color: '#00d4ff',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 40,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
    borderBottomWidth: 2,
    borderBottomColor: '#16213e',
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#00d4ff',
  },
  avatarText: {
    fontSize: 40,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  joinDate: {
    fontSize: 12,
    color: '#999',
  },
  section: {
    marginHorizontal: 16,
    marginVertical: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#1a1a2e',
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#00d4ff',
    marginBottom: 12,
    letterSpacing: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#16213e',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00d4ff',
  },
  statLabel: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
  },
  cosmeticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cosmeticItem: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: '#16213e',
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  cosmeticIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  cosmeticName: {
    color: '#00d4ff',
    fontSize: 10,
    textAlign: 'center',
  },
  emptyText: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: 12,
  },
  settingButton: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#16213e',
    marginVertical: 6,
  },
  dangerButton: {
    borderWidth: 2,
    borderColor: '#ff4444',
  },
  settingText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ProfileScreen;
