import crypto from 'crypto'
import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest'

const dbMock = vi.hoisted(() => ({
  paymentFindUnique: vi.fn(),
  paymentUpdate: vi.fn(),
}))

vi.mock('@/lib/db', () => ({
  prisma: {
    payment: {
      findUnique: dbMock.paymentFindUnique,
      update: dbMock.paymentUpdate,
    },
    savedPrediction: {
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({}),
    },
  },
}))

vi.mock('@/lib/auth-config', () => ({
  auth: vi.fn().mockResolvedValue(null),
}))

import { POST } from '@/app/api/payment/verify/route'

const originalNodeEnv = process.env.NODE_ENV
const originalKeyId = process.env.RAZORPAY_KEY_ID
const originalSecret = process.env.RAZORPAY_KEY_SECRET
const originalNextAuthSecret = process.env.NEXTAUTH_SECRET
const mutableEnv = process.env as Record<string, string | undefined>

function makeRequest(body: object) {
  return new Request('http://localhost/api/payment/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }) as Parameters<typeof POST>[0]
}

function restoreEnv() {
  if (originalNodeEnv === undefined) delete mutableEnv.NODE_ENV
  else mutableEnv.NODE_ENV = originalNodeEnv
  if (originalKeyId === undefined) delete process.env.RAZORPAY_KEY_ID
  else process.env.RAZORPAY_KEY_ID = originalKeyId
  if (originalSecret === undefined) delete process.env.RAZORPAY_KEY_SECRET
  else process.env.RAZORPAY_KEY_SECRET = originalSecret
  if (originalNextAuthSecret === undefined) delete process.env.NEXTAUTH_SECRET
  else process.env.NEXTAUTH_SECRET = originalNextAuthSecret
}

afterEach(restoreEnv)
beforeEach(() => {
  dbMock.paymentFindUnique.mockReset()
  dbMock.paymentUpdate.mockReset()
})

describe('payment verification', () => {
  const reportPayload = {
    examType: 'JEE_MAIN',
    rank: 4500,
    crlRank: 45000,
    category: 'OBC',
    branch: 'CS',
    gender: 'Male',
    homeState: 'Telangana',
  }

  it('rejects real verification when Razorpay keys are placeholders', async () => {
    mutableEnv.NODE_ENV = 'production'
    process.env.RAZORPAY_KEY_ID = 'YOUR_KEY_ID'
    process.env.RAZORPAY_KEY_SECRET = 'YOUR_SECRET'

    const response = await POST(
      makeRequest({
        razorpayOrderId: 'order_test',
        razorpayPaymentId: 'pay_test',
        razorpaySignature: '0'.repeat(64),
        reportPayload,
      })
    )
    const json = await response.json()

    expect(response.status).toBe(500)
    expect(json.error).toBe('Razorpay is not configured')
  })

  it('returns an access token for a valid Razorpay signature', async () => {
    mutableEnv.NODE_ENV = 'production'
    process.env.NEXTAUTH_SECRET = 'test-nextauth-secret'
    process.env.RAZORPAY_KEY_ID = 'rzp_test_valid'
    process.env.RAZORPAY_KEY_SECRET = 'test-razorpay-secret'
    const razorpayOrderId = 'order_test'
    const razorpayPaymentId = 'pay_test'
    dbMock.paymentFindUnique.mockResolvedValue({
      id: 'payment_test',
      status: 'created',
      razorpayPaymentId: null,
    })
    dbMock.paymentUpdate.mockResolvedValue({})
    const razorpaySignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex')

    const response = await POST(
      makeRequest({
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        reportPayload,
      })
    )
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json.success).toBe(true)
    expect(json.accessToken).toBeTypeOf('string')
    expect(dbMock.paymentUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'payment_test' },
        data: expect.objectContaining({
          razorpayPaymentId,
          status: 'paid',
          reportFingerprint: expect.any(String),
          accessToken: expect.any(String),
          paidAt: expect.any(Date),
        }),
      })
    )
  })

  it('rejects an invalid Razorpay signature', async () => {
    mutableEnv.NODE_ENV = 'production'
    process.env.NEXTAUTH_SECRET = 'test-nextauth-secret'
    process.env.RAZORPAY_KEY_ID = 'rzp_test_valid'
    process.env.RAZORPAY_KEY_SECRET = 'test-razorpay-secret'

    const response = await POST(
      makeRequest({
        razorpayOrderId: 'order_test',
        razorpayPaymentId: 'pay_test',
        razorpaySignature: '0'.repeat(64),
        reportPayload,
      })
    )
    const json = await response.json()

    expect(response.status).toBe(400)
    expect(json.error).toBe('Invalid payment signature')
    expect(dbMock.paymentFindUnique).not.toHaveBeenCalled()
  })

  it('rejects a valid signature when no payment order was recorded', async () => {
    mutableEnv.NODE_ENV = 'production'
    process.env.NEXTAUTH_SECRET = 'test-nextauth-secret'
    process.env.RAZORPAY_KEY_ID = 'rzp_test_valid'
    process.env.RAZORPAY_KEY_SECRET = 'test-razorpay-secret'
    dbMock.paymentFindUnique.mockResolvedValue(null)
    const razorpayOrderId = 'order_missing'
    const razorpayPaymentId = 'pay_test'
    const razorpaySignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex')

    const response = await POST(
      makeRequest({
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        reportPayload,
      })
    )
    const json = await response.json()

    expect(response.status).toBe(400)
    expect(json.error).toBe('Payment order not found')
  })
})
