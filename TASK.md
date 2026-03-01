# Bullet Hell Multiplayer PvP Game - Build Task

Build a complete multiplayer bullet hell PvP game for iOS + Android. This is a production-ready project spanning mobile (React Native + Expo), backend (Node.js + Express), database (PostgreSQL), and Firebase.

## PART 1: PROJECT SETUP
1. Create root package.json with scripts for mobile and backend
2. Create .gitignore for Node, React Native, Expo, and databases
3. Create comprehensive README.md with build instructions, game rules, architecture overview

## PART 2: MOBILE APP (React Native + Expo)
Directory: mobile/

1. Expo setup:
   - app.json (Expo config with iOS/Android build settings, permissions)
   - eas.json (EAS build configuration for App Store + Play Store)
   - babel.config.js
   - tsconfig.json
   - package.json with dependencies

2. Screens (screens/):
   - HomeScreen.tsx - main menu, play button, leaderboards link, profile link
   - MatchmakingScreen.tsx - finding opponent spinner, animations
   - GameScreen.tsx - live gameplay, game loop control, pause/surrender UI
   - ResultScreen.tsx - win/loss, stats, next match button
   - ProfileScreen.tsx - username, avatar, stats (wins/losses/rating), cosmetics collection, match history
   - ShopScreen.tsx - cosmetics store (skins, weapons, trails) with prices, purchase button

3. Components (components/):
   - GameArena.tsx - Canvas renderer (800x600), renders players + bullets with proper scaling for mobile
   - Player.tsx - ship sprite/shape rendering (position, rotation, cosmetic skin)
   - Bullet.tsx - bullet rendering (position, owner color for distinction)
   - HealthBar.tsx - player HP display (100 HP max)
   - ScoreBoard.tsx - current scores
   - Timer.tsx - match timer (3-5 min countdown)
   - JoystickControl.tsx - virtual joystick for mobile touch input
   - ShootButton.tsx - tap-to-shoot button

4. Services (services/):
   - gameEngine.ts - physics engine: move player, update bullets, collision detection, damage logic
   - firebaseClient.ts - Firebase Realtime Database integration for match state sync
   - apiClient.ts - HTTP calls to Node.js backend (auth, leaderboards, profile, shop, matchmaking)
   - matchmakingService.ts - queue management, opponent pairing
   - storageService.ts - LocalStorage for user auth token, cosmetics cache

5. Hooks (hooks/):
   - useGameLoop.ts - 60 FPS game loop with requestAnimationFrame
   - useFirebaseSync.ts - subscribe to match updates from Firebase
   - usePlayerInput.ts - handle keyboard/touch input
   - useCollisions.ts - detect and handle collisions

6. Types (types/):
   - types.ts - GameState, Player, Bullet, Match, User, Cosmetic interfaces

7. Styles:
   - Global stylesheet with React Native styling
   - Colors: space theme (dark blue, neon cyan, purple accents)
   - Typography: clean, readable fonts for mobile

8. Assets:
   - Create placeholder ship SVGs / images for different skins
   - Placeholder bullet sprite
   - Explosion animation frames

## PART 3: BACKEND API (Node.js + Express)
Directory: api/

1. Project setup:
   - package.json with Express, Firebase, PostgreSQL, TypeScript, dotenv
   - tsconfig.json
   - .env.example (list all environment variables needed)
   - server.ts - Express app initialization, middleware setup

2. Middleware (middleware/):
   - firebaseAuth.ts - verify Firebase token, attach user to request
   - errorHandler.ts - centralized error handling
   - rateLimit.ts - rate limiting (10 req/min for login, 100 req/min for others)
   - cors.ts - CORS config for mobile app

3. Routes (routes/):
   - auth.ts - POST /auth/register, POST /auth/login
   - leaderboards.ts - GET /leaderboards, GET /leaderboards/weekly
   - users.ts - GET /user/:id, POST /user/stats
   - cosmetics.ts - GET /cosmetics, POST /cosmetics/buy
   - match.ts - POST /match (start matchmaking), GET /match/:id (fallback state)
   - health.ts - GET /health (status check)

