# Graidr Scoring Criteria

Every repository is scored across three dimensions using a two-phase system. Each dimension ranges from 0–100. The overall score is the rounded average of all three dimensions.

---

## Two-Phase Scoring

### Phase 1 — Deterministic (0–50 per dimension)

15 binary checks run via shell against your git tree. Each check is worth 10 points. Results are objective and reproducible — no AI involved.

### Phase 2 — Subjective (0–50 per dimension)

GPT-4o reviews a smart sample of your files and scores 5 criteria per dimension (0–10 each). Only judges what it can actually see in the sampled code.

**Final score = Deterministic + Subjective (capped at 100 per dimension)**

---

## Structure

| Type | Criterion | Points |
|------|-----------|--------|
| Deterministic | TypeScript present | 10 |
| Deterministic | Test files found | 10 |
| Deterministic | Largest file under 300 lines | 10 |
| Deterministic | Build script in package.json | 10 |
| Deterministic | Lint script in package.json | 10 |
| Subjective | Naming clarity across files and functions | 0–10 |
| Subjective | Single-purpose functions and components | 0–10 |
| Subjective | Separation of concerns and folder structure | 0–10 |
| Subjective | No obvious duplication or god files | 0–10 |
| Subjective | Organised imports and consistent conventions | 0–10 |

---

## Safety

| Type | Criterion | Points |
|------|-----------|--------|
| Deterministic | .gitignore present | 10 |
| Deterministic | .env listed in .gitignore | 10 |
| Deterministic | No .env files committed | 10 |
| Deterministic | No potential secrets detected | 10 |
| Deterministic | No eval() usage | 10 |
| Subjective | Error handling on async calls and API routes | 0–10 |
| Subjective | Input validation at system boundaries | 0–10 |
| Subjective | No hardcoded URLs or credentials | 0–10 |
| Subjective | Auth checks on protected routes | 0–10 |
| Subjective | No obviously risky patterns | 0–10 |

---

## Completeness

| Type | Criterion | Points |
|------|-----------|--------|
| Deterministic | README over 10 lines | 10 |
| Deterministic | Lock file committed | 10 |
| Deterministic | No mixed lock files | 10 |
| Deterministic | Fewer than 5 console.log calls | 10 |
| Deterministic | Fewer than 5 TODO/FIXME comments | 10 |
| Subjective | Loading and error states handled | 0–10 |
| Subjective | Empty states handled gracefully | 0–10 |
| Subjective | No leftover boilerplate or placeholder copy | 0–10 |
| Subjective | README explains what the project does and how to run it | 0–10 |
| Subjective | Feels like an intentional project, not an abandoned scaffold | 0–10 |

---

## Grade thresholds

| Score  | Grade |
|--------|-------|
| 90–100 | **S** |
| 80–89  | **A** |
| 70–79  | **B** |
| 50–69  | **C** |
| 0–49   | **D** |

Grades are fixed thresholds, not relative rankings.

---

## Scoring model

- Standard scan: `gpt-4o` via GitHub Models (free, zero setup — uses `GITHUB_TOKEN`)
- Deep scan: `gpt-4o` with extended context (12 files, 80 lines each) — trigger with `DEEP_SCAN=true` or include `[grade:deep]` in your commit message

Scores are evidence-based: every sub-score must cite a specific file or pattern. Temperature is set to 0 for maximum consistency.
