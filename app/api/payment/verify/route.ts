import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { ReportPayload, hasPlaceholderRazorpayKeys, signReportAccess } from '@/lib/report-access'

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
      const secret = process.env.RAZORPAY_KEY_SECRET || ''
      const body = razorpayOrderId + '|' + razorpayPaymentId
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(body)
        .digest('hex')

      isValid = expectedSignature === razorpaySignature
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
