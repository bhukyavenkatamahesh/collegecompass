// Run with: node scripts/seed.mjs
// Seeds the database with sample GATE and JEE cutoff data

import { createClient } from '@libsql/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { PrismaClient } from '@prisma/client'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dbUrl = process.env.DATABASE_URL ?? `file:${path.join(__dirname, '../dev.db')}`

const adapter = new PrismaLibSql({ url: dbUrl })
const prisma = new PrismaClient({ adapter })

const GATE_CUTOFFS = [
  // IITs — CS
  { institute: 'IIT Bombay', program: 'M.Tech Computer Science', instituteType: 'IIT', state: 'Maharashtra', openRank: 1, closeRank: 150 },
  { institute: 'IIT Delhi', program: 'M.Tech Computer Science', instituteType: 'IIT', state: 'Delhi', openRank: 1, closeRank: 200 },
  { institute: 'IIT Madras', program: 'M.Tech Computer Science', instituteType: 'IIT', state: 'Tamil Nadu', openRank: 1, closeRank: 250 },
  { institute: 'IIT Kanpur', program: 'M.Tech Computer Science', instituteType: 'IIT', state: 'Uttar Pradesh', openRank: 1, closeRank: 300 },
  { institute: 'IIT Kharagpur', program: 'M.Tech Computer Science', instituteType: 'IIT', state: 'West Bengal', openRank: 1, closeRank: 400 },
  { institute: 'IIT Roorkee', program: 'M.Tech Computer Science', instituteType: 'IIT', state: 'Uttarakhand', openRank: 1, closeRank: 500 },
  { institute: 'IIT Hyderabad', program: 'M.Tech Computer Science', instituteType: 'IIT', state: 'Telangana', openRank: 50, closeRank: 600 },
  { institute: 'IIT BHU', program: 'M.Tech Computer Science', instituteType: 'IIT', state: 'Uttar Pradesh', openRank: 100, closeRank: 800 },
  { institute: 'IIT Guwahati', program: 'M.Tech Computer Science', instituteType: 'IIT', state: 'Assam', openRank: 100, closeRank: 900 },
  { institute: 'IIT Indore', program: 'M.Tech Computer Science', instituteType: 'IIT', state: 'Madhya Pradesh', openRank: 150, closeRank: 1100 },
  // NITs — CS
  { institute: 'NIT Trichy', program: 'M.Tech Computer Science', instituteType: 'NIT', state: 'Tamil Nadu', openRank: 100, closeRank: 1200 },
  { institute: 'NIT Warangal', program: 'M.Tech Computer Science', instituteType: 'NIT', state: 'Telangana', openRank: 150, closeRank: 1500 },
  { institute: 'NIT Surathkal', program: 'M.Tech Computer Science', instituteType: 'NIT', state: 'Karnataka', openRank: 300, closeRank: 2000 },
  { institute: 'NIT Calicut', program: 'M.Tech Computer Science', instituteType: 'NIT', state: 'Kerala', openRank: 500, closeRank: 2800 },
  { institute: 'NIT Rourkela', program: 'M.Tech Computer Science', instituteType: 'NIT', state: 'Odisha', openRank: 600, closeRank: 3200 },
  { institute: 'NIT Jaipur', program: 'M.Tech Computer Science', instituteType: 'NIT', state: 'Rajasthan', openRank: 800, closeRank: 4000 },
  { institute: 'NIT Bhopal', program: 'M.Tech Computer Science', instituteType: 'NIT', state: 'Madhya Pradesh', openRank: 1000, closeRank: 5000 },
  // IITs — ECE
  { institute: 'IIT Bombay', program: 'M.Tech Electronics', instituteType: 'IIT', state: 'Maharashtra', openRank: 1, closeRank: 200 },
  { institute: 'IIT Delhi', program: 'M.Tech Electronics', instituteType: 'IIT', state: 'Delhi', openRank: 1, closeRank: 250 },
  { institute: 'IIT Madras', program: 'M.Tech Electronics', instituteType: 'IIT', state: 'Tamil Nadu', openRank: 1, closeRank: 300 },
  { institute: 'IIT Kanpur', program: 'M.Tech Electronics', instituteType: 'IIT', state: 'Uttar Pradesh', openRank: 1, closeRank: 400 },
  { institute: 'NIT Trichy', program: 'M.Tech Electronics', instituteType: 'NIT', state: 'Tamil Nadu', openRank: 200, closeRank: 2000 },
  { institute: 'NIT Warangal', program: 'M.Tech Electronics', instituteType: 'NIT', state: 'Telangana', openRank: 300, closeRank: 2500 },
  // IITs — EE
  { institute: 'IIT Bombay', program: 'M.Tech Electrical Engineering', instituteType: 'IIT', state: 'Maharashtra', openRank: 1, closeRank: 250 },
  { institute: 'IIT Delhi', program: 'M.Tech Electrical Engineering', instituteType: 'IIT', state: 'Delhi', openRank: 1, closeRank: 300 },
  { institute: 'IIT Madras', program: 'M.Tech Electrical Engineering', instituteType: 'IIT', state: 'Tamil Nadu', openRank: 1, closeRank: 350 },
  { institute: 'NIT Trichy', program: 'M.Tech Electrical Engineering', instituteType: 'NIT', state: 'Tamil Nadu', openRank: 250, closeRank: 2500 },
]

