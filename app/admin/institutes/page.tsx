import { prisma } from '@/lib/db'
import InstituteTable from './InstituteTable'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function InstitutesPage() {
  const rows = await prisma.institute.findMany({
    orderBy: { name: 'asc' },
    select: {
      name: true,
      abbrev: true,
      type: true,
      state: true,
      city: true,
      branchCount: true,
      examTypes: true,
    },
  })

  return <InstituteTable institutes={rows} />
}
