import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..')
const DATA = path.join(ROOT, 'data')
const YEAR = 2025
const BATCH_SIZE = 1000

function getPoolConfig(url) {
  let needsSsl = url.includes('supabase.com')

  try {
    const parsed = new URL(url)
    needsSsl = needsSsl || parsed.searchParams.get('sslmode') === 'require'
  } catch {
    // Let pg surface the connection-string error with its normal message.
  }

  return {
    connectionString: url,
    connectionTimeoutMillis: 10000,
    ssl: needsSsl ? { rejectUnauthorized: false } : undefined,
  }
}

const CATEGORY_MAP = {
  OPEN: 'GEN',
  'OPEN-PWD': 'GEN-PwD',
  'OPEN-(PWD)': 'GEN-PwD',
  'OBC-NCL': 'OBC',
  'OBC-NCL-PWD': 'OBC-PwD',
  'OBC-NCL-(PWD)': 'OBC-PwD',
  'SC-PWD': 'SC-PwD',
  'SC-(PWD)': 'SC-PwD',
  'ST-PWD': 'ST-PwD',
  'ST-(PWD)': 'ST-PwD',
  'EWS-PWD': 'EWS-PwD',
  'EWS-(PWD)': 'EWS-PwD',
  GEN: 'GEN',
  OBC: 'OBC',
  SC: 'SC',
  ST: 'ST',
  EWS: 'EWS',
  'GEN-PWD': 'GEN-PwD',
  'OBC-PWD': 'OBC-PwD',
  'GEN-PwD': 'GEN-PwD',
  'OBC-PwD': 'OBC-PwD',
  'SC-PwD': 'SC-PwD',
  'ST-PwD': 'ST-PwD',
  'EWS-PwD': 'EWS-PwD',
}

const NIT_STATE = {
  'national institute of technology karnataka': 'Karnataka',
  'national institute of technology warangal': 'Telangana',
  'national institute of technology tiruchirappalli': 'Tamil Nadu',
  'national institute of technology calicut': 'Kerala',
  'national institute of technology rourkela': 'Odisha',
  'national institute of technology jamshedpur': 'Jharkhand',
  'national institute of technology patna': 'Bihar',
  'national institute of technology silchar': 'Assam',
  'national institute of technology agartala': 'Tripura',
  'national institute of technology meghalaya': 'Meghalaya',
  'national institute of technology manipur': 'Manipur',
  'national institute of technology mizoram': 'Mizoram',
  'national institute of technology nagaland': 'Nagaland',
  'national institute of technology srinagar': 'J&K',
  'national institute of technology hamirpur': 'Himachal Pradesh',
  'national institute of technology kurukshetra': 'Haryana',
  'national institute of technology delhi': 'Delhi',
  'national institute of technology durgapur': 'West Bengal',
  'national institute of technology raipur': 'Chhattisgarh',
  'national institute of technology, andhra': 'Andhra Pradesh',
  'national institute of technology arunachal': 'Arunachal Pradesh',
  'national institute of technology uttarakhand': 'Uttarakhand',
  'national institute of technology goa': 'Goa',
  'national institute of technology puducherry': 'Puducherry',
  'national institute of technology sikkim': 'Sikkim',
  'maulana azad national institute': 'Madhya Pradesh',
  'motilal nehru national institute': 'Uttar Pradesh',
  'sardar vallabhbhai national institute': 'Gujarat',
  'visvesvaraya national institute': 'Maharashtra',
  'dr. b r ambedkar national institute': 'Punjab',
  'malaviya national institute': 'Rajasthan',
}

function parseCsv(text) {
  const rows = []
  let row = []
  let field = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i]
    const next = text[i + 1]

    if (ch === '"') {
      if (inQuotes && next === '"') {
        field += '"'
        i += 1
      } else {
        inQuotes = !inQuotes
      }
      continue
    }

    if (ch === ',' && !inQuotes) {
      row.push(field)
      field = ''
      continue
    }

    if ((ch === '\n' || ch === '\r') && !inQuotes) {
      if (ch === '\r' && next === '\n') i += 1
      row.push(field)
      if (row.some(value => value !== '')) rows.push(row)
      row = []
      field = ''
      continue
    }

    field += ch
  }

  row.push(field)
  if (row.some(value => value !== '')) rows.push(row)
  const [headers, ...data] = rows
  return data.map(values => Object.fromEntries(headers.map((header, index) => [
    header.replace(/^\uFEFF/, '').trim(),
    (values[index] ?? '').trim(),
  ])))
}

function readCsv(file) {
  return parseCsv(fs.readFileSync(path.join(DATA, file), 'utf8'))
}

