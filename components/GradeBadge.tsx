type Grade = 'S' | 'A' | 'B' | 'C' | 'D'

function getGrade(score: number): Grade {
  if (score >= 90) return 'S'
  if (score >= 80) return 'A'
  if (score >= 70) return 'B'
  if (score >= 50) return 'C'
  return 'D'
}

const gradeStyles: Record<Grade, string> = {
  S: 'bg-violet-500/20 text-violet-300 ring-violet-500/40',
  A: 'bg-emerald-500/20 text-emerald-300 ring-emerald-500/40',
  B: 'bg-blue-500/20 text-blue-300 ring-blue-500/40',
  C: 'bg-amber-500/20 text-amber-300 ring-amber-500/40',
  D: 'bg-red-500/20 text-red-300 ring-red-500/40',
}

export default function GradeBadge({ score }: { score: number }) {
  const grade = getGrade(score)
  return (
    <span
      className={`inline-flex items-center justify-center w-8 h-8 rounded-md text-sm font-bold ring-1 ${gradeStyles[grade]}`}
    >
      {grade}
    </span>
  )
}
