/**
 * Shop Screen
 * Cosmetics shop for skins, weapons, trails
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { apiClient } from '../services/apiClient';
import { Cosmetic } from '../types';

const ShopScreen: React.FC = () => {
  const [cosmetics, setCosmetics] = useState<Cosmetic[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'skin' | 'weapon' | 'trail'>(
    'all'
  );
  const [selectedCosmetic, setSelectedCosmetic] = useState<Cosmetic | null>(
    null
  );

  useEffect(() => {
    loadCosmetics();
  }, []);

  const loadCosmetics = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getCosmeticsShop();
      setCosmetics(data);
    } catch (error) {
      console.error('Load cosmetics error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (cosmetic: Cosmetic) => {
    try {
      await apiClient.buyCosmeticAsync(cosmetic.id);
      alert('Purchase successful!');
      loadCosmetics();
    } catch (error) {
      console.error('Purchase error:', error);
      alert('Purchase failed');
    }
  };

  const filteredCosmetics =
    filter === 'all'
      ? cosmetics
      : cosmetics.filter((c) => c.type === filter);

  const renderCosmeticCard = ({ item }: { item: Cosmetic }) => (
    <TouchableOpacity
      style={styles.cosmeticCard}
      onPress={() => setSelectedCosmetic(item)}
    >
      <View style={styles.cosmeticPreview}>
        <Text style={styles.previewText}>
          {item.type === 'skin'
            ? '🚀'
            : item.type === 'weapon'
            ? '💥'
            : '✨'}
        </Text>
      </View>
      <Text style={styles.cosmeticName}>{item.name}</Text>
      <Text style={styles.cosmeticType}>{item.type}</Text>
      <Text style={styles.cosmeticPrice}>{item.costCoins} Coins</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>SHOP</Text>
        <View style={styles.coinDisplay}>
          <Text style={styles.coinText}>💰 5000 Coins</Text>
        </View>
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
      >
        {(['all', 'skin', 'weapon', 'trail'] as const).map((f) => (
          <TouchableOpacity
            key={f}
            style={[
              styles.filterButton,
              filter === f && styles.filterButtonActive,
            ]}
            onPress={() => setFilter(f)}
          >
            <Text
              style={[
                styles.filterText,
                filter === f && styles.filterTextActive,
              ]}
            >
              {f.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Shop Grid */}
      <View style={styles.gridContainer}>
        {loading ? (
          <Text style={styles.loadingText}>Loading...</Text>
        ) : filteredCosmetics.length > 0 ? (
          <FlatList
            data={filteredCosmetics}
            renderItem={renderCosmeticCard}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.row}
            scrollEnabled={false}
          />
        ) : (
          <Text style={styles.emptyText}>No cosmetics found</Text>
        )}
      </View>

      {/* Detail Modal */}
      {selectedCosmetic && (
        <View style={styles.detailOverlay}>
          <View style={styles.detailCard}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedCosmetic(null)}
            >
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>

            <View style={styles.detailPreview}>
              <Text style={styles.detailPreviewText}>
                {selectedCosmetic.type === 'skin'
                  ? '🚀'
                  : selectedCosmetic.type === 'weapon'
                  ? '💥'
                  : '✨'}
              </Text>
            </View>

            <Text style={styles.detailName}>{selectedCosmetic.name}</Text>
            <Text style={styles.detailDescription}>
              {selectedCosmetic.description}
            </Text>

            <TouchableOpacity
              style={styles.purchaseButton}
              onPress={() => {
                handlePurchase(selectedCosmetic);
                setSelectedCosmetic(null);
              }}
            >
              <Text style={styles.purchaseText}>
                BUY FOR {selectedCosmetic.costCoins} COINS
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#16213e',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00d4ff',
    letterSpacing: 2,
  },
  coinDisplay: {
    backgroundColor: '#1a1a2e',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#00d4ff',
  },
  coinText: {
    color: '#00d4ff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#16213e',
  },
  filterButton: {
    marginRight: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    backgroundColor: '#1a1a2e',
    borderWidth: 2,
    borderColor: '#16213e',
  },
  filterButtonActive: {
    borderColor: '#00d4ff',
  },
  filterText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 12,
  },
  filterTextActive: {
    color: '#00d4ff',
  },
  gridContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cosmeticCard: {
    width: '47%',
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 12,
    borderWidth: 2,
    borderColor: '#16213e',
  },
  cosmeticPreview: {
    width: '100%',
    height: 80,
    backgroundColor: '#16213e',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  previewText: {
    fontSize: 36,
  },
  cosmeticName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cosmeticType: {
    color: '#999',
    fontSize: 12,
    marginBottom: 8,
  },
  cosmeticPrice: {
    color: '#0f0',
    fontSize: 14,
    fontWeight: 'bold',
  },
  loadingText: {
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  detailOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  detailCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 24,
    borderWidth: 2,
    borderColor: '#00d4ff',
    width: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 20,
    color: '#999',
  },
  detailPreview: {
    width: '100%',
    height: 120,
    backgroundColor: '#16213e',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  detailPreviewText: {
    fontSize: 64,
  },
  detailName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  detailDescription: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 20,
  },
  purchaseButton: {
    backgroundColor: '#00d4ff',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  purchaseText: {
    color: '#0f0f0f',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});

export default ShopScreen;
