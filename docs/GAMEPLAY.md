# Gameplay Guide

## Game Rules

### Arena
- **Size**: 800x600 pixels (top-down view)
- **Theme**: Space arena with grid background
- **Boundaries**: Solid walls at edges
- **Player Start**: P1 at left (200, 300), P2 at right (600, 300)

### Player Ship
- **HP**: 100 (displayed as health bar)
- **Speed**: 250 pixels/second
- **Size**: 15 pixel radius hitbox
- **Rotation**: Continuous to face aim direction
- **Visuals**: Can be customized with skins

### Bullets
- **Speed**: 400 pixels/second
- **Damage**: 10 HP per hit
- **Size**: 3 pixel radius
- **Lifetime**: 10 seconds or until off-screen
- **Rate**: Limited by cooldown (100ms between shots)

### Match Duration
- **Time Limit**: 3-5 minutes (300 seconds)
- **Win Condition**: First player to 0 HP loses
- **If Tied**: Player with more kills wins
- **Rewards**: Given immediately after match end

## How to Play

### Controls

| Action | Keyboard | Touch | Gamepad |
|--------|----------|-------|---------|
| Move Up | W / ↑ | Left Joystick Up | D-Pad Up |
| Move Down | S / ↓ | Left Joystick Down | D-Pad Down |
| Move Left | A / ← | Left Joystick Left | D-Pad Left |
| Move Right | D / → | Left Joystick Right | D-Pad Right |
| Aim | Mouse | Touch | Right Stick |
| Shoot | Space / Click | Hold Button | Trigger |
| Menu | ESC | Button | Start |

### Basic Strategy

1. **Movement**
   - Continuously move to avoid incoming fire
   - Stay away from walls
   - Use arena terrain for positioning

2. **Aiming**
   - Aim where opponent will be (lead your shots)
   - Adjust for bullet travel time
   - Practice timing at different ranges

3. **Spacing**
   - Keep medium distance from opponent
   - Too close = more bullets to dodge
   - Too far = harder to hit
   - ~300-400 pixels is optimal range

4. **Evasion**
   - Move perpendicular to incoming fire
   - Zigzag to avoid patterns
   - Use the entire arena
   - Never stay in one place

5. **Aggression**
   - Balance offense and defense
   - Aggressive players take more damage
   - Defensive players miss more shots
   - Mix it up to stay unpredictable

## Game Modes

### Online PvP
- **Players**: 1v1
- **Matchmaking**: Rated by ELO
- **Duration**: 3-5 minutes
- **Rewards**: Coins, ELO points, match history
- **Leaderboards**: Global and weekly

### Practice/Offline
- **Players**: You vs AI
- **Difficulty**: Easy to Hard
- **Duration**: Unlimited (practice mode)
- **Rewards**: None (training only)
- **AI Behavior**: Follows player, shoots randomly
- **Purpose**: Learn mechanics without pressure

## Cosmetics System

### Available Cosmetics

#### Ship Skins (5 options)
| Skin | Cost | Effect |
|------|------|--------|
| Default | Free | Classic blue ship |
| Neon | 500 coins | Glowing outline |
| Crystal | 500 coins | Transparent crystalline |
| Fire | 500 coins | Flaming aura |
| Void | 500 coins | Dark void energy |

#### Weapons (3 options)
| Weapon | Cost | Effect |
|--------|------|--------|
| Standard | Free | Blue bullets |
| Plasma | 500 coins | Red/orange glow |
| Ice | 500 coins | Blue/cyan trails |

#### Trails (3 options)
| Trail | Cost | Effect |
|-------|------|--------|
| None | Free | No trail |
| Neon | 500 coins | Glowing rainbow |
| Flame | 500 coins | Fire particles |

### How to Equip
1. Go to Shop
2. View cosmetic details
3. Click "Equip" if owned
4. Only one cosmetic per type can be equipped
5. Changes apply to next match

## Progression System

### ELO Rating
- **Starting**: 1000 ELO
- **K-Factor**: 32 points per match
- **Formula**: 
  - Win: ELO += K × (1 - Expected Win Rate)
  - Loss: ELO -= K × (Expected Win Rate)

