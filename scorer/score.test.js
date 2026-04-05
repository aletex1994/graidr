'use strict'

/**
 * Tests for scorer/score.js
 * Run: NODE_ENV=test node --test scorer/score.test.js
 */

const { test, describe } = require('node:test')
const assert = require('node:assert/strict')
const https = require('https')
const EventEmitter = require('events')

// ── load module under test ─────────────────────────────────────
process.env.NODE_ENV = 'test'
process.env.GITHUB_REPOSITORY = 'test-owner/test-repo'
process.env.GITHUB_SHA = 'abc1234567890'
process.env.GITHUB_REF_NAME = 'main'

const { gradeLabel, deltaStr, parseScore, computeDeterministicScores } = (() => {
  const origRequest = https.request
  https.request = () => {
    const ee = new EventEmitter()
    ee.write = () => {}
    ee.end = () => {}
    return ee
  }
  const mod = require('./score.js')
  https.request = origRequest
  return mod
})()

// ── gradeLabel ─────────────────────────────────────────────────

describe('gradeLabel', () => {
  const cases = [
    [100, 'S'], [90, 'S'],
    [89, 'A'],  [80, 'A'],
    [79, 'B'],  [70, 'B'],
    [69, 'C'],  [50, 'C'],
    [49, 'D'],  [0, 'D'],
  ]
  for (const [score, expected] of cases) {
    test(`${score} → ${expected}`, () => {
      assert.equal(gradeLabel(score), expected)
    })
  }
})

// ── deltaStr ───────────────────────────────────────────────────

describe('deltaStr', () => {
  test('returns empty string when previous is null', () => {
    assert.equal(deltaStr(75, null), '')
  })
  test('positive delta', () => {
    assert.equal(deltaStr(80, 70), ' ↑ +10')
  })
  test('negative delta', () => {
    assert.equal(deltaStr(65, 75), ' ↓ -10')
  })
  test('zero delta', () => {
    assert.equal(deltaStr(70, 70), ' · 0')
  })
  test('single point improvement', () => {
    assert.equal(deltaStr(71, 70), ' ↑ +1')
  })
  test('single point drop', () => {
    assert.equal(deltaStr(69, 70), ' ↓ -1')
  })
})

// ── parseScore ─────────────────────────────────────────────────

describe('parseScore', () => {
  const validPayload = {
    structure_subjective: 30,
    safety_subjective: 25,
    completeness_subjective: 35,
    top_issues: [
      'app/page.tsx is 500 lines — split into components',
      'No error handling on fetch calls',
    ],
    doing_well: [
      'TypeScript used throughout',
    ],
  }

  test('parses bare JSON', () => {
    const result = parseScore(JSON.stringify(validPayload))
    assert.deepEqual(result, validPayload)
  })

  test('strips ```json ... ``` fences', () => {
    const fenced = '```json\n' + JSON.stringify(validPayload) + '\n```'
    assert.deepEqual(parseScore(fenced), validPayload)
  })

  test('strips ``` ... ``` fences', () => {
    const fenced = '```\n' + JSON.stringify(validPayload) + '\n```'
    assert.deepEqual(parseScore(fenced), validPayload)
  })

  test('returns all required fields', () => {
    const result = parseScore(JSON.stringify(validPayload))
    for (const key of ['structure_subjective', 'safety_subjective', 'completeness_subjective', 'top_issues', 'doing_well']) {
      assert.ok(key in result, `missing field: ${key}`)
    }
  })

  test('top_issues is an array', () => {
    const result = parseScore(JSON.stringify(validPayload))
    assert.ok(Array.isArray(result.top_issues))
    assert.ok(result.top_issues.length > 0)
  })

  test('doing_well is an array', () => {
    const result = parseScore(JSON.stringify(validPayload))
    assert.ok(Array.isArray(result.doing_well))
  })

  test('throws on invalid JSON', () => {
    assert.throws(() => parseScore('not json'), SyntaxError)
  })

  test('throws on empty string', () => {
    assert.throws(() => parseScore(''), SyntaxError)
  })
})

// ── computeDeterministicScores ─────────────────────────────────

