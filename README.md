# graidr

[![graidr score](https://img.shields.io/endpoint?url=https%3A%2F%2Fgraidr.tools%2Fapi%2Fscore%2Faletex1994%2Fgraidr)](https://graidr.tools)

**Automatic code quality scores for every push. Zero setup.**

graidr is a GitHub Action that scores your repository across Code, Security, and UX on every push and pull request — then publishes the results to a public leaderboard at [graidr.tools](https://graidr.tools).

No API keys. No configuration. It works with the `GITHUB_TOKEN` that GitHub already injects into every workflow.

---

## How it works

```
push to main
     │
     ▼
GitHub Action runs scorer/score.js
     │
     ├── collects context (file tree, key files, recent diff)
     │
     ├── calls gpt-4o via GitHub Models API
     │   (free tier · uses GITHUB_TOKEN · zero setup)
     │
     ├── parses structured scores across 12 sub-criteria
     │
     ├── writes results to graidr Supabase
     │
     └── posts a detailed comment on PRs
```

---

## Add graidr to your repo

Create `.github/workflows/graidr.yml`:

```yaml
name: Graidr — score this repo

on:
  push:
    branches: [main]
  pull_request:
  workflow_dispatch:
    inputs:
      deep:
        description: 'Deep scan (more context, slower)'
        type: boolean
        default: false

permissions:
  models: read
  contents: read
  pull-requests: write

jobs:
  grade:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 2

      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Run Graidr scorer
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          DEEP_SCAN: ${{ github.event.inputs.deep || 'false' }}
          GITHUB_REPOSITORY: ${{ github.repository }}
          GITHUB_SHA: ${{ github.sha }}
          GITHUB_REF_NAME: ${{ github.ref_name }}
          PR_NUMBER: ${{ github.event.pull_request.number }}
        run: node scorer/score.js
```

That's it. No secrets to add. No tokens to manage. Push and it runs.

### Add a score badge to your README

Once your repo has been scored, add this to your README (replace `OWNER/REPO` with your GitHub owner and repo name):

```markdown
[![graidr score](https://img.shields.io/endpoint?url=https%3A%2F%2Fgraidr.tools%2Fapi%2Fscore%2FOWNER%2FREPO)](https://graidr.tools)
```

The badge updates automatically on every push and shows your current grade and score.

---

## PR comments

On every pull request graidr posts a score breakdown as a comment:

```
## Graidr score — 81/100 · Grade A · ⬜ STANDARD

| Dimension        | Score | Notes                                      |
|------------------|------:|--------------------------------------------|
| 🛠 Code · architecture  |  84  | Clear separation, minor god-file in utils  |
| 🛠 Code · readability   |  88  | Naming is consistent, functions are small  |
| 🛠 Code · type_safety   |  79  | A few implicit any in API layer            |
| 🛠 Code · testability   |  71  | No test suite present                      |
| 🔒 Security · secrets   |  95  | No hardcoded secrets found                 |
| 🔒 Security · validation|  80  | Input validation present, zod used         |
...

Scored with `gpt-4o` via GitHub Models · View on graidr.tools/repo/owner/name
```

---

## Deep scan

Deep scan sends more context to the model for a more thorough analysis.

**Trigger via workflow_dispatch:**
Go to Actions → Graidr → Run workflow → enable "Deep scan".

**Trigger via commit message:**
```
git commit -m "refactor: tighten auth layer [grade:deep]"
```

Deep scan uses the same `gpt-4o` model but with a larger context window (more files, more diff lines).

---

## Scoring criteria

Each repository is evaluated across **3 dimensions × 4 sub-criteria = 12 scores**.
The dimension score is the rounded average of its four sub-scores.
The overall score is the rounded average of the three dimensions.

### 🛠 Code

| Sub-criterion | What is evaluated |
|---------------|-------------------|
| **Architecture** | Separation of concerns, modularity, folder structure, no god-files |
| **Readability** | Naming clarity, function size, cyclomatic complexity, useful comments |
| **Type Safety** | TypeScript strictness, null/undefined handling, no implicit `any` |
| **Testability** | Test coverage, testable design, CI test step present |

### 🔒 Security

| Sub-criterion | What is evaluated |
|---------------|-------------------|
| **Secrets** | No hardcoded keys or tokens, env vars correct, `.gitignore` tight |
| **Validation** | Inputs validated and sanitized, no SQL injection, no XSS vectors |
| **Auth** | Auth checks on protected routes, session handling, CSRF protection |
| **Dependencies** | No known CVEs, dependencies up to date, minimal attack surface |

### 🖥 UX

| Sub-criterion | What is evaluated |
|---------------|-------------------|
| **Clarity** | Visual hierarchy, spacing, typography, information density |
| **Responsiveness** | Mobile layouts, breakpoints, fluid grids, touch targets ≥ 44px |
| **States** | Loading, error, empty, and success states all handled |
| **Accessibility** | ARIA roles, colour contrast ≥ 4.5:1, keyboard nav, screen reader |

### Grade thresholds

| Score  | Grade |
|--------|-------|
| 90–100 | **S** |
| 80–89  | **A** |
| 70–79  | **B** |
| 50–69  | **C** |
| 0–49   | **D** |

Scores are strict by design — the model is explicitly instructed not to inflate. An **A** means the codebase is genuinely solid.

---

## Leaderboard

All scores are published to the public leaderboard at [graidr.tools](https://graidr.tools).

- Rankings are sorted by overall score
- Each repo shows its latest score
- The **DEEP** badge marks repos scored with deep scan
- Score history is retained — every push creates a new record

---

## Tech stack

| Layer | Tech |
|-------|------|
| Leaderboard UI | Next.js 15, Tailwind CSS, deployed on Vercel |
| Database | Supabase (Postgres + RLS) |
| Scorer | Plain Node.js 20, no dependencies |
| AI model | `gpt-4o` via GitHub Models (free tier) |

---

## Local development

```bash
# install dependencies
npm install

# copy env vars
cp .env.example .env.local
# fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY

# run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Contributing

PRs welcome. When you open one, graidr will score itself.
