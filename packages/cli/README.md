# graidr

[![graidr score](https://img.shields.io/endpoint?url=https%3A%2F%2Fgraidr.tools%2Fapi%2Fscore%2Faletex1994%2Fgraidr)](https://graidr.tools)

**Automatic code quality scores for every push. Zero setup.**

graidr is a GitHub Action that scores your repository across Structure, Safety, and Completeness on every push and pull request — then publishes the results to a public leaderboard at [graidr.tools](https://graidr.tools).

No API keys. No configuration. It works with the `GITHUB_TOKEN` that GitHub already injects into every workflow.

---

## Quick start

```bash
npx graidr init
git add .github/workflows/graidr.yml .github/workflows/graidr-scorer.cjs
git commit -m "add graidr scoring"
git push
```

That's it. Your repo will be scored on every push.

---

## Add a badge to your README

Once your repo has been scored, add this to your README (replace `OWNER/REPO`):

```markdown
[![graidr score](https://img.shields.io/endpoint?url=https%3A%2F%2Fgraidr.tools%2Fapi%2Fscore%2FOWNER%2FREPO)](https://graidr.tools)
```

The badge updates automatically on every push and shows your current grade and score.

---

## Grade scale

| Score  | Grade |
|--------|-------|
| 90–100 | **S** |
| 80–89  | **A** |
| 70–79  | **B** |
| 50–69  | **C** |
| 0–49   | **D** |

---

## How it works

- **Deterministic checks** (0–50 pts): shell commands inspect your repo for TypeScript, tests, `.gitignore`, lockfiles, secrets, and more.
- **AI review** (0–50 pts): `gpt-4o` via GitHub Models reads your code and scores structure, safety, and completeness.
- Results are posted as a PR comment and published to the [leaderboard](https://graidr.tools).

---

## Deep scan

For a more thorough analysis, trigger a deep scan:

**Via commit message:**
```bash
git commit -m "your message [grade:deep]"
```

**Via GitHub Actions UI:**
Go to Actions → graidr → Run workflow → enable "Deep scan".

---

## Links

- Leaderboard: [graidr.tools](https://graidr.tools)
- Issues: [github.com/aletex1994/graidr/issues](https://github.com/aletex1994/graidr/issues)
