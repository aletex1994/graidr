import { supabase, type Score } from '@/lib/supabase'
import LeaderboardTable from '@/components/LeaderboardTable'
import Link from 'next/link'

// Opt out of the Next.js full-route cache so newly submitted scores appear
// immediately. Without this, the page is statically rendered at build time
// and serves stale HTML until the next deploy — meaning scores submitted via
// the GitHub Action land in Supabase successfully but never show up on the
// leaderboard until graidr.tools is redeployed.
//
// Use `revalidate = 60` instead if you want up-to-60s caching as traffic
// grows; `force-dynamic` is the safest default for a live leaderboard.
export const dynamic = 'force-dynamic'

async function getLeaderboard(): Promise<Score[]> {
  const { data, error } = await supabase
    .from('leaderboard')
    .select('*')
    .order('rank', { ascending: true })

  if (error || !data) return []

  return data
}

export default async function Leaderboard() {
  const scores = await getLeaderboard()

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      {/* Background radial gradient */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(124,58,237,0.12) 0%, transparent 70%)',
        }}
      />

      {/* Subtle dot grid */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.025]"
        aria-hidden="true"
        style={{
          backgroundImage:
            'radial-gradient(circle, #ffffff 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* Header */}
      <header className="relative z-50 border-b border-white/[0.06] bg-[#09090b] sticky top-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-white font-bold tracking-tight text-base font-[family-name:var(--font-inter)] hover:text-white/80 transition-colors">
              graidr
            </Link>
            <nav className="flex items-center gap-1">
              <Link href="/" className="text-white/40 hover:text-white/80 text-sm px-2 py-1 rounded transition-colors">Home</Link>
              <Link href="/leaderboard" className="text-white/80 text-sm px-2 py-1 rounded transition-colors">Leaderboard</Link>
              <Link href="/docs" className="text-white/40 hover:text-white/80 text-sm px-2 py-1 rounded transition-colors">Docs</Link>
            </nav>
          </div>
          <a
            href="https://github.com/aletex1994/graidr"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/40 hover:text-white/80 transition-colors"
            aria-label="GitHub"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z" />
            </svg>
          </a>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-14 space-y-10">
        {/* Hero */}
        <div className="space-y-4 pb-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400 ring-1 ring-inset ring-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live
            </span>
            <span className="text-white/20 text-xs">Updated continuously</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight">
            <span
              style={{
                background: 'linear-gradient(135deg, #ffffff 30%, rgba(255,255,255,0.45) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Repository
            </span>{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Leaderboard
            </span>
          </h1>

          <p className="text-white/40 max-w-lg text-sm leading-relaxed">
            Open-source projects scored across structure, safety, and completeness.
            Rankings update automatically as projects ship.
          </p>
        </div>

        {/* Stats row */}
        <div className="flex gap-6 pb-2">
          {[
            { label: 'Repos scored', value: scores.length.toString() },
            { label: 'Dimensions', value: '3' },
            { label: 'Top score', value: scores[0]?.overall.toString() ?? '—' },
          ].map(({ label, value }) => (
            <div key={label} className="space-y-0.5">
              <p
                className="text-2xl font-bold tabular-nums"
                style={{
                  fontFamily: 'var(--font-jetbrains-mono)',
                  background: 'linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.6) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {value}
              </p>
              <p className="text-xs text-white/30">{label}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        {scores.length > 0 ? (
          <LeaderboardTable scores={scores} />
        ) : (
          <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] px-8 py-16 text-center">
            <p className="text-white/30 text-sm" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>
              No scores yet. Add the graidr GitHub Action to your repo to get started.
            </p>
          </div>
        )}
      </main>

      <footer className="relative z-10 border-t border-white/[0.06] mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-12 flex items-center justify-between text-xs text-white/20">
          <Link href="/" className="hover:text-white/40 transition-colors" style={{ fontFamily: 'var(--font-inter)' }}>graidr</Link>
          <div className="flex items-center gap-4" style={{ fontFamily: 'var(--font-inter)' }}>
            <Link href="/leaderboard" className="hover:text-white/40 transition-colors">Leaderboard</Link>
            <Link href="/docs" className="hover:text-white/40 transition-colors">Docs</Link>
            <a href="https://github.com/aletex1994/graidr" target="_blank" rel="noopener noreferrer" className="hover:text-white/40 transition-colors">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
