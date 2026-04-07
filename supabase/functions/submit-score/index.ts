/**
 * submit-score Edge Function
 *
 * Trust model:
 *   - Caller must supply a valid GITHUB_TOKEN in the Authorization header
 *   - We verify that token against the GitHub API and confirm it has access
 *     to the repository it claims to be scoring
 *   - Only then do we write to the database using the service_role key
 *   - Duplicate SHA submissions are rejected to prevent replay attacks
 *
 * Body expected:
 *   {
 *     github_repository: "owner/repo",
 *     github_sha: "abc123...",
 *     branch: "main",
 *     structure_score: 45,
 *     safety_score: 70,
 *     completeness_score: 55,
 *     top_issues: ["...", "..."],
 *     doing_well: ["..."],
 *     rated_with: "gpt-4o"
 *   }
 */

import { createClient } from 'jsr:@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
}

// ── Verify GitHub token owns the repo ──────────────────────────

async function verifyGitHubToken(token: string, expectedRepo: string): Promise<boolean> {
  const userRes = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${token}`,
      'User-Agent': 'graidr-scorer/1.0',
      Accept: 'application/vnd.github+json',
    },
  })

  const repoRes = await fetch(`https://api.github.com/repos/${expectedRepo}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'User-Agent': 'graidr-scorer/1.0',
      Accept: 'application/vnd.github+json',
    },
  })

  if (!repoRes.ok) return false

  const repoData = await repoRes.json()
  if (repoData.full_name?.toLowerCase() !== expectedRepo.toLowerCase()) return false

  if (userRes.ok) {
    return repoData.permissions?.push === true || repoData.permissions?.admin === true
  }

  // Actions token (403 on /user is expected)
  return true
}

// ── Validate score payload ──────────────────────────────────────

function validatePayload(body: Record<string, unknown>): string | null {
  const required = [
    'github_repository', 'github_sha', 'branch',
    'structure_score', 'safety_score', 'completeness_score',
    'top_issues', 'doing_well', 'rated_with',
  ]
  for (const key of required) {
    if (body[key] === undefined || body[key] === null) return `missing field: ${key}`
  }

  for (const key of ['structure_score', 'safety_score', 'completeness_score']) {
    const val = body[key] as number
    if (typeof val !== 'number' || val < 0 || val > 100 || !Number.isInteger(val)) {
      return `${key} must be an integer 0-100`
    }
  }

  if (!Array.isArray(body.top_issues) || body.top_issues.length === 0 ||
      !body.top_issues.every((x: unknown) => typeof x === 'string')) {
    return 'top_issues must be a non-empty array of strings'
  }

  if (!Array.isArray(body.doing_well) ||
      !body.doing_well.every((x: unknown) => typeof x === 'string')) {
    return 'doing_well must be an array of strings'
  }

  if (typeof body.github_repository !== 'string' || !body.github_repository.includes('/')) {
    return 'github_repository must be "owner/repo"'
  }

  if (typeof body.github_sha !== 'string' || !/^[0-9a-f]{7,40}$/i.test(body.github_sha)) {
    return 'github_sha must be a valid commit SHA'
  }

  const validCategories = ['portfolio', 'saas', 'e-commerce', 'blog', 'dashboard', 'api', 'cli', 'library', 'docs', 'other']
  if (body.category !== undefined && (typeof body.category !== 'string' || !validCategories.includes(body.category))) {
    return `category must be one of: ${validCategories.join(', ')}`
  }

  return null
}

// ── Main handler ────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS })
  }

  if (req.method !== 'POST') {
    return json({ error: 'method not allowed' }, 405)
  }

  const authHeader = req.headers.get('authorization') ?? ''
  const token = authHeader.replace(/^Bearer\s+/i, '').trim()
  if (!token) return json({ error: 'missing authorization header' }, 401)

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return json({ error: 'invalid JSON body' }, 400)
  }

  const validationError = validatePayload(body)
  if (validationError) return json({ error: validationError }, 400)

  const githubRepo = body.github_repository as string

  const tokenValid = await verifyGitHubToken(token, githubRepo)
  if (!tokenValid) {
    return json({ error: 'token does not have access to the claimed repository' }, 403)
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false } },
  )

  const [owner, name] = githubRepo.split('/')
  const githubUrl = `https://github.com/${githubRepo}`

  // Reject duplicate SHA
  const { data: existing } = await supabase
    .from('scores')
    .select('id')
    .eq('commit_sha', body.github_sha as string)
    .limit(1)
    .maybeSingle()

  if (existing) {
    return json({ error: 'score for this commit SHA already exists' }, 409)
  }

  // Upsert repo
  const { data: repos, error: repoError } = await supabase
    .from('repos')
    .upsert({ github_url: githubUrl, owner, name }, { onConflict: 'github_url' })
    .select('id')

  if (repoError || !repos?.length) {
    console.error('repo upsert error:', repoError)
    return json({ error: 'failed to upsert repo' }, 500)
  }

  const repoId = repos[0].id

  // Insert score
  const { error: scoreError } = await supabase.from('scores').insert({
    repo_id: repoId,
    commit_sha: body.github_sha,
    branch: body.branch,
    structure_score: body.structure_score,
    safety_score: body.safety_score,
    completeness_score: body.completeness_score,
    category: body.category || 'other',
    details: {
      top_issues: body.top_issues,
      doing_well: body.doing_well,
    },
    rated_with: body.rated_with,
  })

  if (scoreError) {
    console.error('score insert error:', scoreError)
    return json({ error: 'failed to insert score' }, 500)
  }

  const { data: scoreRow } = await supabase
    .from('scores')
    .select('overall')
    .eq('repo_id', repoId)
    .order('scored_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  return json({ ok: true, overall: scoreRow?.overall ?? null })
})
