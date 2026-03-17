import { query } from './db'

export interface Article {
  id: number
  category: string
  title: string
  url: string
  description: string | null
  source_name: string | null
  published_at: string
}

export interface DayGroup {
  date: string
  articles: Article[]
}

export interface ArticlesResult {
  dayGroups: DayGroup[]
  totalDays: number
  currentPage: number
  totalPages: number
}

const DAYS_PER_PAGE = 7
const START_DATE = '2026-03-10'

export async function getArticlesByCategory(
  category: 'ai' | 'paas',
  page: number = 1
): Promise<ArticlesResult> {
  try {
    const datesResult = await query(
      `SELECT DISTINCT DATE(published_at AT TIME ZONE 'UTC') as day
       FROM articles
       WHERE category = $1 AND published_at >= $2
       ORDER BY day DESC`,
      [category, START_DATE]
    )

    const dates: string[] = datesResult.rows.map((r) => {
      const d = r.day as Date
      return d.toISOString().split('T')[0]
    })

    const totalDays = dates.length
    const totalPages = Math.max(1, Math.ceil(totalDays / DAYS_PER_PAGE))
    const currentPage = Math.min(Math.max(1, page), totalPages)
    const pageDates = dates.slice(
      (currentPage - 1) * DAYS_PER_PAGE,
      currentPage * DAYS_PER_PAGE
    )

    if (pageDates.length === 0) {
      return { dayGroups: [], totalDays: 0, currentPage: 1, totalPages: 1 }
    }

    const articlesResult = await query(
      `SELECT id, category, title, url, description, source_name, published_at
       FROM articles
       WHERE category = $1
         AND DATE(published_at AT TIME ZONE 'UTC') = ANY($2::date[])
       ORDER BY published_at DESC`,
      [category, pageDates]
    )

    const grouped = new Map<string, Article[]>()
    for (const date of pageDates) {
      grouped.set(date, [])
    }
    for (const row of articlesResult.rows as Article[]) {
      const dateKey = new Date(row.published_at).toISOString().split('T')[0]
      if (grouped.has(dateKey)) {
        grouped.get(dateKey)!.push(row)
      }
    }

    const dayGroups: DayGroup[] = pageDates.map((date) => ({
      date,
      articles: grouped.get(date) || [],
    }))

    return { dayGroups, totalDays, currentPage, totalPages }
  } catch (error) {
    console.error('Error fetching articles:', error)
    return { dayGroups: [], totalDays: 0, currentPage: 1, totalPages: 1 }
  }
}
