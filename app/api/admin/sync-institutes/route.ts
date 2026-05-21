import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getInstituteAbbreviation } from '@/lib/college-logos'

function guessType(name: string): string {
  const lower = name.toLowerCase()
  if (lower.includes('iisc')) return 'IISc'
  if (lower.includes('iit ') || lower.includes('indian institute of technology')) return 'IIT'
  if (lower.includes('national institute of technology') || /\bnit\b/.test(lower)) return 'NIT'
  if (
    lower.includes('indian institute of information technology') ||
    lower.includes('international institute of information technology') ||
    lower.includes('iiit')
  )
    return 'IIIT'
  if (lower.includes('nielit')) return 'NIELIT'
  if (lower.includes('school of planning')) return 'SPA'
  if (lower.includes('central university')) return 'Central Univ'
  return 'GFTI'
}

function guessCity(name: string): string | null {
  // Extract last meaningful word as a city hint — good enough for display
  const cleaned = name
    .replace(/\(.*?\)/g, '')
    .replace(/,.*$/, '')
    .trim()
  const words = cleaned.split(/\s+/)
  const last = words[words.length - 1]
  // Skip generic words
  if (
    ['university', 'institute', 'technology', 'management', 'campus'].includes(last.toLowerCase())
  ) {
    return words[words.length - 2] ?? null
  }
  return last || null
}

export async function POST() {
  // Aggregate per institute: distinct programs, distinct exam types, state
  const rows = await prisma.cutoff.groupBy({
    by: ['institute'],
    _count: { program: true },
  })

  // Get exam types and state per institute
  const examRows = await prisma.cutoff.findMany({
    distinct: ['institute', 'examType'],
    select: { institute: true, examType: true, state: true },
  })

  const examMap: Record<string, { examTypes: Set<string>; state: string | null }> = {}
  for (const r of examRows) {
    if (!examMap[r.institute])
      examMap[r.institute] = { examTypes: new Set(), state: r.state ?? null }
    examMap[r.institute].examTypes.add(r.examType)
    if (!examMap[r.institute].state && r.state) examMap[r.institute].state = r.state
  }

  // Also get distinct branch count per institute
  const branchRows = await prisma.cutoff.findMany({
    distinct: ['institute', 'program'],
    select: { institute: true, program: true },
  })
  const branchMap: Record<string, Set<string>> = {}
  for (const r of branchRows) {
    if (!branchMap[r.institute]) branchMap[r.institute] = new Set()
    branchMap[r.institute].add(r.program)
  }

  let upserted = 0
  for (const row of rows) {
    const name = row.institute
    const abbrev = getInstituteAbbreviation(name)
    const type = guessType(name)
    const city = guessCity(name)
    const state = examMap[name]?.state ?? null
    const examTypes = Array.from(examMap[name]?.examTypes ?? []).sort()
    const branchCount = branchMap[name]?.size ?? 0

    await prisma.institute.upsert({
      where: { name },
      create: { name, abbrev, type, state, city, branchCount, examTypes },
      update: { abbrev, type, state, city, branchCount, examTypes },
    })
    upserted++
  }

  return NextResponse.json({ ok: true, upserted })
}
