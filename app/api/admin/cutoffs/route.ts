import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

function getAdmin(req: NextRequest) {
  const token = req.cookies.get('admin_token')?.value
  if (!token) return null
  return verifyToken(token)
}

const CATEGORIES = new Set([
  'GEN',
  'OBC',
  'SC',
  'ST',
  'EWS',
  'GEN-PwD',
  'EWS-PwD',
  'OBC-PwD',
  'SC-PwD',
  'ST-PwD',
])
const EXAMS = new Set(['GATE', 'JEE'])
const INSTITUTE_TYPES = new Set(['IIT', 'NIT', 'IIIT', 'GFTI'])

function positiveInteger(value: unknown) {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null
}

function validateCutoffPayload(data: Record<string, unknown>, partial = false) {
  const required = [
    'examType',
    'year',
    'institute',
    'program',
    'category',
    'openRank',
    'closeRank',
  ] as const
  if (!partial) {
    for (const key of required) {
      if (data[key] === undefined || data[key] === null || data[key] === '') {
        return `Missing ${key}`
      }
    }
  }
  if (data.examType && !EXAMS.has(String(data.examType))) return 'Invalid exam type'
  if (data.category && !CATEGORIES.has(String(data.category))) return 'Invalid category'
  if (data.instituteType && !INSTITUTE_TYPES.has(String(data.instituteType)))
    return 'Invalid institute type'
  for (const key of ['year', 'round', 'openRank', 'closeRank'] as const) {
    if (
      data[key] !== undefined &&
      data[key] !== null &&
      data[key] !== '' &&
      !positiveInteger(data[key])
    ) {
      return `Invalid ${key}`
    }
  }
  return null
}

export async function GET(req: NextRequest) {
  if (!getAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const limit = Math.min(100, parseInt(searchParams.get('limit') ?? '50'))
  const search = searchParams.get('q') ?? ''
  const skip = (page - 1) * limit

  const where = search
    ? {
        OR: [
          { institute: { contains: search } },
          { program: { contains: search } },
          { examType: { contains: search } },
        ],
      }
    : {}

  const [cutoffs, total] = await Promise.all([
    prisma.cutoff.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: limit }),
    prisma.cutoff.count({ where }),
  ])

  return NextResponse.json({ cutoffs, total, page, limit, pages: Math.ceil(total / limit) })
}

export async function POST(req: NextRequest) {
  if (!getAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const data = await req.json()
  const validationError = validateCutoffPayload(data)
  if (validationError) return NextResponse.json({ error: validationError }, { status: 400 })

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
  const validationError = validateCutoffPayload(fields, true)
  if (validationError) return NextResponse.json({ error: validationError }, { status: 400 })

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