const JEE_CUTOFFS = [
  // NITs — CSE
  { institute: 'NIT Trichy', program: 'Computer Science and Engineering', instituteType: 'NIT', state: 'Tamil Nadu', openRank: 1200, closeRank: 2800 },
  { institute: 'NIT Warangal', program: 'Computer Science and Engineering', instituteType: 'NIT', state: 'Telangana', openRank: 1800, closeRank: 3500 },
  { institute: 'NIT Surathkal', program: 'Computer Science and Engineering', instituteType: 'NIT', state: 'Karnataka', openRank: 2100, closeRank: 4200 },
  { institute: 'NIT Calicut', program: 'Computer Science and Engineering', instituteType: 'NIT', state: 'Kerala', openRank: 3500, closeRank: 7200 },
  { institute: 'NIT Rourkela', program: 'Computer Science and Engineering', instituteType: 'NIT', state: 'Odisha', openRank: 4100, closeRank: 8500 },
  { institute: 'NIT Jaipur', program: 'Computer Science and Engineering', instituteType: 'NIT', state: 'Rajasthan', openRank: 5200, closeRank: 11000 },
  { institute: 'NIT Bhopal', program: 'Computer Science and Engineering', instituteType: 'NIT', state: 'Madhya Pradesh', openRank: 9200, closeRank: 19500 },
  { institute: 'NIT Durgapur', program: 'Computer Science and Engineering', instituteType: 'NIT', state: 'West Bengal', openRank: 7800, closeRank: 16000 },
  { institute: 'NIT Patna', program: 'Computer Science and Engineering', instituteType: 'NIT', state: 'Bihar', openRank: 12000, closeRank: 25000 },
  { institute: 'NIT Hamirpur', program: 'Computer Science and Engineering', instituteType: 'NIT', state: 'Himachal Pradesh', openRank: 14000, closeRank: 29000 },
  { institute: 'NIT Silchar', program: 'Computer Science and Engineering', instituteType: 'NIT', state: 'Assam', openRank: 16000, closeRank: 33000 },
  // IIITs
  { institute: 'IIIT Hyderabad', program: 'Computer Science and Engineering', instituteType: 'IIIT', state: 'Telangana', openRank: 500, closeRank: 1500 },
  { institute: 'IIIT Allahabad', program: 'Information Technology', instituteType: 'IIIT', state: 'Uttar Pradesh', openRank: 3200, closeRank: 6800 },
  { institute: 'IIIT Gwalior', program: 'Computer Science and Engineering', instituteType: 'IIIT', state: 'Madhya Pradesh', openRank: 8500, closeRank: 18000 },
  { institute: 'IIIT Delhi', program: 'Computer Science and Engineering', instituteType: 'IIIT', state: 'Delhi', openRank: 2000, closeRank: 5000 },
  { institute: 'IIIT Pune', program: 'Computer Science and Engineering', instituteType: 'IIIT', state: 'Maharashtra', openRank: 12000, closeRank: 24000 },
  // NITs — ECE
  { institute: 'NIT Trichy', program: 'Electronics and Communication Engineering', instituteType: 'NIT', state: 'Tamil Nadu', openRank: 3500, closeRank: 7200 },
  { institute: 'NIT Warangal', program: 'Electronics and Communication Engineering', instituteType: 'NIT', state: 'Telangana', openRank: 4500, closeRank: 9500 },
  { institute: 'NIT Surathkal', program: 'Electronics and Communication Engineering', instituteType: 'NIT', state: 'Karnataka', openRank: 5500, closeRank: 12000 },
  { institute: 'NIT Calicut', program: 'Electronics and Communication Engineering', instituteType: 'NIT', state: 'Kerala', openRank: 7000, closeRank: 15000 },
  // NITs — EE
  { institute: 'NIT Trichy', program: 'Electrical and Electronics Engineering', instituteType: 'NIT', state: 'Tamil Nadu', openRank: 5000, closeRank: 10000 },
  { institute: 'NIT Warangal', program: 'Electrical Engineering', instituteType: 'NIT', state: 'Telangana', openRank: 4200, closeRank: 9000 },
  // GFTIs
  { institute: 'BIT Mesra', program: 'Computer Science and Engineering', instituteType: 'GFTI', state: 'Jharkhand', openRank: 20000, closeRank: 40000 },
  { institute: 'IIEST Shibpur', program: 'Computer Science and Engineering', instituteType: 'GFTI', state: 'West Bengal', openRank: 18000, closeRank: 35000 },
  { institute: 'NIT Andhra Pradesh', program: 'Computer Science and Engineering', instituteType: 'NIT', state: 'Andhra Pradesh', openRank: 22000, closeRank: 45000 },
]

