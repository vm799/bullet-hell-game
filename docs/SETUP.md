# Setup Guide

Complete guide to set up Bullet Hell development environment.

## Prerequisites

- Node.js 16.0+ ([download](https://nodejs.org))
- npm 8+ or yarn
- PostgreSQL 12+ ([download](https://www.postgresql.org))
- Git
- Firebase account ([create](https://console.firebase.google.com))
- Expo CLI: `npm install -g expo-cli`
- macOS users: Xcode Command Line Tools

## 1. Firebase Setup

### Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project"
3. Name it "bullet-hell-game"
4. Enable Google Analytics
5. Click "Create project"

### Enable Realtime Database

1. Go to "Realtime Database"
2. Click "Create Database"
3. Select region (closest to your location)
4. Start in **Test Mode** (for development)
5. Click "Enable"

```json
{
  "rules": {
    "matches": {
      "$matchId": {
        ".read": "auth != null && (root.child('matches').child($matchId).child('players').child('p1').child('id').val() === auth.uid || root.child('matches').child($matchId).child('players').child('p2').child('id').val() === auth.uid)",
        ".write": "auth != null",
        ".validate": "newData.hasChildren(['players', 'bullets', 'gameState'])"
      }
    }
  }
}
```

### Enable Authentication

1. Go to "Authentication"
2. Click "Get Started"
3. Enable "Email/Password"
4. Enable "Anonymous"

### Get Firebase Credentials

1. Go to Project Settings (gear icon)
2. Click "Service Accounts"
3. Click "Generate New Private Key"
4. Save as `api/firebase-admin-key.json`

Or use environment variables:
1. Go to Project Settings
2. Copy values for these fields:
   - Project ID
   - Private Key ID
   - Private Key
   - Client Email
   - Client ID

## 2. Database Setup

### Install PostgreSQL

**macOS with Homebrew:**
```bash
brew install postgresql
brew services start postgresql
```

**Windows:**
- Download from [postgresql.org](https://www.postgresql.org/download/windows/)
- Run installer, remember the password

**Linux (Ubuntu):**
```bash
sudo apt-get install postgresql postgresql-contrib
sudo service postgresql start
```

### Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# In psql:
CREATE DATABASE bullet_hell;
CREATE USER bullet_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE bullet_hell TO bullet_user;
\q
```

## 3. Project Setup

### Clone Repository

```bash
git clone https://github.com/yourusername/bullet-hell-game.git
cd bullet-hell-game
```

### Install Dependencies

```bash
npm run setup
```

This installs dependencies for:
- Root project
- Mobile app
- Backend API

### Configure Environment

**API Configuration:**

```bash
cp api/.env.example api/.env
```

Edit `api/.env`:

```
NODE_ENV=development
PORT=3000
API_URL=http://localhost:3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bullet_hell
DB_USER=bullet_user
DB_PASSWORD=secure_password

# Firebase
FIREBASE_PROJECT_ID=bullet-hell-game
FIREBASE_PRIVATE_KEY_ID=your_key_id
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@bullet-hell-game.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your_client_id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token

# Game Settings
MATCH_DURATION=300
SYNC_RATE=30
MATCHMAKING_TIMEOUT=30
ELO_K_FACTOR=32
ELO_BASE_RATING=1000

# Economy
STARTING_COINS=0
COINS_PER_WIN=100
COINS_PER_LOSS=10

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_LOGIN_MAX=10
RATE_LIMIT_API_MAX=100
```

**Mobile Firebase Config:**

Edit `mobile/app.json` and add your Firebase config:

```json
{
  "extra": {
    "firebaseConfig": {
      "apiKey": "YOUR_API_KEY",
      "authDomain": "bullet-hell-game.firebaseapp.com",
      "projectId": "bullet-hell-game",
      "storageBucket": "bullet-hell-game.appspot.com",
      "messagingSenderId": "YOUR_SENDER_ID",
      "appId": "YOUR_APP_ID"
    }
  }
}
```

## 4. Database Migrations

Run migrations to create tables:

```bash
npm run db:migrate
```

This will:
- Create `migrations` table
- Create `users` table
- Create `matches` table
- Create `cosmetics` table
- Create `user_cosmetics` table
- Insert default cosmetics
- Create indexes

## 5. Start Development

### Option A: Separate Terminals

**Terminal 1 - Backend API:**
```bash
npm run api
```

Expected output:
```
🚀 Server running on port 3000
📍 Environment: development
🔗 API URL: http://localhost:3000
```

**Terminal 2 - Mobile App:**
```bash
npm run mobile
```

Expected output:
```
▄▀█ █▀█ █▀█   █▀▄ █▀▀ ▄▀█ █▀▄ █▄█
█▀▄ █▀▀ █  ░ █   █░░ █▀█ █▀▄ █ █ 
```

Then:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Press `w` for web browser
- Press `j` to open debugger

### Option B: Watch Mode

```bash
# Root directory
npm run dev
```

## 6. Test the Setup

### Test API

```bash
# Health check
curl http://localhost:3000/health

# Should return:
# {"status":"ok","timestamp":"2024-...","uptime":...}
```

### Test Database

```bash
# Connect and verify
psql -U bullet_user -d bullet_hell

# In psql:
\dt  # List tables
SELECT COUNT(*) FROM cosmetics;
\q
```

### Test Mobile App

1. Open Expo app on your phone or use simulator
2. Sign in / register
3. Try:
   - Viewing leaderboards
   - Practice mode
   - Profile page
   - Shop page

## 7. Troubleshooting

### PostgreSQL Connection Error

```
error: connect ECONNREFUSED 127.0.0.1:5432
```

**Fix:**
```bash
# Start PostgreSQL
brew services start postgresql  # macOS
sudo service postgresql start   # Linux

# Or manually:
pg_ctl -D /usr/local/var/postgres start
```

### Firebase Initialization Error

```
Failed to initialize Firebase Admin SDK
```

**Fix:**
- Verify all env vars in api/.env
- Check firebase-admin-key.json exists
- Validate JSON formatting of private key

### Port Already in Use

```
listen EADDRINUSE: address already in use :::3000
```

**Fix:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port:
PORT=3001 npm run api
```

### Node Modules Issues

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run setup
```

## 8. Development Workflow

### Making Changes

1. **Backend changes:**
   - Edit files in `api/src/`
   - API auto-reloads with ts-node watch mode
   - Test with `curl` or Postman

2. **Mobile changes:**
   - Edit files in `mobile/src/`
   - Hot reload on save
   - Check Expo console for errors

3. **Database changes:**
   - Create new migration in `api/src/db/migrations/`
   - Run `npm run db:migrate`

### Git Workflow

```bash
git add .
git commit -m "feat: add feature description"
git push origin main
```

## 9. Next Steps

Once everything is set up:

1. Read [ARCHITECTURE.md](ARCHITECTURE.md) to understand the system design
2. Read [GAMEPLAY.md](GAMEPLAY.md) to learn game mechanics
3. Check [DEPLOYMENT.md](DEPLOYMENT.md) for production setup
4. Start developing!

## 10. Production Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for:
- Building for App Store
- Building for Play Store
- Deploying API
- Configuring CI/CD
- Scaling the backend

---

**All set! Start coding! 🚀**

Questions? Check GitHub Issues or contact the team.
