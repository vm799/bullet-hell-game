/**
 * Game Engine
 * Handles physics, collision detection, and game logic
 */

import { GameState, Player, Bullet, GameConfig, InputState } from '../types';

export const DEFAULT_CONFIG: GameConfig = {
  arenaWidth: 800,
  arenaHeight: 600,
  playerSpeed: 250, // pixels per second
  bulletSpeed: 400, // pixels per second
  playerRadius: 15,
  bulletRadius: 3,
  playerMaxHp: 100,
  bulletDamage: 10,
  matchDuration: 300, // 5 minutes
  syncRate: 30, // 30 updates per second
};

/**
 * Calculate distance between two points
 */
function distance(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Check circle collision
 */
function checkCircleCollision(
  x1: number,
  y1: number,
  r1: number,
  x2: number,
  y2: number,
  r2: number
): boolean {
  return distance(x1, y1, x2, y2) < r1 + r2;
}

/**
 * Clamp value between min and max
 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Normalize angle to 0-2PI
 */
function normalizeAngle(angle: number): number {
  while (angle < 0) angle += Math.PI * 2;
  while (angle >= Math.PI * 2) angle -= Math.PI * 2;
  return angle;
}

export class GameEngine {
  private config: GameConfig;
  private lastUpdateTime: number = 0;

  constructor(config: Partial<GameConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Update game state
   */
  updateGameState(
    gameState: GameState,
    p1Input: InputState,
    p2Input: InputState,
    deltaTime: number
  ): GameState {
    // Cap delta time to prevent large jumps
    const dt = Math.min(deltaTime / 1000, 0.033); // Max 33ms

    const updatedState = { ...gameState };

    // Update player positions and rotations
    updatedState.players.p1 = this.updatePlayer(
      updatedState.players.p1,
      p1Input,
      dt
    );
    updatedState.players.p2 = this.updatePlayer(
      updatedState.players.p2,
      p2Input,
      dt
    );

    // Update bullets
    updatedState.bullets = this.updateBullets(updatedState.bullets, dt);

    // Check collisions
    const { bulletsToRemove, damageMap } = this.checkCollisions(
      updatedState.players,
      updatedState.bullets
    );

    // Apply damage
    for (const [playerId, damage] of Object.entries(damageMap)) {
      if (playerId === 'p1') {
        updatedState.players.p1.hp = Math.max(
          0,
          updatedState.players.p1.hp - (damage as number)
        );
      } else {
        updatedState.players.p2.hp = Math.max(
          0,
          updatedState.players.p2.hp - (damage as number)
        );
      }
    }

    // Remove hit bullets
    updatedState.bullets = updatedState.bullets.filter(
      (b) => !bulletsToRemove.has(b.id)
    );

    // Check win condition
    if (updatedState.gameState === 'playing') {
      if (updatedState.players.p1.hp <= 0) {
        updatedState.gameState = 'ended';
        updatedState.winner = 'p2';
      } else if (updatedState.players.p2.hp <= 0) {
        updatedState.gameState = 'ended';
        updatedState.winner = 'p1';
      }
    }

    // Update timestamp
    updatedState.updatedAt = Date.now();

    return updatedState;
  }

  /**
   * Update individual player
   */
  private updatePlayer(player: Player, input: InputState, dt: number): Player {
    const updated = { ...player };

    // Calculate velocity from input
    let vx = 0;
    let vy = 0;

    if (input.moveUp) vy -= this.config.playerSpeed;
    if (input.moveDown) vy += this.config.playerSpeed;
    if (input.moveLeft) vx -= this.config.playerSpeed;
    if (input.moveRight) vx += this.config.playerSpeed;

    // Normalize diagonal movement
    const speed = Math.sqrt(vx * vx + vy * vy);
    if (speed > this.config.playerSpeed) {
      vx = (vx / speed) * this.config.playerSpeed;
      vy = (vy / speed) * this.config.playerSpeed;
    }

    updated.vx = vx;
    updated.vy = vy;

    // Update position
    updated.x += vx * dt;
    updated.y += vy * dt;

    // Clamp to arena
    updated.x = clamp(
      updated.x,
      this.config.playerRadius,
      this.config.arenaWidth - this.config.playerRadius
    );
    updated.y = clamp(
      updated.y,
      this.config.playerRadius,
      this.config.arenaHeight - this.config.playerRadius
    );

    // Update angle to face direction
    if (input.angle !== undefined) {
      updated.angle = normalizeAngle(input.angle);
    }

    return updated;
  }

  /**
   * Update all bullets
   */
  private updateBullets(bullets: Bullet[], dt: number): Bullet[] {
    return bullets
      .map((bullet) => {
        const updated = { ...bullet };
        updated.x += bullet.vx * dt;
        updated.y += bullet.vy * dt;
        return updated;
      })
      .filter((bullet) => {
        // Remove bullets that are off screen or too old
        const isOffScreen =
          bullet.x < -50 ||
          bullet.x > this.config.arenaWidth + 50 ||
          bullet.y < -50 ||
          bullet.y > this.config.arenaHeight + 50;

        const isTooOld = Date.now() - bullet.createdAt > 10000; // 10 seconds

        return !isOffScreen && !isTooOld;
      });
  }

  /**
   * Check all collisions
   */
  private checkCollisions(
    players: GameState['players'],
    bullets: Bullet[]
  ): {
    bulletsToRemove: Set<string>;
    damageMap: Record<string, number>;
  } {
    const bulletsToRemove = new Set<string>();
    const damageMap: Record<string, number> = { p1: 0, p2: 0 };

    for (const bullet of bullets) {
      // Check collision with p1
      if (
        bullet.owner !== 'p1' &&
        checkCircleCollision(
          bullet.x,
          bullet.y,
          this.config.bulletRadius,
          players.p1.x,
          players.p1.y,
          this.config.playerRadius
        )
      ) {
        bulletsToRemove.add(bullet.id);
        damageMap.p1 += bullet.damage;
        players.p1.score += 1;
        continue;
      }

      // Check collision with p2
      if (
        bullet.owner !== 'p2' &&
        checkCircleCollision(
          bullet.x,
          bullet.y,
          this.config.bulletRadius,
          players.p2.x,
          players.p2.y,
          this.config.playerRadius
        )
      ) {
        bulletsToRemove.add(bullet.id);
        damageMap.p2 += bullet.damage;
        players.p2.score += 1;
        continue;
      }
    }

    return { bulletsToRemove, damageMap };
  }

  /**
   * Create a bullet from player position
   */
  createBullet(
    player: Player,
    bulletId: string
  ): Bullet {
    const bulletSpeed = this.config.bulletSpeed;
    return {
      id: bulletId,
      x: player.x + Math.cos(player.angle) * this.config.playerRadius,
      y: player.y + Math.sin(player.angle) * this.config.playerRadius,
      vx: Math.cos(player.angle) * bulletSpeed,
      vy: Math.sin(player.angle) * bulletSpeed,
      owner: player.id.includes('p1') ? 'p1' : 'p2',
      createdAt: Date.now(),
      damage: this.config.bulletDamage,
    };
  }

  /**
   * Get game config
   */
  getConfig(): GameConfig {
    return { ...this.config };
  }

  /**
   * Set game config
   */
  setConfig(config: Partial<GameConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

// Singleton instance
export const gameEngine = new GameEngine();