### Examples
```
Your Rating: 1000, Opponent: 1000
  Win:  +16 ELO
  Loss: -16 ELO

Your Rating: 1200, Opponent: 1000
  Win:  +8 ELO (expected)
  Loss: -24 ELO (upset)

Your Rating: 800, Opponent: 1000
  Win:  +24 ELO (upset!)
  Loss: -8 ELO (expected)
```

### Coins Economy
- **Win**: +100 coins
- **Loss**: +10 coins
- **Bonuses**: Up to +50 coins for performance
  - Most hits: +20 coins
  - Longest survival: +15 coins
  - Highest accuracy: +15 coins

### Cosmetics Prices
- **Individual items**: 500 coins each
- **Bundles**: 1000 coins for 3 items
- **Permanent**: Buy once, keep forever

## Matchmaking

### Rating-Based Pairing
- **Range**: ±200 ELO points
- **Priority**: Closest rating match found
- **Timeout**: 30 seconds in queue
- **Search Depth**: Expands range over time

### Queue Estimation
- **Instant**: Typical (1-10 sec)
- **Quick**: Peak hours (10-30 sec)
- **Wait**: Off-peak (30-60 sec)
- **Timeout**: Returns to menu after 60 sec

### Anti-Smurf
- Placement matches (10 required)
- New accounts start at 800 ELO
- Rapid ranking up triggers soft reset

## Statistics Tracked

### Personal Stats
- Wins / Losses
- Win Rate (%)
- Current ELO Rating
- Total Coins Earned
- Playtime (hours)
- Favorite Cosmetic

### Match Stats
- Duration
- Your Score
- Opponent Score
- Damage Dealt
- Damage Taken
- Accuracy (%)
- Survival Time
- Kills / Deaths

### Leaderboards
- **Global**: Top 100 by ELO
- **Weekly**: Resets Monday
- **Regional**: Based on timezone (future)
- **Seasonal**: Monthly rankings (future)

## Tips & Tricks

### Advanced Techniques
1. **Bullet Dodging**
   - Wait until bullet is 50px away to dodge
   - Move perpendicular to bullet path
   - Practice the timing

2. **Predictive Shooting**
   - Lead shots by ~80-100 pixels
   - Adjust based on opponent speed
   - Watch for patterns

3. **Positioning**
   - Control center of arena
   - Use arena geometry
   - Avoid corners
   - Stay mobile

4. **Psychological Play**
   - Be unpredictable
   - Vary speed and direction
   - Fake intentions
   - Adapt to opponent style

### Common Mistakes
- ❌ Staying still
- ❌ Shooting randomly
- ❌ Going to corners
- ❌ Getting frustrated and rushing
- ❌ Ignoring opponent patterns

### Skill Progression
1. **Beginner** (800-1000 ELO)
   - Learn controls
   - Basic movement
   - Understand mechanics

2. **Intermediate** (1000-1400 ELO)
   - Improve accuracy
   - Better dodging
   - Game awareness

3. **Advanced** (1400-1700 ELO)
   - Predict opponent
   - Control space
   - Adapt strategies

4. **Expert** (1700+ ELO)
   - Mastery of all mechanics
   - Psychological play
   - Optimal decision-making

## Achievements (Future)

- 🏆 First Win
- 💥 50 Consecutive Hits
- ⚡ Flawless Victory (Win with 100 HP)
- 🎯 Sharpshooter (100 matches, 50% accuracy)
- 👑 Ranked Champion (1700+ ELO)

## Bugs & Exploits

Report exploits immediately:
- Email: support@bullethell.game
- GitHub Issues: [Open Issue](https://github.com)
- Discord: [Join Server](https://discord.gg)

## Competitive Play

### Tournament Guidelines
- Best of 3 matches (first to 2 wins)
- Same map, no power-ups
- No cosmetics affecting hitbox
- Live spectating allowed
- 15 min timeout between matches

---

**Good luck on the leaderboards! 🚀**

Feedback? Join our community and let us know!
