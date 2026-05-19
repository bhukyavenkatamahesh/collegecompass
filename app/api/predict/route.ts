import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { ReportPayload, verifyReportAccess } from '@/lib/report-access'
import { expandProgramName } from '@/lib/program-names'
import { resolveInstituteState } from '@/lib/institute-state'
import {
  CATEGORIES,
  calculateChanceByRank,
  calculateChanceByScore,
  isGatePaperEligible,
  gateKeywordFallback,
  isGatePrimaryProgram,
  matchJeeBranch,
  normalizeJeeExamType,
  shouldFilterByBranch,
  usesCrlRank,
  CollegeResult,
} from '@/lib/predictor'

function positiveNumber(value: unknown): number | null {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

function positiveInteger(value: unknown): number | null {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      examType,
      rank,
      score,
      category,
      branch, // GATE paper code (CS/EC/ME/…) or JEE branch (CS/EC/ME/…)
      year = 2025,
      round, // optional — if not given, use best (min closeRank / max closeScore)
      instituteTypes, // optional array: ['IIT','NIT','IIIT','GFTI']
      gender = 'Male', // JEE only: 'Male' | 'Female'
      homeState = '', // JEE only: candidate's home state (for NIT/GFTI HS quota)
      crlRank, // JEE only: All-India CRL (needed for OPEN seats & CSAB)
      crl, // backwards-compatible alias used by older clients
      counselling, // JEE Main only: 'JOSAA' | 'CSAB'
      accessToken,
    } = body

    if (!examType || !category) {
      return NextResponse.json(
        { error: 'Missing required fields: examType, category' },
        { status: 400 }
      )
    }
    if (!CATEGORIES.includes(category)) {
      return NextResponse.json({ error: `Unsupported category: ${category}` }, { status: 400 })
    }

    // ── GATE prediction ──────────────────────────────────────────────────────
    if (examType === 'GATE') {
      const gateScore = positiveNumber(score)
      if (!gateScore) {
        return NextResponse.json({ error: 'Provide a valid GATE score' }, { status: 400 })
      }
      if (gateScore > 1000) {
        return NextResponse.json({ error: 'GATE score must be out of 1000' }, { status: 400 })
      }
      if (!branch) {
        return NextResponse.json(
          { error: 'Provide branch (GATE paper code) e.g. CS, EC, ME' },
          { status: 400 }
        )
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
      const bestMap = new Map<string, (typeof eligible)[0]>()
      for (const c of eligible) {
        const key = `${c.institute}||${c.program}||${c.category}`
        const existing = bestMap.get(key)

        const cMin = Math.min(c.openScore ?? 0, c.closeScore ?? 0)
        const extMin = existing
          ? Math.min(existing.openScore ?? 0, existing.closeScore ?? 0)
          : Infinity

        if (!existing || (cMin > 0 && cMin < extMin)) {
          bestMap.set(key, c)
        }
      }
      const deduplicated = Array.from(bestMap.values())

      // Score-based chance calculation
      const results: CollegeResult[] = deduplicated
        .map(c => {
          const openScore = c.openScore ?? 0
          const closeScore = c.closeScore ?? 0
          const { chance, percent } = calculateChanceByScore(gateScore, openScore, closeScore)
          const expandedProgram = expandProgramName(c.program)
          const isPrimary =
            isGatePrimaryProgram(expandedProgram, paper) || isGatePrimaryProgram(c.program, paper)
          return {
            institute: c.institute,
            program: expandedProgram,
            instituteType: (c.instituteType ?? 'GFTI') as CollegeResult['instituteType'],
            state: c.state || resolveInstituteState(c.institute),
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

      const reportPayload: ReportPayload = {
        examType: 'GATE',
        score: gateScore,
        category,
        branch: paper,
      }
      const hasFullAccess = verifyReportAccess(accessToken, reportPayload)

      return NextResponse.json({
        results: hasFullAccess ? results : results.slice(0, 3),
        examType,
        paper,
        score: gateScore,
        category,
        totalEligiblePrograms: eligible.length,
        totalResults: results.length,
        locked: !hasFullAccess,
      })
    }

    // ── JEE prediction (Advanced → IITs, Main → NIT/IIIT/GFTI) ───────────────
    // JoSAA admits IITs on the JEE *Advanced* rank and NITs/IIITs/GFTIs on the
    // JEE *Main* rank — two different rank scales, so they must NOT be mixed.
    const jeeExam = normalizeJeeExamType(examType)
    if (jeeExam) {
      const isJeeAdv = jeeExam === 'JEE_ADVANCED'
      const isJeeMain = jeeExam === 'JEE_MAIN'
      const catRank = positiveInteger(rank)
      if (!catRank) {
        return NextResponse.json(
          { error: `Provide a valid ${isJeeAdv ? 'JEE Advanced' : 'JEE Main'} rank` },
          { status: 400 }
        )
      }
      if (isJeeMain && !String(homeState).trim()) {
        return NextResponse.json(
          { error: 'Home state is required for JEE Main predictions' },
          { status: 400 }
        )
      }

      // Rank basis differs by source/seat:
      //  • JoSAA reserved-category cutoffs  → CATEGORY rank
      //  • JoSAA OPEN cutoffs               → CRL
      //  • CSAB (all seats)                 → CRL
      // A reserved candidate also competes for OPEN seats using their CRL.
      const crlValue = crlRank ?? crl
      const parsedCrl = crlValue ? positiveInteger(crlValue) : null
      if (crlValue && !parsedCrl) {
        return NextResponse.json({ error: 'Provide a valid CRL rank' }, { status: 400 })
      }
      const crlForUser = parsedCrl ?? (category === 'GEN' ? catRank : 0)
      // If a reserved user gives no CRL, CRL-basis rows can't be judged
      // fairly — push them to "Low" rather than falsely "High".
      const crlForCmp = crlForUser > 0 ? crlForUser : Number.MAX_SAFE_INTEGER
      const isFemale = String(gender).toLowerCase().startsWith('f')
      const home = String(homeState).trim().toLowerCase()
      const branchFilter = shouldFilterByBranch(branch) ? String(branch).trim() : ''
      // Exam scopes institute types: Advanced = IIT only; Main = the rest.
      const scope = isJeeAdv ? ['IIT'] : ['NIT', 'IIIT', 'GFTI']

      // Normalize quota labels
      // JoSAA uses: AI / HS / OS / GO / JK / LA
      // CSAB uses:  All India / Home State / Other State / DASA-CIWG / Jammu & Kashmir (UT) / Ladakh (UT)
      const quotaClass = (q: string | null): 'AI' | 'HS' | 'OS' | 'OTHER' => {
        const v = (q ?? '').toUpperCase().trim()
        if (v === 'AI' || v === 'ALL INDIA') return 'AI'
        if (v === 'HS' || v === 'HOME STATE' || v === 'HOME STATE FOR GOA') return 'HS'
        if (v === 'OS' || v === 'OTHER STATE') return 'OS'
        // Special quotas: GO (Goa), JK (J&K), LA (Ladakh) — treat as HS for those states
        if (v === 'GO') return home === 'goa' ? 'HS' : 'OTHER'
        if (v === 'JK' || v === 'JAMMU & KASHMIR (UT)')
          return home === 'j&k' || home === 'jammu & kashmir' ? 'HS' : 'OTHER'
        if (v === 'LA' || v === 'LADAKH (UT)') return home === 'ladakh' ? 'HS' : 'OTHER'
        // DASA is for foreign nationals — skip
        if (v.startsWith('DASA')) return 'OTHER'
        return 'OTHER'
      }

      // Restrict to the exam's institute types (optionally narrowed further
      // by a caller-supplied instituteTypes filter).
      const allowedTypes =
        instituteTypes && instituteTypes.length > 0
          ? scope.filter((t: string) => instituteTypes.includes(t))
          : scope
      // Reserved candidates are also eligible for OPEN (GEN) seats via CRL.
      const eligibleCats = category === 'GEN' ? ['GEN'] : [category, 'GEN']
      // Filter by counselling source (JoSAA vs CSAB) for JEE Main
      const counsellingSource = isJeeMain && counselling ? String(counselling).toUpperCase() : null
      const where: Record<string, unknown> = {
        examType: 'JEE',
        year,
        category: { in: eligibleCats },
        instituteType: { in: allowedTypes },
      }
      if (counsellingSource) where.source = counsellingSource
      if (round) where.round = round

      const allCutoffs = await prisma.cutoff.findMany({ where })

      const filtered = allCutoffs.filter(c => {
        // 1. Branch eligibility
        if (branchFilter && !matchJeeBranch(c.program, branchFilter).matches) return false
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
        return !stateMatch // OS: only when not the home state
      })

      // Dedup per institute+program+category+source+seatpool+quota — keep the
      // latest round (largest closing rank = the realistic "will I get it").
      const bestMap = new Map<string, (typeof filtered)[0]>()
      for (const c of filtered) {
        const key = `${c.institute}||${c.program}||${c.category}||${c.source}||${c.gender}||${quotaClass(c.quota)}`
        const ex = bestMap.get(key)
        if (!ex || c.round > ex.round) bestMap.set(key, c)
      }

      // Pick the correct rank to compare for each row.
      // CSAB always uses CRL for all seats (open + reserved).
      const isCsab = counsellingSource === 'CSAB'
      const haveCrl = crlForUser > 0
      const rankForRow = (c: { source: string | null; category: string }) =>
        isCsab ? crlForCmp : usesCrlRank(c.source, c.category) ? crlForCmp : catRank

      const results = Array.from(bestMap.values())
        .map(c => {
          const cmpRank = rankForRow(c)
          const { chance, percent } = calculateChanceByRank(cmpRank, c.openRank, c.closeRank)
          const expandedProgram = expandProgramName(c.program)
          const jeeMatch = branchFilter
            ? matchJeeBranch(expandedProgram, branchFilter)
            : { isPrimary: true, matches: true }
          const isPrimary =
            jeeMatch.isPrimary ||
            (branchFilter ? matchJeeBranch(c.program, branchFilter).isPrimary : true)
          const seatType =
            category !== 'GEN' && c.category === 'GEN'
              ? 'Open (via CRL)'
              : c.category === 'GEN'
                ? 'Open'
                : `${c.category} reserved`
          return {
            institute: c.institute,
            program: expandedProgram,
            instituteType: (c.instituteType ?? 'GFTI') as CollegeResult['instituteType'],
            state: c.state || resolveInstituteState(c.institute),
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
            rankBasis: isCsab ? 'CRL' : usesCrlRank(c.source, c.category) ? 'CRL' : 'Category rank',
            round: c.round,
            year: c.year,
          }
        })
        // Drop CRL-basis seats the user can't be judged for (no CRL given).
        .filter(
          c => c.chancePercent >= 5 && !(c.rankBasis === 'CRL' && !haveCrl && category !== 'GEN')
        )
        .sort((a, b) => {
          if (b.chancePercent !== a.chancePercent) return b.chancePercent - a.chancePercent
          return a.closeRank - b.closeRank
        })

      const reportPayload: ReportPayload = {
        examType: jeeExam,
        rank: catRank,
        crlRank: parsedCrl ?? undefined,
        category,
        gender: isFemale ? 'Female' : 'Male',
        homeState: isJeeAdv ? '' : homeState,
        branch: branchFilter || 'ALL',
      }
      const hasFullAccess = verifyReportAccess(accessToken, reportPayload)

      return NextResponse.json({
        results: hasFullAccess ? results : results.slice(0, 3),
        examType: jeeExam,
        exam: isJeeAdv ? 'JEE Advanced' : 'JEE Main',
        rankType: isJeeAdv ? 'JEE Advanced rank' : 'JEE Main rank',
        scope: allowedTypes,
        rank: catRank,
        crlRank: crlForUser || null,
        category,
        gender: isFemale ? 'Female' : 'Male',
        homeState: isJeeAdv ? '' : homeState,
        branch: branchFilter || 'ALL',
        totalEligiblePrograms: filtered.length,
        totalResults: results.length,
        locked: !hasFullAccess,
      })
    }

    return NextResponse.json({ error: `Unknown examType: ${examType}` }, { status: 400 })
  } catch (error) {
    console.error('Predict error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
