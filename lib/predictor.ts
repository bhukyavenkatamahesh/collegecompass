export type Category = 'GEN' | 'OBC' | 'SC' | 'ST' | 'EWS' | 'GEN-PwD' | 'OBC-PwD' | 'SC-PwD' | 'ST-PwD' | 'EWS-PwD'
export type InstituteType = 'IIT' | 'NIT' | 'IIIT' | 'GFTI'
export type JeeExamType = 'JEE_MAIN' | 'JEE_ADVANCED'

export interface CollegeResult {
  institute: string
  program: string
  instituteType: InstituteType
  state: string
  openRank: number
  closeRank: number
  openScore: number
  closeScore: number
  chance: 'High' | 'Medium' | 'Low'
  chancePercent: number
  isInterdisciplinary: boolean   // program outside student's primary branch
  round?: number
  year?: number
}

export const CATEGORIES: Category[] = [
  'GEN', 'EWS', 'OBC', 'SC', 'ST',
  'GEN-PwD', 'EWS-PwD', 'OBC-PwD', 'SC-PwD', 'ST-PwD',
]

export function normalizeJeeExamType(examType: string): JeeExamType | null {
  if (examType === 'JEE_MAIN' || examType === 'JEE') return 'JEE_MAIN'
  if (examType === 'JEE_ADVANCED' || examType === 'JEE_ADV') return 'JEE_ADVANCED'
  return null
}

export function shouldFilterByBranch(branch: string | null | undefined): boolean {
  const value = String(branch ?? '').trim().toUpperCase()
  return value !== '' && value !== 'ALL'
}

export function usesCrlRank(source: string | null | undefined, category: string): boolean {
  return !((source ?? 'JOSAA') === 'JOSAA' && category !== 'GEN')
}

// ─────────────────────────────────────────────────────────────────────────────
// GATE paper filtering
//
// The CCMT DB stores a `paper` column per cutoff row that comes directly from
// the official CCMT eligibility mapping. Values include:
//   "CS", "EC", "ME", "CS/DA/EC", "ALL", "EE/EC/IN", etc.
//
// We parse these to check if the student's paper is eligible.
// For IIT rows where `paper` is NULL (unstructured CCMT data), we fall back
// to keyword matching against the program name using well-known patterns.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns true if the student's GATE paper is eligible for a cutoff row.
 * Handles multi-paper strings like "CS/DA/EC" and "ALL".
 */
export function isGatePaperEligible(studentPaper: string, dbPaper: string | null): boolean {
  if (!dbPaper) return false  // handled separately by keyword fallback
  const p = dbPaper.toUpperCase().trim()
  const sp = studentPaper.toUpperCase().trim()
  if (p === 'ALL' || p === 'GATE') return true
  // Split on / or , or space
  const parts = p.split(/[/,\s]+/).map(x => x.trim()).filter(Boolean)
  return parts.some(part => part === sp)
}

// ─────────────────────────────────────────────────────────────────────────────
// JEE — branch to program keyword map
//
// Used for JEE predictions where the DB doesn't store paper eligibility.
// A CS student can apply to CS, AI, Data Science, Software, etc. as these
// are all explicitly available in JoSAA for JEE candidates.
// ─────────────────────────────────────────────────────────────────────────────
export const JEE_BRANCH_KEYWORDS: Record<string, { primary: string[]; related: string[] }> = {
  CS: {
    primary: [
      'computer science', 'cse', 'software engineering', 'information technology',
      'information security', 'cyber security',
    ],
    related: [
      // AI/ML/Data — explicitly separate tracks but CS-eligible at all IITs/NITs
      'artificial intelligence', 'machine learning', 'data science',
      'data analytics', 'data engineering', 'computational',
      'advanced computing', 'human computer interaction',
      // Interdisciplinary CS-eligible programs
      'mathematics and computing',   // IIT Delhi, IIT Roorkee — CS eligible
      'internet of things',
      'blockchain',
      'quantum computing',
      'digital',
      'robotics',                    // accepted at several IITs for CS background
    ],
  },
  EC: {
    primary: [
      'electronics', 'communication', 'vlsi', 'signal processing',
      'embedded', 'wireless', 'rf', 'photonics', 'microelectronics',
    ],
    related: [
      'electrical and electronics',
      'robotics', 'internet of things',
      'artificial intelligence and data engineering',  // IIT Guwahati EC+AI
      'biomedical engineering',
      'instrumentation',
    ],
  },
  EE: {
    primary: [
      'electrical', 'power systems', 'power electronics', 'control systems',
      'smart grid', 'renewable energy', 'electric vehicles',
    ],
    related: [
      'electronics and electrical', 'instrumentation',
      'robotics', 'mechatronics',
    ],
  },
  ME: {
    primary: [
      'mechanical', 'thermal', 'manufacturing', 'production', 'design',
      'automobile', 'automotive', 'aerospace', 'cad', 'cam',
    ],
    related: [
      'mechatronics', 'industrial', 'additive manufacturing',
      'energy', 'robotics', 'naval architecture',
    ],
  },
  CE: {
    primary: ['civil', 'structural', 'geotechnical', 'transportation',
              'environmental', 'water', 'construction', 'urban', 'infrastructure'],
    related: ['architecture', 'planning'],
  },
  CH: {
    primary: ['chemical', 'process', 'biochemical', 'petroleum', 'polymer'],
    related: ['pharmaceutical', 'bioprocess', 'materials'],
  },
  BT: {
    primary: ['biotechnology', 'bioinformatics', 'biochemical', 'bioprocess'],
    related: ['biomedical', 'pharmaceutical', 'bioscience'],
  },
  MINING: { primary: ['mining', 'mineral'], related: ['geomechanics'] },
  METALLURGY: { primary: ['metallurgy', 'materials', 'corrosion'], related: [] },
  AEROSPACE: { primary: ['aerospace', 'aeronautical', 'flight'], related: [] },
  ARCH: { primary: ['architecture', 'planning', 'urban design'], related: [] },
  PHYSICS: { primary: ['engineering physics', 'applied physics', 'photonics'], related: [] },
  MATH: { primary: ['mathematics and computing', 'statistics', 'operations research'], related: [] },
}

