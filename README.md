# 🚀 Bullet Hell - Multiplayer PvP Game

A fast-paced, real-time multiplayer bullet hell game for iOS and Android, built with React Native and Expo.

## 🎮 Game Overview

**Bullet Hell** is a competitive PvP arena game where two players face off in a top-down space battle:

- **Gameplay**: Control your spaceship to dodge incoming fire and shoot your opponent
- **Arena**: 800x600 pixel space arena
- **Match Duration**: 3-5 minutes per match
- **Win Condition**: First player to 0 HP loses
- **Multiplayer**: Real-time synchronization via Firebase
- **Cosmetics**: Unlock skins, weapons, and trail effects
- **Leaderboards**: Compete globally with ELO-based ranking

## ✨ Features

### Core Gameplay
- ✅ Real-time PvP multiplayer
- ✅ Smooth 60 FPS gameplay
- ✅ Touch and keyboard controls
- ✅ Physics-based bullet collision
- ✅ Dynamic difficulty matching

### Cosmetics System
- ✅ Ship skins (default, neon, crystal, fire, void)
- ✅ Weapon styles (standard, plasma, ice)
- ✅ Trail effects (none, neon, flame)
- ✅ In-game coin rewards

### Social Features
- ✅ Global leaderboards (top 100)
- ✅ Weekly competitive rankings
- ✅ User profiles with stats
- ✅ Match history tracking
- ✅ ELO rating system

### Offline Mode
- ✅ Practice against AI
- ✅ Same mechanics as multiplayer
- ✅ No rewards, training only

## 🛠️ Tech Stack

### Mobile App
- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Realtime DB**: Firebase Realtime Database
- **Navigation**: React Navigation
- **State Management**: Local hooks + Firebase listeners

### Backend API
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **Authentication**: Firebase Auth
- **Hosting**: Heroku/Railway/AWS (flexible)

### Infrastructure
- **Real-time Sync**: Firebase Realtime Database
- **User Auth**: Firebase Authentication
- **Rate Limiting**: Express Rate Limit
- **Database**: PostgreSQL 12+

## 📱 Project Structure

```
bullet-hell-game/
├── mobile/
│   ├── src/
│   │   ├── screens/
│   │   │   ├── HomeScreen.tsx
│   │   │   ├── GameScreen.tsx
│   │   │   ├── MatchmakingScreen.tsx
│   │   │   ├── ResultScreen.tsx
│   │   │   ├── ProfileScreen.tsx
│   │   │   ├── ShopScreen.tsx
│   │   │   └── OfflineGameScreen.tsx
│   │   ├── components/
│   │   │   ├── GameArena.tsx
│   │   │   ├── Player.tsx
│   │   │   ├── Bullet.tsx
│   │   │   └── UI components...
│   │   ├── services/
│   │   │   ├── gameEngine.ts
│   │   │   ├── firebaseClient.ts
│   │   │   └── apiClient.ts
│   │   ├── hooks/
│   │   ├── types/
│   │   └── App.tsx
│   ├── app.json
│   ├── eas.json
│   └── package.json
├── api/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── users.ts
│   │   │   ├── leaderboards.ts
│   │   │   ├── cosmetics.ts
│   │   │   ├── match.ts
│   │   │   └── health.ts
│   │   ├── middleware/
│   │   ├── services/
│   │   ├── db/
│   │   └── server.ts
│   ├── .env.example
│   ├── tsconfig.json
│   └── package.json
├── docs/
│   ├── SETUP.md
│   ├── ARCHITECTURE.md
│   ├── GAMEPLAY.md
│   └── DEPLOYMENT.md
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- npm or yarn
- PostgreSQL 12+
- Firebase project
- Expo CLI: `npm install -g expo-cli`

### Setup

1. **Clone & Install**
```bash
git clone https://github.com/yourusername/bullet-hell-game.git
cd bullet-hell-game
npm run setup
```

2. **Configure Environment**

**API (.env)**
```bash
cp api/.env.example api/.env
# Edit api/.env with your settings
```

**Firebase**
- Create Firebase project at console.firebase.google.com
- Enable Realtime Database
- Enable Authentication (Email/Password)
- Download service account key
- Add to api/.env

3. **Start Development**

```bash
# Terminal 1 - API
npm run api

# Terminal 2 - Mobile
npm run mobile

