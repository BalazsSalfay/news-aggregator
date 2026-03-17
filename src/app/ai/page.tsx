import { getArticlesByCategory } from '@/lib/articles'
import NewsPageContent from '@/components/NewsPageContent'

export const dynamic = 'force-dynamic'

interface Props {
  searchParams: { page?: string }
}

export default async function AINewsPage({ searchParams }: Props) {
  const page = Math.max(1, parseInt(searchParams.page || '1', 10))
  const result = await getArticlesByCategory('ai', page)

  return (
    <NewsPageContent
      category="ai"
      title="AI News"
      dayGroups={result.dayGroups}
      currentPage={result.currentPage}
      totalPages={result.totalPages}
      totalDays={result.totalDays}
      accentColor="blue"
    />
  )
}
