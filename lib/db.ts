import { PrismaClient } from '@prisma/client'
import { Pool, type PoolConfig } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

function getPoolConfig(url: string): PoolConfig {
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

function createPrismaClient() {
  const url = process.env.DATABASE_URL
  if (!url) {
    // Return empty client if no URL during build
    return new PrismaClient()
  }
  const pool = new Pool(getPoolConfig(url))
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
