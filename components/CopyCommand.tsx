'use client'
import { useState } from 'react'

export function CopyCommand({ command }: { command: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(command)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="group relative inline-flex items-center gap-3 border border-zinc-800 hover:border-zinc-700 rounded-lg px-4 py-2.5 bg-black/40 transition-colors cursor-pointer" onClick={handleCopy}>
      <span className="text-sm text-zinc-400" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>
        {command}
      </span>
      <button
        className="text-zinc-600 group-hover:text-zinc-400 transition-colors text-xs"
        style={{ fontFamily: 'var(--font-jetbrains-mono)' }}
        aria-label="Copy command"
      >
        {copied ? (
          <span className="text-violet-400">copied!</span>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
        )}
      </button>
    </div>
  )
}
