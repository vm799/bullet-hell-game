/**
 * Firebase Realtime Database Client
 * Handles real-time game state synchronization
 */

import { initializeApp, FirebaseApp } from 'firebase/app';
import {
  getDatabase,
  Database,
  ref,
  onValue,
  set,
  update,
  remove,
  DataSnapshot,
  Unsubscribe,
} from 'firebase/database';
import {
  getAuth,
  Auth,
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import Constants from 'expo-constants';
import { GameState, Player, Bullet } from '../types';

class FirebaseClient {
  private app: FirebaseApp | null = null;
  private db: Database | null = null;
  private auth: Auth | null = null;
  private matchUnsubscribe: Unsubscribe | null = null;

  /**
   * Initialize Firebase
   */
  async initialize(): Promise<void> {
    try {
      const firebaseConfig = Constants.expoConfig?.extra?.firebaseConfig;

      if (!firebaseConfig) {
        console.error('Firebase config not found in app.json');
        return;
      }

      this.app = initializeApp(firebaseConfig);
      this.db = getDatabase(this.app);
      this.auth = getAuth(this.app);

      console.log('Firebase initialized successfully');
    } catch (error) {
      console.error('Firebase initialization error:', error);
      throw error;
    }
  }

  /**
   * Sign in with email and password
   */
  async signInWithEmail(email: string, password: string): Promise<string> {
    if (!this.auth) throw new Error('Firebase not initialized');

    try {
      const userCredential = await signInWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      return await userCredential.user.getIdToken();
    } catch (error) {
      console.error('Email login error:', error);
      throw error;
    }
  }

  /**
   * Create account with email
   */
  async signUpWithEmail(email: string, password: string): Promise<string> {
    if (!this.auth) throw new Error('Firebase not initialized');

    try {
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      return await userCredential.user.getIdToken();
    } catch (error) {
      console.error('Email signup error:', error);
      throw error;
    }
  }

  /**
   * Sign in anonymously
   */
  async signInAnonymously(): Promise<string> {
    if (!this.auth) throw new Error('Firebase not initialized');

    try {
      const userCredential = await signInAnonymously(this.auth);
      return await userCredential.user.getIdToken();
    } catch (error) {
      console.error('Anonymous login error:', error);
      throw error;
    }
  }

  /**
   * Get current user's Firebase token
   */
  async getToken(): Promise<string | null> {
    if (!this.auth?.currentUser) return null;

    try {
      return await this.auth.currentUser.getIdToken();
    } catch (error) {
      console.error('Get token error:', error);
      return null;
    }
  }

  /**
   * Get current user's ID
   */
  getCurrentUserId(): string | null {
    return this.auth?.currentUser?.uid || null;
  }

  /**
   * Subscribe to game state updates
   */
  subscribeToMatch(
    matchId: string,
    callback: (gameState: GameState | null) => void
  ): Unsubscribe | null {
    if (!this.db) return null;

    const matchRef = ref(this.db, `matches/${matchId}`);

    this.matchUnsubscribe = onValue(matchRef, (snapshot: DataSnapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        callback(data as GameState);
      } else {
        callback(null);
      }
    });

    return this.matchUnsubscribe;
  }

  /**
   * Unsubscribe from match updates
   */
  unsubscribeFromMatch(): void {
    if (this.matchUnsubscribe) {
      this.matchUnsubscribe();
      this.matchUnsubscribe = null;
    }
  }

  /**
   * Update player state
   */
  async updatePlayerState(
    matchId: string,
    playerId: 'p1' | 'p2',
    playerData: Partial<Player>
  ): Promise<void> {
    if (!this.db) throw new Error('Firebase not initialized');

    try {
      const playerRef = ref(this.db, `matches/${matchId}/players/${playerId}`);
      await update(playerRef, playerData);
    } catch (error) {
      console.error('Update player state error:', error);
      throw error;
    }
  }

  /**
   * Create a new bullet
   */
  async createBullet(
    matchId: string,
    bulletId: string,
    bullet: Bullet
  ): Promise<void> {
    if (!this.db) throw new Error('Firebase not initialized');

    try {
      const bulletRef = ref(this.db, `matches/${matchId}/bullets/${bulletId}`);
      await set(bulletRef, bullet);
    } catch (error) {
      console.error('Create bullet error:', error);
      throw error;
    }
  }

  /**
   * Delete a bullet
   */
  async deleteBullet(matchId: string, bulletId: string): Promise<void> {
    if (!this.db) throw new Error('Firebase not initialized');

    try {
      const bulletRef = ref(this.db, `matches/${matchId}/bullets/${bulletId}`);
      await remove(bulletRef);
    } catch (error) {
      console.error('Delete bullet error:', error);
      throw error;
    }
  }

  /**
   * End the match
   */
  async endMatch(
    matchId: string,
    winner: 'p1' | 'p2' | null
  ): Promise<void> {
    if (!this.db) throw new Error('Firebase not initialized');

    try {
      const matchRef = ref(this.db, `matches/${matchId}`);
      await update(matchRef, {
        gameState: 'ended',
        winner,
        updatedAt: Date.now(),
      });
    } catch (error) {
      console.error('End match error:', error);
      throw error;
    }
  }

  /**
   * Clean up - sign out and disconnect
   */
  async cleanup(): Promise<void> {
    this.unsubscribeFromMatch();
    if (this.auth) {
      try {
        // Note: In practice, we might not sign out to keep user session
        // Just disconnect from listeners
      } catch (error) {
        console.error('Cleanup error:', error);
      }
    }
  }
}

// Singleton instance
export const firebaseClient = new FirebaseClient();
