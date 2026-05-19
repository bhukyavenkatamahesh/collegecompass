// ─── Shared TypeScript types ───────────────────────────────────────────────
// Single source of truth — import from here everywhere.

export type ExamType = 'GATE' | 'JEE_MAIN' | 'JEE_ADVANCED'
export type Counselling = 'JOSAA' | 'CSAB'
export type Category = 'GEN' | 'OBC-NCL' | 'SC' | 'ST' | 'EWS'
export type Gender = 'Male' | 'Female'
export type InstituteType = 'IIT' | 'NIT' | 'IIIT' | 'GFTI'
export type SeatQuota = 'AI' | 'HS' | 'OS' | 'GO' | 'JK' | 'LA'

// ─── Prediction request ────────────────────────────────────────────────────
export interface PredictRequest {
  examType: ExamType
  category: Category
  branch: string
  gender: Gender
  score?: number // GATE
  rank?: number // JEE category rank
  crlRank?: number // JEE all-india CRL
  homeState?: string
  counselling?: Counselling
  year?: number
  round?: number
  instituteTypes?: InstituteType[]
  accessToken?: string
}

// ─── Single result row ─────────────────────────────────────────────────────
export interface PredictionResult {
  institute: string
  program: string
  category: Category
  quota?: string
  gender?: string
  round: number
  openRank?: number
  closeRank?: number
  openScore?: number
  closeScore?: number
  chance: 'High' | 'Medium' | 'Low'
  chanceScore: number
  source?: string
  instituteType?: string
}

// ─── API response ──────────────────────────────────────────────────────────
export interface PredictApiResponse {
  results: PredictionResult[]
  total: number
  preview: boolean
  examType: ExamType
  year: number
}

// ─── Payment ───────────────────────────────────────────────────────────────
export interface CreateOrderRequest {
  examType: ExamType
  name: string
  email: string
  phone?: string
  reportPayload: Record<string, unknown>
}

export interface CreateOrderResponse {
  orderId: string
  amount: number
  currency: string
  keyId: string
}

export interface VerifyPaymentRequest {
  razorpayOrderId: string
  razorpayPaymentId: string
  razorpaySignature: string
}

export interface VerifyPaymentResponse {
  success: boolean
  accessToken: string
}
