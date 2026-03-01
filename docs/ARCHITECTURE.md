# Architecture Overview

## System Design

Bullet Hell uses a three-tier architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                    Mobile Client (React Native)             │
│         (iOS/Android via Expo - 60 FPS gameplay)            │
└─────────────────────────────────────────────────────────────┘
                              ↕️ 
                    (REST API + WebSocket)
                              ↕️
┌─────────────────────────────────────────────────────────────┐
│         Backend API (Node.js/Express/PostgreSQL)            │
│  (Matchmaking, leaderboards, cosmetics, stats management)   │
└─────────────────────────────────────────────────────────────┘
                              ↕️
         ┌────────────────────┼────────────────────┐
         ↓                    ↓                     ↓
    ┌─────────┐         ┌──────────┐          ┌─────────┐
    │PostgreSQL│         │Firebase  │          │Firebase │
    │Database  │         │Realtime  │          │Auth     │
    └─────────┘         │Database  │          └─────────┘
                        └──────────┘
```

## Component Architecture

### Mobile App (React Native)

**Screens (User Interface)**
- HomeScreen: Main menu, play button, leaderboards
- GameScreen: Live PvP gameplay with game loop
- MatchmakingScreen: Queue status and opponent search
- ResultScreen: Match results and rewards
- ProfileScreen: User stats and cosmetics
- ShopScreen: Cosmetics marketplace
- OfflineGameScreen: AI practice mode

**Services**
- `gameEngine.ts`: Physics, collision detection, game loop (30 FPS updates)
- `firebaseClient.ts`: Real-time state synchronization (Firebase Realtime DB)
- `apiClient.ts`: HTTP requests to backend API
- `matchmakingService.ts`: Queue and opponent pairing

**Game Loop Architecture**
```
requestAnimationFrame (60 FPS)
  ↓
Update local game state (physics, movement)
  ↓
Check collisions
  ↓
Sync to Firebase (30 updates/sec = 33ms)
  ↓
Render
  ↓
