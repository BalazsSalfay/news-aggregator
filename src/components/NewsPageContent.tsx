import Link from 'next/link'
import type { DayGroup } from '@/lib/articles'
import SearchFilter from './SearchFilter'

interface Props {
  category: 'ai' | 'paas'
  title: string
  dayGroups: DayGroup[]
  currentPage: number
  totalPages: number
  totalDays: number
  accentColor: 'blue' | 'purple'
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
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-8">
        <Link
          href="/"
          className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors mb-4 inline-block"
        >
          ← Back to home
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h1>
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
        <SearchFilter
          category={category}
          dayGroups={dayGroups}
          currentPage={currentPage}
          totalPages={totalPages}
          accentColor={accentColor}
        />
      )}
    </div>
  )
}
