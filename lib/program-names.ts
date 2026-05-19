/**
 * COAP / CCMT program code → human-readable name mapping.
 * Sources: COAP IIT M.Tech codes, CCMT NIT/IIIT/GFTI codes.
 * Codes with suffixes like 1N/1Y/2N etc. indicate specialization variants;
 * we strip the suffix and map the base code.
 */

const PROGRAM_CODE_MAP: Record<string, string> = {
  // ── Aerospace ──
  AE: 'Aerospace Engineering',
  // ── Agricultural ──
  AG: 'Agricultural Engineering',
  // ── AI / Data Science ──
  AI: 'Artificial Intelligence',
  AIB: 'Artificial Intelligence & Biotechnology',
  AIR: 'Artificial Intelligence & Robotics',
  DA: 'Data Science & AI',
  DAD: 'Data Analytics & Decision Sciences',
  // ── Applied Mathematics ──
  AMA: 'Applied Mathematics',
  AM: 'Applied Mechanics',
  MA: 'Mathematics',
  MAC: 'Mathematics & Computing',
  // ── Astronomy ──
  AST: 'Astronomy & Astrophysics',
  // ── Biotechnology / Biomedical ──
  BBE: 'Biochemical Engineering & Biotechnology',
  BEM: 'Biomedical Engineering',
  BMT: 'Biomolecular Engineering',
  BRE: 'Bioresource Engineering',
  BT: 'Biotechnology',
  // ── Chemical ──
  CH: 'Chemical Engineering',
  CHE: 'Chemical Engineering',
  'Ch.E': 'Chemical Engineering',
  CL: 'Chemical Engineering',
  // ── Civil & related ──
  CE: 'Civil Engineering',
  CEG: 'Geotechnical Engineering',
  CEP: 'Transportation Engineering',
  CES: 'Structural Engineering',
  CET: 'Environmental Engineering',
  CEU: 'Urban Engineering',
  CEV: 'Water Resources Engineering',
  CEW: 'Geomatics & Surveying Engineering',
  CIE: 'Civil & Infrastructure Engineering',
  CIN: 'Construction Engineering & Management',
  // ── Computer Science ──
  CS: 'Computer Science & Engineering',
  CSA: 'Computer Science & Automation',
  CSE: 'Computer Science & Engineering',
  CSPML: 'CS — Pattern Recognition & ML',
  MCS: 'Computer Science & Engineering',
  JCS: 'Computer Science',
  // ── Communication / RF ──
  CRF: 'RF & Microwave Engineering',
  CTE: 'Communication & Telecom Engineering',
  // ── Cyber / Information Security ──
  CYM: 'Cyber Security',
  IQT: 'Information Security & Quantum Technology',
  IRM: 'Information & Risk Management',
  // ── Design ──
  Design: 'Design',
  JID: 'Industrial Design',
  // ── Electrical / Electronics ──
  EE: 'Electrical Engineering',
  EEA: 'Electrical — Control & Automation',
  EEC: 'Electrical — Communication Engineering',
  EEE: 'Electrical — Power Electronics',
  EEI: 'Electrical — Instrumentation',
  EEN: 'Electrical — Power & Energy',
  EEP: 'Electrical — Power Systems',
  EES: 'Electrical — Signal Processing',
  EET: 'Electrical — Communication Systems',
  EEV: 'Electrical — VLSI Design',
  ES: 'Electrical — Systems & Signal Processing',
  ESN: 'Electrical — Sensors & Nanotech',
  // ── Humanities / Social Sciences ──
  HS: 'Humanities & Social Sciences',
  // ── Joint / Interdisciplinary ──
  JOP: 'Optoelectronics',
  JRB: 'Robotics',
  JTM: 'Telecom Technology & Management',
  JVL: 'VLSI Design',
  // ── Materials / Metallurgy ──
  MM: 'Materials Science & Metallurgy',
  MSM: 'Materials Science & Engineering',
  MST: 'Materials Science & Technology',
  MTE: 'Metallurgical & Materials Engineering',
  // ── Mechanical ──
  ME: 'Mechanical Engineering',
  MEA: 'Mechanical — Machine Design',
  MEE: 'Mechanical — Energy Studies',
  MEM: 'Mechanical — Manufacturing',
  MEP: 'Mechanical — Production Engineering',
  MET: 'Mechanical — Thermal Engineering',
  // ── Mining / Ocean ──
  OE: 'Ocean Engineering',
  PE: 'Petroleum Engineering',
  PEPS: 'Power Electronics & Power Systems',
  // ── Physics ──
  PH: 'Physics',
  PHA: 'Physics — Applied',
  PHM: 'Physics — Materials Science',
  // ── Renewable / Environmental ──
  RE: 'Renewable Energy',
  RT: 'Remote Sensing',
  // ── Textile ──
  TTE: 'Textile Engineering',
  TTP: 'Textile — Polymer Science',
  // ── VLSI ──
  VLSI: 'VLSI Design',
  MVLSI: 'Microelectronics & VLSI',
  // ── Edits & Additions ──
  ED: 'Engineering Design',
}

/**
 * Given a raw program string from the DB, return a human-readable name.
 * If it's already a full name (>10 chars), return as-is.
 * Otherwise look up the code (stripping trailing N/Y/* suffixes).
 */
export function expandProgramName(raw: string): string {
  if (!raw) return raw
  // Already a full name
  if (raw.length > 10) return raw

  // Direct match first
  if (PROGRAM_CODE_MAP[raw]) return PROGRAM_CODE_MAP[raw]

  // Strip trailing *
  const clean = raw.replace(/\*$/, '')
  if (PROGRAM_CODE_MAP[clean]) return PROGRAM_CODE_MAP[clean]

  // Strip trailing digit + N/Y suffix (e.g. CE2N → CE, ME3Y → ME, MA1Y → MA)
  const base = clean.replace(/\d+[NY]?$/, '')
  if (base && PROGRAM_CODE_MAP[base]) return PROGRAM_CODE_MAP[base]

  // Return original if no match found
  return raw
}
