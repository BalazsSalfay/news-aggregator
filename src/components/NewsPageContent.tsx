import Link from 'next/link'
import type { DayGroup } from '@/lib/articles'

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00Z')
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

function ArticleCard({ article }: { article: DayGroup['articles'][0] }) {
  return (
    <div className="py-4 border-b border-gray-100 last:border-0">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          {article.source_name && (
            <span className="inline-block text-xs font-medium bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full mb-1.5">
              {article.source_name}
            </span>
          )}
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block font-semibold text-gray-900 hover:text-blue-600 transition-colors leading-snug mb-1"
          >
            {article.title}
          </a>
          {article.description && (
            <p className="text-sm text-gray-500 leading-relaxed">
              {article.description}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

interface Props {
  category: 'ai' | 'paas'
  title: string
  dayGroups: DayGroup[]
  currentPage: number
  totalPages: number
  totalDays: number
  accentColor: 'blue' | 'purple'
}

const accent = {
  blue: {
    btn: 'bg-blue-600 hover:bg-blue-700 text-white',
    badge: 'bg-blue-50 text-blue-600',
  },
  purple: {
    btn: 'bg-purple-600 hover:bg-purple-700 text-white',
    badge: 'bg-purple-50 text-purple-600',
  },
}

export default function NewsPageContent({
  category,
  title,
  dayGroups,
  currentPage,
  totalPages,
  totalDays,
  accentColor,
}: Props) {
  const cls = accent[accentColor]

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-8">
        <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 transition-colors mb-4 inline-block">
          ← Back to home
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        <p className="text-gray-400 text-sm mt-1">
          {totalDays > 0
            ? `${totalDays} days of news · Page ${currentPage} of ${totalPages}`
            : 'No articles yet — check back after 8:00 AM UTC'}
        </p>
      </div>

      {dayGroups.length === 0 || dayGroups.every((g) => g.articles.length === 0) ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-6xl mb-4">📰</div>
          <p className="text-lg font-medium">No articles yet</p>
          <p className="text-sm mt-2">Check back after the daily update at 8:00 AM UTC</p>
        </div>
      ) : (
        <>
          {dayGroups.map(
            (group) =>
              group.articles.length > 0 && (
                <div key={group.date} className="mb-10">
                  <div className="flex items-center gap-3 mb-4">
                    <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                      {formatDate(group.date)}
                    </h2>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cls.badge}`}>
                      {group.articles.length}
                    </span>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-6">
                    {group.articles.map((article) => (
                      <ArticleCard key={article.id} article={article} />
                    ))}
                  </div>
                </div>
              )
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-10 pt-6 border-t border-gray-200">
              {currentPage > 1 ? (
                <Link
                  href={`/${category}?page=${currentPage - 1}`}
                  className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${cls.btn}`}
                >
                  ← Newer
                </Link>
              ) : (
                <div />
              )}

              <span className="text-sm text-gray-400">
                Page {currentPage} of {totalPages}
              </span>

              {currentPage < totalPages ? (
                <Link
                  href={`/${category}?page=${currentPage + 1}`}
                  className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${cls.btn}`}
                >
                  Older →
                </Link>
              ) : (
                <div />
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
