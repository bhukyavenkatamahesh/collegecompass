import crypto from 'crypto'
import { signToken, verifyToken } from './auth.ts'

export type ReportPayload = {
  examType: string
  category: string
  branch?: string
  gender?: string
  homeState?: string
  rank?: number
  score?: number
  crlRank?: number
}

function optionalNumber(value: unknown) {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined
}

export function normalizeReportPayload(payload: ReportPayload) {
  return {
    examType: String(payload.examType ?? '').trim().toUpperCase(),
    category: String(payload.category ?? '').trim(),
    branch: String(payload.branch || 'ALL').trim().toUpperCase(),
    gender: String(payload.gender || '').trim().toLowerCase(),
    homeState: String(payload.homeState || '').trim().toLowerCase(),
    rank: optionalNumber(payload.rank),
    score: optionalNumber(payload.score),
    crlRank: optionalNumber(payload.crlRank),
  }
}

export function reportFingerprint(payload: ReportPayload) {
  const normalized = normalizeReportPayload(payload)
  return crypto
    .createHash('sha256')
    .update(JSON.stringify(normalized))
    .digest('hex')
}

export function signReportAccess(payload: ReportPayload) {
  return signToken({
    role: 'paid_report',
    reportFingerprint: reportFingerprint(payload),
  })
}

export function verifyReportAccess(token: unknown, payload: ReportPayload) {
  if (!token || typeof token !== 'string') return false
  const decoded = verifyToken(token)
  if (!decoded || typeof decoded !== 'object') return false
  const data = decoded as { role?: string; reportFingerprint?: string }
  return data.role === 'paid_report' && data.reportFingerprint === reportFingerprint(payload)
}

export function hasPlaceholderRazorpayKeys() {
  const keyId = process.env.RAZORPAY_KEY_ID || ''
  const secret = process.env.RAZORPAY_KEY_SECRET || ''
  return !keyId || !secret || keyId.includes('YOUR_') || secret.includes('YOUR_') || secret.includes('XXXX')
}