const CATEGORIES = ['GEN', 'EWS', 'OBC', 'SC', 'ST']

async function main() {
  const existing = await prisma.cutoff.count()
  if (existing > 0) {
    console.log(`Database already has ${existing} cutoff entries. Skipping seed.`)
    console.log('To re-seed, delete the dev.db file and run this script again.')
    return
  }

  console.log('Seeding database with sample cutoff data...')

  const records = []

  for (const c of GATE_CUTOFFS) {
    for (const category of CATEGORIES) {
      // Apply category multipliers to make more realistic per-category cutoffs
      const mult = { GEN: 1, EWS: 0.9, OBC: 0.75, SC: 0.5, ST: 0.4 }[category] ?? 1
      records.push({
        examType: 'GATE',
        year: 2024,
        institute: c.institute,
        program: c.program,
        category,
        round: 1,
        openRank: Math.round(c.openRank / mult),
        closeRank: Math.round(c.closeRank / mult),
        state: c.state,
        instituteType: c.instituteType,
      })
    }
  }

  for (const c of JEE_CUTOFFS) {
    for (const category of CATEGORIES) {
      const mult = { GEN: 1, EWS: 0.9, OBC: 0.75, SC: 0.5, ST: 0.4 }[category] ?? 1
      records.push({
        examType: 'JEE',
        year: 2024,
        institute: c.institute,
        program: c.program,
        category,
        round: 6,
        openRank: Math.round(c.openRank / mult),
        closeRank: Math.round(c.closeRank / mult),
        state: c.state,
        instituteType: c.instituteType,
      })
    }
  }

  await prisma.cutoff.createMany({ data: records })
  console.log(`Seeded ${records.length} cutoff entries (${GATE_CUTOFFS.length * CATEGORIES.length} GATE + ${JEE_CUTOFFS.length * CATEGORIES.length} JEE across ${CATEGORIES.length} categories).`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
