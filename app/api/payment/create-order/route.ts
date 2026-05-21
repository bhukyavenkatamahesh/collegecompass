import { NextRequest, NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import { hasPlaceholderRazorpayKeys, reportFingerprint, ReportPayload } from '@/lib/report-access'
import { prisma } from '@/lib/db'
import { checkRateLimit, getClientIp, LIMITS } from '@/lib/rate-limit'

function normalizeExamType(value: unknown) {
  const examType = String(value ?? '')
    .trim()
    .toUpperCase()
  if (examType === 'GATE') return 'GATE'
  if (examType === 'JEE' || examType === 'JEE_MAIN' || examType === 'JEE_ADVANCED') return examType
  return null
}

function validEmail(value: unknown) {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim())
}

function validName(value: unknown) {
  return typeof value === 'string' && value.trim().length >= 2
}

function cleanPhone(value: unknown) {
  if (typeof value !== 'string') return null
  const phone = value.replace(/\s+/g, '')
  return phone || null
}

async function createPaymentRecord({
  name,
  email,
  phone,
  examType,
  razorpayOrderId,
  amount,
  currency,
  fingerprint,
}: {
  name: string
  email: string
  phone: string | null
  examType: string
  razorpayOrderId: string
  amount: number
  currency: string
  fingerprint: string | null
}) {
  const user = await prisma.user.upsert({
    where: { email },
    update: { name, phone },
    create: { name, email, phone },
  })

  await prisma.payment.create({
    data: {
      userId: user.id,
      razorpayOrderId,
      amount,
      currency,
      examType,
      status: 'created',
      // Lock the report fingerprint at order time so verify cannot be tampered with
      reportFingerprint: fingerprint,
    },
  })
}

export async function POST(req: NextRequest) {
  const limited = checkRateLimit(getClientIp(req.headers), LIMITS.paymentCreate)
  if (limited) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(limited.retryAfter) } }
    )
  }

  try {
    const { examType, name, email, phone, reportPayload } = await req.json()
    const normalizedExam = normalizeExamType(examType)
    if (!normalizedExam) {
      return NextResponse.json({ error: 'Invalid exam type' }, { status: 400 })
    }
    if (!validName(name) || !validEmail(email)) {
      return NextResponse.json({ error: 'Name and valid email are required' }, { status: 400 })
    }

    const cleanName = String(name).trim()
    const cleanEmail = String(email).trim().toLowerCase()
    const cleanContact = cleanPhone(phone)
    // Compute fingerprint from the report parameters the user is paying for.
    // Stored now so verify cannot be swapped for a different report.
    const fingerprint = reportPayload ? reportFingerprint(reportPayload as ReportPayload) : null

    const amount =
      normalizedExam === 'GATE'
        ? parseInt(process.env.GATE_PRICE || '4900')
        : parseInt(process.env.JEE_PRICE || '4900')
    const currency = 'INR'

    if (hasPlaceholderRazorpayKeys()) {
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'Razorpay is not configured' }, { status: 500 })
      }
      const orderId = `order_mock_${Date.now()}`
      await createPaymentRecord({
        name: cleanName,
        email: cleanEmail,
        phone: cleanContact,
        examType: normalizedExam,
        razorpayOrderId: orderId,
        amount,
        currency,
        fingerprint,
      })
      return NextResponse.json({
        orderId,
        amount,
        currency,
        keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        mock: true,
      })
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    })
    const order = await razorpay.orders.create({
      amount,
      currency,
      receipt: `receipt_${Date.now()}`,
      notes: {
        examType: normalizedExam,
        email: cleanEmail,
      },
    })
    await createPaymentRecord({
      name: cleanName,
      email: cleanEmail,
      phone: cleanContact,
      examType: normalizedExam,
      razorpayOrderId: order.id,
      amount: Number(order.amount ?? amount),
      currency: String(order.currency ?? currency),
      fingerprint,
    })

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    })
  } catch (error) {
    console.error('Create order error:', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