4. Services (services/):
   - firebaseAdminInit.ts - initialize Firebase Admin SDK
   - matchmakingQueue.ts - manage player queue, rank-based pairing, timeout after 30sec
   - cosmetics.ts - shop logic, purchase verification, balance validation
   - stats.ts - ELO rating system (K=32, compute delta)
   - auth.ts - user registration, Firebase token verification
   - cache.ts - Redis-like caching for leaderboards (invalidate on match end)

5. Database (db/):
   - migrations/ - SQL files for schema creation
   - models.ts - TypeORM or raw query models for users, matches, cosmetics
   - connection.ts - PostgreSQL connection pool

6. Types (types/):
   - express.d.ts - extend Express Request/Response with user type
   - api.ts - request/response interfaces

7. Config:
   - firebase-admin-key.json (instructions to add, not committed)
   - config.ts - read from .env, export constants

8. Testing (optional):
   - __tests__/auth.test.ts - sample auth endpoint tests
   - __tests__/cosmetics.test.ts - sample shop logic tests

## PART 4: DATABASE SCHEMA (PostgreSQL)
File: api/db/migrations/001_initial_schema.sql

Tables:
- users: id, firebase_id (unique), username, email, rating (INT default 1000 ELO), wins, losses, created_at, updated_at, avatar_url (nullable)
- matches: id, player1_id, player2_id, winner_id (nullable if draw), duration_seconds, created_at, match_data (JSONB for state snapshot)
- cosmetics: id, type (enum: skin|weapon|trail), name, description, cost_coins, image_url
- user_cosmetics: id, user_id, cosmetic_id, purchased_at, is_equipped (for active skin)
- leaderboard_cache: player_id, rank, rating, wins, last_updated (materialized view for speed)

Include:
- Indexes on firebase_id, created_at
- Foreign keys with ON DELETE CASCADE where appropriate
- Timestamps (created_at, updated_at) with defaults

## PART 5: FIREBASE SETUP
File: firebase-config.ts (mobile app)
File: services/firebaseAdminInit.ts (backend)

1. Create Realtime Database structure:
   matches/{matchId}/{
     players: {
       p1: { id, x, y, hp, score, cosmetics: { skinId, weaponId, trailId } },
       p2: { id, x, y, hp, score, cosmetics: { skinId, weaponId, trailId } }
     },
     bullets: { bulletId: { x, y, vx, vy, owner (p1|p2), created_at } },
     game_state: "playing" | "ended",
     winner: null | "p1" | "p2",
     created_at,
     updated_at
   }

2. Create rules for Realtime Database (production rules):
   - Only authenticated users can read their own match
   - Only game clients can write positions/bullets (server-side validation)
   - Auto-cleanup: matches older than 1 hour are deleted via Cloud Function

3. Create Cloud Function: cleanupExpiredMatches()
   - Triggers daily
   - Deletes matches where game_state == "ended" and created_at < now - 24h

4. Authentication:
   - Enable Email/Password and Anonymous sign-in
   - Create test user credentials for testing

## PART 6: GAME ENGINE & GAMEPLAY
File: mobile/services/gameEngine.ts

Implement:
1. Physics:
   - Player movement: WASD/arrows move ship up/down/left/right at constant velocity (150 px/sec)
   - Rotation: ship rotates to face mouse/touch position
   - Bullets: travel straight at 400 px/sec, created at player position

2. Collision Detection:
   - Bullets vs ships: circle collision (ship radius 15px, bullet radius 3px)
   - Damage: 10 HP per bullet hit
   - Bullet despawn: after 10 seconds or off-screen

3. Game Loop:
   - 60 FPS with requestAnimationFrame
   - Update physics (100ms/sec timestep)
   - Check collisions every frame
   - Sync to Firebase every 60ms (30 updates/sec)
   - End condition: any player reaches 0 HP

## PART 7: COSMETICS SYSTEM
Files:
- mobile/screens/ShopScreen.tsx
- api/services/cosmetics.ts
- api/routes/cosmetics.ts

