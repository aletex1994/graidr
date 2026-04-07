'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Logo } from '@/components/Logo'

export default function Navbar() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800/50 bg-[#0f0f0f]/80 backdrop-blur">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-11 flex items-center justify-between">
        {/* Left: logo */}
        <Link href="/" className="flex items-center" aria-label="Graidr home">
          <Logo size="sm" />
        </Link>

        {/* Center: nav */}
        <nav className="absolute left-1/2 -translate-x-1/2 flex items-center gap-6">
          <Link
            href="/"
            className={`text-sm transition-colors ${
              isActive('/')
                ? 'text-white'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Home
          </Link>
          <Link
            href="/leaderboard"
            className={`text-sm transition-colors ${
              isActive('/leaderboard')
                ? 'text-white'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Leaderboard
          </Link>
          <Link
            href="/docs"
            className={`text-sm transition-colors ${
              isActive('/docs')
                ? 'text-white'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Docs
          </Link>
        </nav>

        {/* Right: CTA */}
        <Link
          href="/docs"
          className="text-xs border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white rounded px-3 py-1 transition-colors"
          style={{ fontFamily: 'var(--font-jetbrains-mono)' }}
        >
          Add to repo
        </Link>
      </div>
    </header>
  )
}
