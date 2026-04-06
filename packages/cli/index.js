#!/usr/bin/env node
'use strict'

const fs   = require('fs')
const path = require('path')
const readline = require('readline')

// ── Inline scorer ──────────────────────────────────────────────
// We embed score.js directly in the workflow so:
//   1. No curl at runtime (no supply-chain risk)
//   2. The exact version installed is what runs
//   3. No external dependency on our CDN staying up

// Read the bundled scorer — shipped alongside index.js in the npm package
const SCORER_INLINE = fs.readFileSync(
  path.join(__dirname, 'graidr-scorer.cjs'),
  'utf8'
)

const WORKFLOW_CONTENT = `name: graidr

on:
  push:
    branches: ["**"]
  pull_request:
    branches: ["**"]

permissions:
  contents: read
  models: read
  pull-requests: write

jobs:
  score:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Run graidr scorer
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
          GITHUB_REPOSITORY: \${{ github.repository }}
          GITHUB_SHA: \${{ github.sha }}
          GITHUB_REF_NAME: \${{ github.ref_name }}
          PR_NUMBER: \${{ github.event.pull_request.number }}
        run: node .github/workflows/graidr-scorer.cjs
`

// ── CLI colors ─────────────────────────────────────────────────

const RESET  = '\x1b[0m'
const BOLD   = '\x1b[1m'
const VIOLET = '\x1b[35m'
const GREEN  = '\x1b[32m'
const RED    = '\x1b[31m'
const DIM    = '\x1b[2m'

function print(msg) { process.stdout.write(msg + '\n') }
function bold(s)    { return BOLD + s + RESET }
function violet(s)  { return VIOLET + s + RESET }
function green(s)   { return GREEN + s + RESET }
function red(s)     { return RED + s + RESET }
function dim(s)     { return DIM + s + RESET }

function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  return new Promise(resolve => rl.question(question, ans => { rl.close(); resolve(ans.trim().toLowerCase()) }))
}

// ── Main ───────────────────────────────────────────────────────

async function main() {
  const [,, command] = process.argv

  if (command !== 'init') {
    print('')
    print(violet(bold('graidr')) + ' — score your repo on every push')
    print('')
    print('  Usage: ' + bold('npx graidr init'))
    print('')
    process.exit(0)
  }

  print('')
  print(violet(bold('graidr')) + dim(' v0.1.0'))
  print('')

  // 1. Check for .git
  if (!fs.existsSync(path.join(process.cwd(), '.git'))) {
    print(red('✖') + ' No git repo found. Run this inside your project.')
    print('')
    process.exit(1)
  }

  // 2. Ensure .github/workflows/ exists
  const workflowsDir = path.join(process.cwd(), '.github', 'workflows')
  if (!fs.existsSync(workflowsDir)) {
    fs.mkdirSync(workflowsDir, { recursive: true })
    print(dim('  created .github/workflows/'))
  }

  // 3. Check if graidr.yml already exists
  const ymlPath    = path.join(workflowsDir, 'graidr.yml')
  const scorerPath = path.join(workflowsDir, 'graidr-scorer.cjs')

  if (fs.existsSync(ymlPath)) {
    const answer = await ask('  graidr.yml already exists. Overwrite? (y/n) ')
    if (answer !== 'y') {
      print('')
      print(dim('  Aborted.'))
      print('')
      process.exit(0)
    }
  }

  // 4. Write workflow + inline scorer
  fs.writeFileSync(ymlPath, WORKFLOW_CONTENT, 'utf8')
  fs.writeFileSync(scorerPath, SCORER_INLINE.trim(), 'utf8')

  // 5. Success
  print(green('✔') + ' ' + bold('graidr installed!'))
  print('')
  print('  Your repo will be scored on every push.')
  print('  No API keys needed — uses GitHub Models automatically.')
  print('')
  print('  Next:')
  print('  ' + dim('git add .github/workflows/graidr.yml .github/workflows/graidr-scorer.cjs'))
  print('  ' + dim('git commit -m "add graidr scoring"'))
  print('  ' + dim('git push'))
  print('')
  print('  View your score at: ' + violet('https://graidr.tools/repo/YOUR_REPO'))
  print('')
}

main().catch(err => {
  process.stderr.write(red('✖') + ' ' + err.message + '\n')
  process.exit(1)
})
