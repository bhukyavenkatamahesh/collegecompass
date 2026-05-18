import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import {
  calculateChanceByRank,
  calculateChanceByScore,
  isGatePaperEligible,
  gateKeywordFallback,
  isGatePrimaryProgram,
  matchJeeBranch,
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
      gender = 'Male',   // JEE only: 'Male' | 'Female'
      homeState = '',    // JEE only: candidate's home state (for NIT/GFTI HS quota)
      crlRank,           // JEE only: All-India CRL (needed for OPEN seats & CSAB)
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

      // Deduplicate: keep the least competitive cutoff per (institute, program, category)
      // "least competitive" = lowest minimum score admitted (usually the last round)
      const bestMap = new Map<string, typeof eligible[0]>()
      for (const c of eligible) {
        const key = `${c.institute}||${c.program}||${c.category}`
        const existing = bestMap.get(key)
        
        const cMin = Math.min(c.openScore ?? 0, c.closeScore ?? 0)
        const extMin = existing ? Math.min(existing.openScore ?? 0, existing.closeScore ?? 0) : Infinity

        if (!existing || (cMin > 0 && cMin < extMin)) {
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

    // ── JEE prediction (Advanced → IITs, Main → NIT/IIIT/GFTI) ───────────────
    // JoSAA admits IITs on the JEE *Advanced* rank and NITs/IIITs/GFTIs on the
    // JEE *Main* rank — two different rank scales, so they must NOT be mixed.
    const isJeeAdv = examType === 'JEE_ADV'
    const isJeeMain = examType === 'JEE_MAIN' || examType === 'JEE'
    if (isJeeAdv || isJeeMain) {
      if (!rank) {
        return NextResponse.json({ error: 'Provide rank for JEE' }, { status: 400 })
      }

      // Rank basis differs by source/seat:
      //  • JoSAA reserved-category cutoffs  → CATEGORY rank
      //  • JoSAA OPEN cutoffs               → CRL
      //  • CSAB (all seats)                 → CRL
      // A reserved candidate also competes for OPEN seats using their CRL.
      const catRank = Number(rank)                                  // category rank (=CRL for GEN)
      const crl = Number(crlRank) || (category === 'GEN' ? catRank : 0)
      // If a reserved user gives no CRL, CRL-basis rows can't be judged
      // fairly — push them to "Low" rather than falsely "High".
      const crlForCmp = crl > 0 ? crl : Number.MAX_SAFE_INTEGER
      const isFemale = String(gender).toLowerCase().startsWith('f')
      const home = String(homeState).trim().toLowerCase()
      // Exam scopes institute types: Advanced = IIT only; Main = the rest.
      const scope = isJeeAdv ? ['IIT'] : ['NIT', 'IIIT', 'GFTI']

      // Normalize the messy quota labels (JoSAA: AI/HS/OS — CSAB: All India/…)
      const quotaClass = (q: string | null): 'AI' | 'HS' | 'OS' | 'OTHER' => {
        const v = (q ?? '').toUpperCase()
        if (v === 'AI' || v === 'ALL INDIA') return 'AI'
        if (v.startsWith('HS') || v.startsWith('HOME STATE')) return 'HS'
        if (v.startsWith('OS') || v.startsWith('OTHER STATE')) return 'OS'
        return 'OTHER'
      }

      // Restrict to the exam's institute types (optionally narrowed further
      // by a caller-supplied instituteTypes filter).
      const allowedTypes = instituteTypes && instituteTypes.length > 0
        ? scope.filter((t: string) => instituteTypes.includes(t))
        : scope
      // Reserved candidates are also eligible for OPEN (GEN) seats via CRL.
      const eligibleCats = category === 'GEN' ? ['GEN'] : [category, 'GEN']
      const where: Record<string, unknown> = {
        examType: 'JEE', year,
        category: { in: eligibleCats },
        instituteType: { in: allowedTypes },
      }
      if (round) where.round = round

      const allCutoffs = await prisma.cutoff.findMany({ where })

      const filtered = allCutoffs.filter(c => {
        // 1. Branch eligibility
        if (branch && !matchJeeBranch(c.program, branch).matches) return false
        // 2. Seat pool (gender). Males: Gender-Neutral only.
        //    Females: Gender-Neutral + Female-only seats.
        const gn = c.gender === 'Gender-Neutral'
        const fo = (c.gender ?? '').startsWith('Female-only')
        if (!gn && !(isFemale && fo)) return false
        // 3. Quota. IIT/IIIT = All-India only. NIT/GFTI = HS at home
        //    state, OS elsewhere; AI always allowed.
        const qc = quotaClass(c.quota)
        if (qc === 'OTHER') return false
        const it = c.instituteType ?? 'GFTI'
        if (it === 'IIT' || it === 'IIIT') return qc === 'AI'
        const stateMatch = !!home && (c.state ?? '').toLowerCase() === home
        if (qc === 'AI') return true
        if (qc === 'HS') return stateMatch
        return !stateMatch  // OS: only when not the home state
      })

      // Dedup per institute+program+category+source+seatpool+quota — keep the
      // latest round (largest closing rank = the realistic "will I get it").
      const bestMap = new Map<string, typeof filtered[0]>()
      for (const c of filtered) {
        const key = `${c.institute}||${c.program}||${c.category}||${c.source}||${c.gender}||${quotaClass(c.quota)}`
        const ex = bestMap.get(key)
        if (!ex || c.round > ex.round) bestMap.set(key, c)
      }

      // Pick the correct rank to compare for each row.
      const haveCrl = crl > 0
      const usesCrl = (c: { source: string | null; category: string }) =>
        !((c.source ?? 'JOSAA') === 'JOSAA' && c.category !== 'GEN')
      const rankForRow = (c: { source: string | null; category: string }) =>
        usesCrl(c) ? crlForCmp : catRank

      const results = Array.from(bestMap.values())
        .map(c => {
          const cmpRank = rankForRow(c)
          const { chance, percent } = calculateChanceByRank(cmpRank, c.openRank, c.closeRank)
          const { isPrimary } = branch ? matchJeeBranch(c.program, branch) : { isPrimary: true }
          const seatType = (category !== 'GEN' && c.category === 'GEN')
            ? 'Open (via CRL)'
            : c.category === 'GEN' ? 'Open' : `${c.category} reserved`
          return {
            institute: c.institute,
            program: c.program,
            instituteType: (c.instituteType ?? 'GFTI') as CollegeResult['instituteType'],
            state: c.state ?? '',
            openRank: c.openRank,
            closeRank: c.closeRank,
            openScore: 0,
            closeScore: 0,
            chance,
            chancePercent: percent,
            isInterdisciplinary: !isPrimary,
            seatPool: (c.gender ?? '').startsWith('Female-only') ? 'Female-only' : 'Gender-Neutral',
            quota: quotaClass(c.quota),
            seatType,
            source: c.source ?? 'JOSAA',
            rankBasis: ((c.source ?? 'JOSAA') === 'JOSAA' && c.category !== 'GEN') ? 'Category rank' : 'CRL',
            round: c.round,
            year: c.year,
          }
        })
        // Drop CRL-basis seats the user can't be judged for (no CRL given).
        .filter(c => c.chancePercent >= 5 &&
          !(c.rankBasis === 'CRL' && !haveCrl && category !== 'GEN'))
        .sort((a, b) => {
          if (b.chancePercent !== a.chancePercent) return b.chancePercent - a.chancePercent
          return a.closeRank - b.closeRank
        })

      return NextResponse.json({
        results,
        examType,
        exam: isJeeAdv ? 'JEE Advanced' : 'JEE Main',
        rankType: isJeeAdv ? 'JEE Advanced rank' : 'JEE Main rank',
        scope: allowedTypes,
        rank: catRank,
        crlRank: crl || null,
        category,
        gender: isFemale ? 'Female' : 'Male',
        homeState: isJeeAdv ? '' : homeState,
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
