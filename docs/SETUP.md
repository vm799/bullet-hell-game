# Setup Guide

Complete guide to set up Bullet Hell development environment.

## Prerequisites

- Node.js 20+ ([download](https://nodejs.org))
- npm 8+ or yarn
- Git
- Firebase account ([create](https://console.firebase.google.com))
- Expo CLI: `npm install -g expo-cli`
- macOS users: Xcode Command Line Tools (for iOS simulator)

> **Note:** This project uses Firebase Firestore as its database. No PostgreSQL or other SQL database is required.

## 1. Firebase Setup

### Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project"
3. Name it "bullet-hell-game" (or your preferred name)
4. Click "Create project"

### Enable Firestore

1. Go to "Firestore Database"
2. Click "Create database"
3. Select region (closest to your users)
4. Start in **Test Mode** (for development)
5. Click "Enable"

Cosmetics data is auto-seeded on first API start.

### Enable Realtime Database

1. Go to "Realtime Database"
2. Click "Create Database"
3. Select region (closest to your location)
4. Start in **Test Mode** (for development)
5. Click "Enable"

Production rules (paste in Rules tab):

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

### Get Firebase Admin Credentials (for the API server)

1. Go to Project Settings (gear icon)
2. Click "Service Accounts"
3. Click "Generate New Private Key"
4. Download the JSON file
5. Copy the values into your `api/.env` file (see Step 3 below)

### Get Firebase Web Config (for the mobile app)

1. Go to Project Settings (gear icon)
2. Scroll to "Your apps" > click the Web icon (`</>`)
3. Register an app (name: "bullet-hell-mobile")
4. Copy the `firebaseConfig` object for use in Step 3

## 2. Install Dependencies

```bash
git clone <your-repo-url>
cd bullet-hell-game
npm run setup
```

This installs dependencies for the root project, mobile app, and backend API.

## 3. Configure Environment

### API Configuration

```bash
cp api/.env.example api/.env
```

Edit `api/.env` with your Firebase Admin credentials:

```env
NODE_ENV=development
PORT=3000
API_URL=http://localhost:3000

# Firebase (from the service account JSON you downloaded)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your_client_id

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

### Mobile Firebase Config

Edit `mobile/app.json` and replace the placeholder values in `extra.firebaseConfig`:

```json
{
  "extra": {
    "apiUrl": "http://localhost:3000",
    "firebaseConfig": {
      "apiKey": "YOUR_API_KEY",
      "authDomain": "your-project.firebaseapp.com",
      "databaseURL": "https://your-project.firebaseio.com",
      "projectId": "your-project-id",
      "storageBucket": "your-project.appspot.com",
      "messagingSenderId": "YOUR_SENDER_ID",
      "appId": "YOUR_APP_ID"
    }
  }
}
```

## 4. Start Development

### Terminal 1 - Backend API

```bash
npm run api
```

Expected output:
```
Initializing Firebase...
Firebase Admin SDK initialized
Initializing Firestore...
Firestore initialized successfully
Server running on port 3000
```

### Terminal 2 - Mobile App

```bash
npm run mobile
```

Then:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Press `w` for web browser

## 5. Verify Setup

### Test API

```bash
curl http://localhost:3000/health
# Should return: {"status":"ok","timestamp":"...","uptime":...}
```

### Test Mobile App

1. Open the app in Expo (simulator or device)
2. Try Practice Mode (works without auth)
3. Register an account to test online features

## 6. Troubleshooting

### Firebase Initialization Error

```
Failed to initialize Firebase Admin SDK: Missing Firebase credentials
```

**Fix:** Make sure all `FIREBASE_*` env vars are set in `api/.env`. Double check the private key has `\n` for newlines.

### Port Already in Use

```
listen EADDRINUSE: address already in use :::3000
```

**Fix:**
```bash
lsof -ti:3000 | xargs kill -9
# Or use different port:
PORT=3001 npm run api
```

### Firestore Permission Denied

**Fix:** Make sure your Firestore rules are in test mode for development:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### Node Modules Issues

```bash
rm -rf node_modules package-lock.json
npm install
npm run setup
```

## 7. Next Steps

1. Read [ARCHITECTURE.md](ARCHITECTURE.md) for system design
2. Read [GAMEPLAY.md](GAMEPLAY.md) for game mechanics
3. Check [DEPLOYMENT.md](DEPLOYMENT.md) for production setup
