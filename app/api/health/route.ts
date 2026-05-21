import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  const start = Date.now()
  try {
    // Lightweight query — confirms DB connectivity and data presence
    const [cutoffCount, paymentCount] = await Promise.all([
      prisma.cutoff.count(),
      prisma.payment.count(),
    ])
    const dbMs = Date.now() - start

    return NextResponse.json({
      status: 'ok',
      db: 'connected',
      dbLatencyMs: dbMs,
      cutoffRows: cutoffCount,
      paymentRows: paymentCount,
      dataReady: cutoffCount > 0,
      ts: new Date().toISOString(),
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown'
    return NextResponse.json(
      { status: 'error', db: 'unreachable', error: message, ts: new Date().toISOString() },
      { status: 503 }
    )
  }
}
