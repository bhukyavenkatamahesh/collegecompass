import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

function getAdmin(req: NextRequest) {
  const token = req.cookies.get('admin_token')?.value
  if (!token) return null
  return verifyToken(token)
}

function startOfToday() {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  return date
}

export async function GET(req: NextRequest) {
  if (!getAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)))
  const skip = (page - 1) * limit
  const paidWhere = { status: 'paid' }

  const [payments, paidCount, totalCount, revenue, revenueToday, predictions] = await Promise.all([
    prisma.payment.findMany({
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        user: { select: { name: true, email: true, phone: true } },
      },
    }),
    prisma.payment.count({ where: paidWhere }),
    prisma.payment.count(),
    prisma.payment.aggregate({ where: paidWhere, _sum: { amount: true } }),
    prisma.payment.aggregate({
      where: { ...paidWhere, paidAt: { gte: startOfToday() } },
      _sum: { amount: true },
    }),
    prisma.savedPrediction.count(),
  ])

  return NextResponse.json({
    payments: payments.map(
      (payment: {
        id: string
        amount: number
        currency: string
        status: string
        examType: string
        razorpayOrderId: string
        razorpayPaymentId: string | null
        createdAt: Date
        paidAt: Date | null
        user: unknown
      }) => ({
        id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        examType: payment.examType,
        razorpayOrderId: payment.razorpayOrderId,
        razorpayPaymentId: payment.razorpayPaymentId,
        createdAt: payment.createdAt,
        paidAt: payment.paidAt,
        user: payment.user,
      })
    ),
    stats: {
      paidCount,
      totalCount,
      revenuePaise: revenue._sum.amount ?? 0,
      revenueTodayPaise: revenueToday._sum.amount ?? 0,
      predictions,
    },
    page,
    limit,
    pages: Math.ceil(totalCount / limit),
  })
}
