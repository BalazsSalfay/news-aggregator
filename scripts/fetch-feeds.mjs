import pkg from 'pg'
import Parser from 'rss-parser'

const { Pool } = pkg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
})

const START_DATE = new Date('2026-03-10T00:00:00Z')

const AI_FEEDS = [
  {
    url: 'https://hnrss.org/newest?q=ChatGPT+OR+GPT+OR+LLM+OR+%22artificial+intelligence%22+OR+%22machine+learning%22+OR+Claude+OR+Gemini+OR+%22AI%22&count=50',
    name: 'Hacker News',
  },
  {
    url: 'https://techcrunch.com/category/artificial-intelligence/feed/',
    name: 'TechCrunch',
  },
  {
    url: 'https://venturebeat.com/category/ai/feed/',
    name: 'VentureBeat',
  },
  {
    url: 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml',
    name: 'The Verge',
  },
  {
    url: 'https://feeds.feedburner.com/AITopIO',
    name: 'AI Top I/O',
  },
]

const PAAS_FEEDS = [
  {
    url: 'https://hnrss.org/newest?q=PaaS+OR+Heroku+OR+Vercel+OR+Netlify+OR+Railway+OR+Render+OR+%22platform+as+a+service%22+OR+%22cloud+native%22+OR+Kubernetes+OR+%22cloud+platform%22&count=50',
    name: 'Hacker News',
  },
  {
    url: 'https://techcrunch.com/category/cloud/feed/',
    name: 'TechCrunch',
  },
  {
    url: 'https://thenewstack.io/feed/',
    name: 'The New Stack',
  },
  {
    url: 'https://feeds.feedburner.com/infoq/cloud',
    name: 'InfoQ Cloud',
  },
]

function stripHtml(html) {
  if (!html) return ''
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function truncate(text, maxLength = 280) {
  if (!text || text.length <= maxLength) return text
  return text.slice(0, maxLength).replace(/\s+\S*$/, '') + '...'
}

async function initDb() {
  await pool.query(`
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
  console.log('✓ Database ready')
}

async function fetchFeed(feed, category) {
  const parser = new Parser({
    timeout: 15000,
    headers: { 'User-Agent': 'TechNewsHub/1.0 RSS Reader' },
    customFields: { item: ['media:content', 'content:encoded'] },
  })

  try {
    console.log(`  Fetching [${category}] ${feed.name}...`)
    const feedData = await parser.parseURL(feed.url)

    let inserted = 0
    for (const item of feedData.items) {
      const pubDate = item.pubDate
        ? new Date(item.pubDate)
        : item.isoDate
        ? new Date(item.isoDate)
        : new Date()

      if (pubDate < START_DATE) continue

      const title = item.title?.trim()
      const url = item.link?.trim()
      if (!title || !url) continue

      const rawDesc = item.contentSnippet || item.content || item['content:encoded'] || item.summary || ''
      const description = truncate(stripHtml(rawDesc))

      try {
        const result = await pool.query(
          `INSERT INTO articles (category, title, url, description, source_name, published_at)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (url) DO NOTHING
           RETURNING id`,
          [category, title, url, description || null, feed.name, pubDate.toISOString()]
        )
        if (result.rowCount > 0) inserted++
      } catch (err) {
        console.error(`    ✗ Insert error for "${title}": ${err.message}`)
      }
    }

    console.log(`    → ${inserted} new article(s) from ${feed.name}`)
    return inserted
  } catch (err) {
    console.error(`  ✗ Failed to fetch ${feed.name}: ${err.message}`)
    return 0
  }
}

async function main() {
  console.log(`\n=== Feed fetch started at ${new Date().toISOString()} ===\n`)

  await initDb()

  console.log('\n[AI Feeds]')
  let total = 0
  for (const feed of AI_FEEDS) {
    total += await fetchFeed(feed, 'ai')
  }

  console.log('\n[PaaS Feeds]')
  for (const feed of PAAS_FEEDS) {
    total += await fetchFeed(feed, 'paas')
  }

  console.log(`\n=== Done. Total new articles: ${total} ===\n`)
  await pool.end()
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
