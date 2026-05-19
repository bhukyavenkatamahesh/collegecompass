import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth-config'
import { prisma } from '@/lib/db'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const predictions = await prisma.savedPrediction.findMany({
    where: { userId: session.user.id },
    orderBy: { paidAt: 'desc' },
    select: {
      id: true,
      examType: true,
      counselling: true,
      inputs: true,
      totalResults: true,
      accessToken: true,
      paidAt: true,
      createdAt: true,
    },
  })

  return NextResponse.json({ predictions })
}
