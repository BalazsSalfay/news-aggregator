import { getArticlesByCategory } from '@/lib/articles'
import NewsPageContent from '@/components/NewsPageContent'

export const dynamic = 'force-dynamic'

interface Props {
  searchParams: { page?: string }
}

export default async function PaaSNewsPage({ searchParams }: Props) {
  const page = Math.max(1, parseInt(searchParams.page || '1', 10))
  const result = await getArticlesByCategory('paas', page)

  return (
    <NewsPageContent
      category="paas"
      title="PaaS News"
      dayGroups={result.dayGroups}
      currentPage={result.currentPage}
      totalPages={result.totalPages}
      totalDays={result.totalDays}
      accentColor="purple"
    />
  )
}