function intValue(value, fallback = 0) {
  const parsed = Number.parseInt(String(value ?? '').replace(/,/g, ''), 10)
  return Number.isFinite(parsed) ? parsed : fallback
}

function normalizeCategory(value) {
  const raw = String(value || 'GEN').trim()
  const key = raw.toUpperCase().replace(/\s+/g, '-')
  return CATEGORY_MAP[key] || CATEGORY_MAP[raw] || raw
}

function norm(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9 ]/g, '')
}

function guessState(institute, given) {
  if (given) return given
  const low = norm(institute)
  for (const [needle, state] of Object.entries(NIT_STATE)) {
    if (low.includes(norm(needle))) return state
  }
  return null
}

function jeeRows(file, source) {
  let skipped = 0
  const rows = readCsv(file).flatMap(row => {
    const institute = row.institute?.trim()
    const openRank = intValue(row.openRank)
    const closeRank = intValue(row.closeRank)
    if (!institute || (openRank === 0 && closeRank === 0)) {
      skipped += 1
      return []
    }
    return [{
      examType: 'JEE',
      year: intValue(row.year, YEAR),
      institute,
      program: row.program?.trim() || '',
      category: normalizeCategory(row.category),
      round: intValue(row.round, 1),
      openRank,
      closeRank,
      openScore: 0,
      closeScore: 0,
      paper: null,
      gender: row.gender?.trim() || null,
      quota: row.quota?.trim() || null,
      source,
      state: guessState(institute, row.state?.trim()),
      instituteType: row.instituteType?.trim() || 'GFTI',
    }]
  })
  return { rows, skipped }
}

function ccmtRows(file) {
  let skipped = 0
  const rows = readCsv(file).flatMap(row => {
    const institute = row.institute?.trim()
    const openScore = intValue(row.openScore)
    const closeScore = intValue(row.closeScore)
    if (!institute || (openScore === 0 && closeScore === 0)) {
      skipped += 1
      return []
    }
    return [{
      examType: 'GATE',
      year: intValue(row.year, YEAR),
      institute,
      program: row.program?.trim() || '',
      category: normalizeCategory(row.category),
      round: intValue(row.round, 0),
      openRank: 0,
      closeRank: 0,
      openScore,
      closeScore,
      paper: row.paper?.trim() || null,
      gender: null,
      quota: null,
      source: file.startsWith('gate_') ? 'COAP' : 'CCMT',
      state: row.state?.trim() || null,
      instituteType: row.instituteType?.trim() || (institute.startsWith('IIT') ? 'IIT' : null),
    }]
  })
  return { rows, skipped }
}

async function createMany(prisma, rows) {
  let inserted = 0
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE)
    const result = await prisma.cutoff.createMany({ data: batch })
    inserted += result.count
    process.stdout.write(`\rInserted ${inserted.toLocaleString()} / ${rows.length.toLocaleString()}`)
  }
  process.stdout.write('\n')
  return inserted
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required')
  }

  const pool = new Pool(getPoolConfig(process.env.DATABASE_URL))
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) })

  try {
    console.log('Reading CSV files...')
    const inputs = [
      jeeRows('josaa_2025_cutoffs.csv', 'JOSAA'),
      jeeRows('csab_2025_cutoffs.csv', 'CSAB'),
      ccmtRows('ccmt_2025_cutoffs.csv'),
      ccmtRows('gate_2025_cutoffs.csv'),
    ]
    const rows = inputs.flatMap(input => input.rows)
    const skipped = inputs.reduce((sum, input) => sum + input.skipped, 0)

    console.log(`Prepared ${rows.length.toLocaleString()} rows. Skipped ${skipped.toLocaleString()} invalid rows.`)
    console.log(`Deleting existing ${YEAR} JEE/GATE rows...`)
    const deleted = await prisma.cutoff.deleteMany({
      where: { year: YEAR, examType: { in: ['JEE', 'GATE'] } },
    })
    console.log(`Deleted ${deleted.count.toLocaleString()} rows.`)

    const inserted = await createMany(prisma, rows)
    const [jee, gate, total] = await Promise.all([
      prisma.cutoff.count({ where: { examType: 'JEE', year: YEAR } }),
      prisma.cutoff.count({ where: { examType: 'GATE', year: YEAR } }),
      prisma.cutoff.count(),
    ])

    console.log(`Done. Inserted ${inserted.toLocaleString()} rows.`)
    console.log(`Counts: JEE=${jee.toLocaleString()} GATE=${gate.toLocaleString()} Total=${total.toLocaleString()}`)
  } finally {
    await prisma.$disconnect()
    await pool.end()
  }
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