Features:
1. Shop display:
   - Grid of cosmetics (skins, weapons, trails)
   - Show price, preview, own/purchase button
   - Apply a cosmetic if owned

2. Cosmetics types:
   - Skins: 5 designs (default, neon, crystal, fire, void) - $0.99 each
   - Weapons: 3 bullet styles (standard, plasma, ice) - $0.99 each
   - Trails: 3 particle effects (none, neon, flame) - $0.99 each
   - Bundle: all 10 items for $4.99

3. Purchase flow:
   - POST /cosmetics/buy with cosmetic_id
   - Deduct coins from player balance
   - Add cosmetic to user_cosmetics
   - Equip if skin (only one skin equipped at a time)

4. In-game rewards:
   - Winner gets +100 coins
   - Loser gets +10 coins

## PART 8: OFFLINE MODE
File: mobile/screens/OfflineGameScreen.tsx

1. AI opponent:
   - Simple bot that follows player ship
   - Shoots randomly when in range (30% chance per frame)
   - Takes damage like normal player
   - No rewards, practice only

2. Same game mechanics, but:
   - No Firebase sync
   - No opponent updates needed
   - Local-only state

## PART 9: LEADERBOARDS
Files:
- mobile/screens/HomeScreen.tsx (leaderboards section)
- api/routes/leaderboards.ts

Features:
1. Global leaderboards:
   - GET /leaderboards - top 100 by ELO rating
   - Return: [{ rank, username, rating, wins, win_rate }]
   - Cached, updates every 5 minutes

2. Weekly leaderboards:
   - GET /leaderboards/weekly
   - Only matches from last 7 days
   - Resets every Monday

3. Display:
   - Show user's own rank
   - Show nearby players (top 10, plus 5 above/below user)
   - Highlight user if in top 100

## PART 10: USER PROFILES
File: mobile/screens/ProfileScreen.tsx

Display:
1. User info:
   - Avatar (from Gravatar or placeholder)
   - Username
   - Join date

2. Stats:
   - Wins / Losses
   - Win rate percentage
   - Current ELO rating
   - Total matches played

3. Cosmetics collection:
   - Show all owned skins/weapons/trails
   - Show which is currently equipped

4. Match history:
   - Last 10 matches (date, opponent, result, duration)
   - Link to each opponent's profile

## PART 11: BUILD CONFIGS FOR APP STORES
Files:
- mobile/app.json (Expo config)
- mobile/eas.json (EAS config)
- api/Dockerfile (for backend deployment)

1. iOS:
   - app.json: bundleIdentifier, version, build number
   - Request camera/location permissions (if used)
   - eas.json: build profile for App Store

2. Android:
   - app.json: package name, version, build number
   - eas.json: build profile for Play Store
   - Supports Android 8.0+

3. Deployment scripts:
   - scripts/build-ios.sh - runs `eas build --platform ios --auto-submit`
   - scripts/build-android.sh - runs `eas build --platform android --auto-submit`
   - scripts/deploy-api.sh - deploy backend to chosen platform (Heroku/Railway/AWS)

## PART 12: GITHUB & DOCUMENTATION
Files:
- README.md (comprehensive)
- docs/SETUP.md - Firebase + API setup guide
- docs/ARCHITECTURE.md - system design, tech choices
- docs/GAMEPLAY.md - rules, cosmetics, rewards
- docs/DEPLOYMENT.md - build + publish to App Stores
- .github/workflows/ci.yml (optional GitHub Actions for tests)
- .gitignore (Node, Expo, Secrets)

README should include:
- Game overview + screenshots
- Features list
- How to build for iOS/Android
- Credits

## DELIVERY REQUIREMENTS

Build all of this. Create every file with production-quality code:
- Full TypeScript with strict mode
- Proper error handling and validation
- Comments where logic is complex
- Environment-based configuration
- Sample data for testing
- Beautiful, performant, monetization-ready code

When done, commit all code to git with meaningful commit messages.
