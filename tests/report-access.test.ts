import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  normalizeReportPayload,
  reportFingerprint,
  signReportAccess,
  verifyReportAccess,
  hasPlaceholderRazorpayKeys,
} from '@/lib/report-access'

// ─────────────────────────────────────────────────────────────────────────────
// normalizeReportPayload
// ─────────────────────────────────────────────────────────────────────────────
describe('normalizeReportPayload', () => {
  it('uppercases examType and branch, lowercases gender and homeState', () => {
    const result = normalizeReportPayload({
      examType: ' gate ',
      category: ' OBC-NCL ',
      branch: 'cs',
      gender: 'Female',
      homeState: 'Delhi',
      rank: 500,
      score: 650,
    })
    expect(result.examType).toBe('GATE')
    expect(result.category).toBe('OBC-NCL')
    expect(result.branch).toBe('CS')
    expect(result.gender).toBe('female')
    expect(result.homeState).toBe('delhi')
    expect(result.rank).toBe(500)
    expect(result.score).toBe(650)
  })

  it('defaults branch to ALL when empty', () => {
    const result = normalizeReportPayload({ examType: 'JEE', category: 'GEN' })
    expect(result.branch).toBe('ALL')
  })

  it('discards non-positive numbers', () => {
    const result = normalizeReportPayload({
      examType: 'GATE',
      category: 'GEN',
      rank: -1,
      score: 0,
      crlRank: NaN as unknown as number,
    })
    expect(result.rank).toBeUndefined()
    expect(result.score).toBeUndefined()
    expect(result.crlRank).toBeUndefined()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// reportFingerprint
// ─────────────────────────────────────────────────────────────────────────────
describe('reportFingerprint', () => {
  it('returns a 64-char hex string', () => {
    const fp = reportFingerprint({ examType: 'GATE', category: 'GEN', score: 700 })
    expect(fp).toMatch(/^[a-f0-9]{64}$/)
  })

  it('is deterministic for the same input', () => {
    const payload = { examType: 'GATE', category: 'GEN', score: 700, branch: 'CS' }
    expect(reportFingerprint(payload)).toBe(reportFingerprint(payload))
  })

  it('normalizes before hashing — whitespace/case variants give same fingerprint', () => {
    const a = reportFingerprint({ examType: ' gate', category: 'GEN', branch: 'cs' })
    const b = reportFingerprint({ examType: 'GATE ', category: 'GEN', branch: 'CS' })
    expect(a).toBe(b)
  })

  it('different inputs produce different fingerprints', () => {
    const a = reportFingerprint({ examType: 'GATE', category: 'GEN', score: 700 })
    const b = reportFingerprint({ examType: 'GATE', category: 'OBC-NCL', score: 700 })
    expect(a).not.toBe(b)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// signReportAccess / verifyReportAccess
// ─────────────────────────────────────────────────────────────────────────────
describe('signReportAccess / verifyReportAccess', () => {
  const payload = { examType: 'GATE', category: 'GEN', score: 700, branch: 'CS' }

  it('signs and verifies correctly', () => {
    const token = signReportAccess(payload)
    expect(typeof token).toBe('string')
    expect(verifyReportAccess(token, payload)).toBe(true)
  })

  it('rejects a different payload', () => {
    const token = signReportAccess(payload)
    const other = { examType: 'GATE', category: 'OBC-NCL', score: 700, branch: 'CS' }
    expect(verifyReportAccess(token, other)).toBe(false)
  })

  it('rejects null / empty / non-string tokens', () => {
    expect(verifyReportAccess(null, payload)).toBe(false)
    expect(verifyReportAccess('', payload)).toBe(false)
    expect(verifyReportAccess(123, payload)).toBe(false)
    expect(verifyReportAccess(undefined, payload)).toBe(false)
  })

  it('rejects a tampered token', () => {
    const token = signReportAccess(payload)
    const tampered = token.slice(0, -4) + 'XXXX'
    expect(verifyReportAccess(tampered, payload)).toBe(false)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// hasPlaceholderRazorpayKeys
// ─────────────────────────────────────────────────────────────────────────────
describe('hasPlaceholderRazorpayKeys', () => {
  const origKeyId = process.env.RAZORPAY_KEY_ID
  const origSecret = process.env.RAZORPAY_KEY_SECRET

  afterEach(() => {
    if (origKeyId !== undefined) process.env.RAZORPAY_KEY_ID = origKeyId
    else delete process.env.RAZORPAY_KEY_ID
    if (origSecret !== undefined) process.env.RAZORPAY_KEY_SECRET = origSecret
    else delete process.env.RAZORPAY_KEY_SECRET
  })

  it('returns true when keys are missing', () => {
    delete process.env.RAZORPAY_KEY_ID
    delete process.env.RAZORPAY_KEY_SECRET
    expect(hasPlaceholderRazorpayKeys()).toBe(true)
  })

  it('returns true when keys contain YOUR_', () => {
    process.env.RAZORPAY_KEY_ID = 'YOUR_KEY_ID'
    process.env.RAZORPAY_KEY_SECRET = 'YOUR_SECRET'
    expect(hasPlaceholderRazorpayKeys()).toBe(true)
  })

  it('returns true when secret contains XXXX', () => {
    process.env.RAZORPAY_KEY_ID = 'rzp_live_real'
    process.env.RAZORPAY_KEY_SECRET = 'XXXX_placeholder'
    expect(hasPlaceholderRazorpayKeys()).toBe(true)
  })

  it('returns false when keys look real', () => {
    process.env.RAZORPAY_KEY_ID = 'rzp_live_abc123'
    process.env.RAZORPAY_KEY_SECRET = 'real_secret_key_value'
    expect(hasPlaceholderRazorpayKeys()).toBe(false)
  })
})
