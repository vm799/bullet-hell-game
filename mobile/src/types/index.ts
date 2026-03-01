/**
 * Game Type Definitions
 */

// Player state
export interface Player {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  hp: number;
  maxHp: number;
  angle: number;
  score: number;
  username: string;
  cosmetics: {
    skinId: string;
    weaponId: string;
    trailId: string;
  };
}

// Bullet state
export interface Bullet {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  owner: 'p1' | 'p2';
  createdAt: number;
  damage: number;
}

// Game state
export interface GameState {
  matchId: string;
  players: {
    p1: Player;
    p2: Player;
  };
  bullets: Bullet[];
  gameState: 'waiting' | 'playing' | 'ended';
  winner: 'p1' | 'p2' | null;
  duration: number; // in seconds
  createdAt: number;
  updatedAt: number;
}

// User profile
export interface UserProfile {
  id: string;
  firebaseId: string;
  username: string;
  email: string;
  rating: number;
  wins: number;
  losses: number;
  createdAt: number;
  avatarUrl?: string;
}

// Match result
export interface MatchResult {
  matchId: string;
  player1Id: string;
  player2Id: string;
  winnerId: string;
  duration: number;
  player1Score: number;
  player2Score: number;
  createdAt: number;
}

// Cosmetic item
export interface Cosmetic {
  id: string;
  type: 'skin' | 'weapon' | 'trail';
  name: string;
  description: string;
  costCoins: number;
  imageUrl: string;
}

// User cosmetic (owned item)
export interface UserCosmetic {
  id: string;
  userId: string;
  cosmeticId: string;
  isEquipped: boolean;
  purchasedAt: number;
}

// API Response types
export interface LoginRequest {
  firebaseToken: string;
  username?: string;
}

export interface LoginResponse {
  user: UserProfile;
  token: string;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  rating: number;
  wins: number;
  winRate: number;
}

export interface MatchmakingRequest {
  userId: string;
  rating: number;
}

export interface ShopItem {
  cosmetic: Cosmetic;
  isOwned: boolean;
  isEquipped: boolean;
}

// Settings and configuration
export interface GameConfig {
  arenaWidth: number;
  arenaHeight: number;
  playerSpeed: number;
  bulletSpeed: number;
  playerRadius: number;
  bulletRadius: number;
  playerMaxHp: number;
  bulletDamage: number;
  matchDuration: number;
  syncRate: number; // updates per second
}

// Input state
export interface InputState {
  moveUp: boolean;
  moveDown: boolean;
  moveLeft: boolean;
  moveRight: boolean;
  shooting: boolean;
  angle: number;
}