/** Check if a JEE program name matches a branch's keywords */
export function matchJeeBranch(
  program: string,
  branch: string
): { matches: boolean; isPrimary: boolean } {
  const low = program.toLowerCase()
  const key = branch.toUpperCase().replace('CSE', 'CS')
  const entry = JEE_BRANCH_KEYWORDS[key]
  if (!entry) {
    // Unknown branch — do a loose match on the branch name itself
    const matches = low.includes(branch.toLowerCase())
    return { matches, isPrimary: matches }
  }
  const primaryMatch = entry.primary.some(kw => low.includes(kw))
  if (primaryMatch) return { matches: true, isPrimary: true }
  const relatedMatch = entry.related.some(kw => low.includes(kw))
  return { matches: relatedMatch, isPrimary: false }
}

// ─────────────────────────────────────────────────────────────────────────────
// GATE fallback keyword matching (for rows where paper=NULL in DB)
// These are IIT program names from CCMT that lack structured paper data.
// We use conservative, well-known mappings only.
// ─────────────────────────────────────────────────────────────────────────────
export const GATE_FALLBACK_KEYWORDS: Record<string, string[]> = {
  CS: [
    'computer science', 'cse', 'software', 'information technology',
    'information security', 'cyber security',
    'artificial intelligence', 'machine learning', 'data science',
    'data analytics', 'data engineering', 'computational',
    'advanced computing', 'quantum computing',
    'robotics and autonomous',   // IIT Bombay CSE eligible
    'cognitive systems',
    'management sciences',       // IIT Delhi JTM — CS/EC eligible
    'mobility engineering',
    'smart mobility',
    'geoinformatics',            // IIT Bombay CS eligible
  ],
  EC: [
    'electronics', 'communication', 'vlsi', 'signal processing',
    'embedded', 'wireless', 'photonics', 'microelectronics',
    'advanced communication', 'rf', 'instrumentation',
    'robotics and autonomous',
    'management sciences',       // IIT Delhi JTM — CS/EC eligible
    'biomedical engineering',
    'autonomous systems',
    'smart manufacturing',       // EC paper at some IITs
  ],
  EE: [
    'electrical', 'power systems', 'power electronics', 'control',
    'smart grid', 'renewable energy', 'drives', 'machines',
    'instrumentation', 'embedded systems',
    'robotics',
  ],
  ME: [
    'mechanical', 'thermal', 'manufacturing', 'production', 'design',
    'automobile', 'automotive', 'aerospace', 'cad', 'cam',
    'robotics', 'mechatronics', 'additive', 'industrial engineering',
    'mobility engineering', 'smart manufacturing',
    'unmanned aerial',
  ],
  CE: [
    'civil', 'structural', 'geotechnical', 'transportation',
    'environmental', 'water resources', 'construction management',
    'urban', 'geoinformatics',
  ],
  CH: [
    'chemical', 'process', 'biochemical', 'petroleum', 'polymer',
    'pharmaceutical', 'bioprocess',
  ],
  IN: [
    'instrumentation', 'control', 'embedded', 'process control',
    'biomedical', 'signal processing', 'automation',
  ],
  BT: ['biotechnology', 'bioinformatics', 'biochemical', 'biomedical', 'bioprocess'],
  AE: ['aerospace', 'aeronautical', 'flight mechanics', 'propulsion', 'aerodynamics',
       'unmanned aerial'],
  DA: ['data science', 'artificial intelligence', 'statistics', 'analytics', 'machine learning'],
  MA: ['mathematics', 'statistics', 'operations research', 'financial mathematics'],
  PH: ['physics', 'applied physics', 'photonics', 'nanotechnology', 'quantum'],
  MT: ['metallurgy', 'materials', 'corrosion'],
  MN: ['mining', 'mineral'],
  AG: ['agriculture', 'food technology'],
  PI: ['production', 'industrial', 'supply chain', 'quality'],
  GG: ['geology', 'geophysics', 'earth science'],
  XE: ['fluid mechanics', 'thermodynamics', 'polymer', 'food technology'],
  AI: ['artificial intelligence', 'machine learning', 'data science', 'computer science'],
}

