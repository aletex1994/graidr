import { supabase, type Score } from '@/lib/supabase'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { Logo } from '@/components/Logo'
import { CopyCommand } from '@/components/CopyCommand'

async function getTopRepos(): Promise<Score[]> {
  const { data, error } = await supabase
    .from('leaderboard')
    .select('*')
    .order('rank', { ascending: true })
    .limit(5)

  if (error || !data) return []
  return data
}

const GRADE_SCALE = [
  { grade: 'S', range: '90–100', color: 'text-orange-400 border-orange-500/30 bg-orange-500/10' },
  { grade: 'A', range: '80–89',  color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' },
  { grade: 'B', range: '70–79',  color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10' },
  { grade: 'C', range: '50–69',  color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' },
  { grade: 'D', range: '0–49',   color: 'text-red-400 border-red-500/30 bg-red-500/10' },
]

function scoreColor(n: number) {
  if (n >= 90) return 'text-orange-400'
  if (n >= 80) return 'text-emerald-400'
  if (n >= 70) return 'text-cyan-400'
  if (n >= 50) return 'text-amber-400'
  return 'text-red-400'
}

function gradeLabel(n: number) {
  if (n >= 90) return 'S'
  if (n >= 80) return 'A'
  if (n >= 70) return 'B'
  if (n >= 50) return 'C'
  return 'D'
}

export default async function Home() {
  const topRepos = await getTopRepos()

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      {/* Background gradient */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        aria-hidden="true"
        style={{
          background: 'radial-gradient(ellipse 70% 40% at 50% 0%, rgba(234,88,12,0.12) 0%, transparent 65%)',
        }}
      />

      <Navbar />

      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6">

        {/* ── Hero ────────────────────────────────────────────────── */}
        <section className="pt-20 pb-16 flex flex-col gap-3">
          {/* Pronunciation */}
          <p className="text-xs text-zinc-500" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>
            <span className="text-zinc-400">/ɡreɪ·dər/</span>
            <span className="text-zinc-600"> · verb — to grade automatically</span>
          </p>

          {/* Headline */}
          <h1 className="text-5xl md:text-6xl font-light tracking-tight leading-[1.08] mt-1" style={{ fontFamily: 'var(--font-ibm-plex-mono)' }}>
            <span className="text-zinc-300">Does your vibe code</span>
            <br />
            <span
              className="font-semibold"
              style={{
                background: 'linear-gradient(90deg, #ffffff 0%, #fb923c 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              actually hold up?
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-base text-zinc-400 max-w-lg leading-snug">
            Automatic code quality scores on every push — no API keys, zero setup, <span className="text-emerald-200">free forever</span>.
          </p>

          {/* Install command */}
          <CopyCommand command="npx graidr init" />

          {/* CTAs */}
          <div className="flex items-center gap-3 mt-1">
            <Link
              href="/leaderboard"
              className="inline-flex items-center gap-1.5 rounded px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
            >
              View leaderboard →
            </Link>
          </div>

          {/* Trust line */}
          <p className="text-xs text-zinc-600 mt-1" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>
            zero config &nbsp;·&nbsp; github models &nbsp;·&nbsp; free forever
          </p>
        </section>

        {/* ── How it works ─────────────────────────────────────────── */}
        <section className="pb-16">
          <p className="text-xs text-zinc-500 mb-3" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>
            how it works
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                step: '01',
                title: 'Run npx graidr init',
                body: 'One command adds the workflow file to your repo. No config, no API keys.',
              },
              {
                step: '02',
                title: 'Push your code',
                body: 'Every push triggers a score. Graidr analyzes your repo and posts a score card to your PR.',
              },
              {
                step: '03',
                title: 'Climb the leaderboard',
                body: 'Scores are public. Improve your code, improve your rank.',
              },
            ].map(({ step, title, body }) => (
              <div key={step} className="border border-zinc-800 rounded-lg p-4 space-y-1.5">
                <p className="text-xs text-zinc-600" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>
                  {step}
                </p>
                <p className="text-sm font-medium text-white">{title}</p>
                <p className="text-sm text-zinc-500 leading-snug">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Grade scale ──────────────────────────────────────────── */}
        <section className="pb-16">
          <p className="text-xs text-zinc-500 mb-3" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>
            the grading scale
          </p>
          <div className="flex items-start gap-2">
            {GRADE_SCALE.map(({ grade, range, color }) => (
              <div key={grade} className="flex flex-col items-center gap-1">
                <span
                  className={`text-sm font-bold px-3 py-1 rounded border ${color}`}
                  style={{ fontFamily: 'var(--font-jetbrains-mono)' }}
                >
                  {grade}
                </span>
                <span className="text-xs text-zinc-600" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>
                  {range}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Leaderboard preview ───────────────────────────────────── */}
        <section className="pb-16">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-zinc-500" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>
              top repos
            </p>
            <Link
              href="/leaderboard"
              className="text-xs text-zinc-500 hover:text-white transition-colors"
              style={{ fontFamily: 'var(--font-jetbrains-mono)' }}
            >
              see all →
            </Link>
          </div>

          <div className="border border-zinc-800 rounded-lg overflow-hidden">
            {topRepos.length > 0 ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left px-4 py-2.5 text-xs text-zinc-600 font-normal w-8" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>#</th>
                    <th className="text-left px-4 py-2.5 text-xs text-zinc-600 font-normal">repo</th>
                    <th className="text-right px-4 py-2.5 text-xs text-zinc-600 font-normal hidden sm:table-cell">struct</th>
                    <th className="text-right px-4 py-2.5 text-xs text-zinc-600 font-normal hidden sm:table-cell">safety</th>
                    <th className="text-right px-4 py-2.5 text-xs text-zinc-600 font-normal hidden sm:table-cell">complete</th>
                    <th className="text-right px-4 py-2.5 text-xs text-zinc-600 font-normal">overall</th>
                    <th className="text-right px-4 py-2.5 text-xs text-zinc-600 font-normal">grade</th>
                  </tr>
                </thead>
                <tbody>
                  {topRepos.map((repo, i) => (
                    <tr key={repo.github_url} className="border-b border-zinc-800/60 last:border-0 hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-2.5 text-xs text-zinc-600 tabular-nums" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>
                        {String(i + 1).padStart(2, '0')}
                      </td>
                      <td className="px-4 py-2.5">
                        <a
                          href={repo.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-zinc-300 hover:text-white transition-colors"
                          style={{ fontFamily: 'var(--font-jetbrains-mono)' }}
                        >
                          {repo.owner}/{repo.name}
                        </a>
                      </td>
                      <td className={`px-4 py-2.5 text-xs text-right tabular-nums hidden sm:table-cell ${scoreColor(repo.structure_score)}`} style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>
                        {repo.structure_score}
                      </td>
                      <td className={`px-4 py-2.5 text-xs text-right tabular-nums hidden sm:table-cell ${scoreColor(repo.safety_score)}`} style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>
                        {repo.safety_score}
                      </td>
                      <td className={`px-4 py-2.5 text-xs text-right tabular-nums hidden sm:table-cell ${scoreColor(repo.completeness_score)}`} style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>
                        {repo.completeness_score}
                      </td>
                      <td className={`px-4 py-2.5 text-xs text-right tabular-nums font-bold ${scoreColor(repo.overall)}`} style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>
                        {repo.overall}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <span
                          className={`text-xs font-bold ${scoreColor(repo.overall)}`}
                          style={{ fontFamily: 'var(--font-jetbrains-mono)' }}
                        >
                          {gradeLabel(repo.overall)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="px-4 py-8 text-center">
                <p className="text-xs text-zinc-600" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>
                  no scores yet — be the first
                </p>
              </div>
            )}
          </div>
        </section>


      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-zinc-800 max-w-4xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between py-4 text-xs text-zinc-600" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>
          <span>GRAIDR</span>
          <div className="flex items-center gap-4">
            <Link href="/leaderboard" className="hover:text-zinc-400 transition-colors">Leaderboard</Link>
            <Link href="/docs" className="hover:text-zinc-400 transition-colors">Docs</Link>
            <a href="https://github.com/aletex1994/graidr" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-400 transition-colors">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
