import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

function gradeColor(overall: number): string {
  if (overall >= 90) return 'brightgreen'
  if (overall >= 80) return 'green'
  if (overall >= 70) return 'yellowgreen'
  if (overall >= 50) return 'yellow'
  return 'red'
}

function gradeLabel(overall: number): string {
  if (overall >= 90) return 'S'
  if (overall >= 80) return 'A'
  if (overall >= 70) return 'B'
  if (overall >= 50) return 'C'
  return 'D'
}

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ owner: string; name: string }> }
) {
  const { owner, name } = await ctx.params

  const { data, error } = await supabase
    .from('leaderboard')
    .select('overall')
    .eq('owner', owner)
    .eq('name', name)
    .single()

  if (error || !data) {
    return NextResponse.json(
      {
        schemaVersion: 1,
        label: 'graidr',
        message: 'not found',
        color: 'lightgrey',
      },
      { status: 404 }
    )
  }

  const overall = data.overall as number

  return NextResponse.json({
    schemaVersion: 1,
    label: 'graidr',
    message: `${gradeLabel(overall)} ${overall}`,
    color: gradeColor(overall),
    cacheSeconds: 300,
  })
}
