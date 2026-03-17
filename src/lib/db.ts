import { Pool } from 'pg'

let pool: Pool | null = null

function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
      max: 10,
    })
  }
  return pool
}

export async function query(text: string, params?: unknown[]) {
  return getPool().query(text, params)
}

export async function initDb() {
  await query(`
    CREATE TABLE IF NOT EXISTS articles (
      id SERIAL PRIMARY KEY,
      category VARCHAR(10) NOT NULL,
      title TEXT NOT NULL,
      url TEXT NOT NULL,
      description TEXT,
      source_name VARCHAR(100),
      published_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(url)
    );
    CREATE INDEX IF NOT EXISTS idx_articles_cat_pub
      ON articles(category, published_at DESC);
  `)
}
