# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **IMPORTANT — see also `AGENTS.md`:** This Next.js version (16.2.2) has breaking changes from older versions. Check `node_modules/next/dist/docs/` before writing any Next.js-specific code and heed deprecation notices.

## Commands

```bash
# Web app
npm run dev          # Next.js dev server
npm run build        # Production build (use to verify TypeScript + RSC)
npm run lint         # ESLint

# Scorer tests (Node.js built-in runner, no test framework needed)
NODE_ENV=test node --test scorer/score.test.js

# Run a single test suite
NODE_ENV=test node --test scorer/score.test.js --test-name-pattern "gradeLabel"

# Supabase
npx supabase db push                                      # Apply migrations
npx supabase functions deploy submit-score --no-verify-jwt  # Deploy Edge Function

# CLI package
cd packages/cli && npm publish
```

## Architecture

Graidr is three separate pieces that compose together:

**1. Next.js web app** (`app/`, `components/`, `lib/`)
Server components fetch directly from Supabase (anon key, public read via RLS). No API routes — the leaderboard view is a Postgres view joined at query time. `lib/supabase.ts` holds the client and the `Score` TypeScript type.

**2. Scorer** (`scorer/score.js`)
A dependency-free Node.js script that runs in GitHub Actions. Two-phase:
- **Phase 1 — Deterministic** (0–50 pts/dimension): `collectFacts()` runs shell commands to gather 15 boolean/numeric facts; `computeDeterministicScores(facts)` maps them to points (10 pts each). No LLM involved.
- **Phase 2 — Subjective** (0–50 pts/dimension): `collectContext()` smart-samples files in 4 tiers (always-on, security-relevant, largest, entry points); `scoreWithGitHubModels()` calls gpt-4o via the `GITHUB_TOKEN`-authenticated GitHub Models API.
- Final score = deterministic + subjective, capped at 100 per dimension. Overall = avg of 3 dimensions.

Deep scan is triggered by `DEEP_SCAN=true` env var or `[grade:deep]` in commit message.

**3. CLI npm package** (`packages/cli/`)
`npx graidr init` writes two files into the user's repo: `graidr.yml` (workflow) and `graidr-scorer.js` (the bundled scorer). The bundled scorer (`packages/cli/graidr-scorer.js`) is a copy of `scorer/score.js` with the shebang and test-export block stripped. **When changing the scorer, update both files.**

## Supabase

- **Tables:** `repos` (one row per GitHub repo) + `scores` (one row per commit SHA, unique constraint prevents replay attacks)
- **`overall` column:** A generated stored column — `((structure_score + safety_score + completeness_score) / 3)::int2`. Cannot be altered directly; must drop and re-add.
- **`leaderboard` view:** Selects the latest score per repo and ranks by overall. Depends on all three score columns and `overall`. Drop this view before any column changes.
- **Edge Function** (`supabase/functions/submit-score/index.ts`): Must be deployed with `--no-verify-jwt` because it authenticates via `GITHUB_TOKEN` (not a Supabase JWT). Verifies the token against the GitHub API before writing.
- **Migrations:** live in `supabase/migrations/`. `schema.sql` is the authoritative schema definition.

## Dimensions

| Dimension | DB column | Deterministic checks |
|-----------|-----------|---------------------|
| Structure | `structure_score` | TypeScript, tests, build script, lint script, largest file < 300 lines |
| Safety | `safety_score` | .gitignore, .env in gitignore, no committed env files, no secrets, no eval |
| Completeness | `completeness_score` | README, lockfile, no mixed lockfiles, console.log < 5, TODO/FIXME < 5 |

## Grade scale

S ≥ 90 · A ≥ 80 · B ≥ 70 · C ≥ 50 · D < 50
