import pkg from 'pg'
import Parser from 'rss-parser'

const { Pool } = pkg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
})

const START_DATE = new Date('2026-03-10T00:00:00Z')

// AI Coding Agents — focused on agentic coding tools, IDE AI, code assistants
const AI_FEEDS = [
  {
    // HN: tightly focused on AI coding agents and tools
    url: 'https://hnrss.org/newest?q=cursor+OR+copilot+OR+%22code+agent%22+OR+%22coding+agent%22+OR+devin+OR+aider+OR+%22claude+code%22+OR+windsurf+OR+codeium+OR+%22AI+coding%22+OR+%22agentic+coding%22+OR+%22code+completion%22+OR+%22AI+developer%22+OR+%22AI+engineer%22&count=50',
    name: 'Hacker News',
  },
  {
    // GitHub Blog — official source for Copilot, AI features, developer tools
    url: 'https://github.blog/feed/',
    name: 'GitHub Blog',
  },
  {
    // Simon Willison — the best independent voice on LLMs and AI coding tools, cross-posts X threads
    url: 'https://simonwillison.net/atom/everything/',
    name: 'Simon Willison',
  },
  {
    // The Verge AI — covers Copilot, Cursor, Claude, coding tools launches
    url: 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml',
    name: 'The Verge',
  },
  {
    // VentureBeat AI — startup and product launches in AI dev tools
    url: 'https://venturebeat.com/category/ai/feed/',
    name: 'VentureBeat',
  },
  {
    // dev.to AI Agents tag — practitioner posts, tutorials, tool comparisons
    url: 'https://dev.to/feed/tag/aiagents',
    name: 'dev.to',
  },
  {
    // Bluesky: Simon Willison — posts X-first AI coding news here too
    url: 'https://bsky.app/profile/simonwillison.net/rss',
    name: 'Bluesky / Simon Willison',
  },
]

// PaaS / Platform Engineering — deployment platforms, cloud infrastructure, developer experience
const PAAS_FEEDS = [
  {
    // HN: PaaS-focused, explicitly excludes broad AI terms
    url: 'https://hnrss.org/newest?q=railway+OR+%22fly.io%22+OR+heroku+OR+render+OR+%22cloud+run%22+OR+%22platform+engineering%22+OR+%22app+platform%22+OR+%22serverless%22+OR+%22developer+platform%22+OR+%22twelve-factor%22+OR+%22PaaS%22+OR+%22Coolify%22+OR+%22Dokku%22+OR+%22Kamal%22&count=50',
    name: 'Hacker News',
  },
  {
    // The New Stack — cloud native, Kubernetes, platform engineering
    url: 'https://thenewstack.io/feed/',
    name: 'The New Stack',
  },
  {
    // DevOps.com — deployment pipelines, CI/CD, platform ops
    url: 'https://devops.com/feed/',
    name: 'DevOps.com',
  },
  {
    // Kubernetes official blog
    url: 'https://kubernetes.io/feed.xml',
    name: 'Kubernetes Blog',
  },
  {
    // Fly.io Blog — opinionated PaaS engineering posts
    url: 'https://fly.io/blog/feed.xml',
    name: 'Fly.io Blog',
  },
  {
    // TechCrunch Cloud — funding rounds, product launches in cloud/PaaS
    url: 'https://techcrunch.com/category/cloud/feed/',
    name: 'TechCrunch',
  },
  {
    // InfoQ DevOps — in-depth articles on deployment, containers, platform eng
    url: 'https://feed.infoq.com/devops/',
    name: 'InfoQ DevOps',
  },
  {
    // Bluesky: Kelsey Hightower — Kubernetes/cloud legend, posts PaaS takes
    url: 'https://bsky.app/profile/kelseyhightower.com/rss',
    name: 'Bluesky / Kelsey Hightower',
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
