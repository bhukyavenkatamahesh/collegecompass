import assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  calculateChanceByRank,
  calculateChanceByScore,
  isGatePaperEligible,
  matchJeeBranch,
  normalizeJeeExamType,
  shouldFilterByBranch,
  usesCrlRank,
} from '../lib/predictor.ts'
import { signReportAccess, verifyReportAccess } from '../lib/report-access.ts'

test('normalizes both public JEE exam ids and legacy aliases', () => {
  assert.equal(normalizeJeeExamType('JEE'), 'JEE_MAIN')
  assert.equal(normalizeJeeExamType('JEE_MAIN'), 'JEE_MAIN')
  assert.equal(normalizeJeeExamType('JEE_ADV'), 'JEE_ADVANCED')
  assert.equal(normalizeJeeExamType('JEE_ADVANCED'), 'JEE_ADVANCED')
  assert.equal(normalizeJeeExamType('GATE'), null)
})

test('uses CRL only for JoSAA open seats and all CSAB rows', () => {
  assert.equal(usesCrlRank('JOSAA', 'GEN'), true)
  assert.equal(usesCrlRank('JOSAA', 'OBC'), false)
  assert.equal(usesCrlRank('JOSAA', 'GEN-PwD'), false)
  assert.equal(usesCrlRank('CSAB', 'OBC'), true)
  assert.equal(usesCrlRank('CSAB', 'SC-PwD'), true)
})

test('treats empty and ALL branch choices as no JEE branch filter', () => {
  assert.equal(shouldFilterByBranch(''), false)
  assert.equal(shouldFilterByBranch('ALL'), false)
  assert.equal(shouldFilterByBranch('all'), false)
  assert.equal(shouldFilterByBranch('CS'), true)
})

test('matches common GATE and JEE branch eligibility values', () => {
  assert.equal(isGatePaperEligible('CS', 'CS/DA/EC'), true)
  assert.equal(isGatePaperEligible('ME', 'CS/DA/EC'), false)
  assert.equal(isGatePaperEligible('EE', 'ALL'), true)

  assert.deepEqual(matchJeeBranch('Computer Science and Engineering', 'CS'), {
    matches: true,
    isPrimary: true,
  })
  assert.equal(matchJeeBranch('Mathematics and Computing', 'CS').matches, true)
})

test('calculates chance thresholds in the expected direction', () => {
  assert.deepEqual(calculateChanceByRank(100, 100, 200), {
    chance: 'High',
    percent: 90,
  })
  assert.equal(calculateChanceByRank(180, 100, 200).chance, 'Medium')
  assert.equal(calculateChanceByRank(230, 100, 200).percent, 5)

  assert.deepEqual(calculateChanceByScore(750, 750, 650), {
    chance: 'High',
    percent: 90,
  })
  assert.equal(calculateChanceByScore(680, 750, 650).chance, 'Medium')
  assert.equal(calculateChanceByScore(500, 750, 650).percent, 5)
})

test('report access tokens only unlock the exact paid prediction payload', () => {
  const payload = {
    examType: 'JEE_MAIN',
    rank: 4500,
    crlRank: 45000,
    category: 'OBC',
    gender: 'Male',
    homeState: 'Telangana',
    branch: 'ALL',
  }
  const token = signReportAccess(payload)

  assert.equal(verifyReportAccess(token, payload), true)
  assert.equal(verifyReportAccess(token, { ...payload, rank: 4501 }), false)
  assert.equal(verifyReportAccess(token, { ...payload, category: 'GEN' }), false)
})
