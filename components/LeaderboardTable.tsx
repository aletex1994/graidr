'use client'

import { useState } from 'react'
import type { Score } from '@/lib/supabase'
import GradeBadge from './GradeBadge'

type SortKey = 'structure_score' | 'safety_score' | 'completeness_score' | 'overall'
type SortDir = 'desc' | 'asc'

function RankCell({ rank }: { rank: number }) {
  if (rank === 1)
    return <span className="font-bold text-amber-400" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>01</span>
  if (rank === 2)
    return <span className="font-bold text-zinc-300" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>02</span>
  if (rank === 3)
    return <span className="font-bold text-amber-700" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>03</span>
  return (
    <span className="text-white/20" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>
      {String(rank).padStart(2, '0')}
    </span>
  )
}

function ScoreCell({ value }: { value: number }) {
  const color =
    value >= 90 ? 'text-violet-300'
    : value >= 80 ? 'text-emerald-300'
    : value >= 70 ? 'text-blue-300'
    : value >= 50 ? 'text-amber-300'
    : 'text-red-300'
  return (
    <span className={`tabular-nums ${color}`} style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>
      {value}
    </span>
  )
}

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  return (
    <span className={`inline-flex flex-col gap-px ml-1 ${active ? 'opacity-100' : 'opacity-25'}`}>
      <svg
        width="7" height="5" viewBox="0 0 7 5" fill="none"
        className={active && dir === 'asc' ? 'text-white' : 'text-white/40'}
      >
        <path d="M3.5 0L7 5H0L3.5 0Z" fill="currentColor" />
      </svg>
      <svg
        width="7" height="5" viewBox="0 0 7 5" fill="none"
        className={active && dir === 'desc' ? 'text-white' : 'text-white/40'}
      >
        <path d="M3.5 5L0 0H7L3.5 5Z" fill="currentColor" />
      </svg>
    </span>
  )
}

export default function LeaderboardTable({ scores }: { scores: Score[] }) {
  const [sortKey, setSortKey] = useState<SortKey>('overall')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(d => d === 'desc' ? 'asc' : 'desc')
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const sorted = [...scores].sort((a, b) =>
    sortDir === 'desc' ? b[sortKey] - a[sortKey] : a[sortKey] - b[sortKey]
  )

  function SortTh({
    label, colKey, className,
  }: {
    label: string
    colKey: SortKey
    className?: string
  }) {
    const active = sortKey === colKey
    return (
      <th
        className={`px-5 py-3 text-right text-[11px] font-medium uppercase tracking-widest cursor-pointer select-none transition-colors ${
          active ? 'text-white/70' : 'text-white/30 hover:text-white/50'
        } ${className ?? ''}`}
        onClick={() => handleSort(colKey)}
      >
        <span className="inline-flex items-center justify-end gap-0.5">
          {label}
          <SortIcon active={active} dir={sortDir} />
        </span>
      </th>
    )
  }

  return (
    <div className="rounded-xl border border-white/[0.07] overflow-hidden shadow-2xl shadow-black/40">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/[0.07] bg-white/[0.02]">
            <th className="px-5 py-3 text-left text-[11px] font-medium text-white/30 uppercase tracking-widest w-14">
              #
            </th>
            <th className="px-5 py-3 text-left text-[11px] font-medium text-white/30 uppercase tracking-widest">
              Repository
            </th>
            <SortTh label="Structure" colKey="structure_score" className="hidden sm:table-cell" />
            <SortTh label="Safety" colKey="safety_score" className="hidden md:table-cell" />
            <SortTh label="Completeness" colKey="completeness_score" className="hidden sm:table-cell" />
            <SortTh label="Overall" colKey="overall" />
            <th className="px-5 py-3 text-right text-[11px] font-medium text-white/30 uppercase tracking-widest hidden lg:table-cell">
              Scored
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((score, i) => (
            <tr
              key={`${score.owner}/${score.name}`}
              className={`border-b border-white/[0.04] last:border-0 transition-colors hover:bg-white/[0.03] ${
                i === 0 ? 'bg-white/[0.015]' : 'bg-transparent'
              }`}
            >
              <td className="px-5 py-4">
                <RankCell rank={score.rank} />
              </td>
              <td className="px-5 py-4">
                <a
                  href={score.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3"
                >
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-white/30 text-xs" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>
                      {score.owner}
                    </span>
                    <span className="text-white/20 text-xs">/</span>
                    <span className="text-white font-medium group-hover:text-violet-300 transition-colors">
                      {score.name}
                    </span>
{score.category && score.category !== 'other' && (
                      <span
                        className="text-[10px] font-semibold px-1 py-px rounded bg-orange-500/10 text-orange-400 ring-1 ring-inset ring-orange-500/20 leading-none cursor-default"
                        style={{ fontFamily: 'var(--font-jetbrains-mono)' }}
                        title={`Category: ${score.category}`}
                      >
                        {score.category.toUpperCase()}
                      </span>
                    )}
{score.rated_with === 'gpt-4o' && (
                      <span
                        className="text-[10px] font-semibold px-1 py-px rounded bg-zinc-500/10 text-zinc-400 ring-1 ring-inset ring-zinc-500/20 leading-none cursor-default"
                        style={{ fontFamily: 'var(--font-jetbrains-mono)' }}
                        title="Scored with gpt-4o via GitHub Models"
                      >
                        STANDARD
                      </span>
                    )}
                    {score.rated_with === 'gpt-4o-deep' && (
                      <span
                        className="text-[10px] font-semibold px-1 py-px rounded bg-blue-500/10 text-blue-400 ring-1 ring-inset ring-blue-500/20 leading-none cursor-default"
                        style={{ fontFamily: 'var(--font-jetbrains-mono)' }}
                        title="Scored with gpt-4o deep scan via GitHub Models"
                      >
                        DEEP
                      </span>
                    )}
                  </div>
                </a>
              </td>
              <td className="px-5 py-4 text-right hidden sm:table-cell">
                <ScoreCell value={score.structure_score} />
              </td>
              <td className="px-5 py-4 text-right hidden md:table-cell">
                <ScoreCell value={score.safety_score} />
              </td>
              <td className="px-5 py-4 text-right hidden sm:table-cell">
                <ScoreCell value={score.completeness_score} />
              </td>
              <td className="px-5 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <span
                    className="font-bold text-white tabular-nums"
                    style={{ fontFamily: 'var(--font-jetbrains-mono)' }}
                  >
                    {score.overall}
                  </span>
                  <GradeBadge score={score.overall} />
                </div>
              </td>
              <td className="px-5 py-4 text-right hidden lg:table-cell">
                <div className="flex flex-col items-end gap-0.5">
                  <span className="text-white/30 text-xs" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>
                    {new Date(score.scored_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                  <span className="text-white/15 text-[11px]" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>
                    {new Date(score.scored_at).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false,
                    })}
                  </span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
