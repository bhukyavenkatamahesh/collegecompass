import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import {
  calculateChanceByRank,
  calculateChanceByScore,
  isGatePaperEligible,
  gateKeywordFallback,
  isGatePrimaryProgram,
  matchJeeBranch,
  CATEGORY_RANK_MULTIPLIERS,
  CollegeResult,
} from '@/lib/predictor'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      examType,
      rank,
      score,
      category,
      branch,       // GATE paper code (CS/EC/ME/…) or JEE branch (CS/EC/ME/…)
      year = 2025,
      round,        // optional — if not given, use best (min closeRank / max closeScore)
      instituteTypes, // optional array: ['IIT','NIT','IIIT','GFTI']
    } = body

    if (!examType || !category) {
      return NextResponse.json({ error: 'Missing required fields: examType, category' }, { status: 400 })
    }

    // ── GATE prediction ──────────────────────────────────────────────────────
    if (examType === 'GATE') {
      if (!score && !rank) {
        return NextResponse.json({ error: 'Provide score or rank for GATE' }, { status: 400 })
      }
      if (!branch) {
        return NextResponse.json({ error: 'Provide branch (GATE paper code) e.g. CS, EC, ME' }, { status: 400 })
      }

      const paper = branch.toUpperCase()

      // Fetch all GATE 2025 cutoffs for the requested category (and optionally institute type)
      const where: Record<string, unknown> = {
        examType: 'GATE',
        year,
        category,
      }
      if (instituteTypes && instituteTypes.length > 0) {
        where.instituteType = { in: instituteTypes }
      }

      const allCutoffs = await prisma.cutoff.findMany({ where })

      // Filter by paper eligibility
      // 1. Rows with `paper` set → use official mapping from CCMT
      // 2. Rows with `paper = NULL` → use keyword fallback on program name
      const eligible = allCutoffs.filter(c => {
        if (c.paper) {
          return isGatePaperEligible(paper, c.paper)
        }
        // Fallback: keyword match on program name
        return gateKeywordFallback(c.program, paper)
      })

      // Deduplicate: keep best cutoff per (institute, program, category)
      // "best" = highest closeScore (most recent final offer)
      const bestMap = new Map<string, typeof eligible[0]>()
      for (const c of eligible) {
        const key = `${c.institute}||${c.program}||${c.category}`
        const existing = bestMap.get(key)
        if (!existing ||
          (c.closeScore ?? 0) > (existing.closeScore ?? 0) ||
          ((c.closeScore ?? 0) === (existing.closeScore ?? 0) && (c.openScore ?? 0) > (existing.openScore ?? 0))
        ) {
          bestMap.set(key, c)
        }
      }
      const deduplicated = Array.from(bestMap.values())

      // Score-based chance calculation
      const gateScore = Number(score) || 0
      const results: CollegeResult[] = deduplicated
        .map(c => {
          const openScore = c.openScore ?? 0
          const closeScore = c.closeScore ?? 0
          const { chance, percent } = calculateChanceByScore(gateScore, openScore, closeScore)
          const isPrimary = isGatePrimaryProgram(c.program, paper)
          return {
            institute: c.institute,
            program: c.program,
            instituteType: (c.instituteType ?? 'GFTI') as CollegeResult['instituteType'],
            state: c.state ?? '',
            openRank: c.openRank,
            closeRank: c.closeRank,
            openScore,
            closeScore,
            chance,
            chancePercent: percent,
            isInterdisciplinary: !isPrimary,
            round: c.round,
            year: c.year,
          }
        })
        .filter(c => c.chancePercent >= 5)
        .sort((a, b) => {
          // Sort by chance desc, then closeScore desc
          if (b.chancePercent !== a.chancePercent) return b.chancePercent - a.chancePercent
          return b.closeScore - a.closeScore
        })

      return NextResponse.json({
        results,
        examType,
        paper,
        score: gateScore,
        category,
        totalEligiblePrograms: eligible.length,
        totalResults: results.length,
      })
    }

    // ── JEE prediction ───────────────────────────────────────────────────────
    if (examType === 'JEE') {
      if (!rank) {
        return NextResponse.json({ error: 'Provide rank for JEE' }, { status: 400 })
      }

      const effectiveRank = Math.round(Number(rank) / (CATEGORY_RANK_MULTIPLIERS[category] ?? 1))

      // Build query — for JEE we fetch ALL programs and filter by branch matching
      const where: Record<string, unknown> = {
        examType: 'JEE',
        year,
        category,
      }
      if (instituteTypes && instituteTypes.length > 0) {
        where.instituteType = { in: instituteTypes }
      }
      // Optional round filter
      if (round) where.round = round

      const allCutoffs = await prisma.cutoff.findMany({ where })

      // Filter by branch eligibility
      let filtered = allCutoffs
      if (branch) {
        filtered = allCutoffs.filter(c => {
          const { matches } = matchJeeBranch(c.program, branch)
          return matches
        })
      }

      // Deduplicate: per (institute, program, category) keep best round (highest closeRank = most competitive = latest round)
      const bestMap = new Map<string, typeof filtered[0]>()
      for (const c of filtered) {
        const key = `${c.institute}||${c.program}||${c.category}`
        const existing = bestMap.get(key)
        if (!existing || c.round > existing.round) {
          bestMap.set(key, c)
        }
      }
      const deduplicated = Array.from(bestMap.values())

      const results: CollegeResult[] = deduplicated
        .map(c => {
          const { chance, percent } = calculateChanceByRank(effectiveRank, c.openRank, c.closeRank)
          const { isPrimary } = branch ? matchJeeBranch(c.program, branch) : { isPrimary: true }
          return {
            institute: c.institute,
            program: c.program,
            instituteType: (c.instituteType ?? 'GFTI') as CollegeResult['instituteType'],
            state: c.state ?? '',
            openRank: c.openRank,
            closeRank: c.closeRank,
            openScore: c.openScore ?? 0,
            closeScore: c.closeScore ?? 0,
            chance,
            chancePercent: percent,
            isInterdisciplinary: !isPrimary,
            round: c.round,
            year: c.year,
          }
        })
        .filter(c => c.chancePercent >= 5)
        .sort((a, b) => {
          if (b.chancePercent !== a.chancePercent) return b.chancePercent - a.chancePercent
          return a.closeRank - b.closeRank  // lower closeRank = more competitive = better
        })

      return NextResponse.json({
        results,
        examType,
        rank: Number(rank),
        effectiveRank,
        category,
        branch: branch ?? 'ALL',
        totalEligiblePrograms: filtered.length,
        totalResults: results.length,
      })
    }

    return NextResponse.json({ error: `Unknown examType: ${examType}` }, { status: 400 })

  } catch (error) {
    console.error('Predict error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