# Or build for production
npm run build:ios
npm run build:android
```

## 🎮 Gameplay Mechanics

### Controls
- **Movement**: WASD / Arrow Keys / Touch Joystick
- **Aim**: Mouse / Touch
- **Shoot**: Space / Click / Touch Button
- **Menu**: ESC

### Game Rules
- **HP**: Each player starts with 100 HP
- **Bullets**: Deal 10 damage on hit
- **Speed**: Players move at 250 px/sec, bullets at 400 px/sec
- **Match**: Lasts 3-5 minutes, whoever reaches 0 HP first loses
- **Rewards**: Winner gets 100 coins, loser gets 10

### ELO Rating
- **Base Rating**: 1000 ELO
- **K-Factor**: 32 points per win/loss
- **Matchmaking**: Players within 200 rating points are matched
- **Timeout**: Queue times out after 30 seconds

## 💰 Cosmetics & Economy

### Shop Items
| Item | Cost | Type |
|------|------|------|
| Neon Skin | 500 coins | Skin |
| Crystal Skin | 500 coins | Skin |
| Fire Skin | 500 coins | Skin |
| Void Skin | 500 coins | Skin |
| Plasma Weapon | 500 coins | Weapon |
| Ice Weapon | 500 coins | Weapon |
| Neon Trail | 500 coins | Trail |
| Flame Trail | 500 coins | Trail |

### Earning Coins
- Win match: +100 coins
- Lose match: +10 coins

## 📊 API Endpoints

### Authentication
- `POST /auth/register` - Create account
- `POST /auth/login` - Login

### Users
- `GET /user/:id` - Get profile
- `POST /user/:id/stats` - Update stats
- `GET /user/cosmetics` - Get owned cosmetics

### Leaderboards
- `GET /leaderboards` - Global top 100
- `GET /leaderboards/weekly` - Weekly rankings

### Cosmetics
- `GET /cosmetics` - Shop items
- `POST /cosmetics/buy` - Purchase item
- `POST /cosmetics/:id/equip` - Equip cosmetic

### Match
- `POST /match` - Request matchmaking
- `GET /match/:id` - Get match state
- `POST /match/:id/end` - End match and update stats

### Health
- `GET /health` - API status

## 📦 Build & Deploy

### iOS Build
```bash
npm run build:ios
```

### Android Build
```bash
npm run build:android
```

### API Deployment
```bash
# Build
npm run api:build

# Deploy to your platform
# Option 1: Heroku
heroku create bullet-hell-api
git push heroku main

# Option 2: Railway
railway up

# Option 3: AWS/Digital Ocean
# Use Docker image and deploy
```

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed instructions.

## 🔒 Security

- All user input is validated server-side
- Firebase tokens are verified before API access
- Passwords hashed with bcrypt
- CORS enabled only for trusted origins
- Rate limiting prevents brute force attacks
- PostgreSQL parameterized queries prevent SQL injection

## 📝 Database Schema

### users
- `id` (UUID) - Primary key
- `firebase_id` (VARCHAR) - Unique Firebase UID
- `username` (VARCHAR) - Unique username
- `email` (VARCHAR)
- `rating` (INT) - ELO rating
- `wins` (INT) - Total wins
- `losses` (INT) - Total losses
- `coins` (INT) - In-game currency
- `created_at`, `updated_at` (TIMESTAMP)

### matches
- `id` (UUID) - Primary key
- `player1_id`, `player2_id` (UUID) - Foreign keys to users
- `winner_id` (UUID) - Winner reference
- `duration_seconds` (INT)
- `player1_score`, `player2_score` (INT)
- `created_at` (TIMESTAMP)

### cosmetics
- `id` (UUID)
- `type` (VARCHAR) - 'skin', 'weapon', 'trail'
- `name`, `description` (VARCHAR)
- `cost_coins` (INT)

### user_cosmetics
- `id`, `user_id`, `cosmetic_id` (UUID)
- `is_equipped` (BOOLEAN)
- `purchased_at` (TIMESTAMP)

## 🐛 Debugging

### Common Issues

**"Firebase not initialized"**
- Check Firebase credentials in .env
- Ensure `firebase-admin-key.json` is in api/ directory

**"Database connection failed"**
- Verify PostgreSQL is running
- Check DB credentials in .env
- Run migrations: `npm run db:migrate`

**"Matchmaking timeout"**
- Check API is running
- Verify Firebase Realtime DB is enabled

### Logs
- API: `NODE_ENV=development npm run api` (verbose logging)
- Mobile: Use Expo DevTools (`d` key)

## 📚 Documentation

- [Setup Guide](docs/SETUP.md) - Detailed setup instructions
- [Architecture](docs/ARCHITECTURE.md) - System design & tech choices
- [Gameplay](docs/GAMEPLAY.md) - Game rules & mechanics
- [Deployment](docs/DEPLOYMENT.md) - Deploy to App Stores

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 👤 Author

Built for competitive mobile gaming.

## 🎯 Roadmap

- [ ] 3v3 team battles
- [ ] Custom game modes
- [ ] Replay system
- [ ] Tournaments
- [ ] Mobile cosmetics
- [ ] Chat & friends
- [ ] Anti-cheat system

---

**Ready to battle? Download now and climb the leaderboards!**

For support, open an issue or contact support@bullethell.game
