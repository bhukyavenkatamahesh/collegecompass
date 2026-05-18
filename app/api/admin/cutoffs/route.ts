import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

function getAdmin(req: NextRequest) {
  const token = req.cookies.get('admin_token')?.value
  if (!token) return null
  return verifyToken(token)
}

export async function GET(req: NextRequest) {
  if (!getAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const cutoffs = await prisma.cutoff.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json({ cutoffs })
}

export async function POST(req: NextRequest) {
  if (!getAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const data = await req.json()
  const cutoff = await prisma.cutoff.create({
    data: {
      examType: data.examType,
      year: Number(data.year),
      institute: data.institute,
      program: data.program,
      category: data.category,
      round: Number(data.round ?? 1),
      openRank: Number(data.openRank),
      closeRank: Number(data.closeRank),
      state: data.state ?? null,
      instituteType: data.instituteType ?? null,
    },
  })
  return NextResponse.json({ success: true, data: cutoff })
}

export async function PUT(req: NextRequest) {
  if (!getAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const data = await req.json()
  const { id, ...fields } = data
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const cutoff = await prisma.cutoff.update({
    where: { id },
    data: {
      ...(fields.examType && { examType: fields.examType }),
      ...(fields.year && { year: Number(fields.year) }),
      ...(fields.institute && { institute: fields.institute }),
      ...(fields.program && { program: fields.program }),
      ...(fields.category && { category: fields.category }),
      ...(fields.round && { round: Number(fields.round) }),
      ...(fields.openRank && { openRank: Number(fields.openRank) }),
      ...(fields.closeRank && { closeRank: Number(fields.closeRank) }),
      ...('state' in fields && { state: fields.state }),
      ...('instituteType' in fields && { instituteType: fields.instituteType }),
    },
  })
  return NextResponse.json({ success: true, data: cutoff })
}

export async function DELETE(req: NextRequest) {
  if (!getAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  await prisma.cutoff.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
