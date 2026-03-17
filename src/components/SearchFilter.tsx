'use client'

import { useState, useMemo } from 'react'
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
    <div className="py-4 border-b border-gray-100 dark:border-gray-700 last:border-0">
      <div className="flex-1 min-w-0">
        {article.source_name && (
          <span className="inline-block text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full mb-1.5">
            {article.source_name}
          </span>
        )}
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block font-semibold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors leading-snug mb-1"
        >
          {article.title}
        </a>
        {article.description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            {article.description}
          </p>
        )}
      </div>
    </div>
  )
}

const accent = {
  blue: {
    btn: 'bg-blue-600 hover:bg-blue-700 text-white',
    badge: 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400',
    ring: 'focus:ring-blue-500',
  },
  purple: {
    btn: 'bg-purple-600 hover:bg-purple-700 text-white',
    badge: 'bg-purple-50 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400',
    ring: 'focus:ring-purple-500',
  },
}

interface Props {
  category: 'ai' | 'paas'
  dayGroups: DayGroup[]
  currentPage: number
  totalPages: number
  accentColor: 'blue' | 'purple'
}

export default function SearchFilter({ category, dayGroups, currentPage, totalPages, accentColor }: Props) {
  const [query, setQuery] = useState('')
  const cls = accent[accentColor]

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return dayGroups
    return dayGroups
      .map((group) => ({
        ...group,
        articles: group.articles.filter(
          (a) =>
            a.title.toLowerCase().includes(q) ||
            a.description?.toLowerCase().includes(q) ||
            a.source_name?.toLowerCase().includes(q)
        ),
      }))
      .filter((group) => group.articles.length > 0)
  }, [dayGroups, query])

  const isSearching = query.trim().length > 0
  const totalMatches = filtered.reduce((sum, g) => sum + g.articles.length, 0)

  return (
    <>
      {/* Search bar */}
      <div className="relative mb-8">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="search"
          placeholder="Search articles by title, description or source…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={`w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-sm focus:outline-none focus:ring-2 ${cls.ring} transition-colors`}
        />
        {isSearching && (
          <div className="absolute inset-y-0 right-3 flex items-center">
            <span className="text-xs text-gray-400">{totalMatches} result{totalMatches !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* Articles */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">🔍</div>
          <p className="font-medium">No articles match &ldquo;{query}&rdquo;</p>
          <p className="text-sm mt-1">Try a different keyword</p>
        </div>
      ) : (
        <>
          {filtered.map(
            (group) =>
              group.articles.length > 0 && (
                <div key={group.date} className="mb-10">
                  <div className="flex items-center gap-3 mb-4">
                    <h2 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                      {formatDate(group.date)}
                    </h2>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cls.badge}`}>
                      {group.articles.length}
                    </span>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 px-6">
                    {group.articles.map((article) => (
                      <ArticleCard key={article.id} article={article} />
                    ))}
                  </div>
                </div>
              )
          )}

          {/* Pagination — hidden while searching */}
          {!isSearching && totalPages > 1 && (
            <div className="flex items-center justify-between mt-10 pt-6 border-t border-gray-200 dark:border-gray-700">
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
    </>
  )
}
