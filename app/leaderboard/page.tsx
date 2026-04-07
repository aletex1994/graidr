import { supabase, type Score } from '@/lib/supabase'
import LeaderboardTable from '@/components/LeaderboardTable'
import Navbar from '@/components/Navbar'
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
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      {/* Background radial gradient */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(234,88,12,0.12) 0%, transparent 70%)',
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

      <Navbar />

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

          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight" style={{ fontFamily: 'var(--font-ibm-plex-mono)' }}>
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
                background: 'linear-gradient(135deg, #fb923c 0%, #ea580c 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Leaderboard
            </span>
          </h1>

          <p className="text-white/50 max-w-xl text-sm leading-relaxed">
            Every push to <span className="text-white/70">main</span> triggers an automated score across <span className="text-white/70">Code, Security, and UX</span> — no API keys, no configuration, just your existing <code className="text-orange-400/80 text-xs">GITHUB_TOKEN</code>. The repos below earned their rank one commit at a time.
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
          <Link href="/" className="hover:text-white/40 transition-colors" style={{ fontFamily: 'var(--font-ibm-plex-sans)' }}>graidr</Link>
          <div className="flex items-center gap-4" style={{ fontFamily: 'var(--font-ibm-plex-sans)' }}>
            <Link href="/leaderboard" className="hover:text-white/40 transition-colors">Leaderboard</Link>
            <Link href="/docs" className="hover:text-white/40 transition-colors">Docs</Link>
            <a href="https://github.com/aletex1994/graidr" target="_blank" rel="noopener noreferrer" className="hover:text-white/40 transition-colors">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
