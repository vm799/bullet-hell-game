/**
 * Storage Service
 * Local storage for auth tokens, cosmetics cache, and user preferences
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  AUTH_TOKEN: 'authToken',
  USER_ID: 'userId',
  USERNAME: 'username',
  COSMETICS_CACHE: 'cosmeticsCache',
  EQUIPPED_SKIN: 'equippedSkin',
  EQUIPPED_WEAPON: 'equippedWeapon',
  EQUIPPED_TRAIL: 'equippedTrail',
  SOUND_ENABLED: 'soundEnabled',
  MUSIC_ENABLED: 'musicEnabled',
} as const;

class StorageService {
  /**
   * Auth token management
   */
  async getAuthToken(): Promise<string | null> {
    return AsyncStorage.getItem(KEYS.AUTH_TOKEN);
  }

  async setAuthToken(token: string): Promise<void> {
    await AsyncStorage.setItem(KEYS.AUTH_TOKEN, token);
  }

  async clearAuthToken(): Promise<void> {
    await AsyncStorage.removeItem(KEYS.AUTH_TOKEN);
  }

  /**
   * User info
   */
  async getUserId(): Promise<string | null> {
    return AsyncStorage.getItem(KEYS.USER_ID);
  }

  async setUserId(id: string): Promise<void> {
    await AsyncStorage.setItem(KEYS.USER_ID, id);
  }

  async getUsername(): Promise<string | null> {
    return AsyncStorage.getItem(KEYS.USERNAME);
  }

  async setUsername(username: string): Promise<void> {
    await AsyncStorage.setItem(KEYS.USERNAME, username);
  }

  /**
   * Cosmetics cache
   */
  async getCosmeticsCache(): Promise<any[] | null> {
    const raw = await AsyncStorage.getItem(KEYS.COSMETICS_CACHE);
    if (!raw) return null;

    try {
      const parsed = JSON.parse(raw);
      // Cache expires after 5 minutes
      if (Date.now() - parsed.timestamp > 300000) {
        await AsyncStorage.removeItem(KEYS.COSMETICS_CACHE);
        return null;
      }
      return parsed.data;
    } catch {
      return null;
    }
  }

  async setCosmeticsCache(cosmetics: any[]): Promise<void> {
    await AsyncStorage.setItem(
      KEYS.COSMETICS_CACHE,
      JSON.stringify({ data: cosmetics, timestamp: Date.now() })
    );
  }

  /**
   * Equipped cosmetics
   */
  async getEquippedCosmetics(): Promise<{
    skinId: string;
    weaponId: string;
    trailId: string;
  }> {
    const [skinId, weaponId, trailId] = await Promise.all([
      AsyncStorage.getItem(KEYS.EQUIPPED_SKIN),
      AsyncStorage.getItem(KEYS.EQUIPPED_WEAPON),
      AsyncStorage.getItem(KEYS.EQUIPPED_TRAIL),
    ]);

    return {
      skinId: skinId || 'default',
      weaponId: weaponId || 'standard',
      trailId: trailId || 'none',
    };
  }

  async setEquippedCosmetic(
    type: 'skin' | 'weapon' | 'trail',
    id: string
  ): Promise<void> {
    const key =
      type === 'skin'
        ? KEYS.EQUIPPED_SKIN
        : type === 'weapon'
        ? KEYS.EQUIPPED_WEAPON
        : KEYS.EQUIPPED_TRAIL;

    await AsyncStorage.setItem(key, id);
  }

  /**
   * Settings
   */
  async getSoundEnabled(): Promise<boolean> {
    const val = await AsyncStorage.getItem(KEYS.SOUND_ENABLED);
    return val !== 'false';
  }

  async setSoundEnabled(enabled: boolean): Promise<void> {
    await AsyncStorage.setItem(KEYS.SOUND_ENABLED, String(enabled));
  }

  async getMusicEnabled(): Promise<boolean> {
    const val = await AsyncStorage.getItem(KEYS.MUSIC_ENABLED);
    return val !== 'false';
  }

  async setMusicEnabled(enabled: boolean): Promise<void> {
    await AsyncStorage.setItem(KEYS.MUSIC_ENABLED, String(enabled));
  }

  /**
   * Clear all stored data (logout)
   */
  async clearAll(): Promise<void> {
    const keys = Object.values(KEYS);
    await AsyncStorage.multiRemove(keys);
  }
}

export const storageService = new StorageService();
