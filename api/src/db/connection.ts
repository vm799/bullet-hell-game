/**
 * PostgreSQL Database Connection
 */

import { Pool, PoolClient } from 'pg';

let pool: Pool | null = null;

/**
 * Initialize database connection pool
 */
export async function initializeDatabase(): Promise<void> {
  if (pool) {
    console.log('Database pool already initialized');
    return;
  }

  try {
    pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'bullet_hell',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    // Test connection
    const client = await pool.connect();
    console.log('Database connected successfully');
    client.release();

    // Run migrations
    await runMigrations();
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
}

/**
 * Get database pool
 */
export function getPool(): Pool {
  if (!pool) {
    throw new Error('Database not initialized');
  }
  return pool;
}

/**
 * Execute query
 */
export async function query(
  text: string,
  params?: any[]
): Promise<any> {
  const result = await getPool().query(text, params);
  return result;
}

/**
 * Run database migrations
 */
async function runMigrations(): Promise<void> {
  try {
    const client = await getPool().connect();

    // Check if migrations table exists
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'migrations'
      )
    `);

    if (!tableExists.rows[0].exists) {
      // Create migrations table
      await client.query(`
        CREATE TABLE migrations (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL UNIQUE,
          executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('Created migrations table');
    }

    // Run initial schema migration
    const schemaMigrationExists = await client.query(`
      SELECT EXISTS (
        SELECT 1 FROM migrations WHERE name = '001_initial_schema'
      )
    `);

    if (!schemaMigrationExists.rows[0].exists) {
      console.log('Running initial schema migration...');
      await runInitialSchemaMigration(client);
      await client.query(`
        INSERT INTO migrations (name) VALUES ('001_initial_schema')
      `);
      console.log('Initial schema migration completed');
    }

    client.release();
  } catch (error) {
    console.error('Migration error:', error);
    throw error;
  }
}

/**
 * Run initial schema migration
 */
async function runInitialSchemaMigration(client: PoolClient): Promise<void> {
  // Users table
  await client.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      firebase_id VARCHAR(255) NOT NULL UNIQUE,
      username VARCHAR(255) NOT NULL UNIQUE,
      email VARCHAR(255) NOT NULL,
      rating INT DEFAULT 1000,
      wins INT DEFAULT 0,
      losses INT DEFAULT 0,
      coins INT DEFAULT 0,
      avatar_url VARCHAR(500),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Matches table
  await client.query(`
    CREATE TABLE IF NOT EXISTS matches (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      player1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      player2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      winner_id UUID REFERENCES users(id) ON DELETE SET NULL,
      duration_seconds INT,
      player1_score INT DEFAULT 0,
      player2_score INT DEFAULT 0,
      match_data JSONB,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Cosmetics table
  await client.query(`
    CREATE TABLE IF NOT EXISTS cosmetics (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      type VARCHAR(50) NOT NULL CHECK (type IN ('skin', 'weapon', 'trail')),
      name VARCHAR(255) NOT NULL,
      description TEXT,
      cost_coins INT NOT NULL,
      image_url VARCHAR(500),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // User cosmetics table
  await client.query(`
    CREATE TABLE IF NOT EXISTS user_cosmetics (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      cosmetic_id UUID NOT NULL REFERENCES cosmetics(id) ON DELETE CASCADE,
      is_equipped BOOLEAN DEFAULT FALSE,
      purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, cosmetic_id)
    )
  `);

  // Indexes for performance
  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_users_firebase_id ON users(firebase_id);
    CREATE INDEX IF NOT EXISTS idx_matches_created_at ON matches(created_at);
    CREATE INDEX IF NOT EXISTS idx_matches_player1_id ON matches(player1_id);
    CREATE INDEX IF NOT EXISTS idx_matches_player2_id ON matches(player2_id);
    CREATE INDEX IF NOT EXISTS idx_user_cosmetics_user_id ON user_cosmetics(user_id);
  `);

  // Insert default cosmetics
  await client.query(`
    INSERT INTO cosmetics (id, type, name, description, cost_coins, image_url)
    VALUES
      (gen_random_uuid(), 'skin', 'Default', 'Classic blue spaceship', 0, null),
      (gen_random_uuid(), 'skin', 'Neon', 'Glowing neon skin', 500, null),
      (gen_random_uuid(), 'skin', 'Crystal', 'Crystalline appearance', 500, null),
      (gen_random_uuid(), 'skin', 'Fire', 'Burning hot aesthetic', 500, null),
      (gen_random_uuid(), 'skin', 'Void', 'Dark void energy', 500, null),
      (gen_random_uuid(), 'weapon', 'Standard', 'Standard bullets', 0, null),
      (gen_random_uuid(), 'weapon', 'Plasma', 'Plasma charge bullets', 500, null),
      (gen_random_uuid(), 'weapon', 'Ice', 'Frozen ice projectiles', 500, null),
      (gen_random_uuid(), 'trail', 'None', 'No trail effect', 0, null),
      (gen_random_uuid(), 'trail', 'Neon', 'Glowing trail', 500, null),
      (gen_random_uuid(), 'trail', 'Flame', 'Flame trail effect', 500, null)
    ON CONFLICT DO NOTHING
  `);
}

/**
 * Disconnect from database
 */
export async function disconnectDatabase(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('Database disconnected');
  }
}
