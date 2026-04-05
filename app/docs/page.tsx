import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { CopyCommand } from '@/components/CopyCommand'

const GRADE_SCALE = [
  { grade: 'S', range: '90–100', color: 'text-violet-400 border-violet-500/30 bg-violet-500/10', desc: 'Exemplary' },
  { grade: 'A', range: '80–89',  color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10', desc: 'Solid' },
  { grade: 'B', range: '70–79',  color: 'text-blue-400 border-blue-500/30 bg-blue-500/10', desc: 'Adequate' },
  { grade: 'C', range: '50–69',  color: 'text-amber-400 border-amber-500/30 bg-amber-500/10', desc: 'Weak' },
  { grade: 'D', range: '0–49',   color: 'text-red-400 border-red-500/30 bg-red-500/10', desc: 'Poor' },
]

const DIMENSIONS = [
  {
    name: 'Structure',
    color: 'text-violet-400',
    border: 'border-violet-500/20',
    bg: 'bg-violet-500/5',
    deterministic: [
      { check: 'TypeScript present', points: 10 },
      { check: 'Test files found', points: 10 },
      { check: 'Largest file under 300 lines', points: 10 },
      { check: 'Build script in package.json', points: 10 },
      { check: 'Lint script in package.json', points: 10 },
    ],
    subjective: [
      'Naming clarity across files and functions',
      'Single-purpose functions and components',
      'Separation of concerns and folder structure',
      'No obvious duplication or god files',
      'Organised imports and consistent conventions',
    ],
  },
  {
    name: 'Safety',
    color: 'text-emerald-400',
    border: 'border-emerald-500/20',
    bg: 'bg-emerald-500/5',
    deterministic: [
      { check: '.gitignore present', points: 10 },
      { check: '.env listed in .gitignore', points: 10 },
      { check: 'No .env files committed', points: 10 },
      { check: 'No potential secrets detected', points: 10 },
      { check: 'No eval() usage', points: 10 },
    ],
    subjective: [
      'Error handling on async calls and API routes',
      'Input validation at system boundaries',
      'No hardcoded URLs or credentials',
      'Auth checks on protected routes',
      'No obviously risky patterns (SQL injection surface, etc.)',
    ],
  },
  {
    name: 'Completeness',
    color: 'text-blue-400',
    border: 'border-blue-500/20',
    bg: 'bg-blue-500/5',
    deterministic: [
      { check: 'README over 10 lines', points: 10 },
      { check: 'Lock file committed', points: 10 },
      { check: 'No mixed lock files', points: 10 },
      { check: 'Fewer than 5 console.log calls', points: 10 },
      { check: 'Fewer than 5 TODO/FIXME comments', points: 10 },
    ],
    subjective: [
      'Loading and error states handled',
      'Empty states handled gracefully',
      'No leftover boilerplate or placeholder copy',
      'README explains what the project does and how to run it',
      'Feels like an intentional project, not an abandoned scaffold',
    ],
  },
]

export default function Docs() {
  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      {/* Background gradient */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        aria-hidden="true"
        style={{
          background: 'radial-gradient(ellipse 70% 40% at 50% 0%, rgba(124,58,237,0.10) 0%, transparent 65%)',
        }}
      />

      <Navbar />

      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pb-24">

        {/* ── Hero ────────────────────────────────────────────────── */}
        <section className="pt-16 pb-12 border-b border-zinc-800">
          <p className="text-xs text-zinc-500 mb-3" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>documentation</p>
          <h1 className="text-4xl font-light tracking-tight text-zinc-100 mb-3">
            How graidr works
          </h1>
          <p className="text-zinc-400 text-base max-w-xl leading-relaxed">
            Graidr scores your repository across three dimensions on every push — no API keys, no configuration, free forever.
          </p>
        </section>

        {/* ── Getting started ─────────────────────────────────────── */}
        <section className="py-12 border-b border-zinc-800 space-y-6">
          <h2 className="text-xl font-medium text-zinc-100">Getting started</h2>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Run this inside any git repository. Graidr installs a GitHub Actions workflow that scores your code on every push.
          </p>
          <CopyCommand command="npx graidr init" />
          <p className="text-zinc-500 text-xs leading-relaxed" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>
            This writes two files to <span className="text-zinc-400">.github/workflows/</span>: the workflow definition and a self-contained scorer. No secrets required — graidr uses your repository&apos;s built-in <span className="text-zinc-400">GITHUB_TOKEN</span> and GitHub Models.
          </p>

          <div className="mt-4 space-y-3">
            {[
              { step: '1', title: 'Run npx graidr init', desc: 'Installs the workflow into your repo. Commit and push the two new files.' },
              { step: '2', title: 'Push any branch', desc: 'The GitHub Action runs automatically. No manual trigger needed.' },
              { step: '3', title: 'See your score', desc: 'A comment appears on your PR. Your repo appears on the leaderboard.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex gap-4 p-4 rounded-lg border border-zinc-800 bg-zinc-900/30">
                <span
                  className="text-xs text-violet-400 w-5 h-5 rounded-full border border-violet-500/30 bg-violet-500/10 flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ fontFamily: 'var(--font-jetbrains-mono)' }}
                >
                  {step}
                </span>
                <div>
                  <p className="text-sm text-zinc-200 font-medium">{title}</p>
                  <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Scoring system ──────────────────────────────────────── */}
        <section className="py-12 border-b border-zinc-800 space-y-6">
          <div>
            <h2 className="text-xl font-medium text-zinc-100">Scoring system</h2>
            <p className="text-zinc-400 text-sm mt-2 leading-relaxed max-w-xl">
              Each dimension is scored 0–100 in two phases. The overall score is the average of all three dimensions.
            </p>
          </div>

          {/* Two phases */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border border-zinc-800 bg-zinc-900/30 space-y-2">
              <p className="text-xs text-zinc-400 font-medium" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>Phase 1 — Deterministic</p>
              <p className="text-xs text-zinc-500 leading-relaxed">
                15 binary checks run via shell against your git tree. Each check is worth 10 points (max 50 per dimension). Results are objective and reproducible — no AI involved.
              </p>
            </div>
            <div className="p-4 rounded-lg border border-zinc-800 bg-zinc-900/30 space-y-2">
              <p className="text-xs text-zinc-400 font-medium" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>Phase 2 — Subjective</p>
              <p className="text-xs text-zinc-500 leading-relaxed">
                GPT-4o reviews a smart sample of your files and scores 5 subjective criteria per dimension (0–10 each, max 50). Only judges what it can actually see.
              </p>
            </div>
          </div>
        </section>

        {/* ── Dimensions ──────────────────────────────────────────── */}
        <section className="py-12 border-b border-zinc-800 space-y-8">
          <h2 className="text-xl font-medium text-zinc-100">Dimensions</h2>

          {DIMENSIONS.map((dim) => (
            <div key={dim.name} className={`rounded-lg border ${dim.border} ${dim.bg} p-5 space-y-5`}>
              <h3 className={`text-base font-medium ${dim.color}`}>{dim.name}</h3>

              <div className="grid sm:grid-cols-2 gap-5">
                {/* Deterministic */}
                <div className="space-y-2">
                  <p className="text-xs text-zinc-500 uppercase tracking-wider" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>
                    Deterministic · 50 pts
                  </p>
                  <ul className="space-y-1.5">
                    {dim.deterministic.map(({ check, points }) => (
                      <li key={check} className="flex items-center justify-between text-xs">
                        <span className="text-zinc-400">{check}</span>
                        <span className="text-zinc-600 ml-4" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>+{points}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Subjective */}
                <div className="space-y-2">
                  <p className="text-xs text-zinc-500 uppercase tracking-wider" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>
                    Subjective · 50 pts
                  </p>
                  <ul className="space-y-1.5">
                    {dim.subjective.map((criterion) => (
                      <li key={criterion} className="text-xs text-zinc-400 flex gap-2">
                        <span className="text-zinc-700 flex-shrink-0">–</span>
                        {criterion}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* ── Grade scale ─────────────────────────────────────────── */}
        <section className="py-12 border-b border-zinc-800 space-y-6">
          <h2 className="text-xl font-medium text-zinc-100">Grade scale</h2>
          <div className="grid grid-cols-5 gap-2">
            {GRADE_SCALE.map(({ grade, range, color, desc }) => (
              <div key={grade} className={`rounded-lg border ${color} p-3 text-center space-y-1`}>
                <p className={`text-2xl font-bold ${color.split(' ')[0]}`} style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>{grade}</p>
                <p className="text-xs text-zinc-500">{range}</p>
                <p className="text-xs text-zinc-600">{desc}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-zinc-600 leading-relaxed">
            Grades are fixed thresholds, not relative rankings. An A genuinely means solid code — not &ldquo;better than most repos on the leaderboard.&rdquo;
          </p>
        </section>

        {/* ── Deep scan ───────────────────────────────────────────── */}
        <section className="py-12 border-b border-zinc-800 space-y-4">
          <h2 className="text-xl font-medium text-zinc-100">Deep scan</h2>
          <p className="text-zinc-400 text-sm leading-relaxed max-w-xl">
            By default graidr samples up to 8 files (60 lines each). A deep scan increases this to 12 files and 80 lines, giving GPT-4o more context for a more thorough assessment.
          </p>
          <div className="space-y-3">
            <div className="p-4 rounded-lg border border-zinc-800 bg-zinc-900/30">
              <p className="text-xs text-zinc-400 mb-1" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>Trigger via commit message</p>
              <p className="text-xs text-zinc-500 font-mono">git commit -m &quot;your message [grade:deep]&quot;</p>
            </div>
            <div className="p-4 rounded-lg border border-zinc-800 bg-zinc-900/30">
              <p className="text-xs text-zinc-400 mb-1" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>Trigger via environment variable</p>
              <p className="text-xs text-zinc-500 font-mono">DEEP_SCAN=true</p>
            </div>
          </div>
          <p className="text-xs text-zinc-600">Deep scans are tagged as <span className="text-zinc-500 font-mono">gpt-4o-deep</span> in the leaderboard.</p>
        </section>

        {/* ── PR comments ─────────────────────────────────────────── */}
        <section className="py-12 border-b border-zinc-800 space-y-4">
          <h2 className="text-xl font-medium text-zinc-100">PR comments</h2>
          <p className="text-zinc-400 text-sm leading-relaxed max-w-xl">
            On every pull request, graidr posts a comment with your scores, specific issues to fix, and what&apos;s already working well.
          </p>
          <div
            className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-5 text-xs space-y-3"
            style={{ fontFamily: 'var(--font-jetbrains-mono)', color: '#a1a1aa' }}
          >
            <p className="text-zinc-300 font-medium text-sm">Graidr score — 72/100 · Grade B</p>
            <div className="border-t border-zinc-800 pt-3 space-y-1">
              <p>| Dimension    | Score |</p>
              <p>|--------------|------:|</p>
              <p>| Structure    |    65 |</p>
              <p>| Safety       |    80 |</p>
              <p>| Completeness |    70 |</p>
            </div>
            <div className="border-t border-zinc-800 pt-3 space-y-1">
              <p className="text-zinc-400">Top issues</p>
              <p>– app/page.tsx is 640 lines — split into components</p>
              <p>– 3 fetch() calls with no try/catch</p>
              <p>– TODO comments left in lib/api.ts</p>
            </div>
            <div className="border-t border-zinc-800 pt-3 space-y-1">
              <p className="text-zinc-400">Doing well</p>
              <p>– TypeScript used consistently</p>
              <p>– .env correctly gitignored</p>
            </div>
          </div>
        </section>

        {/* ── FAQ ─────────────────────────────────────────────────── */}
        <section className="py-12 space-y-4">
          <h2 className="text-xl font-medium text-zinc-100">FAQ</h2>
          <div className="space-y-3">
            {[
              {
                q: 'Will graidr fail my pipeline?',
                a: 'No. The scorer always exits with code 0. A low score will never block a merge.',
              },
              {
                q: 'Does it cost anything?',
                a: 'No. Graidr uses your GITHUB_TOKEN to access GitHub Models (GPT-4o). This is free for all GitHub users and requires no separate API key.',
              },
              {
                q: 'What languages does it support?',
                a: 'The deterministic checks target TypeScript/JavaScript projects (package.json, .ts/.tsx files). The subjective phase can evaluate any source code GPT-4o can read.',
              },
              {
                q: 'Is my code sent anywhere?',
                a: 'A sample of your files is sent to GitHub Models (Microsoft Azure) for scoring — the same infrastructure that powers GitHub Copilot. Only scores and metadata are stored in the graidr database.',
              },
              {
                q: 'Can I game the score?',
                a: 'The deterministic phase is fully verifiable — it checks what is actually committed. The subjective phase is based on sampled file content. Scores reflect real code quality.',
              },
            ].map(({ q, a }) => (
              <div key={q} className="p-4 rounded-lg border border-zinc-800 bg-zinc-900/30 space-y-1">
                <p className="text-sm text-zinc-200 font-medium">{q}</p>
                <p className="text-xs text-zinc-500 leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ─────────────────────────────────────────────────── */}
        <div className="border-t border-zinc-800 pt-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Link
            href="/leaderboard"
            className="text-xs border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white rounded px-4 py-2 transition-colors"
            style={{ fontFamily: 'var(--font-jetbrains-mono)' }}
          >
            View leaderboard →
          </Link>
          <Link
            href="/"
            className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
            style={{ fontFamily: 'var(--font-jetbrains-mono)' }}
          >
            ← Back to home
          </Link>
        </div>

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