export function gateKeywordFallback(program: string, paper: string): boolean {
  const kws = GATE_FALLBACK_KEYWORDS[paper.toUpperCase()] ?? [paper.toLowerCase()]
  const low = program.toLowerCase()
  return kws.some(kw => low.includes(kw))
}

/** Check if a GATE program is in the "primary" discipline (not interdisciplinary) */
export function isGatePrimaryProgram(program: string, paper: string): boolean {
  const primaryKeywords: Record<string, string[]> = {
    CS: ['computer science', 'cse', 'software', 'information technology', 'information security'],
    EC: ['electronics', 'communication', 'vlsi', 'signal processing', 'photonics', 'wireless'],
    EE: ['electrical', 'power systems', 'power electronics', 'control systems'],
    ME: ['mechanical', 'thermal', 'manufacturing', 'production', 'automobile', 'automotive'],
    CE: ['civil', 'structural', 'geotechnical', 'water resources', 'transportation'],
    CH: ['chemical', 'process', 'biochemical', 'petroleum', 'polymer'],
    AE: ['aerospace', 'aeronautical', 'flight'],
    IN: ['instrumentation', 'control'],
    BT: ['biotechnology', 'bioinformatics'],
    DA: ['data science', 'artificial intelligence', 'machine learning', 'analytics'],
    MA: ['mathematics', 'statistics', 'operations research'],
    PH: ['physics', 'applied physics'],
    MT: ['metallurgy', 'materials'],
    MN: ['mining', 'mineral'],
  }
  const kws = primaryKeywords[paper.toUpperCase()] ?? []
  const low = program.toLowerCase()
  return kws.some(kw => low.includes(kw))
}

// ─────────────────────────────────────────────────────────────────────────────
// Chance calculation
// ─────────────────────────────────────────────────────────────────────────────
export function calculateChanceByRank(
  rank: number,
  openRank: number,
  closeRank: number
): { chance: 'High' | 'Medium' | 'Low'; percent: number } {
  if (openRank <= 0 && closeRank <= 0) return { chance: 'Low', percent: 5 }
  if (rank <= openRank) return { chance: 'High', percent: 90 }
  if (rank <= closeRank) {
    const pos = (rank - openRank) / Math.max(closeRank - openRank, 1)
    const percent = Math.round((1 - pos) * 75 + 15)
    return { chance: pos < 0.4 ? 'High' : 'Medium', percent }
  }
  const buffer = closeRank * 0.12
  if (rank <= closeRank + buffer) return { chance: 'Low', percent: 15 }
  return { chance: 'Low', percent: 5 }
}

export function calculateChanceByScore(
  score: number,
  openScore: number,
  closeScore: number
): { chance: 'High' | 'Medium' | 'Low'; percent: number } {
  if (openScore <= 0 && closeScore <= 0) return { chance: 'Low', percent: 5 }
  // For GATE: highest score admitted is maxAdmitted, lowest score is minAdmitted
  const maxAdmitted = Math.max(openScore, closeScore)
  const minAdmitted = Math.min(openScore, closeScore)

  if (score >= maxAdmitted) return { chance: 'High', percent: 90 }
  if (score >= minAdmitted) {
    const range = Math.max(maxAdmitted - minAdmitted, 1)
    const pos = (maxAdmitted - score) / range
    const percent = Math.round((1 - pos) * 75 + 15)
    return { chance: pos < 0.4 ? 'High' : 'Medium', percent }
  }
  const buffer = minAdmitted * 0.05
  if (score >= minAdmitted - buffer) return { chance: 'Low', percent: 15 }
  return { chance: 'Low', percent: 5 }
}

// Legacy alias
export const calculateChance = calculateChanceByRank

export const CATEGORY_RANK_MULTIPLIERS: Record<string, number> = {
  GEN: 1, EWS: 1.1, OBC: 1.3, SC: 2.0, ST: 2.5,
  'GEN-PwD': 1.5, 'EWS-PwD': 1.6, 'OBC-PwD': 1.8, 'SC-PwD': 2.5, 'ST-PwD': 3.0,
}
