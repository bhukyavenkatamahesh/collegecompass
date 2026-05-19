import { defineConfig } from 'prisma/config'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })
dotenv.config({ path: '.env' })

export default defineConfig({
  datasource: {
    // Pooler URL for runtime queries (PgBouncer / Supabase Transaction mode)
    url: process.env.DATABASE_URL,
    // Direct URL for Prisma Migrate / db push — bypasses the pooler

    directUrl: process.env.DIRECT_URL,
  } as Record<string, string | undefined>,
})
