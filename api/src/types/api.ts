/**
 * API Request/Response Type Definitions
 */

// Auth
export interface RegisterRequest {
  firebaseToken: string;
  username: string;
}

export interface LoginRequest {
  firebaseToken: string;
}

export interface AuthResponse {
  user: UserResponse;
  token: string;
}

// User
export interface UserResponse {
  id: string;
  firebaseId: string;
  username: string;
  email: string;
  rating: number;
  wins: number;
  losses: number;
  coins?: number;
  avatarUrl?: string | null;
  createdAt: number;
}

export interface UpdateStatsRequest {
  won: boolean;
  ratingDelta: number;
  coinsEarned?: number;
}

// Leaderboard
export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  rating: number;
  wins: number;
  winRate: number;
}

// Matchmaking
export interface MatchmakingResponse {
  matchId: string | null;
  opponent?: string;
  message?: string;
}

export interface MatchResponse {
  id: string;
  player1Id: string;
  player2Id: string;
  winnerId: string | null;
  duration: number | null;
  player1Score: number;
  player2Score: number;
  matchData: any;
  createdAt: number;
}

export interface EndMatchRequest {
  winnerId: string;
  duration: number;
  player1Score: number;
  player2Score: number;
}

export interface EndMatchResponse {
  success: boolean;
  winner: {
    userId: string;
    ratingDelta: number;
  };
  loser: {
    userId: string;
    ratingDelta: number;
  };
}

// Cosmetics
export interface CosmeticResponse {
  id: string;
  type: 'skin' | 'weapon' | 'trail';
  name: string;
  description: string;
  costCoins: number;
  imageUrl: string | null;
}

export interface PurchaseRequest {
  cosmeticId: string;
}

export interface PurchaseResponse {
  success: boolean;
  message: string;
}

export interface UserCosmeticResponse {
  id: string;
  userId: string;
  cosmeticId: string;
  isEquipped: boolean;
  purchasedAt: number;
}

// Health
export interface HealthResponse {
  status: string;
  timestamp: string;
  uptime: number;
  environment: string;
}

// Errors
export interface ErrorResponse {
  error: string;
  code?: string;
  requestId?: string;
}
