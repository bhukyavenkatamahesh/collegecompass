// Run with: node scripts/import_coap2025.mjs
// Imports data/gate_2025_cutoffs.csv (COAP 2025 GATE score cutoffs) into the Cutoff table.

import { PrismaLibSql } from '@prisma/adapter-libsql'
import { PrismaClient } from '@prisma/client'
import { fileURLToPath } from 'url'
import { readFileSync } from 'fs'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dbUrl = process.env.DATABASE_URL ?? `file:${path.join(__dirname, '../dev.db')}`
const prisma = new PrismaClient({ adapter: new PrismaLibSql({ url: dbUrl }) })

function parseCsv(text) {
  const rows = []
  const lines = text.split(/\r?\n/).filter(l => l.length)
  const headers = splitCsvLine(lines[0])
  for (const line of lines.slice(1)) {
    const cells = splitCsvLine(line)
    rows.push(Object.fromEntries(headers.map((h, i) => [h, cells[i]])))
  }
  return rows
}

// Minimal RFC4180-ish splitter (handles quoted fields with commas).
function splitCsvLine(line) {
  const out = []
  let cur = '', q = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (q) {
      if (c === '"' && line[i + 1] === '"') { cur += '"'; i++ }
      else if (c === '"') q = false
      else cur += c
    } else if (c === '"') q = true
    else if (c === ',') { out.push(cur); cur = '' }
    else cur += c
  }
  out.push(cur)
  return out
}

async function main() {
  const csv = readFileSync(path.join(__dirname, '../data/gate_2025_cutoffs.csv'), 'utf-8')
  const rows = parseCsv(csv)

  // COAP = IITs only. Must NOT wipe CCMT (NIT/IIIT/GFTI) GATE rows.
  await prisma.cutoff.deleteMany({ where: { examType: 'GATE', year: 2025, instituteType: 'IIT' } })

  const records = rows.map(r => ({
    examType: 'GATE',
    year: 2025,
    institute: r.institute,
    program: r.program,
    paper: r.paper || null,
    category: r.category,
    round: parseInt(r.round || '0', 10),
    openScore: r.openScore ? parseInt(r.openScore, 10) : null,
    closeScore: r.closeScore ? parseInt(r.closeScore, 10) : null,
    openRank: 0,
    closeRank: 0,
    instituteType: 'IIT',
  }))

  await prisma.cutoff.createMany({ data: records })
  const byInst = {}
  for (const r of records) byInst[r.institute] = (byInst[r.institute] || 0) + 1
  console.log(`Imported ${records.length} COAP 2025 GATE cutoff rows.`)
  for (const k of Object.keys(byInst).sort()) console.log(`  ${k}: ${byInst[k]}`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
