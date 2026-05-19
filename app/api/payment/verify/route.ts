import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { ReportPayload, hasPlaceholderRazorpayKeys, signReportAccess } from '@/lib/report-access'

function isValidSignatureFormat(signature: unknown): signature is string {
  return typeof signature === 'string' && /^[a-f0-9]{64}$/i.test(signature)
}

function signaturesMatch(expected: string, received: unknown) {
  if (!isValidSignatureFormat(received)) return false
  const expectedBuffer = Buffer.from(expected, 'hex')
  const receivedBuffer = Buffer.from(received, 'hex')
  return expectedBuffer.length === receivedBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
}

export async function POST(req: NextRequest) {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, reportPayload, mockPayment } = await req.json()

    if (!reportPayload) {
      return NextResponse.json({ error: 'Missing report payload' }, { status: 400 })
    }

    let isValid = false
    if (mockPayment && process.env.NODE_ENV !== 'production' && hasPlaceholderRazorpayKeys()) {
      isValid = true
    } else {
      if (hasPlaceholderRazorpayKeys()) {
        return NextResponse.json({ error: 'Razorpay is not configured' }, { status: 500 })
      }
      if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
        return NextResponse.json({ error: 'Missing Razorpay payment fields' }, { status: 400 })
      }

      const secret = process.env.RAZORPAY_KEY_SECRET!
      const body = razorpayOrderId + '|' + razorpayPaymentId
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(body)
        .digest('hex')

      isValid = signaturesMatch(expectedSignature, razorpaySignature)
    }

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      paymentId: razorpayPaymentId,
      accessToken: signReportAccess(reportPayload as ReportPayload),
    })
  } catch {
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
