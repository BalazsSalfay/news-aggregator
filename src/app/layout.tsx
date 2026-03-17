import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Tech News Radar',
  description: 'Daily AI and PaaS news aggregator',
  icons: { icon: '/favicon.svg' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-gray-50 dark:bg-gray-950`}>
        <header className="bg-gray-900 text-white shadow-lg sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="text-xl font-bold tracking-tight hover:text-blue-400 transition-colors">
              🛰️ Tech News Radar
            </Link>
            <div className="flex items-center gap-4">
              <nav className="flex gap-6">
                <Link href="/ai" className="text-gray-300 hover:text-white transition-colors font-medium">
                  AI News
                </Link>
                <Link href="/paas" className="text-gray-300 hover:text-white transition-colors font-medium">
                  PaaS News
                </Link>
              </nav>
              <ThemeToggle />
            </div>
          </div>
        </header>
        <main className="min-h-screen">
          {children}
        </main>
        <footer className="bg-gray-900 text-gray-400 text-center py-5 text-sm">
          <p>Updated daily at 8:00 AM UTC</p>
          <p className="mt-1 text-gray-600 text-xs">
            Sources: Hacker News · TechCrunch · VentureBeat · The Verge · The New Stack
          </p>
        </footer>
      </body>
    </html>
  )
}
