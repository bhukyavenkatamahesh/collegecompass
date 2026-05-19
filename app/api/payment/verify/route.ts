import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { Prisma } from '@prisma/client'
import {
  ReportPayload,
  hasPlaceholderRazorpayKeys,
  reportFingerprint,
  signReportAccess,
} from '@/lib/report-access'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth-config'

function isValidSignatureFormat(signature: unknown): signature is string {
  return typeof signature === 'string' && /^[a-f0-9]{64}$/i.test(signature)
}

function signaturesMatch(expected: string, received: unknown) {
  if (!isValidSignatureFormat(received)) return false
  const expectedBuffer = Buffer.from(expected, 'hex')
  const receivedBuffer = Buffer.from(received, 'hex')
  return (
    expectedBuffer.length === receivedBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
  )
}

function jsonValue(value: unknown) {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue
}

async function markPaymentPaid(
  orderId: string,
  paymentId: string,
  payload: ReportPayload,
  accessToken: string
) {
  const payment = await prisma.payment.findUnique({
    where: { razorpayOrderId: orderId },
  })
  if (!payment) throw new Error('Payment order not found')
  if (payment.razorpayPaymentId && payment.razorpayPaymentId !== paymentId) {
    throw new Error('Payment order is already linked to another payment')
  }
  if (payment.status === 'paid' && payment.razorpayPaymentId === paymentId) return

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      razorpayPaymentId: paymentId,
      status: 'paid',
      reportPayload: jsonValue(payload),
      reportFingerprint: reportFingerprint(payload),
      accessToken: accessToken,
      paidAt: new Date(),
    },
  })
}

export async function POST(req: NextRequest) {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, reportPayload, mockPayment } =
      await req.json()

    if (!reportPayload) {
      return NextResponse.json({ error: 'Missing report payload' }, { status: 400 })
    }

    let isValid = false
    let accessToken = ''
    if (mockPayment && process.env.NODE_ENV !== 'production' && hasPlaceholderRazorpayKeys()) {
      isValid = true
      if (razorpayOrderId && razorpayPaymentId) {
        accessToken = signReportAccess(reportPayload as ReportPayload)
        await markPaymentPaid(
          String(razorpayOrderId),
          String(razorpayPaymentId),
          reportPayload as ReportPayload,
          accessToken
        )
      }
    } else {
      if (hasPlaceholderRazorpayKeys()) {
        return NextResponse.json({ error: 'Razorpay is not configured' }, { status: 500 })
      }
      if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
        return NextResponse.json({ error: 'Missing Razorpay payment fields' }, { status: 400 })
      }

      const secret = process.env.RAZORPAY_KEY_SECRET!
      const body = razorpayOrderId + '|' + razorpayPaymentId
      const expectedSignature = crypto.createHmac('sha256', secret).update(body).digest('hex')

      isValid = signaturesMatch(expectedSignature, razorpaySignature)
    }

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 })
    }
    if (!accessToken) accessToken = signReportAccess(reportPayload as ReportPayload)
    if (!mockPayment) {
      await markPaymentPaid(
        String(razorpayOrderId),
        String(razorpayPaymentId),
        reportPayload as ReportPayload,
        accessToken
      )
    }

    // ── Auto-save prediction for logged-in users ──────────────────────────
    try {
      const session = await auth()
      if (session?.user?.id) {
        const rp = reportPayload as ReportPayload & { counselling?: string }
        const examType =
          rp.examType === 'JEE_MAIN'
            ? rp.counselling === 'CSAB'
              ? 'JEE_MAIN_CSAB'
              : 'JEE_MAIN_JOSAA'
            : rp.examType

        const existing = await prisma.savedPrediction.findFirst({
          where: { userId: session.user.id, accessToken },
        })
        if (!existing) {
          await prisma.savedPrediction.create({
            data: {
              userId: session.user.id,
              examType,
              counselling: rp.counselling ?? null,
              inputs: jsonValue(rp),
              totalResults: 0, // populated lazily when user opens dashboard
              accessToken,
              paidAt: new Date(),
            },
          })
        }
      }
    } catch (saveErr) {
      // Non-fatal: prediction still works even if save fails
      console.warn('[verify] Failed to save prediction for user:', saveErr)
    }

    return NextResponse.json({
      success: true,
      paymentId: razorpayPaymentId,
      accessToken,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Verification failed'
    const status = message.includes('Payment order') ? 400 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