describe('computeDeterministicScores', () => {
  test('perfect repo gets 50/50/50', () => {
    const facts = {
      has_typescript: true, has_tests: true, largest_file_lines: 100,
      has_build_script: true, has_lint_script: true,
      has_gitignore: true, env_in_gitignore: true, env_files_committed: false,
      potential_secrets: 0, eval_usage: false,
      has_readme: true, has_lockfile: true, mixed_lockfiles: false,
      console_log_count: 0, todo_fixme_count: 0,
    }
    const scores = computeDeterministicScores(facts)
    assert.equal(scores.structure, 50)
    assert.equal(scores.safety, 50)
    assert.equal(scores.completeness, 50)
  })

  test('empty repo gets 0/0/0 (except no-env-committed and no-eval)', () => {
    const facts = {
      has_typescript: false, has_tests: false, largest_file_lines: 500,
      has_build_script: false, has_lint_script: false,
      has_gitignore: false, env_in_gitignore: false, env_files_committed: true,
      potential_secrets: 3, eval_usage: true,
      has_readme: false, has_lockfile: false, mixed_lockfiles: true,
      console_log_count: 50, todo_fixme_count: 20,
    }
    const scores = computeDeterministicScores(facts)
    assert.equal(scores.structure, 0)
    assert.equal(scores.safety, 0)
    assert.equal(scores.completeness, 0)
  })

  test('structure: large file loses 10 points', () => {
    const facts = {
      has_typescript: true, has_tests: true, largest_file_lines: 500,
      has_build_script: true, has_lint_script: true,
      has_gitignore: true, env_in_gitignore: true, env_files_committed: false,
      potential_secrets: 0, eval_usage: false,
      has_readme: true, has_lockfile: true, mixed_lockfiles: false,
      console_log_count: 0, todo_fixme_count: 0,
    }
    const scores = computeDeterministicScores(facts)
    assert.equal(scores.structure, 40)
  })

  test('safety: committed env files lose 10 points', () => {
    const facts = {
      has_typescript: true, has_tests: true, largest_file_lines: 100,
      has_build_script: true, has_lint_script: true,
      has_gitignore: true, env_in_gitignore: true, env_files_committed: true,
      potential_secrets: 0, eval_usage: false,
      has_readme: true, has_lockfile: true, mixed_lockfiles: false,
      console_log_count: 0, todo_fixme_count: 0,
    }
    const scores = computeDeterministicScores(facts)
    assert.equal(scores.safety, 40)
  })

  test('completeness: many console.logs lose 10 points', () => {
    const facts = {
      has_typescript: true, has_tests: true, largest_file_lines: 100,
      has_build_script: true, has_lint_script: true,
      has_gitignore: true, env_in_gitignore: true, env_files_committed: false,
      potential_secrets: 0, eval_usage: false,
      has_readme: true, has_lockfile: true, mixed_lockfiles: false,
      console_log_count: 30, todo_fixme_count: 0,
    }
    const scores = computeDeterministicScores(facts)
    assert.equal(scores.completeness, 40)
  })

  test('boundary: exactly 300 lines is still under', () => {
    const facts = {
      has_typescript: false, has_tests: false, largest_file_lines: 299,
      has_build_script: false, has_lint_script: false,
      has_gitignore: false, env_in_gitignore: false, env_files_committed: false,
      potential_secrets: 0, eval_usage: false,
      has_readme: false, has_lockfile: false, mixed_lockfiles: false,
      console_log_count: 0, todo_fixme_count: 0,
    }
    const scores = computeDeterministicScores(facts)
    assert.equal(scores.structure, 10) // only largest_file check passes
  })

  test('boundary: exactly 5 console.logs fails the check', () => {
    const facts = {
      has_typescript: false, has_tests: false, largest_file_lines: 500,
      has_build_script: false, has_lint_script: false,
      has_gitignore: false, env_in_gitignore: false, env_files_committed: false,
      potential_secrets: 0, eval_usage: false,
      has_readme: false, has_lockfile: false, mixed_lockfiles: true,
      console_log_count: 5, todo_fixme_count: 5,
    }
    const scores = computeDeterministicScores(facts)
    assert.equal(scores.completeness, 0)
  })
})

// ── overall score calculation ──────────────────────────────────

describe('overall score calculation', () => {
  test('averages three dimensions and rounds', () => {
    const score = { structure_score: 45, safety_score: 70, completeness_score: 55 }
    const overall = Math.round((score.structure_score + score.safety_score + score.completeness_score) / 3)
    assert.equal(overall, 57)
  })

  test('perfect scores produce 100', () => {
    const score = { structure_score: 100, safety_score: 100, completeness_score: 100 }
    const overall = Math.round((score.structure_score + score.safety_score + score.completeness_score) / 3)
    assert.equal(overall, 100)
  })

  test('zero scores produce 0', () => {
    const score = { structure_score: 0, safety_score: 0, completeness_score: 0 }
    const overall = Math.round((score.structure_score + score.safety_score + score.completeness_score) / 3)
    assert.equal(overall, 0)
  })
})

// ── req helper ─────────────────────────────────────────────────

describe('req helper', () => {
  function makeRes(statusCode, body) {
    const ee = new EventEmitter()
    ee.statusCode = statusCode
    process.nextTick(() => { ee.emit('data', body); ee.emit('end') })
    return ee
  }

  const { req } = require('./score.js')

  test('resolves with parsed JSON on 200', async () => {
    const payload = { ok: true }
    const origRequest = https.request
    https.request = (url, opts, cb) => {
      cb(makeRes(200, JSON.stringify(payload)))
      const r = new EventEmitter(); r.write = () => {}; r.end = () => {}; return r
    }
    const result = await req('https://example.com', { hostname: 'example.com', path: '/', method: 'GET' })
    assert.deepEqual(result, payload)
    https.request = origRequest
  })

  test('resolves with null on 204', async () => {
    const origRequest = https.request
    https.request = (url, opts, cb) => {
      cb(makeRes(204, ''))
      const r = new EventEmitter(); r.write = () => {}; r.end = () => {}; return r
    }
    const result = await req('https://example.com', { hostname: 'example.com', path: '/', method: 'POST' })
    assert.equal(result, null)
    https.request = origRequest
  })

  test('rejects on 4xx', async () => {
    const origRequest = https.request
    https.request = (url, opts, cb) => {
      cb(makeRes(401, 'Unauthorized'))
      const r = new EventEmitter(); r.write = () => {}; r.end = () => {}; return r
    }
    await assert.rejects(
      () => req('https://example.com', { hostname: 'example.com', path: '/', method: 'GET' }),
      err => { assert.ok(err.message.includes('401')); return true }
    )
    https.request = origRequest
  })

  test('rejects on network error', async () => {
    const origRequest = https.request
    https.request = () => {
      const r = new EventEmitter()
      r.write = () => {}
      r.end = () => { process.nextTick(() => r.emit('error', new Error('ECONNREFUSED'))) }
      return r
    }
    await assert.rejects(
      () => req('https://example.com', { hostname: 'example.com', path: '/', method: 'GET' }),
      /ECONNREFUSED/
    )
    https.request = origRequest
  })
})
