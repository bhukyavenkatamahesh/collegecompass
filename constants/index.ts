// ─── Pricing ───────────────────────────────────────────────────────────────
export const PRICE_GATE = Number(process.env.GATE_PRICE ?? 4900) // paise
export const PRICE_JEE = Number(process.env.JEE_PRICE ?? 4900)

// ─── Exam types ────────────────────────────────────────────────────────────
export const EXAM_TYPES = ['GATE', 'JEE_MAIN', 'JEE_ADVANCED'] as const
export type ExamType = (typeof EXAM_TYPES)[number]

// ─── Counselling types ─────────────────────────────────────────────────────
export const COUNSELLING_TYPES = ['JOSAA', 'CSAB'] as const
export type CounsellingType = (typeof COUNSELLING_TYPES)[number]

// ─── JEE Categories ────────────────────────────────────────────────────────
export const JEE_CATEGORIES = ['GEN', 'OBC-NCL', 'SC', 'ST', 'EWS'] as const
export type JeeCategory = (typeof JEE_CATEGORIES)[number]

// ─── Institute Types ───────────────────────────────────────────────────────
export const INSTITUTE_TYPES = ['IIT', 'NIT', 'IIIT', 'GFTI'] as const
export type InstituteType = (typeof INSTITUTE_TYPES)[number]

// ─── Seat Quotas ───────────────────────────────────────────────────────────
export const SEAT_QUOTAS = ['AI', 'HS', 'OS', 'GO', 'JK', 'LA'] as const
export type SeatQuota = (typeof SEAT_QUOTAS)[number]

// ─── App metadata ──────────────────────────────────────────────────────────
export const APP_NAME = 'CollegeCompass'
export const APP_TAGLINE = 'Official 2025 Cutoffs — GATE & JEE'
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://collegecompass.in'
