import { describe, it, expect } from 'vitest'
import {
  CATEGORIES,
  normalizeJeeExamType,
  shouldFilterByBranch,
  usesCrlRank,
  isGatePaperEligible,
  gateKeywordFallback,
  isGatePrimaryProgram,
  matchJeeBranch,
  calculateChanceByRank,
  calculateChanceByScore,
  CATEGORY_RANK_MULTIPLIERS,
} from '@/lib/predictor'

// ─────────────────────────────────────────────────────────────────────────────
// Categories
// ─────────────────────────────────────────────────────────────────────────────
describe('CATEGORIES', () => {
  it('has 10 categories', () => {
    expect(CATEGORIES).toHaveLength(10)
  })

  it('includes all standard JoSAA categories', () => {
    for (const c of ['GEN', 'EWS', 'OBC', 'SC', 'ST']) {
      expect(CATEGORIES).toContain(c)
    }
  })

  it('includes PwD variants', () => {
    for (const c of ['GEN-PwD', 'EWS-PwD', 'OBC-PwD', 'SC-PwD', 'ST-PwD']) {
      expect(CATEGORIES).toContain(c)
    }
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// normalizeJeeExamType
// ─────────────────────────────────────────────────────────────────────────────
describe('normalizeJeeExamType', () => {
  it('returns JEE_MAIN for "JEE_MAIN"', () => {
    expect(normalizeJeeExamType('JEE_MAIN')).toBe('JEE_MAIN')
  })

  it('returns JEE_MAIN for legacy "JEE"', () => {
    expect(normalizeJeeExamType('JEE')).toBe('JEE_MAIN')
  })

  it('returns JEE_ADVANCED for "JEE_ADVANCED"', () => {
    expect(normalizeJeeExamType('JEE_ADVANCED')).toBe('JEE_ADVANCED')
  })

  it('returns JEE_ADVANCED for alias "JEE_ADV"', () => {
    expect(normalizeJeeExamType('JEE_ADV')).toBe('JEE_ADVANCED')
  })

  it('returns null for GATE', () => {
    expect(normalizeJeeExamType('GATE')).toBeNull()
  })

  it('returns null for unknown exam types', () => {
    expect(normalizeJeeExamType('CAT')).toBeNull()
    expect(normalizeJeeExamType('')).toBeNull()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// shouldFilterByBranch
// ─────────────────────────────────────────────────────────────────────────────
describe('shouldFilterByBranch', () => {
  it('returns false for "ALL"', () => {
    expect(shouldFilterByBranch('ALL')).toBe(false)
  })

  it('returns false for empty / null / undefined', () => {
    expect(shouldFilterByBranch('')).toBe(false)
    expect(shouldFilterByBranch(null)).toBe(false)
    expect(shouldFilterByBranch(undefined)).toBe(false)
  })

  it('returns true for valid branches', () => {
    expect(shouldFilterByBranch('CS')).toBe(true)
    expect(shouldFilterByBranch('ME')).toBe(true)
    expect(shouldFilterByBranch('PHYSICS')).toBe(true)
  })

  it('is case-insensitive for ALL', () => {
    expect(shouldFilterByBranch('all')).toBe(false)
    expect(shouldFilterByBranch('All')).toBe(false)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// usesCrlRank
// ─────────────────────────────────────────────────────────────────────────────
describe('usesCrlRank', () => {
  it('JOSAA + GEN uses CRL', () => {
    expect(usesCrlRank('JOSAA', 'GEN')).toBe(true)
  })

  it('JOSAA + reserved category does NOT use CRL', () => {
    expect(usesCrlRank('JOSAA', 'OBC')).toBe(false)
    expect(usesCrlRank('JOSAA', 'SC')).toBe(false)
    expect(usesCrlRank('JOSAA', 'ST')).toBe(false)
    expect(usesCrlRank('JOSAA', 'EWS')).toBe(false)
  })

  it('CSAB always uses CRL regardless of category', () => {
    expect(usesCrlRank('CSAB', 'OBC')).toBe(true)
    expect(usesCrlRank('CSAB', 'SC')).toBe(true)
    expect(usesCrlRank('CSAB', 'GEN')).toBe(true)
  })

  it('null source defaults to JOSAA behavior', () => {
    expect(usesCrlRank(null, 'GEN')).toBe(true)
    expect(usesCrlRank(null, 'OBC')).toBe(false)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// GATE paper eligibility
// ─────────────────────────────────────────────────────────────────────────────
describe('isGatePaperEligible', () => {
  it('matches exact paper code', () => {
    expect(isGatePaperEligible('CS', 'CS')).toBe(true)
    expect(isGatePaperEligible('EC', 'EC')).toBe(true)
  })

  it('rejects non-matching paper', () => {
    expect(isGatePaperEligible('CS', 'ME')).toBe(false)
    expect(isGatePaperEligible('EC', 'CE')).toBe(false)
  })

  it('matches multi-paper strings like CS/DA/EC', () => {
    expect(isGatePaperEligible('CS', 'CS/DA/EC')).toBe(true)
    expect(isGatePaperEligible('DA', 'CS/DA/EC')).toBe(true)
    expect(isGatePaperEligible('EC', 'CS/DA/EC')).toBe(true)
    expect(isGatePaperEligible('ME', 'CS/DA/EC')).toBe(false)
  })

  it('matches "ALL" paper', () => {
    expect(isGatePaperEligible('CS', 'ALL')).toBe(true)
    expect(isGatePaperEligible('ME', 'ALL')).toBe(true)
  })

  it('matches "GATE" as catch-all', () => {
    expect(isGatePaperEligible('CS', 'GATE')).toBe(true)
  })

  it('returns false for null/empty dbPaper', () => {
    expect(isGatePaperEligible('CS', null)).toBe(false)
    expect(isGatePaperEligible('CS', '')).toBe(false)
  })

  it('is case-insensitive', () => {
    expect(isGatePaperEligible('cs', 'CS')).toBe(true)
    expect(isGatePaperEligible('CS', 'cs/ec')).toBe(true)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// GATE keyword fallback
// ─────────────────────────────────────────────────────────────────────────────
describe('gateKeywordFallback', () => {
  it('CS matches computer science programs', () => {
    expect(gateKeywordFallback('M.Tech Computer Science and Engineering', 'CS')).toBe(true)
    expect(gateKeywordFallback('M.Tech. in Artificial Intelligence', 'CS')).toBe(true)
    expect(gateKeywordFallback('M.Tech Data Science and AI', 'CS')).toBe(true)
  })

  it('CS does not match mechanical', () => {
    expect(gateKeywordFallback('M.Tech Mechanical Engineering', 'CS')).toBe(false)
  })

  it('ME matches mechanical programs', () => {
    expect(gateKeywordFallback('M.Tech Mechanical Engineering', 'ME')).toBe(true)
    expect(gateKeywordFallback('M.Tech Thermal Engineering', 'ME')).toBe(true)
    expect(gateKeywordFallback('M.Tech Manufacturing Technology', 'ME')).toBe(true)
  })

  it('EC matches electronics programs', () => {
    expect(gateKeywordFallback('M.Tech VLSI Design', 'EC')).toBe(true)
    expect(gateKeywordFallback('M.Tech Communication Engineering', 'EC')).toBe(true)
  })

  it('EE matches electrical programs', () => {
    expect(gateKeywordFallback('M.Tech Power Systems', 'EE')).toBe(true)
    expect(gateKeywordFallback('M.Tech Power Electronics', 'EE')).toBe(true)
  })

  it('unknown paper falls back to loose match', () => {
    expect(gateKeywordFallback('M.Tech Unknown Thing', 'ZZ')).toBe(false)
    expect(gateKeywordFallback('M.Tech ZZ Systems', 'ZZ')).toBe(true)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// isGatePrimaryProgram
// ─────────────────────────────────────────────────────────────────────────────
describe('isGatePrimaryProgram', () => {
  it('identifies CS primary programs', () => {
    expect(isGatePrimaryProgram('Computer Science and Engineering', 'CS')).toBe(true)
    expect(isGatePrimaryProgram('Software Engineering', 'CS')).toBe(true)
  })

  it('returns false for interdisciplinary programs', () => {
    expect(isGatePrimaryProgram('Artificial Intelligence and Machine Learning', 'CS')).toBe(false)
    expect(isGatePrimaryProgram('Robotics and Autonomous Systems', 'CS')).toBe(false)
  })

  it('returns false for wrong paper', () => {
    expect(isGatePrimaryProgram('Computer Science', 'ME')).toBe(false)
    expect(isGatePrimaryProgram('Mechanical Engineering', 'CS')).toBe(false)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// JEE branch matching
// ─────────────────────────────────────────────────────────────────────────────
describe('matchJeeBranch', () => {
  it('CS matches Computer Science programs as primary', () => {
    const r = matchJeeBranch('Computer Science and Engineering', 'CS')
    expect(r.matches).toBe(true)
    expect(r.isPrimary).toBe(true)
  })

  it('CS matches AI/ML as related (not primary)', () => {
    const r = matchJeeBranch('Artificial Intelligence and Machine Learning', 'CS')
    expect(r.matches).toBe(true)
    expect(r.isPrimary).toBe(false)
  })

  it('CS does not match Mechanical', () => {
    const r = matchJeeBranch('Mechanical Engineering', 'CS')
    expect(r.matches).toBe(false)
    expect(r.isPrimary).toBe(false)
  })

  it('ME matches Mechanical, Thermal, Manufacturing', () => {
    expect(matchJeeBranch('Mechanical Engineering', 'ME').matches).toBe(true)
    expect(matchJeeBranch('Thermal Engineering', 'ME').matches).toBe(true)
    expect(matchJeeBranch('Manufacturing Technology', 'ME').matches).toBe(true)
  })

  it('EE matches Electrical programs', () => {
    expect(matchJeeBranch('Electrical Engineering', 'EE').matches).toBe(true)
    expect(matchJeeBranch('Power Systems Engineering', 'EE').matches).toBe(true)
  })

  it('unknown branch does loose match on name', () => {
    const r = matchJeeBranch('Quantum Physics Engineering', 'quantum')
    expect(r.matches).toBe(true)
    expect(r.isPrimary).toBe(true) // unknown branches are always treated as primary
  })

  it('handles CSE alias for CS', () => {
    const r = matchJeeBranch('Computer Science and Engineering', 'CSE')
    expect(r.matches).toBe(true)
    expect(r.isPrimary).toBe(true)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Chance calculation — rank-based (JEE)
// ─────────────────────────────────────────────────────────────────────────────
describe('calculateChanceByRank', () => {
  it('rank better than openRank → High (90%)', () => {
    const r = calculateChanceByRank(500, 1000, 5000)
    expect(r.chance).toBe('High')
    expect(r.percent).toBe(90)
  })

  it('rank equal to openRank → High (90%)', () => {
    const r = calculateChanceByRank(1000, 1000, 5000)
    expect(r.chance).toBe('High')
    expect(r.percent).toBe(90)
  })

  it('rank between open and close → Medium or High with interpolated percent', () => {
    const r = calculateChanceByRank(3000, 1000, 5000)
    expect(r.percent).toBeGreaterThanOrEqual(15)
    expect(r.percent).toBeLessThanOrEqual(90)
    expect(['High', 'Medium']).toContain(r.chance)
  })

  it('rank just above closeRank (within 12% buffer) → Low (15%)', () => {
    const r = calculateChanceByRank(5500, 1000, 5000)
    expect(r.chance).toBe('Low')
    expect(r.percent).toBe(15)
  })

  it('rank far above closeRank → Low (5%)', () => {
    const r = calculateChanceByRank(10000, 1000, 5000)
    expect(r.chance).toBe('Low')
    expect(r.percent).toBe(5)
  })

  it('handles zero openRank and closeRank → Low (5%)', () => {
    const r = calculateChanceByRank(100, 0, 0)
    expect(r.chance).toBe('Low')
    expect(r.percent).toBe(5)
  })

  it('rank very close to open → High with high %', () => {
    const r = calculateChanceByRank(1100, 1000, 5000)
    expect(r.chance).toBe('High')
    expect(r.percent).toBeGreaterThan(70)
  })

  it('rank close to close → Medium with low %', () => {
    const r = calculateChanceByRank(4800, 1000, 5000)
    expect(r.chance).toBe('Medium')
    expect(r.percent).toBeLessThan(30)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Chance calculation — score-based (GATE)
// ─────────────────────────────────────────────────────────────────────────────
describe('calculateChanceByScore', () => {
  it('score above max admitted → High (90%)', () => {
    const r = calculateChanceByScore(800, 700, 600)
    expect(r.chance).toBe('High')
    expect(r.percent).toBe(90)
  })

  it('score equal to max admitted → High (90%)', () => {
    const r = calculateChanceByScore(700, 700, 600)
    expect(r.chance).toBe('High')
    expect(r.percent).toBe(90)
  })

  it('score between min and max → interpolated', () => {
    const r = calculateChanceByScore(650, 700, 600)
    expect(r.percent).toBeGreaterThanOrEqual(15)
    expect(r.percent).toBeLessThanOrEqual(90)
  })

  it('score slightly below min (within 5% buffer) → Low (15%)', () => {
    const r = calculateChanceByScore(575, 700, 600)
    expect(r.chance).toBe('Low')
    expect(r.percent).toBe(15)
  })

  it('score far below min → Low (5%)', () => {
    const r = calculateChanceByScore(400, 700, 600)
    expect(r.chance).toBe('Low')
    expect(r.percent).toBe(5)
  })

  it('handles zero scores → Low (5%)', () => {
    const r = calculateChanceByScore(750, 0, 0)
    expect(r.chance).toBe('Low')
    expect(r.percent).toBe(5)
  })

  it('handles inverted open/close (openScore < closeScore)', () => {
    // Some data has min score as openScore and max as closeScore
    const r = calculateChanceByScore(800, 600, 700)
    expect(r.chance).toBe('High')
    expect(r.percent).toBe(90)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Category rank multipliers
// ─────────────────────────────────────────────────────────────────────────────
describe('CATEGORY_RANK_MULTIPLIERS', () => {
  it('GEN has multiplier 1', () => {
    expect(CATEGORY_RANK_MULTIPLIERS.GEN).toBe(1)
  })

  it('ST has highest multiplier', () => {
    expect(CATEGORY_RANK_MULTIPLIERS.ST).toBeGreaterThan(CATEGORY_RANK_MULTIPLIERS.GEN)
    expect(CATEGORY_RANK_MULTIPLIERS.ST).toBeGreaterThan(CATEGORY_RANK_MULTIPLIERS.OBC)
  })

  it('PwD variants are higher than base', () => {
    expect(CATEGORY_RANK_MULTIPLIERS['GEN-PwD']).toBeGreaterThan(CATEGORY_RANK_MULTIPLIERS.GEN)
    expect(CATEGORY_RANK_MULTIPLIERS['OBC-PwD']).toBeGreaterThan(CATEGORY_RANK_MULTIPLIERS.OBC)
  })

  it('has entries for all 10 categories', () => {
    for (const c of [
      'GEN',
      'EWS',
      'OBC',
      'SC',
      'ST',
      'GEN-PwD',
      'EWS-PwD',
      'OBC-PwD',
      'SC-PwD',
      'ST-PwD',
    ]) {
      expect(CATEGORY_RANK_MULTIPLIERS[c]).toBeDefined()
    }
  })
})
