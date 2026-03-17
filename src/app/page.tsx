import Link from 'next/link'

export default function Home() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-20">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
          Tech News Radar
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-xl">
          Daily curated news from the world of AI and cloud platforms
        </p>
        <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
          Updated every day at 8:00 AM UTC · Starting from March 10, 2026
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto items-stretch">
        <Link href="/ai" className="group flex">
          <div className="flex flex-col w-full bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-10 hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-700 transition-all duration-200">
            <div className="text-6xl mb-5">🤖</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              AI News
            </h2>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed flex-1">
              Latest news on artificial intelligence, LLMs, GPT, Claude, Gemini, and the companies shaping the AI landscape.
            </p>
            <div className="mt-8 inline-flex items-center text-blue-600 dark:text-blue-400 font-semibold group-hover:underline">
              Browse AI news <span className="ml-2">→</span>
            </div>
          </div>
        </Link>

        <Link href="/paas" className="group flex">
          <div className="flex flex-col w-full bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-10 hover:shadow-lg hover:border-purple-200 dark:hover:border-purple-700 transition-all duration-200">
            <div className="text-6xl mb-5">☁️</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
              PaaS News
            </h2>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed flex-1">
              Updates from Heroku, Vercel, Netlify, Railway, Render, Kubernetes, and the cloud infrastructure powering modern software.
            </p>
            <div className="mt-8 inline-flex items-center text-purple-600 dark:text-purple-400 font-semibold group-hover:underline">
              Browse PaaS news <span className="ml-2">→</span>
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}
