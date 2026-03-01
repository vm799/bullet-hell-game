/**
 * Configuration Service
 * Read from .env, export constants
 */

export const config = {
  // Server
  port: parseInt(process.env.PORT || '3000'),
  nodeEnv: process.env.NODE_ENV || 'development',
  apiUrl: process.env.API_URL || 'http://localhost:3000',

  // Firebase
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID || '',
    privateKeyId: process.env.FIREBASE_PRIVATE_KEY_ID || '',
    privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
    clientId: process.env.FIREBASE_CLIENT_ID || '',
    authUri: process.env.FIREBASE_AUTH_URI || 'https://accounts.google.com/o/oauth2/auth',
    tokenUri: process.env.FIREBASE_TOKEN_URI || 'https://oauth2.googleapis.com/token',
  },

  // Game
  game: {
    matchDuration: parseInt(process.env.MATCH_DURATION || '300'),
    syncRate: parseInt(process.env.SYNC_RATE || '30'),
    matchmakingTimeout: parseInt(process.env.MATCHMAKING_TIMEOUT || '30'),
  },

  // ELO
  elo: {
    kFactor: parseInt(process.env.ELO_K_FACTOR || '32'),
    baseRating: parseInt(process.env.ELO_BASE_RATING || '1000'),
  },

  // Cosmetics
  cosmetics: {
    startingCoins: parseInt(process.env.STARTING_COINS || '0'),
    coinsPerWin: parseInt(process.env.COINS_PER_WIN || '100'),
    coinsPerLoss: parseInt(process.env.COINS_PER_LOSS || '10'),
  },

  // Cache
  cache: {
    ttl: parseInt(process.env.CACHE_TTL || '300'),
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'),
    loginMax: parseInt(process.env.RATE_LIMIT_LOGIN_MAX || '10'),
    apiMax: parseInt(process.env.RATE_LIMIT_API_MAX || '100'),
  },

  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
} as const;

export function isProduction(): boolean {
  return config.nodeEnv === 'production';
}

export function isDevelopment(): boolean {
  return config.nodeEnv === 'development';
}
