/**
 * API Client Service
 * Handles HTTP communication with the backend
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import Constants from 'expo-constants';
import {
  UserProfile,
  LoginResponse,
  LeaderboardEntry,
  Cosmetic,
  UserCosmetic,
} from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

class APIClient {
  private api: AxiosInstance;
  private baseURL: string;
  private authToken: string | null = null;

  constructor() {
    this.baseURL =
      Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3000';

    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use((config) => {
      if (this.authToken) {
        config.headers.Authorization = `Bearer ${this.authToken}`;
      }
      return config;
    });

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Handle unauthorized
          this.clearAuth();
        }
        return Promise.reject(error);
      }
    );

    this.loadAuthToken();
  }

  /**
   * Load auth token from storage
   */
  private async loadAuthToken(): Promise<void> {
    try {
      this.authToken = await AsyncStorage.getItem('authToken');
    } catch (error) {
      console.error('Load auth token error:', error);
    }
  }

  /**
   * Store auth token
   */
  private async storeAuthToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem('authToken', token);
      this.authToken = token;
    } catch (error) {
      console.error('Store auth token error:', error);
    }
  }

  /**
   * Clear auth token
   */
  private async clearAuth(): Promise<void> {
    try {
      await AsyncStorage.removeItem('authToken');
      this.authToken = null;
    } catch (error) {
      console.error('Clear auth error:', error);
    }
  }

  /**
   * Register a new user
   */
  async register(
    firebaseToken: string,
    username: string
  ): Promise<LoginResponse> {
    try {
      const response = await this.api.post<LoginResponse>('/auth/register', {
        firebaseToken,
        username,
      });
      await this.storeAuthToken(response.data.token);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Login with Firebase token
   */
  async login(firebaseToken: string): Promise<LoginResponse> {
    try {
      const response = await this.api.post<LoginResponse>('/auth/login', {
        firebaseToken,
      });
      await this.storeAuthToken(response.data.token);
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Get user profile
   */
  async getUserProfile(userId: string): Promise<UserProfile> {
    try {
      const response = await this.api.get<UserProfile>(`/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Get user profile error:', error);
      throw error;
    }
  }

  /**
   * Update user stats
   */
  async updateUserStats(userId: string, stats: any): Promise<UserProfile> {
    try {
      const response = await this.api.post<UserProfile>(
        `/user/${userId}/stats`,
        stats
      );
      return response.data;
    } catch (error) {
      console.error('Update user stats error:', error);
      throw error;
    }
  }

  /**
   * Get global leaderboard
   */
  async getLeaderboard(limit: number = 100): Promise<LeaderboardEntry[]> {
    try {
      const response = await this.api.get<LeaderboardEntry[]>('/leaderboards', {
        params: { limit },
      });
      return response.data;
    } catch (error) {
      console.error('Get leaderboard error:', error);
      throw error;
    }
  }

  /**
   * Get weekly leaderboard
   */
  async getWeeklyLeaderboard(
    limit: number = 100
  ): Promise<LeaderboardEntry[]> {
    try {
      const response = await this.api.get<LeaderboardEntry[]>(
        '/leaderboards/weekly',
        { params: { limit } }
      );
      return response.data;
    } catch (error) {
      console.error('Get weekly leaderboard error:', error);
      throw error;
    }
  }

  /**
   * Request matchmaking
   */
  async requestMatchmaking(): Promise<{ matchId: string }> {
    try {
      const response = await this.api.post<{ matchId: string }>('/match', {});
      return response.data;
    } catch (error) {
      console.error('Request matchmaking error:', error);
      throw error;
    }
  }

  /**
   * Get match state (fallback if Firebase is down)
   */
  async getMatchState(matchId: string): Promise<any> {
    try {
      const response = await this.api.get(`/match/${matchId}`);
      return response.data;
    } catch (error) {
      console.error('Get match state error:', error);
      throw error;
    }
  }

  /**
   * Get cosmetics shop
   */
  async getCosmeticsShop(): Promise<Cosmetic[]> {
    try {
      const response = await this.api.get<Cosmetic[]>('/cosmetics');
      return response.data;
    } catch (error) {
      console.error('Get cosmetics error:', error);
      throw error;
    }
  }

  /**
   * Get user's cosmetics
   */
  async getUserCosmetics(): Promise<UserCosmetic[]> {
    try {
      const response = await this.api.get<UserCosmetic[]>(
        '/user/cosmetics'
      );
      return response.data;
    } catch (error) {
      console.error('Get user cosmetics error:', error);
      throw error;
    }
  }

  /**
   * Buy a cosmetic
   */
  async buyCosmeticAsync(cosmeticId: string): Promise<{ success: boolean }> {
    try {
      const response = await this.api.post<{ success: boolean }>(
        '/cosmetics/buy',
        { cosmeticId }
      );
      return response.data;
    } catch (error) {
      console.error('Buy cosmetic error:', error);
      throw error;
    }
  }

  /**
   * Equip a cosmetic
   */
  async equipCosmetic(userCosmeticId: string): Promise<{ success: boolean }> {
    try {
      const response = await this.api.post<{ success: boolean }>(
        `/cosmetics/${userCosmeticId}/equip`,
        {}
      );
      return response.data;
    } catch (error) {
      console.error('Equip cosmetic error:', error);
      throw error;
    }
  }

  /**
   * Check API health
   */
  async checkHealth(): Promise<{ status: string }> {
    try {
      const response = await this.api.get('/health');
      return response.data;
    } catch (error) {
      console.error('Health check error:', error);
      throw error;
    }
  }

  /**
   * Get auth token
   */
  getAuthToken(): string | null {
    return this.authToken;
  }

  /**
   * Check if authenticated
   */
  isAuthenticated(): boolean {
    return !!this.authToken;
  }
}

export const apiClient = new APIClient();
