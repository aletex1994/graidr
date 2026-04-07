import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Score = {
  rank: number
  owner: string
  name: string
  github_url: string
  structure_score: number
  safety_score: number
  completeness_score: number
  overall: number
  category: 'portfolio' | 'saas' | 'e-commerce' | 'blog' | 'dashboard' | 'api' | 'cli' | 'library' | 'docs' | 'other'
  details: {
    top_issues: string[]
    doing_well: string[]
  } | null
  commit_sha: string
  rated_with: 'gpt-4o' | 'gpt-4o-deep'
  scored_at: string
}
