import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function buildConnectionString(): string {
  const base = process.env.DATABASE_URL!
  try {
    const url = new URL(base)
    url.searchParams.set('connect_timeout', '5')
    url.searchParams.set('connection_timeout', '5')
    return url.toString()
  } catch {
    return base
  }
}

export function getPrismaClient() {
  if (!globalForPrisma.prisma) {
    const connectionString = buildConnectionString()
    const adapter = new PrismaPg(connectionString)
    globalForPrisma.prisma = new PrismaClient({ adapter })
  }
  return globalForPrisma.prisma
}

export const prisma = getPrismaClient()
