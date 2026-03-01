# Deployment Guide

Complete guide to deploying Bullet Hell to production.

## Pre-Deployment Checklist

- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Firebase project ready
- [ ] Database backups configured
- [ ] SSL/TLS certificates ready
- [ ] API rate limits tested
- [ ] Mobile app icons and splash screens
- [ ] Privacy policy and terms of service ready

## API Deployment

### Option 1: Heroku (Easiest)

**Prerequisites:**
- Heroku account ([create](https://heroku.com))
- Heroku CLI installed

**Steps:**

1. **Create Heroku App**
```bash
heroku login
heroku create bullet-hell-api
```

2. **Configure Environment**
```bash
heroku config:set NODE_ENV=production
heroku config:set PORT=3000
heroku config:set DB_HOST=db.example.com
heroku config:set DB_NAME=bullet_hell
heroku config:set DB_USER=db_user
heroku config:set DB_PASSWORD=secure_password
heroku config:set FIREBASE_PROJECT_ID=bullet-hell-game
# Add all other Firebase env vars...
```

3. **Add PostgreSQL Add-on**
```bash
heroku addons:create heroku-postgresql:standard-0
```

4. **Deploy**
```bash
git push heroku main
heroku logs --tail
```

5. **Run Migrations**
```bash
heroku run npm run db:migrate
```

### Option 2: Railway

**Prerequisites:**
- Railway account ([create](https://railway.app))
- Railway CLI installed

**Steps:**

1. **Initialize Railway**
```bash
railway login
railway init
```

2. **Create Services**
```bash
# Add PostgreSQL
railway add postgresql

# Add Node.js service
railway service add nodejs
```

3. **Configure Variables**
```bash
railway variables set NODE_ENV=production
railway variables set PORT=3000
# Add all env vars...
```

4. **Deploy**
```bash
railway up
```

### Option 3: AWS / DigitalOcean (VPS)

**Using Docker:**

1. **Create Dockerfile**
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY api/dist ./dist

EXPOSE 3000
CMD ["node", "dist/server.js"]
```

2. **Build and Push**
```bash
docker build -t bullet-hell-api:latest .
docker push your-registry/bullet-hell-api:latest
```

3. **Deploy to VPS**
```bash
# Using Docker Compose
docker-compose up -d

# Or using orchestration (Kubernetes, ECS, etc.)
```

### Post-Deployment API

**Verify Deployment:**
```bash
curl https://api.bullethell.game/health
# Should return: {"status":"ok","timestamp":"..."}
```

**Monitor Logs:**
- Heroku: `heroku logs --tail`
- Railway: `railway logs`
- VPS: `docker logs bullet-hell-api`

**Setup Monitoring:**
- Configure error tracking (Sentry)
- Setup uptime monitoring (Pingdom)
- Database backups (automated)

## iOS App Deployment

### Build for App Store

**Prerequisites:**
- Apple Developer Account ($99/year)
- Xcode installed
- EAS CLI configured

**Steps:**

1. **Update App Version**

Edit `mobile/app.json`:
```json
{
  "expo": {
    "version": "1.0.0",
    "ios": {
      "buildNumber": "1"
    }
  }
}
```

2. **Create EAS Build**
```bash
npm run build:ios
# Or specific command:
eas build --platform ios --auto-submit
```

3. **Configure App Store Connect**
- Create App ID
- Configure capabilities (if needed)
- Set up push notifications
- Configure in-app purchases

4. **Submit**
```bash
eas submit --platform ios
# Or via Xcode:
xcode-select --install
open -a Simulator
# Then submit via Xcode
```

5. **Wait for Review**
- Apple typically takes 24-48 hours
- May request changes
- Resubmit if needed

6. **Publish**
- Once approved, app goes live
- Version available to all users
- Monitor app store for issues

### App Store Optimization

**Icon & Screenshots:**
- App Icon: 1024x1024 PNG
- App Preview: 1080x1920 or similar
- Screenshots: Show gameplay highlights
- Keywords: "bullet hell", "pvp", "arcade"

**Description:**
```
Bullet Hell - Competitive PvP space battle game!

⚡ Lightning-fast real-time multiplayer action
💥 Top-down arena combat
🏆 ELO-based ranking system
🎮 Smooth 60 FPS gameplay
💰 Cosmetics and unlockables

Download now and climb the leaderboards!
```

## Android App Deployment

### Build for Play Store

**Prerequisites:**
- Google Play Developer Account ($25 one-time)
- Android Studio or Gradle
- EAS CLI configured

**Steps:**

1. **Create Signing Key**
```bash
keytool -genkey -v -keystore upload-keystore.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias upload-key
```

2. **Update App Version**

Edit `mobile/app.json`:
```json
{
  "expo": {
    "version": "1.0.0",
    "android": {
      "versionCode": 1
    }
  }
}
```

3. **Build APK/AAB**
```bash
eas build --platform android --auto-submit
```

4. **Configure Google Play**
- Create app listing
- Upload icon and screenshots
- Write app description
- Set content rating

5. **Submit Build**
```bash
eas submit --platform android
```

6. **Rollout Strategy**
- Start with 5% of users
- Monitor for crashes
- Increase to 25%, then 100%
- Full rollout typically takes 24-48 hours

### Google Play Optimization

**Icon & Screenshots:**
- Feature Graphic: 1024x500 PNG
- Icon: 512x512 PNG
- Screenshots: 1080x1920 or 1080x1440
- Video Preview: 30-60 seconds gameplay

**Description:**
Same as iOS, can reuse with minor formatting changes.

**Content Rating:**
- Violence: Yes (stylized)
- Blood: No
- Matures: No

## Monitoring & Operations

### Application Monitoring

**Error Tracking:**
```bash
npm install @sentry/node
# In server.ts:
import * as Sentry from "@sentry/node";
Sentry.init({ dsn: process.env.SENTRY_DSN });
```

**Performance Monitoring:**
- API response times
- Database query times
- Firebase latency
- Error rates

**Uptime Monitoring:**
- Status page: [StatusPage.io](https://statuspage.io)
- Check /health endpoint every 5 minutes
- Alert on failures

### Database Maintenance

**Backups:**
```bash
# Daily backups
pg_dump -U $DB_USER $DB_NAME > backup-$(date +%Y-%m-%d).sql

# Or automated (Heroku):
heroku backups:schedule --at "02:00 UTC"
```

**Cleanup:**
```sql
-- Archive old matches (>6 months)
DELETE FROM matches WHERE created_at < NOW() - INTERVAL '6 months';

-- Optimize tables
VACUUM ANALYZE;
```

### Scaling

**Vertical Scaling:**
- Increase server RAM/CPU
- Upgrade database tier
- Increase rate limits

**Horizontal Scaling:**
- Multiple API instances behind load balancer
- Database read replicas
- Redis cache layer
- Firebase handles realtime scaling

### Cost Optimization

**Estimate Monthly Costs:**
| Service | Usage | Cost |
|---------|-------|------|
| Heroku Dyno | 1x Standard | $25 |
| PostgreSQL | Standard-0 | $50 |
| Firebase | ~10K MAU | $25 |
| Bandwidth | ~10GB | $10 |
| CDN (optional) | $10-50 |
| **Total** | | **$120-180** |

**Optimize:**
- Cache leaderboards (reduce DB queries)
- Use CDN for static assets
- Archive old match data
- Monitor for runaway costs

## Troubleshooting Production

### API Down
1. Check Heroku/Railway logs
2. Verify database connection
3. Check Firebase credentials
4. Restart service

### High Latency
1. Check database query times
2. Verify Firebase latency
3. Check network connection
4. Scale up if needed

### Authentication Issues
1. Verify Firebase tokens
2. Check token expiration
3. Verify credentials in .env
4. Check user exists in database

### Database Issues
1. Check connection pool exhaustion
2. Monitor active connections
3. Optimize slow queries
4. Consider read replicas

## Updates & Patches

### Rolling Updates
1. Deploy new API version
2. Monitor for errors
3. Keep old version running during transition
4. Rollback if critical issues

### Mobile App Updates
- Push updates via app store
- Forced update if critical
- Optional update for features
- Usually 24-48 hours for approval

### Database Migrations
```bash
# Test migration locally
npm run db:migrate

# Deploy to production
heroku run npm run db:migrate

# Monitor for issues
heroku logs --tail
```

## Security Hardening

### HTTPS/TLS
- All traffic encrypted
- Valid SSL certificate
- TLS 1.2+
- Force HTTPS redirect

### API Security
- Rate limiting enabled
- CORS configured correctly
- Input validation
- SQL injection prevention
- CSRF protection (if using cookies)

### Database Security
- Strong passwords
- Encrypted backups
- Restricted access
- Firewall rules

### Secrets Management
- No secrets in code
- Use environment variables
- Rotate keys regularly
- Monitor access logs

---

**Deployment successful! 🚀**

Monitor metrics and enjoy your live game!