Next frame
```

### Backend API (Node.js/Express)

**Routes**
- `/auth/*` - User registration and authentication
- `/user/*` - Profile and stats management
- `/leaderboards/*` - Rankings and statistics
- `/cosmetics/*` - Shop and inventory
- `/match/*` - Matchmaking and match management
- `/health` - Status checks

**Middleware Pipeline**
```
Request
  ↓
CORS
  ↓
Body Parser
  ↓
Rate Limiter (login: 10 req/min, API: 100 req/min)
  ↓
Firebase Auth (if protected route)
  ↓
Route Handler
  ↓
Error Handler
  ↓
Response
```

**Services**
- `firebaseAdminInit.ts`: Firebase SDK initialization
- `matchmakingQueue.ts`: In-memory player queue with rating-based pairing
- `stats.ts`: ELO calculation
- `cosmetics.ts`: Shop logic and purchase handling
- `cache.ts`: Leaderboard caching (5 min TTL)

## Data Flow

### Login Flow

```
Mobile Client
  ↓
Firebase Auth (Email/Password)
  ↓
Firebase issues ID token
  ↓
Client calls POST /auth/login with token
  ↓
Backend verifies token
  ↓
Backend returns user profile + access token
  ↓
Client stores token in AsyncStorage
  ↓
All subsequent requests include token
```

### Matchmaking Flow

```
Player A clicks "Play"
  ↓
POST /match request
  ↓
API adds to queue with rating
  ↓
API checks for suitable opponent (within 200 ELO)
  ↓
If match found:
  │ └─> Create match in PostgreSQL
  │ └─> Create match in Firebase Realtime DB
  │ └─> Return matchId to both players
  └─> If no match: Return queue status
```

### Gameplay Sync Flow

```
Local Game Loop (Client A)
  ↓
Update player position, rotation, bullets
  ↓
Send to Firebase (every 33ms)
  ↓
Firebase triggers update listener on Client B
  ↓
Client B receives opponent state
  ↓
Render both players
  ↓
Detect collisions locally
  ↓
Update HP and scores
  ↓
If HP <= 0: Send match end to API
  ↓
API awards coins and updates ELO
```

### Cosmetics Purchase Flow

```
Client clicks "Buy"
  ↓
POST /cosmetics/buy {cosmeticId}
  ↓
API checks:
  │ ├─> User owns coins?
  │ ├─> Item already owned?
  │ └─> Item exists?
  ↓
If valid:
  │ ├─> Deduct coins from user
  │ ├─> Add cosmetic to user_cosmetics
  │ └─> Return success
  └─> Return error
```

## Real-Time Synchronization

### Firebase Realtime Database Structure

```
matches/
  {matchId}/
    players/
      p1/
        id: "user-uuid"
        x: 200
        y: 300
        vx: 0
        vy: 0
        hp: 100
        score: 0
        cosmetics:
          skinId: "neon"
          weaponId: "plasma"
          trailId: "flame"
      p2/
        (same structure)
    bullets/
      {bulletId}/
        x: 250
        y: 310
        vx: 100
        vy: 0
        owner: "p1"
        createdAt: 1704067200000
    gameState: "playing" | "ended"
    winner: "p1" | "p2" | null
    createdAt: 1704067200000
    updatedAt: 1704067200033
```

### Sync Rate

- **Game Loop**: 60 FPS (client-side only, doesn't send)
- **Network Sync**: 30 updates/sec = 33ms intervals
- **Latency**: Typical 50-200ms (acceptable for casual gameplay)
- **Buffer**: Updates are applied smoothly even with jitter

## Database Schema

### PostgreSQL Tables

**users**
- Stores user profiles and stats
- ELO rating updated after matches
- Coins earned from wins
- Indexed on firebase_id for fast auth lookup

**matches**
- Stores match history
- Records winner, duration, scores
- JSONB field for full match snapshot
- Indexed on created_at for leaderboard queries

**cosmetics**
- Fixed catalog of available items
- Types: skin, weapon, trail
- Prices in coins

**user_cosmetics**
- Junction table for user ownership
- Tracks which cosmetics user owns
- is_equipped flag for active cosmetics

### Indexes for Performance

```sql
CREATE INDEX idx_users_firebase_id ON users(firebase_id);
CREATE INDEX idx_matches_created_at ON matches(created_at);
CREATE INDEX idx_matches_player1_id ON matches(player1_id);
CREATE INDEX idx_matches_player2_id ON matches(player2_id);
CREATE INDEX idx_user_cosmetics_user_id ON user_cosmetics(user_id);
```

## Security Architecture

### Authentication
- Firebase Auth handles password security
- ID tokens verified server-side on every protected request
- Tokens expire after 1 hour (user must re-login)

### Authorization
- All requests require valid Firebase token
- Players can only access their own data
- Match state validated on server before accepting updates

### Rate Limiting
- Login/register: 10 requests per minute per IP
- General API: 100 requests per minute per user
- Prevents brute force and DDoS attacks

### Input Validation
- All input validated server-side
- QueryParams, body, and headers checked
- Type checking via TypeScript

### Database Security
- PostgreSQL parameterized queries prevent SQL injection
- Foreign key constraints maintain referential integrity
- Row-level security can be added if needed

## Performance Optimization

### Caching
- Leaderboards cached for 5 minutes
- Cache invalidated on match completion
- Redis optional for distributed cache

### Database Queries
- Indexed on frequently queried fields
- Join optimized queries
- Pagination on leaderboards (limit 100)

### Network
- Minimal payload sizes (JSON)
- Compression enabled on Express
- CDN recommended for static assets

### Game Loop
- 60 FPS capped on mobile
- Physics timestep fixed at ~16ms
- Bullet culling for off-screen objects

## Scalability Considerations

### Horizontal Scaling
- Stateless API design (can run multiple instances)
- Load balancer distributes requests
- Database connection pooling

### Database Scaling
- PostgreSQL read replicas for leaderboards
- Sharding by user ID for growth
- Archive old matches regularly

### Real-Time Scaling
- Firebase can handle thousands of concurrent matches
- Monitor database connections
- Add caching layer for hot queries

## Deployment Architecture

### Development
```
MacBook/Linux Dev Machine
├── PostgreSQL (local)
├── Node.js API (port 3000)
├── Firebase (console)
└── Expo (hot reload)
```

### Production
```
App Store / Play Store
└── Mobile App
    └── API Gateway (with TLS)
        ├── Node.js API (multiple instances)
        ├── Load Balancer
        └── PostgreSQL (managed database)
            └── Backup/replication

Firebase Realtime DB (managed)
Firebase Auth (managed)
```

---

**Architecture designed for:**
- ✅ Scalability
- ✅ Reliability
- ✅ Maintainability
- ✅ Developer experience
